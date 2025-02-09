import { DataService } from './../../../service/data.service';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { hotel, room } from '../../../interface/hotelInter';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RoomListComponent } from '../room-list/room-list.component';
import { HttpClientService } from '../../../http-serve/http-client.service';
import { Subscription } from 'rxjs';
import { HintDialogComponent } from '../../../components/hint-dialog/hint-dialog.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';


@Component({
  selector: 'app-hotel-list',
  imports: [FormsModule, MatTabsModule, CommonModule,  MatFormFieldModule,MatInputModule,FormsModule,MatButtonModule,MatProgressSpinnerModule, ],
  templateUrl: './hotel-list.component.html',
  styleUrl: './hotel-list.component.scss'
})
export class HotelListComponent {
  readonly dialog = inject(MatDialog);
  readonly dialogRef = inject(MatDialogRef<HotelListComponent>);
  constructor(private dataService : DataService, private http:HttpClientService,){}
  sort : string[] = ["價格:(低價優先)","價格:(高價優先)","評價:(高分優先)","評價:(低分優先)"];
  hotelListAllData: any; // 用來儲存從 service 獲得的資料

  sortChoice : string = "";
  selectName !: string;
  showData : hotel[] =[];
  // hotelData !: hotel[];
  bookingAllData !:hotel[];
  agodaAllData !:hotel[];
  tabs : any[] = [];
  loading = false
  getBooking20 = false
  getAgoda20 = false
  activeTab !: string;
  hotelData : hotel[] = [
    { "webName": "booking", "name": "享樂慢活之輕旅行會館", "currency": "TWD", "oneNightPrice": 1383, "opinion": 7.8, "url": "https://www.booking.com/hotel/tw/xiang-le-man-huo-zhi-qing-lu-xing-hui-guan.zh-tw.html?label=zh-xt-tw-booking-desktop-EbyZWwQLwTW_IbH*0eHNCgS654267613595%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-65526620%3Alp1012818%3Ali%3Adec%3Adm&aid=2311236&ucfs=1&arphpl=1&checkin=2025-06-10&checkout=2025-06-12&dest_id=204689&dest_type=landmark&group_adults=1&req_adults=1&no_rooms=1&group_children=0&req_children=0&hpos=1&hapos=1&sr_order=popularity&srpvid=b5fd08bb43d603dc&srepoch=1737335676&all_sr_blocks=257164602_156385650_2_0_0&highlighted_blocks=257164602_156385650_2_0_0&matching_block_id=257164602_156385650_2_0_0&sr_pri_blocks=257164602_156385650_2_0_0__276600&from=searchresults", "img": "https://cf.bstatic.com/xdata/images/hotel/square600/254540323.webp?k=b022526836b3d3d4ea0cd7dd07109052b74013ab039ddf98e84d28565d429d1c&o=", "allPrice": 2766 },
    { "webName": "booking", "name": "台南艾莎公寓旅宿", "currency": "TWD", "oneNightPrice": 1600, "opinion": 8.8, "url": "https://www.booking.com/hotel/tw/elsa-house.zh-tw.html?label=zh-xt-tw-booking-desktop-EbyZWwQLwTW_IbH*0eHNCgS654267613595%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-65526620%3Alp1012818%3Ali%3Adec%3Adm&aid=2311236&ucfs=1&arphpl=1&checkin=2025-06-10&checkout=2025-06-12&dest_id=204689&dest_type=landmark&group_adults=1&req_adults=1&no_rooms=1&group_children=0&req_children=0&hpos=2&hapos=2&sr_order=popularity&srpvid=b5fd08bb43d603dc&srepoch=1737335676&all_sr_blocks=204865511_386500792_2_0_0&highlighted_blocks=204865511_386500792_2_0_0&matching_block_id=204865511_386500792_2_0_0&sr_pri_blocks=204865511_386500792_2_0_0__320040&from=searchresults", "img": "https://cf.bstatic.com/xdata/images/hotel/square600/495600704.webp?k=c98f2027b70ce49ad90fa20d8b9f6be2396cb5e00dd2f9b12d4663eb1a587ee0&o=", "allPrice": 3200 },
    { "webName": "booking", "name": "安平‧留飯店", "currency": "TWD", "oneNightPrice": 2550, "opinion": 8.9, "url": "https://www.booking.com/hotel/tw/de-leau-an-ping-liu-fan-dian-tai-nan12.zh-tw.html?label=zh-xt-tw-booking-desktop-EbyZWwQLwTW_IbH*0eHNCgS654267613595%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-65526620%3Alp1012818%3Ali%3Adec%3Adm&aid=2311236&ucfs=1&arphpl=1&checkin=2025-06-10&checkout=2025-06-12&dest_id=204689&dest_type=landmark&group_adults=1&req_adults=1&no_rooms=1&group_children=0&req_children=0&hpos=3&hapos=3&sr_order=popularity&srpvid=b5fd08bb43d603dc&srepoch=1737335676&all_sr_blocks=260876203_118388751_0_1_0&highlighted_blocks=260876203_118388751_0_1_0&matching_block_id=260876203_118388751_0_1_0&sr_pri_blocks=260876203_118388751_0_1_0__510008&from=searchresults", "img": "https://cf.bstatic.com/xdata/images/hotel/square600/198015219.webp?k=bbdd0840406a053a2ec0c3aca4d733a8c70a09932c77ee473ff991c5650a9d72&o=", "allPrice": 5100 },
    { "webName": "booking", "name": "米花弄", "currency": "TWD", "oneNightPrice": 1260, "opinion": 8.6, "url": "https://www.booking.com/hotel/tw/mi-hua-nong.zh-tw.html?label=zh-xt-tw-booking-desktop-EbyZWwQLwTW_IbH*0eHNCgS654267613595%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-65526620%3Alp1012818%3Ali%3Adec%3Adm&aid=2311236&ucfs=1&arphpl=1&checkin=2025-06-10&checkout=2025-06-12&dest_id=204689&dest_type=landmark&group_adults=1&req_adults=1&no_rooms=1&group_children=0&req_children=0&hpos=4&hapos=4&sr_order=popularity&srpvid=b5fd08bb43d603dc&srepoch=1737335676&all_sr_blocks=231802201_141506902_0_0_0&highlighted_blocks=231802201_141506902_0_0_0&matching_block_id=231802201_141506902_0_0_0&sr_pri_blocks=231802201_141506902_0_0_0__252000&from=searchresults", "img": "https://cf.bstatic.com/xdata/images/hotel/square600/251518372.webp?k=058b0c0d27d7a946469bb60b507598ca73cffaa0325d366f528835afc082fc56&o=", "allPrice": 2520 },
    { "webName": "booking", "name": "安平肯辛頓旅店", "currency": "TWD", "oneNightPrice": 1474, "opinion": 8.8, "url": "https://www.booking.com/hotel/tw/ken-xin-dun-lu-dian.zh-tw.html?label=zh-xt-tw-booking-desktop-EbyZWwQLwTW_IbH*0eHNCgS654267613595%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-65526620%3Alp1012818%3Ali%3Adec%3Adm&aid=2311236&ucfs=1&arphpl=1&checkin=2025-06-10&checkout=2025-06-12&dest_id=204689&dest_type=landmark&group_adults=1&req_adults=1&no_rooms=1&group_children=0&req_children=0&hpos=5&hapos=5&sr_order=popularity&srpvid=b5fd08bb43d603dc&srepoch=1737335676&all_sr_blocks=445919801_357100663_0_0_0&highlighted_blocks=445919801_357100663_0_0_0&matching_block_id=445919801_357100663_0_0_0&sr_pri_blocks=445919801_357100663_0_0_0__294840&from=searchresults", "img": "https://cf.bstatic.com/xdata/images/hotel/square600/175660188.webp?k=fe4d44dbf804b816b6303a9183b7b29c982ce0f66025d9423811dae652bb27c7&o=", "allPrice": 2948 },
    { "webName": "booking", "name": "道達旅店", "currency": "TWD", "oneNightPrice": 2330, "opinion": 8.8, "url": "https://www.booking.com/hotel/tw/dao-da-lu-dian-tainan.zh-tw.html?label=zh-xt-tw-booking-desktop-EbyZWwQLwTW_IbH*0eHNCgS654267613595%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-65526620%3Alp1012818%3Ali%3Adec%3Adm&aid=2311236&ucfs=1&arphpl=1&checkin=2025-06-10&checkout=2025-06-12&dest_id=204689&dest_type=landmark&group_adults=1&req_adults=1&no_rooms=1&group_children=0&req_children=0&hpos=6&hapos=6&sr_order=popularity&srpvid=b5fd08bb43d603dc&srepoch=1737335676&all_sr_blocks=322530805_247597069_0_1_0_676554&highlighted_blocks=322530805_247597069_0_1_0_676554&matching_block_id=322530805_247597069_0_1_0_676554&sr_pri_blocks=322530805_247597069_0_1_0_676554_465920&from=searchresults", "img": "https://cf.bstatic.com/xdata/images/hotel/square600/168932301.webp?k=ccfaa8099fe098a6728b5e1c83dd4832a0c9b3addffe40fcc74244c3d2091d84&o=", "allPrice": 4659 },
    { "webName": "booking", "name": "安平漫漫-預訂後聯繫才會保留", "currency": "TWD", "oneNightPrice": 1431, "opinion": 8.1, "url": "https://www.booking.com/hotel/tw/an-ping-xiao-mai-suo.zh-tw.html?label=zh-xt-tw-booking-desktop-EbyZWwQLwTW_IbH*0eHNCgS654267613595%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-65526620%3Alp1012818%3Ali%3Adec%3Adm&aid=2311236&ucfs=1&arphpl=1&checkin=2025-06-10&checkout=2025-06-12&dest_id=204689&dest_type=landmark&group_adults=1&req_adults=1&no_rooms=1&group_children=0&req_children=0&hpos=7&hapos=7&sr_order=popularity&srpvid=b5fd08bb43d603dc&srepoch=1737335676&all_sr_blocks=514676403_177793567_2_0_0&highlighted_blocks=514676403_177793567_2_0_0&matching_block_id=514676403_177793567_2_0_0&sr_pri_blocks=514676403_177793567_2_0_0__286200&from=searchresults", "img": "https://cf.bstatic.com/xdata/images/hotel/square600/491579130.webp?k=a296e7c7ef653653bcb1071e69251e29bf33bd0473e1d755494ff3502d1849fe&o=", "allPrice": 2862 },
    { "webName": "booking", "name": "旅幸福-啤酒花", "currency": "TWD", "oneNightPrice": 1901, "opinion": 8.7, "url": "https://www.booking.com/hotel/tw/pi-jiu-hua-lu-dian.zh-tw.html?label=zh-xt-tw-booking-desktop-EbyZWwQLwTW_IbH*0eHNCgS654267613595%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-65526620%3Alp1012818%3Ali%3Adec%3Adm&aid=2311236&ucfs=1&arphpl=1&checkin=2025-06-10&checkout=2025-06-12&dest_id=204689&dest_type=landmark&group_adults=1&req_adults=1&no_rooms=1&group_children=0&req_children=0&hpos=8&hapos=8&sr_order=popularity&srpvid=b5fd08bb43d603dc&srepoch=1737335676&all_sr_blocks=283821803_343185401_0_0_0&highlighted_blocks=283821803_343185401_0_0_0&matching_block_id=283821803_343185401_0_0_0&sr_pri_blocks=283821803_343185401_0_0_0__380160&from=searchresults", "img": "https://cf.bstatic.com/xdata/images/hotel/square600/407185560.webp?k=443a6a9e9afa14f885994fad4f5f3bcb89da4e04b6c134a57680d41b6a911f29&o=", "allPrice": 3802 },
    { "webName": "booking", "name": "捷喬商旅", "currency": "TWD", "oneNightPrice": 2195, "opinion": 7.8, "url": "https://www.booking.com/hotel/tw/tan-zuo-ma-li-shang-lu.zh-tw.html?label=zh-xt-tw-booking-desktop-EbyZWwQLwTW_IbH*0eHNCgS654267613595%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-65526620%3Alp1012818%3Ali%3Adec%3Adm&aid=2311236&ucfs=1&arphpl=1&checkin=2025-06-10&checkout=2025-06-12&dest_id=204689&dest_type=landmark&group_adults=1&req_adults=1&no_rooms=1&group_children=0&req_children=0&hpos=9&hapos=9&sr_order=popularity&srpvid=b5fd08bb43d603dc&srepoch=1737335676&all_sr_blocks=153589901_126268695_2_1_0&highlighted_blocks=153589901_126268695_2_1_0&matching_block_id=153589901_126268695_2_1_0&sr_pri_blocks=153589901_126268695_2_1_0__439020&from=searchresults", "img": "https://cf.bstatic.com/xdata/images/hotel/square600/331079279.webp?k=0847d33d45be906db9e8b60ab2546d9a8b77a44756a6f0c6492a0cd43290bab7&o=", "allPrice": 4390 },
    { "webName": "booking", "name": "台南星鑽國際商旅 Hua Hotel", "currency": "TWD", "oneNightPrice": 2430, "opinion": 8.4, "url": "https://www.booking.com/hotel/tw/xing-zuan-jin-hua-guo-ji-shang-lu.zh-tw.html?label=zh-xt-tw-booking-desktop-EbyZWwQLwTW_IbH*0eHNCgS654267613595%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-65526620%3Alp1012818%3Ali%3Adec%3Adm&aid=2311236&ucfs=1&arphpl=1&checkin=2025-06-10&checkout=2025-06-12&dest_id=204689&dest_type=landmark&group_adults=1&req_adults=1&no_rooms=1&group_children=0&req_children=0&hpos=10&hapos=10&sr_order=popularity&srpvid=b5fd08bb43d603dc&srepoch=1737335676&all_sr_blocks=282363315_201284208_2_2_0_443155&highlighted_blocks=282363315_201284208_2_2_0_443155&matching_block_id=282363315_201284208_2_2_0_443155&sr_pri_blocks=282363315_201284208_2_2_0_443155_486000&from=searchresults", "img": "https://cf.bstatic.com/xdata/images/hotel/square600/127539263.webp?k=255e5d2100903ea4b373006f887cbdfeab2d998025771b7ed6637c62b3794635&o=", "allPrice": 4860 },
    { "webName": "agoda", "name": "煙波大飯店台南館 (LakeShore Hotel Tainan)", "currency": "TWD", "oneNightPrice": 2429, "opinion": 9.1, "url": "https://www.agoda.com/zh-tw/lakeshore-hotel-tainan/hotel/tainan-tw.html?countryId=140&finalPriceView=1&isShowMobileAppPrice=false&cid=1922895&numberOfBedrooms=&familyMode=false&adults=1&children=0&rooms=1&maxRooms=0&checkIn=2025-06-10&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=TWD&isFreeOccSearch=false&tag=e9ea26c2-c046-468f-939d-97d11075d6e0&tspTypes=16,8,-1&los=2&searchrequestid=9d1ee67f-e1a2-404e-84d2-6820a8268a21", "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080618300079044533.jpg?ca=9&ce=1&s=450x450", "allPrice": 4858 },
    { "webName": "agoda", "name": "友愛街旅館 (U.I.J Hotel&Hostel (UIJ))", "currency": "TWD", "oneNightPrice": 797, "opinion": 9.4, "url": "https://www.agoda.com/zh-tw/u-i-j-hotel-hostel/hotel/tainan-tw.html?countryId=140&finalPriceView=1&isShowMobileAppPrice=false&cid=1922895&numberOfBedrooms=&familyMode=false&adults=1&children=0&rooms=1&maxRooms=0&checkIn=2025-06-10&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=TWD&isFreeOccSearch=false&tag=e9ea26c2-c046-468f-939d-97d11075d6e0&tspTypes=4,16,8,-1&los=2&searchrequestid=9d1ee67f-e1a2-404e-84d2-6820a8268a21", "img": "https://pix8.agoda.net/hotelImages/2727823/-1/277bf8966bae0110be210473277fd044.jpg?ce=0&s=450x450", "allPrice": 1594 },
    { "webName": "agoda", "name": "掘旅 (Journey Hostel)", "currency": "TWD", "oneNightPrice": 481, "opinion": 9.0, "url": "https://www.agoda.com/zh-tw/journey-hostel/hotel/tainan-tw.html?countryId=140&finalPriceView=1&isShowMobileAppPrice=false&cid=1922895&numberOfBedrooms=&familyMode=false&adults=1&children=0&rooms=1&maxRooms=0&checkIn=2025-06-10&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=TWD&isFreeOccSearch=false&tag=e9ea26c2-c046-468f-939d-97d11075d6e0&tspTypes=16&los=2&searchrequestid=9d1ee67f-e1a2-404e-84d2-6820a8268a21", "img": "https://pix8.agoda.net/hotelImages/1197332/-1/bdaf3f397fbe7eefaca57b4d67186ae4.jpg?ca=25&ce=0&s=450x450", "allPrice": 962 },
    { "webName": "agoda", "name": "立和商旅台南館 (LIHO Hotel Tainan)", "currency": "TWD", "oneNightPrice": 2002, "opinion": 7.7, "url": "https://www.agoda.com/zh-tw/ecfa-hotel-tainan/hotel/tainan-tw.html?countryId=140&finalPriceView=1&isShowMobileAppPrice=false&cid=1922895&numberOfBedrooms=&familyMode=false&adults=1&children=0&rooms=1&maxRooms=0&checkIn=2025-06-10&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=TWD&isFreeOccSearch=false&tag=e9ea26c2-c046-468f-939d-97d11075d6e0&los=2&searchrequestid=9d1ee67f-e1a2-404e-84d2-6820a8268a21", "img": "https://pix8.agoda.net/hotelImages/60410/-1/2e5457f6c6dd74c42e88ed55475c4b63.jpg?ca=29&ce=0&s=450x450", "allPrice": 4004 },
    { "webName": "agoda", "name": "台南行旅 (Hotel Leisure Tainan)", "currency": "TWD", "oneNightPrice": 550, "opinion": 9.0, "url": "https://www.agoda.com/zh-tw/oinn-hotel-hostel/hotel/tainan-tw.html?countryId=140&finalPriceView=1&isShowMobileAppPrice=false&cid=1922895&numberOfBedrooms=&familyMode=false&adults=1&children=0&rooms=1&maxRooms=0&checkIn=2025-06-10&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=TWD&isFreeOccSearch=false&tag=e9ea26c2-c046-468f-939d-97d11075d6e0&tspTypes=16,8,-1&los=2&searchrequestid=9d1ee67f-e1a2-404e-84d2-6820a8268a21", "img": "https://pix8.agoda.net/hotelImages/11148987/-1/5275d67ebf88953892e80b1447d15c03.jpg?ce=0&s=450x450", "allPrice": 1100 },
    { "webName": "agoda", "name": "路徒行旅 台南成大館 (Roaders Hotel Tainan Chengda)", "currency": "TWD", "oneNightPrice": 814, "opinion": 8.6, "url": "https://www.agoda.com/zh-tw/nan-fun-house-hotel/hotel/tainan-tw.html?countryId=140&finalPriceView=1&isShowMobileAppPrice=false&cid=1922895&numberOfBedrooms=&familyMode=false&adults=1&children=0&rooms=1&maxRooms=0&checkIn=2025-06-10&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=TWD&isFreeOccSearch=false&tag=e9ea26c2-c046-468f-939d-97d11075d6e0&tspTypes=7,16,8&los=2&searchrequestid=9d1ee67f-e1a2-404e-84d2-6820a8268a21", "img": "https://pix8.agoda.net/hotelImages/1637526/-1/06bb609ab69368438e39fb482aa4b69b.jpg?ce=0&s=450x450", "allPrice": 1628 },
    { "webName": "agoda", "name": "台南晶英酒店 (Silks Place Tainan)", "currency": "TWD", "oneNightPrice": 2859, "opinion": 9.2, "url": "https://www.agoda.com/zh-tw/silks-place-tainan/hotel/tainan-tw.html?countryId=140&finalPriceView=1&isShowMobileAppPrice=false&cid=1922895&numberOfBedrooms=&familyMode=false&adults=1&children=0&rooms=1&maxRooms=0&checkIn=2025-06-10&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=TWD&isFreeOccSearch=false&tag=e9ea26c2-c046-468f-939d-97d11075d6e0&tspTypes=15,16,8,-1&los=2&searchrequestid=9d1ee67f-e1a2-404e-84d2-6820a8268a21", "img": "https://pix8.agoda.net/hotelImages/624126/-1/e5471a1991df3e39ce2c41c90581545e.jpg?ca=16&ce=1&s=450x450", "allPrice": 5718 },
    { "webName": "agoda", "name": "路境行旅-台南西門館 (Finders Hotel Tainan Ximen - 路境行旅 台南西門館)", "currency": "TWD", "oneNightPrice": 868, "opinion": 8.6, "url": "https://www.agoda.com/zh-tw/best-hotel_2/hotel/tainan-tw.html?countryId=140&finalPriceView=1&isShowMobileAppPrice=false&cid=1922895&numberOfBedrooms=&familyMode=false&adults=1&children=0&rooms=1&maxRooms=0&checkIn=2025-06-10&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=TWD&isFreeOccSearch=false&tag=e9ea26c2-c046-468f-939d-97d11075d6e0&tspTypes=16&los=2&searchrequestid=9d1ee67f-e1a2-404e-84d2-6820a8268a21", "img": "https://pix8.agoda.net/hotelImages/55579306/-1/57d9d9ea0f950fea96b295563a0786c9.jpg?ce=0&s=450x450", "allPrice": 1736 },
    { "webName": "agoda", "name": "H& 台南微醺文旅 (H& Tainan Weshare Hotel)", "currency": "TWD", "oneNightPrice": 425, "opinion": 8.9, "url": "https://www.agoda.com/zh-tw/we-share-hostel_3/hotel/tainan-tw.html?countryId=140&finalPriceView=1&isShowMobileAppPrice=false&cid=1922895&numberOfBedrooms=&familyMode=false&adults=1&children=0&rooms=1&maxRooms=0&checkIn=2025-06-10&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=TWD&isFreeOccSearch=false&tag=e9ea26c2-c046-468f-939d-97d11075d6e0&tspTypes=3,16&los=2&searchrequestid=9d1ee67f-e1a2-404e-84d2-6820a8268a21", "img": "https://pix8.agoda.net/hotelImages/29838917/-1/de1cc6cf6805c186368c3463962d0613.jpg?ca=28&ce=0&s=450x450", "allPrice": 850 },
    { "webName": "agoda", "name": "泊樂行旅 - 赤崁店 (Hotel Brown - Chihkan Branch)", "currency": "TWD", "oneNightPrice": 1039, "opinion": 8.5, "url": "https://www.agoda.com/zh-tw/hotel-brown-chihkan-branch/hotel/tainan-tw.html?countryId=140&finalPriceView=1&isShowMobileAppPrice=false&cid=1922895&numberOfBedrooms=&familyMode=false&adults=1&children=0&rooms=1&maxRooms=0&checkIn=2025-06-10&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=TWD&isFreeOccSearch=false&tag=e9ea26c2-c046-468f-939d-97d11075d6e0&tspTypes=9,16&los=2&searchrequestid=9d1ee67f-e1a2-404e-84d2-6820a8268a21", "img": "https://pix8.agoda.net/hotelImages/1637358/-1/e5430584d8567c86beb042f43e791087.jpg?ca=24&ce=0&s=450x450", "allPrice": 2078 },
    { "webName": "agoda", "name": "友愛街旅館 (U.I.J Hotel&Hostel (UIJ))", "currency": "TWD", "oneNightPrice": 797, "opinion": 9.4, "url": "https://www.agoda.com/zh-tw/u-i-j-hotel-hostel/hotel/tainan-tw.html?countryId=140&finalPriceView=1&isShowMobileAppPrice=false&cid=1922895&numberOfBedrooms=&familyMode=false&adults=1&children=0&rooms=1&maxRooms=0&checkIn=2025-06-10&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=TWD&isFreeOccSearch=false&tag=e9ea26c2-c046-468f-939d-97d11075d6e0&tspTypes=4,16,8,-1&los=2&searchrequestid=9d1ee67f-e1a2-404e-84d2-6820a8268a21", "img": "https://pix8.agoda.net/hotelImages/2727823/-1/277bf8966bae0110be210473277fd044.jpg?ce=0&s=450x450", "allPrice": 1594 },
    { "webName": "agoda", "name": "煙波大飯店台南館 (LakeShore Hotel Tainan)", "currency": "TWD", "oneNightPrice": 2429, "opinion": 9.1, "url": "https://www.agoda.com/zh-tw/lakeshore-hotel-tainan/hotel/tainan-tw.html?countryId=140&finalPriceView=1&isShowMobileAppPrice=false&cid=1922895&numberOfBedrooms=&familyMode=false&adults=1&children=0&rooms=1&maxRooms=0&checkIn=2025-06-10&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=TWD&isFreeOccSearch=false&tag=e9ea26c2-c046-468f-939d-97d11075d6e0&tspTypes=16,8,-1&los=2&searchrequestid=9d1ee67f-e1a2-404e-84d2-6820a8268a21", "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080618300079044533.jpg?ca=9&ce=1&s=450x450", "allPrice": 4858 },
    { "webName": "agoda", "name": "掘旅 (Journey Hostel)", "currency": "TWD", "oneNightPrice": 481, "opinion": 9.0, "url": "https://www.agoda.com/zh-tw/journey-hostel/hotel/tainan-tw.html?countryId=140&finalPriceView=1&isShowMobileAppPrice=false&cid=1922895&numberOfBedrooms=&familyMode=false&adults=1&children=0&rooms=1&maxRooms=0&checkIn=2025-06-10&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=TWD&isFreeOccSearch=false&tag=e9ea26c2-c046-468f-939d-97d11075d6e0&tspTypes=16&los=2&searchrequestid=9d1ee67f-e1a2-404e-84d2-6820a8268a21", "img": "https://pix8.agoda.net/hotelImages/1197332/-1/bdaf3f397fbe7eefaca57b4d67186ae4.jpg?ca=25&ce=0&s=450x450", "allPrice": 962 },
    { "webName": "agoda", "name": "立和商旅台南館 (LIHO Hotel Tainan)", "currency": "TWD", "oneNightPrice": 2002, "opinion": 7.7, "url": "https://www.agoda.com/zh-tw/ecfa-hotel-tainan/hotel/tainan-tw.html?countryId=140&finalPriceView=1&isShowMobileAppPrice=false&cid=1922895&numberOfBedrooms=&familyMode=false&adults=1&children=0&rooms=1&maxRooms=0&checkIn=2025-06-10&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=TWD&isFreeOccSearch=false&tag=e9ea26c2-c046-468f-939d-97d11075d6e0&los=2&searchrequestid=9d1ee67f-e1a2-404e-84d2-6820a8268a21", "img": "https://pix8.agoda.net/hotelImages/60410/-1/2e5457f6c6dd74c42e88ed55475c4b63.jpg?ca=29&ce=0&s=450x450", "allPrice": 4004 },
    { "webName": "agoda", "name": "台南行旅 (Hotel Leisure Tainan)", "currency": "TWD", "oneNightPrice": 550, "opinion": 9.0, "url": "https://www.agoda.com/zh-tw/oinn-hotel-hostel/hotel/tainan-tw.html?countryId=140&finalPriceView=1&isShowMobileAppPrice=false&cid=1922895&numberOfBedrooms=&familyMode=false&adults=1&children=0&rooms=1&maxRooms=0&checkIn=2025-06-10&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=TWD&isFreeOccSearch=false&tag=e9ea26c2-c046-468f-939d-97d11075d6e0&tspTypes=16,8,-1&los=2&searchrequestid=9d1ee67f-e1a2-404e-84d2-6820a8268a21", "img": "https://pix8.agoda.net/hotelImages/11148987/-1/5275d67ebf88953892e80b1447d15c03.jpg?ce=0&s=450x450", "allPrice": 1100 },
    { "webName": "agoda", "name": "路徒行旅 台南成大館 (Roaders Hotel Tainan Chengda)", "currency": "TWD", "oneNightPrice": 814, "opinion": 8.6, "url": "https://www.agoda.com/zh-tw/nan-fun-house-hotel/hotel/tainan-tw.html?countryId=140&finalPriceView=1&isShowMobileAppPrice=false&cid=1922895&numberOfBedrooms=&familyMode=false&adults=1&children=0&rooms=1&maxRooms=0&checkIn=2025-06-10&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=TWD&isFreeOccSearch=false&tag=e9ea26c2-c046-468f-939d-97d11075d6e0&tspTypes=7,16,8&los=2&searchrequestid=9d1ee67f-e1a2-404e-84d2-6820a8268a21", "img": "https://pix8.agoda.net/hotelImages/1637526/-1/06bb609ab69368438e39fb482aa4b69b.jpg?ce=0&s=450x450", "allPrice": 1628 },
    { "webName": "agoda", "name": "台南晶英酒店 (Silks Place Tainan)", "currency": "TWD", "oneNightPrice": 2859, "opinion": 9.2, "url": "https://www.agoda.com/zh-tw/silks-place-tainan/hotel/tainan-tw.html?countryId=140&finalPriceView=1&isShowMobileAppPrice=false&cid=1922895&numberOfBedrooms=&familyMode=false&adults=1&children=0&rooms=1&maxRooms=0&checkIn=2025-06-10&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=TWD&isFreeOccSearch=false&tag=e9ea26c2-c046-468f-939d-97d11075d6e0&tspTypes=15,16,8,-1&los=2&searchrequestid=9d1ee67f-e1a2-404e-84d2-6820a8268a21", "img": "https://pix8.agoda.net/hotelImages/624126/-1/e5471a1991df3e39ce2c41c90581545e.jpg?ca=16&ce=1&s=450x450", "allPrice": 5718 },
    { "webName": "agoda", "name": "路境行旅-台南西門館 (Finders Hotel Tainan Ximen - 路境行旅 台南西門館)", "currency": "TWD", "oneNightPrice": 868, "opinion": 8.6, "url": "https://www.agoda.com/zh-tw/best-hotel_2/hotel/tainan-tw.html?countryId=140&finalPriceView=1&isShowMobileAppPrice=false&cid=1922895&numberOfBedrooms=&familyMode=false&adults=1&children=0&rooms=1&maxRooms=0&checkIn=2025-06-10&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=TWD&isFreeOccSearch=false&tag=e9ea26c2-c046-468f-939d-97d11075d6e0&tspTypes=16&los=2&searchrequestid=9d1ee67f-e1a2-404e-84d2-6820a8268a21", "img": "https://pix8.agoda.net/hotelImages/55579306/-1/57d9d9ea0f950fea96b295563a0786c9.jpg?ce=0&s=450x450", "allPrice": 1736 },
    { "webName": "agoda", "name": "H& 台南微醺文旅 (H& Tainan Weshare Hotel)", "currency": "TWD", "oneNightPrice": 425, "opinion": 8.9, "url": "https://www.agoda.com/zh-tw/we-share-hostel_3/hotel/tainan-tw.html?countryId=140&finalPriceView=1&isShowMobileAppPrice=false&cid=1922895&numberOfBedrooms=&familyMode=false&adults=1&children=0&rooms=1&maxRooms=0&checkIn=2025-06-10&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=TWD&isFreeOccSearch=false&tag=e9ea26c2-c046-468f-939d-97d11075d6e0&tspTypes=3,16&los=2&searchrequestid=9d1ee67f-e1a2-404e-84d2-6820a8268a21", "img": "https://pix8.agoda.net/hotelImages/29838917/-1/de1cc6cf6805c186368c3463962d0613.jpg?ca=28&ce=0&s=450x450", "allPrice": 850 },
    { "webName": "agoda", "name": "泊樂行旅 - 赤崁店 (Hotel Brown - Chihkan Branch)", "currency": "TWD", "oneNightPrice": 1039, "opinion": 8.5, "url": "https://www.agoda.com/zh-tw/hotel-brown-chihkan-branch/hotel/tainan-tw.html?countryId=140&finalPriceView=1&isShowMobileAppPrice=false&cid=1922895&numberOfBedrooms=&familyMode=false&adults=1&children=0&rooms=1&maxRooms=0&checkIn=2025-06-10&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=TWD&isFreeOccSearch=false&tag=e9ea26c2-c046-468f-939d-97d11075d6e0&tspTypes=9,16&los=2&searchrequestid=9d1ee67f-e1a2-404e-84d2-6820a8268a21", "img": "https://pix8.agoda.net/hotelImages/1637358/-1/e5430584d8567c86beb042f43e791087.jpg?ca=24&ce=0&s=450x450", "allPrice": 2078 },
  ]

