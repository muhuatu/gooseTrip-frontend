import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomCheckComponent } from './room-check.component';

describe('RoomCheckComponent', () => {
  let component: RoomCheckComponent;
  let fixture: ComponentFixture<RoomCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomCheckComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
