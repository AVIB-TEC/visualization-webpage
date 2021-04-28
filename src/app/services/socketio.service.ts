import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  socket:any;
  constructor() {}
  
  setupSocketConnection() {
  	if(this.socket===undefined){
      console.log(environment.SOCKET_ENDPOINT);
    	this.socket = io(environment.SOCKET_ENDPOINT);
  	}
    console.log("Socket",this.socket);
  }

  channelSubscribe(channel:string, callback){
    this.socket.on(channel, callback);
  }

  sendMessage(channel:string,message:string){  
    this.socket.emit(channel,message);
  }
}
