import { Renderer, Component, HostListener,ViewChild,ElementRef, Input, OnInit,ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location }                 from '@angular/common';
import { Data } from '../../../providers/data';

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
  // @ViewChild("content") content: ElementRef
  @ViewChild("article") article: ElementRef

  id = '';
  categoryId ;
  scheduledAnimationFrame = false;
  toolbarHeight = 64;
  baseUrl = 'http://www.liushengyin.com/api/';

  blogDetail = {
    id:'',
    title:'',
    tag:'',
    abstract:'',
    body:''
  };
  pre = null;
  next = null;

  constructor( private route: ActivatedRoute ,
               private location: Location,
               private renderer: Renderer,
               public data: Data) { }
  items = [
    {text: 'Refresh'},
    {text: 'Settings'},
    {text: 'Help', disabled: true},
    {text: 'Sign Out'}
  ];
  ngOnInit() {

   this.route.paramMap.subscribe((params: ParamMap) => {
   });

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
    let url = new URL(`article/${this.id}`,this.baseUrl);
    if(this.categoryId != 0) {
      url.searchParams.append("categoryId", this.categoryId);
    }

    this.data.get(url)
           .subscribe(
             data =>{ this.handleData(data)},
             error =>{this.handleError(error);}
            );
  }
  // 处理博客列表数据
  handleData(data){
    this.blogDetail = data.results;
    this.article.nativeElement.innerHTML = this.blogDetail.body;
    this.pre = data.pre;
    this.next = data.next;
  }
  
  // 错误处理
  handleError(error){
      console.log(error);
  }
  toPrevious(){
    this.id = this.pre.id;
    this.getData();
  }
  toNext(){
    this.id = this.next.id;
    this.getData();
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
      requestAnimationFrame(this.updatePage.bind(this, number));
  }

  updatePage(number){
    this.scheduledAnimationFrame = false;
    let headerHeight = this.toolbarHeight*2;

    if(number > headerHeight) number = headerHeight;
    // this.renderer.setElementStyle(this.topBar.nativeElement, 'transform', 'translate3d(0px, 100px, 0px)');
    this.header.nativeElement.style.transform = `translate3d(0px, -${number}px, 0px)`
    this.topBar.nativeElement.style.transform = `translate3d(0px, ${number}px, 0px)`
    this.middleBar.nativeElement.style.transform = `translate3d(0px, ${number/2}px, 0px)`
    this.bottomBar.nativeElement.style.transform = `scale(${1-number/headerHeight}) translateZ(0px)`
    this.bottomBar.nativeElement.style.opacity = `${1-number/headerHeight}`
  }

}
