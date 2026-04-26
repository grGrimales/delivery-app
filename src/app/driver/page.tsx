'use client';

import { useState, useEffect } from 'react';
import { useTracking } from '@/hooks/useTracking';
import { Order, OrderStatus } from '@/types';
import { StatusBadge } from '@/components/orders/StatusBadge';
import ChatBox from '@/components/chat/ChatBox';

export default function DriverApp() {
  const [activeOrder, setActiveOrder] = useState<Order | null>({
    id: '1',
    status: 'PREPARING',
    customerName: 'Juan Pérez',
    address: 'Calle Mayor 1',
    createdAt: new Date().toISOString()
  });

  const { updateLocation, isConnected } = useTracking(activeOrder?.id);
  const [messages, setMessages] = useState([]);

  // Mock Geolocation update
  useEffect(() => {
    if (!activeOrder || activeOrder.status !== 'ON_WAY') return;

    const interval = setInterval(() => {
      // Simulate moving a bit
      const lat = 40.416775 + (Math.random() - 0.5) * 0.01;
      const lng = -3.703790 + (Math.random() - 0.5) * 0.01;
      updateLocation({ lat, lng });
      console.log('Driver: Location updated', { lat, lng });
    }, 5000);

    return () => clearInterval(interval);
  }, [activeOrder?.status, updateLocation]);

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (activeOrder) {
      setActiveOrder({ ...activeOrder, status: newStatus });
      // In a real app, you would call an API here
    }
  };

  if (!activeOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">No tienes pedidos activos.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="max-w-md mx-auto space-y-4">
        <header className="flex justify-between items-center">
          <h1 className="text-xl font-bold">App Repartidor</h1>
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </header>

        <section className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Pedido Actual</p>
              <h2 className="text-lg font-bold">#{activeOrder.id.slice(0, 8)}</h2>
            </div>
            <StatusBadge status={activeOrder.status} />
          </div>

          <div className="space-y-2 border-t pt-4">
            <p className="text-sm">
              <span className="text-gray-500">Cliente:</span><br />
              <span className="font-semibold">{activeOrder.customerName}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Dirección:</span><br />
              <span className="font-semibold">{activeOrder.address}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {activeOrder.status === 'PREPARING' && (
              <button 
                onClick={() => handleStatusChange('ON_WAY')}
                className="col-span-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Recoger Pedido
              </button>
            )}
            {activeOrder.status === 'ON_WAY' && (
              <button 
                onClick={() => handleStatusChange('DELIVERED')}
                className="col-span-2 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
              >
                Marcar como Entregado
              </button>
            )}
          </div>
        </section>

        <section>
          <ChatBox 
            orderId={activeOrder.id}
            messages={messages}
            onSendMessage={(text) => {
              // Mock sending message
              console.log('Sending message:', text);
            }}
            currentUser={{ id: 'driver-1' }}
          />
        </section>
      </div>
    </main>
  );
}
