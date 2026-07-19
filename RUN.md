# PLACE@ASET Run Guide

This guide will walk you through setting up and running the PLACE@ASET workspace locally, including prerequisites, configurations, databases, and general troubleshooting.

---

## 📋 1. Prerequisites

Make sure you have the following tools installed on your local computer:
- **Node.js**: Version 18.x or 20.x (Recommended: LTS)
- **NPM**: Version 9.x or later
- **Docker & Docker Compose**: (Required if running via containers or local caching)
- **Supabase CLI**: (Optional, for local migrations management)
- **PostgreSQL**: (Optional, if connecting to a standalone instance)

---

## 🛠️ 2. Installation

1. Clone this repository to your local directory:
   ```bash
   git clone <repository-url> PLACE-ASET
   cd PLACE-ASET
   ```

2. Install dependencies for the **Backend Server**:
   ```bash
   cd server
   npm install
   ```

3. Install dependencies for the **Frontend Client**:
   ```bash
   cd ../client
   npm install
   ```

---

## 🔑 3. Environment Variables

Create the `.env` configuration files in both `server/` and `client/` directories using their respective template samples.

### Server Env (`server/.env`)
Create a file named `.env` inside the `server/` directory and configure the variables:
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-secret-key
JWT_SECRET=your-jwt-auth-token-secret-key
REDIS_URL=redis://localhost:6379
```

### Client Env (`client/.env.local`)
Create a file named `.env.local` inside the `client/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-public-key
```

---

## 🗄️ 4. Database & Supabase Setup

The system uses Supabase (PostgreSQL) for accounts, question banks, and weekly challenges.

1. Create a project at [Supabase Console](https://supabase.com).
2. Go to **Settings > API** to copy your `Project URL`, `service_role key`, and `anon public key` into your environment configuration files created in Step 3.
3. Run the migrations inside the `supabase/migrations/` folder in order (from `001_` to `009_`) inside your Supabase **SQL Editor** console to instantiate the tables, enums, triggers, and Row Level Security (RLS) configurations:
   - `001_create_core.sql` — Core users, colleges, and departments tables
   - `002_create_questions.sql` — Question bank tables and enums
   - `003_create_challenges.sql` — Challenges, registrations, and submissions tables
   - `004_create_remaining.sql` — Resources, community, leaderboard, and notifications
   - `005_create_rls_policies.sql` — Row-Level Security policies for all tables
   - `006_auth_user_management.sql` — Roles, permissions, sessions, and RBAC helpers
   - `007_question_bank_extensions.sql` — Extended question types and department junction
   - `008_challenge_discussions.sql` — Challenge discussions and comments board
   - `009_challenge_enhancements.sql` — Challenge banner, difficulty, visibility, and analytics view
   - `010_practice_extensions.sql` — Practice statistics, weak topics, streaks, and recommendations schema
   - `011_gamification_schema.sql` — Level definitions, achievements, user badges, and unlocked achievement progress tables
   - `012_community_ocr_schema.sql` — Community submissions, attachments, OCR jobs/results, duplicate checks, reviews, and version history schema


---

## 🚀 5. Running the Application Locally

You can run the frontend client and backend server simultaneously in separate terminal windows.

### Running the Backend Server
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Start the hot-reloading development server:
   ```bash
   npm run dev
   ```
   *The server will start listening at [http://localhost:5000](http://localhost:5000).*

### Running the Frontend Client
1. Navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Launch the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend application will be live at [http://localhost:3000](http://localhost:3000).*

---

## 🐳 6. Running with Docker Compose

If you have Docker installed and running, you can run the entire platform (Frontend, Backend, Redis Cache, and Nginx reverse proxies) with a single command:

1. Make sure your `.env` variables match the container targets.
2. In the root workspace directory, run:
   ```bash
   docker-compose up --build
   ```
3. Docker will download, build, and link the images. Once the containers are online:
   - **Frontend App**: Accessible at [http://localhost:3000](http://localhost:3000)
   - **Backend API**: Accessible at [http://localhost:5000](http://localhost:5000)
   - **Redis Instance**: Bound to standard internal caching ports.

To stop the containers, use:
```bash
docker-compose down
```

---

## ⚠️ 7. Common Errors

### 1. `Supabase credentials not configured`
* **Cause**: Client `.env.local` or Server `.env` file is missing.
* **Fix**: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are declared inside the `client/.env.local` file.

### 2. `Port 5000 is already in use`
* **Cause**: Another local project or node server is occupying the backend listening port.
* **Fix**: Change the `PORT` value inside `server/.env` to another number (e.g. `PORT=5001`), and update the frontend `NEXT_PUBLIC_API_URL` to point to it.

### 3. `ts-node ERR_MODULE_NOT_FOUND`
* **Cause**: During typescript testing, imports might be resolved incorrectly if there's a syntax or validation warning in the code files.
* **Fix**: Run `npx tsc --noEmit` inside the `server/` directory to review the compiler issues.

---

## 🔍 8. Troubleshooting & Diagnostics

- **Backend Logs**: The backend uses Winston Logger. System logs are captured in console stdout and appended inside `server/logs/` (for production errors).
- **Run Backend Tests**: Check controller and API integrations:
  ```bash
  cd server
  npm run test
  ```
- **Verify Frontend Build**: Check for compile issues:
  ```bash
  cd client
  npm run build
  ```

---

## 📦 9. Production Deployment

### Frontend (Next.js)
1. Build the production application bundle:
   ```bash
   npm run build
   ```
2. Start the optimized Next.js server instance:
   ```bash
   npm run start
   ```

### Backend (Express)
1. Build TypeScript files into JavaScript:
   ```bash
   npm run build
   ```
2. Start the server (Recommended: use PM2 for orchestration):
   ```bash
   pm2 start dist/app.js --name "place-aset-api"
   ```
