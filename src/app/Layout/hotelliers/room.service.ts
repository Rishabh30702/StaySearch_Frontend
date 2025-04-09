import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from './room.modal';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private testURL = 'http://localhost:8080/api/hotelier';

  constructor(private http: HttpClient) {}

  getRooms(hotelId: number): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.testURL}/hotels/${hotelId}/rooms`);
  }

  addRoomWithoutImage(hotelId: number, room: Room): Observable<Room> {
    const formData = new FormData();
    const roomBlob = new Blob([JSON.stringify(room)], { type: 'application/json' });
    formData.append('room', roomBlob); // sending as RequestPart
  
    return this.http.post<Room>(`${this.testURL}/hotels/${hotelId}/rooms`, formData);
  }
}
