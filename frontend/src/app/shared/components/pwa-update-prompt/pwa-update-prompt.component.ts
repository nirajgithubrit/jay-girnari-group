import { Component, inject, OnInit } from '@angular/core';
import { PwaUpdateService } from '../../../services/pwa-update.service';

@Component({
  selector: 'app-pwa-update-prompt',
  standalone: true,
  template: `
    @if (pwaUpdate.updateAvailable()) {
      <div class="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div
          class="glass-card w-full max-w-sm p-6 animate-slide-up shadow-2xl border border-sacred-gold/40"
          role="dialog"
          aria-labelledby="pwa-update-title"
          aria-describedby="pwa-update-desc"
        >
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-12 h-12 rounded-xl bg-gradient-to-br from-girnar-600 to-girnar-800 flex items-center justify-center shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <div>
              <p id="pwa-update-title" class="text-lg font-semibold text-girnar-900 font-display">
                Update Available
              </p>
              <p class="text-xs text-sacred-gold">Jay Girnari Group</p>
            </div>
          </div>

          <p id="pwa-update-desc" class="text-sm text-girnar-600 mb-6">
            A new version is ready. Tap <span class="font-medium">Update</span> to get the latest
            features and fixes.
          </p>

          <div class="flex gap-3">
            <button
              type="button"
              class="btn-secondary flex-1 text-sm py-2.5"
              (click)="pwaUpdate.dismissForNow()"
              [disabled]="pwaUpdate.updating()"
            >
              Later
            </button>
            <button
              type="button"
              class="btn-primary flex-1 text-sm py-2.5"
              (click)="onUpdate()"
              [disabled]="pwaUpdate.updating()"
            >
              {{ pwaUpdate.updating() ? 'Updating…' : 'Update' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class PwaUpdatePromptComponent implements OnInit {
  readonly pwaUpdate = inject(PwaUpdateService);

  ngOnInit() {
    this.pwaUpdate.init();
  }

  onUpdate() {
    this.pwaUpdate.applyUpdate();
  }
}
