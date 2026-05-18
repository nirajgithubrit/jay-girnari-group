import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/notifications`;

  testSendReminders() {
    return this.http.post<{
      success: boolean;
      message: string;
      data: { sent: number; skipped: number; eligible: number; reason?: string };
    }>(`${this.api}/test-send`, {});
  }
}
