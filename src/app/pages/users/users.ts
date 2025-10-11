import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import type { ColDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AuthService, User } from '../../services/AuthService';
import { LoaderComponent } from '../../Components/loader/loader';
import { RouterLink, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CustomButtonComponent } from '../../Components/ActionRenderComponent';
import { CustomActiveFilter } from '../../Components/CustomFilter';
import { ConfirmDialogComponent } from '../../Components/Dialog';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';


export function BtnCellRenderer() {}

BtnCellRenderer.prototype.init = function(params: any) {
  this.eGui = document.createElement('div');
  this.eGui.innerHTML = `
    <button class="action-button view-btn">View</button>
    <button class="action-button edit-btn">Edit</button>
  `;

  const viewButton = this.eGui.querySelector('.view-btn');
  viewButton.addEventListener('click', () => {
    alert(`Viewing data for: ${params.data.make}`);
  });
};

BtnCellRenderer.prototype.getGui = function() {
  return this.eGui;
};

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [AgGridAngular, LoaderComponent, RouterLink, RouterModule, AgGridModule,
     MatDialogModule, ConfirmDialogComponent],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})
export class UsersComponent implements OnInit {
  isLoading = false;
  rowData: User[] = [];
  private gridApi!: GridApi;

  constructor(private authService: AuthService,
    private cd: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {}

  
  ngOnInit(): void {
  this.getAllUsers();
  }

 public getAllUsers(){
    this.isLoading = true; 

    this.authService.getAlluser().subscribe({
      next: (data: User[]) => {
        console.log('Fetched users:', data);
        this.rowData = data;
        this.isLoading = false; 
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.isLoading = false;
      },
    });
  }

// In your component class
gridOptions: GridOptions = {
  suppressPaginationPanel: false,
  paginationPageSizeSelector: [10, 20, 50, 100],
  paginationPageSize: 10,
  // Force AG Grid to not use compact pagination on mobile
  suppressPropertyNamesCheck: true,
  paginationAutoPageSize: true,
  suppressScrollOnNewData: true,
  domLayout: 'autoHeight',
};


onGridReady(params: GridReadyEvent) {
  this.gridApi = params.api;

  // Use pagination API properly
  if (this.gridApi.paginationIsLastPageFound !== undefined) {
    // cast to PaginationApi
    (this.gridApi as any).setPaginationPageSize(10); // temporary fix
  }

  // Remove AG Grid "small" class for mobile
  const gridDiv = document.querySelector('.ag-theme-alpine');
  if (gridDiv) {
    gridDiv.classList.remove('ag-small');
  }
}

  onExport() {
    if (this.gridApi) {
      this.gridApi.exportDataAsCsv({
        fileName: 'users.csv',       // ✅ file name
        columnSeparator: ',',        // default
        suppressQuotes: false,       // optional
      });
    }
  }

  columnDefs: ColDef<any>[] = [
    // { field: 'userId', headerName: 'ID', sortable: true, filter: true },
    { field: 'name', headerName: 'Name', sortable: true, filter: true,floatingFilter: true },
    { field: 'email', headerName: 'Email', sortable: true, filter: true,floatingFilter: true },
    { field: 'phone', headerName: 'Phone', sortable: true, filter: true,floatingFilter: true },
    { field: 'username', headerName: 'Username', sortable: true, filter: true,floatingFilter: true },
    // { 
    //   field: 'dob', 
    //   headerName: 'Date of Birth', 
    //   sortable: true, 
    //   filter: true,
    //   floatingFilter: true,
    //   valueFormatter: params => params.value ? new Date(params.value).toLocaleDateString() : ''
    // },
    { field: 'role', headerName: 'Role', sortable: true, filter: true, floatingFilter: true },
    {
      field: 'isActive',
      headerName: 'IsActive?',
      sortable: true,
      filter: 'agTextColumnFilter',   // can be any filter, we will control via custom floating filter
  floatingFilter: true,
  valueGetter: params => params.data.isActive ? 'Active' : 'Inactive',
  valueFormatter: params => params.value,
  floatingFilterComponent: CustomActiveFilter,
      cellRenderer: (params: any) => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = params.data.isActive; // use boolean
        checkbox.style.width = '15px';   // default is ~16px
        checkbox.style.height = '15px';
        checkbox.style.transform = 'scale(1.2)';  // optional for extra enlargement
        checkbox.style.margin = '0 auto';
        // Listen for change
        checkbox.addEventListener('change', (event: any) => {
          const newStatus = event.target.checked;
    
          // Call API to update status
          this.authService.updateUserStatus({
            userId: params.data.userId,
            isActive: newStatus
          }).subscribe({
            next: (res: any) => {
              params.data.isActive = newStatus; // update grid row
              params.api.refreshCells({ rowNodes: [params.node], columns: ['isActive'] });
    
              this.snackBar.open(
                'User status updated successfully!', 'Close', {
                  duration: 3000,
                  horizontalPosition: 'end',
                  verticalPosition: 'top',
                  panelClass: ['success-snackbar']
                }
              );
            },
            error: (err: any) => {
              checkbox.checked = !newStatus; // revert on error
              this.snackBar.open(
                'Error updating user status!', 'Close', {
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
        filter:false,
        sortable:false,
        showDelete: true,
        onEdit: (user: User) => this.router.navigate([`/edit-user/${user.userId}`]),
        onDelete: (user: User) => {
          this.deleteUser(user.userId);
        }
      }
    }
  ];

  
  deleteUser(userId: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this user?'
      },
      disableClose: true,
      width: '350px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
    this.authService.deleteUser(userId).subscribe({
      next: () => {
        this.snackBar.open(
          'User deleted successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          }
        );
        this.getAllUsers(); 
      },
      error: (err) => {
        console.error('Error deleting user:', err);
        this.snackBar.open('Error deleting user!', 'Close', { duration: 3000 });
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
