'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useConfig } from '@/hooks/useConfig';
import { useTracking } from '@/hooks/useTracking';
import { 
  Navigation, 
  MessageSquare, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  AlertTriangle,
  ChevronUp
} from 'lucide-react';
import dynamic from 'next/dynamic';

const DeliveryMap = dynamic(() => import('@/components/map/DeliveryMap'), { ssr: false });

export default function DriverApp() {
  const { user } = useAuth();
  const { t, language } = useConfig();
  const [currentOrder, setCurrentOrder] = useState<any>({
    id: 'ORD-772',
    customer: 'Leticia Silva',
    address: 'Rua das Flores, 123, Lisboa',
    status: 'PICKUP', // PICKUP, ON_WAY, DELIVERED
    phone: '+351 912 345 678'
  });
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Hook de tracking real
  const { updateLocation } = useTracking(currentOrder.id);

  // Simulación de actualización de GPS cada 10s
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          updateLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            heading: pos.coords.heading || 0
          });
        });
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [currentOrder.id]);

  const handleStatusChange = () => {
    if (currentOrder.status === 'PICKUP') setCurrentOrder({...currentOrder, status: 'ON_WAY'});
    else if (currentOrder.status === 'ON_WAY') setCurrentOrder({...currentOrder, status: 'DELIVERED'});
  };

  if (!user) return null;

  return (
    <div className="h-screen bg-slate-900 flex flex-col font-sans overflow-hidden text-white">
      
      {/* Header de Estado */}
      <header className="p-5 flex justify-between items-center bg-slate-900/50 backdrop-blur-md border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Online • Live GPS</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Earnings Today:</span>
          <span className="text-sm font-black text-orange-500">€84.50</span>
        </div>
      </header>

      {/* Mapa de Navegación (Fondo) */}
      <div className="flex-1 relative">
        <DeliveryMap 
          center={[38.7223, -9.1393]} 
          zoom={16}
          markers={[{ id: 'me', position: [38.7223, -9.1393], label: 'Eu' }]}
        />
        
        {/* Overlay de Alerta / Incidencia */}
        <button className="absolute top-4 right-4 h-12 w-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20 active:scale-90 transition-all">
          <AlertTriangle className="text-white" size={24} />
        </button>
      </div>

      {/* Panel de Pedido Flotante (UI Móvil) */}
      <div className="bg-white rounded-t-[3rem] p-8 pb-10 shadow-[0_-20px_50px_rgba(0,0,0,0.2)] text-slate-900 shrink-0">
        <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md uppercase">Current Order</span>
              <span className="text-[10px] font-black text-slate-400 uppercase">#{currentOrder.id}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{currentOrder.customer}</h2>
          </div>
          <button className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-orange-500 transition-colors">
            <Phone size={20} />
          </button>
        </div>

        <div className="flex items-start gap-4 mb-8 bg-slate-50 p-5 rounded-3xl">
          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm shrink-0">
            <MapPin size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Delivery Address</p>
            <p className="text-sm font-bold text-slate-700 leading-snug">{currentOrder.address}</p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-4">
          <button 
            onClick={() => setIsChatOpen(true)}
            className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 active:scale-95 transition-all relative"
          >
            <MessageSquare size={24} />
            <span className="absolute top-4 right-4 h-3 w-3 bg-orange-500 rounded-full border-2 border-white" />
          </button>
          
          <button 
            onClick={handleStatusChange}
            disabled={currentOrder.status === 'DELIVERED'}
            className={`flex-1 h-16 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl ${
              currentOrder.status === 'DELIVERED' 
              ? 'bg-emerald-500 text-white shadow-emerald-200' 
              : 'bg-slate-900 text-white shadow-slate-200'
            }`}
          >
            {currentOrder.status === 'PICKUP' && (
              <>
                <Navigation size={18} className="text-orange-500" />
                {language === 'es' ? 'Recoger Pedido' : 'Recolher Pedido'}
              </>
            )}
            {currentOrder.status === 'ON_WAY' && (
              <>
                <CheckCircle2 size={18} className="text-emerald-500" />
                {language === 'es' ? 'Marcar como Entregado' : 'Entregue'}
              </>
            )}
            {currentOrder.status === 'DELIVERED' && 'Completado'}
          </button>
        </div>
      </div>

      {/* Chat Modal RT */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 bg-white animate-in slide-in-from-bottom duration-300 flex flex-col">
          <header className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsChatOpen(false)} className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <ChevronUp className="rotate-180" size={20} />
              </button>
              <div>
                <p className="text-sm font-black">{currentOrder.customer}</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Online Now</p>
              </div>
            </div>
          </header>
          <div className="flex-1 bg-slate-50 p-6 overflow-y-auto space-y-4">
            {/* Mensajes simulados */}
            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] text-sm font-medium text-slate-700 border border-slate-100">
              Olá! Onde você está exatamente?
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl rounded-tr-none shadow-lg max-w-[80%] ml-auto text-sm font-bold text-white">
              Estou a 2 minutos, já estou na sua rua! 🛵
            </div>
          </div>
          <div className="p-6 border-t bg-white flex gap-3">
            <input 
              type="text" 
              placeholder="Escribe un mensaje..." 
              className="flex-1 bg-slate-100 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20"
            />
            <button className="h-14 w-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
              <Navigation className="rotate-90" size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
