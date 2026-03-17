import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface CaisseData {
  id: number;
  nom: string;
  solde_initial: number;
  solde_actuel: number;
  devise: string;
  type: 'principale' | 'secondaire' | 'projet';
  responsable?: string;
  notes?: string;
  date_creation?: string;
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
      <div class="header">
        <div>
          <h1>Gestion de caisse</h1>
          <p class="subtitle">{{ caisses.length }} caisse(s) • Solde total: {{ soldeTotal | number }} FCFA</p>
        </div>
        <div class="header-actions">
          <button class="btn-default" (click)="exportMouvements()">📊 Exporter</button>
          <button class="btn-add" (click)="showForm = !showForm">+ Nouvelle caisse</button>
        </div>
      </div>
      
      <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>
      
      <!-- Sélecteur de caisse -->
      <div class="caisse-selector" *ngIf="caisses.length > 0">
        <div class="selector-label">Caisse active:</div>
        <div class="caisse-tabs">
          <button *ngFor="let c of caisses" 
                  class="caisse-tab" 
                  [class.active]="selectedCaisse?.id === c.id"
                  (click)="selectCaisse(c)">
            <span class="caisse-nom">{{ c.nom }}</span>
            <span class="caisse-solde">{{ c.solde_actuel | number }} FCFA</span>
          </button>
        </div>
      </div>
      
      <!-- Formulaire nouvelle caisse -->
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouvelle' }} caisse</h3>
        <form (ngSubmit)="saveCaisse()" #caisseForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Nom *</label>
              <input type="text" [(ngModel)]="newCaisse.nom" name="nom" required>
            </div>
            
            <div class="form-group">
              <label>Type</label>
              <select [(ngModel)]="newCaisse.type" name="type" required>
                <option value="principale">Principale</option>
                <option value="secondaire">Secondaire</option>
                <option value="projet">Projet</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Solde initial</label>
              <input type="number" [(ngModel)]="newCaisse.solde_initial" name="solde_initial" required>
            </div>
            
            <div class="form-group">
              <label>Devise</label>
              <select [(ngModel)]="newCaisse.devise" name="devise">
                <option value="FCFA">FCFA</option>
                <option value="EUR">Euro</option>
                <option value="USD">Dollar</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Responsable</label>
              <input type="text" [(ngModel)]="newCaisse.responsable" name="responsable">
            </div>
            
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea [(ngModel)]="newCaisse.notes" name="notes" rows="3"></textarea>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-save">Enregistrer</button>
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
          </div>
        </form>
      </div>
      
      <!-- Formulaire mouvement -->
      <div class="form-card" *ngIf="selectedCaisse && showMouvementForm">
        <h3>Nouveau mouvement - {{ selectedCaisse.nom }}</h3>
        <form (ngSubmit)="saveMouvement()" #mouvementForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Type *</label>
              <select [(ngModel)]="newMouvement.type" name="type" required (change)="onTypeChange()">
                <option value="entree">➕ Entrée</option>
                <option value="sortie">➖ Sortie</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Catégorie</label>
              <select [(ngModel)]="newMouvement.categorie" name="categorie" required>
                <option value="vente">Vente</option>
                <option value="achat">Achat</option>
                <option value="salaire">Salaire</option>
                <option value="frais">Frais</option>
                <option value="investissement">Investissement</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Montant *</label>
              <input type="number" [(ngModel)]="newMouvement.montant" name="montant" required>
            </div>
            
            <div class="form-group">
              <label>Date *</label>
              <input type="date" [(ngModel)]="newMouvement.date" name="date" required>
            </div>
            
            <div class="form-group">
              <label>Mode de paiement</label>
              <select [(ngModel)]="newMouvement.mode_paiement" name="mode_paiement">
                <option value="especes">Espèces</option>
                <option value="cheque">Chèque</option>
                <option value="virement">Virement</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Référence</label>
              <input type="text" [(ngModel)]="newMouvement.reference" name="reference" placeholder="N° facture, chèque...">
            </div>
            
            <div class="form-group">
              <label>Bénéficiaire</label>
              <input type="text" [(ngModel)]="newMouvement.beneficiaire" name="beneficiaire">
            </div>
            
            <div class="form-group">
              <label>Motif *</label>
              <input type="text" [(ngModel)]="newMouvement.motif" name="motif" required>
            </div>
            
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea [(ngModel)]="newMouvement.notes" name="notes" rows="2"></textarea>
            </div>
            
            <div class="form-group">
              <label>Pièce jointe</label>
              <input type="file" (change)="onFileSelected($event)">
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-save">Enregistrer</button>
            <button type="button" class="btn-cancel" (click)="showMouvementForm = false">Annuler</button>
          </div>
        </form>
      </div>
      
      <!-- KPIs de la caisse sélectionnée -->
      <div class="kpi-grid" *ngIf="selectedCaisse">
        <div class="kpi-card solde">
          <span class="kpi-value">{{ selectedCaisse.solde_actuel | number }} FCFA</span>
          <span class="kpi-label">Solde actuel</span>
        </div>
        <div class="kpi-card entree">
          <span class="kpi-value">{{ totalEntrees | number }} FCFA</span>
          <span class="kpi-label">Total entrées</span>
        </div>
        <div class="kpi-card sortie">
          <span class="kpi-value">{{ totalSorties | number }} FCFA</span>
          <span class="kpi-label">Total sorties</span>
        </div>
        <div class="kpi-card mouvement">
          <span class="kpi-value">{{ mouvements.length }}</span>
          <span class="kpi-label">Mouvements</span>
        </div>
      </div>
      
      <!-- Actions rapides -->
      <div class="quick-actions" *ngIf="selectedCaisse">
        <button class="btn-add" (click)="showMouvementForm = true">➕ Nouvelle entrée/sortie</button>
        <button class="btn-default" (click)="ouvrirVirement()">💸 Virement entre caisses</button>
        <button class="btn-default" (click)="ouvrirCloture()">🔒 Clôture de caisse</button>
        <button class="btn-default" (click)="printRapport()">🖨️ Rapport journalier</button>
      </div>
      
      <!-- Filtres -->
      <div class="filters-bar" *ngIf="selectedCaisse && mouvements.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterMouvements()" placeholder="Rechercher...">
        </div>
        
        <select [(ngModel)]="typeFilter" (ngModelChange)="filterMouvements()" class="filter-select">
          <option value="">Tous types</option>
          <option value="entree">Entrées</option>
          <option value="sortie">Sorties</option>
        </select>
        
        <select [(ngModel)]="categorieFilter" (ngModelChange)="filterMouvements()" class="filter-select">
          <option value="">Toutes catégories</option>
          <option value="vente">Vente</option>
          <option value="achat">Achat</option>
          <option value="salaire">Salaire</option>
          <option value="frais">Frais</option>
        </select>
        
        <input type="date" [(ngModel)]="dateDebut" (ngModelChange)="filterMouvements()" class="date-filter" placeholder="Date début">
        <input type="date" [(ngModel)]="dateFin" (ngModelChange)="filterMouvements()" class="date-filter" placeholder="Date fin">
      </div>
      
      <!-- Liste des mouvements -->
      <div class="mouvements-section" *ngIf="selectedCaisse">
        <div class="section-header">
          <h2>Mouvements</h2>
          <span class="mouvement-count">{{ filteredMouvements.length }} mouvement(s)</span>
        </div>
        
        <div class="mouvements-list" *ngIf="filteredMouvements.length > 0; else noMouvements">
          <div class="mouvement-card" *ngFor="let m of filteredMouvements" [class.entree]="m.type === 'entree'" [class.sortie]="m.type === 'sortie'">
            <div class="mouvement-header">
              <div class="header-left">
                <span class="mouvement-type-badge" [class]="m.type">{{ m.type === 'entree' ? '➕' : '➖' }} {{ getTypeLabel(m.type) }}</span>
                <span class="mouvement-categorie">{{ getCategorieLabel(m.categorie) }}</span>
                <span class="mouvement-valid" *ngIf="m.valide">✅ Validé</span>
                <span class="mouvement-valid" *ngIf="!m.valide">⏳ En attente</span>
              </div>
              <span class="mouvement-montant" [class.entree]="m.type === 'entree'" [class.sortie]="m.type === 'sortie'">
                {{ m.type === 'entree' ? '+' : '-' }}{{ m.montant | number }} FCFA
              </span>
            </div>
            
            <div class="mouvement-body">
              <div class="body-row">
                <span class="label">Date:</span>
                <span class="value">{{ m.date | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="body-row">
                <span class="label">Motif:</span>
                <span class="value">{{ m.motif }}</span>
              </div>
              <div class="body-row" *ngIf="m.reference">
                <span class="label">Référence:</span>
                <span class="value">{{ m.reference }}</span>
              </div>
              <div class="body-row" *ngIf="m.beneficiaire">
                <span class="label">Bénéficiaire:</span>
                <span class="value">{{ m.beneficiaire }}</span>
              </div>
              <div class="body-row" *ngIf="m.notes">
                <span class="label">Notes:</span>
                <span class="value">{{ m.notes }}</span>
              </div>
            </div>
            
            <div class="mouvement-footer">
              <div class="footer-left">
                <span class="mode-paiement">{{ getModePaiementLabel(m.mode_paiement) }}</span>
              </div>
              <div class="footer-actions">
                <button class="btn-icon" (click)="viewMouvement(m)" title="Voir détails">👁️</button>
                <button class="btn-icon" (click)="editMouvement(m)" *ngIf="!m.valide" title="Modifier">✏️</button>
                <button class="btn-icon" (click)="validerMouvement(m)" *ngIf="!m.valide" title="Valider">✅</button>
                <button class="btn-icon" (click)="printMouvement(m)" title="Imprimer">🖨️</button>
                <button class="btn-icon delete" (click)="deleteMouvement(m)" *ngIf="!m.valide" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
        
        <ng-template #noMouvements>
          <div class="empty-mouvements">
            <p>Aucun mouvement pour cette caisse</p>
            <button class="btn-add" (click)="showMouvementForm = true">➕ Ajouter un mouvement</button>
          </div>
        </ng-template>
      </div>
      
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">💰</div>
          <h2>Aucune caisse</h2>
          <p>Créez votre première caisse</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouvelle caisse</button>
        </div>
      </ng-template>
      
      <!-- Modal détails mouvement -->
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Détails du mouvement</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedMouvement">
            <div class="detail-row">
              <strong>Type:</strong> {{ getTypeLabel(selectedMouvement.type) }}
            </div>
            <div class="detail-row">
              <strong>Catégorie:</strong> {{ getCategorieLabel(selectedMouvement.categorie) }}
            </div>
            <div class="detail-row">
              <strong>Montant:</strong> {{ selectedMouvement.montant | number }} FCFA
            </div>
            <div class="detail-row">
              <strong>Date:</strong> {{ selectedMouvement.date | date:'dd/MM/yyyy HH:mm' }}
            </div>
            <div class="detail-row">
              <strong>Motif:</strong> {{ selectedMouvement.motif }}
            </div>
            <div class="detail-row" *ngIf="selectedMouvement.reference">
              <strong>Référence:</strong> {{ selectedMouvement.reference }}
            </div>
            <div class="detail-row" *ngIf="selectedMouvement.beneficiaire">
              <strong>Bénéficiaire:</strong> {{ selectedMouvement.beneficiaire }}
            </div>
            <div class="detail-row">
              <strong>Mode de paiement:</strong> {{ getModePaiementLabel(selectedMouvement.mode_paiement) }}
            </div>
            <div class="detail-row">
              <strong>Statut:</strong> {{ selectedMouvement.valide ? 'Validé' : 'En attente' }}
            </div>
            <div class="detail-row" *ngIf="selectedMouvement.notes">
              <strong>Notes:</strong> {{ selectedMouvement.notes }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal virement -->
      <div class="modal" *ngIf="showVirementModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Virement entre caisses</h3>
            <button class="btn-close" (click)="showVirementModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Caisse source</label>
              <select [(ngModel)]="virement.source_id" class="form-control">
                <option *ngFor="let c of caisses" [value]="c.id">{{ c.nom }} ({{ c.solde_actuel | number }} FCFA)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Caisse destination</label>
              <select [(ngModel)]="virement.dest_id" class="form-control">
                <option *ngFor="let c of caisses" [value]="c.id">{{ c.nom }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Montant</label>
              <input type="number" [(ngModel)]="virement.montant" class="form-control">
            </div>
            <div class="form-group">
              <label>Motif</label>
              <input type="text" [(ngModel)]="virement.motif" class="form-control">
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showVirementModal = false">Annuler</button>
            <button class="btn-save" (click)="effectuerVirement()">✅ Effectuer</button>
          </div>
        </div>
      </div>
      
      <!-- Modal clôture -->
      <div class="modal" *ngIf="showClotureModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Clôture de caisse - {{ selectedCaisse?.nom }}</h3>
            <button class="btn-close" (click)="showClotureModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="cloture-info">
              <p><strong>Solde théorique:</strong> {{ selectedCaisse?.solde_actuel | number }} FCFA</p>
              <p><strong>Date de clôture:</strong> {{ cloture.date | date:'dd/MM/yyyy' }}</p>
            </div>
            
            <div class="form-group">
              <label>Solde réel compté</label>
              <input type="number" [(ngModel)]="cloture.solde_reel" class="form-control">
            </div>
            
            <div class="form-group">
              <label>Observations</label>
              <textarea [(ngModel)]="cloture.observations" rows="3" class="form-control"></textarea>
            </div>
            
            <div class="ecart-info" *ngIf="cloture.solde_reel">
              <strong>Écart:</strong> 
              <span [class.ecart-positif]="getEcart() > 0" [class.ecart-negatif]="getEcart() < 0">
                {{ getEcart() > 0 ? '+' : '' }}{{ getEcart() | number }} FCFA
              </span>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showClotureModal = false">Annuler</button>
            <button class="btn-save" (click)="validerCloture()">✅ Valider clôture</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .caisse-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header-actions { display: flex; gap: 15px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 0; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .btn-default { background: #F59E0B; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .alert-success { background: #10B981; color: white; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
    
    /* Sélecteur de caisse */
    .caisse-selector { display: flex; align-items: center; gap: 15px; margin-bottom: 24px; background: white; padding: 15px; border-radius: 12px; }
    .selector-label { color: #6B7280; }
    .caisse-tabs { display: flex; gap: 10px; flex: 1; }
    .caisse-tab { flex: 1; padding: 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; cursor: pointer; display: flex; justify-content: space-between; }
    .caisse-tab.active { border-color: #EC4899; background: #FDF2F8; }
    .caisse-nom { font-weight: 600; color: #1F2937; }
    .caisse-solde { color: #EC4899; }
    
    /* Formulaire */
    .form-card { background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #FCE7F3; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .full-width { grid-column: span 2; }
    .form-group { display: flex; flex-direction: column; }
    label { margin-bottom: 5px; color: #4B5563; font-weight: 500; }
    input, textarea, select { padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
    
    /* KPIs */
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
    .kpi-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .kpi-card.solde { border-left: 4px solid #EC4899; }
    .kpi-card.entree { border-left: 4px solid #10B981; }
    .kpi-card.sortie { border-left: 4px solid #EF4444; }
    .kpi-card.mouvement { border-left: 4px solid #F59E0B; }
    .kpi-value { display: block; font-size: 20px; font-weight: 700; color: #1F2937; }
    .kpi-label { color: #6B7280; font-size: 13px; }
    
    /* Actions rapides */
    .quick-actions { display: flex; gap: 15px; margin-bottom: 30px; flex-wrap: wrap; }
    
    /* Filtres */
    .filters-bar { display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; background: white; padding: 15px; border-radius: 12px; }
    .search-box { flex: 2; background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; }
    .filter-select { flex: 1; padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    .date-filter { padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; }
    
    /* Section mouvements */
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-header h2 { color: #1F2937; margin: 0; }
    .mouvement-count { color: #6B7280; }
    
    .mouvements-list { display: flex; flex-direction: column; gap: 15px; }
    .mouvement-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .mouvement-card.entree { border-left: 4px solid #10B981; }
    .mouvement-card.sortie { border-left: 4px solid #EF4444; }
    
    .mouvement-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .header-left { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .mouvement-type-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .mouvement-type-badge.entree { background: #D1FAE5; color: #065F46; }
    .mouvement-type-badge.sortie { background: #FEE2E2; color: #991B1B; }
    .mouvement-categorie { font-size: 12px; color: #6B7280; }
    .mouvement-valid { font-size: 12px; color: #10B981; }
    .mouvement-montant { font-size: 18px; font-weight: 700; }
    .mouvement-montant.entree { color: #10B981; }
    .mouvement-montant.sortie { color: #EF4444; }
    
    .mouvement-body { margin-bottom: 15px; }
    .body-row { display: flex; margin: 5px 0; }
    .label { color: #6B7280; width: 100px; }
    .value { color: #1F2937; }
    
    .mouvement-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #FCE7F3; }
    .mode-paiement { font-size: 12px; color: #6B7280; }
    .footer-actions { display: flex; gap: 10px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon:hover { background: #FDF2F8; border-color: #EC4899; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    
    /* Empty states */
    .empty-state, .empty-mouvements { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .empty-mouvements { padding: 40px; }
    
    /* Modal */
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #6B7280; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .detail-row { margin: 10px 0; }
    .ecart-info { margin-top: 20px; padding: 15px; background: #FDF2F8; border-radius: 8px; }
    .ecart-positif { color: #10B981; font-weight: 600; }
    .ecart-negatif { color: #EF4444; font-weight: 600; }
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
    }
  }
  
  loadMouvements() {
    const saved = localStorage.getItem('mouvements_caisse');
    this.mouvements = saved ? JSON.parse(saved) : [];
  }
  
  selectCaisse(c: CaisseData) {
    this.selectedCaisse = c;
    this.filterMouvements();
    this.calculerTotauxCaisse();
  }
  
  getMouvements(caisseId: number): MouvementCaisse[] {
    return this.mouvements.filter(m => m.caisse_id === caisseId);
  }
  
  saveCaisse() {
    if (this.editMode && this.newCaisse.id) {
      const index = this.caisses.findIndex(c => c.id === this.newCaisse.id);
      if (index !== -1) {
        const updatedCaisse = {
          ...this.newCaisse,
          solde_actuel: this.newCaisse.solde_actuel || this.newCaisse.solde_initial || 0
        } as CaisseData;
        this.caisses[index] = updatedCaisse;
        this.showMessage('Caisse modifiée !');
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
      this.showMessage('Caisse créée !');
    }
    
    localStorage.setItem('caisses', JSON.stringify(this.caisses));
    this.calculerSoldeTotal();
    this.cancelForm();
  }
  
  saveMouvement() {
    if (this.selectedCaisse) {
      if (this.editMode && this.newMouvement.id) {
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
          
          this.showMessage('Mouvement modifié !');
        }
      } else {
        const newMouvement: MouvementCaisse = {
          id: Date.now(),
          caisse_id: this.selectedCaisse.id,
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
        this.showMessage('Mouvement ajouté !');
      }
      
      localStorage.setItem('mouvements_caisse', JSON.stringify(this.mouvements));
      localStorage.setItem('caisses', JSON.stringify(this.caisses));
      this.filterMouvements();
      this.calculerTotauxCaisse();
      this.showMouvementForm = false;
      this.editMode = false;
    }
  }
  
  validerMouvement(m: MouvementCaisse) {
    if (this.selectedCaisse) {
      m.valide = true;
      m.date_validation = new Date().toISOString();
      m.valide_par = 'Utilisateur';
      
      if (m.type === 'entree') {
        this.selectedCaisse.solde_actuel += m.montant;
      } else {
        this.selectedCaisse.solde_actuel -= m.montant;
      }
      
      localStorage.setItem('mouvements_caisse', JSON.stringify(this.mouvements));
      localStorage.setItem('caisses', JSON.stringify(this.caisses));
      this.filterMouvements();
      this.calculerTotauxCaisse();
      this.showMessage('Mouvement validé !');
    }
  }
  
  editMouvement(m: MouvementCaisse) {
    this.newMouvement = { ...m };
    this.editMode = true;
    this.showMouvementForm = true;
  }
  
  deleteMouvement(m: MouvementCaisse) {
    if (confirm('Supprimer ce mouvement ?')) {
      this.mouvements = this.mouvements.filter(mov => mov.id !== m.id);
      localStorage.setItem('mouvements_caisse', JSON.stringify(this.mouvements));
      this.filterMouvements();
      this.calculerTotauxCaisse();
      this.showMessage('Mouvement supprimé !');
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
        caisse_id: source.id,
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
        caisse_id: dest.id,
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
      localStorage.setItem('mouvements_caisse', JSON.stringify(this.mouvements));
      localStorage.setItem('caisses', JSON.stringify(this.caisses));
      
      this.showVirementModal = false;
      this.filterMouvements();
      this.calculerTotauxCaisse();
      this.showMessage('Virement effectué !');
    } else {
      alert('Montant invalide ou solde insuffisant');
    }
  }
  
  getEcart(): number {
    if (this.selectedCaisse && this.cloture.solde_reel) {
      return this.cloture.solde_reel - this.selectedCaisse.solde_actuel;
    }
    return 0;
  }
  
  validerCloture() {
    if (this.selectedCaisse) {
      const ecart = this.getEcart();
      const rapport = {
        date: this.cloture.date,
        caisse: this.selectedCaisse.nom,
        solde_theorique: this.selectedCaisse.solde_actuel,
        solde_reel: this.cloture.solde_reel,
        ecart: ecart,
        observations: this.cloture.observations
      };
      
      const clotures = JSON.parse(localStorage.getItem('clotures_caisse') || '[]');
      clotures.push(rapport);
      localStorage.setItem('clotures_caisse', JSON.stringify(clotures));
      
      this.showClotureModal = false;
      this.showMessage('Clôture enregistrée !');
      
      this.cloture = {
        date: new Date(),
        solde_reel: null,
        observations: ''
      };
    }
  }
  
  filterMouvements() {
    // CORRECTION LIGNE 612 : Vérification que selectedCaisse n'est pas null
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
  
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.newMouvement.piece_jointe = file.name;
    }
  }
  
  onTypeChange() {}
  
  ouvrirVirement() {
    this.showVirementModal = true;
  }
  
  ouvrirCloture() {
    this.cloture.date = new Date();
    this.showClotureModal = true;
  }
  
  printRapport() {
    alert('Impression du rapport - Fonctionnalité à venir');
  }
  
  printMouvement(m: MouvementCaisse) {
    alert('Impression du mouvement - Fonctionnalité à venir');
  }
  
  exportMouvements() {
    alert('Export Excel - Fonctionnalité à venir');
  }
  
  cancelForm() {
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
    this.showForm = false;
    this.editMode = false;
  }
  
  getTypeLabel(type: string): string {
    return type === 'entree' ? 'Entrée' : 'Sortie';
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
  }
}
