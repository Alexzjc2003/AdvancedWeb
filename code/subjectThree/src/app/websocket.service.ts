import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  socket: any;

  constructor(){
  }

  public connect(url: string) {
    this.socket = io.io(url);
  }

  public sendMsg(title: string, body: any){
    if(this.socket != undefined){
      this.socket.emit(title, body);
    }
  }

  public onMessage(title: string): Observable<any> {
    return new Observable(observer => {
      this.socket.on(title, (data) => {
        observer.next(data);
      });
  
      return () => {
        this.socket.off(title);
      };
    });
  }
}
