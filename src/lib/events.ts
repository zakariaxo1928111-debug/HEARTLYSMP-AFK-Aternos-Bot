import { EventEmitter } from 'node:events';
import { db } from './db';
import { registry } from './bot-runtime';
export const realtime = new EventEmitter();
export function wireRuntimeEvents() { registry.emitEvent = event => realtime.emit('event', event); }
export async function bootRuntimes() { const bots = await db.bot.findMany({ where: { startOnBoot: true }, include: { server: true } }); for (const bot of bots) await registry.start(bot); }
export async function shutdownRuntimes() { await registry.stopAll(); await db.$disconnect(); }
