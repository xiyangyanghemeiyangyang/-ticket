import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTrainDetail } from '../api/trains';
import type { TrainDetail } from '../types/train';
import { listPassengers } from '../api/passengers';
import { createOrder, payOrder } from '../api/orders';
import type { Passenger } from '../types/order';

export default function TrainDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<TrainDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [selectedPassengerIds, setSelectedPassengerIds] = useState<string[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [placing, setPlacing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        const d = await getTrainDetail(id);
        setDetail(d);
        const ps = await listPassengers();
        setPassengers(ps);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const seatSummary = useMemo(() => {
    if (!detail) return '';
    return detail.seats.map((s) => `${s.className}:${s.remaining}`).join('  ');
  }, [detail]);

  if (loading) return <div className="text-sm text-gray-600">加载中...</div>;
  if (!detail) return <div className="text-sm text-gray-600">未找到该车次</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">车次详情 {detail.trainNo}</h2>
      </div>
      <div className="bg-white rounded-md shadow-subtle p-4">
        <div className="text-sm text-gray-700">
          <div className="font-medium">{detail.trainNo}</div>
          <div className="mt-1">{detail.fromStation} {detail.departureTime} → {detail.toStation} {detail.arrivalTime}（历时 {detail.duration}）</div>
        </div>
        <div className="mt-4">
          <div className="text-sm text-gray-500 mb-1">席别余量</div>
          <div className="text-sm">{seatSummary}</div>
        </div>
      </div>
      <div className="bg-white rounded-md shadow-subtle p-4">
        <h3 className="font-semibold mb-3">购买车票</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">选择席别</label>
            <select className="w-full border rounded-md px-3 py-2" value={selectedSeat} onChange={(e) => setSelectedSeat(e.target.value)}>
              <option value="">请选择</option>
              {detail.seats.map((s) => (
                <option key={s.className} value={s.className}>{s.className}（余 {s.remaining}{s.price ? ` / ¥${s.price}` : ''}）</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">选择乘车人</label>
            {passengers.length === 0 ? (
              <div className="text-sm text-gray-600">暂无乘车人，请先在个人中心添加</div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {passengers.map((p) => (
                  <label key={p.id} className="border rounded-md px-3 py-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedPassengerIds.includes(p.id)}
                      onChange={(e) => {
                        setSelectedPassengerIds((prev) =>
                          e.target.checked ? [...prev, p.id] : prev.filter((id0) => id0 !== p.id)
                        );
                      }}
                    />
                    <span className="text-sm">{p.name}（{p.identityNumber}）</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            className="bg-primary text-white rounded-md px-4 py-2 disabled:opacity-60"
            disabled={!selectedSeat || selectedPassengerIds.length === 0 || placing}
            onClick={async () => {
              if (!detail) return;
              setPlacing(true);
              try {
                const seat = detail.seats.find((s) => s.className === selectedSeat);
                const unit = seat?.price ?? 0;
                const total = unit * selectedPassengerIds.length;
                const order = await createOrder({
                  trainId: detail.id,
                  trainNo: detail.trainNo,
                  seatClass: selectedSeat as any,
                  passengerIds: selectedPassengerIds,
                  totalPrice: total,
                });
                setOrderId(order.id);
              } finally {
                setPlacing(false);
              }
            }}
          >
            生成订单
          </button>
          {orderId && (
            <button
              className="border border-primary text-primary rounded-md px-4 py-2 disabled:opacity-60"
              disabled={paying}
              onClick={async () => {
                setPaying(true);
                try {
                  await payOrder(orderId);
                  alert('支付成功');
                } finally {
                  setPaying(false);
                }
              }}
            >
              支付
            </button>
          )}
        </div>
      </div>
      <div className="bg-white rounded-md shadow-subtle p-4">
        <div className="text-sm text-gray-500 mb-1">经停站</div>
        <div className="border rounded-md divide-y">
          {detail.stops.map((s) => (
            <div key={s.code} className="px-3 py-2 text-sm flex items-center justify-between">
              <div className="font-medium">{s.name}</div>
              <div className="text-gray-600">到 {s.arrivalTime} · 发 {s.departureTime}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


