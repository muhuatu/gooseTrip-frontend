import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatDialogRef,
  MatDialog,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { HttpClientService } from '../../http-serve/http-client.service';
import { GoogleMapService } from '../../service/googlemap.service';
import { PlaceDialogComponent } from '../place-dialog/place-dialog.component';
import { HintDialogComponent } from '../hint-dialog/hint-dialog.component';
import { AddPlaceDialogComponent } from '../add-place-dialog/add-place-dialog.component';
import {
  day,
  joinResponse,
  Journey,
  SpotAndRouteResponse2,
} from '../../interface/JourneyInter';
import { MyJourneySizeService } from '../../service/my-journey-size.service';
import { DialogService } from '../../service/dialog.service';
import { DataService } from '../../service/data.service';

@Component({
  selector: 'app-select-journey-dialog',
  imports: [FormsModule, MatExpansionModule, CommonModule],
  templateUrl: './select-journey-dialog.component.html',
  styleUrl: './select-journey-dialog.component.scss',
})
export class SelectJourneyDialogComponent {
  // 假資料（後端傳回的資料型態）
  // editList = [
  //   {
  //     journeyId: 1,
  //     journeyName: '台北之旅',
  //     totalDays: 7,
  //     editingDays: [1, 2],
  //   },
  //   {
  //     journeyId: 6,
  //     journeyName: '澎湖遊',
  //     totalDays: 7,
  //     editingDays: [2],
  //   },
  // ];

  selectedJourneyId!: number; // 選擇的行程 ID
  selectedDay!: number; // 選擇的天數
  editingDays: number[] = []; // 被禁用的天數
  availableDays: number[] = []; // 可選的天數列表
  editList: any[] = [];
  journey: Journey = {
    journeyId: 0,
    journeyName: '',
    startDate: '',
    endDate: '',
    transportation: '',
    invitation: '',
    userMail: '',
  };
  dayArray: day[] = [];

  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<PlaceDialogComponent>, //用來關掉dialog
    public googleMapService: GoogleMapService,
    private cdr: ChangeDetectorRef,
    private http: HttpClientService,
    public dialog: MatDialog,
    public dataService: DataService,
    private dialogService: DialogService,
    public myJourneySizeService: MyJourneySizeService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.editList = this.dataService.editList;
  }

  onJourneyChange(): void {
    // 獲取選擇的行程
    const selectedJourneyData = this.editList.find(
      (journey) => journey.journeyId === Number(this.selectedJourneyId)
    );
    this.journey = selectedJourneyData;

    if (selectedJourneyData) {
      this.editingDays = selectedJourneyData.editingDays;
      // 獲取行程所有天數
      this.availableDays = Array.from(
        { length: selectedJourneyData.totalDays },
        (_, i) => i + 1
      );
    } else {
      this.editingDays = [];
      this.availableDays = [];
    }

    // 手動觸發變更檢測
    this.cdr.detectChanges();
  }

  onConfirm(): void {
    //呼叫APi拿到選擇的行程的那一天
    this.http
      .getApi(
        'http://localhost:8080/spots/getSpotAndRouteSortOut?JourneyId=' +
          this.selectedJourneyId
      )
      .subscribe((res) => {
        // console.log(res);

        const Response = res as SpotAndRouteResponse2;

        if (Response.code == 200) {
          //每天都要一個isRevisable存放是否有在編輯這天
          for (let i = 1; i <= Response.spotList.length; i++) {
            //把journeyI補上
            for (let day of Response.spotList) {
              day.journeyId = this.selectedJourneyId;
              if (i == day.day) {
                for (let spot of day.spotList) {
                  const arrivalTime = this.convertTime(spot.arrivalTime);
                  if (arrivalTime) {
                    spot.arrivalTime = arrivalTime;
                  }
                  const departureTime = this.convertTime(spot.departureTime);
                  if (departureTime) {
                    spot.departureTime = departureTime;
                  }

                  spot.stayTime = this.addTimeStrings(
                    spot.arrivalTime,
                    spot.departureTime,
                    false
                  );
                }
                this.dayArray.push(day);
              }
            }
          }

          //將選的資料傳遞到dataService
          this.dataService.selectedDayData =
            this.dayArray[this.selectedDay - 1];
          // this.dataService.selectedJourney = this.journey;
          this.dataService.selectedJourneyData.journeyId =
            this.journey.journeyId;
          this.dataService.selectedJourneyData.selectedDay = this.selectedDay;

          this.dialog.open(AddPlaceDialogComponent, {
            data: '',
            autoFocus: false,
          });
          this.dialogRef.close();
        }
        if (Response.code != 200) {
          let errmessage = [Response.message];
          this.dialog.open(HintDialogComponent, { data: errmessage });
        }
      });
  }
  //計算時間
  addTimeStrings(time1: string, time2: any, addBoolean: boolean) {
    if (time1 && time2) {
      if (time1.length > 5 || time2.length > 5) {
        time1 = time1.slice(0, 5);
        time2 = time2.slice(0, 5);
      }
      // 解析兩個時間字串為小時和分鐘
      const [hours1, minutes1] = time1.split(':').map(Number);

      const [hours2, minutes2] = time2.split(':').map(Number);

      // 將兩個時間轉換為總分鐘數
      const totalMinutes1 = hours1 * 60 + minutes1;

      const totalMinutes2 = hours2 * 60 + minutes2;

      let totalMinutes = 0;

      // 相加總分鐘數
      if (addBoolean) {
        totalMinutes = totalMinutes1 + totalMinutes2;
      }
      if (!addBoolean) {
        totalMinutes = totalMinutes2 - totalMinutes1;
      }

      // 將總分鐘數轉換回小時和分鐘
      const resultHours = Math.floor(totalMinutes / 60) % 24; // 使用 % 24 防止超過一天
      const resultMinutes = totalMinutes % 60;

      // 格式化結果為 "HH:mm"
      return `${String(resultHours).padStart(2, '0')}:${String(
        resultMinutes
      ).padStart(2, '0')}`;
    } else {
      return '';
    }
  }
  //資料庫拿出的時間轉格式
  convertTime(time: string) {
    if (!time) {
      return;
    }
    if (time.length > 5) {
      const [hours, minutes, Second] = time.split(':').map(Number);

      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
        2,
        '0'
      )}`;
    }
    return time;
  }

  onCancel(): void {
    //取消的邏輯
    this.dialogRef.close();
  }
}
