import { Injectable, inject } from '@angular/core';
import { environment } from '../environment';
import { HttpRequestService } from './httprequest.service';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  loginUrl: string = `${environment.apiUrl}/api/login`;
  registerUrl: string = `${environment.apiUrl}/api/register`;
  httpService: HttpRequestService = inject(HttpRequestService);

  constructor() {}

  login(username: string, password: string): void {
    const postData = {
      username: username,
      password: password,
    };
    console.log(postData);
    axios
      .post(this.registerUrl, postData)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
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
    console.log(postData);

    axios
      .post(this.registerUrl, postData)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
