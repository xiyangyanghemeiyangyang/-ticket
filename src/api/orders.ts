import type { OrderItem } from '../types/order';
import { adjustSeatRemaining } from './trains';

const STORAGE_KEY = 'app_orders';

function readOrders(): Record<string, OrderItem> {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function writeOrders(map: Record<string, OrderItem>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

function generateId(): string {
  return 'o_' + Math.random().toString(36).slice(2, 10);
}

export async function createOrder(input: Omit<OrderItem, 'id' | 'status' | 'createdAt'>): Promise<OrderItem> {
  const id = generateId();
  const order: OrderItem = {
    ...input,
    id,
    status: '未支付',
    createdAt: new Date().toISOString(),
  };
  const map = readOrders();
  map[id] = order;
  writeOrders(map);
  return order;
}

export async function payOrder(id: string): Promise<OrderItem> {
  const map = readOrders();
  const order = map[id];
  if (!order) throw new Error('订单不存在');
  order.status = '已支付';
  map[id] = order;
  writeOrders(map);
  // lock inventory: reduce remaining by passenger count
  await adjustSeatRemaining(order.trainId, order.seatClass as any, -order.passengerIds.length);
  return order;
}

export async function cancelOrder(id: string): Promise<OrderItem> {
  const map = readOrders();
  const order = map[id];
  if (!order) throw new Error('订单不存在');
  order.status = '已取消';
  map[id] = order;
  writeOrders(map);
  return order;
}

export async function refundOrder(id: string): Promise<OrderItem> {
  const map = readOrders();
  const order = map[id];
  if (!order) throw new Error('订单不存在');
  if (order.status !== '已支付') throw new Error('仅已支付订单可退票');
  // return inventory
  await adjustSeatRemaining(order.trainId, order.seatClass as any, order.passengerIds.length);
  order.status = '已取消';
  map[id] = order;
  writeOrders(map);
  return order;
}

export async function rescheduleOrder(id: string, params: { targetTrainId: string; targetTrainNo: string }): Promise<OrderItem> {
  // refund current
  const refunded = await refundOrder(id);
  // create a new unpaid order with same passengers/seatClass and target train
  const newOrder = await createOrder({
    trainId: params.targetTrainId,
    trainNo: params.targetTrainNo,
    seatClass: refunded.seatClass,
    passengerIds: refunded.passengerIds,
    totalPrice: refunded.totalPrice,
  });
  return newOrder;
}

export async function listOrders(): Promise<OrderItem[]> {
  const map = readOrders();
  return Object.values(map).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}


