import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Room } from './room.modal';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private testURL = 'http://localhost:8080/api/hotelier';
  private baseURL = 'https://staysearchbackend.onrender.com/v1/mine/rooms';

  constructor(private http: HttpClient) {}

  /*getRooms(hotelId: number): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.baseURL}/hotels/${hotelId}/rooms`);
  } */

  addRoomWithoutImage(hotelId: number, room: Room): Observable<Room> {
    const formData = new FormData();
    const roomBlob = new Blob([JSON.stringify(room)], { type: 'application/json' });
    formData.append('room', roomBlob); // sending as RequestPart
  
    return this.http.post<Room>(`${this.baseURL}/hotels/${hotelId}/rooms`, formData);
  }
  addRoom(data: any): Observable<Room> {
      const token = localStorage.getItem('token');
    
        if (!token) {
          return throwError(() => new Error('No auth token found'));
        }
    
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`
        });
  
    return this.http.post<Room>(`${this.baseURL}`, data, { headers });
  }

    getRooms(){
      return this.http.get<Room[]>(`${this.baseURL}`);
    }

  deleteRoom(roomId: number): Observable<void> {
    
    return this.http.delete<void>(`https://staysearchbackend.onrender.com/api/hotelier/rooms/${roomId}`);
  }

  updateRoom(roomId: number, roomData: FormData): Observable<Room> {
    return this.http.put<Room>(`https://staysearchbackend.onrender.com/api/hotelier/rooms/${roomId}`, roomData);
  }

}
