'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { useConfig } from '@/hooks/useConfig';
import { useSocket } from '@/hooks/useSocket';
import { MapPin, Navigation, Package, Loader2, Wifi, WifiOff, X } from 'lucide-react';
import { getOrders } from '@/lib/orders';

const MapWithNoSSR = dynamic(
  () => import('@/components/map/DeliveryMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full w-full bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-2" />
        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Iniciando Mapa...</span>
      </div>
    )
  }
);

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const { t } = useConfig();
  const { socket, isConnected } = useSocket(token);

  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const adminT = t.admin;
  const statusT = t.status;

  useEffect(() => {
    async function fetchInitialData() {
      if (!token) return;
      try {
        const data = await getOrders(token);
        setOrders(data);
      } catch (error) {
        console.error("Error cargando órdenes:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitialData();
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    socket.on('orderStatusChanged', (updatedOrder: any) => {
      setOrders((prev) => prev.map((o) => o.id === updatedOrder.id ? { ...o, status: updatedOrder.status } : o));
      setSelectedOrder((prev: any) => prev?.id === updatedOrder.id ? { ...prev, status: updatedOrder.status } : prev);
    });

    socket.on('newOrder', (newOrder: any) => {
      setOrders((prev) => [newOrder, ...prev]);
    });

    return () => {
      socket.off('orderStatusChanged');
      socket.off('newOrder');
    };
  }, [socket]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-4 lg:p-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{adminT.title}</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">{adminT.desc}</p>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-colors ${isConnected ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
          }`}>
          {isConnected ? <Wifi size={14} className="animate-pulse" /> : <WifiOff size={14} />}
          {isConnected ? 'SISTEMA LIVE' : 'DESCONECTADO'}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Lista de Órdenes */}
        <section className="lg:col-span-5 bg-white p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col h-[700px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
              <Package className="text-orange-500" size={20} />
              {adminT.current_orders}
            </h3>
            <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-slate-200">
              {orders.length} TOTAL
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Sincronizando...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Sin órdenes activas</p>
              </div>
            ) : (
              orders.map((order: any) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-5 border rounded-[1.8rem] transition-all cursor-pointer relative overflow-hidden group ${selectedOrder?.id === order.id
                      ? 'bg-slate-900 border-slate-900 shadow-2xl shadow-slate-300 -translate-y-1'
                      : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-orange-200 hover:shadow-xl hover:shadow-slate-100'
                    }`}
                >
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedOrder?.id === order.id ? 'text-orange-500' : 'text-slate-400'}`}>
                      #{order.id.split('-')[0]}
                    </span>
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.15em] shadow-sm ${selectedOrder?.id === order.id ? 'bg-orange-500 text-white' : 'bg-white text-slate-900 border border-slate-100'
                      }`}>
                      {statusT[order.status as keyof typeof statusT] || order.status}
                    </span>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors ${selectedOrder?.id === order.id ? 'bg-slate-800' : 'bg-white border border-slate-100 shadow-sm'}`}>
                        <MapPin size={14} className={selectedOrder?.id === order.id ? 'text-orange-500' : 'text-slate-400'} />
                      </div>
                      <span className={`text-xs font-bold truncate ${selectedOrder?.id === order.id ? 'text-slate-400' : 'text-slate-500'}`}>
                        {order.addressFrom}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors ${selectedOrder?.id === order.id ? 'bg-orange-500' : 'bg-white border border-slate-100 shadow-sm'}`}>
                        <Navigation size={14} className={selectedOrder?.id === order.id ? 'text-white' : 'text-orange-500'} />
                      </div>
                      <span className={`text-xs font-black truncate ${selectedOrder?.id === order.id ? 'text-white' : 'text-slate-900'}`}>
                        {order.addressTo}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="lg:col-span-7 bg-white rounded-[3rem] border border-slate-100 h-[700px] relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.02)] z-0">

          {/* ELIMINAMOS EL DIV FLOTANTE CON LA CLASE "absolute top-6 left-6..." */}

          <div className="absolute inset-0">
            <MapWithNoSSR
              orders={orders} // Pasamos todas las órdenes para no perderlas de vista
              // Extraemos lat y lng directamente de la orden seleccionada
              center={selectedOrder && selectedOrder.lat && selectedOrder.lng ? [selectedOrder.lat, selectedOrder.lng] : undefined}
              zoom={selectedOrder ? 16 : 13}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
