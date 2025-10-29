import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, getAdminFromLocalHost } from '../../services/AuthService';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { LoaderComponent } from '../../Components/loader/loader';
import { Role, RoleService } from '../../services/RoleService';
import { ActivatedRoute } from '@angular/router';
import { AngularPhoneNumberInput } from 'angular-phone-number-input';
import { formatDate } from '@angular/common';
import { finalize } from 'rxjs/operators';


function nameValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return { required: true };

  // Trim leading/trailing spaces
  const trimmed = control.value.trim();

  if (trimmed.length < 2) return { minlength: { requiredLength: 2, actualLength: trimmed.length } };
  if (trimmed.length > 50) return { maxlength: { requiredLength: 50, actualLength: trimmed.length } };

  // Only letters and single spaces between words
  const regex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
  if (!regex.test(trimmed)) return { pattern: true };

  return null;
} 

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxIntlTelInputModule, LoaderComponent, AngularPhoneNumberInput, RouterModule],
  templateUrl: './add-user.html',
  styleUrls: ['./add-user.css'],
  encapsulation: ViewEncapsulation.None
})
export class AddUserComponent implements OnInit {
  isEditMode = false;
  userId: string | null = null;
  userForm!: FormGroup;
  photoPreview: string | ArrayBuffer | null = null;
  photoError: string = '';
  photoFile: File | null = null;
  photoRemoved: boolean = false;
  today: string = this.getTodayDate();
  roles: string[] = [];
  isLoading = false;
  PhoneNumberFormat = PhoneNumberFormat;
  phoneHasBeenInteracted = false;
  
  // Role search properties
  filteredRoles: string[] = [];
  showRoleDropdown: boolean = false;
  roleSearchTerm: string = '';
  separateDialCode = false;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.India];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private roleService: RoleService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.getAllRoles();

    // Fix phone initial touched state
    setTimeout(() => {
      const phoneControl = this.userForm.get('phone');
      phoneControl?.markAsUntouched();
    }, 100);

    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.isEditMode = true;
      this.getUserById(this.userId);
      const passwordControl = this.userForm.get('password');
      passwordControl?.clearValidators();
      passwordControl?.setValidators([Validators.minLength(8), Validators.maxLength(50), this.passwordStrengthValidator]);
      passwordControl?.updateValueAndValidity();
    }
  }

  preventConsecutiveSpaces(event: KeyboardEvent, controlName: string) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (event.key === ' ' && (value.endsWith(' ') || value.length === 0)) {
      event.preventDefault();
    }
  }

  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  getUserById(userId: string): void {
    this.isLoading = true;
    this.authService.getUserById(Number(userId)).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('User fetched successfully:', response);
        console.log('DOB from response:', response.dob);
  
        // Format DOB as yyyy-MM-dd
       if (response.dob) {
  const dob = new Date(response.dob);
  response.dob = formatDate(dob, 'yyyy-MM-dd', 'en-US'); // ensures correct local date format
}

        // Load existing photo preview
        if (response.filePath) {
          const cleanPath = response.filePath.replace(/^\/+/, '');
          this.photoPreview = `https://localhost:7164/${cleanPath}`;
          console.log('Photo preview URL:', this.photoPreview);
        } else {
          this.photoPreview = null;
        }

        // Reset flags
        this.photoRemoved = false;
        this.photoFile = null;

        // Set role search term for edit mode
        this.roleSearchTerm = response.role || '';
        
        // Patch form with response data
        this.userForm.patchValue({
          id: response.id,
          name: response.name,
          email: response.email,
          phone: response.phone,
          username: response.username,
          dob: response.dob,
          role: response.role,
          isActive: response.isActive,
          filePath: response.filePath
        });
        
        console.log('Form values after patch:', this.userForm.value);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching user:', error);
        this.snackBar.open('Error loading user details', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[A-Za-z\s]*$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: ['', [Validators.required]], 
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50), Validators.pattern(/^[A-Za-z0-9]+$/)]],
      dob: ['', [Validators.required, this.futureDateValidator]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50), this.passwordStrengthValidator]],
      role: ['', Validators.required],
      isActive: [true, Validators.required],
      filePath: [''],
    });
  }

