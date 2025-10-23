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

export const routes: Routes = [
    {
        path: 'login',
        component: Login,
    },
    {
        path: '',
        component: MainLayout,
        canActivate:[AuthGuard],
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                component: Dashboard
            },
            {
                path: 'users',
                component: UsersComponent,
                canActivate:[PermissionGuard],
                data: { permission: 'User' }
            },
            {
                path: 'add-user',
                component: AddUserComponent,
                canActivate:[PermissionGuard],

                data: { permission: 'User' }
            },
            {
                path: 'roles',
                component: Roles,
                canActivate:[PermissionGuard],
                data: { permission: 'Role' }
            },
            {
                path: 'add-roles',
                component: AddRoleComponent,
                canActivate:[PermissionGuard],
                data: { permission: 'Role' }
            },
            {
                path: 'edit-user/:id',
                component: AddUserComponent,
                canActivate:[PermissionGuard],
                data: { permission: 'User' }
            },
            {
                path: 'edit-role/:id',
                component: AddRoleComponent,
                canActivate:[PermissionGuard],
                data: { permission: 'Role' }
            },
            {
                path: 'cms',
                component: Cms,
                canActivate:[PermissionGuard],
                data: { permission: 'Cms' }
            },
            {
                path: 'profile',
                component: ProfileComponent,
            },
            {
                path: 'email-template',
                component: ManageEmailTemplate,
                canActivate:[PermissionGuard],
                data: { permission: 'Email Template' }
            },
            {
                path:'add-email-template',
                component:CkEditor,
                canActivate:[PermissionGuard],
                data: { permission: 'Email Template' }
            },
            {
                  path: 'edit-template/:id',
                component: CkEditor,
                canActivate:[PermissionGuard],
                data: { permission: 'Email Template' }
            },
            {
                path: 'logs',
                component: LogsComponent,
            },
            {
                path: 'add-cms',
                component: AddCms,
                canActivate:[PermissionGuard],
                data: { permission: 'Cms' }    
            },
            {
                path: 'edit-cms/:id',
                component: AddCms,
                canActivate:[PermissionGuard],
                data: { permission: 'Cms' } 
            }
        ]
    },
    {
                path: 'forget-password',
                component: ForgetPassword
            },
            {
                path: 'reset-password',
                component: ResetPassword
            },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
