import { Component, OnInit, inject } from '@angular/core';
import { PushNotificationService } from '../../../services/push-notification.service';
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
  `,
})
export class NotificationPromptComponent implements OnInit {
  readonly push = inject(PushNotificationService);
  private readonly toast = inject(ToastService);
  dismissed = localStorage.getItem('jgg_notif_prompt_dismissed') === '1';
  enabling = false;

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
}
