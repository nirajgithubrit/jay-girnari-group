import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Customer, CustomerForm } from '../core/models/customer.model';
import { ApiResponse } from '../core/models/transaction.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/customers`;

  getAll(search?: string, page = 1, limit = 50) {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<Customer[]>>(this.api, { params });
  }

  create(data: CustomerForm) {
    return this.http.post<ApiResponse<Customer>>(this.api, data);
  }

  update(id: string, data: CustomerForm) {
    return this.http.put<ApiResponse<Customer>>(`${this.api}/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${id}`);
  }
}
