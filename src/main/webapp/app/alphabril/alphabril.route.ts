import { Route } from '@angular/router';

import { AlphabrilComponent } from './alphabril.component';

export const APPLICATIONS_ROUTE: Route = {
  path: '',
  component: AlphabrilComponent,
  data: {
    pageTitle: 'applications.title',
  },
};
