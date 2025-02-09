import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelDataComponent } from './hotel-data.component';

describe('HotelDataComponent', () => {
  let component: HotelDataComponent;
  let fixture: ComponentFixture<HotelDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
