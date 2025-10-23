import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/AuthService';
import { LoaderComponent } from '../../Components/loader/loader';
import { RoleService } from '../../services/RoleService';
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, RouterOutlet, LoaderComponent],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css'] // ✅ plural form required
})
export class MainLayout implements OnInit {
  isLoading = false;
  user: any;
  sidebarVisible = false;
  profileMenuVisible = false;
  rolesWithPermissions: any[] = [];

  // ✅ Reference to the dropdown menu for outside click detection
  @ViewChild('profileDropdown', { static: false }) profileDropdown!: ElementRef;

  @HostListener('document:keydown.escape')
onEscapePress() {
  this.closeProfileMenu();
}
  constructor(private router: Router, private authService: AuthService,private roleService: RoleService) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.getRolesWithPermissions();
  }

canRead(permissionName: string): boolean {
  const perm = this.rolesWithPermissions.find(p => p.permissionName.toLowerCase() === permissionName.toLowerCase());
  return perm ? perm.canRead : false;
}


  getRolesWithPermissions(){
    this.roleService.getRolesWithPermissions(this.user.role).subscribe({
      next: (response:any) => {
        console.log('rolepers',response);
        this.rolesWithPermissions = response.permissions;
        localStorage.setItem('rolesWithPermissions', JSON.stringify(response.permissions));
      },
      error: (error:any) => {
        console.error('Error fetching roles:', error);
      }
    })
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  closeSidebar() {
    if (window.innerWidth <= 768) {
      this.sidebarVisible = false;
    }
  }

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

  // ✅ Detects clicks anywhere on the page
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInside = this.profileDropdown?.nativeElement.contains(target);

    if (!clickedInside && this.profileMenuVisible) {
      this.closeProfileMenu();
    }
  }
}
