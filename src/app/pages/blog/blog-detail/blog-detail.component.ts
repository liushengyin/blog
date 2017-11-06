import { Renderer, HostBinding, Component, HostListener,ViewChild,ElementRef, Input, OnInit,ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location }                 from '@angular/common';
import { Data } from '../../../providers/data';
import { Router }                 from '@angular/router';
import { slideInDownAnimation }   from '../../../animations';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss'],
  // encapsulation: ViewEncapsulation.None,
  animations: [ slideInDownAnimation ]
})
export class BlogDetailComponent implements OnInit {
  @HostBinding('@routeAnimation') routeAnimation = true;

  @ViewChild("header") header: ElementRef
  @ViewChild("topBar") topBar: ElementRef
  @ViewChild("middleBar") middleBar: ElementRef
  @ViewChild("bottomBar") bottomBar: ElementRef
  @ViewChild("article") article: ElementRef

  id = '';
  categoryId ;
  scheduledAnimationFrame = false;
  toolbarHeight = 64;

  blogDetail = {
    id:'',
    title:'',
    tag:'',
    abstract:'',
    body:''
  };
  
  pre = null;
  next = null;
  touchEvent = {
    clientX:0,
    clientY:0,
    timeStamp:0
  };

  spinner = true;

  constructor( private route: ActivatedRoute,
               private location: Location,
               private renderer: Renderer,
               private _element: ElementRef,
               private router: Router,
               public data: Data) { }


  ngOnInit() {

    this.route
         .queryParamMap
         .subscribe(params => {
           this.id = params.get('id');
           this.categoryId = params.get('categoryId');
           this.getData();
         });

  }
  // 获取博客列表
  getData() {
    if(!this.id) return;

    let url = `article/${this.id}`;
    if(this.categoryId != 0) {
      url = url + `?categoryId=${this.categoryId}`;
    }

    this.data.get(url)
           .subscribe(
             data =>{ this.handleData(data)},
             error =>{this.handleError(error);}
            );
  }
  // 处理博客列表数据
  handleData(data){

    this.spinner = false;

    this.blogDetail = data.results;
    this.article.nativeElement.innerHTML = this.blogDetail.body;
    this.pre = data.pre;
    this.next = data.next;
  }
  
  // 错误处理
  handleError(error){
      this.spinner = false;
      console.log(error);
  }
  // 上一篇文章
  toPrevious(){

    if(!this.pre)return;

    this.id = this.pre.id;
    this.getData();
    this._element.nativeElement.scroll(0,0);
  }
  // 下一篇文章
  toNext(){

    if(!this.next) return;

    this.id = this.next.id;
    this.getData();
    this._element.nativeElement.scroll(0,0);
  }
  // 返回
  goBack(): void {
    this.router.navigate(['',{ outlets: { blogDetail: null }}]);
    // this.location.back();
  }

  ngAfterViewInit() {
    this.toolbarHeight = this.middleBar.nativeElement.offsetHeight;
    document.addEventListener('touchstart',this._touchStart.bind(this), false);
    document.addEventListener('touchend',this._touchEnd.bind(this), false);
  }

  _touchStart(ev) {
    this.touchEvent.clientX = ev.touches[0].clientX;
    this.touchEvent.clientY = ev.touches[0].clientY;
    this.touchEvent.timeStamp = ev.timeStamp;
  }

  _touchEnd(ev) {
    let newEvent = {
      clientX: ev.changedTouches[0].clientX,
      clientY: ev.changedTouches[0].clientY,
      timeStamp:ev.timeStamp
    }

    let recognize = this.isSwipe(this.touchEvent,newEvent);
    if(recognize.swip) {
      if(recognize.direction == 'left') {
        // this.toNext();
      } else {
        this.goBack();
        // this.toPrevious()
      }
    }
  }

  isSwipe(startEvent,endEvent){
    let deltX = endEvent.clientX - startEvent.clientX;
    let deltY = endEvent.clientY - startEvent.clientY;
    let deltT = endEvent.timeStamp - startEvent.timeStamp;
    let recognize = {
       direction: deltX > 0 ? 'right':'left',
       swip:( Math.abs(deltX) > 100 ) && ( Math.abs(deltY) < 20 ) && ( deltT < 500)
     }
    return recognize;
  }


  @HostListener("scroll", ["$event"])
  onWindowScroll(ev) {
    // let number = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    let number = -document.querySelector('.blog-detail').getBoundingClientRect().top;

    if (this.scheduledAnimationFrame) return;

    this.scheduledAnimationFrame = true;
    requestAnimationFrame(this.updatePage.bind(this, number));
  }

  @HostListener("window:resize")
  onWindowResize(event) {
      this.toolbarHeight = this.middleBar.nativeElement.offsetHeight;
  }

  updatePage(number){
    this.scheduledAnimationFrame = false;
    let headerHeight = this.toolbarHeight*2;

    if(number > headerHeight){
      number = headerHeight;
      this.middleBar.nativeElement.style.width = `50%`;
    } else {
      this.middleBar.nativeElement.style.width = `100%`;
    }
    this.renderer.setElementStyle(this.topBar.nativeElement, 'transform', 'translate3d(0px, 100px, 0px)');
    this.header.nativeElement.style.boxShadow = `0 2px 5px rgba(0,0,0,${.26*number/headerHeight})`
    this.header.nativeElement.style.transform = `translate3d(0px, -${number}px, 0px)`
    this.topBar.nativeElement.style.transform = `translate3d(0px, ${number}px, 0px)`
    this.middleBar.nativeElement.style.transform = `translate3d(0px, ${number/2}px, 0px)`
    this.bottomBar.nativeElement.style.transform = `scale(${1-number/headerHeight}) translateZ(0px)`
    this.bottomBar.nativeElement.style.opacity = `${1-number/headerHeight}`
  }

}
