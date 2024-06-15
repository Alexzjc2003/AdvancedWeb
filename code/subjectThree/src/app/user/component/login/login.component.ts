import {Component} from '@angular/core'
import {UserService} from "@app/user/service/user.service";
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

  login(){
    this.userService.login(this.username, this.password, (resp) => {
      this.snackBarService.showMessage("登陆成功！", "success");
      this.router.navigate(['']);
    }, (resp) => {
      this.snackBarService.showMessage(resp.error.message, "error");
    });
  }
}
