import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  deleteFeedback(id: number, options = {}): Observable<any> {
    return this.http.delete(this.baseAPI+"/delete/"+id, options);
  }
}
