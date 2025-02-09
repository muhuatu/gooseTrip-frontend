import { ChangeDetectionStrategy, signal, Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpClientService } from '../../http-serve/http-client.service';
import { commentList, PostDetail } from '../../interface/postInter';
import { DataService } from '../../service/data.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImgFormatService } from '../../service/imgFormat.service';
import { ButtonDialogComponent } from '../../components/button-dialog/button-dialog.component';
import { HintDialogComponent } from '../../components/hint-dialog/hint-dialog.component';
declare const google: any;  // 用來引用 Google Maps 物件

@Component({
  selector: 'app-post-edit',
  imports: [MatExpansionModule, MatTabsModule, MatIconModule, MatTooltipModule, FormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './post-edit.component.html',
  styleUrl: './post-edit.component.scss'
})
export class PostEditComponent {

  readonly panelOpenState = signal(false);
  constructor(
    private router: Router,
    public dialog: MatDialog,
    public dataService: DataService,
    public imgFormat: ImgFormatService,
    private fb: FormBuilder,
    private http: HttpClientService,
    private cdr: ChangeDetectorRef,
  ) { }

  // googleMap API要塞資料的容器
  map!: google.maps.Map;
  placesService: any; // 用來處理 Place API 查詢
  markerList: any[] = []; // 用來儲存所有的 spotName
  // place: any;

  ngOnInit(): void {
    // 從 Session 導入會員資料
    // 要命名為 sessionUser 不然會和貼文作者的名字重複
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.sessionUserName = user.userName;
    this.sessionUserMail = user.userMail;
    this.sessionUserImage = user.userImage;
    console.log(user);

    console.log(sessionStorage.getItem('postContent'));

    const postContent = JSON.parse(sessionStorage.getItem('postContent') || '{}');
    console.log(postContent);

    this.journeyId = postContent.journeyId;
    this.postId = postContent.postId;

    // 渲染整個貼文內容
    this.getPost();
  }

  // 使用者資訊
  sessionUserName!: string;
  sessionUserMail!: string;
  sessionUserImage!: string;

  // 前一頁過來的ID
  journeyId!: number;
  postId!: number;

  //貼文內容
  journeyName!: string;
  userName!: string;
  userImage!: string;
  postTime!: string;
  postContent!: string;
  isTruncated: boolean = true; // 初始設置為超過50字

  // 按讚與收藏與評論
  thumbUps!: number;
  thumbDowns!: number;
  isFavorited: boolean = false;
  userReaction: 'thumbUp' | 'thumbDown' | null = null;
  comments: commentList[] = [];
  newComment: string = ''; // 新評論預設為空

  tabs: any = [];

  // 將會送到後端的貼文時間
  today = new Date(Date.now()).toISOString();
  previewUrl: string | null = null; // 預覽的圖片 URL
  selectedFile: File | null = null; // 已選擇的圖片檔案

  // 頁面渲染的當前時間
  formatDate(): string {
    const date = new Date(Date.now());
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是兩位數要補 0
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  // 預覽上傳圖片
  onFileSelected(event: Event, spot: any): void {

    const input = event.target as HTMLInputElement;
    const maxImg = 5* 1024* 1024; // 檔案大小限制 5MB
    if (input.files && input.files.length > 0) {

      if (maxImg < input.files[0].size) {
        this.dialog.open(HintDialogComponent, {
          data: ['檔案大小不得超過5MB'],
          autoFocus: true,
          restoreFocus: true,
        });
      } else {

        this.selectedFile = input.files[0]; // 獲取選擇的檔案
        const reader = new FileReader();

        reader.onload = (e: ProgressEvent<FileReader>) => {
          let base64 = e.target?.result as string; // 將 Base64 字串設為預覽 URL
          // 統一去除前綴，因為service會再加上
          spot.spotImage = base64.split(',')[1];
          // this.cdr.detectChanges()強制畫面偵測並重新渲染
          // 因為有使用 changeDetection: ChangeDetectionStrategy.OnPush
          this.cdr.detectChanges();
          // console.log(spot.spotImage);
        };
        reader.readAsDataURL(this.selectedFile); // 將檔案轉換為 Base64
      }
    }
  }


  // 接API : getPost() 取得特定貼文內容
  getPost() {

    const req = {
      "journeyId": this.journeyId,
      "postId": this.postId
    }

    // 1. 向後端請求貼文內容
    this.http.postApi('http://localhost:8080/post/getPost', req).subscribe((res: any) => {

      console.log(res);
      for (let index = 0; index < res.postDetail.length; index++) {


      }
      // 2. 將所有 spotName 存入 markerList 陣列
      this.markerList = res.postDetail.map((detail: any) => detail.spotName);
      console.log(this.markerList);

      // 貼文內容
      this.journeyName = res.journeyName;
      this.userName = res.userName;
      this.userImage = res.userImage || './assets/avatar/Null_Goose.jpeg'; // 從DB拿會員頭貼，沒有圖片時用鵝鵝
      this.postTime = res.postTime;
      this.postContent = res.postContent;
      this.isFavorited = res.favorite; // 判斷此貼文使用者是否有收藏(愛心要變色)
      this.thumbUps = res.thumbUp;
      this.thumbDowns = res.thumbDown;
      // 每天的景點
      this.tabs = [];
      // 遍歷 postDetail (景點資訊)
      res.postDetail.forEach((detail: PostDetail) => {
        // 確認第X天是否已在tabs中
        console.log(detail);

        const existedDay = this.tabs.find((tab: any) => tab.day === detail.day);

        // 景點資訊們
        const spotInfo = {
          spotName: detail.spotName,
          spotNote: detail.spotNote,
          spotImage: detail.spotImage,
          duration: detail.duration,
          placeId: detail.placeId,
        }

        // console.log(spotInfo);


        if (!existedDay) {
          // 第X天還沒在tabs裡的話，push進去tabs
          this.tabs.push({
            label: `第${detail.day}天`, // 放入第X天的tabs中
            day: detail.day,
            spots: [spotInfo]
          })
        } else {
          // 如果第X天已加入tabs，放入景點就好
          existedDay.spots.push(spotInfo);
        }
      });

      console.log(this.tabs);

      // 評論區
      this.comments = res.commentList.map((comment: commentList) => ({
        //serialNumber: comment.serialNumber,
        userName: comment.userName,
        userImage: comment.userImage || 'assets/avatar/Null_Goose.jpeg', // 沒有圖片時用鵝鵝
        postId: comment.postId,
        commentContent: comment.commentContent,
        commentTime: comment.commentTime,
        commentId: comment.commentId,
        replyCommentId: comment.replyCommentId,
        commentThumbUp: comment.thumbUp,
        commentThumbDown: comment.thumbDown,
      }));
    });
  }

  // -----------------------------------地圖區-------------------------------------
  initMap() {
    const defaultlocation = {
      lat: 25.0374865,
      lng: 121.5647688
    };

    const portalDiv = document.getElementById('map')!;
    this.map = new google.maps.Map(portalDiv, {
      center: defaultlocation,
      zoom: 16,
      mapTypeId: 'terrain'
    });
    // 初始化 Places Service
    this.placesService = new google.maps.places.PlacesService(this.map);
  }

  setMarkers(tabIndex: number) {

    // 1. 獲取該 tab 中的所有景點
    const spots = this.tabs[tabIndex].spots;

    if (spots.length === 0) return; // 如果沒有景點，則不處理

    // 2. 取第一個景點的名稱，並進行查詢
    const firstSpot = spots[0];
    let query = firstSpot.spotName;

    this.placesService.textSearch({ query: query }, (results: any[], status: any) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        // 取搜尋結果的第一筆
        const place = results[0];
        const location = place.geometry.location;
        // 3. 設置地圖中心為第一個景點的位置
        // --> 切換tab時地圖中心會是當天第一個景點
        this.map.setCenter(location);

        // 4. 遍歷當天的所有景點並在地圖上添加 marker
        spots.forEach((spot: { spotName: string; }) => {
          const query = spot.spotName;
          this.placesService.textSearch({ query: query }, (results: any[], status: any) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              const place = results[0];
              const location = place.geometry.location;
              const marker = new google.maps.Marker({
                position: location,
                map: this.map,
                title: place.name
              });
              // 5. 添加點擊 marker滾動視窗的事件
              marker.addListener('click', () => {
                this.scrollView(spot.spotName);
              });
            }
          });
        });
      } else {
        console.error('搜尋失敗', status);
      }
    });
  }

  scrollView(spotName: string) {
    const container = document.getElementById(spotName);
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'end', inline: "nearest" });
    }
  }

  onTabChanged(events: any) {
    this.markerList = [];
    for (let spot of this.tabs[events.index].spots) {
      this.markerList.push(spot.spotName);
    }

    this.initMap();
    this.setMarkers(events.index);

  }

  emptyImg(spot:any) {
    spot.spotImage = ""
  }

  updatePost() {

    let temp = [];
    // console.log(this.tabs);

    for (let index = 0; index < this.tabs.length; index++) {
      // console.log(this.tabs[index].spots);
      for (let y = 0; y < this.tabs[index].spots.length; y++) {
        let temp1 = {
          day: this.tabs[index].day,
          spotId: y + 1, // 假設 spotId 從 1 開始遞增
          spotName: this.tabs[index].spots[y].spotName,
          spotNote: this.tabs[index].spots[y].spotNote,
          spotImage: this.tabs[index].spots[y].spotImage,
          duration: this.tabs[index].spots[y].duration,
          placeId: this.tabs[index].spots[y].placeId
        };
        temp.push(temp1);
        // console.log(temp1);

      }
    };

    let req = {
      "postId": this.postId,
      "journeyId": this.journeyId,
      "postContent": this.postContent,
      "postTime": this.today.split('T')[0],
      "postDetail": temp,
    }
    let dialogRef = this.dialog.open(ButtonDialogComponent, {
      data: '貼文已養精蓄銳，\n要讓牠再次出發嗎？',
      autoFocus: true,
      restoreFocus: true,
    });
    // console.log(req);

    // 按確定後才會觸發更新API
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.http.postApi('http://localhost:8080/post/updatePost', req).subscribe({
          next: (res: any) => {
            if (res.code === 200) {
              console.log(res);
              sessionStorage.removeItem('postContent'); //　發布後清空session
              this.router.navigate(['/post_home']);
              this.cdr.detectChanges();
            } else {
              this.dialog.open(HintDialogComponent, {
                data: res.message.split('\n'),
              });
              this.cdr.detectChanges();
            }
          },
          error: (err) => {
            // 從後端的錯誤物件提取訊息
            const errorData = err.error;
            let errorMessages: string[] = [];

            if (typeof errorData === 'object') {
              // 如果錯誤回應是 JSON 格式()
              for (const [field, message] of Object.entries(errorData)) {
                errorMessages.push(`${message}`);
              }
            } else {
              // 如果錯誤是純文字
              errorMessages.push('操作失敗，請稍後再試');
            }

            this.dialog.open(HintDialogComponent, {
              data: errorMessages,
            });
          },
        });
      }
    })

  }

}
