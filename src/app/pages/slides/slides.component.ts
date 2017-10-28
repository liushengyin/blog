import { Component, OnInit , ViewChild, ElementRef, Renderer2} from '@angular/core';
import { AppDrawerComponent } from '../../components/app-drawer/app-drawer.component'
import { Location }                 from '@angular/common';

@Component({
  selector: 'app-slides',
  templateUrl: './slides.component.html',
  styleUrls: ['./slides.component.scss']
})
export class SlidesComponent implements OnInit {

  panCount: number = 0;
  pressCount: number = 0;
  longpressCount: number = 0;
  swipeCount: number = 0;
  slideCount: number = 0;
  constructor( private location: Location,
               public _renderer: Renderer2, 
               public _elementRef: ElementRef) { }

  ngOnInit() {
  }

  goBack(): void {
    this.location.back();
  }


}
