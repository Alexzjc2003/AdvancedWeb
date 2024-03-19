import { Routes } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

export const routes: Routes = [
    {
        path: '',
        component: MainPageComponent,
        title: 'Home page'
    },
    {
        path: '/login',
        component: LoginComponent,
        title: 'login'
    },
    {
        path: '/register',
        component: RegisterComponent,
        title: 'register'
    }
];
