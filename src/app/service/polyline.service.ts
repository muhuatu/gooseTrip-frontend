import { Injectable } from '@angular/core';
import polyline from '@mapbox/polyline';

@Injectable({
  providedIn: 'root',
})
export class PolylineService {
  // Google 路徑編碼解法方式
  decode(encodedPolyline: string): [number, number][] {
    return polyline.decode(encodedPolyline);
  }
}
