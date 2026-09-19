import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TransactionService } from '../services/transaction.service';
import { CustomerService } from '../services/customer.service';
import { ToastService } from '../services/toast.service';
import { ExcelExportService } from '../services/excel-export.service';
import { FooterComponent } from '../layout/footer/footer.component';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { EmptyStateComponent } from '../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';
import { ModalComponent } from '../shared/components/modal/modal.component';
import { PwaInstallBannerComponent } from '../shared/components/pwa-install-banner/pwa-install-banner.component';
import { NotificationPromptComponent } from '../shared/components/notification-prompt/notification-prompt.component';
import { Transaction, FundTotals } from '../core/models/transaction.model';
import { Customer } from '../core/models/customer.model';
import { DashboardRow } from '../core/models/dashboard-row.model';
import {
  buildMonthOptions,
  compareMonthYear,
  formatMonthLabel,
  getDefaultSelectedMonth,
  getDropdownEnd,
  START_MONTH,
  START_YEAR,
} from '../core/utils/month-range';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    FormsModule,
    FooterComponent,
    LoaderComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    ModalComponent,
    PwaInstallBannerComponent,
    NotificationPromptComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly txService = inject(TransactionService);
  private readonly customerService = inject(CustomerService);
  private readonly toast = inject(ToastService);
  private readonly excelExport = inject(ExcelExportService);

  rows = signal<DashboardRow[]>([]);
  totals = signal<FundTotals | null>(null);
  loading = signal(true);
  exporting = signal(false);
  search = signal('');

  selectedMonth = signal(new Date().getMonth() + 1);
  selectedYear = signal(new Date().getFullYear());

  editTx = signal<Transaction | null>(null);
  editingExpense = signal(false);
  deleteTxId = signal<string | null>(null);
  saving = signal(false);

  editForm = {
    date: '',
    description: '',
    receivedBy: 'Rohitbhai',
    creditAmount: 0,
    debitAmount: 0,
  };

  readonly monthOptions = buildMonthOptions();

  readonly selectedMonthValue = computed(
    () => `${this.selectedMonth()}-${this.selectedYear()}`,
  );

  monthLabel = computed(() =>
    formatMonthLabel(this.selectedMonth(), this.selectedYear())
  );

  canGoPrev = computed(() =>
    compareMonthYear(this.selectedMonth(), this.selectedYear(), START_MONTH, START_YEAR) > 0
  );

  canGoNext = computed(() => {
    const end = getDropdownEnd();
    return (
      compareMonthYear(this.selectedMonth(), this.selectedYear(), end.month, end.year) < 0
    );
  });

  filteredRows = computed(() => {
    const q = this.search().toLowerCase().trim();
    if (!q) return this.rows();
    return this.rows().filter((r) => {
      const customerName = r.customer?.name?.toLowerCase() ?? '';
      const phone = r.customer?.phoneNumber?.toLowerCase() ?? '';
      const description = (r.description || '').toLowerCase();
      const receivedBy = (r.receivedBy || '').toLowerCase();
      return (
        customerName.includes(q) ||
        phone.includes(q) ||
        description.includes(q) ||
        receivedBy.includes(q)
      );
    });
  });

  ngOnInit() {
    this.setCurrentMonthSelection();
    this.loadData();
    this.loadTotals();
  }

  private setCurrentMonthSelection() {
    const current = getDefaultSelectedMonth();
    this.selectedMonth.set(current.month);
    this.selectedYear.set(current.year);
  }

  loadTotals() {
    this.txService.getTotals().subscribe({
      next: (res) => this.totals.set(res.data || null),
      error: () => this.toast.error('Failed to load fund totals'),
    });
  }

  loadData() {
    this.loading.set(true);
    const month = this.selectedMonth();
    const year = this.selectedYear();

    forkJoin({
      customers: this.customerService.getAll(undefined, 1, 500),
      transactions: this.txService.getMonthly(month, year),
    }).subscribe({
      next: ({ customers, transactions }) => {
        const customerList = customers.data || [];
        const txList = transactions.data || [];
        const txMap = new Map<string, Transaction>();

        for (const t of txList) {
          if (!t.customerId) continue;
          const c = t.customerId as Customer;
          const id = c?._id || (t.customerId as string);
          const existing = txMap.get(id);
          if (existing) {
            existing.creditAmount += t.creditAmount;
            existing.debitAmount += t.debitAmount;
            if (new Date(t.date) > new Date(existing.date)) {
              existing.date = t.date;
            }
          } else {
            txMap.set(id, { ...t, customerId: c });
          }
        }

        const merged: DashboardRow[] = customerList.map((customer) => {
          const tx = txMap.get(customer._id) ?? null;
          return {
            customer,
            description: tx?.description ?? '',
            receivedBy: tx?.receivedBy ?? '',
            transaction: tx,
            creditAmount: tx?.creditAmount ?? 0,
            debitAmount: tx?.debitAmount ?? 0,
            date: tx?.date ?? null,
          };
        });

        const expenseRows: DashboardRow[] = txList
          .filter((t) => !t.customerId)
          .map((t) => ({
            customer: null,
            description: t.description || 'Expense',
            receivedBy: t.receivedBy ?? '',
            transaction: t,
            creditAmount: t.creditAmount ?? 0,
            debitAmount: t.debitAmount ?? 0,
            date: t.date ?? null,
          }));

        this.rows.set([...merged, ...expenseRows]);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load data');
        this.loading.set(false);
      },
    });
  }

  onSearchChange(value: string) {
    this.search.set(value);
  }

  prevMonth() {
    if (!this.canGoPrev()) return;
    let m = this.selectedMonth() - 1;
    let y = this.selectedYear();
    if (m < 1) {
      m = 12;
      y--;
    }
    this.selectedMonth.set(m);
    this.selectedYear.set(y);
    this.loadData();
  }

  nextMonth() {
    if (!this.canGoNext()) return;
    let m = this.selectedMonth() + 1;
    let y = this.selectedYear();
    if (m > 12) {
      m = 1;
      y++;
    }
    this.selectedMonth.set(m);
    this.selectedYear.set(y);
    this.loadData();
  }

  onMonthSelect(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const [m, y] = value.split('-').map(Number);
    this.selectedMonth.set(m);
    this.selectedYear.set(y);
    this.loadData();
  }

  openEdit(row: DashboardRow) {
    const t = row.transaction;
    if (!t) return;

    const isExpense = !row.customer;
    this.editingExpense.set(isExpense);
    this.editTx.set(t);
    this.editForm = {
      date: new Date(t.date).toISOString().split('T')[0],
      description: t.description ?? '',
      receivedBy: isExpense ? '' : (t.receivedBy ?? 'Rohitbhai'),
      creditAmount: t.creditAmount,
      debitAmount: t.debitAmount,
    };
  }

  saveEdit() {
    const t = this.editTx();
    if (!t) return;
    this.saving.set(true);

    const isExpense = this.editingExpense();
    const payload: any = {
      date: this.editForm.date,
      creditAmount: Number(this.editForm.creditAmount || 0),
      debitAmount: Number(this.editForm.debitAmount || 0),
      customerId:
        typeof t.customerId === 'string'
          ? t.customerId
          : t.customerId && typeof t.customerId === 'object'
            ? t.customerId._id
            : null,
    };

    if (isExpense) {
      payload.description = this.editForm.description || 'Expense';
      payload.customerId = null;
      delete payload.creditAmount;
      payload.receivedBy = '';
    } else {
      payload.description = '';
      payload.receivedBy = this.editForm.receivedBy || 'Rohitbhai';
    }

    this.txService.update(t._id, payload).subscribe({
      next: () => {
        this.toast.success(isExpense ? 'Expense updated' : 'Transaction updated');
        this.editTx.set(null);
        this.editingExpense.set(false);
        this.loadData();
        this.loadTotals();
        this.saving.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Update failed');
        this.saving.set(false);
      },
    });
  }

  confirmDelete(id: string) {
    this.deleteTxId.set(id);
  }

  deleteTransaction() {
    const id = this.deleteTxId();
    if (!id) return;
    this.txService.delete(id).subscribe({
      next: () => {
        this.toast.success('Transaction deleted');
        this.deleteTxId.set(null);
        this.loadData();
        this.loadTotals();
      },
      error: (err) => this.toast.error(err.error?.message || 'Delete failed'),
    });
  }

  exportExcel() {
    if (!this.auth.isAdmin()) return;
    this.exporting.set(true);
    try {
      this.excelExport.exportFundReport(
        this.filteredRows(),
        this.monthLabel(),
        this.totals()
      );
      this.toast.success('Excel downloaded');
    } catch {
      this.toast.error('Failed to export Excel');
    }
    this.exporting.set(false);
  }
}
