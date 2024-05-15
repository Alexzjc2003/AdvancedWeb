import { Component } from '@angular/core';
import { ThreejsSceneComponent } from '../threejs-scene/threejs-scene.component';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [ThreejsSceneComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent {

}
