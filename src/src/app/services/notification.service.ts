import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: number;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  time: Date;
  read: boolean;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: BehaviorSubject<Notification[]> = new BehaviorSubject<Notification[]>([]);
  private unreadCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private idCounter = 1;

  constructor() {
    this.loadDemoNotifications();
  }

  // Observable pour les composants
  getNotifications(): Observable<Notification[]> {
    return this.notifications.asObservable();
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount.asObservable();
  }

  // Ajouter une notification
  addNotification(type: 'success' | 'warning' | 'info' | 'error', title: string, message: string) {
    const current = this.notifications.value;
    const newNotification: Notification = {
      id: this.idCounter++,
      type,
      title,
      message,
      time: new Date(),
      read: false,
      icon: this.getIconForType(type)
    };

    this.notifications.next([newNotification, ...current]);
    this.updateUnreadCount();
    
    // Afficher une notification native si disponible
    this.showNativeNotification(title, message);
  }

  // Marquer comme lu
  markAsRead(id: number) {
    const current = this.notifications.value;
    const index = current.findIndex(n => n.id === id);
    if (index !== -1) {
      current[index].read = true;
      this.notifications.next([...current]);
      this.updateUnreadCount();
    }
  }

  // Marquer tout comme lu
  markAllAsRead() {
    const current = this.notifications.value;
    current.forEach(n => n.read = true);
    this.notifications.next([...current]);
    this.updateUnreadCount();
  }

  // Supprimer une notification
  removeNotification(id: number) {
    const current = this.notifications.value.filter(n => n.id !== id);
    this.notifications.next(current);
    this.updateUnreadCount();
  }

  // Vider toutes les notifications
  clearAll() {
    this.notifications.next([]);
    this.updateUnreadCount();
  }

  // Mettre à jour le compteur
  private updateUnreadCount() {
    const count = this.notifications.value.filter(n => !n.read).length;
    this.unreadCount.next(count);
  }

  // Icône selon le type
  private getIconForType(type: string): string {
    switch(type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  }

  // Notification native du navigateur
  private showNativeNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }

  // Demander la permission
  requestPermission() {
    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }

  // Notifications de démonstration
  private loadDemoNotifications() {
    setTimeout(() => {
      this.addNotification('success', 'Bienvenue', 'PulseBusiness est prêt à être utilisé');
    }, 1000);

    setTimeout(() => {
      this.addNotification('info', 'Nouvelle version', 'De nouvelles fonctionnalités sont disponibles');
    }, 3000);

    setTimeout(() => {
      this.addNotification('warning', 'Stock faible', 'Le stock de ciment est presque épuisé');
    }, 5000);
  }

  // Notifications automatiques basées sur les événements
  notifyNewClient(clientName: string) {
    this.addNotification('success', 'Nouveau client', `${clientName} a été ajouté`);
  }

  notifyNewInvoice(invoiceNumber: string) {
    this.addNotification('info', 'Nouvelle facture', `Facture ${invoiceNumber} créée`);
  }

  notifyPaymentReceived(clientName: string, amount: number) {
    this.addNotification('success', 'Paiement reçu', `${amount.toLocaleString()} FCFA de ${clientName}`);
  }

  notifyInvoiceOverdue(invoiceNumber: string, days: number) {
    this.addNotification('warning', 'Facture impayée', `Facture ${invoiceNumber} en retard de ${days} jours`);
  }

  notifyStockAlert(productName: string, quantity: number) {
    this.addNotification('error', 'Alerte stock', `${productName} : plus que ${quantity} unités`);
  }

  notifyBirthday(employeeName: string) {
    this.addNotification('info', '🎂 Anniversaire', `Souhaitez l'anniversaire à ${employeeName}`);
  }

  notifyAbsence(employeeName: string, type: string) {
    this.addNotification('warning', 'Absence', `${employeeName} est ${type}`);
  }

  notifyOffline() {
    this.addNotification('warning', 'Mode hors ligne', 'Vous travaillez sans connexion Internet');
  }

  notifyOnline() {
    this.addNotification('success', 'Connexion rétablie', 'Les données sont synchronisées');
  }
}