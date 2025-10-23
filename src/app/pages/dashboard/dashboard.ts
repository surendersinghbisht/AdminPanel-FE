import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/AuthService';
import { LoaderComponent } from "../../Components/loader/loader";
import { RoleService } from '../../services/RoleService';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Graph } from "../../component/graph/graph";
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-dashboard',
  imports: [LoaderComponent, RouterModule, CommonModule, Graph],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
isLoading=false;
  constructor(private authService: AuthService,
    private router: Router,
    private roleService: RoleService,
    private snackBar: MatSnackBar,
  ){} 

roles:any;
users:any;
permissions: any[]= [];
permissionforUser:boolean = true;
permissionforRole:boolean = true;


ngOnInit(): void {
const permissions =JSON.parse(localStorage.getItem('rolesWithPermissions') || '[]');
permissions.forEach((perm: any) => {
  if(perm.permissionName === 'User'){
    this.permissionforUser = perm.canRead;
  }
  if(perm.permissionName === 'Role'){
    this.permissionforRole = perm.canRead;
  }
});

  this.getAllUsers();
  this.getAllRoles();
}


  showSnack(message: string, type: 'success' | 'error' | 'delete') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`${type}-snackbar`]
    });
  }


goToUsers(){
  if(this.permissionforUser){
    this.router.navigate(['/users']);
  }else{
    this.showSnack('You do not have permission to access this page', 'error');
  }
}

goToRoles(){
  if(this.permissionforRole){
    this.router.navigate(['/roles']);
  }else{
    this.showSnack('You do not have permission to access this page', 'error');
  }
}

getAllRoles(){
  this.roleService.getRolesCount().subscribe({
    next: (response:any) => {
      this.roles=response;
    },
    error: (error) => {
      console.error('Error fetching roles:', error);
      this.isLoading=false;
    }
  })
}

getAllUsers(){
  this.isLoading=true;
  this.authService.getUsersCount().subscribe({
    next: (response:any) => {
      this.users=response;
      this.isLoading=false;
    },
    error: (error) => {
      console.error('Error fetching users:', error);
      this.isLoading=false;
    }
  })

}
}
