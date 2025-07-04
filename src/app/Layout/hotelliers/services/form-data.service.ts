import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormDataService {

  constructor() { }
private formData: FormData | null = null;

  setFormData(data: FormData): void {
    this.formData = data;
  }

  getFormData(): FormData | null {
    return this.formData;
  }

  clear(): void {
    this.formData = null;
  }



}
