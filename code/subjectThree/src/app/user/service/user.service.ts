import { Injectable } from '@angular/core';
import { HttpRequestService } from '@app/utils/service/httprequest.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  loginUrl: string = "api/login";
  registerUrl: string = "api/register";

  constructor(private httpRequestService: HttpRequestService) { }

  login(username: string, password: string): void {
    const postData = {
      username: username,
      password: password,
    };

    this.httpRequestService.post(this.loginUrl, postData,
      resp => {
        console.log(resp);
      },

      resp => {
        console.log(resp);
      });
  }

  register(
    username: string,
    password: string,
    gender: string,
    age: number,
    phone: string,
    email: string
  ): void {
    const postData = {
      username: username,
      password: password,
      gender: gender,
      age: age,
      phone: phone,
      email: email,
    };

    this.httpRequestService.post(this.registerUrl, postData,
      resp => {
        console.log(resp);
      },

      resp => {
        console.log(resp);
      })
  }
}
