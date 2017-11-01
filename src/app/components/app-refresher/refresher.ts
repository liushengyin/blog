import { Directive, OnInit, ElementRef, Input, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: 'ion-refresher',
  host: {
    '[class.refresher-active]': 'state !== "inactive"',
    '[style.top]': '_top'
  }
})
export class Refresher implements OnInit {
  _appliedStyles: boolean = false;
  _didStart: boolean;
  _lastCheck: number = 0;

  _top: string = '';

  state: string = STATE_INACTIVE;

  /**
   * The Y coordinate of where the user started to the pull down the content.
   */
  startY: number = null;

  /**
   * The current touch or mouse event's Y coordinate.
   */
  currentY: number = null;

  /**
   * The distance between the start of the pull and the current touch or
   * mouse event's Y coordinate.
   */
  deltaY: number = null;

  /**
   * A number representing how far down the user has pulled.
   * The number `0` represents the user hasn't pulled down at all. The
   * number `1`, and anything greater than `1`, represents that the user
   * has pulled far enough down that when they let go then the refresh will
   * happen. If they let go and the number is less than `1`, then the
   * refresh will not happen, and the content will return to it's original
   * position.
   */
  progress: number = 0;

  /**
   * @input {number} The min distance the user must pull down until the
   * refresher can go into the `refreshing` state. Default is `60`.
   */
  @Input() pullMin: number = 60;

  /**
   * @input {number} The maximum distance of the pull until the refresher
   * will automatically go into the `refreshing` state. By default, the pull
   * maximum will be the result of `pullMin + 60`.
   */
  @Input() pullMax: number = this.pullMin + 60;

  /**
   * @input {number} How many milliseconds it takes the refresher to to snap back to the `refreshing` state. Default is `280`.
   */
  @Input() snapbackDuration: number = 280;
  /**
   * @output {event} Emitted when the user lets go and has pulled down
   * far enough, which would be farther than the `pullMin`, then your refresh hander if
   * fired and the state is updated to `refreshing`. From within your refresh handler,
   * you must call the `complete()` method when your async operation has completed.
   */
  @Output() ionRefresh: EventEmitter<Refresher> = new EventEmitter<Refresher>();

  /**
   * @output {event} Emitted while the user is pulling down the content and exposing the refresher.
   */
  @Output() ionPull: EventEmitter<Refresher> = new EventEmitter<Refresher>();

  /**
   * @output {event} Emitted when the user begins to start pulling down.
   */
  @Output() ionStart: EventEmitter<Refresher> = new EventEmitter<Refresher>();

  constructor(public _elementRef: ElementRef) { }

  ngOnInit() {
      document.addEventListener('touchstart',this._onStart.bind(this), false);  
      document.addEventListener('touchmove',this._onMove.bind(this), false);  
      document.addEventListener('touchend',this._onEnd.bind(this), false);  
  }

  _onStart(ev:TouchEvent): any{
    // if multitouch then get out immediately
    if (ev.touches && ev.touches.length > 1) {
      return false;
    }

    if (this.state !== STATE_INACTIVE) {
      return false;
    }

    let scrollHostScrollTop = document.body.getBoundingClientRect().top;
    // if the scrollTop is greater than zero then it's
    // not possible to pull the content down yet
    if (scrollHostScrollTop < 0) {
      return false;
    }

    let coord = pointerCoord(ev);
    console.log('Pull-to-refresh, onStart', ev.type, 'y:', coord.y);

    // if (this._content.contentTop > 0) {
    //   let newTop = this._content.contentTop + 'px';
    //   if (this._top !== newTop) {
    //     this._top = newTop;
    //   }
    // }

    this.startY = this.currentY = coord.y;
    this.progress = 0;
    this.state = STATE_INACTIVE;
    return true;
  }

