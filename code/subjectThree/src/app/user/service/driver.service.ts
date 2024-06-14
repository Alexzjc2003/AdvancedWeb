import { Injectable } from '@angular/core';

import { HttpRequestService } from '@app/utils/service/httprequest.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  getPunishmentsUrl: string = "api/drivers/punishments"

  constructor(private httpRequestService: HttpRequestService, private userService: UserService) { }

  fetchDriverPunishments(onSuccess: (resp: any) => void, onError: (resp: any) => void) {
    let token = this.userService.getUserToken();

		let headers = {
			'Content-Type': 'application/json',
			'Authorization': token
		};
		this.httpRequestService.get(this.getPunishmentsUrl, {}, headers,
			resp => {
				console.log(resp);
				onSuccess(resp);
			},

			resp => {
				console.log(resp);
				onError(resp);
			}
		);
	}
}
