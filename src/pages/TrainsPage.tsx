import { useEffect, useMemo, useState } from 'react';
import { listTrains, getTrainDetail } from '../api/trains';
import type { TrainItem, TrainDetail } from '../types/train';

export default function TrainsPage() {
  const [trains, setTrains] = useState<TrainItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TrainDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await listTrains();
      setTrains(list);
      if (list.length > 0) setSelectedId(list[0].id);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!selectedId) return;
      setLoading(true);
      try {
        const d = await getTrainDetail(selectedId);
        setDetail(d);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedId]);

  const seatSummary = useMemo(() => {
    if (!detail) return '';
    return detail.seats.map((s) => `${s.className}:${s.remaining}`).join('  ');
  }, [detail]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="bg-white rounded-md shadow-subtle p-4">
        <h2 className="font-semibold mb-3">车次列表</h2>
        <div className="divide-y">
          {trains.map((t) => (
            <button
              key={t.id}
              className={`w-full text-left py-3 px-2 hover:bg-grayNeutral rounded ${selectedId === t.id ? 'bg-grayNeutral' : ''}`}
              onClick={() => setSelectedId(t.id)}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{t.trainNo}</div>
                <div className="text-xs text-gray-500">历时 {t.duration}</div>
              </div>
              <div className="text-sm text-gray-700 mt-1">
                {t.fromStation} {t.departureTime} → {t.toStation} {t.arrivalTime}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-md shadow-subtle p-4">
        <h2 className="font-semibold mb-3">车次详情</h2>
        {!detail ? (
          <div className="text-sm text-gray-600">{loading ? '加载中...' : '请选择车次'}</div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-700">
              <div className="font-medium">{detail.trainNo}</div>
              <div className="mt-1">{detail.fromStation} {detail.departureTime} → {detail.toStation} {detail.arrivalTime}（历时 {detail.duration}）</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">席别余量</div>
              <div className="text-sm">{seatSummary}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">经停站</div>
              <div className="border rounded-md divide-y">
                {detail.stops.map((s) => (
                  <div key={s.code} className="px-3 py-2 text-sm flex items-center justify-between">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-gray-600">
                      到 {s.arrivalTime} · 发 {s.departureTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


