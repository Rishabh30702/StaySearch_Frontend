import { CanActivateFn } from '@angular/router';

export const adminAccessGuard: CanActivateFn = (route, state) => {




 const key = route.queryParamMap.get('key');

  if (!key) {
    alert('Access denied: No access key provided.');
    return false; // 🚫 block navigation
  }
if (key !== 'admin' && key !== 'owner') {
    alert('Access denied: No access key provided.');
    return false; // 🚫 block navigation
  }
  // Optional: restrict to a specific key value
  // if (key !== 'MY_SECRET_KEY') {
  //   alert('Invalid access key.');
  //   return false;
  // }

  return true; // 

  
};
