import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  date: Date;
  read: boolean;
  link?: string;
  actions?: { label: string; handler: () => void }[];
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private storageKey = 'app_notifications';
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  constructor() {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      const notifs = JSON.parse(saved);
      const withDates = notifs.map((n: any) => ({
        ...n,
        date: new Date(n.date)
      }));
      this.notificationsSubject.next(withDates);
    } else {
      this.addDemoNotifications();
    }
  }

  private saveNotifications(): void {
    const current = this.notificationsSubject.value;
    localStorage.setItem(this.storageKey, JSON.stringify(current));
  }

  private addDemoNotifications(): void {
    const demoNotifs: Notification[] = [
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
    this.notificationsSubject.next(demoNotifs);
    this.saveNotifications();
  }

  addNotification(notification: Omit<Notification, 'id' | 'date' | 'read'>): void {
    const newNotif: Notification = {
      ...notification,
      id: Date.now().toString(),
      date: new Date(),
      read: false
    };
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([newNotif, ...current]);
    this.saveNotifications();
  }

  markAsRead(id: string): void {
    const current = this.notificationsSubject.value;
    const updated = current.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(updated);
    this.saveNotifications();
  }

  deleteNotification(id: string): void {
    const current = this.notificationsSubject.value;
    const updated = current.filter(n => n.id !== id);
    this.notificationsSubject.next(updated);
    this.saveNotifications();
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
    this.saveNotifications();
  }

  markAllAsRead(): void {
    const current = this.notificationsSubject.value;
    const updated = current.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updated);
    this.saveNotifications();
  }

  getUnreadCount(): number {
    return this.notificationsSubject.value.filter(n => !n.read).length;
  }
}