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
@Component({
  selector: 'app-roles',
  imports: [AgGridAngular, LoaderComponent, RouterLink, RouterModule],
  templateUrl: './roles.html',
  styleUrl: './roles.css'
})
export class Roles implements OnInit {
  rowData:Role[]=[];
isLoading=false;
gridApi!: GridApi;
constructor(private roleRervice: RoleService,private cd: ChangeDetectorRef,private snackBar: MatSnackBar,
private router: Router,
private dialog: MatDialog

){
  }
    onGridReady(params: GridReadyEvent) {
      this.gridApi = params.api;
    }
  
    onExport() {
      if (this.gridApi) {
        this.gridApi.exportDataAsCsv({
          fileName: 'roles.csv',
          columnSeparator: ',',
          suppressQuotes: false,
        });
      }
    }

  ngOnInit(): void {
    this.getAllRoles();
  }

  getAllRoles() {
    this.isLoading=true;
    this.roleRervice.getAllRoles().subscribe({
      next: (data: Role[]) => {
        console.log('Fetched roles:', data);
        
        this.rowData = data;
        this.isLoading = false; 
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching roles:', err);
        this.isLoading = false;
      },
    });
  }

    columnDefs: ColDef<any>[] = [
      // { field: 'id', headerName: 'ID', sortable: true, filter: true,floatingFilter: true },
      { field: 'roleName', headerName: 'Name', sortable: true, filter: true,floatingFilter: true },
      { field: 'shortDescription', headerName: 'Email', sortable: true, filter: true,floatingFilter: true },
      { field: 'isActive', headerName: 'isActive?',sortable: true, filter: true, floatingFilter: true, floatingFilterComponent: CustomActiveFilter,
        valueGetter: params => params.data.isActive ? 'Active' : 'Inactive',
  valueFormatter: params => params.value,
        cellRenderer: (params: any) => {
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.checked = params.value;
          checkbox.checked = params.data.isActive; // use boolean
          checkbox.style.width = '15px';   // default is ~16px
          checkbox.style.height = '15px';
          checkbox.style.transform = 'scale(1.2)';  // optional for extra enlargement
          checkbox.style.margin = '0 auto';
      
          checkbox.addEventListener('change', (event: any) => {
            const newStatus = event.target.checked;
      
            params.context.componentParent.roleRervice.updateRoleActiveStatus({
              id: params.data.id,
              isActive: newStatus
            }).subscribe({
              next: (res: any) => {
                params.data.isActive = newStatus;
                params.api.refreshCells({ rowNodes: [params.node], columns: ['isActive'] });
      
                this.snackBar.open(
                  'role status updated successfully!', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top',
                    panelClass: ['success-snackbar']
                  }
                );
              },
              error: (err: any) => {
                checkbox.checked = !newStatus;
                this.snackBar.open(
                  'Error updating role status!', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top',
                    panelClass: ['error-snackbar']
                  }
                );
              }
            });
          });
      
          return checkbox;
        },
        cellRendererParams: {},
       },
       {
        field: 'Action',
        headerName: 'Action',
        cellRenderer: CustomButtonComponent,
        minWidth: 120,
         cellRendererParams: {
          showEdit: true,
          showDelete: true,
          onEdit: (role: Role) => this.router.navigate([`/edit-role/${role.id}`]),
          onDelete: (role: Role) => {
            this.deleteRole(role.id);
          }
        }
      }
    ];
    
    deleteRole(roleId:number) {
      console.log(roleId);
     const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Delete Role',
          message: 'Are you sure you want to delete this role?',
          confirmText: 'Delete',
          cancelText: 'Cancel'
        }
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
        this.roleRervice.deleteRole(roleId).subscribe({
          next: () => {
            this.snackBar.open(
              'Role deleted successfully!', 'Close', {
                duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            }
          );
          this.getAllRoles(); 
        },
        error: (err) => {
          console.error('Error deleting role:', err);
          this.snackBar.open('Error deleting role!', 'Close', { duration: 3000 });
        },
      });
    }
    });
    }
  
    defaultColDef: ColDef<any> = {
      flex: 1,
      minWidth: 120,
      resizable: true,
      sortable: true,
    filter: true,
    };
}
