import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';

axios.defaults.timeout = 5000;

@Injectable({
  providedIn: 'root',
})
export class HttpRequestService {
  constructor() {}

  Request(): AxiosInstance {
    let instance = axios.create();
    return instance;
  }
}
