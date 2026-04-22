# SkillBridge Attendance Management System

An end-to-end prototype for a fictional state-level skilling programme, featuring multi-role access control, real-time attendance tracking, and data aggregation.

## 🚀 Live URLs
- **Frontend:** [https://skillbridge-lmt-vnpx.vercel.app](https://skillbridge-lmt-vnpx.vercel.app)
- **Backend:** [https://skillbridge-api-9p7u.onrender.com]((https://skillbridge-lmt.onrender.com))

## 🔑 Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Student | student@skillbridge.org | SkillBridge123! |
| Trainer | trainer@skillbridge.org | SkillBridge123! |
| Institution | admin@skillbridge.org | SkillBridge123! |
| Programme Manager | pm@skillbridge.org | SkillBridge123! |
| Monitoring Officer | monitoring@skillbridge.org | SkillBridge123! |

## 🛠️ Stack Choices
- **Frontend:** Next.js 14 (App Router), Vanilla CSS, Lucide Icons.
- **Backend:** Node.js, Express, TypeScript.
- **Database:** Neon PostgreSQL with Prisma ORM.
- **Authentication:** Clerk (with custom Role-Based Access Control).

**Why this stack?**
- **Next.js** provides a seamless developer experience and fast performance.
- **Clerk** handles the heavy lifting of security while allowing us to implement custom role logic easily via backend sync.
- **Prisma** ensures type-safety and rapid database schema iterations.

## 📐 Schema Decisions
- **Unified User Table:** All roles share a single User table with a `role` enum. This simplifies auth and relationships.
- **Many-to-Many Trainers:** Batches can have multiple trainers (`BatchTrainer` join table) as per requirements.
- **Invite Code System:** Every batch generates a unique UUID `inviteCode`. Students join batches by entering this code, allowing for decentralized onboarding.

## ⚙️ Setup Instructions
### Backend
1. `cd submission/backend`
2. `npm install`
3. Set up `.env`:
   ```env
   DATABASE_URL="postgresql://..."
   CLERK_SECRET_KEY="sk_test_..."
   ```
4. `npx prisma db push`
5. `npm run dev`

### Frontend
1. `cd submission/frontend`
2. `npm install`
3. Set up `.env.local`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_API_URL="http://localhost:3001"
   ```
4. `npm run dev`

## ✅ What's Working
- [x] Multi-role Auth (Clerk + Backend Sync)
- [x] Dashboard Routing based on roles
- [x] Batch Creation & Invite Code Generation
- [x] Session Management for Trainers
- [x] Real-time Attendance Marking for Students
- [x] Aggregated Summaries (Institution & Programme wide)
- [x] Read-Only access for Monitoring Officers

## 🔮 What I'd Do Differently with More Time
- Implement **Webhooks** for Clerk to sync users automatically without a frontend call.
- Add **Data Visualization** (Charts) for Institution and PM dashboards using Recharts.
- Implement **QR Code** generation for sessions to prevent fraudulent attendance marking.
