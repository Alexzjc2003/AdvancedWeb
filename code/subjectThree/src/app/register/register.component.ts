import {Component, inject} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {UserService} from "../user.service";

@Component({
  selector: 'app-register',
  standalone: true,
    imports: [
        FormsModule
    ],
  templateUrl: "./register.component.html",
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerService: UserService = inject(UserService);
  constructor() {
  }

  register(username: string, password: string){
    this.registerService.register(username, password);
  }

}
