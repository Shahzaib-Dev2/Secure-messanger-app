import React, { useState, useEffect, useCallback } from 'react';
import { Message, Sender } from './types';
import { generateKey, encrypt, decrypt, exportKey, importKey } from './services/cryptoService';
import { enhanceMessage } from './services/geminiService';
import Header from './components/Header';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import { KeyIcon } from './components/Icons';

const KEY_STORAGE_ID = 'secure-messenger-crypto-key';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initCrypto = async () => {
      try {
        let key: CryptoKey;
        const storedKey = localStorage.getItem(KEY_STORAGE_ID);
        if (storedKey) {
          key = await importKey(storedKey);
        } else {
          key = await generateKey();
          const exportedKey = await exportKey(key);
          localStorage.setItem(KEY_STORAGE_ID, exportedKey);
        }
        setEncryptionKey(key);

        if (messages.length === 0) {
          setMessages([
            {
              id: Date.now(),
              sender: Sender.AI,
              text: "Hello! I'm your secure messaging assistant. I'll rephrase your messages to be more professional and then encrypt them. Let's start!",
              encryptedText: null,
              isRead: true,
            }
          ]);
        }
      } catch (e) {
        console.error("Cryptography not supported or failed to initialize:", e);
        setError("Your browser does not support the required cryptography features. Please use a modern browser.");
      }
    };
    initCrypto();
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !encryptionKey) return;

    setIsLoading(true);
    setError(null);

    const userMessage: Message = {
      id: Date.now(),
      sender: Sender.User,
      text: text,
      encryptedText: null,
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const professionalMessage = await enhanceMessage(text);
      const encryptedData = await encrypt(professionalMessage, encryptionKey);
      
      const aiMessage: Message = {
        id: Date.now() + 1,
        sender: Sender.AI,
        text: professionalMessage,
        encryptedText: encryptedData,
        decryptedText: null,
        isRead: false,
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (e) {
      console.error("Failed to send message:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to get response from Gemini. Please check your API key and network connection. Details: ${errorMessage}`);
      // Remove the user message if the AI fails
      setMessages(prev => prev.slice(0, prev.length -1));
    } finally {
      setIsLoading(false);
    }
  }, [encryptionKey]);

  const handleDecryptMessage = useCallback(async (messageId: number) => {
    if (!encryptionKey) return;
    
    const messageToDecrypt = messages.find(m => m.id === messageId);
    if (!messageToDecrypt || !messageToDecrypt.encryptedText) return;

    try {
      const decryptedText = await decrypt(messageToDecrypt.encryptedText, encryptionKey);
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, decryptedText } : m
      ));
    } catch (e) {
      console.error("Decryption failed:", e);
      setError("Failed to decrypt the message. The key might be invalid or the data corrupted.");
    }
  }, [encryptionKey, messages]);

  const handleMarkAsRead = useCallback((messageId: number) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId && !m.isRead ? { ...m, isRead: true } : m
    ));
  }, []);
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-red-400 p-8">
        <div className="text-center bg-slate-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold mb-4">An Error Occurred</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!encryptionKey) {
    return (
       <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-gray-300">
        <KeyIcon className="w-16 h-16 text-cyan-400 animate-pulse mb-4" />
        <p className="text-xl">Generating secure encryption key...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col font-sans bg-slate-900 text-gray-200">
      <Header />
      <MessageList 
        messages={messages} 
        isLoading={isLoading} 
        onDecrypt={handleDecryptMessage} 
        onMarkAsRead={handleMarkAsRead} 
      />
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;