import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/AuthService';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
import { LoaderComponent } from '../../Components/loader/loader';
import { Role, RoleService } from '../../services/RoleService';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxIntlTelInputModule, LoaderComponent],
  templateUrl: './add-user.html',
  styleUrls: ['./add-user.css'],
  encapsulation: ViewEncapsulation.None

})
export class AddUserComponent implements OnInit {
    isEditMode = false
    userId: string | null = null;
  userForm!: FormGroup;
  photoPreview: string | ArrayBuffer | null = null;
  photoError: string = '';
  photoFile: File | null = null;
  today: string = new Date().toISOString().split('T')[0];
  roles:string[] = [];
  isLoading = false;
  
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
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.isEditMode = true;
      this.getUserById(this.userId);
    }
  }

  getUserById(userId: string) {
    this.authService.getUserById(Number(userId)).subscribe({
      next: (response) => {
        console.log('User fetched successfully:', response);
  
        // Format DOB as yyyy-MM-dd
        if (response.dob) {
          const dob = new Date(response.dob);
          response.dob = dob.toISOString().split('T')[0]; // "yyyy-MM-dd"
        }
  
        this.userForm.patchValue(response);
      },
      error: (error) => {
        console.error('Error fetching user:', error);
      }
    });
  }
  

  private initializeForm(): void {
    this.userForm = this.fb.group({
      name: [
        '', 
        [
          Validators.required, 
          Validators.minLength(2), 
          Validators.maxLength(50), 
          Validators.pattern(/^[A-Za-z ]+$/)
        ]
      ],
      email: [
        '', 
        [
          Validators.required, 
          Validators.email, 
          Validators.maxLength(100)
        ]
      ],
      phone: [undefined, [this.phoneValidator]],
      username: [
        '', 
        [
          Validators.required, 
          Validators.minLength(4), 
          Validators.maxLength(50), 
          Validators.pattern(/^[A-Za-z0-9]+$/)
        ]
      ],
      dob: [
        '', 
        [
          Validators.required, 
          this.futureDateValidator
        ]
      ],
      role: ['', Validators.required],
      isActive: [true, Validators.required]
    });
  }

  phoneValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
  
    if (!value || !value.number) {
      // empty or invalid object
      return { required: true };
    }
  
    // Optionally: check length or number validity
    const digitsOnly = value.number.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return { invalidPhone: true };
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
    
    return inputDate > today ? { futureDate: true } : null;
  }

  onPhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    // Reset previous state
    this.photoError = '';
    this.photoPreview = null;
    this.photoFile = null;

    if (!file) {
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      this.photoError = 'Only JPG, JPEG, or PNG formats are allowed.';
      input.value = ''; // Clear the input
      return;
    }

    // Validate file size (2MB max)
    const maxSizeMB = 2;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      this.photoError = `File size must be less than ${maxSizeMB} MB.`;
      input.value = ''; // Clear the input
      return;
    }

    // All validations passed, store file and create preview
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
    this.photoPreview = null;
    this.photoError = '';
    this.photoFile = null;
    
    // Clear the file input
    const fileInput = document.getElementById('photo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  resetForm(): void {
    this.userForm.reset({
      isActive: true // Set default value for isActive
    });
    this.removePhoto();
  }

  getAllRoles(){
    let rolesArr:string[] = [];
this.roleService.getAllRoles().subscribe({
  next: (response:Role[]) => {
    response.filter((role:Role)=> role.isActive).forEach((role:Role)=> {
      rolesArr.push(role.roleName);
    })
    this.roles = rolesArr;
  },
  error: (error) => {
    console.error('Error fetching roles:', error);
  }
})
  }

  submitForm(): void {
    this.markFormGroupTouched(this.userForm);

    if (this.userForm.invalid) {
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;

    const formData = this.prepareFormData();

    const payload = {
      ...this.userForm.value,
      userId: this.userId,
      phone: this.userForm.value.phone?.e164Number,
      dob: this.userForm.value.dob,
      isActive: this.userForm.value.isActive === true || this.userForm.value.isActive === 'true'
    };
    
    if(this.isEditMode && this.userId) {
      this.authService.updateUser(payload).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open('User updated successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/users']);
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error?.error?.message || 'Failed to update user. Please try again.';
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
          console.error('Error updating user:', error);
        }
      })
    } else{

    // Submit to API
    this.authService.addUser(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open('User added successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error?.error?.message || 'Failed to add user. Please try again.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        console.error('Error adding user:', error);
      }
    });
  }
  }

  private prepareFormData(): FormData | any {
    const formValue = this.userForm.value;

    // If photo exists, use FormData for multipart upload
    if (this.photoFile) {
      const formData = new FormData();
      formData.append('name', formValue.name);
      formData.append('email', formValue.email);
      formData.append('phone', JSON.stringify(formValue.phone)); // ngx-intl-tel-input returns object
      formData.append('username', formValue.username);
      formData.append('dob', formValue.dob);
      formData.append('role', formValue.role);
      formData.append('isActive', formValue.isActive.toString());
      formData.append('photo', this.photoFile, this.photoFile.name);
      return formData;
    }

    // Otherwise send as JSON
    return {
      ...formValue,
      phone: formValue.phone // Keep phone as object or convert as needed
    };
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