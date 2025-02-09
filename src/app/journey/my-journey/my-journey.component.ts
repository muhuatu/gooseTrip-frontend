import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientService } from '../../http-serve/http-client.service';
import { HotelSearchComponent } from '../hotel-search/hotel-search.component';
import { HotelDataComponent } from '../hotel-data/hotel-data.component';
import { MyJourneySizeService } from '../../service/my-journey-size.service';
import { SpotComponent } from '../../spot/spot.component';
import { HintDialogComponent } from '../../components/hint-dialog/hint-dialog.component';
import {
  day,
  joinResponse,
  Journey,
  route,
  spot,
  SpotAndRouteResponse2,
} from '../../interface/JourneyInter';
import { JourneyResponse } from '../../interface/JourneyInter';
import { FormsModule } from '@angular/forms';
import { CreateJourneyDialogComponent } from '../create-journey-dialog/create-journey-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ButtonDialogComponent } from '../../components/button-dialog/button-dialog.component';
import { DateFormat } from '../../service/dateFornat.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DataService } from '../../service/data.service';
import { CollaboratorComponent } from '../collaborator/collaborator.component';
import { Router } from '@angular/router';
import { Loading } from '../../service/loading.service';
import { PdfDialogComponent } from '../../components/pdf-dialog/pdf-dialog.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-journey',
  imports: [
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    HotelSearchComponent,
    HotelDataComponent,
    SpotComponent,
    CollaboratorComponent,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './my-journey.component.html',
  styleUrl: './my-journey.component.scss',
})
export class MyJourneyComponent {
  @ViewChild(SpotComponent) SpotComponent?: SpotComponent;
  invitation: string = '';
  loginBoolean: boolean = true;
  switchToSpot: boolean = false;
  title: string = '';
  journey = {
    journeyId: 0,
    journeyName: '',
    invitation: '',
    startDate: '',
    endDate: '',
    transportation: '',
    userMail: '',
  };
  journeyList?: Journey[];

  // 需判斷行程已結束才可以發佈貼文
  today = new Date();
  userName: string = '';
  isPublished: boolean = false; // 已發布貼文的話要鎖

  myJourney: number = 0; //我的行程區塊大小(0是完全關起來，1是中間，2是最大)

  constructor(
    private Http: HttpClientService,
    private router: Router,
    public myJourneySizeService: MyJourneySizeService,
    public dataService: DataService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    public dateFormat: DateFormat,
    private loading: Loading
  ) { }

  ngOnInit(): void {
    this.updateJourney();
    //訂閱是否登入
    this.dataService.loginStatus$.subscribe((status) => {
      this.loginBoolean = status;
    });

    //我的行程
    this.dataService.journeyList$.subscribe((data) => {
      if (data) {
        this.journeyList = data;
      }
      this.cdr.detectChanges();
    });

    //訂閱開啟的tabId
    this.myJourneySizeService.selectedTabState$.subscribe((tab) => {
      this.selectedTab = tab;
    });

    this.myJourneySizeService.selectedSwitchToSpot$.subscribe((state) => {
      this.switchToSpot = state;
      this.cdr.detectChanges();
    });

    this.myJourneySizeService.journeyState$.subscribe((state) => {
      this.myJourney = state;
      this.cdr.detectChanges();
    });

    this.dataService.newJourney$.subscribe((data) => {
      //跳轉到spot
      if (data.journeyId != 0 && this.journeyList) {
        this.journey = data;
        this.title = data.journeyName;
        if (!this.switchToSpot) {
          this.switchToSpot = true;
        }
        this.cdr.detectChanges();
      }
    });

    this.dataService.accommodationSearchData$.subscribe((data) => {
      if (data.journeyId != 0 && this.journeyList) {
        this.journeyList.map((item) => {
          if (item.journeyId == data.journeyId) {
            this.journey = item;
          }
        });
      }
    });

    //訂閱用戶
    this.dataService.user$.subscribe((item) => {
      let user = JSON.parse(sessionStorage.getItem('user') || '{}');
      this.userName = user.userName || '我';
      this.cdr.detectChanges();
    });
  }

  //切換成spot component
  getSpotAndRoute(journeyId: number, journeyName: string) {
    this.title = journeyName;
    if (!this.journeyList) {
      return;
    }

    for (let journey of this.journeyList) {
      if (journey.journeyId == journeyId) {
        this.journey = journey;
      }
    }
    this.switchToSpot = true;
  }

  addNewJourney() {
    // 呼叫Api新增行程
    let message = '請先登入';
    if (!this.loginBoolean) {
      this.dialog.open(HintDialogComponent, { data: message });
      return;
    }
    // 打開新增行程的dialog
    this.dialog.open(CreateJourneyDialogComponent, { data: '' });
  }

