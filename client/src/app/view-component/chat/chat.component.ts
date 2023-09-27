import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SocketService } from 'src/app/services/socket.service';
import { UserService } from 'src/app/services/user.service';
import { ISocketMessage, ISocketReturnMsg } from 'src/app/typing/interfaces';
import { DatePipe } from '@angular/common';
import { HttpclientService } from 'src/app/services/httpclient.service';
import { debounceTime } from 'rxjs';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  chatFormGroup: FormGroup;
  typingUser!: string;
  chatMessages: Array<ISocketReturnMsg> = [];
  get isUserLoggedIn(): boolean {
    return this.user.getToken() ? true : false;
  }
  constructor(
    private fb: FormBuilder,
    private user: UserService,
    private socket: SocketService,
    private http: HttpclientService
  ) {
    this.chatFormGroup = fb.group({
      input: '',
    });
    this.socket.WebSocketMsgSubject.subscribe((data) => {
      this.chatMessages.unshift(data);
    });
    this.socket.WebSocketKeystrokSubject.pipe(debounceTime(50)).subscribe(
      (res) => {
        console.log('typing user', res);
        this.typingUser = res;
        setTimeout(() => {
          this.typingUser = '';
        }, 300);
      }
    );
  }
  togglestatus: boolean = true;
  ngOnInit(): void {
    this.gethistoryChat();
  }

  toggleClass() {
    this.togglestatus = !this.togglestatus;
  }
  chatMaessage() {
    const value = this.chatFormGroup.get('input').value;
    if (!value) {
      return;
    } else {
      //send message to socket
      const userName = this.user.getUserName();
      const userRole = this.user.getUserRole();
      let message: ISocketMessage = {
        name: userName ?? null,
        role: userRole ?? null,
        message: value ?? null,
      };
      this.socket.sendMessage(message);
      this.chatFormGroup.get('input').setValue('');
    }
  }

  async gethistoryChat() {
    const url = 'chat-msg';
    const res = await this.http.request('GET', url).toPromise();
    if (res.status == 200) {
      const messages = res?.body?.chatmsg?.reverse();
      this.chatMessages.push(...messages);
      console.log('=======', this.chatMessages);
    }
  }
  keyStrok() {
    const userRole = this.user.getUserRole();
    this.socket.keyStroke(userRole);
  }
}
