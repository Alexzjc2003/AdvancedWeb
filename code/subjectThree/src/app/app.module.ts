// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // 导入 HttpClientModule
import { AppComponent } from './app.component'; // 导入主组件
import { CommonModule } from '@angular/common';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';


import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { NgOptimizedImage } from '@angular/common';

import { MainPageComponent } from '@app/main-page/main-page.component';
import { LoginComponent } from '@app/user/component/login/login.component';
import { RegisterComponent } from '@app/user/component/register/register.component';
import { ThreejsSceneComponent } from '@app/three/component/threejs-scene/threejs-scene.component';
import { VideoChatComponent } from '@app/video-chat/video-chat.component';
import { TopBarComponent } from '@app/user/component/top-bar/top-bar.component';
import { SpaceComponent } from '@app/user/component/space/space.component';
import { ChatComponent } from './user/component/chat/chat.component';
import { HallComponent } from '@app/three/component/hall/hall.component';
import {
  ExamRecordComponent,
  PunishmentDetailDialog,
} from './user/component/exam-record/exam-record.component';
import { ConfirmDialogComponent } from './utils/component/confirm-dialog/confirm-dialog.component';
import { LineChartComponent } from './line-chart/line-chart.component';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    LoginComponent,
    RegisterComponent,
    ThreejsSceneComponent,
    VideoChatComponent,
    TopBarComponent,
    SpaceComponent,
    ChatComponent,
    ExamRecordComponent,
    PunishmentDetailDialog,
    HallComponent,
    ConfirmDialogComponent,
    LineChartComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule,
    HttpClientModule,

    ReactiveFormsModule,
    BrowserAnimationsModule,


    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatListModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,

    NgOptimizedImage,

    RouterOutlet,
    RouterModule,
    RouterModule.forRoot([
      {
        path: '',
        component: MainPageComponent,
        title: 'Home page',
      },
      {
        path: 'login',
        component: LoginComponent,
        title: 'login',
      },
      {
        path: 'register',
        component: RegisterComponent,
        title: 'register',
      },
      {
        path: 'space',
        component: SpaceComponent,
        title: 'space',
      },
      {
        path: 'record',
        component: ExamRecordComponent,
        title: 'record',
      },
      {
        path: 'hall',
        component: HallComponent,
        title: 'hall',
      },
      {
        path: 'scene',
        component: ThreejsSceneComponent,
        title: 'scene',
      },
      {
        path: 'chat',
        component: ChatComponent,
        title: 'chat',
      },
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent], // 指定根组件
})
export class AppModule {}
