import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ButtonDialogComponent } from '../../components/button-dialog/button-dialog.component';
import { DataService } from '../../service/data.service';
import { HttpClientService } from '../../http-serve/http-client.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HintDialogComponent } from '../../components/hint-dialog/hint-dialog.component';
import { DateFormat } from '../../service/dateFornat.service';
import { MyJourneySizeService } from '../../service/my-journey-size.service';
import { PlaceDialogComponent } from '../../components/place-dialog/place-dialog.component';
import { DialogService } from '../../service/dialog.service';
import { JourneyResponse } from '../../interface/JourneyInter';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  provideNativeDateAdapter,
  MAT_DATE_FORMATS,
  DateAdapter,
} from '@angular/material/core';
import { CustomDateAdapter } from '../../service/custom-date-adapter';

interface clientRequest {
  journeyId?: string;
  journeyName: string;
  startDate: string;
  endDate: string;
  transportation: string;
}

@Component({
  selector: 'app-create-journey-dialog',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
  ],
  templateUrl: './create-journey-dialog.component.html',
  styleUrl: './create-journey-dialog.component.scss',
  providers: [
    provideNativeDateAdapter(),
    MatDatepickerModule,
    { provide: DateAdapter, useClass: CustomDateAdapter },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: { dateInput: 'YYYY/MM/DD' },
        display: {
          dateInput: 'YYYY/MM/DD',
          monthYearLabel: 'YYYY MMM',
          dateA11yLabel: 'YYYY/MM/DD',
          monthYearA11yLabel: 'YYYY MMM',
        },
      },
    },
  ],
})
export class CreateJourneyDialogComponent {
  constructor(
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<CreateJourneyDialogComponent>, //用來關掉dialog
    private closePlaceDialog: MatDialogRef<PlaceDialogComponent>, //用來關掉dialog
    private router: Router,
    private http: HttpClientService,
    public dataService: DataService,
    private dateFormat: DateFormat,
    public myJourneySizeService: MyJourneySizeService,
    private dialogService: DialogService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}

  // 新建行程時給的初始資料
  name: string = '';
  startDate: string = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
  endDate: string = new Date().toISOString().split('T')[0];
  inputType = 'DRIVING';
  isUpdating = false;
  accommodationSearchData: {
    journeyId: number;
    name: string;
    address: string;
  } = { journeyId: 0, name: '', address: '' };

  today: Date = new Date();
  minS: string = '';

  nameError = false;
  dateError = false;

  ngOnInit(): void {
    if (this.data && this.data.journeyId) {
      // 更新：把值塞到 input
      this.name = this.data.journeyName;
      this.startDate = this.data.startDate;
      this.endDate = this.data.endDate;
      this.inputType = this.data.transportation;
      this.isUpdating = true;
    } else {
      // 新建：設定預設值
      this.startDate = this.dateFormat.changeDateFormat(
        this.dateFormat.addDate(new Date(), 1)
      );
      this.minS = this.dateFormat.changeDateFormat(new Date());
      this.endDate = this.dateFormat.changeDateFormat(
        this.dateFormat.addDate(new Date(), 7)
      );
    }
  }

  // 設定時區
  adjustToTimezone(date: string | Date, offsetHours: number): string {
    const adjustedDate = new Date(date);
    adjustedDate.setHours(adjustedDate.getHours() + offsetHours);
    return adjustedDate.toISOString().split('T')[0];
  }

  //設定交通方式
  changeType(type: string) {
    this.inputType = type;
  }

  cancel() {
    let dialogRef = this.dialog.open(ButtonDialogComponent, {
      data: '確定要離開嗎',
    });
    dialogRef.afterClosed().subscribe((res) => {
      //關閉後
      if (res) {
        this.dataService.addPlace = null;
        this.dataService.updateAccommodationSearchData({
          journeyId: 0,
          name: '',
          address: '',
        });
        this.dialogRef.close();
      }
    });
  }

