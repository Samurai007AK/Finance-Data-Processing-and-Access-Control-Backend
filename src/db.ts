export type Role = 'VIEWER' | 'ANALYST' | 'ADMIN';
export type Status = 'ACTIVE' | 'INACTIVE';
export type RecordType = 'INCOME' | 'EXPENSE';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: Status;
}

export interface FinancialRecord {
  id: string;
  amount: number;
  type: RecordType;
  category: string;
  date: Date;
  description: string;
  userId: string;
}

export const usersDb = new Map<string, User>();
export const recordsDb = new Map<string, FinancialRecord>();
