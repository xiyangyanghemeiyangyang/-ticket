import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchTickets } from '../api/tickets';
import type { TicketResult } from '../api/tickets';
import { debounce } from '../utils/debounce';

export default function TicketSearchPage() {
  const [from, setFrom] = useState('北京');
  const [to, setTo] = useState('上海');
  const [date, setDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'time' | 'duration' | 'price' | undefined>('time');
  const [results, setResults] = useState<TicketResult[]>([]);
  const [loading, setLoading] = useState(false);

  const canSearch = useMemo(() => Boolean(from.trim()) && Boolean(to.trim()) && Boolean(date), [from, to, date]);

  const doSearch = async (params?: { from?: string; to?: string; date?: string; sortBy?: 'time' | 'duration' | 'price' }) => {
    if (!canSearch) return;
    setLoading(true);
    try {
      const data = await searchTickets({
        from: params?.from ?? from.trim(),
        to: params?.to ?? to.trim(),
        date: params?.date ?? date,
        sortBy: params?.sortBy ?? sortBy,
      });
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  // debounce auto search on input change
  useEffect(() => {
    const handler = debounce(() => {
      void doSearch();
    }, 400);
    handler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, date, sortBy]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-md shadow-subtle p-4">
        <h2 className="font-semibold mb-3">购票查询</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm mb-1">出发地</label>
            <input className="w-full border rounded-md px-3 py-2" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="如：北京" required />
          </div>
          <div>
            <label className="block text-sm mb-1">目的地</label>
            <input className="w-full border rounded-md px-3 py-2" value={to} onChange={(e) => setTo(e.target.value)} placeholder="如：上海" required />
          </div>
          <div>
            <label className="block text-sm mb-1">日期</label>
            <input type="date" className="w-full border rounded-md px-3 py-2" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">排序</label>
            <select className="w-full border rounded-md px-3 py-2" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="time">发车时间</option>
              <option value="duration">历时</option>
              <option value="price">票价</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <button disabled={!canSearch || loading} onClick={() => doSearch()} className="bg-primary text-white rounded-md px-4 py-2 disabled:opacity-60">{loading ? '查询中...' : '查询'}</button>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-subtle p-4">
        <h3 className="font-semibold mb-3">查询结果</h3>
        {results.length === 0 ? (
          <div className="text-sm text-gray-600">{loading ? '加载中...' : '暂无数据'}</div>
        ) : (
          <div className="divide-y">
            {results.map((r) => (
              <Link key={r.id} className="block py-3 hover:bg-grayNeutral rounded px-2" to={`/tickets/${r.id}`}>
                <div className="flex items-center justify-between">
                  <div className="font-medium">{r.trainNo}</div>
                  <div className="text-xs text-gray-500">最低价 ¥{r.minPrice}</div>
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  {r.fromStation} {r.departureTime} → {r.toStation} {r.arrivalTime}（历时 {r.duration}）
                </div>
                <div className="text-sm mt-1">{r.seatsSummary}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


