import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Feedback } from './feedback.modal';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private testUrl = 'http://localhost:8080/api/feedbacks';
  private baseUrl = 'https://staysearchbackend.onrender.com/api/feedbacks';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  // ✅ Fetch feedbacks of the logged-in user
  getUserFeedback(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.baseUrl}/my-feedbacks`, this.getAuthHeaders());
  }

  // ✅ Submit feedback for the logged-in user
  submitFeedback(feedback: Feedback): Observable<Feedback> {
    return this.http.post<Feedback>(`${this.baseUrl}/feedbacks`, feedback, this.getAuthHeaders());
  }

  // ✅ Update feedback by ID
  updateFeedback(feedbackId: number, feedback: Feedback): Observable<Feedback> {
    return this.http.put<Feedback>(`${this.baseUrl}/update/${feedbackId}`, feedback, this.getAuthHeaders());
  }

  // ✅ Delete feedback by ID
  deleteFeedback(id: number): Observable<string> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.baseUrl}/my-feedback/delete/${id}`, {
      headers,
      responseType: 'text'  // ✅ important for plain string responses
    });
  }
  
}