  _onMove(ev:TouchEvent){
    // if multitouch then get out immediately
    if (ev.touches && ev.touches.length > 1) {
      return 1;
    }

    // do nothing if it's actively refreshing
    // or it's in the process of closing
    // or this was never a startY
    if (this.startY === null || this.state === STATE_REFRESHING || this.state === STATE_CANCELLING || this.state === STATE_COMPLETING) {
      return 2;
    }

    // if we just updated stuff less than 16ms ago
    // then don't check again, just chillout plz
    let now = Date.now();
    if (this._lastCheck + 16 > now) {
      return 3;
    }

    // remember the last time we checked all this
    this._lastCheck = now;

    // get the current pointer coordinates
    let coord = pointerCoord(ev);

    this.currentY = coord.y;

    // it's now possible they could be pulling down the content
    // how far have they pulled so far?
    this.deltaY = (coord.y - this.startY);

    // don't bother if they're scrolling up
    // and have not already started dragging
    if (this.deltaY <= 0) {
      return 4;
    }

    if (this.state === STATE_INACTIVE) {
      // this refresh is not already actively pulling down

      // get the content's scrollTop
      let scrollHostScrollTop = document.body.getBoundingClientRect().top;

      // if the scrollTop is greater than zero then it's
      // not possible to pull the content down yet
      if (scrollHostScrollTop < 0) {
        this.progress = 0;
        this.startY = null;
        return 7;
      }
      // content scrolled all the way to the top, and dragging down
      this.state = STATE_PULLING;
    }

    // prevent native scroll events
    // ev.preventDefault();

    // the refresher is actively pulling at this point
    // move the scroll element within the content element
    this._setCss(this.deltaY, '0ms', true, '');

    if (!this.deltaY) {
      // don't continue if there's no delta yet
      this.progress = 0;
      return 8;
    }

    // so far so good, let's run this all back within zone now
      this._onMoveInZone();

  }

  _onMoveInZone() {
    // set pull progress
    this.progress = (this.deltaY / this.pullMin);

    // emit "start" if it hasn't started yet
    if (!this._didStart) {
      this._didStart = true;
      this.ionStart.emit(this);
    }

    // emit "pulling" on every move
    this.ionPull.emit(this);

    // do nothing if the delta is less than the pull threshold
    if (this.deltaY < this.pullMin) {
      // ensure it stays in the pulling state, cuz its not ready yet
      this.state = STATE_PULLING;
      return 2;
    }

    if (this.deltaY > this.pullMax) {
      // they pulled farther than the max, so kick off the refresh
      this._beginRefresh();
      return 3;
    }

    // pulled farther than the pull min!!
    // it is now in the `ready` state!!
    // if they let go then it'll refresh, kerpow!!
    this.state = STATE_READY;

    return 4;
  }

  _onEnd(ev:TouchEvent){

    if (this.state === STATE_READY) {
        this._beginRefresh();
    } else if (this.state === STATE_PULLING) {
        this.cancel();
    }

    // reset on any touchend/mouseup
    this.startY = null;
  }

  _beginRefresh() {
    // assumes we're already back in a zone
    // they pulled down far enough, so it's ready to refresh
    this.state = STATE_REFRESHING;

    // place the content in a hangout position while it thinks
    this._setCss(this.pullMin, (this.snapbackDuration + 'ms'), true, '');

    // emit "refresh" because it was pulled down far enough
    // and they let go to begin refreshing
    this.ionRefresh.emit(this);
  }

  complete() {
    this._close(STATE_COMPLETING, '120ms');
  }

  /**
   * Changes the refresher's state from `refreshing` to `cancelling`.
   */
  cancel() {
    this._close(STATE_CANCELLING, '');
  }

