import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { retry, timer } from 'rxjs';

/** Retry GETs on network errors (e.g. Render cold start). */
export const apiRetryInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: 2,
      delay: (error: unknown, retryIndex: number) => {
        const err = error as HttpErrorResponse;
        if (err.status === 0 || err.status === 502 || err.status === 503 || err.status === 504) {
          return timer(1200 * retryIndex);
        }
        throw error;
      },
    })
  );
};
