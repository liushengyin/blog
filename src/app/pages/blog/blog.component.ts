import {Component, ElementRef, Renderer2, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class BlogComponent {
  dark = false;
  items = [
    {category: '前端',subCategory:['HTML','CSS','Javascript','AngularJS','工程化']},
    {category: '后端',subCategory:['PHP','SQL','APACHE']},
    {category: '工具',subCategory:['git','IDE','Docker']},
    {category: '测试',subCategory:['Jasmine']},
    {category: '其它',subCategory:['面向对象']},
  ];

  constructor(
    private _element: ElementRef,
    private _renderer: Renderer2) {}

  toggleFullscreen() {
    let elem = this._element.nativeElement.querySelector('.demo-root');
    console.log(this.isDocumentInFullScreenMode())

    if (!this.isDocumentInFullScreenMode()) {
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
  }
  isDocumentInFullScreenMode() {
    return (document.fullscreenElement && document.fullscreenElement !== null) || (document.webkitIsFullScreen);
  }

  toggleTheme() {
    const darkThemeClass = 'unicorn-dark-theme';

    this.dark = !this.dark;

    if (this.dark) {
      this._renderer.addClass(this._element.nativeElement, darkThemeClass);
      // this._overlayContainer.getContainerElement().classList.add(darkThemeClass);
    } else {
      this._renderer.removeClass(this._element.nativeElement, darkThemeClass);
      // this._overlayContainer.getContainerElement().classList.remove(darkThemeClass);
    }
  }
}
