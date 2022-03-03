import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { pannelInfo } from 'app/engine/engine.component';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  account: Account | null = null;

  public showApp = false;
  public app: pannelInfo = { app: '', side: false };
  private readonly destroy$ = new Subject<void>();

  constructor(private accountService: AccountService, private router: Router) {}

  setApp(app: pannelInfo): void {
    if (this.showApp && app.app === 'wheel') {
      this.resetApp();
    } else if (!this.showApp && app.app !== 'wheel') {
      setTimeout(() => {
        this.showApp = true;
        this.app = app;
      }, 1);
    }
  }

  resetApp(): void {
    if (this.showApp) {
      this.showApp = false;
      this.app = { app: '', side: false };
    }
  }

  ngOnInit(): void {
    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => (this.account = account));
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
