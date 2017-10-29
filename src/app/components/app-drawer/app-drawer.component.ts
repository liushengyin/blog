import { Component, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-drawer',
  templateUrl: './app-drawer.component.html',
  styleUrls: ['./app-drawer.component.scss']
})
export class AppDrawerComponent implements OnInit {

  private isShown = false;
  drawer;
  drawerBackDrop;
  transX;
  clientRect;
  scheduledAnimationFrame = false;

  constructor(public _elementRef: ElementRef) { }

  ngOnInit() {
    this.drawer = this._elementRef.nativeElement.querySelector('.drawer');
    this.drawerBackDrop = this._elementRef.nativeElement.querySelector('.drawer-backdrop')
    this.slideInit();
  }

  close(){
      this.drawer.style.transform =  `translate3d(-100%, 0, 0)`;
      this.drawer.style.transition =  'transform 0.4s cubic-bezier(.25,.8,.25,1)';
      this.drawerBackDrop.style.visibility = "hidden";
      this.slideInit();
  }

  open(){
      this.drawer.style.transform =  `translate3d(0, 0, 0)`;
      this.drawer.style.transition =  'transform 0.4s cubic-bezier(.25,.8,.25,1)';
      this.drawer.style.opacity =  '1';
      this.drawerBackDrop.style.visibility = "visible";
      this.drawerBackDrop.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
  }

  slideInit() {
    setTimeout(()=>{
      this.drawer.style.transform =  `none`;
      this.drawer.style.opacity =  '0';
      this.drawer.style.transform =  `translate3d(-98% , 0, 0)`;
    },400)
  }

  _onSlideStart(event) {
    this.transX = this.drawer.getBoundingClientRect().right;
    this.clientRect = this.drawer.getBoundingClientRect();
    this.drawer.style.transform =  `translate3d(calc((-100% + ${this.transX}px)), 0, 0)`;
    this.drawer.style.transition =  'transform 0.1s easy';
    this.drawer.style.opacity =  '1';
    this.drawerBackDrop.style.visibility = "visible";
  }

  _onSlide(event) {
    let x = this.transX + event.deltaX

    if (this.scheduledAnimationFrame)
        return;
      this.scheduledAnimationFrame = true;
      requestAnimationFrame(this.UpdatePage.bind(this, x));
  }

  _onSlideEnd(event) {
    this.clientRect = this.drawer.getBoundingClientRect();
    this.drawer.style.transition =  'transform 0.4s cubic-bezier(.25,.8,.25,1)';

    if( this.clientRect.right >= this.clientRect.width/2){
      requestAnimationFrame(this.UpdatePage.bind(this, this.clientRect.width));
    } else {
      requestAnimationFrame(this.UpdatePage.bind(this, 0));
      this.slideInit();
    }
  }

  UpdatePage(x){
    console.log('UpdatePage');
    this.scheduledAnimationFrame = false;

    if(x >= this.clientRect.width){
      this.drawer.style.transform =  `translate3d(0, 0, 0)`;
      this.drawerBackDrop.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
    } else {
      this.drawer.style.transform =  `translate3d(calc((-100% + ${x}px)), 0, 0)`;
      this.drawerBackDrop.style.backgroundColor = `rgba(0, 0, 0, ${0.6 * x/this.clientRect.width})`;
    }
  }


}
