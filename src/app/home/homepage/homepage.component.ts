import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { DataService } from '../../service/data.service';
import { HintDialogComponent } from '../../components/hint-dialog/hint-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SelectJourneyDialogComponent } from '../../components/select-journey-dialog/select-journey-dialog.component';
import { AddPlaceDialogComponent } from '../../components/add-place-dialog/add-place-dialog.component';
import { GoogleMapService } from '../../service/googlemap.service';

@Component({
  selector: 'app-homepage',
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class HomepageComponent {
  constructor(
    private router: Router,
    public dataService: DataService,
    public dialog: MatDialog,
    private googleMapsService: GoogleMapService,
  ) {
    this.loadSearchHistory();
  }

  //搜尋的內容
  searchName = '';

  //搜尋條件顯示與否
  searchOptions = false;

  //熱門搜尋地
  // popularSearches = ['台北101', '日月潭', '國華街'];

  //熱門城市
  popularDestinations = [
    '台北101',
    '日月潭',
    '安平古堡',
    '清水斷崖',
    '澎湖玄武岩',
    '墾丁大街',
  ];

  // 熱門目的地
  spots = [
    {
      name: '台北',
      searchName: '台北 景點',
      image: 'assets/destination/taipei.jpg',
      center: { lat: 25.0303, lng: 121.5363 }
    },
    {
      name: '桃園',
      searchName: '桃園 景點',
      image: 'assets/destination/taoyuan.jpg',
      center: { lat: 24.8805, lng: 121.2426 }
    },
    {
      name: '台中',
      searchName: '台中 景點',
      image: 'assets/destination/taichung.jpg',
      center: { lat: 24.147736, lng: 120.673648 }
    },
    {
      name: '台南',
      searchName: '台南 景點',
      image: 'assets/destination/tainan.jpg',
      center: { lat: 23.1417, lng: 120.2513 }
    },
    {
      name: '澎湖',
      searchName: '澎湖 景點',
      image: 'assets/destination/penghu.jpg',
      center: { lat: 23.571074, lng: 119.579632 }
    },
  ];

  //搜尋紀錄
  searchHistory: string[] = [];

  showSearchOptions() {
    this.searchOptions = true;
  }

  hideSearchOptions() {
    this.searchOptions = false;
  }

  onEnter(){
    this.getSearchdata();
  }

  // 把searchName傳到service裡面
  getSearchdata(keyword?: string, mouseEvent?: MouseEvent) {
    // 如果有 keyword 參數，更新 searchName
    if (keyword) {
      this.searchName = keyword; // 更新搜尋框的內容
    }

    // 點擊沒反應，加了 event 才能觸發 click
    if (mouseEvent) {
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
    }

    // 檢查 searchName 是否為空，若是則顯示提示框
    if (this.searchName == '') {
      this.dialog.open(HintDialogComponent, {
        data: ['請輸入要搜尋的關鍵字'], // 提示框顯示內容
      });
    } else {
       // 找到對應熱門目的地的座標
      const selectedSpot = this.spots.find(spot => spot.searchName == this.searchName);
      if (selectedSpot) {
        this.dataService.center=selectedSpot.center;
      }
      // 儲存搜尋關鍵字並導航
      this.dataService.keyword = this.searchName;
      this.router.navigate(['/search']);
      this.saveSearchHistory(this.searchName); // 儲存搜尋歷史
    }
  }

  // 載入搜尋紀錄
  loadSearchHistory() {
    const history = localStorage.getItem('searchHistory'); // 獲取歷史紀錄
    if (history) {
      this.searchHistory = JSON.parse(history);
    }
  }

  // 將搜尋紀錄儲存到localStorage
  saveSearchHistory(keyword: string) {
    if (!this.searchHistory.includes(keyword)) {
      this.searchHistory.unshift(keyword);
      if (this.searchHistory.length > 10) {
        this.searchHistory.pop(); // 限制最多10筆搜尋紀錄
      }
    }
    localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
  }

  // 清除搜尋紀錄
  clearSearchHistory(mouseEvent?: MouseEvent) {
    if (mouseEvent) {
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
    }
    this.searchHistory = [];
    localStorage.removeItem('searchHistory');
  }

  getDestinationImage(destination: string): string {
    const images: { [key: string]: string } = {
      台北101: 'assets/spot/101.jpg',
      日月潭: 'assets/spot/SunMoonLake.jpg',
      安平古堡: 'assets/spot/3.jpg',
      清水斷崖: 'assets/spot/4.jpg',
      澎湖玄武岩: 'assets/spot/5.jpg',
      墾丁大街: 'assets/spot/6.jpg',
    };
    return images[destination] || 'https://i.imgur.com/Y1GLBdW.png';
  }
}
