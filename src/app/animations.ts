import { animate, AnimationEntryMetadata, state, style, transition, trigger } from '@angular/core';

// Component transition animations
export const slideInDownAnimation: AnimationEntryMetadata =
  trigger('routeAnimation', [
    state('*',
      style({
        opacity: 1,
      })
    ),
    transition(':enter', [
      style({
        opacity: 0,
        transform: 'translateX(100%)'
      }),
      animate('400ms cubic-bezier(.35,0,.25,1)')
    ]),
    transition(':leave', [
      animate('400ms cubic-bezier(.35,0,.25,1)', style({
        opacity: 0,
        transform: 'translateX(100%)'
      }))
    ])
  ]);