  ngOnInit(): void {
    if (this.dataService.hotelName){
      this.selectName = this.dataService.hotelName
    }

    console.log(this.dataService.hotelData);
    if (this.dataService.hotelData.findBooking && this.dataService.hotelData.findAgoda ){
      this.tabs = [{ name: 'booking', allData : false}, { name: 'agoda', allData : false}]
    }else if (this.dataService.hotelData.findBooking){
      this.tabs = [{ name: 'booking', allData : false}]
    }else if (this.dataService.hotelData.findAgoda) {
      this.tabs = [{ name: 'agoda', allData : false}]
    }else{
      this.tabs = [{ name: 'booking', allData : false}, { name: 'agoda', allData : false}]
    }
    this.activeTab = this.tabs[0].name;
    // this.openWeb(this.activeTab)

    this.openWeb(this.activeTab)
    // if (this.dataService.hotelData.findBooking == true){
    //   this.findBooking20();
    // }else if (this.dataService.hotelData.findAgoda == true){
    //   this.findAgoda20();
    // }
  }

  updata(webName:string){
    if (webName=="booking"){
      Array.prototype.push.apply(this.hotelData, this.bookingAllData);
      this.openWeb(webName);
    }
    if (webName=="agoda"){
      Array.prototype.push.apply(this.hotelData, this.agodaAllData);
      this.openWeb(webName);
    }
  }

