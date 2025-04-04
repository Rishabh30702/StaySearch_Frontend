import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelliersComponent } from './hotelliers.component';

describe('HotelliersComponent', () => {
  let component: HotelliersComponent;
  let fixture: ComponentFixture<HotelliersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelliersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelliersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
