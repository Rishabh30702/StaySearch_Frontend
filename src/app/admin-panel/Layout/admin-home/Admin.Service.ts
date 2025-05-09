import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  // private testUrl = 'http://localhost:8080/auth';
  private baseUrl = 'https://staysearchbackend.onrender.com/auth';
  private base2 = 'https://staysearchbackend.onrender.com/v1/hotels';
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

  getAllHotelsData(): Observable<any>{
    return this.http.get<any[]>(this.base2).pipe(
         map(data => {
           return data;
           
         }),
         catchError(err => {
           console.error('Error fetching hotels:', err.message);
           return throwError(() => new Error('Failed to fetch hotels'));
         })
       );

  }
}
