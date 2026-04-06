import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { usersDb, User } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_testing';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Helper to generate IDs without external packages
const generateId = () => Math.random().toString(36).substring(2, 15);

export const register = async (req: Request, res: Response) => {
  const { email, password } = registerSchema.parse(req.body);
  
  // Check if email exists
  const exists = Array.from(usersDb.values()).some(u => u.email === email);
  if (exists) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = generateId();

  // First user registered becomes ADMIN for convenience, others VIEWER
  const role = usersDb.size === 0 ? 'ADMIN' : 'VIEWER';

  const newUser: User = {
    id,
    email,
    passwordHash,
    role,
    status: 'ACTIVE',
  };

  usersDb.set(id, newUser);

  res.status(201).json({ id, email, role, status: newUser.status });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = Array.from(usersDb.values()).find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (user.status !== 'ACTIVE') {
    return res.status(403).json({ error: 'Account is inactive' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, status: user.status },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({ token, role: user.role });
};
