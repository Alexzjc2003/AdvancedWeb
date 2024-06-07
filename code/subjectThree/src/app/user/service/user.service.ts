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
				self.storeUserInfo();
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
				self.storeUserInfo();
				onSuccess(resp);
			},

			resp => {
				console.log(resp);
				onError(resp);
			}
		);
	}

	modifyUserDetail(
		gender: string,
		age: number,
		phone: string,
		email: string,
		onSuccess: (resp: any) => void,
		onError: (resp: any) => void
	): void {
		const putData = {
			age: age,
			email: email,
			gender: gender,
			id: this.getUserId(),
			phone: phone
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
		this.clearUserInfo()
	}

	isLoggedin() {
		return this.loggedIn.getValue();
	}

	getUserDetail() {
		const stringUserInfo = localStorage.getItem('userInfo');
		if (stringUserInfo) {
			const userInfo = JSON.parse(stringUserInfo);
			return userInfo.detail;
		}
		return this.userInfo.detail;
	}

	// warning: return string Here!
	getUserId() {
		const stringUserInfo = localStorage.getItem('userInfo');
		if (stringUserInfo) {
			const userInfo = JSON.parse(stringUserInfo);
			return userInfo.id;
		}
		console.log(this.userInfo);
		return this.userInfo.id;
	}

	getUserToken() {
		const stringUserInfo = localStorage.getItem('userInfo');
		if (stringUserInfo) {
			const userInfo = JSON.parse(stringUserInfo);
			return userInfo.token;
		}
		return this.userInfo.token;
	}

	storeUserInfo() {
		localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
	}

	clearUserInfo() {
		localStorage.removeItem('userInfo');
	}
}
