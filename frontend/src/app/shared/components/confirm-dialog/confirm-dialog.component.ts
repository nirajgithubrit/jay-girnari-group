import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="glass-card w-full max-w-sm p-6 animate-slide-up text-center">
        <p class="text-girnar-900 font-medium mb-2">{{ title() }}</p>
        <p class="text-sm text-girnar-600 mb-6">{{ message() }}</p>
        <div class="flex gap-3 justify-center">
          <button type="button" class="btn-secondary" (click)="cancelled.emit()">Cancel</button>
          <button
            type="button"
            class="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
            (click)="confirmed.emit()"
          >
            {{ confirmLabel() }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  title = input('Confirm');
  message = input('Are you sure?');
  confirmLabel = input('Delete');
  confirmed = output<void>();
  cancelled = output<void>();
}
