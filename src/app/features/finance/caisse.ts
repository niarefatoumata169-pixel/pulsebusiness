import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface CaisseData {
  id?: number;
  nom: string;
  solde_initial: number;
  solde_actuel: number;
  devise: string;
  type: 'principale' | 'secondaire' | 'projet';
  responsable?: string;
  notes?: string;
  date_creation?: string;
  couleur?: string;
}

interface MouvementCaisse {
  id?: number;
  caisse_id: number;
  date: string;
  type: 'entree' | 'sortie';
  categorie: 'vente' | 'achat' | 'salaire' | 'frais' | 'investissement' | 'autre';
  montant: number;
  motif: string;
  mode_paiement: 'especes' | 'cheque' | 'virement' | 'mobile_money';
  reference?: string;
  beneficiaire?: string;
  piece_jointe?: string;
  valide: boolean;
  date_validation?: string;
  valide_par?: string;
  notes?: string;
}

@Component({
  selector: 'app-caisse',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="caisse-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>💰 Gestion de caisse</h1>
          <p class="subtitle">{{ caisses.length }} caisse(s) • Solde total: {{ soldeTotal | number }} FCFA</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="caisses.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="caisses.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouvelle caisse</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- Sélecteur de caisse moderne -->
      <div class="caisse-selector" *ngIf="caisses.length > 0">
        <div class="selector-title">
          <span class="title-icon">🏦</span>
          <span>Caisse active</span>
        </div>
        <div class="caisse-cards">
          <div *ngFor="let c of caisses" 
               class="caisse-card" 
               [class.active]="selectedCaisse?.id === c.id"
               (click)="selectCaisse(c)">
            <div class="caisse-icon">{{ getCaisseIcone(c.type) }}</div>
            <div class="caisse-info">
              <div class="caisse-nom">{{ c.nom }}</div>
              <div class="caisse-type">{{ getTypeLabel(c.type) }}</div>
            </div>
            <div class="caisse-solde">
              <span class="solde-value">{{ c.solde_actuel | number }}</span>
              <span class="solde-devise">{{ c.devise }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="selectedCaisse">
        <div class="kpi-card solde">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ selectedCaisse.solde_actuel | number }} <small>{{ selectedCaisse.devise }}</small></span>
            <span class="kpi-label">Solde actuel</span>
          </div>
        </div>
        <div class="kpi-card entree">
          <div class="kpi-icon">📈</div>
          <div class="kpi-content">
            <span class="kpi-value">+ {{ totalEntrees | number }} <small>{{ selectedCaisse.devise }}</small></span>
            <span class="kpi-label">Total entrées</span>
          </div>
        </div>
        <div class="kpi-card sortie">
          <div class="kpi-icon">📉</div>
          <div class="kpi-content">
            <span class="kpi-value">- {{ totalSorties | number }} <small>{{ selectedCaisse.devise }}</small></span>
            <span class="kpi-label">Total sorties</span>
          </div>
        </div>
        <div class="kpi-card mouvement">
          <div class="kpi-icon">🔄</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ filteredMouvements.length }}</span>
            <span class="kpi-label">Mouvements</span>
          </div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="quick-actions" *ngIf="selectedCaisse">
        <button class="action-btn primary" (click)="openMouvementForm()">
          <span class="action-icon">➕</span> Nouveau mouvement
        </button>
        <button class="action-btn secondary" (click)="openVirement()">
          <span class="action-icon">💸</span> Virement
        </button>
        <button class="action-btn secondary" (click)="openCloture()">
          <span class="action-icon">🔒</span> Clôture
        </button>
        <button class="action-btn secondary" (click)="printRapport()">
          <span class="action-icon">🖨️</span> Rapport
        </button>
      </div>

      <!-- Formulaire caisse moderne -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouvelle' }} caisse</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveCaisse()">
              <div class="form-row">
                <div class="form-group">
                  <label>Nom de la caisse *</label>
                  <input type="text" [(ngModel)]="newCaisse.nom" name="nom" required placeholder="Ex: Caisse principale">
                </div>
                <div class="form-group">
                  <label>Type</label>
                  <select [(ngModel)]="newCaisse.type" name="type">
                    <option value="principale">🏦 Principale</option>
                    <option value="secondaire">📁 Secondaire</option>
                    <option value="projet">🚀 Projet</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Solde initial</label>
                  <input type="number" [(ngModel)]="newCaisse.solde_initial" name="solde_initial" placeholder="0">
                </div>
                <div class="form-group">
                  <label>Devise</label>
                  <select [(ngModel)]="newCaisse.devise" name="devise">
                    <option value="FCFA">FCFA</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollar ($)</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Responsable</label>
                <input type="text" [(ngModel)]="newCaisse.responsable" name="responsable" placeholder="Nom du responsable">
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="newCaisse.notes" name="notes" rows="3" placeholder="Informations complémentaires..."></textarea>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="cancelForm()">Annuler</button>
                <button type="submit" class="btn-primary">💾 Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Formulaire mouvement moderne -->
      <div class="modal-overlay" *ngIf="showMouvementForm && selectedCaisse">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMouvementMode ? '✏️ Modifier' : '➕ Nouveau' }} mouvement - {{ selectedCaisse.nom }}</h3>
            <button class="modal-close" (click)="closeMouvementForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveMouvement()">
              <div class="form-row">
                <div class="form-group">
                  <label>Type *</label>
                  <div class="type-toggle">
                    <button type="button" class="toggle-btn" [class.active]="newMouvement.type === 'entree'" (click)="newMouvement.type = 'entree'">
                      ➕ Entrée
                    </button>
                    <button type="button" class="toggle-btn" [class.active]="newMouvement.type === 'sortie'" (click)="newMouvement.type = 'sortie'">
                      ➖ Sortie
                    </button>
                  </div>
                </div>
                <div class="form-group">
                  <label>Catégorie</label>
                  <select [(ngModel)]="newMouvement.categorie" name="categorie">
                    <option value="vente">🛒 Vente</option>
                    <option value="achat">📦 Achat</option>
                    <option value="salaire">👔 Salaire</option>
                    <option value="frais">📋 Frais</option>
                    <option value="investissement">💎 Investissement</option>
                    <option value="autre">📌 Autre</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Montant *</label>
                  <input type="number" [(ngModel)]="newMouvement.montant" name="montant" required placeholder="0">
                </div>
                <div class="form-group">
                  <label>Date *</label>
                  <input type="date" [(ngModel)]="newMouvement.date" name="date" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Mode de paiement</label>
                  <select [(ngModel)]="newMouvement.mode_paiement" name="mode_paiement">
                    <option value="especes">💵 Espèces</option>
                    <option value="cheque">📝 Chèque</option>
                    <option value="virement">🏦 Virement</option>
                    <option value="mobile_money">📱 Mobile Money</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Référence</label>
                  <input type="text" [(ngModel)]="newMouvement.reference" name="reference" placeholder="N° facture, chèque...">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Bénéficiaire</label>
                  <input type="text" [(ngModel)]="newMouvement.beneficiaire" name="beneficiaire" placeholder="Nom du bénéficiaire">
                </div>
                <div class="form-group">
                  <label>Motif *</label>
                  <input type="text" [(ngModel)]="newMouvement.motif" name="motif" required placeholder="Raison du mouvement">
                </div>
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="newMouvement.notes" name="notes" rows="2" placeholder="Informations complémentaires..."></textarea>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeMouvementForm()">Annuler</button>
                <button type="submit" class="btn-primary">💾 Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Filtres modernes -->
      <div class="filters-section" *ngIf="selectedCaisse && filteredMouvements.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterMouvements()" placeholder="Rechercher un mouvement..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="typeFilter" (ngModelChange)="filterMouvements()" class="filter-select">
            <option value="">Tous types</option>
            <option value="entree">📈 Entrées</option>
            <option value="sortie">📉 Sorties</option>
          </select>
          <select [(ngModel)]="categorieFilter" (ngModelChange)="filterMouvements()" class="filter-select">
            <option value="">Toutes catégories</option>
            <option value="vente">🛒 Vente</option>
            <option value="achat">📦 Achat</option>
            <option value="salaire">👔 Salaire</option>
            <option value="frais">📋 Frais</option>
          </select>
        </div>
      </div>

      <!-- Liste des mouvements moderne -->
      <div class="mouvements-section" *ngIf="selectedCaisse">
        <div class="section-header">
          <h2>📋 Historique des mouvements</h2>
          <div class="header-stats">
            <span class="stat-badge entree">+ {{ totalEntrees | number }} FCFA</span>
            <span class="stat-badge sortie">- {{ totalSorties | number }} FCFA</span>
          </div>
        </div>
        
        <div class="mouvements-list" *ngIf="filteredMouvements.length > 0; else noMouvements">
          <div class="mouvement-card" *ngFor="let m of filteredMouvements" [class]="m.type">
            <div class="card-left">
              <div class="mouvement-icon" [class]="m.type">
                {{ m.type === 'entree' ? '📈' : '📉' }}
              </div>
              <div class="mouvement-info">
                <div class="mouvement-motif">{{ m.motif }}</div>
                <div class="mouvement-details">
                  <span class="detail-badge">{{ getCategorieLabel(m.categorie) }}</span>
                  <span class="detail-badge payment">{{ getModePaiementLabel(m.mode_paiement) }}</span>
                  <span class="detail-date">{{ m.date | date:'dd/MM/yyyy' }}</span>
                  <span *ngIf="m.reference" class="detail-ref">Réf: {{ m.reference }}</span>
                </div>
              </div>
            </div>
            <div class="card-right">
              <div class="mouvement-montant" [class]="m.type">
                {{ m.type === 'entree' ? '+' : '-' }}{{ m.montant | number }} FCFA
              </div>
              <div class="mouvement-status">
                <span class="status-badge" [class.valid]="m.valide" [class.pending]="!m.valide">
                  {{ m.valide ? '✅ Validé' : '⏳ En attente' }}
                </span>
              </div>
              <div class="mouvement-actions">
                <button class="action-icon" (click)="viewMouvement(m)" title="Voir">👁️</button>
                <button class="action-icon" (click)="editMouvement(m)" *ngIf="!m.valide" title="Modifier">✏️</button>
                <button class="action-icon" (click)="validerMouvement(m)" *ngIf="!m.valide" title="Valider">✅</button>
                <button class="action-icon delete" (click)="deleteMouvement(m)" *ngIf="!m.valide" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
        
        <ng-template #noMouvements>
          <div class="empty-mouvements">
            <div class="empty-icon">📭</div>
            <h3>Aucun mouvement</h3>
            <p>Commencez par enregistrer une entrée ou une sortie</p>
            <button class="btn-primary" (click)="openMouvementForm()">+ Premier mouvement</button>
          </div>
        </ng-template>
      </div>

      <!-- État vide initial -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">💰</div>
          <h2>Bienvenue dans la gestion de caisse</h2>
          <p>Créez votre première caisse pour commencer à gérer vos flux financiers</p>
          <button class="btn-primary" (click)="openForm()">+ Créer une caisse</button>
        </div>
      </ng-template>

      <!-- Modal Détails mouvement -->
      <div class="modal-overlay" *ngIf="showDetailsModal">
        <div class="modal-container">
          <div class="modal-header">
            <h3>📄 Détails du mouvement</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedMouvement">
            <div class="detail-card">
              <div class="detail-row">
                <span class="detail-label">Type</span>
                <span class="detail-value" [class]="selectedMouvement.type">
                  {{ selectedMouvement.type === 'entree' ? '➕ Entrée' : '➖ Sortie' }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Catégorie</span>
                <span class="detail-value">{{ getCategorieLabel(selectedMouvement.categorie) }}</span>
              </div>
              <div class="detail-row highlight">
                <span class="detail-label">Montant</span>
                <span class="detail-value montant" [class]="selectedMouvement.type">
                  {{ selectedMouvement.type === 'entree' ? '+' : '-' }}{{ selectedMouvement.montant | number }} FCFA
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">{{ selectedMouvement.date | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Motif</span>
                <span class="detail-value">{{ selectedMouvement.motif }}</span>
              </div>
              <div class="detail-row" *ngIf="selectedMouvement.reference">
                <span class="detail-label">Référence</span>
                <span class="detail-value">{{ selectedMouvement.reference }}</span>
              </div>
              <div class="detail-row" *ngIf="selectedMouvement.beneficiaire">
                <span class="detail-label">Bénéficiaire</span>
                <span class="detail-value">{{ selectedMouvement.beneficiaire }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Mode paiement</span>
                <span class="detail-value">{{ getModePaiementLabel(selectedMouvement.mode_paiement) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Statut</span>
                <span class="detail-value status-badge" [class.valid]="selectedMouvement.valide">
                  {{ selectedMouvement.valide ? 'Validé' : 'En attente' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Virement -->
      <div class="modal-overlay" *ngIf="showVirementModal">
        <div class="modal-container">
          <div class="modal-header">
            <h3>💸 Virement entre caisses</h3>
            <button class="modal-close" (click)="showVirementModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Caisse source</label>
              <select [(ngModel)]="virement.source_id" class="form-control">
                <option [value]="null">Sélectionner</option>
                <option *ngFor="let c of caisses" [value]="c.id">{{ c.nom }} ({{ c.solde_actuel | number }} FCFA)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Caisse destination</label>
              <select [(ngModel)]="virement.dest_id" class="form-control">
                <option [value]="null">Sélectionner</option>
                <option *ngFor="let c of caisses" [value]="c.id">{{ c.nom }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Montant</label>
              <input type="number" [(ngModel)]="virement.montant" class="form-control" placeholder="0">
            </div>
            <div class="form-group">
              <label>Motif</label>
              <input type="text" [(ngModel)]="virement.motif" class="form-control" placeholder="Raison du virement">
            </div>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showVirementModal = false">Annuler</button>
              <button class="btn-primary" (click)="effectuerVirement()">✅ Effectuer le virement</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Clôture -->
      <div class="modal-overlay" *ngIf="showClotureModal">
        <div class="modal-container">
          <div class="modal-header">
            <h3>🔒 Clôture de caisse</h3>
            <button class="modal-close" (click)="showClotureModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="cloture-info">
              <div class="info-row">
                <span class="info-label">📅 Date de clôture</span>
                <span class="info-value">{{ cloture.date | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-row highlight">
                <span class="info-label">💰 Solde théorique</span>
                <span class="info-value">{{ selectedCaisse?.solde_actuel | number }} FCFA</span>
              </div>
            </div>
            <div class="form-group">
              <label>Solde réel compté</label>
              <input type="number" [(ngModel)]="cloture.solde_reel" class="form-control" placeholder="0">
            </div>
            <div class="form-group">
              <label>Observations</label>
              <textarea [(ngModel)]="cloture.observations" rows="3" class="form-control" placeholder="Éventuels écarts, remarques..."></textarea>
            </div>
            <div class="ecart-warning" *ngIf="cloture.solde_reel !== null && cloture.solde_reel !== selectedCaisse?.solde_actuel">
              <span class="warning-icon">⚠️</span>
              <span>Écart de {{ getEcart() | number }} FCFA ({{ getEcartPourcent() }}%)</span>
            </div>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showClotureModal = false">Annuler</button>
              <button class="btn-primary" (click)="validerCloture()">✅ Valider la clôture</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .caisse-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    .header-actions { display: flex; gap: 12px; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-add:hover, .btn-primary:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
    .btn-excel { background: #10B981; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-pdf { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .alert-success { background: #10B981; color: white; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    
    .caisse-selector { background: white; border-radius: 16px; padding: 20px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .selector-title { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; color: #6B7280; font-weight: 500; }
    .caisse-cards { display: flex; gap: 16px; flex-wrap: wrap; }
    .caisse-card { display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: #F9FAFB; border-radius: 12px; cursor: pointer; transition: all 0.2s; flex: 1; min-width: 200px; border: 2px solid transparent; }
    .caisse-card:hover { background: #FEF3F9; transform: translateY(-2px); }
    .caisse-card.active { border-color: #EC4899; background: #FEF3F9; }
    .caisse-icon { font-size: 32px; }
    .caisse-info { flex: 1; }
    .caisse-nom { font-weight: 600; color: #1F2937; }
    .caisse-type { font-size: 12px; color: #9CA3AF; }
    .caisse-solde { text-align: right; }
    .solde-value { font-weight: 700; font-size: 18px; color: #EC4899; }
    .solde-devise { font-size: 12px; color: #6B7280; }
    
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
    .kpi-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.2s; }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .kpi-icon { font-size: 32px; }
    .kpi-content { flex: 1; }
    .kpi-value { display: block; font-size: 24px; font-weight: 700; color: #1F2937; }
    .kpi-value small { font-size: 12px; font-weight: 400; color: #6B7280; }
    .kpi-label { font-size: 13px; color: #6B7280; }
    .kpi-card.solde .kpi-value { color: #EC4899; }
    .kpi-card.entree .kpi-value { color: #10B981; }
    .kpi-card.sortie .kpi-value { color: #EF4444; }
    
    .quick-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
    .action-btn { display: flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; border: none; }
    .action-btn.primary { background: #EC4899; color: white; }
    .action-btn.primary:hover { background: #DB2777; transform: translateY(-1px); }
    .action-btn.secondary { background: white; border: 1px solid #FCE7F3; color: #4B5563; }
    .action-btn.secondary:hover { background: #FEF3F9; border-color: #EC4899; color: #EC4899; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 600px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
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
    .type-toggle { display: flex; gap: 10px; }
    .toggle-btn { flex: 1; padding: 10px; border: 2px solid #F3F4F6; background: white; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
    .toggle-btn.active { background: #EC4899; color: white; border-color: #EC4899; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 1; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    
    .mouvements-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; color: #1F2937; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .stat-badge.entree { background: #DCFCE7; color: #16A34A; }
    .stat-badge.sortie { background: #FEE2E2; color: #EF4444; }
    
    .mouvements-list { display: flex; flex-direction: column; gap: 12px; }
    .mouvement-card { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #F9FAFB; border-radius: 12px; transition: all 0.2s; border-left: 4px solid transparent; }
    .mouvement-card.entree { border-left-color: #10B981; }
    .mouvement-card.sortie { border-left-color: #EF4444; }
    .mouvement-card:hover { background: #FEF3F9; transform: translateX(4px); }
    .card-left { display: flex; gap: 16px; align-items: center; flex: 1; }
    .mouvement-icon { font-size: 32px; }
    .mouvement-motif { font-weight: 600; color: #1F2937; margin-bottom: 6px; }
    .mouvement-details { display: flex; gap: 8px; flex-wrap: wrap; }
    .detail-badge { font-size: 11px; padding: 2px 8px; background: #E5E7EB; border-radius: 20px; color: #4B5563; }
    .detail-badge.payment { background: #FEF3C7; color: #D97706; }
    .detail-date { font-size: 12px; color: #9CA3AF; }
    .detail-ref { font-size: 11px; color: #6B7280; font-family: monospace; }
    .card-right { text-align: right; }
    .mouvement-montant { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
    .mouvement-montant.entree { color: #10B981; }
    .mouvement-montant.sortie { color: #EF4444; }
    .status-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .status-badge.valid { background: #DCFCE7; color: #16A34A; }
    .status-badge.pending { background: #FEF3C7; color: #D97706; }
    .mouvement-actions { display: flex; gap: 6px; margin-top: 8px; justify-content: flex-end; }
    .action-icon { background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: all 0.2s; font-size: 14px; }
    .action-icon:hover { background: #FCE7F3; }
    .action-icon.delete:hover { background: #FEE2E2; color: #EF4444; }
    
    .empty-state, .empty-mouvements { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .empty-mouvements { padding: 40px; margin-top: 20px; }
    
    .detail-card { background: #F9FAFB; border-radius: 12px; padding: 20px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #F3F4F6; }
    .detail-row:last-child { border-bottom: none; }
    .detail-row.highlight { background: #FEF3F9; margin: 0 -20px; padding: 12px 20px; border-radius: 8px; }
    .detail-label { font-weight: 500; color: #6B7280; }
    .detail-value { font-weight: 500; color: #1F2937; }
    .detail-value.montant.entree { color: #10B981; font-size: 18px; }
    .detail-value.montant.sortie { color: #EF4444; font-size: 18px; }
    
    .cloture-info { background: #F9FAFB; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .info-row.highlight { font-weight: 600; color: #EC4899; }
    .ecart-warning { margin-top: 16px; padding: 12px; background: #FEF3C7; border-radius: 10px; display: flex; align-items: center; gap: 10px; color: #D97706; }
    
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; gap: 12px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .caisse-cards { flex-direction: column; }
      .mouvement-card { flex-direction: column; align-items: flex-start; gap: 12px; }
      .card-right { text-align: left; width: 100%; }
      .mouvement-actions { justify-content: flex-start; }
      .filter-group { flex-direction: column; }
    }
  `]
})
export class Caisse implements OnInit {
  caisses: CaisseData[] = [];
  mouvements: MouvementCaisse[] = [];
  filteredMouvements: MouvementCaisse[] = [];
  selectedCaisse: CaisseData | null = null;
  selectedMouvement: MouvementCaisse | null = null;
  
  newCaisse: Partial<CaisseData> = {
    nom: '',
    type: 'principale',
    solde_initial: 0,
    solde_actuel: 0,
    devise: 'FCFA',
    responsable: '',
    notes: '',
    date_creation: new Date().toISOString().split('T')[0]
  };
  
  newMouvement: Partial<MouvementCaisse> = {
    type: 'entree',
    categorie: 'vente',
    date: new Date().toISOString().split('T')[0],
    montant: 0,
    motif: '',
    mode_paiement: 'especes',
    valide: false
  };
  
  virement: any = {
    source_id: null,
    dest_id: null,
    montant: 0,
    motif: ''
  };
  
  cloture: any = {
    date: new Date(),
    solde_reel: null,
    observations: ''
  };
  
  searchTerm = '';
  typeFilter = '';
  categorieFilter = '';
  dateDebut = '';
  dateFin = '';
  showForm = false;
  showMouvementForm = false;
  editMode = false;
  editMouvementMode = false;
  showDetailsModal = false;
  showVirementModal = false;
  showClotureModal = false;
  successMessage = '';
  
  soldeTotal = 0;
  totalEntrees = 0;
  totalSorties = 0;
  
  ngOnInit() {
    this.loadCaisses();
    this.loadMouvements();
  }
  
  loadCaisses() {
    const saved = localStorage.getItem('caisses');
    this.caisses = saved ? JSON.parse(saved) : [];
    this.calculerSoldeTotal();
    if (this.caisses.length > 0 && !this.selectedCaisse) {
      this.selectedCaisse = this.caisses[0];
      this.filterMouvements();
      this.calculerTotauxCaisse();
    }
  }
  
  loadMouvements() {
    const saved = localStorage.getItem('mouvements_caisse');
    this.mouvements = saved ? JSON.parse(saved) : [];
    if (this.selectedCaisse) {
      this.filterMouvements();
      this.calculerTotauxCaisse();
    }
  }
  
  saveCaisses() {
    localStorage.setItem('caisses', JSON.stringify(this.caisses));
  }
  
  saveMouvements() {
    localStorage.setItem('mouvements_caisse', JSON.stringify(this.mouvements));
  }
  
  selectCaisse(c: CaisseData) {
    this.selectedCaisse = c;
    this.filterMouvements();
    this.calculerTotauxCaisse();
  }
  
  openForm() {
    this.newCaisse = {
      nom: '',
      type: 'principale',
      solde_initial: 0,
      solde_actuel: 0,
      devise: 'FCFA',
      responsable: '',
      notes: '',
      date_creation: new Date().toISOString().split('T')[0]
    };
    this.editMode = false;
    this.showForm = true;
  }
  
  openMouvementForm() {
    this.newMouvement = {
      type: 'entree',
      categorie: 'vente',
      date: new Date().toISOString().split('T')[0],
      montant: 0,
      motif: '',
      mode_paiement: 'especes',
      valide: false
    };
    this.editMouvementMode = false;
    this.showMouvementForm = true;
  }
  
  closeMouvementForm() {
    this.showMouvementForm = false;
    this.editMouvementMode = false;
  }
  
  saveCaisse() {
    if (this.editMode && this.newCaisse.id) {
      const index = this.caisses.findIndex(c => c.id === this.newCaisse.id);
      if (index !== -1) {
        const updatedCaisse = {
          ...this.newCaisse,
          solde_actuel: this.newCaisse.solde_actuel !== undefined ? this.newCaisse.solde_actuel : (this.newCaisse.solde_initial || 0)
        } as CaisseData;
        this.caisses[index] = updatedCaisse;
        this.showMessage('Caisse modifiée');
      }
    } else {
      const newCaisse: CaisseData = {
        id: Date.now(),
        nom: this.newCaisse.nom || '',
        type: this.newCaisse.type as 'principale' | 'secondaire' | 'projet' || 'principale',
        solde_initial: this.newCaisse.solde_initial || 0,
        solde_actuel: this.newCaisse.solde_initial || 0,
        devise: this.newCaisse.devise || 'FCFA',
        responsable: this.newCaisse.responsable,
        notes: this.newCaisse.notes,
        date_creation: this.newCaisse.date_creation
      };
      this.caisses.push(newCaisse);
      this.showMessage('Caisse créée');
    }
    
    this.saveCaisses();
    this.calculerSoldeTotal();
    this.cancelForm();
  }
  
  saveMouvement() {
    if (!this.selectedCaisse) return;
    
    if (this.editMouvementMode && this.newMouvement.id) {
      const index = this.mouvements.findIndex(m => m.id === this.newMouvement.id);
      if (index !== -1) {
        const oldMouvement = this.mouvements[index];
        this.mouvements[index] = this.newMouvement as MouvementCaisse;
        
        if (oldMouvement.valide) {
          if (oldMouvement.type === 'entree') {
            this.selectedCaisse.solde_actuel -= oldMouvement.montant;
          } else {
            this.selectedCaisse.solde_actuel += oldMouvement.montant;
          }
        }
        this.showMessage('Mouvement modifié');
      }
    } else {
      const newMouvement: MouvementCaisse = {
        id: Date.now(),
        caisse_id: this.selectedCaisse.id!,
        type: this.newMouvement.type as 'entree' | 'sortie' || 'entree',
        categorie: this.newMouvement.categorie as 'vente' | 'achat' | 'salaire' | 'frais' | 'investissement' | 'autre' || 'autre',
        date: this.newMouvement.date || new Date().toISOString().split('T')[0],
        montant: this.newMouvement.montant || 0,
        motif: this.newMouvement.motif || '',
        mode_paiement: this.newMouvement.mode_paiement as 'especes' | 'cheque' | 'virement' | 'mobile_money' || 'especes',
        reference: this.newMouvement.reference,
        beneficiaire: this.newMouvement.beneficiaire,
        valide: false,
        notes: this.newMouvement.notes
      };
      this.mouvements.push(newMouvement);
      this.showMessage('Mouvement ajouté');
    }
    
    this.saveMouvements();
    this.saveCaisses();
    this.filterMouvements();
    this.calculerTotauxCaisse();
    this.closeMouvementForm();
  }
  
  validerMouvement(m: MouvementCaisse) {
    if (!this.selectedCaisse) return;
    
    m.valide = true;
    m.date_validation = new Date().toISOString();
    m.valide_par = 'Utilisateur';
    
    if (m.type === 'entree') {
      this.selectedCaisse.solde_actuel += m.montant;
    } else {
      this.selectedCaisse.solde_actuel -= m.montant;
    }
    
    this.saveMouvements();
    this.saveCaisses();
    this.filterMouvements();
    this.calculerTotauxCaisse();
    this.showMessage('Mouvement validé');
  }
  
  editMouvement(m: MouvementCaisse) {
    this.newMouvement = { ...m };
    this.editMouvementMode = true;
    this.showMouvementForm = true;
  }
  
  deleteMouvement(m: MouvementCaisse) {
    if (confirm('Supprimer ce mouvement ?')) {
      this.mouvements = this.mouvements.filter(mov => mov.id !== m.id);
      this.saveMouvements();
      this.filterMouvements();
      this.calculerTotauxCaisse();
      this.showMessage('Mouvement supprimé');
    }
  }
  
  viewMouvement(m: MouvementCaisse) {
    this.selectedMouvement = m;
    this.showDetailsModal = true;
  }
  
  effectuerVirement() {
    const source = this.caisses.find(c => c.id === this.virement.source_id);
    const dest = this.caisses.find(c => c.id === this.virement.dest_id);
    
    if (source && dest && this.virement.montant > 0 && source.solde_actuel >= this.virement.montant) {
      const mouvementSortie: MouvementCaisse = {
        id: Date.now(),
        caisse_id: source.id!,
        type: 'sortie',
        categorie: 'autre',
        date: new Date().toISOString().split('T')[0],
        montant: this.virement.montant,
        motif: this.virement.motif || 'Virement vers ' + dest.nom,
        mode_paiement: 'virement',
        reference: 'VIR-' + Date.now(),
        valide: true,
        date_validation: new Date().toISOString(),
        valide_par: 'Utilisateur'
      };
      
      const mouvementEntree: MouvementCaisse = {
        id: Date.now() + 1,
        caisse_id: dest.id!,
        type: 'entree',
        categorie: 'autre',
        date: new Date().toISOString().split('T')[0],
        montant: this.virement.montant,
        motif: this.virement.motif || 'Virement de ' + source.nom,
        mode_paiement: 'virement',
        reference: 'VIR-' + Date.now(),
        valide: true,
        date_validation: new Date().toISOString(),
        valide_par: 'Utilisateur'
      };
      
      source.solde_actuel -= this.virement.montant;
      dest.solde_actuel += this.virement.montant;
      
      this.mouvements.push(mouvementSortie, mouvementEntree);
      this.saveMouvements();
      this.saveCaisses();
      
      this.showVirementModal = false;
      this.filterMouvements();
      this.calculerTotauxCaisse();
      this.showMessage('Virement effectué');
    } else {
      alert('Montant invalide ou solde insuffisant');
    }
  }
  
  validerCloture() {
    if (this.selectedCaisse) {
      const rapport = {
        date: this.cloture.date,
        caisse: this.selectedCaisse.nom,
        solde_theorique: this.selectedCaisse.solde_actuel,
        solde_reel: this.cloture.solde_reel,
        observations: this.cloture.observations
      };
      
      const clotures = JSON.parse(localStorage.getItem('clotures_caisse') || '[]');
      clotures.push(rapport);
      localStorage.setItem('clotures_caisse', JSON.stringify(clotures));
      
      this.showClotureModal = false;
      this.showMessage('Clôture enregistrée');
      
      this.cloture = {
        date: new Date(),
        solde_reel: null,
        observations: ''
      };
    }
  }
  
  openVirement() {
    this.virement = {
      source_id: this.selectedCaisse?.id || null,
      dest_id: null,
      montant: 0,
      motif: ''
    };
    this.showVirementModal = true;
  }
  
  openCloture() {
    this.cloture.date = new Date();
    this.showClotureModal = true;
  }
  
  filterMouvements() {
    let filtered = this.selectedCaisse 
      ? this.mouvements.filter(m => m.caisse_id === this.selectedCaisse?.id)
      : [];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.motif?.toLowerCase().includes(term) ||
        m.reference?.toLowerCase().includes(term) ||
        m.beneficiaire?.toLowerCase().includes(term)
      );
    }
    
    if (this.typeFilter) {
      filtered = filtered.filter(m => m.type === this.typeFilter);
    }
    
    if (this.categorieFilter) {
      filtered = filtered.filter(m => m.categorie === this.categorieFilter);
    }
    
    if (this.dateDebut) {
      filtered = filtered.filter(m => m.date >= this.dateDebut);
    }
    
    if (this.dateFin) {
      filtered = filtered.filter(m => m.date <= this.dateFin);
    }
    
    this.filteredMouvements = filtered;
  }
  
  calculerTotauxCaisse() {
    if (this.selectedCaisse) {
      const mouvementsCaisse = this.mouvements.filter(m => m.caisse_id === this.selectedCaisse?.id && m.valide);
      this.totalEntrees = mouvementsCaisse
        .filter(m => m.type === 'entree')
        .reduce((sum, m) => sum + m.montant, 0);
      this.totalSorties = mouvementsCaisse
        .filter(m => m.type === 'sortie')
        .reduce((sum, m) => sum + m.montant, 0);
    }
  }
  
  calculerSoldeTotal() {
    this.soldeTotal = this.caisses.reduce((sum, c) => sum + (c.solde_actuel || 0), 0);
  }
  
  getEcart(): number {
    if (this.selectedCaisse && this.cloture.solde_reel !== null) {
      return this.cloture.solde_reel - this.selectedCaisse.solde_actuel;
    }
    return 0;
  }
  
  getEcartPourcent(): string {
    if (this.selectedCaisse && this.selectedCaisse.solde_actuel > 0) {
      const ecart = this.getEcart();
      return ((ecart / this.selectedCaisse.solde_actuel) * 100).toFixed(1);
    }
    return '0';
  }
  
  getCaisseIcone(type: string): string {
    switch(type) {
      case 'principale': return '🏦';
      case 'secondaire': return '📁';
      case 'projet': return '🚀';
      default: return '💰';
    }
  }
  
  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }
  
    exportToExcel() {
    if (!this.filteredMouvements || this.filteredMouvements.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredMouvements[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const lignes = this.filteredMouvements.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ""));
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
    if (!this.filteredMouvements || this.filteredMouvements.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredMouvements[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join("")}</tr>\n</thead>\n<tbody>${this.filteredMouvements.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : "-"}</td>`).join("")}</tr>`).join("")}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert("Veuillez autoriser les pop-ups pour exporter en PDF"); }
  }
  
  printRapport() {
    alert('Impression du rapport - Fonctionnalité à venir');
  }
  
  getTypeLabel(type: string): string {
    const labels: any = { principale: 'Principale', secondaire: 'Secondaire', projet: 'Projet' };
    return labels[type] || type;
  }
  
  getCategorieLabel(categorie: string): string {
    const labels: any = {
      vente: 'Vente',
      achat: 'Achat',
      salaire: 'Salaire',
      frais: 'Frais',
      investissement: 'Investissement',
      autre: 'Autre'
    };
    return labels[categorie] || categorie;
  }
  
  getModePaiementLabel(mode: string): string {
    const labels: any = {
      especes: 'Espèces',
      cheque: 'Chèque',
      virement: 'Virement',
      mobile_money: 'Mobile Money'
    };
    return labels[mode] || mode;
  }
  
  showMessage(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = "", 3000);
  }

}