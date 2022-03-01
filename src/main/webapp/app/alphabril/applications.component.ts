import { Component, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Account } from 'app/core/auth/account.model';
import { animate, style, transition, trigger } from '@angular/animations';
import { pannelInfo } from 'app/engine/engine.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'jhi-alphabril',
  templateUrl: './alphabril.component.html',
  styleUrls: ['./alphabril.component.scss'],
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
export class AlphabrilComponent implements OnDestroy {
  account: Account | null = null;

  @Input() public show = false;
  @Input() public app: pannelInfo = { app: '', side: false };
  @Output() newEvent = new EventEmitter<boolean>();
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

  reset(): void {
    this.show = false;
    this.app.app = '';
    this.newEvent.emit(false);
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
