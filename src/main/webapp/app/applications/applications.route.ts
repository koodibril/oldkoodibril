import { Route } from '@angular/router';

import { ApplicationsComponent } from './applications.component';

export const APPLICATIONS_ROUTE: Route = {
  path: '',
  component: ApplicationsComponent,
  data: {
    pageTitle: 'applications.title',
  },
};
