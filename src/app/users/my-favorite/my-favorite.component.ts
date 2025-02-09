import { GoogleMapService } from './../../service/googlemap.service';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpClientService } from '../../http-serve/http-client.service';
import { HintDialogComponent } from '../../components/hint-dialog/hint-dialog.component';
import { ButtonDialogComponent } from '../../components/button-dialog/button-dialog.component';
import { DataService } from '../../service/data.service';
import { Loading } from '../../service/loading.service';

@Component({
  selector: 'app-my-favorite',
  imports: [],
  templateUrl: './my-favorite.component.html',
  styleUrl: './my-favorite.component.scss'
})
export class MyFavoriteComponent {
  constructor(private router:Router,
    public dialog: MatDialog,
    private http:HttpClientService,
    private cdr: ChangeDetectorRef,
    public dataService: DataService,
    public googleMapService: GoogleMapService,
    private loading:Loading
  ) {}

  plcaeIdList:string[]|null=null;
  plcaeList:google.maps.places.PlaceResult[]=[];
  placeCategory:PlaceCategory={};

  ngOnInit(): void {
    // 初始化地圖
    const mapElement = document.getElementById('map')!;
    this.googleMapService.initMap(mapElement, {lat:22.99651782738241, lng:120.2034743572298 });
    mapElement.style.display = 'none';

    this.loading.updateLoading(true);
    this.http.getApi('http://localhost:8080/user/search_favorite')
    .subscribe((res:any) => {
      if(res.code==200){
        this.plcaeIdList = res.userFavorite;
        if (this.plcaeIdList) {
          const searchPromises = this.plcaeIdList.map(item =>
            new Promise((resolve) => {
              this.googleMapService.searchPlace(item, (result) => {
                this.plcaeList.push(result);
                resolve(result);  // 確保每個搜尋操作完成後再繼續
              });
            })
          );

          // 等待所有的搜尋操作完成
          Promise.all(searchPromises).then(() => {
            this.plcaeList.forEach((item: google.maps.places.PlaceResult) => {
              if(item.place_id)this.googleMapService.setFavoriteStatus(item.place_id,true);
              const { country, region } = this.getCountryAndRegion(item.address_components);
              if (!this.placeCategory[country]) {
                this.placeCategory[country] = {};
              }
              if (!this.placeCategory[country][region]) {
                this.placeCategory[country][region] = [];
              }
              this.placeCategory[country][region].push({
                name: item.name ? item.name : '找不到名字',
                photo: item.photos ? item.photos[0].getUrl({ maxWidth: 400, maxHeight: 250 }) : '尚無圖片',
                placeId: item.place_id ? item.place_id : '找不到id'
              });
            });
             // 固定排序 this.placeCategory
            this.placeCategory = this.sortPlaceCategory(this.placeCategory);
            this.renderCountries();
          })
        }
        this.loading.updateLoading(false);
      }else{
        this.dialog.open(HintDialogComponent, {
          data:[res.message,]
        });
        this.http.getApi('http://localhost:8080/user/logout')
        .subscribe((res:any) => {
          if(res.code==200){
            this.dataService.updateUser('');

            // 登出
            this.dataService.setLoginStatus(false);
            sessionStorage.removeItem('isLogin');
            this.cdr.detectChanges();
            this.router.navigate(['/'])
          }
        })
      }
    })
    this.loading.updateLoading(false);
  }

  goSearch(){
    sessionStorage.removeItem('dialogPlaceId');
    this.router.navigate(['/search']);
  }

  //提取addressComponents中的國家和區域
  getCountryAndRegion(addressComponents:any| undefined) {
    if (!addressComponents) {
      console.error('address_components is undefined or null');
      return { country: '', region: '' };
    }
    let country = "";
    let region = "";

    addressComponents.forEach((item:any) => {
      if (item.types.includes("country")) {
        country = item.long_name;
      }
      if (item.types.includes("administrative_area_level_1")) {
        region = item.long_name;
      }
    });
    return { country, region };
  }

