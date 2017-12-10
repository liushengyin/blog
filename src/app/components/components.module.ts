import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppDrawerComponent } from './app-drawer/app-drawer.component';
import { AppInfiniteComponent } from './app-infinite/app-infinite.component';
import { AppRefresherComponent, Refresher } from './app-refresher';

@NgModule({
  imports: [CommonModule],
    declarations: [
    AppDrawerComponent,
    AppInfiniteComponent,
    AppRefresherComponent,
    Refresher,

  ],
  exports: [
    AppDrawerComponent,
    AppInfiniteComponent,
    AppRefresherComponent,
    Refresher,

  ]
})
export class ComponentsModule { }
