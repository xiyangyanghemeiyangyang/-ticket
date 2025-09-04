import { getAllTrainDetails } from './trains';
import type { TrainDetail, TrainItem } from '../types/train';

export interface TicketQuery {
  from: string;
  to: string;
  date: string; // YYYY-MM-DD (模拟用途)
  sortBy?: 'time' | 'duration' | 'price';
}

export interface TicketResult extends TrainItem {
  minPrice: number;
  seatsSummary: string; // e.g. "二等座:64 一等座:21"
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map((v) => parseInt(v, 10));
  return h * 60 + m;
}

function durationToMinutes(dur: string): number {
  const [h, m] = dur.split(':').map((v) => parseInt(v, 10));
  return h * 60 + m;
}

export async function searchTickets(query: TicketQuery): Promise<TicketResult[]> {
  const all = await getAllTrainDetails();

  const filtered = all.filter((t) => {
    const fromOk = t.fromStation.includes(query.from);
    const toOk = t.toStation.includes(query.to);
    // 日期在模拟数据中不影响可用性，这里仅做占位过滤（始终通过）
    const dateOk = Boolean(query.date);
    return fromOk && toOk && dateOk;
  });

  const mapped: TicketResult[] = filtered.map((t) => {
    const minPrice = Math.min(...t.seats.map((s) => s.price ?? Infinity));
    const seatsSummary = t.seats.map((s) => `${s.className}:${s.remaining}`).join('  ');
    const { stops, seats, ...item } = t;
    return { ...item, minPrice, seatsSummary };
  });

  switch (query.sortBy) {
    case 'time':
      return mapped.sort((a, b) => toMinutes(a.departureTime) - toMinutes(b.departureTime));
    case 'duration':
      return mapped.sort((a, b) => durationToMinutes(a.duration) - durationToMinutes(b.duration));
    case 'price':
      return mapped.sort((a, b) => a.minPrice - b.minPrice);
    default:
      return mapped;
  }
}


