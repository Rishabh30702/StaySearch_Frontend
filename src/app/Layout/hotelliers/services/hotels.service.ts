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
 private testUrl ="http://localhost:8080/v1/mine/hotels"
  
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


  validateHotel(hotelData: any): Observable<any> {
  // We send the raw form data before the payment/upload step
  return this.http.post(`${this.base2}v1/validate`, hotelData);
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


    createInvoice(data: any): Observable<any> {
    return this.http.post(`https://staysearchbackend.onrender.com/api/payments/invoice`, data);
  }


  getInvoices(email: any) {
  return this.http.get<any[]>(`https://staysearchbackend.onrender.com/api/payments/invoice/customer/${email} `);
}
downloadInvoice(orderId: string): Observable<Blob> {
    return this.http.get(`https://staysearchbackend.onrender.com/api/payments/invoice/order/${orderId}/download`, {
      responseType: 'blob'  // important to get file blob
    });
  }


}
