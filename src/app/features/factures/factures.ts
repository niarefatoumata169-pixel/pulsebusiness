import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Facture {
  id?: number;
  numero: string;
  type: 'vente' | 'achat' | 'avoir' | 'proforma';
  client_id?: number;
  client_nom?: string;
  date_emission: string;
  date_echeance: string;
  montant_ht: number;
  montant_ttc: number;
  montant_tva: number;
  statut: 'brouillon' | 'envoyee' | 'payee' | 'impayee' | 'annulee';
  mode_paiement?: string;
  date_paiement?: string;
  notes?: string;
}

@Component({
  selector: 'app-factures',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="factures-container">
      <div class="header">
        <div>
          <h1>Factures</h1>
          <p class="subtitle">{{ factures.length }} facture(s)</p>
        </div>
        <button class="btn-add" routerLink="/factures/nouvelle">+ Nouvelle facture</button>
      </div>
      
      <div class="factures-grid" *ngIf="factures.length > 0; else emptyState">
        <div class="facture-card" *ngFor="let f of factures">
          <div class="facture-header">
            <span class="facture-numero">{{ f.numero }}</span>
            <span class="facture-badge" [class]="f.statut">{{ getStatutLabel(f.statut) }}</span>
          </div>
          <div class="facture-body">
            <p><span class="label">Client:</span> {{ f.client_nom || '-' }}</p>
            <p><span class="label">Date:</span> {{ f.date_emission | date }}</p>
            <p><span class="label">Montant:</span> {{ f.montant_ttc | number }} FCFA</p>
            <p><span class="label">Échéance:</span> {{ f.date_echeance | date }}</p>
          </div>
          <div class="facture-footer">
            <button class="btn-icon" [routerLink]="['/factures', f.id]">👁️</button>
            <button class="btn-icon" [routerLink]="['/factures', f.id, 'edit']">✏️</button>
            <button class="btn-icon delete" (click)="deleteFacture(f)">🗑️</button>
          </div>
        </div>
      </div>
      
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📄</div>
          <h2>Aucune facture</h2>
          <p>Créez votre première facture</p>
          <button class="btn-primary" routerLink="/factures/nouvelle">+ Nouvelle facture</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .factures-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 0; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; text-decoration: none; }
    .factures-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .facture-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .facture-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .facture-numero { font-weight: 600; color: #1F2937; }
    .facture-badge { font-size: 12px; padding: 4px 8px; border-radius: 4px; }
    .facture-badge.brouillon { background: #9CA3AF; color: white; }
    .facture-badge.envoyee { background: #EC4899; color: white; }
    .facture-badge.payee { background: #10B981; color: white; }
    .facture-badge.impayee { background: #EF4444; color: white; }
    .facture-badge.annulee { background: #6B7280; color: white; }
    .facture-body p { margin: 5px 0; color: #6B7280; }
    .facture-body .label { color: #4B5563; width: 80px; display: inline-block; }
    .facture-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #FCE7F3; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
  `]
})
export class Factures implements OnInit {
  factures: Facture[] = [];
  ngOnInit() {
    this.loadFactures();
  }
  loadFactures() {
    const saved = localStorage.getItem('factures');
    this.factures = saved ? JSON.parse(saved) : [];
  }
  getStatutLabel(statut: string): string {
    const labels: any = { brouillon: 'Brouillon', envoyee: 'Envoyée', payee: 'Payée', impayee: 'Impayée', annulee: 'Annulée' };
    return labels[statut] || statut;
  }
  deleteFacture(f: Facture) {
    if (confirm('Supprimer cette facture ?')) {
      this.factures = this.factures.filter(fact => fact.id !== f.id);
      localStorage.setItem('factures', JSON.stringify(this.factures));
    }
  }
}