  _close(state: string, delay: string) {
    var timer: number;

    function close(ev: TransitionEvent) {
      // closing is done, return to inactive state
      if (ev) {
        clearTimeout(timer);
      }

      this.state = STATE_INACTIVE;
      this.progress = 0;
      this._didStart = this.startY = this.currentY = this.deltaY = null;
      this._setCss(0, '0ms', false, '');
    }

    // create fallback timer incase something goes wrong with transitionEnd event
    timer = setTimeout(close.bind(this), 600);

    // create transition end event on the content's scroll element
    // this._content.onScrollElementTransitionEnd(close.bind(this));

    // reset set the styles on the scroll element
    // set that the refresh is actively cancelling/completing
    this.state = state;
    this._setCss(0, '', true, delay);

    // if (this._pointerEvents) {
    //   this._pointerEvents.stop();
    // }
  }

  _setCss(y: number, duration: string, overflowVisible: boolean, delay: string) {
    this._appliedStyles = (y > 0);

    const Css = getCss(document.body);
    this.setScrollElementStyle(Css.transform, ((y > 0) ? 'translateY(' + y + 'px) translateZ(0px)' : 'translateZ(0px)'));
    this.setScrollElementStyle(Css.transitionDuration, duration);
    this.setScrollElementStyle(Css.transitionDelay, delay);
    this.setScrollElementStyle('overflow', (overflowVisible ? 'hidden' : ''));
  }
  /**
   * @hidden
   * DOM WRITE
   */
  setScrollElementStyle(prop: string, val: any) {
    const scrollEle = document.body;
    if (scrollEle) {
        (<any>scrollEle.style)[prop] = val;
    }
  }

}

const STATE_INACTIVE = 'inactive';
const STATE_PULLING = 'pulling';
const STATE_READY = 'ready';
const STATE_REFRESHING = 'refreshing';
const STATE_CANCELLING = 'cancelling';
const STATE_COMPLETING = 'completing';

export function pointerCoord(ev: any): PointerCoordinates {
  // get coordinates for either a mouse click
  // or a touch depending on the given event
  if (ev) {
    var changedTouches = ev.changedTouches;
    if (changedTouches && changedTouches.length > 0) {
      var touch = changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    }
    var pageX = ev.pageX;
    if (pageX !== undefined) {
      return { x: pageX, y: ev.pageY };
    }
  }
  return { x: 0, y: 0 };
}

export interface PointerCoordinates {
  x?: number;
  y?: number;
}

export function getCss(docEle: HTMLElement) {
  const css: {
    transform?: string;
    transition?: string;
    transitionDuration?: string;
    transitionDelay?: string;
    transitionTimingFn?: string;
    transitionStart?: string;
    transitionEnd?: string;
    transformOrigin?: string;
    animationDelay?: string;
  } = {};

  // transform
  var i: number;
  var keys = ['webkitTransform', '-webkit-transform', 'webkit-transform', 'transform'];

  for (i = 0; i < keys.length; i++) {
    if ((<any>docEle.style)[keys[i]] !== undefined) {
      css.transform = keys[i];
      break;
    }
  }

  // transition
  keys = ['webkitTransition', 'transition'];
  for (i = 0; i < keys.length; i++) {
    if ((<any>docEle.style)[keys[i]] !== undefined) {
      css.transition = keys[i];
      break;
    }
  }

  // The only prefix we care about is webkit for transitions.
  var isWebkit = css.transition.indexOf('webkit') > -1;

  // transition duration
  css.transitionDuration = (isWebkit ? '-webkit-' : '') + 'transition-duration';

  // transition timing function
  css.transitionTimingFn = (isWebkit ? '-webkit-' : '') + 'transition-timing-function';

  // transition delay
  css.transitionDelay = (isWebkit ? '-webkit-' : '') + 'transition-delay';

  // To be sure transitionend works everywhere, include *both* the webkit and non-webkit events
  css.transitionEnd = (isWebkit ? 'webkitTransitionEnd ' : '') + 'transitionend';

  // transform origin
  css.transformOrigin = (isWebkit ? '-webkit-' : '') + 'transform-origin';

  // animation delay
  css.animationDelay = (isWebkit ? 'webkitAnimationDelay' : 'animationDelay');

  return css;
}

