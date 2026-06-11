import type { GymRepository } from './gymRepository.js';
import type { CapacityResponse, BookSlotRequest, BookSlotResponse } from '../types/domain.js';
export type Result<T, E = BookingError> = {
    success: true;
    data: T;
} | {
    success: false;
    error: E;
};
export type BookingError = {
    code: 'GYM_NOT_FOUND';
} | {
    code: 'GYM_AT_CAPACITY';
} | {
    code: 'DUPLICATE_BOOKING';
} | {
    code: 'BOOKING_CONFLICT';
    message: string;
};
export declare class GymService {
    private readonly repo;
    constructor(repo: GymRepository);
    getCapacity(gymId: string): Promise<Result<CapacityResponse>>;
    bookSlot(gymId: string, request: BookSlotRequest): Promise<Result<BookSlotResponse>>;
}
//# sourceMappingURL=gymService.d.ts.map