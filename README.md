# MineControl — Minecraft 24/7 Bot SaaS

This repository now contains a real TypeScript/Express/Prisma control plane while retaining Mineflayer as the runtime engine. The original AFK behavior is represented by the reusable runtime's anti-AFK hook and can be extended per-bot through `settings`.

## Run locally

1. Copy `.env.example` to `.env` and set a strong `JWT_SECRET`, a 64-character hex `BOT_SECRET_ENCRYPTION_KEY`, and PostgreSQL `DATABASE_URL`.
2. Install dependencies: `npm install`.
3. Generate and migrate: `npx prisma generate && npx prisma migrate dev --name init`.
4. Run `npm run dev` and open `http://localhost:5000`.

## Production

`docker compose up --build` starts PostgreSQL and the application. The API uses ownership-scoped queries for every server and bot resource. Each bot receives an independent `BotRuntime` and Mineflayer instance; manual stop disables reconnection for that runtime.

The current API includes registration/login, server and bot CRUD, start/stop/restart, logs, chat, commands, dashboard metrics, SSE events, health checks, rate limiting, redaction, encrypted-secret primitives, graceful shutdown, and persistent Prisma models for automations, schedules, workflows, backups, notifications, players, and monitoring.

OAuth providers and password-reset email delivery should be configured with an external identity/email provider before enabling them in production; the local email/password flow is fully functional.
