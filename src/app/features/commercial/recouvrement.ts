import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-recouvrement',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="recouvrement-container">
      <div class="header">
        <h1>Recouvrement</h1>
        <div class="header-actions">
          <button class="btn-export" (click)="exporterExcel()">📊 Exporter</button>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">{{ stats.total | number }} FCFA</span>
          <span class="stat-label">Total à recouvrer</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.impayes }}</span>
          <span class="stat-label">Factures impayées</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.enRetard }}</span>
          <span class="stat-label">En retard</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.tauxRecouvrement }}%</span>
          <span class="stat-label">Taux de recouvrement</span>
        </div>
      </div>

      <!-- Filtres -->
      <div class="filters-bar">
        <div class="search-box">
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            placeholder="🔍 Rechercher client, facture..."
          >
        </div>
        <div class="filter-group">
          <select [(ngModel)]="filtreStatut">
            <option value="tous">Tous les statuts</option>
            <option value="impaye">Impayé</option>
            <option value="en_retard">En retard</option>
            <option value="partiel">Partiellement payé</option>
            <option value="paye">Payé</option>
          </select>
          <select [(ngModel)]="filtrePeriode">
            <option value="tous">Toutes périodes</option>
            <option value="30">30 jours</option>
            <option value="60">60 jours</option>
            <option value="90">90+ jours</option>
          </select>
        </div>
      </div>

      <!-- Tableau des factures -->
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>N° Facture</th>
              <th>Client</th>
              <th>Date émission</th>
              <th>Date échéance</th>
              <th>Montant TTC</th>
              <th>Payé</th>
              <th>Reste</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let facture of facturesFiltrees">
              <td><strong>{{ facture.numero }}</strong></td>
              <td>{{ facture.client_nom || 'Client' }}</td>
              <td>{{ facture.date_emission | date:'dd/MM/yyyy' }}</td>
              <td [class.urgent]="estEnRetard(facture) && facture.statut !== 'paye'">
                {{ facture.date_echeance | date:'dd/MM/yyyy' }}
                <span *ngIf="estEnRetard(facture)" class="badge-retard">⚠️</span>
              </td>
              <td class="montant">{{ facture.montant_ttc | number }} FCFA</td>
              <td class="montant">{{ facture.montant_paye || 0 | number }} FCFA</td>
              <td class="montant reste">{{ (facture.montant_ttc - (facture.montant_paye || 0)) | number }} FCFA</td>
              <td>
                <span class="badge" [ngClass]="getStatutClass(facture)">
                  {{ getStatutLabel(facture) }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-icon" (click)="voirDetails(facture)" title="Voir détails">👁️</button>
                <button class="btn-icon" (click)="enregistrerPaiement(facture)" title="Enregistrer paiement">💰</button>
                <button class="btn-icon" (click)="envoyerRappel(facture)" title="Envoyer rappel">📧</button>
              </td>
            </tr>
            <tr *ngIf="facturesFiltrees.length === 0">
              <td colspan="9" class="empty-msg">Aucune facture trouvée</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal de paiement -->
      <div class="modal" *ngIf="showPaiementModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Enregistrer un paiement</h3>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>
          
          <div class="modal-body" *ngIf="factureSelectionnee">
            <p><strong>Facture:</strong> {{ factureSelectionnee.numero }}</p>
            <p><strong>Client:</strong> {{ factureSelectionnee.client_nom }}</p>
            <p><strong>Montant total:</strong> {{ factureSelectionnee.montant_ttc | number }} FCFA</p>
            <p><strong>Déjà payé:</strong> {{ factureSelectionnee.montant_paye || 0 | number }} FCFA</p>
            <p><strong>Reste à payer:</strong> {{ resteAPayer | number }} FCFA</p>

            <div class="form-group">
              <label>Montant du paiement *</label>
              <input 
                type="number" 
                [(ngModel)]="paiement.montant"
                [max]="resteAPayer"
                placeholder="Montant"
              >
            </div>

            <div class="form-group">
              <label>Mode de paiement</label>
              <select [(ngModel)]="paiement.mode">
                <option value="especes">Espèces</option>
                <option value="cheque">Chèque</option>
                <option value="virement">Virement bancaire</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="carte">Carte bancaire</option>
              </select>
            </div>

            <div class="form-group">
              <label>Date de paiement</label>
              <input type="date" [(ngModel)]="paiement.date">
            </div>

            <div class="form-group">
              <label>Référence</label>
              <input type="text" [(ngModel)]="paiement.reference" placeholder="N° chèque, référence virement...">
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeModal()">Annuler</button>
            <button class="btn-save" (click)="validerPaiement()" [disabled]="!paiementValide()">
              Valider le paiement
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .recouvrement-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; margin: 0; }

    .btn-export {
      background: white; border: 2px solid #EC4899; color: #EC4899;
      padding: 8px 16px; border-radius: 8px; cursor: pointer;
    }

    .stats-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;
    }
    .stat-card {
      background: white; padding: 20px; border-radius: 12px; border: 1px solid #FCE7F3;
      text-align: center;
    }
    .stat-value { display: block; font-size: 24px; font-weight: 700; color: #EC4899; }
    .stat-label { color: #6B7280; font-size: 14px; }

    .filters-bar {
      display: flex; justify-content: space-between; margin-bottom: 20px;
    }
    .search-box input {
      padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; width: 300px;
    }
    .filter-group select {
      padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; margin-left: 10px;
    }

    .table-wrapper {
      background: white; border-radius: 12px; border: 1px solid #FCE7F3; overflow: hidden;
    }
    table { width: 100%; border-collapse: collapse; }
    th { background: #FDF2F8; padding: 12px; text-align: left; color: #4B5563; }
    td { padding: 12px; border-bottom: 1px solid #FCE7F3; }

    .montant { text-align: right; font-weight: 600; }
    .reste { color: #EC4899; }
    .urgent { color: #EF4444; font-weight: 600; }

    .badge {
      padding: 4px 8px; border-radius: 4px; font-size: 12px;
    }
    .badge.impaye { background: #FEF3C7; color: #D97706; }
    .badge.en_retard { background: #FEE2E2; color: #EF4444; }
    .badge.partiel { background: #DBEAFE; color: #2563EB; }
    .badge.paye { background: #D1FAE5; color: #10B981; }

    .badge-retard { margin-left: 5px; }

    .btn-icon {
      background: none; border: 1px solid #FCE7F3; border-radius: 6px;
      padding: 4px 8px; margin: 0 4px; cursor: pointer;
    }

    /* Modal */
    .modal {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: white; border-radius: 12px; width: 500px; max-width: 90%;
    }
    .modal-header {
      padding: 20px; border-bottom: 1px solid #FCE7F3;
      display: flex; justify-content: space-between; align-items: center;
    }
    .modal-header h3 { margin: 0; color: #1F2937; }
    .close-btn { background: none; border: none; font-size: 20px; cursor: pointer; }
    .modal-body { padding: 20px; }
    .modal-footer {
      padding: 20px; border-top: 1px solid #FCE7F3;
      display: flex; justify-content: flex-end; gap: 10px;
    }

    .form-group {
      margin-bottom: 15px;
    }
    .form-group label {
      display: block; margin-bottom: 5px; color: #4B5563; font-weight: 500;
    }
    .form-group input, .form-group select {
      width: 100%; padding: 8px; border: 2px solid #FCE7F3; border-radius: 6px;
    }

    .btn-save {
      background: #EC4899; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;
    }
    .btn-cancel {
      background: white; border: 2px solid #FCE7F3; padding: 8px 16px; border-radius: 6px; cursor: pointer;
    }
    .empty-msg { text-align: center; padding: 40px; color: #9CA3AF; }
  `]
})
export class Recouvrement implements OnInit {
  factures: any[] = [];
  searchTerm = '';
  filtreStatut = 'tous';
  filtrePeriode = 'tous';
  
  showPaiementModal = false;
  factureSelectionnee: any = null;
  
  paiement: any = {
    montant: 0,
    mode: 'especes',
    date: new Date().toISOString().split('T')[0],
    reference: ''
  };

  stats = {
    total: 0,
    impayes: 0,
    enRetard: 0,
    tauxRecouvrement: 0
  };

  constructor(private api: ApiService) {}

  async ngOnInit() {
    await this.loadFactures();
  }

  async loadFactures() {
    this.factures = await this.api.getFactures();
    this.calculerStats();
  }

  calculerStats() {
    this.stats.total = this.factures
      .filter(f => f.statut !== 'paye')
      .reduce((sum, f) => sum + (f.montant_ttc - (f.montant_paye || 0)), 0);
    
    this.stats.impayes = this.factures.filter(f => 
      f.statut === 'impaye' || f.statut === 'en_retard'
    ).length;
    
    this.stats.enRetard = this.factures.filter(f => 
      this.estEnRetard(f) && f.statut !== 'paye'
    ).length;
    
    const totalPaye = this.factures
      .filter(f => f.statut === 'paye')
      .reduce((sum, f) => sum + f.montant_ttc, 0);
    
    const totalGlobal = this.factures.reduce((sum, f) => sum + f.montant_ttc, 0);
    this.stats.tauxRecouvrement = totalGlobal > 0 
      ? Math.round((totalPaye / totalGlobal) * 100) 
      : 0;
  }

  get facturesFiltrees() {
    return this.factures.filter(f => {
      // Filtre recherche
      const matchSearch = !this.searchTerm || 
        f.numero?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        f.client_nom?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Filtre statut
      const matchStatut = this.filtreStatut === 'tous' || f.statut === this.filtreStatut;
      
      // Filtre période
      let matchPeriode = true;
      if (this.filtrePeriode !== 'tous') {
        const jours = this.filtrePeriode;
        const dateEcheance = new Date(f.date_echeance);
        const today = new Date();
        const diffTime = dateEcheance.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (jours === '30') matchPeriode = diffDays <= 30;
        else if (jours === '60') matchPeriode = diffDays <= 60;
        else if (jours === '90') matchPeriode = diffDays <= 90;
      }
      
      return matchSearch && matchStatut && matchPeriode;
    });
  }

  estEnRetard(facture: any): boolean {
    if (facture.statut === 'paye') return false;
    const today = new Date();
    const echeance = new Date(facture.date_echeance);
    return echeance < today;
  }

  getStatutClass(facture: any): string {
    if (facture.statut === 'paye') return 'paye';
    if (this.estEnRetard(facture)) return 'en_retard';
    if (facture.montant_paye > 0) return 'partiel';
    return 'impaye';
  }

  getStatutLabel(facture: any): string {
    if (facture.statut === 'paye') return 'Payé';
    if (this.estEnRetard(facture)) return 'En retard';
    if (facture.montant_paye > 0) return 'Partiel';
    return 'Impayé';
  }

  get resteAPayer(): number {
    if (!this.factureSelectionnee) return 0;
    return this.factureSelectionnee.montant_ttc - (this.factureSelectionnee.montant_paye || 0);
  }

  voirDetails(facture: any) {
    // Naviguer vers la page de détail de la facture
    console.log('Voir détails', facture);
  }

  enregistrerPaiement(facture: any) {
    this.factureSelectionnee = facture;
    this.paiement = {
      montant: this.resteAPayer,
      mode: 'especes',
      date: new Date().toISOString().split('T')[0],
      reference: ''
    };
    this.showPaiementModal = true;
  }

  async envoyerRappel(facture: any) {
    if (confirm(`Envoyer un rappel de paiement pour la facture ${facture.numero} ?`)) {
      // Implémenter l'envoi de rappel
      alert('Rappel envoyé avec succès !');
    }
  }

  closeModal() {
    this.showPaiementModal = false;
    this.factureSelectionnee = null;
  }

  paiementValide(): boolean {
    return this.paiement.montant > 0 && this.paiement.montant <= this.resteAPayer;
  }

  async validerPaiement() {
    if (!this.paiementValide()) return;
    
    // Mettre à jour le montant payé
    const nouveauPaye = (this.factureSelectionnee.montant_paye || 0) + this.paiement.montant;
    const nouveauStatut = nouveauPaye >= this.factureSelectionnee.montant_ttc ? 'paye' : 'partiel';
    
    // Ici tu appellerais ton API pour mettre à jour la facture
    console.log('Paiement enregistré:', {
      facture: this.factureSelectionnee.numero,
      paiement: this.paiement,
      nouveauStatut
    });
    
    await this.loadFactures();
    this.closeModal();
    alert('Paiement enregistré avec succès !');
  }

  exporterExcel() {
    // Implémenter l'export Excel
    alert('Export Excel en cours de développement');
  }
}
