import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/AuthService';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.html',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  styleUrls: ['./verify-otp.css']
})
export class VerifyOtpComponent implements OnInit {
  verifyForm!: FormGroup;
  loading = false;
  message: string | null = null;
  error: string | null = null;
  phoneNumber = '';
  maskedPhone = '';
  resendCooldown = 0;
  private cooldownIntervalId: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
   this.phoneNumber = JSON.parse(localStorage.getItem('phone') || '{}');

    if (!this.phoneNumber) {
      this.router.navigate(['/login']);
      return;
    }

    this.maskedPhone = this.maskPhoneNumber(this.phoneNumber);

    this.verifyForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
  }

  get f() { 
    return this.verifyForm.controls; 
  }

  submit() {
    this.message = null;
    this.error = null;
    
    if (this.verifyForm.invalid) {
      this.error = 'Please enter a valid 6-digit OTP.';
      return;
    }

    const otp = this.verifyForm.value.otp;
    this.loading = true;

    this.authService.verifyOtp(this.phoneNumber, otp)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => {
          console.log('ress',res)
          if (res && (res.success ?? true)) {
            this.message = res.message || 'OTP verified successfully!';
            
            if (res.token) {
              localStorage.setItem('user', JSON.stringify(res.admin));
              localStorage.setItem('token', res.token);
              localStorage.removeItem('phone');
              
              setTimeout(() => {
                this.router.navigate(['/dashboard']);
              }, 1000);
            }
          } else {
            this.error = res?.message || 'OTP verification failed.';
          }
        },
        error: (err) => {
          this.error = 'Invalid OTP. Please try again.';
        }
      });
  }

  // resendOtp() {
  //   if (this.resendCooldown > 0) return;
    
  //   this.message = null;
  //   this.error = null;
  //   this.loading = true;

  //   this.authService.resendOtp(this.phoneNumber)
  //     .pipe(finalize(() => this.loading = false))
  //     .subscribe({
  //       next: (res) => {
  //         if (res && (res.success ?? true)) {
  //           this.message = 'OTP resent successfully.';
  //           this.verifyForm.reset();
  //           this.startCooldown(60);
  //         } else {
  //           this.error = res?.message || 'Failed to resend OTP.';
  //         }
  //       },
  //       error: (err) => {
  //         this.error = err?.error?.message || 'Error resending OTP.';
  //       }
  //     });
  // }

  backToLogin() {
    localStorage.removeItem('phone');
    this.router.navigate(['/login']);
  }

  private maskPhoneNumber(phone: string): string {
    if (!phone || phone.length <= 4) return phone;
    const length = phone.length;
    return phone.substring(0, 2) + '*'.repeat(length - 4) + phone.substring(length - 2);
  }

  private startCooldown(seconds: number) {
    this.resendCooldown = seconds;
    this.cooldownIntervalId = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.cooldownIntervalId);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.cooldownIntervalId) {
      clearInterval(this.cooldownIntervalId);
    }
  }
}