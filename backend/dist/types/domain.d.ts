export interface Gym {
    id: string;
    name: string;
    capacity: number;
    currentBookings: number;
    version: number;
}
export interface Booking {
    id: string;
    gymId: string;
    userId: string;
    slotTime: string;
    createdAt: string;
}
export interface CapacityResponse {
    gymId: string;
    gymName: string;
    capacity: number;
    currentBookings: number;
    percentageFull: number;
    available: boolean;
}
export interface BookSlotRequest {
    userId: string;
    slotTime: string;
}
export interface BookSlotResponse {
    bookingId: string;
    gymId: string;
    userId: string;
    slotTime: string;
    message: string;
}
export interface ApiError {
    statusCode: number;
    error: string;
    message: string;
}
//# sourceMappingURL=domain.d.ts.map