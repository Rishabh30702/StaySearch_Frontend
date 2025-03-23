import { Component } from '@angular/core';
import { Router,NavigationEnd, RouterOutlet} from '@angular/router';
import { NavbarComponent } from "./Layout/navbar/navbar.component";
import { FooterComponent } from "./Layout/footer/footer.component";
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  isHomePage = false;
  title = 'StaySearchFrontend';
  
  constructor(
    private router: Router,
    private translate: TranslateService) {
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      console.log('Current Route:', event.url); // Debugging
      this.isHomePage = event.url === '/' || event.url === '/home'; // Adjust for your homepage
    });
    
    const savedLang = localStorage.getItem('language') || 'hi';
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('language', lang); // Save preference
  }
}
