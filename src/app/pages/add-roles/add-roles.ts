import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { RoleService } from '../../services/RoleService';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from "../../Components/loader/loader";
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-add-role',
  templateUrl: './add-roles.html',
  imports: [ReactiveFormsModule, CommonModule, LoaderComponent],
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
      this.getRoleDetail();
    }

    this.roleForm = this.fb.group({
      roleName: ['', Validators.required],
      shortDescription: ['', Validators.required],
      status: ['active', Validators.required],
      permissions: this.fb.array([])
    });

    this.getAllPermissions();
  } 

  getRoleDetail(){
    this.isLoading = true;
    this.roleService.getRoleDetail(Number(this.roleId)).subscribe({
      next: (response: any) => {
        console.log('Role fetched successfully:', response);
        this.roleForm.patchValue({
          roleName: response.roleName,
          shortDescription: response.shortDescription,
          status: response.isActive ? 'active' : 'inactive',
          permissions: response.permission.map((perm: any) => {
            return {
              permissionName: perm.permissionName,
              permissionId: perm.permissionId,
              list: perm.canRead,
              add: perm.canCreate,
              edit: perm.canUpdate,
              delete: perm.canDelete
            };
          })
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
    console.log('peroper',this.roleForm.get('permissions')?.value as FormArray);
    return this.roleForm.get('permissions') as FormArray;
  }

  getAllPermissions() {
    this.isLoading = true;
    this.roleService.getAllPermissions().subscribe({
      next: (response: any[]) => {
        const permsArray = this.permissionsArray;
        permsArray.clear();

        response.forEach(p => {
          console.log('Permission data:', p);
          // Check if p.name exists, otherwise try p.permissionName
          const name = p.name || p.permissionName || 'Unknown Permission';
          permsArray.push(this.fb.group({
            permissionName: [name],
            permissionId: [p.id],
            list: [false],
            add: [false],
            edit: [false],
            delete: [false]
          }));
        });
        console.log('Permissions array after load:', permsArray.value);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading permissions:', err);
        this.isLoading = false;
      }
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

    if(this.isEditMode && this.roleId) {
      console.log('edit mode', this.roleId);
      this.isLoading = true;
      this.roleService.updateRole(this.roleForm.value, Number(this.roleId)).subscribe({
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
    this.roleService.addRole(this.roleForm.value).subscribe({
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
