import { ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, } from '@angular/material/dialog';
import { HttpClientService } from '../../http-serve/http-client.service';
import { Router } from '@angular/router';
import { DataService } from '../../service/data.service';
import { DateFormat } from '../../service/dateFornat.service';
import { Loading } from '../../service/loading.service';
import { day, route, spot, SpotAndRouteResponse2 } from '../../interface/JourneyInter';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { BehaviorSubject, delay, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ImgFormatService } from '../../service/imgFormat.service';
import { roomData } from '../../journey/hotel-data/hotel-data.component';
import { HintDialogComponent } from '../hint-dialog/hint-dialog.component';

@Component({
  selector: 'app-pdf-dialog',
  imports: [CommonModule],
  templateUrl: './pdf-dialog.component.html',
  styleUrl: './pdf-dialog.component.scss'
})
export class PdfDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
    private Http: HttpClientService,
    public dataService: DataService,
    public dialog: MatDialog,
    public dateFormat: DateFormat,
    private loading:Loading,
    private dialogRef: MatDialogRef<PdfDialogComponent>,
    private cdr: ChangeDetectorRef,
    public imgFormat: ImgFormatService,
  ) {}
  @ViewChild('pdf') pdfElement!: ElementRef;

  spotList: spot[] = [];
  routeList: route[] = [];
  dayRoute: any[] = [];
  dayArray: day[] = [];
  journey = {
    journeyId: 0,
    journeyName: '',
    invitation: '',
    startDate: '',
    endDate: '',
    transportation: '',
    userMail: '',
  };

  hotelName : string = "雀客旅館新北蘆洲";
  hotelData !: roomData[][]
  cheackBox : any[] =  []
  currency : string = "";
  totalPrice : number = 0;

  async ngOnInit(){
    this.loading.updateLoading(true);
    this.journey=this.data;

    this.Http.getApi('http://localhost:8080/accommodation/getRoomData?journeyId=' + this.journey.journeyId)
    .subscribe((response : any) => {
      if(response.code == 200) {
        console.log(response);
        this.hotelData = response.data
      }else{
        this.dialog.open(HintDialogComponent, {
          data:[response.message]
        });
      }
    })

    this.Http.getApi
    ('http://localhost:8080/spots/getSpotAndRouteSortOut?JourneyId=' + this.journey.journeyId)
    .subscribe((res) => {
      const Response = res as SpotAndRouteResponse2;
      console.log(Response);

      this.dayArray=[];
      for (let i = 1; i <= Response.spotList.length; i++) {
        for (let day of Response.spotList) {
          day.journeyId = this.journey.journeyId;
          if (i == day.day) {
            this.dayArray.push(day);
          }
        }
      }

      this.dayRoute=[];
      //整理路徑
      this.routeList = Response.routeList;
      for (let i = 1; i <= Response.spotList.length; i++) {
        let dayRoute: route[] = [];
        //把一天的所有路經篩出來
        for (let route of this.routeList) {
          if (route.day == i) {
            dayRoute.push(route);
          }
        }
        this.dayRoute.push({ routeList: dayRoute });
      }

      this.loading.updateLoading(false);
    });
  }

  async getBase64ImageFromUrl(imageUrl: string) {
    var res = await fetch(imageUrl);
    var blob = await res.blob();

    return new Promise((resolve, reject) => {
      var reader  = new FileReader();
      reader.addEventListener("load", function () {
          resolve(reader.result);
      }, false);

      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(blob);
    })
  }

  padIndex(index: number): string {
    return index < 10 ? '0' + index : index.toString();
  }

  trimSecond(time: string){
    if (!time) {
      return ;
    }
    if (time.includes(":") && time.split(":").length === 3) {
      return time.substring(0, 5); // 取前五個字元，保留 HH:MM
    }
    return time;
  }

  //路徑時間整理
  convertTime(time: string) {
    if (!time) {return;}
    if (time.length > 5) {
      const [hours, minutes, Second] = time.split(':').map(Number);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2,'0')}`;
    }
    return time;
  }

  private isExportingPDF = false;
  pdf = new jsPDF('p', 'mm', [176, 250]); // 直向(portrait), 單位mm, B5

  exportPDF(){
    this.loading.updateLoading(true);
    if (this.isExportingPDF) {
      return;
    }

    this.isExportingPDF = true;

    console.log(this.dayArray);
    const pages = document.querySelectorAll('#pdf .page'); // 取得所有page區塊
    const imgWidth = 176; // PDF寬度(B5: 176mm)
    const pageHeight = 250; // PDF一頁的高度(B5: 250mm)

    let firstPage = true;

    pages.forEach((page, index) => {
      html2canvas(page as HTMLElement,{
        backgroundColor:'#f6f3eb',
        allowTaint:true,
        useCORS:true //允許跨域
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * imgWidth) / canvas.width; //保持圖片的長寬比避免變形

        let remainingHeight = imgHeight; //剩下的高度
        let yOffset = 0; //在每頁PDF中垂直開始的位置

        while (remainingHeight > 0) {
          const currentHeight = Math.min(pageHeight, remainingHeight); // 目前頁面可容納的高度

          // 新建Canvas用於裁切圖片
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = (currentHeight / imgHeight) * canvas.height;

          const ctx = tempCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#f6f3eb'; //被景色
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            // 裁切原始Canvas的內容
            ctx.drawImage(
              canvas,
              0,
              (yOffset / imgHeight) * canvas.height, // 原始Canvas的裁切起點(y)
              canvas.width,
              tempCanvas.height, // 裁切高度
              0,
              0,
              tempCanvas.width,
              tempCanvas.height
            );

            const croppedImgData = tempCanvas.toDataURL('image/png');

            if (firstPage) {
              this.pdf.addImage(croppedImgData, 'PNG', 0, 0, imgWidth, currentHeight);
              firstPage = false;
            } else {
              this.pdf.addPage();
              this.pdf.setFillColor(246, 243, 235); //背景色(RGB)
              this.pdf.rect(0, 0, imgWidth, pageHeight, 'F'); //填充整頁背景色
              this.pdf.addImage(croppedImgData, 'PNG', 0, 0, imgWidth, currentHeight);
            }

            remainingHeight -= pageHeight; //剩下的高度要減到一頁
            yOffset += currentHeight; //起始位置更新
          }
        }
        if (index === pages.length - 1) {
          this.pdf.save(this.journey.journeyName + '.pdf');
          this.loading.updateLoading(false);
          this.dialogRef.close();
        }
      });
    });
  }

  onCancel(){
    this.loading.updateLoading(false);
    this.dialogRef.close();
  }

  onConfirm(){
    this.loading.updateLoading(true);
    this.exportPDF();
  }

}
