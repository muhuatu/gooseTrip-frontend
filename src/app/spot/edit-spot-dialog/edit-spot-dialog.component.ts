import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { daySpot } from '../../interface/JourneyInter';

@Component({
  selector: 'app-edit-spot-dialog',
  imports: [FormsModule],
  templateUrl: './edit-spot-dialog.component.html',
  styleUrl: './edit-spot-dialog.component.scss',
})
export class EditSpotDialogComponent {
  hour: string = '';
  minute: string = '';
  startTime: string = '';
  // hoursList: string[] = [];
  // minutesList: string[] = ['00', '15', '30', '45'];
  departureTime: string = '';

  constructor(
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<EditSpotDialogComponent>, //用來關掉dialog
    private closePlaceDialog: MatDialogRef<EditSpotDialogComponent>, //用來關掉dialog
    @Inject(MAT_DIALOG_DATA) public data: { spot: daySpot } // 接收傳遞的數據
  ) { }

  ngOnInit(): void {

      // 如果停留時間未設定，設為預設值 1 小時
      if (!this.data.spot.stayTime) {
        this.hour = '01';
        this.minute = '00';
        this.data.spot.stayTime = `${this.hour}:${this.minute}`;
      } else {
        const [savedHour, savedMinute] = this.data.spot.stayTime.split(':');
        this.hour = savedHour;
        this.minute = savedMinute;
      }

    // if (this.data.spot.spotId === 1) {
    //   // 如果停留時間未設定，設為預設值 1 小時
    //   if (!this.data.spot.stayTime) {
    //     this.hour = '01';
    //     this.minute = '00';
    //     this.data.spot.stayTime = `${this.hour}:${this.minute}`;
    //   } else {
    //     const [savedHour, savedMinute] = this.data.spot.stayTime.split(':');
    //     this.hour = savedHour;
    //     this.minute = savedMinute;
    //   }
    // } else if (this.data.spot.stayTime) {
    //   const [savedHour, savedMinute] = this.data.spot.stayTime.split(':');
    //   this.hour = savedHour;
    //   this.minute = savedMinute;
    // }
    this.calculateDepartureTime();
  }

  //使用者編輯後，更新存在父組件的資料
  // saveSpot() {
  //   if (this.hour != '' || this.minute != '') {
  //     let staytime = this.hour + ':' + this.minute;
  //     this.data.spot.stayTime = staytime;
  //   }

  //   this.dialogRef.close(this.data.spot);
  // }
  saveSpot() {
    if (this.hour != '' || this.minute != '') {
      const stayTime = `${this.hour || '00'}:${this.minute || '00'}`;
      this.data.spot.stayTime = stayTime;
      this.data.spot.departureTime = this.departureTime; // 保存離開時間
    }
    this.dialogRef.close(this.data.spot);
  }

  //關閉dialog
  cancel() {
    this.dialogRef.close();
  }

  // 讓時間選擇框彈出
  openTimePicker(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    input.showPicker();
  }

  // 計算離開時間
  calculateDepartureTime() {
    if (this.data.spot.arrivalTime && (this.hour || this.minute)) {
      const arrivalTime = new Date(`2000/01/01 ${this.data.spot.arrivalTime}`);
      const hoursToAdd = parseInt(this.hour) || 0; // 要先把字串 '3' 轉成整數 3 再計算
      const minutesToAdd = parseInt(this.minute) || 0;
      // console.log(this.data.spot.arrivalTime); // 11:00
      // console.log(arrivalTime); // Sat Jan 01 2000 11:00:00 GMT+0800 (台北標準時間)
      // console.log(hoursToAdd); // 3

      arrivalTime.setHours(arrivalTime.getHours() + hoursToAdd);
      arrivalTime.setMinutes(arrivalTime.getMinutes() + minutesToAdd);

      const hours = arrivalTime.getHours().toString().padStart(2, '0'); // 指定要2位數，如果不足前面要補0
      const mins = arrivalTime.getMinutes().toString().padStart(2, '0');

      this.departureTime = `${hours}:${mins}`;
    } else {
      this.departureTime = '';
    }
  }

  // 當停留時間改變時更新離開時間
  onStayTimeChange() {
    this.calculateDepartureTime();
  }

  // 當抵達時間改變時更新離開時間
  onArrivalTimeChange() {
    this.calculateDepartureTime();
  }

}
