import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface DevisData {
  id?: number;
  reference: string;
  date_creation: string;
  date_validite: string;
  client_id: number;
  client_nom?: string;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  statut: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire';
  notes?: string;
  created_at: string;
}

@Component({
  selector: 'app-devis',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="devis-container">
      <div class="header">
        <div>
          <h1>📄 Devis</h1>
          <p class="subtitle">{{ devis.length }} devis</p>
        </div>
        <div class="header-actions">
          <button class="btn-add" (click)="openForm()">+ Nouveau devis</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>

      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ editMode ? 'Modifier' : 'Nouveau' }} devis</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveDevis()">
              <div class="form-group">
                <label>Référence</label>
                <input type="text" [(ngModel)]="currentDevis.reference" readonly>
              </div>
              <div class="form-group">
                <label>Client *</label>
                <select [(ngModel)]="currentDevis.client_id" required (change)="onClientChange()">
                  <option [value]="null">Sélectionner</option>
                  <option *ngFor="let c of clients" [value]="c.id">{{ c.nom }} {{ c.prenom }}</option>
                </select>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Date création</label><input type="date" [(ngModel)]="currentDevis.date_creation"></div>
                <div class="form-group"><label>Date validité</label><input type="date" [(ngModel)]="currentDevis.date_validite"></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Montant HT</label><input type="number" [(ngModel)]="currentDevis.montant_ht" (input)="calculerTotal()"></div>
                <div class="form-group"><label>TVA (%)</label><input type="number" [(ngModel)]="currentDevis.tva" (input)="calculerTotal()"></div>
              </div>
              <div class="form-group">
                <label>Total TTC</label>
                <input type="text" [value]="(currentDevis.montant_ttc || 0) | number" readonly>
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentDevis.statut">
                  <option value="brouillon">Brouillon</option>
                  <option value="envoye">Envoyé</option>
                  <option value="accepte">Accepté</option>
                  <option value="refuse">Refusé</option>
                  <option value="expire">Expiré</option>
                </select>
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="currentDevis.notes" rows="3"></textarea>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="cancelForm()">Annuler</button>
                <button type="submit" class="btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="devis-grid" *ngIf="devis.length > 0; else emptyState">
        <div class="devis-card" *ngFor="let d of devis">
          <div class="devis-ref">{{ d.reference }}</div>
          <div class="devis-client">{{ d.client_nom }}</div>
          <div class="devis-montant">{{ d.montant_ttc | number }} FCFA</div>
          <div class="devis-actions">
            <button (click)="editDevis(d)">✏️</button>
            <button (click)="confirmDelete(d)">🗑️</button>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <p>Aucun devis</p>
          <button class="btn-primary" (click)="openForm()">+ Nouveau devis</button>
        </div>
      </ng-template>

      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <p>Supprimer le devis <strong>{{ devisToDelete?.reference }}</strong> ?</p>
          <div class="modal-actions">
            <button (click)="showDeleteModal = false">Annuler</button>
            <button (click)="deleteDevis()">Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .devis-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { margin: 0; }
    .subtitle { color: #6B7280; margin: 4px 0 0 0; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .alert-success { background: #10B981; color: white; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-container { background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 500px; max-height: 80vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-close { background: none; border: none; font-size: 20px; cursor: pointer; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .form-group { display: flex; flex-direction: column; margin-bottom: 16px; }
    label { margin-bottom: 4px; font-size: 13px; color: #4B5563; }
    input, select, textarea { padding: 8px 12px; border: 1px solid #E5E7EB; border-radius: 6px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
    .btn-secondary { background: white; border: 1px solid #E5E7EB; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
    .devis-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .devis-card { background: white; border-radius: 8px; padding: 16px; border: 1px solid #E5E7EB; }
    .devis-ref { font-weight: bold; font-family: monospace; }
    .devis-client { color: #6B7280; font-size: 14px; margin: 4px 0; }
    .devis-montant { font-weight: 600; color: #EC4899; }
    .devis-actions { display: flex; gap: 8px; margin-top: 12px; }
    .devis-actions button { background: none; border: 1px solid #E5E7EB; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .empty-state { text-align: center; padding: 40px; background: white; border-radius: 8px; border: 1px dashed #E5E7EB; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 8px; padding: 24px; max-width: 400px; }
    @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; } }
  `]
})
export class Devis implements OnInit {
  devis: DevisData[] = [];
  clients: any[] = [];
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  devisToDelete: DevisData | null = null;
  successMessage = '';
  
  currentDevis: Partial<DevisData> = {
    reference: '',
    statut: 'brouillon',
    date_creation: new Date().toISOString().split('T')[0],
    montant_ht: 0,
    tva: 18,
    montant_ttc: 0
  };
  
  ngOnInit() {
    this.loadClients();
    this.loadDevis();
  }
  
  loadClients() {
    const saved = localStorage.getItem('clients');
    this.clients = saved ? JSON.parse(saved) : [];
  }
  
  loadDevis() {
    const saved = localStorage.getItem('devis');
    this.devis = saved ? JSON.parse(saved) : [];
  }
  
  Devis() {
    localStorage.setItem('devis', JSON.stringify(this.devis));
  }
  
  openForm() {
    this.currentDevis = {
      reference: this.generateReference(),
      statut: 'brouillon',
      date_creation: new Date().toISOString().split('T')[0],
      montant_ht: 0,
      tva: 18,
      montant_ttc: 0
    };
    this.editMode = false;
    this.showForm = true;
  }
  
  generateReference(): string {
    const count = this.devis.length + 1;
    return `DEV-${String(count).padStart(4, '0')}`;
  }
  
  onClientChange() {
    const client = this.clients.find(c => c.id === this.currentDevis.client_id);
    if (client) {
      this.currentDevis.client_nom = `${client.nom} ${client.prenom || ''}`;
    }
  }
  
  calculerTotal() {
    const montant = this.currentDevis.montant_ht || 0;
    const tva = this.currentDevis.tva || 0;
    this.currentDevis.montant_ttc = montant * (1 + tva / 100);
  }
  
  saveDevis() {
    if (this.editMode && this.currentDevis.id) {
      const index = this.devis.findIndex(d => d.id === this.currentDevis.id);
      if (index !== -1) {
        this.devis[index] = { ...this.currentDevis } as DevisData;
        this.showSuccess('Devis modifié');
      }
    } else {
      const newDevis = { ...this.currentDevis, id: Date.now(), created_at: new Date().toISOString() } as DevisData;
      this.devis.push(newDevis);
      this.showSuccess('Devis ajouté');
    }
    this.saveDevis();
    this.cancelForm();
  }
  
  editDevis(d: DevisData) {
    this.currentDevis = { ...d };
    this.editMode = true;
    this.showForm = true;
  }
  
  confirmDelete(d: DevisData) {
    this.devisToDelete = d;
    this.showDeleteModal = true;
  }
  
  deleteDevis() {
    if (this.devisToDelete) {
      this.devis = this.devis.filter(d => d.id !== this.devisToDelete?.id);
      this.saveDevis();
      this.showDeleteModal = false;
      this.devisToDelete = null;
      this.showSuccess('Devis supprimé');
    }
  }
  
  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }
  
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}