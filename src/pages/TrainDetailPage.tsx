import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTrainDetail } from '../api/trains';
import type { TrainDetail } from '../types/train';

export default function TrainDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<TrainDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        const d = await getTrainDetail(id);
        setDetail(d);
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


