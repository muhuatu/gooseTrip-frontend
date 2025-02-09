import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn:'root'
})

export class HttpClientService {
  constructor (private http: HttpClient){}

  // postApi(geturl: string, postData: any) {
  //   return this.http.post(geturl, postData,{withCredentials: true});
  // }

  // getApi(geturl: string){
  //   return this.http.get(geturl,{withCredentials: true}) ;
  // }

   // 這裡使用泛型 T 來確保返回類型
  postApi(geturl: string, postData: any) {
    return this.http.post(geturl, postData, { withCredentials: true });
  }

  // 修改 getApi，使用泛型來指定返回類型
  getApi<T>(geturl: string, p0?: { responseType: "json"; }) {
    return this.http.get<T>(geturl, { withCredentials: true });
  }
}
