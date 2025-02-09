import { day, Journey, route, spot } from './../interface/JourneyInter';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { hotel } from '../interface/hotelInter';
import { roomData } from '../journey/hotel-data/hotel-data.component';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  keyword: string = '景點'; //搜尋框輸入的keyword
  lastRouter: string = '';
  editList!: any[];
  center = { lat: 24.23321, lng: 120.9417 }; //地圖的中心

  //用戶
  private user = new BehaviorSubject<string>('');
  user$ = this.user.asObservable();
  updateUser(data: string) {
    this.user.next(data);
  }

  // 社群用戶
  userMail: string = ''; // 使用者信箱:用於顯示其他使用者的貼文列表頁
  postContent = {
    // 傳到貼文內容頁取的貼文資料
    userMail: '',
    postId: 0,
    journeyId: 0,
  };

  //行程列表
  private journeyList = new BehaviorSubject<Journey[]>([]);
  journeyList$ = this.journeyList.asObservable();
  updateJourneyList(data: Journey[]) {
    this.journeyList.next(data);
  }

  // 用來通知登入狀態
  private loginStatus = new BehaviorSubject<boolean>(
    sessionStorage.getItem('isLogin') == 'true'
  );
  loginStatus$ = this.loginStatus.asObservable();
  isLogIn(): boolean {
    const user = this.user.getValue();
    return user !== '';
  }
  setLoginStatus(status: boolean): void {
    this.loginStatus.next(status);
  }

  //介紹景點的dialog傳給住宿搜尋頁面的資料
  private accommodationSearchDataSource = new BehaviorSubject<{
    journeyId: number;
    name: string;
    address: string;
  }>({ journeyId: 0, name: '', address: '' });

  accommodationSearchData$ = this.accommodationSearchDataSource.asObservable();
  updateAccommodationSearchData(data: {
    journeyId: number;
    name: string;
    address: string;
  }) {
    this.accommodationSearchDataSource.next(data);
  }
  // 翊華清空資料請用
  // updateAccommodationSearchData({journeyId: 0, name: '', address: ''})
  // 如果沒有資料：name: '沒有名字', address:'沒有地址'

  //建立新行程
  private newJourney = new BehaviorSubject<Journey>({
    journeyId: 0,
    journeyName: '',
    startDate: '',
    endDate: '',
    transportation: '',
    invitation: '',
    userMail: '',
  });

  newJourney$ = this.newJourney.asObservable();
  updateNewJourney(data: Journey) {
    this.newJourney.next(data);
  }

  // 要編輯行程與第幾天的資料 傳給 【新增地點】
  selectedJourneyData: { journeyId: number; selectedDay: number } = {
    journeyId: 0,
    selectedDay: 0,
  };
  //要編輯行程的資料 傳給 【新增地點】
  selectedJourney: Journey = {
    journeyId: 0,
    journeyName: '',
    startDate: '',
    endDate: '',
    transportation: '',
    invitation: '',
    userMail: '',
  };
  // 要編輯那天的資料 傳給 【新增地點】
  selectedDayData: day = {
    journeyId: 0,
    day: 0,
    date: '',
    spotList: [],
  };

  //新增地點進行程(placeId)
  addPlace: google.maps.places.PlaceResult | null = null;

  //編輯哪一天
  editing: {
    journeyId: number;
    day: number;
  } = {
    journeyId: 0,
    day: 0,
  };

  //正在編輯排序
  isDraggable: boolean = false;
  isCreateSpot: boolean = false;
  isEditing: boolean = false;

  //存放正在編輯當天的景點資料
  private day = new BehaviorSubject<day>({
    journeyId: 0,
    day: 0,
    date: '',
    spotList: [],
  });
  day$ = this.day.asObservable();
  updateDayt(data: day) {
    this.day.next(data);
  }
  //清空updateDayt({journeyId: 0,day: 0,date: '',spotList: []})

  //從dialog開啟編輯模式
  dayArr: day[] = [];
  routeList: route[] = [];
  startPlaceName = '';
  endPlaceName = '';
  routeLine: route = {
    journeyId: 0,
    startPlaceId: '',
    endPlaceId: '',
    routeTime: '',
    startTime: '',
    transportation: '',
    distance: '',
    routeLine: '',
    day: 0,
  };

  private selectedTab = new BehaviorSubject<number>(0);
  selectedTab$ = this.selectedTab.asObservable();
  updateSelectedTab(data: number) {
    this.selectedTab.next(data);
  }

  //結束編輯的清空
  finishEditing() {
    this.addPlace = null;
    this.selectedJourneyData.journeyId = 0;
    this.updateSelectedTab(0);
    this.updateDayt({ journeyId: 0, day: 0, date: '', spotList: [] });
    this.dayArr = [];
    this.routeList = [];
    this.isDraggable = false;
    this.editing = { journeyId: 0, day: 0 };
  }
  //清空從select journey dialog選中的資料
  clearSelectedData() {
    this.selectedJourneyData = {
      journeyId: 0,
      selectedDay: 0,
    };
    this.selectedJourney = {
      journeyId: 0,
      journeyName: '',
      startDate: '',
      endDate: '',
      transportation: '',
      invitation: '',
      userMail: '',
    };
    this.selectedDayData = {
      journeyId: 0,
      day: 0,
      date: '',
      spotList: [],
    };
  }
  // 飯店資訊
  hotelListData!: hotel[];

  hotelData!: {
    journey: any;
    webName: string;
    area: string;
    hotelName: string;
    checkinDate: string;
    checkoutDate: string;
    adults: string;
    children: string;
    rooms: string;
    url: string;
    findBooking: boolean;
    findAgoda: boolean;
  };

  hotelName: string = '';

  //飯店資訊列表
  private hotelDataList = new BehaviorSubject<roomData[][]>([[]]);
  hotelDataList$ = this.hotelDataList.asObservable();
  updatehotelDataList(data: roomData[][]) {
    this.hotelDataList.next(data);
  }

  //飯店資訊列表checkbox
  private hotelCheckbox = new BehaviorSubject<boolean[]>([]);
  hotelCheckbox$ = this.hotelCheckbox.asObservable();
  updatehotelCheckbox(data: boolean[]) {
    this.hotelCheckbox.next(data);
  }
  private newRoute = new BehaviorSubject<route>({
    journeyId: 0,
    startPlaceId: '',
    endPlaceId: '',
    routeTime: '',
    startTime: '',
    transportation: '',
    distance: '',
    routeLine: '',
    day: 0,
  });

  newRoute$ = this.newRoute.asObservable();
  updateNewRoute(data: route) {
    this.newRoute.next(data);
  }
}
