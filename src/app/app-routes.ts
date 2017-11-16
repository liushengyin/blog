import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BlogComponent} from './pages/blog/blog.component'
import { BlogDetailComponent} from './pages/blog/blog-detail/blog-detail.component'
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { SelectivePreloadingStrategy } from './selective-preloading-strategy';

export const BLOG_ROUTES: Routes = [
];

export const routes: Routes = [

  {path: '',  component: BlogComponent, children: BLOG_ROUTES, data: { animation: { value: 'blog' } }},
  {path: 'detail',  component: BlogDetailComponent, data: { animation: { value: 'slides' } } },
  // {path: 'slides',  component: SlidesComponent,data: { animation: { value: 'slides' } } },
  {path: 'slides', loadChildren: 'app/pages/slides/slides.module#SlidesModule', data: { preload: true }},
  {path: 'blogDetail', component: BlogDetailComponent, outlet: 'blogDetail'},
  {path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [ RouterModule.forRoot(
      routes,
      {
        // enableTracing: true, // <-- debugging purposes only
        preloadingStrategy: SelectivePreloadingStrategy,

      }) 
  ],
  exports: [ RouterModule ],
  providers: [
    SelectivePreloadingStrategy
  ]
})
export class AppRoutingModule {}