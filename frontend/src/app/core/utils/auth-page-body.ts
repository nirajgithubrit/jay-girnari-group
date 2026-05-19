const AUTH_ROUTE_CLASS = 'auth-route';

export function lockAuthPageScroll(): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.add(AUTH_ROUTE_CLASS);
}

export function unlockAuthPageScroll(): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.remove(AUTH_ROUTE_CLASS);
}
