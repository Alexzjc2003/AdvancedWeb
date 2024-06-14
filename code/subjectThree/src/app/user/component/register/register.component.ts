import {Component, inject} from '@angular/core';
import { Router } from '@angular/router';
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


  constructor(private router: Router, private userService: UserService) {
  }

  register(){
    this.userService.register(this.username, this.password, this.gender, this.age, this.phone, this.email,
      (resp) => {
        this.router.navigate(['/login']);
      }, (resp) => {});
  }
  isUnderage(): boolean {
    return this.age < 18;
  }
}
