import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  RTCMessageType,
  SocketDataMsg,
} from 'src/app/interfaces/chat.interface';
import { ChatService } from 'src/app/services/chat.service';

const offerOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

const config = {
  audio: true,
  video: true,
};

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss'],
})
export class MediaComponent implements AfterViewInit {
  private localVideo!: HTMLVideoElement;
  private remoteVideo!: HTMLVideoElement;

  public callBtnClass: 'hangup' | 'make-call' = 'hangup';
  public localStream: MediaStream | null;
  private rtcPeer!: RTCPeerConnection;
  public loadingMediaDevice = false;
  public incomingCall = false;
  public incomingCallConfig: Record<string, string> = {};
  public callStarted = false;
  public errorMsg = '';
  private chatId = '';

  constructor(private rtcService: ChatService, private route: ActivatedRoute) {
    this.localStream = null;
  }

  ngOnInit(): void {
    this.chatId = this.route.snapshot.paramMap.get('chatId') || '';

    this.rtcService.getRTCMessage().subscribe((data) => this.onMessage(data));
  }

  ngAfterViewInit(): void {
    this.localVideo = this.getElem('localVideo');
    this.remoteVideo = this.getElem('remoteVideo');
  }

  getElem(elementId: string) {
    return document.getElementById(elementId) as HTMLVideoElement;
  }

  onMessage(data: SocketDataMsg) {
    console.log('RTC msg', data);
    const type = data.type as RTCMessageType;
    const { msg } = data.data;

    switch (type) {
      case 'offer':
        this.onCreateRemoteDescription(msg);
        break;
      case 'answer':
        this.onCreateLocalDescription(msg);
        break;
      case 'call-request':
        this.onCallRequest(msg);
        break;
      case 'call-accepted':
        this.call();
        break;
      case 'ice-candidate':
        this.incomingIceCandidate(msg);
        break;
      case 'end-call':
        this.hangup(true);
        break;
    }
  }

  private onCallRequest(msg: any) {
    this.incomingCallConfig = msg;
    this.incomingCall = true;
  }

  private async incomingIceCandidate(candidate: RTCIceCandidate | null) {
    await this.rtcPeer.addIceCandidate(candidate || undefined);
  }

  sendMessage(type: RTCMessageType, msg: any) {
    this.rtcService.sendMessage({
      target: 'webrtc',
      type,
      room: this.chatId,
      data: {
        msg: msg,
        socketId: this.rtcService.getSocketId(),
      },
    });
  }

