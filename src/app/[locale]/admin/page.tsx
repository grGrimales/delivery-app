'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { getTrackingSocket } from '@/lib/socket';
import DynamicMap from '@/components/map/DynamicMap';

type Order = {
  id: string;
  addressFrom: string;
  addressTo: string;
  status: string;
  customer: { id: string; name: string };
  driver?: { id: string; name: string };
  createdAt: string;
};

type DriverPosition = {
  orderId: string;
  lat: number;
  lng: number;
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500 bg-opacity-10 text-yellow-400',
  preparing: 'bg-brand-500 bg-opacity-10 text-brand-400',
  on_the_way: 'bg-blue-500 bg-opacity-10 text-blue-400',
  delivered: 'bg-green-500 bg-opacity-10 text-green-400',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  preparing: 'Preparando',
  on_the_way: 'En camino',
  delivered: 'Entregado',
};

export default function AdminPage() {
  const t = useTranslations('admin');
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [positions, setPositions] = useState<Record<string, DriverPosition>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    apiFetch<Order[]>('/orders')
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (orders.length === 0) return;
    const socket = getTrackingSocket();
    socket.connect();

    const activeOrders = orders.filter(o => o.status !== 'delivered');
    activeOrders.forEach(o => socket.emit('join:order', o.id));

    socket.on('location:update', (data: DriverPosition) => {
      setPositions(prev => ({ ...prev, [data.orderId]: data }));
    });

    socket.on('order:status:update', (data: { orderId: string; status: string }) => {
      setOrders(prev =>
        prev.map(o => o.id === data.orderId ? { ...o, status: data.status } : o)
      );
    });

    return () => {
      activeOrders.forEach(o => socket.emit('leave:order', o.id));
      socket.off('location:update');
      socket.off('order:status:update');
    };
  }, [orders.length]);

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  const metrics = {
    total: orders.length,
    active: orders.filter(o => o.status === 'on_the_way').length,
    today: orders.filter(o => {
      const d = new Date(o.createdAt);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  // Marcadores del mapa — solo repartidores activos
  const driverMarkers = Object.values(positions);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-surface-900 text-white">

      {/* Header */}
      <div className="bg-surface-800 border-b border-white border-opacity-5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
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
          <div className="flex items-center gap-4">
            <p className="text-sm text-white opacity-40">{user?.name}</p>
            <button
              onClick={logout}
              className="text-xs text-white opacity-30 hover:opacity-60 transition-opacity"
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total pedidos', value: metrics.total },
            { label: t('active'), value: metrics.active, accent: true },
            { label: t('today'), value: metrics.today },
            { label: 'Entregados', value: metrics.delivered },
          ].map(m => (
            <div key={m.label} className={`rounded-2xl p-4 ${m.accent ? 'bg-brand-500 bg-opacity-10 border border-brand-500 border-opacity-20' : 'bg-surface-800 border border-white border-opacity-5'}`}>
              <p className="text-xs text-white opacity-40 mb-1">{m.label}</p>
              <p className={`text-3xl font-semibold ${m.accent ? 'text-brand-400' : 'text-white'}`}>
                {m.value}
              </p>
            </div>
          ))}
        </div>

        {/* Mapa con todos los repartidores */}
        <div className="bg-surface-800 rounded-2xl border border-white border-opacity-5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white border-opacity-5 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${driverMarkers.length > 0 ? 'bg-green-400 animate-pulse' : 'bg-white opacity-20'}`} />
            <p className="text-sm font-medium">Repartidores en vivo</p>
            <span className="text-xs text-white opacity-30 ml-auto">
              {driverMarkers.length > 0 ? `${driverMarkers.length} activo${driverMarkers.length !== 1 ? 's' : ''}` : 'Sin repartidores activos'}
            </span>
          </div>
          <DynamicMap
            driverPosition={driverMarkers[0] ?? null}
            height="300px"
          />
        </div>

        {/* Lista de pedidos */}
        <div className="bg-surface-800 rounded-2xl border border-white border-opacity-5">

          {/* Filtros */}
          <div className="px-4 py-3 border-b border-white border-opacity-5 flex gap-2 overflow-x-auto">
            {['all', 'pending', 'preparing', 'on_the_way', 'delivered'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${filter === s
                  ? 'bg-brand-500 text-white'
                  : 'text-white opacity-40 hover:opacity-70'
                  }`}
              >
                {s === 'all' ? 'Todos' : STATUS_LABELS[s]}
                {s === 'all' && ` (${orders.length})`}
              </button>
            ))}
          </div>

          {/* Tabla */}
          <div className="divide-y divide-white divide-opacity-5">
            {filteredOrders.length === 0 && (
              <p className="text-center text-white opacity-20 text-sm py-12">
                Sin pedidos
              </p>
            )}
            {filteredOrders.map(order => (
              <div key={order.id} className="px-4 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors">

                {/* Info del pedido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs text-white opacity-30 font-mono">
                      #{order.id.slice(0, 8)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                    {/* Indicador en vivo */}
                    {positions[order.id] && (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                        En vivo
                      </span>
                    )}
                  </div>
                  <p className="text-sm truncate">{order.addressFrom} → {order.addressTo}</p>
                  <p className="text-xs text-white opacity-30 mt-0.5">
                    Cliente: {order.customer?.name}
                    {order.driver && ` · Repartidor: ${order.driver.name}`}
                  </p>
                </div>

                {/* Hora */}
                <p className="text-xs text-white opacity-20 flex-shrink-0">
                  {new Date(order.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                </p>

              </div>
            ))}
          </div>
        </div>

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