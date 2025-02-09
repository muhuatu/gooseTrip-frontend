import { ChangeDetectorRef, Component, Inject, Input } from '@angular/core';
import {
  day,
  daySpot,
  joinResponse,
  Journey,
  JourneyResponse,
  spot,
  SpotAndRouteResponse,
  SpotAndRouteResponse2,
} from '../../interface/JourneyInter';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { HttpClientService } from '../../http-serve/http-client.service';
import { MyJourneySizeService } from '../../service/my-journey-size.service';
import { HintDialogComponent } from '../hint-dialog/hint-dialog.component';
import { DialogService } from '../../service/dialog.service';
import { DataService } from '../../service/data.service';

@Component({
  selector: 'app-add-place-dialog',
  imports: [CommonModule],
  templateUrl: './add-place-dialog.component.html',
  styleUrl: './add-place-dialog.component.scss',
})
export class AddPlaceDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<AddPlaceDialogComponent>, //用來關掉dialog
    private cdr: ChangeDetectorRef,
    private http: HttpClientService,
    public dialog: MatDialog,
    public dataService: DataService,
    public myJourneySizeService: MyJourneySizeService,
    private dialogService: DialogService,
    @Inject(MAT_DIALOG_DATA) private data: { day: day; journey: Journey }
  ) {}

  journey: Journey = {
    journeyId: 0,
    journeyName: '',
    startDate: '',
    endDate: '',
    transportation: '',
    invitation: '',
    userMail: '',
  };
  // day!: day;
  journeyId = 0;
  day = 0;
  date = '';
  selectDay: number = 0;
  //假資料
  spotList: daySpot[] = [];
  // [
  //   {
  //     spotId: 1,
  //     spotName: '第一個地點',
  //     placeId: '343435',
  //     note: '',
  //     arrivalTime: '',
  //     departureTime: '',
  //   },
  //   {
  //     spotId: 2,
  //     spotName: '第二個地點',
  //     placeId: '343435',
  //     note: '',
  //     arrivalTime: '',
  //     departureTime: '',
  //   },
  //   {
  //     spotId: 3,
  //     spotName: '第三個地點',
  //     placeId: '343435',
  //     note: '',
  //     arrivalTime: '',
  //     departureTime: '',
  //   },
  //   {
  //     spotId: 4,
  //     spotName:
  //       '第四個地點',
  //     placeId: '343435',
  //     note: '',
  //     arrivalTime: '',
  //     departureTime: '',
  //   },
  // ];

  ngOnInit(): void {
    this.http
      .getApi('http://localhost:8080/journey/getJourney')
      .subscribe((res) => {
        const response = res as JourneyResponse;
        if (response.code == 200) {
          for (let journey of response.journeyList) {
            if (
              journey.journeyId ==
              this.dataService.selectedJourneyData.journeyId
            ) {
              this.journey = journey;
            }
          }
        }
        if (response.code != 200) {
          console.log(response.message);
        }
      });
    //如果this.dataService.editing.journeyId != 0代表是有點過編輯行程的
    //可以直接拿到day
    if (this.dataService.editing.journeyId != 0) {
      this.dataService.day$.subscribe((status) => {
        if (status.journeyId != 0) {
          this.journeyId = status.journeyId;
          this.spotList = status.spotList;
          this.day = status.day;
          this.date = status.date;
        }
      });
    }
    //沒有點過編輯行程的 那就有經過select journeydailog會有選取資料放在data service
    else {
      if (this.dataService.selectedDayData.journeyId != 0) {
        this.journeyId = this.dataService.selectedJourneyData.journeyId;
        this.spotList = this.dataService.selectedDayData.spotList;
        this.day = this.dataService.selectedDayData.day;
        this.date = this.dataService.selectedDayData.date;
      }
    }
    // console.log(this.day);
  }

  activeIndex: number | null = null;
  selected = false;

  select(index: number) {
    this.selected = true;
    this.activeIndex = index;
    this.cdr.detectChanges();
  }

  cancel() {
    //取消的邏輯
    //清空select journeydailog的選取資料(假如有的話)
    if (this.dataService.selectedDayData.journeyId != 0) {
      this.dataService.clearSelectedData();
    }
    this.dialogRef.close();
  }

  save() {
    if (this.spotList.length == 0) {
      this.activeIndex = -1;
    }

    if (this.activeIndex == null) {
      this.dialog.open(HintDialogComponent, {
        data: ['請選擇要加在什麼地方'],
      });
    } else {
      //真正的加進行程裡
      //下面正個是把daySpot[](單一天的資訊)改成對的資訊的邏輯
      this.dataService.isCreateSpot = true;

      let newSpotList: daySpot[] = [];
      let newSpot: daySpot = {
        spotId: 0,
        spotName: this.dataService.addPlace?.name
          ? this.dataService.addPlace?.name
          : '找不到',
        placeId: this.dataService.addPlace?.place_id!,
        note: '',
        arrivalTime: '',
        departureTime: '',
        stayTime: '01:00',
        address: this.dataService.addPlace?.formatted_address,
        longitude: this.dataService.addPlace?.geometry?.location?.lng(),
        latitude: this.dataService.addPlace?.geometry?.location?.lat(),
        placeType: this.dataService.addPlace?.types
          ? this.dataService.addPlace?.types[0]
          : undefined,
        spotImage: this.dataService.addPlace?.photos
          ? this.dataService.addPlace?.photos[0].getUrl({
              maxWidth: 5000,
              maxHeight: 5000,
            })
          : undefined,
      };
      console.log(newSpot);

      //要加進newSpot的
      // this.dataService.addPlace?.photos![0].getUrl({
      //   maxWidth: 5000,
      //   maxHeight: 5000,
      // });
      // this.dataService.addPlace?.geometry?.location?.lat(); //緯度
      // this.dataService.addPlace?.geometry?.location?.lng(); //經度
      // this.dataService.addPlace?.types![0];

      for (let index = 0; index <= this.spotList.length - 1; index++) {
        //如果activeIndex=index-1 要先將newSpot push進newSpotList
        if (index - 1 == this.activeIndex) {
          newSpotList.push(newSpot);
        }
        newSpotList.push(this.spotList[index]);
      }
      //如果長度一樣 代表加在最後面
      if (newSpotList.length == this.spotList.length) {
        newSpotList.push(newSpot);
      }
      //重新給spotID
      let spotId = 1;
      for (let spot of newSpotList) {
        spot.spotId = spotId;
        spotId++;
      }
      let day = {
        journeyId: this.journeyId,
        day: this.day,
        date: this.date,
        spotList: newSpotList,
      };

      //跳轉到對應Tab
      // this.dataService.updateDayt(this.dayArray[this.selectedDay - 1]);

      //沒有點過編輯行程的 所以沒有編輯權限 要給編輯權限並幫忙跳轉
      if (this.dataService.selectedDayData.journeyId != 0) {
        console.log(this.dataService.selectedJourney);

        //跳轉到對應行程內
        this.dataService.updateNewJourney(this.journey);
        this.myJourneySizeService.setSelectedTab('tab-1');
        //將編輯行程Id跟天數寫進資料庫users欄位
        let req = {
          userEdit: `${this.journeyId},${this.dataService.selectedJourneyData.selectedDay}`,
        };

        this.http
          .postApi('http://localhost:8080/user/startUpdateUserEdit', req)
          .subscribe((res) => {
            // console.log(res);
            let Response = res as joinResponse;
            if (Response.code == 200) {
              this.dataService.isEditing = true;
              this.dataService.updateDayt(day);

              // 跳轉到對應tab的資料
              // this.dataService.updateSelectedTab(this.day);

              this.dataService.editing.journeyId = this.journeyId;
              this.dataService.editing.day = this.day;
              //清空select journeydailog的選取資料
              this.dataService.clearSelectedData();

              this.dialogRef.close();
            }
            if (Response.code != 200) {
              let errmessage = [Response.message];
              this.dialog.open(HintDialogComponent, { data: errmessage });
            }
          });
      } else {
        //有編輯權限的直接刷新就好 不需要跳轉
        this.dataService.updateDayt(day);
        this.dialogRef.close();
      }

      //     if (this.activeIndex == index) {
      //       newSpotList.push(newSpot);
      //     }
      //     newSpotList.push(this.spotList[index + 1]);
      //     newSpotList[index + 1].spotId = index + 2;
      //   }
      // //如果this.activeIndex是this.spotList.length-1，代表是加在最後面
      // if (this.activeIndex == this.spotList.length - 1) {
      //   newSpotList = this.spotList;
      //   newSpot.spotId = this.spotList.length + 1;
      //   newSpotList.push(newSpot);
      // } else {
      //   for (let index = -1; index < this.spotList.length - 1; index++) {
      //     if (this.activeIndex == index) {
      //       newSpotList.push(newSpot);
      //     }
      //     newSpotList.push(this.spotList[index + 1]);
      //     newSpotList[index + 1].spotId = index + 2;
      //   }
      // }
    }
  }
}
