import type { Response } from 'express';
import { z } from 'zod';
import { usersDb, Role, Status } from '../db';
import type { AuthRequest } from '../middleware/auth';

const updateRoleSchema = z.object({
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']),
});

const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export const getUsers = async (req: AuthRequest, res: Response) => {
  const users = Array.from(usersDb.values()).map(({ passwordHash, ...user }) => user);
  res.json(users);
};

export const updateRole = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role } = updateRoleSchema.parse(req.body);

  const user = usersDb.get(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.role = role as Role;
  usersDb.set(id, user);

  res.json({ message: 'Role updated successfully', user: { id: user.id, email: user.email, role: user.role } });
};

export const updateStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = updateStatusSchema.parse(req.body);

  const user = usersDb.get(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Prevent admin from deactivating themselves
  if (id === req.user?.id) {
    return res.status(400).json({ error: 'Cannot update own status' });
  }

  user.status = status as Status;
  usersDb.set(id, user);

  res.json({ message: 'Status updated successfully', user: { id: user.id, email: user.email, status: user.status } });
};
