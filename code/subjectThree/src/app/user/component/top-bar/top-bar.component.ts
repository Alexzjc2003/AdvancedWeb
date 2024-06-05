import { Component, OnInit } from '@angular/core';
import { UserService } from '@app/user/service/user.service';

@Component({
  selector: 'app-top-bar', 
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent implements OnInit{
  title = "subject three";
  isLoggedIn: boolean = false;
  constructor(private userService: UserService) {}

  ngOnInit() {
    // Subscribe to the isLoggedIn observable to get the login status
    this.userService.isLoggedIn.subscribe(status => {
      this.isLoggedIn = status;
      console.log("登陆状态改变：" + status);
    });
  }

  logout(){
    this.userService.logout();
  }
}
