"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryGymRepository = void 0;
const crypto_1 = require("crypto");
class InMemoryGymRepository {
    gyms;
    bookings;
    constructor() {
        this.gyms = new Map([
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
        this.bookings = new Map();
    }
    async findGymById(gymId) {
        return this.gyms.get(gymId) ?? null;
    }
    async incrementBookingsIfAvailable(gymId, expectedVersion) {
        const gym = this.gyms.get(gymId);
        if (!gym)
            return false;
        if (gym.version !== expectedVersion)
            return false;
        if (gym.currentBookings >= gym.capacity)
            return false;
        this.gyms.set(gymId, {
            ...gym,
            currentBookings: gym.currentBookings + 1,
            version: gym.version + 1,
        });
        return true;
    }
    async createBooking(bookingData) {
        const booking = {
            ...bookingData,
            id: (0, crypto_1.randomUUID)(),
            createdAt: new Date().toISOString(),
        };
        this.bookings.set(booking.id, booking);
        return booking;
    }
    async findExistingBooking(gymId, userId, slotTime) {
        for (const booking of this.bookings.values()) {
            if (booking.gymId === gymId &&
                booking.userId === userId &&
                booking.slotTime === slotTime) {
                return booking;
            }
        }
        return null;
    }
}
exports.InMemoryGymRepository = InMemoryGymRepository;
//# sourceMappingURL=gymRepository.js.map