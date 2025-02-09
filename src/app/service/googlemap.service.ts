import { Injectable } from "@angular/core";
import { GoogleMapsModule } from '@angular/google-maps';
import { MatDialog } from '@angular/material/dialog';
import { PlaceDialogComponent } from "../components/place-dialog/place-dialog.component";
import { HintDialogComponent } from "../components/hint-dialog/hint-dialog.component";
import { BehaviorSubject } from "rxjs";
import { DialogService } from "./dialog.service";
import { Loading } from "./loading.service";

declare global {
  interface Window {
    mapLoaded: boolean;
  }
}

function initMap() {
  window.mapLoaded = true;
}

// 用來在maker上方自定義(extends google.maps.OverlayView)
export class CustomOverlay extends google.maps.OverlayView {
  private div: HTMLDivElement;
  private position: google.maps.LatLng;
  private map: google.maps.Map;

  constructor(map: google.maps.Map, position: google.maps.LatLng, content: string,
    placeId: string, marker?: google.maps.Marker) {
    super();
    this.div = document.createElement('div');
    this.div.style.position = 'absolute';
    this.div.style.display = 'flex';
    this.div.style.flexDirection = 'column';
    this.div.style.alignItems = 'center';
    this.div.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    this.div.style.padding = '5px';
    this.div.style.borderRadius = '5px';
    this.div.style.fontSize = '14px';
    this.div.style.fontWeight = 'bold';
    this.div.style.overflow = 'hidden';
    this.div.style.maxWidth='150px';
    this.div.style.maxHeight='24px';
    this.div.style.display = 'none'; // 默認為隱藏
    this.div.style.zIndex = '1000';
    // 創建文字節點並插入
    const textNode = document.createTextNode(content);
    this.div.appendChild(textNode);
    this.map = map;
    this.position = position;
  }

  // 使用 'override' 關鍵字來標註該方法是覆寫父類別中的方法
  override draw(): void {
    const projection = this.getProjection();
    const position = projection.fromLatLngToDivPixel(this.position);

    // 確保 getPanes() 返回的是非 null
    const panes = this.getPanes();
    if (panes) {
      // 設定自訂覆蓋物的位置
      if(position){
        this.div.style.left = `${position.x - this.div.offsetWidth / 2}px`; // 讓覆蓋物居中顯示
        this.div.style.top = `${position.y - this.div.offsetHeight -45}px`;  // 顯示在覆蓋物的上面
      }

      // 如果 div 還沒有被加到頁面中，則將其加入到 overlayLayer
      if (!this.div.parentElement) {
        panes.overlayLayer.appendChild(this.div); // 將自訂覆蓋物加入地圖
      }
    }
  }

  //顯示或隱藏覆蓋物
   toggleDisplay(show: boolean): void {
    this.div.style.display = show ? 'flex' : 'none';
  }

  // 移除覆蓋物
  remove(): void {
    if (this.div.parentElement) {
      this.div.parentElement.removeChild(this.div);
    }
  }
}

@Injectable({ providedIn:'root'})

export class GoogleMapService{
  declare google: any; // 宣告 google 命名空間

  constructor(public dialog: MatDialog,private dialogService: DialogService,private loading:Loading) {}

  map: any = null; // 地圖實例
  markers: google.maps.Marker[] = []; //地圖上標記的圖示
  service: any = null; // PlacesService

  // 初始化地圖 (地圖模式)
  initMap(
    mapElement: HTMLElement,
    center = { lat: 24.23321, lng: 120.9417 },
    zoom:number=12
  ): void {
    console.log(center);

    const mapOptions = {
      center: center,
      zoom: zoom,
      clickableIcons: true, //地圖圖標點擊
      mapTypeControl: false,
      fullscreenControl: false // 隱藏全螢幕按鈕
    };
    this.map = new google.maps.Map(mapElement, mapOptions);
    this.initList();
  }

  // 初始化列表 (列表模式)
  initList(): void {
    if (!this.service) {
      const fakeMap = document.createElement('div'); // 假地圖 DOM
      this.service = new google.maps.places.PlacesService(fakeMap);
    }
  }

