import { Injectable } from '@angular/core';
import {environment} from "../environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  loginUrl: string = `${environment.apiUrl}/api/login`
  registerUrl: string = `${environment.apiUrl}/api/register`

  constructor() { }

  login(username: string, password: string): void{
    const postData = {
      "username": username,
      "password": password
    };
    console.log(postData)
  }

  register(username: string, password: string, gender: string, age: number, phone: string, email: string): void{
    const postData = {
      "username": username,
      "password": password,
      "gender": gender,
      "age": age,
      "phone": phone,
      "email": email
    };
    console.log(postData);
  }
}
