import { PostList } from './../../interface/postInter';
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { HttpClientService } from '../../http-serve/http-client.service';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { DataService } from '../../service/data.service';
import { HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { PageEvent } from '@angular/material/paginator';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImgFormatService } from '../../service/imgFormat.service';


@Component({
  selector: 'app-post-home',
  imports: [CommonModule, FormsModule, MatIconModule, MatPaginatorModule, MatTooltipModule],
  providers: [
    {
      provide: MatPaginatorIntl,
      useFactory: () => {
        const customPaginatorIntl = new MatPaginatorIntl();
        customPaginatorIntl.itemsPerPageLabel = '每頁顯示：';
        customPaginatorIntl.firstPageLabel = '第一頁';
        customPaginatorIntl.nextPageLabel = '下一頁';
        customPaginatorIntl.previousPageLabel = '上一頁';
        customPaginatorIntl.lastPageLabel = '最終頁';
        customPaginatorIntl.getRangeLabel = (
          pageIndex: number,
          pageSize: number,
          length: number
        ): string => {
          if (length === 0 || pageSize === 0) {
            return `第 0 筆共 ${length} 筆`;
          }
          const startIndex = pageIndex * pageSize;
          const endIndex = Math.min(startIndex + pageSize, length);
          return `第 ${startIndex + 1} - ${endIndex} 筆，共 ${length} 筆`;
        };
        return customPaginatorIntl;
      },
    },
  ],
  templateUrl: './post-home.component.html',
  styleUrl: './post-home.component.scss'
})
export class PostHomeComponent {

  userMail: string = ''; // 登入的使用者信箱
  keyword: string = '';

  // 貼文假資料
  list: Array<PostList> = [];
  temp: Array<PostList> = [];

  // 用來控制分頁的 MatPaginator
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  constructor(private dataService: DataService, private http: HttpClientService, private router: Router, public imgFormat: ImgFormatService) {

  }

  pagedPosts = new Array<PostList>;  // 當前頁顯示的貼文資料
  pageSize = 8;  // 每頁顯示的貼文數量
  pageIndex = 0;  // 當前頁碼（從 0 開始）


  // 處理分頁邏輯
  updatePagedPosts(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.list.length);
    this.pagedPosts = this.list.slice(startIndex, startIndex + this.pageSize);
  }


  // 分頁控制變動時的回調
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;  // 更新當前頁碼
    this.pageSize = event.pageSize;    // 更新每頁顯示數量
    this.updatePagedPosts();           // 更新當前頁的貼文
  }

  // 發送搜尋請求
  fetchPosts(keyword: string): void {
    this.searchPost(keyword);
  }

  // 把所有貼文渲染到社群首頁上
  ngOnInit(): void {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (user) {
      this.userMail = user.userMail;
    }
    // 撈出所有貼文
    this.searchPost();
  }

  searchPost(keyword?: string) {
    this.list = [];
    // 後端Controller @GetMapping @RequestParam
    // 用 string 連接路徑
    // 搜尋框的內容: 使用者名稱、行程名稱
    const params = new HttpParams()
      .set('keyword', this.keyword);
    this.http.getApi('http://localhost:8080/post/searchPostByKeyword' + `?${params.toString()}`).subscribe((res: any) => {
      console.log(res);
      // 更新貼文列表並計算分頁
      for (let index = 0; index < res.postList.length; index++) {
        if (res.postList[index].published) {
          this.list.push(res.postList[index]);
        }
      }
      // this.list = this.temp || [];  // 假設這是返回的貼文資料
      // 初次載入時設定總頁數及資料源
      this.updatePagedPosts();
      // 把API回傳結果塞回假資料容器
      // this.pagedPosts = res.postList;
      console.log(this.pagedPosts);

      // 清空input
      // this.keyword = '';
    })
  }


  // 用使用者信箱判斷是否為我的貼文
  userPost(mail: string) {
    // console.log(mail);
    // 從 session 獲取使用者信箱
    if(mail == this.userMail) {
      // 導到我的貼文
      this.router.navigate(['/user-info']);
    }
    else {
      // 導到其他使用者的貼文列表頁
      // 需傳出使用者信箱--> 丟到 Service
      this.dataService.userMail = mail;
      sessionStorage.setItem('authorMail', this.dataService.userMail);
      // console.log(this.dataService.userMail);
      this.router.navigate(['/user_post']);
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
    console.log(this.dataService.postContent);
    console.log(sessionStorage.getItem('postContent'));

    this.router.navigate(['/post_comment']);
  }

}
