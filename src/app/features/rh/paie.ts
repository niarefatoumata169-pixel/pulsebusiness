import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface BulletinPaie {
  id?: number;
  reference: string;
  employe_id: number;
  employe_nom?: string;
  mois: string; // format YYYY-MM
  salaire_base: number;
  indemnites: number;
  primes: number;
  heures_supp: number;
  taux_horaire: number;
  brut: number;
  cotisations: number;
  impots: number;
  net_a_payer: number;
  date_paiement?: string;
  statut: 'en_attente' | 'paye' | 'annule';
  notes?: string;
  created_at: string;
  updated_at?: string;
}

@Component({
  selector: 'app-paie',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="paie-container">
      <div class="header">
        <div>
          <h1>💰 Gestion de la paie</h1>
          <p class="subtitle">{{ bulletins.length }} bulletin(s) • {{ getMontantTotal() | number }} FCFA total</p>
        </div>
        <div class="header-actions">
          <button class="btn-add" (click)="openForm()">+ Nouveau bulletin</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>

      <div class="kpi-grid" *ngIf="bulletins.length > 0">
        <div class="kpi-card">
          <div class="kpi-icon">📄</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ bulletins.length }}</span>
            <span class="kpi-label">Bulletins</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getMontantTotal() | number }} <small>FCFA</small></span>
            <span class="kpi-label">Masse salariale</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getBulletinsPayes() }}</span>
            <span class="kpi-label">Payés</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">⏳</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getBulletinsEnAttente() }}</span>
            <span class="kpi-label">En attente</span>
          </div>
        </div>
      </div>

      <div class="filters-section" *ngIf="bulletins.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterBulletins()" placeholder="Rechercher par référence, employé..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterBulletins()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="en_attente">⏳ En attente</option>
            <option value="paye">✅ Payé</option>
            <option value="annule">❌ Annulé</option>
          </select>
          <select [(ngModel)]="moisFilter" (ngModelChange)="filterBulletins()" class="filter-select">
            <option value="">Tous mois</option>
            <option *ngFor="let m of moisList" [value]="m">{{ m }}</option>
          </select>
        </div>
      </div>

      <div class="bulletins-section" *ngIf="bulletins.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Liste des bulletins</h2>
          <div class="header-stats">
            <span class="stat-badge">{{ filteredBulletins.length }} / {{ bulletins.length }} affiché(s)</span>
          </div>
        </div>
        <div class="bulletins-grid">
          <div class="bulletin-card" *ngFor="let b of filteredBulletins" [class]="b.statut">
            <div class="card-header">
              <div class="header-left">
                <div class="bulletin-icon">💰</div>
                <div class="bulletin-info">
                  <div class="bulletin-ref">{{ b.reference }}</div>
                  <div class="bulletin-employe">{{ b.employe_nom }}</div>
                  <div class="bulletin-mois">{{ b.mois | date:'MMMM yyyy' }}</div>
                </div>
              </div>
              <div class="header-right">
                <div class="bulletin-montant">{{ b.net_a_payer | number }} FCFA</div>
                <span class="statut-badge" [class]="b.statut">{{ getStatutLabel(b.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">💵 Salaire base:</span>
                <span class="info-value">{{ b.salaire_base | number }} FCFA</span>
              </div>
              <div class="info-row">
                <span class="info-label">🎁 Primes:</span>
                <span class="info-value">{{ b.primes | number }} FCFA</span>
              </div>
              <div class="info-row">
                <span class="info-label">📊 Net à payer:</span>
                <span class="info-value net">{{ b.net_a_payer | number }} FCFA</span>
              </div>
              <div class="info-row" *ngIf="b.date_paiement">
                <span class="info-label">📅 Payé le:</span>
                <span class="info-value">{{ b.date_paiement | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="viewDetails(b)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="editBulletin(b)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="marquerPaye(b)" *ngIf="b.statut === 'en_attente'" title="Marquer payé">✅</button>
                <button class="action-icon delete" (click)="confirmDelete(b)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">💰</div>
          <h2>Aucun bulletin</h2>
          <p>Créez votre premier bulletin de paie</p>
          <button class="btn-primary" (click)="openForm()">+ Nouveau bulletin</button>
        </div>
      </ng-template>

      <!-- Modal formulaire -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouveau' }} bulletin</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveBulletin()">
              <div class="form-group">
                <label>Référence</label>
                <input type="text" [(ngModel)]="currentBulletin.reference" readonly class="readonly">
              </div>
              <div class="form-group">
                <label>Employé *</label>
                <select [(ngModel)]="currentBulletin.employe_id" (change)="onEmployeChange()" required>
                  <option [value]="null">Sélectionner</option>
                  <option *ngFor="let e of employes" [value]="e.id">{{ e.nom }} {{ e.prenom }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Mois *</label>
                <input type="month" [(ngModel)]="currentBulletin.mois" required>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Salaire base</label>
                  <input type="number" [(ngModel)]="currentBulletin.salaire_base" (input)="calculerTotal()" step="10000">
                </div>
                <div class="form-group">
                  <label>Indemnités</label>
                  <input type="number" [(ngModel)]="currentBulletin.indemnites" (input)="calculerTotal()" step="5000">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Primes</label>
                  <input type="number" [(ngModel)]="currentBulletin.primes" (input)="calculerTotal()" step="5000">
                </div>
                <div class="form-group">
                  <label>Heures supplémentaires</label>
                  <input type="number" [(ngModel)]="currentBulletin.heures_supp" (input)="calculerTotal()" step="1">
                </div>
              </div>
              <div class="form-group">
                <label>Taux horaire (FCFA)</label>
                <input type="number" [(ngModel)]="currentBulletin.taux_horaire" (input)="calculerTotal()" step="500">
              </div>
              <div class="form-group highlight">
                <label>Net à payer</label>
                <input type="text" [value]="(currentBulletin.net_a_payer || 0) | number" readonly class="readonly highlight-input">
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentBulletin.statut">
                  <option value="en_attente">⏳ En attente</option>
                  <option value="paye">✅ Payé</option>
                  <option value="annule">❌ Annulé</option>
                </select>
              </div>
              <div class="form-group" *ngIf="currentBulletin.statut === 'paye'">
                <label>Date de paiement</label>
                <input type="date" [(ngModel)]="currentBulletin.date_paiement">
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="currentBulletin.notes" rows="2"></textarea>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="cancelForm()">Annuler</button>
                <button type="submit" class="btn-primary">💾 Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal détails -->
      <div class="modal-overlay" *ngIf="showDetailsModal && selectedBulletin">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Détails du bulletin - {{ selectedBulletin.reference }}</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="detail-section">
              <p><strong>Employé:</strong> {{ selectedBulletin.employe_nom }}</p>
              <p><strong>Mois:</strong> {{ selectedBulletin.mois | date:'MMMM yyyy' }}</p>
              <p><strong>Salaire base:</strong> {{ selectedBulletin.salaire_base | number }} FCFA</p>
              <p><strong>Indemnités:</strong> {{ selectedBulletin.indemnites | number }} FCFA</p>
              <p><strong>Primes:</strong> {{ selectedBulletin.primes | number }} FCFA</p>
              <p><strong>Heures supp.:</strong> {{ selectedBulletin.heures_supp }} h</p>
              <p><strong>Taux horaire:</strong> {{ selectedBulletin.taux_horaire | number }} FCFA</p>
              <p><strong>Brut:</strong> {{ selectedBulletin.brut | number }} FCFA</p>
              <p><strong>Cotisations:</strong> {{ selectedBulletin.cotisations | number }} FCFA</p>
              <p><strong>Impôts:</strong> {{ selectedBulletin.impots | number }} FCFA</p>
              <p><strong>Net à payer:</strong> <strong class="highlight">{{ selectedBulletin.net_a_payer | number }} FCFA</strong></p>
              <p><strong>Statut:</strong> {{ getStatutLabel(selectedBulletin.statut) }}</p>
              <p *ngIf="selectedBulletin.date_paiement"><strong>Payé le:</strong> {{ selectedBulletin.date_paiement | date:'dd/MM/yyyy' }}</p>
              <p *ngIf="selectedBulletin.notes"><strong>Notes:</strong> {{ selectedBulletin.notes }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal suppression -->
      <div class="modal-overlay" *ngIf="showDeleteModal">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>🗑️ Confirmer la suppression</h3>
            <button class="modal-close" (click)="showDeleteModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p>Supprimer le bulletin <strong>{{ bulletinToDelete?.reference }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteBulletin()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .paie-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    .header-actions { display: flex; gap: 12px; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-add:hover, .btn-primary:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
    .alert-success { background: #10B981; color: white; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
    .kpi-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .kpi-icon { font-size: 32px; width: 56px; height: 56px; background: #FDF2F8; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .kpi-content { flex: 1; }
    .kpi-value { display: block; font-size: 24px; font-weight: 700; color: #EC4899; }
    .kpi-label { font-size: 13px; color: #6B7280; }
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 2; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    .bulletins-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; background: #FEF3F9; color: #EC4899; }
    .bulletins-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .bulletin-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: 0.2s; border-left: 4px solid transparent; }
    .bulletin-card.en_attente { border-left-color: #F59E0B; }
    .bulletin-card.paye { border-left-color: #10B981; opacity: 0.9; }
    .bulletin-card.annule { border-left-color: #EF4444; opacity: 0.7; }
    .bulletin-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; }
    .bulletin-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .bulletin-ref { font-weight: 600; color: #1F2937; font-family: monospace; }
    .bulletin-employe { font-size: 13px; color: #6B7280; margin-top: 2px; }
    .bulletin-mois { font-size: 11px; color: #9CA3AF; margin-top: 2px; }
    .header-right { text-align: right; }
    .bulletin-montant { font-weight: 700; color: #EC4899; margin-bottom: 8px; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.en_attente { background: #FEF3C7; color: #D97706; }
    .statut-badge.paye { background: #DCFCE7; color: #16A34A; }
    .statut-badge.annule { background: #FEE2E2; color: #EF4444; }
    .card-body { margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .info-label { color: #6B7280; }
    .info-value { font-weight: 500; color: #1F2937; }
    .info-value.net { color: #EC4899; font-weight: 700; }
    .card-footer { display: flex; justify-content: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid #F3F4F6; }
    .footer-actions { display: flex; gap: 8px; }
    .action-icon { background: none; border: 1px solid #FCE7F3; border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: 0.2s; font-size: 14px; }
    .action-icon:hover { background: #FEF3F9; border-color: #EC4899; }
    .action-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 600px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
    .modal-container.small { max-width: 450px; }
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
    .readonly { background: #F9FAFB; color: #6B7280; }
    .highlight-input { background: #FEF3F9; color: #EC4899; font-weight: 600; font-size: 18px; text-align: right; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-danger { background: #EF4444; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .detail-section { margin: 8px 0; }
    .detail-section p { margin: 8px 0; font-size: 14px; }
    .highlight { color: #EC4899; font-weight: 700; }
    @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; gap: 12px; } .kpi-grid { grid-template-columns: repeat(2, 1fr); } .bulletins-grid { grid-template-columns: 1fr; } .filter-group { flex-direction: column; } }
  `]
})
export class Paie implements OnInit {
  bulletins: BulletinPaie[] = [];
  filteredBulletins: BulletinPaie[] = [];
  employes: any[] = [];
  searchTerm = '';
  statutFilter = '';
  moisFilter = '';
  showForm = false;
  showDetailsModal = false;
  showDeleteModal = false;
  editMode = false;
  selectedBulletin: BulletinPaie | null = null;
  bulletinToDelete: BulletinPaie | null = null;
  successMessage = '';

  moisList: string[] = [];

  currentBulletin: Partial<BulletinPaie> = {
    reference: '',
    statut: 'en_attente',
    salaire_base: 0,
    indemnites: 0,
    primes: 0,
    heures_supp: 0,
    taux_horaire: 0,
    brut: 0,
    cotisations: 0,
    impots: 0,
    net_a_payer: 0
  };

  ngOnInit() {
    this.loadEmployes();
    this.loadBulletins();
    this.genererMoisList();
  }

  loadEmployes() {
    const saved = localStorage.getItem('effectifs');
    this.employes = saved ? JSON.parse(saved) : [];
  }

  loadBulletins() {
    const saved = localStorage.getItem('bulletins');
    this.bulletins = saved ? JSON.parse(saved) : [];
    this.filteredBulletins = [...this.bulletins];
  }

  saveBulletins() {
    localStorage.setItem('bulletins', JSON.stringify(this.bulletins));
  }

  genererMoisList() {
    const mois = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      mois.push(d.toISOString().slice(0, 7));
    }
    this.moisList = mois;
  }

  openForm() {
    this.currentBulletin = {
      reference: this.generateReference(),
      statut: 'en_attente',
      mois: new Date().toISOString().slice(0, 7),
      salaire_base: 0,
      indemnites: 0,
      primes: 0,
      heures_supp: 0,
      taux_horaire: 0,
      brut: 0,
      cotisations: 0,
      impots: 0,
      net_a_payer: 0
    };
    this.editMode = false;
    this.showForm = true;
  }

  generateReference(): string {
    const count = this.bulletins.length + 1;
    return `BUL-${String(count).padStart(4, '0')}`;
  }

  onEmployeChange() {
    const employe = this.employes.find(e => e.id === this.currentBulletin.employe_id);
    if (employe) {
      this.currentBulletin.employe_nom = `${employe.nom} ${employe.prenom}`;
      // Optionnel : pré-remplir le salaire base depuis l'employé
      if (employe.salaire_base && !this.currentBulletin.salaire_base) {
        this.currentBulletin.salaire_base = employe.salaire_base;
        this.calculerTotal();
      }
    }
  }

  calculerTotal() {
    // Calcul du brut
    const montantHS = (this.currentBulletin.heures_supp || 0) * (this.currentBulletin.taux_horaire || 0);
    const brut = (this.currentBulletin.salaire_base || 0) + (this.currentBulletin.indemnites || 0) + (this.currentBulletin.primes || 0) + montantHS;
    this.currentBulletin.brut = brut;

    // Cotisations (simplifiées : 7% du brut)
    const cotisations = brut * 0.07;
    this.currentBulletin.cotisations = cotisations;

    // Impôts (simplifiés : 10% du brut après cotisations)
    const imposable = brut - cotisations;
    const impots = imposable * 0.10;
    this.currentBulletin.impots = impots;

    const net = brut - cotisations - impots;
    this.currentBulletin.net_a_payer = net;
  }

  saveBulletin() {
    if (!this.currentBulletin.employe_id || !this.currentBulletin.mois) {
      alert('Veuillez sélectionner un employé et un mois');
      return;
    }

    if (this.editMode && this.currentBulletin.id) {
      const index = this.bulletins.findIndex(b => b.id === this.currentBulletin.id);
      if (index !== -1) {
        this.bulletins[index] = { ...this.currentBulletin, updated_at: new Date().toISOString() } as BulletinPaie;
        this.showSuccess('Bulletin modifié');
      }
    } else {
      this.bulletins.push({
        ...this.currentBulletin,
        id: Date.now(),
        created_at: new Date().toISOString()
      } as BulletinPaie);
      this.showSuccess('Bulletin ajouté');
    }
    this.saveBulletins();
    this.filterBulletins();
    this.cancelForm();
  }

  editBulletin(b: BulletinPaie) {
    this.currentBulletin = { ...b };
    this.editMode = true;
    this.showForm = true;
  }

  marquerPaye(b: BulletinPaie) {
    b.statut = 'paye';
    b.date_paiement = new Date().toISOString().split('T')[0];
    this.saveBulletins();
    this.filterBulletins();
    this.showSuccess('Bulletin marqué payé');
  }

  viewDetails(b: BulletinPaie) {
    this.selectedBulletin = b;
    this.showDetailsModal = true;
  }

  confirmDelete(b: BulletinPaie) {
    this.bulletinToDelete = b;
    this.showDeleteModal = true;
  }

  deleteBulletin() {
    if (this.bulletinToDelete) {
      this.bulletins = this.bulletins.filter(b => b.id !== this.bulletinToDelete?.id);
      this.saveBulletins();
      this.filterBulletins();
      this.showDeleteModal = false;
      this.bulletinToDelete = null;
      this.showSuccess('Bulletin supprimé');
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }

  filterBulletins() {
    let filtered = [...this.bulletins];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.reference?.toLowerCase().includes(term) ||
        b.employe_nom?.toLowerCase().includes(term)
      );
    }
    if (this.statutFilter) {
      filtered = filtered.filter(b => b.statut === this.statutFilter);
    }
    if (this.moisFilter) {
      filtered = filtered.filter(b => b.mois === this.moisFilter);
    }
    this.filteredBulletins = filtered;
  }

  getMontantTotal(): number {
    return this.bulletins.reduce((sum, b) => sum + (b.net_a_payer || 0), 0);
  }

  getBulletinsPayes(): number {
    return this.bulletins.filter(b => b.statut === 'paye').length;
  }

  getBulletinsEnAttente(): number {
    return this.bulletins.filter(b => b.statut === 'en_attente').length;
  }

  getStatutLabel(statut: string): string {
    const labels: any = {
      en_attente: '⏳ En attente',
      paye: '✅ Payé',
      annule: '❌ Annulé'
    };
    return labels[statut] || statut;
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}