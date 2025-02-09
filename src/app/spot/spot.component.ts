import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import {
  day,
  joinResponse,
  route,
  spot,
  SpotAndRouteResponse2,
} from '../interface/JourneyInter';
import { HttpClientService } from '../http-serve/http-client.service';
import { MatDialog } from '@angular/material/dialog';
import { HintDialogComponent } from '../components/hint-dialog/hint-dialog.component';
import { FormsModule } from '@angular/forms';
import { EditSpotDialogComponent } from './edit-spot-dialog/edit-spot-dialog.component';
import { Router } from '@angular/router';
import { DataService } from '../service/data.service';
import { ButtonDialogComponent } from '../components/button-dialog/button-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DateFormat } from '../service/dateFornat.service';

@Component({
  selector: 'app-spot',
  imports: [MatCardModule, MatIconModule, FormsModule, MatTooltipModule],
  templateUrl: './spot.component.html',
  styleUrl: './spot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpotComponent {
  private scrollAmount: number = 0; // 滾動距離
  private container: HTMLElement | null = null;

  directionsService = new google.maps.DirectionsService();

  selectedDay: boolean[] = [];
  // 設置是否啟用 draggable
  isDraggable: boolean = false; // 默認為不啟用

  isRevisable: boolean[] = [];

  selectedDayIndex = -1;

  today = new Date(); //今天

  @Input() journey = {
    journeyId: 0,
    journeyName: '',
    invitation: '',
    startDate: '',
    endDate: '',
    transportation: '',
    userMail: '',
  };
  spotList: spot[] = [];
  routeList: route[] = [];
  day: number = 0;
  //用於存放選中的日期的資料
  dayRoute: any[] = [];
  dayArray: day[] = [];
  startDate = new Date();
  selectedTab = 0;
  // 用於存儲拖曳資料的變數
  draggedIndex: number | null = null;
  newRouteList: any[] = [];
  startTime = '08:00';

  constructor(
    private el: ElementRef,
    private data: DataService,
    private http: HttpClientService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private router: Router,
    public dateFormat: DateFormat
  ) {}

  ngOnInit(): void {
    this.getSpotAndRoute();
    this.data.newRoute$.subscribe(this.handleNewRoute);
  }

  getPlaceIdArray = (): string[] => {
    return this.dayArray[this.selectedTab - 1].spotList.map(
      (spot) => spot.placeId
    );
  };

  // 路徑資料更新就重新計算時間
  handleNewRoute = (Data: any) => {
    if (this.selectedTab > 0) {
      const routeList = this.dayRoute[this.selectedTab - 1].routeList;
      for (let i = 0; i < routeList.length; i++) {
        const route = routeList[i];
        if (
          Data.startPlaceId === route.startPlaceId &&
          Data.endPlaceId === route.endPlaceId
        ) {
          routeList[i] = Data;
        }
      }
      this.calculateTime();
    }
    this.cdr.detectChanges();
  };

  // 每日景點資料狀態改變就重刷畫面
  handleDayStatusChange = (status: any) => {
    if (status.journeyId !== 0) {
      this.selectedTab = status.day;
      this.isRevisable[this.selectedTab - 1] = true;
      this.dayArray[this.selectedTab - 1] = status;
      if (this.dayArray[this.selectedTab - 1].spotList[0].arrivalTime) {
        this.startTime =
          this.dayArray[this.selectedTab - 1].spotList[0].arrivalTime;
      }
      this.selectedDayIndex = status.day - 1;
      this.cdr.detectChanges();

      if (this.data.isCreateSpot) {
        this.handleNewSpotCreation();
      }
    }
  };

  // 新增景點
  async handleNewSpotCreation() {
    const placeIdArray = this.getPlaceIdArray();
    const currentDay = this.dayArray[this.selectedTab - 1];
    if (currentDay && currentDay.spotList && currentDay.spotList.length >= 2) {
      await this.calculateAndDisplayRoute(placeIdArray, this.selectedTab);
    } else if (
      currentDay &&
      currentDay.spotList &&
      currentDay.spotList.length === 1
    ) {
      this.handleSingleSpot();
    }
    this.data.isCreateSpot = false;
    this.cdr.detectChanges();
  }

  // 只有單筆景點的情況
  handleSingleSpot = () => {
    const spot = this.dayArray[this.selectedTab - 1].spotList[0];
    spot.arrivalTime = this.startTime;
    spot.departureTime = spot.stayTime
      ? this.addTimeStrings(this.startTime, spot.stayTime, true)
      : this.addTimeStrings(this.startTime, '01:00', true);
    this.cdr.detectChanges();
  };

  //把class="tabgroup"的元素注入到container
  ngAfterViewInit() {
    this.data.day$.subscribe(this.handleDayStatusChange);

    this.container = this.el.nativeElement.querySelector('.tabgroup');
  }
  //切換tab內顯示的內容
  switchtab(event: Event, day: number) {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.selectedTab = day;
    }
    //切換tab時，如果有景點 把開始時間改成第一個景點的抵達時間
    if (
      this.selectedTab !== 0 &&
      this.dayArray[this.selectedTab - 1].spotList.length > 0
    ) {
      this.startTime =
        this.dayArray[this.selectedTab - 1].spotList[0].arrivalTime;
    }
    this.cdr.detectChanges();
  }
  //給予修改權限
  revise(index: number) {
    let req = { userEdit: `${this.journey?.journeyId},${this.selectedTab}` };

    this.http
      .postApi('http://localhost:8080/user/startUpdateUserEdit', req)
      .subscribe((res) => {
        let Response = res as joinResponse;
        if (Response.code == 200) {
          this.isRevisable[this.selectedTab - 1] = true;
          this.data.isDraggable = this.isDraggable;
          this.data.isEditing = true;

          this.data.editing.journeyId = this.journey.journeyId;
          this.data.editing.day = this.selectedTab;

          this.data.updateDayt(this.dayArray[this.selectedTab - 1]);
        }
        if (Response.code != 200) {
          let errmessage = [Response.message];
          this.dialog.open(HintDialogComponent, { data: errmessage });
        }
      });
  }
  //重整
  refresh() {
    this.http
      .getApi(
        'http://localhost:8080/spots/getSpotAndRouteSortOut?JourneyId=' +
          this.journey.journeyId
      )
      .subscribe((res) => {
        const Response = res as SpotAndRouteResponse2;
        //幫拿回的行程重新加上ID
        for (let day of Response.spotList) {
          day.journeyId = this.journey.journeyId;
          if (day.day == this.selectedTab) {
            //時間替換成HH:MM
            for (let spot of day.spotList) {
              const arrivalTime = this.convertTime(spot.arrivalTime);
              if (arrivalTime) {
                spot.arrivalTime = arrivalTime;
              }
              const departureTime = this.convertTime(spot.departureTime);
              if (departureTime) {
                spot.departureTime = departureTime;
              }
              //計算停留時間
              spot.stayTime = this.addTimeStrings(
                spot.arrivalTime,
                spot.departureTime,
                false
              );
            }
            this.dayArray[this.selectedTab - 1] = day;
          }
        }
        //取得路徑陣列
        this.dayRoute[this.selectedTab - 1].routeList = [];
        for (let route of Response.routeList) {
          const routeTime = this.convertTime(route.routeTime);
          if (routeTime) {
            route.routeTime = routeTime;
          }
          if (route.day == this.selectedTab) {
            this.dayRoute[this.selectedTab - 1].routeList.push(route);
          }
        }
        console.log('重整完畢!');
      });
  }

  //修改結束
  reviseEnd(index: number) {
    this.isDraggable = false;
    //儲存景點用的資料
    let spotList = [];
    //儲存地點用的資料
    let placeList = [];
    for (let spot of this.dayArray[this.selectedTab - 1].spotList) {
      spotList.push({
        spotId: spot.spotId,
        spotName: spot.spotName,
        placeId: spot.placeId,
        note: spot.note,
        arrivalTime: spot.arrivalTime,
        departureTime: spot.departureTime,
        spotImage: spot.spotImage,
      });
      placeList.push({
        placeId: spot.placeId,
        placeName: spot.spotName,
        address: spot.address,
        longitude: spot.longitude,
        latitude: spot.latitude,
        placeType: spot.placeType,
      });
    }

    const spotReq = { ...this.dayArray[this.selectedTab - 1] };

    spotReq.spotList = spotList;

    // this.data.updateDayt(this.dayArray[this.selectedTab - 1]);
    this.http
      .postApi('http://localhost:8080/spots/createSpot', spotReq)
      .subscribe((res) => {
        const Response = res as any;
        if (Response.message !== 200) {
          let errmessage = [Response.message];
          this.dialog.open(HintDialogComponent, { data: errmessage });
        }
      });
    // 新增及更新地點Api
    // 用 placeData 裝 placeList 裡面的資料
    let placeData = [...placeList];
    this.http
      .postApi('http://localhost:8080/map_place/updateAllPlace', placeData)
      .subscribe((res) => {});

    let req = { userEdit: `${this.journey?.journeyId},${this.selectedTab}` };
    this.http
      .postApi('http://localhost:8080/user/endUpdateUserEdit', req)
      .subscribe((res) => {
        let Response = res as joinResponse;
        if (Response.code == 200) {
          this.data.isEditing = false;

          this.isRevisable[this.selectedTab - 1] = false;
          this.data.finishEditing();
          this.cdr.detectChanges();
        }
        if (Response.code != 200) {
          let errmessage = [Response.message];
          this.dialog.open(HintDialogComponent, { data: errmessage });
        }
      });
    this.http
      .postApi(
        'http://localhost:8080/map_route/saveOrUpdateAllRoute',
        this.dayRoute[this.selectedTab - 1].routeList
      )
      .subscribe((res) => {});
  }

  // 設定拖曳開始時觸發的事件
  onDragStart(event: DragEvent, index: number) {
    this.draggedIndex = index;
  }

  // 設定拖曳過程中的事件，允許放置
  onDragenter(event: DragEvent, targetIndex: number) {
    event.preventDefault(); // 這樣允許放置

    // 如果拖曳和放置的索引相同，則不做處理
    if (this.draggedIndex == targetIndex) {
      return;
    }

    // 拿到源索引和目標索引的 spot 資料
    const sourceSpot =
      this.dayArray[this.selectedTab - 1].spotList[this.draggedIndex!];
    const targetSpot =
      this.dayArray[this.selectedTab - 1].spotList[targetIndex];

    // 交換資料
    this.dayArray[this.selectedTab - 1].spotList[this.draggedIndex!] =
      targetSpot;
    this.dayArray[this.selectedTab - 1].spotList[targetIndex] = sourceSpot;
    //把交換後的Index更新到draggedIndex
    this.draggedIndex = targetIndex;
  }
  //拖曳結束將draggedIndex清空，同時重新賦予spotId
  async onDropEnd(event: DragEvent) {
    this.draggedIndex = null;
    let spotId = 1;
    for (let spot of this.dayArray[this.selectedTab - 1].spotList) {
      spot.spotId = spotId;
      spotId++;
    }
    if (this.dayArray[this.selectedTab - 1].spotList.length >= 2) {
      let placeIdArray: string[] = [];
      for (let spot of this.dayArray[this.selectedTab - 1].spotList) {
        placeIdArray.push(spot.placeId);
      }
      await this.calculateAndDisplayRoute(placeIdArray, this.selectedTab);
    }
  }
  //結束拖曳
  Stopdrag() {
    this.isDraggable = !this.isDraggable;
    this.cdr.detectChanges();
  }
  //tab移動方法
  scrollLeft() {
    if (this.container) {
      this.scrollAmount = Math.max(this.scrollAmount - 100, 0);
      this.container.scrollLeft = this.scrollAmount;
    }
  }
  //tab移動方法
  scrollRight() {
    if (this.container) {
      const maxScrollLeft =
        this.container.scrollWidth - this.container.offsetWidth;
      this.scrollAmount = Math.min(this.scrollAmount + 100, maxScrollLeft);
      this.container.scrollLeft = this.scrollAmount;
    }
  }

  //點擊景點時進入修改景點dialog
  editSpot(index: number) {
    // 取當前的景點
    const selectedSpot = {
      ...this.dayArray[this.selectedTab - 1].spotList[index],
    }; // 深拷貝
    const dialogRef = this.dialog.open(EditSpotDialogComponent, {
      data: { spot: selectedSpot },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // 更新原數據（如果需要）
        this.dayArray[this.selectedTab - 1].spotList[index] = result;
        if (index == 0) {
          this.startTime =
            this.dayArray[this.selectedTab - 1].spotList[index].arrivalTime;
        }

        this.calculateTime();
        this.cdr.detectChanges();
      }
    });
  }
  //刪除景點的方法
  deleteSpot(index: number) {
    let daySpot = this.dayArray[this.selectedTab - 1].spotList;
    const dialogRef = this.dialog.open(ButtonDialogComponent, {
      data: '確定要刪除該景點嗎',
    });
    dialogRef.afterClosed().subscribe(async (res) => {
      if (res) {
        //刪除景點
        daySpot.splice(index, 1);
        this.cdr.detectChanges();
        //重給spotId
        let spotId = 1;
        for (let spot of daySpot) {
          spot.spotId = spotId;
          spotId++;
        }

        //重算路徑
        if (this.dayArray[this.selectedTab - 1].spotList.length >= 2) {
          let placeIdArray: string[] = [];
          for (let spot of daySpot) {
            placeIdArray.push(spot.placeId);
          }
          await this.calculateAndDisplayRoute(placeIdArray, this.selectedTab);
        }
        //只有一個景點 幫他算時間
        if (this.dayArray[this.selectedTab - 1].spotList.length == 1) {
          this.handleSingleSpot();
          this.dayRoute[this.selectedTab - 1].routeList = [];

          this.cdr.detectChanges();
        }
      }
    });
  }
  //跳轉到map
  gotomap(route: route, index: number) {
    //景點名也要一同給
    for (let spot of this.dayArray[this.selectedTab - 1].spotList) {
      if (spot.placeId == route.startPlaceId) {
        this.data.startPlaceName = spot.spotName;
      }
      if (spot.placeId == route.endPlaceId) {
        this.data.endPlaceName = spot.spotName;
      }
    }

    this.router.navigateByUrl('/map');
    this.data.routeLine = route;
  }

  //把字串轉換對應的google.maps.TravelMode
  convertTravelMode(transportation: string) {
    if (!transportation || transportation.length == 0) {
      console.log('交通方式資料錯誤');
    }
    if (transportation == 'DRIVING') {
      let travelMode = google.maps.TravelMode.DRIVING;
      return travelMode;
    }
    if (transportation == 'WALKING') {
      let travelMode = google.maps.TravelMode.WALKING;
      return travelMode;
    }
    if (transportation == 'TRANSIT') {
      let travelMode = google.maps.TravelMode.TRANSIT;
      return travelMode;
    }
    if (transportation == 'BICYCLING') {
      let travelMode = google.maps.TravelMode.BICYCLING;
      return travelMode;
    }

    return google.maps.TravelMode.DRIVING;
  }
  //計算路徑
  async calculateAndDisplayRoute(
    placeIdArray: string[],
    day: number
  ): Promise<void> {
    this.newRouteList = [];

    const routePromises = placeIdArray.slice(0, -1).map((origin, index) => {
      const destination = placeIdArray[index + 1];
      const request: google.maps.DirectionsRequest = {
        origin: { placeId: origin },
        destination: { placeId: destination },
        travelMode: this.convertTravelMode(this.journey.transportation),
      };

      return new Promise((resolve, reject) => {
        this.directionsService.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            const routeData = {
              startPlaceId: result.geocoded_waypoints?.[0]?.place_id || '',
              endPlaceId: result.geocoded_waypoints?.[1]?.place_id || '',
              transportation: this.journey.transportation,
              startTime: new Date().toISOString().slice(0, -5),
              routeTime: (() => {
                const durationText =
                  result.routes[0].legs[0].duration?.text || '--';
                const timeMatch = durationText.match(
                  /(?:(\d+)\s*小時)?\s*(\d+)\s*分鐘/
                );

                if (timeMatch) {
                  const hours = parseInt(timeMatch[1] || '0', 10); // 預設沒有小時則為 0
                  const minutes = parseInt(timeMatch[2], 10); // 確保抓到分鐘數
                  return `${String(hours).padStart(2, '0')}:${String(
                    minutes
                  ).padStart(2, '0')}`;
                }

                return '--:--'; // 格式不匹配時的預設值
              })(),
              distance: result.routes[0].legs[0].distance?.text || '--',
              routeLine: result.routes[0]?.overview_polyline || '',
              journeyId: this.journey.journeyId,
              day,
            };
            resolve(routeData);
          } else {
            console.error('錯誤訊息：' + status);
            reject(status);
          }
        });
      });
    });

    try {
      const routes = await Promise.all(routePromises);
      this.newRouteList = [...this.newRouteList, ...routes];

      this.dayRoute[this.selectedTab - 1].routeList = this.newRouteList;

      // this.cdr.detectChanges();
    } catch (error) {
      console.error('路徑計算失敗：', error);
    }
    this.calculateTime();
  }
  //時間計算
  addTimeStrings(time1: string, time2: any, addBoolean: boolean) {
    if (time1 && time2) {
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
      //相減
      if (!addBoolean) {
        totalMinutes = totalMinutes2 - totalMinutes1;
        //有跨天
        if (totalMinutes < 0) {
          totalMinutes + 1440;
        }
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
  convert(time: any) {
    const [hours, minutes] = time.split(':').map(Number);

    return hours + '時' + minutes + '分';
  }
  //算每個景點的時間
  calculateTime() {
    let daySpot = this.dayArray[this.selectedTab - 1].spotList;
    for (let index = 0; index < daySpot.length; index++) {
      //第一個景點先給預設的時間
      if (index == 0) {
        daySpot[index].arrivalTime = this.startTime;
      }

      daySpot[index].departureTime = this.dayArray[this.selectedTab - 1]
        .spotList[index].stayTime
        ? this.addTimeStrings(
            daySpot[index].arrivalTime,
            daySpot[index].stayTime,
            true
          )
        : (daySpot[index].departureTime = this.addTimeStrings(
            daySpot[index].arrivalTime,
            '01:00',
            true
          ));

      //最後一個景點沒有路徑
      if (index == daySpot.length - 1) {
        return;
      }

      // 获取當天的日期（ISO格式的前半部分）
      const today = new Date(this.dayArray[this.selectedTab - 1].date)
        .toISOString()
        .split('T')[0];

      // 补充日期信息
      const fullDateTime = `${today}T${daySpot[index].arrivalTime}:00`;
      //把路徑的開始時間等於地點的出發時間
      this.dayRoute[this.selectedTab - 1].routeList[index].startTime = new Date(
        fullDateTime
      );

      this.dayRoute[this.selectedTab - 1].routeList[index].startTime.setHours(
        this.dayRoute[this.selectedTab - 1].routeList[
          index
        ].startTime.getHours() + 8
      );
      this.dayRoute[this.selectedTab - 1].routeList[index].startTime
        .toISOString()
        .slice(0, -5),
        //算下一個景點出發時間
        (daySpot[index + 1].arrivalTime = this.addTimeStrings(
          daySpot[index].departureTime,
          this.dayRoute[this.selectedTab - 1].routeList[index].routeTime,
          true
        ));
      this.cdr.detectChanges();
    }
  }
  //抓景點跟路徑資料並整理
  getSpotAndRoute() {
    this.isRevisable = [];
    this.dayArray = [];
    this.dayRoute = [];

    this.http
      .getApi(
        'http://localhost:8080/spots/getSpotAndRouteSortOut?JourneyId=' +
          this.journey.journeyId
      )
      .subscribe((res) => {
        const Response = res as SpotAndRouteResponse2;

        this.routeList = Response.routeList;
        //每天都要一個isRevisable存放是否有在編輯這天
        for (let i = 1; i <= Response.spotList.length; i++) {
          this.isRevisable.push(false);
          //把journeyI補上
          for (let day of Response.spotList) {
            day.journeyId = this.journey.journeyId;
            //整理日期順序
            if (i == day.day) {
              this.dayArray.push(day);
            }
          }
        }
        //整理路徑
        for (let i = 1; i <= Response.spotList.length; i++) {
          let dayRoute: route[] = [];
          //把一天的所有路經篩出來
          for (let route of this.routeList) {
            const routeTime = this.convertTime(route.routeTime);
            if (routeTime) {
              route.routeTime = routeTime;
            }
            if (route.day == i) {
              dayRoute.push(route);
            }
          }
          this.dayRoute.push({ routeList: dayRoute });
        }
        for (let day of this.dayArray) {
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
        }
        this.cdr.detectChanges();
      });
  }
}
