import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div class="w-16 h-16 rounded-full bg-girnar-100 flex items-center justify-center text-2xl mb-4">
        {{ icon() }}
      </div>
      <p class="text-girnar-800 font-medium">{{ title() }}</p>
      <p class="text-sm text-girnar-500 mt-1 max-w-xs">{{ description() }}</p>
    </div>
  `,
})
export class EmptyStateComponent {
  icon = input('📋');
  title = input('No records found');
  description = input('There is nothing to display yet.');
}
