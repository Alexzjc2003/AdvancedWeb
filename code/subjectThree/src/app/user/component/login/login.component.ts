import { Component } from '@angular/core'
import { UserService } from "@app/user/service/user.service";
import { Router } from '@angular/router';
import { SnackbarService } from '@app/utils/service/snackbar.service';

@Component({
  selector: 'app-login',
  templateUrl: "./login.component.html",
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = "";
  password: string = "";

  constructor(private router: Router, private userService: UserService, private snackBarService: SnackbarService) {
  }

  // ngOnInit(): void {
  //   this.setBackgroundImage();
  // }

  login() {
    this.userService.login(this.username, this.password, (resp) => {
      this.snackBarService.showMessage("登陆成功！", 'success');
      this.router.navigate(['']);
    }, (resp) => {
      this.snackBarService.showMessage(resp.error.message, 'error');
    });
  }
  // private setBackgroundImage() {
  //   console.log('set background image');
  //   const mainContainer = document.getElementById('main-container');
  //   const img = new Image();
  //   img.src = '../../../../assets/icons/kobe.jpg';
  //   img.onload = () => {
  //     if (mainContainer) {
  //       mainContainer.style.backgroundImage = 'url("../../../../assets/icons/kobe.jpg")';
  //       // mainContainer.style.backgroundSize = 'cover';
  //       // mainContainer.style.backgroundPosition = 'center';
  //       // mainContainer.style.backgroundRepeat = 'no-repeat';
  //     }
  //   }
  //   img.onerror = () => {
  //     if (mainContainer) {
  //       mainContainer.style.backgroundColor = '#f0f0f0'; // 默认背景颜色
  //     }
  //   }
  // }

}