  sortPlaceCategory(placeCategory: Record<string, Record<string, any[]>>): Record<string, Record<string, any[]>> {
    const sortedCategory: Record<string, Record<string, any[]>> = {};
    // 先按國家名稱排序
    const sortedCountries = Object.keys(placeCategory).sort((a, b) => {
      if (a == '台灣') return -1; // '台灣' 排在最前
      if (b == '台灣') return 1;  // 其他國家排在後
      return a.localeCompare(b);   // 其他按字母順序排序
    });

    sortedCountries.forEach(country => {
      sortedCategory[country] = {};
      // 再按地區名稱排序
      const sortedRegions = Object.keys(placeCategory[country]).sort((a, b) => {
        if (a == '') return 1; // 空字串排在最後
        if (b == '') return -1; // 空字串排在最後
        return a.localeCompare(b); // 其他按字母順序排序
      });
      sortedRegions.forEach(region => {
        sortedCategory[country][region] = placeCategory[country][region];
      });
    });
    return sortedCategory;
  }

  renderCountries(): void {
    const container = document.getElementById("places-container");
    if (!container) return;
    container.innerHTML = "";

    Object.keys(this.placeCategory).forEach((country) => {
      // 建立country的區塊
      const countryDiv = document.createElement("div");
      countryDiv.className = "country-block";
      countryDiv.style.backgroundColor = '#f6f3eb';
      countryDiv.style.borderRadius = "8px";
      countryDiv.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
      countryDiv.style.padding = "15px";
      countryDiv.style.width = "100%";
      countryDiv.style.display = "flex";
      countryDiv.style.flexDirection = "column";
      countryDiv.style.color = "#555";

      const countryRegion = document.createElement("div");
      countryRegion.style.display = "flex";
      countryRegion.style.gap = "20px";
      countryRegion.style.alignItems = "center";

      const countryTitle = document.createElement("p");
      countryTitle.textContent = country;
      countryTitle.style.fontSize = "26px";
      countryTitle.style.fontWeight = "bolder";
      countryTitle.style.marginBottom = "10px";
      countryRegion.appendChild(countryTitle);

      // 建立region下拉選單
      const regionSelect = document.createElement("select");
      regionSelect.className = "region-select";
      regionSelect.style.width = "200px";
      regionSelect.style.padding = "8px";
      regionSelect.style.fontSize = "1rem";
      regionSelect.style.border = "1px solid #ddd";
      regionSelect.style.borderRadius = "4px";
      regionSelect.style.backgroundColor = "#fff";
      regionSelect.style.boxShadow = "inset 0 1px 3px rgba(0, 0, 0, 0.1)";
      regionSelect.style.marginBottom = "10px";
      regionSelect.style.transition = "border-color 0.3s ease";
      regionSelect.style.cursor = "pointer";

      countryDiv.appendChild(countryRegion);

      regionSelect.addEventListener("focus", () => {
        regionSelect.style.borderColor = "none";
        regionSelect.style.outline = "none";
      });
      regionSelect.addEventListener("blur", () => {
        regionSelect.style.borderColor = "#ddd";
      });

      const regions = Object.keys(this.placeCategory[country])

      if (regions.length == 0) return;

      regions.forEach((region) => {
        const option = document.createElement("option");
        option.value = region ;
        option.textContent = region == "" ? "未分類" : region;
        option.style.fontWeight = "bold";
        option.style.color = "#555";
        option.style.backgroundColor = '#fafafa';
        regionSelect.appendChild(option);
      });

      // 預設選中第一個 region 並渲染
      regionSelect.value = regions[0];
      this.renderPlaces(country, regions[0], countryDiv);

      // 監聽下拉選單的變化
      regionSelect.addEventListener("change", (event: Event) => {
        const selectedRegion = (event.target as HTMLSelectElement).value;
        this.renderPlaces(country, selectedRegion, countryDiv);
      });

      countryRegion.appendChild(regionSelect);
      container.appendChild(countryDiv);
    });
  }

