import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Incoterm {
  id?: number;
  code: string;
  libelle: string;
  description: string;
  categorie: 'E' | 'F' | 'C' | 'D';
  transport: 'tous' | 'maritime' | 'terrestre' | 'aerien';
  lieu_transfert_risques: string;
  repartition_frais: string;
  assurance: boolean;
  douane_export: 'vendeur' | 'acheteur';
  douane_import: 'vendeur' | 'acheteur';
  transport_principal: 'vendeur' | 'acheteur';
  version: string;
  date_version: string;
  notes?: string;
  user_id?: number;
  created_at?: string;
}

@Component({
  selector: 'app-incoterms',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="incoterms-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>📜 Mes Incoterms</h1>
          <p class="subtitle">{{ incoterms.length }} incoterm(s) personnalisé(s)</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="incoterms.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="incoterms.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouvel incoterm</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>
      <div *ngIf="errorMessage" class="alert-error">
        <span class="alert-icon">⚠️</span>
        {{ errorMessage }}
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="incoterms.length > 0">
        <div class="kpi-card total">
          <div class="kpi-icon">📜</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ incoterms.length }}</span>
            <span class="kpi-label">Total incoterms</span>
          </div>
        </div>
        <div class="kpi-card categorie-c">
          <div class="kpi-icon">🚚</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getCountByCategorie('C') }}</span>
            <span class="kpi-label">Catégorie C</span>
          </div>
        </div>
        <div class="kpi-card categorie-f">
          <div class="kpi-icon">⚓</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getCountByCategorie('F') }}</span>
            <span class="kpi-label">Catégorie F</span>
          </div>
        </div>
        <div class="kpi-card categorie-e">
          <div class="kpi-icon">🏭</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getCountByCategorie('E') + getCountByCategorie('D') }}</span>
            <span class="kpi-label">Autres catégories</span>
          </div>
        </div>
      </div>

      <!-- Formulaire moderne -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouvel' }} incoterm</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveIncoterm()">
              <div class="form-row">
                <div class="form-group">
                  <label>Code *</label>
                  <input type="text" [(ngModel)]="newIncoterm.code" name="code" required placeholder="Ex: EXW, FOB, CIF...">
                </div>
                <div class="form-group">
                  <label>Libellé *</label>
                  <input type="text" [(ngModel)]="newIncoterm.libelle" name="libelle" required placeholder="Nom complet">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Catégorie</label>
                  <div class="type-toggle">
                    <button type="button" class="toggle-btn" [class.active]="newIncoterm.categorie === 'E'" (click)="newIncoterm.categorie = 'E'">
                      E - Départ
                    </button>
                    <button type="button" class="toggle-btn" [class.active]="newIncoterm.categorie === 'F'" (click)="newIncoterm.categorie = 'F'">
                      F - Transport non acquitté
                    </button>
                    <button type="button" class="toggle-btn" [class.active]="newIncoterm.categorie === 'C'" (click)="newIncoterm.categorie = 'C'">
                      C - Transport acquitté
                    </button>
                    <button type="button" class="toggle-btn" [class.active]="newIncoterm.categorie === 'D'" (click)="newIncoterm.categorie = 'D'">
                      D - Arrivée
                    </button>
                  </div>
                </div>
                <div class="form-group">
                  <label>Type de transport</label>
                  <select [(ngModel)]="newIncoterm.transport" name="transport" required>
                    <option value="tous">🌍 Tous modes</option>
                    <option value="maritime">⚓ Maritime</option>
                    <option value="terrestre">🚛 Terrestre</option>
                    <option value="aerien">✈️ Aérien</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Lieu transfert risques *</label>
                  <input type="text" [(ngModel)]="newIncoterm.lieu_transfert_risques" name="lieu" required placeholder="Ex: Usine, Port, Entrepôt...">
                </div>
                <div class="form-group">
                  <label>Répartition frais</label>
                  <input type="text" [(ngModel)]="newIncoterm.repartition_frais" name="frais" required placeholder="Ex: Vendeur supporte, Acheteur supporte...">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Assurance</label>
                  <div class="checkbox-group">
                    <label class="checkbox-label">
                      <input type="checkbox" [(ngModel)]="newIncoterm.assurance" name="assurance">
                      <span>Inclure l'assurance</span>
                    </label>
                  </div>
                </div>
                <div class="form-group">
                  <label>Version</label>
                  <select [(ngModel)]="newIncoterm.version" name="version">
                    <option value="2020">Incoterms 2020</option>
                    <option value="2010">Incoterms 2010</option>
                    <option value="2000">Incoterms 2000</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Douane export</label>
                  <select [(ngModel)]="newIncoterm.douane_export" name="douane_export" required>
                    <option value="vendeur">👤 Vendeur</option>
                    <option value="acheteur">👥 Acheteur</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Douane import</label>
                  <select [(ngModel)]="newIncoterm.douane_import" name="douane_import" required>
                    <option value="vendeur">👤 Vendeur</option>
                    <option value="acheteur">👥 Acheteur</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Transport principal</label>
                  <select [(ngModel)]="newIncoterm.transport_principal" name="transport_principal" required>
                    <option value="vendeur">👤 Vendeur</option>
                    <option value="acheteur">👥 Acheteur</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Date version</label>
                  <input type="date" [(ngModel)]="newIncoterm.date_version" name="date_version">
                </div>
              </div>

              <div class="form-group">
                <label>Description *</label>
                <textarea [(ngModel)]="newIncoterm.description" name="description" rows="3" required placeholder="Description détaillée de l'incoterm..."></textarea>
              </div>

              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="newIncoterm.notes" name="notes" rows="2" placeholder="Informations complémentaires..."></textarea>
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
      <div class="filters-section" *ngIf="incoterms.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterIncoterms()" placeholder="Rechercher par code, libellé..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="categorieFilter" (ngModelChange)="filterIncoterms()" class="filter-select">
            <option value="">Toutes catégories</option>
            <option value="E">E - Départ</option>
            <option value="F">F - Transport non acquitté</option>
            <option value="C">C - Transport acquitté</option>
            <option value="D">D - Arrivée</option>
          </select>
          <select [(ngModel)]="transportFilter" (ngModelChange)="filterIncoterms()" class="filter-select">
            <option value="">Tous transports</option>
            <option value="tous">🌍 Tous modes</option>
            <option value="maritime">⚓ Maritime</option>
            <option value="terrestre">🚛 Terrestre</option>
            <option value="aerien">✈️ Aérien</option>
          </select>
        </div>
      </div>

      <!-- Liste des incoterms améliorée -->
      <div class="incoterms-section" *ngIf="incoterms.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Mes incoterms personnalisés</h2>
          <div class="header-stats">
            <span class="stat-badge total">{{ incoterms.length }} au total</span>
            <span class="stat-badge active">{{ filteredIncoterms.length }} affiché(s)</span>
          </div>
        </div>
        
        <div class="incoterms-grid">
          <div class="incoterm-card" *ngFor="let i of filteredIncoterms" [class]="getCategorieClass(i.categorie)">
            <div class="card-header">
              <div class="code-badge" [class]="i.categorie">{{ i.code }}</div>
              <div class="categorie-badge" [class]="i.categorie">{{ getCategorieLabel(i.categorie) }}</div>
            </div>
            
            <div class="card-body">
              <h3 class="incoterm-libelle">{{ i.libelle }}</h3>
              <p class="incoterm-desc">{{ i.description | slice:0:100 }}{{ i.description.length > 100 ? '...' : '' }}</p>
              
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-icon">📍</span>
                  <div>
                    <div class="info-label">Transfert risques</div>
                    <div class="info-value">{{ i.lieu_transfert_risques }}</div>
                  </div>
                </div>
                <div class="info-item">
                  <span class="info-icon">💰</span>
                  <div>
                    <div class="info-label">Répartition frais</div>
                    <div class="info-value">{{ i.repartition_frais | slice:0:30 }}{{ i.repartition_frais.length > 30 ? '...' : '' }}</div>
                  </div>
                </div>
              </div>
              
              <div class="responsabilites">
                <div class="resp-item">
                  <span class="resp-label">📤 Export</span>
                  <span class="resp-value" [class]="i.douane_export">{{ getPartieLabel(i.douane_export) }}</span>
                </div>
                <div class="resp-item">
                  <span class="resp-label">📥 Import</span>
                  <span class="resp-value" [class]="i.douane_import">{{ getPartieLabel(i.douane_import) }}</span>
                </div>
                <div class="resp-item">
                  <span class="resp-label">🚚 Transport</span>
                  <span class="resp-value" [class]="i.transport_principal">{{ getPartieLabel(i.transport_principal) }}</span>
                </div>
                <div class="resp-item" *ngIf="i.assurance">
                  <span class="resp-label">🛡️ Assurance</span>
                  <span class="resp-value included">Incluse</span>
                </div>
              </div>
              
              <div class="transport-badge">
                <span class="badge" [class]="i.transport">{{ getTransportLabel(i.transport) }}</span>
                <span class="version-badge">v{{ i.version }}</span>
              </div>
            </div>
            
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="editIncoterm(i)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="duplicateIncoterm(i)" title="Dupliquer">📋</button>
                <button class="action-icon delete" (click)="deleteIncoterm(i)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📜</div>
          <h2>Aucun incoterm personnalisé</h2>
          <p>Ajoutez votre premier incoterm pour faciliter vos transactions internationales</p>
          <button class="btn-primary" (click)="openForm()">+ Nouvel incoterm</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .incoterms-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-add:hover, .btn-primary:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
    .btn-excel { background: #10B981; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-pdf { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .alert-success { background: #10B981; color: white; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    .alert-error { background: #EF4444; color: white; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
    .kpi-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.2s; }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .kpi-icon { font-size: 32px; width: 56px; height: 56px; background: #FDF2F8; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .kpi-content { flex: 1; }
    .kpi-value { display: block; font-size: 24px; font-weight: 700; }
    .kpi-value small { font-size: 12px; font-weight: 400; color: #6B7280; }
    .kpi-label { font-size: 13px; color: #6B7280; }
    .kpi-card.total .kpi-value { color: #EC4899; }
    .kpi-card.categorie-c .kpi-value { color: #3B82F6; }
    .kpi-card.categorie-f .kpi-value { color: #10B981; }
    
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
    .checkbox-group { display: flex; align-items: center; height: 100%; }
    .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 2; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    
    .incoterms-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .stat-badge.total { background: #FEF3F9; color: #EC4899; }
    .stat-badge.active { background: #E0E7FF; color: #4F46E5; }
    
    .incoterms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .incoterm-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .incoterm-card.E { border-left-color: #F59E0B; }
    .incoterm-card.F { border-left-color: #3B82F6; }
    .incoterm-card.C { border-left-color: #10B981; }
    .incoterm-card.D { border-left-color: #EC4899; }
    .incoterm-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .code-badge { font-size: 24px; font-weight: 700; padding: 4px 12px; border-radius: 8px; background: white; }
    .code-badge.E { color: #F59E0B; }
    .code-badge.F { color: #3B82F6; }
    .code-badge.C { color: #10B981; }
    .code-badge.D { color: #EC4899; }
    .categorie-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .categorie-badge.E { background: #FEF3C7; color: #D97706; }
    .categorie-badge.F { background: #DBEAFE; color: #1E40AF; }
    .categorie-badge.C { background: #DCFCE7; color: #166534; }
    .categorie-badge.D { background: #FFE4E6; color: #EC4899; }
    .incoterm-libelle { font-size: 18px; font-weight: 600; color: #1F2937; margin: 0 0 8px 0; }
    .incoterm-desc { font-size: 13px; color: #6B7280; line-height: 1.5; margin-bottom: 16px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .info-item { display: flex; gap: 8px; align-items: flex-start; }
    .info-icon { font-size: 20px; }
    .info-label { font-size: 10px; color: #9CA3AF; }
    .info-value { font-size: 12px; font-weight: 500; color: #1F2937; }
    .responsabilites { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; padding: 12px; background: white; border-radius: 12px; }
    .resp-item { display: flex; flex-direction: column; flex: 1; min-width: 80px; }
    .resp-label { font-size: 10px; color: #9CA3AF; margin-bottom: 2px; }
    .resp-value { font-size: 12px; font-weight: 600; }
    .resp-value.vendeur { color: #EC4899; }
    .resp-value.acheteur { color: #10B981; }
    .resp-value.included { color: #10B981; }
    .transport-badge { display: flex; gap: 8px; justify-content: space-between; align-items: center; }
    .badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; background: #F3F4F6; color: #4B5563; }
    .badge.tous { background: #E5E7EB; }
    .badge.maritime { background: #DBEAFE; color: #1E40AF; }
    .badge.terrestre { background: #FEF3C7; color: #92400E; }
    .badge.aerien { background: #E0E7FF; color: #3730A3; }
    .version-badge { font-size: 11px; padding: 4px 8px; background: #FDF2F8; border-radius: 20px; color: #EC4899; }
    .card-footer { display: flex; justify-content: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid #F3F4F6; }
    .footer-actions { display: flex; gap: 8px; }
    .action-icon { background: none; border: 1px solid #FCE7F3; border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: all 0.2s; font-size: 14px; }
    .action-icon:hover { background: #FEF3F9; border-color: #EC4899; }
    .action-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; gap: 12px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .info-grid { grid-template-columns: 1fr; }
      .responsabilites { flex-direction: column; }
      .incoterms-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class Incoterms implements OnInit {
  incoterms: Incoterm[] = [];
  filteredIncoterms: Incoterm[] = [];
  showForm = false;
  editMode = false;
  successMessage = '';
  errorMessage = '';

  searchTerm = '';
  categorieFilter = '';
  transportFilter = '';

  newIncoterm: Partial<Incoterm> = {
    code: '',
    libelle: '',
    description: '',
    categorie: 'C',
    transport: 'tous',
    lieu_transfert_risques: '',
    repartition_frais: '',
    assurance: false,
    douane_export: 'vendeur',
    douane_import: 'acheteur',
    transport_principal: 'vendeur',
    version: '2020',
    date_version: new Date().toISOString().split('T')[0],
    notes: ''
  };

  ngOnInit() {
    this.loadIncoterms();
  }

  openForm() {
    this.newIncoterm = {
      code: '',
      libelle: '',
      description: '',
      categorie: 'C',
      transport: 'tous',
      lieu_transfert_risques: '',
      repartition_frais: '',
      assurance: false,
      douane_export: 'vendeur',
      douane_import: 'acheteur',
      transport_principal: 'vendeur',
      version: '2020',
      date_version: new Date().toISOString().split('T')[0],
      notes: ''
    };
    this.editMode = false;
    this.showForm = true;
  }

  loadIncoterms() {
    const saved = localStorage.getItem('user_incoterms');
    this.incoterms = saved ? JSON.parse(saved) : [];
    this.filteredIncoterms = [...this.incoterms];
  }

  saveIncoterms() {
    localStorage.setItem('user_incoterms', JSON.stringify(this.incoterms));
  }

  saveIncoterm() {
    if (!this.newIncoterm.code || !this.newIncoterm.libelle || !this.newIncoterm.description) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    if (this.editMode && this.newIncoterm.id) {
      const index = this.incoterms.findIndex(i => i.id === this.newIncoterm.id);
      if (index !== -1) {
        this.incoterms[index] = this.newIncoterm as Incoterm;
        this.successMessage = 'Incoterm modifié avec succès';
      }
    } else {
      const newIncoterm: Incoterm = {
        ...this.newIncoterm,
        id: Date.now(),
        created_at: new Date().toISOString()
      } as Incoterm;
      
      this.incoterms.push(newIncoterm);
      this.successMessage = 'Incoterm ajouté avec succès';
    }

    this.saveIncoterms();
    this.filterIncoterms();
    this.cancelForm();
    setTimeout(() => this.successMessage = '', 3000);
  }

  editIncoterm(i: Incoterm) {
    this.newIncoterm = { ...i };
    this.editMode = true;
    this.showForm = true;
  }

  duplicateIncoterm(i: Incoterm) {
    const duplicate = {
      ...i,
      id: Date.now(),
      code: i.code + '-COPY',
      created_at: new Date().toISOString()
    };
    this.incoterms.push(duplicate);
    this.saveIncoterms();
    this.filterIncoterms();
    this.successMessage = 'Incoterm dupliqué';
    setTimeout(() => this.successMessage = '', 3000);
  }

  deleteIncoterm(i: Incoterm) {
    if (confirm(`Supprimer l'incoterm ${i.code} ?`)) {
      this.incoterms = this.incoterms.filter(inc => inc.id !== i.id);
      this.saveIncoterms();
      this.filterIncoterms();
      this.successMessage = 'Incoterm supprimé';
      setTimeout(() => this.successMessage = '', 3000);
    }
  }

  filterIncoterms() {
    this.filteredIncoterms = this.incoterms.filter(i => {
      const matchesSearch = !this.searchTerm || 
        i.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        i.libelle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (i.description && i.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesCategorie = !this.categorieFilter || i.categorie === this.categorieFilter;
      const matchesTransport = !this.transportFilter || i.transport === this.transportFilter;
      
      return matchesSearch && matchesCategorie && matchesTransport;
    });
  }

  getCountByCategorie(categorie: string): number {
    return this.incoterms.filter(i => i.categorie === categorie).length;
  }

  getCategorieLabel(categorie: string): string {
    const labels: any = {
      E: 'E - Départ',
      F: 'F - Transport non acquitté',
      C: 'C - Transport acquitté',
      D: 'D - Arrivée'
    };
    return labels[categorie] || categorie;
  }

  getCategorieClass(categorie: string): string {
    return categorie;
  }

  getTransportLabel(transport: string): string {
    const labels: any = { 
      tous: '🌍 Tous modes', 
      maritime: '⚓ Maritime', 
      terrestre: '🚛 Terrestre', 
      aerien: '✈️ Aérien' 
    };
    return labels[transport] || transport;
  }

  getPartieLabel(partie: string): string {
    return partie === 'vendeur' ? '👤 Vendeur' : '👥 Acheteur';
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }

    exportToExcel() {
    if (!this.filteredIncoterms || this.filteredIncoterms.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredIncoterms[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const lignes = this.filteredIncoterms.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ""));
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
    if (!this.filteredIncoterms || this.filteredIncoterms.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredIncoterms[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join("")}</tr>\n</thead>\n<tbody>${this.filteredIncoterms.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : "-"}</td>`).join("")}</tr>`).join("")}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert("Veuillez autoriser les pop-ups pour exporter en PDF"); }
  }  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = "", 3000);
  }

}