import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelFilterComponent } from './hotel-filter.component';

describe('HotelFilterComponent', () => {
  let component: HotelFilterComponent;
  let fixture: ComponentFixture<HotelFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
