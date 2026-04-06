import type { Response } from 'express';
import { recordsDb } from '../db';
import type { AuthRequest } from '../middleware/auth';

export const getSummary = async (req: AuthRequest, res: Response) => {
  const records = Array.from(recordsDb.values());

  let totalIncome = 0;
  let totalExpenses = 0;
  const categoryTotals: Record<string, number> = {};

  records.forEach(record => {
    if (record.type === 'INCOME') {
      totalIncome += record.amount;
    } else {
      totalExpenses += record.amount;
    }

    if (!categoryTotals[record.category]) {
      categoryTotals[record.category] = 0;
    }
    categoryTotals[record.category] += record.amount;
  });

  const netBalance = totalIncome - totalExpenses;

  // Recent activity: simply top 5 most recent records
  const recentActivity = [...records]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  res.json({
    totalIncome,
    totalExpenses,
    netBalance,
    categoryTotals,
    recentActivity,
  });
};
