import { ChangeDetectorRef, Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpClientService } from '../../http-serve/http-client.service';
import { DataService } from '../../service/data.service';
import { CommonModule } from '@angular/common';
import { HintDialogComponent } from '../../components/hint-dialog/hint-dialog.component';
import { MailVerificationDialogComponent } from '../../home/mail-verification-dialog/mail-verification-dialog.component';
import { Loading } from '../../service/loading.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  constructor(
    private router: Router,
    public dialog: MatDialog,
    public dataService: DataService,
    private http: HttpClientService,
    private cdr: ChangeDetectorRef,
    private loading:Loading
  ) { }

  // 會員填寫
  userMail!: string;
  userPassword!: string;
  userName!: string;
  userPhone!: string;
  selectedImage: string = ''; // 預設不選中任何頭貼

  // 頭貼路徑
  images = [
    'assets/avatar/Cat.jpeg',
    'assets/avatar/Rabbit.jpeg',
    'assets/avatar/Squirrel.jpeg',
    'assets/avatar/Meerkat.jpeg',
    'assets/avatar/Null_Goose.jpeg',
  ];

  // 錯誤訊息
  errmessage: string[] = [];

  // 驗證註冊會員資料
  mailError!: boolean;
  passwordError!: boolean;
  nameError!: boolean;
  phoneError!: boolean;
  isPasswordVisibility: boolean = false;

  // 密碼可見
  isPasswordVisibilityToggle() {
    this.isPasswordVisibility = !this.isPasswordVisibility;
    this.cdr.detectChanges();
  }

  // 驗證區
  form: FormGroup = new FormGroup({
    userMail: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.maxLength(60),
    ]),
    userPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(12),
    ]),
    userName: new FormControl('', [
      Validators.required,
      Validators.maxLength(30),
    ]),
    userPhone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^09\d{8}$/),
    ]),
  });

  // 返回
  cancel() {
    this.router.navigate(['/login']);
  }

  // 設定選中的頭貼 URL
  selectImage(img: string) {
    this.selectedImage = img;
    this.cdr.detectChanges();
  }

  register() {
    // 清空錯誤訊息
    this.errmessage = [];
    // 預設 false
    this.mailError = false;
    this.passwordError = false;
    this.nameError = false;
    this.phoneError = false;

    // 驗證
    if (this.form.invalid) {
      const controls = this.form.controls;
      if (controls['userMail'].invalid) {
        this.errmessage.push('信箱格式錯誤');
        this.mailError = true;
      }
      if (controls['userPassword'].invalid) {
        this.errmessage.push('密碼須為 8 到 12 個字');
        this.passwordError = true;
      }
      if (controls['userName'].invalid) {
        this.errmessage.push('名稱必填');
        this.nameError = true;
      }
      if (controls['userPhone'].invalid) {
        this.errmessage.push('手機格式錯誤');
        this.phoneError = true;
      }

      this.dialog.open(HintDialogComponent, { data: this.errmessage });
      return;
    }

    // 連接註冊API
    const data = {
      userMail: this.form.get('userMail')?.value,
      userName: this.form.get('userName')?.value,
      userPhone: this.form.get('userPhone')?.value,
      userPassword: this.form.get('userPassword')?.value,
      userImage: this.selectedImage || null,
    };

    let req = {
      email: this.form.get('userMail')?.value,
      register: true
    }
    this.loading.updateLoading(true);
    this.http
    .postApi('http://localhost:8080/user/send', req)
    .subscribe((res: any) => {
      if (res.code == 200) {
        this.loading.updateLoading(false);
        this.dialog.open(MailVerificationDialogComponent, {
          data: data,
          autoFocus: true,
          restoreFocus: true
        });
      } else {
        this.dialog.open(HintDialogComponent, {
          data: [res.message],
          autoFocus: true,
          restoreFocus: true
        });
      }
      this.loading.updateLoading(false);
    });

    // this.http.postApi('http://localhost:8080/user/register', req).subscribe({
    //   next: (res: any) => {
    //     console.log(res);
    //     if (res.code == 200) {
    //       console.log(res.code);
    //       // 通知登入狀態
    //       this.dataService.setLoginStatus(true);
    //       this.cdr.detectChanges(); // 更新畫面
    //       sessionStorage.setItem('isLogin', 'true');
    //       this.dialog.open(HintDialogComponent, {
    //         data: ['註冊成功！即將跳轉至首頁'],
    //       });
    //       this.router.navigate(['/homepage']);
    //     } else {
    //       this.dialog.open(HintDialogComponent, {
    //         data: res.message,
    //       });
    //     }
    //   },
    //   error: () => {
    //     this.dialog.open(HintDialogComponent, {
    //       data: ['連線錯誤或伺服器無回應，請稍後再試'],
    //     });
    //   },
    // });
  }
}