  //切換tab
  openWeb(WebName: string): void {
    // if(this.getAgoda20 && this.getBooking20){
      this.activeTab = WebName;
      this.showData = [];
      for (let index = 0; index < this.hotelData.length; index++) {
        if(this.hotelData[index].webName == WebName ){
          this.showData.push(this.hotelData[index]);
        }
      }

    // }
  }

  search(){
    if(this.sortChoice == "價格:(低價優先)"){
      this.sortByPrice('asc');
    }
    if(this.sortChoice == "價格:(高價優先)"){
      this.sortByPrice('desc');
    }
    if(this.sortChoice == "評價:(低分優先)"){
      this.sortByOpinion('asc');
    }
    if(this.sortChoice == "評價:(高分優先)"){
      this.sortByOpinion('desc');
    }
    if (this.selectName!= undefined && this.selectName!=""){
      this.sortByName(this.selectName);
    }
  }

  sortByPrice(order: 'asc' | 'desc') {
    this.showData.sort((a, b) => {
      if (order === 'asc') {
        return a.oneNightPrice - b.oneNightPrice; // 升序排列
      } else {
        return b.oneNightPrice - a.oneNightPrice; // 降序排列
      }
    });
  }

  sortByOpinion(order: 'asc' | 'desc') {
    this.showData.sort((a, b) => {
      if (order === 'asc') {
        return a.opinion - b.opinion; // 升序排列
      } else {
        return b.opinion - a.opinion; // 降序排列
      }
    });
  }

