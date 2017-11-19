import { NgModule }       from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ComponentsModule } from '../../components/components.module';
import { SlidesComponent } from './slides.component';
import { MatButtonModule, MatListModule } from '@angular/material';

const routes: Routes = [
  {
    path: '',
    component: SlidesComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    MatButtonModule,
    MatListModule,
    RouterModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ SlidesComponent ],
  exports: [ SlidesComponent ,RouterModule]
})

export class SlidesModule {}