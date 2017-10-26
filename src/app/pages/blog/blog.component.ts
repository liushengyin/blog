import {Component, ElementRef, Renderer2, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent {
  dark = false;
  constructor(
    private _element: ElementRef,
    private _renderer: Renderer2) {}

  toggleFullscreen() {
    let elem = this._element.nativeElement.querySelector('.blog-root');
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullScreen) {
      elem.webkitRequestFullScreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.msRequestFullScreen) {
      elem.msRequestFullScreen();
    }
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
