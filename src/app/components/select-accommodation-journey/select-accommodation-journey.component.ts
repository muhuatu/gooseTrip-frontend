import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef,MatDialog,MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { HttpClientService } from '../../http-serve/http-client.service';
import { DataService } from '../../service/data.service';
import { GoogleMapService } from '../../service/googlemap.service';
import { PlaceDialogComponent } from '../place-dialog/place-dialog.component';
import { HintDialogComponent } from '../hint-dialog/hint-dialog.component';
import { MyJourneySizeService } from '../../service/my-journey-size.service';
import { Journey } from '../../interface/JourneyInter';
import { DialogService } from '../../service/dialog.service';

@Component({
  selector: 'app-select-accommodation-journey',
  imports: [FormsModule, MatExpansionModule, CommonModule],
  templateUrl: './select-accommodation-journey.component.html',
  styleUrl: './select-accommodation-journey.component.scss'
})
export class SelectAccommodationJourneyComponent {
  selectedJourneyId!: number; //選擇的行程ID
  journeyList: Journey[] = [];
  accommodationSearchData:{
    journeyId: number;
    name: string;
    address: string;
  }={ journeyId: 0, name: '', address: '' };

  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<PlaceDialogComponent>, //用來關掉dialog
    public googleMapService: GoogleMapService,
    private cdr: ChangeDetectorRef,
    private http: HttpClientService,
    public dialog: MatDialog,
    public dataService: DataService,
    public myJourneySizeService: MyJourneySizeService,
    private dialogService: DialogService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}

  ngOnInit(): void {
    this.journeyList=this.data;
    //其實要打一隻api確認目前哪些行程有人正在編輯中???
  }

  onConfirm(): void {
    if (this.selectedJourneyId) {
      this.dataService.accommodationSearchData$.subscribe(data => {
        this.accommodationSearchData = data;
      });
      this.dataService.updateAccommodationSearchData({journeyId: this.selectedJourneyId,  name: this.accommodationSearchData.name, address: this.accommodationSearchData.address})
      this.myJourneySizeService.setSelectedTab('tab-2'); //開到住宿搜尋
      this.myJourneySizeService.setJourneyState(1); // 打開行程版面
      sessionStorage.removeItem('dialogPlaceId');
      this.dialogService.closePlaceDialog();
      this.journeyList.map((item) => {
        if (item.journeyId == this.selectedJourneyId) {
          this.dataService.updateNewJourney(item);
        }
      });
      this.dialogRef.close();
    }
  }

  onCancel(): void {
    this.dataService.updateAccommodationSearchData({journeyId: 0, name: '', address: ''})
    this.dialogRef.close();
  }

}
