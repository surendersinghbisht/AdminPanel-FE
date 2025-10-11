import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-permissions',
  templateUrl: './permission.html',
imports: [FormsModule, ReactiveFormsModule, CommonModule],
  styleUrls: ['./permission.css']
})
export class PermissionsComponent {
  @Input() permissionsFormArray!: FormArray; 
  @Input() mainPermission: any; 
}
