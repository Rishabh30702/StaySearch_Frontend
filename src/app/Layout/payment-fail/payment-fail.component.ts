import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-fail',
  imports: [CommonModule],
  templateUrl: './payment-fail.component.html',
  styleUrl: './payment-fail.component.css'
})
export class PaymentFailComponent implements OnInit {
  showLoader = false;

    constructor(private router: Router) {}
 
  ngOnInit(): void {
    // Start 10-second timer
    setTimeout(() => {
      this.showLoader = true;

      // Show loader for 1 second before redirecting
      setTimeout(() => {
        this.router.navigate(['hotellier']);
     // replace '/target' with your actual route
      }, 1000);
    }, 9000);
  }
 now = new Date();



}
