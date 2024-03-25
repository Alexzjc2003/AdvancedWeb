import { Component, inject } from '@angular/core'
import {FormsModule} from "@angular/forms";
import {LoginService} from "../login.service";


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
  loginService: LoginService = inject(LoginService);
  constructor() {
  }

  login(username: string, password: string){
    this.loginService.login(username, password);
  }
}
