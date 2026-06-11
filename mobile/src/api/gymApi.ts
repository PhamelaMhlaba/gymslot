import type { CapacityData, BookingData } from '../types/gym.js';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(
      (body as { message?: string }).message ?? 'Request failed',
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

export const gymApi = {
  getCapacity: (gymId: string): Promise<CapacityData> =>
    request<CapacityData>(`/gyms/${gymId}/capacity`),

  bookSlot: (
    gymId: string,
    userId: string,
    slotTime: string,
  ): Promise<BookingData> =>
    request<BookingData>(`/gyms/${gymId}/book`, {
      method: 'POST',
      body: JSON.stringify({ userId, slotTime }),
    }),
};