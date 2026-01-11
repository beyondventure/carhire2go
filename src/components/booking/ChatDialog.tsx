import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, DollarSign, Send, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { useChat } from '@/hooks/useChat';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import type { UserRole } from '@/types';

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  userRole: UserRole;
  isNegotiating?: boolean;
  allowsNegotiation?: boolean;
  onPriceAccepted?: (price: number) => void;
}

export function ChatDialog({
  isOpen,
  onClose,
  bookingId,
  userRole,
  isNegotiating = true,
  allowsNegotiation = true,
  onPriceAccepted,
}: ChatDialogProps) {
  const { user } = useSupabaseAuth();
  const { messages, sendMessage, sendPriceProposal, acceptPrice } = useChat(bookingId);

  const handleSendMessage = async (content: string) => {
    await sendMessage(content, userRole);
  };

  const handlePriceProposal = async (price: number) => {
    await sendPriceProposal(price, userRole);
  };

  const handleAcceptPrice = async (messageId: string, price: number) => {
    await acceptPrice(price, userRole);
    onPriceAccepted?.(price);
  };

  const handleRejectPrice = (messageId: string) => {
    // Just open price input - no message needed
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <MessageSquare size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Chat & Negotiation</h3>
                  <div className="flex items-center gap-2">
                    {allowsNegotiation ? (
                      <span className="text-xs text-success flex items-center gap-1">
                        <DollarSign size={12} />
                        Negotiation enabled
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <AlertCircle size={12} />
                        Fixed pricing
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X size={20} />
              </Button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-hidden">
              <ChatPanel
                messages={messages}
                currentUserId={user.id}
                currentUserRole={userRole}
                onSendMessage={handleSendMessage}
                onPriceProposal={handlePriceProposal}
                onAcceptPrice={handleAcceptPrice}
                onRejectPrice={handleRejectPrice}
                isNegotiating={isNegotiating && allowsNegotiation}
                className="h-full border-0 rounded-none"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
