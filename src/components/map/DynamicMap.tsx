import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('./DeliveryMap'), {
    ssr: false,
    loading: () => (
        <div
            style={{ height: '400px', borderRadius: '12px' }}
            className="bg-surface-800 flex items-center justify-center"
        >
            <p className="text-white opacity-30 text-sm">Cargando mapa...</p>
        </div>
    ),
});

export default DynamicMap;