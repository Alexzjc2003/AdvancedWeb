import { Injectable, numberAttribute } from '@angular/core';
import { Observable } from 'rxjs';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  socketList: io.Socket[];

  constructor(){
    this.socketList = [];
  }

  public connect(url: string) {
    const socket = io.io(url);
    let index = this.socketList.length;
    this.socketList.push(socket);
    return index;
  }

  public sendMsg(index: number, title: string, body: any){
    const socket = this.socketList[index];
    socket.emit(title, body);
  }
}
