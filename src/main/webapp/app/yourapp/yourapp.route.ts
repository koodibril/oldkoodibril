import { Route } from '@angular/router';

import { YourappComponent } from './yourapp.component';

export const APPLICATIONS_ROUTE: Route = {
  path: '',
  component: YourappComponent,
  data: {
    pageTitle: 'applications.title',
  },
};
