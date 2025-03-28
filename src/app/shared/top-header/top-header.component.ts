import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../../services/auth.service';
import { NotificationComponent } from '../notification/notification.component';
import { TermsPopupComponent } from '../terms-popup/terms-popup.component';

@Component({
  selector: 'app-top-header',
  standalone: true,
  imports: [
    MenuModule,
    ButtonModule,
    CommonModule,
    NotificationComponent,
    TermsPopupComponent
  ],
  templateUrl: './top-header.component.html',
  styleUrl: './top-header.component.scss'
})
export class TopHeaderComponent implements OnInit {

  private authApi = inject(AuthService);
  private router = inject(Router);

  user = signal('');

  lista = [
    {
      label: 'Perfil',
      icon: 'fa-solid fa-user',
      route: '/profile'
    },
    {
      label: 'Sair',
      icon: 'fa-solid fa-right-from-bracket',
      command: () => {
        this.authApi.logout();
      }
    }
  ];

  ngOnInit(): void {
    if (!!localStorage.getItem('user')) {
      this.user.set(JSON.parse(localStorage.getItem('user')!).nome);
    }
  }
}
