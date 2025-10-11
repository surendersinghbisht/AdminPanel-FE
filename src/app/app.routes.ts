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
            },
            {
                path: 'add-user',
                component: AddUserComponent
            },
            {
                path: 'roles',
                component: Roles
            },
            {
                path: 'add-roles',
                component: AddRoleComponent
            },
            {
                path: 'edit-user/:id',
                component: AddUserComponent
            },
            {
                path: 'edit-role/:id',
                component: AddRoleComponent
            },
            {
                path: 'cms',
                component: Cms
            },
            {
                path: 'profile',
                component: ProfileComponent
            },
        ]
    },
   
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
