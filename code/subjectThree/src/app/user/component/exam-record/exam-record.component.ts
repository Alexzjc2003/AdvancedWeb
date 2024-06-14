import { Component, Inject } from '@angular/core';
import { UserService } from '@app/user/service/user.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';

@Component({
	selector: 'app-exam-record',
	templateUrl: './exam-record.component.html',
	styleUrl: './exam-record.component.css'
})
export class ExamRecordComponent {
	exams: any[] = [];
	displayedColumns: string[] = ['title', 'description', 'starttime', 'score', 'is_public', 'normal', 'duration', 'detail'];

	constructor(private userService: UserService, public dialog: MatDialog) { }

	ngOnInit() {
		// this.userService.getUserExams().then((exams) => {
		// 	this.setUserExams(exams);
		// 	console.log("exams:", this.exams);
		// });
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
				score: exam.score,
				is_public: exam.is_public,
				normal: exam.normal,
				duration: exam.duration,
			})
		}
	}

	showDetail(examId: number) {
		console.log("get detail of " + examId);
		let self = this;
		let punishments: { type: number, reason: string, score: string }[] = [];
		this.userService.fetchExamPunishments(examId,
			(resp) => {
				for (let punishment of resp) {
					punishments.push({
						type: punishment.punishment_type,
						reason: punishment.reason,
						score: punishment.score
					});
				}
				const dialogRef = self.dialog.open(PunishmentDetailDialog, {
					data: punishments,
				});
				dialogRef.afterClosed().subscribe(result => {
					console.log('The dialog was closed');
				});
			},
			(resp) => { });
	}
}

export interface PunishmentData {
	type: number,
	reason: string,
	score: number
}

@Component({
	selector: 'punishment-detail-dialog',
	templateUrl: 'punishment-detail.html',
})
export class PunishmentDetailDialog {

	displayedColumns: string[] = ['type', 'reason', 'score'];

	constructor(
		public dialogRef: MatDialogRef<PunishmentDetailDialog>,
		@Inject(MAT_DIALOG_DATA) public data: PunishmentData[],
	) {
	}

	onNoClick(): void {
		this.dialogRef.close();
	}
}