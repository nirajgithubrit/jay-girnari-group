import { Component, AfterViewInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  template: `
    <router-outlet />
    <app-toast />
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
