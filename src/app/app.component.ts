import { Component, HostListener } from '@angular/core';
import { Router,NavigationEnd, RouterOutlet} from '@angular/router';
import { NavbarComponent } from "./Layout/navbar/navbar.component";
import { FooterComponent } from "./Layout/footer/footer.component";
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { TopStripComponent } from "./Layout/top-strip/top-strip.component";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent,FontAwesomeModule, FooterComponent, CommonModule, TopStripComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  isHomePage = false;
  isAdminPanel = false;
  title = 'StaySearchFrontend';
  
  constructor(
    private router: Router,
    private translate: TranslateService) {
      this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const currentUrl = event.urlAfterRedirects;
        console.log('Navigated to:', currentUrl);

        // Match routes for admin or hotellier
        this.isAdminPanel = currentUrl.startsWith('/adminAccess/adminPanel') || currentUrl.startsWith('/hotellier') || currentUrl.startsWith('/adminAccess') ||  currentUrl.startsWith('/p_success') || currentUrl.startsWith('/p_fail');

        // Home page check
        this.isHomePage = currentUrl === '/' || currentUrl === '/home';
      });
   
    const savedLang = localStorage.getItem('language') || 'hi';
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('language', lang); // Save preference
  }



  showGoTop = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showGoTop = window.pageYOffset > 300;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
