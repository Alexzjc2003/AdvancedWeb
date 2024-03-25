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
    console.log(`${username} -- ${password}`)
  }

  register(username: string, password: string): void{
    console.log(`${username} -- ${password}`)
  }
}
