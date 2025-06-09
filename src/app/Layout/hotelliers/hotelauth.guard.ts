import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const hotelauthGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const token = localStorage.getItem('token'); // or sessionStorage
   const isNew = route.queryParamMap.get('newUser');

  if (token || isNew) {
    return true;
  } else {
    router.navigate(['adminAccess'], {
  queryParams: { key: 'owner' } });
    return false;
  }
};
