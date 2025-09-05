import type { Passenger } from '../types/order';

const STORAGE_KEY = 'app_passengers';

function readPassengers(): Record<string, Passenger> {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function writePassengers(map: Record<string, Passenger>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

function generateId(): string {
  return 'p_' + Math.random().toString(36).slice(2, 10);
}

export async function listPassengers(): Promise<Passenger[]> {
  const map = readPassengers();
  return Object.values(map);
}

export async function addPassenger(input: { name: string; identityNumber: string }): Promise<Passenger> {
  const id = generateId();
  const map = readPassengers();
  const passenger: Passenger = { id, name: input.name, identityNumber: input.identityNumber };
  map[id] = passenger;
  writePassengers(map);
  return passenger;
}

export async function removePassenger(id: string): Promise<void> {
  const map = readPassengers();
  delete map[id];
  writePassengers(map);
}


