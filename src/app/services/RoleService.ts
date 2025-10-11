import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_URL } from "../../baseurl";
import { Observable } from "rxjs";

export interface Role {
 id:number
roleName : string
shortDescription : string
 isActive : boolean
}

export interface Permission {
    permissionId: number;
    permissionName: string;
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class RoleService {
constructor(
    private http: HttpClient
){}

private BaseUrl = `${BASE_URL}/Role`

getAllPermissions(): Observable<any>{
    return this.http.get<any>(`${this.BaseUrl}/get-permissions`)
}

getAllRoles(): Observable<Role[]>{
    return this.http.get<Role[]>(`${this.BaseUrl}/get-roles`)
}

addRole(data: any):Observable<any>{
console.log(data);
const perArr = data.permissions.map((prem: any)=> {
    return {
         PermissionId : prem.permissionId,
         CanCreate : prem.add,
         CanRead : prem.list,
         CanUpdate : prem.edit,
         CanDelete : prem.delete 
    }
})
    const payload: any = {
RoleName: data.roleName,
shortDescription: data.shortDescription,
isActive: data.status === true || data.status === 'active',
permissions: perArr
    }
    console.log('payload',payload)
    return this.http.post<any>(`${this.BaseUrl}/add-role`, payload)
}

updateRoleActiveStatus(payload:any):Observable<any>{
    console.log('pay',payload)
    return this.http.post<any>(`${this.BaseUrl}/update-role-status`, payload);
}

deleteRole(roleId: number):Observable<any>{
    return this.http.delete<any>(`${this.BaseUrl}/delete-role/${roleId}`);
}

getRoleDetail(roleId: number):Observable<any>{
    return this.http.get<any>(`${this.BaseUrl}/get-role/${roleId}`);
}

updateRole(data: any, roleId: number):Observable<any>{
    const perArr = data.permissions.map((prem: any)=> {
        return {
             PermissionId : prem.permissionId,
             CanCreate : prem.add,
             CanRead : prem.list,
             CanUpdate : prem.edit,
             CanDelete : prem.delete 
        }
    })
        const payload: any = {
            roleId,
    RoleName: data.roleName,
    shortDescription: data.shortDescription,
    isActive: data.status === true || data.status === 'active',
    permissions: perArr
        }
        console.log('payload',payload)
        return this.http.post<any>(`${this.BaseUrl}/update-role`, payload)
    }

}