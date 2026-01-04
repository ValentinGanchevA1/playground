# Skills System Implementation Guide

## Overview
Implemented comprehensive skills system for G88 platform allowing users to earn and display skills based on interactions across dating, social, and trading domains.

## What Was Implemented

### 1. **User Entity Updates** (`backend/src/modules/users/entities/user.entity.ts`)
Added new columns to User:
- `status: UserStatus` (free | verified | pro | incognito)
- `datingScore: number` (0-100) - based on matches, conversations
- `socialScore: number` (0-100) - based on followers, events, gifts
- `traderScore: number` (0-100) - based on transactions, ratings
- `overallLevel: number` (1-10) - average of three scores
- `skillsLastCalculatedAt: Date` - timestamp of last calculation

### 2. **UserSkillsHistory Entity** (`backend/src/modules/users/entities/user-skills-history.entity.ts`)
Tracks all skill changes with:
- **Significant deltas only**: Records changes >= 5 points in absolute value
- **Reasons**: Enum of 16 change reasons (match_created, transaction_completed, etc.)
- **Timeline**: Chrono order with createdAt indexing
- **Metadata**: JSON field for context (related user ID, transaction ID, etc.)
- **Description**: Human-readable text ("+5 dating from new match")
- **Last 30 days tracking**: `isRecent` boolean flag

### 3. **ProfilesModule** (`backend/src/modules/profiles/`)
New feature module with:
- `SkillsService` - Core business logic
- `ProfilesController` - REST endpoints
- `ProfilesModule` - Module definition

### 4. **SkillsService** (`backend/src/modules/profiles/skills.service.ts`)

#### Public Methods:
- **`recalculateUserSkills(userId)`** - Recalculate one user's skills
- **`recordSkillChange(userId, skillType, delta, reason, metadata)`** - Record interaction-based changes
- **`getUserSkillsHistory(userId, viewerId, daysBack)`** - Get history with visibility rules
- **`getGlobalLeaderboard(skillType, limit)`** - Global rankings
- **`getCityLeaderboard(city, skillType, limit)`** - City-specific rankings

#### Scheduled Jobs:
- **`@Cron('0 2 * * *')`** - Recalculates all users' skills daily at 2 AM UTC
- Refreshes all leaderboards after calculation
- Error handling with per-user logging

#### Calculation Logic:
```
Dating Score = (matches * 3) + (conversations * 2) + verification_bonus
Social Score = (followers * 2) + (following * 1) + (event_rsvps * 3) + (gifts * 2)
Trader Score = (completed_transactions * 5) + (avg_rating * 10) - (disputes * 10)
Overall Level = ceil((dating + social + trader) / 3 / 10)  // 1-10
```

### 5. **Caching Strategy**
- **Leaderboards**: 1-hour TTL in Redis
  - `leaderboard:dating:global`
  - `leaderboard:social:global`
  - `leaderboard:trader:global`
  - `leaderboard:overall:global`
  - `leaderboard:{skillType}:{city}` for city-based boards
- **User profiles**: Invalidated on skill change
- **Refresh**: After daily recalculation job completes

### 6. **ProfilesController** (`backend/src/modules/profiles/profiles.controller.ts`)

#### Endpoints:
```
GET /profiles/:userId/skills?days=30
  - Returns user's skills and history
  - Respects visibility rules
  - Query: days=30 (default) or days=all

GET /profiles/leaderboard/global?skillType=overall&limit=50
  - Global leaderboard
  - skillType: dating|social|trader|overall (default: overall)
  - limit: 1-100 (default: 50)

GET /profiles/leaderboard/city/:city?skillType=overall&limit=50
  - City-specific leaderboard
  - Same query params as global
```

### 7. **DTOs** (`backend/src/modules/profiles/dto/profile.dto.ts`)
- `UserProfileDto` - Profile with conditional skills visibility
- `SkillsVisibilityDto` - Skills visibility rules applied
- `GetSkillsHistoryQueryDto` - Query validation
- `GetLeaderboardQueryDto` - Leaderboard query validation

### 8. **Migration** (`backend/src/migrations/1704300000000-AddSkillsSystem.ts`)
- Creates `user_status_enum` type
- Adds 5 skill columns + status to users table
- Creates `user_skills_history` table with proper relationships
- Creates indexes for leaderboard queries (filtered by status)
- Creates composite indexes for history queries
- Full rollback support

### 9. **Module Integration**
- Added `ProfilesModule` to `app.module.ts`
- Exported `SkillsService` for other modules to inject
- Scheduled jobs enabled via `ScheduleModule`

## Visibility Rules

Profile skills visibility is determined by:

| Target User Status | Can View Skills | Can View History |
|------------------|----------------|-----------------|
| **Free**         | ❌ Never        | ❌ Never         |
| **Verified**     | ✅ Yes (all)    | ✅ Yes (all)     |
| **Pro**          | ✅ Yes (all)    | ✅ Yes (all)     |
| **Incognito**    | ⚠️ If matched   | ⚠️ If matched    |

## How to Use in Other Modules

### Record a Skill Change (from Interactions/Chat/Trading)
```typescript
import { SkillsService } from '../profiles/skills.service';

constructor(private skillsService: SkillsService) {}

// When a match is created
await this.skillsService.recordSkillChange(
  userId,
  'dating',
  5,  // delta
  SkillChangeReason.MATCH_CREATED,
  { relatedUserId: otherUserId }
);

// When transaction completes
await this.skillsService.recordSkillChange(
  sellerId,
  'trader',
  10,
  SkillChangeReason.TRANSACTION_COMPLETED,
  { transactionId: transaction.id, amount: transaction.total }
);
```

### Get User's Skills on Profile View
```typescript
import { SkillsService } from '../profiles/skills.service';

const skillsHistory = await this.skillsService.getUserSkillsHistory(
  targetUserId,
  currentUserId,
  30  // last 30 days
);
```

## Testing Checklist

- [ ] Run migration: `npm run migration:run`
- [ ] Verify User entity has new columns
- [ ] Verify UserSkillsHistory table created
- [ ] Test `/profiles/:userId/skills` endpoint
- [ ] Test `/profiles/leaderboard/global` endpoint
- [ ] Test `/profiles/leaderboard/city/:city` endpoint
- [ ] Verify scheduled job runs at 2 AM UTC
- [ ] Test visibility rules for free/verified/pro/incognito users
- [ ] Verify delta threshold (only records >= 5)
- [ ] Check Redis caching for leaderboards
- [ ] Test skill change recording from other modules

## Next Steps

1. **Implement actual score calculations** in SkillsService:
   - Query actual match counts from interactions table
   - Query actual follower counts from social table
   - Query actual transaction data from trading table
   - Adjust formulas based on product feedback

2. **Add city-based leaderboards** with PostGIS queries:
   - Map cities to geographic areas
   - Filter users by location radius for each city

3. **Add visibility hooks** to user profile endpoints:
   - Check `canViewSkills()` in profile retrieval
   - Return different ProfileDto based on viewer/status combo

4. **Create mobile slices**:
   - Profile skills Redux slice
   - Leaderboard Redux slice
   - Profile detail screen showing skills + history timeline

5. **Add gamification rewards**:
   - Achievement unlock when skill reaches thresholds
   - Badge display on profile
   - Special badges for top leaderboard positions

---

**Implementation Date**: January 4, 2026
**Framework**: NestJS 10.3 | TypeORM | PostgreSQL | Redis
