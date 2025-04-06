import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private baseUrl = 'https://staysearchbackend.onrender.com';
  private testUrl = 'http://localhost:8080'; // Localhost URL for testing

  constructor(private http: HttpClient) { }

  register(user: {  username: string; password: string; role: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, user);
  }

  login(userData: { username: string; password: string }) {
    return this.http.post(`${this.baseUrl}/auth/login`, userData);
  }

  logout(): void {
    localStorage.removeItem('token'); // Remove token from storage
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token'); // Check if user is logged in
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserProfile(): Observable<any> {
    const token = this.getToken();
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    return this.http.get(`${this.baseUrl}/auth/me`, { headers });
  }

}
