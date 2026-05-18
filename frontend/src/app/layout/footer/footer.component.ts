import { Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FundTotals } from '../../core/models/transaction.model';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  totals = input<FundTotals | null>(null);
  loading = input(false);
}
