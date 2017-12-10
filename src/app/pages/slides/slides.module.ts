import { NgModule }       from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ComponentsModule } from '../../components/components.module';
import { SlidesComponent } from './slides.component';
import { MatButtonModule, MatListModule } from '@angular/material';
import { MatToolbarModule } from '../../components/toolbar';
import { AppModalComponent } from '../../components/app-modal/app-modal.component';
import { ModalController } from '../../components/app-modal/modal-controller';
import { IonicModule } from '../../module';

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
    MatToolbarModule,
    RouterModule,
    RouterModule.forChild(routes),
    IonicModule.forRoot(SlidesComponent)
  ],
  providers: [
  ModalController,
  ],
  declarations: [ SlidesComponent ,AppModalComponent],
  exports: [ SlidesComponent ,RouterModule],
})

export class SlidesModule {}
