import { Component, OnInit, inject } from '@angular/core';
import { PushNotificationService } from '../../../services/push-notification.service';
import { NotificationApiService } from '../../../services/notification-api.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-notification-prompt',
  standalone: true,
  template: `
    @if (push.isSupported() && !push.isSubscribed() && !dismissed) {
      <div class="mx-4 mt-3 glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 animate-slide-up border border-sacred-gold/30">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-girnar-900">Monthly fund reminders</p>
          <p class="text-xs text-girnar-600 mt-0.5">
            Get notified on the 5th if you haven't added your fund (days 1–5).
          </p>
        </div>
        <div class="flex gap-2 shrink-0">
          <button type="button" class="btn-secondary text-xs py-2" (click)="dismiss()">Later</button>
          <button type="button" class="btn-primary text-xs py-2" (click)="enable()" [disabled]="enabling">
            {{ enabling ? '...' : 'Enable' }}
          </button>
        </div>
      </div>
    }

    @if (auth.isAdmin() && push.isSubscribed()) {
      <div class="mx-4 mt-3 glass-card p-3 flex items-center justify-between gap-2 border border-girnar-200">
        <p class="text-xs text-girnar-600">Admin: test push notification now</p>
        <button
          type="button"
          class="btn-secondary text-xs py-1.5 shrink-0"
          (click)="testSend()"
          [disabled]="testing"
        >
          {{ testing ? 'Sending...' : 'Send test' }}
        </button>
      </div>
    }
  `,
})
export class NotificationPromptComponent implements OnInit {
  readonly push = inject(PushNotificationService);
  readonly auth = inject(AuthService);
  private readonly notifApi = inject(NotificationApiService);
  private readonly toast = inject(ToastService);
  dismissed = localStorage.getItem('jgg_notif_prompt_dismissed') === '1';
  enabling = false;
  testing = false;

  ngOnInit() {
    if (localStorage.getItem('jgg_push_enabled') === '1') {
      this.push.isSubscribed.set(true);
    }
  }

  dismiss() {
    this.dismissed = true;
    localStorage.setItem('jgg_notif_prompt_dismissed', '1');
  }

  async enable() {
    this.enabling = true;
    const ok = await this.push.enableNotifications();
    this.enabling = false;
    if (ok) {
      this.toast.success('Notifications enabled');
      this.dismissed = true;
    } else {
      this.toast.error('Could not enable notifications. Allow permission in browser settings.');
    }
  }

  testSend() {
    this.testing = true;
    this.notifApi.testSendReminders().subscribe({
      next: (res) => {
        this.testing = false;
        const d = res.data;
        if (d.reason) {
          this.toast.error(d.reason);
          return;
        }
        this.toast.success(`Sent: ${d.sent}, skipped (already funded): ${d.skipped}`);
      },
      error: (err) => {
        this.testing = false;
        this.toast.error(err.error?.message || 'Test send failed');
      },
    });
  }
}
