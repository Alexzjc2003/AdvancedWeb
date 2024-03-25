import { Injectable } from '@angular/core';
import {environment} from "../environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  loginUrl: string = `${environment.apiUrl}/api/login`
  registerUrl: string = `${environment.apiUrl}/api/register`

  constructor() { }

  async login(username: string, password: string): Promise<boolean> {

    const postData = {username: username, password: password};
    try {
      const response = await fetch(this.loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      // 在这里可以处理登录成功的逻辑，比如保存用户信息到本地存储等
      return true;
    } catch (error) {
      console.error('Error logging in:', error);
      return false; // 登录失败
    }
  }

  register(username: string, password: string): void{
    console.log(`${username} -- ${password}`)
  }
}
