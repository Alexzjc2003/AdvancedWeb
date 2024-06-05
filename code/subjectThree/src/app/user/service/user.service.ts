import { Injectable } from '@angular/core';
import { HttpRequestService } from '@app/utils/service/httprequest.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	loginUrl: string = "api/login";
	registerUrl: string = "api/register";
	getInfoUrl: string = "api/users/data";
	updateUserUrl: string = "api/users";

	default_headers: any = { 'Content-Type': 'application/json' };

	loggedIn = new BehaviorSubject<boolean>(false);
	isLoggedIn = this.loggedIn.asObservable();

	userInfo: { id: string, token: string, detail: {} } = {
		token: "",
		id: "",
		detail: {}
	};

	constructor(private httpRequestService: HttpRequestService) { }

	login(username: string, password: string, onSuccess: (resp: any) => void, onError: (resp: any) => void): void {
		let self = this;
		const postData = {
			username: username,
			password: password,
		};

		this.httpRequestService.post(this.loginUrl, postData, this.default_headers,
			resp => {
				console.log(resp);
				self.userInfo.id = resp.user_id;
				self.userInfo.token = resp.access;
				self.loggedIn.next(true);
				self.loadUserDetail((resp) => {
					onSuccess(resp);
				}, 
				(resp) => {
					console.log("获取信息失败");
					onError(resp);
				});
			},

			resp => {
				console.log(resp);
				onError(resp);
			});
	}

	register(
		username: string,
		password: string,
		gender: string,
		age: number,
		phone: string,
		email: string,
		onSuccess: (resp: any) => void,
		onError: (resp: any) => void
	): void {
		const postData = {
			username: username,
			password: password,
			gender: gender,
			age: age,
			phone: phone,
			email: email,
		};

		this.httpRequestService.post(this.registerUrl, postData, this.default_headers,
			resp => {
				console.log("注册成功!");
				onSuccess(resp);
			},

			resp => {
				console.log(resp);
				onError(resp);
			});
	}

	loadUserDetail(onSuccess: (resp: any) => void, onError: (resp: any) => void) {
		let self = this;
		if (!this.isLoggedin()) {
			console.warn("user.service.ts::loadUserDetail: load detail before login.");
			return;
		}
		let headers = {
			'Content-Type': 'application/json',
			'Authorization': this.userInfo.token
		};
		this.httpRequestService.get(this.getInfoUrl, {}, headers,
			resp => {
				console.log(resp);
				self.userInfo.detail = {
					age: resp.age,
					created_at: resp.created_at,
					email: resp.email,
					gender: resp.gender,
					is_passed: resp.is_passed,
					password: resp.password,
					phone: resp.phone,
					point: resp.point,
					updated_at: resp.updated_at,
					username: resp.username
				};
				onSuccess(resp);
			},

			resp => {
				console.log(resp);
				onError(resp);
			}
		);
	}

	modifyUserDetail(
		username: string,
		password: string,
		gender: string,
		age: number,
		phone: string,
		email: string,
		point: number,
		is_passed: boolean,
		onSuccess: (resp: any) => void,
		onError: (resp: any) => void
	): void {
		const putData = {
			age: age,
			created_at: "0",
			email: email,
			gender: gender,
			id: this.getUserId(),
			is_passed: is_passed,
			password: password,
			phone: phone,
			point: point,
			updated_at: "0",
			username: username
		};

		console.log("putdata", putData);

		let headers = {
			'Content-Type': 'application/json',
			'Authorization': this.userInfo.token
		};

		this.httpRequestService.put(this.updateUserUrl, putData, headers,
			resp => {
				console.log("修改成功!");
				this.loadUserDetail((resp) => {
					onSuccess(resp);
				}, (resp) => {
					console.log("重新获取信息失败");
					onError(resp);
				});
			},

			resp => {
				console.log(resp);
				onError(resp);
			});
	}

	logout() {
		this.loggedIn.next(false);
		this.userInfo = {
			token: "",
			id: "",
			detail: {}
		};
	}

	isLoggedin() {
		return this.loggedIn.getValue();
	}

	getUserDetail() {
		return this.userInfo.detail;
	}

	getUserId() {
		return this.userInfo.id;
	}

	getUserToken() {
		return this.userInfo.token;
	}
}
