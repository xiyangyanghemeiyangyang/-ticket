export type SeatClass =
  | '硬座'
  | '硬卧'
  | '一等座'
  | '二等座'
  | '商务座'
  | '无座';

export interface SeatAvailability {
  className: SeatClass;
  remaining: number;
}

export interface StationStop {
  code: string;
  name: string;
  arrivalTime: string; // HH:mm
  departureTime: string; // HH:mm
}

export interface TrainItem {
  id: string;
  trainNo: string;
  fromStation: string;
  toStation: string;
  departureTime: string; // HH:mm
  arrivalTime: string; // HH:mm
  duration: string; // e.g., 5:32
}

export interface TrainDetail extends TrainItem {
  stops: StationStop[];
  seats: SeatAvailability[];
}

