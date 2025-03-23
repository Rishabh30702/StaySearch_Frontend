import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, TranslateModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  currentLanguage = 'en';
  langText = 'English';
 

  constructor(private translate: TranslateService) { 
    this.currentLanguage = localStorage.getItem('language') || 'en';
    this.translate.use(this.currentLanguage);
    this.updateLangText();
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

 
}
