import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface CreanceFinance {
  id?: number;
  reference: string;
  tiers: string;
  type_tiers: 'client' | 'fournisseur' | 'autre';
  document_type: 'facture' | 'devis' | 'contrat' | 'avoir';
  document_numero: string;
  date_emission: string;
  date_echeance: string;
  montant_initial: number;
  montant_restant: number;
  devise: string;
  nature: 'créance' | 'dette';
  statut: 'en_attente' | 'partiel' | 'retard' | 'solde' | 'litige';
  responsable?: string;
  notes?: string;
}

@Component({
  selector: 'app-recouvrement-finance',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="recouvrement-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>💰 Recouvrement - Finance</h1>
          <p class="subtitle">
            Créances: {{ totalCreances | number }} FCFA | 
            Dettes: {{ totalDettes | number }} FCFA |
            Solde: {{ soldeNet | number }} FCFA
          </p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="creances.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="creances.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouvelle écriture</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="creances.length > 0">
        <div class="kpi-card creance">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalCreances | number }} <small>FCFA</small></span>
            <span class="kpi-label">Total créances</span>
          </div>
        </div>
        <div class="kpi-card dette">
          <div class="kpi-icon">💳</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalDettes | number }} <small>FCFA</small></span>
            <span class="kpi-label">Total dettes</span>
          </div>
        </div>
        <div class="kpi-card solde">
          <div class="kpi-icon">⚖️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ soldeNet | number }} <small>FCFA</small></span>
            <span class="kpi-label">Solde net</span>
          </div>
        </div>
        <div class="kpi-card retard">
          <div class="kpi-icon">⚠️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalRetard | number }} <small>FCFA</small></span>
            <span class="kpi-label">En retard</span>
          </div>
        </div>
      </div>

      <!-- Formulaire moderne -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouvelle' }} écriture de recouvrement</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveCreance()">
              <div class="form-row">
                <div class="form-group">
                  <label>Référence *</label>
                  <input type="text" [(ngModel)]="newCreance.reference" name="reference" required>
                </div>
                <div class="form-group">
                  <label>Tiers *</label>
                  <input type="text" [(ngModel)]="newCreance.tiers" name="tiers" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Type de tiers</label>
                  <select [(ngModel)]="newCreance.type_tiers" name="type_tiers">
                    <option value="client">👤 Client</option>
                    <option value="fournisseur">🏭 Fournisseur</option>
                    <option value="autre">📌 Autre</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Nature</label>
                  <div class="type-toggle">
                    <button type="button" class="toggle-btn" [class.active]="newCreance.nature === 'créance'" (click)="newCreance.nature = 'créance'; onNatureChange()">
                      📥 Créance
                    </button>
                    <button type="button" class="toggle-btn" [class.active]="newCreance.nature === 'dette'" (click)="newCreance.nature = 'dette'; onNatureChange()">
                      📤 Dette
                    </button>
                  </div>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Type de document</label>
                  <select [(ngModel)]="newCreance.document_type" name="document_type">
                    <option value="facture">📄 Facture</option>
                    <option value="devis">📋 Devis</option>
                    <option value="contrat">📑 Contrat</option>
                    <option value="avoir">🔄 Avoir</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>N° document</label>
                  <input type="text" [(ngModel)]="newCreance.document_numero" name="document_numero">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Date d'émission</label>
                  <input type="date" [(ngModel)]="newCreance.date_emission" name="date_emission" required>
                </div>
                <div class="form-group">
                  <label>Date d'échéance</label>
                  <input type="date" [(ngModel)]="newCreance.date_echeance" name="date_echeance" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Montant initial *</label>
                  <input type="number" [(ngModel)]="newCreance.montant_initial" name="montant_initial" required (input)="updateRestant()">
                </div>
                <div class="form-group">
                  <label>Devise</label>
                  <select [(ngModel)]="newCreance.devise" name="devise">
                    <option value="FCFA">FCFA</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollar ($)</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Montant restant *</label>
                  <input type="number" [(ngModel)]="newCreance.montant_restant" name="montant_restant" required>
                </div>
                <div class="form-group">
                  <label>Statut</label>
                  <select [(ngModel)]="newCreance.statut" name="statut">
                    <option value="en_attente">⏳ En attente</option>
                    <option value="partiel">🔄 Partiel</option>
                    <option value="retard">⚠️ En retard</option>
                    <option value="solde">✅ Soldé</option>
                    <option value="litige">⚖️ Litige</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Responsable</label>
                  <input type="text" [(ngModel)]="newCreance.responsable" name="responsable">
                </div>
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="newCreance.notes" name="notes" rows="3"></textarea>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="cancelForm()">Annuler</button>
                <button type="submit" class="btn-primary">💾 Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Filtres modernes -->
      <div class="filters-section" *ngIf="creances.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterCreances()" placeholder="Rechercher par tiers, référence..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="natureFilter" (ngModelChange)="filterCreances()" class="filter-select">
            <option value="">Toutes natures</option>
            <option value="créance">📥 Créances</option>
            <option value="dette">📤 Dettes</option>
          </select>
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterCreances()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="en_attente">⏳ En attente</option>
            <option value="partiel">🔄 Partiel</option>
            <option value="retard">⚠️ En retard</option>
            <option value="solde">✅ Soldé</option>
            <option value="litige">⚖️ Litige</option>
          </select>
          <select [(ngModel)]="typeTiersFilter" (ngModelChange)="filterCreances()" class="filter-select">
            <option value="">Tous types</option>
            <option value="client">👤 Clients</option>
            <option value="fournisseur">🏭 Fournisseurs</option>
          </select>
        </div>
      </div>

      <!-- Liste des écritures améliorée -->
      <div class="creances-section" *ngIf="creances.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Écritures de recouvrement</h2>
          <div class="header-stats">
            <span class="stat-badge total">Total: {{ totalGeneral | number }} FCFA</span>
            <span class="stat-badge encours">En cours: {{ totalEncours | number }} FCFA</span>
          </div>
        </div>
        
        <div class="creances-list">
          <div class="creance-card" *ngFor="let c of filteredCreances" [class]="c.nature" [class.retard]="c.statut === 'retard'" [class.litige]="c.statut === 'litige'">
            <div class="card-header">
              <div class="header-left">
                <div class="creance-icon" [class]="c.nature">
                  {{ c.nature === 'créance' ? '📥' : '📤' }}
                </div>
                <div class="creance-info">
                  <div class="creance-ref">{{ c.reference }}</div>
                  <div class="creance-tiers">{{ c.tiers }}</div>
                  <div class="creance-document">
                    <span class="doc-badge">{{ c.document_type | uppercase }}</span>
                    <span class="doc-num">{{ c.document_numero }}</span>
                  </div>
                </div>
              </div>
              <div class="header-right">
                <div class="creance-montant" [class]="c.nature">
                  {{ c.montant_restant | number }} <small>{{ c.devise }}</small>
                </div>
                <div class="creance-statut">
                  <span class="status-badge" [class]="c.statut">
                    {{ getStatutLabel(c.statut) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">📅 Émission</span>
                  <span class="detail-value">{{ c.date_emission | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">📅 Échéance</span>
                  <span class="detail-value" [class.urgent]="isEcheanceProche(c)">
                    {{ c.date_echeance | date:'dd/MM/yyyy' }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">💰 Initial</span>
                  <span class="detail-value">{{ c.montant_initial | number }} FCFA</span>
                </div>
                <div class="detail-item" *ngIf="c.responsable">
                  <span class="detail-label">👤 Responsable</span>
                  <span class="detail-value">{{ c.responsable }}</span>
                </div>
              </div>
              <div class="progress-bar" *ngIf="c.montant_initial > 0">
                <div class="progress-fill" [style.width.%]="getPourcentageRembourse(c)"></div>
                <span class="progress-text">{{ getPourcentageRembourse(c) }}% remboursé</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="enregistrerPaiement(c)" [disabled]="c.statut === 'solde'" title="Enregistrer paiement">
                  💰
                </button>
                <button class="action-icon" (click)="editCreance(c)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="duplicateCreance(c)" title="Dupliquer">📋</button>
                <button class="action-icon delete" (click)="deleteCreance(c)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">💰</div>
          <h2>Aucune écriture de recouvrement</h2>
          <p>Ajoutez votre première créance ou dette</p>
          <button class="btn-primary" (click)="openForm()">+ Nouvelle écriture</button>
        </div>
      </ng-template>

      <!-- Modal de paiement amélioré -->
      <div class="modal-overlay" *ngIf="showPaiementModal">
        <div class="modal-container">
          <div class="modal-header">
            <h3>💰 Enregistrer un paiement</h3>
            <button class="modal-close" (click)="closePaiementModal()">✕</button>
          </div>
          <div class="modal-body" *ngIf="paiementDocument">
            <div class="paiement-info">
              <div class="info-row">
                <span class="info-label">👤 Tiers</span>
                <span class="info-value">{{ paiementDocument.tiers }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📄 Document</span>
                <span class="info-value">{{ paiementDocument.document_type | uppercase }} {{ paiementDocument.document_numero }}</span>
              </div>
              <div class="info-row highlight">
                <span class="info-label">💰 Montant initial</span>
                <span class="info-value">{{ paiementDocument.montant_initial | number }} {{ paiementDocument.devise }}</span>
              </div>
              <div class="info-row highlight">
                <span class="info-label">💵 Montant restant</span>
                <span class="info-value restant">{{ paiementDocument.montant_restant | number }} {{ paiementDocument.devise }}</span>
              </div>
            </div>
            
            <div class="form-group">
              <label>Montant payé *</label>
              <input type="number" [(ngModel)]="montantPaiement" class="form-control" min="0" [max]="paiementDocument.montant_restant" (input)="updateMontantPaiement()">
              <small class="help-text">Maximum: {{ paiementDocument.montant_restant | number }} {{ paiementDocument.devise }}</small>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Mode de paiement</label>
                <select [(ngModel)]="modePaiement" class="form-control">
                  <option value="especes">💵 Espèces</option>
                  <option value="carte">💳 Carte bancaire</option>
                  <option value="cheque">📝 Chèque</option>
                  <option value="virement">🏦 Virement</option>
                  <option value="compensation">🔄 Compensation</option>
                </select>
              </div>
              <div class="form-group">
                <label>Date de paiement</label>
                <input type="date" [(ngModel)]="datePaiement" class="form-control">
              </div>
            </div>
            
            <div class="form-group">
              <label>Référence</label>
              <input type="text" [(ngModel)]="referencePaiement" class="form-control" placeholder="N° transaction, chèque...">
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="closePaiementModal()">Annuler</button>
            <button class="btn-primary" (click)="validerPaiement()">✅ Valider le paiement</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .recouvrement-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-add:hover, .btn-primary:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
    .btn-excel { background: #10B981; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-pdf { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .alert-success { background: #10B981; color: white; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
    .kpi-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.2s; }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .kpi-icon { font-size: 32px; width: 56px; height: 56px; background: #FDF2F8; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .kpi-content { flex: 1; }
    .kpi-value { display: block; font-size: 24px; font-weight: 700; }
    .kpi-value small { font-size: 12px; font-weight: 400; color: #6B7280; }
    .kpi-label { font-size: 13px; color: #6B7280; }
    .kpi-card.creance .kpi-value { color: #EC4899; }
    .kpi-card.dette .kpi-value { color: #F59E0B; }
    .kpi-card.solde .kpi-value { color: #10B981; }
    .kpi-card.retard .kpi-value { color: #EF4444; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 650px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
    .modal-container.large { max-width: 800px; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #F3F4F6; }
    .modal-header h3 { margin: 0; color: #EC4899; }
    .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #9CA3AF; }
    .modal-body { padding: 24px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .form-group { display: flex; flex-direction: column; margin-bottom: 16px; }
    .form-group label { margin-bottom: 8px; color: #4B5563; font-weight: 500; font-size: 14px; }
    .form-group input, .form-group textarea, .form-group select { padding: 12px; border: 2px solid #F3F4F6; border-radius: 10px; font-size: 14px; transition: border-color 0.2s; }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #EC4899; }
    .help-text { font-size: 11px; color: #9CA3AF; margin-top: 4px; }
    .type-toggle { display: flex; gap: 10px; }
    .toggle-btn { flex: 1; padding: 10px; border: 2px solid #F3F4F6; background: white; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
    .toggle-btn.active { background: #EC4899; color: white; border-color: #EC4899; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 2; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    
    .creances-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .stat-badge.total { background: #FEF3F9; color: #EC4899; }
    .stat-badge.encours { background: #E0E7FF; color: #4F46E5; }
    
    .creances-list { display: flex; flex-direction: column; gap: 16px; }
    .creance-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .creance-card.créance { border-left-color: #EC4899; }
    .creance-card.dette { border-left-color: #F59E0B; }
    .creance-card.retard { background: #FEF2F2; }
    .creance-card.litige { background: #FEF2F2; border-left-color: #6B7280; }
    .creance-card:hover { transform: translateX(4px); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 16px; }
    .header-left { display: flex; gap: 16px; align-items: center; flex: 1; }
    .creance-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .creance-ref { font-weight: 600; color: #1F2937; margin-bottom: 4px; }
    .creance-tiers { font-size: 14px; color: #6B7280; margin-bottom: 4px; }
    .creance-document { display: flex; gap: 8px; font-size: 11px; }
    .doc-badge { background: #E5E7EB; padding: 2px 6px; border-radius: 4px; color: #4B5563; }
    .doc-num { color: #9CA3AF; font-family: monospace; }
    .header-right { text-align: right; }
    .creance-montant { font-size: 22px; font-weight: 700; }
    .creance-montant.créance { color: #EC4899; }
    .creance-montant.dette { color: #F59E0B; }
    .creance-montant small { font-size: 12px; font-weight: 400; }
    .status-badge { font-size: 11px; padding: 4px 10px; border-radius: 20px; }
    .status-badge.en_attente { background: #FEF3C7; color: #D97706; }
    .status-badge.partiel { background: #E0E7FF; color: #4F46E5; }
    .status-badge.retard { background: #FEE2E2; color: #EF4444; }
    .status-badge.solde { background: #DCFCE7; color: #16A34A; }
    .status-badge.litige { background: #F3F4F6; color: #6B7280; }
    .card-body { margin-bottom: 16px; }
    .details-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 12px; }
    .detail-item { display: flex; flex-direction: column; }
    .detail-label { font-size: 11px; color: #9CA3AF; margin-bottom: 4px; }
    .detail-value { font-size: 13px; font-weight: 500; color: #1F2937; }
    .detail-value.urgent { color: #EF4444; font-weight: 600; }
    .progress-bar { background: #E5E7EB; border-radius: 20px; height: 24px; position: relative; overflow: hidden; margin-top: 12px; }
    .progress-fill { background: #10B981; height: 100%; border-radius: 20px; transition: width 0.3s; }
    .progress-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 11px; font-weight: 600; color: white; text-shadow: 0 0 2px rgba(0,0,0,0.3); }
    .card-footer { display: flex; justify-content: flex-end; }
    .footer-actions { display: flex; gap: 8px; }
    .action-icon { background: none; border: 1px solid #FCE7F3; border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: all 0.2s; font-size: 14px; }
    .action-icon:hover { background: #FEF3F9; border-color: #EC4899; }
    .action-icon:disabled { opacity: 0.5; cursor: not-allowed; }
    .action-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    
    .paiement-info { background: #F9FAFB; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F3F4F6; }
    .info-row:last-child { border-bottom: none; }
    .info-row.highlight { font-weight: 600; }
    .info-row .restant { color: #EC4899; font-size: 18px; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; gap: 12px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .details-grid { grid-template-columns: repeat(2, 1fr); }
      .card-header { flex-direction: column; }
      .header-right { text-align: left; }
    }
  `]
})
export class Recouvrement implements OnInit {
  creances: CreanceFinance[] = [];
  filteredCreances: CreanceFinance[] = [];
  
  newCreance: Partial<CreanceFinance> = {
    reference: '',
    tiers: '',
    type_tiers: 'client',
    nature: 'créance',
    document_type: 'facture',
    date_emission: new Date().toISOString().split('T')[0],
    date_echeance: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    montant_initial: 0,
    montant_restant: 0,
    devise: 'FCFA',
    statut: 'en_attente'
  };
  
  searchTerm = '';
  natureFilter = '';
  statutFilter = '';
  typeTiersFilter = '';
  showForm = false;
  editMode = false;
  showPaiementModal = false;
  successMessage = '';
  
  totalCreances = 0;
  totalDettes = 0;
  totalRetard = 0;
  totalGeneral = 0;
  totalEncours = 0;
  soldeNet = 0;
  
  paiementDocument: CreanceFinance | null = null;
  montantPaiement = 0;
  modePaiement = 'especes';
  datePaiement = new Date().toISOString().split('T')[0];
  referencePaiement = '';
  
  ngOnInit() {
    this.loadCreances();
  }
  
  openForm() {
    this.newCreance = {
      reference: this.generateReference(),
      tiers: '',
      type_tiers: 'client',
      nature: 'créance',
      document_type: 'facture',
      date_emission: new Date().toISOString().split('T')[0],
      date_echeance: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      montant_initial: 0,
      montant_restant: 0,
      devise: 'FCFA',
      statut: 'en_attente'
    };
    this.editMode = false;
    this.showForm = true;
  }
  
  generateReference(): string {
    const count = this.creances.length + 1;
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `REC-${year}${month}-${String(count).padStart(4, '0')}`;
  }
  
  loadCreances() {
    const saved = localStorage.getItem('recouvrement_finance');
    this.creances = saved ? JSON.parse(saved) : [];
    this.filteredCreances = [...this.creances];
    this.calculerStats();
  }
  
  saveCreances() {
    localStorage.setItem('recouvrement_finance', JSON.stringify(this.creances));
  }
  
  onNatureChange() {
    if (this.newCreance.nature === 'dette') {
      this.newCreance.statut = 'en_attente';
    }
  }
  
  updateRestant() {
    this.newCreance.montant_restant = this.newCreance.montant_initial;
  }
  
  saveCreance() {
    if (this.editMode && this.newCreance.id) {
      const index = this.creances.findIndex(c => c.id === this.newCreance.id);
      if (index !== -1) {
        this.creances[index] = this.newCreance as CreanceFinance;
        this.showMessage('Écriture modifiée');
      }
    } else {
      const newCreance: CreanceFinance = {
        id: Date.now(),
        reference: this.newCreance.reference || this.generateReference(),
        tiers: this.newCreance.tiers || '',
        type_tiers: this.newCreance.type_tiers as 'client' | 'fournisseur' | 'autre' || 'client',
        nature: this.newCreance.nature as 'créance' | 'dette' || 'créance',
        document_type: this.newCreance.document_type as 'facture' | 'devis' | 'contrat' | 'avoir' || 'facture',
        document_numero: this.newCreance.document_numero || '',
        date_emission: this.newCreance.date_emission || new Date().toISOString().split('T')[0],
        date_echeance: this.newCreance.date_echeance || new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        montant_initial: this.newCreance.montant_initial || 0,
        montant_restant: this.newCreance.montant_restant || this.newCreance.montant_initial || 0,
        devise: this.newCreance.devise || 'FCFA',
        statut: this.newCreance.statut as 'en_attente' | 'partiel' | 'retard' | 'solde' | 'litige' || 'en_attente',
        responsable: this.newCreance.responsable,
        notes: this.newCreance.notes
      };
      this.creances.push(newCreance);
      this.showMessage('Écriture ajoutée');
    }
    
    this.saveCreances();
    this.filterCreances();
    this.calculerStats();
    this.cancelForm();
  }
  
  editCreance(c: CreanceFinance) {
    this.newCreance = { ...c };
    this.editMode = true;
    this.showForm = true;
  }
  
  duplicateCreance(c: CreanceFinance) {
    const newCreance: CreanceFinance = { 
      ...c, 
      id: Date.now(), 
      reference: c.reference + '-COPY',
      statut: 'en_attente',
      montant_restant: c.montant_initial
    };
    this.creances.push(newCreance);
    this.saveCreances();
    this.filterCreances();
    this.calculerStats();
    this.showMessage('Écriture dupliquée');
  }
  
  deleteCreance(c: CreanceFinance) {
    if (confirm('Supprimer cette écriture ?')) {
      this.creances = this.creances.filter(cre => cre.id !== c.id);
      this.saveCreances();
      this.filterCreances();
      this.calculerStats();
      this.showMessage('Écriture supprimée');
    }
  }
  
  enregistrerPaiement(c: CreanceFinance) {
    this.paiementDocument = c;
    this.montantPaiement = c.montant_restant;
    this.referencePaiement = '';
    this.showPaiementModal = true;
  }
  
  closePaiementModal() {
    this.showPaiementModal = false;
    this.paiementDocument = null;
  }
  
  updateMontantPaiement() {
    if (this.montantPaiement > (this.paiementDocument?.montant_restant || 0)) {
      this.montantPaiement = this.paiementDocument?.montant_restant || 0;
    }
  }
  
  validerPaiement() {
    if (this.paiementDocument && this.montantPaiement > 0) {
      const index = this.creances.findIndex(c => c.id === this.paiementDocument?.id);
      if (index !== -1) {
        const nouveauRestant = this.paiementDocument.montant_restant - this.montantPaiement;
        this.creances[index].montant_restant = Math.max(0, nouveauRestant);
        this.creances[index].statut = nouveauRestant <= 0 ? 'solde' : 'partiel';
        
        this.saveCreances();
        this.filterCreances();
        this.calculerStats();
        this.closePaiementModal();
        this.showMessage(`✅ Paiement de ${this.montantPaiement.toLocaleString()} FCFA enregistré`);
      }
    }
  }
  
  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }
  
  filterCreances() {
    let filtered = this.creances;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.reference?.toLowerCase().includes(term) ||
        c.tiers?.toLowerCase().includes(term) ||
        c.document_numero?.toLowerCase().includes(term)
      );
    }
    
    if (this.natureFilter) {
      filtered = filtered.filter(c => c.nature === this.natureFilter);
    }
    
    if (this.statutFilter) {
      filtered = filtered.filter(c => c.statut === this.statutFilter);
    }
    
    if (this.typeTiersFilter) {
      filtered = filtered.filter(c => c.type_tiers === this.typeTiersFilter);
    }
    
    this.filteredCreances = filtered;
  }
  
  calculerStats() {
    this.totalCreances = this.creances
      .filter(c => c.nature === 'créance')
      .reduce((sum, c) => sum + (c.montant_restant || 0), 0);
      
    this.totalDettes = this.creances
      .filter(c => c.nature === 'dette')
      .reduce((sum, c) => sum + (c.montant_restant || 0), 0);
      
    this.totalRetard = this.creances
      .filter(c => c.statut === 'retard')
      .reduce((sum, c) => sum + (c.montant_restant || 0), 0);
      
    this.totalGeneral = this.creances.reduce((sum, c) => sum + (c.montant_restant || 0), 0);
    this.totalEncours = this.creances
      .filter(c => c.statut !== 'solde')
      .reduce((sum, c) => sum + (c.montant_restant || 0), 0);
      
    this.soldeNet = this.totalCreances - this.totalDettes;
  }
  
  isEcheanceProche(c: CreanceFinance): boolean {
    if (c.statut === 'solde') return false;
    const today = new Date();
    const echeance = new Date(c.date_echeance);
    const diffTime = echeance.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  }
  
  getPourcentageRembourse(c: CreanceFinance): number {
    if (c.montant_initial === 0) return 0;
    const rembourse = c.montant_initial - c.montant_restant;
    return Math.round((rembourse / c.montant_initial) * 100);
  }
  
  getStatutLabel(statut: string): string {
    const labels: any = { 
      en_attente: '⏳ En attente', 
      partiel: '🔄 Partiel', 
      retard: '⚠️ En retard', 
      solde: '✅ Soldé', 
      litige: '⚖️ Litige' 
    };
    return labels[statut] || statut;
  }
  
    exportToExcel() {
    if (!this.filteredCreances || this.filteredCreances.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredCreances[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const lignes = this.filteredCreances.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ""));
    const csvContent = [colonnes, ...lignes]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `export_${new Date().toISOString().slice(0,19)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showSuccess("Export Excel effectué");
  }
  
    exportToPDF() {
    if (!this.filteredCreances || this.filteredCreances.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredCreances[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join("")}</tr>\n</thead>\n<tbody>${this.filteredCreances.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : "-"}</td>`).join("")}</tr>`).join("")}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert("Veuillez autoriser les pop-ups pour exporter en PDF"); }
  }
  
  showMessage(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = "", 3000);
  }

}