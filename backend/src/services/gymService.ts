import type { GymRepository } from './gymRepository';
import type { CapacityResponse, BookSlotRequest, BookSlotResponse } from '../types/domain';

export type Result<T, E = BookingError> =
  | { success: true; data: T }
  | { success: false; error: E };

export type BookingError =
  | { code: 'GYM_NOT_FOUND' }
  | { code: 'GYM_AT_CAPACITY' }
  | { code: 'DUPLICATE_BOOKING' }
  | { code: 'BOOKING_CONFLICT'; message: string };

const MAX_RETRIES = 3;

export class GymService {
  constructor(private readonly repo: GymRepository) {}

  async getCapacity(gymId: string): Promise<Result<CapacityResponse>> {
    const gym = await this.repo.findGymById(gymId);
    if (!gym) {
      return { success: false, error: { code: 'GYM_NOT_FOUND' } };
    }

    const percentageFull = Math.round((gym.currentBookings / gym.capacity) * 100);

    return {
      success: true,
      data: {
        gymId: gym.id,
        gymName: gym.name,
        capacity: gym.capacity,
        currentBookings: gym.currentBookings,
        percentageFull,
        available: gym.currentBookings < gym.capacity,
      },
    };
  }

  async bookSlot(gymId: string, request: BookSlotRequest): Promise<Result<BookSlotResponse>> {
    const { userId, slotTime } = request;

    const existing = await this.repo.findExistingBooking(gymId, userId, slotTime);
    if (existing) {
      return { success: false, error: { code: 'DUPLICATE_BOOKING' } };
    }

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const gym = await this.repo.findGymById(gymId);
      if (!gym) {
        return { success: false, error: { code: 'GYM_NOT_FOUND' } };
      }

      if (gym.currentBookings >= gym.capacity) {
        return { success: false, error: { code: 'GYM_AT_CAPACITY' } };
      }

      const committed = await this.repo.incrementBookingsIfAvailable(gymId, gym.version);

      if (committed) {
        const booking = await this.repo.createBooking({ gymId, userId, slotTime });
        return {
          success: true,
          data: {
            bookingId: booking.id,
            gymId,
            userId,
            slotTime,
            message: 'Slot booked successfully.',
          },
        };
      }
    }

    const errorMessage = 'Could not secure booking after ' + MAX_RETRIES + ' attempts. Please retry.';

    return {
      success: false,
      error: {
        code: 'BOOKING_CONFLICT',
        message: errorMessage,
      },
    };
  }
}
