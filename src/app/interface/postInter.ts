import { signal } from '@angular/core';

// 貼文列表頁(我的貼文、貼文首頁、其他使用者的貼文)需要的物件
export interface PostList {
  userName: string;
	userMail: string;
	userImage: string;
	journeyId: number;
	journeyName: string;
	spotImage: string;
  spotImgData?: string;  // 放後端轉完格式的Base64圖片編碼
  published?: boolean; // 貼文發佈狀態
	postId: number;
	postTime: string;
	favorite: boolean | null;
	thumbUp: number;
	thumbDown: number;
}

// 評論
export interface commentList {
  serialNumber: number;
  userMail: string;
  userName: string;
  userImage: string;
  postId: number;
  commentContent: string;
  commentTime: string;
  commentId: number;
  replyCommentId: number;
  thumbUp: number;
  thumbDown: number;
}

export interface PostDetail {
  day: number;
  spotName: string;
  spotNote: string;
  spotImage?: string;
  spotImgData?: string; // 放後端轉完格式的Base64圖片編碼
  duration: number;
  placeId: string;
}

export interface PostResponse {
  code: string;
  message: string;
  journeyName: string;
  userName: string;
  userImage: string;
  postId: number;
  postContent: string;
  postTime: string;
  favorite: boolean;
  thumbUp: number;
  thumbDown: number;
  postDetail: PostDetail[];
  commentList: Comment[];
}
