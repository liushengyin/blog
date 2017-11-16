/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import { AppRefresherComponent } from './app-refresher.component';
import { Refresher } from './refresher';

@NgModule({
  exports: [AppRefresherComponent, Refresher],
  declarations: [AppRefresherComponent, Refresher],
})
export class RefresherModule {}
