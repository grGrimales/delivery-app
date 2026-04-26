import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const useSocket = (token: string | null) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const socketInstance = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('🔌 Conectado al Gateway de NestJS');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Desconectado del Gateway');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  return { socket, isConnected };
};