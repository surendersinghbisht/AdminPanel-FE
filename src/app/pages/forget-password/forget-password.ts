import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/AuthService';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../Components/loader/loader';
import emailjs from 'emailjs-com'; // <-- import EmailJS

@Component({
  selector: 'app-forget-password',
  imports: [CommonModule, ReactiveFormsModule, LoaderComponent, RouterModule],
  templateUrl: './forget-password.html',
  styleUrls: ['./forget-password.css']
})
export class ForgetPassword implements OnInit {

  forgetPasswordForm!: FormGroup;
  serverError = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackbar: MatSnackBar,
    private fb: FormBuilder,
  ) { 
    this.forgetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    })
  }

  ngOnInit(): void {
  }

  onSubmit() {
    if (this.forgetPasswordForm.invalid) return;

    this.isLoading = true;
    const { email } = this.forgetPasswordForm.value;

    // Step 1: Call backend to generate token
    this.authService.ForgetPasswordToken(email).subscribe({
      next: (token:any) => {
        console.log('Token received:', token);

        // Step 2: Send Email using EmailJS
        const templateParams = {
          to_email: email,
          reset_link: `http://localhost:4200/reset-password?token=${token.token}`,
        };

        emailjs.send(
          'service_m1az2yf',     // replace with your EmailJS service ID
          'template_zct46bh',    // replace with your EmailJS template ID
          templateParams,
          'sstmWq88zisaN_7Z-'   // replace with your EmailJS public key
        ).then(
          (result) => {
            console.log('Email sent successfully', result.text);
            this.snackbar.open('Reset password email sent successfully!', 'Close', {
              duration: 5000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['success-snackbar']
            });
            this.isLoading = false;
          },
          (error) => {
            console.error('Email send failed:', error.text);
            this.snackbar.open('Failed to send reset email', 'Close', {
              duration: 5000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['error-snackbar']
            });
            this.isLoading = false;
          }
        );
      },
      error: (err: any) => {
        this.serverError = err.error?.message || 'Failed to generate reset token';
        this.snackbar.open(this.serverError, 'Close', {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }
}
