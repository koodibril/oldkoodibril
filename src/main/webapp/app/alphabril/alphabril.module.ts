import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EngineComponent } from '../engine/engine.component';
import { WindowRefService } from '../services/window-ref.service';
import { SharedModule } from 'app/shared/shared.module';
import { APPLICATIONS_ROUTE } from './alphabril.route';
import { AlphabrilComponent } from './alphabril.component';

@NgModule({
  imports: [SharedModule, RouterModule.forChild([APPLICATIONS_ROUTE])],
  declarations: [AlphabrilComponent, EngineComponent],
  providers: [WindowRefService],
})
export class ApplicationsModule {}
