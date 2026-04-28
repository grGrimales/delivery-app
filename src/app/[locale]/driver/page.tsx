'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { useTracking } from '@/hooks/useTracking';
import { useChat } from '@/hooks/useChat';
import { apiFetch } from '@/lib/api';
import DynamicMap from '@/components/map/DynamicMap';
import ChatBox from '@/components/chat/ChatBox';

type Order = {
  id: string;
  addressFrom: string;
  addressTo: string;
  status: string;
  customer: { id: string; name: string };
};

export default function DriverPage() {
  const t = useTranslations('driver');
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  const { position, isConnected, emitStatus, startGPS } = useTracking(order?.id ?? '');
  const { messages, sendMessage } = useChat(order?.id ?? '');

  // Cargar pedido activo del repartidor
  useEffect(() => {
    apiFetch<Order[]>('/orders/driver/my-orders')
      .then(orders => {
        const active = orders.find(o =>
          o.status === 'preparing' || o.status === 'on_the_way'
        );
        setOrder(active ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Arrancar GPS cuando hay pedido activo
  useEffect(() => {
    if (!order) return;
    const stopGPS = startGPS();
    return () => stopGPS?.();
  }, [order]);

  const handleStatusChange = async (status: 'preparing' | 'on_the_way' | 'delivered') => {
    if (!order) return;
    emitStatus(status);
    setOrder(prev => prev ? { ...prev, status } : null);

    // También actualizar en la DB via REST
    await apiFetch(`/orders/${order.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    if (status === 'delivered') setOrder(null);
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-surface-900 text-white">

      {/* Header */}
      <div className="bg-surface-800 border-b border-white border-opacity-5 px-4 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M12 12l9-5M12 12v10M12 12L3 7" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-sm">{t('title')}</p>
              <p className="text-xs text-white opacity-30">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs text-white opacity-40">
              {isConnected ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4">

        {!order ? (
          // Sin pedido activo
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 bg-surface-800 rounded-2xl flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-white opacity-40 text-sm">{t('no_orders')}</p>
          </div>
        ) : (
          <>
            {/* Info del pedido */}
            <div className="bg-surface-800 rounded-2xl p-5 border border-white border-opacity-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-white opacity-40 uppercase tracking-wide">
                  {t('current_order')}
                </p>
                <StatusBadge status={order.status} />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-white opacity-30">Origen</p>
                    <p className="text-sm">{order.addressFrom}</p>
                  </div>
                </div>
                <div className="w-px h-4 bg-white opacity-10 ml-1" />
                <div className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-white opacity-30">Destino</p>
                    <p className="text-sm">{order.addressTo}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white border-opacity-5">
                <p className="text-xs text-white opacity-30">Cliente</p>
                <p className="text-sm">{order.customer.name}</p>
              </div>
            </div>

            {/* Mapa */}
            <DynamicMap
              driverPosition={position}
              height="280px"
            />

            {/* Botones de acción */}
            <div className="flex flex-col gap-3">
              {order.status === 'preparing' && (
                <button
                  onClick={() => handleStatusChange('on_the_way')}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl py-4 text-sm transition-colors"
                >
                  {t('pickup')} →
                </button>
              )}
              {order.status === 'on_the_way' && (
                <button
                  onClick={() => handleStatusChange('delivered')}
                  className="bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl py-4 text-sm transition-colors"
                >
                  {t('delivered')} ✓
                </button>
              )}

              {/* Botón chat */}
              <button
                onClick={() => setShowChat(prev => !prev)}
                className="bg-surface-800 hover:bg-opacity-80 border border-white border-opacity-10 text-white font-medium rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                Chat
                {messages.length > 0 && (
                  <span className="w-5 h-5 bg-brand-500 rounded-full text-xs flex items-center justify-center">
                    {messages.length}
                  </span>
                )}
              </button>
            </div>

            {/* Chat expandible */}
            {showChat && (
              <ChatBox
                messages={messages}
                onSend={sendMessage}
                currentUserId={user?.id ?? ''}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Componentes auxiliares ─────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-500 bg-opacity-10 text-yellow-400',
    preparing: 'bg-brand-500 bg-opacity-10 text-brand-400',
    on_the_way: 'bg-blue-500 bg-opacity-10 text-blue-400',
    delivered: 'bg-green-500 bg-opacity-10 text-green-400',
  };
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    preparing: 'Preparando',
    on_the_way: 'En camino',
    delivered: 'Entregado',
  };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${styles[status] ?? ''}`}>
      {labels[status] ?? status}
    </span>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center">
      <div className="w-10 h-10 bg-brand-500 rounded-xl animate-pulse" />
    </div>
  );
}