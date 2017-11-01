import { Component,ViewEncapsulation, HostListener,OnInit ,HostBinding, ViewChild, ElementRef, Renderer2} from '@angular/core';
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
  items = [];

  constructor( private location: Location,
               public _renderer: Renderer2, 
               public _elementRef: ElementRef) { }

  ngOnInit() {
    for (let i = 0; i < 15; i++) {
      this.items.push( this.items.length );
    }
  }

  goBack(): void {
    this.location.back();
  }
  toogleState() {
    this.state = this.state == 'inactive'? 'active':'inactive';
    this.InOut = !this.InOut;
  }
  // onSwipe(ev) {
  //   console.log(ev);
  //   if(ev.deltaX > 0 && Math.abs(ev.deltaY) < 16 && ev.target.className.indexOf("drawer") == -1){
  //     this.goBack();
  //   }
  // }
  doRefresh(refresher) {
    console.log('Begin async operation', refresher);
    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  }
  
  doInfinite(infiniteScroll) {
    console.log('Begin async operation');

    setTimeout(() => {
      for (let i = 0; i < 10; i++) {
        this.items.push( this.items.length );
      }

      console.log('Async operation has ended');
      infiniteScroll.complete();
    }, 500);
  }

}