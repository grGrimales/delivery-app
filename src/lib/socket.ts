import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL!;

// Instancias separadas por namespace
let trackingSocket: Socket | null = null;
let chatSocket: Socket | null = null;

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getTrackingSocket(): Socket {
  if (!trackingSocket) {
    trackingSocket = io(`${WS_URL}/tracking`, {
      auth: { token: getToken() },
      autoConnect: false,
    });
  }
  return trackingSocket;
}

export function getChatSocket(orderId?: string): Socket {
  if (!chatSocket) {
    chatSocket = io(`${WS_URL}/chat`, {
      auth: { 
        token: getToken(),
        orderId: orderId // Permitir auth por orderId para clientes sin sesión
      },
      autoConnect: false,
    });
  }
  return chatSocket;
}

export function connectSockets() {
  getTrackingSocket().connect();
  getChatSocket().connect();
}

export function disconnectSockets() {
  trackingSocket?.disconnect();
  chatSocket?.disconnect();
  trackingSocket = null;
  chatSocket = null;
}