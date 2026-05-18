import { Component, inject, signal, computed } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  menuOpen = signal(false);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  readonly showUsersLink = computed(() => {
    const url = this.currentUrl();
    const onUsersPage = url.includes('/users');
    return this.auth.isAdmin() && !onUsersPage;
  });

  get initial(): string {
    const name = this.auth.currentUser()?.username || '?';
    return name.charAt(0).toUpperCase();
  }

  toggleMenu() {
    this.menuOpen.update((v) => !v);
  }

  logout() {
    this.menuOpen.set(false);
    this.auth.logout();
  }
}
