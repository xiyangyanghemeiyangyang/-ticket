import type { SeatClass } from './train';

export type OrderStatus = '未支付' | '已支付' | '已取消';

export interface Passenger {
  id: string;
  name: string;
  identityNumber: string;
}

export interface OrderItem {
  id: string;
  trainId: string;
  trainNo: string;
  seatClass: SeatClass;
  passengerIds: string[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

