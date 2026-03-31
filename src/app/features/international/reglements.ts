import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface ReglementInternational {
  id?: number;
  reference: string;
  type: 'import' | 'export';
  montant: number;
  devise: string;
  mode_paiement: 'virement' | 'carte' | 'cheque' | 'especes' | 'letter_credit';
  date_emission: string;
  date_echeance?: string;
  date_reglement?: string;
  beneficiaire: string;
  pays_destinataire: string;
  motif: string;
  reference_document?: string;
  declaration_douane_id?: number;
  statut: 'en_attente' | 'en_cours' | 'execute' | 'refuse' | 'annule';
  frais_bancaires?: number;
  taux_change?: number;
  notes?: string;
  created_at: string;
}

@Component({
  selector: 'app-reglements',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="reglements-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>💶 Règlements internationaux</h1>
          <p class="subtitle">{{ reglements.length }} règlement(s) • Montant total: {{ totalMontant | number }} FCFA</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="reglements.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="reglements.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouveau règlement</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="reglements.length > 0">
        <div class="kpi-card total">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalMontant | number }} <small>FCFA</small></span>
            <span class="kpi-label">Montant total</span>
          </div>
        </div>
        <div class="kpi-card import">
          <div class="kpi-icon">📥</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalImport | number }} <small>FCFA</small></span>
            <span class="kpi-label">Importations</span>
          </div>
        </div>
        <div class="kpi-card export">
          <div class="kpi-icon">📤</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalExport | number }} <small>FCFA</small></span>
            <span class="kpi-label">Exportations</span>
          </div>
        </div>
        <div class="kpi-card en-attente">
          <div class="kpi-icon">⏳</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getCountByStatut('en_attente') + getCountByStatut('en_cours') }}</span>
            <span class="kpi-label">En attente</span>
          </div>
        </div>
      </div>

      <!-- Formulaire moderne -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouveau' }} règlement international</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveReglement()">
              <div class="form-row">
                <div class="form-group">
                  <label>Type de règlement *</label>
                  <div class="type-toggle">
                    <button type="button" class="toggle-btn" [class.active]="newReglement.type === 'import'" (click)="newReglement.type = 'import'">
                      📥 Importation
                    </button>
                    <button type="button" class="toggle-btn" [class.active]="newReglement.type === 'export'" (click)="newReglement.type = 'export'">
                      📤 Exportation
                    </button>
                  </div>
                </div>
                <div class="form-group">
                  <label>Mode de paiement *</label>
                  <select [(ngModel)]="newReglement.mode_paiement" name="mode_paiement" required>
                    <option value="virement">🏦 Virement bancaire</option>
                    <option value="carte">💳 Carte bancaire</option>
                    <option value="cheque">📝 Chèque</option>
                    <option value="especes">💵 Espèces</option>
                    <option value="letter_credit">📜 Crédit documentaire</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Bénéficiaire *</label>
                  <input type="text" [(ngModel)]="newReglement.beneficiaire" name="beneficiaire" required placeholder="Nom du bénéficiaire">
                </div>
                <div class="form-group">
                  <label>Pays destinataire *</label>
                  <input type="text" [(ngModel)]="newReglement.pays_destinataire" name="pays" required placeholder="Ex: France, Chine...">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Montant *</label>
                  <input type="number" [(ngModel)]="newReglement.montant" name="montant" required placeholder="0" (input)="calculerTotal()">
                </div>
                <div class="form-group">
                  <label>Devise</label>
                  <select [(ngModel)]="newReglement.devise" name="devise">
                    <option value="FCFA">FCFA</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollar ($)</option>
                    <option value="GBP">Livre (£)</option>
                    <option value="CNY">Yuan (¥)</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Taux de change</label>
                  <input type="number" [(ngModel)]="newReglement.taux_change" name="taux" placeholder="1" step="0.01">
                </div>
                <div class="form-group">
                  <label>Frais bancaires</label>
                  <input type="number" [(ngModel)]="newReglement.frais_bancaires" name="frais" placeholder="0">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Date d'émission *</label>
                  <input type="date" [(ngModel)]="newReglement.date_emission" name="date_emission" required>
                </div>
                <div class="form-group">
                  <label>Date d'échéance</label>
                  <input type="date" [(ngModel)]="newReglement.date_echeance" name="date_echeance">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Date de règlement</label>
                  <input type="date" [(ngModel)]="newReglement.date_reglement" name="date_reglement">
                </div>
                <div class="form-group">
                  <label>Référence document</label>
                  <input type="text" [(ngModel)]="newReglement.reference_document" name="ref_doc" placeholder="N° facture, BL...">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Motif *</label>
                  <input type="text" [(ngModel)]="newReglement.motif" name="motif" required placeholder="Raison du règlement">
                </div>
                <div class="form-group">
                  <label>Statut</label>
                  <select [(ngModel)]="newReglement.statut" name="statut">
                    <option value="en_attente">⏳ En attente</option>
                    <option value="en_cours">🔄 En cours</option>
                    <option value="execute">✅ Exécuté</option>
                    <option value="refuse">❌ Refusé</option>
                    <option value="annule">🚫 Annulé</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="newReglement.notes" name="notes" rows="2" placeholder="Informations complémentaires..."></textarea>
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
      <div class="filters-section" *ngIf="reglements.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterReglements()" placeholder="Rechercher par bénéficiaire, référence..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="typeFilter" (ngModelChange)="filterReglements()" class="filter-select">
            <option value="">Tous types</option>
            <option value="import">📥 Importations</option>
            <option value="export">📤 Exportations</option>
          </select>
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterReglements()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="en_attente">⏳ En attente</option>
            <option value="en_cours">🔄 En cours</option>
            <option value="execute">✅ Exécuté</option>
            <option value="refuse">❌ Refusé</option>
            <option value="annule">🚫 Annulé</option>
          </select>
          <select [(ngModel)]="modeFilter" (ngModelChange)="filterReglements()" class="filter-select">
            <option value="">Tous modes</option>
            <option value="virement">🏦 Virement</option>
            <option value="carte">💳 Carte</option>
            <option value="cheque">📝 Chèque</option>
            <option value="letter_credit">📜 Crédit doc.</option>
          </select>
        </div>
      </div>

      <!-- Liste des règlements améliorée -->
      <div class="reglements-section" *ngIf="reglements.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Historique des règlements</h2>
          <div class="header-stats">
            <span class="stat-badge total">Total: {{ totalMontant | number }} FCFA</span>
            <span class="stat-badge executed">Exécutés: {{ totalExecute | number }} FCFA</span>
          </div>
        </div>
        
        <div class="reglements-list">
          <div class="reglement-card" *ngFor="let r of filteredReglements" [class]="r.statut">
            <div class="card-header">
              <div class="header-left">
                <div class="reglement-icon" [class]="r.type">
                  {{ r.type === 'import' ? '📥' : '📤' }}
                </div>
                <div class="reglement-info">
                  <div class="reglement-ref">{{ r.reference }}</div>
                  <div class="reglement-beneficiaire">{{ r.beneficiaire }}</div>
                  <div class="reglement-details">
                    <span class="detail-mode">{{ getModeLabel(r.mode_paiement) }}</span>
                    <span class="detail-pays">{{ r.pays_destinataire }}</span>
                    <span class="detail-date">{{ r.date_emission | date:'dd/MM/yyyy' }}</span>
                  </div>
                </div>
              </div>
              <div class="header-right">
                <div class="reglement-montant" [class]="r.type">
                  {{ r.montant | number }} {{ r.devise }}
                </div>
                <div class="reglement-statut">
                  <span class="status-badge" [class]="r.statut">
                    {{ getStatutLabel(r.statut) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="card-body" *ngIf="r.motif || r.reference_document">
              <div class="motif-info" *ngIf="r.motif">
                <span class="motif-label">📝 Motif:</span>
                <span class="motif-value">{{ r.motif }}</span>
              </div>
              <div class="ref-info" *ngIf="r.reference_document">
                <span class="ref-label">📄 Réf. document:</span>
                <span class="ref-value">{{ r.reference_document }}</span>
              </div>
              <div class="frais-info" *ngIf="r.frais_bancaires">
                <span class="frais-label">💸 Frais bancaires:</span>
                <span class="frais-value">{{ r.frais_bancaires | number }} {{ r.devise }}</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="editReglement(r)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="duplicateReglement(r)" title="Dupliquer">📋</button>
                <button class="action-icon" *ngIf="r.statut !== 'execute'" (click)="marquerExecute(r)" title="Marquer exécuté">✅</button>
                <button class="action-icon delete" (click)="deleteReglement(r)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">💶</div>
          <h2>Aucun règlement international</h2>
          <p>Commencez par enregistrer votre premier règlement</p>
          <button class="btn-primary" (click)="openForm()">+ Nouveau règlement</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .reglements-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
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
    .kpi-card.total .kpi-value { color: #EC4899; }
    .kpi-card.import .kpi-value { color: #3B82F6; }
    .kpi-card.export .kpi-value { color: #10B981; }
    .kpi-card.en-attente .kpi-value { color: #F59E0B; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 800px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
    .modal-container.large { max-width: 900px; }
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
    .type-toggle { display: flex; gap: 8px; flex-wrap: wrap; }
    .toggle-btn { flex: 1; padding: 10px; border: 2px solid #F3F4F6; background: white; border-radius: 10px; cursor: pointer; transition: all 0.2s; font-size: 12px; }
    .toggle-btn.active { background: #EC4899; color: white; border-color: #EC4899; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 2; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    
    .reglements-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .stat-badge.total { background: #FEF3F9; color: #EC4899; }
    .stat-badge.executed { background: #DCFCE7; color: #16A34A; }
    
    .reglements-list { display: flex; flex-direction: column; gap: 16px; }
    .reglement-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .reglement-card.en_attente { border-left-color: #F59E0B; }
    .reglement-card.en_cours { border-left-color: #3B82F6; }
    .reglement-card.execute { border-left-color: #10B981; }
    .reglement-card.refuse, .reglement-card.annule { border-left-color: #EF4444; opacity: 0.7; }
    .reglement-card:hover { transform: translateX(4px); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; }
    .header-left { display: flex; gap: 16px; align-items: center; flex: 1; }
    .reglement-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .reglement-icon.import { color: #3B82F6; }
    .reglement-icon.export { color: #10B981; }
    .reglement-ref { font-weight: 600; color: #1F2937; margin-bottom: 4px; }
    .reglement-beneficiaire { font-size: 14px; color: #6B7280; margin-bottom: 6px; }
    .reglement-details { display: flex; gap: 8px; flex-wrap: wrap; }
    .detail-mode, .detail-pays, .detail-date { font-size: 11px; padding: 2px 8px; background: #E5E7EB; border-radius: 20px; color: #4B5563; }
    .header-right { text-align: right; }
    .reglement-montant { font-size: 20px; font-weight: 700; }
    .reglement-montant.import { color: #3B82F6; }
    .reglement-montant.export { color: #10B981; }
    .status-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .status-badge.en_attente { background: #FEF3C7; color: #D97706; }
    .status-badge.en_cours { background: #DBEAFE; color: #1E40AF; }
    .status-badge.execute { background: #DCFCE7; color: #16A34A; }
    .status-badge.refuse, .status-badge.annule { background: #FEE2E2; color: #EF4444; }
    .card-body { margin-top: 16px; padding-top: 16px; border-top: 1px solid #F3F4F6; display: flex; gap: 16px; flex-wrap: wrap; }
    .motif-info, .ref-info, .frais-info { font-size: 12px; color: #6B7280; }
    .card-footer { margin-top: 16px; padding-top: 16px; border-top: 1px solid #F3F4F6; display: flex; justify-content: flex-end; }
    .footer-actions { display: flex; gap: 8px; }
    .action-icon { background: none; border: 1px solid #FCE7F3; border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: all 0.2s; font-size: 14px; }
    .action-icon:hover { background: #FEF3F9; border-color: #EC4899; }
    .action-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; gap: 12px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .card-header { flex-direction: column; }
      .header-right { text-align: left; }
    }
  `]
})
export class Reglements implements OnInit {
  reglements: ReglementInternational[] = [];
  filteredReglements: ReglementInternational[] = [];
  showForm = false;
  editMode = false;
  successMessage = '';

  searchTerm = '';
  typeFilter = '';
  statutFilter = '';
  modeFilter = '';

  totalMontant = 0;
  totalImport = 0;
  totalExport = 0;
  totalExecute = 0;

  newReglement: Partial<ReglementInternational> = {
    reference: '',
    type: 'import',
    montant: 0,
    devise: 'FCFA',
    mode_paiement: 'virement',
    date_emission: new Date().toISOString().split('T')[0],
    beneficiaire: '',
    pays_destinataire: '',
    motif: '',
    statut: 'en_attente',
    created_at: new Date().toISOString()
  };

  ngOnInit() {
    this.loadReglements();
  }

  openForm() {
    this.newReglement = {
      reference: this.generateReference(),
      type: 'import',
      montant: 0,
      devise: 'FCFA',
      mode_paiement: 'virement',
      date_emission: new Date().toISOString().split('T')[0],
      beneficiaire: '',
      pays_destinataire: '',
      motif: '',
      statut: 'en_attente',
      created_at: new Date().toISOString()
    };
    this.editMode = false;
    this.showForm = true;
  }

  loadReglements() {
    const saved = localStorage.getItem('reglements_internationaux');
    this.reglements = saved ? JSON.parse(saved) : [];
    this.filteredReglements = [...this.reglements];
    this.calculerStats();
  }

  saveReglements() {
    localStorage.setItem('reglements_internationaux', JSON.stringify(this.reglements));
    this.calculerStats();
  }

  generateReference(): string {
    const count = this.reglements.length + 1;
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `REG-${year}${month}-${String(count).padStart(4, '0')}`;
  }

  saveReglement() {
    if (this.editMode && this.newReglement.id) {
      const index = this.reglements.findIndex(r => r.id === this.newReglement.id);
      if (index !== -1) {
        this.reglements[index] = this.newReglement as ReglementInternational;
        this.showMessage('Règlement modifié');
      }
    } else {
      const newReglement: ReglementInternational = {
        ...this.newReglement,
        id: Date.now(),
        reference: this.newReglement.reference || this.generateReference(),
        created_at: new Date().toISOString()
      } as ReglementInternational;
      this.reglements.push(newReglement);
      this.showMessage('Règlement ajouté');
    }
    this.saveReglements();
    this.filterReglements();
    this.cancelForm();
  }

  editReglement(r: ReglementInternational) {
    this.newReglement = { ...r };
    this.editMode = true;
    this.showForm = true;
  }

  duplicateReglement(r: ReglementInternational) {
    const duplicate: ReglementInternational = {
      ...r,
      id: Date.now(),
      reference: this.generateReference(),
      statut: 'en_attente',
      created_at: new Date().toISOString()
    };
    this.reglements.push(duplicate);
    this.saveReglements();
    this.filterReglements();
    this.showMessage('Règlement dupliqué');
  }

  marquerExecute(r: ReglementInternational) {
    r.statut = 'execute';
    r.date_reglement = new Date().toISOString().split('T')[0];
    this.saveReglements();
    this.filterReglements();
    this.showMessage('Règlement marqué comme exécuté');
  }

  deleteReglement(r: ReglementInternational) {
    if (confirm(`Supprimer le règlement ${r.reference} ?`)) {
      this.reglements = this.reglements.filter(reg => reg.id !== r.id);
      this.saveReglements();
      this.filterReglements();
      this.showMessage('Règlement supprimé');
    }
  }

  filterReglements() {
    this.filteredReglements = this.reglements.filter(r => {
      const matchesSearch = !this.searchTerm || 
        r.beneficiaire.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        r.reference.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (r.motif && r.motif.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesType = !this.typeFilter || r.type === this.typeFilter;
      const matchesStatut = !this.statutFilter || r.statut === this.statutFilter;
      const matchesMode = !this.modeFilter || r.mode_paiement === this.modeFilter;
      
      return matchesSearch && matchesType && matchesStatut && matchesMode;
    });
  }

  calculerStats() {
    this.totalMontant = this.reglements.reduce((sum, r) => sum + (r.montant || 0), 0);
    this.totalImport = this.reglements
      .filter(r => r.type === 'import')
      .reduce((sum, r) => sum + (r.montant || 0), 0);
    this.totalExport = this.reglements
      .filter(r => r.type === 'export')
      .reduce((sum, r) => sum + (r.montant || 0), 0);
    this.totalExecute = this.reglements
      .filter(r => r.statut === 'execute')
      .reduce((sum, r) => sum + (r.montant || 0), 0);
  }

  getCountByStatut(statut: string): number {
    return this.reglements.filter(r => r.statut === statut).length;
  }

  calculerTotal() {
    // Pour les calculs futurs
  }

  getModeLabel(mode: string): string {
    const labels: any = {
      virement: '🏦 Virement',
      carte: '💳 Carte',
      cheque: '📝 Chèque',
      especes: '💵 Espèces',
      letter_credit: '📜 Crédit documentaire'
    };
    return labels[mode] || mode;
  }

  getStatutLabel(statut: string): string {
    const labels: any = {
      en_attente: '⏳ En attente',
      en_cours: '🔄 En cours',
      execute: '✅ Exécuté',
      refuse: '❌ Refusé',
      annule: '🚫 Annulé'
    };
    return labels[statut] || statut;
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }

    exportToExcel() {
    if (!this.filteredReglements || this.filteredReglements.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredReglements[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const lignes = this.filteredReglements.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ""));
    const csvContent = [colonnes, ...lignes]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '')}"`).join(","))
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
    if (!this.filteredReglements || this.filteredReglements.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredReglements[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join("")}</tr>\n</thead>\n<tbody>${this.filteredReglements.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : "-"}</td>`).join("")}</tr>`).join("")}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
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