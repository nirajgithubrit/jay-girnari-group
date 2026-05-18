import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  Transaction,
  TransactionForm,
  FundTotals,
  ApiResponse,
} from '../core/models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/transactions`;

  getMonthly(month: number, year: number, search?: string, page = 1) {
    let params = new HttpParams()
      .set('month', month)
      .set('year', year)
      .set('page', page)
      .set('limit', 100);
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<Transaction[]> & { month: number; year: number }>(
      this.api,
      { params }
    );
  }

  getTotals() {
    return this.http.get<ApiResponse<FundTotals>>(`${this.api}/totals`);
  }

  create(data: TransactionForm) {
    return this.http.post<ApiResponse<Transaction>>(this.api, data);
  }

  update(id: string, data: Partial<TransactionForm>) {
    return this.http.put<ApiResponse<Transaction>>(`${this.api}/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${id}`);
  }
}
