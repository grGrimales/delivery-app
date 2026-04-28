'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

type Message = {
  id: string;
  content: string;
  sender: { id: string; name: string };
  sentAt: string;
};

type Props = {
  messages: Message[];
  onSend: (content: string) => void;
  currentUserId: string;
};

export default function ChatBox({ messages, onSend, currentUserId }: Props) {
  const t = useTranslations('chat');
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <div className="bg-surface-800 rounded-2xl border border-white border-opacity-5 overflow-hidden">

      {/* Mensajes */}
      <div className="h-64 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-center text-white opacity-20 text-xs mt-8">
            Sin mensajes aún
          </p>
        )}
        {messages.map(msg => {
          const isMe = msg.sender.id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${isMe
                  ? 'bg-brand-500 text-white rounded-br-sm'
                  : 'bg-surface-900 text-white opacity-80 rounded-bl-sm'
                }`}>
                {!isMe && (
                  <p className="text-xs text-white opacity-40 mb-1">{msg.sender.name}</p>
                )}
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white border-opacity-5 p-3 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={t('placeholder')}
          className="flex-1 bg-surface-900 border border-white border-opacity-10 rounded-xl px-4 py-2 text-sm text-white placeholder-white placeholder-opacity-20 outline-none focus:border-brand-500 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="bg-brand-500 hover:bg-brand-600 disabled:opacity-30 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors"
        >
          {t('send')}
        </button>
      </div>

    </div>
  );
}