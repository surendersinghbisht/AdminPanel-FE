import { Component, OnInit } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { ReusableAgGridComponent } from '../../Components/ag-grid-wrapper-component/ag-grid-wrapper-component';
import { AgGridActionCellComponent } from '../../Components/ag-grid-component-cell';

export const DUMMY_USERS = [
  { userId: 1, name: 'John Doe', email: 'john.doe@example.com', phone: '+11234567890', username: 'johndoe', dob: '1990-05-12', role: 'Admin', isActive: true },
  { userId: 2, name: 'Jane Smith', email: 'jane.smith@example.com', phone: '+441234567890', username: 'janesmith', dob: '1988-11-30', role: 'Editor', isActive: false },
  { userId: 3, name: 'Michael Brown', email: 'michael.brown@example.com', phone: '+919876543210', username: 'michaelb', dob: '1995-07-22', role: 'Author', isActive: true }
];

@Component({
  selector: 'app-cms',
  template: `
    <app-reusable-ag-grid
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      (editRow)="onEdit($event)"
      (deleteRow)="onDelete($event)"
      [pagination]="true"
      [pageSize]="10">
    </app-reusable-ag-grid>
  `,
  standalone: true,
  imports: [ReusableAgGridComponent, AgGridActionCellComponent]
})
export class Cms implements OnInit {
  rowData = DUMMY_USERS;

  columnDefs: ColDef[] = [
    { field: 'userId', headerName: 'ID' },
    { field: 'name', headerName: 'Name' },
    { field: 'email', headerName: 'Email' },
    { field: 'phone', headerName: 'Phone' },
    { field: 'username', headerName: 'Username' },
    { field: 'dob', headerName: 'DOB' },
    { field: 'role', headerName: 'Role' },
    { field: 'isActive', headerName: 'Active' },
    {
      headerName: 'Actions',
      field: 'actions',
      cellRenderer: AgGridActionCellComponent,
      cellRendererParams: {
        editClicked: (data: any) => this.onEdit(data),
        deleteClicked: (data: any) => this.onDelete(data)
      },
      width: 100
    }
  ];

  ngOnInit(): void {}

  onEdit(data: any) {
    console.log('Edit clicked:', data);
  }

  onDelete(data: any) {
    console.log('Delete clicked:', data);
  }
}
