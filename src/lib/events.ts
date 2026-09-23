import { EventEmitter } from 'node:events';
import { db } from './db';
import { registry } from './bot-runtime';
import { dispatchAutomation } from './automation';
import { TriggerType } from '@prisma/client';
export const realtime = new EventEmitter();
export function wireRuntimeEvents(){registry.emitEvent=async event=>{realtime.emit('event',event);if(event.type&&Object.values(TriggerType).includes(event.type as TriggerType))await db.botEvent.create({data:{botId:event.botId,type:event.type as TriggerType,payload:event.data as any}}).catch(()=>undefined);if(event.type&&Object.values(TriggerType).includes(event.type as TriggerType))await dispatchAutomation(event.botId,event.type as TriggerType,event.data).catch(()=>undefined);};}
export async function bootRuntimes(){const bots=await db.bot.findMany({where:{startOnBoot:true},include:{server:true}});for(const bot of bots)await registry.start(bot);}
export async function shutdownRuntimes(){await registry.stopAll();await db.$disconnect();}
