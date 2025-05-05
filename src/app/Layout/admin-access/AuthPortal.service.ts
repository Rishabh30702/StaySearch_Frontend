import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthPortalService {

  private baseUrl = 'https://staysearchbackend.onrender.com/auth/';
  // private testUrl = 'http://localhost:8080/auth/';
  private t2 = 'http://localhost:8080/v1/mine/hotels';
  private base2 ="https://staysearchbackend.onrender.com";

  constructor(private http: HttpClient) { }

  registerHotelier(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}register/hotelier`, data);
  }
  registerHotel(data: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      // DO NOT SET 'Content-Type' HERE!
    });
  
    return this.http.post(this.base2+"/v1/mine/hotels", data, { headers });
  }
  
  loginHotelier(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}login/hotelier`, credentials); // assuming login is same for all roles
  }

   // Method to fetch hotel details by ID
   getHotelById(hotelId: number): Observable<any> {
    return this.http.get(`${this.base2}/v1/hotel/${hotelId}`);
  }
}
