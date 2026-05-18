import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      (click)="onBackdrop()"
    >
      <div
        class="glass-card w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between p-4 border-b border-girnar-100">
          <p class="text-lg font-semibold text-girnar-900">{{ title() }}</p>
          <button
            type="button"
            class="w-8 h-8 rounded-full hover:bg-girnar-100 flex items-center justify-center text-girnar-600"
            (click)="closed.emit()"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div class="p-4">
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class ModalComponent {
  title = input.required<string>();
  closed = output<void>();
  closeOnBackdrop = input(true);

  onBackdrop() {
    if (this.closeOnBackdrop()) this.closed.emit();
  }
}
