import { TestBed } from '@angular/core/testing';

import { RazorpayserviceService } from './razorpayservice.service';

describe('RazorpayserviceService', () => {
  let service: RazorpayserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RazorpayserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
