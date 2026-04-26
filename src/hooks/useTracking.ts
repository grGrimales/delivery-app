import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';
import { Location } from '@/types';

export const useTracking = (orderId?: string) => {
  const { socket, isConnected } = useSocket();
  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    if (!socket || !orderId) return;

    socket.emit('joinOrder', orderId);

    socket.on('locationUpdate', (newLocation: Location) => {
      setLocation(newLocation);
    });

    return () => {
      socket.emit('leaveOrder', orderId);
      socket.off('locationUpdate');
    };
  }, [socket, orderId]);

  const updateLocation = (newLocation: Location) => {
    if (socket && orderId) {
      socket.emit('updateLocation', { orderId, ...newLocation });
    }
  };

  return { location, updateLocation, isConnected };
};
