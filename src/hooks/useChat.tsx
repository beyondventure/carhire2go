import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import type { ChatMessage, UserRole } from '@/types';
import type { Database } from '@/integrations/supabase/types';

type ChatMessageRow = Database['public']['Tables']['chat_messages']['Row'];

export function useChat(bookingId: string | null) {
  const { user } = useSupabaseAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Convert database row to ChatMessage type
  const rowToMessage = useCallback((row: ChatMessageRow): ChatMessage => ({
    id: row.id,
    bookingId: row.booking_id,
    senderId: row.sender_id,
    senderRole: row.sender_role as UserRole,
    content: row.content,
    type: row.message_type as ChatMessage['type'],
    proposedPrice: row.proposed_price ?? undefined,
    createdAt: new Date(row.created_at),
  }), []);

  // Fetch messages for a booking
  useEffect(() => {
    if (!bookingId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('booking_id', bookingId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages((data || []).map(rowToMessage));
      } catch (err) {
        console.error('Error fetching chat messages:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`chat-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const newMessage = rowToMessage(payload.new as ChatMessageRow);
          setMessages((prev) => {
            // Check if message already exists to avoid duplicates
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, rowToMessage]);

  // Send a text message
  const sendMessage = useCallback(
    async (content: string, role: UserRole) => {
      if (!user || !bookingId || !content.trim()) return null;

      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .insert({
            booking_id: bookingId,
            sender_id: user.id,
            sender_role: role,
            content: content.trim(),
            message_type: 'text',
          })
          .select()
          .single();

        if (error) throw error;
        return data ? rowToMessage(data) : null;
      } catch (err) {
        console.error('Error sending message:', err);
        return null;
      }
    },
    [user, bookingId, rowToMessage]
  );

  // Send a price proposal
  const sendPriceProposal = useCallback(
    async (price: number, role: UserRole) => {
      if (!user || !bookingId || price <= 0) return null;

      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .insert({
            booking_id: bookingId,
            sender_id: user.id,
            sender_role: role,
            content: 'Price proposal',
            message_type: 'price-proposal',
            proposed_price: price,
          })
          .select()
          .single();

        if (error) throw error;
        return data ? rowToMessage(data) : null;
      } catch (err) {
        console.error('Error sending price proposal:', err);
        return null;
      }
    },
    [user, bookingId, rowToMessage]
  );

  // Accept a price
  const acceptPrice = useCallback(
    async (price: number, role: UserRole) => {
      if (!user || !bookingId) return null;

      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .insert({
            booking_id: bookingId,
            sender_id: user.id,
            sender_role: role,
            content: `Price accepted: ₦${price.toLocaleString()}`,
            message_type: 'price-accepted',
            proposed_price: price,
          })
          .select()
          .single();

        if (error) throw error;
        return data ? rowToMessage(data) : null;
      } catch (err) {
        console.error('Error accepting price:', err);
        return null;
      }
    },
    [user, bookingId, rowToMessage]
  );

  return {
    messages,
    isLoading,
    sendMessage,
    sendPriceProposal,
    acceptPrice,
  };
}
