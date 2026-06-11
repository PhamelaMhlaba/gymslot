export interface CapacityData {
  gymId: string;
  gymName: string;
  capacity: number;
  currentBookings: number;
  percentageFull: number;
  available: boolean;
}

export interface BookingData {
  bookingId: string;
  gymId: string;
  userId: string;
  slotTime: string;
  message: string;
}

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

export type CapacityLevel = 'low' | 'medium' | 'high' | 'full';

export interface CapacityThreshold {
  level: CapacityLevel;
  label: string;
  color: string;
  ringColor: string;
}