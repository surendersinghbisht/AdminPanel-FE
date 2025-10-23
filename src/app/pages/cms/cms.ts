import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Role, RoleService } from '../../services/RoleService';
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { Router, RouterModule } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { LoaderComponent } from '../../Components/loader/loader';
import { RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomButtonComponent } from '../../Components/ActionRenderComponent';
import { CustomActiveFilter } from '../../Components/CustomFilter';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../Components/Dialog';
import { CmsService } from '../../services/CmsService';
import { CommonModule } from '@angular/common';
import { FloatingButtonComponent } from '../../component/FloatingButtonComponent';
import { DataTableComponent } from '../../Components/datatable/datatable';

@Component({
  selector: 'app-cms',
  imports: [AgGridAngular, LoaderComponent, RouterLink, RouterModule, CommonModule, DataTableComponent],
  templateUrl: './cms.html',
  styleUrl: './cms.css'
})
export class Cms implements OnInit {
    isLoading = false;
    @ViewChild(DataTableComponent) dataTable!: DataTableComponent;
  rowData: any[] = [];
  gridApi!: GridApi;
permissionToAdd = true;
permissionToUpdate = true;
permissionToDelete = true;

  constructor(
    private cmsService: CmsService,
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
  if(perm.permissionName === 'Cms'){
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
  this.router.navigate(['/add-cms']);
}

handleActiveChange(event: {row: any, isActive: boolean}) {
  console.log('event',event)
    let payload = {
      id: event.row.id,
      isActive: event.isActive
    }
    console.log('payload',payload)
  this.cmsService.updateActiveStatus(payload).subscribe({
    next: () => {
     this.dataTable.reloadTable(()=>{
    this.showSnack('Status Updated Successfully', 'success');

     });
    
    },
            error: (err: any) => {
              console.error('CMS update error:', err);
              this.showSnack('Error updating CMS', 'error');

            }
  });

}

handleDelete(row: any) {
   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Delete CMS',
          message: 'Are you sure you want to delete this CMS?',
          confirmText: 'Delete',
          cancelText: 'Cancel'
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.cmsService.deleteCms(row.id).subscribe({
            next: () => {
              this.dataTable.reloadTable(()=>{
              this.showSnack('CMS Deleted Successfully', 'success');
              });

            },
            error: (err: any) => {
              console.error('CMS delete error:', err);
              this.showSnack('Error deleting CMS', 'error');

            }
          });
        }
      });
  console.log('Delete:', row);
}
handleEdit(row: any) {
this.router.navigate([`edit-cms/${row.id}`]);
}



   columns = [
  // { title: 'ID', data: 'userId' },
  { title: 'Key', data: 'key' },
  { title: 'Title', data: 'title' },
  { title: 'Short Description', data: 'description' },

];

fetchcms =(params:any) => this.cmsService.getcmss(params);


}