import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn:'root'
})

export class Loading{
  private loading = new BehaviorSubject<boolean>(false);
  loading$ = this.loading.asObservable();
  updateLoading(data: boolean) {
    this.loading.next(data);
  }
}
