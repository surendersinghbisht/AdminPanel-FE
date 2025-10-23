import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Role, RoleService } from '../../services/RoleService';
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { Router, RouterModule } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { LoaderComponent } from '../../Components/loader/loader';
import { RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DataTableComponent } from "../../Components/datatable/datatable"; 
import { ConfirmDialogComponent } from '../../Components/Dialog';

@Component({
  selector: 'app-roles',
  imports: [AgGridAngular, LoaderComponent, RouterLink, RouterModule, DataTableComponent, ConfirmDialogComponent],
  templateUrl: './roles.html',
  styleUrl: './roles.css'
})
export class Roles implements OnInit {
permissionToAdd = true;
permissionToUpdate = true;
permissionToDelete = true;
    
  constructor(
    private roleRervice: RoleService,
    private cd: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {}

   showSnack(message: string, type: 'success' | 'error' | 'delete') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`${type}-snackbar`]
    });
  }

  ngOnInit(): void {
    const permissions =JSON.parse(localStorage.getItem('rolesWithPermissions') || '[]');
permissions.forEach((perm: any) => {
  if(perm.permissionName === 'Role'){
    this.permissionToAdd = perm.canCreate;
    this.permissionToUpdate = perm.canUpdate;
    this.permissionToDelete = perm.canDelete;
  }
}
)
  }
handleExport() {
}
handleAdd() {
  this.router.navigate(['/add-roles']);
}
handleActiveChange(event: {row: any, isActive: boolean}) {
    let payload = {
      id: event.row.id,
      IsActive: event.isActive
    }
  this.roleRervice.updateRoleActiveStatus(payload).subscribe({
    next: () => {
     this.dataTable.reloadTable(()=>{
    this.showSnack('Status Updated Successfully', 'success');

     });
    
    },
            error: (err: any) => {
              console.error('Role delete error:', err);
              this.showSnack('Error updating role', 'error');

            }
  });

}
handleDelete(row: any) {
   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Delete Role',
          message: 'Are you sure you want to delete this role?',
          confirmText: 'Delete',
          cancelText: 'Cancel'
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.roleRervice.deleteRole(row.id).subscribe({
            next: () => {
              this.dataTable.reloadTable(()=>{
              this.showSnack('Role Deleted Successfully', 'success');
              });

            },
            error: (err: any) => {
              console.error('Role delete error:', err);
              this.showSnack('Error deleting role', 'error');

            }
          });
        }
      });
  console.log('Delete:', row);
}
handleEdit(row: any) {
this.router.navigate([`edit-role/${row.id}`]);
}

  rowData: Role[] = [];
  isLoading = false;
     @ViewChild(DataTableComponent) dataTable!: DataTableComponent;


   columns = [
  // { title: 'ID', data: 'userId' },
  { title: 'Name', data: 'name' },
  { title: 'Short Description', data: 'shortDescription' },
];

fetchRoles =(params:any) => this.roleRervice.getRoles(params);

 
}