import { Component, OnInit, EventEmitter, Input, Output, ElementRef ,HostListener } from '@angular/core';

const STATE_ENABLED = 'enabled';
const STATE_DISABLED = 'disabled';
const STATE_LOADING = 'loading';

/*
  html:
  <infinite-scroll loadingText="加载更多" (infinite)="doInfinite($event)">
  </infinite-scroll>

  ts:
  doInfinite(infinite) {
    setTimeout(() => {
      infinite.complete();
    }, 500);
  }

*/

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

  @Input()
  set enabled(shouldEnable: boolean) {
    this.enable(shouldEnable);
  }

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
        return;
    }

    if (this._lastCheck + 32 > ev.timeStamp) {
        return;
    }
    this._lastCheck = ev.timeStamp;

    let d = this._elementRef.nativeElement.getBoundingClientRect();
    const threshold = this._thrPc ? (this.clientHeight * this._thrPc) : this._thrPx;

    let distanceFromInfinite: number;

    distanceFromInfinite = d.top - this.clientHeight - threshold;

    if(distanceFromInfinite < 0) {

        if (this.state !== STATE_LOADING && this.state !== STATE_DISABLED) {
          this.state = STATE_LOADING;
          this.infinite.emit(this);
        }
        return;
    }
    return;
  }

  @HostListener("window:resize")
  onWindowResize(event) {
      this.clientHeight = this.getClientHeight();
  }

  enable(shouldEnable: boolean) {
      this.state = (shouldEnable ? STATE_ENABLED : STATE_DISABLED);
  }

  complete() {
    if (this.state !== STATE_LOADING) {
      return;
    }
    this.state = STATE_DISABLED;
    setTimeout(()=>{
      this.state = STATE_ENABLED;
    },100);

  }
}


