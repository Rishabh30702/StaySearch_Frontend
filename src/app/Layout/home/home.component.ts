import { Component } from '@angular/core';
import { SearchModalComponent } from "../../Core/search-modal/search-modal.component";
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SearchData } from '../../Core/search-data';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-home',
  imports: [SearchModalComponent,FormsModule,TranslateModule,RouterModule,CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  currentLanguage = 'en';
  langText = 'English';

  searchData: SearchData = {
    destination: '',
    checkInDate: '',
    checkOutDate: '',
    guests: 1,
    rooms: 1
  };
  constructor (private router:Router,private translate: TranslateService){
    this.currentLanguage = localStorage.getItem('language') || 'en';
    this.translate.use(this.currentLanguage);
    this.updateLangText();
  
  }
  showModal: boolean = false; // ✅ Track modal state

  toggleModal(): void {
    this.showModal = !this.showModal;
  }

  closeModal(): void {
    this.showModal = false; // ✅ Reset when closed
  }

  toggleLanguage(lang: string) {
    this.currentLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem('language', lang);
    this.updateLangText();
  }

  updateLangText() {
    this.langText = this.currentLanguage === 'en' ? 'English' : 'हिन्दी';
  }


  searchHotels() {
    // Navigate to listings with search parameters
    this.router.navigate(['/listings'], { queryParams: this.searchData });
  }
}
