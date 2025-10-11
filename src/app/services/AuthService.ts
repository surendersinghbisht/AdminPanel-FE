import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BASE_URL } from "../../baseurl";

export interface User {
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

    login(email: string, password: string):Observable<any>{
        const loginData = {
            email, password
        }
        return this.http.post<any>(`${this.baseUrl}/login`,loginData)
    }

    getAlluser():Observable<User[]>{
        return this.http.get<any>(`${this.baseUrl}/get-all-user`)
    }

    addUser(userData: User): Observable<any> {
        console.log('userData',userData)
        return this.http.post<any>(`${this.baseUrl}/add-user`, userData);
    }

    updateUserStatus(userData: any): Observable<any> {
        console.log('userData',userData)
        return this.http.post<any>(`${this.baseUrl}/update-user-status`, userData);
    }

    getUserById(userId: number):Observable<User>{    
        return this.http.get<any>(`${this.baseUrl}/get-user/${userId}`)
    }

    deleteUser(userId: number): Observable<any> {
        console.log('userId',userId)
        return this.http.delete<any>(`${this.baseUrl}/delete-user/${userId}`);
    }

    updateUser(userData: User): Observable<any> {
        console.log('userData',userData)
        return this.http.post<any>(`${this.baseUrl}/update-user`, userData);
    }

    getAdminDetails(adminId: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/get-admin/${adminId}`);
    }

    changeAdminPassword(payload: any):Observable<any>{
        const data = {
            adminId: payload.userId,
            oldPassword: payload.oldPassword,
            newPassword: payload.newPassword,
          };
        return this.http.post<any>(`${this.baseUrl}/change-password`,data)
    }

    updateAdminProfile(payload: any):Observable<any>{
        const data = {
            adminId: payload.id,
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
            phone: payload.phone,
            filePath: payload.filePath,
          };
        return this.http.post<any>(`${this.baseUrl}/update-admin`,data)
    }
}
