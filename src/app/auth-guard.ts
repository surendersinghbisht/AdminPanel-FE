import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('token'); // or your auth check
  if (token) {
    return true; // user is logged in
  }

  router.navigate(['/login']);
  return false;
};
