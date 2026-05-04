'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTracking } from '@/hooks/useTracking';
import { useChat } from '@/hooks/useChat';
import { apiFetch } from '@/lib/api';
import ChatBox from '@/components/chat/ChatBox';
import { useTranslations } from 'next-intl';

type Order = {
  id: string;
  addressFrom: string;
  addressTo: string;
  status: string;
  driver?: { id: string; name: string };
  customer: { id: string; name: string };
};

const STEPS = [
  { key: 'pending', label: 'Pedido recibido', icon: '📋' },
  { key: 'preparing', label: 'Preparando', icon: '👨‍🍳' },
  { key: 'on_the_way', label: 'En camino', icon: '🛵' },
  { key: 'delivered', label: 'Entregado', icon: '✅' },
];

const STATUS_INDEX: Record<string, number> = {
  pending: 0, preparing: 1, on_the_way: 2, delivered: 3,
};

export default function TrackingPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const t = useTranslations('track');
  const [order, setOrder] = useState<Order | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);

  const { status: liveStatus } = useTracking(orderId);
  const { messages, sendMessage } = useChat(orderId);

  useEffect(() => {
    if (!orderId) return;
    apiFetch<Order>(`/orders/${orderId}`)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    if (liveStatus) {
      setOrder(prev => prev ? { ...prev, status: liveStatus } : prev);
    }
  }, [liveStatus]);

  if (loading) return <LoadingScreen />;
  if (!order) return <NotFound />;

  const currentStep = STATUS_INDEX[order.status] ?? 0;
  const isDelivered = order.status === 'delivered';

  return (
    <div className="min-h-screen bg-surface-900 text-white">

      {/* Header */}
      <div className="bg-surface-800 border-b border-white border-opacity-5 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M12 12l9-5M12 12v10M12 12L3 7" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-sm">DeliveryDash</p>
            <p className="text-xs text-white opacity-30">{t('title')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4">

        {/* Estado actual destacado */}
        <div className={`rounded-2xl p-6 text-center border ${isDelivered
          ? 'bg-green-500 bg-opacity-10 border-green-500 border-opacity-20'
          : 'bg-surface-800 border-white border-opacity-5'
          }`}>
          <div className="text-4xl mb-3">{STEPS[currentStep].icon}</div>
          <p className="text-xl font-semibold mb-1">{STEPS[currentStep].label}</p>
          {order.driver && !isDelivered && (
            <p className="text-sm text-white opacity-40">
              Tu repartidor: <span className="text-white opacity-70">{order.driver.name}</span>
            </p>
          )}
          {isDelivered && (
            <p className="text-sm text-green-400 mt-1">¡Tu pedido llegó!</p>
          )}
        </div>

        {/* Barra de progreso */}
        <div className="bg-surface-800 rounded-2xl p-5 border border-white border-opacity-5">
          <div className="flex items-center justify-between relative">
            {/* Línea de fondo */}
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-white bg-opacity-10 z-0" />
            {/* Línea de progreso */}
            <div
              className="absolute left-0 top-4 h-0.5 bg-brand-500 z-0 transition-all duration-700"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />

            {STEPS.map((step, i) => (
              <div key={step.key} className="flex flex-col items-center gap-2 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${i <= currentStep
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-900 border border-white border-opacity-10 text-white opacity-20'
                  }`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <p className={`text-xs text-center leading-tight max-w-14 ${i <= currentStep ? 'text-white opacity-70' : 'text-white opacity-20'
                  }`}>
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Info del pedido */}
        <div className="bg-surface-800 rounded-2xl p-5 border border-white border-opacity-5">
          <p className="text-xs text-white opacity-40 uppercase tracking-wide mb-3">
            Detalle del pedido
          </p>
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
        </div>

        {/* Chat con el repartidor */}
        {order.driver && !isDelivered && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowChat(prev => !prev)}
              className="bg-surface-800 border border-white border-opacity-10 text-white font-medium rounded-xl py-3 text-sm transition-colors hover:bg-white/5 flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                  stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              Chatear con el repartidor
              {messages.length > 0 && (
                <span className="w-5 h-5 bg-brand-500 rounded-full text-xs flex items-center justify-center">
                  {messages.length}
                </span>
              )}
            </button>

            {showChat && (
            <ChatBox
                messages={messages}
                onSend={sendMessage}
                currentUserId={order.customer.id}
              />
            )}
          </div>
        )}

        {/* Número de pedido */}
        <p className="text-center text-xs text-white opacity-20">
          Pedido #{orderId.slice(0, 8).toUpperCase()}
        </p>

      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center">
      <div className="w-10 h-10 bg-brand-500 rounded-xl animate-pulse" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center">
      <div className="text-center">
        <p className="text-white opacity-40 text-sm">Pedido no encontrado</p>
      </div>
    </div>
  );
}