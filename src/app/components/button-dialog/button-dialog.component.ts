import { Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-button-dialog',
  imports: [],
  templateUrl: './button-dialog.component.html',
  styleUrl: './button-dialog.component.scss'
})
export class ButtonDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
  private dialogRef: MatDialogRef<ButtonDialogComponent>, //用來關掉dialog
) {}

note!:string;
ngOnInit(): void {
  this.note=this.data;
}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
