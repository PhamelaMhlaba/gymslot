"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const sensible_1 = __importDefault(require("@fastify/sensible"));
const gymRepository_js_1 = require("./services/gymRepository.js");
const gymService_js_1 = require("./services/gymService.js");
const gymRoutes_js_1 = require("./routes/gymRoutes.js");
async function buildApp() {
    const app = (0, fastify_1.default)({
        logger: {
            level: process.env.LOG_LEVEL ?? 'info',
        },
    });
    await app.register(sensible_1.default);
    const repo = new gymRepository_js_1.InMemoryGymRepository();
    const gymService = new gymService_js_1.GymService(repo);
    await app.register(gymRoutes_js_1.gymRoutes, { gymService });
    app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));
    return app;
}
//# sourceMappingURL=app.js.map