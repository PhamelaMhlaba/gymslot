# GymSlot — Real-Time Gym Capacity & Booking

> Built for the Microsoft Senior Full-Stack Engineer Assessment

## Project Structure

```
gymslot/
backend/          # Fastify + TypeScript REST API
mobile/           # React Native (Expo) app
infra/            # AWS CDK infrastructure
README.md
```

---

## How to Run

### Backend

```bash
cd backend
npm install
npm run dev          # http://localhost:3000
npm test             # run Vitest unit tests
npm run build        # compile to dist/
```

**Endpoints:**
- `GET  /gyms/:id/capacity` — current fullness %
- `POST /gyms/:id/book`     — book a slot (body: `{ userId, slotTime }`)

### Mobile

```bash
cd mobile
npm install
npx expo start
# Scan QR with Expo Go or press `i` / `a` for simulator
```

> Update `API_BASE_URL` in `src/api/gymApi.ts` to match your backend address.

### Infrastructure

```bash
cd infra
npm install
npx cdk bootstrap   # first time only — requires AWS credentials
npx cdk deploy
```

---

## Key Architectural Decisions

### Concurrency & Double-Booking Prevention

The most critical problem is a classic **race condition**: two users simultaneously reading
`currentBookings = 49` (capacity 50), both passing the availability check, and both writing a
booking — overbooking by one.

**Solution chosen: Optimistic Locking with a version field.**

Each gym document carries a monotonically-increasing `version` integer. The booking write
is only committed if the version in the DB matches what was read:

```
READ:  { currentBookings: 49, version: 7 }
CHECK: 49 < 50  
WRITE: UPDATE gyms SET currentBookings=50, version=8 WHERE id=X AND version=7
       if 0 rows affected → conflict → return 409
```

Two concurrent requests both read `version: 7`; only one write succeeds; the other
gets a `409 Conflict` and the client retries. This is ACID-safe and requires **no distributed
locks or queues** for a moderate concurrency target.

**Alternative considered: Redis-based atomic increment (`INCR`)**  
`INCR gymslot:{gymId}:bookings` is atomic at the Redis level. Faster for extreme traffic
(50k+ rps) but adds operational complexity (Redis failover, cache warm-up). Described in
the Bonus section below.

**Alternative considered: DB-level SELECT FOR UPDATE (pessimistic lock)**  
Simpler reasoning, but creates a serialisation bottleneck on the gym row under load.
Not chosen.

### API Design

- **Fastify** over Express: schema-based JSON validation baked in, ~3× faster.
- **Repository pattern** for the DB layer: `GymRepository` interface backed by an
  `InMemoryGymRepository` for tests and a (production) `DynamoGymRepository`.
- **Plugin architecture**: each concern (auth, rate-limit, repo) is a Fastify plugin,
  keeping routes thin and testable.

### Mobile Architecture

- Single `useGymCapacity` hook owns all async state (loading / data / error).
- `GymCapacityScreen` is a pure presentational composition of small, typed sub-components.
- `capacityConfig` helper centralises colour/label thresholds so changing "80% = red"
  is a one-line change.

---

## Trade-offs & What I'd Improve With More Time

| Area | Current | Improvement |
| Auth | `userId` trusted from request body | JWT / Cognito middleware |
| Persistence | In-memory mock | DynamoDB with GSI on `userId+slotTime` for duplicate-user check |
| Concurrency | Optimistic lock (mocked) | Real DB transaction or Redis INCR |
| Observability | Console logs | AWS CloudWatch + X-Ray tracing via Powertools |
| Mobile offline | No handling | React Query + optimistic UI + retry |
| Rate limiting | None | API Gateway usage plans + Fastify rate-limit plugin |
| Slot validation | Any `slotTime` accepted | Configurable slot windows (e.g. 30-min blocks) |
| Tests | Unit tests on booking logic | Integration tests with testcontainers + Expo detox E2E |

---

## Bonus: AWS ElastiCache for `/capacity`

`GET /capacity` is a **read-heavy, tolerance-for-slight-staleness** endpoint — a perfect
ElastiCache use-case.

**Architecture:**

```
Mobile App
    │
    
API Gateway → Lambda (Fastify handler)
                  │
         ┌────────┴──────────┐
         ▼                   ▼
  Redis (ElastiCache)    DynamoDB
  TTL: 10 seconds        Source of truth
```

**Strategy:**

```typescript
async function getCapacity(gymId: string): Promise<CapacityData> {
  const cacheKey = `gym:${gymId}:capacity`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);           // ~0.5 ms

  const data = await dynamoRepo.getGym(gymId);     // ~5-10 ms
  await redis.setex(cacheKey, 10, JSON.stringify(data));
  return data;
}
```

**After a successful booking**, the handler calls:
```typescript
await redis.del(`gym:${gymId}:capacity`);  // cache invalidation
```

This means capacity reads are served in **<1 ms** from the nearest ElastiCache node
(using Global Datastore for multi-region), while writes always hit DynamoDB, keeping the
cache consistent within a 10-second window at worst (or immediately after a booking).

**For a global user base**, ElastiCache Global Datastore replicates the cache to AWS
regions closest to users (e.g., `eu-west-1` for Europe, `ap-southeast-1` for Asia),
cutting read latency from ~80 ms to ~5 ms for international members.
