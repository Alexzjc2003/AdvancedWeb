import {Component} from '@angular/core'
import {UserService} from "@app/user/service/user.service";
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: "./login.component.html",
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = "";
  password: string = "";
 
  constructor(private router: Router, private userService: UserService) {
  }

  login(){
    this.userService.login(this.username, this.password, (resp) => {
      this.router.navigate(['']);
    }, (resp) => {});
  }
}
