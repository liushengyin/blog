import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HttpModule }    from '@angular/http';
import { FormsModule }    from '@angular/forms';

import { MaterialModule } from './material-module';
import { ComponentsModule } from './components/components.module';
import { AppRoutingModule } from './app-routes';

import { Data } from './providers/data';
import { db } from './providers/db';

import { AppComponent } from './app.component';
import { BlogComponent } from './pages/blog/blog.component';
import { BlogDetailComponent } from './pages/blog/blog-detail/blog-detail.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';


@NgModule({
  declarations: [
    AppComponent,
    BlogComponent,
    BlogDetailComponent,
    NotFoundComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    FormsModule,
    MaterialModule,
    ComponentsModule,
    AppRoutingModule
  ],
  providers: [Data,db],
  bootstrap: [AppComponent]
})
export class AppModule { }
