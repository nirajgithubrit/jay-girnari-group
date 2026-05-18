import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div
      class="fixed left-4 right-4 z-[100] flex flex-col-reverse items-stretch gap-2 pointer-events-none sm:left-auto sm:right-4 sm:items-end sm:max-w-sm sm:w-[calc(100%-2rem)]"
      [class]="positionClass()"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto px-4 py-3 rounded-xl shadow-lg animate-slide-up text-sm font-medium border w-full sm:max-w-sm mx-auto sm:mx-0"
          [class]="toastClass(toast.type)"
          (click)="toastService.dismiss(toast.id)"
        >
          {{ toast.message }}
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  positionClass = computed(() => {
    const url = this.router.url;
    const aboveFooter = url.includes('/dashboard');
    return aboveFooter
      ? 'bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))]'
      : 'bottom-4 pb-[env(safe-area-inset-bottom,0px)]';
  });

  toastClass(type: string): string {
    const map: Record<string, string> = {
      success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      info: 'bg-girnar-50 border-girnar-200 text-girnar-800',
    };
    return map[type] || map['info'];
  }
}
