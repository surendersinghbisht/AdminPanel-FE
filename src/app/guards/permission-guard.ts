import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredPermission = route.data['permission']; // 👈 defined in routing
    const permissions = JSON.parse(localStorage.getItem('rolesWithPermissions') || '[]');

    const perm = permissions.find((p: any) =>
      p.permissionName?.toLowerCase() === requiredPermission?.toLowerCase()
    );

    if (perm && perm.canRead) {
      return true;
    }

    this.snackBar.open(
      `You don't have permission to access this page.`,
      'Close',
      {
        duration: 4000,
        horizontalPosition: 'end',
          verticalPosition: 'top',
        panelClass: ['error-snackbar'] // optional custom class
      }
    );

    this.router.navigate(['/dashboard']);
    return false;
  }
}
