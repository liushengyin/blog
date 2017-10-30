import { Renderer, Component, HostListener,ViewChild,ElementRef, Input, OnInit,ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location }                 from '@angular/common';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss'],
  // encapsulation: ViewEncapsulation.None
})
export class BlogDetailComponent implements OnInit {
  @ViewChild("header") header: ElementRef
  @ViewChild("topBar") topBar: ElementRef
  @ViewChild("middleBar") middleBar: ElementRef
  @ViewChild("bottomBar") bottomBar: ElementRef

  id = '';
  scheduledAnimationFrame = false;
  toolbarHeight = 64;

  constructor( private route: ActivatedRoute ,
               private location: Location,
               private renderer: Renderer) { }
  items = [
    {text: 'Refresh'},
    {text: 'Settings'},
    {text: 'Help', disabled: true},
    {text: 'Sign Out'}
  ];
  ngOnInit() {
   this.route.paramMap.subscribe((params: ParamMap) => {
       console.log(params.get('id'));
       this.id = params.get('id');
   });
  }

  goBack(): void {
    this.location.back();
  }
  @HostListener("window:scroll", [])
  onWindowScroll() {
    let number = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.toolbarHeight = this.middleBar.nativeElement.offsetHeight;

    if (this.scheduledAnimationFrame)
        return;
      this.scheduledAnimationFrame = true;
      requestAnimationFrame(this.readAndUpdatePage.bind(this, number));
  }
  onScroll(event){
    console.log(event);
  }
  readAndUpdatePage(number){
    this.scheduledAnimationFrame = false;
    let headerHeight = this.toolbarHeight*2;
    console.log(number,this.toolbarHeight,headerHeight)

    if(number > headerHeight) number = headerHeight;
    // this.renderer.setElementStyle(this.topBar.nativeElement, 'transform', 'translate3d(0px, 100px, 0px)');
    this.header.nativeElement.style.transform = `translate3d(0px, -${number}px, 0px)`
    this.topBar.nativeElement.style.transform = `translate3d(0px, ${number}px, 0px)`
    this.middleBar.nativeElement.style.transform = `translate3d(0px, ${number/2}px, 0px)`
    this.bottomBar.nativeElement.style.transform = `scale(${1-number/headerHeight}) translateZ(0px)`
    this.bottomBar.nativeElement.style.opacity = `${1-number/headerHeight}`
  }

}
