import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { HintDialogComponent } from '../../components/hint-dialog/hint-dialog.component';
import { HttpClientService } from '../../http-serve/http-client.service';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../../service/data.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { ButtonDialogComponent } from '../../components/button-dialog/button-dialog.component';

@Component({
  selector: 'app-hotel-data',
  imports: [FormsModule, MatTabsModule, CommonModule, MatTooltipModule, MatSlideToggleModule],
  templateUrl: './hotel-data.component.html',
  styleUrl: './hotel-data.component.scss'
})
export class HotelDataComponent {
  constructor(private http:HttpClientService,private dataService:DataService, private cdr: ChangeDetectorRef,){}
  readonly dialog = inject(MatDialog);
  @Input() journey: any;
//------------------------------------------------
  //假資料
  hotelName : string = "雀客旅館新北蘆洲";
  hotelData !: roomData[][]
  checkBox : any[] =  []
  currency : string = "";
  totalPrice : number = 0;
  showData ?: roomData[][];
 // =[
  //   [
  //     {"accommodationId": 9, "journeyId": 1, "checkoutDate": "2025-03-03", "checkinDate": "2025-03-01", "hotelName": "長榮桂冠酒店(台中)", "hotelWeb": "booking", "roomType": "行政加大雙人床房－附沙發床", "bedType": "[1 張加大雙人床]", "price": 4786, number: 1,currency: 'TWD'},
  //     {"accommodationId": 10, "journeyId": 1, "checkoutDate": "2025-03-03", "checkinDate": "2025-03-01", "hotelName": "長榮桂冠酒店(台中)", "hotelWeb": "booking", "roomType": "高級雙人房", "bedType": "[1 張加大雙人床]", "price": 4786, number: 1,currency: 'TWD'},
  //     {"accommodationId": 11, "journeyId": 1, "checkoutDate": "2025-03-03", "checkinDate": "2025-03-01", "hotelName": "長榮桂冠酒店(台中)", "hotelWeb": "booking", "roomType": "高級雙人房", "bedType": "[1 張加大雙人床]", "price": 4786, number: 1,currency: 'TWD'},
  //   ],
  //   [
  //     {"accommodationId": 12, "journeyId": 1, "checkoutDate": "2025-05-03", "checkinDate": "2025-05-01", "hotelName": "長榮桂冠酒店(台中)", "hotelWeb": "booking", "roomType": "高級雙人房", "bedType": "[1 張加大雙人床]", "price": 4786, number: 1,currency: 'TWD'},
  //     {"accommodationId": 13, "journeyId": 1, "checkoutDate": "2025-05-03", "checkinDate": "2025-05-01", "hotelName": "長榮桂冠酒店(台中)", "hotelWeb": "booking", "roomType": "高級雙人房", "bedType": "[1 張加大雙人床]", "price": 4786, number: 1,currency: 'TWD'},
  //   ]
  // ]
  sortState : string[] = ["尚未訂房","已訂房"];
  state : string = ""
  editFlag : boolean = false;
  editWord :string = "編輯";
  allChoice : boolean = false;
  //------------------------------------------------

  ngOnInit(): void {

    this.dataService.hotelDataList$.subscribe((data) => {
      if (data) {
        this.hotelData = data;
        for (let i = 0; i < this.hotelData.length; i++) {
          for (let j = 0; j < this.hotelData[i].length; j++) {
            this.totalPrice = this.totalPrice + this.hotelData[i][j].price;
          }
        }
        this.search();
      }
    });
    this.dataService.hotelCheckbox$.subscribe((data) => {
      if (data) {
        this.checkBox = data;
      }
    });

    this.http.getApi('http://localhost:8080/accommodation/getRoomData?journeyId=' + this.journey.journeyId)
    .subscribe((response : any) => {
      if(response.code == 200) {
        this.totalPrice = 0
        for (let i = 0; i < response.data.length; i++) {
          this.checkBox.push(false)
          for (let j = 0; j < response.data[i].length; j++) {
            let strPrice = response.data[i][j].price
            const match = strPrice.match(/^([A-Za-z\$]+)\s*(\d+)$/);
            response.data[i][j].currency = match[1];
            response.data[i][j].price = parseInt(match[2], 10);
            this.currency = match[1];
            this.totalPrice = this.totalPrice + parseInt(match[2], 10);
          }
        }
        console.log(this.totalPrice);

        this.hotelData = response.data
        console.log(this.hotelData);
        this.search();

      }else{
        this.dialog.open(HintDialogComponent, {
          data:[response.message]
        });
      }
    })
  }

