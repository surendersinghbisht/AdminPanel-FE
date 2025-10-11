import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';

@Component({
  selector: 'app-reusable-ag-grid',
  templateUrl: './ag-grid-wrapper-component.html',
  styleUrls: ['./ag-grid-wrapper-component.css'],
  imports: [AgGridAngular],
})
export class ReusableAgGridComponent implements OnInit {
  @Input() rowData: any[] = [];
  @Input() columnDefs: ColDef[] = [];
  @Input() title: string = '';
  @Input() showAddButton: boolean = false;
  @Input() showExport: boolean = false;
  @Input() pagination: boolean = true;
  @Input() pageSize: number = 10;
  @Input() rowHeight: number = 50;

  @Output() editRow = new EventEmitter<any>();
  @Output() deleteRow = new EventEmitter<any>();
  @Output() addClicked = new EventEmitter<void>();

  gridApi!: GridApi;

  gridHeight = 'calc(100vh - 220px)'; // default grid wrapper height

  ngOnInit() {}

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  exportCsv() {
    if (this.gridApi) {
      this.gridApi.exportDataAsCsv({ fileName: 'grid-data.csv' });
    }
  }

  onAddClick() {
    this.addClicked.emit();
  }
}
