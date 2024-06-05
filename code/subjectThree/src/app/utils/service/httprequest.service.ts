import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class HttpRequestService {
  base_url: string = "";

  constructor(private http: HttpClient) {
    this.base_url = environment.apiUrl;
  }

  get(url: string, params: { [key: string]: string }, onSuccess: (response: any) => void, onError: (response: any) => void): void {
    const httpParams = new HttpParams({ fromObject: params });
    const total_url = this.base_url + url;
    this.http.get(total_url, { params: httpParams }).pipe().subscribe({
      next: (response: any) => {
        onSuccess(response);
      },
      error: (error: any) => {
        onError(error);
      }
    })
  }

  post(url: string, body: any, onSuccess: (response: any) => void, onError: (response: any) => void): void {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const total_url = this.base_url + url;
    this.http.post(total_url, body, { headers }).pipe().subscribe({
      next: (response: any) => {
        onSuccess(response);
      },
      error: (error: any) => {
        onError(error);
      }
    });
  }

  put(url: string, body: any, onSuccess: (response: any) => void, onError: (response: any) => void): void {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const total_url = this.base_url + url;
    this.http.put(total_url, body, { headers }).pipe().subscribe({
      next: (response: any) => {
        onSuccess(response);
      },
      error: (error: any) => {
        onError(error);
      }
    });
  }

  delete(url: string, params: { [key: string]: string }, onSuccess: (response: any) => void, onError: (response: any) => void): void {
    const httpParams = new HttpParams({ fromObject: params });
    const total_url = this.base_url + url;
    this.http.delete(total_url, { params: httpParams }).pipe().subscribe({
      next: (response: any) => {
        onSuccess(response);
      },
      error: (error: any) => {
        onError(error);
      }
    });
  }

}
