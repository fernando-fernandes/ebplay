import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private hubConnection!: signalR.HubConnection;
  private notificationsSubject = new BehaviorSubject<any[]>([]);
  notifications$ = this.notificationsSubject.asObservable();
  private apiUrl = `${environment.api}/notifications`;
  private hubUrl = `${environment.api.replace(/\/api$/, '')}/notificationHub`;

  constructor(private http: HttpClient) { }

  startConnection(userId: string) {
    console.log('Iniciando conexão SignalR... UserId:', userId);
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.hubUrl}?userId=${userId}`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('SignalR Connected'))
      .catch(err => console.log('Error while starting SignalR:', err));

    this.hubConnection.on("ReceiveNotification", (notification) => {
      console.log("Nova notificação recebida:", notification);
      const currentNotifications = this.notificationsSubject.getValue();
      this.notificationsSubject.next([...currentNotifications, { ...notification, isRead: false }]);
    });
  }

  stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

  loadNotifications(userId: string) {
    this.http.get<any[]>(`${this.apiUrl}/push/${userId}`).subscribe(notifications => {
      this.notificationsSubject.next(notifications);
    });
  }

  markAsRead(notificationId: string) {
    this.http.put(`${this.apiUrl}/mark-as-read/${notificationId}`, {}).subscribe(() => {
      const updatedNotifications = this.notificationsSubject.getValue().map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      this.notificationsSubject.next(updatedNotifications);
    });
  }

  markAllAsRead() {
    this.notificationsSubject.getValue().forEach(notification => {
      if (!notification.isRead) {
        this.markAsRead(notification.id);
      }
    });
  }
}
