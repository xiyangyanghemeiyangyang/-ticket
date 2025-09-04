import type { TrainDetail, TrainItem, SeatAvailability, SeatClass, StationStop } from '../types/train';

const MOCK_TRAINS: TrainDetail[] = [
  {
    id: 't_g101',
    trainNo: 'G101',
    fromStation: '北京南',
    toStation: '上海虹桥',
    departureTime: '07:00',
    arrivalTime: '12:38',
    duration: '5:38',
    stops: [
      { code: 'BJN', name: '北京南', arrivalTime: '-', departureTime: '07:00' },
      { code: 'TJ', name: '天津南', arrivalTime: '07:33', departureTime: '07:36' },
      { code: 'JN', name: '济南西', arrivalTime: '08:48', departureTime: '08:51' },
      { code: 'XUZ', name: '徐州东', arrivalTime: '10:02', departureTime: '10:05' },
      { code: 'BZH', name: '蚌埠南', arrivalTime: '10:36', departureTime: '10:38' },
      { code: 'NJN', name: '南京南', arrivalTime: '11:20', departureTime: '11:23' },
      { code: 'SUZ', name: '苏州北', arrivalTime: '12:10', departureTime: '12:12' },
      { code: 'SHHQ', name: '上海虹桥', arrivalTime: '12:38', departureTime: '-' },
    ],
    seats: [
      { className: '商务座', remaining: 5, price: 1748 },
      { className: '一等座', remaining: 21, price: 933 },
      { className: '二等座', remaining: 64, price: 553 },
      { className: '无座', remaining: 0, price: 553 },
    ],
  },
  {
    id: 't_z19',
    trainNo: 'Z19',
    fromStation: '北京',
    toStation: '西安',
    departureTime: '20:40',
    arrivalTime: '07:57',
    duration: '11:17',
    stops: [
      { code: 'BJ', name: '北京', arrivalTime: '-', departureTime: '20:40' },
      { code: 'SJZ', name: '石家庄', arrivalTime: '23:05', departureTime: '23:21' },
      { code: 'TY', name: '太原', arrivalTime: '01:18', departureTime: '01:35' },
      { code: 'HBY', name: '韩城', arrivalTime: '05:46', departureTime: '05:48' },
      { code: 'XA', name: '西安', arrivalTime: '07:57', departureTime: '-' },
    ],
    seats: [
      { className: '硬座', remaining: 112, price: 156 },
      { className: '硬卧', remaining: 37, price: 268 },
      { className: '无座', remaining: 18, price: 156 },
    ],
  },
];

export async function listTrains(): Promise<TrainItem[]> {
  return MOCK_TRAINS.map(({ stops, seats, ...item }) => item);
}

export async function getTrainDetail(id: string): Promise<TrainDetail | null> {
  const found = MOCK_TRAINS.find((t) => t.id === id) || null;
  return found ? JSON.parse(JSON.stringify(found)) : null; // deep clone to avoid accidental mutation
}

export async function getAllTrainDetails(): Promise<TrainDetail[]> {
  return JSON.parse(JSON.stringify(MOCK_TRAINS));
}


