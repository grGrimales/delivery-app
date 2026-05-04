'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { getTrackingSocket } from '@/lib/socket';
import DynamicMap from '@/components/map/DynamicMap';
import ChatBox from '@/components/chat/ChatBox';
import { useChat } from '@/hooks/useChat';

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

  // Estado para el chat activo (Panel Lateral)
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);
  const { messages, sendMessage } = useChat(activeChatOrder?.id ?? '');

  useEffect(() => {
    apiFetch<Order[]>('/orders')
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const EMPTY_ORDER = {
    addressFrom: 'DeliveryDash Restaurant, Av. Beira Mar Norte 500, Florianópolis',
    addressTo: '',
    cep: '',
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
  };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrder, setNewOrder] = useState(EMPTY_ORDER);
  const [creating, setCreating] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');

  const handleCepChange = async (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setNewOrder(prev => ({ ...prev, cep: formatted, lat: undefined, lng: undefined, addressTo: '' }));
    setCepError('');
    if (digits.length !== 8) return;

    setCepLoading(true);
    try {
      const viacep = await fetch(`https://viacep.com.br/ws/${digits}/json/`).then(r => r.json());
      if (viacep.erro) { setCepError('CEP não encontrado'); return; }

      const address = [viacep.logradouro, viacep.bairro, `${viacep.localidade} - ${viacep.uf}`]
        .filter(Boolean).join(', ');

      const geo = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ', Brasil')}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'pt-BR', 'User-Agent': 'DeliveryDash/1.0' } }
      ).then(r => r.json());

      if (!geo.length) { setCepError('Não foi possível calcular a localização'); return; }

      setNewOrder(prev => ({
        ...prev,
        addressTo: address,
        lat: parseFloat(geo[0].lat),
        lng: parseFloat(geo[0].lon),
      }));
    } catch {
      setCepError('Erro ao buscar CEP');
    } finally {
      setCepLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!newOrder.addressFrom.trim() || !newOrder.addressTo.trim()) return;
    setCreating(true);
    try {
      const order = await apiFetch<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          addressFrom: newOrder.addressFrom,
          addressTo: newOrder.addressTo,
          lat: newOrder.lat,
          lng: newOrder.lng,
        }),
      });
      setOrders(prev => [order, ...prev]);
      setShowCreateModal(false);
      setNewOrder(EMPTY_ORDER);
      setCepError('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

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

  const driverMarkers = Object.values(positions);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-surface-900 text-white flex">
      
      {/* Sidebar Chat (cuando está activo) */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-surface-800 border-l border-white border-opacity-5 z-50 transform transition-transform duration-300 ${activeChatOrder ? 'translate-x-0' : 'translate-x-full'}`}>
        {activeChatOrder && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-white border-opacity-5 flex items-center justify-between bg-surface-700">
              <div>
                <h3 className="font-medium text-sm">Chat del Pedido</h3>
                <p className="text-[10px] text-white opacity-30 font-mono">#{activeChatOrder.id.slice(0, 8)}</p>
              </div>
              <button onClick={() => setActiveChatOrder(null)} className="text-white opacity-30 hover:opacity-100 text-xl">×</button>
            </div>
            <div className="flex-1 overflow-hidden p-2">
              <ChatBox
                messages={messages}
                onSend={sendMessage}
                currentUserId={user?.id ?? ''}
              />
            </div>
          </div>
        )}
      </div>

      {/* Contenido Principal */}
      <div className={`flex-1 transition-all duration-300 ${activeChatOrder ? 'pr-80' : ''}`}>
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
                onClick={() => setShowCreateModal(true)}
                className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                + Nuevo pedido
              </button>
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

          {/* Mapa */}
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

            <div className="divide-y divide-white divide-opacity-5">
              {filteredOrders.length === 0 && (
                <p className="text-center text-white opacity-20 text-sm py-12">
                  Sin pedidos
                </p>
              )}
              {filteredOrders.map(order => (
                <div key={order.id} className={`px-4 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors ${activeChatOrder?.id === order.id ? 'bg-white/5 border-r-4 border-brand-500' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs text-white opacity-30 font-mono">
                        #{order.id.slice(0, 8)}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                      {positions[order.id] && (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
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

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setActiveChatOrder(activeChatOrder?.id === order.id ? null : order)}
                      className={`p-2 rounded-xl transition-all ${activeChatOrder?.id === order.id ? 'bg-brand-500 text-white' : 'text-white opacity-20 hover:opacity-100 hover:bg-white/10'}`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <p className="text-xs text-white opacity-20">
                      {new Date(order.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Crear Pedido */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000] px-4">
          <div className="bg-surface-800 rounded-2xl p-6 w-full max-w-sm border border-white border-opacity-5 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-medium text-lg">Nuevo pedido</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-white opacity-30 hover:opacity-60 text-xl">×</button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white opacity-40 uppercase tracking-wide">Origen</label>
                <input
                  type="text"
                  placeholder="Ej: DeliveryDash Restaurant..."
                  value={newOrder.addressFrom}
                  onChange={e => setNewOrder(prev => ({ ...prev, addressFrom: e.target.value }))}
                  className="bg-surface-900 border border-white border-opacity-10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white opacity-40 uppercase tracking-wide">CEP de entrega</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ex: 88010-500"
                    value={newOrder.cep}
                    onChange={e => handleCepChange(e.target.value)}
                    maxLength={9}
                    className="w-full bg-surface-900 border border-white border-opacity-10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
                  />
                  {cepLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />}
                </div>
                {cepError && <p className="text-xs text-red-400">{cepError}</p>}
              </div>
              {newOrder.addressTo && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white opacity-40 uppercase tracking-wide">Dirección de entrega</label>
                  <div className="bg-surface-900 border border-white border-opacity-10 rounded-xl px-4 py-3">
                    <p className="text-sm text-white">{newOrder.addressTo}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3 mt-2">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 bg-transparent border border-white border-opacity-10 text-white text-sm font-medium py-3 rounded-xl">Cancelar</button>
                <button
                  onClick={handleCreateOrder}
                  disabled={creating || !newOrder.addressFrom.trim() || !newOrder.addressTo.trim() || cepLoading}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium py-3 rounded-xl"
                >
                  {creating ? 'Creando...' : 'Crear pedido →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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