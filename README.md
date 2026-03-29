<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run locally

This project now uses PostgreSQL with Prisma ORM. The frontend and API still run in a single Node process during development, but the database is externalized so local and production stay aligned.

## Stack

- Local database: PostgreSQL via Docker
- ORM: Prisma
- App server: Express + Vite middleware
- Planned production direction: Vercel + Postgres provider such as Neon

## Run Locally

**Prerequisites:** Node.js and Docker Desktop

1. Install dependencies:
   `npm install`
2. Copy [.env.example](.env.example) to `.env`
3. Start PostgreSQL on `localhost:5433`:
   `npm run db:up`
4. Apply the Prisma migration:
   `npm run prisma:deploy`
5. Run the app:
   `npm run dev`
6. Open:
   `http://localhost:3001`

## Prisma workflow

- Generate client:
  `npm run prisma:generate`
- Create and apply a new migration locally:
  `npm run prisma:migrate -- --name your_change`
- Apply existing migrations in CI or production:
  `npm run prisma:deploy`

## Production notes

- Keep the same Prisma schema in local and production.
- On Neon, use the pooled connection string in `DATABASE_URL` and the direct connection string in `MIGRATIONS_DATABASE_URL`.
- Set `JWT_SECRET` in production to a strong value.
- The local Docker database defaults to port `5433` so it does not collide with an existing PostgreSQL running on `5432`.

## Port conflicts

If `npm run dev` fails with `EADDRINUSE`:

- Change `PORT` in `.env` to another value such as `3002`
- Change `VITE_HMR_PORT` in `.env` if the websocket port is busy
- Or set `DISABLE_HMR=true` if you want to run without hot reload