  // 搜尋地點，返回結果 (列表 & 地圖模式都可用)
  searchPlaces(
    location: any,
    keyword: string,
    radius:number=0,
    callback: (results: google.maps.places.PlaceResult[], pagination: any) => void
  ): void {
    // 如果提供了關鍵字，用textSearch
    if (keyword == '新竹') keyword = '新竹 景點';
    if (keyword && keyword!='') {
      const request: google.maps.places.TextSearchRequest = {
        query: keyword , // 搜尋的文字
        location: this.map.getCenter(),
      };

      this.service = new google.maps.places.PlacesService(this.map);// 確保 map 已初始化

      this.service.textSearch(request, (results: google.maps.places.PlaceResult[], status: any, pagination: any) => {
        console.log(pagination);
        console.log(status);

        if (status === google.maps.places.PlacesServiceStatus.OK) {
          callback(results,pagination);
          this.addMarker(results);
        } else {
          console.error('搜尋地點失敗:', status);
          if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            this.dialog.open(HintDialogComponent, {
              data:["沒找到結果，請換個關鍵字"] // data請放字串陣列
            });

          }
          this.loading.updateLoading(false);
          callback([],""); // 返回空陣列表示無結果
        }
      });
    }else{
      this.searchNearby(radius,location, callback);
    }
  }

  // 搜尋此區(地圖模式)
  searchNearby(
  radius:number,
  location: google.maps.LatLng,
  callback: (results: google.maps.places.PlaceResult[], pagination: any) => void
  ): void {
    const request: google.maps.places.PlaceSearchRequest = {
      location: location,
      radius:  radius,//搜尋半徑，單位m
    };

    this.service = new google.maps.places.PlacesService(this.map);// 確保 map 已初始化

    this.service.nearbySearch(request, (results: google.maps.places.PlaceResult[], status: any, pagination: any) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        // 排除掉第一個地點(通常這樣搜尋此區第一個結果會是行政區)
        const filteredResults = results.slice(1);
        callback(filteredResults,pagination);
        this.addMarker(filteredResults);
      } else {
        console.error('搜尋地點失敗:', status);
        if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          this.dialog.open(HintDialogComponent, {
            data:["沒找到結果，請換搜尋區域"] // data請放字串陣列
          });
        }
        callback([],""); // 返回空陣列表示無結果
      }
    });
  }

  // 添加標記 (地圖模式)
  addMarker(results: google.maps.places.PlaceResult[]): void {
    if (!this.map) return;
    const places = Array.isArray(results) ? results : [results];
    places.forEach((item, index) => {
      if (item.geometry && item.geometry.location){
        const marker = new google.maps.Marker({
          map: this.map,
          position: item.geometry.location,
          title: item.name,
          icon: {
            url: 'https://i.imgur.com/TptEWKK.png',
            size: new google.maps.Size(40, 45),  // 調整圖標大小
            anchor: new google.maps.Point(20, 45),  // 設定錨點(寬度的一半（40/2）,垂直在圖標的底部)
            scaledSize: new google.maps.Size(40, 45)  // 設定縮放後圖標的大小
          },
          zIndex: 20
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `<h4>${item.name}</h4><p>${item.vicinity || '無地址'}</p>`,
        });

        marker.addListener('click', () => {
          //呼叫service裡面的getplace方法(用id搜詳細資料，再傳給介紹地點的dialog)
          this.getplace(item.place_id!);

        });

         // 創建並顯示自定義覆蓋物 (顯示 name)
        const customOverlay = new CustomOverlay(this.map, item.geometry.location,
          item.name ? item.name : '不知道名字', item.place_id? item.place_id : '不知道id', marker);
        customOverlay.setMap(this.map);  // 將自定義覆蓋物添加到地圖上
         // 監聽地圖的 zoom 事件，動態控制 CustomOverlay 顯示
        google.maps.event.addListener(this.map, 'zoom_changed', () => {
          const zoomLevel = this.map.getZoom();
          const showOverlay = zoomLevel > 12; // 設定需要顯示的縮放級別條件
          customOverlay.toggleDisplay(showOverlay);
        });

        const bounds = new google.maps.LatLngBounds();
        this.markers.push(marker);
        bounds.extend(item.geometry.location);
      }
    })
  }

  // 清除標記
  clearMarkers(): void {
    this.markers.forEach((marker) => {
      marker.setMap(null); // 使用 setMap 方法來隱藏標記
    });
  }


  //根據地點和索引將地圖焦點移動到該地點
  focusOnPlace(place: google.maps.places.PlaceResult): void {
    if (!this.map || !place.geometry || !place.geometry.location) return;
    // 將地圖中心設置為該地點的位置
    this.map.panTo(place.geometry.location);
    this.map.setZoom(18);
  }

  // 地點最愛狀態
  private favoriteStatus = new BehaviorSubject<{[placeId: string]: boolean}>({});
  getFavoriteStatus() {
    return this.favoriteStatus.asObservable();
  }
  getFavoriteStatusByPlaceId(placeId: string) {
    return this.favoriteStatus.value[placeId];
  }
  // 設置地點的最愛狀態
  setFavoriteStatus(placeId: string, status: boolean) {
    const currentStatus = this.favoriteStatus.value;
    this.favoriteStatus.value[placeId] = status;
    this.favoriteStatus.next(currentStatus);
  }

  //用id搜詳細資料，再傳給介紹地點的dialog
  getplace(placeId:string){
    const service = new google.maps.places.PlacesService(this.map);
    const request = {
      placeId: placeId,
      language: 'zh-TW',
      // 需要的資訊
      fields: ['name', 'place_id','geometry','formatted_address','formatted_phone_number', 'types', 'website',//
        'opening_hours','utc_offset_minutes','rating','user_ratings_total','reviews', //
        'opening_hours','secondary_opening_hours','geometry.location','photos','address_components']
    };

    this.loading.updateLoading(true);
    service.getDetails(request, (result: any, status: any) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        this.dialogService.placeDialogRef =this.dialog.open(PlaceDialogComponent, {
          data:result,
          autoFocus: true,        // 將焦點移到對話框內的可交互元素
          restoreFocus: true,     // 對話框關閉後恢復焦點到觸發按鈕
        });
      } else {
        console.error('無法獲取地點資訊');
      }
      this.loading.updateLoading(false);
    });

  }

  //用id搜詳細資料
  searchPlace(
    placeId: string,
    callback: (place: google.maps.places.PlaceResult) => void
  ): void {
    const service = new google.maps.places.PlacesService(this.map);
    const request = {
      placeId: placeId,
      // 需要的資訊
      fields: ['name', 'place_id','geometry','formatted_address','formatted_phone_number', 'types', 'website',//
        'opening_hours','rating','user_ratings_total','reviews', //
        'opening_hours','secondary_opening_hours','geometry.location','photos','address_components']
    };

    service.getDetails(request, (result: any, status: any) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        callback(result);
      } else {
        console.error('無法獲取地點資訊');
      }
    });

  }

}





