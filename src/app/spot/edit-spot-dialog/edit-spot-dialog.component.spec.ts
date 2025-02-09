import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSpotDialogComponent } from './edit-spot-dialog.component';

describe('EditSpotDialogComponent', () => {
  let component: EditSpotDialogComponent;
  let fixture: ComponentFixture<EditSpotDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSpotDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSpotDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
