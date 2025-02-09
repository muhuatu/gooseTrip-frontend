import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, } from '@angular/material/dialog';

@Component({
  selector: 'app-hint-dialog',
  imports: [],
  templateUrl: './hint-dialog.component.html',
  styleUrl: './hint-dialog.component.scss'
})
export class HintDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) private data: any) {}
    note!:string[];

  ngOnInit(): void {
    this.note=this.data;
  }

}
