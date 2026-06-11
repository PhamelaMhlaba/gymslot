import { useState, useEffect, useCallback } from 'react';
import { gymApi } from '../api/gymApi.js';
import type { AsyncState, CapacityData, BookingData } from '../types/gym.js';

interface UseGymCapacityReturn {
  capacityState: AsyncState<CapacityData>;
  bookingState: AsyncState<BookingData>;
  refresh: () => void;
  bookSlot: (userId: string, slotTime: string) => Promise<void>;
}

export function useGymCapacity(gymId: string): UseGymCapacityReturn {
  const [capacityState, setCapacityState] = useState<AsyncState<CapacityData>>({
    status: 'idle',
  });
  const [bookingState, setBookingState] = useState<AsyncState<BookingData>>({
    status: 'idle',
  });

  const fetchCapacity = useCallback(async () => {
    setCapacityState({ status: 'loading' });
    try {
      const data = await gymApi.getCapacity(gymId);
      setCapacityState({ status: 'success', data });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load capacity.';
      setCapacityState({ status: 'error', message });
    }
  }, [gymId]);

  useEffect(() => {
    fetchCapacity();
    const interval = setInterval(fetchCapacity, 30_000);
    return () => clearInterval(interval);
  }, [fetchCapacity]);

  const bookSlot = useCallback(
    async (userId: string, slotTime: string) => {
      setBookingState({ status: 'loading' });
      try {
        const data = await gymApi.bookSlot(gymId, userId, slotTime);
        setBookingState({ status: 'success', data });
        await fetchCapacity();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Booking failed. Please try again.';
        setBookingState({ status: 'error', message });
      }
    },
    [gymId, fetchCapacity],
  );

  return {
    capacityState,
    bookingState,
    refresh: fetchCapacity,
    bookSlot,
  };
}