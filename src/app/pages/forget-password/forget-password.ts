import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/AuthService';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../Components/loader/loader';
import emailjs from 'emailjs-com'; // <-- import EmailJS
import { EmailTemplateService } from '../../services/EmailTemplateService';

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
    private emailTemplateService: EmailTemplateService
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
   this.emailTemplateService.sendResetPasswordLink({email:email,token:token.token}).subscribe({
    next: () => {
      this.snackbar.open('Reset password link sent successfully', 'Close', {
        duration: 5000,
        verticalPosition: 'top',
        horizontalPosition: 'right',
        panelClass: ['success-snackbar']
      });
      this.isLoading = false;
    },
    error: (err) => {
      this.snackbar.open(err.error?.message || 'Reset failed', 'Close', {
        duration: 5000,
        verticalPosition: 'top',
        horizontalPosition: 'right',
        panelClass: ['error-snackbar']
      });
      this.isLoading = false;
    }
   })
      },
  
    });
  }
}
