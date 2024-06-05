import { Component, OnInit } from '@angular/core';
import { UserService } from '@app/user/service/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-space',
  
  templateUrl: './space.component.html',
  styleUrl: './space.component.css'
})
export class SpaceComponent implements OnInit{
  userInfo: any = {
		username: "",
    password: "",
    gender: "",
    age: 0,
    phone: "",
    email: "",
    point: 0,
    is_passed: false
	};

	editMode: boolean = false;
	button_msg: string = "modify";

	constructor(private userService: UserService) { }

	ngOnInit() {
		let detail: any = this.userService.getUserDetail();
    this.setUserInfo(detail);
    console.log(this.userInfo);
	}

	modify() {
    let self = this;
		if (this.editMode) {
			console.log(this.userInfo);
			this.userService.modifyUserDetail(
        this.userInfo.username,
        this.userInfo.password,
        this.userInfo.gender,
        this.userInfo.age,
        this.userInfo.phone,
        this.userInfo.email,
        this.userInfo.point,
        this.userInfo.is_passed,
        (resp) => {
          self.setUserInfo(resp);
          this.editMode = false;
				  this.button_msg = "modify";
        }, 
        (resp) => {}
      );
    } else {
      this.editMode = true;
			this.button_msg = "confirm";
    }
	}

  setUserInfo(detail: any){
    this.userInfo.username = detail.username,
    this.userInfo.password = detail.password,
    this.userInfo.gender = detail.gender,
    this.userInfo.age = detail.age,
    this.userInfo.phone = detail.phone,
    this.userInfo.email = detail.email,
    this.userInfo.point = detail.point,
    this.userInfo.is_passed = detail.is_passed
  }
}
