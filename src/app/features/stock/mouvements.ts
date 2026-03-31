import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface MouvementStock {
  id?: number;
  reference: string;
  type: 'entree' | 'sortie' | 'transfert' | 'ajustement';
  motif: string;
  
  // Article concerné
  article_id?: number;
  article_reference?: string;
  article_nom?: string;
  article_unite?: string;
  
  // Quantités
  quantite: number;
  quantite_avant?: number;
  quantite_apres?: number;
  
  // Prix
  prix_unitaire?: number;
  prix_total?: number;
  
  // Emplacements (pour transfert)
  emplacement_origine?: string;
  emplacement_destination?: string;
  
  // Documents
  document_type?: 'bon_commande' | 'bon_livraison' | 'facture' | 'inventaire';
  document_reference?: string;
  
  // Dates
  date_mouvement: string;
  date_creation: string;
  
  // Personnel
  realise_par?: string;
  valide_par?: string;
  
  // Statut
  statut: 'brouillon' | 'valide' | 'annule';
  
  // Commentaire
  commentaire?: string;
}

@Component({
  selector: 'app-mouvements',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="mouvements-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>📊 Mouvements de stock</h1>
          <p class="subtitle">
            {{ mouvements.length }} mouvement(s) •
            <span class="entree-count">{{ getTotalEntrees() | number }} FCFA en entrée</span> •
            <span class="sortie-count">{{ getTotalSorties() | number }} FCFA en sortie</span>
          </p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="mouvements.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="mouvements.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouveau mouvement</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>

      <!-- Formulaire -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouveau' }} mouvement</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveMouvement()">
              <div class="form-row">
                <div class="form-group">
                  <label>Référence</label>
                  <input type="text" [(ngModel)]="currentMouvement.reference" name="reference" readonly class="readonly">
                </div>
                <div class="form-group">
                  <label>Type de mouvement *</label>
                  <div class="type-toggle">
                    <button type="button" class="toggle-btn" [class.active]="currentMouvement.type === 'entree'" (click)="currentMouvement.type = 'entree'">
                      📥 Entrée
                    </button>
                    <button type="button" class="toggle-btn" [class.active]="currentMouvement.type === 'sortie'" (click)="currentMouvement.type = 'sortie'">
                      📤 Sortie
                    </button>
                    <button type="button" class="toggle-btn" [class.active]="currentMouvement.type === 'transfert'" (click)="currentMouvement.type = 'transfert'">
                      🔄 Transfert
                    </button>
                    <button type="button" class="toggle-btn" [class.active]="currentMouvement.type === 'ajustement'" (click)="currentMouvement.type = 'ajustement'">
                      ⚖️ Ajustement
                    </button>
                  </div>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Article *</label>
                  <select [(ngModel)]="currentMouvement.article_id" name="article_id" required (change)="onArticleChange()">
                    <option [value]="null">Sélectionner un article</option>
                    <option *ngFor="let a of articles" [value]="a.id">
                      {{ a.reference }} - {{ a.nom }} (Stock: {{ a.stock_actuel }} {{ a.unite }})
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Quantité *</label>
                  <input type="number" [(ngModel)]="currentMouvement.quantite" name="quantite" min="0.001" step="0.001" required (input)="calculerTotal()">
                </div>
              </div>
              <div class="form-row" *ngIf="currentMouvement.type === 'entree' || currentMouvement.type === 'sortie'">
                <div class="form-group">
                  <label>Prix unitaire (FCFA)</label>
                  <input type="number" [(ngModel)]="currentMouvement.prix_unitaire" name="prix_unitaire" min="0" (input)="calculerTotal()">
                </div>
                <div class="form-group highlight">
                  <label>Prix total (FCFA)</label>
                  <input type="text" [value]="(currentMouvement.prix_total || 0) | number" readonly class="readonly highlight-input">
                </div>
              </div>
              <div class="form-row" *ngIf="currentMouvement.type === 'transfert'">
                <div class="form-group">
                  <label>Emplacement origine</label>
                  <input type="text" [(ngModel)]="currentMouvement.emplacement_origine" name="emplacement_origine">
                </div>
                <div class="form-group">
                  <label>Emplacement destination</label>
                  <input type="text" [(ngModel)]="currentMouvement.emplacement_destination" name="emplacement_destination">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Motif *</label>
                  <select [(ngModel)]="currentMouvement.motif" name="motif" required>
                    <option value="">Sélectionner</option>
                    <option *ngFor="let m of getMotifs()" [value]="m">{{ m }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Statut</label>
                  <select [(ngModel)]="currentMouvement.statut" name="statut">
                    <option value="brouillon">📝 Brouillon</option>
                    <option value="valide">✅ Validé</option>
                    <option value="annule">❌ Annulé</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Document associé</label>
                  <select [(ngModel)]="currentMouvement.document_type" name="document_type">
                    <option [value]="null">Aucun</option>
                    <option value="bon_commande">Bon de commande</option>
                    <option value="bon_livraison">Bon de livraison</option>
                    <option value="facture">Facture</option>
                    <option value="inventaire">Inventaire</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Réf. document</label>
                  <input type="text" [(ngModel)]="currentMouvement.document_reference" name="document_reference">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Date du mouvement *</label>
                  <input type="datetime-local" [(ngModel)]="currentMouvement.date_mouvement" name="date_mouvement" required>
                </div>
              </div>
              <div class="form-group">
                <label>Commentaire</label>
                <textarea [(ngModel)]="currentMouvement.commentaire" name="commentaire" rows="3"></textarea>
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
      <div class="filters-section" *ngIf="mouvements.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterMouvements()" placeholder="Rechercher..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="typeFilter" (ngModelChange)="filterMouvements()" class="filter-select">
            <option value="">Tous types</option>
            <option value="entree">📥 Entrées</option>
            <option value="sortie">📤 Sorties</option>
            <option value="transfert">🔄 Transferts</option>
            <option value="ajustement">⚖️ Ajustements</option>
          </select>
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterMouvements()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="brouillon">📝 Brouillon</option>
            <option value="valide">✅ Validé</option>
            <option value="annule">❌ Annulé</option>
          </select>
        </div>
      </div>

      <!-- Liste des mouvements -->
      <div class="mouvements-section" *ngIf="mouvements.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Historique des mouvements</h2>
          <div class="header-stats">
            <span class="stat-badge entree">+ {{ getTotalEntrees() | number }} FCFA</span>
            <span class="stat-badge sortie">- {{ getTotalSorties() | number }} FCFA</span>
          </div>
        </div>
        
        <div class="mouvements-list">
          <div class="mouvement-card" *ngFor="let m of filteredMouvements" [class]="m.type" [class.annule]="m.statut === 'annule'">
            <div class="card-header">
              <div class="header-left">
                <div class="mouvement-icon">{{ getTypeIcon(m.type) }}</div>
                <div class="mouvement-info">
                  <div class="mouvement-ref">{{ m.reference }}</div>
                  <div class="mouvement-article">{{ m.article_nom }} ({{ m.article_reference }})</div>
                  <div class="mouvement-details">
                    <span class="detail-date">{{ m.date_mouvement | date:'dd/MM/yyyy HH:mm' }}</span>
                    <span class="detail-motif">{{ m.motif }}</span>
                  </div>
                </div>
              </div>
              <div class="header-right">
                <div class="mouvement-quantite" [class]="m.type">
                  {{ m.type === 'entree' ? '+' : m.type === 'sortie' ? '-' : '' }}{{ m.quantite }} {{ m.article_unite }}
                </div>
                <div class="mouvement-montant" *ngIf="m.prix_total">
                  {{ (m.prix_total || 0) | number }} FCFA
                </div>
                <div class="mouvement-statut">
                  <span class="statut-badge" [class]="m.statut">
                    {{ m.statut === 'brouillon' ? '📝 Brouillon' : m.statut === 'valide' ? '✅ Validé' : '❌ Annulé' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="card-body" *ngIf="m.commentaire">
              <div class="commentaire">
                📝 {{ m.commentaire }}
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="viewDetails(m)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="editMouvement(m)" *ngIf="m.statut !== 'valide'" title="Modifier">✏️</button>
                <button class="action-icon" (click)="validerMouvement(m)" *ngIf="m.statut === 'brouillon'" title="Valider">✅</button>
                <button class="action-icon delete" (click)="confirmDelete(m)" *ngIf="m.statut !== 'valide'" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📊</div>
          <h2>Aucun mouvement</h2>
          <p>Enregistrez les entrées et sorties de stock</p>
          <button class="btn-primary" (click)="openForm()">+ Nouveau mouvement</button>
        </div>
      </ng-template>

      <!-- Modal Détails -->
      <div class="modal-overlay" *ngIf="showDetailsModal">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>Mouvement {{ selectedMouvement?.reference }}</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedMouvement">
            <div class="details-grid">
              <div class="detail-section">
                <h4>📋 Informations générales</h4>
                <p><strong>Référence:</strong> {{ selectedMouvement.reference }}</p>
                <p><strong>Type:</strong> {{ getTypeLabel(selectedMouvement.type) }}</p>
                <p><strong>Motif:</strong> {{ selectedMouvement.motif }}</p>
                <p><strong>Statut:</strong> {{ getStatutLabel(selectedMouvement.statut) }}</p>
                <p><strong>Date mouvement:</strong> {{ selectedMouvement.date_mouvement | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
              <div class="detail-section">
                <h4>📦 Article</h4>
                <p><strong>Référence:</strong> {{ selectedMouvement.article_reference }}</p>
                <p><strong>Nom:</strong> {{ selectedMouvement.article_nom }}</p>
                <p><strong>Unité:</strong> {{ selectedMouvement.article_unite }}</p>
              </div>
              <div class="detail-section">
                <h4>📊 Quantités</h4>
                <p><strong>Quantité:</strong> {{ selectedMouvement.quantite }} {{ selectedMouvement.article_unite }}</p>
                <p *ngIf="selectedMouvement.quantite_avant"><strong>Avant:</strong> {{ selectedMouvement.quantite_avant }} {{ selectedMouvement.article_unite }}</p>
                <p *ngIf="selectedMouvement.quantite_apres"><strong>Après:</strong> {{ selectedMouvement.quantite_apres }} {{ selectedMouvement.article_unite }}</p>
              </div>
              <div class="detail-section">
                <h4>💰 Valeurs</h4>
                <p><strong>Prix unitaire:</strong> {{ (selectedMouvement.prix_unitaire || 0) | number }} FCFA</p>
                <p><strong>Prix total:</strong> {{ (selectedMouvement.prix_total || 0) | number }} FCFA</p>
              </div>
              <div class="detail-section full-width" *ngIf="selectedMouvement.commentaire">
                <h4>📝 Commentaire</h4>
                <p>{{ selectedMouvement.commentaire }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Suppression -->
      <div class="modal-overlay" *ngIf="showDeleteModal">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>🗑️ Confirmer la suppression</h3>
            <button class="modal-close" (click)="showDeleteModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p>Supprimer le mouvement <strong>{{ mouvementToDelete?.reference }}</strong> ?</p>
            <div class="alert-warning" *ngIf="mouvementToDelete?.statut === 'valide'">
              ⚠️ Attention: Ce mouvement est validé. La suppression va annuler l'effet sur le stock.
            </div>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteMouvement()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mouvements-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    .entree-count { color: #10B981; font-weight: 600; }
    .sortie-count { color: #EF4444; font-weight: 600; }
    .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-add:hover, .btn-primary:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
    .btn-excel { background: #10B981; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-pdf { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .alert-success { background: #10B981; color: white; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 700px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
    .modal-container.large { max-width: 900px; }
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
    .highlight-input { background: #FEF3F9; color: #EC4899; font-weight: 600; }
    .type-toggle { display: flex; gap: 8px; flex-wrap: wrap; }
    .toggle-btn { flex: 1; padding: 10px; border: 2px solid #F3F4F6; background: white; border-radius: 10px; cursor: pointer; transition: all 0.2s; font-size: 12px; }
    .toggle-btn.active { background: #EC4899; color: white; border-color: #EC4899; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-danger { background: #EF4444; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .alert-warning { background: #FEF3C7; color: #D97706; padding: 12px; border-radius: 8px; margin-top: 15px; }
    
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 2; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    
    .mouvements-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .stat-badge.entree { background: #DCFCE7; color: #16A34A; }
    .stat-badge.sortie { background: #FEE2E2; color: #EF4444; }
    
    .mouvements-list { display: flex; flex-direction: column; gap: 12px; }
    .mouvement-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .mouvement-card.entree { border-left-color: #10B981; }
    .mouvement-card.sortie { border-left-color: #EF4444; }
    .mouvement-card.transfert { border-left-color: #3B82F6; }
    .mouvement-card.ajustement { border-left-color: #F59E0B; }
    .mouvement-card.annule { opacity: 0.6; background: #F3F4F6; }
    .mouvement-card:hover { transform: translateX(4px); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; flex: 1; }
    .mouvement-icon { font-size: 28px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .mouvement-ref { font-weight: 600; color: #1F2937; font-family: monospace; font-size: 13px; }
    .mouvement-article { font-size: 14px; color: #4B5563; margin: 4px 0; }
    .mouvement-details { display: flex; gap: 12px; font-size: 11px; color: #9CA3AF; flex-wrap: wrap; }
    .header-right { text-align: right; }
    .mouvement-quantite { font-size: 18px; font-weight: 700; }
    .mouvement-quantite.entree { color: #10B981; }
    .mouvement-quantite.sortie { color: #EF4444; }
    .mouvement-montant { font-size: 13px; color: #6B7280; margin-top: 4px; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; display: inline-block; }
    .statut-badge.brouillon { background: #F3F4F6; color: #6B7280; }
    .statut-badge.valide { background: #DCFCE7; color: #16A34A; }
    .statut-badge.annule { background: #FEE2E2; color: #EF4444; }
    .card-body { margin-top: 12px; padding-top: 12px; border-top: 1px solid #F3F4F6; }
    .commentaire { font-size: 12px; color: #6B7280; font-style: italic; }
    .card-footer { display: flex; justify-content: flex-end; margin-top: 12px; padding-top: 12px; border-top: 1px solid #F3F4F6; }
    .footer-actions { display: flex; gap: 8px; }
    .action-icon { background: none; border: 1px solid #FCE7F3; border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: all 0.2s; font-size: 14px; }
    .action-icon:hover { background: #FEF3F9; border-color: #EC4899; }
    .action-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    
    .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .detail-section { margin-bottom: 16px; }
    .detail-section h4 { color: #EC4899; margin: 0 0 12px 0; font-size: 16px; }
    .detail-section p { margin: 8px 0; font-size: 14px; color: #4B5563; }
    .detail-section.full-width { grid-column: span 2; }
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; gap: 12px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .details-grid { grid-template-columns: 1fr; }
      .detail-section.full-width { grid-column: span 1; }
      .card-header { flex-direction: column; }
      .header-right { text-align: left; }
    }
  `]
})
export class Mouvements implements OnInit {
  mouvements: MouvementStock[] = [];
  filteredMouvements: MouvementStock[] = [];
  selectedMouvement: MouvementStock | null = null;
  
  articles: any[] = [];
  
  currentMouvement: Partial<MouvementStock> = {
    reference: '',
    type: 'entree',
    motif: '',
    quantite: 0,
    date_mouvement: new Date().toISOString().slice(0, 16),
    date_creation: new Date().toISOString(),
    statut: 'brouillon'
  };
  
  searchTerm = '';
  typeFilter = '';
  statutFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  mouvementToDelete: MouvementStock | null = null;
  successMessage = '';
  
  ngOnInit() {
    this.loadArticles();
    this.loadMouvements();
  }
  
  openForm() {
    this.currentMouvement = {
      reference: this.generateReference(),
      type: 'entree',
      motif: '',
      quantite: 0,
      date_mouvement: new Date().toISOString().slice(0, 16),
      date_creation: new Date().toISOString(),
      statut: 'brouillon'
    };
    this.editMode = false;
    this.showForm = true;
  }
  
  generateReference(): string {
    const count = this.mouvements.length + 1;
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `MV-${year}${month}-${String(count).padStart(4, '0')}`;
  }
  
  loadArticles() {
    const saved = localStorage.getItem('articles');
    this.articles = saved ? JSON.parse(saved) : [];
  }
  
  loadMouvements() {
    const saved = localStorage.getItem('mouvements_stock');
    this.mouvements = saved ? JSON.parse(saved) : [];
    this.filteredMouvements = [...this.mouvements];
  }
  
  saveMouvements() {
    localStorage.setItem('mouvements_stock', JSON.stringify(this.mouvements));
  }
  
  getMotifs(): string[] {
    switch(this.currentMouvement.type) {
      case 'entree':
        return ['Achat', 'Retour client', 'Production', 'Don', 'Inventaire positif', 'Autre'];
      case 'sortie':
        return ['Vente', 'Utilisation interne', 'Perte', 'Casse', 'Don', 'Inventaire négatif', 'Autre'];
      case 'transfert':
        return ['Transfert entre sites', 'Réapprovisionnement', 'Mouvement interne', 'Autre'];
      case 'ajustement':
        return ['Correction stock', 'Réévaluation', 'Perte', 'Gain', 'Autre'];
      default:
        return [];
    }
  }
  
  getTypeIcon(type: string): string {
    const icons: any = { entree: '📥', sortie: '📤', transfert: '🔄', ajustement: '⚖️' };
    return icons[type] || '📊';
  }
  
  getTypeLabel(type: string): string {
    const labels: any = { entree: '📥 Entrée', sortie: '📤 Sortie', transfert: '🔄 Transfert', ajustement: '⚖️ Ajustement' };
    return labels[type] || type;
  }
  
  getStatutLabel(statut: string): string {
    const labels: any = { brouillon: '📝 Brouillon', valide: '✅ Validé', annule: '❌ Annulé' };
    return labels[statut] || statut;
  }
  
  getTotalEntrees(): number {
    return this.mouvements
      .filter(m => m.type === 'entree' && m.statut === 'valide')
      .reduce((sum, m) => sum + (m.prix_total || 0), 0);
  }
  
  getTotalSorties(): number {
    return this.mouvements
      .filter(m => m.type === 'sortie' && m.statut === 'valide')
      .reduce((sum, m) => sum + (m.prix_total || 0), 0);
  }
  
  onArticleChange() {
    const article = this.articles.find(a => a.id === this.currentMouvement.article_id);
    if (article) {
      this.currentMouvement.article_reference = article.reference;
      this.currentMouvement.article_nom = article.nom;
      this.currentMouvement.article_unite = article.unite;
      this.currentMouvement.quantite_avant = article.stock_actuel;
      
      if (this.currentMouvement.type === 'entree' && !this.currentMouvement.prix_unitaire) {
        this.currentMouvement.prix_unitaire = article.prix_achat_ht;
        this.calculerTotal();
      }
      if (this.currentMouvement.type === 'sortie' && !this.currentMouvement.prix_unitaire) {
        this.currentMouvement.prix_unitaire = article.prix_vente_ht;
        this.calculerTotal();
      }
    }
  }
  
  calculerTotal() {
    if (this.currentMouvement.quantite && this.currentMouvement.prix_unitaire) {
      this.currentMouvement.prix_total = this.currentMouvement.quantite * this.currentMouvement.prix_unitaire;
    }
  }
  
  saveMouvement() {
    if (!this.currentMouvement.article_id) {
      this.showSuccess('Veuillez sélectionner un article');
      return;
    }
    const article = this.articles.find(a => a.id === this.currentMouvement.article_id);
if (article) {
  let nouveauStock = article.stock_actuel;
  switch(this.currentMouvement.type) {
    case 'entree':
      nouveauStock = article.stock_actuel + (this.currentMouvement.quantite || 0);
      break;
    case 'sortie':
      nouveauStock = article.stock_actuel - (this.currentMouvement.quantite || 0);
      break;
    case 'transfert':
    case 'ajustement':
      nouveauStock = this.currentMouvement.quantite || 0;
      break;
  }
  this.currentMouvement.quantite_apres = nouveauStock;
}
    
    if (this.editMode && this.currentMouvement.id) {
      const index = this.mouvements.findIndex(m => m.id === this.currentMouvement.id);
      if (index !== -1) {
        this.mouvements[index] = { ...this.currentMouvement } as MouvementStock;
        this.showSuccess('Mouvement modifié');
      }
    } else {
      const newMouvement = { ...this.currentMouvement, id: Date.now() } as MouvementStock;
      this.mouvements.push(newMouvement);
      this.showSuccess('Mouvement ajouté');
      
      if (newMouvement.statut === 'valide') {
        this.mettreAJourStock(newMouvement);
      }
    }
    
    this.saveMouvements();
    this.filterMouvements();
    this.cancelForm();
  }
  
  mettreAJourStock(mouvement: MouvementStock) {
    const article = this.articles.find(a => a.id === mouvement.article_id);
    if (article) {
      switch(mouvement.type) {
        case 'entree':
          article.stock_actuel += mouvement.quantite;
          break;
        case 'sortie':
          article.stock_actuel -= mouvement.quantite;
          break;
        case 'transfert':
        case 'ajustement':
          article.stock_actuel = mouvement.quantite;
          break;
      }
      if (article.stock_actuel <= article.stock_minimum) {
        article.statut = article.stock_actuel === 0 ? 'rupture' : 'actif';
      }
      localStorage.setItem('articles', JSON.stringify(this.articles));
    }
  }
  
  validerMouvement(m: MouvementStock) {
    m.statut = 'valide';
    m.date_creation = new Date().toISOString();
    this.mettreAJourStock(m);
    this.saveMouvements();
    this.filterMouvements();
    this.showSuccess('Mouvement validé');
  }
  
  editMouvement(m: MouvementStock) {
    this.currentMouvement = { ...m };
    // Correction : vérifier si date_mouvement existe avant d'utiliser slice
    this.currentMouvement.date_mouvement = m.date_mouvement ? m.date_mouvement.slice(0, 16) : new Date().toISOString().slice(0, 16);
    this.editMode = true;
    this.showForm = true;
  }
  
  viewDetails(m: MouvementStock) {
    this.selectedMouvement = m;
    this.showDetailsModal = true;
  }
  
  confirmDelete(m: MouvementStock) {
    this.mouvementToDelete = m;
    this.showDeleteModal = true;
  }
  
  deleteMouvement() {
    if (this.mouvementToDelete) {
      this.mouvements = this.mouvements.filter(m => m.id !== this.mouvementToDelete?.id);
      this.saveMouvements();
      this.filterMouvements();
      this.showDeleteModal = false;
      this.mouvementToDelete = null;
      this.showSuccess('Mouvement supprimé');
    }
  }
  
  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }
  
  filterMouvements() {
    let filtered = this.mouvements;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.reference?.toLowerCase().includes(term) ||
        m.article_nom?.toLowerCase().includes(term) ||
        m.motif?.toLowerCase().includes(term)
      );
    }
    
    if (this.typeFilter) {
      filtered = filtered.filter(m => m.type === this.typeFilter);
    }
    
    if (this.statutFilter) {
      filtered = filtered.filter(m => m.statut === this.statutFilter);
    }
    
    this.filteredMouvements = filtered;
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
  
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}