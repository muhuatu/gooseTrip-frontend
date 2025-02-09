import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef,MatDialog,MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClientService } from '../../http-serve/http-client.service';
import { DataService } from '../../service/data.service';
import { HintDialogComponent } from '../../components/hint-dialog/hint-dialog.component';
import { Loading } from '../../service/loading.service';

@Component({
  selector: 'app-forget-pwd-dialog',
  imports: [FormsModule, CommonModule],
  templateUrl: './forget-pwd-dialog.component.html',
  styleUrl: './forget-pwd-dialog.component.scss'
})
export class ForgetPwdDialogComponent {

  constructor(
    private http: HttpClientService,
    public dialog: MatDialog,
    public dataService: DataService,
    private dialogRef: MatDialogRef<ForgetPwdDialogComponent>, //用來關掉dialog
    private loading:Loading,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}

  verificationCode:string=''; //驗證碼
  isButtonDisabled: boolean = false; // 寄驗證信按鈕是否禁用
  countdown: number = 0; // 倒計時秒數
  newPassword:string='';
  mail:string='';

  send(){
    if(!this.mail){
      this.dialog.open(HintDialogComponent, {
        data:['請輸入信箱',]
      });
    }else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.mail)){
      this.dialog.open(HintDialogComponent, {
        data:['信箱格式錯誤',]
      });
    }else{
      let req={
        email: this.mail,
        register: false
      }
      this.loading.updateLoading(true);
      this.http
      .postApi('http://localhost:8080/user/send', req)
      .subscribe((res: any) => {
        if (res.code == 200) {
          this.disableButtonForOneMinute()
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

  isPasswordVisibility: boolean = false;

  // 密碼可見
  isPasswordVisibilityToggle() {
    this.isPasswordVisibility = !this.isPasswordVisibility;
    this.cdr.detectChanges();
  }


  onCancel(){
    this.dialogRef.close();
  }

  onConfirm(){
    let errmessage:string[]=[];
    if(!this.mail){
      errmessage.push('信箱未輸入')
    }else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.mail)){
      errmessage.push('信箱格式')
    };

    if(!this.verificationCode){
      errmessage.push('驗證碼未輸入')
    };

    if (!this.newPassword){
      errmessage.push('新密碼未輸入')
    }else if(this.newPassword.length>12 || this.newPassword.length<8){
      errmessage.push('密碼須為8至12位數')
    };

    if(errmessage.length!=0){
      this.dialog.open(HintDialogComponent, {
        data:errmessage
      });
    }else{
      let req={
        mail: this.mail,
        verificationCode: this.verificationCode,
        pwd: this.newPassword
      }
      this.http
      .postApi('http://localhost:8080/user/forget_pwd', req)
      .subscribe((res: any) => {
        if (res.code == 200) {
          this.dialog.open(HintDialogComponent, {
            data: ['密碼更新成功，請再登入'],
          });
          this.dialogRef.close();
        } else {
          this.dialog.open(HintDialogComponent, {
            data: [res.message,]
          });
        }
      });

    }
  }



}
