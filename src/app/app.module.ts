import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import { HttpModule }    from '@angular/http';
import { FormsModule }    from '@angular/forms';

import { MatToolbarModule } from './components/toolbar';
import { AppDrawerComponent } from './components/app-drawer/app-drawer.component';
import { AppInfiniteComponent } from './components/app-infinite/app-infinite.component';
import { AppRefresherComponent } from './components/app-refresher/app-refresher.component';
import { Refresher } from './components/app-refresher/refresher';

import { MaterialModule } from './material-module';
import { AppRoutingModule } from './app-routes';

import { Data } from './providers/data';

import { AppComponent } from './app.component';
import { BlogComponent } from './pages/blog/blog.component';
import { BlogDetailComponent } from './pages/blog/blog-detail/blog-detail.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { SlidesComponent } from './pages/slides/slides.component';


@NgModule({
  declarations: [
    AppComponent,
    AppDrawerComponent,
    BlogComponent,
    BlogDetailComponent,
    NotFoundComponent,
    SlidesComponent,
    AppInfiniteComponent,
    AppRefresherComponent,
    Refresher,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    FormsModule,
    MatToolbarModule,
    MaterialModule,
    AppRoutingModule
  ],
  providers: [Data],
  bootstrap: [AppComponent]
})
export class AppModule { }
