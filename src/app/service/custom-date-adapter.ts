import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {

  //自訂日期選擇器中星期的顯示
  //style：星期名稱的格式，可能的值有：long："Monday"；short："Mon"；narrow："M"
  override getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    const chineseDays = ['日', '一', '二', '三', '四', '五', '六'];
    return chineseDays;
  }

  override getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    const chineseMonths = [
      '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月',
    ];
    return chineseMonths;
  }

  override format(date: Date, displayFormat: Object): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // 確保兩位數
    const day = ('0' + date.getDate()).slice(-2); // 確保兩位數

    //displayFormat是format方法的一個參數，用來標示目前的日期需要格式化的目的是什麼
    if (displayFormat === 'input') {
      return `${year}/${month}/${day}`;
    }
    return `${year}/${month}/${day}`;
  }
}
