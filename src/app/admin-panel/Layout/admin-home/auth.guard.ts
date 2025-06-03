import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
 
   const router = inject(Router);
  const token = localStorage.getItem('token'); // or sessionStorage

  if (token) {
    return true;
  } else {
    router.navigate(['/adminAccess'],
       {
  queryParams: { key: 'admin' } }
    );
    return false;
  }
};
