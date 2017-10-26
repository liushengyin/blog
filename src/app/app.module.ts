import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';

import { MatToolbarModule } from './components/toolbar'
import { MatButtonModule } from './components/button'
import { MatIconModule } from './components/icon'
import { MaterialModule } from './material-module'
import {ALL_ROUTES} from './routes';

import { AppComponent } from './app.component';
import { AppDrawerComponent } from './components/app-drawer/app-drawer.component';
import { BlogComponent } from './pages/blog/blog.component';


@NgModule({
  declarations: [
    AppComponent,
    AppDrawerComponent,
    BlogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MaterialModule,
    RouterModule.forRoot(ALL_ROUTES)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
