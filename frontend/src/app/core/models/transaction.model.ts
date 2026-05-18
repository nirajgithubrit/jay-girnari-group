import { Customer } from './customer.model';

export interface Transaction {
  _id: string;
  customerId: Customer | string;
  date: string;
  creditAmount: number;
  debitAmount: number;
  month: number;
  year: number;
  createdBy?: string;
  createdAt?: string;
}

export interface TransactionForm {
  customerId: string;
  date: string;
  creditAmount: number;
  debitAmount: number;
}

export interface FundTotals {
  totalCredit: number;
  totalDebit: number;
  totalFund: number;
  month: number;
  year: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
