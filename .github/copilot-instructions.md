# G88: Location-Based Social Platform - AI Agent Instructions

## Project Overview

G88 is a full-stack location-based social platform with a **NestJS backend** (TypeORM + PostgreSQL + PostGIS), **React Native mobile** client (Redux Toolkit), and features for discovery, chat, gamification, payments, and trading. The architecture emphasizes modular design, real-time capabilities (WebSockets), and spatial queries.

## Core Architecture

### Backend Structure (NestJS)
- **Location**: `backend/src/`
- **Key Pattern**: Feature-based modules (`modules/auth/`, `modules/users/`, `modules/chat/`, etc.)
- **Database**: PostgreSQL with PostGIS for geospatial queries
- **Real-time**: Socket.IO for chat and notifications via `modules/notifications/`
- **Authentication**: JWT-based with role guards
- **Caching**: Redis via `CacheService` for performance-critical operations
- **File Storage**: AWS S3 for profile images and media

**Module Structure** (from `app.module.ts`):
- **auth** - Registration, login, JWT token management, social auth (Google, Apple, Facebook)
- **users** - User profiles, settings, preferences, avatar management, online status
- **profiles** - User status (free/verified/pro/incognito), skills system, profile visibility rules
- **discovery** - Location-based user discovery, filters, swipe/like mechanics, caching
- **chat** - Messaging, WebSocket connections, message history, read receipts
- **interactions** - Swipes, matches, connections, social follows, interaction analytics
- **notifications** - Push notifications, WebSocket events, in-app alerts
- **social** - User profiles, feeds, followers/following relationships
- **trading** - Buy/sell items, orders, escrow, dispute resolution
- **events** - Event creation, RSVP, event discovery, calendar integration
- **gamification** - Achievements, badges, points, leaderboards, rewards
- **gifts** - Virtual gifts, gift sending, animations
- **payments** - Stripe integration, subscriptions, transactions, invoice history
- **analytics** - User metrics, event tracking, engagement analytics
- **admin** - Moderation tools, user management, system health
- **verification** - Photo verification, ID verification, social verification, face comparison
- **locations** - Location history, favorite places, safety features (emergency contacts)

Each module contains: `entities/`, `dto/`, `services/`, `controllers/`, `{module}.module.ts`

### Mobile Architecture (React Native + Redux)
- **Location**: `mobile/src/`
- **State Management**: Redux Toolkit (single store)
- **Navigation**: React Navigation (bottom tabs + native stacks)
- **API Client**: Axios with interceptors for auth/errors
- **Build**: Android via Gradle (Windows), iOS via CocoaPods

## Critical Patterns & Conventions

