import { Component } from '@angular/core'
import {FormsModule} from "@angular/forms";


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
  constructor() {
  }

  login(username: string, password: string){
    console.log(username + " " + password);
  }
}
