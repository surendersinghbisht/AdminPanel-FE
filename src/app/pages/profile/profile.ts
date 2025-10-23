import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../services/AuthService';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
import { LoaderComponent } from '../../Components/loader/loader';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoConsecutiveSpacesDirective } from '../../../Directives/NoConsecutiveSpace';
import { NoSpacesDirective } from '../../../Directives/DontAllowSpace';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxIntlTelInputModule, LoaderComponent, NoConsecutiveSpacesDirective, NoSpacesDirective]
})
export class ProfileComponent implements OnInit {

  userForm!: FormGroup;
  isLoading: boolean = false;
  user: any;
  userId!: number;
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  imageRemoved: boolean = false;
  today: string = this.getTodayDate();

  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedStates];
  
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Convenience getter for form controls
  get f() {
    return this.userForm.controls;
  }

  getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = ('0' + (today.getMonth() + 1)).slice(-2);
  const day = ('0' + today.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

  togglePasswordVisibility(field: 'old' | 'new' | 'confirm'): void {
    switch(field) {
      case 'old':
        this.showOldPassword = !this.showOldPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      Name: ['', [
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
      phone: ['', [Validators.required]],
      username: ['', [
        Validators.required, 
        Validators.minLength(4), 
        Validators.maxLength(50), 
        Validators.pattern(/^[A-Za-z0-9]+$/)
      ]],
       dob: [
        '', 
        [
          Validators.required, 
          this.futureDateValidator
        ]
      ],
      oldPassword: [''],
      newPassword: ['', [this.passwordStrengthValidator]],
      confirmPassword: [''],
      role: [{ value: '', disabled: true }],
      status: [{ value:'', disabled: true }],
      filePath: [''],
      userId: ['']
    }, { 
      validators: this.passwordConditionalValidator 
    });
  }

   futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }

  const inputDate = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day

  // Compare only dates, ignore time
  inputDate.setHours(0, 0, 0, 0);

  return inputDate > today ? { futureDate: true } : null;
}


  ngOnInit(): void {
    this.loadUserProfile();
  }

  private trimFormValues() {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      if (control && typeof control.value === 'string' && key !== 'oldPassword' && key !== 'newPassword' && key !== 'confirmPassword') {
        control.setValue(control.value.trim(), { emitEvent: false });
      }
    });
  }

  private loadUserProfile(): void {
    const storedUser = localStorage.getItem('user');
    this.userId = storedUser ? Number(JSON.parse(storedUser).id) : 0;

    if (!this.userId) {
      console.error('No user ID found');
      return;
    }

    this.authService.getUserById(this.userId).subscribe({
      next: (response) => {
        this.user = response;
        this.populateForm(response);
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
        this.snackBar.open('Error loading profile. Please refresh the page.', 'Close', {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
      }
    });
  }

private formatDateForInput(dateValue: any): string {
  if (!dateValue || new Date(dateValue).getFullYear() === 1) {
    // handle null or 0001-01-01
    return '';
  }

  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}




  private populateForm(userData: any): void {
    this.userForm.patchValue({
      Name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: this.user.role,
      status: this.user.isActive ? 'Active' : 'Inactive',
      username: this.user.username,
      userId: userData.id, 
      filePath: userData.filePath,
      dob: this.formatDateForInput(userData.dob)
    });

    // Handle image preview - check multiple possible properties
    if (userData.filePath) {
      // Remove any leading slashes to avoid double slashes
      const cleanPath = userData.filePath.replace(/^\/+/, '');
      this.imagePreview = `https://localhost:7164/${cleanPath}`;
    } else if (userData.filePath) {
      // Check if filePath is a full URL or relative path
      if (userData.filePath.startsWith('http')) {
        this.imagePreview = userData.filePath;
      } else {
        const cleanPath = userData.filePath.replace(/^\/+/, '');
        this.imagePreview = `https://localhost:7164/${cleanPath}`;
      }
    } else {
      this.imagePreview = null;
    }
    
    console.log('Image preview set to:', this.imagePreview);
    
    this.imageRemoved = false;
    this.selectedFile = null;

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    storedUser.firstName = userData.firstName;
    storedUser.lastName = userData.lastName;
    storedUser.email = userData.email;
    storedUser.phone = userData.phone;
    storedUser.filePath = userData.filePath;
    localStorage.setItem('user', JSON.stringify(storedUser));

    setTimeout(() => {
      this.clearPasswordFields();
    }, 100);
  }

  private noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace && control.value ? { whitespace: true } : null;
  }

  private emailValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    if (!email) return null;
    
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email) ? null : { invalidEmail: true };
  }

  private prepareFormData(): FormData {
    const formValue = this.userForm.value;
    
    const formData = new FormData();
    formData.append('userId', formValue.userId);
    formData.append('Name', formValue.Name);
    formData.append('email', formValue.email);
    formData.append('phone', formValue.phone?.e164Number || formValue.phone || '');
    formData.append('username', formValue.username);
    formData.append('role', this.user.role);
    formData.append('dob', formValue.dob);

   
    if (this.selectedFile) {
      formData.append('filePath', this.selectedFile, this.selectedFile.name);
      formData.append('RemoveCurrentImage', 'false');
      console.log('Sending new image:', this.selectedFile.name);
    } else if (this.imageRemoved) {
      formData.append('RemoveCurrentImage', 'true');
      console.log('Image removal flag set to true');
    } else {
      formData.append('RemoveCurrentImage', 'false');
      console.log('No image change');
    }
    
    return formData;
  }

  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const pattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/;

    return pattern.test(password) ? null : { weakPassword: true };
  }

  passwordConditionalValidator(group: AbstractControl): ValidationErrors | null {
    const oldPassword = group.get('oldPassword')?.value;
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    // If none of the password fields are filled, no validation needed
    if (!oldPassword && !newPassword && !confirmPassword) {
      return null;
    }

    const errors: ValidationErrors = {};

    // If any password field is filled, all must be filled
    if (oldPassword || newPassword || confirmPassword) {
      if (!oldPassword) {
        errors['oldRequired'] = true;
      }

      if (!newPassword) {
        errors['newRequired'] = true;
      } else if (newPassword.length < 8) {
        errors['passwordLength'] = true;
      } else {
        // Check for password strength
        const hasUppercase = /[A-Z]/.test(newPassword);
        const hasNumber = /\d/.test(newPassword);
        const hasSpecialChar = /[@$!%*?&]/.test(newPassword);

        if (!hasUppercase || !hasNumber || !hasSpecialChar) {
          errors['passwordLength'] = true; // Using same error key as shown in template
        }
      }

      if (!confirmPassword) {
        errors['confirmRequired'] = true;
      } else if (newPassword && confirmPassword && newPassword !== confirmPassword) {
        errors['mismatch'] = true;
      }
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file: File | null = input.files?.[0] || null;
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.snackBar.open('Please select a valid image file (JPEG, PNG, GIF, or WebP)', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['error-snackbar']
      });
      this.resetFileInput();
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.snackBar.open('Image size should be less than 5MB', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['error-snackbar']
      });
      this.resetFileInput();
      return;
    }

    this.selectedFile = file;
    this.imageRemoved = false;
    this.userForm.patchValue({ filePath: file.name });

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.imagePreview = e.target?.result as string;
    };
    reader.onerror = () => {
      this.snackBar.open('Error reading file', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['error-snackbar']
      });
      this.resetFileInput();
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    console.log('Removing image - setting imageRemoved flag to true');
    this.imagePreview = null;
    this.selectedFile = null;
    this.imageRemoved = true;
    this.userForm.patchValue({ filePath: '' });
    this.resetFileInput();
  }

  private resetFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  isProfileInvalid(): boolean {
    const name = this.userForm.get('Name');
    const email = this.userForm.get('email');
    const phone = this.userForm.get('phone');
    const username = this.userForm.get('username');

    return !!(
      name?.invalid ||
      email?.invalid ||
      phone?.invalid ||
      username?.invalid
    );
  }

  isPasswordInvalid(): boolean {
    const oldPassword = this.userForm.get('oldPassword')?.value;
    const newPassword = this.userForm.get('newPassword')?.value;
    const confirmPassword = this.userForm.get('confirmPassword')?.value;

    // If all fields are empty, button should be disabled
    if (!oldPassword && !newPassword && !confirmPassword) {
      return true;
    }

    // If any field has value, check for validation errors
    return !!this.userForm.errors;
  }

  updateProfile(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      if (key !== 'oldPassword' && key !== 'newPassword' && key !== 'confirmPassword') {
        this.userForm.get(key)?.markAsTouched();
      }
    });
    this.trimFormValues();
    
    if (this.isProfileInvalid()) {
      this.snackBar.open('Please fix all errors before updating profile', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;
    const formData = this.prepareFormData();
    
    console.log('Updating profile with imageRemoved flag:', this.imageRemoved);
    
    this.authService.updateUser(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['success-snackbar']
        });
        
        this.loadUserProfile();
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

  changePassword(): void {
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
    
    console.log('Changing password for user:', passwordData);
    this.authService.changeAdminPassword(passwordData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.snackBar.open('Password changed successfully!', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['success-snackbar']
        });
        this.clearPasswordFields();
      },
      error: (error: any) => {
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
    
    ['oldPassword', 'newPassword', 'confirmPassword'].forEach(field => {
      const control = this.userForm.get(field);
      control?.markAsUntouched();
      control?.markAsPristine();
      control?.setErrors(null);
    });
    
    // Clear form-level errors
    this.userForm.setErrors(null);
  }

  removeReadonly(event: Event) {
  const input = event.target as HTMLInputElement;
  input.removeAttribute('readonly');
  input.focus();
}
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field?.hasError(errorType) && field?.touched);
  }

  hasFormError(errorType: string): boolean {
    return !!this.userForm.errors?.[errorType];
  }
}