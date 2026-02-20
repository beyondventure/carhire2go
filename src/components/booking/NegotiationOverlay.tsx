import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  Check, 
  X, 
  Car, 
  Star, 
  Send,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaymentButton } from '@/components/payment/PaymentButton';
import { CURRENCY } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';
import type { ChatMessage } from '@/types';

interface Provider {
  id: string;
  name: string;
  rating: number;
  distance: string;
  vehicle: string;
}

interface NegotiationOverlayProps {
  isVisible: boolean;
  provider: Provider | null;
  basePrice: number;
  bookingId?: string | null;
  providerId?: string | null;
  onClose: () => void;
  onConfirm: (finalPrice: number) => void;
}

export function NegotiationOverlay({
  isVisible,
  provider,
  basePrice,
  bookingId,
  providerId,
  onClose,
  onConfirm,
}: NegotiationOverlayProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [proposedPrice, setProposedPrice] = useState('');
  const [agreedPrice, setAgreedPrice] = useState<number | null>(null);
  const [isNegotiating, setIsNegotiating] = useState(true);

  // Save negotiated price to DB when agreed
  const saveAgreedPrice = async (price: number) => {
    if (!bookingId) return;
    await supabase
      .from('bookings')
      .update({ negotiated_price: price, status: 'negotiating' })
      .eq('id', bookingId);
  };

  useEffect(() => {
    if (isVisible && provider) {
      // Initialize with provider's base price proposal
      setMessages([
        {
          id: '1',
          bookingId: 'new',
          senderId: provider.id,
          senderRole: 'provider',
          content: 'Thank you for choosing us! Here is my quote for your trip:',
          type: 'text',
          createdAt: new Date(),
        },
        {
          id: '2',
          bookingId: 'new',
          senderId: provider.id,
          senderRole: 'provider',
          content: 'Initial price proposal based on your requirements',
          type: 'price-proposal',
          proposedPrice: basePrice,
          createdAt: new Date(Date.now() + 1000),
        },
      ]);
      setAgreedPrice(null);
      setIsNegotiating(true);
    }
  }, [isVisible, provider, basePrice]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      bookingId: 'new',
      senderId: 'consumer1',
      senderRole: 'consumer',
      content: messageInput.trim(),
      type: 'text',
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');

    // Simulate provider response
    setTimeout(() => {
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        bookingId: 'new',
        senderId: provider?.id || 'provider1',
        senderRole: 'provider',
        content: 'I understand. Let me know if you have a counter offer.',
        type: 'text',
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, response]);
    }, 1500);
  };

  const handlePriceProposal = () => {
    const price = parseFloat(proposedPrice);
    if (isNaN(price) || price <= 0) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      bookingId: 'new',
      senderId: 'consumer1',
      senderRole: 'consumer',
      content: 'My counter offer',
      type: 'price-proposal',
      proposedPrice: price,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    setProposedPrice('');
    setShowPriceInput(false);

    // Simulate provider accepting or countering
    setTimeout(() => {
      const acceptChance = price >= basePrice * 0.85;
      if (acceptChance) {
        const acceptMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          bookingId: 'new',
          senderId: provider?.id || 'provider1',
          senderRole: 'provider',
          content: `I accept your offer of ${CURRENCY}${price.toLocaleString()}`,
          type: 'price-accepted',
          proposedPrice: price,
          createdAt: new Date(),
        };
        setMessages(prev => [...prev, acceptMessage]);
        setAgreedPrice(price);
        setIsNegotiating(false);
      } else {
        const counterPrice = Math.round(basePrice * 0.9);
        const counterMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          bookingId: 'new',
          senderId: provider?.id || 'provider1',
          senderRole: 'provider',
          content: 'That\'s a bit low. How about this?',
          type: 'price-proposal',
          proposedPrice: counterPrice,
          createdAt: new Date(),
        };
        setMessages(prev => [...prev, counterMessage]);
      }
    }, 2000);
  };

  const handleAcceptPrice = (price: number) => {
    const acceptMessage: ChatMessage = {
      id: Date.now().toString(),
      bookingId: 'new',
      senderId: 'consumer1',
      senderRole: 'consumer',
      content: `Price accepted: ${CURRENCY}${price.toLocaleString()}`,
      type: 'price-accepted',
      proposedPrice: price,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, acceptMessage]);
    setAgreedPrice(price);
    setIsNegotiating(false);
    saveAgreedPrice(price);
  };

  const handleRejectPrice = () => {
    setShowPriceInput(true);
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      bookingId: 'new',
      senderId: 'system',
      senderRole: 'consumer',
      content: 'Enter your counter offer below',
      type: 'system',
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!provider) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-primary/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="bg-card rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Car size={24} className="text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{provider.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star size={14} className="text-warning fill-warning" />
                    <span className="text-sm text-foreground">{provider.rating}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{provider.vehicle}</span>
                  </div>
                </div>
                {agreedPrice && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full">
                    <CheckCircle2 size={16} className="text-success" />
                    <span className="text-sm font-medium text-success">Agreed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
              {messages.map((msg) => {
                const isOwn = msg.senderId === 'consumer1';
                
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.type === 'system' ? (
                      <div className="w-full text-center">
                        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                          {msg.content}
                        </span>
                      </div>
                    ) : msg.type === 'price-proposal' || msg.type === 'price-accepted' ? (
                      <div
                        className={`max-w-[80%] ${
                          msg.type === 'price-accepted'
                            ? 'bg-success/10 border-success/30'
                            : isOwn
                            ? 'bg-accent/10 border-accent/30'
                            : 'bg-warning/10 border-warning/30'
                        } border rounded-xl p-4`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign size={16} className={
                            msg.type === 'price-accepted' ? 'text-success' : 'text-warning'
                          } />
                          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {msg.type === 'price-accepted' ? 'Price Accepted' : 'Price Proposal'}
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          {CURRENCY}{msg.proposedPrice?.toLocaleString()}
                        </p>
                        
                        {msg.type === 'price-proposal' && !isOwn && isNegotiating && (
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptPrice(msg.proposedPrice!)}
                              className="flex-1 bg-success hover:bg-success/90"
                            >
                              <Check size={14} className="mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleRejectPrice}
                              className="flex-1"
                            >
                              <X size={14} className="mr-1" />
                              Counter
                            </Button>
                          </div>
                        )}
                        
                        <span className="text-xs text-muted-foreground mt-2 block">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    ) : (
                      <div
                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                          isOwn
                            ? 'bg-accent text-accent-foreground rounded-br-md'
                            : 'bg-muted text-foreground rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <span className={`text-xs mt-1 block ${
                          isOwn ? 'text-accent-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Price Input */}
            <AnimatePresence>
              {showPriceInput && isNegotiating && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border overflow-hidden"
                >
                  <div className="p-3 bg-muted/50">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          {CURRENCY}
                        </span>
                        <Input
                          type="number"
                          value={proposedPrice}
                          onChange={(e) => setProposedPrice(e.target.value)}
                          placeholder="Enter your offer"
                          className="pl-10"
                          onKeyDown={(e) => e.key === 'Enter' && handlePriceProposal()}
                        />
                      </div>
                      <Button onClick={handlePriceProposal} className="bg-warning text-warning-foreground hover:bg-warning/90">
                        Propose
                      </Button>
                      <Button variant="ghost" onClick={() => setShowPriceInput(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message Input (when negotiating) */}
            {isNegotiating && !showPriceInput && (
              <div className="p-3 border-t border-border">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPriceInput(true)}
                    className="shrink-0"
                  >
                    <DollarSign size={18} />
                  </Button>
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} size="icon" className="shrink-0">
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="p-4 border-t border-border bg-muted/30">
              {agreedPrice ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-xl">
                    <span className="text-sm font-medium text-foreground">Final Price Agreed</span>
                    <span className="text-xl font-bold text-success">
                      {CURRENCY}{agreedPrice.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Confirm your booking and pay securely via Flutterwave
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                      Cancel
                    </Button>
                    {bookingId ? (
                      <PaymentButton
                        bookingId={bookingId}
                        providerId={providerId}
                        amount={agreedPrice}
                        onSuccess={() => onConfirm(agreedPrice)}
                        className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                      />
                    ) : (
                      <Button onClick={() => onConfirm(agreedPrice)} className="flex-1 btn-primary">
                        Confirm Booking
                        <ArrowRight size={18} className="ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <Button variant="outline" onClick={onClose} className="w-full">
                  Cancel
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
