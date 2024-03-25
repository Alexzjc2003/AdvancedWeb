import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // url = 'http://localhost:3000/locations';

  constructor() { }

  login(username: string, password: string): void{
    console.log(`${username}: ${password}`)
  }

  register(username: string, password: string): void{
    console.log(`${username} -- ${password}`)
  }
}
