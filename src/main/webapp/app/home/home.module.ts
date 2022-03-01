import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EngineComponent } from '../engine/engine.component';
import { WindowRefService } from '../services/window-ref.service';
import { SharedModule } from 'app/shared/shared.module';
import { HOME_ROUTE } from './home.route';
import { HomeComponent } from './home.component';
import { ApplicationsComponent } from 'app/applications/applications.component';
import { AlphabrilComponent } from 'app/alphabril/applications.component';
import { YourappComponent } from 'app/yourapp/yourapp.component';

@NgModule({
  imports: [SharedModule, RouterModule.forChild([HOME_ROUTE])],
  declarations: [HomeComponent, EngineComponent, ApplicationsComponent, AlphabrilComponent, YourappComponent],
  providers: [WindowRefService],
})
export class HomeModule {}
