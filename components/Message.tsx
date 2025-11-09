import React, { useRef, useEffect } from 'react';
import { Message, Sender } from '../types';
import { UserIcon, ShieldCheckIcon, KeyIcon, CheckCheckIcon } from './Icons';

interface MessageProps {
  message: Message;
  onDecrypt: (messageId: number) => void;
  onMarkAsRead: (messageId: number) => void;
}

const MessageBubble: React.FC<MessageProps> = ({ message, onDecrypt, onMarkAsRead }) => {
  const isUser = message.sender === Sender.User;
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Conditions to run the observer: not a user message, not already read.
    if (isUser || message.isRead) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Mark as read only if the message content is visible (i.e., decrypted or was never encrypted)
        if (entry.isIntersecting && (message.decryptedText || !message.encryptedText)) {
          onMarkAsRead(message.id);
          observer.disconnect(); // Only need to observe once
        }
      },
      { threshold: 0.8 } // Mark as read when 80% of the message is visible
    );

    const currentRef = messageRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [message.id, message.isRead, isUser, onMarkAsRead, message.decryptedText, message.encryptedText]);


  const handleDecryptClick = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onDecrypt(message.id);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleDecryptClick(e);
    }
  };

  const renderAIMessage = () => {
    // State 1: Encrypted and not yet decrypted
    if (message.encryptedText && !message.decryptedText) {
      return (
        <button
          onClick={handleDecryptClick}
          onKeyPress={handleKeyPress}
          className="px-4 py-3 rounded-2xl bg-slate-700 rounded-bl-none hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 group"
          aria-label="Decrypt message"
        >
          <div className="flex items-center gap-3">
            <KeyIcon className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <p className="text-base text-gray-200 font-medium">Click to decrypt</p>
          </div>
        </button>
      );
    }

    // State 2: Decrypted or was never encrypted (e.g., initial welcome message)
    const textToShow = message.decryptedText || message.text;
    
    return (
      <div className="px-4 py-3 rounded-2xl bg-slate-700 rounded-bl-none">
        <div className="flex items-end gap-2">
          <p className="text-base text-white break-words min-w-0">{textToShow}</p>
          {message.isRead && (
            <CheckCheckIcon className="w-5 h-5 text-cyan-400 flex-shrink-0 self-end" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div ref={messageRef} className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
          <ShieldCheckIcon className="w-5 h-5 text-cyan-400" />
        </div>
      )}

      <div className={`flex flex-col max-w-lg ${isUser ? 'items-end' : 'items-start'}`}>
        {isUser ? (
          <div className="px-4 py-3 rounded-2xl bg-blue-600 rounded-br-none">
            <p className="text-base text-white break-words min-w-0">{message.text}</p>
          </div>
        ) : (
          renderAIMessage()
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
          <UserIcon className="w-5 h-5 text-gray-300" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
