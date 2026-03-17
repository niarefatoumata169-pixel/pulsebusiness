import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Vente {
  id?: number;
  numero: string;
  client_id?: number;
  client_nom?: string;
  date_vente: string;
  montant: number;
  mode_paiement: 'especes' | 'carte' | 'cheque' | 'virement' | 'mobile_money';
  statut: 'paye' | 'impaye' | 'partiel';
  notes?: string;
}

@Component({
  selector: 'app-ventes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="ventes-container">
      <div class="header">
        <div>
          <h1>Ventes</h1>
          <p class="subtitle">{{ ventes.length }} vente(s) • Total: {{ totalVentes | number }} FCFA</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouvelle vente</button>
      </div>
      
      <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>
      
      <!-- Formulaire d'ajout -->
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouvelle' }} vente</h3>
        <form (ngSubmit)="saveVente()" #venteForm="ngForm">
          <div class="form-group">
            <label>Client</label>
            <select [(ngModel)]="newVente.client_id" name="client_id" required (change)="onClientChange()">
              <option value="">Sélectionner un client</option>
              <option *ngFor="let c of clients" [value]="c.id">{{ c.raison_sociale || c.nom + ' ' + (c.prenom || '') }}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Date de vente</label>
            <input type="date" [(ngModel)]="newVente.date_vente" name="date_vente" required>
          </div>
          
          <div class="form-group">
            <label>Montant (FCFA)</label>
            <input type="number" [(ngModel)]="newVente.montant" name="montant" required>
          </div>
          
          <div class="form-group">
            <label>Mode de paiement</label>
            <select [(ngModel)]="newVente.mode_paiement" name="mode_paiement" required>
              <option value="especes">Espèces</option>
              <option value="carte">Carte</option>
              <option value="cheque">Chèque</option>
              <option value="virement">Virement</option>
              <option value="mobile_money">Mobile Money</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Statut</label>
            <select [(ngModel)]="newVente.statut" name="statut" required>
              <option value="paye">Payé</option>
              <option value="impaye">Impayé</option>
              <option value="partiel">Partiel</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Notes</label>
            <textarea [(ngModel)]="newVente.notes" name="notes" rows="3"></textarea>
          </div>
          
          <button type="submit" class="btn-save">Enregistrer</button>
          <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
        </form>
      </div>
      
      <!-- Statistiques -->
      <div class="stats" *ngIf="ventes.length > 0">
        <div class="stat-card">
          <span class="stat-label">Payé:</span>
          <span class="stat-value paye">{{ totalPaye | number }} FCFA</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Impayé:</span>
          <span class="stat-value impaye">{{ totalImpaye | number }} FCFA</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Partiel:</span>
          <span class="stat-value partiel">{{ totalPartiel | number }} FCFA</span>
        </div>
      </div>
      
      <!-- Liste -->
      <div class="ventes-list" *ngIf="ventes.length > 0; else emptyState">
        <div class="vente-card" *ngFor="let v of ventes">
          <div class="vente-header">
            <span class="vente-numero">{{ v.numero }}</span>
            <span class="vente-badge" [class]="v.statut">{{ getStatutLabel(v.statut) }}</span>
          </div>
          <div class="vente-body">
            <p><span class="label">Client:</span> {{ v.client_nom || '-' }}</p>
            <p><span class="label">Date:</span> {{ v.date_vente | date }}</p>
            <p><span class="label">Montant:</span> {{ v.montant | number }} FCFA</p>
            <p><span class="label">Mode:</span> {{ getModeLabel(v.mode_paiement) }}</p>
          </div>
          <div class="vente-footer">
            <button class="btn-icon" (click)="editVente(v)">✏️</button>
            <button class="btn-icon" (click)="duplicateVente(v)">📋</button>
            <button class="btn-icon delete" (click)="deleteVente(v)">🗑️</button>
          </div>
        </div>
      </div>
      
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">💰</div>
          <h2>Aucune vente</h2>
          <p>Enregistrez votre première vente</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouvelle vente</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .ventes-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 0; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .alert-success { background: #10B981; color: white; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
    .form-card { background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #FCE7F3; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; color: #4B5563; }
    input, textarea, select { width: 100%; padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-right: 10px; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 24px; }
    .stat-card { background: white; border-radius: 8px; padding: 15px; border: 1px solid #FCE7F3; text-align: center; }
    .stat-label { display: block; color: #6B7280; font-size: 13px; margin-bottom: 5px; }
    .stat-value { font-size: 18px; font-weight: 600; }
    .stat-value.paye { color: #10B981; }
    .stat-value.impaye { color: #EF4444; }
    .stat-value.partiel { color: #F59E0B; }
    .ventes-list { display: grid; gap: 15px; }
    .vente-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .vente-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .vente-numero { font-weight: 600; color: #1F2937; }
    .vente-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .vente-badge.paye { background: #10B981; color: white; }
    .vente-badge.impaye { background: #EF4444; color: white; }
    .vente-badge.partiel { background: #F59E0B; color: white; }
    .vente-body p { margin: 5px 0; color: #6B7280; }
    .label { color: #4B5563; width: 60px; display: inline-block; }
    .vente-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #FCE7F3; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
  `]
})
export class Ventes implements OnInit {
  clients: any[] = [];
  ventes: Vente[] = [];
  showForm = false;
  editMode = false;
  successMessage = '';
  totalVentes = 0;
  totalPaye = 0;
  totalImpaye = 0;
  totalPartiel = 0;
  
  newVente: any = {
    client_id: '',
    date_vente: new Date().toISOString().split('T')[0],
    montant: 0,
    mode_paiement: 'especes',
    statut: 'paye',
    notes: ''
  };
  
  ngOnInit() {
    this.loadClients();
    this.loadVentes();
  }
  
  loadClients() {
    const saved = localStorage.getItem('clients');
    this.clients = saved ? JSON.parse(saved) : [];
  }
  
  loadVentes() {
    const saved = localStorage.getItem('ventes');
    this.ventes = saved ? JSON.parse(saved) : [];
    this.calculerStats();
  }
  
  onClientChange() {
    const client = this.clients.find(c => c.id === Number(this.newVente.client_id));
    if (client) this.newVente.client_nom = client.raison_sociale || client.nom + ' ' + (client.prenom || '');
  }
  
  saveVente() {
    if (this.editMode) {
      const index = this.ventes.findIndex(v => v.id === this.newVente.id);
      if (index !== -1) {
        this.ventes[index] = this.newVente;
        this.showMessage('Vente modifiée !');
      }
    } else {
      const newVente = {
        ...this.newVente,
        id: Date.now(),
        numero: 'VEN-' + (this.ventes.length + 1).toString().padStart(4, '0')
      };
      this.ventes.push(newVente);
      this.showMessage('Vente ajoutée !');
    }
    
    localStorage.setItem('ventes', JSON.stringify(this.ventes));
    this.calculerStats();
    this.cancelForm();
  }
  
  editVente(v: Vente) {
    this.newVente = { ...v };
    this.editMode = true;
    this.showForm = true;
  }
  
  duplicateVente(v: Vente) {
    const newVente = {
      ...v,
      id: Date.now(),
      numero: v.numero + '-COPY'
    };
    this.ventes.push(newVente);
    localStorage.setItem('ventes', JSON.stringify(this.ventes));
    this.calculerStats();
    this.showMessage('Vente dupliquée !');
  }
  
  deleteVente(v: Vente) {
    if (confirm('Supprimer cette vente ?')) {
      this.ventes = this.ventes.filter(vent => vent.id !== v.id);
      localStorage.setItem('ventes', JSON.stringify(this.ventes));
      this.calculerStats();
      this.showMessage('Vente supprimée !');
    }
  }
  
  calculerStats() {
    this.totalVentes = this.ventes.reduce((sum, v) => sum + v.montant, 0);
    this.totalPaye = this.ventes.filter(v => v.statut === 'paye').reduce((sum, v) => sum + v.montant, 0);
    this.totalImpaye = this.ventes.filter(v => v.statut === 'impaye').reduce((sum, v) => sum + v.montant, 0);
    this.totalPartiel = this.ventes.filter(v => v.statut === 'partiel').reduce((sum, v) => sum + v.montant, 0);
  }
  
  cancelForm() {
    this.newVente = {
      client_id: '',
      date_vente: new Date().toISOString().split('T')[0],
      montant: 0,
      mode_paiement: 'especes',
      statut: 'paye',
      notes: ''
    };
    this.showForm = false;
    this.editMode = false;
  }
  
  getStatutLabel(statut: string): string {
    const labels: any = { paye: 'Payé', impaye: 'Impayé', partiel: 'Partiel' };
    return labels[statut] || statut;
  }
  
  getModeLabel(mode: string): string {
    const labels: any = { 
      especes: 'Espèces', 
      carte: 'Carte', 
      cheque: 'Chèque', 
      virement: 'Virement', 
      mobile_money: 'Mobile Money' 
    };
    return labels[mode] || mode;
  }
  
  showMessage(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
