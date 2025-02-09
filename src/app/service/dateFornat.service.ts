import { Injectable } from "@angular/core";

@Injectable({
  providedIn:'root'
})

export class DateFormat{

  changeDateFormat(dateData:Date,dateType:string='-'){

    let year;
    let month;
    let date;

    if(dateData){
      year=dateData.getFullYear();
      month=dateData.getMonth()+1; //因為程式的日期是從0開始(1月為0)
      if(String(month).length==1){ //如果月份的長度只有1(只有個位數的月份)
        month='0'+month //要在前面補0
      }

      date=dateData.getDate();
      if(String(date).length==1){ //日期也一樣
        date='0'+date;
      }
      return year + dateType+month + dateType + date; //日期格式
    }else{ //如果傳進來的是空值
      return'';
    }
   }

  addDate(date: Date, addDate: number) {
    date.setDate(date.getDate() + addDate);
    return date;
  }

  stringAddDay(date: string, addDate: number): string {
    const d = new Date(date);
    d.setDate(d.getDate() + addDate);
    return d.toISOString().split('T')[0];
  }

  trimYear(date: string): string {
    // 使用 split 分割字串，取後兩部分
    return date.split('-').slice(1).join('-');
  }

  timeFormat(date: Date): string {

    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
    let day = String(date.getDate()).padStart(2, '0');
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    let seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  //是否符合日期格式
  isValidDate(date: any): boolean {
    if (!date) return false;
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }

  formatDateRange(startDate: string, endDate: string):string{
    // 將日期字串轉換為陣列格式 [year, month, day]
    let startParts = startDate.split('-');
    let endParts = endDate.split('-');

    // 格式化日期為 YYYY/MM/DD
    let formattedStart = startParts.join('/');
    let formattedEnd = endParts.join('/');

    // 如果年份相同，移除結束日期的年份
    if (startParts[0] == endParts[0]) {
      formattedEnd = `${endParts[1]}/${endParts[2]}`;
    }

    // 用 "-" 連結兩個日期
    return `${formattedStart}-${formattedEnd}`;
  }

}
