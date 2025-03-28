import { CommonModule } from '@angular/common';
import { NotificationService } from './../../services/notification.service';
import { AuthService } from './../../services/auth.service'; // Import the AuthService
import { Component, ElementRef, OnInit } from '@angular/core';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})

export class NotificationComponent implements OnInit {
  notifications: any[] = [];
  unreadCount: number = 0;
  showDropdown: boolean = false;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private elementRef: ElementRef
  ) { }

  ngOnInit() {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications.map(notification => {
        try {
          new URL(notification.url);
        } catch (_) {
          notification.url = `${window.location.origin}/${notification.url}`;
        }
        return notification;
      });
      this.unreadCount = notifications.filter(n => !n.isRead).length;
    });

    // Simula carregamento inicial
    var userId = this.authService.getUserIdFromToken(); // Pegue o ID do usuário autenticado
    this.notificationService.startConnection(userId);
    this.notificationService.loadNotifications(userId);

    document.addEventListener('click', this.handleClickOutside, true);
  }


  ngOnDestroy() {
    document.removeEventListener('click', this.handleClickOutside, true);
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  markAsRead(notificationId: string) {
    this.notificationService.markAsRead(notificationId);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  handleClickOutside = (event: Event) => {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  };
}
