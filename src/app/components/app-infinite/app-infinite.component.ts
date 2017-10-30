import { Component, OnInit, EventEmitter, Input, Output, ElementRef ,HostListener } from '@angular/core';

@Component({
  selector: 'infinite-scroll',
  templateUrl: './app-infinite.component.html',
  styleUrls: ['./app-infinite.component.scss']
})
export class AppInfiniteComponent implements OnInit {
  _lastCheck: number = 0;
  _thr: string = '5%';
  _thrPx: number = 0;
  _thrPc: number = 0.05;

  state: string = STATE_ENABLED;

  clientHeight = null;
  
  /**
   * @input {string} 
   */
  @Input()
  get threshold(): string {
    return this._thr;
  }
  set threshold(val: string) {
    this._thr = val;
    if (val.indexOf('%') > -1) {
      this._thrPx = 0;
      this._thrPc = (parseFloat(val) / 100);
    } else {
      this._thrPx = parseFloat(val);
      this._thrPc = 0;
    }
  }
  /**
   * @input {boolean} 
   */
  @Input()
  set enabled(shouldEnable: boolean) {
    this.enable(shouldEnable);
  }
  /**
   * @input {string} Optional text to display while loading.
   */
  @Input() loadingText: string;

  @Output() infinite: EventEmitter<AppInfiniteComponent> = new EventEmitter<AppInfiniteComponent>();

  constructor(
    public _elementRef: ElementRef) { }

  ngOnInit() {
    this.clientHeight = this.getClientHeight();
  }

  getClientHeight() {
    return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
  }

  @HostListener("window:scroll",['$event'])
  onWindowScroll(ev) {
    if (this.state === STATE_LOADING || this.state === STATE_DISABLED) {
        return 1;
    }

    if (this._lastCheck + 32 > ev.timeStamp) {
        return 2;
    }
    this._lastCheck = ev.timeStamp;

    // ******** DOM READ ****************
    let d = this._elementRef.nativeElement.getBoundingClientRect();
    const threshold = this._thrPc ? (this.clientHeight * this._thrPc) : this._thrPx;

    let distanceFromInfinite: number;

    distanceFromInfinite = d.top - this.clientHeight - threshold;

    if(distanceFromInfinite < 0) {

        if (this.state !== STATE_LOADING && this.state !== STATE_DISABLED) {
          this.state = STATE_LOADING;
          this.infinite.emit(this);
        }
        return 3;
    }
    return 5;
  }

  @HostListener("window:resize")
  onWindowResize(event) {
      this.clientHeight = this.getClientHeight();
  }

  /**
   * @param {boolean}
   */
  enable(shouldEnable: boolean) {
    // 防止抖动 TODO 这种解决方案不好，应该另想方法
    setTimeout(()=>{
      this.state = (shouldEnable ? STATE_ENABLED : STATE_DISABLED);
    },200);
  }

  /**
  * @param {Promise<any>}
  */
  waitFor(action: Promise<any>) {
    const enable = this.complete.bind(this);
    action.then(enable, enable);
  }

  complete() {
    if (this.state !== STATE_LOADING) {
      return;
    }
    this.state = STATE_DISABLED;
    // 防止抖动 TODO 这种解决方案不好，应该另想方法
    setTimeout(()=>{
      this.state = STATE_ENABLED;
    },100);

  }
}

const STATE_ENABLED = 'enabled';
const STATE_DISABLED = 'disabled';
const STATE_LOADING = 'loading';