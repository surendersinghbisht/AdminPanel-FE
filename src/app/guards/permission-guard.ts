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
    const requiredPermission = route.data['permission'];
    const accessType = route.data['accessType'] || 'read'; // default: read

    const permissions = JSON.parse(localStorage.getItem('rolesWithPermissions') || '[]');
    const perm = permissions.find((p: any) =>
      p.permissionName?.toLowerCase() === requiredPermission?.toLowerCase()
    );

    if (!perm) {
      this.showError(`You don't have permission to access this page.`);
      this.router.navigate(['/dashboard']);
      return false;
    }

    // ✅ Check based on accessType
    switch (accessType.toLowerCase()) {
      case 'create':
        if (perm.canCreate) return true;
        break;
      case 'update':
        if (perm.canUpdate) return true;
        break;
      case 'delete':
        if (perm.canDelete) return true;
        break;
      default: // read
        if (perm.canRead) return true;
    }

    this.showError(`You don't have access to this page.`);
    this.router.navigate(['/dashboard']);
    return false;
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}
