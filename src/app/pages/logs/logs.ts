import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
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
import { EmailTemplateService } from '../../services/EmailTemplateService';
import { FloatingButtonComponent } from '../../component/FloatingButtonComponent';
import { DataTableComponent } from '../../Components/datatable/datatable';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [AgGridAngular, LoaderComponent, RouterLink, RouterModule, AgGridModule,
    MatDialogModule, ConfirmDialogComponent, DataTableComponent],
  templateUrl: './logs.html',
  styleUrls: ['./logs.css'],
})
export class LogsComponent implements OnInit {
  isLoading = false;
  isAddButtonEnabled = false;
    @ViewChild(DataTableComponent) dataTable!: DataTableComponent;

  constructor(private emailService: EmailTemplateService,
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
    
  }
handleExport() {
}

handleActiveChange(event: {row: any, isActive: boolean}) {


}

handleDelete(row: any) {

}
handleEdit(row: any) {
}



columns = [
  { title: 'Name', data: 'adminName' },
  { title: 'Type', data: 'type' },
  { title: 'Activity', data: 'activity' },
  {
    title: 'Timestamp',
    data: 'timeStamp',
    render: function (data: string) {
      if (!data) return '';
      
      const date = new Date(data);
      
      if (isNaN(date.getTime())) return data;
      
      // Convert to IST with proper timezone
      return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    }
  }
];


fetchLogs =(params:any) => this.emailService.getLogs(params);
}
