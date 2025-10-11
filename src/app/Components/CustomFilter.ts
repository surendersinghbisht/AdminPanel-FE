import { IFloatingFilter, IFloatingFilterParams } from 'ag-grid-community';
import { Component } from '@angular/core';

@Component({
  selector: 'app-custom-active-filter',
  standalone: true,
  template: `
    <select 
      (change)="onChange($event)" 
      [value]="currentValue" 
      class="ag-floating-filter-input">
      <option value="">All</option>
      <option value="Active">Active</option>
      <option value="Inactive">Inactive</option>
    </select>
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      width: 100%;
      height: 100%;
    }

    select.ag-floating-filter-input {
      width: 100%;
      height: 25px !important;
      padding: 0 8px !important;
      margin: 0 !important;
      margin-left: 24px !important;
      margin-top: -14px !important;
      font-size: 14px !important;
      border: 1px solid #d9d9d9 !important;
      // border-radius: 2px !important;
      background-color: #fff !important;
      box-sizing: border-box !important;
      font-family: inherit !important;
      color: #000 !important;
      cursor: pointer !important;
      border-radius: 3px !important;
      /* Add dropdown arrow */
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 8px center;
      padding-right: 28px !important;
    }

    select.ag-floating-filter-input:focus {
      border-color: #1abc9c !important;
      outline: none !important;
    }

    select.ag-floating-filter-input:hover {
      border-color: #b0b0b0 !important;
    }
  `]
})
export class CustomActiveFilter implements IFloatingFilter {
  params!: IFloatingFilterParams;
  currentValue: string = '';

  agInit(params: IFloatingFilterParams): void {
    this.params = params;
  }

  onChange(event: any) {
    this.currentValue = event.target.value;

    this.params.parentFilterInstance((instance: any) => {
      if (this.currentValue === '') {
        instance.setModel(null);
      } else {
        instance.setModel({
          type: 'equals',
          filter: this.currentValue
        });
      }
      this.params.api.onFilterChanged();
    });
  }

  onParentModelChanged(parentModel: any): void {
    this.currentValue = parentModel ? parentModel.filter : '';
  }
}