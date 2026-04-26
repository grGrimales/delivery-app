'use client';

import { use, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTracking } from '@/hooks/useTracking';
import { StatusBadge } from '@/components/orders/StatusBadge';
import { Order } from '@/types';

const DeliveryMap = dynamic(() => import('@/components/map/DeliveryMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">Cargando mapa...</div>
});

export default function TrackingPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const { location, isConnected } = useTracking(orderId);
  const [order, setOrder] = useState<Order | null>({
    id: orderId,
    status: 'ON_WAY',
    customerName: 'Cliente',
    address: 'Tu dirección',
    createdAt: new Date().toISOString()
  });

  const mapCenter: [number, number] = location 
    ? [location.lat, location.lng] 
    : [40.416775, -3.703790];

  return (
    <main className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white p-4 shadow-sm border-b z-10 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Rastreo de Pedido</h1>
          <p className="text-xs text-gray-500">#{orderId.slice(0, 8)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{isConnected ? 'En vivo' : 'Desconectado'}</span>
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
      </header>

      <div className="flex-1 relative">
        <DeliveryMap 
          center={mapCenter}
          markers={location ? [{
            id: 'driver',
            position: [location.lat, location.lng],
            label: 'Tu repartidor está aquí'
          }] : []}
        />

        <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-96 z-[1000]">
          <div className="bg-white p-6 rounded-2xl shadow-xl border space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg">Estado del envío</h2>
              {order && <StatusBadge status={order.status} />}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mt-1">
                  📍
                </div>
                <div>
                  <p className="text-sm font-medium">Ubicación actual</p>
                  <p className="text-xs text-gray-500">
                    {location ? 'Actualizado hace un momento' : 'Esperando señal GPS...'}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Dirección de entrega</p>
                <p className="text-sm text-gray-700">{order?.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
