import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Feedback } from './feedback.modal';
@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private testUrl = 'http://localhost:8080/api/feedbacks'; // Your actual endpoint

  constructor(private http: HttpClient) {}

  getAllFeedbacks(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(this.testUrl+"/getAllFeedbacks");
  }

  deleteFeedback(id: number, options = {}): Observable<any> {
    return this.http.delete(this.testUrl+"/delete/"+id, options);
  }
}
