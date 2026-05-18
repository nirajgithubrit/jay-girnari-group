import { Injectable, signal } from '@angular/core';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'jgg_pwa_install_dismissed';

@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  readonly canInstall = signal(false);
  readonly isIos = signal(false);
  readonly isStandalone = signal(false);
  readonly showIosHint = signal(false);

  constructor() {
    if (typeof window === 'undefined') return;

    this.isStandalone.set(
      window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    );

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    this.isIos.set(isIos);

    const dismissed = localStorage.getItem(DISMISS_KEY) === '1';

    if (isIos && !this.isStandalone() && !dismissed) {
      this.showIosHint.set(true);
    }

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      if (!dismissed) {
        this.canInstall.set(true);
      }
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.canInstall.set(false);
      this.showIosHint.set(false);
    });
  }

  async install(): Promise<boolean> {
    if (!this.deferredPrompt) return false;
    await this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.canInstall.set(false);
    return outcome === 'accepted';
  }

  dismiss() {
    localStorage.setItem(DISMISS_KEY, '1');
    this.canInstall.set(false);
    this.showIosHint.set(false);
  }
}
