import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeedbackServiceService {
  private baseAPI: string = "https://staysearchbackend.onrender.com/api/feedbacks";
  private testUrl: string = 'http://localhost:8080/api/feedbacks/feedbacks'; // POST endpoint

  constructor(private http: HttpClient) {}

  getFeedback(): Observable<any[]> {
    return this.http.get<any[]>(this.baseAPI+"/getAllFeedbacks");
  }

  submitFeedback(feedbackData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(this.baseAPI+"/feedbacks", feedbackData, { headers });
  }
}
