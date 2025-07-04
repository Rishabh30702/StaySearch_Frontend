import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HotelsService {

  constructor( private http: HttpClient) {}

  private baseUrl = 'https://staysearchbackend.onrender.com/v1/mine/hotels';

 private base2 = 'https://staysearchbackend.onrender.com/' ;
  
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


  updateHotel(hotelId: string, hotelData: any) {
    return this.http.patch(`https://staysearchbackend.onrender.com/v1/updateHotel/${hotelId}`, hotelData);
  }
   deleteHotel(hotelId: string) {
    return this.http.delete(`https://staysearchbackend.onrender.com/v1/deleteHotel/${hotelId}`, { responseType: 'text' });
  }

    createOffer(data: any): Observable<any> {
    return this.http.post(this.base2+"api/offers", data);
  }
  
  getAllOffers(): Observable<any> {
    return this.http.get<any>(this.base2+"api/offers");
  }

  getOffers(): Observable<any> {
    return this.http.get<any>(this.base2+"api/offers/active");
  }

  approveOfferById(offerId: number,data: any) {
    const url = `${this.base2}api/offers/${offerId}`;
    

    return this.http.put(url, data);
  }

}
