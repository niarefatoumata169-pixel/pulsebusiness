import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <button class="notification-icon" (click)="togglePanel()">
        🔔
        <span class="badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
      </button>

      <div class="notifications-panel" *ngIf="isOpen" (clickOutside)="close()">
        <div class="panel-header">
          <h3>Notifications</h3>
          <div class="header-actions">
            <button class="mark-read" (click)="markAllAsRead()" *ngIf="unreadCount > 0">
              ✓ Tout lire
            </button>
            <button class="clear-all" (click)="clearAll()" *ngIf="notifications.length > 0">
              🗑️ Tout effacer
            </button>
          </div>
        </div>

        <div class="notifications-list">
          <div *ngFor="let notif of notifications" 
               class="notification-item" 
               [class.unread]="!notif.read"
               (click)="markAsRead(notif.id)">
            <div class="notification-icon">{{ notif.icon }}</div>
            <div class="notification-content">
              <div class="notification-title">{{ notif.title }}</div>
              <div class="notification-message">{{ notif.message }}</div>
              <div class="notification-time">{{ notif.time | date:'HH:mm' }}</div>
            </div>
            <button class="close-btn" (click)="remove($event, notif.id)">×</button>
          </div>

          <div *ngIf="notifications.length === 0" class="empty-state">
            <div class="empty-icon">🔔</div>
            <p>Aucune notification</p>
          </div>
        </div>

        <div class="panel-footer">
          <button class="settings-btn" (click)="requestPermission()">
            🔔 Activer les notifications
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      position: relative;
    }

    .notification-icon {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      position: relative;
      padding: 8px;
    }

    .badge {
      position: absolute;
      top: 0;
      right: 0;
      background: #EC4899;
      color: white;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 18px;
    }

    .notifications-panel {
      position: absolute;
      top: 40px;
      right: 0;
      width: 360px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(236,72,153,0.2);
      z-index: 1000;
      border: 1px solid #FCE7F3;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #FCE7F3;
    }

    h3 {
      color: #1F2937;
      margin: 0;
      font-size: 16px;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .mark-read, .clear-all {
      background: none;
      border: none;
      color: #EC4899;
      font-size: 12px;
      cursor: pointer;
      padding: 4px 8px;
    }

    .clear-all {
      color: #EF4444;
    }

    .notifications-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #FCE7F3;
      cursor: pointer;
      transition: background 0.2s;
      position: relative;
    }

    .notification-item:hover {
      background: #FDF2F8;
    }

    .notification-item.unread {
      background: #FCE7F3;
    }

    .notification-icon {
      font-size: 24px;
      margin-right: 12px;
    }

    .notification-content {
      flex: 1;
    }

    .notification-title {
      font-weight: 600;
      color: #1F2937;
      margin-bottom: 4px;
    }

    .notification-message {
      color: #6B7280;
      font-size: 13px;
      margin-bottom: 4px;
    }

    .notification-time {
      color: #9CA3AF;
      font-size: 11px;
    }

    .close-btn {
      background: none;
      border: none;
      color: #9CA3AF;
      font-size: 18px;
      cursor: pointer;
      padding: 4px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .notification-item:hover .close-btn {
      opacity: 1;
    }

    .empty-state {
      text-align: center;
      padding: 48px 20px;
      color: #9CA3AF;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .panel-footer {
      padding: 12px;
      border-top: 1px solid #FCE7F3;
      text-align: center;
    }

    .settings-btn {
      background: none;
      border: none;
      color: #EC4899;
      font-size: 12px;
      cursor: pointer;
    }
  `]
})
export class NotificationsComponent implements OnInit {
  isOpen = false;
  notifications: Notification[] = [];
  unreadCount = 0;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
    });

    this.notificationService.getUnreadCount().subscribe(count => {
      this.unreadCount = count;
    });
  }

  togglePanel() {
    this.isOpen = !this.isOpen;
  }

  close() {
    this.isOpen = false;
  }

  markAsRead(id: number) {
    this.notificationService.markAsRead(id);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  remove(event: Event, id: number) {
    event.stopPropagation();
    this.notificationService.removeNotification(id);
  }

  clearAll() {
    this.notificationService.clearAll();
  }

  requestPermission() {
    this.notificationService.requestPermission();
  }
}