  sortByName(keyWord:string) {
    this.showData.sort((a, b) => {
      const nameContainsA = (name: string) => name.includes(keyWord); // 判斷是否包含 'A' 或 'a'

      if (nameContainsA(a.name) && !nameContainsA(b.name)) {
        return -1; // a 排在前面
      } else if (!nameContainsA(a.name) && nameContainsA(b.name)) {
        return 1; // b 排在前面
      } else {
        return 0; // 保持原順序
      }
    });
  }

  findBooking20(){
    console.log(this.dataService.hotelData.checkinDate);
    console.log(this.dataService.hotelData.checkoutDate);
    let data = { "webName":"booking", "area":this.dataService.hotelData.area,
      "checkinDate": this.DateChange(this.dataService.hotelData.checkinDate),
      "checkoutDate":this.DateChange(this.dataService.hotelData.checkoutDate),
      "adults":this.dataService.hotelData.adults,
      "rooms":this.dataService.hotelData.rooms,
      "children":this.dataService.hotelData.children,
      "number":20
    }
    console.log(data);

    this.http.postApi('http://localhost:8080/accommodation/selectHotel',
      data
    )
    .subscribe((response : any) => {
      if(response.code == 200) {
        console.log(response.data);
        this.getBooking20 = true
        if (this.hotelData == undefined){
          this.hotelData = []
        }
        for (let index = 0; index < response.data.length; index++) {
          this.hotelData.push(response.data[index]);
        }

        this.openWeb(this.activeTab)
        if (this.dataService.hotelData.findAgoda == true){
          this.findAgoda20();
        }else{
          this.getAllBooking();
        }
      }else{
        if (this.dataService.hotelData.findAgoda == true){
          this.findAgoda20();
        }else{
          this.getAllBooking();
        }
        this.dialog.open(HintDialogComponent, {
          data:[response.message]
        });
      }
    })
  }