private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.value;
  if (!password) return null;

  // Must have:
  // - At least 1 uppercase letter
  // - At least 1 digit
  // - At least 1 special character (@$!%*?&)
  // - Between 8 and 50 characters
  const pattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/;

  return pattern.test(password) ? null : { weakPassword: true };
}


  phoneValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value || !value.number || value.number.trim() === '') {
      return { required: true };
    }

    if (value.validationErrors || value.isValid === false) {
      return { validatePhoneNumber: { message: 'The phone number format is invalid.' } };
    }
    
    return null;
  }

  get f() {
    return this.userForm.controls;
  }

  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate > today ? { futureDate: true } : null;
  }

  onPhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    this.photoError = '';
    this.photoPreview = null;
    this.photoFile = null;
    this.photoRemoved = false;

    if (!file) {
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      this.photoError = 'Only JPG, JPEG, or PNG formats are allowed.';
      input.value = '';
      return;
    }

    const maxSizeMB = 2;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      this.photoError = `File size must be less than ${maxSizeMB} MB.`;
      input.value = '';
      return;
    }

    this.photoFile = file;
    
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.photoPreview = e.target?.result || null;
    };
    reader.onerror = () => {
      this.photoError = 'Error reading file. Please try again.';
      this.photoFile = null;
    };
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    console.log('Removing photo - setting photoRemoved flag to true');
    this.photoPreview = null;
    this.photoError = '';
    this.photoFile = null;
    this.photoRemoved = true;
    
    const fileInput = document.getElementById('photo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  resetForm(): void {
    this.userForm.reset({
      isActive: true
    });
    this.removePhoto();
    this.photoRemoved = false;
    this.roleSearchTerm = '';
    this.filteredRoles = [...this.roles];
  }

  getAllRoles(): void {
    this.roleService.getAllRoleNames().subscribe({
      next: (response: any) => {
        this.filteredRoles = response;
        this.roles = response;
      },
      error: (error) => {
        console.error('Error fetching roles:', error);
        this.snackBar.open('Error loading roles', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onRoleInputFocus(): void {
    this.showRoleDropdown = true;
    this.filterRoles(this.roleSearchTerm);
  }

  onRoleInputBlur(): void {
    setTimeout(() => {
      this.showRoleDropdown = false;
    }, 200);
  }

  onRoleSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.roleSearchTerm = input.value;
    this.filterRoles(this.roleSearchTerm);
  }

  filterRoles(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredRoles = [...this.roles];
    } else {
      const term = searchTerm.toLowerCase().trim();
      this.filteredRoles = this.roles.filter(role => 
        role.toLowerCase().includes(term)
      );
    }
  }

  selectRole(role: string): void {
    this.roleSearchTerm = role;
    this.userForm.patchValue({ role: role });
    this.userForm.get('role')?.markAsTouched();
    this.showRoleDropdown = false;
  }

  clearRoleSelection(): void {
    this.roleSearchTerm = '';
    this.userForm.patchValue({ role: '' });
    this.filteredRoles = [...this.roles];
    this.showRoleDropdown = false;
  }

submitForm(): void {
  this.markFormGroupTouched(this.userForm);

  if (this.userForm.invalid) {
    this.snackBar.open('Please fill the required fields correctly!', 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
    return;
  }

  const nameControl = this.userForm.get('name');
  const usernameControl = this.userForm.get('username');
  if (nameControl?.value) nameControl.setValue(nameControl.value.trim());
  if (usernameControl?.value) usernameControl.setValue(usernameControl.value.trim());

  this.userForm.disable();
  this.isLoading = true;

  const formData = this.prepareFormData();

  const request$ = this.isEditMode && this.userId
    ? this.authService.updateUser(formData)
    : this.authService.addUser(formData);

  request$
    .pipe(finalize(() => {
      // Always re-enable the form and stop loader, even on error
      this.userForm.enable();
      this.isLoading = false;
    }))
    .subscribe({
      next: (response) => {
        const message = this.isEditMode
          ? 'User updated successfully!'
          : 'User added successfully!';

        this.snackBar.open(message, 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });

        this.router.navigate(['/users']);
      },
      error: (error) => {
        const errorMessage = error?.error?.message || 
          (this.isEditMode 
            ? 'Failed to update user. Please try again.' 
            : 'Failed to add user. Please try again.');

        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });

        console.error('Error submitting user:', error);
      }
    });
}

  private prepareFormData(): FormData {
    const formValue = this.userForm.value;
    
    const formData = new FormData();
    
    // Always append userId (empty string for new users)
    formData.append('userId', formValue.id || '');
    formData.append('name', formValue.name);
    formData.append('email', formValue.email);
    formData.append('phone', formValue.phone?.e164Number || formValue.phone || '');
    formData.append('username', formValue.username);
    
    // CRITICAL: Always append DOB if it exists
    if (formValue.dob) {
      formData.append('dob', formValue.dob);
      console.log('DOB being sent:', formValue.dob);
    } else {
      console.warn('DOB is missing from form!');
    }
    
    formData.append('role', formValue.role);
    formData.append('isActive', formValue.isActive.toString());
    
    const admin = getAdminFromLocalHost();
    formData.append('AdminName', admin.name);
    
    // Handle password - only send if it has a value (for edit mode)
    if (formValue.password && formValue.password.trim() !== '') {
      formData.append('password', formValue.password);
      console.log('Password is being sent');
    } else {
      console.log('Password is empty, not sending');
    }
    
    // Handle photo scenarios
    if (this.photoFile) {
      formData.append('FilePath', this.photoFile, this.photoFile.name);
      formData.append('RemoveCurrentImage', 'false');
      console.log('Sending new photo:', this.photoFile.name);
    } else if (this.photoRemoved) {
      formData.append('RemoveCurrentImage', 'true');
      console.log('Photo removal flag set to true');
    } else {
      formData.append('RemoveCurrentImage', 'false');
      console.log('No photo change');
    }
    
    // Debug: Log all FormData entries
    console.log('=== FormData Contents ===');
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });
    console.log('========================');

    return formData;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field?.hasError(errorType) && (field.dirty || field.touched));
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field?.invalid && (field.dirty || field.touched));
  }
}