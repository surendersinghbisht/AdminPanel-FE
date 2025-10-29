import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BASE_URL } from "../../baseurl";
import { Observable } from "rxjs";
import { getAdminFromLocalHost } from "./AuthService";
import { DataTableRequest, DataTableResponse } from "./AuthService";
@Injectable({
    providedIn: 'root'
  })

  export class EmailTemplateService {
 
private BaseUrl = `${BASE_URL}/EmailTemplate`
    constructor(private http: HttpClient){}

     getEmailTemplates(request: DataTableRequest): Observable<DataTableResponse<any>> {
      console.log('roles asd',request)
        return this.http.post<DataTableResponse<any>>(`${this.BaseUrl}/get-templates`, request);
      }

    createEmailTemplate( data: any):Observable<any>{
     var admin = getAdminFromLocalHost();
    data.AdminName = admin.name;
        return this.http.post(`${this.BaseUrl}/create-template`, data)
    }

    updateEmailTemplate(id: number, data: any):Observable<any>{
        let payload = {
            id,
            ...data
        }
        var admin = getAdminFromLocalHost();
    payload.AdminName = admin.name;
        return this.http.post(`${this.BaseUrl}/update-template`, payload)
    }

    deleteEmailTemplate(id: number):Observable<any>{
         let admin = getAdminFromLocalHost();
        let payload = {
            Id: id,
            adminName: admin.name
        }
        return this.http.post(`${this.BaseUrl}/delete-template`,payload)
    }

    updateActiveStatus(data: any):Observable<any>{
        let admin = getAdminFromLocalHost();
        data.userName = admin.name;
        return this.http.post(`${this.BaseUrl}/update-active-status`,data)
    } 

    getEmailTemplateById(id:number):Observable<any>{
        return this.http.get(`${this.BaseUrl}/get-template/${id}`)
    }

    getLogs(request: DataTableRequest): Observable<DataTableResponse<any>> {
  console.log('roles asd',request)
    return this.http.post<DataTableResponse<any>>(`${this.BaseUrl}/get-all-logs`, request);
  }
  }