import { Component, OnInit } from '@angular/core';
import { DriverService } from '@app/user/service/driver.service';
import { UserService } from '@app/user/service/user.service';
import { SnackbarService } from '@app/utils/service/snackbar.service';

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

  driverPunishmentsDisplayedColumns: string[] = ['type', 'reason', 'score', 'created_at'];
  driverPunishments: any = [];


	editMode: boolean = false;
	button_msg: string = "modify";

  punishment_types_list: string[] = [];
  punishment_score_list: number[] = [];

	constructor(private userService: UserService, private driverService: DriverService, private snackBarService: SnackbarService) { }

	ngOnInit() {
    let self = this;
    this.userService.loadUserDetail(
      (resp)=>{
        let detail = self.userService.getUserDetail();
        self.setUserInfo(detail);
      },
      (resp)=>{}
    )
    
    this.driverService.fetchDriverPunishments(
      (resp) => {
        console.log("driver punishments: ", resp);
        for(let punishment of resp){
          self.driverPunishments.push({
            id: punishment.id,
            created_at: punishment.created_at,
            punishment_type: punishment.punishment_type,
            reason: punishment.reason,
            score: punishment.score,
          });
          const type: string = punishment.punishment_type;
          const score = punishment.score;
          const index = this.punishment_types_list.indexOf(type);
          if(index == -1){
            this.punishment_types_list.push(type);
            this.punishment_score_list.push(score);
          } else {
            this.punishment_score_list[index] += score;
          }
        }
      },
      (resp) => {
      }
    );

	}

	modify() {
    let self = this;
		if (this.editMode) {
			console.log("modify", this.userInfo);
			this.userService.modifyUserDetail(
        this.userInfo.gender,
        Number(this.userInfo.age),
        this.userInfo.phone,
        this.userInfo.email,
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
