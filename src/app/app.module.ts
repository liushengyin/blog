import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';

import { MatToolbarModule } from './components/toolbar'
import { MatButtonModule } from './components/button'
import { MatIconModule } from './components/icon'
import { MaterialModule } from './material-module'
import { AppRoutingModule } from './app-routes';

import { AppComponent } from './app.component';
import { AppDrawerComponent } from './components/app-drawer/app-drawer.component';
import { BlogComponent } from './pages/blog/blog.component';
import { BlogDetailComponent } from './pages/blog/blog-detail/blog-detail.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { SlidesComponent } from './pages/slides/slides.component';
import { SwitchComponent } from './pages/switch/switch.component'

@NgModule({
  declarations: [
    AppComponent,
    AppDrawerComponent,
    BlogComponent,
    BlogDetailComponent,
    NotFoundComponent,
    SlidesComponent,
    SwitchComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MaterialModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }