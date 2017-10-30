import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BlogComponent} from './pages/blog/blog.component'
import { BlogDetailComponent} from './pages/blog/blog-detail/blog-detail.component'
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { SlidesComponent } from './pages/slides/slides.component';

export const BLOG_ROUTES: Routes = [
];

export const routes: Routes = [
  {path: '',  component: BlogComponent, children: BLOG_ROUTES, data: { animation: { value: 'blog' } }},
  {path: 'detail/:id',  component: BlogDetailComponent, data: { animation: { value: 'slides' } } },
  {path: 'slides',  component: SlidesComponent,data: { animation: { value: 'slides' } } },
  {path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}