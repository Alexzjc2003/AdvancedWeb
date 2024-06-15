import { Component } from '@angular/core';
import { UserService } from '@app/user/service/user.service';

@Component({
  selector: 'app-chat',
  // standalone: true,
  // imports: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  chatRecordsDisplayedColumns: string[] = ['message', 'created_at', 'type', 'from_id', 'to_id', 'room_id'];
  chatRecords: any = [];

  constructor(private userService: UserService) { }


  ngOnInit() {
    let self = this;
    this.userService.fetchChatRecords(
      (resp) => {
        for (let chatRecord of resp) {
          self.chatRecords.push({
            message: chatRecord.Message,
            from_id: chatRecord.user_id,
            to_id: chatRecord.to_id,
            room_id: chatRecord.room_id,
            type: chatRecord.type,
            created_at: chatRecord.created_at,
          })
        }
      },
      (resp) => { }
    )
  }
}
