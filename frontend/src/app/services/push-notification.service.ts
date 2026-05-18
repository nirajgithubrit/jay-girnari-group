import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/notifications`;

  readonly isSubscribed = signal(false);
  readonly isSupported = signal(false);

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      this.isSupported.set(true);
    }
  }

  async enableNotifications(): Promise<boolean> {
    if (!this.isSupported()) return false;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const publicKey = await this.getVapidPublicKey();
    if (!publicKey) return false;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(publicKey),
    });

    const json = subscription.toJSON();
    await firstValueFrom(
      this.http.post(`${this.api}/subscribe`, {
        endpoint: json.endpoint,
        keys: json.keys,
      })
    );

    this.isSubscribed.set(true);
    localStorage.setItem('jgg_push_enabled', '1');
    return true;
  }

  private async getVapidPublicKey(): Promise<string | null> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ success: boolean; publicKey: string }>(`${this.api}/vapid-public-key`)
      );
      return res.publicKey;
    } catch {
      return environment.vapidPublicKey || null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(base64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return arr;
  }
}
