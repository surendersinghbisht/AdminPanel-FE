import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_URL } from "../../baseurl";
import { Observable } from "rxjs";
import { DataTableRequest, DataTableResponse, getAdminFromLocalHost } from "./AuthService";

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


 getRoles(request: DataTableRequest): Observable<DataTableResponse<Role>> {
  console.log('roles asd',request)
    return this.http.post<DataTableResponse<Role>>(`${this.BaseUrl}/get-roles`, request);
  }

  getRolesWithPermissions(roleName: string): Observable<any>{
    return this.http.get<any>(`${this.BaseUrl}/role-data/${roleName}`)
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
    var admin = getAdminFromLocalHost();
payload.AdminName = admin.name;
    console.log('payload',payload)
    return this.http.post<any>(`${this.BaseUrl}/add-role`, payload)
}

updateRoleActiveStatus(payload:any):Observable<any>{
        let admin = getAdminFromLocalHost();
        payload.userName = admin.name;
    console.log('pay',payload)
    return this.http.post<any>(`${this.BaseUrl}/update-role-status`, payload);
}

deleteRole(roleId: number):Observable<any>{ 
    let admin = getAdminFromLocalHost();
    let payload = {
        Id: roleId,
        adminName: admin.name
    }
    return this.http.post<any>(`${this.BaseUrl}/delete-role`,payload);
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
        var admin = getAdminFromLocalHost();
payload.AdminName = admin.name;
        console.log('payload',payload)
        return this.http.post<any>(`${this.BaseUrl}/update-role`, payload)
    }


    getRolesCount() {
  return this.http.get<number>(`${this.BaseUrl}/count`);
}

getAllRoleNames(){
    return this.http.get<any>(`${this.BaseUrl}/get-role-name`)
}

}