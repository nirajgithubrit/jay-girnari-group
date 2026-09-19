import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, interval } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly swUpdate = inject(SwUpdate, { optional: true });
  private initialized = false;

  readonly updateAvailable = signal(false);
  readonly updating = signal(false);

  init(): void {
    if (!isPlatformBrowser(this.platformId) || this.initialized) return;

    this.initialized = true;

    if (!this.swUpdate?.isEnabled) {
      // The service worker may still be registering. Retry shortly so installed PWAs still detect the update.
      setTimeout(() => this.init(), 5000);
      return;
    }

    this.swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(() => {
        this.updateAvailable.set(true);
      });

    this.swUpdate.unrecoverable.subscribe(() => {
      this.updateAvailable.set(true);
    });

    // Check when user returns to the app or switches back to the installed PWA
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkForUpdate();
      }
    });

    window.addEventListener('focus', () => this.checkForUpdate());

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        this.checkForUpdate();
      });
    }

    // Keep checking while app stays open and when a PWA is reopened.
    interval(30 * 60 * 1000).subscribe(() => this.checkForUpdate());

    // Immediate check after startup so the installed app can detect a fresh deployment.
    setTimeout(() => this.checkForUpdate(), 1500);
  }

  checkForUpdate(): void {
    if (!this.swUpdate?.isEnabled) return;
    this.swUpdate.checkForUpdate().catch(() => undefined);
  }

  dismissForNow(): void {
    this.updateAvailable.set(false);
  }

  async applyUpdate(): Promise<void> {
    if (!this.swUpdate?.isEnabled || this.updating()) return;

    this.updating.set(true);
    try {
      await this.swUpdate.activateUpdate();
      document.location.reload();
    } catch {
      this.updating.set(false);
      document.location.reload();
    }
  }
}
