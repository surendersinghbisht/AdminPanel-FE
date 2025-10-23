import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../services/AuthService';
import { DataTableComponent } from "../../Components/datatable/datatable";
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../Components/Dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
// Declare jQuery and DataTables for TypeScript
declare var $: any;
declare var jQuery: any;

@Component({
  selector: 'app-user-datatable',
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
  imports: [DataTableComponent]
})  
export class UsersComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;
permissionToAdd = true;
permissionToUpdate = true;
permissionToDelete = true;

 constructor(private userService: AuthService, private router: Router, private dialog: MatDialog, private snackBar: MatSnackBar){}

 ngOnInit(): void {
   const permissions =JSON.parse(localStorage.getItem('rolesWithPermissions') || '[]');
permissions.forEach((perm: any) => {
  if(perm.permissionName === 'User'){
    this.permissionToAdd = perm.canCreate;
    this.permissionToUpdate = perm.canUpdate;
    this.permissionToDelete = perm.canDelete;
  }
}
)

 }

 columns = [
  // { title: 'ID', data: 'userId' },
  { title: 'Name', data: 'name' },
  { title: 'Email', data: 'email' },
  { title: 'Phone', data: 'phone' },
  { title: 'Role', data: 'role' }
];

fetchUsers = (params: any) => this.userService.getUsers(params);

  handleAdd() {
    this.router.navigate(['add-user']);
  }

  handleExport() {
    alert('Export users');
}

handleEdit(row: any) {
  console.log('asdsadsad',row)
this.router.navigate([`edit-user/${row.id}`]);
}

 showSnack(message: string, type: 'success' | 'error' | 'delete') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`${type}-snackbar`]
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
          this.userService.deleteUser(row.id).subscribe({
            next: () => {
              this.dataTable.reloadTable(()=>{
              this.showSnack('User Deleted Successfully', 'success');
              });

            },
            error: (err: any) => {
              console.error('User delete error:', err);
              this.showSnack('Error deleting user', 'error');

            }
          });
        }
      });
  console.log('Delete:', row);
}

handleActiveChange(event: {row: any, isActive: boolean}) {
    let payload = {
      UserId: event.row.id,
      IsActive: event.isActive
    }
  this.userService.updateUserStatus(payload).subscribe({
    next: () => {
     this.dataTable.reloadTable(()=>{
    this.showSnack('Status Updated Successfully', 'success');

     });
    
    },
            error: (err: any) => {
              console.error('User delete error:', err);
              this.showSnack('Error deleting user', 'error');

            }
  });

}
}