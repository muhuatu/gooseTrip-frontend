import { ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { JourneyResponse, spot } from './../../interface/JourneyInter';
import { Component, ViewEncapsulation, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { DataService } from '../../service/data.service';
import { commentList, PostDetail } from '../../interface/postInter';
import { HttpClientService } from '../../http-serve/http-client.service';
import { CommonModule } from '@angular/common';
import { HintDialogComponent } from '../../components/hint-dialog/hint-dialog.component';
import { Location } from '@angular/common';
import { Loading } from '../../service/loading.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { ButtonDialogComponent } from '../../components/button-dialog/button-dialog.component';
import { MyJourneySizeService } from '../../service/my-journey-size.service';
import { ImgFormatService } from '../../service/imgFormat.service';
import { DateFormat } from '../../service/dateFornat.service';

declare const google: any;  // 用來引用 Google Maps 物件
@Component({
  selector: 'app-post-comment',
  imports: [MatTabsModule, MatIconModule, MatExpansionModule, FormsModule, CommonModule, MatTooltipModule],

  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './post-comment.component.html',
  styleUrl: './post-comment.component.scss',
})
export class PostCommentComponent {
  readonly panelOpenState = signal(false);
  constructor(
    private router: Router,
    public dialog: MatDialog,
    public dataService: DataService,
    private http: HttpClientService,
    private cdr: ChangeDetectorRef,
    private location: Location,
    private loading: Loading,
    public myJourneySizeService: MyJourneySizeService,
    public imgFormat: ImgFormatService,
    public dateFormat: DateFormat,
  ) { }

  @ViewChild('map', { static: true }) mapElement!: ElementRef;

  // googleMap API要塞資料的容器
  map!: google.maps.Map;
  placesService: any; // 用來處理 Place API 查詢
  markerList: any[] = []; // 用來儲存所有的 spotName

  // 按讚、收藏、複製 按鈕開關
  thumbupTime: boolean = false;
  favoriteTime: boolean = false;
  copyTime: boolean = false;

  ngOnInit(): void {
    // 從 Session 導入會員資料
    // 要命名為 sessionUser 不然會和貼文作者的名字重複
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.sessionUserName = user.userName;
    this.sessionUserMail = user.userMail;
    this.sessionUserImage = user.userImage;
    //console.log(user);

    const postContent = JSON.parse(sessionStorage.getItem('postContent') || '{}');
    this.journeyId = postContent.journeyId;
    this.postId = postContent.postId;

    // 渲染整個貼文內容
    this.getPost();

    // 回上一頁要清session
    this.setupEventListeners();
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
  userMail!: string;
  userImage!: string;
  postTime!: string;
  postContent!: string;
  isTruncated: boolean = true; // 初始設置為超過50字
  tabs: any = [];
  thumbStatus!: boolean | null; // 使用者對此貼文的按讚狀態

  // 按讚與收藏
  thumbUps!: number;
  userReaction: 'thumbUp' | null = null; // 只保留記錄按讚的狀態
  isFavorited: boolean = false;

  // 評論區
  comments: commentList[] = [];
  newComment: string = ''; // 新評論預設為空
  newReply: string = ''; // 新評論的留言預設為空
  activeReplyId: number | null = null; // 目前正在留言的區塊
  replyStatus: boolean = false;
  editComments: string = '';

  /********************** 地圖區 **********************/

  initMap() {
    const defaultlocation = {
      lat: 25.0374865,
      lng: 121.5647688
    };
    // console.log(this.tabs);
    // console.log(document.getElementById('map'));
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: defaultlocation,
      zoom: 16,
      mapTypeId: 'terrain'
    });
    // 初始化 Places Service
    this.placesService = new google.maps.places.PlacesService(this.map);
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
          // console.log('找到的地點:', place);

          // 從查詢結果中提取經緯度
          const location = place.geometry.location;
          const latitude = location.lat();
          const longitude = location.lng();
          // console.log('經緯度:', latitude, longitude);

          // 根據獲得的經緯度設置地圖的標記
          const marker = new google.maps.Marker({
            position: location,
            map: this.map,
            title: place.name
          });
          marker.addListener('click', () => {
            this.scrollView(spotName);
          })
          this.map.setCenter(location);
        } else {
          console.error('搜尋失敗:', status);
        }
      });
    });
  }

  scrollView(spotName: string) {
    const container = document.getElementById(spotName);
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    }
  }

  onTabChanged(events: any) {
    this.markerList = [];
    for (let spot of this.tabs[events.index].spots) {
      this.markerList.push(spot.spotName);
    }
    this.initMap();
    this.setMarkers();
  }

  /********************** API區 **********************/

  // 接API : getPost() 取得特定貼文內容 => OK
  getPost() {

    const req = {
      "journeyId": this.journeyId,
      "postId": this.postId
    }

    this.loading.updateLoading(true);

    // 1. 向後端請求貼文內容
    this.http.postApi('http://localhost:8080/post/getPost', req).subscribe({
      next: (res: any) => {
        if (res.code === 200) {

          // console.log('更新的評論', res.commentList);

          // 2. 將所有 spotName 存入 markerList 陣列
          this.markerList = res.postDetail.map((detail: any) => detail.spotName);
          // console.log(this.markerList);

          // 貼文內容
          this.journeyName = res.journeyName;
          this.userName = res.userName;
          this.userMail = res.userMail;
          this.userImage = res.userImage;
          this.postTime = res.postTime;
          this.postContent = res.postContent;
          this.isFavorited = res.favorite; // 判斷此貼文使用者是否有收藏(愛心要變色)
          this.thumbUps = res.thumbUp;
          this.thumbStatus = res.thumbStatus;

          // console.log('讚數', this.thumbUps);

          // 按讚狀態
          if (this.thumbStatus === true) {
            this.userReaction = 'thumbUp';
          } else {
            this.userReaction = null;
          }

          // 每天的景點
          this.tabs = [];
          // 遍歷 postDetail (景點資訊)
          res.postDetail.forEach((detail: PostDetail) => {
            // 確認第X天是否已在tabs中
            const existedDay = this.tabs.find((tab: any) => tab.day === detail.day);

            // 景點資訊們
            const spotInfo = {
              spotName: detail.spotName,
              spotNote: detail.spotNote,
              spotImage: detail.spotImage,
              duration: detail.duration,
              placeId: detail.placeId,
            }

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

          // console.log(this.tabs);

          // 評論區
          this.comments = res.commentList.map((comment: commentList) => ({
            serialNumber: comment.serialNumber,
            userMail: comment.userMail,
            userName: comment.userName,
            userImage: comment.userImage || 'assets/avatar/Null_Goose.jpeg', // 沒有圖片時用鵝鵝
            postId: comment.postId,
            commentContent: comment.commentContent,
            // 轉成台灣時間
            commentTime: new Date(comment.commentTime.replace("T", " ").split(".")[0] + " UTC")
              .toLocaleString('en-US', {
                timeZone: 'Asia/Taipei',
                hour12: false, // 強制使用 24 小時制
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })
              .replace(",", "") // 移除逗號
              .replace(/\//g, "-") // 將斜線替換為連字符
              .replace(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/, '$3-$1-$2 $4:$5:$6'),
            commentId: comment.commentId,
            replyCommentId: comment.replyCommentId,
            commentThumbUp: comment.thumbUp,
            commentThumbDown: comment.thumbDown,
          }));
          this.cdr.markForCheck();
          console.log(this.comments);
        } else {
          this.dialog.open(HintDialogComponent, {
            data: res.message.split('\n'),
          });
        }
        this.loading.updateLoading(false);
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

  // 接API : updateFavoritePost() 新增或移除收藏貼文 => OK
  toggleFavorite(): void {

    const req = {
      "postId": this.postId
    };

    this.loading.updateLoading(true);

    this.http.postApi('http://localhost:8080/post/updateFavoritePost', req).subscribe({
      next: (res: any) => {
        //console.log(res);
        if (res.code === 200) {
          this.loading.updateLoading(false);
          this.isFavorited = !this.isFavorited; // 切換收藏狀態
          this.cdr.detectChanges(); // 更新畫面
          const message = this.isFavorited ? '已收藏此貼文' : '已取消收藏貼文'
          this.dialog.open(HintDialogComponent, {
            data: [message],
          });
          //關閉按鈕
          this.favoriteTime = true;
          // 5秒後開啟
          setTimeout(() => {
            this.favoriteTime = false;
          }, 5000);

        } else {
          this.dialog.open(HintDialogComponent, {
            data: res.message.split('\n'),
          });
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

  // 接API : copyJourney => 複製行程
  copyJourney() {

    const dialogRef = this.dialog.open(ButtonDialogComponent, {
      data:
        '請確認是否複製行程？'
      ,
      autoFocus: true,
      restoreFocus: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const url = `http://localhost:8080/journey/copy_journey?journeyId=${this.journeyId}`;

        this.loading.updateLoading(true);

        this.http.postApi(url, {}).subscribe({
          next: (res: any) => {
            // console.log(res);
            if (res.code === 200) {
              this.loading.updateLoading(false);
              // 更新我的行程列表
              this.http.getApi('http://localhost:8080/journey/getJourney').subscribe(
                (res) => {
                  const journeyResponse = res as JourneyResponse;
                  this.dataService.updateJourneyList(journeyResponse.journeyList);
                }
              );
              // 詢問是否跳轉到首頁
              let dialogRef = this.dialog.open(ButtonDialogComponent, {
                data: '複製行程成功！是否跳轉至首頁確認「我的行程」？',
                autoFocus: true,
                restoreFocus: true,
              });
              // 確定的話會回首頁並打開行程版面
              dialogRef.afterClosed().subscribe((result) => {
                if (result === true) {
                  this.router.navigate(['/homepage']).then(() => {
                    this.myJourneySizeService.setJourneyState(1); // 打開行程版面
                  });
                } else {
                  //關閉按鈕
                  this.copyTime = true;
                  // 5秒後開啟
                  setTimeout(() => {
                    this.copyTime = false;
                  }, 5000);
                }
              })
            } else {
              this.dialog.open(HintDialogComponent, {
                data: [res.message]
              });
            }
          },
          error: (err) => {
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
    });
  }

  // 接API : thumb_act => 按讚
  thumbAct(): void {

    // 如果使用者已選相同反應則當作沒做過
    const cancelReaction = this.userReaction === 'thumbUp';
    const previousReaction = this.userReaction; // 記錄當前反應
    const previousThumbUps = this.thumbUps; // 記錄按讚數

    // 判斷
    this.userReaction = cancelReaction ? null : 'thumbUp';
    this.thumbUps += cancelReaction ? -1 : 1; // 更新按讚數

    const req = {
      postId: this.postId,
      commentSn: 0, // 對貼文按讚的話，評論SN都是0
      thumb: cancelReaction ? null : true,
    }

    this.http.postApi('http://localhost:8080/interact/thumb_act', req).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          this.thumbUps = previousThumbUps + (cancelReaction ? -1 : 1); // 確認 API 成功後更新畫面
          // console.log(this.thumbUps);
          this.cdr.detectChanges();

          //關閉按鈕
          this.thumbupTime = true;
          // 5秒後開啟
          setTimeout(() => {
            this.thumbupTime = false;
          }, 5000);

        } else {
          // 恢復原始狀態
          this.userReaction = previousReaction;
          this.thumbUps = previousThumbUps;
          this.dialog.open(HintDialogComponent, {
            data: res.message.split('\n'),
          });
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.userReaction = previousReaction;
        this.thumbUps = previousThumbUps;
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
        this.cdr.detectChanges(); // 更新畫面
      },
    });

  }

  // 接API : replyPost => 回覆貼文(父)
  replyPost(): void {
    console.log("CCC");


    if (this.newComment.trim()) {
      const req = {
        postId: this.postId,
        replyCommentId: 0, // 對貼文的評論 replyCommentId 是 0
        commentContent: this.newComment,
        commentTime: new Date().toISOString().split('Z')[0], // 後端是 LocalDateTime
      };

      this.loading.updateLoading(true);

      this.http.postApi('http://localhost:8080/comment/replyPost', req).subscribe({
        next: (res: any) => {
          if (res.code === 200) {
            this.loading.updateLoading(false);
            // 將新留言加到留言列表中
            const newComment = {
              ...req,
              commentTime: new Date(new Date().toISOString().replace("T", " ").split(".")[0] + " UTC").toLocaleString('en-US', { timeZone: 'Asia/Taipei', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(",", "").replace(/\//g, "-").replace(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/, '$3-$1-$2 $4:$5:$6'),
              commentId: res.commentId, // 從 res 拿
              userName: this.sessionUserName,
              userImage: this.sessionUserImage,
              userMail: this.sessionUserMail,
              thumbUp: 0,
              thumbDown: 0,
              serialNumber: res.serialNumber
            };
            this.comments.push(newComment);
            console.log(this.comments);

            this.newComment = ''; // 清空輸入框
            this.cdr.detectChanges(); // 更新畫面
          } else {
            this.dialog.open(HintDialogComponent, {
              data: res.message.split('\n'),
            });
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
  }

  // 接API : replyPost => 回覆評論(子)
  replyComment(commentId: number) {
    console.log("AA");


    this.activeReplyId = commentId;

    if (this.newReply.trim()) {
      const req = {
        postId: this.postId,
        replyCommentId: commentId, // 針對評論的留言會是 comment_id
        commentContent: this.newReply,
        commentTime: new Date().toISOString().split('Z')[0], // 後端是 LocalDateTime
      };

      // console.log(req);

      this.loading.updateLoading(true);

      this.http.postApi('http://localhost:8080/comment/replyPost', req).subscribe({
        next: (res: any) => {
          // console.log(res);

          if (res.code === 200) {
            // 將新留言加到留言列表中
            const newReply = {
              ...req,
              commentTime: new Date(new Date().toISOString().replace("T", " ").split(".")[0] + " UTC").toLocaleString('en-US', { timeZone: 'Asia/Taipei', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(",", "").replace(/\//g, "-").replace(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/, '$3-$1-$2 $4:$5:$6'),
              commentId: res.commentId, // 從 res 拿
              userName: this.sessionUserName,
              userImage: this.sessionUserImage,
              userMail: this.sessionUserMail,
              thumbUp: 0,
              thumbDown: 0,
              serialNumber: res.serialNumber
            };
            this.comments.push(newReply);
            console.log(this.comments);

            this.newReply = ''; // 清空輸入框
            this.activeReplyId = null;
            this.replyStatus = false; // 回覆完就要變回來讓主評論框顯示
            this.cdr.detectChanges(); // 更新畫面
          } else {
            this.dialog.open(HintDialogComponent, {
              data: res.message.split('\n'),
            });
          }
          this.loading.updateLoading(false);
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
  }

  // 接API : deleteComment => 刪除評論
  deleteComment(postId: number, commentId: number) {

    const dialogRef = this.dialog.open(ButtonDialogComponent, {
      data:
        '請確認是否刪除評論？'
      ,
      autoFocus: true,
      restoreFocus: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const req = {
          postId: postId,
          commentId: commentId,
        };

        this.loading.updateLoading(true);

        this.http.postApi('http://localhost:8080/comment/deleteComment', req).subscribe({
          next: (res: any) => {
            this.loading.updateLoading(false);
            if (res.code === 200) {
              this.getPost();
              // this.cdr.markForCheck();
              this.dialog.open(HintDialogComponent, {
                data: ['評論已刪除'],
              });
            } else {
              this.dialog.open(HintDialogComponent, {
                data: res.message.split('\n'),
              });
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


  // 接API : updateComment => 編輯評論
  editComment(serialNumber: number) {
  console.log("BBB");

    const today = this.dateFormat.timeFormat(new Date());
    // console.log(today);

    const req = {
      sn: serialNumber,
      commentDate: today.split(' ')[0],
      commentTime: today.split(' ')[1], // 前端把日期和時間分開給，後端串起來存 DB
      commentContent: this.editComments,
    }
    console.log(req);

    this.loading.updateLoading(true);

    this.http.postApi('http://localhost:8080/comment/update_comment', req).subscribe({
      next: (res: any) => {
        console.log(res);

        this.loading.updateLoading(false);

        if (res.code === 200) {
          this.editComments = '';
          this.replyStatus = false; // 回覆完就要變回來讓主評論框顯示
          this.activeReplyId = null;
          this.cdr.detectChanges(); // 更新畫面
          this.getPost();
        } else {
          this.dialog.open(HintDialogComponent, {
            data: res.message.split('\n'),
          });
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
    })
  }


  /********************** 方法區 **********************/

  // 關閉評論框
  closeCommentTextArea() {
    this.replyStatus = false; // 回覆完就要變回來讓主評論框顯示
    this.activeReplyId = null;
    this.cdr.detectChanges(); // 更新畫面
  }

  // 點擊編輯按鈕將評論內容顯示在輸入框
  getComment(serialNumber: number) {

    // console.log(serialNumber);

    this.flag = 1;
    for (let i = 0; i < this.comments.length; i++) {
      if (this.comments[i].serialNumber === serialNumber) {
        this.activeReplyId = this.comments[i].commentId;
        this.replyStatus = this.activeReplyId != null;
        this.editComments = this.comments[i].commentContent;
      }
    }
  }

  // 返回上一頁的按鈕要清session
  goBack() {
    sessionStorage.removeItem('postContent');
    this.location.back();
  }

  // 偵測回上一頁要清session
  setupEventListeners(): void {
    window.addEventListener('popstate', (event: PopStateEvent): void => {
      sessionStorage.removeItem('postContent');
    });
  }

  // 顯示更多 & 收起內容
  toggleText() {
    this.isTruncated = !this.isTruncated;
    setTimeout(() => {
      const tabGroup = document.querySelector('mat-tab-group') as HTMLElement;
      if (tabGroup) {
        tabGroup.style.width = 'auto'; // 強制重算高度
      }
    }, 100); // 確保動畫完成
  }

  // 根據 commentId 找到所有評論 (父評論的子評論都會是同個commentId)
  getRepliesByCommentId(commentId: number): commentList[] {
    return this.comments.filter(comment => comment.replyCommentId === commentId);
  }

  // 檢查父評論是否有子評論
  hasReplies(commentId: number): boolean {
    return this.comments.some(comment => comment.replyCommentId === commentId);
  }

  toggleReply(commentId: number): void {
    // 目前正在回覆的ID=評論ID的話，就是子評論；反之是父評論
    this.activeReplyId = this.activeReplyId === commentId ? null : commentId;
    // 若回覆子評論的話，要隱藏主發言框(目前回覆ID不等於null的話(true)，就代表是子評論)
    this.replyStatus = this.activeReplyId != null;
    // console.log('replyStatus', this.replyStatus);
    this.flag = 0;
    this.editComments = '';
  }

  /********************** 分隔條(by GPT) **********************/

  flag: number = 0;
  isDragging = false;
  startX!: number;
  startWidthPost!: number;
  startWidthComment!: number;

  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.startX = event.clientX;
    this.startWidthPost = document.querySelector('.post-section')!.clientWidth;
    this.startWidthComment = document.querySelector('.comment-section')!.clientWidth;

    // 添加事件監聽器以跟踪鼠標移動
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseMove = (event: MouseEvent) => {
    if (!this.isDragging) return;

    const offset = event.clientX - this.startX;
    const newWidthPost = this.startWidthPost + offset;
    const newWidthComment = this.startWidthComment - offset;

    // 使用類型斷言來告訴 TypeScript 這些元素是 HTMLElement(無法直接用style.)
    const postSection = document.querySelector('.post-section') as HTMLElement;
    const commentSection = document.querySelector('.comment-section') as HTMLElement;

    // 更新兩個區域的寬度
    postSection.style.flex = `${newWidthPost}`;
    commentSection.style.flex = `${newWidthComment}`;
  }

  onMouseUp = () => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

}
