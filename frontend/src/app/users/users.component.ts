import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CustomerService } from '../services/customer.service';
import { TransactionService } from '../services/transaction.service';
import { ToastService } from '../services/toast.service';
import { Customer } from '../core/models/customer.model';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { EmptyStateComponent } from '../shared/components/empty-state/empty-state.component';
import { ModalComponent } from '../shared/components/modal/modal.component';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    LoaderComponent,
    EmptyStateComponent,
    ModalComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly transactionService = inject(TransactionService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  customers = signal<Customer[]>([]);
  loading = signal(true);
  search = signal('');
  showAddUser = signal(false);
  showAddData = signal(false);
  editCustomer = signal<Customer | null>(null);
  deleteId = signal<string | null>(null);
  saving = signal(false);

  userForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    phoneNumber: ['', Validators.required],
  });

  dataForm = this.fb.nonNullable.group({
    customerId: ['', Validators.required],
    date: ['', Validators.required],
    creditAmount: [0, [Validators.min(0)]],
    debitAmount: [0, [Validators.min(0)]],
  });

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.loading.set(true);
    this.customerService.getAll(this.search()).subscribe({
      next: (res) => {
        this.customers.set(res.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load users');
        this.loading.set(false);
      },
    });
  }

  onSearch(value: string) {
    this.search.set(value);
    this.loadCustomers();
  }

  openAddUser() {
    this.userForm.reset({ name: '', phoneNumber: '' });
    this.editCustomer.set(null);
    this.showAddUser.set(true);
  }

  openEdit(c: Customer) {
    this.editCustomer.set(c);
    this.userForm.patchValue({ name: c.name, phoneNumber: c.phoneNumber });
    this.showAddUser.set(true);
  }

  saveUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const data = this.userForm.getRawValue();
    const edit = this.editCustomer();

    const req = edit
      ? this.customerService.update(edit._id, data)
      : this.customerService.create(data);

    req.subscribe({
      next: () => {
        this.toast.success(edit ? 'User updated' : 'User added');
        this.showAddUser.set(false);
        this.loadCustomers();
        this.saving.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Save failed');
        this.saving.set(false);
      },
    });
  }

  openAddData() {
    this.dataForm.reset({
      customerId: '',
      date: new Date().toISOString().split('T')[0],
      creditAmount: 0,
      debitAmount: 0,
    });
    this.showAddData.set(true);
  }

  saveData() {
    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.transactionService.create(this.dataForm.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Transaction added');
        this.showAddData.set(false);
        this.saving.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to add data');
        this.saving.set(false);
      },
    });
  }

  confirmDelete(id: string) {
    this.deleteId.set(id);
  }

  deleteCustomer() {
    const id = this.deleteId();
    if (!id) return;
    this.customerService.delete(id).subscribe({
      next: () => {
        this.toast.success('User deleted');
        this.deleteId.set(null);
        this.loadCustomers();
      },
      error: (err) => this.toast.error(err.error?.message || 'Delete failed'),
    });
  }
}
