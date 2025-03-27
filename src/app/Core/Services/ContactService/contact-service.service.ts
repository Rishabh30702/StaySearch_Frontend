import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ContactServiceService {

  baseAPI:string = "https://staysearchbackend.onrender.com"

  constructor(private _http:HttpClient) { }

  savequery(contactInfo: any) {
    return this._http.post(this.baseAPI + "/v1/contact/saveQuery", contactInfo, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
}
