import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HotelListingService {

   baseAPI:string = "https://staysearchbackend.onrender.com";

  constructor(private _http:HttpClient) { }
  getHotels(){
    return this._http.get(`${this.baseAPI}/v1/hotels`);
  }

  getOneHotel(id:any){
    return this._http.get(`${this.baseAPI}/v1/hotel/${id}`);
  }
}

