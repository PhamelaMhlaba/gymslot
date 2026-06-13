import { randomUUID } from 'crypto';
import type { Gym, Booking } from '../types/domain';

export interface GymRepository {
  findGymById(gymId: string): Promise<Gym | null>;
  incrementBookingsIfAvailable(gymId: string, expectedVersion: number): Promise<boolean>;
  createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking>;
  findExistingBooking(gymId: string, userId: string, slotTime: string): Promise<Booking | null>;
}

export class InMemoryGymRepository implements GymRepository {
  private gyms: Map<string, Gym>;
  private bookings: Map<string, Booking>;

  constructor() {
    this.gyms = new Map<string, Gym>([
      [
        'gym-001',
        {
          id: 'gym-001',
          name: 'FitZone City Centre',
          capacity: 50,
          currentBookings: 37,
          version: 1,
        },
      ],
      [
        'gym-002',
        {
          id: 'gym-002',
          name: 'IronHouse East',
          capacity: 30,
          currentBookings: 30,
          version: 1,
        },
      ],
    ]);
    this.bookings = new Map<string, Booking>();
  }

  async findGymById(gymId: string): Promise<Gym | null> {
    return this.gyms.get(gymId) ?? null;
  }

  async incrementBookingsIfAvailable(gymId: string, expectedVersion: number): Promise<boolean> {
    const gym = this.gyms.get(gymId);
    if (!gym) return false;
    if (gym.version !== expectedVersion) return false;
    if (gym.currentBookings >= gym.capacity) return false;

    this.gyms.set(gymId, {
      ...gym,
      currentBookings: gym.currentBookings + 1,
      version: gym.version + 1,
    });
    return true;
  }

  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    const booking: Booking = {
      ...bookingData,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.bookings.set(booking.id, booking);
    return booking;
  }

  async findExistingBooking(gymId: string, userId: string, slotTime: string): Promise<Booking | null> {
    for (const booking of this.bookings.values()) {
      if (booking.gymId === gymId && booking.userId === userId && booking.slotTime === slotTime) {
        return booking;
      }
    }
    return null;
  }
}
