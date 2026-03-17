import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfflineService } from '../../services/offline.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-connection-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="connection-status" [class.offline]="!isOnline">
      <span class="status-dot"></span>
      <span class="status-text">{{ statusText }}</span>
    </div>
  `,
  styles: [`
    .connection-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: #10B981;
      color: white;
      border-radius: 20px;
      font-size: 12px;
      transition: all 0.3s;
    }

    .connection-status.offline {
      background: #EF4444;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      background: white;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
  `]
})
export class ConnectionStatusComponent implements OnInit, OnDestroy {
  isOnline = true;
  statusText = 'En ligne';
  private onlineListener: any;
  private offlineListener: any;

  constructor(
    private offlineService: OfflineService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.isOnline = navigator.onLine;
    this.updateStatus();

    this.onlineListener = () => {
      this.isOnline = true;
      this.updateStatus();
      this.notificationService.notifyOnline();
    };

    this.offlineListener = () => {
      this.isOnline = false;
      this.updateStatus();
      this.notificationService.notifyOffline();
    };

    window.addEventListener('online', this.onlineListener);
    window.addEventListener('offline', this.offlineListener);
  }

  ngOnDestroy() {
    window.removeEventListener('online', this.onlineListener);
    window.removeEventListener('offline', this.offlineListener);
  }

  private updateStatus() {
    this.statusText = this.isOnline ? 'En ligne' : 'Hors ligne';
  }
}