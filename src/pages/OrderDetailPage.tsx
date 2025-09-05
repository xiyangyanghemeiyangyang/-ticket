import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cancelOrder, listOrders, payOrder, refundOrder, rescheduleOrder } from '../api/orders';
import { getAllTrainDetails } from '../api/trains';
import type { OrderItem } from '../types/order';
import type { TrainDetail } from '../types/train';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderItem | null>(null);
  const [trains, setTrains] = useState<TrainDetail[]>([]);
  const [targetTrainId, setTargetTrainId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const all = await listOrders();
      const o = all.find((x) => x.id === id) || null;
      setOrder(o);
      const ts = await getAllTrainDetails();
      setTrains(ts);
    })();
  }, [id]);

  const canRefund = useMemo(() => order?.status === '已支付', [order]);
  const canPay = useMemo(() => order?.status === '未支付', [order]);
  const canReschedule = useMemo(() => order?.status === '已支付', [order]);

  if (!order) return <div className="text-sm text-gray-600">订单不存在</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-md shadow-subtle p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">订单详情</h2>
        </div>
        <div className="text-sm mt-2">
          <div>订单号：{order.id}</div>
          <div>车次：{order.trainNo} · {order.seatClass}</div>
          <div>人数：{order.passengerIds.length} · 金额：¥{order.totalPrice}</div>
          <div>状态：{order.status}</div>
          <div>下单时间：{new Date(order.createdAt).toLocaleString()}</div>
        </div>
        <div className="mt-3 flex gap-2">
          {canPay && (
            <button className="bg-primary text-white rounded-md px-3 py-2" onClick={async () => {
              setLoading(true);
              try {
                const o = await payOrder(order.id);
                setOrder(o);
              } finally {
                setLoading(false);
              }
            }}>支付</button>
          )}
          {canRefund && (
            <button className="border border-primary text-primary rounded-md px-3 py-2" onClick={async () => {
              setLoading(true);
              try {
                const o = await refundOrder(order.id);
                setOrder(o);
                alert('退票成功');
              } finally {
                setLoading(false);
              }
            }}>退票</button>
          )}
        </div>
      </div>

      {canReschedule && (
        <div className="bg-white rounded-md shadow-subtle p-4">
          <h3 className="font-semibold mb-3">改签到其他车次</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select className="border rounded-md px-3 py-2" value={targetTrainId} onChange={(e) => setTargetTrainId(e.target.value)}>
              <option value="">请选择目标车次</option>
              {trains.filter((t) => t.id !== order.trainId).map((t) => (
                <option key={t.id} value={t.id}>{t.trainNo} · {t.fromStation}→{t.toStation}</option>
              ))}
            </select>
            <button
              className="bg-primary text-white rounded-md px-3 py-2 disabled:opacity-60"
              disabled={!targetTrainId || loading}
              onClick={async () => {
                setLoading(true);
                try {
                  const t = trains.find((x) => x.id === targetTrainId);
                  if (!t) return;
                  const newOrder = await rescheduleOrder(order.id, { targetTrainId: t.id, targetTrainNo: t.trainNo });
                  alert('改签成功，已生成新订单');
                  navigate(`/orders/${newOrder.id}`);
                } finally {
                  setLoading(false);
                }
              }}
            >改签</button>
          </div>
        </div>
      )}
    </div>
  );
}


