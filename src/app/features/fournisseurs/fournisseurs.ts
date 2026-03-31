import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Fournisseur {
  id?: number;
  code: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville?: string;
  pays?: string;
  categorie: string;
  note: number;
  totalAchats: number;
  performance: number;
  statut: 'actif' | 'inactif';
  contact_nom?: string;
  contact_telephone?: string;
  siret?: string;
  site_web?: string;
  notes?: string;
  date_creation: string;
}

@Component({
  selector: 'app-fournisseurs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="fournisseurs-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>🏭 Gestion des fournisseurs</h1>
          <p class="subtitle">{{ fournisseurs.length }} fournisseur(s) • {{ getActifsCount() }} actif(s)</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="fournisseurs.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="fournisseurs.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouveau fournisseur</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="fournisseurs.length > 0">
        <div class="kpi-card total">
          <div class="kpi-icon">🏭</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ fournisseurs.length }}</span>
            <span class="kpi-label">Fournisseurs</span>
          </div>
        </div>
        <div class="kpi-card rating">
          <div class="kpi-icon">⭐</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getNoteMoyenne() | number:'1.1-1' }}/5</span>
            <span class="kpi-label">Note moyenne</span>
          </div>
        </div>
        <div class="kpi-card achats">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getTotalAchats() | number }} <small>FCFA</small></span>
            <span class="kpi-label">Achats totaux</span>
          </div>
        </div>
        <div class="kpi-card performance">
          <div class="kpi-icon">📊</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getPerformanceMoyenne() | number:'1.0-0' }}%</span>
            <span class="kpi-label">Performance moyenne</span>
          </div>
        </div>
      </div>

      <!-- Formulaire moderne -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouveau' }} fournisseur</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveFournisseur()">
              <div class="form-row">
                <div class="form-group">
                  <label>Code *</label>
                  <input type="text" [(ngModel)]="currentFournisseur.code" name="code" required readonly class="readonly">
                </div>
                <div class="form-group">
                  <label>Nom *</label>
                  <input type="text" [(ngModel)]="currentFournisseur.nom" name="nom" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" [(ngModel)]="currentFournisseur.email" name="email">
                </div>
                <div class="form-group">
                  <label>Téléphone</label>
                  <input type="tel" [(ngModel)]="currentFournisseur.telephone" name="telephone">
                </div>
              </div>
              <div class="form-group">
                <label>Adresse</label>
                <textarea [(ngModel)]="currentFournisseur.adresse" name="adresse" rows="2"></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Ville</label>
                  <input type="text" [(ngModel)]="currentFournisseur.ville" name="ville">
                </div>
                <div class="form-group">
                  <label>Pays</label>
                  <input type="text" [(ngModel)]="currentFournisseur.pays" name="pays">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Catégorie</label>
                  <select [(ngModel)]="currentFournisseur.categorie" name="categorie">
                    <option value="materiel">🔧 Matériel</option>
                    <option value="service">💼 Services</option>
                    <option value="matiere">📦 Matières premières</option>
                    <option value="emballage">📦 Emballages</option>
                    <option value="transport">🚛 Transport</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Note (1-5)</label>
                  <input type="number" [(ngModel)]="currentFournisseur.note" name="note" min="1" max="5" step="0.5">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Performance (%)</label>
                  <input type="number" [(ngModel)]="currentFournisseur.performance" name="performance" min="0" max="100">
                </div>
                <div class="form-group">
                  <label>Statut</label>
                  <select [(ngModel)]="currentFournisseur.statut" name="statut">
                    <option value="actif">✅ Actif</option>
                    <option value="inactif">⏸️ Inactif</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Contact principal</label>
                  <input type="text" [(ngModel)]="currentFournisseur.contact_nom" name="contact_nom">
                </div>
                <div class="form-group">
                  <label>Tél. contact</label>
                  <input type="tel" [(ngModel)]="currentFournisseur.contact_telephone" name="contact_telephone">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>SIRET</label>
                  <input type="text" [(ngModel)]="currentFournisseur.siret" name="siret">
                </div>
                <div class="form-group">
                  <label>Site web</label>
                  <input type="url" [(ngModel)]="currentFournisseur.site_web" name="site_web">
                </div>
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="currentFournisseur.notes" name="notes" rows="3"></textarea>
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
      <div class="filters-section" *ngIf="fournisseurs.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterFournisseurs()" placeholder="Rechercher par nom, code..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="categorieFilter" (ngModelChange)="filterFournisseurs()" class="filter-select">
            <option value="">Toutes catégories</option>
            <option value="materiel">🔧 Matériel</option>
            <option value="service">💼 Services</option>
            <option value="matiere">📦 Matières premières</option>
            <option value="emballage">📦 Emballages</option>
            <option value="transport">🚛 Transport</option>
          </select>
          <select [(ngModel)]="noteFilter" (ngModelChange)="filterFournisseurs()" class="filter-select">
            <option value="">Toutes notes</option>
            <option value="5">⭐ 5 étoiles</option>
            <option value="4">⭐ 4+ étoiles</option>
            <option value="3">⭐ 3+ étoiles</option>
          </select>
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterFournisseurs()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="actif">✅ Actifs</option>
            <option value="inactif">⏸️ Inactifs</option>
          </select>
        </div>
      </div>

      <!-- Liste des fournisseurs améliorée -->
      <div class="fournisseurs-section" *ngIf="fournisseurs.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Liste des fournisseurs</h2>
          <div class="header-stats">
            <span class="stat-badge total">{{ fournisseurs.length }} fournisseurs</span>
            <span class="stat-badge actif">{{ getActifsCount() }} actifs</span>
          </div>
        </div>
        
        <div class="fournisseurs-grid">
          <div class="fournisseur-card" *ngFor="let f of filteredFournisseurs" [class]="f.statut">
            <div class="card-header">
              <div class="header-left">
                <div class="fournisseur-avatar">
                  <span class="avatar-icon">🏭</span>
                </div>
                <div class="fournisseur-info">
                  <h3>{{ f.nom }}</h3>
                  <div class="fournisseur-code">{{ f.code }}</div>
                  <div class="rating">
                    <span *ngFor="let s of [1,2,3,4,5]" class="star" [class.active]="s <= (f.note || 0)">★</span>
                    <span class="rating-value">{{ f.note }}/5</span>
                  </div>
                </div>
              </div>
              <div class="header-right">
                <span class="statut-badge" [class]="f.statut">{{ f.statut === 'actif' ? '✅ Actif' : '⏸️ Inactif' }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">📧 Email</span>
                <span class="info-value">{{ f.email || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📞 Téléphone</span>
                <span class="info-value">{{ f.telephone || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📍 Localisation</span>
                <span class="info-value">{{ f.ville || f.adresse || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📦 Catégorie</span>
                <span class="info-value category-badge">{{ getCategorieLabel(f.categorie) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">💰 Achats totaux</span>
                <span class="info-value">{{ (f.totalAchats || 0) | number }} FCFA</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="performance-bar">
                <div class="performance-fill" [style.width.%]="f.performance || 0"></div>
              </div>
              <div class="performance-label">Performance: {{ f.performance || 0 }}%</div>
              <div class="footer-actions">
                <button class="action-icon" (click)="viewDetails(f)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="editFournisseur(f)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="viewAchats(f)" title="Historique achats">📊</button>
                <button class="action-icon delete" (click)="confirmDelete(f)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🏭</div>
          <h2>Aucun fournisseur</h2>
          <p>Ajoutez votre premier fournisseur</p>
          <button class="btn-primary" (click)="openForm()">+ Nouveau fournisseur</button>
        </div>
      </ng-template>

      <!-- Modal Détails -->
      <div class="modal-overlay" *ngIf="showDetailsModal">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ selectedFournisseur?.nom }}</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedFournisseur">
            <div class="details-grid">
              <div class="detail-section">
                <h4>📋 Informations générales</h4>
                <p><strong>Code:</strong> {{ selectedFournisseur.code }}</p>
                <p><strong>Nom:</strong> {{ selectedFournisseur.nom }}</p>
                <p><strong>Catégorie:</strong> {{ getCategorieLabel(selectedFournisseur.categorie) }}</p>
                <p><strong>Note:</strong> {{ selectedFournisseur.note }}/5</p>
                <p><strong>Performance:</strong> {{ selectedFournisseur.performance }}%</p>
                <p><strong>Statut:</strong> {{ selectedFournisseur.statut === 'actif' ? '✅ Actif' : '⏸️ Inactif' }}</p>
              </div>
              <div class="detail-section">
                <h4>📍 Coordonnées</h4>
                <p><strong>Adresse:</strong> {{ selectedFournisseur.adresse || '-' }}</p>
                <p><strong>Ville:</strong> {{ selectedFournisseur.ville || '-' }}</p>
                <p><strong>Pays:</strong> {{ selectedFournisseur.pays || '-' }}</p>
                <p><strong>Téléphone:</strong> {{ selectedFournisseur.telephone || '-' }}</p>
                <p><strong>Email:</strong> {{ selectedFournisseur.email || '-' }}</p>
                <p><strong>Site web:</strong> {{ selectedFournisseur.site_web || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>👤 Contact</h4>
                <p><strong>Contact principal:</strong> {{ selectedFournisseur.contact_nom || '-' }}</p>
                <p><strong>Téléphone:</strong> {{ selectedFournisseur.contact_telephone || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>📊 Achats</h4>
                <p><strong>Total achats:</strong> {{ (selectedFournisseur.totalAchats || 0) | number }} FCFA</p>
              </div>
              <div class="detail-section full-width" *ngIf="selectedFournisseur.notes">
                <h4>📝 Notes</h4>
                <p>{{ selectedFournisseur.notes }}</p>
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
            <p>Supprimer le fournisseur <strong>{{ fournisseurToDelete?.nom }}</strong> ?</p>
            <div class="alert-warning" *ngIf="fournisseurToDelete?.totalAchats && fournisseurToDelete.totalAchats > 0">
              ⚠️ Ce fournisseur a {{ fournisseurToDelete.totalAchats | number }} FCFA d'achats associés.
            </div>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteFournisseur()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .fournisseurs-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
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
    .kpi-card.rating .kpi-value { color: #F59E0B; }
    .kpi-card.achats .kpi-value { color: #10B981; }
    .kpi-card.performance .kpi-value { color: #3B82F6; }
    
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
    
    .fournisseurs-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .stat-badge.total { background: #FEF3F9; color: #EC4899; }
    .stat-badge.actif { background: #DCFCE7; color: #16A34A; }
    
    .fournisseurs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .fournisseur-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .fournisseur-card.actif { border-left-color: #10B981; }
    .fournisseur-card.inactif { border-left-color: #9CA3AF; opacity: 0.7; }
    .fournisseur-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; flex: 1; }
    .fournisseur-avatar { width: 48px; height: 48px; background: linear-gradient(135deg, #EC4899, #831843); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .avatar-icon { font-size: 24px; }
    .fournisseur-info h3 { margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #1F2937; }
    .fournisseur-code { font-size: 11px; color: #9CA3AF; font-family: monospace; margin-bottom: 4px; }
    .rating { display: flex; align-items: center; gap: 2px; }
    .star { color: #E5E7EB; font-size: 12px; }
    .star.active { color: #F59E0B; }
    .rating-value { font-size: 11px; color: #6B7280; margin-left: 6px; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.actif { background: #DCFCE7; color: #16A34A; }
    .statut-badge.inactif { background: #F3F4F6; color: #6B7280; }
    .card-body { margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .info-label { color: #6B7280; }
    .info-value { font-weight: 500; color: #1F2937; }
    .category-badge { background: #FEF3F9; padding: 2px 8px; border-radius: 20px; color: #EC4899; font-size: 11px; }
    .card-footer { margin-top: 16px; padding-top: 16px; border-top: 1px solid #F3F4F6; }
    .performance-bar { height: 6px; background: #F3F4F6; border-radius: 3px; overflow: hidden; }
    .performance-fill { height: 100%; background: linear-gradient(90deg, #10B981, #34D399); border-radius: 3px; transition: width 0.3s; }
    .performance-label { font-size: 11px; color: #6B7280; margin: 8px 0 12px; text-align: right; }
    .footer-actions { display: flex; justify-content: flex-end; gap: 8px; }
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
      .fournisseurs-grid { grid-template-columns: 1fr; }
      .filter-group { flex-direction: column; }
    }
  `]
})
export class Fournisseurs implements OnInit {
  fournisseurs: Fournisseur[] = [];
  filteredFournisseurs: Fournisseur[] = [];
  selectedFournisseur: Fournisseur | null = null;
  
  currentFournisseur: Partial<Fournisseur> = {
    code: '',
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    categorie: 'materiel',
    note: 3,
    totalAchats: 0,
    performance: 0,
    statut: 'actif',
    date_creation: new Date().toISOString().split('T')[0]
  };
  
  searchTerm = '';
  categorieFilter = '';
  noteFilter = '';
  statutFilter = '';
  showForm = false;
  editMode = false;
  showDetailsModal = false;
  showDeleteModal = false;
  fournisseurToDelete: Fournisseur | null = null;
  successMessage = '';
  
  ngOnInit() {
    this.loadFournisseurs();
  }
  
  openForm() {
    this.currentFournisseur = {
      code: this.generateCode(),
      nom: '',
      email: '',
      telephone: '',
      adresse: '',
      categorie: 'materiel',
      note: 3,
      totalAchats: 0,
      performance: 0,
      statut: 'actif',
      date_creation: new Date().toISOString().split('T')[0]
    };
    this.editMode = false;
    this.showForm = true;
  }
  
  generateCode(): string {
    const count = this.fournisseurs.length + 1;
    return `FRS-${String(count).padStart(4, '0')}`;
  }
  
  loadFournisseurs() {
    const saved = localStorage.getItem('fournisseurs');
    if (saved) {
      this.fournisseurs = JSON.parse(saved);
    } else {
      // Données par défaut
      this.fournisseurs = [
        { id: 1, code: 'FRS-0001', nom: 'Matériaux Plus', email: 'contact@materiauxplus.ci', telephone: '+225 07 08 09 10', adresse: 'Abidjan, Côte d\'Ivoire', ville: 'Abidjan', pays: 'Côte d\'Ivoire', categorie: 'materiel', note: 4.5, totalAchats: 12500000, performance: 92, statut: 'actif', date_creation: '2024-01-15' },
        { id: 2, code: 'FRS-0002', nom: 'Services Pro', email: 'info@servicespro.com', telephone: '+225 05 06 07 08', adresse: 'Yamoussoukro, Côte d\'Ivoire', ville: 'Yamoussoukro', pays: 'Côte d\'Ivoire', categorie: 'service', note: 4.8, totalAchats: 8400000, performance: 88, statut: 'actif', date_creation: '2024-02-20' }
      ];
    }
    this.filteredFournisseurs = [...this.fournisseurs];
  }
  
  saveFournisseurs() {
    localStorage.setItem('fournisseurs', JSON.stringify(this.fournisseurs));
  }
  
  getActifsCount(): number {
    return this.fournisseurs.filter(f => f.statut === 'actif').length;
  }
  
  getNoteMoyenne(): number {
    if (this.fournisseurs.length === 0) return 0;
    const total = this.fournisseurs.reduce((sum, f) => sum + (f.note || 0), 0);
    return total / this.fournisseurs.length;
  }
  
  getTotalAchats(): number {
    return this.fournisseurs.reduce((sum, f) => sum + (f.totalAchats || 0), 0);
  }
  
  getPerformanceMoyenne(): number {
    if (this.fournisseurs.length === 0) return 0;
    const total = this.fournisseurs.reduce((sum, f) => sum + (f.performance || 0), 0);
    return total / this.fournisseurs.length;
  }
  
  getCategorieLabel(categorie: string): string {
    const labels: any = {
      materiel: '🔧 Matériel',
      service: '💼 Services',
      matiere: '📦 Matières premières',
      emballage: '📦 Emballages',
      transport: '🚛 Transport'
    };
    return labels[categorie] || categorie;
  }
  
  saveFournisseur() {
    if (this.editMode && this.currentFournisseur.id) {
      const index = this.fournisseurs.findIndex(f => f.id === this.currentFournisseur.id);
      if (index !== -1) {
        this.fournisseurs[index] = { ...this.currentFournisseur } as Fournisseur;
        this.showSuccess('Fournisseur modifié');
      }
    } else {
      const newFournisseur = { ...this.currentFournisseur, id: Date.now() } as Fournisseur;
      this.fournisseurs.push(newFournisseur);
      this.showSuccess('Fournisseur ajouté');
    }
    this.saveFournisseurs();
    this.filterFournisseurs();
    this.cancelForm();
  }
  
  editFournisseur(f: Fournisseur) {
    this.currentFournisseur = { ...f };
    this.editMode = true;
    this.showForm = true;
  }
  
  viewDetails(f: Fournisseur) {
    this.selectedFournisseur = f;
    this.showDetailsModal = true;
  }
  
  viewAchats(f: Fournisseur) {
    console.log('Achats du fournisseur:', f);
    alert(`Historique des achats pour ${f.nom}\nTotal: ${(f.totalAchats || 0).toLocaleString()} FCFA`);
  }
  
  confirmDelete(f: Fournisseur) {
    this.fournisseurToDelete = f;
    this.showDeleteModal = true;
  }
  
  deleteFournisseur() {
    if (this.fournisseurToDelete) {
      this.fournisseurs = this.fournisseurs.filter(f => f.id !== this.fournisseurToDelete?.id);
      this.saveFournisseurs();
      this.filterFournisseurs();
      this.showDeleteModal = false;
      this.fournisseurToDelete = null;
      this.showSuccess('Fournisseur supprimé');
    }
  }
  
  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }
  
  filterFournisseurs() {
    let filtered = this.fournisseurs;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(f => 
        f.nom?.toLowerCase().includes(term) ||
        f.code?.toLowerCase().includes(term) ||
        f.email?.toLowerCase().includes(term)
      );
    }
    
    if (this.categorieFilter) {
      filtered = filtered.filter(f => f.categorie === this.categorieFilter);
    }
    
    if (this.noteFilter) {
      const minNote = parseInt(this.noteFilter);
      filtered = filtered.filter(f => (f.note || 0) >= minNote);
    }
    
    if (this.statutFilter) {
      filtered = filtered.filter(f => f.statut === this.statutFilter);
    }
    
    this.filteredFournisseurs = filtered;
  }
  
    exportToExcel() {
    if (!this.filteredFournisseurs || this.filteredFournisseurs.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.;
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const lignes = this.filteredFournisseurs.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ""));
    const csvContent = [colonnes, ...lignes]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, )}"`).join(","))
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
    if (!this.filteredFournisseurs || this.filteredFournisseurs.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.;
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join("")}</tr>\n</thead>\n<tbody>${this.filteredFournisseurs.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : "-"}</td>`).join("")}</tr>`).join("")}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert("Veuillez autoriser les pop-ups pour exporter en PDF"); }
  }
  
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}