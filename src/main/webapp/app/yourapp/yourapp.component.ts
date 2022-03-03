import { Component, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Account } from 'app/core/auth/account.model';
import { animate, style, transition, trigger } from '@angular/animations';
import { pannelInfo } from 'app/engine/engine.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'jhi-yourapp',
  templateUrl: './yourapp.component.html',
  styleUrls: ['./yourapp.component.scss'],
  animations: [
    trigger('slideInOutRight', [
      transition(':enter', [style({ transform: 'translateX(100%)' }), animate('200ms ease-in', style({ transform: 'translateX(0%)' }))]),
      transition(':leave', [animate('200ms ease-in', style({ transform: 'translateX(100%)' }))]),
    ]),
    trigger('slideInOutLeft', [
      transition(':enter', [style({ transform: 'translateX(-100%)' }), animate('200ms ease-in', style({ transform: 'translateX(0%)' }))]),
      transition(':leave', [animate('200ms ease-in', style({ transform: 'translateX(-100%)' }))]),
    ]),
  ],
})
export class YourappComponent implements OnDestroy {
  account: Account | null = null;

  @Input() public show = false;
  @Input() public app: pannelInfo = { app: '', side: false };
  public image = '';
  public trustPdf!: SafeResourceUrl;
  public showModal = false;
  private readonly destroy$ = new Subject<void>();
  constructor(private router: Router, protected _sanitizer: DomSanitizer) {
    this.trustPdf = this._sanitizer.bypassSecurityTrustResourceUrl('');
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  setModal(img: string): void {
    this.showModal = true;
    this.image = img;
  }

  clearModal(): void {
    this.showModal = false;
    this.image = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
