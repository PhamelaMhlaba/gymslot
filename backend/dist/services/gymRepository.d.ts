import type { Gym, Booking } from '../types/domain.js';
export interface GymRepository {
    findGymById(gymId: string): Promise<Gym | null>;
    incrementBookingsIfAvailable(gymId: string, expectedVersion: number): Promise<boolean>;
    createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking>;
    findExistingBooking(gymId: string, userId: string, slotTime: string): Promise<Booking | null>;
}
export declare class InMemoryGymRepository implements GymRepository {
    private gyms;
    private bookings;
    constructor();
    findGymById(gymId: string): Promise<Gym | null>;
    incrementBookingsIfAvailable(gymId: string, expectedVersion: number): Promise<boolean>;
    createBooking(bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking>;
    findExistingBooking(gymId: string, userId: string, slotTime: string): Promise<Booking | null>;
}
//# sourceMappingURL=gymRepository.d.ts.map