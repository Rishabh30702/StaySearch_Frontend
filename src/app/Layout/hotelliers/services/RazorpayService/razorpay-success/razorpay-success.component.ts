import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormDataService } from '../../form-data.service';
import { AuthPortalService } from '../../../../admin-access/AuthPortal.service';
import { AuthService } from '../../../../../Core/Services/AuthService/services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HotelsService } from '../../hotels.service';
import { PaymentWindowService } from '../../../../../services/payment-window.service';

@Component({
  selector: 'app-razorpay-success',
  templateUrl: './razorpay-success.component.html',
  imports: [CommonModule],
  styleUrls: ['./razorpay-success.component.css']
})
export class RazorpaySuccessComponent implements OnInit, OnDestroy {
  showLoader = false;
  formData: any;
  userData: any;
  orderId: string | null = null;
  pollingInterval: any;
  fail:boolean = false;
  username: string ='';
  phone: string = '';
  amount: any ;
  hotelname: string = '';


  constructor(
    private router: Router,
    private hotelierService: AuthPortalService,
    private formDataService: FormDataService,
     private hotelsService: HotelsService,
    private authService: AuthService,
     private Aroute: ActivatedRoute,
    private http: HttpClient,
    private paymentWindowService: PaymentWindowService
  ) {
this.Aroute.queryParams.subscribe(params => {
      this.username = params['email'];
      
      this.phone = params['phone'];
      this.amount = params['amount'];
      this.hotelname = params['hotelname']
    
      
    
  });


  }

  ngOnInit(): void {
    // ✅ Retrieve stored form data and user data
    this.formData = this.formDataService.getFormData();
    this.userData = this.formDataService.getUserData();

    // ✅ We no longer need paymentId — we only need orderId to verify
    this.orderId = localStorage.getItem('lastOrderId');

    if (this.orderId) {
      this.startPaymentPolling(this.orderId);
    } else {
      Swal.fire('⚠️ Missing Details', 'No order found to verify payment.', 'warning');
    }
  }

  startPaymentPolling(orderId: string) {
  this.showLoader = true;
  let attempts = 0;
  const maxAttempts = 15; // ~45 seconds at 3s interval

  this.pollingInterval = setInterval(() => {
    attempts++;
    console.log(`🔄 Polling attempt #${attempts}`);

    // Step 1: Fetch Razorpay payment details from backend
    this.http.post('https://staysearchbackend.onrender.com/api/payments/get-payment-details', { orderId })
      .subscribe({
        next: (res: any) => {
          if (!res?.razorpay_order_id || !res?.razorpay_payment_id || !res?.razorpay_signature) {
            console.warn('❌ Razorpay details not ready yet.');
            if (attempts >= maxAttempts) {
              clearInterval(this.pollingInterval);
              this.showLoader = false;
              Swal.fire('⚠️ Payment Pending', 'Could not verify payment in time. Please try later.', 'warning');
            }
            return;
          }

          // Step 2: Call verify-payment-link API with fetched Razorpay credentials
          const verifyPayload = {
            razorpay_order_id: res.razorpay_order_id,
            razorpay_payment_id: res.razorpay_payment_id,
            razorpay_signature: res.razorpay_signature,
            name: this.formData.name,
            contact: this.formData.contact,
            amount: this.formData.amount
          };

          this.http.post('https://staysearchbackend.onrender.com/api/payments/verify-payment-link', verifyPayload)
            .subscribe({
              next: (verifyRes: any) => {
                console.log('🔎 Verify Response:', verifyRes);

                if (verifyRes.verified === true || verifyRes.status === 'paid' || verifyRes.status === 'captured') {
                  clearInterval(this.pollingInterval);
                  this.showLoader = false;
                  this.createInvoice(verifyRes.paymentId);

                  Swal.fire('✅ Payment Verified', 'Your payment was successful.', 'success');

                  // Proceed with hotelier/hotel registration
                  if (this.userData?.username) {
                    this.registerHotellier();
                  } else {
                    this.registerHotelafterLogin(this.formData);
                  }
                } else {
                  console.log(`⏳ Payment not yet captured. Status: ${verifyRes.status}`);
                  if (attempts >= maxAttempts) {
                    clearInterval(this.pollingInterval);
                    this.showLoader = false;
                    Swal.fire('⚠️ Payment Pending', 'Could not verify payment in time. Please try later.', 'warning');
                  }
                }
              },
              error: (err) => {
                console.error('❌ Verify API Error:', err);
                if (attempts >= maxAttempts) {
                  clearInterval(this.pollingInterval);
                  this.showLoader = false;
                  Swal.fire('❌ Verification Failed', 'Unable to verify payment. Please try again.', 'error');
                }
              }
            });

        },
        error: (err) => {
          console.error('❌ Fetch Payment Details Error:', err);
          if (attempts >= maxAttempts) {
            clearInterval(this.pollingInterval);
            this.showLoader = false;
            this.paymentWindowService.closeWindow();
            Swal.fire('❌ Verification Failed', 'Unable to fetch payment details. Please try again.', 'error');
          }
        }
      });

  }, 15000);
}


