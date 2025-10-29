import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_URL } from "../../baseurl";
import { Observable } from "rxjs";
import { DataTableRequest, DataTableResponse, getAdminFromLocalHost } from "./AuthService";

@Injectable({
    providedIn: 'root'
})
export class CmsService{
    constructor(private http: HttpClient){}

private baseUrl = `${BASE_URL}/Cms`    

 getcmss(request: DataTableRequest): Observable<DataTableResponse<any>> {
  console.log('roles asd',request)
    return this.http.post<DataTableResponse<any>>(`${this.baseUrl}/get-all-cms`, request);
  }

createCms(data:any):Observable<any>{
    const admin = getAdminFromLocalHost();
    let payload = {
        ...data,
        adminName: admin.name
    }
    return this.http.post<any>(`${this.baseUrl}/add-cms`,payload)
}

updateCms(id:number,data:any):Observable<any>{
    const admin = getAdminFromLocalHost();
    let payload = {
        ...data,
        id,
        adminName: admin.name
    }
    return this.http.post<any>(`${this.baseUrl}/update-cms`,payload)
}

getCmsById(id:number):Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/get-cms/${id}`)
}

deleteCms(id:number):Observable<any>{
    const admin = getAdminFromLocalHost();
    let payload = {
        id,
        adminName: admin.name
    }
    return this.http.post<any>(`${this.baseUrl}/delete-cms`,payload)
}

updateActiveStatus(payload:any):Observable<any>{
    const admin = getAdminFromLocalHost();
    let payload1 = {
        ...payload,
        userName: admin.name
    }
    return this.http.post<any>(`${this.baseUrl}/update-active-status`,payload1)
}

}