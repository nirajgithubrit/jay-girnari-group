import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center gap-3 py-8">
      <div class="w-10 h-10 border-4 border-girnar-200 border-t-girnar-700 rounded-full animate-spin"></div>
      @if (message()) {
        <p class="text-sm text-girnar-600">{{ message() }}</p>
      }
    </div>
  `,
})
export class LoaderComponent {
  message = input<string>('Loading...');
}
