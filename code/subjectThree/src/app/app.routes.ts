import { Routes } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ThreejsSceneComponent } from './threejs-scene/threejs-scene.component';

export const routes: Routes = [
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
];
