import { Component,ViewEncapsulation, OnInit ,HostBinding, ViewChild, ElementRef, Renderer2} from '@angular/core';
import { AppDrawerComponent } from '../../components/app-drawer/app-drawer.component'
import { Location }                 from '@angular/common';
import {query, stagger, animate, style, transition, trigger} from '@angular/animations';


@Component({
  selector: 'app-slides',
  templateUrl: './slides.component.html',
  styleUrls: ['./slides.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SlidesComponent implements OnInit {
  state = 'inactive';
  InOut = true;
  flyInOut = 'in';

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
  toogleState() {
    this.state = this.state == 'inactive'? 'active':'inactive';
    this.InOut = !this.InOut;
  }
  onSwipe(ev) {
    console.log(ev);
    if(ev.deltaX > 0 && ev.target.className.indexOf("drawer") == -1){
      this.goBack();
    }
  }
}