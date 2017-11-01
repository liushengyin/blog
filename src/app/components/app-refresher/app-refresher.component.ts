import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Refresher } from './refresher';

@Component({
  selector: 'ion-refresher-content',
  templateUrl: './app-refresher.component.html',
  styleUrls: ['./app-refresher.component.scss'],
  host: {
    '[attr.state]': 'r.state'
  },
  encapsulation: ViewEncapsulation.None,
})
export class AppRefresherComponent {
 
  /**
   * @input {string} a static icon to display when you begin to pull down
   */
  @Input() pullingIcon: string;

  /**
   * @input {string} the text you want to display when you begin to pull down
   */
  @Input() pullingText: string;

  /**
   * @input {string} An animated SVG spinner that shows when refreshing begins
   */
  @Input() refreshingSpinner: string;

  /**
   * @input {string} the text you want to display when performing a refresh
   */
  @Input() refreshingText: string;


  constructor(public r: Refresher) {}

  /**
   * @hidden
   */
  ngOnInit() {
  }
}