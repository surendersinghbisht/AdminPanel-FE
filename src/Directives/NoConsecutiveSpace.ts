import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appNoConsecutiveSpaces]',
  standalone: true
})
export class NoConsecutiveSpacesDirective {

  constructor(private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;

    // Remove consecutive spaces AND leading spaces
    let newValue = input.value
      .replace(/\s{2,}/g, ' ')  // replace consecutive spaces with single space
      .replace(/^\s+/g, '');    // remove spaces at the beginning

    if (newValue !== input.value) {
      input.value = newValue;
      this.ngControl.control?.setValue(newValue, { emitEvent: false });
    }
  }
}
