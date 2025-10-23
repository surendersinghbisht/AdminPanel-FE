// src/app/services/turnstile.service.ts
import { Injectable } from '@angular/core';


// src/environments/environment.ts
    export const environment = {
  production: false,
  turnstileSiteKey: '0x4AAAAAAB6ex4m3be45YUkv'
};



declare global {
  interface Window {
    turnstile: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class TurnstileService {
  private widgetId: string | null = null;

  render(
    elementId: string,
    siteKey: string,
    callback: (token: string) => void,
    errorCallback?: () => void
  ): void {
    if (typeof window.turnstile !== 'undefined') {
      this.widgetId = window.turnstile.render(`#${elementId}`, {
        sitekey: siteKey,
        callback: callback,
        'error-callback': errorCallback || (() => console.error('Turnstile error')),
        'expired-callback': () => {
          console.log('Turnstile token expired');
          this.reset();
        }
      });
    } else {
      console.error('Turnstile script not loaded');
    }
  }

  reset(): void {
    if (this.widgetId && typeof window.turnstile !== 'undefined') {
      window.turnstile.reset(this.widgetId);
    }
  }

  remove(): void {
    if (this.widgetId && typeof window.turnstile !== 'undefined') {
      window.turnstile.remove(this.widgetId);
      this.widgetId = null;
    }
  }
}