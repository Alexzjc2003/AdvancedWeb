import { Component } from '@angular/core';
import { UserService } from '@app/user/service/user.service';
import { SnackbarService } from '@app/utils/service/snackbar.service';

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

  constructor(private userService: UserService, private snackBarService: SnackbarService) { }


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
            created_at: this.parseTimestamp(chatRecord.created_at),
          })
        }
      },
      (resp) => {
        this.snackBarService.showMessage("fetchChatRecords: " + resp.error.message + "...", "error");
      }
    )
  }
  parseTimestamp(timestamp: string): string {
    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      throw new Error("Invalid timestamp format");
    }

    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1); // Months are zero-based
    const day = this.padZero(date.getDate());
    const hours = this.padZero(date.getHours());
    const minutes = this.padZero(date.getMinutes());
    const seconds = this.padZero(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }
}
