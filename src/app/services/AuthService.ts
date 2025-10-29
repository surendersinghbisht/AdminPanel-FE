import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BASE_URL } from "../../baseurl";
import { IServerSideGetRowsRequest } from 'ag-grid-community';
import { HttpParams } from '@angular/common/http';

export function getAdminFromLocalHost(){
    return JSON.parse(localStorage.getItem('user') || '{}');
}


export interface DataTableRequest {
  draw: number;
  start: number;
  length: number;
  search: { value: string; regex: boolean };
  order: Array<{ column: number; dir: string }>;
  columns: Array<ColumnFilter>;
}


export interface ColumnFilter {
  data: string;
  name: string;
  searchable: boolean;
  orderable: boolean;
  search: { value: string; regex: boolean };
}

export interface DataTableResponse<T> {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: T[];
  error?: string;
}

export interface User {
    id: any;
    userId: number;
    name: string;
    email: string;
    phone: string;
    username: string;
    dob: string;          
    filePath?: string | null;
    role: string;
    isActive: boolean;
  }
  

@Injectable({
    providedIn: 'root'
  })

  export class AuthService {
    
    constructor(private http: HttpClient){}

       private baseUrl = `${BASE_URL}/User`



       isLoggedIn(): boolean {
        console.log("User is logged in");
        return !!localStorage.getItem('token');
      }

    login(email: string, password: string, turnstileToken: string | null):Observable<any>{
        console.log('lofff')
        const loginData = {
            email, password,
            turnstileToken
        }
        return this.http.post<any>(`${this.baseUrl}/login`,loginData)
    }


 getUsers(request: DataTableRequest): Observable<DataTableResponse<User>> {
  console.log('asd',request)
    return this.http.post<DataTableResponse<User>>(`${this.baseUrl}/get-users`, request);
  }


    addUser(userData: any): Observable<any> {

        return this.http.post<any>(`${this.baseUrl}/add-user`, userData);
    }

    updateUserStatus(userData: any): Observable<any> {
      let admin = getAdminFromLocalHost();
      userData.userName = admin.name;
        console.log('userData',userData)
        return this.http.post<any>(`${this.baseUrl}/update-user-status`, userData);
    }

    getUserById(userId: number):Observable<User>{    
        return this.http.get<any>(`${this.baseUrl}/get-user/${userId}`)
    }

    deleteUser(userId: number): Observable<any> {
        let admin = getAdminFromLocalHost();
        let payload = {
            Id: userId,
            adminName: admin.name
        }
        console.log('userId',payload)
        return this.http.post<any>(`${this.baseUrl}/delete-user`,payload);
    }

    updateUser(userData: any): Observable<any> {
   
        return this.http.post<any>(`${this.baseUrl}/update-user`, userData);
    }

    getAdminDetails(adminId: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/get-admin/${adminId}`);
    }

    changeAdminPassword(payload: any):Observable<any>{
        return this.http.post<any>(`${this.baseUrl}/change-password`,payload)
    }

    updateAdminProfile(payload: any):Observable<any>{
        return this.http.post<any>(`${this.baseUrl}/update-admin`,payload)
    }

    ForgetPasswordToken(Email: string):Observable<any>{
        console.log('aasdas',{Email})
        return this.http.post<any>(`${this.baseUrl}/forget-passwordtoken`,{Email})
    }

    ForgetPassword(data:any):Observable<any>{
        console.log(data)
        return this.http.post<any>(`${this.baseUrl}/reset-password`,data);
    }

    
getUsersCount() {
  return this.http.get<number>(`${this.baseUrl}/count`);
}

verifyOtp(phone: string, otp: string){
  return this.http.post<any>(`${this.baseUrl}/verify-otp`,{phone, otp});
}
}
