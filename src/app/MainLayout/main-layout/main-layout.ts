import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink, RouterModule, RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterLink, RouterModule, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout implements OnInit  {

  constructor(
private router:Router
  ){

  }

user:any;
  ngOnInit() {
    const userString = localStorage.getItem('admin');
    let userData = null;

if (userString) {
  userData = JSON.parse(userString);
}
this.user = userData;
console.log(userData);
  }

  sidebarVisible = false;

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  closeSidebar() {
    if (window.innerWidth <= 768) {
      this.sidebarVisible = false;
    }
  }
  profileMenuVisible = false;

toggleProfileMenu() {
  this.profileMenuVisible = !this.profileMenuVisible;
}

closeProfileMenu() {
  this.profileMenuVisible = false;
}

logout() {
  localStorage.clear();
  this.closeProfileMenu();
  this.router.navigate(['/login']);
}

}
