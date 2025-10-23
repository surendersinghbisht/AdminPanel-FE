import { Component } from '@angular/core';
import { IFloatingFilter, IFloatingFilterParams, GridApi } from 'ag-grid-community';

@Component({
  selector: 'app-floating-button',
  template: `
    <button class="clear-btn" (click)="onClick($event)">
      <i class="fa fa-times"></i>
    </button>
  `,
  styles: [`
    :host {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      height: 100% !important;
      width: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
      box-sizing: border-box;
    }

    .clear-btn {
      color: black;
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      font-size: 14px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      // box-shadow: 0 2px 5px rgba(0,0,0,0.25);
      transition: all 0.2s;
      padding: 0;
    }

    .clear-btn:hover {
      // background-color: #d32f2f;
      transform: scale(1.1);
    }

    .clear-btn i {
      line-height: 1;
    }
  `]
})
export class FloatingButtonComponent implements IFloatingFilter<any> {
  private params!: IFloatingFilterParams;

   agInit(params: IFloatingFilterParams): void {
        this.params = params;
    }

    onParentModelChanged(parentModel: any, filterChangedEvent?: any): void {}

onClick(event: MouseEvent) {
  event.stopPropagation();
  event.preventDefault();

if (!this.params || !this.params.api) return;


 const api: GridApi<any> = this.params.api;  // cast to any to avoid TS errors

  // Clear all filters
  api.setFilterModel(null);

   api.applyColumnState({ 
            defaultState: {
                sort: null,
                sortIndex: null
            }
        });
api.onFilterChanged();
  console.log('All filters and sorting cleared!');
}

}
