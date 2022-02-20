import { Component, OnChanges, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Account } from 'app/core/auth/account.model';
import { animate, style, transition, trigger } from '@angular/animations';
import { applications } from 'app/engine/actions/text.service';

@Component({
  selector: 'jhi-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [style({ transform: 'translateX(100%)' }), animate('200ms ease-in', style({ transform: 'translateX(0%)' }))]),
      transition(':leave', [animate('200ms ease-in', style({ transform: 'translateX(100%)' }))]),
    ]),
  ],
})
export class ApplicationsComponent implements OnChanges, OnDestroy {
  account: Account | null = null;

  @Input() public show = false;
  @Input() public app = '';
  public subtitle = '';
  public logo = '';
  public pictures = [''];
  public description = '';
  public link = '';
  public technos = [''];
  private readonly destroy$ = new Subject<void>();
  constructor(private router: Router) {}

  ngOnChanges(): void {
    const index = applications.findIndex(el => el.name === this.app);
    this.subtitle = applications[index].subtitle;
    this.logo = applications[index].logo;
    this.pictures = applications[index].pictures;
    this.description = applications[index].description;
    this.link = applications[index].link;
    this.technos = applications[index].technos;
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
