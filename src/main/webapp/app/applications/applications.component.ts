import { Component, OnChanges, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Account } from 'app/core/auth/account.model';
import { animate, style, transition, trigger } from '@angular/animations';
import { Application, applications } from 'app/engine/actions/text.service';
import { pannelInfo } from 'app/engine/engine.component';

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
  public showModal = false;
  private applications: Application[];
  private readonly destroy$ = new Subject<void>();
  constructor(private router: Router) {
    this.applications = applications;
  }

  ngOnChanges(): void {
    if (this.app.app !== '') {
      const index = applications.findIndex(el => el.name === this.app.app);
      this.subtitle = applications[index].subtitle;
      this.logo = applications[index].logo;
      this.pictures = applications[index].pictures;
      this.description = applications[index].description;
      this.link = applications[index].link;
      this.git = applications[index].git;
      this.technos = applications[index].technos;
    }
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  setModal(img: string): void {
    console.log(img);
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
