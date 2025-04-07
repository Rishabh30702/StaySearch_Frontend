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
    console.log('📦 Token being sent:', token); // ✅ Log token for debug
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    return this.http.get(`${this.baseUrl}/auth/me`, { headers });
  }

  //Update the data in the user-profile
  updateUserProfile(updatedData: { fullname: string; phonenumber: string }): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    // Observe full HTTP response
    return this.http.post(`${this.baseUrl}/auth/me/update`, updatedData, {
      headers,
      observe: 'response'  // 👈 THIS IS IMPORTANT
    });
  }

  updatePassword(oldPassword: string, newPassword: string): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    return this.http.post(`${this.baseUrl}/auth/me/password`, {
      oldPassword,
      newPassword
    }, { headers });
  }
}
