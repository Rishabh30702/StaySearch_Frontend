import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
 
   const router = inject(Router);
  const token = localStorage.getItem('token'); // or sessionStorage
  const role = route.queryParamMap.get('value');
  // console.log(role);
  if (role === "admin" && token) {
    return true;
  } else {
    router.navigate(['/adminAccess'],
       {
  queryParams: { key: 'admin' } }
    );
    return false;
  }
};
