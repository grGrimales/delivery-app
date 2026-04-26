'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/types';

interface ChatBoxProps {
  orderId: string;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUser: { id: string };
}

export default function ChatBox({ orderId, messages, onSendMessage, currentUser }: ChatBoxProps) {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="flex flex-col h-[400px] border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="p-3 border-b bg-gray-50 font-semibold">
        Chat - Pedido #{orderId.slice(0, 8)}
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
              msg.senderId === currentUser.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {msg.text}
              <div className={`text-[10px] mt-1 opacity-70 ${
                msg.senderId === currentUser.id ? 'text-right' : 'text-left'
              }`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
