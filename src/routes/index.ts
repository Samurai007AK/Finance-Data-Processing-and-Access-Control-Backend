import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { register, login } from '../controllers/authController';
import { getUsers, updateRole, updateStatus } from '../controllers/userController';
import { createRecord, getRecords, getRecordById, updateRecord, deleteRecord } from '../controllers/recordController';
import { getSummary } from '../controllers/analyticsController';

export const routes = Router();

// Auth Routes
routes.post('/auth/register', register);
routes.post('/auth/login', login);

// User Management Routes (Admin only)
routes.get('/users', authenticate, requireRole(['ADMIN']), getUsers);
routes.put('/users/:id/role', authenticate, requireRole(['ADMIN']), updateRole);
routes.put('/users/:id/status', authenticate, requireRole(['ADMIN']), updateStatus);

// Financial Record Routes
// Analysts and Admins can view records
routes.get('/records', authenticate, requireRole(['ANALYST', 'ADMIN']), getRecords);
routes.get('/records/:id', authenticate, requireRole(['ANALYST', 'ADMIN']), getRecordById);
// Only Admins can mutate records
routes.post('/records', authenticate, requireRole(['ADMIN']), createRecord);
routes.put('/records/:id', authenticate, requireRole(['ADMIN']), updateRecord);
routes.delete('/records/:id', authenticate, requireRole(['ADMIN']), deleteRecord);

// Analytics Routes
// All roles can view summary
routes.get('/analytics/summary', authenticate, requireRole(['VIEWER', 'ANALYST', 'ADMIN']), getSummary);
