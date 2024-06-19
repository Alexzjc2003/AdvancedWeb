import { Component, Inject } from '@angular/core';
import { UserService } from '@app/user/service/user.service';
import { punishmentNameList } from '@app/data/allPunishments';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { SnackbarService } from '@app/utils/service/snackbar.service';

@Component({
	selector: 'app-exam-record',
	templateUrl: './exam-record.component.html',
	styleUrl: './exam-record.component.css'
})
export class ExamRecordComponent {
	exams: any[] = [];
	displayedColumns: string[] = ['title', 'description', 'starttime', 'score', 'is_public', 'normal', 'duration', 'detail'];

	constructor(private userService: UserService, public dialog: MatDialog, private snackBarService: SnackbarService) { }

	ngOnInit() {
		let self = this;
		this.userService.fetchUserExams(
			(resp)=>{
				for (let exam of resp) {
					self.exams.push({
						id: exam.id,
						title: exam.title,
						description: exam.description,
						start_time: exam.start_time,
						end_time: exam.end_time,
						score: exam.score,
						is_public: exam.is_public,
						normal: exam.normal,
						duration: self.userService.durationToString(exam.duration),
					});
				}
				console.log("exam-record.component::ngOnInit", self.exams);
			},
			(resp)=>{
				this.snackBarService.showMessage("fetchUserExams: 服务器出错了...", "error");
			}
		);
	}

	showDetail(examId: number) {
		console.log("get detail of " + examId);
		let self = this;
		let punishments: { type: string, reason: string, score: string }[] = [];
		this.userService.fetchExamPunishments(examId,
			(resp) => {
				console.log("punishments: ", resp);
				for (let punishment of resp) {
					punishments.push({
						type: punishmentNameList[punishment.punishment_type] || punishment.punishment_type,
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
			(resp) => { 
				this.snackBarService.showMessage("fetchExamPunishments: 服务器出错了...", "error");
			});
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