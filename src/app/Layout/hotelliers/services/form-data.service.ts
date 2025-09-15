import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormDataService {

  constructor() { }
private formData: FormData | null = null;
  private userData: any = null;

  setFormData(data: FormData): void {
    this.formData = data;
  }

  getFormData(): FormData | null {
    return this.formData;
  }

   setUserData(data: any): void {
    this.userData = data;
  }

  getUserData(): any {
    return this.userData;
  }


  clear(): void {
    this.formData = null;
    this.userData = null;
  }



}
