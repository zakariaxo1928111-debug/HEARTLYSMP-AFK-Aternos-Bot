import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db';
const secret = () => process.env.JWT_SECRET || 'development-only-change-me';
export type AuthRequest = Request & { user?: { id: string } };
export function signUser(id: string) { return jwt.sign({ sub: id }, secret(), { expiresIn: '7d' }); }
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) { try { const token = (req.headers.authorization || '').replace(/^Bearer /, '') || req.cookies?.session; if (!token) return res.status(401).json({ error: 'Authentication required' }); const decoded = jwt.verify(token, secret()) as { sub: string }; const user = await db.user.findUnique({ where: { id: decoded.sub } }); if (!user) return res.status(401).json({ error: 'Invalid session' }); req.user = { id: user.id }; next(); } catch { res.status(401).json({ error: 'Invalid session' }); } }
export async function hashPassword(password: string) { return bcrypt.hash(password, 12); }
export async function verifyPassword(password: string, hash: string) { return bcrypt.compare(password, hash); }
