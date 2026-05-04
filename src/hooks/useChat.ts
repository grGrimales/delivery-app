'use client';

import { useEffect, useState, useCallback } from 'react';
import { getChatSocket } from '@/lib/socket';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

type Message = {
    id: string;
    content: string;
    sender: { id: string; name: string };
    sentAt: string;
};

export function useChat(orderId: string) {
    const { token } = useAuth();
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
        
        const socket = getChatSocket(orderId);

        // Forzar actualización de auth con el estado actual del localStorage
        // @ts-ignore - socket.auth es editable en socket.io-client
        socket.auth = { 
            token: localStorage.getItem('token'), 
            orderId 
        };

        if (socket.connected) {
            socket.disconnect();
        }
        
        socket.connect();

        const onConnect = () => {
            setIsConnected(true);
            socket.emit('chat:join', orderId);
        };

        const onDisconnect = () => setIsConnected(false);

        const onMessage = (msg: Message) => {
            setMessages(prev => {
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('chat:message', onMessage);

        // Unirse si ya está conectado
        if (socket.connected) onConnect();

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('chat:message', onMessage);
            socket.disconnect();
        };
    }, [orderId, token]);

    const sendMessage = useCallback((content: string) => {
        const socket = getChatSocket(orderId);
        if (!socket.connected) socket.connect();
        socket.emit('chat:message', { orderId, content });
    }, [orderId]);

    return { messages, isConnected, loading, sendMessage };
}