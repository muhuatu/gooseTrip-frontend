import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpClientService } from '../../http-serve/http-client.service';
import { DataService } from '../../service/data.service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HintDialogComponent } from '../../components/hint-dialog/hint-dialog.component';
import { ButtonDialogComponent } from '../../components/button-dialog/button-dialog.component';

@Component({
  selector: 'app-delete',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss',
})
export class DeleteComponent {
  constructor(
    private router: Router,
    public dialog: MatDialog,
    public dataService: DataService,
    private http: HttpClientService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {}

  selectedImage!: string;
  isPasswordVisibility: boolean = false;
  // 錯誤區
  errmessage: string[] = [];
  passwordError!: boolean;

  ngOnInit(): void {
    // 初始化表單
    this.form = this.fb.group({
      userMail: [{ value: '', disabled: true }],
      userName: [{ value: '', disabled: true }],
      userPhone: [{ value: '', disabled: true }],
      userPassword: [''],
      userImage: [''],
    });

    // 從 Session 導入會員資料
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    // console.log(user);

    if (user) {
      this.form.patchValue({
        userMail: user.userMail,
        userName: user.userName,
        userPhone: user.userPhone,
        userPassword: '', // 密碼保持空白不用填給使用者
        userImage: user.userImage,
      });
      this.selectedImage = user.userImage || '';
    }
  }

  // 密碼可見
  isPasswordVisibilityToggle() {
    this.isPasswordVisibility = !this.isPasswordVisibility;
  }

  // 驗證區
  form: FormGroup = new FormGroup({
    userPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(12),
    ]),
  });

  cancel() {
    this.router.navigate(['/user-info']);
  }

  // 刪除會員資料
  delete() {
    // 確認刪除dialog
    const dialogRef = this.dialog.open(ButtonDialogComponent, {
      data:
        '您確定要刪除會員資料嗎？\n刪除後資料將無法復原。'
      ,
      autoFocus: true,
      restoreFocus: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // 取得要傳給後端的 req
        const req = {
          userMail: this.form.get('userMail')?.value,
          userPassword: this.form.get('userPassword')?.value,
        };
        //console.log(req);

        // 連接更新會員資料API
        this.http.postApi('http://localhost:8080/user/delete', req).subscribe({
          next: (res: any) => {
            //console.log(res);
            if (res.code == 200) {
              this.dataService.setLoginStatus(false); // 登出
              sessionStorage.removeItem('isLogin');
              this.cdr.detectChanges(); // 更新畫面
              this.dialog.open(HintDialogComponent, {
                data: ['會員資料已刪除'],
              });
              this.router.navigate(['/homepage']);
            } else {
              this.dialog.open(HintDialogComponent, {
                data: res.message.split('\n'),
              });
            }
          },
          error: () => {
            this.dialog.open(HintDialogComponent, {
              data: ['連線錯誤或伺服器無回應，請稍後再試'],
            });
          },
        });
      }
    });
  }
}
