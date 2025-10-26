import { TestBed } from '@angular/core/testing';

import { PaymentWindowService } from './payment-window.service';

describe('PaymentWindowService', () => {
  let service: PaymentWindowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentWindowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
