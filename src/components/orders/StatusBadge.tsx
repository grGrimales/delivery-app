import { OrderStatus } from '@/types';

export function StatusBadge({ status }: { status: OrderStatus }) {
  const styles = {
    PREPARING: 'bg-amber-100 text-amber-800 border-amber-200',
    ON_WAY: 'bg-blue-100 text-blue-800 border-blue-200',
    DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  const labels = {
    PREPARING: 'Preparando',
    ON_WAY: 'En Camino',
    DELIVERED: 'Entregado',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
