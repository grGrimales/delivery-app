'use client';

import { useEffect, useState, useCallback } from 'react';
import { getTrackingSocket } from '@/lib/socket';

type Position = {
  orderId: string;
  lat: number;
  lng: number;
  heading?: number;
  ts: number;
};

type OrderStatus = 'pending' | 'preparing' | 'on_the_way' | 'delivered';

type TrackingState = {
  position: Position | null;
  status: OrderStatus | null;
  isConnected: boolean;
};

export function useTracking(orderId: string) {
  const [state, setState] = useState<TrackingState>({
    position: null,
    status: null,
    isConnected: false,
  });

  // ── Escuchar eventos del servidor ──────────────────
  useEffect(() => {
    if (!orderId) return;
    const socket = getTrackingSocket();

    // Conectar y unirse a la room del pedido
    socket.connect();
    socket.emit('join:order', orderId);

    socket.on('connect', () => {
      setState(prev => ({ ...prev, isConnected: true }));
      socket.emit('join:order', orderId);
    });

    socket.on('disconnect', () => {
      setState(prev => ({ ...prev, isConnected: false }));
    });

    // Recibir actualización de posición del repartidor
    socket.on('location:update', (data: Position) => {
      if (data.orderId === orderId) {
        setState(prev => ({ ...prev, position: data }));
      }
    });

    // Recibir cambio de estado del pedido
    socket.on('order:status:update', (data: { orderId: string; status: OrderStatus }) => {
      if (data.orderId === orderId) {
        setState(prev => ({ ...prev, status: data.status }));
      }
    });

    return () => {
      socket.emit('leave:order', orderId);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('location:update');
      socket.off('order:status:update');
    };
  }, [orderId]);

  // ── Emitir posición (solo repartidor) ──────────────
  const emitLocation = useCallback((lat: number, lng: number, heading?: number) => {
    const socket = getTrackingSocket();
    socket.emit('driver:location', { orderId, lat, lng, heading });
  }, [orderId]);

  // ── Emitir cambio de estado (solo repartidor) ──────
  const emitStatus = useCallback((status: OrderStatus) => {
    const socket = getTrackingSocket();
    socket.emit('order:status', { orderId, status });
  }, [orderId]);

  // ── GPS automático (solo repartidor) ───────────────
  const startGPS = useCallback(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        emitLocation(
          pos.coords.latitude,
          pos.coords.longitude,
          pos.coords.heading ?? undefined,
        );
      },
      (err) => console.error('GPS error:', err),
      { enableHighAccuracy: true, maximumAge: 3000 },
    );

    // Devuelve función para detener el GPS
    return () => navigator.geolocation.clearWatch(watchId);
  }, [emitLocation]);

  return {
    ...state,
    emitLocation,
    emitStatus,
    startGPS,
  };
}