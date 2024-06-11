import { Component, OnInit } from '@angular/core';
import { UserService } from '@app/user/service/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent implements OnInit {
  title = "subject three";
  isLoggedIn: boolean = false;
  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
    // Subscribe to the isLoggedIn observable to get the login status
    this.userService.isLoggedIn.subscribe(status => {
      this.isLoggedIn = status;
      console.log("登陆状态改变：" + status);
    });
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/']);
    // this.remotePart.sendDisconnect();
  }

  gotoSpace() {
    let token: string = this.userService.getUserToken();
    if (token == "") {
      console.warn("top-bar.component.ts::gotoSpace: not authorized.")
    }
    this.router.navigate(['space']);
  }

  gotoExamRecord() {
    let token: string = this.userService.getUserToken();
    if (token == "") {
      console.warn("top-bar.component.ts::gotoExamRecord: not authorized.");
    }
    this.router.navigate(['record']);
  }
}
