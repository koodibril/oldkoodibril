import { Route } from '@angular/router';

import { AlphabrilComponent } from './applications.component';

export const APPLICATIONS_ROUTE: Route = {
  path: '',
  component: AlphabrilComponent,
  data: {
    pageTitle: 'applications.title',
  },
};
