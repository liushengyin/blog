import {Component, ElementRef, Renderer2, ViewEncapsulation} from '@angular/core';


/**
 * Home component for welcome message in DemoApp.
 */
@Component({
  selector: 'home',
  template: `
    <p>Welcome to the development demos for Angular Material!</p>
    <p>Open the sidenav to select a demo.</p>
  `
})
export class Home {}


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
  navItems = [
    {name: 'Autocomplete', route: '/autocomplete'},
    {name: 'Button Toggle', route: '/button-toggle'},
    {name: 'Button', route: '/button'},
    {name: 'Card', route: '/card'},
    {name: 'Checkbox', route: '/checkbox'},
    {name: 'Chips', route: '/chips'},
    {name: 'Datepicker', route: '/datepicker'},
    {name: 'Dialog', route: '/dialog'},
    {name: 'Drawer', route: '/drawer'},
    {name: 'Expansion Panel', route: '/expansion'},
    {name: 'Focus Origin', route: '/focus-origin'},
    {name: 'Gestures', route: '/gestures'},
    {name: 'Grid List', route: '/grid-list'},
    {name: 'Icon', route: '/icon'},
    {name: 'Input', route: '/input'},
    {name: 'List', route: '/list'},
    {name: 'Live Announcer', route: '/live-announcer'},
    {name: 'Menu', route: '/menu'},
    {name: 'Overlay', route: '/overlay'},
    {name: 'Platform', route: '/platform'},
    {name: 'Portal', route: '/portal'},
    {name: 'Progress Bar', route: '/progress-bar'},
    {name: 'Progress Spinner', route: '/progress-spinner'},
    {name: 'Radio', route: '/radio'},
    {name: 'Ripple', route: '/ripple'},
    {name: 'Screen Type', route: '/screen-type'},
    {name: 'Select', route: '/select'},
    {name: 'Sidenav', route: '/sidenav'},
    {name: 'Slide Toggle', route: '/slide-toggle'},
    {name: 'Slider', route: '/slider'},
    {name: 'Snack Bar', route: '/snack-bar'},
    {name: 'Stepper', route: '/stepper'},
    {name: 'Table', route: '/table'},
    {name: 'Tabs', route: '/tabs'},
    {name: 'Toolbar', route: '/toolbar'},
    {name: 'Tooltip', route: '/tooltip'},
    {name: 'Typography', route: '/typography'}
  ];

  constructor(
    private _element: ElementRef,
    private _renderer: Renderer2) {}

  toggleFullscreen() {
    let elem = this._element.nativeElement.querySelector('.demo-root');
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
