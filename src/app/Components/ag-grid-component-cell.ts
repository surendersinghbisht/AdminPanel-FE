import { Component, ElementRef } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-ag-grid-action-cell',
  template: `
    <i class="fas fa-ellipsis-v" (click)="openMenu($event)"></i>
  `,
  styles: [`
    i {
      cursor: pointer;
      font-size: 16px;
    }
  `]
})
export class AgGridActionCellComponent implements ICellRendererAngularComp {
  params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    return true;
  }

  openMenu(event: MouseEvent) {
    event.stopPropagation();

    // Remove any existing popup
    const existing = document.getElementById('ag-action-popup');
    if (existing) existing.remove();

    // Create popup
    const popup = document.createElement('div');
    popup.id = 'ag-action-popup';
    popup.style.position = 'absolute';
    popup.style.top = event.clientY + 'px';
    popup.style.left = event.clientX + 'px';
    popup.style.background = 'white';
    popup.style.border = '1px solid #ccc';
    popup.style.borderRadius = '4px';
    popup.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    popup.style.zIndex = '9999';
    popup.style.minWidth = '80px';

    // Buttons
    const editBtn = document.createElement('button');
    editBtn.innerText = 'Edit';
    editBtn.style.width = '100%';
    editBtn.style.padding = '6px 10px';
    editBtn.style.border = 'none';
    editBtn.style.background = 'none';
    editBtn.style.cursor = 'pointer';
    editBtn.onclick = () => {
      popup.remove();
      if (this.params.editClicked) this.params.editClicked(this.params.data);
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'Delete';
    deleteBtn.style.width = '100%';
    deleteBtn.style.padding = '6px 10px';
    deleteBtn.style.border = 'none';
    deleteBtn.style.background = 'none';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.onclick = () => {
      popup.remove();
      if (this.params.deleteClicked) this.params.deleteClicked(this.params.data);
    };

    popup.appendChild(editBtn);
    popup.appendChild(deleteBtn);

    // Close popup on outside click
    const closePopup = (e: any) => {
      if (!popup.contains(e.target)) {
        popup.remove();
        document.removeEventListener('click', closePopup);
      }
    };
    document.addEventListener('click', closePopup);

    // Add to body
    document.body.appendChild(popup);
  }
}
