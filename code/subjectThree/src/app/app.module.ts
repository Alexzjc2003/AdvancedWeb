// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // 导入 HttpClientModule
import { AppComponent } from './app.component'; // 导入主组件

import { FormsModule } from '@angular/forms';

import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgOptimizedImage } from "@angular/common";

import { MainPageComponent } from './main-page/main-page.component';
import { LoginComponent } from './user/component/login/login.component';
import { RegisterComponent } from './user/component/register/register.component';
import { ThreejsSceneComponent } from './threejs-scene/threejs-scene.component';
import { VideoChatComponent } from './video-chat/video-chat.component';

@NgModule({
    declarations: [
        AppComponent,
        MainPageComponent,
        LoginComponent,
        RegisterComponent,
        ThreejsSceneComponent,
        VideoChatComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,

        RouterOutlet,
        RouterModule,
        RouterModule.forRoot([
            {
                path: '',
                component: MainPageComponent,
                title: 'Home page'
            },
            {
                path: 'login',
                component: LoginComponent,
                title: 'login'
            },
            {
                path: 'register',
                component: RegisterComponent,
                title: 'register'
            },
            {
                path: 'scene',
                component: ThreejsSceneComponent,
                title: 'scene'
            }
        ]),
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatToolbarModule,
        NgOptimizedImage
    ],
    providers: [],
    bootstrap: [AppComponent] // 指定根组件
})
export class AppModule { }