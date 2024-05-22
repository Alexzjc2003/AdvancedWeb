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

  public onMessage(index: number, title: string): Observable<any> {
    return new Observable(observer => {
      const socket = this.socketList[index];
      socket.on(title, (data) => {
        observer.next(data);
      });
  
      return () => {
        socket.off(title);
      };
    });
  }
}
