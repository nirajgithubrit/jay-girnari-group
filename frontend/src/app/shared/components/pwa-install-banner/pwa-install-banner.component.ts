import { Component, inject } from '@angular/core';
import { PwaInstallService } from '../../../services/pwa-install.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-pwa-install-banner',
  standalone: true,
  template: `
    @if (pwa.canInstall()) {
      <div class="mx-4 mt-3 glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 animate-slide-up">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-girnar-900">Install Jay Girnari App</p>
          <p class="text-xs text-girnar-600 mt-0.5">Add to home screen for quick access on Android.</p>
        </div>
        <div class="flex gap-2 shrink-0">
          <button type="button" class="btn-secondary text-xs py-2" (click)="pwa.dismiss()">Later</button>
          <button type="button" class="btn-primary text-xs py-2" (click)="install()">Install</button>
        </div>
      </div>
    }

    @if (pwa.showIosHint()) {
      <div class="mx-4 mt-3 glass-card p-4 animate-slide-up">
        <p class="text-sm font-semibold text-girnar-900">Install on iPhone / iPad</p>
        <p class="text-xs text-girnar-600 mt-1">
          Tap <span class="font-medium">Share</span> → <span class="font-medium">Add to Home Screen</span>
        </p>
        <button type="button" class="text-xs text-girnar-500 mt-2 underline" (click)="pwa.dismiss()">
          Dismiss
        </button>
      </div>
    }
  `,
})
export class PwaInstallBannerComponent {
  readonly pwa = inject(PwaInstallService);
  private readonly toast = inject(ToastService);

  async install() {
    const ok = await this.pwa.install();
    if (ok) {
      this.toast.success('App installed successfully');
    }
  }
}
