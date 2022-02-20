import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EngineComponent } from '../engine/engine.component';
import { WindowRefService } from '../services/window-ref.service';
import { SharedModule } from 'app/shared/shared.module';
import { APPLICATIONS_ROUTE } from './applications.route';
import { ApplicationsComponent } from './applications.component';

@NgModule({
  imports: [SharedModule, RouterModule.forChild([APPLICATIONS_ROUTE])],
  declarations: [ApplicationsComponent, EngineComponent],
  providers: [WindowRefService],
})
export class ApplicationsModule {}
