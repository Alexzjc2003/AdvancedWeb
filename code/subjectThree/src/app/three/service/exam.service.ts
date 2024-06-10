import { Injectable } from '@angular/core';
import { UserService } from '@app/user/service/user.service';
import { HttpRequestService } from '@app/utils/service/httprequest.service';

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

	constructor(private httpRequestService: HttpRequestService, private userService: UserService) {
		this.punishmentNameMap = punishmentNameMap;
	}

	startExam(onSuccess: (resp: any) => void, onError: (resp: any) => void): void {
		let self = this;

		let headers = {
			'Content-Type': 'application/json',
			'Authorization': this.userService.getUserToken()
		};

		this.httpRequestService.post(this.startExamUrl, {}, headers,
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

	endExam(onSuccess: (resp: any) => void, onError: (resp: any) => void): void {
		if(this.currentExamId == -1){
			console.warn("exam.service.ts::endExam: endExam without startExam.");
			return;
		}
		let self = this;
		let headers = {
			'Content-Type': 'application/json',
			'Authorization': this.userService.getUserToken()
		};

		this.httpRequestService.post(this.endExamUrl, { id: this.currentExamId }, headers,
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
		if(this.currentExamId == -1){
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

		let addPunishmentUrl: string = `api/exams/${this.currentExamId}/punishments`;

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
