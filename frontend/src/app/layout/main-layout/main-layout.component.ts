import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <div class="app-shell">
      <app-header />
      <main class="app-main">
        <router-outlet />
      </main>
    </div>
  `,
})
export class MainLayoutComponent {}
