import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthPortalService {

  private baseUrl = 'https://staysearchbackend.onrender.com/auth/';
  // private testUrl = 'http://localhost:8080/auth/';

  constructor(private http: HttpClient) { }

  registerHotelier(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}register/hotelier`, data);
  }

  loginHotelier(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}login/hotelier`, credentials); // assuming login is same for all roles
  }
}