  // 切換回journey列表
  SwitchComponent() {
    //有東西還沒儲存
    if (this.dataService.isEditing) {
      let dialogRef = this.dialog.open(ButtonDialogComponent, {
        data: '目前編輯尚未儲存，是否跳轉?',
        autoFocus: true,
        restoreFocus: true,
      });

      dialogRef.afterClosed().subscribe((res) => {
        //點選確定的話幫他跳轉 並清掉權限
        if (res) {
          let req = {
            userEdit: `${this.dataService.editing.journeyId},${this.dataService.editing.day}`,
          };
          this.Http.postApi(
            'http://localhost:8080/user/endUpdateUserEdit',
            req
          ).subscribe((res) => {
            let Response = res as joinResponse;
            if (Response.code == 200) {
              this.dataService.isEditing = false;

              this.dataService.finishEditing();
            }
            if (Response.code != 200) {
              let errmessage = [Response.message];
              this.dialog.open(HintDialogComponent, { data: errmessage });
            }
          });
          this.dataService.updateAccommodationSearchData({
            journeyId: 0,
            name: '',
            address: '',
          });
          this.dataService.updateNewJourney({
            journeyId: 0,
            journeyName: '',
            startDate: '',
            endDate: '',
            transportation: '',
            invitation: '',
            userMail: '',
          });
          this.selectedTab = 'tab-1';
          this.switchToSpot = false;
        } else {
        }
      });
    }
    //儲存完畢的狀態，直接跳轉
    if (!this.dataService.isEditing) {
      this.dataService.updateAccommodationSearchData({
        journeyId: 0,
        name: '',
        address: '',
      });
      this.dataService.updateNewJourney({
        journeyId: 0,
        journeyName: '',
        startDate: '',
        endDate: '',
        transportation: '',
        invitation: '',
        userMail: '',
      });
      this.selectedTab = 'tab-1';
      this.switchToSpot = false;
      this.cdr.detectChanges();
    }
  }

  selectedTab: string = 'tab-1';
  changeTab(tabId: string): void {
    this.myJourneySizeService.setSelectedTab(tabId);
  }

  //加入行程
  joinJourney(invitation: String) {
    this.invitation = '';
    const notice = '請輸入邀請碼';
    if (invitation.length == 0) {
      this.dialog.open(HintDialogComponent, { data: notice.split('\n') });
    }

    console.log(invitation);

    let req = { invitation: invitation };
    this.Http.postApi(
      'http://localhost:8080/journey/joinJourney',
      req
    ).subscribe((res) => {
      const Response = res as joinResponse;
      if (Response.code == 200) {
        this.updateJourney();
      }
      if (Response.code != 200) {
        let errmessage = [Response.message];
        this.dialog.open(HintDialogComponent, { data: errmessage });
        this.loginBoolean = false;
      }
    });
  }

  //更新行程資料
  updateJourney() {
    this.Http.getApi('http://localhost:8080/journey/getJourney').subscribe(
      (res) => {
        const journeyResponse = res as JourneyResponse;

        this.journeyList = journeyResponse.journeyList;
        if (journeyResponse.message == '請先登入帳戶') {
          this.loginBoolean = false;
        }
      }
    );
  }

  //修改行程
  reviseJourney() {
    // 接API：isPublishedPost
    // this.loading.updateLoading(true);
    this.Http.getApi(
      `http://localhost:8080/post/isPublishedPost?journeyId=${this.journey.journeyId}`
    ).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          this.isPublished = res.message === 'true';
          if (this.isPublished) {
            // true是已發布
            this.dialog.open(HintDialogComponent, {
              data: ['發布過貼文，就不能更新行程'],
            });
            return;
          }

          //打開新增行程的dialog
          let dialogRef = this.dialog.open(CreateJourneyDialogComponent, {
            data: this.journey,
          });
          dialogRef.afterClosed().subscribe((res) => {
            if (res) {
              for (let journey of this.journeyList || []) {
                if (this.journey.journeyId == journey.journeyId) {
                  this.journey = journey;
                }
              }
              this.title = this.journey.journeyName;
              this.SpotComponent?.getSpotAndRoute();
              this.cdr.detectChanges();
            }
          });
        }
        // this.loading.updateLoading(false);
      },
    });
  }

  //導到發佈貼文頁面
  goCreatePost(journeyId: number) {
    // 塞值進 service
    this.dataService.postContent = {
      userMail: '',
      postId: 0,
      journeyId: journeyId,
    };
    console.log(this.dataService.postContent.journeyId);
    // 塞值進 session
    sessionStorage.setItem(
      'postContent',
      JSON.stringify(this.dataService.postContent)
    );
    console.log(sessionStorage.getItem('postContent'));

    // 接API：isPublishedPost
    this.loading.updateLoading(true);

    this.Http.getApi(
      `http://localhost:8080/post/isPublishedPost?journeyId=${journeyId}`
    ).subscribe({
      next: (res: any) => {
        // console.log(res);
        if (res.code === 200) {
          console.log(res);
          console.log(res.message);
          this.isPublished = res.message === 'true';
          if (this.isPublished) {
            // true是已發布
            this.dialog.open(HintDialogComponent, {
              data: ['已發布過貼文'],
            });
          } else {
            // 切換路由到發佈貼文頁
            this.router.navigate(['/post_create']);
          }
        }
        this.loading.updateLoading(false);
      },
      error: (err: any) => {
        const errorData = err.error;
        let errorMessages: string[] = [];
        if (typeof errorData === 'object') {
          for (const [field, message] of Object.entries(errorData)) {
            errorMessages.push(`${message}`);
          }
        } else {
          errorMessages.push('操作失敗，請稍後再試');
        }
        this.dialog.open(HintDialogComponent, {
          data: errorMessages,
        });
      },
    });
  }

  //匯出PDF
  exportPDF() {
    if (this.dataService.isEditing) {
      this.dialog.open(HintDialogComponent, {
        data: ['編輯行程中無法匯出PDF'],
        autoFocus: true,
        restoreFocus: true,
      });
      return;
    }
    this.dialog.open(PdfDialogComponent, {
      data: this.journey,
    });
  }

  closeMyJourney() {
    this.myJourneySizeService.setJourneyState(0);
    this.cdr.detectChanges();
  }
}
