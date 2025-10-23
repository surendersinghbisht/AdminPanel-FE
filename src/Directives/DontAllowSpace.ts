import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appNoSpaces]'
})
export class NoSpacesDirective {
  constructor(private control: NgControl) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const pastedInput: string = event.clipboardData?.getData('text') || '';
    if (pastedInput.includes(' ')) {
      event.preventDefault();
    }
  }
}
