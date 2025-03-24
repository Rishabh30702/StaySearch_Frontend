import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeedbackServiceService {
  baseAPI:string = "https://staysearchbackend.onrender.com/v1/feedbacks/getAllFeedbacks";

  constructor(private http: HttpClient) { 

    
  }
  getFeedback(): Observable<any[]> {
    return this.http.get<any[]>(this.baseAPI);
  }
}
