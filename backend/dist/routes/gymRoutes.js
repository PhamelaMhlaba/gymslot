"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gymRoutes = gymRoutes;
const gymParamsSchema = {
    type: 'object',
    required: ['id'],
    properties: {
        id: { type: 'string', minLength: 1 },
    },
};
const bookSlotBodySchema = {
    type: 'object',
    required: ['userId', 'slotTime'],
    properties: {
        userId: { type: 'string', minLength: 1 },
        slotTime: { type: 'string', format: 'date-time' },
    },
    additionalProperties: false,
};
async function gymRoutes(fastify, options) {
    const { gymService } = options;
    fastify.get('/gyms/:id/capacity', { schema: { params: gymParamsSchema } }, async (request, reply) => {
        const result = await gymService.getCapacity(request.params.id);
        if (!result.success) {
            if (result.error.code === 'GYM_NOT_FOUND') {
                return reply.status(404).send({ message: 'Gym not found.' });
            }
            return reply.status(500).send({ message: 'Internal server error.' });
        }
        return reply.status(200).send(result.data);
    });
    fastify.post('/gyms/:id/book', { schema: { params: gymParamsSchema, body: bookSlotBodySchema } }, async (request, reply) => {
        const result = await gymService.bookSlot(request.params.id, request.body);
        if (!result.success) {
            switch (result.error.code) {
                case 'GYM_NOT_FOUND':
                    return reply.status(404).send({ message: 'Gym not found.' });
                case 'GYM_AT_CAPACITY':
                    return reply.status(409).send({ message: 'Gym is at full capacity for this slot.' });
                case 'DUPLICATE_BOOKING':
                    return reply.status(409).send({ message: 'You already have a booking for this slot.' });
                case 'BOOKING_CONFLICT':
                    return reply.status(409).send({ message: result.error.message });
                default:
                    return reply.status(500).send({ message: 'Internal server error.' });
            }
        }
        return reply.status(201).send(result.data);
    });
}
//# sourceMappingURL=gymRoutes.js.map