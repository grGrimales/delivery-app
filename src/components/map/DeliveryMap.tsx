'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface DeliveryMapProps {
  orders: any[];
  center?: { lat: number, lng: number } | [number, number];
  zoom?: number;
}

// Componente para manejar el cambio de vista del mapa
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 1 });
  }, [center, zoom, map]);
  return null;
}

export default function DeliveryMap({ orders, center, zoom = 13 }: DeliveryMapProps) {
  // Centro por defecto: Florianópolis, SC, Brasil
  const defaultPos: [number, number] = [-27.5945, -48.5658];
  const [markerIcon, setMarkerIcon] = useState<L.DivIcon | null>(null);

  useEffect(() => {
    // Definimos el icono solo en el cliente
    const icon = L.divIcon({
      className: 'bg-transparent',
      html: `<div style="background-color: #f97316; color: white; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 12px; border: 3px solid white; box-shadow: 0 10px 15px rgba(0,0,0,0.1); transform: rotate(-45deg);"><div style="transform: rotate(45deg);">📦</div></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
    setMarkerIcon(icon);
  }, []);

  // Normalizamos el centro validando que existan las coordenadas
  let mapCenter: [number, number] = defaultPos;
  if (center) {
    if (Array.isArray(center) && center.length === 2) {
      mapCenter = center as [number, number];
    } else if (!Array.isArray(center) && center.lat && center.lng) {
      mapCenter = [center.lat, center.lng];
    }
  }

  if (!markerIcon) return null;

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <ChangeView center={mapCenter} zoom={zoom} />

      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; CARTO'
      />

      {orders.map((order) => {
        // Obtenemos lat y lng directamente (ajustado según tu DB de TypeORM)
        const lat = order.lat;
        const lng = order.lng;

        if (!lat || !lng) return null;

        return (
          <Marker
            key={order.id}
            position={[lat, lng]}
            icon={markerIcon}
          >
            <Popup className="custom-popup">
              <div className="font-sans p-2 min-w-[150px]">
                <p className="font-black text-slate-900 text-[10px] uppercase tracking-widest mb-1">Orden #{order.id.split('-')[0]}</p>
                <p className="text-xs font-bold text-slate-600 mb-2 border-l-2 border-orange-500 pl-2">{order.addressTo}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Estado:</span>
                  <span className="bg-orange-50 text-orange-600 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                    {order.status}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}