import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthPortalService {

  private baseUrl = 'https://staging.valliento.tech/api'; // Update this if needed
  private testUrl = 'http://localhost:8080/auth/';

  constructor(private http: HttpClient) { }

  registerHotelier(data: any): Observable<any> {
    return this.http.post(`${this.testUrl}register/hotelier`, data);
  }

  loginHotelier(credentials: any): Observable<any> {
    return this.http.post(`${this.testUrl}login/hotelier`, credentials); // assuming login is same for all roles
  }
}
