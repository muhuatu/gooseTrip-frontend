import { Routes } from '@angular/router';
import { HomepageComponent } from './home/homepage/homepage.component';
import { SearchComponent } from './home/search/search.component';
import { MapRouteComponent } from './map-route/map-route.component';
import { LoginComponent } from './home/login/login.component';
import { RegisterComponent } from './users/register/register.component';
import { UserInfoComponent } from './users/user-info/user-info.component';
import { UpdateComponent } from './users/update/update.component';
import { DeleteComponent } from './users/delete/delete.component';
import { MyFavoriteComponent } from './users/my-favorite/my-favorite.component';
import { PostHomeComponent } from './post/post-home/post-home.component';
import { PostCommentComponent } from './post/post-comment/post-comment.component';
import { UserPostComponent } from './post/user-post/user-post.component';
import { PostEditComponent } from './post/post-edit/post-edit.component';
import { ImageComponent } from './post/image/image.component';
import { PostCreateComponent } from './post/post-create/post-create.component';

export const routes: Routes = [
  //首頁跟會員資料
  { path: 'homepage', component: HomepageComponent }, //搜尋首頁
  { path: 'search', component: SearchComponent }, //搜尋結果的頁面

  // 會員資料
  { path: 'login', component: LoginComponent }, //登入
  { path: 'register', component: RegisterComponent }, // 註冊
  { path: 'user-info', component: UserInfoComponent }, // 會員資訊首頁
  { path: 'update', component: UpdateComponent }, // 修改會員資訊
  { path: 'delete', component: DeleteComponent }, // 刪除會員資訊
  { path: 'my-favorite', component: MyFavoriteComponent }, // 我的最愛

  //交通規劃
  { path: 'map', component: MapRouteComponent }, //先暫時設一個

  // 首頁
  { path: '', redirectTo: '/homepage', pathMatch: 'full' },

  // 社群
  { path: 'post_home', component: PostHomeComponent }, // 社群貼文首頁
  { path: 'user_post', component: UserPostComponent }, // 其他使用者的貼文列表頁
  { path: 'post_comment', component: PostCommentComponent }, // 貼文內容頁
  { path: 'post_edit', component: PostEditComponent }, // 編輯貼文頁
  { path: 'post_create', component: PostCreateComponent }, // 發佈貼文頁
  { path: 'image', component: ImageComponent }, // 圖片上傳測試
];
