import { Customer } from './customer.model';
import { Transaction } from './transaction.model';

export interface DashboardRow {
  customer: Customer | null;
  description: string;
  receivedBy: string;
  transaction: Transaction | null;
  creditAmount: number;
  debitAmount: number;
  date: string | null;
}
