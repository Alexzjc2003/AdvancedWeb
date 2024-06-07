import { Component } from '@angular/core';
import { UserService } from '@app/user/service/user.service';

@Component({
  selector: 'app-exam-record',
  templateUrl: './exam-record.component.html',
  styleUrl: './exam-record.component.css'
})
export class ExamRecordComponent {
  exams: any[] = [];

  constructor(private userService: UserService) { }

  ngOnInit() {
    let exams: any[] = this.userService.getUserExams();
    this.setUserExams(exams);
    console.log("exams:", this.exams);
  }

  setUserExams(exams: any[]) {
    for (let exam of exams) {
      this.exams.push({
        id: exam.id,
        title: exam.title,
        description: exam.description,
        start_time: exam.start_time,
        end_time: exam.end_time,
        score: exam.score
      })
    }
  }
}
