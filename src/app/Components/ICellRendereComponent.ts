import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { User } from '../services/AuthService';

@Component({
  selector: 'app-isactive-cell',
  template: `
    <input type="checkbox" [checked]="params.value" (change)="onChange($event)" />
  `
})
export class IsActiveCellRendererComponent implements ICellRendererAngularComp {
  params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    return false;
  }

  onChange(event: any) {
    const newStatus = event.target.checked;
    this.params.context.componentParent.authService.updateUserStatus({
      userId: this.params.data.userId,
      isActive: newStatus
    }).subscribe({
      next: () => {
        this.params.data.isActive = newStatus;
        this.params.api.refreshCells({ rowNodes: [this.params.node], columns: ['isActive'] });
        this.params.context.componentParent.snackBar.open('User status updated successfully!', 'Close', { duration: 3000 });
      },
      error: () => {
        event.target.checked = !newStatus;
        this.params.context.componentParent.snackBar.open('Error updating user status!', 'Close', { duration: 3000 });
      }
    });
  }
}
