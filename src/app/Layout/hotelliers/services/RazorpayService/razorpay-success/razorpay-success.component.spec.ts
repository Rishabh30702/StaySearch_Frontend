import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RazorpaySuccessComponent } from './razorpay-success.component';

describe('RazorpaySuccessComponent', () => {
  let component: RazorpaySuccessComponent;
  let fixture: ComponentFixture<RazorpaySuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RazorpaySuccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RazorpaySuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
