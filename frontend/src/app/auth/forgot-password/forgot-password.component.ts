import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { lockAuthPageScroll, unlockAuthPageScroll } from '../../core/utils/auth-page-body';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { getHttpErrorMessage } from '../../core/utils/http-error';

function passwordMatchValidator(control: AbstractControl) {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  ngOnInit() {
    lockAuthPageScroll();
  }

  ngOnDestroy() {
    unlockAuthPageScroll();
  }

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  loading = signal(false);
  showPassword = signal(false);
  showConfirm = signal(false);

  form = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  toggleConfirm() {
    this.showConfirm.update((v) => !v);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { email, password, confirmPassword } = this.form.getRawValue();
    this.auth.forgotPassword({ email, password, confirmPassword }).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Password updated! Please login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(getHttpErrorMessage(err, 'Could not reset password'));
      },
    });
  }
}
