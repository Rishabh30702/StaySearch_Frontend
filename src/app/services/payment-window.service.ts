import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaymentWindowService {

  constructor() { }

private razorpayWindow: Window | null = null;

  // Store the opened Razorpay window reference
  setWindow(win: Window | null) {
    this.razorpayWindow = win;
  }

  // Retrieve it
  getWindow(): Window | null {
    return this.razorpayWindow;
  }

  // Close it safely if open
  closeWindow() {
    if (this.razorpayWindow && !this.razorpayWindow.closed) {
      this.razorpayWindow.close();
    }
    this.razorpayWindow = null;
  }








}
