import {Component, ViewChild, OnInit, HostBinding, ElementRef, Renderer2, ViewEncapsulation} from '@angular/core';
import {query, stagger, animate, style, transition, trigger} from '@angular/animations';
import { Data } from '../../providers/data';
import { AppInfiniteComponent } from '../../components/app-infinite/app-infinite.component';
import { Router, NavigationExtras} from '@angular/router';

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

  articles = [];
  next_page = 1;
  empty = false;

  constructor(
    public data:Data,
    private router:Router,
    private _element: ElementRef,
    private _renderer: Renderer2) {}

  ngOnInit() {
    this.getData();
    this.getCategories();
  }

  ngAfterViewInit() {
    // 监听元素滚动事件，TODO 解决方案不是太好
    this._element.nativeElement.querySelector('.mat-drawer-content').onscroll = this.infinite.onWindowScroll.bind(this.infinite);
    this.moveAvart();
  }
  moveAvart(){
     let avart = this._element.nativeElement.querySelector("#avatar");
     let src = '../../../assets/kitten-small.png';
     let count = 0;
     setInterval(()=>{
       switch (count) {
         case 0:
           src = '../../../assets/kitten-small.png';
           break;
         case 1:
           src = '../../../assets/kitten-medium.png';
           break;
         case 2:
           src = '../../../assets/kitten-large.png';
           break;
       }
       avart.src = src;
       count = count==3 ? 0:count+1;
     },4000)
  }

  // 获取数据
  getData() {
    // 构建URL路径

    let url = 'article';
    url = url + `?page=${this.next_page}`;
    if(this.categoryId) {
      url = url + `&categoryId=${this.categoryId}`;
    }

    this.data.get(url)
           .subscribe(
             data =>{ this.handleData(data)},
             error =>{this.handleError(error);}
            );
  }

  // 处理数据
  handleData(data){

    this.infinite.complete();

    if(data.articles.data.length) {
      this.updateListState(data);
    } else {
      this.emptyState();
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

  // 根据分类获取数据
  getDataFromCategory(item = null) {
    // 初始化状态
    this.initeState();
    // 获取分类id
    this.categoryId = item? item.id:0 ;
    // 获取数据
    this.getData();
  }

  // 加载更多列表数据
  doInfinite(infiniteScroll) {
    this.getData();
  }

  doRefresh(refresher) {

    this.refresh();
    setTimeout(() => {
      refresher.complete();
    }, 1000);
  }

  // 刷新
  refresh(){
    this.initeState();
    this.getData();
  }

  // 初始化参数状态
  initeState(){
    this.categoryId = 0;
    this.next_page = 1;
    this.articles = [];
    this.empty = false;
    this.infinite.enable(true);
  }

  // 更新列表数据
  updateListState(data){
    this.next_page = data.articles.current_page + 1;
    let temArticles = data.articles.data;
    temArticles.forEach((item)=>{
      item.created_at = item.created_at.substring(0,10);
      item.tag = item.tag.trim() == "" ? []:item.tag.trim().split(" ");
    });
    this.articles = this.articles.length ? this.articles.concat(temArticles): temArticles;
  }

  // 没有更多内容
  emptyState() {
    this.infinite.enable(false);
    this.empty = true;
  }

  // 进入详情页面
  toBlogDetail(id) {

    let navigationExtras: NavigationExtras = {
      queryParams: { 'id': id, 'categoryId': this.categoryId },
    };

    this.router.navigate([ '',{ outlets: { blogDetail: ['blogDetail'] } } ], navigationExtras);
  }

  // 分享 https&chrome 才可以使用，覆盖率50%左右
  share() {

    if ((<any>navigator).share) {
      (<any>navigator).share({
          title: 'Blog',
          text: 'Sheng Blog',
          url: 'https://www.liushengyin.com/',
      })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    }

  }

  // 切换全屏状态
  toggleFullscreen() {
    // let elem = this._element.nativeElement.querySelector('.m-root');
    let elem:any = document.querySelector('#app');
    // let elem:any = document.body;

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
      this._renderer.addClass(document.body, darkThemeClass);
    } else {
      this._renderer.removeClass(document.body, darkThemeClass);
    }
  }

}
