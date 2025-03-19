import { TestBed } from '@angular/core/testing';

import { HotelListingService } from './hotel-listing.service';

describe('HotelListingService', () => {
  let service: HotelListingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HotelListingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
