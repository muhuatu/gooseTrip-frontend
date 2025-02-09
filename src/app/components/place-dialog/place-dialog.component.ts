import { DataService } from './../../service/data.service';
import { ChangeDetectorRef, Component, Inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { GoogleMapService } from '../../service/googlemap.service';
import { HttpClientService } from '../../http-serve/http-client.service';
import { HintDialogComponent } from '../hint-dialog/hint-dialog.component';
import { ButtonDialogComponent } from '../button-dialog/button-dialog.component';
import { editListReq } from '../../interface/EditListReq';
import { SelectJourneyDialogComponent } from '../select-journey-dialog/select-journey-dialog.component';
import { MyJourneySizeService } from '../../service/my-journey-size.service';
import { CreateJourneyDialogComponent } from '../../journey/create-journey-dialog/create-journey-dialog.component';
import { SelectAccommodationJourneyComponent } from '../select-accommodation-journey/select-accommodation-journey.component';
import { AddPlaceDialogComponent } from '../add-place-dialog/add-place-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-place-dialog',
  imports: [FormsModule, MatExpansionModule, CommonModule, MatTooltipModule],
  templateUrl: './place-dialog.component.html',
  styleUrl: './place-dialog.component.scss',
})
export class PlaceDialogComponent {
  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<PlaceDialogComponent>, //用來關掉dialog
    public googleMapService: GoogleMapService,
    private cdr: ChangeDetectorRef,
    private http: HttpClientService,
    public dialog: MatDialog,
    public dataService: DataService,
    public myJourneySizeService: MyJourneySizeService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}
  //data代表從其他父組件傳進來的資料

  place!: google.maps.places.PlaceResult;
  starCount!: number;
  choosephoto: string = '';
  Math = Math;
  isFavorite = false;
  isLogin: boolean = false;

  ngOnInit(): void {
    this.place = this.data;
    // console.log(this.place);

    this.checkFavorite();
    // if (this.place && this.place?.place_id) {
    //   sessionStorage.setItem(
    //     'dialogPlaceId',
    //     JSON.stringify(this.place?.place_id)
    //   );
    // }

    if (this.data.photos) {
      this.choosephoto = this.data.photos[0].getUrl({
        maxWidth: 400,
        maxHeight: 250,
      });
    }

    if (this.place.rating) {
      this.starCount = Math.round(this.place.rating || 0);
    }
  }

  //遇到句號跟驚嘆號要換行
  ngAfterViewInit() {
    const textElements = document.querySelectorAll('.text');
    textElements.forEach((textElement) => {
      if (textElement.innerHTML) {
        textElement.innerHTML = textElement.innerHTML.replace(/\。/g, '。<br>');
        textElement.innerHTML = textElement.innerHTML.replace(/\！/g, '！<br>');
      }
    });
  }

  // 確定是不是我的最愛
  checkFavorite() {
    let req = {
      placeId: this.place.place_id,
    };
    this.http
      .postApi('http://localhost:8080/user/is_favorite', req)
      .subscribe((res: any) => {
        if (res.code == 200) {
          this.isFavorite = res.favorite;
          // this.cdr.detectChanges(); // 更新畫面
        } else {
          this.dialog.open(HintDialogComponent, {
            data: [res.message],
          });
        }
      });
  }

  bigphoto(url: string) {
    this.choosephoto = url;
  }

  //下拉
  readonly panelOpenState = signal(false);

  //按鈕的部分
  //關掉
  close(): void {
    sessionStorage.removeItem('dialogPlaceId');
    let favorite = '';
    if (this.isFavorite == true) {
      favorite = 'isFavorite';
    }
    this.dialogRef.close(favorite);
  }

  //分享到聊天室
  shareToChat() {
    this.dialogRef.close('chat');
  }

  //加進行程
  editList: editListReq[] = [];
  addToJourney() {
    this.dataService.loginStatus$.subscribe((status) => {
      this.isLogin = status;
    });
    if (sessionStorage.getItem('isLogin') == 'true') {
      this.isLogin = true;
    }
    if (this.isLogin == false) {
      this.pleaseLogin('登入後才能加入我的行程，是否前往登入?');
    } else {
      this.http
        .getApi('http://localhost:8080/user/check_journey')
        .subscribe((res: any) => {
          console.log(res);

          if (res.code == 200) {
            if (res.editing == true) {
              //代表這位使用者正在編輯中
              if (this.dataService.isDraggable) {
                //正在排序中，所以不能加進地點
                this.dialog.open(HintDialogComponent, {
                  data: ['正在編輯地點排序中，請結束後再加入新地點'],
                });
              } else {
                //使用者正在編輯中，應該直接選要加進現在在編輯中的那天的哪裡
                //把place存起來
                this.dataService.addPlace = this.place;
                //打開新增地點的dialog
                this.dialog.open(AddPlaceDialogComponent, { data: '', autoFocus: false});
              }
            } else {
              //沒有行程的情況
              if (res.editList == null) {
                let dialogRef = this.dialog.open(ButtonDialogComponent, {
                  data: '目前沒有行程，是否要建立新行程?',
                  autoFocus: true,
                  restoreFocus: true,
                });

                dialogRef.afterClosed().subscribe((res) => {
                  //關閉後
                  if (res) {
                    //打開新增行程的dialog
                    this.dialog.open(CreateJourneyDialogComponent, {
                      data: '',
                    });
                  }
                });
              } else {
                //代表這個使用者沒有在編輯
                //把place存起來
                this.dataService.addPlace = this.place;
                this.dataService.editList = res.editList;

                //傳給加進哪個行程的dialog
                this.dialog.open(SelectJourneyDialogComponent, {
                  data: this.dataService.editList,
                });
              }
            }
          } else {
            if ((res.message = '請先登入帳戶')) {
              this.pleaseLogin('登入後才能加入我的行程，是否前往登入?');
            } else {
              this.dialog.open(HintDialogComponent, {
                data: [res.message],
              });
            }
          }
        });
    }
  }

  //住宿搜尋
  goLodging() {
    this.dataService.loginStatus$.subscribe((status) => {
      this.isLogin = status;
    });
    if (this.isLogin == false) {
      this.pleaseLogin('登入後才能住宿搜尋，是否前往登入?');
    } else if (this.dataService.editing.journeyId != 0) {
      // 如果正在編輯行程
      this.dataService.updateAccommodationSearchData({
        journeyId: this.dataService.editing.journeyId,
        name: this.place.name ? this.place.name : '沒有名字',
        address: this.place.formatted_address
          ? this.place.formatted_address
          : '沒有地址',
      });
      this.myJourneySizeService.setSelectedTab('tab-2'); //開到住宿搜尋
      this.myJourneySizeService.setJourneyState(1); // 打開行程版面
    } else {
      //接後端api確認所有行程
      this.http
        .getApi('http://localhost:8080/journey/getJourney')
        .subscribe((res: any) => {
          if (res.code == 200) {
            //沒有行程的情況
            if (res.journeyList == null || res.journeyList.length == 0) {
              let dialogRef = this.dialog.open(ButtonDialogComponent, {
                data: '目前沒有行程，是否要建立新行程?',
                autoFocus: true,
                restoreFocus: true,
              });
              dialogRef.afterClosed().subscribe((res) => {
                //關閉後
                if (res) {
                  this.dataService.updateAccommodationSearchData({
                    journeyId: res.journeyId,
                    name: this.place.name ? this.place.name : '沒有名字',
                    address: this.place.formatted_address
                      ? this.place.formatted_address
                      : '沒有地址',
                  });
                  //打開新增行程的dialog
                  this.dialog.open(CreateJourneyDialogComponent, { data: '' });
                }
              });
            } else {
              //傳給選擇哪個行程的dialog
              this.dataService.updateAccommodationSearchData({
                journeyId: 0,
                name: this.place.name ? this.place.name : '沒有名字',
                address: this.place.formatted_address
                  ? this.place.formatted_address
                  : '沒有地址',
              });
              this.dialog.open(SelectAccommodationJourneyComponent, {
                data: res.journeyList,
              });
            }
          } else {
            if ((res.message = '請先登入帳戶')) {
              this.pleaseLogin('登入後才能住宿搜尋，是否前往登入?');
            } else {
              this.dialog.open(HintDialogComponent, {
                data: res.message,
              });
            }
          }
        });
    }
  }

  //加進我的最愛
  addToFavorites() {
    this.dataService.loginStatus$.subscribe((status) => {
      this.isLogin = status;
    });
    if (this.isLogin == false) {
      this.pleaseLogin('登入後才能加入我的最愛，是否前往登入?');
    } else {
      let req = {
        placeId: this.place.place_id,
      };
      this.http
        .postApi('http://localhost:8080/user/update_favorite', req)
        .subscribe((res: any) => {
          if (res.code == 200) {
            this.isFavorite = !this.isFavorite;
            this.googleMapService.setFavoriteStatus(
              this.place.place_id!,
              this.isFavorite
            );
            this.cdr.detectChanges(); // 更新畫面
          } else {
            if (res.message == '請先登入帳戶') {
              this.pleaseLogin('登入後才能加入我的最愛，是否前往登入?');
            } else {
              this.dialog.open(HintDialogComponent, {
                data: [res.message],
              });
            }
          }
        });
    }
  }

  //請先登入dialog
  pleaseLogin(data: string) {
    let dialogRef = this.dialog.open(ButtonDialogComponent, {
      data: data,
      autoFocus: true,
      restoreFocus: true,
    });

    dialogRef.afterClosed().subscribe((res) => {
      //關閉後
      if (res) {
        this.myJourneySizeService.setSwitchToSpot(false);
        this.myJourneySizeService.setJourneyState(0);
        this.dialogRef.close('close');
        this.dataService.lastRouter = this.router.url;
        sessionStorage.setItem(
          'searchKeyword',
          JSON.stringify(this.dataService.keyword)
        );
        this.router.navigate(['/login']);
      }
    });
  }
}