  handleSuccess(res: any) {
    this.dataService.accommodationSearchData$.subscribe((data) => {
      this.accommodationSearchData = data;
    });

    this.dataService.updateAccommodationSearchData({
      journeyId: res.journeyId,
      name: this.accommodationSearchData.name,
      address: this.accommodationSearchData.address,
    });

    if (this.accommodationSearchData.name !== '') {
      this.myJourneySizeService.setSelectedTab('tab-2'); // 開到住宿搜尋
    }

    // 更新我的行程列表
    this.http
      .getApi('http://localhost:8080/journey/getJourney')
      .subscribe((res) => {
        const journeyResponse = res as JourneyResponse;
        this.dataService.updateJourneyList(journeyResponse.journeyList);
      });

    sessionStorage.removeItem('dialogPlaceId');

    if (this.dialogService.placeDialogRef) {
      this.dialogService.closePlaceDialog();
    }

    this.dialogRef.close(true);
    this.myJourneySizeService.setJourneyState(1); // 打開行程版面
  }

  handleError(res: any) {
    if (res.message === '請先登入帳戶') {
      this.pleaseLogin('登入後才能操作，是否前往登入?');
    } else {
      this.dialog.open(HintDialogComponent, {
        data: [res.message],
      });
    }
  }

  // 資料驗證
  validate(): boolean {
    const errMessage: string[] = [];
    this.nameError = false;
    this.dateError = false;

    if (!this.name) {
      errMessage.push('行程名稱尚未填寫');
      this.nameError = true;
    }

    if (
      !this.dateFormat.isValidDate(this.startDate) ||
      !this.dateFormat.isValidDate(this.endDate)
    ) {
      errMessage.push('無效的日期');
      this.dateError = true;
    }

    if (this.endDate === '' || this.startDate === '') {
      errMessage.push('請選擇開始日期與結束日期');
      this.dateError = true;
    }

    if (
      new Date(this.endDate).setHours(0, 0, 0, 0) <
      new Date(this.startDate).setHours(0, 0, 0, 0)
    ) {
      errMessage.push('結束日期必須在開始日期之後');
      this.dateError = true;
    }

    if (errMessage.length !== 0) {
      this.dialog.open(HintDialogComponent, {
        data: errMessage,
      });

      return false;
    }
    return true;
  }

  save() {
    if (!this.validate()) {
      this.dialog.open(HintDialogComponent, {
        data: [`${this.isUpdating ? '更新' : '新增'}失敗`],
      });
      return;
    }

    const request: clientRequest = {
      journeyName: this.name,
      startDate: this.adjustToTimezone(this.startDate, 8),
      endDate: this.adjustToTimezone(this.endDate, 8),
      transportation: this.inputType,
    };

    if (this.isUpdating) {
      request.journeyId = this.data.journeyId;
    }

    const url = this.isUpdating
      ? 'http://localhost:8080/journey/updateJourney'
      : 'http://localhost:8080/journey/createJourney';

    this.sendJourneyRequest(url, request);
  }

  sendJourneyRequest(url: string, request: clientRequest) {
    this.http.postApi(url, request).subscribe((res: any) => {
      if (res.code === 200) {
        this.handleSuccess(res);
        this.dialog.open(HintDialogComponent, {
          data: [`${this.isUpdating ? '更新' : '新增'}成功`],
        });
      } else {
        this.handleError(res);
      }
    });
  }

  //請先登入dialog
  pleaseLogin(data: string) {
    let dialogRef = this.dialog.open(ButtonDialogComponent, {
      data: data,
      autoFocus: true,
      restoreFocus: true,
    });

    dialogRef.afterClosed().subscribe((res) => {
      //關閉後
      if (res) {
        this.dialogRef.close('close');
        this.closePlaceDialog.close();
        this.dataService.lastRouter = this.router.url;
        sessionStorage.setItem(
          'searchKeyword',
          JSON.stringify(this.dataService.keyword)
        );
        this.router.navigate(['/login']);
      }
    });
  }
}
