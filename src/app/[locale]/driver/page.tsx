'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { useConfig } from '@/hooks/useConfig';
import { useSocket } from '@/hooks/useSocket';
import { 
  MapPin, 
  Navigation, 
  Package, 
  Loader2, 
  CheckCircle2, 
  Truck, 
  Phone, 
  MessageSquare, 
  Map as MapIcon, 
  ChevronLeft,
  Info,
  Wifi
} from 'lucide-react';
import { getMyOrders, updateOrderStatus } from '@/lib/orders';

const MapRT = dynamic(() => import('@/components/map/DeliveryMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-900 flex items-center justify-center text-orange-500 font-bold">CARGANDO MAPA...</div>
});

export default function DriverApp() {
  const { token, user } = useAuth();
  const { t } = useConfig();
  const { socket, isConnected } = useSocket(token);

  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusT = t.status;
  const currentOrder = orders.find(o => o.id === selectedOrderId) || orders.find(o => o.status !== 'DELIVERED');

  // 1. GESTIÓN DE DATOS
  const refreshData = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getMyOrders(token);
      setOrders(data);
      if (!selectedOrderId && data.length > 0) {
        const active = data.find((o: any) => o.status !== 'DELIVERED');
        if (active) setSelectedOrderId(active.id);
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }, [token, selectedOrderId]);

  useEffect(() => { refreshData(); }, [refreshData]);

  // 2. SOCKETS: ACTUALIZACIÓN DE ESTADOS
  useEffect(() => {
    if (!socket) return;
    const update = () => refreshData();
    socket.on('orderStatusChanged', update);
    socket.on('newOrder', update);
    return () => { 
      socket.off('orderStatusChanged', update); 
      socket.off('newOrder', update); 
    };
  }, [socket, refreshData]);

  // 3. SOCKETS: ENVÍO DE UBICACIÓN GPS EN TIEMPO REAL
  useEffect(() => {
    if (!socket || !isConnected || !currentOrder || currentOrder.status !== 'ON_WAY') return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        socket.emit('updateLocation', {
          orderId: currentOrder.id,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => console.error("Error GPS:", err),
      { enableHighAccuracy: true, distanceFilter: 10 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [socket, isConnected, currentOrder]);

  const handleAction = async () => {
    if (!currentOrder || !token) return;
    const nextStatus = currentOrder.status === 'PREPARING' ? 'ON_WAY' : 'DELIVERED';
    setIsUpdating(true);
    try {
      await updateOrderStatus(currentOrder.id, nextStatus, token);
      await refreshData();
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsUpdating(false); 
    }
  };

  if (isLoading) return (
    <div className="h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Conectando con la central...</p>
    </div>
  );

  if (!currentOrder) return (
    <div className="h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
      <div className="h-24 w-24 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mb-6 border border-slate-100">
        <Package className="h-10 w-10 text-slate-200" />
      </div>
      <h2 className="text-xl font-black text-slate-900 tracking-tight">¡Todo despejado!</h2>
      <p className="text-sm text-slate-400 mt-2">No tienes pedidos pendientes. Te avisaremos cuando haya trabajo disponible.</p>
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden font-sans">
      
      {/* HEADER DINÁMICO CON ESTADO DE CONEXIÓN */}
      <header className="bg-slate-900 text-white p-5 shrink-0 z-20 shadow-lg border-b border-white/5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              <Wifi size={10} className={isConnected ? 'animate-pulse' : ''} />
              {isConnected ? 'Sistema RT Live' : 'Desconectado'}
            </div>
          </div>
          <button 
            onClick={() => setView(view === 'map' ? 'list' : 'map')}
            className="bg-orange-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
          >
            {view === 'map' ? 'Ver Detalles' : 'Ver Mapa'}
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 relative overflow-hidden">
        
        {/* VISTA DE MAPA INTEGRADA */}
        <div className={`absolute inset-0 transition-all duration-500 ${view === 'map' ? 'z-10 opacity-100' : 'z-0 opacity-0 invisible'}`}>
          <MapRT 
            orders={[currentOrder]} 
            center={currentOrder.locationTo} 
            zoom={16} 
          />
        </div>

        {/* VISTA DE DETALLES (LISTA) */}
        <div className={`h-full flex flex-col p-4 sm:p-6 space-y-4 overflow-y-auto pb-40 transition-all duration-500 ${view === 'list' ? 'translate-x-0' : '-translate-x-full opacity-0'}`}>
          
          {/* Indicador de Etapa Actual */}
          <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between px-10 relative">
            <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-slate-50 -translate-y-1/2 z-0" />
            {['PREPARING', 'ON_WAY', 'DELIVERED'].map((s, i) => {
              const active = currentOrder.status === s;
              const completed = ['PREPARING', 'ON_WAY', 'DELIVERED'].indexOf(currentOrder.status) > i;
              return (
                <div key={s} className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-500 border-4 ${
                    active ? 'bg-orange-500 border-orange-100 text-white shadow-xl scale-110' : 
                    completed ? 'bg-emerald-500 border-emerald-50 text-white' : 'bg-white border-slate-50 text-slate-200'
                  }`}>
                    {i === 0 && <Package size={18} />}
                    {i === 1 && <Truck size={18} />}
                    {i === 2 && <CheckCircle2 size={18} />}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-tighter ${active ? 'text-slate-900' : 'text-slate-300'}`}>
                    {i === 0 ? 'Local' : i === 1 ? 'En Ruta' : 'Destino'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Información del Cliente y Pedido */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Orden Activa</p>
                <h3 className="font-black text-slate-900 text-lg tracking-tight">#{currentOrder.id.split('-')[0]}</h3>
              </div>
              <div className="flex gap-2">
                <a href={`tel:${currentOrder.phone || ''}`} className="h-12 w-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 active:bg-orange-500 active:text-white transition-colors">
                  <Phone size={20} />
                </a>
                <button className="h-12 w-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 active:bg-orange-500 active:text-white transition-colors">
                  <MessageSquare size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-7 space-y-8 relative">
              <div className="absolute left-[43px] top-12 bottom-12 w-0.5 bg-slate-100 border-l-2 border-dashed" />
              
              <div className="flex gap-5 relative z-10">
                <div className="h-14 w-14 bg-white border border-slate-100 rounded-[1.3rem] flex items-center justify-center shrink-0 shadow-sm text-slate-300">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Punto de Recogida</p>
                  <p className="text-sm font-bold text-slate-600 leading-tight">{currentOrder.addressFrom}</p>
                </div>
              </div>

              <div className="flex gap-5 relative z-10">
                <div className="h-14 w-14 bg-orange-50 border border-orange-100 rounded-[1.3rem] flex items-center justify-center shrink-0 shadow-sm text-orange-500">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] mb-1">Dirección del Cliente</p>
                  <p className="text-base font-black text-slate-900 leading-tight">{currentOrder.addressTo}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER: BOTÓN DE ACCIÓN FIJO CON TEXTO VISIBLE */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-white to-transparent z-40">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleAction}
            disabled={isUpdating || currentOrder.status === 'DELIVERED'}
            className={`w-full py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] flex justify-center items-center gap-4 shadow-2xl transition-all active:scale-95 disabled:opacity-50 text-white ${
              currentOrder.status === 'PREPARING' ? 'bg-slate-900' :
              currentOrder.status === 'ON_WAY' ? 'bg-orange-500 shadow-orange-200' :
              'bg-emerald-500'
            }`}
          >
            {isUpdating ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <div className="flex items-center gap-3">
                {currentOrder.status === 'PREPARING' && (
                  <>
                    <Truck size={22} className="text-orange-500" />
                    <span>Tomar Pedido (En Camino)</span>
                  </>
                )}
                {currentOrder.status === 'ON_WAY' && (
                  <>
                    <CheckCircle2 size={22} />
                    <span>Finalizar Entrega</span>
                  </>
                )}
                {currentOrder.status === 'DELIVERED' && (
                  <span>¡Pedido Entregado!</span>
                )}
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
