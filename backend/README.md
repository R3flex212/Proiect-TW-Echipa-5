# Backend (Node.js + Express + Prisma)

## Setup
```bash
cd backend
npm install
cp .env.example .env
# completează DATABASE_URL (Supabase) + JWT_SECRET
npm run prisma:generate
npm run prisma:migrate
npm run seed   # opțional
npm run dev
```

Server: http://localhost:4000
