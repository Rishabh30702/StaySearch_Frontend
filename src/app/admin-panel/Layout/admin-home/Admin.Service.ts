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

  rejectHotelier(id: number,remark: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reject/${id}`, {remark}); // POST with empty body
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


 postContent(Data: FormData): Observable<any> {
    return this.http.post('https://staysearchbackend.onrender.com/api/homepage-banner', Data);
  }  

   getContent(): Observable<any> {
    return this.http.get('https://staysearchbackend.onrender.com/api/homepage-banner');
  }

    updateContent(Data: FormData, id: number): Observable<any> {
      console.log(id);
   return this.http.put(`https://staysearchbackend.onrender.com/api/homepage-banner/${id}`, Data);

  }  




  postInfopage(Data: FormData): Observable<any> {
    return this.http.post('https://staysearchbackend.onrender.com/api/informational-page', Data);
  }  

   getInfopage(): Observable<any> {
    return this.http.get('https://staysearchbackend.onrender.com/api/informational-page');
  }

    updateInfopage(Data: FormData, id: number): Observable<any> {
      console.log(id);
   return this.http.put(`https://staysearchbackend.onrender.com/api/informational-page/${id}`, Data);

  }  



updateUserProfile(data: any):Observable<any>{
 return this.http.put(`${this.baseUrl}/admin/user/update`,data)
}

 

 getAmountpage(): Observable<any> {
    return this.http.get('https://staysearchbackend.onrender.com/api/payment-gateway/amount ');
  }


  
    updateAmount(Data: any): Observable<any> {
     
   return this.http.put(`https://staysearchbackend.onrender.com/api/payment-gateway/admin/update-amount`, Data);

  } 
   
  getAllInvoices() {
  return this.http.get<any[]>(`https://staysearchbackend.onrender.com/api/payments/invoice`);
}
downloadInvoice(orderId: string): Observable<Blob> {
    return this.http.get(`https://staysearchbackend.onrender.com/api/payments/invoice/order/${orderId}/download`, {
      responseType: 'blob'  // important to get file blob
    });
  }

}
