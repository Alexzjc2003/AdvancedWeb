// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-video-chat',
//   standalone: true,
//   imports: [],
//   templateUrl: './video-chat.component.html',
//   styleUrl: './video-chat.component.css'
// })
// export class VideoChatComponent {

// }
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-video-chat',
  standalone: true,
  templateUrl: './video-chat.component.html',
  styleUrls: ['./video-chat.component.css']
})
export class VideoChatComponent implements OnInit {
  private rtcPeerConnection: RTCPeerConnection | null;
  private ws: WebSocket | null;

  constructor() {
    this.rtcPeerConnection = null;
    this.ws = null;
  }

  ngOnInit(): void {
    const startButton = document.getElementById('startButton');
    const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
    const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
    const shareScreenButton = document.getElementById('shareScreenButton');

    if (startButton && shareScreenButton) {
      startButton.addEventListener('click', this.startVideoChat.bind(this));
      shareScreenButton.addEventListener('click', this.shareScreen.bind(this));
    }
  }

  startVideoChat(): void {
    const localVideo = document.getElementById('localVideo') as HTMLVideoElement;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.log('getUserMedia not supported');
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: { width: 500, height: 500 }, audio: true })
      .then(stream => {
        if ('srcObject' in localVideo) {
          localVideo.srcObject = stream;
        } else {
          console.log('srcObject not in localVideo');
          // localVideo.src = window.URL.createObjectURL(stream);
        }
        localVideo.play();

        this.rtcPeerConnection = new RTCPeerConnection();

        stream.getTracks().forEach(track => this.rtcPeerConnection!.addTrack(track, stream));

        this.rtcPeerConnection.onicecandidate = this.handleIceCandidate.bind(this);
        this.rtcPeerConnection.ontrack = this.handleRemoteStream.bind(this);

        // this.ws = new WebSocket('ws://advanced-web-backend-service/api/ws/video');
        // this.ws = new WebSocket('ws://10.117.245.17:58080/api/ws/video');
        this.ws = new WebSocket('wss://p.jingyijun.xyz/api/ws/video');

        this.ws.addEventListener('open', () => {
          console.log('Connected to the signaling server');
          this.ws!.addEventListener('message', this.handleSignalingData.bind(this));

          this.rtcPeerConnection!.createOffer()
            .then(offer => {
              this.rtcPeerConnection!.setLocalDescription(offer);
              this.ws!.send(JSON.stringify({ offer: offer }));
            });
        });

        this.ws.addEventListener('close', () => {
          console.log('Disconnected from the signaling server');
        });

        this.ws.addEventListener('error', (err: any) => {
          console.error(err.name + ': ' + err.message);
        });
      })
      .catch((err: any) => {
        console.error(err.name + ': ' + err.message);
      });
  }

  handleIceCandidate(event: RTCPeerConnectionIceEvent): void {
    if (event.candidate && this.ws) {
      this.ws.send(JSON.stringify({ iceCandidate: event.candidate }));
    }
  }

  handleRemoteStream(event: RTCTrackEvent): void {
    const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
    remoteVideo.srcObject = event.streams[0];
  }

  handleSignalingData(data: MessageEvent): void {
    const parsedData = JSON.parse(data.data);

    if (this.rtcPeerConnection) {
      if (parsedData.offer) {
        this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(parsedData.offer));
        this.rtcPeerConnection.createAnswer()
          .then(answer => this.rtcPeerConnection!.setLocalDescription(answer))
          .then(() => {
            if (this.ws) {
              this.ws.send(JSON.stringify({ answer: this.rtcPeerConnection!.localDescription }));
            }
          });
      } else if (parsedData.answer) {
        this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(parsedData.answer));
      } else if (parsedData.iceCandidate) {
        this.rtcPeerConnection.addIceCandidate(new RTCIceCandidate(parsedData.iceCandidate));
      }
    }
  }

  shareScreen(): void {
    const localVideo = document.getElementById('localVideo') as HTMLVideoElement;

    navigator.mediaDevices.getDisplayMedia({ video: true })
      .then(stream => {
        if ('srcObject' in localVideo) {
          localVideo.srcObject = stream;
        } else {
          console.log('srcObject not in localVideo');
          // localVideo.src = (window.URL.createObjectURL(stream) as any);
        }
        localVideo.play();

        // stream.getTracks().forEach(track => this.rtcPeerConnection.addTrack(track, stream));
      })
      .catch((err: any) => {
        console.error(err.name + ': ' + err.message);
      });
  }
}
