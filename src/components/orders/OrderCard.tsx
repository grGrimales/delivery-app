import { Order } from '@/types';
import { StatusBadge } from './StatusBadge';

interface OrderCardProps {
  order: Order;
  onClick?: (orderId: string) => void;
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  return (
    <div 
      className={`p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        onClick ? 'active:scale-[0.98]' : ''
      }`}
      onClick={() => onClick?.(order.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-900">Pedido #{order.id.slice(0, 8)}</h3>
        <StatusBadge status={order.status} />
      </div>
      
      <div className="space-y-1 text-sm text-gray-600">
        <p><span className="font-medium">Cliente:</span> {order.customerName}</p>
        <p><span className="font-medium">Dirección:</span> {order.address}</p>
        <p className="text-xs text-gray-400 mt-2">
          {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
