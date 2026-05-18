import { Component, AfterViewInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { PwaUpdatePromptComponent } from './shared/components/pwa-update-prompt/pwa-update-prompt.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, PwaUpdatePromptComponent],
  template: `
    <router-outlet />
    <app-toast />
    <app-pwa-update-prompt />
  `,
})
export class AppComponent implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.hideSplash();
  }

  private hideSplash() {
    const splash = document.getElementById('app-splash');
    if (!splash) return;
    requestAnimationFrame(() => {
      splash.classList.add('splash-hidden');
      setTimeout(() => splash.remove(), 500);
    });
  }
}
