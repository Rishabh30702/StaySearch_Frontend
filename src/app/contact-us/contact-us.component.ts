import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; 
import Swal from 'sweetalert2'; // Import SweetAlert2 here
import { ContactServiceService } from '../Core/Services/ContactService/contact-service.service';
import { Observable } from 'rxjs';
import { SpinnerComponent } from "../Core/spinner/spinner.component";
import { TranslateModule } from '@ngx-translate/core';
import * as L from 'leaflet';


@Component({
  selector: 'app-contact-us',
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent,TranslateModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css'
})
export class ContactUsComponent implements AfterViewInit  {
  contactForm: FormGroup;
  isLoading:boolean = false;

  constructor(private fb: FormBuilder, private _service:ContactServiceService) {
    this.contactForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(10)]],
      subject: ['', Validators.required],
      name: ['', [Validators.required, Validators.pattern(/^\S+\s+\S+/)]], // At least two words
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submitForm() {
    if (this.contactForm.invalid) {
      Swal.fire('Form Invalid', 'Please fill in all required fields', 'error');
      return;
    }
  
    this.isLoading = true;
  
    // ✅ Construct the correct payload
    const payload = {
      contact_username: this.contactForm.value.name,
      contact_description: this.contactForm.value.description,
      contact_subject: this.contactForm.value.subject
    };
  
    this._service.savequery(payload) // ✅ Send formatted payload
      .subscribe({
        next: (res) => {
          console.log('Form Submitted', res);
          this.isLoading = false;
          Swal.fire('Form Submitted', 'Thank you for contacting us!', 'success');
          this.contactForm.reset(); // ✅ Clear the form after submission
        },
        error: (err) => {
          console.error('Submission Error', err);
          this.isLoading = false;
          Swal.fire('Error', 'Something went wrong. Try again!', 'error');
        }
      });
  }
  


  private map: any;

  private initMap(): void {
    this.map = L.map('map', {
      center: [ 26.857311, 80.977264],
      zoom: 15
    });
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    const marker = L.marker([26.857311, 80.977264])
    .addTo(this.map)
    .bindPopup("<b>Uttar Pradesh Tourism</b><br>Lucknow, Uttar Pradesh").openPopup();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

}