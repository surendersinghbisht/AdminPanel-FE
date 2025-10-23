import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { RoleService } from '../../services/RoleService';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from "../../Components/loader/loader";
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-add-role',
  templateUrl: './add-roles.html',
  imports: [ReactiveFormsModule, CommonModule, LoaderComponent, RouterModule],
  styleUrls: ['./add-roles.css']
})
export class AddRoleComponent implements OnInit {
  isLoading = false;
  isEditMode = false;
  roleId: string | null = null;
  roleForm!: FormGroup;
  mainPermissions: any[] = [];
  expandedPermissions = new Set<number>(); 
  
  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute    
  ) {}

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id');
    if (this.roleId) {
      this.isEditMode = true;
    }

    this.roleForm = this.fb.group({
      roleName: ['',  [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      shortDescription: ['',  [Validators.required, Validators.minLength(4), Validators.maxLength(100)]],
      status: ['active', Validators.required],
      permissions: this.fb.array([])
    });

    // CRITICAL FIX: Load permissions first, then role details
    this.getAllPermissions().then(() => {
      if (this.isEditMode && this.roleId) {
        this.getRoleDetail();
      }
    });

    this.roleForm.valueChanges.subscribe(() => {
      Object.keys(this.roleForm.controls).forEach(key => {
        const control = this.roleForm.get(key);
        control?.updateValueAndValidity({ onlySelf: true });
      });
    });
  } 

  private trimFormValues() {
    Object.keys(this.roleForm.controls).forEach(key => {
      const control = this.roleForm.get(key);
      if (control && typeof control.value === 'string') {
        control.setValue(control.value.trim(), { emitEvent: false });
      }
    });
  }

  preventConsecutiveSpaces(event: KeyboardEvent, controlName: string) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (event.key === ' ' && (value.endsWith(' ') || value.length === 0)) {
      event.preventDefault();
    }
  }

  getRoleDetail() {
    this.isLoading = true;
    this.roleService.getRoleDetail(Number(this.roleId)).subscribe({
      next: (response: any) => {
        console.log('Role fetched successfully:', response);
        
        // Patch basic form values
        this.roleForm.patchValue({
          roleName: response.roleName,
          shortDescription: response.shortDescription,
          status: response.isActive ? 'active' : 'inactive'
        });

        // Create a map of permissions from the response
        const rolePermissionsMap = new Map<number, { list: boolean; add: boolean; edit: boolean; delete: boolean }>(
          response.permission.map((perm: any) => [
            perm.permissionId,
            {
              list: perm.canRead,
              add: perm.canCreate,
              edit: perm.canUpdate,
              delete: perm.canDelete
            }
          ])
        );

        console.log('Role permissions map:', rolePermissionsMap);
        console.log('Permissions array controls count:', this.permissionsArray.controls.length);

        // Update permissions FormArray
        this.permissionsArray.controls.forEach((control: AbstractControl) => {
          const permissionId = control.get('permissionId')?.value;
          const rolePermission = rolePermissionsMap.get(permissionId);
          
          if (rolePermission) {
            console.log(`Patching permission ${permissionId}:`, rolePermission);
            control.patchValue({
              list: rolePermission.list,
              add: rolePermission.add,
              edit: rolePermission.edit,
              delete: rolePermission.delete
            });
          }
        });

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching role:', error);
        this.isLoading = false;
      }
    });
  }

  get permissionsArray(): FormArray {
    return this.roleForm.get('permissions') as FormArray;
  }

  private toPascalCase(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word[0].toUpperCase() + word.slice(1))
      .join(' ');
  }

  getAllPermissions(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isLoading = true;
      this.roleService.getAllPermissions().subscribe({
        next: (response: any[]) => {
          const permsArray = this.permissionsArray;
          permsArray.clear();

          response.forEach(p => {
            const name = this.toPascalCase(p.name || p.permissionName || 'Unknown Permission');
            permsArray.push(this.fb.group({
              permissionName: [name],
              permissionId: [p.id],
              list: [false],
              add: [false],
              edit: [false],
              delete: [false]
            }));
          });
          
          console.log('Permissions loaded:', permsArray.length);
          this.isLoading = false;
          resolve();
        },
        error: (err) => {
          console.error('Error loading permissions:', err);
          this.isLoading = false;
          reject(err);
        }
      });
    });
  }

  toggleExpand(index: number) {
    if (this.expandedPermissions.has(index)) {
      this.expandedPermissions.delete(index);
    } else {
      this.expandedPermissions.add(index);
    }
  }

  selectAllPermissions() {
    this.permissionsArray.controls.forEach(group => {
      group.get('list')?.setValue(true);
      group.get('add')?.setValue(true);
      group.get('edit')?.setValue(true);
      group.get('delete')?.setValue(true);
    });
  }

  unselectAllPermissions() {
    this.permissionsArray.controls.forEach(group => {
      group.get('list')?.setValue(false);
      group.get('add')?.setValue(false);
      group.get('edit')?.setValue(false);
      group.get('delete')?.setValue(false);
    });
  }

  onSubmit() {
    this.trimFormValues();
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return;
    }

    const formValue = { ...this.roleForm.value };
    formValue.roleName = formValue.roleName.trim();
    formValue.shortDescription = formValue.shortDescription.trim();

    if(this.isEditMode && this.roleId) {
      console.log('edit mode', this.roleId);
      this.isLoading = true;
      this.roleService.updateRole(formValue, Number(this.roleId)).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.snackBar.open('Role updated successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/roles']);
          this.roleForm.reset();
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open(err.error || 'Error updating role', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
      return;
    }

    this.isLoading = true;
    this.roleService.addRole(formValue).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.snackBar.open('Role added successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']  
        });
        this.router.navigate(['/roles']);
        this.roleForm.reset();
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(err.error || 'Error adding role', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}