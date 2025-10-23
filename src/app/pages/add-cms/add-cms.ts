import { CommonModule } from '@angular/common';
import { Component, Directive, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmailTemplateService } from '../../services/EmailTemplateService';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import {
  ClassicEditor,
  Bold,
  Essentials,
  Italic,
  Paragraph,
  Underline,
  Strikethrough,
  Link,
  BlockQuote,
  Undo,
  Heading,
  List,
  Indent,
  IndentBlock,
  Alignment,
  Font,
  Highlight,
  RemoveFormat,
  Table,
  TableToolbar,
  ImageUpload,
  ImageInsert,
  AutoImage,
  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar
} from 'ckeditor5';
import { LoaderComponent } from '../../Components/loader/loader';
import { CmsService } from '../../services/CmsService';
import { NoConsecutiveSpacesDirective } from '../../../Directives/NoConsecutiveSpace';

interface EmailTemplate {
  name: string;
  subject: string;
  content: string;
}



@Component({
  selector: 'add-cms',
  templateUrl: './add-cms.html',
  styleUrls: ['./add-cms.css'],
  encapsulation: ViewEncapsulation.None,
  imports: [CKEditorModule, FormsModule, CommonModule, ReactiveFormsModule, LoaderComponent, RouterModule, NoConsecutiveSpacesDirective],
  standalone: true
})
export class AddCms implements OnInit {
  isLoading = false;
  isEditMode = false;
  emailForm!: FormGroup;
  isSending = false;
  wordCount = 0;
  characterCount = 0;
  editorData = '<p>Hello, world!</p>';
templateId: string | null = null;

  constructor(
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private cmsService: CmsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
  this.templateId = this.route.snapshot.paramMap.get('id');
if(this.templateId){
  this.isEditMode = true;
  this.getEmailTemplateById();
}
 this.initilizeForm();
  }

  initilizeForm(){
   this.emailForm = this.fb.group({
      key: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      isActive: [true, Validators.required]  // ✅ Default to Active
    });
  }

  // ✅ CKEditor Configuration
  public Editor = ClassicEditor;
  public config: any = {
    licenseKey: 'GPL',
    plugins: [
      Essentials,
      Paragraph,
      Bold,
      Italic,
      Underline,
      Strikethrough,
      Link,
      BlockQuote,
      Undo,
      Heading,
      List,
      Indent,
      IndentBlock,
      Alignment,
      Font,
      Highlight,
      RemoveFormat,
      Table,
      TableToolbar,
      Image,
      ImageCaption,
      ImageStyle,
      ImageToolbar,
      ImageInsert,
      ImageUpload,
      AutoImage
    ],
    toolbar: [
      'undo', 'redo', '|',
      'heading', '|',
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
      'link', 'blockQuote', '|',
      'bulletedList', 'numberedList', '|',
      'outdent', 'indent', 'alignment', '|',
      'insertTable', 'insertImage', '|',
      'highlight', 'removeFormat'
    ],
    placeholder: 'Type your email content here...',
  };

  showSnack(message: string, type: 'success' | 'error' | 'delete') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`${type}-snackbar`]
    });
  }

  getEmailTemplateById(){
    this.isLoading = true;
    this.cmsService.getCmsById(Number(this.templateId)).subscribe({
      next: (response: any) => {
        console.log('cms  fetched successfully:', response);
        this.isLoading = false;
        this.emailForm.patchValue(response);
        this.editorData = response.content;
           this.emailForm.get('key')?.disable({ onlySelf: true, emitEvent: false });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching cms:', error);
        this.snackBar.open('Error loading cms', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onEditorReady(editor: any) {
    this.updateWordCount();
  }

  onEditorChange() {
    this.updateWordCount();
  }

  updateWordCount() {
    const text = this.editorData.replace(/<[^>]*>/g, '');
    this.wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    this.characterCount = text.length;
  }

  getErrorMessage(controlName: string): string {
    const control = this.emailForm.get(controlName);
    if (control?.hasError('required')) return `${this.getFieldLabel(controlName)} is required`;
    if (control?.hasError('email')) return 'Please enter a valid email address';
    if (control?.hasError('minlength')) return `Minimum ${control.errors?.['minlength'].requiredLength} characters required`;
    if (control?.hasError('maxlength')) return `Maximum ${control.errors?.['maxlength'].requiredLength} characters allowed`;
    return '';
  }

  getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      key: 'Key',
      title: 'Title',
      subject: 'Subject',
      isActive: 'Status'
    };
    return labels[controlName] || controlName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.emailForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
clearForm() {
  if (this.isEditMode) {
    const currentKey = this.emailForm.get('key')?.value;

    this.emailForm.reset({
      key: currentKey, 
      isActive: true   
    });

    this.emailForm.get('key')?.disable({ onlySelf: true, emitEvent: false });
  } else {
    this.emailForm.reset();
    this.initilizeForm();
  }

  this.editorData = '<p></p>';
}

  saveAsDraft() {
    const draft = {
      formData: this.emailForm.value,
      content: this.editorData,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('emailDraft', JSON.stringify(draft));
    this.showSnack('Draft saved successfully', 'success');
  }

  loadDraft() {
    const draftStr = localStorage.getItem('emailDraft');
    if (draftStr) {
      const draft = JSON.parse(draftStr);
      this.emailForm.patchValue(draft.formData);
      this.editorData = draft.content || '<p></p>';
      this.showSnack('Draft loaded successfully', 'success');
    } else {
      this.showSnack('No draft found', 'error');
    }
  }

private trimFormValues() {
  Object.keys(this.emailForm.controls).forEach(key => {
    const control = this.emailForm.get(key);
    if (control && typeof control.value === 'string') {
      control.setValue(control.value.trim(), { emitEvent: false });
    }
  });
}


  saveEmail() {

 this.trimFormValues();

    if (this.emailForm.invalid) {
      this.showSnack('Please fill all required fields correctly', 'error');
      return;
    }

    this.isSending = true;

    const payload = {
      ...this.emailForm.getRawValue(),
      content: this.editorData
    };

    if(this.isEditMode){
      this.isLoading = true;
      console.log('Updating cms:', payload);
      this.cmsService.updateCms(Number(this.templateId), payload).subscribe({
        next: (data: any) => {
          this.isLoading = false;
          this.showSnack('cms updated successfully', 'success');
          this.router.navigate(['/cms']);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error updating cms:', err);
           this.snackBar.open(err.error, 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
          this.isSending = false;
        }
      });
    }else {
      this.isLoading = true;
    this.cmsService.createCms(payload).subscribe({
      next: (data: any) => {
        this.isLoading = false;
        this.showSnack('cms created successfully', 'success');
        this.router.navigate(['/cms']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error creating cms:', err);
         this.snackBar.open(err.error, 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        this.isSending = false;
       
      }
    });
    }


  }
  
}
