import { Component, Input, Output, EventEmitter, AfterViewInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import 'datatables.net-bs5';
import 'datatables.net-buttons-bs5';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../loader/loader';

declare var $: any;

@Component({
  selector: 'app-data-table',
  imports: [CommonModule, LoaderComponent],
  templateUrl: './datatable.html',
  styleUrls: ['./datatable.css']
})
export class DataTableComponent implements AfterViewInit, OnDestroy {
  @Input() title!: string;
  @Input() subtitle?: string;
  @Input() columns!: any[]; 
  @Input() addButtonText = 'Add';
  @Input() exportButtonText = 'Export';
  @Input() addButtonRoute = '';
  @Input() enableExport = true;
  @Input() enableActions = false;
  @Input() enableEdit = true;
  @Input() enableDelete = true;
  @Input() enableIsActive = false;
  @Input() loaderType: 'spinner' | 'skeleton' | 'dots' = 'spinner';
  @Input() isAddButtonEnabled = true;

  @Input() permissionToAdd = false;
  @Input() permissionToUpdate = true;
  @Input() permissionToDelete = true;

  @Output() onAdd = new EventEmitter<void>();
  @Output() onExport = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onActiveChange = new EventEmitter<{row: any, isActive: boolean}>();
  
  @Input() fetchDataFn!: (params: any) => Observable<any>;

  dtInstance: any;
  dtTrigger: Subject<void> = new Subject<void>();
  isLoading = false;
  columnSearchValues: { [key: number]: string } = {};
  isClearingFilters = false;
  isExporting = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.loadTable();
      // Attach event delegation immediately
      this.attachGlobalEventListeners();
    }, 0);
  }

  private attachGlobalEventListeners() {
    const self = this;
    
    console.log('Attaching global event listeners');

  document.addEventListener('keyup', function(e: any) {
  if (self.isClearingFilters) return; // skip during clearFilters

  const target = e.target as HTMLElement;
  if (target.tagName === 'INPUT' && (target as HTMLInputElement).classList.contains('form-control')) {
    const $th = $(target).closest('th');
    if ($th.closest('thead').length > 0) {
      const index = $th.index();
      const searchValue = (target as HTMLInputElement).value;
      self.columnSearchValues[index] = searchValue;
      clearTimeout((target as any).debounceTimer);
      (target as any).debounceTimer = setTimeout(() => {
        if (self.dtInstance) self.dtInstance.ajax.reload();
      }, 1000);
    }
  }
}, true);

document.addEventListener('change', function(e: any) {
  if (self.isClearingFilters) return; // skip during clearFilters

  const target = e.target as HTMLElement;
  if (target.tagName === 'SELECT' && (target as HTMLSelectElement).classList.contains('form-control')) {
    const $th = $(target).closest('th');
    if ($th.closest('thead').length > 0) {
      const index = $th.index();
      const searchValue = (target as HTMLSelectElement).value;
      self.columnSearchValues[index] = searchValue;
      if (self.dtInstance) self.dtInstance.ajax.reload();
    }
  }

     if (target.tagName === 'INPUT' && (target as HTMLInputElement).classList.contains('timestamp-filter')) {
    const $th = $(target).closest('th');
    const index = $th.index();
    self.columnSearchValues[index] = (target as HTMLInputElement).value; // YYYY-MM-DD
    if (self.dtInstance) self.dtInstance.ajax.reload();
  }
}, true);

    
    // Clear all filters button
    document.addEventListener('click', function(e: any) {
      const target = e.target as HTMLElement;
      
      if (target.closest('.clear-all-filters')) {
        e.preventDefault();
        e.stopPropagation();
        self.clearFilters();
      }
    }, true);
  }

  loadTable() {
    const self = this;
    const tableColumns = this.columns.map(col => ({
      ...col,
      defaultContent: col.defaultContent || ''
    }));

      tableColumns.unshift({
    data: 'id',   // make sure this matches the property from your backend
    title: 'ID',
    visible: false    // hide it from view
  });

    // Add IsActive column if enabled
   if (this.enableIsActive) {
  tableColumns.push({
    title: 'Is Active?',
    data: 'isActive',
    width: '100px',
    orderable: false,
    searchable: true,
    defaultContent: '',
    className: 'is-active-cell text-center',
    render: (data: any, type: any, row: any, meta: any) => {
      const isChecked = row.isActive === true || row.isActive === 'true' || row.isActive === 1;
      return `
        <div class="form-check form-switch">
          <input class="form-check-input active-toggle" type="checkbox" ${isChecked ? 'checked' : ''} data-row="${meta.row}">
        </div>
      `;
    }
  });
}


    // Always show Actions column
    tableColumns.push({
      title: 'Actions',
      data: 'id',
      orderable: false,
      searchable: false,
      defaultContent: '',
      className: 'actions-cell text-center',
      render: (data: any, type: any, row: any, meta: any) => {
        let actionButtons = '<div class="action-buttons">';
        
        if (self.enableEdit) {
          actionButtons += `
            <button class="btn btn-sm btn-action btn-edit" data-row="${meta.row}" title="Edit">
              <i class="fa-solid fa-pen"></i>
            </button>
          `;
        }

        if (self.enableDelete) {
          actionButtons += `
            <button class="btn btn-sm btn-action btn-delete" data-row="${meta.row}" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          `;
        }

        if (!self.enableEdit && !self.enableDelete) {
          actionButtons += `<span class="text-muted small fst-italic"></span>`;
        }

        actionButtons += '</div>';
        return actionButtons;
      }
    });
    
    // DataTables setup
    
    this.dtInstance = $('#reusableDataTable').DataTable({
      serverSide: true,
      processing: false,
      searching: false,
      ordering: true,
       order: [[0, 'desc']],
      ajax: (dataTablesParameters: any, callback: any) => {
  this.isLoading = true;

  // IMPORTANT: Only inject search values if they actually exist
  if (dataTablesParameters.columns) {
    for (let i = 0; i < dataTablesParameters.columns.length; i++) {
      const searchValue = this.columnSearchValues[i - 1];
      dataTablesParameters.columns[i].search = {
        value: searchValue !== undefined && searchValue !== null ? searchValue : '',
        regex: false
      };
    }
  }

  console.log('📤 Sending to backend:', dataTablesParameters);
  console.log('🔍 Current columnSearchValues:', this.columnSearchValues);

  self.fetchDataFn(dataTablesParameters).subscribe({
    next: (resp: any) => {
      this.isLoading = false;
      callback({
        recordsTotal: resp.recordsTotal || 0,
        recordsFiltered: resp.recordsFiltered || 0,
        data: resp.data || []
      });
    },
    error: (err: any) => {
      console.error('Data fetch error:', err);
      this.isLoading = false;
      callback({
        recordsTotal: 0,
        recordsFiltered: 0,
        data: []
      });
    }
  });
},
      columns: tableColumns,
      scrollX: true,
      responsive: false,
      destroy: true,
      pageLength: 10,
      lengthMenu: [[10, 25, 50, 100], [10, 25, 50, 100]],
      orderCellsTop: true,
      fixedHeader: false,
        pagingType: 'simple',
      dom:
    "<'row mb-3'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
    "<'row'<'col-sm-12'tr>>" +
    "<'row mt-3'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
      language: {
        emptyTable: "No data available",
        zeroRecords: "No matching records found",
         paginate: {
      previous: '<i class="fas fa-chevron-left"></i>',
      next: '<i class="fas fa-chevron-right"></i>'
    }
      },
      drawCallback: () => {
        this.attachActionListeners();
      }
    });

    // Backup setup in case
    setTimeout(() => {
      console.log('Backup: checking if listeners are working');
    }, 1000);
  }

  private attachActionListeners() {
    const self = this;

    $('.btn-edit').off('click').on('click', function(this: HTMLElement) {
      const rowIndex = $(this).data('row');
      const rowData = self.dtInstance.row(rowIndex).data();
      self.onEdit.emit(rowData);
    });

    $('.btn-delete').off('click').on('click', function(this: HTMLElement) {
      const rowIndex = $(this).data('row');
      const rowData = self.dtInstance.row(rowIndex).data();
      self.onDelete.emit(rowData);
    });

    $('.active-toggle').off('change').on('change', function(this: HTMLInputElement) {
      const rowIndex = $(this).data('row');
      const rowData = self.dtInstance.row(rowIndex).data();
      self.onActiveChange.emit({
        row: rowData,
        isActive: this.checked
      });
    });
  }
  