  ngOnDestroy() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  registerHotelafterLogin(formData: any) {
    this.showLoader = true;
    this.hotelierService.registerHotel(formData).subscribe({
      next: () => {
        this.formDataService.clear();
        Swal.fire('✅ Registration Successful', 'Hotel registered successfully.', 'success');
        this.router.navigate(['hotellier'], {
  queryParams: { value: "hotellier" }
});
      },
      error: (err) => {
        this.formDataService.clear();
        Swal.fire('❌ Registration Failed', 'Hotel registration failed.', 'error');
        console.error(err);
      }
    });
  }

  registerHotellier() {
    const payload = { ...this.userData};
    this.showLoader = true;

    this.hotelierService.registerHotelier(payload).subscribe({
      next: () => {
        const loginPayload = { username: this.userData.username, password: this.userData.password };
        this.authService.loginHot(loginPayload).subscribe({
          next: (res: any) => {
            if (res.token) {
              localStorage.setItem('token', res.token);
              this.registerHotel(this.formData);
            } else {
              Swal.fire('❌ Login Failed', 'Login failed after registration.', 'error');
            }
          },
          error: (err) => {
            Swal.fire('❌ Login Failed', err?.error?.message || 'Invalid credentials.', 'error');
          }
        });
      },
      error: () => {
        Swal.fire('❌ Registration Failed', 'User registration failed.', 'error');
      }
    });
  }

  registerHotel(formData: any) {
    this.hotelierService.registerHotel(formData).subscribe({
      next: () => {
        Swal.fire('✅ Registration Successful', 'Awaiting admin approval.', 'success');
       this.router.navigate(['hotellier'], {
  queryParams: { value: "hotellier" }
});
      },
      error: (err) => {
        Swal.fire('❌ Registration Failed', 'Hotel registration failed.', 'error');
        console.error(err);
      }
    });
  }

  goToDashboard() {
    
      this.router.navigate(['hotellier'], {
  queryParams: { value: "hotellier" }
});
  }
  goToHome() {
       this.router.navigate(['hotellier'], {
  queryParams: { value: "hotellier" }
});

  }



createInvoice(res: any) {
    
    const invoiceData = {
      orderId: this.orderId,
      paymentId: res,
      customerEmail:this.username,
      customerPhone: this.phone,
      amountInPaise: this.amount,
      hotelName: this.hotelname
    };

     console.log("Invoice:", invoiceData);

    this.hotelsService.createInvoice(invoiceData).subscribe({
      next: (res) => {
        console.log('Invoice created:', res);
      },
      error: (err) => {
        console.error('Error creating invoice:', err);
      }
    });
  }

  
}