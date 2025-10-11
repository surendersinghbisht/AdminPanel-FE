import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/AuthService';
import { SnackbarComponent } from '../../Components/snackbar/snackbar';
import { LoaderComponent } from '../../Components/loader/loader';

declare var grecaptcha: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, SnackbarComponent, LoaderComponent]
})
export class Login implements OnInit, AfterViewInit {
  loginForm!: FormGroup;
  recaptchaToken: string | null = null;
  recaptchaError = false;
  serverError = '';
  isLoading = false;
  @ViewChild(SnackbarComponent) snackbar!: SnackbarComponent;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if(this.authService.isLoggedIn()){
      this.router.navigate(['/dashboard']);
    }
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngAfterViewInit(): void {
    grecaptcha.render('recaptcha', {
      sitekey: '6LcnveIrAAAAAPI8cFz6oQMgSVu2-4Wb6kgtCvOQ',
      callback: (token: string) => {
        this.recaptchaToken = token;
        this.recaptchaError = false;
      },
      'expired-callback': () => {
        this.recaptchaToken = null;
      }
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit() {
    this.serverError = '';
    if (!this.recaptchaToken) {
      this.recaptchaError = true;
      return;
    }

    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    this.isLoading = true;


    setTimeout(() => {
      this.authService.login(email, password).subscribe({
        next: (res: any) => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('admin', JSON.stringify(res.admin));
          this.router.navigate(['/dashboard']);
          this.snackbar.show('Login successful', 'success');
          this.isLoading = false;
        },
        error: (err: any) => {
          this.serverError = err.error?.message || 'Login failed';
          this.snackbar.show(this.serverError, 'error');
          this.isLoading = false;
        }
      });
    }, 100); // 100ms ensures spinner renders first
  }
}
