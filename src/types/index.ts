export type OrderStatus = 'PREPARING' | 'ON_WAY' | 'DELIVERED';

export interface User {
  id: string;
  name: string;
  role: 'ADMIN' | 'DRIVER' | 'CUSTOMER';
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  customerName: string;
  address: string;
  driverId?: string;
  currentLocation?: Location;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  text: string;
  timestamp: string;
}
