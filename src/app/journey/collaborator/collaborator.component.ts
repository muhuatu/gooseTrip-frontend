import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClientService } from '../../http-serve/http-client.service';
import { MatDialog } from '@angular/material/dialog';
import { HintDialogComponent } from '../../components/hint-dialog/hint-dialog.component';
import { ButtonDialogComponent } from '../../components/button-dialog/button-dialog.component';
import { MyJourneySizeService } from '../../service/my-journey-size.service';
import { JourneyResponse } from '../../interface/JourneyInter';
import { DataService } from '../../service/data.service';

@Component({
  selector: 'app-collaborator',
  imports: [],
  templateUrl: './collaborator.component.html',
  styleUrl: './collaborator.component.scss',
})
export class CollaboratorComponent {
  @Input() journey: any;
  list: collaboratorlist[] = [];

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClientService,
    public dialog: MatDialog,
    public dataService: DataService,
    public myJourneySizeService: MyJourneySizeService
  ) {}
  ngOnInit(): void {
    if (this.journey.journeyId) {
      let req = { journeyId: this.journey.journeyId };
      this.http
        .postApi('http://localhost:8080/user/find_collaborator', req)
        .subscribe((res: any) => {
          if (res.code == 200) {
            if (res.collaboratorlist.length != 0) {
              this.list = res.collaboratorlist;
              this.cdr.detectChanges();
            } else {
              this.dialog.open(HintDialogComponent, {
                data: ['你不在這個行程裡唷，請再次確認'],
              });
              this.myJourneySizeService.setSwitchToSpot(false);
              this.cdr.detectChanges();
            }
          } else {
            this.dialog.open(HintDialogComponent, {
              data: [res.message],
            });
          }
        });
    }
  }

  leave(mail: string, name: string) {
    let message: string = '';
    if (sessionStorage.getItem('userMail') == null) {
      this.dialog.open(HintDialogComponent, {
        data: ['請再次登入'],
      });
      this.myJourneySizeService.setSwitchToSpot(false);
      this.cdr.detectChanges();
      this.router.navigate(['/']);
    }
    if (mail == JSON.parse(sessionStorage.getItem('userMail')!)) {
      message = '確定要退出此行程嗎?';
    } else {
      message = '確定要將' + name + '退出嗎?';
    }

    let dialogRef = this.dialog.open(ButtonDialogComponent, {
      data: message,
      autoFocus: true,
      restoreFocus: true,
    });

    dialogRef.afterClosed().subscribe((res) => {
      //關閉後
      if (res) {
        let req = {
          journeyId: this.journey.journeyId,
          userMail: mail,
        };
        this.http
          .postApi('http://localhost:8080/user/leave_journey', req)
          .subscribe((res: any) => {
            if (res.code == 200) {
              if (mail == JSON.parse(sessionStorage.getItem('userMail')!)) {
                this.dialog.open(HintDialogComponent, {
                  data: ['已成功退出'],
                });
                //更新我的行程列表
                this.http
                  .getApi('http://localhost:8080/journey/getJourney')
                  .subscribe((res) => {
                    const journeyResponse = res as JourneyResponse;
                    console.log(journeyResponse);
                    if (journeyResponse.journeyList == null) {
                      this.dataService.updateJourneyList([]);
                    } else {
                      this.dataService.updateJourneyList(
                        journeyResponse.journeyList
                      );
                    }
                  });
                //要離開我的行程頁面
                this.myJourneySizeService.setSelectedTab('tab-1');
                this.myJourneySizeService.setSwitchToSpot(false);
                this.cdr.detectChanges();
              } else {
                this.dialog.open(HintDialogComponent, {
                  data: ['已成功將' + name + '退出'],
                });
                this.ngOnInit();
              }
            } else {
              this.dialog.open(HintDialogComponent, {
                data: [res.message],
              });
            }
          });
      }
    });
  }
}

export interface collaboratorlist {
  userMail: string;
  userName: string;
  userImage: string;
  invitation: string;
}
