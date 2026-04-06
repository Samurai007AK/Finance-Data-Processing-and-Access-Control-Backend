import type { Response } from 'express';
import { z } from 'zod';
import { recordsDb, FinancialRecord, RecordType } from '../db';
import type { AuthRequest } from '../middleware/auth';

const recordSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1),
  date: z.string().datetime(),
  description: z.string().optional().default(''),
});

const generateId = () => Math.random().toString(36).substring(2, 15);

export const createRecord = async (req: AuthRequest, res: Response) => {
  const data = recordSchema.parse(req.body);
  const id = generateId();
  
  const record: FinancialRecord = {
    id,
    ...data,
    type: data.type as RecordType,
    date: new Date(data.date),
    userId: req.user!.id,
  };

  recordsDb.set(id, record);
  res.status(201).json(record);
};

export const getRecords = async (req: AuthRequest, res: Response) => {
  const { category, type, startDate, endDate } = req.query;
  
  let records = Array.from(recordsDb.values());

  if (category) {
    records = records.filter(r => r.category === category);
  }
  if (type) {
    records = records.filter(r => r.type === type);
  }
  if (startDate) {
    const start = new Date(startDate as string);
    records = records.filter(r => r.date >= start);
  }
  if (endDate) {
    const end = new Date(endDate as string);
    records = records.filter(r => r.date <= end);
  }

  // Sort by date descending
  records.sort((a, b) => b.date.getTime() - a.date.getTime());

  res.json(records);
};

export const getRecordById = async (req: AuthRequest, res: Response) => {
  const record = recordsDb.get(req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Record not found' });
  }
  res.json(record);
};

export const updateRecord = async (req: AuthRequest, res: Response) => {
  const record = recordsDb.get(req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Record not found' });
  }

  const data = recordSchema.partial().parse(req.body);
  
  const updatedRecord = {
    ...record,
    ...data,
    type: data.type ? (data.type as RecordType) : record.type,
    date: data.date ? new Date(data.date) : record.date,
  };

  recordsDb.set(record.id, updatedRecord);
  res.json(updatedRecord);
};

export const deleteRecord = async (req: AuthRequest, res: Response) => {
  const deleted = recordsDb.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Record not found' });
  }
  res.status(204).send();
};