  openWeb(url:string){
    window.open(url, '_blank');
  }

  delete(){
    let dialogRef = this.dialog.open(ButtonDialogComponent, {
      data:"是否刪除飯店資訊"
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result){ // true 確認全部關閉dialog
        let apiData = {
          "journeyId":0,
          "accommodationId" : [-1]
        }
        for (let index = 0; index < this.checkBox.length; index++) {
          if (this.checkBox[index]){
            let deleteData = this.hotelData[index]
            for (let i = 0; i < deleteData.length; i++) {
              apiData.journeyId = deleteData[i].journeyId
              if (apiData.accommodationId.length == 1 && apiData.accommodationId[0] == -1){
                apiData.accommodationId = [deleteData[i].accommodationId]
              } else {
                apiData.accommodationId.push(deleteData[i].accommodationId)
              }
            }
          }
        }
        if (apiData.accommodationId.length == 1 && apiData.accommodationId[0] == -1){
          return
        }
        this.http.postApi('http://localhost:8080/accommodation/deleteRoomData',apiData)
        .subscribe((response : any) => {
          if(response.code == 200) {
            this.ngOnInit()
          }else{
            this.dialog.open(HintDialogComponent, {
              data:[response.message]
            });
          }
        })
      }
    });
  }

  search(){
    this.showData = []
    if (this.state != ""){
      this.totalPrice = 0;
      this.checkBox = []
      for (let index = 0; index < this.hotelData.length; index++) {
        if (this.state == "尚未訂房" && this.hotelData[index][0].finished == false){
          this.checkBox.push(false)
          for (let i = 0; i < this.hotelData[index].length; i++) {
            this.totalPrice = this.totalPrice + this.hotelData[index][i].price
          }
          this.showData.push(this.hotelData[index])
        }

        if (this.state == "已訂房" && this.hotelData[index][0].finished == true){
          this.checkBox.push(false)
          for (let i = 0; i < this.hotelData[index].length; i++) {
            this.totalPrice = this.totalPrice + this.hotelData[index][i].price
          }
          this.showData.push(this.hotelData[index])
        }

      }
    }else{
      this.checkBox = []
      for (let index = 0; index < this.hotelData.length; index++) {
          this.checkBox.push(false)
      }
      this.showData = this.hotelData
    }

  }
  edit(){

    // ->編輯
    if (!this.editFlag){
      this.http.getApi('http://localhost:8080/accommodation/editAccommodation?journeyId=' + this.journey.journeyId)
      .subscribe((response : any) => {
        if(response.code == 200) {
          this.editFlag = true
          this.editWord = "儲存"
        }else{
          this.dialog.open(HintDialogComponent, {
            data:[response.message]
          });
        }
      })
    }else{  //編輯->儲存

      let roomDate : any[] = []
      if (this.showData != undefined && this.showData.length > 0){
        for (let i = 0; i < this.showData.length; i++) {
          for (let j = 0; j < this.showData[i].length; j++) {
            roomDate.push({
              "accommodationId":this.showData[i][j].accommodationId,
              "finished":this.showData[i][j].finished
            })
          }
        }

        this.http.postApi('http://localhost:8080/accommodation/updateRoomData',
          {
            "journeyId":this.journey.journeyId,
            "roomDate": roomDate
          }
        )
        .subscribe((response : any) => {
          if(response.code == 200) {
            this.editFlag = false
            this.editWord = "編輯"
          }else{
            this.dialog.open(HintDialogComponent, {
              data:[response.message]
            });
          }
        })
      }


    }
  }

  Choice(){
    this.allChoice = !this.allChoice
    if (this.showData != undefined && this.showData.length > 0){

      if (this.allChoice){
        for (let i = 0; i < this.showData.length; i++) {
          if (this.showData[i][0].finished == false){
            this.checkBox[i] = true
          }
        }
      }else{
        for (let i = 0; i < this.showData.length; i++) {
          if (this.showData[i][0].finished == false){
            this.checkBox[i] = false
          }
        }
      }
    }
  }
  ChoiceOne(index:number){
    this.checkBox[index] = !this.checkBox[index]
  }

}
export interface roomData{
  "accommodationId": number,
  "journeyId": number,
  "checkoutDate": string,
  "checkinDate": string,
  "hotelName": string,
  "hotelWeb": string,
  "roomType": string,
  "bedType": string,
  "currency":string,
  "price": number,
  "number" : number,
  "url":string,
  "finished" : boolean,
}

