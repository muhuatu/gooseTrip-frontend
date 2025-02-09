import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClientService } from '../../http-serve/http-client.service';
import { GoogleMapService } from '../../service/googlemap.service';
declare var google: any;

interface UploadResponse {
  imageId: number;  // 假設後端回傳的 imageId 是數字類型
}
@Component({
  selector: 'app-image',
  imports: [],
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss'
})

export class ImageComponent implements OnInit, AfterViewInit {

  constructor(private googleMapService: GoogleMapService, private http: HttpClientService) { }
  @ViewChild('map', { static: true }) mapElement!: ElementRef;
  map!: google.maps.Map;
  placesService: any; // 用來處理 Place API 查詢
  markerList: any[] = []; // 用來儲存所有的 spotName
  imageUrl: string = '';  // 用來保存圖片的 URL

  uploadImage(event: any): void {
    const file = event.target.files[0];  // 取得選中的檔案
    const formData = new FormData();      // 建立 FormData 物件

    formData.append('file', file);        // 將檔案添加到 FormData 物件

    this.http.postApi('http://localhost:8080/post/upload_image', formData)
      .subscribe(response => {
        console.log('Image uploaded successfully', response);
        // const imageId = response.imageId;  // 假設後端回傳的 imageId 在 response.data 中
        // this.getImage(imageId);  // 呼叫 getImage 使用 imageId 獲取並顯示圖片
      }, error => {
        console.error('Error uploading image', error);
      });
  }


  // 使用 imageId 從後端獲取圖片
  getImage(imageId: number): void {
    this.http.getApi<string>(`http://localhost:8080/post/image/${imageId}`, { responseType: 'text' as 'json' })
      .subscribe({
        next: (base64Image: string) => {
          if (base64Image) {
            this.imageUrl = `data:image/png;base64,${base64Image}`;
            console.log(base64Image);
          } else {
            console.error('Empty Base64 image data');
          }
        },
        error: (error: { status: number; }) => {
          console.error('Error fetching image:', error);
          if (error.status === 200) {
            console.error('Check the response body, possibly not a valid Base64 string');
          }
        }
      });
  }

  ngOnInit(): void {

    // 1. 向後端請求貼文內容
    this.http.postApi('http://localhost:8080/post/getPost', {journeyId: 1, postId: 1}).subscribe((res: any) => {
      console.log(res);

      // 2. 將所有 spotName 存入 markerList 陣列
      this.markerList = res.postDetail.map((detail: any) => detail.spotName);
      console.log(this.markerList);

      // 3. 在獲取完 spotName 之後初始化地圖
      this.initMap();

      // 4. 查詢所有 spotName 的經緯度並設置標記
      this.setMarkers();
    })
  }

  ngAfterViewInit(): void {
      // do something after the view has been initialized
      // this.initMap();
      // console.log("map is initialized");
  }

  initMap() {
    const defaultlocation = {
      lat: 25.0374865,
      lng: 121.5647688
    };

    this.map = new google.maps.Map(document.getElementById('map'), {
      center: defaultlocation,
      zoom: 16,
      mapTypeId: 'terrain'
    });

    // 初始化 Places Service
    this.placesService = new google.maps.places.PlacesService(this.map);
    console.log(this.placesService);
    console.log("PlacesService is initialized");
  }

  setMarkers() {
    // 迴圈處理 markerList 中的每個 spotName
    this.markerList.forEach(spotName => {
      // 將 spotName 組成查詢查詢字串
      let query = spotName;

      // 使用 PlacesService 獲取詳細資料
      this.placesService.textSearch({ query: query }, (results: any[], status: any) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          // 假設第一個結果是需要的地點
          const place = results[0];
          console.log('找到的地點:', place);

          // 從查詢結果中提取經緯度
          const location = place.geometry.location;
          const latitude = location.lat();
          const longitude = location.lng();
          console.log('經緯度:', latitude, longitude);

          // 根據獲得的經緯度設置地圖的標記
          new google.maps.Marker({
            position: location,
            map: this.map,
            title: place.name
          });
        } else {
          console.error('搜尋失敗:', status);
        }
      });
    });
  }

  // 根據 place_id 查詢並顯示地點
  // getPlaceDetails(placeId: string) {
  //   const request = {
  //     placeId: placeId,
  //     fields: ['geometry'] // 只需要 geometry（包含經緯度）、name（名稱）、formatted_address（地址）
  //   };

  //   // 使用 PlacesService 查詢
  //   this.placesService.getDetails(request, (place: { geometry: { location: any; }; }, status: string) => {
  //     if (status === google.maps.places.PlacesServiceStatus.OK) {
  //       // 如果查詢成功，獲取位置的經緯度
  //       const location = place.geometry.location;
  //       console.log(location);

  //       // 放置 Marker
  //       const marker = new google.maps.Marker({
  //         position: location,
  //         map: this.map
  //       });

  //       // // 可選：顯示地點名稱與地址
  //       // const infowindow = new google.maps.InfoWindow({
  //       //   content: `<div><strong>${place.name}</strong><br>${place.formatted_address}</div>`
  //       // });

  //       // infowindow.open(this.map, marker);
  //     } else {
  //       console.error('Place details request failed due to ' + status);
  //     }
  //   });
  // }

  // getPlacesFromSearch(query: string) {
  //   const request = {
  //     query: query,
  //     fields: ['name', 'geometry', 'formatted_address']
  //   };

  //   this.placesService.textSearch(request, (results: any[], status: string) => {
  //     if (status === google.maps.places.PlacesServiceStatus.OK) {
  //       results.forEach(place => {
  //         const location = place.geometry.location;
  //         const marker = new google.maps.Marker({
  //           position: location,
  //           map: this.map,
  //           title: place.name
  //         });

  //         // const infowindow = new google.maps.InfoWindow({
  //         //   content: `<div><strong>${place.name}</strong><br>${place.formatted_address}</div>`
  //         // });

  //         // infowindow.open(this.map, marker);
  //       });
  //     } else {
  //       console.error('Search failed due to ' + status);
  //     }
  //   });
  // }

}
