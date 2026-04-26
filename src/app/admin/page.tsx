'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useConfig } from '@/hooks/useConfig';
import { OrderCard } from '@/components/orders/OrderCard';
import { StatusBadge } from '@/components/orders/StatusBadge';
import { Order } from '@/types';

// Dynamically import the map to avoid SSR issues
const DeliveryMap = dynamic(() => import('@/components/map/DeliveryMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-50 animate-pulse flex flex-col items-center justify-center text-slate-400 gap-3">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <span className="font-medium">Carregando mapa...</span>
    </div>
  )
});

// Mock data for initial UI
const MOCK_ORDERS: Order[] = [
  { 
    id: 'ord-101', 
    status: 'ON_WAY', 
    customerName: 'Carlos Oliveira', 
    address: 'Av. Paulista, 1000 - SP', 
    createdAt: new Date().toISOString(),
    currentLocation: { lat: -23.561472, lng: -46.655881 }
  },
  { 
    id: 'ord-102', 
    status: 'PREPARING', 
    customerName: 'Mariana Silva', 
    address: 'Rua Augusta, 500 - SP', 
    createdAt: new Date(Date.now() - 3600000).toISOString() 
  },
  { 
    id: 'ord-103', 
    status: 'ON_WAY', 
    customerName: 'Ricardo Santos', 
    address: 'Alameda Santos, 85 - SP', 
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    currentLocation: { lat: -23.571472, lng: -46.645881 }
  },
];

export default function AdminDashboard() {
  const { t, language } = useConfig();
  const [orders] = useState<Order[]>(MOCK_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = useMemo(() => 
    orders.find(o => o.id === selectedOrderId), 
    [orders, selectedOrderId]
  );

  const activeOrdersCount = orders.filter(o => o.status !== 'DELIVERED').length;
  
  const mapCenter: [number, number] = selectedOrder?.currentLocation 
    ? [selectedOrder.currentLocation.lat, selectedOrder.currentLocation.lng] 
    : [-23.561472, -46.655881]; // Default: São Paulo

  const markers = useMemo(() => 
    orders
      .filter(o => o.currentLocation)
      .map(o => ({
        id: o.id,
        position: [o.currentLocation!.lat, o.currentLocation!.lng] as [number, number],
        label: `${t.status[o.status]}: ${o.customerName}`
      })),
    [orders, t]
  );

  return (
    <main className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Sidebar */}
      <div className="w-96 bg-white border-r border-slate-200 flex flex-col shadow-xl z-20">
        <header className="p-6 border-b border-slate-100 bg-white sticky top-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-200">
              📊
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">{t.admin.title}</h1>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
              <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1">{t.admin.active}</p>
              <p className="text-2xl font-black text-indigo-700">{activeOrdersCount}</p>
            </div>
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-1">{t.admin.today}</p>
              <p className="text-2xl font-black text-emerald-700">24</p>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <section>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              {t.admin.current_orders}
            </h2>
            <div className="space-y-4">
              {orders.map(order => (
                <div 
                  key={order.id}
                  className={`transition-all duration-300 transform ${selectedOrderId === order.id ? 'scale-[1.02]' : ''}`}
                >
                  <OrderCard 
                    order={order} 
                    onClick={(id) => setSelectedOrderId(id)}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="p-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[10px] text-center text-slate-400 font-medium">
            Delivery Admin v1.0 • {new Date().toLocaleDateString(language)}
          </p>
        </footer>
      </div>

      {/* Map View */}
      <div className="flex-1 relative bg-slate-100">
        <DeliveryMap 
          center={mapCenter}
          zoom={14}
          markers={markers}
        />
        
        {/* Floating Order Info */}
        {selectedOrder && (
          <div className="absolute top-6 right-6 w-80 bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-2xl border border-white/20 z-[1000] animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Detalhes do Pedido</p>
                <h3 className="font-bold text-slate-900 text-lg">#{selectedOrder.id.slice(-6)}</h3>
              </div>
              <button 
                onClick={() => setSelectedOrderId(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors cursor-pointer"
              >✕</button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm">👤</div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{language === 'pt' ? 'Cliente' : 'Cliente'}</p>
                  <p className="text-sm font-semibold">{selectedOrder.customerName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm">📍</div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{language === 'pt' ? 'Entrega' : 'Entrega'}</p>
                  <p className="text-xs font-semibold leading-relaxed">{selectedOrder.address}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <StatusBadge status={selectedOrder.status} />
                <button className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">
                  {language === 'pt' ? 'Ver histórico' : 'Ver historial'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Map Floating UI */}
        <div className="absolute bottom-6 right-6 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/20 z-[1000] text-[10px] font-bold text-slate-500 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Sincronizado em tempo real
        </div>
      </div>
    </main>
  );
}
