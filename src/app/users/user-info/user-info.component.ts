import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DataService } from '../../service/data.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientService } from '../../http-serve/http-client.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { HintDialogComponent } from '../../components/hint-dialog/hint-dialog.component';
import { PostList } from '../../interface/postInter';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Loading } from '../../service/loading.service';
import { Observable } from 'rxjs';
import { ButtonDialogComponent } from '../../components/button-dialog/button-dialog.component';
import { ImgFormatService } from '../../service/imgFormat.service';
import { MyJourneySizeService } from '../../service/my-journey-size.service';

@Component({
  selector: 'app-user-info',
  imports: [CommonModule, MatTabsModule, MatIconModule, MatTooltipModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss',
})
export class UserInfoComponent {

  constructor(
    private router: Router,
    public dialog: MatDialog,
    public dataService: DataService,
    private fb: FormBuilder,
    private http: HttpClientService,
    private cdr: ChangeDetectorRef,
    private loading: Loading,
    public imgFormat: ImgFormatService,
    public myJourneySizeService: MyJourneySizeService,
  ) { }

  form!: FormGroup;
  isLogin: boolean = false;

  userMail: string = '';
  userName: string = '';
  userPhone: string = '';
  userImage: string = ''; // 頭貼URL

  keyword: string = '';
  myPosts: any = []; // 我的貼文
  myFavoritePosts: any = []; // 收藏貼文
  currentTab: 'journey' | 'posts' = 'journey'; // 預設顯示的 Tab
  menuVisible: boolean = false; // 三個點的顯示狀態
  menuTop = 0;
  menuLeft = 0;
  selectedPost: any = null;  // 儲存當前選中的貼文

  ngOnInit(): void {
    // 從 Session 導入會員資料
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    if (user) {
      this.userMail = user.userMail;
      this.userName = user.userName;
      this.userPhone = user.userPhone;
      this.userImage = user.userImage || 'assets/avatar/Null_Goose.jpeg';
    }

    // 我的貼文與收藏
    this.getFavouritePost();
    this.getPostByUserMail();
  }

  //********************** 會員資料 **********************//
  toDelete(): void {
    this.dataService.loginStatus$.subscribe((status) => {
      this.isLogin = status;
    });
    this.router.navigate(['/delete']);
  }

  toUpdate(): void {
    this.dataService.loginStatus$.subscribe((status) => {
      this.isLogin = status;
    });
    this.router.navigate(['/update']);
  }

  //********************** 貼文區 **********************//

  // 沒有貼文的情況
  toJourney(): void {
    // 詢問是否跳轉到首頁
    let dialogRef = this.dialog.open(ButtonDialogComponent, {
      data: '您的莊園仍為頹圮之地，是否跳轉至「我的行程」進行貼文發佈？',
      autoFocus: true,
      restoreFocus: true,
    });
    // 確定的話會回首頁並打開行程版面
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.router.navigate(['/homepage']).then(() => {
          this.myJourneySizeService.setJourneyState(1); // 打開行程版面
        });
      }
    });
  }

  toPostHome(): void {
    this.router.navigate(['/post_home']);
  }


  // ---------------------有貼文的情況------------------------------
  // 彈出選單(編輯或刪除貼文的功能)

  toggleMenu(event: MouseEvent, post: any): void {
    setTimeout(() => {
      this.selectedPost = post;  // 記錄當前選中的貼文資料
      this.menuVisible = !this.menuVisible;  // 切換選單顯示
      const target = event.target as HTMLElement;
      const rect = target.getBoundingClientRect();

      // 設置選單位置
      this.menuTop = rect.top + window.scrollY - 13; // 距離圖標
      this.menuLeft = rect.left + window.scrollX + 38;
    });
  }

  hideMenu(): void {
    this.menuVisible = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-container') && !target.closest('.menu-popup')) {
      this.hideMenu(); // 點擊外部隱藏選單
    }
  }

  // 點擊貼文到貼文內容頁
  postContent(userMail: string, postId: number, journeyId: number) {
    // 把資料丟到 service
    this.dataService.postContent = {
      userMail: userMail,
      postId: postId,
      journeyId: journeyId
    }
    // 把資料丟到 sessionStorage
    sessionStorage.setItem('postContent', JSON.stringify(this.dataService.postContent));
    // console.log(this.dataService.postContent);
    // console.log(sessionStorage.getItem('postContent'));

    this.router.navigate(['/post_comment']);
  }

  // 用使用者信箱判斷是否為我的貼文
  userPost(mail: string) {
    console.log(mail);
    // 從 session 獲取使用者信箱
    if (mail == this.userMail) {
      // 導到我的貼文
      this.router.navigate(['/user-info']);
    }
    else {
      // 導到其他使用者的貼文列表頁
      this.dataService.userMail = mail;
      sessionStorage.setItem('postContent', JSON.stringify(this.dataService.userMail));
      this.router.navigate(['/user_post']);
    }
  }

  // 連到編輯頁
  editPost() {
    const data = {
      userMail: this.selectedPost.userMail,
      postId: this.selectedPost.postId,
      journeyId: this.selectedPost.journeyId,
    }
    sessionStorage.setItem('postContent', JSON.stringify(data));
    console.log('sessionStorage:', sessionStorage.getItem('postContent'));

    const dialogRef = this.dialog.open(ButtonDialogComponent, {
      data:
        '即將進入編輯頁面，\n需點擊更新貼文才能儲存貼文內容。\n是否進入編輯頁面？',
      autoFocus: true,
      restoreFocus: true,
    });

    dialogRef.afterClosed().subscribe((result) => {

      if (result === true) {
        this.http.getApi('http://localhost:8080/post/post_unpublished?postId=' + data.postId).subscribe({
          next: (res: any) => {
            // add dialog for confirm to edit page
            console.log(res);
            this.router.navigate(['/post_edit']);
          }
        })
      }
    });
    // this.router.navigate(['/post_edit']);
  }

  // 接API : deletePost 刪除貼文
  deletePost(postId: number): void {

    const dialogRef = this.dialog.open(ButtonDialogComponent, {
      data:
        '您確定要刪除此貼文嗎？\n刪除後將無法復原。',
      autoFocus: true,
      restoreFocus: true,
    });

    dialogRef.afterClosed().subscribe((result) => {

      if (result === true) {
        const req = {
          "postIdList": [`${postId}`],
        }

        this.loading.updateLoading(true);

        this.http.postApi('http://localhost:8080/post/delete', req).subscribe({
          next: (res: any) => {
            if (res.code === 200) {
              this.loading.updateLoading(false);
              this.dialog.open(HintDialogComponent, {
                data: ['貼文已刪除'],
              });
              this.getPostByUserMail();
              // this.cdr.detectChanges(); // 更新畫面沒用
            } else {
              this.dialog.open(HintDialogComponent, {
                data: res.message.split('\n'),
              });
            }
          },
          error: () => {
            this.loading.updateLoading(false);
            this.dialog.open(HintDialogComponent, {
              data: ['連線錯誤或伺服器無回應，請稍後再試'],
            });
          },
        });
      }
    });
  }

  // 查詢收藏的貼文
  getFavouritePost() {
    // keyword 為空字串
    const url = `http://localhost:8080/post/getFavoritePost?keyword=${this.keyword}`;
    this.http.getApi(url).subscribe((res: any) => {
      console.log(res);
      if (res.code === 200) {
        this.loading.updateLoading(false);
        // 初次載入時設定總頁數及資料源
        this.updatePagedPosts();
        // 把API回傳結果塞回假資料容器
        this.myFavoritePosts = res.postList;
        console.log(this.myFavoritePosts);
      } else {
        // this.dialog.open(HintDialogComponent, {
        //   data: [res.message,] // 會一直跳出"此貼文不存在"
        // });
      }
    })
  }


  /************************圖片增加前綴方法*************************** */
  // 放在 ImgFormat.service 中

  // 查詢某使用者所有貼文(這裡要查自己)
  getPostByUserMail() {

    this.loading.updateLoading(true);

    const url = `http://localhost:8080/post/get_post?userMail=${encodeURIComponent(this.userMail.toString())}`;
    this.http.postApi(url, {}).subscribe((res: any) => {
      if (res.code === 200) {
        // console.log(res);
        this.loading.updateLoading(false);
        this.myPosts = res.postList;
        console.log(this.myPosts);

      } else {
        this.loading.updateLoading(false);
        // this.dialog.open(HintDialogComponent, {
        //   data: [res.message,] // 會一直跳出"此貼文不存在"
        // });
        // this.http.getApi('http://localhost:8080/user/logout')
        //   .subscribe((res: any) => {
        //     if (res.code == 200) {

        //       // 登出
        //       this.dataService.setLoginStatus(false);
        //       sessionStorage.removeItem('isLogin');
        //       sessionStorage.removeItem('user');
        //       this.dataService.updateUser('');
        //       this.cdr.detectChanges();
        //       this.router.navigate(['/'])
        //     }
        //   })
      }
    })
  }
  /********************** 分頁區 **********************/

  // 用來控制分頁的 MatPaginator
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  pagedPosts = new Array<PostList>;  // 當前頁顯示的貼文資料
  pageSize = 8;  // 每頁顯示的貼文數量
  pageIndex = 0;  // 當前頁碼（從 0 開始）

  // 處理分頁邏輯
  updatePagedPosts(): void {
    const startIndex = this.pageIndex * this.pageSize;
    this.pagedPosts = this.myFavoritePosts.slice(startIndex, startIndex + this.pageSize);
  }

  // 分頁控制變動時的回調
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;  // 更新當前頁碼
    this.pageSize = event.pageSize;    // 更新每頁顯示數量
    this.updatePagedPosts();           // 更新當前頁的貼文
  }

}
