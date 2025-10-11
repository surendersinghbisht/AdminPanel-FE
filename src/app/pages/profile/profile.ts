import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../services/AuthService';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
import { LoaderComponent } from '../../Components/loader/loader';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxIntlTelInputModule,
    LoaderComponent
  ]
})
export class ProfileComponent implements OnInit {

  userForm!: FormGroup;
  isLoading: boolean = false;
  user: any;
  userId!: number;
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  
  // Tel Input Configuration
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedStates];

  constructor(private fb: FormBuilder, private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      id: [''],
      firstName: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(50),
        this.noWhitespaceValidator
      ]],
      lastName: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(50),
        this.noWhitespaceValidator
      ]],
      email: ['', [
        Validators.required, 
        Validators.email, 
        Validators.maxLength(100),
        this.emailValidator
      ]],
      phone: ['', [Validators.required]], // ngx-intl-tel-input handles phone validation
      oldPassword: [''],
      newPassword: [''],
      confirmPassword: [''],
      role: [{ value: 'Admin', disabled: true }],
      status: [{ value: 'Active', disabled: true }],
      profilePic: [''],
    }, { 
      validators: this.passwordConditionalValidator 
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    const storedAdmin = localStorage.getItem('admin');
    this.userId = storedAdmin ? Number(JSON.parse(storedAdmin).id) : 0;

    if (!this.userId) {
      console.error('No user ID found');
      return;
    }

    this.authService.getAdminDetails(this.userId).subscribe({
      next: (response) => {
        this.user = response;
        this.populateForm(response);
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
        alert('Error loading profile. Please refresh the page.');
      }
    });
  }

  private populateForm(userData: any): void {
    this.userForm.patchValue({
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      role: userData.role || 'Admin',
      status: userData.status || 'Active',
      profilePic: ''
    });

    // Load existing profile picture
    if (userData.profilePicUrl) {
      this.imagePreview = userData.profilePicUrl;
    }

    // Clear password fields
    setTimeout(() => {
      this.clearPasswordFields();
    }, 100);
  }

  // Custom Validators
  private noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace && control.value ? { whitespace: true } : null;
  }

  private emailValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    if (!email) return null;
    
    // More strict email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email) ? null : { invalidEmail: true };
  }

  passwordConditionalValidator(group: AbstractControl): ValidationErrors | null {
    const oldPassword = group.get('oldPassword')?.value;
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (oldPassword || newPassword || confirmPassword) {
      const errors: ValidationErrors = {};

      if (!oldPassword) {
        errors['oldRequired'] = true;
      }

      if (!newPassword) {
        errors['newRequired'] = true;
      } else if (newPassword.length < 8) {
        errors['passwordLength'] = true;
      } else if (!/(?=.*[a-z])/.test(newPassword)) {
        errors['passwordLowercase'] = true;
      } else if (!/(?=.*[A-Z])/.test(newPassword)) {
        errors['passwordUppercase'] = true;
      } else if (!/(?=.*\d)/.test(newPassword)) {
        errors['passwordNumber'] = true;
      }

      if (!confirmPassword) {
        errors['confirmRequired'] = true;
      } else if (newPassword !== confirmPassword) {
        errors['mismatch'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    }

    return null;
  }

  // File Handling
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      this.resetFileInput();
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Image size should be less than 5MB');
      this.resetFileInput();
      return;
    }

    this.selectedFile = file;
    this.userForm.patchValue({ profilePic: file });

    // Create image preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.onerror = () => {
      alert('Error reading file');
      this.resetFileInput();
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imagePreview = null;
    this.selectedFile = null;
    this.userForm.patchValue({ profilePic: '' });
    this.resetFileInput();
  }

  private resetFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // Validation Checks
  isProfileInvalid(): boolean {
    const firstName = this.userForm.get('firstName');
    const lastName = this.userForm.get('lastName');
    const email = this.userForm.get('email');
    const phone = this.userForm.get('phone');

    return !!(
      firstName?.invalid ||
      lastName?.invalid ||
      email?.invalid ||
      phone?.invalid
    );
  }

  isPasswordInvalid(): boolean {
    const oldPassword = this.userForm.get('oldPassword')?.value;
    const newPassword = this.userForm.get('newPassword')?.value;
    const confirmPassword = this.userForm.get('confirmPassword')?.value;

    // If no password fields are filled, disable button
    if (!oldPassword && !newPassword && !confirmPassword) {
      return true;
    }

    // If any password field is filled, check for validation errors
    return !!this.userForm.errors;
  }

  // Profile Update
  updateProfile(): void {
    // Mark all fields as touched to show validation errors
    Object.keys(this.userForm.controls).forEach(key => {
      this.userForm.get(key)?.markAsTouched();
    });

    if (this.isProfileInvalid()) {
      alert('Please fix all errors before updating profile');
      return;
    }

    const phoneControl = this.userForm.get('phone');
    const phoneValue = phoneControl?.value;
    
    // Extract E.164 format phone number
    let phoneNumber = '';
    if (phoneValue) {
      phoneNumber = phoneValue.e164Number || phoneValue.internationalNumber || phoneValue;
    }

    const profileData = {
      id: this.userId,
      firstName: this.userForm.get('firstName')?.value.trim(),
      lastName: this.userForm.get('lastName')?.value.trim(),
      email: this.userForm.get('email')?.value.trim(),
      phone: phoneNumber,
    };

    // Create FormData if there's a file to upload
    let requestData: any;
    if (this.selectedFile) {
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        formData.append(key, (profileData as any)[key]);
      });
      formData.append('profilePic', this.selectedFile);
      requestData = formData;
    } else {
      requestData = profileData;
    }

    this.isLoading = true;
    console.log('Updating Profile:', profileData);
    

    this.authService.updateAdminProfile(requestData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['success-snackbar']
        });
        
        
        
        // const storedAdmin = JSON.parse(localStorage.getItem('admin') || '{}');
        // storedAdmin.firstName = profileData.firstName;
        // storedAdmin.lastName = profileData.lastName;
        // storedAdmin.email = profileData.email;
        // storedAdmin.phone = profileData.phone;
        localStorage.setItem('admin', JSON.stringify(requestData));
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error updating profile:', error);
        const errorMessage = error.error?.message || 'Error updating profile';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // Password Change
  changePassword(): void {
    // Mark password fields as touched
    ['oldPassword', 'newPassword', 'confirmPassword'].forEach(field => {
      this.userForm.get(field)?.markAsTouched();
    });

    if (this.isPasswordInvalid()) {
      this.snackBar.open('Please fill all password fields correctly', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['error-snackbar']
      });
      return;
    }

    const passwordData = {
      userId: this.userId,
      oldPassword: this.userForm.get('oldPassword')?.value,
      newPassword: this.userForm.get('newPassword')?.value,
    };

    this.isLoading = true;
    console.log('Changing Password', passwordData);
    
    
    this.authService.changeAdminPassword(passwordData).subscribe({
      next: (response:any) => {
        this.isLoading = false;
        this.snackBar.open('Password changed successfully!', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['success-snackbar']
        });
        this.clearPasswordFields();
      },
      error: (error:any) => {
        this.isLoading = false;
        console.error('Error changing password:', error);
        const errorMessage = error.error?.message || 'Error changing password';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['error-snackbar']
        });
      }
    });
  
  }

  private clearPasswordFields(): void {
    this.userForm.patchValue({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    // Reset touched state
    ['oldPassword', 'newPassword', 'confirmPassword'].forEach(field => {
      const control = this.userForm.get(field);
      control?.markAsUntouched();
      control?.markAsPristine();
    });
  }

  // Helper method to check if a field has error
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field?.hasError(errorType) && field?.touched);
  }

  // Helper method to get form-level errors
  hasFormError(errorType: string): boolean {
    return !!this.userForm.errors?.[errorType];
  }
}