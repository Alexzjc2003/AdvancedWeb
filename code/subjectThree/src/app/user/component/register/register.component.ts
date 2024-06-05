import {Component, inject} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {UserService} from "@app/user/service/user.service";

@Component({
  selector: 'app-register',
  templateUrl: "./register.component.html",
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  username: string = "";
  password: string = "";
  gender: string = "";
  age: number = 0;
  phone: string = "";
  email: string = "";


  registerService: UserService = inject(UserService);
  constructor() {
  }

  register(){
    this.registerService.register(this.username, this.password, this.gender, this.age, this.phone, this.email);
  }
}
