import { Injectable } from '@angular/core';
import { LoadResourceService } from '@app/three/service/load-resource.service';
import { NotificationService } from '@app/three/service/notification.service';
import { UserService } from '@app/user/service/user.service';
import { WebSocketService } from '@app/utils/service/websocket.service';
import * as THREE from 'three';
import { LoadResourcePart } from './load-resource';



@Injectable({
    providedIn: 'root',
})
export class RemotePart {
    io: WebSocketService = new WebSocketService();
    socketId: string = "";
    remoteCars: Map<string, any> = new Map<string, any>();
    scene: any;
    roomId: string = "";
    constructor(private loadResourcePart: LoadResourcePart, private notification: NotificationService,
        private userService: UserService) { }

    setRoom(roomId: string, scene: THREE.Scene) {
        this.roomId = roomId;
        this.scene = scene;
    }

    init_websocket() {
        let self = this;
        this.io.connect('ws://10.117.245.17:53000/room');
        // this.io.connect('wss://p.jingyijun.xyz/room');
        this.io.onMessage('online').subscribe((obj: any) => {
            // console.log(obj);
            self.socketId = obj.id;
        });

        this.io.onMessage('update').subscribe((obj: any) => {
            // console.log("update", obj);
            self.handleUpdate(obj);
        });

        this.io.onMessage('offline').subscribe((obj: any) => {
            // console.log(obj);
            self.handleOffline(obj.id);
        });

        this.io.onMessage('message').subscribe((obj: any) => {
            // console.log(obj);
            self.handleChat(obj.id, obj.message);
        });
    }

    handleUpdate(remoteDataList: any[]) {
        let self = this;
        for (let remoteData of remoteDataList) {
            let remoteId = remoteData.id;
            if (remoteId == this.socketId) {
                continue;
            }
            let centerPosition = remoteData.position;
            let quaternion = remoteData.rotation;
            if (!this.remoteCars.has(remoteId)) {
                console.log("load remote car" + remoteId)
                self.remoteCars.set(remoteId, {
                    "obj": "default"
                });
                this.loadResourcePart.loadCarResouce(remoteData.model, (carObj) => {
                    carObj.position.set(centerPosition.x, centerPosition.y, centerPosition.z);
                    carObj.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);

                    self.scene.add(carObj);
                    self.remoteCars.set(remoteId, {
                        obj: carObj,
                    });
                });
            } else {
                let carObj = this.remoteCars.get(remoteId).obj;
                carObj.position.set(
                    centerPosition.x,
                    centerPosition.y,
                    centerPosition.z
                );
                carObj.quaternion.set(
                    quaternion.x,
                    quaternion.y,
                    quaternion.z,
                    quaternion.w
                );
            }
        }
    }

    handleOffline(socketId) {
        if (this.remoteCars.has(socketId)) {
            this.scene.remove(this.remoteCars.get(socketId).obj);
            this.remoteCars.delete(socketId);
        }
    }

    handleChat(fromId, message) {
        this.notification.showNotification(`${fromId}: ${message}`);
    }


    sendInit(model: any, model_name: string) {
        console.log('sendInit', this.roomId);
        let self = this;

        let UserID = 0;
        UserID = +this.userService.getUserId();
        this.io.sendMsg('init', {
            user_id: UserID,
            roomID: self.roomId,
            model: model_name,
            position: {
                x: model.obj.position.x,
                y: model.obj.position.y,
                z: model.obj.position.z,
            },
            rotation: {
                w: model.obj.quaternion.w,
                x: model.obj.quaternion.x,
                y: model.obj.quaternion.y,
                z: model.obj.quaternion.z,
            },
        });
    }

    sendChatMsg(chat_msg: string) {
        this.io.sendMsg('chat', {
            type: 'room',
            message: chat_msg,
        });
    }

    sendDisconnect() {
        this.io.sendMsg('disconnection', {});
    }

    updateSocket(model: any) {
        this.io.sendMsg('update', {
            position: {
                x: model.obj.position.x,
                y: model.obj.position.y,
                z: model.obj.position.z,
            },
            rotation: {
                w: model.obj.quaternion.w,
                x: model.obj.quaternion.x,
                y: model.obj.quaternion.y,
                z: model.obj.quaternion.z,
            },
        });
    }
}