'use client';

import { useEffect, useState, useCallback } from 'react';
import { getChatSocket } from '@/lib/socket';
import { apiFetch } from '@/lib/api';

type Message = {
    id: string;
    content: string;
    sender: { id: string; name: string };
    sentAt: string;
};

export function useChat(orderId: string) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);

    // Cargar historial
    useEffect(() => {
        if (!orderId) return;
        setLoading(true);
        apiFetch<Message[]>(`/orders/${orderId}/messages`)
            .then(setMessages)
            .catch(err => console.error('Error loading chat history:', err))
            .finally(() => setLoading(false));
    }, [orderId]);

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
            setMessages(prev => {
                // Evitar duplicados si el mensaje ya llegó por el fetch inicial o por reconexión
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
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

    return { messages, isConnected, loading, sendMessage };
}