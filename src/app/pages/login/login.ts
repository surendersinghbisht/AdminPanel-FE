import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/AuthService';
import { SnackbarComponent } from '../../Components/snackbar/snackbar';
import { LoaderComponent } from '../../Components/loader/loader';
import { CommonModule } from '@angular/common';

declare global {
  interface Window {
    turnstile: any;
  }
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, LoaderComponent, SnackbarComponent, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit, AfterViewInit {
  loginForm!: FormGroup;
  turnstileToken: string | null = null;
  turnstileWidgetId: string | null = null;
  isLoading = false;
  turnstileError = false;
  // Add this property to your component class
showPassword = false;

// Add this method
togglePasswordVisibility(): void {
  this.showPassword = !this.showPassword;
}

  @ViewChild(SnackbarComponent) snackbar!: SnackbarComponent;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
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
    this.initializeTurnstile();
  }

  private initializeTurnstile(): void {
    if (typeof window.turnstile !== 'undefined') {
      this.renderTurnstile();
    } else {
      // Retry after 100ms if script not loaded yet
      setTimeout(() => this.initializeTurnstile(), 100);
    }
  }

  renderTurnstile(): void {
    try {
      this.turnstileWidgetId = window.turnstile.render('#turnstile-widget', {
        sitekey: '0x4AAAAAAB6ex4m3be45YUkv', // Replace with your site key
        callback: (token: string) => {
          this.turnstileToken = token;
          this.turnstileError = false;
          this.cdr.detectChanges();
          console.log('Turnstile token received');
        },
        'expired-callback': () => {
          this.turnstileToken = null;
          this.cdr.detectChanges();
          console.log('Turnstile token expired');
        },
        'error-callback': () => {
          this.turnstileToken = null;
          this.turnstileError = true;
          this.cdr.detectChanges();
          console.error('Turnstile error occurred');
        }
      });
      console.log('Turnstile widget rendered with ID:', this.turnstileWidgetId);
    } catch (error) {
      console.error('Error rendering Turnstile:', error);
      this.turnstileError = true;
    }
  }

  resetTurnstile(): void {
    if (window.turnstile && this.turnstileWidgetId) {
      try {
        window.turnstile.reset(this.turnstileWidgetId);
        this.turnstileToken = null;
        console.log('Turnstile reset');
      } catch (error) {
        console.error('Error resetting Turnstile:', error);
      }
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.values(this.loginForm.controls).forEach(control => control.markAsTouched());
      return;
    }

    if (!this.turnstileToken) {
      this.turnstileError = true;
      return;
    }

    const { email, password } = this.loginForm.value;
    this.isLoading = true;

    this.authService.login(email, password, this.turnstileToken).subscribe({
      next: (res: any) => {
        console.log('login',res)
        localStorage.setItem('phone', JSON.stringify(res.phone));
        this.isLoading = false;
        if(res.success){
          this.router.navigate(['/verify-otp']);
        }
      },
      error: (err: any) => {
        const errorMessage = err.error?.message || 'failed';
        this.snackbar.show(errorMessage, 'error');
        this.isLoading = false;
        this.resetTurnstile();
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup - remove widget if it exists
    if (window.turnstile && this.turnstileWidgetId) {
      try {
        window.turnstile.remove(this.turnstileWidgetId);
      } catch (error) {
        console.error('Error removing Turnstile widget:', error);
      }
    }
  }
}