import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { db } from './lib/db';
import routes from './server/routes';
import { bootRuntimes, shutdownRuntimes, wireRuntimeEvents } from './lib/events';
import { startScheduler } from './lib/automation';
import { registry } from './lib/bot-runtime';

export const app = express();
app.use(helmet());
app.use(express.json({ limit: '100kb' }));
app.use(rateLimit({ windowMs: 60_000, max: 300, standardHeaders: true, legacyHeaders: false }));
app.use(express.static(path.join(process.cwd(), 'public')));

// Public liveness endpoint: it must remain available before authentication middleware.
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

app.get('/health/details', async (_req, res) => {
  let database = 'ok';
  try { await db.$queryRaw`SELECT 1`; } catch { database = 'error'; }
  res.status(database === 'ok' ? 200 : 503).json({
    api: 'ok', database, runtimeCount: registry.size,
    onlineBotCount: await db.bot.count({ where: { status: 'ONLINE' } }).catch(() => 0),
  });
});

app.use('/api', routes);
app.get('/*splat', (req, res, next) => req.path.startsWith('/api')
  ? next()
  : res.sendFile(path.join(process.cwd(), 'public/index.html')));

wireRuntimeEvents();
const port = Number(process.env.PORT || 3000);
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(port, '0.0.0.0', async () => {
    console.log(`Server listening on 0.0.0.0:${port}`);
    try { startScheduler(); await bootRuntimes(); }
    catch (error) { console.error('Startup failed', error); }
  });
  const shutdown = async () => { server.close(); await shutdownRuntimes(); process.exit(0); };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}
