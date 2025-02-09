import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PostList } from '../../interface/postInter';
import { HttpClientService } from '../../http-serve/http-client.service';
import { DataService } from '../../service/data.service';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImgFormatService } from '../../service/imgFormat.service';


@Component({
  selector: 'app-user-post',
  imports: [CommonModule, MatIconModule, MatTabsModule, MatTooltipModule],
  templateUrl: './user-post.component.html',
  styleUrl: './user-post.component.scss'
})
export class UserPostComponent {

  userMail: string = '';
  // 其他使用者的貼文假資料
  list: Array<PostList> = [

    // {
    //   "userName": "MR 羊咩咩",
    //   "userMail": "yang@ymail.com",
    //   "userImage": "assets/avatar/usagi2.jpg",
    //   "journeyId": 2,
    //   "journeyName": "山羊家京都自由行",
    //   "spotImage": "assets/destination/taipei.jpg",
    //   "postId": 5,
    //   "postTime": "2024-11-10",
    //   "favorite": false,
    //   "thumbUp": 150,
    //   "thumbDown": 10

    // },
    // {
    //   "userName": "MR 羊咩咩",
    //   "userMail": "yang@ymail.com",
    //   "userImage": "assets/avatar/usagi2.jpg",
    //   "journeyId": 2,
    //   "journeyName": "山羊家京都自由行",
    //   "spotImage": "assets/destination/tainan.jpg",
    //   "postId": 5,
    //   "postTime": "2024-11-10",
    //   "favorite": true,
    //   "thumbUp": 150,
    //   "thumbDown": 10
    // },
    // {
    //   "userName": "MR 羊咩咩",
    //   "userMail": "yang@ymail.com",
    //   "userImage": "assets/avatar/usagi2.jpg",
    //   "journeyId": 2,
    //   "journeyName": "山羊家京都自由行",
    //   "spotImage": "assets/destination/taipei.jpg",
    //   "postId": 5,
    //   "postTime": "2024-11-10",
    //   "favorite": true,
    //   "thumbUp": 150,
    //   "thumbDown": 10
    // },
    // {
    //   "userName": "MR 羊咩咩",
    //   "userMail": "yang@ymail.com",
    //   "userImage": "assets/avatar/usagi2.jpg",
    //   "journeyId": 2,
    //   "journeyName": "山羊家京都自由行",
    //   "spotImage": "assets/destination/tainan.jpg",
    //   "postId": 5,
    //   "postTime": "2024-11-10",
    //   "favorite": false,
    //   "thumbUp": 150,
    //   "thumbDown": 10
    // },
    // {
    //   "userName": "MR 羊咩咩",
    //   "userMail": "yang@ymail.com",
    //   "userImage": "assets/avatar/usagi2.jpg",
    //   "journeyId": 2,
    //   "journeyName": "山羊家京都自由行",
    //   "spotImage": "assets/destination/taipei.jpg",
    //   "postId": 5,
    //   "postTime": "2024-11-10",
    //   "favorite": true,
    //   "thumbUp": 150,
    //   "thumbDown": 10
    // }
  ]

  constructor(private dataService: DataService, private http: HttpClientService, private router: Router, public imgFormat: ImgFormatService) { }
  ngOnInit(): void {


    // this.userMail = this.dataService.userMail;
    // 從貼文首頁傳入的其他使用者信箱放到 session
    let authorMail = sessionStorage.getItem('authorMail') || '';
    // this.userMail = "xiaoyi3@example.com";
    console.log(this.userMail);
    console.log(authorMail);

    const url = `http://localhost:8080/post/get_post?userMail=${encodeURIComponent(authorMail.toString())}`;
    this.http.postApi(url, {}).subscribe((res: any) => {
      console.log(res);
      this.list = res.postList;
      console.log(this.list);

    })
  }

  // 點擊貼文到貼文內容頁
  // Component: PostCommentComponent
  postContent(userMail: string, postId: number, journeyId: number) {
    this.dataService.postContent = {
      userMail: userMail,
      postId: postId,
      journeyId: journeyId
    }
    // 把資料丟到 sessionStorage
    sessionStorage.setItem('postContent', JSON.stringify(this.dataService.postContent));
    sessionStorage.setItem('authorMail', '');
    // console.log(sessionStorage.getItem('postContent'));
    // console.log(this.dataService.postContent);
    this.router.navigate(['/post_comment']);
  }
}
