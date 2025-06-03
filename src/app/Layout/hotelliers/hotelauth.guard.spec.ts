import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { hotelauthGuard } from './hotelauth.guard';

describe('hotelauthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => hotelauthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
