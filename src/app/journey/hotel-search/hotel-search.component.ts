import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { HotelListComponent } from '../HotelDialog/hotel-list/hotel-list.component';
// import area from 'C:/Users/TEST/Desktop/YiHua/gooseTrip/src/assets/area.json';
import area from '../../../assets/area.json';
import { HttpClientService } from '../../http-serve/http-client.service';
import { HintDialogComponent } from '../../components/hint-dialog/hint-dialog.component';
import { DataService } from '../../service/data.service';
import { CustomDateAdapter } from '../../service/custom-date-adapter';

export const TW_FORMATS = {
  parse: {
    dateInput: 'YYYY/MM/DD'
  },
  display: {
    dateInput: 'YYYY/MM/DD',
    monthYearLabel: 'YYYY MMM',
    dateA11yLabel: 'YYYY/MM/DD',
    monthYearA11yLabel: 'YYYY MMM'
  }
};
@Component({
  selector: 'app-hotel-search',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule,MatButtonModule,MatIconModule,MatNativeDateModule,  MatFormFieldModule,MatInputModule,FormsModule,MatButtonModule,],
  templateUrl: './hotel-search.component.html',
  styleUrl: './hotel-search.component.scss',
    providers: [
      provideNativeDateAdapter(),
      MatDatepickerModule,
      { provide: DateAdapter, useClass: CustomDateAdapter },
      {
        provide: MAT_DATE_FORMATS,
        useValue: {
          parse: { dateInput: 'YYYY/MM/DD' },
          display: {
            dateInput: 'YYYY/MM/DD',
            monthYearLabel: 'YYYY MMM',
            dateA11yLabel: 'YYYY/MM/DD',
            monthYearA11yLabel: 'YYYY MMM',
          },
        },
      },
    ]
})
export class HotelSearchComponent {
  readonly dialog = inject(MatDialog);
  constructor(private http:HttpClientService, private dataService : DataService){};
  @Input() journey: any;
  fingHotelName : string = "";
  city = area;
  cityName = "";
  regionName="";
  regionList : any;
  adults : number = 0;
  children : number = 0;
  room : number = 0;
  checkinDate = ""
  checkoutDate =""
  today = new Date();
  findBooking : boolean = true;
  findAgoda : boolean = true;


  ngOnInit(): void {
    this.dataService.accommodationSearchData$.subscribe((item) => {
      if (item.journeyId != 0){
        this.dataService.hotelName = item.name
        item.name = this.fingHotelName
        item.name = ""
        for (let index = 0; index < area.length; index++) {
          if (item.address.indexOf(area[index].CityName) != -1 ){
            this.cityName = area[index].CityName
            this.onUpdate();
            break
          }
        }
        if (this.regionList!= undefined){
          for (let index = 0; index < this.regionList.length; index++) {
            if (item.address.indexOf(this.regionList[index].AreaName) != -1 ){
              this.regionName = this.regionList[index].AreaName
              break
            }
          }
        }

        item.address = ""
      }
    });
  }
  getCheckoutMin() : Date{
    if (this.checkinDate == ""){
      let today = new Date();
      today.setDate(today.getDate() + 1)  // 將日期設為隔天
      return today;
    }
    let nextDay = new Date(this.checkinDate);
    nextDay.setDate(nextDay.getDate() + 1); // 將日期設為隔天
    return nextDay;
  }
  onUpdate(){
    for (let index = 0; index < this.city.length; index++) {
      if (this.cityName == this.city[index].CityName){
        this.regionList = this.city[index].AreaList
      }
    }
    console.log(this.today);

  }
  addOne(num:number){

    if (num == 1){
      this.adults = this.adults + 1
    }
    if (num == 2){
      this.children = this.children + 1
    }
    if (num == 3){
      this.room = this.room + 1
    }

  }

  subOne(num:number){
    if (num == 1){
      if (this.adults==0){
        return
      }
      this.adults = this.adults - 1
    }

    if (num == 2){
      if (this.children==0){
        return
      }
      this.children = this.children - 1
    }

    if (num == 3){
      if (this.room==0){
        return
      }
      this.room = this.room - 1
    }
  }

  clear(){
    console.log();

    this.cityName = "";
    this.regionName="";
    this.regionList  = [];
    this.adults  = 0;
    this.children = 0;
    this.room = 0;
    this.checkinDate =""
    this.checkoutDate ="";
    this.findBooking = false;
    this.findAgoda  = false;
  }

  search(){
    let error = []
    let flag =false
    if (this.cityName == "") {
      error.push("請填寫縣市")
    }

    if (this.checkinDate =="" ){
      error.push("請填寫入住日期")
    }
    if (this.checkoutDate =="" ){
      error.push("請填寫退宿日期")
    }
    if (this.adults == 0){
      error.push("請填寫住宿人數")
    }

    if (!this.findBooking && !this.findAgoda){
      error.push("請選擇住房網站")
    }

    if (error.length != 0){
      this.dialog.open(HintDialogComponent, {
        data:error
        // data:[]
      });
    }else{
      console.log(this.findBooking);

      this.dataService.hotelData={
        journey:this.journey.journeyId,
        webName:"",
        area:this.cityName + this.regionName,
        hotelName: this.fingHotelName,
        checkinDate: this.DateChange(this.checkinDate),
        checkoutDate: this.DateChange(this.checkoutDate),
        adults:String(this.adults),
        children:"0",
        rooms:"1",
        url:"",
        findBooking:this.findBooking,
        findAgoda:this.findAgoda
      }
    //   this.dataService.hotelData={
    //     journey:1,
    //     webName:"",
    //     hotelName: this.fingHotelName,
    //     checkinDate: "2025-01-20",
    //     checkoutDate: "2025-01-21",
    //     url:"",
    //     area:"台北市",
    //     adults:"4",
    //     children:"0",
    //     rooms:"1",
    //     findBooking:false,
    //     findAgoda:false
    //   }
      this.openDialog()
    }
  }
  openDialog(){
    let dialogRef =this.dialog.open(HotelListComponent, {
      disableClose: true,
      width: '800px',
      height: '95%',
      maxWidth: '800px', // 限制最大寬度
    });
  }

  DateChange(dateString:string):string{
    let date = new Date(dateString);

    // 取得年、月、日
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份從 0 開始，所以加 1
    let day = date.getDate().toString().padStart(2, '0');

    // 組合成 "YYYY-MM-DD" 格式
    let formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
  }
}

