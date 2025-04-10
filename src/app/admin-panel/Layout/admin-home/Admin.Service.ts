import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  // private testUrl = 'http://localhost:8080/auth';
  private baseUrl = 'https://staysearchbackend.onrender.com';
  constructor(private http: HttpClient) {}

  // Approve a hotelier
  approveHotelier(hotelierId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/approve/hotelier/${hotelierId}`, {});
  }

  rejectHotelier(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/reject/${id}`, {}); // POST with empty body
  }
  
  makeHotelierPending(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/pending/${id}`, {}); // POST with empty body
  }
}
