import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef,MatDialog,MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpClientService } from '../../http-serve/http-client.service';
import { DataService } from '../../service/data.service';
import { HintDialogComponent } from '../../components/hint-dialog/hint-dialog.component';
import { Loading } from '../../service/loading.service';

@Component({
  selector: 'app-mail-verification-dialog',
  imports: [FormsModule, CommonModule],
  templateUrl: './mail-verification-dialog.component.html',
  styleUrl: './mail-verification-dialog.component.scss'
})
export class MailVerificationDialogComponent {

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClientService,
    public dialog: MatDialog,
    public dataService: DataService,
    private dialogRef: MatDialogRef<MailVerificationDialogComponent>, //用來關掉dialog
    private loading:Loading,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}

  verificationCode:string=''; //驗證碼
  isButtonDisabled: boolean = false; // 寄驗證信按鈕是否禁用
  countdown: number = 0; // 倒計時秒數

  send(){
    this.disableButtonForOneMinute()
    this.cdr.detectChanges();

    let req={
      email: this.data.userMail,
      register: true
    }
    this.loading.updateLoading(true);
    this.http
    .postApi('http://localhost:8080/user/send', req)
    .subscribe((res: any) => {
      if (res.code == 200) {
        this.dialog.open(HintDialogComponent, {
          data: ['驗證信已寄出',]
        });
      } else {
        this.dialog.open(HintDialogComponent, {
          data: [res.message,]
        });
      }
      this.loading.updateLoading(false);
    });
  }

  disableButtonForOneMinute() {
    this.isButtonDisabled = true; // 禁用按鈕
    this.countdown = 60; // 倒計時設定為60秒

    const interval = setInterval(() => {
      this.countdown--;

      if (this.countdown <= 0) {
        clearInterval(interval); //清除計時器
        this.isButtonDisabled = false; //恢復按鈕可用
      }
    }, 1000); // 每秒更新一次倒計時
  }

  onCancel(){
    this.dialogRef.close();
  }

  onConfirm(){
    if(!this.verificationCode){
      this.dialog.open(HintDialogComponent, {
        data: ['請輸入驗證碼',]
      });
      return;
    }

    let reqq={
      mail: this.data.userMail,
      verificationCode: this.verificationCode,
    }

    this.loading.updateLoading(true);
    this.http
    .postApi('http://localhost:8080/user/verify-code', reqq)
    .subscribe((res: any) => {
      if (res.code == 200) {
        this.http.postApi('http://localhost:8080/user/register', this.data).subscribe({
          next: (res: any) => {
            console.log(res);
            if (res.code == 200) {
              // console.log(res.code);
              // 通知登入狀態
              this.dataService.setLoginStatus(true);
              this.cdr.detectChanges(); // 更新畫面
              sessionStorage.setItem('isLogin', 'true');
              sessionStorage.setItem('user', JSON.stringify(res.user));
              this.dataService.updateUser(this.data.userMail)
              this.dialog.open(HintDialogComponent, {
                data: ['註冊成功！即將跳轉至首頁'],
              });
              this.dialogRef.close();
              this.loading.updateLoading(false);
              this.router.navigate(['/homepage']);
            } else {
              this.dialog.open(HintDialogComponent, {
                data: res.message,
              });
            }
          },
          error: () => {
            this.dialog.open(HintDialogComponent, {
              data: ['註冊時連線錯誤或伺服器無回應，請稍後再試'],
            });
            this.loading.updateLoading(false);
          },
        });
      } else {
        this.dialog.open(HintDialogComponent, {
          data: [res.message,]
        });
      }
    });
  }
}
