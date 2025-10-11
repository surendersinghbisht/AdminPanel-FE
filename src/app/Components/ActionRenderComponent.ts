import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';  // ✅ import CommonModule

@Component({
  selector: 'app-custom-button',
  standalone: true,
  imports: [CommonModule], 
  template: `
    <div class="action-icons">
      <svg *ngIf="params?.showEdit"
           class="icon icon-edit"
           title="Edit"
           (click)="onEdit()"
           xmlns="http://www.w3.org/2000/svg"
           fill="currentColor"
           viewBox="0 0 24 24">
        <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM21.41 6.34c.38-.38.38-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
      </svg>

      <svg *ngIf="params?.showDelete"
           class="icon icon-delete"
           title="Delete"
           (click)="onDelete()"
           xmlns="http://www.w3.org/2000/svg"
           fill="currentColor"
           viewBox="0 0 24 24">
        <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1z"/>
      </svg>
    </div>
  `,
  styles: [`
    .action-icons { display: flex; gap: 10px; justify-content: center; align-items: center; }
    .icon { width: 25px; height: 25px; cursor: pointer; color: #6b7280; transition: transform 0.2s ease, color 0.2s ease; }
    .icon-edit:hover { color: #1a73e8; transform: scale(1.3); }
    .icon-delete:hover { color: #e53935; transform: scale(1.3); }
  `]
})
export class CustomButtonComponent implements ICellRendererAngularComp {
  params!: any;

  constructor(private snackBar: MatSnackBar) {}

  agInit(params: ICellRendererParams & { onEdit?: Function; onDelete?: Function; showEdit?: boolean; showDelete?: boolean; }): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams): boolean {
    this.params = params;
    return true;
  }

  onEdit() {
    if (this.params?.onEdit) this.params.onEdit(this.params.data);
  }

  onDelete() {
    if (this.params?.onDelete) this.params.onDelete(this.params.data);
  }
}
