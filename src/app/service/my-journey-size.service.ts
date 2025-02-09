import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MyJourneySizeService {
  //我的行程的大小
  private journeyState = new BehaviorSubject<number>(0); // 初始值為 0
  journeyState$ = this.journeyState.asObservable(); // 可供訂閱的 Observable

  setJourneyState(state: number): void {
    this.journeyState.next(state);
  }

  getJourneyState(): number {
    return this.journeyState.value;
  }

  // 管理tab狀態
  private selectedTabState = new BehaviorSubject<string>('tab-1'); // 預設為 'tab-1'
  selectedTabState$ = this.selectedTabState.asObservable(); // 提供 Observable 給其他組件訂閱

  setSelectedTab(tabId: string): void {
    this.selectedTabState.next(tabId);
  }

  getSelectedTab(): string {
    return this.selectedTabState.value;
  }

  // 進到特定行程
  private selectedSwitchToSpot = new BehaviorSubject<boolean>(false);
  selectedSwitchToSpot$ = this.selectedSwitchToSpot.asObservable();

  setSwitchToSpot(switchToSpot: boolean): void {
    this.selectedSwitchToSpot.next(switchToSpot);
  }

  getSwitchToSpot(): boolean {
    return this.selectedSwitchToSpot.value;
  }

}
