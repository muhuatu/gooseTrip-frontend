import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { room } from '../../../interface/hotelInter';
import { DataService } from '../../../service/data.service';
import { MyJourneySizeService } from '../../../service/my-journey-size.service';
import { HintDialogComponent } from '../../../components/hint-dialog/hint-dialog.component';
import { HttpClientService } from '../../../http-serve/http-client.service';

@Component({
  selector: 'app-room-check',
  imports: [FormsModule, MatTabsModule, CommonModule],
  templateUrl: './room-check.component.html',
  styleUrl: './room-check.component.scss'
})
export class RoomCheckComponent {
  constructor(private http:HttpClientService,private dataService:DataService, public myJourneySizeService: MyJourneySizeService,){}
  readonly dialogRef = inject(MatDialogRef<RoomCheckComponent>);
  // readonly data = inject<room[]>(MAT_DIALOG_DATA);
  // hotelData = MAT_DIALOG_DATA
   readonly dialog = inject(MatDialog);
  readonly hotelData = inject<room[]>(MAT_DIALOG_DATA);
//------------------------------------------------
  //假資料
  hotelName !: string
  checkinDate !: Date ;
  checkoutDate !: Date ;
  apiData !: any[];
  // hotelData : room[] =[
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
  //------------------------------------------------

  ngOnInit(): void {
    this.hotelName = this.dataService.hotelData.hotelName;
    this.checkinDate = new Date(this.dataService.hotelData.checkinDate)
    this.checkoutDate = new Date(this.dataService.hotelData.checkoutDate)
    this.apiData = []
    console.log(this.hotelData);

    for (let index = 0; index < this.hotelData.length; index++) {
      console.log(this.hotelData[index].allPrice);
      let bedType = []
      for (let i = 0; i < this.hotelData[index].bedType.length; i++) {
        bedType.push(this.hotelData[index].bedType[i])
      }
      let temp = {
        "roomPrice": this.hotelData[index].allPrice,
        "roomCurrency":this.hotelData[index].currency,
        "bedType":bedType,
        "roomType":this.hotelData[index].roomType,
        "number" : this.hotelData[index].number
      }
      this.apiData.push(temp)
    }
  }
   close(choice :boolean): void {

    if (choice){
      this.http.postApi('http://localhost:8080/accommodation/saveRoomData',
      {
       "journeyId":this.dataService.hotelData.journey,
        "webName":this.dataService.hotelData.webName,
        "checkinDate":this.checkinDate.toISOString().split('T')[0],
        "checkoutDate":this.checkoutDate.toISOString().split('T')[0],
        "hotelName":this.dataService.hotelData.hotelName,
        "roomData":this.apiData,
        "url":this.dataService.hotelData.url
      }
      )
      .subscribe((response : any) => {
        if(response.code == 200) {
          this.http.getApi('http://localhost:8080/accommodation/getRoomData?journeyId=' + this.dataService.hotelData.journey)
          .subscribe((response : any) => {
            if(response.code == 200) {
              let cheackBox = []
              for (let i = 0; i < response.data.length; i++) {
                cheackBox.push(false)
                console.log(response.data[i]);
                for (let j = 0; j < response.data[i].length; j++) {
                  let strPrice = response.data[i][j].price
                  const match = strPrice.match(/^([A-Za-z\$]+)\s*(\d+)$/);
                  response.data[i][j].currency = match[1];
                  response.data[i][j].price = parseInt(match[2], 10);

                }

              }
              // console.log(this.cheackBox);
              this.dataService.updatehotelDataList(response.data)
              this.dataService.updatehotelCheckbox(cheackBox)
              console.log(response.data);
            }else{
              this.dialog.open(HintDialogComponent, {
                data:[response.message]
              });
            }
          })
          this.dataService.hotelData={
            journey:undefined,
            webName:"",
            area:"",
            hotelName: "",
            checkinDate: "",
            checkoutDate: "",
            adults:"0",
            children:"0",
            rooms:"1",
            url:"",
            findBooking:false,
            findAgoda:false
          }
          this.myJourneySizeService.setSelectedTab('tab-3');
        }else{
          this.dialog.open(HintDialogComponent, {
            data:[response.message]
          });
        }
      })

    }
    this.dialogRef.close(choice);
  //跳入標籤
  //this.myJourneySizeService.setSelectedTab('tab-2'); //開到住宿搜尋
  //C:\Users\TEST\Desktop\YiHua\gooseTrip\src\app\components\place-dialog\place-dialog.component.ts
  // 用完要改回this.myJourneySizeService.setSelectedTab('tab-1');

  }
}
