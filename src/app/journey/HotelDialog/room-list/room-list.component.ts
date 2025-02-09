import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { room } from '../../../interface/hotelInter';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RoomCheckComponent } from '../room-check/room-check.component';
import { HintDialogComponent } from '../../../components/hint-dialog/hint-dialog.component';
import { DataService } from '../../../service/data.service';

@Component({
  selector: 'app-room-list',
  imports: [FormsModule, MatTabsModule, CommonModule],
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.scss'
})
export class RoomListComponent {
  readonly dialog = inject(MatDialog);
  readonly hotelData = inject<room[]>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<RoomListComponent>);
  constructor(private dataService : DataService,){};
  // hotelData = MAT_DIALOG_DATA;
  sort : string[] = ["價格:(低價優先)","價格:(高價優先)","住宿等級:(高分優先)","住宿等級:(低分優先)"];
  sortChoice : string = "";
  showData !: room[];
  // filter!:room[];
  //------------------------------------------------
  //假資料
  //allData == true ->全部的資料loading完成
  tabs = [
    { name: 'booking', allData : true , content: 'London is the capital city of England.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
    { name: 'agoda', allData : false ,content: 'Paris is the capital of France.' },
    { name: 'Tokyo', allData : true ,content: 'Tokyo is the capital of Japan.' }
  ]; // 定義 tabs 資料

  // hotelData : room[] = [
  //   {"roomType": "四人家庭房","bedType": ["2 張雙人床"],"currency": "TWD","price": 4802,"hightFloor": false,"infantBed": null,"notificationList": ["評價還不錯 的早餐 TWD 450", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 4,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/43604715.jpg?k=bd00f521f578a8d51ef8b00ff59eb614c1d12a3973ba6dcf76455ca8e472d63a&o=",number: 0},
  //   {"roomType": "四人家庭房","bedType": ["2 張雙人床"],"currency": "TWD","price": 5464,"hightFloor": false,"infantBed": null,"notificationList": ["含早餐－評價還不錯", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 4,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/43604715.jpg?k=bd00f521f578a8d51ef8b00ff59eb614c1d12a3973ba6dcf76455ca8e472d63a&o=",number: 0},
  //   {"roomType": "家庭三人房","bedType": ["1 張單人床 和", "1 張雙人床"],"currency": "TWD","price": 4139,"hightFloor": false,"infantBed": null,"notificationList": ["評價還不錯 的早餐 TWD 450", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 3,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/43604715.jpg?k=bd00f521f578a8d51ef8b00ff59eb614c1d12a3973ba6dcf76455ca8e472d63a&o=",number: 0},
  //   {"roomType": "家庭三人房","bedType": ["1 張單人床 和", "1 張雙人床"],"currency": "TWD","price": 4636,"hightFloor": false,"infantBed": null,"notificationList": ["含早餐－評價還不錯", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 3,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/43604715.jpg?k=bd00f521f578a8d51ef8b00ff59eb614c1d12a3973ba6dcf76455ca8e472d63a&o=",number: 0},
  //   {"roomType": "豪華三人房","bedType": ["3 張單人床"],"currency": "TWD","price": 4305,"hightFloor": false,"infantBed": null,"notificationList": ["評價還不錯 的早餐 TWD 450", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 3,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/16382250.jpg?k=5b53d59fcaad62ceb175f1c6f311cfcd6888496432aa0416ff9432d2dfc97141&o=",number: 0},
  //   {"roomType": "豪華三人房","bedType": ["3 張單人床"],"currency": "TWD","price": 4802,"hightFloor": false,"infantBed": null,"notificationList": ["含早餐－評價還不錯", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 3,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/16382250.jpg?k=5b53d59fcaad62ceb175f1c6f311cfcd6888496432aa0416ff9432d2dfc97141&o=",number: 0},
  //   {"roomType": "經濟雙人房- 無窗","bedType": ["1 張雙人床"],"currency": "TWD","price": 3023,"hightFloor": false,"infantBed": null,"notificationList": ["評價還不錯 的早餐 TWD 450", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 2,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/146474005.jpg?k=fecf87444b1d3b52b34561f4ebc245cddef595eb9b90d5469666df1c2eba5dbd&o=",number: 0},
  //   {"roomType": "經濟雙人房- 無窗","bedType": ["1 張雙人床"],"currency": "TWD","price": 3311,"hightFloor": false,"infantBed": null,"notificationList": ["含早餐－評價還不錯", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 2,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/146474005.jpg?k=fecf87444b1d3b52b34561f4ebc245cddef595eb9b90d5469666df1c2eba5dbd&o=",number: 0},
  //   {"roomType": "豪華雙床房（無窗）","bedType": ["2 張單人床"],"currency": "TWD","price": 3239,"hightFloor": false,"infantBed": null,"notificationList": ["評價還不錯 的早餐 TWD 450", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 2,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/522527090.jpg?k=313935a46369bce3cd63e5b30f9eb6722d7ad4303beaa5aa0c199dfa4e846865&o=",number: 0},
  //   {"roomType": "豪華雙床房（無窗）","bedType": ["2 張單人床"],"currency": "TWD","price": 3527,"hightFloor": false,"infantBed": null,"notificationList": ["含早餐－評價還不錯", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 2,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/522527090.jpg?k=313935a46369bce3cd63e5b30f9eb6722d7ad4303beaa5aa0c199dfa4e846865&o=",number: 0},
  //   {"roomType": "高級雙人房","bedType": ["1 張雙人床"],"currency": "TWD","price": 3484,"hightFloor": false,"infantBed": null,"notificationList": ["評價還不錯 的早餐 TWD 450", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 2,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/546731285.jpg?k=11e3fac71541ebc7650b1f9310869983c0c24610df5f015e05c6e34d9bce72e4&o=",number: 0},
  //   {"roomType": "高級雙人房","bedType": ["1 張雙人床"],"currency": "TWD","price": 3801,"hightFloor": false,"infantBed": null,"notificationList": ["含早餐－評價還不錯", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 2,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/546731285.jpg?k=11e3fac71541ebc7650b1f9310869983c0c24610df5f015e05c6e34d9bce72e4&o=",number: 0},
  //   {"roomType": "高級雙床房","bedType": ["2 張單人床"],"currency": "TWD","price": 3484,"hightFloor": false,"infantBed": null,"notificationList": ["評價還不錯 的早餐 TWD 450", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 2,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/16382230.jpg?k=3747b9cdbf620360acab2a529bef8177a3bb36b78281a5a121612ceb3e06504d&o=",number: 0},
  //   {"roomType": "高級雙床房","bedType": ["2 張單人床"],"currency": "TWD","price": 3801,"hightFloor": false,"infantBed": null,"notificationList": ["含早餐－評價還不錯", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 2,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/16382230.jpg?k=3747b9cdbf620360acab2a529bef8177a3bb36b78281a5a121612ceb3e06504d&o=",number: 0},
  //   {"roomType": "小型套房","bedType": ["1 張加大雙人床"],"currency": "TWD","price": 5050,"hightFloor": false,"infantBed": null,"notificationList": ["評價還不錯 的早餐 TWD 450", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 2,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/16382223.jpg?k=92a13b4a4f4f3531172e884bf85e3f88ece770f467b261f93f8a6dc81337cea7&o=",number: 0},
  //   {"roomType": "小型套房","bedType": ["1 張加大雙人床"],"currency": "TWD","price": 5381,"hightFloor": false,"infantBed": null,"notificationList": ["含早餐－評價還不錯", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 2,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/16382223.jpg?k=92a13b4a4f4f3531172e884bf85e3f88ece770f467b261f93f8a6dc81337cea7&o=",number: 0},
  // ]
  //------------------------------------------------

  ngOnInit(): void {
    let checkIn = new Date(this.dataService.hotelData.checkinDate);
    let checkOut = new Date(this.dataService.hotelData.checkoutDate);
    let day = (checkOut.getTime() - checkIn.getTime())/ (1000 * 3600 * 24);
    for (let index = 0; index < this.hotelData.length; index++) {
      this.hotelData[index].allPrice =this.hotelData[index].oneNightPrice* day
    }

  }
  activeTab : string = this.tabs[0].name; // 預設啟用的 tab

  subOne(item:room){
    if (item.number ==0){return
    }
    item.number = item.number -1
  }
  addOne(item:room){
    item.number = item.number + 1
  }
  close(choice : boolean): void {
    this.dialogRef.close(choice);
  }

  clear(){
    for (let index = 0; index < this.hotelData.length; index++) {
      this.hotelData[index].number = 0
    }
  }

  filter(){
    this.showData = []
    for (let index = 0; index < this.hotelData.length; index++) {
      if(this.hotelData[index].number != 0){
        this.showData.push(this.hotelData[index])
      }
    }
    console.log(this.showData);

  }

  check(){
    // this.showData = [
    //   {"roomType": "四人家庭房","bedType": ["2 張雙人床"],"currency": "TWD","price": 4802,"hightFloor": false,"infantBed": null,"notificationList": ["評價還不錯 的早餐 TWD 450", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 4,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/43604715.jpg?k=bd00f521f578a8d51ef8b00ff59eb614c1d12a3973ba6dcf76455ca8e472d63a&o=",number: 1},
    //   {"roomType": "四人家庭房","bedType": ["2 張雙人床"],"currency": "TWD","price": 5464,"hightFloor": false,"infantBed": null,"notificationList": ["含早餐－評價還不錯", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 4,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/43604715.jpg?k=bd00f521f578a8d51ef8b00ff59eb614c1d12a3973ba6dcf76455ca8e472d63a&o=",number: 1},
    //   {"roomType": "家庭三人房","bedType": ["1 張單人床 和", "1 張雙人床"],"currency": "TWD","price": 4139,"hightFloor": false,"infantBed": null,"notificationList": ["評價還不錯 的早餐 TWD 450", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 3,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/43604715.jpg?k=bd00f521f578a8d51ef8b00ff59eb614c1d12a3973ba6dcf76455ca8e472d63a&o=",number: 1},
    //   {"roomType": "家庭三人房","bedType": ["1 張單人床 和", "1 張雙人床"],"currency": "TWD","price": 4636,"hightFloor": false,"infantBed": null,"notificationList": ["含早餐－評價還不錯", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 3,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/43604715.jpg?k=bd00f521f578a8d51ef8b00ff59eb614c1d12a3973ba6dcf76455ca8e472d63a&o=",number: 1},
    //   {"roomType": "豪華三人房","bedType": ["3 張單人床"],"currency": "TWD","price": 4305,"hightFloor": false,"infantBed": null,"notificationList": ["評價還不錯 的早餐 TWD 450", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 3,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/16382250.jpg?k=5b53d59fcaad62ceb175f1c6f311cfcd6888496432aa0416ff9432d2dfc97141&o=",number: 1},
    //   {"roomType": "豪華三人房","bedType": ["3 張單人床"],"currency": "TWD","price": 4802,"hightFloor": false,"infantBed": null,"notificationList": ["含早餐－評價還不錯", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 3,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/16382250.jpg?k=5b53d59fcaad62ceb175f1c6f311cfcd6888496432aa0416ff9432d2dfc97141&o=",number: 1},
    //   {"roomType": "經濟雙人房- 無窗","bedType": ["1 張雙人床"],"currency": "TWD","price": 3023,"hightFloor": false,"infantBed": null,"notificationList": ["評價還不錯 的早餐 TWD 450", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 2,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/146474005.jpg?k=fecf87444b1d3b52b34561f4ebc245cddef595eb9b90d5469666df1c2eba5dbd&o=",number: 1},
    //   {"roomType": "經濟雙人房- 無窗","bedType": ["1 張雙人床"],"currency": "TWD","price": 3311,"hightFloor": false,"infantBed": null,"notificationList": ["含早餐－評價還不錯", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 2,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/146474005.jpg?k=fecf87444b1d3b52b34561f4ebc245cddef595eb9b90d5469666df1c2eba5dbd&o=",number: 1},
    //   {"roomType": "豪華雙床房（無窗）","bedType": ["2 張單人床"],"currency": "TWD","price": 3239,"hightFloor": false,"infantBed": null,"notificationList": ["評價還不錯 的早餐 TWD 450", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 2,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/522527090.jpg?k=313935a46369bce3cd63e5b30f9eb6722d7ad4303beaa5aa0c199dfa4e846865&o=",number: 1},
    //   {"roomType": "豪華雙床房（無窗）","bedType": ["2 張單人床"],"currency": "TWD","price": 3527,"hightFloor": false,"infantBed": null,"notificationList": ["含早餐－評價還不錯", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 2,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/522527090.jpg?k=313935a46369bce3cd63e5b30f9eb6722d7ad4303beaa5aa0c199dfa4e846865&o=",number: 1},
    //   {"roomType": "高級雙人房","bedType": ["1 張雙人床"],"currency": "TWD","price": 3484,"hightFloor": false,"infantBed": null,"notificationList": ["評價還不錯 的早餐 TWD 450", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 2,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/546731285.jpg?k=11e3fac71541ebc7650b1f9310869983c0c24610df5f015e05c6e34d9bce72e4&o=",number: 1},
    //   {"roomType": "高級雙人房","bedType": ["1 張雙人床"],"currency": "TWD","price": 3801,"hightFloor": false,"infantBed": null,"notificationList": ["含早餐－評價還不錯", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 2,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/546731285.jpg?k=11e3fac71541ebc7650b1f9310869983c0c24610df5f015e05c6e34d9bce72e4&o=",number: 1},
    //   {"roomType": "高級雙床房","bedType": ["2 張單人床"],"currency": "TWD","price": 3484,"hightFloor": false,"infantBed": null,"notificationList": ["評價還不錯 的早餐 TWD 450", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 2,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/16382230.jpg?k=3747b9cdbf620360acab2a529bef8177a3bb36b78281a5a121612ceb3e06504d&o=",number: 1},
    //   {"roomType": "高級雙床房","bedType": ["2 張單人床"],"currency": "TWD","price": 3801,"hightFloor": false,"infantBed": null,"notificationList": ["含早餐－評價還不錯", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 2,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/16382230.jpg?k=3747b9cdbf620360acab2a529bef8177a3bb36b78281a5a121612ceb3e06504d&o=",number: 1},
    //   {"roomType": "小型套房","bedType": ["1 張加大雙人床"],"currency": "TWD","price": 5050,"hightFloor": false,"infantBed": null,"notificationList": ["評價還不錯 的早餐 TWD 450", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 2,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/16382223.jpg?k=92a13b4a4f4f3531172e884bf85e3f88ece770f467b261f93f8a6dc81337cea7&o=",number: 1},
    //   {"roomType": "小型套房","bedType": ["1 張加大雙人床"],"currency": "TWD","price": 5381,"hightFloor": false,"infantBed": null,"notificationList": ["含早餐－評價還不錯", "方案—有機會享折扣", "2025年6月3日前（不含當日）可免費取消", "無需訂金－入住時付款"],"maxMemberAdults": 2,"maxMemberChildren": 0,"img": "https://cf.bstatic.com/xdata/images/hotel/square600/16382223.jpg?k=92a13b4a4f4f3531172e884bf85e3f88ece770f467b261f93f8a6dc81337cea7&o=",number: 1},
    // ]

    this.filter()
    console.log(this.showData);
    if (this.showData.length == 0 ){
      this.dialog.open(HintDialogComponent, {
        data:["尚未新增房間"]
      });
    }else{
      let dialogRef =this.dialog.open(RoomCheckComponent, {
        disableClose: true,
        width: '800px',
        height: '95%',
        maxWidth: '800px', // 限制最大寬度
        data: this.showData

      });
      dialogRef.afterClosed().subscribe(result => {
        if (result){ // true 確認全部關閉dialog
          this.dialogRef.close(true);
        }
      });
    }
  }
}

