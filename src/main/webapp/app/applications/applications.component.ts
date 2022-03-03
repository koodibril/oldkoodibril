import { Component, OnChanges, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Account } from 'app/core/auth/account.model';
import { animate, style, transition, trigger } from '@angular/animations';
import { Application, applications } from 'app/engine/actions/text.service';
import { pannelInfo } from 'app/engine/engine.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'jhi-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss'],
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
export class ApplicationsComponent implements OnChanges, OnDestroy {
  account: Account | null = null;

  @Input() public show = false;
  @Input() public app: pannelInfo = { app: '', side: false };
  public subtitle = '';
  public logo = '';
  public pictures = [''];
  public description = '';
  public link = '';
  public git = '';
  public technos = [''];
  public image = '';
  public pdf = '';
  public trustPdf!: SafeResourceUrl;
  public showModal = false;
  private applications: Application[];
  private readonly destroy$ = new Subject<void>();
  constructor(private router: Router, protected _sanitizer: DomSanitizer) {
    this.applications = applications;
  }

  ngOnChanges(): void {
    console.log(this.show);
    if (this.app.app !== '') {
      const index = this.applications.findIndex(el => el.name === this.app.app);
      this.subtitle = this.applications[index].subtitle;
      this.logo = this.applications[index].logo;
      this.pictures = this.applications[index].pictures;
      this.pdf = this.applications[index].pdf;
      this.trustPdf = this._sanitizer.bypassSecurityTrustResourceUrl(this.applications[index].pdf);
      this.description = this.applications[index].description;
      this.link = this.applications[index].link;
      this.git = this.applications[index].git;
      this.technos = this.applications[index].technos;
    }
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
