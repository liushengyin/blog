import {Routes} from '@angular/router';
import { BlogComponent, Home} from './pages/blog/blog.component'

export const DEMO_APP_ROUTES: Routes = [
  {path: '', component: BlogComponent, children: [
    {path: '', component: Home},
  ]}
];

export const ALL_ROUTES: Routes = [
  {path: '',  component: BlogComponent, children: DEMO_APP_ROUTES},
];
