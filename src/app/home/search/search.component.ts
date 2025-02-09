import {
  Component,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { GoogleMapService } from '../../service/googlemap.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../../service/data.service';
import { MatDialog } from '@angular/material/dialog';
import { HintDialogComponent } from '../../components/hint-dialog/hint-dialog.component';
import { Loading } from '../../service/loading.service';

@Component({
  selector: 'app-search',
  imports: [FormsModule, CommonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  mode = true; //false是列表模式，true是地圖模式
  center = { lat: 24.23321, lng: 120.9417 }
  keyword: string = '景點'; //搜尋框input

  constructor(
    private googleMapsService: GoogleMapService,
    private cdr: ChangeDetectorRef,
    public dataService: DataService,
    public dialog: MatDialog,
    private loading:Loading
  ) {}


  ngOnInit(): void {
    this.keyword = this.dataService.keyword;
    if(sessionStorage.getItem('dialogPlaceId')&&sessionStorage.getItem('isLogin')){
      this.googleMapsService.getplace(JSON.parse(sessionStorage.getItem('dialogPlaceId') || ''));
    }
  }

  ngAfterViewInit(): void {
    const mapElement = document.getElementById('map')!;
    const modeToggle = document.getElementById(
      'mode-toggle'
    ) as HTMLSelectElement;
    const typeSelect = document.getElementById(
      'place-type'
    ) as HTMLSelectElement;
    const searchInput = document.getElementById(
      'search-box'
    ) as HTMLSelectElement;

    this.initService();
  }

  changemode() {
    this.mode = !this.mode;
    this.updatePlaces(this.keyword);
  }

  // 初始化地圖或清單
  private initService(): void {
    console.log(this.mode);

    const mapElement = document.getElementById('map')!;
    const placeList = document.getElementById('place-list')!;
    console.log(this.center);


    if (this.mode === true) {
      // 地圖模式，隱藏列表
      mapElement.style.display = 'block';
      placeList.style.display = 'none';
      this.googleMapsService.initMap(mapElement, this.center);
      this.cdr.detectChanges();
    } else {
      // 列表模式，隱藏地圖
      mapElement.style.display = 'none';
      placeList.style.display = 'block';
      this.googleMapsService.initList();
    }

    // 更新地圖中心點
    this.googleMapsService.map.setCenter(this.dataService.center);

    this.updatePlaces(this.keyword);
  }

  onEnter(){
    this.updatePlaces(this.keyword);
  }

  // 更新地點列表或標記
  updatePlaces(keyword: string): void {
    //列表模式的容器
    const placeList = document.getElementById('place-list')!;
    placeList.innerHTML = '';

    //地圖模式的圖表容器
    const photosContainer = document.getElementById('photos-container')!;
    if (photosContainer) {
      photosContainer.innerHTML = ''; // 清空容器
    }

    //清空載入更多按鈕
    const paginationContainer = document.getElementById('pagination-container');
    if (paginationContainer) {
      paginationContainer.innerHTML = ''; //清空之前的內容
    }

    //計算目前地圖的半徑
    const bounds = this.googleMapsService.map.getBounds();
    let radius = 0;
    if (bounds && bounds.getSouthWest() && bounds.getNorthEast()) {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      radius = Math.min(
        google.maps.geometry.spherical.computeDistanceBetween(sw, ne) / 2
      );
    }

    // 把搜尋詞存進
    sessionStorage.removeItem('dialogPlaceId');
    this.dataService.keyword=this.keyword;

    const location = this.googleMapsService.map.getCenter();

    this.loading.updateLoading(true);

    this.googleMapsService.searchPlaces(
      location,
      keyword,
      radius,
      (results, pagination) => {
        if(results.length==0){
          return;
        }
        if (this.mode == true && results.length > 0) {
          // 假設搜尋有結果，則將地圖中心移動到第 1 個結果的經緯度
          if (results[0].geometry && results[0].geometry.location) {
            this.center = {
              lat: results[0].geometry!.location!.lat(),
              lng: results[0].geometry!.location!.lng(),
            };
          }

          this.googleMapsService.initMap(
            document.getElementById('map')!,
            this.center,
            this.googleMapsService.map.getZoom()
          ); // 更新地圖中心
        }

        this.googleMapsService.clearMarkers();

        //console.log(results); // 抓資料用ㄉ

        // 限制搜尋結果為 20 次以內
        const limitedPlaces = results.slice(0, 20);

        console.log(results);

        const bounds = new google.maps.LatLngBounds();

        limitedPlaces.forEach((place, index) => {
           // 列表模式
           if (this.mode === false) {
            // 一張張卡片呈現
            const card = document.createElement('div');
            card.style.flex = '0 0 20%';
            card.style.height = '280px';
            // card.style.margin = '10px';
            // card.style.padding = '15px';
            card.style.boxSizing = 'border-box';
            card.style.borderRadius = '12px';
            card.style.boxShadow = '0px 1px 2px rgba(0, 0, 0, 0.2)';
            card.style.cursor = 'pointer';
            card.style.overflow = 'hidden';
            card.style.minWidth = '260px';
            card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
            card.style.background = 'rgb(247, 247, 247)';


            // 設置hover效果
            card.addEventListener('mouseover', function () {
              card.style.transform = 'translateY(-2px)';
              card.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.3)';
            });
            card.addEventListener('mouseout', function () {
              card.style.transform = 'translateY(0)';
              card.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.2)';
            });


            // 圖片
            const imageUrl = this.getPhotoUrl(place);
            const imageElement = document.createElement('img');
            imageElement.src = imageUrl;
            imageElement.alt = place.name!;
            imageElement.classList.add('place-image');
            card.appendChild(imageElement);
            imageElement.style.borderRadius = '8px 8px 0 0';
            imageElement.style.width = '100%';
            imageElement.style.height = '200px';
            imageElement.style.objectFit = 'cover';
            imageElement.style.objectPosition = 'center';
            imageElement.style.marginBottom = '15px';


            // 景點名稱
            const title = document.createElement('h3');
            title.textContent = place.name || ''; // 使用安全的非空斷言
            card.appendChild(title);


            // 設定標題樣式
            Object.assign(title.style, {
              fontSize: '16px',
              fontWeight: '900',
              color: '#333',
              textAlign: 'center',
              margin: '0 0 10px',
              whiteSpace: 'nowrap',       // 禁止換行
              overflow: 'hidden',         // 隱藏超出的內容
              textOverflow: 'ellipsis',   // 顯示省略號
              maxWidth: '90%',            // 設定最大寬度，確保觸發省略號
            });


            // 評分，要有星星
            const ratingContainer = document.createElement('div');
            ratingContainer.style.display = 'flex';
            ratingContainer.style.alignItems = 'center';
            ratingContainer.style.justifyContent = 'center';
            ratingContainer.style.marginBottom = '10px';


            const ratingText = document.createElement('span');
            ratingText.textContent = '評分：';
            ratingText.style.fontSize = '14px';
            ratingText.style.color = '#555';
            ratingText.style.marginRight = '5px';


            const ratingStars = this.createStarRating(place.rating || 0); // 獲取星星
            ratingContainer.appendChild(ratingText);
            ratingContainer.appendChild(ratingStars);
            card.appendChild(ratingContainer);


            // 配置卡片佈局
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.alignItems = 'center';


            // 點選卡片會有詳細資料
            card.addEventListener('click', () => {
              this.googleMapsService.getplace(place.place_id!);
            });
            placeList.appendChild(card); // 將卡片添加到列表中
          }
          // 地圖模式
          else {
            if (place.geometry && place.geometry.location) {
              //裝一個一個的容器
              const placeItem = document.createElement('div');
              placeItem.classList.add('place-item');
              placeItem.style.flex = '0 0 auto';
              placeItem.style.width = '110px';
              placeItem.style.height = '100px';
              placeItem.style.backgroundColor = 'white';
              placeItem.style.borderRadius = '10px';
              placeItem.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
              placeItem.style.cursor = 'pointer';
              placeItem.style.margin = '0 5px 0';

              //圖片
              const img = document.createElement('img');
              img.src = place.photos
                ? place.photos[0].getUrl({ maxWidth: 5000, maxHeight: 5000 })
                : 'assets/home/NOPHOTO.png';
              placeItem.appendChild(img);
              img.style.width = '110px';
              img.style.height = '50px';
              img.style.objectFit = 'cover';
              img.style.overflow = 'hidden';
              img.style.borderRadius = '5px 5px 0 0';

              //名稱
              const placeName = document.createElement('h3');
              placeName.innerText = place.name || '無名稱';
              placeName.style.margin = '5px 5px 0';
              placeName.style.fontSize = '13px';
              placeName.style.color = 'gray';
              placeName.style.whiteSpace = 'nowrap'; // 禁止換行
              placeName.style.overflow = 'hidden'; // 超出容器的部分隱藏
              placeName.style.textOverflow = 'ellipsis'; // 用省略號表示超出的文字
              placeItem.appendChild(placeName);

              //星星
              if (place.rating) {
                const stars = document.createElement('div');
                stars.classList.add('stars');
                const starCount = Math.floor(place.rating || 0);
                stars.innerHTML =
                  '★'.repeat(starCount) +
                  '☆'.repeat(5 - starCount) +
                  ' ' +
                  place.rating;
                placeItem.appendChild(stars);
                stars.style.color = '#f5a623';
                stars.style.marginLeft = '5px';
                stars.style.fontSize = '13px';
              } else {
                const stars = document.createElement('p');
                stars.classList.add('stars');
                stars.textContent = '尚無評價';
                stars.style.color = '#555';
                stars.style.fontWeight = 'bold';
                stars.style.fontSize = '12px';
              }

              if (photosContainer) {
                photosContainer.appendChild(placeItem);
              }

              // 點擊placeItem聚焦
              placeItem.addEventListener('click', () => {
                this.googleMapsService.focusOnPlace(place);
                if(place.place_id)
                this.googleMapsService.getplace(place.place_id);
              });
            }
          }
          // 檢查是否有下一頁的資料
          if (pagination && pagination.hasNextPage) {
          const nextButton = document.createElement('button');
          // 加icon
          const icon = document.createElement('i');
          icon.className = 'fa-regular fa-hand-pointer';
          nextButton.appendChild(icon);
          const textNode = document.createTextNode(' 載入更多');
          nextButton.appendChild(textNode);
          // 設定樣式
          Object.assign(nextButton.style, {
            padding: '6px',
            width: '105px',
            backgroundColor: '#fafafa',
            border: '#555 2px solid',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 'bold',
            color: '#555',
            cursor: 'pointer',
            boxShadow: '3px 2px 2px rgba(0, 0, 0, 0.5)',
          });

          // 添加 hover 和 active 的效果
          nextButton.addEventListener('mouseover', () => {
            nextButton.style.transform = 'scale(1.03)';
          });

          nextButton.addEventListener('mouseout', () => {
            nextButton.style.boxShadow = '3px 2px 2px rgba(0, 0, 0, 0.5)';
            nextButton.style.transform = 'scale(1)';
          });

          let loadMoreCount = 0;

          // 當點擊「載入更多」按鈕時載入下一頁
          if(pagination.hasNextPage){
            nextButton.onclick = () => {
              if (loadMoreCount >= 1) {
                // 停用按鈕
                nextButton.disabled = true;
                nextButton.style.cursor = 'default';
                nextButton.style.width = '140px'
                nextButton.textContent = '已載出所有結果';
                return;
              }

              // 紀錄載入前的子元素數量
              const initialItemCount = document.querySelectorAll('.place-item').length;
              const initialCardCount = document.querySelectorAll('.place-card').length;

              // 呼叫 nextPage 來載入更多的結果
              pagination.nextPage();
              loadMoreCount++;

              // 使用 MutationObserver監聽
              //地圖模式
              const observer = new MutationObserver(() => {
                const allPlaceItems = document.querySelectorAll('.place-item');
                if (allPlaceItems.length > initialItemCount) {
                  const firstNewPlaceItem = allPlaceItems[initialItemCount+7];
                  if (firstNewPlaceItem) {
                    firstNewPlaceItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                  observer.disconnect(); // 停止觀察
                }
              });
              //列表模式
              const observerForPlaceList = new MutationObserver((mutations) => {
                const allCards = document.querySelectorAll('.place-card');
                if (allCards.length > initialCardCount) {
                  const firstNewCard = allCards[initialCardCount+1];
                  if (firstNewCard) {
                    firstNewCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                  observer.disconnect(); // 停止觀察
                }
              })

              // 開始監聽容器內部的變化
              if (photosContainer) {
                observer.observe(photosContainer, { childList: true });
              }
              if (placeList) {
                observerForPlaceList.observe(placeList, { childList: true });
              }
            };
          }

          const paginationContainer = document.getElementById(
            'pagination-container'
          );
          if (paginationContainer) {
            paginationContainer.innerHTML = ''; //清空之前的內容
            paginationContainer.appendChild(nextButton); //添加新的按鈕
          }
        }
        });
        this.loading.updateLoading(false);
      }
    );
    this.cdr.detectChanges(); // 更新畫面
  }

  // 創造星星
  private createStarRating(rating: number): HTMLElement {
    const ratingContainer = document.createElement('span'); // 裝星星的容器
    const fullStar = '★'; // 全星
    const halfStar = '☆'; // 半星

    const fullStars = Math.floor(rating); // 全星
    const hasHalfStar = rating % 1 >= 0.5; // 半星
    const emptyStars = 5 - Math.ceil(rating); // 空星：5顆星 - 全星跟半星

    // 全星
    for (let i = 0; i < fullStars; i++) {
      ratingContainer.innerHTML += fullStar;
    }

    // 半星
    if (hasHalfStar) {
      ratingContainer.innerHTML += fullStar;
    }

    // 空星
    for (let i = 0; i < emptyStars; i++) {
      ratingContainer.innerHTML += halfStar;
    }

    // 添加數字評分
    const ratingText = document.createElement('span');
    ratingText.textContent = `(${rating.toFixed(1)})`; // 顯示到小數點後1位
    ratingContainer.appendChild(ratingText);

    return ratingContainer;
  }

  // 根據地點的照片來獲取圖片 URL
  private getPhotoUrl(place: any): string {
    if (place.photos && place.photos.length > 0) {
      const photo = place.photos[0];
      return photo.getUrl({ maxWidth: 400, maxHeight: 400 }); // 圖片最大值
    }
    return 'assets/home/NOPHOTO.png'; // 若沒有圖片，顯示預設圖片path/to/default-image.jpg
  }

}
