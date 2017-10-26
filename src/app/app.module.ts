import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatToolbarModule } from './components/toolbar'
import { MatButtonModule } from './components/button'
import { MatIconModule } from './components/icon'

import { AppComponent } from './app.component';
import { AppDrawerComponent } from './components/app-drawer/app-drawer.component';
import { BlogComponent } from './pages/blog/blog.component';
// import { AppToolbarComponent } from './components/app-toolbar/app-toolbar.component';


@NgModule({
  declarations: [
    AppComponent,
    AppDrawerComponent,
    BlogComponent,
  ],
  imports: [
    BrowserModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
