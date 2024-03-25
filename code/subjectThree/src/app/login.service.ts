import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  // url = 'http://localhost:3000/locations';

  constructor() { }

  login(username: string, password: string): void{
    console.log(`${username}: ${password}`)
  }
}
