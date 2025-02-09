import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImgFormatService {

  constructor() { }

  /************************圖片增加前綴方法*************************** */

  // 根據圖片的魔術字節來推斷格式並生成 Base64 字串前綴
  generateImageWithPrefix(base64Image: any) {
    // 嘗試判斷圖片格式並加上相應的前綴
    let imageFormat = this.detectImageFormat(base64Image);

    // 生成帶格式前綴的 Base64 字串
    return `data:image/${imageFormat};base64,${base64Image}`;
  }

  // 判斷 Base64 編碼圖片的格式（這裡簡單處理 PNG、JPEG 和 GIF）
  detectImageFormat(base64Image: string): string {
    // 取得 Base64 字串的前幾個字節（可以擷取 Base64 字串的前幾個字符來判斷）
    const header = base64Image.substring(0, 20);  // 取前 20 個字符檢查

    if (header.startsWith('iVBORw0KGgo')) {
      return 'png';  // 判斷為 PNG 格式
    } else if (header.startsWith('/9j/')) {
      return 'jpeg'; // 判斷為 JPEG 格式
    } else if (header.startsWith('R0lGODlh')) {
      return 'gif';  // 判斷為 GIF 格式
    }
    return 'jpeg';  // 默認為 JPEG 格式
  }
}
