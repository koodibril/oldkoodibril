import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EngineComponent } from '../engine/engine.component';
import { WindowRefService } from '../services/window-ref.service';
import { SharedModule } from 'app/shared/shared.module';
import { APPLICATIONS_ROUTE } from './yourapp.route';
import { YourappComponent } from './yourapp.component';

@NgModule({
  imports: [SharedModule, RouterModule.forChild([APPLICATIONS_ROUTE])],
  declarations: [YourappComponent, EngineComponent],
  providers: [WindowRefService],
})
export class ApplicationsModule {}
