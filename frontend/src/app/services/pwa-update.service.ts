import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, interval } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly swUpdate = inject(SwUpdate, { optional: true });

  readonly updateAvailable = signal(false);
  readonly updating = signal(false);

  init(): void {
    if (!isPlatformBrowser(this.platformId) || !this.swUpdate?.isEnabled) return;

    this.swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(() => {
        this.updateAvailable.set(true);
      });

    this.swUpdate.unrecoverable.subscribe(() => {
      this.updateAvailable.set(true);
    });

    // Check when user returns to the app (e.g. opens PWA from home screen)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkForUpdate();
      }
    });

    // Periodic check while app is open (every 30 minutes)
    interval(30 * 60 * 1000).subscribe(() => this.checkForUpdate());

    // Initial check after service worker is ready
    setTimeout(() => this.checkForUpdate(), 10_000);
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
