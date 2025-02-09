import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import polyline from '@mapbox/polyline'; // 需自行生成polyline.d.ts檔案定義

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PolylineService } from '../service/polyline.service';
import { FormsModule } from '@angular/forms';
import { HttpClientService } from '../http-serve/http-client.service';
import { Time } from '@angular/common';
import Swal from 'sweetalert2';
import { DataService } from '../service/data.service';
import { day } from '../interface/JourneyInter';
import { Loading } from '../service/loading.service';
import { MatDialog } from '@angular/material/dialog';
import { ButtonDialogComponent } from '../components/button-dialog/button-dialog.component';
import { HintDialogComponent } from '../components/hint-dialog/hint-dialog.component';
import { zip, map } from 'rxjs';

declare var google: any;

export interface mapRoute {
  start_place_id: string;
  end_place_id: string;
  transportation: string;
  start_time: Date;
  route_time: Time;
  distance: string;
  route_line: string;
  journey_id: number;
  day: number;
}
//MapRouteComponent
@Component({
  selector: 'app-map-route',
  imports: [
    RouterOutlet,
    MatIconModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './map-route.component.html',
  styleUrl: './map-route.component.scss',
})
export class MapRouteComponent implements OnInit {
  constructor(
    private polyline: PolylineService,
    private http: HttpClientService,
    private dataService: DataService,
    private router: Router,
    private loading: Loading,
    private dialog: MatDialog, // 注入 MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  @ViewChild('map', { static: true }) mapElement!: ElementRef;
  decodedCoordinates: [number, number][] = [];
  encodedPolyline = 'knxwCg{}dViDCuD?@qA@uC?sB@WmCAcBEcD??}@?gCaA?';
  map!: google.maps.Map;
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  geocoder!: google.maps.Geocoder;
  travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING;
  duration: string = 'N/A'; // 新增變數來儲存時間資訊
  placeName!: string;
  travelTimes: { [key in string]: string } = {
    DRIVING: '--',
    WALKING: '--',
    TRANSIT: '--',
    BICYCLING: '--',
  };
  suggestedRoutes: any[] = []; // 存放建議路徑資料

  origin: google.maps.LatLng | null = null;
  destination: google.maps.LatLng | null = null;
  routeInfo: string = '';
  markers: google.maps.Marker[] = [];
  start: string = '';
  end: string = '';
  // 控制是否顯示路徑詳細資訊
  isRouteInfoVisible: boolean = false;
  routeTime!: string | null;
  routeColor: string = '#f5c170';
  selectedRouteIndex: number = 0;
  availableRoutes: any = [];
  startIndex = 0;
  ngOnInit(): void {
    this.initMap();
    this.geocoder = new google.maps.Geocoder();
    this.decodedCoordinates = this.polyline.decode(this.encodedPolyline);
    console.log(this.encodedPolyline);
    console.log(this.decodedCoordinates);
    this.loading.updateLoading(true);
    // if (this.dataService.routeLine.transportation == 'DRIVING') {
    //   this.travelTimes['DRIVING'] =
    //     this.dataService.routeLine.routeTime; // 根據傳入資料設定時間
    // } else if (this.dataService.routeLine.transportation == 'WALKING') {
    //   this.travelTimes['WALKING'] = this.dataService.routeLine.routeTime;
    // } else if (this.dataService.routeLine.transportation == 'TRANSIT') {
    //   this.travelTimes['TRANSIT'] = this.dataService.routeLine.routeTime;
    // } else {
    //   this.travelTimes['BICYCLING'] = this.dataService.routeLine.routeTime;
    // }
    // 等待地圖初始化完成後顯示資料路徑
    setTimeout(() => {
      this.displayInitialRoute();
    }, 1000);
  }
  //將起點跟終點預設成 this.dataService 這包資料的起點跟終點id
  displayInitialRoute(): void {
    // 假資料的起點跟終點
    this.start = this.dataService.startPlaceName;
    this.end = this.dataService.endPlaceName;
    // 初始化地圖邊界
    const bounds = new google.maps.LatLngBounds();
    // 使用 place_id 獲取位置資訊
    this.geocoder.geocode(
      { placeId: this.dataService.routeLine.startPlaceId },
      (startResults: any, startStatus: any) => {
        if (startStatus === 'OK' && startResults[0]) {
          const startLatLng = startResults[0].geometry.location;
          this.origin = startLatLng;
          // this.setMarker(startLatLng, 'A', '起點');
          bounds.extend(startLatLng); // 加入起點到邊界
          // 設置地圖邊界
          this.map.fitBounds(bounds);

          // 獲取終點位置
          this.geocoder.geocode(
            { placeId: this.dataService.routeLine.endPlaceId },
            (endResults: any, endStatus: any) => {
              if (endStatus === 'OK' && endResults[0]) {
                const endLatLng = endResults[0].geometry.location;
                this.destination = endLatLng;
                // this.setMarker(endLatLng, 'B', '終點');
                bounds.extend(endLatLng); // 加入終點到邊界

                // 設置交通方式
                this.travelMode =
                  google.maps.TravelMode[
                    (this.dataService.routeLine.transportation ||
                      'DRIVING') as keyof typeof google.maps.TravelMode
                  ];
                console.log(this.dataService.routeLine.transportation);
                console.log(this.dataService.routeLine.startPlaceId);
                console.log(this.dataService.routeLine.endPlaceId);

                // 計算並顯示路徑
                this.calculateAndDisplayRoute();

                // 如果有編碼的路徑線，也可以直接顯示
                if (this.dataService.routeLine.routeLine) {
                  const decodedPath =
                    google.maps.geometry.encoding.decodePath('');
                  new google.maps.Polyline({
                    path: decodedPath,
                    geodesic: true,
                    strokeColor: this.routeColor,
                    strokeOpacity: 0.8,
                    strokeWeight: 8,
                    map: this.map,
                  });
                }
              }
            }
          );
        }
      }
    );
    this.loading.updateLoading(false);
  }

  initMap(): void {
    const location = null;

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: location,
      zoom: 16,
      mapTypeId: 'roadmap',
      zoomControl: false, // 隱藏 + 和 - 按鈕
      streetViewControl: false, // 隱藏街景小人
      mapTypeControl: false, // 隱藏左上角的地圖/衛星切換按鈕
    });

    this.directionsRenderer.setMap(this.map);
    this.directionsRenderer.setPanel(
      document.getElementById('directions-panel')!
    );
    this.map.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        this.handleMapClick(event.latLng);
      }
    });

    document.getElementById('directions-panel')!.classList.add('map-detail');
  }

  // 點地圖設定起點跟終點
  handleMapClick(latLng: google.maps.LatLng): void {
    if (!this.origin) {
      this.origin = latLng;
      // this.setMarker(latLng, 'A', '起點');
      this.updateLocationName(latLng, 'start');
    } else if (!this.destination) {
      this.destination = latLng;
      // this.setMarker(latLng, 'B', '終點');
      this.updateLocationName(latLng, 'end');
      this.calculateAndDisplayRoute();
    } else {
      // 如果起點和終點都已存在，則重設起點
      this.resetMarkers();
      this.origin = latLng;
      this.setMarker(latLng, 'A', '起點');
      this.updateLocationName(latLng, 'start');
    }
  }

  onInputChange(): void {
    if (this.end) {
      this.setRouteFromInput(this.start || '', this.end);
    }
  }

  setRouteFromInput(start: string, end: string): void {
    // 重置地圖標記
    this.resetMarkers();

    // 如果沒有輸入起點，獲取使用者當下的位置
    if (!start) {
      this.getCurrentLocation((latLng) => {
        this.origin = latLng;
        // this.setMarker(latLng, 'A', '起點');
        // 更新起點名稱
        this.updateLocationName(latLng, 'start');

        // 獲得起點後再進行終點的處理
        if (end) {
          this.geocoder.geocode(
            { address: end },
            (endResults: any, endStatus: any) => {
              if (endStatus === 'OK' && endResults[0]) {
                const endLatLng = endResults[0].geometry.location;
                this.destination = endLatLng;
                // this.setMarker(endLatLng, 'B', '終點');
                // 計算路徑
                this.calculateAndDisplayRoute();
              } else {
                console.error('无法解析终点地址：' + endStatus);
              }
            }
          );
        }
      });
    } else {
      // 如果提供起點位置，進行編碼
      this.geocoder.geocode(
        { address: start },
        (startResults: any, startStatus: any) => {
          if (startStatus === 'OK' && startResults[0]) {
            const startLatLng = startResults[0].geometry.location;
            this.origin = startLatLng;
            // this.setMarker(startLatLng, 'A', '起點');

            // 處理終點
            if (end) {
              this.geocoder.geocode(
                { address: end },
                (endResults: any, endStatus: any) => {
                  if (endStatus === 'OK' && endResults[0]) {
                    const endLatLng = endResults[0].geometry.location;
                    this.destination = endLatLng;
                    // this.setMarker(endLatLng, 'B', '終點');
                    this.calculateAndDisplayRoute();
                  } else {
                    console.error('終點地址錯誤：' + endStatus);
                  }
                }
              );
            }
          } else {
            console.error('起點地址錯誤：' + startStatus);
          }
        }
      );
    }
  }
  // 反向地理編碼 - 這裡使用的是 geocoder.geocode 方法
  updateLocationName(latLng: google.maps.LatLng, type: 'start' | 'end'): void {
    this.geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const placeName = this.getPlaceName(results[0]); // 提取地標名稱
        if (type === 'start') {
          this.start = placeName; // 更新起點名稱
        } else {
          this.end = placeName; // 更新終點名稱
        }
      } else {
        console.error('無法取得地點名稱：', status);
      }
    });
  }
  // 更新地點名稱的方法(不要輸入完整地址，點地圖拿不到地點名稱)
  getPlaceName(result: any): string {
    // 優先檢查 types 是否是地標（如 point_of_interest 或 establishment）
    if (
      result.types.includes('point_of_interest') ||
      result.types.includes('establishment')
    ) {
      return result.name || result.formatted_address;
    }

    // 如果不是地標，從 address_components 提取簡化名稱
    return this.getPlaceName(result);
  }
  // 取得使用者當下位置
  getCurrentLocation(callback: (latLng: google.maps.LatLng) => void): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const latLng = new google.maps.LatLng(lat, lng);
          callback(latLng);
        },
        () => {
          console.error('無法獲取當前位置');
        }
      );
    } else {
      console.error('此瀏覽器不支持 Geolocation API');
    }
  }

  setMarker(latLng: google.maps.LatLng, label: string, title: string): void {
    const marker = new google.maps.Marker({
      position: latLng,
      map: this.map,
      title: title,
      label: label,
    });
    this.markers.push(marker);
  }
  convertPlaceIdToLatLng(placeId: string): Promise<google.maps.LatLng> {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { placeId: placeId },
        (
          results: google.maps.GeocoderResult[],
          status: google.maps.GeocoderStatus
        ) => {
          if (status === google.maps.GeocoderStatus.OK && results[0]) {
            const location = results[0].geometry.location;
            resolve(location); // location 是 google.maps.LatLng
          } else {
            reject(`Geocode failed due to: ${status}`);
          }
        }
      );
    });
  }
  // 計算路線方法
  calculateAndDisplayRoute(): void {
    if (!this.origin || !this.destination) {
      console.error('起點或終點未設定');
      return;
    }

    zip(
      this.geocoder.geocode({
        placeId: this.dataService.routeLine.startPlaceId,
      }),
      this.geocoder.geocode({
        placeId: this.dataService.routeLine.endPlaceId,
      })
    ).subscribe((res) => {
      this.origin = res[0].results[0].geometry.location;
      this.destination = res[1].results[0].geometry.location;

      const request: google.maps.DirectionsRequest = {
        origin: this.origin || '',
        destination: this.destination || '',
        travelMode: this.travelMode,
        provideRouteAlternatives: true,
        transitOptions: {
          departureTime: new Date(this.dataService.routeLine.startTime),
        },
      };

      this.directionsRenderer.setOptions({
        polylineOptions: {
          strokeColor: this.routeColor,
          strokeWeight: 8,
          strokeOpacity: 0.8,
        },
      });

      this.directionsService.route(
        request,
        (
          result: google.maps.DirectionsResult,
          status: google.maps.DirectionsStatus
        ) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            this.directionsRenderer.setDirections(result);
            this.availableRoutes = result.routes;

            // 監聽點選路徑index變化
            google.maps.event.addListener(
              this.directionsRenderer,
              'routeindex_changed',
              () => {
                const currentRouteIndex =
                  this.directionsRenderer.getRouteIndex();
                const currentRoute = result.routes[currentRouteIndex];
                if (currentRoute && currentRoute.legs[0]) {
                  // 更新选中路径的时间
                  setTimeout(() => {
                    const routeElement =
                      document.getElementsByClassName('adp-listsel')[0];
                    if (routeElement) {
                      let newTime;
                      if (this.travelMode === 'TRANSIT') {
                        newTime =
                          routeElement.getElementsByTagName('div')[0].innerHTML;
                      } else {
                        newTime =
                          routeElement.getElementsByTagName('span')[4]
                            .innerHTML;
                      }
                      this.routeTime = newTime;
                      this.travelTimes[this.travelMode] = newTime;
                      this.cdr.detectChanges();
                    }
                  }, 100);
                }
              }
            );

            this.updateTravelTime(result, this.travelMode);

            if (this.startIndex == 0) {
              this.setTravelMode(
                google.maps.TravelMode[
                  (this.dataService.routeLine.transportation ||
                    'DRIVING') as keyof typeof google.maps.TravelMode
                ]
              );
              this.cdr.detectChanges();
              this.startIndex = 1;
            }
          } else {
            console.error('路徑規劃失敗，錯誤訊息：' + status);
          }
        }
      );
    });
  }

  selectRoute(index: number): void {
    this.selectedRouteIndex = index;
    this.directionsRenderer.setRouteIndex(index);

    // 更新路徑時間
    const selectedRoute = this.availableRoutes[index];
    if (selectedRoute && selectedRoute.legs[0]) {
      setTimeout(() => {
        const routeElement = document.getElementsByClassName('adp-listsel')[0];
        if (routeElement) {
          let newTime;
          if (this.travelMode === 'TRANSIT') {
            newTime = routeElement.getElementsByTagName('div')[0].innerHTML;
          } else {
            newTime = routeElement.getElementsByTagName('span')[4].innerHTML;
          }
          this.routeTime = newTime;
          this.travelTimes[this.travelMode] = newTime;
          this.cdr.detectChanges();
        }
      }, 100);
    }
  }
  //更新路徑時間顯示(依照點選的交通方式)
  updateTravelTime(
    result: google.maps.DirectionsResult,
    mode: google.maps.TravelMode
  ): void {
    setTimeout(() => {
      let routeElement1 = document.getElementsByClassName('adp-listsel');
      // 拿到選取路徑時間
      let routeTime1 =
        routeElement1[0].getElementsByTagName('span')[4].innerHTML;

      console.log(routeTime1);
      // console.log(routeTime2);

      const leg = result.routes[0].legs[0];

      // this.routeTime = leg.duration?.text || '--'; // 動態更新 `routeTime`
      if (routeTime1 == null) {
        console.log(1212);

        this.routeTime = leg.duration?.text || '--'; // 動態更新 `routeTime`
      } else {
        console.log(123123);

        this.routeTime = leg.duration?.text || '--'; // 動態更新 `routeTime`
      }

      // 將所有交通方式重置為 `--`
      for (const key in this.travelTimes) {
        this.travelTimes[key as google.maps.TravelMode] = '--';
      }
      // this.travelTimes[mode] = leg.duration?.text || '--';
      // 更新選擇交通方式的時間
      console.log(this.routeTime);
      //判斷交通方式(TRANSIT 的暴力硬解HTML拿法不同)
      if (mode == 'TRANSIT') {
        console.log(333);
        let routeTime2 =
          routeElement1[0].getElementsByTagName('div')[0].innerHTML;

        this.travelTimes[mode] = routeTime2 || '--';
      } else {
        console.log(222);

        this.travelTimes[mode] = routeTime1 || '--';
      }

      this.cdr.detectChanges();
      let routeAllTime = document
        .getElementById('directions-panel')
        ?.getElementsByTagName('td');
      if (routeAllTime) {
        for (var i = 0; i < routeAllTime.length; i++) {
          routeAllTime[i].addEventListener('click', this.resetTime);
        }
      }
      // this.cdr.detectChanges();
    }, 500);
  }
  resetTime() {
    let routeElement2 = document.getElementsByClassName('adp-listsel');
    // 拿到選取路徑時間
    let routeTime2 = routeElement2[0].getElementsByTagName('span')[4].innerHTML;
    if (this.travelMode == 'TRANSIT') {
      let routeTime3 =
        routeElement2[0].getElementsByTagName('div')[0].innerHTML;
      this.routeTime = routeTime3;
    } else {
      this.routeTime = routeTime2;
    }
    // this.cdr.detectChanges();
    console.log(this.routeTime);
  }
  resetMarkers(): void {
    this.markers.forEach((marker) => marker.setMap(null));
    this.markers = [];
    this.origin = null;
    this.destination = null;
    this.directionsRenderer.setDirections({ routes: [] });
    this.routeInfo = '';
  }
  // google 地圖縮放檢查(經緯度)
  adjustMapBounds(result: google.maps.DirectionsResult) {
    const bounds = new google.maps.LatLngBounds();

    // 遍歷路徑中的所有點，擴展地圖邊界
    result.routes[0].legs.forEach((leg) => {
      leg.steps.forEach((step) => {
        bounds.extend(step.start_location);
        bounds.extend(step.end_location);
      });
    });

    // 調整地圖縮放到適合範圍
    this.map.fitBounds(bounds);
  }
  // 切換路徑資訊的顯示與隱藏
  toggleRouteInfo(): void {
    this.isRouteInfoVisible = !this.isRouteInfoVisible;
  }

  // 動態切換交通方式
  setTravelMode(mode: string): void {
    this.travelMode = google.maps.TravelMode[mode];
    this.calculateAndDisplayRoute();
  }
  // setTravelModeD(mode: google.maps.TravelMode): void {
  //   this.travelMode = google.maps.TravelMode.DRIVING;
  //   this.calculateAndDisplayRoute();
  // }
  // setTravelModeW(mode: google.maps.TravelMode): void {
  //   this.travelMode = google.maps.TravelMode.WALKING;
  //   this.calculateAndDisplayRoute();
  // }
  // setTravelModeT(mode: google.maps.TravelMode): void {
  //   this.travelMode = google.maps.TravelMode.TRANSIT;
  //   this.calculateAndDisplayRoute();
  // }
  // setTravelModeB(mode: google.maps.TravelMode): void {
  //   this.travelMode = google.maps.TravelMode.BICYCLING;
  //   this.calculateAndDisplayRoute();
  // }

  // 假資料
  // routeData1 = {
  //   startPlaceId: 'ChIJ____27arQjQR0maAA0Yaqi0',
  //   endPlaceId: 'ChIJfUpAzTqsQjQRwQl6ORhwbV0',
  //   transportation: 'DRIVING',
  //   startTime: '2025-03-24T06:30:00',
  //   routeTime: '00:37:00',
  //   distance: '18公里',
  //   routeLine: '',
  //   journeyId: 9,
  //   day: 2,
  // };
  // 打 Api
  saveRoute() {
    if (!this.origin || !this.destination) {
      this.openDialog('請先設定起點或終點');
      return;
    }
    let routeElement = document.getElementsByClassName('adp-listsel');
    // 拿到選取路徑時間
    let routeTime = routeElement[0].getElementsByTagName('span')[4].innerHTML;
    // 拿到選取路徑距離
    let routeDistance =
      routeElement[0].getElementsByTagName('span')[1].innerHTML;
    console.log(routeElement[0].getElementsByTagName('span')[4].innerHTML);
    console.log(routeElement[0].getElementsByTagName('span')[1].innerHTML);
    console.log();

    // let routeMinutes = routeTime.match(/(\d+)/); // 提取數字部分
    // if (routeMinutes) {
    //   let formattedTime =
    //     '00:' + String(routeMinutes[0]).padStart(2, '0') + ':00';
    //   console.log(formattedTime); // 輸出：00:30:00
    // }
    // 透過 DirectionsRenderer 確保取得的是目前顯示的路徑
    const selectedDirections = this.directionsRenderer.getDirections();
    const request: google.maps.DirectionsRequest = {
      origin: this.origin,
      destination: this.destination,
      travelMode: this.travelMode,
    };
    this.directionsService.route(
      request,
      (
        result: google.maps.DirectionsResult,
        status: google.maps.DirectionsStatus
      ) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          // const selectedRouteIndex = this.getSelectedRouteIndex(result);
          // const selectedRoute = result.routes[selectedRouteIndex];
          // 預設拿到顯示的第一條路徑的第一段（legs）資訊
          // const selectedRoute = selectedDirections.routes[0];
          // const leg = selectedRoute.legs[0]; // 第一段路程資訊

          // // 取得選擇的路徑的第一段（legs）
          // const leg = selectedRoute.legs[0];
          console.log(result);

          const leg = result.routes[0].legs[0]; // 取得第一條路徑的第一段路程資訊
          const routeData = {
            startPlaceId: this.dataService.routeLine.startPlaceId, // 確保 dataService 存在並且有資料
            endPlaceId: this.dataService.routeLine.endPlaceId, // 確保 dataService 存在並且有資料
            transportation: this.travelMode, // 使用當前選擇的交通方式
            startTime: this.dataService.routeLine.startTime, // 使用當前時間作為起始時間
            routeTime: (() => {
              if (this.travelMode == 'TRANSIT') {
                const durationText =
                  routeElement[0].getElementsByTagName('div')[0].innerHTML;
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
              } else {
                const durationText =
                  routeElement[0].getElementsByTagName('span')[4].innerHTML;
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
              }

              return '--:--:'; // 格式不匹配時的預設值
            })(),
            // distance: routeDistance, // 路徑距離
            distance: this.dataService.routeLine.distance,
            routeLine: result.routes[0]?.overview_polyline || '', // 編碼 polyline，加入安全檢查
            journeyId: this.dataService.routeLine.journeyId, // dataService拿到的journeyId
            day: this.dataService.routeLine.day, // dataService拿到的天數
          };

          console.log(routeTime);
          console.log(routeData);
          // console.log(selectedRouteIndex);
          this.openDialog('路徑確定嗎？').then((confirmed) => {
            if (confirmed) {
              this.http
                .postApi(
                  'http://localhost:8080/map_route/saveOrUpdateRoute',
                  routeData
                )
                .subscribe((res: any) => {
                  if (res.code !== 200) {
                    this.openDialog(`錯誤：${res.code} - ${res.message}`);
                    return;
                  }
                  this.dataService.updateNewRoute(routeData);
                  this.dialog.open(HintDialogComponent, {
                    data: res.message.split('\n'),
                  });
                  this.router.navigate(['/search']);
                });
            }
          });
        } else {
          this.openDialog('無法計算路徑，請重試！');
          console.error('路徑規劃失敗：', status);
        }
      }
    );
  }
  //呼叫有 button dialog 方法
  openDialog(message: string): Promise<boolean> {
    const dialogRef = this.dialog.open(ButtonDialogComponent, {
      data: message.split('\n'), // 傳遞訊息到對話框
    });

    dialogRef.afterClosed().subscribe((result) => {
      // 可在這裡處理對話框關閉後的邏輯（如確認或取消的結果）
      console.log('Dialog closed with result:', result);
    });
    // 返回對話框的結果
    return dialogRef.afterClosed().toPromise();
  }
}
