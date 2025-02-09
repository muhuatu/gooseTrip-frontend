import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PlaceDialogComponent } from '../components/place-dialog/place-dialog.component';
import { HintDialogComponent } from '../components/hint-dialog/hint-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  placeDialogRef?: MatDialogRef<PlaceDialogComponent>;
  hintDialogRef?: MatDialogRef<HintDialogComponent>;

  closePlaceDialog() {
    this.placeDialogRef?.close();
  }

  closeHintDialog() {
    this.hintDialogRef?.close();
  }
}
