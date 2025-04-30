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
  registerHotel(data: any): Observable<any> {

    const token = localStorage.getItem('token');
    console.log(token);
    const headers = {
      Authorization: `Bearer ${token}`,
    };
  
    return this.http.post("https://staysearchbackend.onrender.com/v1/mine/hotels", data, { headers });
  }
  loginHotelier(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}login/hotelier`, credentials); // assuming login is same for all roles
  }
}
