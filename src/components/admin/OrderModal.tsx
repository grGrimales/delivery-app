'use client';

import React, { useState } from 'react';
import { X, MapPin, Navigation, Loader2, Hash } from 'lucide-react';

interface OrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
}

export default function OrderModal({ isOpen, onClose, onSubmit }: OrderModalProps) {
    const [formData, setFormData] = useState({
        addressFrom: '',
        addressTo: '',
        cep: '',
        lat: -27.5945,
        lng: -48.5658
    });
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleCepSearch = async (cepValue: string) => {
        const cleanCep = cepValue.replace(/\D/g, '');
        if (cleanCep.length !== 8) return;

        setIsSearching(true);
        try {
            const viaCepRes = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const addressData = await viaCepRes.json();

            if (addressData.erro) {
                alert("CEP no encontrado");
                setIsSearching(false);
                return;
            }

            const fullAddress = `${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade}`;

            const searchQuery = encodeURIComponent(`${fullAddress}, Florianópolis, Brasil`);
            const nominatimRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
            const coordsData = await nominatimRes.json();

            setFormData(prev => ({
                ...prev,
                addressTo: fullAddress,
                cep: cleanCep,
                lat: coordsData.length > 0 ? parseFloat(coordsData[0].lat) : prev.lat,
                lng: coordsData.length > 0 ? parseFloat(coordsData[0].lon) : prev.lng
            }));
        } catch (error) {
            console.error("Error en la búsqueda:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSubmit(formData);
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Nueva Orden Manual</h3>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">Registro de pedido por CEP</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleAction} className="p-8 space-y-6">
                    <div className="space-y-4">

                        {/* ORIGEN */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Origen (Recogida)</label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                                <input
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-semibold text-sm"
                                    placeholder="Ej: Restaurante Central"
                                    value={formData.addressFrom}
                                    onChange={e => setFormData({ ...formData, addressFrom: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* CEP */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CEP Destino</label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-3.5 h-4 w-4 text-slate-300" />
                                    <input
                                        required
                                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-orange-500 transition-all font-mono text-sm"
                                        placeholder="88010-000"
                                        value={formData.cep}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setFormData({ ...formData, cep: val });
                                            if (val.replace(/\D/g, '').length === 8) handleCepSearch(val);
                                        }}
                                    />
                                    {isSearching && <Loader2 className="absolute right-4 top-4 h-4 w-4 animate-spin text-orange-500" />}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ciudad</label>
                                <div className="w-full px-4 py-3.5 bg-slate-100 border border-slate-100 rounded-2xl text-slate-500 font-bold text-sm">
                                    Florianópolis
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección de Entrega</label>
                            <div className="relative">
                                <Navigation className="absolute left-4 top-3.5 h-5 w-5 text-slate-300" />
                                <input
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-semibold text-sm"
                                    placeholder="Se llenará al poner el CEP"
                                    value={formData.addressTo}
                                    onChange={e => setFormData({ ...formData, addressTo: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 opacity-60">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Latitud Auto</label>
                                <input readOnly className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-[10px]" value={formData.lat} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Longitud Auto</label>
                                <input readOnly className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-[10px]" value={formData.lng} />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || isSearching}
                        className="w-full py-4 bg-slate-900 hover:bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Confirmar y Crear'}
                    </button>
                </form>
            </div>
        </div>
    );
}