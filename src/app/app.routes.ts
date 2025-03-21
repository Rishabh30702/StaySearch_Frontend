import { Routes } from '@angular/router';
import { HomeComponent } from './Layout/home/home.component';
import { ListingsComponent } from './Layout/listings/listings.component';
import { OverviewComponent } from './Layout/overview/overview.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { AboutComponent } from './Layout/about/about.component';


export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        pathMatch: 'full'
    },
    {
        path: 'listings',
      component: ListingsComponent,
    },
    {
        path: 'listings/overview', // Top-level route for overview
        component: OverviewComponent,
    },
    {
        path: 'contactUs', 
        component: ContactUsComponent,
        pathMatch: 'full'
    },

    {
        path: 'about', 
        component: AboutComponent,
        pathMatch: 'full'
    },

  
];
