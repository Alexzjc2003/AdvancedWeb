import {Component, inject} from '@angular/core'
import {FormsModule} from "@angular/forms";
import {UserService} from "../user.service";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: "./login.component.html",
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = "";
  password: string = "";

  loginService: UserService = inject(UserService);
  constructor() {
  }

  login(){
    this.loginService.login(this.username, this.password);
  }
}
