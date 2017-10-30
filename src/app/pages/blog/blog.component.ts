import {Component, ViewChild, OnInit, HostBinding, ElementRef, Renderer2, ViewEncapsulation} from '@angular/core';
import {query, stagger, animate, style, transition, trigger} from '@angular/animations';
import { Data } from '../../providers/data';
import { AppInfiniteComponent } from '../../components/app-infinite/app-infinite.component';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BlogComponent implements OnInit {
  @ViewChild(AppInfiniteComponent) infinite: AppInfiniteComponent

  dark = false;
  categories = [];
  categoryId = 0;
  // [
  //   {category: '前端',subCategory:['HTML','CSS','Javascript','AngularJS','工程化']},
  //   {category: '后端',subCategory:['PHP','SQL','APACHE']},
  //   {category: '工具',subCategory:['git','IDE','Docker']},
  //   {category: '测试',subCategory:['Jasmine']},
  //   {category: '其它',subCategory:['面向对象']},
  // ];

  articles = [];
  next_page = 1;
  endList = false;
  baseUrl = 'http://www.liushengyin.com/api/';

  constructor(
    public data:Data,
    private _element: ElementRef,
    private _renderer: Renderer2) {}

  ngOnInit() {
    this.getData();
    this.getCategories();
  }
  ngAfterViewInit() {
    this._element.nativeElement.querySelector('.mat-drawer-content').onscroll = this.infinite.onWindowScroll.bind(this.infinite);
  }
  scroll(event) {
    console.log('event',event);
  }

  // 获取博客列表
  getData() {
    let url = new URL('article',this.baseUrl);
    url.searchParams.append("page", this.next_page+'');

    if(this.categoryId) {
      url.searchParams.append("categoryId", this.categoryId+'');
    }

    // let url = `article?page=${this.next_page}`;
    this.data.get(url)
           .subscribe(
             data =>{ this.handleData(data)},
             error =>{this.handleError(error);}
            );
  }

  // 处理博客列表数据
  handleData(data){

    this.infinite.complete();
    console.log(data);
    if(data.articles.data.length) {
      this.updateListState(data);
    } else {
      this.endListState();
    }
  }

  // 错误处理
  handleError(error){
      console.log(error);
  }

  // 获取分类
  getCategories() {
    let url = `category`;
    this.data.get(url)
           .subscribe(
             data =>{ 
               this.categories = data.categorys;
             },
             error =>{this.handleError(error);}
            );
  }

  getDataFromCategory(item = null) {
    this.initeState();
    this.categoryId = item? item.id:0 ;
    this.getData();
  }
  // 加载更多列表数据
  doInfinite(infiniteScroll) {
    this.getData();
  }
  refresh(){
    this.initeState();
    this.getData();
  }
  // 初始化参数状态
  initeState(){
    this.categoryId = 0;
    this.next_page = 1;
    this.articles = [];
    this.endList = false;
    this.infinite.enable(true);
  }
  // 更新列表数据
  updateListState(data){
    this.next_page = data.articles.current_page + 1;
    let temArticles = data.articles.data;
    temArticles.forEach((item)=>{
      item.tag = item.tag.trim() == "" ? []:item.tag.trim().split(" ");
    });
    this.articles = this.articles.length ? this.articles.concat(temArticles): temArticles;
  }

  // 没有更多内容
  endListState() {
    this.infinite.enable(false);
    this.endList = true;
  }

  // 全屏
  toggleFullscreen() {
    let elem = this._element.nativeElement.querySelector('.demo-root');

    if (!isDocumentInFullScreenMode()) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.webkitRequestFullScreen) {
          elem.webkitRequestFullScreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        } else if (elem.msRequestFullScreen) {
          elem.msRequestFullScreen();
        }
    } else {
      if (document.exitFullscreen) {
          document.exitFullscreen(); 
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
    }
    // 判断当前是否是全屏状态
    function isDocumentInFullScreenMode() {
      return (document.fullscreenElement && document.fullscreenElement !== null) || (document.webkitIsFullScreen);
    }
  }

  // 更换颜色主题
  toggleTheme() {
    const darkThemeClass = 'unicorn-dark-theme';

    this.dark = !this.dark;

    if (this.dark) {
      this._renderer.addClass(this._element.nativeElement, darkThemeClass);
    } else {
      this._renderer.removeClass(this._element.nativeElement, darkThemeClass);
    }
  }

}