  renderPlaces(country: string, region: string, countryDiv: HTMLElement): void {
    // 清空之前的 place 顯示
    const existingPlacesDiv = countryDiv.querySelector(".places");
    if (existingPlacesDiv) existingPlacesDiv.remove();

    // 新建 places 容器
    const placesDiv = document.createElement("div");
    placesDiv.className = "places";
    placesDiv.style.display = "flex";
    placesDiv.style.gap = "35px";
    placesDiv.style.maxWidth = "90vw";
    placesDiv.style.flexWrap = "wrap";
    placesDiv.style.padding = "20px";
    placesDiv.style.marginLeft = "35px";

    // this.googleMapService.getFavoriteStatus().subscribe(status => {
      if (this.placeCategory[country] && this.placeCategory[country][region]) {
        this.placeCategory[country][region].forEach((place) => {
          const placeItem = document.createElement("div");
          placeItem.style.display = "flex";
          placeItem.style.flexDirection = "column";
          placeItem.style.alignItems = "center";
          placeItem.style.transition = "all 0.3s ease";
          placeItem.style.position = "relative";
          placeItem.addEventListener("mouseenter", () => {
            placeItem.style.transform = "translateY(-2px)";
            placeItem.style.transform = "scale(1.05)";
          });
          placeItem.addEventListener("mouseleave", () => {
            placeItem.style.transform = "";
          });

          // const div = document.createElement("div");
          // div.style.display = "flex"
          // div.style.width = "150px"
          // div.style.gap = "5px"
          // div.style.marginTop = "2px"

          const placeName = document.createElement("p");
          placeName.textContent = place.name;
          placeName.style.fontSize = "16px";
          placeName.style.fontWeight = "bolder";
          placeName.style.margin = "0";
          placeName.style.width = "150px";
          placeName.style.cursor = "pointer";
          placeName.addEventListener("click", () => {
            this.googleMapService.getplace(place.placeId);
          });

          const placePhoto = document.createElement("img");
          if(place.photo=='尚無圖片'){
            placePhoto.src = 'https://i.imgur.com/Y1GLBdW.png';
          }else{
            placePhoto.src = place.photo;
          }
          placePhoto.style.width = "150px";
          placePhoto.style.height = "125px";
          placePhoto.style.objectFit = "cover";
          placePhoto.style.borderRadius = "4px";
          placePhoto.style.marginBottom = "5px";
          placePhoto.style.cursor = "pointer";
          // placePhoto.style.border = "2px solid #555";

          const button = document.createElement("button");
          button.id = `favorite-button-${place.placeId}`;
          placeItem.appendChild(button);
          button.style.width = "35px";
          button.style.height = "35px";
          button.style.position = "absolute";
          button.style.zIndex="8"
          button.style.top = "80px";
          button.style.right = "8px";
          button.style.padding = "5px 5px 3px";
          button.style.backgroundColor = "#f6f3eb";
          button.style.border = "none";
          button.style.borderRadius = "100%";
          button.style.cursor = "pointer";
          button.style.boxShadow = "0px 5px 4px rgba(0, 0, 0, 0.5)";
          button.style.transition = "all 0.3s ease";
          button.style.color="#d5100b";

          const icon = document.createElement("i");
          icon.className = "fas fa-heart";
          icon.style.fontSize = "1.2rem";
          button.appendChild(icon);

          button.addEventListener("click", (event) => {
            // event.stopPropagation(); // 防止與圖片點擊事件衝突
            let req={
            "placeId":place.placeId
            }
            this.http.postApi('http://localhost:8080/user/update_favorite', req)
            .subscribe((res:any) => {
              if(res.code==200){
                let newFavoriteStatus=!this.googleMapService.getFavoriteStatusByPlaceId(place.placeId)
                this.googleMapService.setFavoriteStatus(place.placeId, newFavoriteStatus);
                const placeButton = document.getElementById(`favorite-button-${place.placeId}`);
                if (placeButton) {
                  placeButton.style.color = newFavoriteStatus ? "#d5100b" : "#555";
                }
                this.cdr.detectChanges();
              }else{
                this.dialog.open(HintDialogComponent, {
                  data:[res.message,]
                });
              }
            })
          });

          placePhoto.addEventListener("click", () => {
            this.googleMapService.getplace(place.placeId);
          });

          let isFavorite =this.googleMapService.getFavoriteStatusByPlaceId(place.placeId);
          const placeButton = document.getElementById(`favorite-button-${place.placeId}`);
          if (placeButton) {
            placeButton.style.color = isFavorite ? "#d5100b" : "#555";
            this.cdr.detectChanges();
          }

          placeItem.appendChild(placePhoto);
          placeItem.appendChild(placeName);
          placesDiv.appendChild(placeItem);
        });
      }
    // });
    countryDiv.appendChild(placesDiv);
    this.googleMapService.getFavoriteStatus().subscribe(status => {
      if(this.plcaeIdList){
        for (let item of this.plcaeIdList) {
          let isFavorite =status[item];
          const placeButton = document.getElementById(`favorite-button-${item}`);
          if (placeButton) {
            placeButton.style.color = isFavorite ? "#d5100b" : "#555";
            this.cdr.detectChanges();
          }
        }
      }
    });
    this.cdr.detectChanges();
  }
}

export interface PlaceCategory {
  [country: string]: {
    [city: string]: { name: string, photo: string, placeId: string }[];
  };
}

