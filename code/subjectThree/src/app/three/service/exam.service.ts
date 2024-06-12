import { Injectable } from '@angular/core';
import { UserService } from '@app/user/service/user.service';
import { HttpRequestService } from '@app/utils/service/httprequest.service';
import { NotificationService } from './notification.service';
import { punishmentNameMap } from '@app/data/allPunishments';

@Injectable({
	providedIn: 'root'
})
export class ExamService {

	startExamUrl: string = "api/exams/start";
	endExamUrl: string = "api/exams/end";

	currentExamId: number = -1;

	default_headers: any = { 'Content-Type': 'application/json' };

	punishmentNameMap: any;

	isOfficialDriving: boolean = false;

	isExaming: boolean = false;

	constructor(private httpRequestService: HttpRequestService, private userService: UserService, private notification: NotificationService) {
		this.punishmentNameMap = punishmentNameMap;
	}

	startExam(onSuccess: (resp: any) => void, onError: (resp: any) => void, isOfficialDriving: boolean): void {
		if (this.isExaming) {
			return;
		}
		// concurrence
		this.isExaming = true;
		let self = this;
		this.isOfficialDriving = isOfficialDriving;

		let headers = {
			'Content-Type': 'application/json',
			'Authorization': this.userService.getUserToken()
		};

		this.httpRequestService.post(this.startExamUrl, { exam_type: isOfficialDriving ? 'driver' : 'exam' }, headers,
			resp => {
				console.log(resp);
				self.currentExamId = resp.id;
				onSuccess(resp);
			},

			resp => {
				console.log(resp);
				onError(resp);
			});
	}

	endExam(onSuccess: (resp: any) => void, onError: (resp: any) => void, normalExit: boolean): void {
		if (!this.isExaming) {
			return;
		}
		this.isExaming = false;
		if (this.currentExamId == -1) {
			console.warn("exam.service.ts::endExam: endExam without startExam.");
			return;
		}
		let self = this;
		let headers = {
			'Content-Type': 'application/json',
			'Authorization': this.userService.getUserToken()
		};

		this.httpRequestService.post(this.endExamUrl, { id: this.currentExamId, normal: normalExit }, headers,
			resp => {
				console.log(resp);
				self.currentExamId = -1;
				onSuccess(resp);
			},

			resp => {
				console.log(resp);
				onError(resp);
			});
	}

	addPunishment(
		punishmentType: string,
		reason: string,
		score: number,
		onSuccess: (resp: any) => void,
		onError: (resp: any) => void
	): void {
		if (this.currentExamId == -1) {
			console.warn("exam.service.ts::addPunishment: addPunishment without startExam.");
			return;
		}

		let headers = {
			'Content-Type': 'application/json',
			'Authorization': this.userService.getUserToken()
		};

		let punishment_type: number = -1;
		if (this.punishmentNameMap.hasOwnProperty(punishmentType)) {
			punishment_type = this.punishmentNameMap[punishmentType];
		} else {
			return;
		}

		this.notification.showNotification(`惩罚：${punishmentType}，原因：${reason}，扣分：${score}`);

		let addPunishmentUrl: string
		if (!this.isOfficialDriving)
			addPunishmentUrl = `api/exams/${this.currentExamId}/punishments`;
		else addPunishmentUrl = `api/drivers/punishments`;

		const postData = {
			punishment_type: punishment_type,
			reason: reason,
			score: score
		};

		this.httpRequestService.post(addPunishmentUrl, postData, headers,
			resp => {
				console.log(resp);
				onSuccess(resp);
			},

			resp => {
				console.log(resp);
				onError(resp);
			});
	}
}