  findAgoda20(){
    console.log(this.dataService.hotelData.checkinDate);
    console.log(this.dataService.hotelData.checkoutDate);
    this.http.postApi('http://localhost:8080/accommodation/selectHotel',
      {
        "webName":"agoda",
        "area":this.dataService.hotelData.area,
        "checkinDate": this.DateChange(this.dataService.hotelData.checkinDate),
        "checkoutDate":this.DateChange(this.dataService.hotelData.checkoutDate),
        "adults":this.dataService.hotelData.adults,
        "rooms":this.dataService.hotelData.rooms,
        "children":this.dataService.hotelData.children,
        "number":20
      }
    )
    .subscribe((response : any) => {
      if(response.code == 200) {
        this.getAgoda20 = true
        if (this.hotelData == undefined){
          this.hotelData = []
        }
        console.log(response.data);
        for (let index = 0; index < response.data.length; index++) {
          this.hotelData.push(response.data[index]);
        }
        this.openWeb(this.activeTab)
        if (this.dataService.hotelData.findBooking == true){
          this.getAllBooking()
        }else if (this.dataService.hotelData.findAgoda == true){
          console.log("aaa");
          this.getAllAgoda()
        }
        //
        // 關閉agoda頁面loading
      }else{
        // this.getAllBooking()
        this.dialog.open(HintDialogComponent, {
          data:[response.message]
        });
      }
    })
  }
  getAllBooking(){

    //取得所有booking
    this.http.postApi('http://localhost:8080/accommodation/selectHotel',
      {
        "webName":"booking",
        "area":this.dataService.hotelData.area,
        "checkinDate": this.DateChange(this.dataService.hotelData.checkinDate),
        "checkoutDate":this.DateChange(this.dataService.hotelData.checkoutDate),
        "adults":this.dataService.hotelData.adults,
        "rooms":this.dataService.hotelData.rooms,
        "children":this.dataService.hotelData.children
      }
    )
    .subscribe((response : any) => {
      if(response.code == 200) {
        this.bookingAllData=response.data
        for (let index = 0; index < this.tabs.length; index++) {
          if (this.tabs[index].name == "booking"){
            this.tabs[index].allData = true
          }
          if (this.tabs[index].name == "agoda"){
            this.tabs[index].allData = true
          }
          if (this.dataService.hotelData.findAgoda == true){
            console.log("bbb");
            this.getAllAgoda()
          }

        }
      }else{
        if (this.dataService.hotelData.findAgoda == true){
          console.log("ccc");
          this.getAllAgoda()
        }
        this.dialog.open(HintDialogComponent, {
          data:[response.message]
        });
      }
    })
  }
  getAllAgoda(){
  // //取得所有agoda
    this.http.postApi('http://localhost:8080/accommodation/selectHotel',
      {
        "webName":"agoda",
        "area":this.dataService.hotelData.area,
        "checkinDate": this.DateChange(this.dataService.hotelData.checkinDate),
        "checkoutDate":this.DateChange(this.dataService.hotelData.checkoutDate),
        "adults":this.dataService.hotelData.adults,
        "rooms":this.dataService.hotelData.rooms,
        "children":this.dataService.hotelData.children
      }
    )
    .subscribe((response : any) => {
      if(response.code == 200) {
        this.agodaAllData=response.data
        for (let index = 0; index < this.tabs.length; index++) {
          if (this.tabs[index].name == "agoda"){
            this.tabs[index].allData = true
          }
        }
      }else{
        this.dialog.open(HintDialogComponent, {
          data:[response.message]
        });
      }
    })
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

  showRoom(choice : hotel){

    let checkIn = new Date(this.dataService.hotelData.checkinDate);
    let checkOut = new Date(this.dataService.hotelData.checkoutDate);
    let day = (checkOut.getTime() - checkIn.getTime())/ (1000 * 3600 * 24);

    this.dataService.hotelData.url = choice.url;
    this.loading = true
    console.log(choice.name);
    console.log(this.dataService.hotelData);
    this.dataService.hotelData.hotelName=choice.name
    this.dataService.hotelData.webName = choice.webName
    // this.http.postApi('http://localhost:8080/accommodation/getHotelRoom',
    //     {
    //       "webName":choice.webName,
    //       "url": choice.url
    //     }
    //   )
    //   .subscribe((response : any) => {

    //     if(response.code == 200) {
    //       console.log(response.data);
    //       let input = []
    //       if (choice.webName == "booking"){
    //         for (let index = 0; index < response.data.length; index++) {
    //           console.log(response.data[index].price);
    //           console.log(day);
    //           console.log(response.data[index].price / day);
    //           input.push({
    //       "roomType": response.data[index].roomType,
    //             "bedType": response.data[index].bedType,
    //             "currency": response.data[index].currency,
    //             "oneNightPrice":response.data[index].price / day,
    //             "allPrice": response.data[index].price,
    //             "hightFloor": response.data[index].hightFloor,
    //             "infantBed": response.data[index].infantBed,
    //             "notificationList": response.data[index].notificationList,
    //             "maxMemberAdults": response.data[index].maxMemberAdults,
    //             "maxMemberChildren": response.data[index].maxMemberChildren,
    //             "img": response.data[index].img,
    //             "number": 0
    //           });
    //         }
    //       }
    //       if (choice.webName == "agoda"){
    //         for (let index = 0; index < response.data.length; index++) {
    //           input.push({
    //             "roomType": response.data[index].roomType,
    //             "bedType": response.data[index].bedType,
    //             "currency": response.data[index].currency,
    //             "oneNightPrice":response.data[index].price ,
    //             "allPrice": response.data[index].price* day,
    //             "hightFloor": response.data[index].hightFloor,
    //             "infantBed": response.data[index].infantBed,
    //             "notificationList": response.data[index].notificationList,
    //             "maxMemberAdults": response.data[index].maxMemberAdults,
    //             "maxMemberChildren": response.data[index].maxMemberChildren,
    //             "img": response.data[index].img,
    //             "number": 0
    //           });
    //         }
    //       }
    //       this.dialogRef.close();
    //       this.dataService.hotelListData = response.data
    //       let dialogRef =this.dialog.open(RoomListComponent, {
    //         disableClose: true,
    //         width: '800px',
    //         height: '95%',
    //         maxWidth: '800px', // 限制最大寬度
    //         data: input
    //       });
    //       dialogRef.afterClosed().subscribe(result => {
    //         if (result){ // true 確認全部關閉dialog
    //           this.dialogRef.close();
    //         }else{
    //           this.loading = false
    //         }
    //       });

    //     }else{
    //       this.loading = false
    //       console.log(response.message);
    //     }
    //   })
    let data = [
      { "roomType": "經典房(特大床) (Classic King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 2429, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/48dfedb56a63fef147e88dda622090c2.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "經典房(特大床) (Classic King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 2649, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "可延至2025年6月6日 星期五扣款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/48dfedb56a63fef147e88dda622090c2.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "經典房(特大床) (Classic King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 2714, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/48dfedb56a63fef147e88dda622090c2.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "經典房(特大床) (Classic King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 2961, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "可延至2025年6月6日 星期五扣款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/48dfedb56a63fef147e88dda622090c2.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "經典房(特大床) (Classic King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 2477, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/48dfedb56a63fef147e88dda622090c2.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "經典房(特大床) (Classic King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 2702, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/48dfedb56a63fef147e88dda622090c2.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "經典房(特大床) (Classic King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 2769, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/48dfedb56a63fef147e88dda622090c2.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "經典房(特大床) (Classic King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 3020, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/48dfedb56a63fef147e88dda622090c2.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "經典房(特大床) (Classic King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 4416, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/48dfedb56a63fef147e88dda622090c2.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "經典房(特大床) (Classic King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 4416, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/48dfedb56a63fef147e88dda622090c2.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "經典房(特大床) (Classic King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 4935, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/48dfedb56a63fef147e88dda622090c2.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "經典房(特大床) (Classic King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 4935, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/48dfedb56a63fef147e88dda622090c2.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華房(特大床) (Deluxe King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 2500, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082317220092007144.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華房(特大床) (Deluxe King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 2727, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "可延至2025年6月6日 星期五扣款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082317220092007144.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華房(特大床) (Deluxe King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 2786, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082317220092007144.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華房(特大床) (Deluxe King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 3039, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "可延至2025年6月6日 星期五扣款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082317220092007144.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華房(特大床) (Deluxe King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 2551, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082317220092007144.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華房(特大床) (Deluxe King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 2782, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082317220092007144.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華房(特大床) (Deluxe King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 3218, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月6日 星期五前可免費取消", "可延至2025年6月4日 星期三扣款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082317220092007144.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華房(特大床) (Deluxe King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 3440, "hightFloor": false, "infantBed": null, "notificationList": [ "取消政策", "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082317220092007144.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華房(特大床) (Deluxe King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 4545, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082317220092007144.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華房(特大床) (Deluxe King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 4545, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082317220092007144.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華房(特大床) (Deluxe King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 5065, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082317220092007144.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華房(特大床) (Deluxe King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 5065, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082317220092007144.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華房(兩床) (Deluxe Twin Room)", "bedType": ["2張單人床"], "currency": "NT$", "price": 2500, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://q-xx.bstatic.com/xdata/images/hotel/max300/211540552.jpg?k=beae7461ddacb77d94a7f8097794fa927c31b2c7a81359856b6ba74cbb521061&o="},
      { "roomType": "豪華房(兩床) (Deluxe Twin Room)", "bedType": ["2張單人床"], "currency": "NT$", "price": 2727, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "可延至2025年6月6日 星期五扣款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://q-xx.bstatic.com/xdata/images/hotel/max300/211540552.jpg?k=beae7461ddacb77d94a7f8097794fa927c31b2c7a81359856b6ba74cbb521061&o="},
      { "roomType": "豪華房(兩床) (Deluxe Twin Room)", "bedType": ["2張單人床"], "currency": "NT$", "price": 2786, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://q-xx.bstatic.com/xdata/images/hotel/max300/211540552.jpg?k=beae7461ddacb77d94a7f8097794fa927c31b2c7a81359856b6ba74cbb521061&o="},
      { "roomType": "豪華房(兩床) (Deluxe Twin Room)", "bedType": ["2張單人床"], "currency": "NT$", "price": 3039, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "可延至2025年6月6日 星期五扣款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://q-xx.bstatic.com/xdata/images/hotel/max300/211540552.jpg?k=beae7461ddacb77d94a7f8097794fa927c31b2c7a81359856b6ba74cbb521061&o="},
      { "roomType": "豪華房(兩床) (Deluxe Twin Room)", "bedType": ["2張單人床"], "currency": "NT$", "price": 2551, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://q-xx.bstatic.com/xdata/images/hotel/max300/211540552.jpg?k=beae7461ddacb77d94a7f8097794fa927c31b2c7a81359856b6ba74cbb521061&o="},
      { "roomType": "豪華房(兩床) (Deluxe Twin Room)", "bedType": ["2張單人床"], "currency": "NT$", "price": 2782, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://q-xx.bstatic.com/xdata/images/hotel/max300/211540552.jpg?k=beae7461ddacb77d94a7f8097794fa927c31b2c7a81359856b6ba74cbb521061&o="},
      { "roomType": "豪華房(兩床) (Deluxe Twin Room)", "bedType": ["2張單人床"], "currency": "NT$", "price": 3218, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月6日 星期五前可免費取消", "可延至2025年6月4日 星期三扣款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://q-xx.bstatic.com/xdata/images/hotel/max300/211540552.jpg?k=beae7461ddacb77d94a7f8097794fa927c31b2c7a81359856b6ba74cbb521061&o="},
      { "roomType": "豪華房(兩床) (Deluxe Twin Room)", "bedType": ["2張單人床"], "currency": "NT$", "price": 3440, "hightFloor": false, "infantBed": null, "notificationList": [ "取消政策", "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://q-xx.bstatic.com/xdata/images/hotel/max300/211540552.jpg?k=beae7461ddacb77d94a7f8097794fa927c31b2c7a81359856b6ba74cbb521061&o="},
      { "roomType": "豪華房(兩床) (Deluxe Twin Room)", "bedType": ["2張單人床"], "currency": "NT$", "price": 4545, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://q-xx.bstatic.com/xdata/images/hotel/max300/211540552.jpg?k=beae7461ddacb77d94a7f8097794fa927c31b2c7a81359856b6ba74cbb521061&o="},
      { "roomType": "豪華房(兩床) (Deluxe Twin Room)", "bedType": ["2張單人床"], "currency": "NT$", "price": 4545, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://q-xx.bstatic.com/xdata/images/hotel/max300/211540552.jpg?k=beae7461ddacb77d94a7f8097794fa927c31b2c7a81359856b6ba74cbb521061&o="},
      { "roomType": "豪華房(兩床) (Deluxe Twin Room)", "bedType": ["2張單人床"], "currency": "NT$", "price": 5065, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://q-xx.bstatic.com/xdata/images/hotel/max300/211540552.jpg?k=beae7461ddacb77d94a7f8097794fa927c31b2c7a81359856b6ba74cbb521061&o="},
      { "roomType": "豪華房(兩床) (Deluxe Twin Room)", "bedType": ["2張單人床"], "currency": "NT$", "price": 5065, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://q-xx.bstatic.com/xdata/images/hotel/max300/211540552.jpg?k=beae7461ddacb77d94a7f8097794fa927c31b2c7a81359856b6ba74cbb521061&o="},
      { "roomType": "尊爵客房一大床 (Premier King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 2571, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080617580079043187.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "尊爵客房一大床 (Premier King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 2805, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "可延至2025年6月6日 星期五扣款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080617580079043187.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "尊爵客房一大床 (Premier King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 2857, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080617580079043187.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "尊爵客房一大床 (Premier King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 3117, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "可延至2025年6月6日 星期五扣款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080617580079043187.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "尊爵客房一大床 (Premier King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 2623, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080617580079043187.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "尊爵客房一大床 (Premier King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 2861, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080617580079043187.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "尊爵客房一大床 (Premier King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 3337, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月6日 星期五前可免費取消", "可延至2025年6月4日 星期三扣款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080617580079043187.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "尊爵客房一大床 (Premier King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 3567, "hightFloor": false, "infantBed": null, "notificationList": [ "取消政策", "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080617580079043187.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "尊爵客房一大床 (Premier King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 4675, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080617580079043187.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "尊爵客房一大床 (Premier King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 4675, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080617580079043187.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "尊爵客房一大床 (Premier King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 5195, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080617580079043187.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "尊爵客房一大床 (Premier King Room)", "bedType": ["1張特大床"], "currency": "NT$", "price": 5195, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080617580079043187.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住2人 (Deluxe Family Room for 2 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 2786, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112430084273673.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住2人 (Deluxe Family Room for 2 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 3039, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "可延至2025年6月6日 星期五扣款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112430084273673.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住2人 (Deluxe Family Room for 2 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 3071, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112430084273673.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住2人 (Deluxe Family Room for 2 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 3351, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "可延至2025年6月6日 星期五扣款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112430084273673.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住2人 (Deluxe Family Room for 2 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 2842, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112430084273673.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住2人 (Deluxe Family Room for 2 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 3100, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112430084273673.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住2人 (Deluxe Family Room for 2 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 3133, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112430084273673.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住2人 (Deluxe Family Room for 2 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 3418, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112430084273673.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住2人 (Deluxe Family Room for 2 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 5065, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112430084273673.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住2人 (Deluxe Family Room for 2 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 5065, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112430084273673.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住2人 (Deluxe Family Room for 2 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 5584, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112430084273673.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住2人 (Deluxe Family Room for 2 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 5584, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112430084273673.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住3人 (Deluxe Family Room for 3 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 3000, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 3, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112490084273910.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住3人 (Deluxe Family Room for 3 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 3273, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "可延至2025年6月6日 星期五扣款" ], "maxMemberAdults": 3, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112490084273910.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住3人 (Deluxe Family Room for 3 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 3429, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 3, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112490084273910.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住3人 (Deluxe Family Room for 3 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 3740, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "可延至2025年6月6日 星期五扣款" ], "maxMemberAdults": 3, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112490084273910.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住3人 (Deluxe Family Room for 3 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 3060, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112490084273910.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住3人 (Deluxe Family Room for 3 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 3338, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112490084273910.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住3人 (Deluxe Family Room for 3 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 3497, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112490084273910.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住3人 (Deluxe Family Room for 3 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 3815, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112490084273910.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住3人 (Deluxe Family Room for 3 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 5455, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 3, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112490084273910.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住3人 (Deluxe Family Room for 3 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 5455, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 3, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112490084273910.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住3人 (Deluxe Family Room for 3 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 6234, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 3, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112490084273910.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 - 可住3人 (Deluxe Family Room for 3 People)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 6234, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 3, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19112112490084273910.jpg?ca=9&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 (Deluxe Family Room)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 3214, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 4, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082115180091992611.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 (Deluxe Family Room)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 3506, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "可延至2025年6月6日 星期五扣款" ], "maxMemberAdults": 4, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082115180091992611.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 (Deluxe Family Room)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 3786, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 4, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082115180091992611.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 (Deluxe Family Room)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 4130, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "可延至2025年6月6日 星期五扣款" ], "maxMemberAdults": 4, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082115180091992611.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 (Deluxe Family Room)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 3279, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082115180091992611.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 (Deluxe Family Room)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 3577, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082115180091992611.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 (Deluxe Family Room)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 3862, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082115180091992611.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 (Deluxe Family Room)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 4213, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082115180091992611.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 (Deluxe Family Room)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 5844, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 4, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082115180091992611.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 (Deluxe Family Room)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 5844, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 4, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082115180091992611.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 (Deluxe Family Room)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 6883, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 4, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082115180091992611.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華家庭房 (Deluxe Family Room)", "bedType": ["2張雙人床"], "currency": "NT$", "price": 6883, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 4, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_20082115180091992611.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "小型套房 (Junior Suite)", "bedType": ["1張特大床"], "currency": "NT$", "price": 3500, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/5553ef3da67c14cecb170d1493c066a9.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "小型套房 (Junior Suite)", "bedType": ["1張特大床"], "currency": "NT$", "price": 3786, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/5553ef3da67c14cecb170d1493c066a9.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "小型套房 (Junior Suite)", "bedType": ["1張特大床"], "currency": "NT$", "price": 3818, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "可延至2025年6月6日 星期五扣款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/5553ef3da67c14cecb170d1493c066a9.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "小型套房 (Junior Suite)", "bedType": ["1張特大床"], "currency": "NT$", "price": 4130, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "可延至2025年6月6日 星期五扣款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/5553ef3da67c14cecb170d1493c066a9.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "小型套房 (Junior Suite)", "bedType": ["1張特大床"], "currency": "NT$", "price": 3571, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/5553ef3da67c14cecb170d1493c066a9.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "小型套房 (Junior Suite)", "bedType": ["1張特大床"], "currency": "NT$", "price": 3862, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/5553ef3da67c14cecb170d1493c066a9.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "小型套房 (Junior Suite)", "bedType": ["1張特大床"], "currency": "NT$", "price": 3895, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/5553ef3da67c14cecb170d1493c066a9.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "小型套房 (Junior Suite)", "bedType": ["1張特大床"], "currency": "NT$", "price": 4213, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/5553ef3da67c14cecb170d1493c066a9.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "小型套房 (Junior Suite)", "bedType": ["1張特大床"], "currency": "NT$", "price": 6364, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/5553ef3da67c14cecb170d1493c066a9.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "小型套房 (Junior Suite)", "bedType": ["1張特大床"], "currency": "NT$", "price": 6364, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/5553ef3da67c14cecb170d1493c066a9.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "小型套房 (Junior Suite)", "bedType": ["1張特大床"], "currency": "NT$", "price": 6883, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/5553ef3da67c14cecb170d1493c066a9.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "小型套房 (Junior Suite)", "bedType": ["1張特大床"], "currency": "NT$", "price": 6883, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/8495698/-1/5553ef3da67c14cecb170d1493c066a9.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華套房 (Deluxe Suite)", "bedType": ["1張大床"], "currency": "NT$", "price": 3714, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080618020079043416.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華套房 (Deluxe Suite)", "bedType": ["1張大床"], "currency": "NT$", "price": 4000, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080618020079043416.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華套房 (Deluxe Suite)", "bedType": ["1張大床"], "currency": "NT$", "price": 4052, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "可延至2025年6月6日 星期五扣款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080618020079043416.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華套房 (Deluxe Suite)", "bedType": ["1張大床"], "currency": "NT$", "price": 4364, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "可延至2025年6月6日 星期五扣款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080618020079043416.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華套房 (Deluxe Suite)", "bedType": ["1張大床"], "currency": "NT$", "price": 3789, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080618020079043416.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華套房 (Deluxe Suite)", "bedType": ["1張大床"], "currency": "NT$", "price": 4080, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080618020079043416.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華套房 (Deluxe Suite)", "bedType": ["1張大床"], "currency": "NT$", "price": 4133, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080618020079043416.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華套房 (Deluxe Suite)", "bedType": ["1張大床"], "currency": "NT$", "price": 4451, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 1, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080618020079043416.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華套房 (Deluxe Suite)", "bedType": ["1張大床"], "currency": "NT$", "price": 6753, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080618020079043416.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華套房 (Deluxe Suite)", "bedType": ["1張大床"], "currency": "NT$", "price": 6753, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080618020079043416.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華套房 (Deluxe Suite)", "bedType": ["1張大床"], "currency": "NT$", "price": 7273, "hightFloor": false, "infantBed": null, "notificationList": [ "2025年6月8日 星期日前可免費取消", "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080618020079043416.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
      { "roomType": "豪華套房 (Deluxe Suite)", "bedType": ["1張大床"], "currency": "NT$", "price": 7273, "hightFloor": false, "infantBed": null, "notificationList": [ "預訂後立即付款" ], "maxMemberAdults": 2, "maxMemberChildren": 0, "img": "https://pix8.agoda.net/hotelImages/849/8495698/8495698_19080618020079043416.jpg?ca=13&ce=1&s=2560x1440&ar=16x9"},
    ]
    let input = []
    for (let index = 0; index < data.length; index++) {
      input.push({
        "roomType": data[index].roomType,
        "bedType": data[index].bedType,
        "currency": data[index].currency,
        "oneNightPrice":data[index].price ,
        "allPrice": data[index].price,
        "hightFloor": data[index].hightFloor,
        "infantBed": data[index].infantBed,
        "notificationList": data[index].notificationList,
        "maxMemberAdults": data[index].maxMemberAdults,
        "maxMemberChildren": data[index].maxMemberChildren,
        "img": data[index].img,
        "number": 0
      });
    }
    console.log(input);

    let dialogRef =this.dialog.open(RoomListComponent, {
      disableClose: true,
      width: '800px',
      height: '95%',
      maxWidth: '800px', // 限制最大寬度
      data: input,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result){ // true 確認全部關閉dialog
        this.loading = false
        this.dialogRef.close();
      }
      this.loading = false
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
//------------------------------------------------
  //假資料
  //allData == true ->全部的資料loading完成
  // tabs = [
  //   { name: 'booking', allData : true , content: 'London is the capital city of England.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
  //   { name: 'agoda', allData : false ,content: 'Paris is the capital of France.' },
  //   { name: 'Tokyo', allData : true ,content: 'Tokyo is the capital of Japan.' }
  // ]; // 定義 tabs 資料
  // hotelData : hotel[] = [
  //   {"webName": "booking", "name": "雀客旅館新北蘆洲", "currency": "TWD", "price": 2559, "roomType": "經典四人房", "bedType": "2 張雙人床", "opinion": 8.5, "url": "https://www.booking.com/hotel/tw/f-hoteltai-bei-lu-zhou-guan.zh-tw.html?label=zh-xt-tw-booking-desktop-EbyZWwQLwTW_IbH*0eHNCgS654267613595%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-65526620%3Alp1012818%3Ali%3Adec%3Adm&aid=2311236&ucfs=1&arphpl=1&checkin=2025-06-10&checkout=2025-06-11&dest_id=-2637882&dest_type=city&group_adults=4&req_adults=4&no_rooms=1&group_children=0&req_children=0&hpos=1&hapos=1&sr_order=popularity&srpvid=a7950755519401f2&srepoch=1735088559&all_sr_blocks=513564505_204048932_0_2_0&highlighted_blocks=513564505_204048932_0_2_0&matching_block_id=513564505_204048932_0_2_0&sr_pri_blocks=513564505_204048932_0_2_0__255932&from=searchresults", "img": "https://cf.bstatic.com/xdata/images/hotel/square600/591886565.webp?k=001b23cca76b441ff9e1d2a7c7926af5564548a13b498ca3871841827c24ab43&o="},
  //   {"webName": "booking", "name": "台北天成大飯店", "currency": "TWD", "price": 4802, "roomType": "四人家庭房", "bedType": "2 張雙人床", "opinion": 8.4, "url": "https://www.booking.com/hotel/tw/cosmos-taipei.zh-tw.html?label=zh-xt-tw-booking-desktop-EbyZWwQLwTW_IbH*0eHNCgS654267613595%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-65526620%3Alp1012818%3Ali%3Adec%3Adm&aid=2311236&ucfs=1&arphpl=1&checkin=2025-06-10&checkout=2025-06-11&dest_id=-2637882&dest_type=city&group_adults=4&req_adults=4&no_rooms=1&group_children=0&req_children=0&hpos=2&hapos=2&sr_order=popularity&srpvid=a7950755519401f2&srepoch=1735088559&all_sr_blocks=29412209_117830288_0_2_0&highlighted_blocks=29412209_117830288_0_2_0&matching_block_id=29412209_117830288_0_2_0&sr_pri_blocks=29412209_117830288_0_2_0__480168&from=searchresults", "img": "https://cf.bstatic.com/xdata/images/hotel/square600/15252584.webp?k=99bb4b3f2b1eae01f3929e97ea9cc5db2808a766548fc41780d5d668da99b567&o="},
  //   {"webName": "booking", "name": "瑾旅南西館 Gininn NanXi", "currency": "TWD", "price": 1391, "roomType": "經典四人房", "bedType": "2 張雙人床", "opinion": 7.8, "url": "https://www.booking.com/hotel/tw/hua-da-lu-dian-nan-xi-guan.zh-tw.html?label=zh-xt-tw-booking-desktop-EbyZWwQLwTW_IbH*0eHNCgS654267613595%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-65526620%3Alp1012818%3Ali%3Adec%3Adm&aid=2311236&ucfs=1&arphpl=1&checkin=2025-06-10&checkout=2025-06-11&dest_id=-2637882&dest_type=city&group_adults=4&req_adults=4&no_rooms=1&group_children=0&req_children=0&hpos=3&hapos=3&sr_order=popularity&srpvid=a7950755519401f2&srepoch=1735088559&all_sr_blocks=969584707_395754126_4_0_0&highlighted_blocks=969584707_395754126_4_0_0&matching_block_id=969584707_395754126_4_0_0&sr_pri_blocks=969584707_395754126_4_0_0__139120&from=searchresults", "img": "https://cf.bstatic.com/xdata/images/hotel/square600/588911382.webp?k=e65d484ec5495c7f62ed5022153dadbbf236f26a798dba988d7c3da48846cd45&o="},
  //   {"webName": "booking", "name": "長虹飯店", "currency": "TWD", "price": 3588, "roomType": "豪華家庭房", "bedType": "2 張加大雙人床", "opinion": 8.2, "url": "https://www.booking.com/hotel/tw/rainbow-hotel.zh-tw.html?label=zh-xt-tw-booking-desktop-EbyZWwQLwTW_IbH*0eHNCgS654267613595%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-65526620%3Alp1012818%3Ali%3Adec%3Adm&aid=2311236&ucfs=1&arphpl=1&checkin=2025-06-10&checkout=2025-06-11&dest_id=-2637882&dest_type=city&group_adults=4&req_adults=4&no_rooms=1&group_children=0&req_children=0&hpos=4&hapos=4&sr_order=popularity&srpvid=a7950755519401f2&srepoch=1735088559&all_sr_blocks=58045705_379512060_4_0_0&highlighted_blocks=58045705_379512060_4_0_0&matching_block_id=58045705_379512060_4_0_0&sr_pri_blocks=58045705_379512060_4_0_0__358847&from=searchresults", "img": "https://cf.bstatic.com/xdata/images/hotel/square600/124581913.webp?k=003301e9e148c71d9c7a70066adc1ace19e8b125611ba4992c391351dfdcc07e&o="},
  //   {"webName": "booking", "name": "米窩飯店-站前館", "currency": "TWD", "price": 3185, "roomType": "標準四人房", "bedType": "2 張雙人床", "opinion": 7.9, "url": "https://www.booking.com/hotel/tw/water-meworld.zh-tw.html?label=zh-xt-tw-booking-desktop-EbyZWwQLwTW_IbH*0eHNCgS654267613595%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-65526620%3Alp1012818%3Ali%3Adec%3Adm&aid=2311236&ucfs=1&arphpl=1&checkin=2025-06-10&checkout=2025-06-11&dest_id=-2637882&dest_type=city&group_adults=4&req_adults=4&no_rooms=1&group_children=0&req_children=0&hpos=5&hapos=5&sr_order=popularity&srpvid=a7950755519401f2&srepoch=1735088559&all_sr_blocks=887791802_380183319_4_0_0&highlighted_blocks=887791802_380183319_4_0_0&matching_block_id=887791802_380183319_4_0_0&sr_pri_blocks=887791802_380183319_4_0_0__318533&from=searchresults", "img": "https://cf.bstatic.com/xdata/images/hotel/square600/508268051.webp?k=54ef31442b57b5fd7e2f4089de53383a8c6b61ebd7ea0a34a62d2e61d37f830c&o="},
  //   {"webName": "agoda", "name": "雀客旅館新北蘆洲", "currency": "TWD", "price": 2559, "roomType": "經典四人房", "bedType": "2 張雙人床", "opinion": 8.5, "url": "https://www.booking.com/hotel/tw/f-hoteltai-bei-lu-zhou-guan.zh-tw.html?label=zh-xt-tw-booking-desktop-EbyZWwQLwTW_IbH*0eHNCgS654267613595%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-65526620%3Alp1012818%3Ali%3Adec%3Adm&aid=2311236&ucfs=1&arphpl=1&checkin=2025-06-10&checkout=2025-06-11&dest_id=-2637882&dest_type=city&group_adults=4&req_adults=4&no_rooms=1&group_children=0&req_children=0&hpos=1&hapos=1&sr_order=popularity&srpvid=a7950755519401f2&srepoch=1735088559&all_sr_blocks=513564505_204048932_0_2_0&highlighted_blocks=513564505_204048932_0_2_0&matching_block_id=513564505_204048932_0_2_0&sr_pri_blocks=513564505_204048932_0_2_0__255932&from=searchresults", "img": "https://cf.bstatic.com/xdata/images/hotel/square600/591886565.webp?k=001b23cca76b441ff9e1d2a7c7926af5564548a13b498ca3871841827c24ab43&o="},
  //   {"webName": "agoda", "name": "台北天成大飯店", "currency": "TWD", "price": 4802, "roomType": "四人家庭房", "bedType": "2 張雙人床", "opinion": 8.4, "url": "https://www.booking.com/hotel/tw/cosmos-taipei.zh-tw.html?label=zh-xt-tw-booking-desktop-EbyZWwQLwTW_IbH*0eHNCgS654267613595%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-65526620%3Alp1012818%3Ali%3Adec%3Adm&aid=2311236&ucfs=1&arphpl=1&checkin=2025-06-10&checkout=2025-06-11&dest_id=-2637882&dest_type=city&group_adults=4&req_adults=4&no_rooms=1&group_children=0&req_children=0&hpos=2&hapos=2&sr_order=popularity&srpvid=a7950755519401f2&srepoch=1735088559&all_sr_blocks=29412209_117830288_0_2_0&highlighted_blocks=29412209_117830288_0_2_0&matching_block_id=29412209_117830288_0_2_0&sr_pri_blocks=29412209_117830288_0_2_0__480168&from=searchresults", "img": "https://cf.bstatic.com/xdata/images/hotel/square600/15252584.webp?k=99bb4b3f2b1eae01f3929e97ea9cc5db2808a766548fc41780d5d668da99b567&o="},
  //   {"webName": "agoda", "name": "瑾旅南西館 Gininn NanXi", "currency": "TWD", "price": 1391, "roomType": "經典四人房", "bedType": "2 張雙人床", "opinion": 7.8, "url": "https://www.booking.com/hotel/tw/hua-da-lu-dian-nan-xi-guan.zh-tw.html?label=zh-xt-tw-booking-desktop-EbyZWwQLwTW_IbH*0eHNCgS654267613595%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-65526620%3Alp1012818%3Ali%3Adec%3Adm&aid=2311236&ucfs=1&arphpl=1&checkin=2025-06-10&checkout=2025-06-11&dest_id=-2637882&dest_type=city&group_adults=4&req_adults=4&no_rooms=1&group_children=0&req_children=0&hpos=3&hapos=3&sr_order=popularity&srpvid=a7950755519401f2&srepoch=1735088559&all_sr_blocks=969584707_395754126_4_0_0&highlighted_blocks=969584707_395754126_4_0_0&matching_block_id=969584707_395754126_4_0_0&sr_pri_blocks=969584707_395754126_4_0_0__139120&from=searchresults", "img": "https://cf.bstatic.com/xdata/images/hotel/square600/588911382.webp?k=e65d484ec5495c7f62ed5022153dadbbf236f26a798dba988d7c3da48846cd45&o="},
  //   {"webName": "agoda", "name": "長虹飯店", "currency": "TWD", "price": 3588, "roomType": "豪華家庭房", "bedType": "2 張加大雙人床", "opinion": 8.2, "url": "https://www.booking.com/hotel/tw/rainbow-hotel.zh-tw.html?label=zh-xt-tw-booking-desktop-EbyZWwQLwTW_IbH*0eHNCgS654267613595%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-65526620%3Alp1012818%3Ali%3Adec%3Adm&aid=2311236&ucfs=1&arphpl=1&checkin=2025-06-10&checkout=2025-06-11&dest_id=-2637882&dest_type=city&group_adults=4&req_adults=4&no_rooms=1&group_children=0&req_children=0&hpos=4&hapos=4&sr_order=popularity&srpvid=a7950755519401f2&srepoch=1735088559&all_sr_blocks=58045705_379512060_4_0_0&highlighted_blocks=58045705_379512060_4_0_0&matching_block_id=58045705_379512060_4_0_0&sr_pri_blocks=58045705_379512060_4_0_0__358847&from=searchresults", "img": "https://cf.bstatic.com/xdata/images/hotel/square600/124581913.webp?k=003301e9e148c71d9c7a70066adc1ace19e8b125611ba4992c391351dfdcc07e&o="},
  //   {"webName": "agoda", "name": "米窩飯店-站前館", "currency": "TWD", "price": 3185, "roomType": "標準四人房", "bedType": "2 張雙人床", "opinion": 7.9, "url": "https://www.booking.com/hotel/tw/water-meworld.zh-tw.html?label=zh-xt-tw-booking-desktop-EbyZWwQLwTW_IbH*0eHNCgS654267613595%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-65526620%3Alp1012818%3Ali%3Adec%3Adm&aid=2311236&ucfs=1&arphpl=1&checkin=2025-06-10&checkout=2025-06-11&dest_id=-2637882&dest_type=city&group_adults=4&req_adults=4&no_rooms=1&group_children=0&req_children=0&hpos=5&hapos=5&sr_order=popularity&srpvid=a7950755519401f2&srepoch=1735088559&all_sr_blocks=887791802_380183319_4_0_0&highlighted_blocks=887791802_380183319_4_0_0&matching_block_id=887791802_380183319_4_0_0&sr_pri_blocks=887791802_380183319_4_0_0__318533&from=searchresults", "img": "https://cf.bstatic.com/xdata/images/hotel/square600/508268051.webp?k=54ef31442b57b5fd7e2f4089de53383a8c6b61ebd7ea0a34a62d2e61d37f830c&o="},

  //   // {webName: '', name: '', currency: '', price: 0, roomType: '', bedType: '', opinion: 0, url:'', img:''},
  // ]
  //------------------------------------------------
