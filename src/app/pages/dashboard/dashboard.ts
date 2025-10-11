import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/AuthService';
import { LoaderComponent } from "../../Components/loader/loader";
import { RoleService } from '../../services/RoleService';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [LoaderComponent, RouterModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
isLoading=false;
  constructor(private authService: AuthService,
    private roleService: RoleService
  ){} 
roles:any[]=[];
users:any[]=[];


ngOnInit(): void {
  this.getAllRoles();
  this.getAllUsers();
}


getAllRoles(){
  this.isLoading=true;
  this.roleService.getAllRoles().subscribe({
    next: (response:any) => {
      this.roles=response;
      this.isLoading=false;
    },
    error: (error) => {
      console.error('Error fetching roles:', error);
      this.isLoading=false;
    }
  })
}

getAllUsers(){
  this.isLoading=true;
  this.authService.getAlluser().subscribe({
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