### 1. Database & Entities
- **TypeORM** with **migrations** (NOT synchronize mode) - always use `npm run migration:generate` for schema changes
- **PostGIS Integration**: Spatial columns stored as `type: 'geography', spatialFeatureType: 'Point', srid: 4326`
  - Location stored as WKT: `'POINT(lng lat)'` with spatial indexes
  - Example: [user.entity.ts](backend/src/modules/users/entities/user.entity.ts#L40)
- **Unique Indexes with Nulls**: `@Index(['email'], { unique: true, where: '"email" IS NOT NULL' })` allows optional nullable fields
- **Enums**: Defined both in TypeScript and PostgreSQL (see migrations)

### 2. Service Injection & Dependency Pattern
- Use `@Injectable()` for all services
- Constructor injection via `@InjectRepository(Entity)` for data access
- Common services in `common/`: `CacheService`, `S3Service`, `EmailService`, `SmsService`, `FaceCompareService`
- Example: [auth.service.ts](backend/src/modules/auth/auth.service.ts#L1)

### 3. Request/Response DTOs
- Located in `modules/{feature}/dto/`
- Use `class-validator` decorators (`@IsEmail()`, `@IsNotEmpty()`, etc.)
- Controllers validate via `@Body()` with DTO class - automatic validation pipeline

### 4. Error Handling
- Throw NestJS exceptions: `BadRequestException`, `UnauthorizedException`, `ConflictException`, `NotFoundException`
- Framework automatically catches and formats responses

### 5. Caching Strategy
- Use `CacheService` for frequently accessed data (user profiles, discovery cards)
- Global cache TTL is 60s (configurable in `app.module.ts`)
- Invalidate via `cache.del(key)` after mutations

### 6. Rate Limiting
- Multiple throttle guards configured in `app.module.ts`: `short` (10 req/1s), `medium`, `long`
- Use `@Throttle('medium')` decorator on sensitive endpoints

### 7. Mobile State Management
- Redux Toolkit slices in `mobile/src/store/` (one file per feature)
- API calls handled via `createAsyncThunk` in slices
- Selectors for component subscriptions
- No Redux middleware for side effects - manage async in thunks

### 8. Mobile Navigation
- Bottom tab navigator for main screens (Discovery, Chat, Profile, etc.)
- Nested native stacks within tabs
- React Navigation params for typed navigation: `navigation.navigate('ScreenName', { paramKey: value })`

## Developer Workflows

### Backend Development
```bash
npm run start:dev           # Hot-reload development server
npm run test               # Run Jest tests
npm run test:watch        # Watch mode for tests
npm run lint              # Fix ESLint issues
npm run migration:generate # Create new migration from entity changes
npm run migration:run      # Apply migrations
npm run seed              # Seed database with test data
```

### Mobile Development
```bash
npm run android           # Build and run on emulator/device
npm run ios              # Run on iOS simulator
npm run start:reset      # Reset React Native cache
npm run test             # Jest for React Native
npm run build:release    # Production build (bumps patch version)
npm run version:minor    # Manual version bump
```

### Database
- **Postgres + PostGIS setup**: `docker-compose up` in backend/ (see `docker-compose.yml`)
- **Migrations are immutable**: Never modify old migrations; create new ones
- **Spatial queries**: Use TypeORM geometry operators in queries

## Key Integration Points

### Authentication Flow
- Registration/Login in `auth.service.ts` → JWT token issued
- Token stored in mobile Redux: `auth/authSlice.ts`
- Every request includes `Authorization: Bearer {token}` via axios interceptor
- Backend validates JWT via Passport strategy in `auth.module.ts`

### Real-time Chat
- WebSocket connection established in `chat.gateway.ts`
- Mobile listens to socket events in chat screen component
- Messages persisted via `chat.service.ts` and `ChatMessage` entity

### Location-Based Discovery
- Mobile sends location via location service (geolocation hook)
- Backend queries nearby users using PostGIS `ST_Distance_Sphere` in `discovery.service.ts`
- Results cached to reduce query load

### Payments (Stripe)
- Mobile uses `@stripe/stripe-react-native`
- Backend payment service in `payments/` handles Stripe API
- Webhook handling for payment confirmations

### Profile Status & Skills System (MVP)
**User Status Lifecycle**: `free` → `verified` → `pro` / `incognito`
- **Free User**: Default status, limited discovery (5 swipes/day), basic profile
- **Verified User**: Email + phone verified, photo verified via face comparison, unlimited discovery
- **Pro User**: Paid subscription ($9.99/mo), see who likes you, unlimited messaging
- **Incognito User**: Pro feature, hidden from public discovery (only matches see profile)

**Skills Attribute Architecture**:
- **Entity**: `UserSkills` (one-to-one with User)
- **Skill Categories**: `dating_score` (0-100), `social_score` (0-100), `trader_score` (0-100), `overall_level` (1-10)
- **Calculated from**:
  - **Dating**: Matches made, conversations maintained, connections depth, verification status
  - **Social**: Followers/following ratio, event RSVPs, gift exchanges, interaction consistency
  - **Trading**: Completed transactions, seller rating, dispute rate, verification level
- **Calculation**: Scheduled job (hourly) via `SkillsService.recalculateUserSkills()` or on-demand via `GET /users/{id}/skills`
- **Geographic Context**: Skills shown globally + per-city leaderboard (caching prevents N+1)
- **Cache**: Store in Redis with 1-hour TTL, invalidate on interaction events

**Profile Visibility Rules**:
```typescript
// Determine what data is visible to requesting user
function getVisibleProfile(targetUser: User, requestingUser: User): ProfileDTO {
  if (targetUser.status === 'incognito' && !hasMatch(targetUser, requestingUser)) {
    return { name: 'Hidden', photos: [] }; // Show minimal info
  }
  if (targetUser.status === 'verified' || targetUser.status === 'pro') {
    return { ...fullProfile, skills: targetUser.skills };
  }
  return { ...baseProfile, skills: null }; // Free users don't see skills
}
```

## Code Quality & Testing

### Jest (Backend)
- Config expects tests in `test/` or `*.spec.ts` files
- Use `jest --config ./test/jest-e2e.json` for E2E tests
- Run `jest --coverage` to check coverage

### Jest (Mobile)
- Basic preset in `jest.config.js` using `react-native` preset
- E2E tests should cover navigation and Redux integration

## Security Notes

- **Password**: Hashed with bcrypt cost 12 (see `auth.service.ts`)
- **Sensitive fields**: Use `@Exclude()` decorator on `passwordHash` in entities
- **Environment vars**: Loaded from `.env` via `ConfigModule`
- **S3 presigned URLs**: Generated per-request for file uploads (no hardcoded credentials)
- **Rate limiting**: Protects auth endpoints from brute force

## Common Gotchas

1. **Migrations**: Always use `npm run migration:generate` after entity changes—never manually sync schema
2. **PostGIS Points**: Remember format is `'POINT(lng lat)'` not `(lat lng)`—longitude first!
3. **Nulls in unique indexes**: If field can be null, use `where` clause in index definition
4. **Redux selectors**: Use in components for subscriptions; avoid accessing state directly
5. **Mobile navigation params**: Are untyped unless using custom navigation hooks—define interfaces explicitly
6. **Cache invalidation**: Easy to forget after mutations—add to service methods that modify data

## Module Deep Dive

### Trading Module Pattern
**Entities**: `Item`, `Order`, `Transaction`, `Dispute`
**Flow**: Seller lists item → Buyer initiates order → Escrow holds payment → Seller ships → Buyer confirms → Payment released
**Service**: `trading.service.ts` manages order state machine; `TradingController` handles REST endpoints
**Real-time**: Order status updates via WebSocket to both parties
**Disputes**: `dispute.service.ts` handles resolution with admin escalation

### Events Module Pattern
**Entities**: `Event`, `EventRsvp`, `EventLocation` (with PostGIS)
**Flow**: User creates event → Others discover nearby → RSVP updates social score → Admin can feature event
**Service**: `events.service.ts` queries by radius + date range using PostGIS
**Caching**: Popular events cached (24h TTL) to reduce queries
**Notifications**: RSVP changes trigger push notifications to creator

### Gamification Module Pattern
**Entities**: `Achievement`, `UserAchievement`, `Badge`, `Leaderboard`
**Types**:
- **Achievement**: Unlock conditions (`first_match`, `10_messages_exchanged`, `skilled_trader_10_items`, etc.)
- **Badge**: Visual representation, earned by achieving milestones
- **Leaderboard**: Calculated daily, stored in Redis with rankings by skill_score/area
**Service**: `gamification.service.ts` listens to interaction events and awards achievements
**Example**: User matches with 10 people → `MATCHMAKER` achievement unlocked → Bronze badge awarded

### Social Module Pattern
**Entities**: `SocialLink`, `Follow`, `BlockedUser`, `Feed`
**Features**: 
- Follow users to see their activity (matches, events they're attending)
- Block feature prevents viewing/messaging
- Feed aggregates activities of following users
**Service**: `social.service.ts` builds personalized feeds; caching prevents N+1 on followers
**Privacy**: Free users can't see who follows them; verified/pro can

### Discovery Module Pattern
**Entities**: `DiscoveryCard`, `Swipe`, `Match`
**Algorithm**:
1. Query nearby users via PostGIS (radius + distance)
2. Filter by user preferences (age, gender, distance, interests)
3. Apply algo: randomize order, boost verified/pro users
4. Fetch from cache if available (invalidate on preference changes)
5. Return paginated results (load next 10 cards on swipe)
**Swipe handling**: One swipe = 1 interaction data point (for skills algorithm)
**Matches**: Mutual likes → `Match` entity created → Chat room opened

## When Uncertain

- Check existing module structure for patterns (e.g., `modules/users/` is a good template)
- Migrations are the source of truth for schema; check latest migration for current structure
- Mobile API calls in Redux slices show the expected endpoint contracts
- DTOs define input validation; always validate incoming data
- For new features: Identify which module owns it, create entities, write service, add controller, define DTOs

## Recommended Reading Order

1. **Architecture**: `app.module.ts` → understand global setup
2. **Database**: `migrations/` → see schema evolution
3. **Authentication**: `modules/auth/` → understand security patterns
4. **Feature module**: Pick one (e.g., `modules/discovery/`) → see full implementation
5. **Mobile**: `mobile/src/store/` → Redux patterns + `mobile/src/api/client.ts` → API integration

---

**Last Updated**: January 2026  
**Stack**: NestJS 10.3 | TypeORM | PostgreSQL + PostGIS | React Native 0.83 | Redux Toolkit 2.11
