import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, DollarSign, Check, X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ChatMessage, UserRole } from '@/types';
import { CURRENCY } from '@/lib/constants';

interface ChatPanelProps {
  messages: ChatMessage[];
  currentUserId: string;
  currentUserRole: UserRole;
  onSendMessage: (content: string) => void;
  onPriceProposal: (price: number) => void;
  onAcceptPrice: (messageId: string, price: number) => void;
  onRejectPrice: (messageId: string) => void;
  isNegotiating?: boolean;
  className?: string;
}

export function ChatPanel({
  messages,
  currentUserId,
  currentUserRole,
  onSendMessage,
  onPriceProposal,
  onAcceptPrice,
  onRejectPrice,
  isNegotiating = true,
  className = '',
}: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [proposedPrice, setProposedPrice] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handlePriceProposal = () => {
    const price = parseFloat(proposedPrice);
    if (!isNaN(price) && price > 0) {
      onPriceProposal(price);
      setProposedPrice('');
      setShowPriceInput(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex flex-col h-full bg-card rounded-xl border border-border ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <MessageSquare size={20} className="text-accent" />
        <h3 className="font-semibold text-foreground">Chat & Negotiation</h3>
        {isNegotiating && (
          <span className="ml-auto px-2 py-0.5 bg-warning/10 text-warning text-xs rounded-full">
            Negotiating
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.map((msg) => {
            const isOwn = msg.senderId === currentUserId;
            
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
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
                      <span className="text-xs font-medium uppercase tracking-wide">
                        {msg.type === 'price-accepted' ? 'Price Accepted' : 'Price Proposal'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {CURRENCY}{msg.proposedPrice?.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{msg.content}</p>
                    
                    {msg.type === 'price-proposal' && !isOwn && isNegotiating && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => onAcceptPrice(msg.id, msg.proposedPrice!)}
                          className="flex-1 bg-success hover:bg-success/90"
                        >
                          <Check size={14} className="mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRejectPrice(msg.id)}
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
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Price Input */}
      <AnimatePresence>
        {showPriceInput && (
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
                    placeholder="Enter price"
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

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          {isNegotiating && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowPriceInput(!showPriceInput)}
              className="shrink-0"
            >
              <DollarSign size={18} />
            </Button>
          )}
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon" className="shrink-0">
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
