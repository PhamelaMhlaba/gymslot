import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GymService } from '../services/gymService.js';
import type { GymRepository } from '../services/gymRepository.js';
import type { Gym, Booking } from '../types/domain.js';

function makeGym(overrides: Partial<Gym> = {}): Gym {
  return {
    id: 'gym-001',
    name: 'Test Gym',
    capacity: 10,
    currentBookings: 5,
    version: 1,
    ...overrides,
  };
}

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'booking-abc',
    gymId: 'gym-001',
    userId: 'user-1',
    slotTime: '2025-01-20T18:00:00Z',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeMockRepo(overrides: Partial<GymRepository> = {}): GymRepository {
  return {
    findGymById: vi.fn().mockResolvedValue(makeGym()),
    incrementBookingsIfAvailable: vi.fn().mockResolvedValue(true),
    createBooking: vi.fn().mockResolvedValue(makeBooking()),
    findExistingBooking: vi.fn().mockResolvedValue(null),
    ...overrides,
  };
}

describe('GymService.getCapacity', () => {
  it('returns correct percentage and available=true when under capacity', async () => {
    const repo = makeMockRepo({
      findGymById: vi.fn().mockResolvedValue(makeGym({ currentBookings: 5, capacity: 10 })),
    });
    const service = new GymService(repo);
    const result = await service.getCapacity('gym-001');

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.percentageFull).toBe(50);
    expect(result.data.available).toBe(true);
  });

  it('returns available=false when at full capacity', async () => {
    const repo = makeMockRepo({
      findGymById: vi.fn().mockResolvedValue(makeGym({ currentBookings: 10, capacity: 10 })),
    });
    const service = new GymService(repo);
    const result = await service.getCapacity('gym-001');

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.percentageFull).toBe(100);
    expect(result.data.available).toBe(false);
  });

  it('returns GYM_NOT_FOUND when gym does not exist', async () => {
    const repo = makeMockRepo({
      findGymById: vi.fn().mockResolvedValue(null),
    });
    const service = new GymService(repo);
    const result = await service.getCapacity('ghost-gym');

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('GYM_NOT_FOUND');
  });
});

describe('GymService.bookSlot', () => {
  const validRequest = { userId: 'user-1', slotTime: '2025-01-20T18:00:00Z' };

  it('successfully books a slot when gym has availability', async () => {
    const repo = makeMockRepo();
    const service = new GymService(repo);
    const result = await service.bookSlot('gym-001', validRequest);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.bookingId).toBeDefined();
    expect(result.data.gymId).toBe('gym-001');
  });

  it('rejects booking when gym is at full capacity', async () => {
    const repo = makeMockRepo({
      findGymById: vi.fn().mockResolvedValue(
        makeGym({ currentBookings: 10, capacity: 10 }),
      ),
    });
    const service = new GymService(repo);
    const result = await service.bookSlot('gym-001', validRequest);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('GYM_AT_CAPACITY');
  });

  it('rejects duplicate bookings for same user/gym/slot', async () => {
    const repo = makeMockRepo({
      findExistingBooking: vi.fn().mockResolvedValue(makeBooking()),
    });
    const service = new GymService(repo);
    const result = await service.bookSlot('gym-001', validRequest);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('DUPLICATE_BOOKING');
  });

  it('returns GYM_NOT_FOUND when gym does not exist', async () => {
    const repo = makeMockRepo({
      findGymById: vi.fn().mockResolvedValue(null),
    });
    const service = new GymService(repo);
    const result = await service.bookSlot('ghost-gym', validRequest);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('GYM_NOT_FOUND');
  });

  it('retries when optimistic lock fails once then succeeds', async () => {
    const incrementSpy = vi.fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    const repo = makeMockRepo({
      incrementBookingsIfAvailable: incrementSpy,
    });
    const service = new GymService(repo);
    const result = await service.bookSlot('gym-001', validRequest);

    expect(result.success).toBe(true);
    expect(incrementSpy).toHaveBeenCalledTimes(2);
  });

  it('returns BOOKING_CONFLICT when all retries are exhausted', async () => {
    const repo = makeMockRepo({
      incrementBookingsIfAvailable: vi.fn().mockResolvedValue(false),
    });
    const service = new GymService(repo);
    const result = await service.bookSlot('gym-001', validRequest);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('BOOKING_CONFLICT');
  });
});