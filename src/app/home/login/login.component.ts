import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink} from '@angular/router';
import { HttpClientService } from '../../http-serve/http-client.service';
import { DataService } from '../../service/data.service';
import { CommonModule } from '@angular/common';
import { HintDialogComponent } from '../../components/hint-dialog/hint-dialog.component';
import { MyJourneySizeService } from '../../service/my-journey-size.service';
import { JourneyResponse } from '../../interface/JourneyInter';
import { ForgetPwdDialogComponent } from '../forget-pwd-dialog/forget-pwd-dialog.component';
import { Loading } from '../../service/loading.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  constructor(private router:Router,public dialog: MatDialog,
    public dataService: DataService,private http:HttpClientService,
    private cdr: ChangeDetectorRef,public myJourneySizeService: MyJourneySizeService,
    private loading:Loading
  ) {}

  ngOnInit(): void {
    this.myJourneySizeService.setSwitchToSpot(false);
    this.myJourneySizeService.setJourneyState(0);
  }

  form:FormGroup=new FormGroup({
    account:new FormControl('',[Validators.required,Validators.email]),
    password:new FormControl('',[Validators.required,Validators.minLength(8),Validators.maxLength(12)])
   })

   //顯示密碼
  showPassword: boolean = false;
  passwordVisibility() {
    this.showPassword = !this.showPassword;
    this.cdr.detectChanges();
  }

  onEnter(){
    this.showCheckDialog();
  }

  //檢查
  accontError=false;
  passwordError=false;

  showCheckDialog() {
    this.accontError=false;
    this.passwordError=false;
    let errmessage:string[]=[];
    if(!this.form.get('account')?.valid){
      errmessage.push('請輸入電子信箱')
      this.accontError = true;
    };

    if (!this.form.get('password')?.valid){
      errmessage.push('請輸入8至12個字的密碼')
      this.passwordError = true;
    };

     if(errmessage.length!=0){
       let dialogRef =this.dialog.open(HintDialogComponent, {
         data:errmessage
       });
     }else{
      //  向後端確認user是否存在，如果存在就存進this.Shared.user
       let req={
         "userMail": this.form.get('account')?.value,
         "pwd": this.form.get('password')?.value
       }
       //後端確認是否存在該帳密，
       this.loading.updateLoading(true);
       this.http.postApi('http://localhost:8080/user/login', req)
       .subscribe((res:any) => {
         if(res.code==200){
          //更新我的行程列表
          this.http.getApi('http://localhost:8080/journey/getJourney').subscribe(
            (res) => {
              const journeyResponse = res as JourneyResponse;
              this.dataService.updateJourneyList(journeyResponse.journeyList);
            }
          );

          // 通知登入狀態
          this.dataService.setLoginStatus(true);
          this.cdr.detectChanges(); // 更新畫面
          this.dataService.keyword = JSON.parse(sessionStorage.getItem('searchKeyword') || '');
          sessionStorage.setItem('isLogin', 'true');
          sessionStorage.setItem('userMail', JSON.stringify(this.form.get('account')?.value));
          sessionStorage.setItem('user', JSON.stringify(res.user));
          this.dataService.updateUser(this.form.get('account')?.value)

        if(this.dataService.lastRouter=='/login' || this.dataService.lastRouter=='/register'){
          this.router.navigate([''])
        }else{
          this.router.navigate([this.dataService.lastRouter])
        }
        }else{
          errmessage.push(res.message)
          this.dialog.open(HintDialogComponent, {
            data:errmessage
          });
        }
        this.loading.updateLoading(false);
      })
    }
  }

  forgetPwd(){
    this.dialog.open(ForgetPwdDialogComponent, {data:'', width: '90vh'});
  }


  register() {
    this.router.navigate(['/register']);
  }

}
