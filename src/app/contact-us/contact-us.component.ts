import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; 
import Swal from 'sweetalert2'; // Import SweetAlert2 here


@Component({
  selector: 'app-contact-us',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css'
})
export class ContactUsComponent {
  contactForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(10)]],
      subject: ['', Validators.required],
      name: ['', [Validators.required, Validators.pattern(/^\S+\s+\S+/)]], // At least two words
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submitForm() {
    console.log('Submit button clicked'); // ✅ Check if this logs in the console
    if (this.contactForm.valid) {
      console.log('Form Submitted', this.contactForm.value);
      Swal.fire('Form Submitted', 'Thank you for contacting us!', 'success'); // ✅ Show a success message
    } else {
      Swal.fire('Form Invalid', 'Please fill in all required fields', 'error'); // ✅ Show an error message
    }
  }

}