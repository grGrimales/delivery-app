'use client';

import { useEffect, useState, useCallback } from 'react';
import { getChatSocket } from '@/lib/socket';

type Message = {
    id: string;
    content: string;
    sender: { id: string; name: string };
    sentAt: string;
};

export function useChat(orderId: string) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!orderId) return;
        const socket = getChatSocket();

        socket.connect();
        socket.emit('chat:join', orderId);

        socket.on('connect', () => {
            setIsConnected(true);
            socket.emit('chat:join', orderId);
        });

        socket.on('disconnect', () => setIsConnected(false));

        // Recibir mensaje nuevo
        socket.on('chat:message', (msg: Message) => {
            setMessages(prev => [...prev, msg]);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('chat:message');
        };
    }, [orderId]);

    const sendMessage = useCallback((content: string) => {
        const socket = getChatSocket();
        socket.emit('chat:message', { orderId, content });
    }, [orderId]);

    return { messages, isConnected, sendMessage };
}