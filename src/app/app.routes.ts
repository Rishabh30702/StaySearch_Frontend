import { Routes } from '@angular/router';
import { HomeComponent } from './Layout/home/home.component';
import { ListingsComponent } from './Layout/listings/listings.component';
import { OverviewComponent } from './Layout/overview/overview.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { AboutComponent } from './Layout/about/about.component';
import { UserProfileComponent } from './Layout/user-profile/user-profile.component';
import { AdminAccessComponent } from './Layout/admin-access/admin-access.component';
import { AdminHomeComponent } from './admin-panel/Layout/admin-home/admin-home.component';
import { HotelliersComponent } from './Layout/hotelliers/hotelliers.component';
import { ChairmanMessageComponent } from './Layout/chairman-message/chairman-message.component';
import { MdMessageComponent } from './Layout/md-message/md-message.component';


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

    {
        path: 'userProfile', 
        component: UserProfileComponent,
        pathMatch: 'full'
    },

    {
        path: 'adminAccess', 
        component: AdminAccessComponent,
        pathMatch: 'full'
    },
    {
        path: 'adminAccess/adminPanel', 
        component: AdminHomeComponent,
        pathMatch: 'full'
    },
    {
        path: 'hotellier', 
        component: HotelliersComponent,
        pathMatch: 'full'
    },
    {
        path: 'chairman_message', 
        component: ChairmanMessageComponent,
        pathMatch: 'full'
    },
    {
        path: 'md_message', 
        component: MdMessageComponent,
        pathMatch: 'full'
    }


  
];