clearFilters() {
  const self = this;
  console.log('🔴 clearFilters called');

  // 1) Disable global search events temporarily
  self.isClearingFilters = true;

  // 2) Reset columnSearchValues
  self.columnSearchValues = {};
  console.log('✅ columnSearchValues reset');

  // 3) Clear all inputs/selects in headers (original + cloned)
  const dispatch = (el: Element, eventName: string) => {
    const evt = new Event(eventName, { bubbles: true, cancelable: true });
    el.dispatchEvent(evt);
  };

  const headers = Array.from(document.querySelectorAll('#reusableDataTable thead, #reusableDataTable_wrapper thead, .dataTables_scrollHead thead, .fixedHeader-floating thead'));

  headers.forEach((thead) => {
    // text inputs
    const inputs = thead.querySelectorAll('input[type="text"], input[type="search"], input.form-control') as NodeListOf<HTMLInputElement>;
    inputs.forEach((input) => {
      input.value = '';
      dispatch(input, 'input');
      dispatch(input, 'keyup');
      dispatch(input, 'change');
    });

    // select inputs
    const selects = thead.querySelectorAll('select.form-control, select') as NodeListOf<HTMLSelectElement>;
    selects.forEach((select) => {
      select.selectedIndex = 0;
      dispatch(select, 'change');
    });
  });

  // 4) Clear DataTables column search state
  if (self.dtInstance) {
    self.dtInstance.columns().every(function(this: any) {
      this.search('');
    });
    self.dtInstance.search('');
    self.dtInstance.order([[0, 'desc']]); // optional: reset default ordering
  }

  // 5) Reload table once
  if (self.dtInstance) {
    self.dtInstance.ajax.reload(() => {
      self.isClearingFilters = false; // re-enable global events
      console.log('✅ DataTable reloaded after clearing filters');
    }, true);
  }
}


 reloadTable(callback?: () => void) {
  if (this.dtInstance) {
    this.dtInstance.ajax.reload(() => {
      if (callback) callback(); 
    }, false);
  }
}

  addAction() {
    if (this.addButtonRoute) {
      window.location.href = this.addButtonRoute;
    } else {
      this.onAdd.emit();
    }
  }

 exportAction() {
  if (!this.dtInstance) return;

  // Get all rows currently loaded (filtered/search applied)
  const tableData = this.dtInstance.rows({ search: 'applied' }).data().toArray();

  if (!tableData || tableData.length === 0) {
    console.warn('No data available to export');
    return;
  }

  // Prepare CSV headers
  const headers = this.columns.map(col => col.title);
  if (this.enableIsActive) headers.push('Is Active?');
  const csvRows = [headers.join(',')];

  // Prepare CSV rows
  tableData.forEach((row: any) => {
    const rowValues = this.columns.map(col => {
      let value = row[col.data];
      if (value === null || value === undefined) value = '';
      // Escape quotes
      value = value.toString().replace(/"/g, '""');
      return `"${value}"`;
    });

    if (this.enableIsActive) {
      const isActive = row.isActive === true || row.isActive === 'true' || row.isActive === 1;
      rowValues.push(isActive ? 'Active' : 'Inactive');
    }

    csvRows.push(rowValues.join(','));
  });

  // Convert to blob and trigger download
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${this.title.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    if (this.dtInstance) {
      this.dtInstance.destroy(true);
    }
  }
}