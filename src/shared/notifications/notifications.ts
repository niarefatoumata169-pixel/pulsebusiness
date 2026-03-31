import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  date: Date;
  read: boolean;
  link?: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.scss']
})
export class Notifications implements OnInit {
  notifications: Notification[] = [];
  private storageKey = 'app_notifications';

  ngOnInit(): void {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      const notifs = JSON.parse(saved);
      this.notifications = notifs.map((n: any) => ({
        ...n,
        date: new Date(n.date)
      }));
    } else {
      // Notifications d'exemple
      this.addDemoNotifications();
    }
  }

  private saveNotifications(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
  }

  private addDemoNotifications(): void {
    this.notifications = [
      {
        id: '1',
        type: 'info',
        title: 'Bienvenue sur PulseBusiness',
        message: 'Votre plateforme de gestion intégrée est prête.',
        date: new Date(),
        read: false
      },
      {
        id: '2',
        type: 'success',
        title: 'Facture #FAC-001 payée',
        message: 'Le paiement a bien été enregistré.',
        date: new Date(Date.now() - 86400000),
        read: false,
        link: '/factures'
      },
      {
        id: '3',
        type: 'warning',
        title: 'Maintenance programmée',
        message: 'Le système sera mis à jour le 15/03/2025 de 02h à 04h.',
        date: new Date(Date.now() - 2 * 86400000),
        read: true
      }
    ];
    this.saveNotifications();
  }

  markAsRead(id: string): void {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveNotifications();
    }
  }

  deleteNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
  }

  clearAll(): void {
    if (confirm('Supprimer toutes les notifications ?')) {
      this.notifications = [];
      this.saveNotifications();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'success': return 'icon-success';
      case 'warning': return 'icon-warning';
      case 'error': return 'icon-error';
      default: return 'icon-info';
    }
  }
}