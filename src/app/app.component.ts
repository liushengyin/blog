import { Component ,ViewEncapsulation} from '@angular/core';
import 'hammerjs';
import {trigger, AnimationMetadata, keyframes, animate, style, group, animateChild, query, stagger, transition} from '@angular/animations';
import {routerAnimations} from './routerAnimations';

// export const routerAnimations: AnimationMetadata = trigger('routerAnimations', [
//       transition('blog => slides', [
//         query(':leave, :enter',
//           style({
//            position: 'absolute',
//            top: 0, 
//            left: 0, 
//            right: 0 , 
//            width:'100%', 
//            height:'100%',
//          })),
//         query(':enter', [
//             style({ 
//               transform: 'translateX(100%)'
//          })
//         ]),
//         group([
//           query(':leave', [
//             // 向左滑出
//             animate('400ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(-100%)' })),
//             // 向右滑出
//             // animate('800ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(100%)' })),
//             // 淡出
//             // animate('800ms cubic-bezier(.35,0,.25,1)', style({ opacity:0 }))
//           ]),
//           query(':enter', [
//             animate('400ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(0)' }))
//           ])
//         ])
//       ]),
//       transition('slides => blog', [
//         query(':leave, :enter',
//           style({
//            position: 'absolute',
//            top: 0, 
//            left: 0, 
//            right: 0 , 
//            width:'100%', 
//            height:'100%',
//          })),
//         query(':enter', [
//             style({ 
//               transform: 'translateX(-100%)'
//          })
//         ]),
//         group([
//           query(':leave', [
//             // 向左滑出
//             // animate('400ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(-100%)' })),
//             // 向右滑出
//             animate('400ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(100%)' })),
//             // 淡出
//             // animate('800ms cubic-bezier(.35,0,.25,1)', style({ opacity:0 }))
//           ]),
//           query(':enter', [
//             animate('400ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(0)' }))
//           ])
//         ])
//       ])
//     ]);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    routerAnimations
  ]

})
export class AppComponent {
  title = 'app';
  prepareRouteTransition(outlet) {
    const animation = outlet.activatedRouteData['animation'] || {};
    return animation['value'] || null;
  }
}

