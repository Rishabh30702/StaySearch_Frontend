import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Feedback } from './feedback.modal';
@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private testUrl = 'http://localhost:8080/api/feedbacks'; // Your actual endpoint
  private baseAPI: string = "https://staysearchbackend.onrender.com/api/feedbacks";

  constructor(private http: HttpClient) {}

  getAllFeedbacks(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(this.baseAPI+"/getAllFeedbacks");
  }

getMyFeedbacks(): Observable<any> {
  const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.baseAPI}/hotelier/my-feedbacks`, { headers });
  }
  

  getFeedback(): Observable<any[]> {
    return this.http.get<any[]>('https://staysearchbackend.onrender.com/api/feedbacks/feedbacks/public');
  }

  deleteFeedback(id: number, options = {}): Observable<any> {
    return this.http.delete(this.baseAPI+"/delete/"+id, options);
  }


  approveFeedback(data: any,id: number): Observable<any>{
    return this.http.put(this.baseAPI+`/feedbacks/${id}/approve`,data, { responseType: 'text' as const });
  }
}
