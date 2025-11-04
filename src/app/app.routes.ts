import { Routes } from '@angular/router';
import { UsersComponent } from './pages/users/users';
import { Roles } from './pages/roles/roles';
import { MainLayout } from './MainLayout/main-layout/main-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './pages/login/login';
import { AddUserComponent } from './pages/add-user/add-user';
import { AddRoleComponent } from './pages/add-roles/add-roles';
import { AuthGuard } from './auth-guard';
import { Cms } from './pages/cms/cms';
import { ProfileComponent } from './pages/profile/profile';
import { ForgetPassword } from './pages/forget-password/forget-password';
import { ResetPassword } from './pages/reset-password/reset-password';
import { ManageEmailTemplate } from './pages/manage-email-template/manage-email-template';
import { CkEditor } from './pages/ck-editor/ck-editor';
import { LogsComponent } from './pages/logs/logs';
import { AddCms } from './pages/add-cms/add-cms';
import { PermissionGuard } from './guards/permission-guard';
import { VerifyOtpComponent } from './pages/verify-otp/verify-otp';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    data: {
      title: 'Login - Admin Panel',
      description: 'Login to access the admin panel',
      keywords: 'login, admin, authentication, sign in'
    }
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: Dashboard,
        data: {
          title: 'Dashboard - Admin Panel',
          description: 'Admin dashboard overview and analytics',
          keywords: 'dashboard, admin, analytics, overview, statistics'
        }
      },
      // 🧍‍♂️ USER ROUTES
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [PermissionGuard],
        data: { 
          permission: 'User', 
          accessType: 'read',
          title: 'Users - Admin Panel',
          description: 'View and manage all users in the system',
          keywords: 'users, management, admin, list, view users'
        }
      },
      {
        path: 'add-user',
        component: AddUserComponent,
        canActivate: [PermissionGuard],
        data: { 
          permission: 'User', 
          accessType: 'create',
          title: 'Users - Admin Panel',
          description: 'View and manage all users in the system',
          keywords: 'users, management, admin, list, view users'
        }
      },
      {
        path: 'edit-user/:id',
        component: AddUserComponent,
        canActivate: [PermissionGuard],
        data: { 
          permission: 'User', 
          accessType: 'update',
          title: 'Users - Admin Panel',
          description: 'View and manage all users in the system',
          keywords: 'users, management, admin, list, view users'
        }
      },

      // 👑 ROLE ROUTES
      {
        path: 'roles',
        component: Roles,
        canActivate: [PermissionGuard],
        data: { 
          permission: 'Role', 
          accessType: 'read',
          title: 'Roles - Admin Panel',
          description: 'View and manage user roles and permissions',
          keywords: 'roles, permissions, access control, role management'
        }
      },
      {
        path: 'add-roles',
        component: AddRoleComponent,
        canActivate: [PermissionGuard],
        data: { 
          permission: 'Role', 
          accessType: 'create',
          title: 'Roles - Admin Panel',
          description: 'View and manage user roles and permissions',
          keywords: 'roles, permissions, access control, role management'
        }
      },
      {
        path: 'edit-role/:id',
        component: AddRoleComponent,
        canActivate: [PermissionGuard],
        data: { 
          permission: 'Role', 
          accessType: 'update',
          title: 'Roles - Admin Panel',
          description: 'View and manage user roles and permissions',
          keywords: 'roles, permissions, access control, role management'
        }
      },

      // 📄 CMS ROUTES
      {
        path: 'cms',
        component: Cms,
        canActivate: [PermissionGuard],
        data: { 
          permission: 'Cms', 
          accessType: 'read',
          title: 'CMS - Admin Panel',
          description: 'Manage content management system pages',
          keywords: 'cms, content management, pages, content'
        }
      },
      {
        path: 'add-cms',
        component: AddCms,
        canActivate: [PermissionGuard],
        data: { 
          permission: 'Cms', 
          accessType: 'create',
          title: 'CMS - Admin Panel',
          description: 'Manage content management system pages',
          keywords: 'cms, content management, pages, content'
        }
      },
      {
        path: 'edit-cms/:id',
        component: AddCms,
        canActivate: [PermissionGuard],
        data: { 
          permission: 'Cms', 
          accessType: 'update',
          title: 'CMS - Admin Panel',
          description: 'Manage content management system pages',
          keywords: 'cms, content management, pages, content'
        }
      },

      // ✉️ EMAIL TEMPLATE ROUTES
      {
        path: 'email-template',
        component: ManageEmailTemplate,
        canActivate: [PermissionGuard],
        data: { 
          permission: 'Email Template', 
          accessType: 'read',
          title: 'Email Template - Admin Panel',
          description: 'Manage email templates for the system',
          keywords: 'email templates, templates, email management'
        }
      },
      {
        path: 'add-email-template',
        component: CkEditor,
        canActivate: [PermissionGuard],
        data: { 
          permission: 'Email Template', 
          accessType: 'create',
          title: 'Email Template - Admin Panel',
          description: 'Manage email templates for the system',
          keywords: 'email templates, templates, email management'
        }
      },
      {
        path: 'edit-template/:id',
        component: CkEditor,
        canActivate: [PermissionGuard],
        data: { 
          permission: 'Email Template', 
          accessType: 'update',
          title: 'Email Template - Admin Panel',
          description: 'Manage email templates for the system',
          keywords: 'email templates, templates, email management'
        }
      },

      // 🧑 PROFILE & LOGS
      {
        path: 'profile',
        component: ProfileComponent,
        data: {
          title: 'User Profile - Admin Panel',
          description: 'View and edit your profile information',
          keywords: 'profile, user profile, account settings'
        }
      },
      {
        path: 'logs',
        component: LogsComponent,
        data: {
          title: 'Logs - Admin Panel',
          description: 'View system activity logs and history',
          keywords: 'logs, activity logs, system logs, history'
        }
      }
    ]
  },

  // 🔑 AUTH ROUTES
  {
    path: 'forget-password',
    component: ForgetPassword,
    data: {
      title: 'Forgot Password - Admin Panel',
      description: 'Reset your password',
      keywords: 'forgot password, reset password, password recovery'
    }
  },
  {
    path: 'reset-password',
    component: ResetPassword,
    data: {
      title: 'Reset Password - Admin Panel',
      description: 'Create a new password for your account',
      keywords: 'reset password, new password, change password'
    }
  },
  {
    path: 'verify-otp',
    component: VerifyOtpComponent,
    data: {
      title: 'Verify OTP - Admin Panel',
      description: 'Enter the OTP sent to your email',
      keywords: 'verify otp, otp verification, two factor authentication'
    }
  },
  // 🚧 FALLBACK
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];