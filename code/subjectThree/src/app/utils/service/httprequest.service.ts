import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpInterceptor } from '@angular/common/http';
import { environment } from '@env/environment';
import { Router } from '@angular/router';
// import { UserService } from '@app/user/service/user.service';

@Injectable({
  providedIn: 'root',
})
export class HttpRequestService {
  base_url: string = "";

  constructor(private http: HttpClient, private router: Router) {
    this.base_url = environment.httpUrl;
  }

  get(url: string, params: { [key: string]: string }, headers: { [key: string]: string }, onSuccess: (response: any) => void, onError: (response: any) => void): void {
    const httpParams = new HttpParams({ fromObject: params });
    const httpHeaders = new HttpHeaders(headers);
    const total_url = this.base_url + url;
    this.http.get(total_url, { params: httpParams, headers: httpHeaders }).pipe().subscribe({
      next: (response: any) => {
        onSuccess(response);
      },
      error: (error: any) => {
        if (error.status == 401) {
          localStorage.removeItem('userInfo');
          this.router.navigate(['/login']);
        }
        onError(error);
      }
    })
  }
  post(url: string, body: any, headers: { [key: string]: string }, onSuccess: (response: any) => void, onError: (response: any) => void): void {
    const httpHeaders = new HttpHeaders(headers);
    const total_url = this.base_url + url;
    this.http.post(total_url, body, { headers: httpHeaders }).pipe().subscribe({
      next: (response: any) => {
        onSuccess(response);
      },
      error: (error: any) => {
        if (error.status == 401) {
          localStorage.removeItem('userInfo');
          this.router.navigate(['/login']);
        }
        onError(error);
      }
    });
  }

  put(url: string, body: any, headers: { [key: string]: string }, onSuccess: (response: any) => void, onError: (response: any) => void): void {
    const httpHeaders = new HttpHeaders(headers);
    const total_url = this.base_url + url;
    this.http.put(total_url, body, { headers: httpHeaders }).pipe().subscribe({
      next: (response: any) => {
        onSuccess(response);
      },
      error: (error: any) => {
        if (error.status == 401) {
          localStorage.removeItem('userInfo');
          this.router.navigate(['/login']);
        }
        onError(error);
      }
    });
  }

  delete(url: string, params: { [key: string]: string }, headers: { [key: string]: string }, onSuccess: (response: any) => void, onError: (response: any) => void): void {
    const httpParams = new HttpParams({ fromObject: params });
    const httpHeaders = new HttpHeaders(headers);
    const total_url = this.base_url + url;
    this.http.delete(total_url, { params: httpParams, headers: httpHeaders }).pipe().subscribe({
      next: (response: any) => {
        onSuccess(response);
      },
      error: (error: any) => {
        if (error.status == 401) {
          localStorage.removeItem('userInfo');
          this.router.navigate(['/login']);
        }
        onError(error);
      }
    });
  }

}