  async requestMediaDevices(inputConfig?: Record<string, string>) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        inputConfig || config
      );

      console.log('Received local stream');

      this.localVideo.srcObject = stream;
      this.localVideo.autoplay = true;
      this.localVideo.muted = true;

      this.localStream = stream;

      this.loadingMediaDevice = false;

      const videoTracks = this.localStream.getVideoTracks();
      const audioTracks = this.localStream.getAudioTracks();

      if (videoTracks.length > 0) {
        console.log(`Using video device: ${videoTracks[0].label}`);
      }

      if (audioTracks.length > 0) {
        console.log(`Using audio device: ${audioTracks[0].label}`);
      }

      this.callStarted = true;

      return true;
    } catch (e: any) {
      console.error('getUserMedia() error', e);

      this.errorMsg = e.toString();

      this.loadingMediaDevice = false;

      return false;
    }
  }

  async answerCall() {
    const info = await this.requestMediaDevices(this.incomingCallConfig);

    if (info) {
      await this.rtcConnect('remote');

      this.sendMessage('call-accepted', null);
    }
  }

  async start() {
    this.loadingMediaDevice = true;
    this.errorMsg = '';

    const info = await this.requestMediaDevices();

    if (info) {
      // Request call with other connected user
      this.sendMessage('call-request', config);
    }
  }

  async call() {
    const { localStream } = this;

    if (!localStream) {
      alert('Local stream not available');

      return;
    }

    console.log('Starting call');

    await this.rtcConnect('local');
  }

  async rtcConnect(srcType: 'local' | 'remote') {
    const { localStream } = this;

    if (!localStream) {
      alert('Local stream not available');

      return;
    }

    console.log('RTCPeerConnection configuration:');

    this.rtcPeer = new RTCPeerConnection({
      iceServers: [
        {
          urls: ['stun:stun.kundenserver.de:3478'],
        },
      ],
    });

    console.log('Created local peer connection object');

    this.rtcPeer.addEventListener('icecandidate', (e) =>
      this.onIceCandidate(e)
    );

    // For remote peer
    this.rtcPeer.addEventListener('track', (ev) => this.gotRemoteStream(ev));

    localStream
      .getTracks()
      .forEach((track) => this.rtcPeer.addTrack(track, localStream));

    console.log('Added local stream');

    if (srcType === 'remote') {
      return;
    }

    try {
      console.log('createOffer start');

      const offer = await this.rtcPeer.createOffer(offerOptions);

      await this.onCreateOfferSuccess(offer);
    } catch (e) {
      this.onCreateSessionDescriptionError(e);
    }
  }

  onCreateSessionDescriptionError(error: any) {
    console.log(`Failed to create session description: ${error.toString()}`);
  }

  onSetSessionDescriptionError(error: any) {
    console.log(`Failed to set session description: ${error.toString()}`);
  }

  async onCreateLocalDescription(answer: RTCSessionDescriptionInit) {
    console.log('local setRemoteDescription start');

    try {
      await this.rtcPeer.setRemoteDescription(answer);

      console.log(`local setRemoteDescription complete`);
    } catch (e) {
      this.onSetSessionDescriptionError(e);
    }
  }

  async onCreateAnswerSuccess(offer: RTCSessionDescriptionInit) {
    console.log(`Answer from remote:\n${offer.sdp}`);
    console.log('remote setLocalDescription start');

    try {
      await this.rtcPeer.setLocalDescription(offer);

      // Send answer to remote peer
      this.sendMessage('answer', offer);

      console.log(`remote setLocalDescription complete`);
    } catch (e) {
      this.onSetSessionDescriptionError(e);
    }
  }

  async remoteCreateAnswer() {
    console.log('createAnswer start');

    try {
      const answer = await this.rtcPeer.createAnswer();

      await this.onCreateAnswerSuccess(answer);
    } catch (e) {
      this.onCreateSessionDescriptionError(e);
    }
  }

  async onCreateRemoteDescription(offer: RTCSessionDescriptionInit) {
    console.log('remote setRemoteDescription start');

    try {
      await this.rtcPeer.setRemoteDescription(offer);

      this.remoteCreateAnswer();

      console.log(`remote setRemoteDescription complete`);
    } catch (e) {
      this.onSetSessionDescriptionError(e);
    }
  }

  async onCreateOfferSuccess(offer: RTCSessionDescriptionInit) {
    console.log('local setLocalDescription start');

    try {
      await this.rtcPeer.setLocalDescription(offer);

      // Send offer to remote peer
      this.sendMessage('offer', offer);

      console.log(`setLocalDescription complete`);
    } catch (e) {
      this.onSetSessionDescriptionError(e);
    }
  }

  gotRemoteStream(e: RTCTrackEvent) {
    if (this.remoteVideo.srcObject !== e.streams[0]) {
      this.remoteVideo.srcObject = e.streams[0];
      this.remoteVideo.autoplay = true;
      this.remoteVideo.volume = 1;

      console.log('remote received remote stream');
    }
  }

  async onIceCandidate(event: RTCPeerConnectionIceEvent) {
    try {
      console.log(
        `ICE candidate:\n${
          event.candidate ? event.candidate.candidate : '(null)'
        }`
      );

      this.sendMessage('ice-candidate', event.candidate);

      console.log(`addIceCandidate success`);
    } catch (e: any) {
      console.error(`Failed to add ICE Candidate: ${e.toString()}`);
    }
  }

  private redirect() {
    window.location.href = '/dashboard';
  }

  public hangup(dntSendMsg?: boolean) {
    console.log('Ending call');

    if (this.rtcPeer) {
      this.rtcPeer.removeEventListener('icecandidate', () => {});
      this.rtcPeer.removeEventListener('track', () => {});
      this.rtcPeer.getTransceivers().forEach((trans) => {
        trans.stop();
      });

      this.rtcPeer.close();
    }

    // @ts-ignore
    this.rtcPeer = null;

    this.localStream = null;
    this.incomingCallConfig = {};
    this.incomingCall = false;
    this.callStarted = false;

    if (!dntSendMsg) {
      this.sendMessage('end-call', null);

      this.redirect();

      return;
    }

    this.redirect();
  }
}
