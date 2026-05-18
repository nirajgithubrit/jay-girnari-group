import { HttpErrorResponse } from '@angular/common/http';

export function getHttpErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (typeof body === 'string' && body.trim()) return body;
    if (body && typeof body === 'object' && 'message' in body) {
      return String((body as { message: string }).message);
    }
    if (err.status === 401) return 'Invalid email or password';
    if (err.status === 0) return 'Cannot reach server. Check your connection.';
  }
  return fallback;
}
