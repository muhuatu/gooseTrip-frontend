import { ChangeDetectorRef, Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HintDialogComponent } from '../../components/hint-dialog/hint-dialog.component';
import { HttpClientService } from '../../http-serve/http-client.service';
import { DataService } from '../../service/data.service';
import { CommonModule } from '@angular/common';
import { Loading } from '../../service/loading.service';

@Component({
  selector: 'app-update',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss',
})
export class UpdateComponent {
  constructor(
    private router: Router,
    public dialog: MatDialog,
    public dataService: DataService,
    private http: HttpClientService,
    private cdr: ChangeDetectorRef,
    private loading: Loading
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

  // 驗證會員資料
  mailError!: boolean;
  passwordError!: boolean;
  nameError!: boolean;
  phoneError!: boolean;

  ngOnInit(): void {

    this.loading.updateLoading(true);

    // 從 Session 導入會員資料
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    //console.log(user);

    if (user) {
      this.form.patchValue({
        userMail: user.userMail,
        userName: user.userName,
        userPhone: user.userPhone,
        userPassword: '', // 密碼保持空白不用幫使用者填
        userImage: user.userImage, // 好像可刪掉這行，待測試
      });
      this.selectedImage = user.userImage || '';
    }

    this.loading.updateLoading(false);
  }

  // 舊密碼
  isOldPasswordVisible = false;
  // 新密碼
  isNewPasswordVisible = false;
  // 切換舊密碼顯示
  toggleOldPasswordVisibility() {
    this.isOldPasswordVisible = !this.isOldPasswordVisible;
  }
  // 切換新密碼顯示
  toggleNewPasswordVisibility() {
    this.isNewPasswordVisible = !this.isNewPasswordVisible;
  }

  // 驗證區
  form: FormGroup = new FormGroup({
    userMail: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.maxLength(60),
    ]),
    oldPassword: new FormControl('', []), // 新增舊密碼欄位
    userPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(12),
    ]),
    userName: new FormControl('', [
      Validators.required,
      Validators.maxLength(50),
    ]),
    userPhone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^09\d{8}$/),
    ]),
  });

  // 設定選中的頭貼 URL
  selectImage(img: string) {
    this.selectedImage = img;
    this.form.get('userImage')?.setValue(img);
  }

  // 返回
  cancel() {
    this.router.navigate(['/user-info']);
  }

  // 更新會員資料
  update() {
    // 清空錯誤訊息
    this.errmessage = [];
    // 預設 false
    this.mailError = false;
    this.passwordError = false;
    this.nameError = false;
    this.phoneError = false;

    const controls = this.form.controls;

    // 如果有新密碼，檢查舊密碼
    if (this.form.get('userPassword')?.value) {
      this.form
        .get('userPassword')
        ?.setValidators([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(12),
        ]);
    } else {
      this.form.get('userPassword')?.clearValidators();
    }

    if (!this.form.get('userPassword')?.value) {
      this.form.get('oldPassword')?.clearValidators();
    } else {
      this.form.get('oldPassword')?.setValidators([Validators.required]);
    }

    this.form.get('userPassword')?.updateValueAndValidity();
    this.form.get('oldPassword')?.updateValueAndValidity();

    // 進行表單驗證
    if (this.form.invalid) {
      const controls = this.form.controls;

      if (controls['userMail'].invalid) {
        this.errmessage.push('電子郵件格式錯誤');
        this.mailError = true;
      }
      if (controls['userName'].invalid) {
        this.errmessage.push('名稱必填');
        this.nameError = true;
      }
      if (controls['userPhone'].invalid) {
        this.errmessage.push('手機格式共 10 碼數字');
        this.phoneError = true;
      }
      if (controls['userPassword'].invalid) {
        this.errmessage.push('密碼須為 8 到 12 個字');
        this.passwordError = true;
      }
      // 若表單有輸入新密碼但沒有舊密碼
      if (
        this.form.get('userPassword')?.value &&
        !this.form.get('oldPassword')?.value
      ) {
        this.errmessage.push('若需更新密碼，請輸入舊密碼以供驗證');
        this.passwordError = true;
      }

      this.dialog.open(HintDialogComponent, { data: this.errmessage });
      return;
    }

    // 連接更新會員資料API
    const req = {
      userMail: this.form.get('userMail')?.value,
      userOldPassword: this.form.get('oldPassword')?.value || null, // 修改密碼才兩者都要填
      userPassword: this.form.get('userPassword')?.value || null, // 修改密碼才兩者都要填
      userName: this.form.get('userName')?.value,
      userPhone: this.form.get('userPhone')?.value,
      userImage: this.selectedImage || null,
    };

    // console.log(req);
    this.loading.updateLoading(true);

    this.http.postApi('http://localhost:8080/user/update', req).subscribe({
      next: (res: any) => {
        //console.log(res);
        if (res.code == 200) {
          this.loading.updateLoading(false);
          // 通知登入狀態
          this.dataService.setLoginStatus(true);
          this.cdr.detectChanges(); // 更新畫面
          sessionStorage.setItem('isLogin', 'true');
          sessionStorage.setItem('user', JSON.stringify(res.user));
          this.dialog.open(HintDialogComponent, {
            data: ['會員資料更新成功！'],
          });
          // 更新資料到 dataService (後端會更新 Session 這個是否可不用更新?)
          this.dataService.updateUser(this.form.get('userMail')?.value);

          this.router.navigate(['/user-info']);
        } else {
          this.loading.updateLoading(false);
          this.dialog.open(HintDialogComponent, {
            data: res.message.split('\n'),
          });
        }
      },
      error: () => {
        this.loading.updateLoading(false);
        this.dialog.open(HintDialogComponent, {
          data: ['連線錯誤或伺服器無回應，請稍後再試'],
        });
      },
    });
  }
}
