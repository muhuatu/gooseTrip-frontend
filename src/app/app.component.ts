import { ButtonDialogComponent } from './components/button-dialog/button-dialog.component';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import { MyJourneyComponent } from './journey/my-journey/my-journey.component';
import { DataService } from './service/data.service';
import { MatDialog } from '@angular/material/dialog';
import { HttpClientService } from './http-serve/http-client.service';
import { HintDialogComponent } from './components/hint-dialog/hint-dialog.component';
import { MyJourneySizeService } from './service/my-journey-size.service';
import { joinResponse } from './interface/JourneyInter';
import { Loading } from './service/loading.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, CommonModule, MyJourneyComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'gooseTrip';
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    public dataService: DataService,
    public myJourneySizeService: MyJourneySizeService,
    public dialog: MatDialog,
    private http: HttpClientService,
    private loading: Loading
  ) {
    // 訂閱路由事件來更新 isPostCommentComponent
    this.router.events.subscribe(() => {
      this.isPostCommentComponent =
        this.router.url.includes('post_comment') ||
        this.router.url.includes('post_edit') ||
        this.router.url.includes('post_create') ||
        this.router.url.includes('map') ||
        this.router.url.includes('login'); // 不顯示"我的行程"
    });
  }

  isOpen = false; //導航欄是否打開
  isLogin = false;
  isPostCommentComponent: boolean = false; // 讓PostComment不要顯示"我的行程"
  loading$!: any;
  currentRoute: string = '';
  userName: string = '';
  userImage: string = '';

  ngOnInit(): void {
    this.isOpen = false;

    // 初始化檢查登入狀態
    this.updateLoginStatus();

    this.dataService.loginStatus$.subscribe((status) => {
      this.isLogin = status;
      this.cdr.detectChanges();
    });

    // 訂閱 journeyState$
    this.myJourneySizeService.journeyState$.subscribe((state) => {
      this.myJourney = state; // 更新本地狀態
      this.cdr.detectChanges();
    });

    // 訂閱 journeyState$
    this.loading.loading$.subscribe((state) => {
      this.loading$ = state;
      this.cdr.detectChanges();
    });

    // 監聽路由變化
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
        this.cdr.detectChanges();
      }
    });

    //訂閱用戶
    this.dataService.user$.subscribe((item) =>{
      let user= JSON.parse(sessionStorage.getItem('user') || '{}');
      this.userName = user.userName;
      this.userImage = user.userImage;
      this.cdr.detectChanges();
    })
  }

  updateLoginStatus(): void {
    this.isLogin = this.dataService.isLogIn();
    this.cdr.detectChanges(); // 更新畫面
  }

  open() {
    //為了等導覽航全開完，再顯示文字
    setTimeout(() => {
      this.isOpen = true;
    }, 50);
    this.cdr.detectChanges();
  }

  close() {
    this.isOpen = false;
    this.cdr.detectChanges();
  }

  //首頁
  goHomepage() {
    this.router.navigate(['/']);
  }

  //登入
  login() {
    this.dataService.lastRouter = this.router.url;
    sessionStorage.setItem(
      'searchKeyword',
      JSON.stringify(this.dataService.keyword)
    );
    this.router.navigate(['/login']);
  }

  //登出
  logout() {
    if (this.dataService.isEditing) {
      let dialogRef = this.dialog.open(ButtonDialogComponent, {
        data: '目前編輯尚未存儲，是否登出?',
        autoFocus: true,
        restoreFocus: true,
      });

      dialogRef.afterClosed().subscribe((res) => {
        //點選確定的話幫他跳轉 並清掉權限
        if (res) {
          let req = {
            userEdit: `${this.dataService.editing.journeyId},${this.dataService.editing.day}`,
          };
          this.http
            .postApi('http://localhost:8080/user/endUpdateUserEdit', req)
            .subscribe((res) => {
              let Response = res as joinResponse;
              if (Response.code == 200) {
                this.dataService.isEditing = false;
                this.dataService.finishEditing();
                this.http
                  .getApi('http://localhost:8080/user/logout')
                  .subscribe((res: any) => {
                    if (res.code == 200) {
                      this.dataService.updateJourneyList([]);
                      sessionStorage.removeItem('dialogPlaceId');
                      sessionStorage.setItem('isLogin', 'false');
                      sessionStorage.removeItem('user');
                      this.dataService.updateUser('');
                      this.dataService.setLoginStatus(false);
                      this.myJourneySizeService.setSwitchToSpot(false);
                      this.myJourneySizeService.setJourneyState(0);
                      this.cdr.detectChanges(); // 更新畫面
                      this.dialog.open(HintDialogComponent, {
                        data: ['登出成功'],
                      });
                      this.router.navigate(['/']);
                    }
                  });
              }
              if (Response.code != 200) {
                let errmessage = [Response.message];
                this.dialog.open(HintDialogComponent, { data: errmessage });
              }
            });
        }
      });
    } else {
      let dialogRef = this.dialog.open(ButtonDialogComponent, {
        data: '確定要登出',
        autoFocus: true,
        restoreFocus: true,
      });

      dialogRef.afterClosed().subscribe((res) => {
        //關閉後
        if (res) {
          this.http
            .getApi('http://localhost:8080/user/logout')
            .subscribe((res: any) => {
              if (res.code == 200) {
                this.dataService.updateJourneyList([]);
                sessionStorage.removeItem('dialogPlaceId');
                sessionStorage.removeItem('user');
                this.dataService.updateUser('');
                sessionStorage.setItem('isLogin', 'false');
                this.dataService.setLoginStatus(false);
                this.myJourneySizeService.setSwitchToSpot(false);
                this.myJourneySizeService.setJourneyState(0);
                this.dataService.isEditing = false;
                this.dataService.finishEditing();
                this.cdr.detectChanges(); // 更新畫面
                this.dialog.open(HintDialogComponent, {
                  data: ['登出成功'],
                });
                this.router.navigate(['/']);
              }
            });
        }
      });
    }
  }

  //我的最愛
  myfavorite() {
    this.router.navigate(['/my-favorite']);
  }

  // 會員資料
  userInfo() {
    this.router.navigate(['/user-info']);
  }

  // 社群首頁
  postHome() {
    this.router.navigate(['/post_home']);
  }

  ////我的行程區塊大小(0是完全關起來，1是中間，2是最大)
  myJourney: number = 0;

  openMyJourney() {
    this.myJourneySizeService.setJourneyState(1);
    this.cdr.detectChanges();
  }

  closeMyJourney() {
    this.myJourneySizeService.setJourneyState(0);
    this.cdr.detectChanges();
  }

  change() {
    if (this.myJourney == 1) {
      this.myJourneySizeService.setJourneyState(2);
    } else {
      this.myJourneySizeService.setJourneyState(1);
    }
    this.cdr.detectChanges();
    // 切換狀態
    // this.myJourney = (this.myJourney + 1) % 3; // 循環切換
  }

  //聊天室
  chatroom = false;
  clickchatroom() {
    this.chatroom = !this.chatroom;
  }

  // 檢查是否為當前路由
  isActiveRoute(route: string): boolean {
    return this.currentRoute.startsWith(route); // 檢查路徑是否相符
  }
}
