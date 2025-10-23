import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { EmailTemplateService } from '../../services/EmailTemplateService';
import { FloatingButtonComponent } from '../../component/FloatingButtonComponent';
import { DataTableComponent } from "../../Components/datatable/datatable";
import { ViewChild } from '@angular/core';
@Component({
  selector: 'manage-email-template',
  imports: [AgGridAngular, LoaderComponent, RouterLink, RouterModule, DataTableComponent],
  templateUrl: './manage-email-template.html',
  styleUrl: './manage-email-template.css'
})
export class ManageEmailTemplate implements OnInit {
     permissionToAdd = true;
permissionToUpdate = true;
permissionToDelete = true;
  rowData: Role[] = [];
  isLoading = false;
     @ViewChild(DataTableComponent) dataTable!: DataTableComponent;
  constructor(
    private templateService: EmailTemplateService,
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
  if(perm.permissionName === 'Email Template'){
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
  this.router.navigate(['/add-email-template']);
}

handleActiveChange(event: {row: any, isActive: boolean}) {
  console.log('event',event)
    let payload = {
      id: event.row.id,
      isActive: event.isActive
    }
    console.log('payload',payload)
  this.templateService.updateActiveStatus(payload).subscribe({
    next: () => {
     this.dataTable.reloadTable(()=>{
    this.showSnack('Status Updated Successfully', 'success');

     });
    
    },
            error: (err: any) => {
              console.error('Template update error:', err);
              this.showSnack('Error updating template', 'error');

            }
  });

}

handleDelete(row: any) {
   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Delete Template',
          message: 'Are you sure you want to delete this template?',
          confirmText: 'Delete',
          cancelText: 'Cancel'
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.templateService.deleteEmailTemplate(row.id).subscribe({
            next: () => {
              this.dataTable.reloadTable(()=>{
              this.showSnack('Template Deleted Successfully', 'success');
              });

            },
            error: (err: any) => {
              console.error('Template delete error:', err);
              this.showSnack('Error deleting template', 'error');

            }
          });
        }
      });
  console.log('Delete:', row);
}
handleEdit(row: any) {
this.router.navigate([`edit-template/${row.id}`]);
}



   columns = [
  // { title: 'ID', data: 'userId' },
  { title: 'Key', data: 'key' },
  { title: 'Title', data: 'title' },
  { title: 'Subject', data: 'subject' },

];

fetchTemplates =(params:any) => this.templateService.getEmailTemplates(params);
}