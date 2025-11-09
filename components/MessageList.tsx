import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import MessageBubble from './Message';
import { AILoading } from './Icons';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onDecrypt: (messageId: number) => void;
  onMarkAsRead: (messageId: number) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, onDecrypt, onMarkAsRead }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} onDecrypt={onDecrypt} onMarkAsRead={onMarkAsRead} />
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="flex items-center space-x-2 bg-slate-800 rounded-lg p-3 max-w-lg">
            <AILoading className="w-6 h-6 text-cyan-400" />
            <span className="text-gray-400 animate-pulse">Enhancing & Encrypting...</span>
          </div>
        </div>
      )}
      <div ref={endOfMessagesRef} />
    </main>
  );
};

export default MessageList;