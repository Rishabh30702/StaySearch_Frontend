import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HotelsService {

  constructor( private http: HttpClient) {}

  private baseUrl = 'https://staysearchbackend.onrender.com/v1/mine/hotels';


  
  getHotels(): Observable<any> {
    const token = localStorage.getItem('token');

    if (!token) {
      return throwError(() => new Error('No auth token found'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<any[]>(this.baseUrl, { headers }).pipe(
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
