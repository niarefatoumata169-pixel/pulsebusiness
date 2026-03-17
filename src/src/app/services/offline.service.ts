import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OfflineService {
  private dbName = 'PulseBusinessDB';
  private db: IDBDatabase | null = null;
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.initDB();
    this.listenToConnectionChanges();
  }

  // Initialiser IndexedDB
  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Stores pour chaque type de données
        if (!db.objectStoreNames.contains('clients')) {
          db.createObjectStore('clients', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('factures')) {
          db.createObjectStore('factures', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('chantiers')) {
          db.createObjectStore('chantiers', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('pending')) {
          db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  // Écouter les changements de connexion
  private listenToConnectionChanges() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showNotification('✅ Connexion rétablie', 'success');
      this.syncPending();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showNotification('📱 Mode hors ligne activé', 'warning');
    });
  }

  // Sauvegarder des données en local
  async saveData(storeName: string, data: any): Promise<void> {
    await this.initDB();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Base non initialisée');
        return;
      }

      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      data.offline = true;
      data.sync = false;
      const request = store.add(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Récupérer des données locales
  async getData(storeName: string): Promise<any[]> {
    await this.initDB();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Base non initialisée');
        return;
      }

      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Ajouter une opération en attente
  async addPending(operation: any): Promise<void> {
    await this.initDB();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Base non initialisée');
        return;
      }

      const transaction = this.db.transaction('pending', 'readwrite');
      const store = transaction.objectStore('pending');
      
      operation.timestamp = Date.now();
      const request = store.add(operation);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.showNotification('📦 Opération sauvegardée en local', 'info');
        resolve();
      };
    });
  }

  // Synchroniser les opérations en attente
  async syncPending() {
    if (!this.isOnline) return;

    await this.initDB();
    const pending = await this.getPending();

    for (const op of pending) {
      try {
        // Simuler l'envoi au serveur
        console.log('Sync:', op);
        await this.removePending(op.id);
      } catch (error) {
        console.error('Erreur sync:', error);
      }
    }
  }

  private async getPending(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Base non initialisée');
        return;
      }

      const transaction = this.db.transaction('pending', 'readonly');
      const store = transaction.objectStore('pending');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  private async removePending(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Base non initialisée');
        return;
      }

      const transaction = this.db.transaction('pending', 'readwrite');
      const store = transaction.objectStore('pending');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Statut de connexion
  getStatus(): { online: boolean, message: string } {
    return {
      online: this.isOnline,
      message: this.isOnline ? 'En ligne' : 'Hors ligne'
    };
  }

  // Notification
  private showNotification(message: string, type: 'success' | 'warning' | 'info') {
    // À connecter avec le service de notifications
    console.log(`[${type}] ${message}`);
  }
}