import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface DeclarationDouane {
  id?: number;
  numero_dossier: string;
  numero_acquit?: string;
  type: 'import' | 'export' | 'transit';
  date_declaration: string;
  bureau_douane: string;
  regime_douanier: string;
  valeur_marchandise: number;
  devise: string;
  montant_droits: number;
  montant_tva: number;
  montant_total: number;
  statut: 'brouillon' | 'en_cours' | 'soumise' | 'debloquee' | 'refusee';
  conteneurs?: string;
  marchandises: string;
  pays_origine: string;
  pays_destination: string;
  transporteur?: string;
  numero_vin?: string;
  date_validation?: string;
  date_acquit?: string;
  agent_douanier?: string;
  notes?: string;
}

@Component({
  selector: 'app-douanes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="douanes-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>📦 Déclarations en douane</h1>
          <p class="subtitle">{{ declarations.length }} déclaration(s) • Total valeur: {{ totalValeur | number }} FCFA</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="declarations.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="declarations.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouvelle déclaration</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="declarations.length > 0">
        <div class="kpi-card total">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalValeur | number }} <small>FCFA</small></span>
            <span class="kpi-label">Valeur totale</span>
          </div>
        </div>
        <div class="kpi-card import">
          <div class="kpi-icon">📥</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getCountByType('import') }}</span>
            <span class="kpi-label">Importations</span>
          </div>
        </div>
        <div class="kpi-card export">
          <div class="kpi-icon">📤</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getCountByType('export') }}</span>
            <span class="kpi-label">Exportations</span>
          </div>
        </div>
        <div class="kpi-card en-cours">
          <div class="kpi-icon">⏳</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getCountByStatut('en_cours') + getCountByStatut('soumise') }}</span>
            <span class="kpi-label">En cours</span>
          </div>
        </div>
      </div>

      <!-- Formulaire moderne -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouvelle' }} déclaration en douane</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveDeclaration()">
              <div class="form-row">
                <div class="form-group">
                  <label>Type de déclaration *</label>
                  <div class="type-toggle">
                    <button type="button" class="toggle-btn" [class.active]="newDeclaration.type === 'import'" (click)="newDeclaration.type = 'import'">
                      📥 Importation
                    </button>
                    <button type="button" class="toggle-btn" [class.active]="newDeclaration.type === 'export'" (click)="newDeclaration.type = 'export'">
                      📤 Exportation
                    </button>
                    <button type="button" class="toggle-btn" [class.active]="newDeclaration.type === 'transit'" (click)="newDeclaration.type = 'transit'">
                      🔄 Transit
                    </button>
                  </div>
                </div>
                <div class="form-group">
                  <label>Bureau de douane *</label>
                  <input type="text" [(ngModel)]="newDeclaration.bureau_douane" name="bureau_douane" required placeholder="Ex: Port de Bamako">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Date de déclaration *</label>
                  <input type="date" [(ngModel)]="newDeclaration.date_declaration" name="date_declaration" required>
                </div>
                <div class="form-group">
                  <label>Régime douanier *</label>
                  <select [(ngModel)]="newDeclaration.regime_douanier" name="regime_douanier" required>
                    <option value="mise_consommation">Mise à la consommation</option>
                    <option value="exportation">Exportation</option>
                    <option value="transit">Transit</option>
                    <option value="entrepot">Entrepôt</option>
                    <option value="admission">Admission temporaire</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Pays d'origine *</label>
                  <input type="text" [(ngModel)]="newDeclaration.pays_origine" name="pays_origine" required placeholder="Ex: Chine, France...">
                </div>
                <div class="form-group">
                  <label>Pays de destination *</label>
                  <input type="text" [(ngModel)]="newDeclaration.pays_destination" name="pays_destination" required placeholder="Ex: Mali, Côte d'Ivoire...">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Valeur marchandise *</label>
                  <input type="number" [(ngModel)]="newDeclaration.valeur_marchandise" name="valeur_marchandise" required (input)="calculerMontants()" placeholder="0">
                </div>
                <div class="form-group">
                  <label>Devise</label>
                  <select [(ngModel)]="newDeclaration.devise" name="devise">
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
                  <label>Droits de douane *</label>
                  <input type="number" [(ngModel)]="newDeclaration.montant_droits" name="montant_droits" required placeholder="0">
                </div>
                <div class="form-group">
                  <label>TVA *</label>
                  <input type="number" [(ngModel)]="newDeclaration.montant_tva" name="montant_tva" required placeholder="0">
                </div>
              </div>

              <div class="form-group highlight">
                <label>Total à payer</label>
                <input type="number" [(ngModel)]="newDeclaration.montant_total" name="montant_total" readonly class="readonly highlight-input">
              </div>

              <div class="form-group">
                <label>Marchandises *</label>
                <textarea [(ngModel)]="newDeclaration.marchandises" name="marchandises" rows="2" required placeholder="Description des marchandises"></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Conteneurs</label>
                  <input type="text" [(ngModel)]="newDeclaration.conteneurs" name="conteneurs" placeholder="Ex: MSKU1234567">
                </div>
                <div class="form-group">
                  <label>N° VIN / BL</label>
                  <input type="text" [(ngModel)]="newDeclaration.numero_vin" name="numero_vin" placeholder="N° de connaissement">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Transporteur</label>
                  <input type="text" [(ngModel)]="newDeclaration.transporteur" name="transporteur" placeholder="Nom du transporteur">
                </div>
                <div class="form-group">
                  <label>Agent douanier</label>
                  <input type="text" [(ngModel)]="newDeclaration.agent_douanier" name="agent_douanier" placeholder="Nom de l'agent">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Statut</label>
                  <select [(ngModel)]="newDeclaration.statut" name="statut">
                    <option value="brouillon">📝 Brouillon</option>
                    <option value="en_cours">⏳ En cours</option>
                    <option value="soumise">📤 Soumise</option>
                    <option value="debloquee">✅ Débloquée</option>
                    <option value="refusee">❌ Refusée</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>N° Acquit</label>
                  <input type="text" [(ngModel)]="newDeclaration.numero_acquit" name="numero_acquit" placeholder="N° d'acquit à paiement">
                </div>
              </div>

              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="newDeclaration.notes" name="notes" rows="2" placeholder="Informations complémentaires..."></textarea>
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
      <div class="filters-section" *ngIf="declarations.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterDeclarations()" placeholder="Rechercher par n° dossier, marchandises..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="typeFilter" (ngModelChange)="filterDeclarations()" class="filter-select">
            <option value="">Tous types</option>
            <option value="import">📥 Importations</option>
            <option value="export">📤 Exportations</option>
            <option value="transit">🔄 Transits</option>
          </select>
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterDeclarations()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="brouillon">📝 Brouillon</option>
            <option value="en_cours">⏳ En cours</option>
            <option value="soumise">📤 Soumise</option>
            <option value="debloquee">✅ Débloquée</option>
            <option value="refusee">❌ Refusée</option>
          </select>
        </div>
      </div>

      <!-- Liste des déclarations améliorée -->
      <div class="declarations-section" *ngIf="declarations.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Liste des déclarations</h2>
          <div class="header-stats">
            <span class="stat-badge total">Total: {{ totalValeur | number }} FCFA</span>
            <span class="stat-badge droits">Droits: {{ totalDroits | number }} FCFA</span>
          </div>
        </div>
        
        <div class="declarations-list">
          <div class="declaration-card" *ngFor="let d of filteredDeclarations" [class]="d.type" [class]="d.statut">
            <div class="card-header">
              <div class="header-left">
                <div class="declaration-icon" [class]="d.type">
                  {{ d.type === 'import' ? '📥' : d.type === 'export' ? '📤' : '🔄' }}
                </div>
                <div class="declaration-info">
                  <div class="declaration-ref">{{ d.numero_dossier }}</div>
                  <div class="declaration-badges">
                    <span class="type-badge" [class]="d.type">{{ getTypeLabel(d.type) }}</span>
                    <span class="statut-badge" [class]="d.statut">{{ getStatutLabel(d.statut) }}</span>
                  </div>
                </div>
              </div>
              <div class="header-right">
                <div class="declaration-date">{{ d.date_declaration | date:'dd/MM/yyyy' }}</div>
                <div class="declaration-bureau">{{ d.bureau_douane }}</div>
              </div>
            </div>

            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">🌍 Origine</span>
                  <span class="info-value">{{ d.pays_origine }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">🎯 Destination</span>
                  <span class="info-value">{{ d.pays_destination }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">📦 Marchandises</span>
                  <span class="info-value">{{ d.marchandises | slice:0:40 }}{{ d.marchandises.length > 40 ? '...' : '' }}</span>
                </div>
                <div class="info-item" *ngIf="d.conteneurs">
                  <span class="info-label">🚛 Conteneurs</span>
                  <span class="info-value">{{ d.conteneurs }}</span>
                </div>
              </div>

              <div class="montants-grid">
                <div class="montant-item">
                  <span class="montant-label">Valeur</span>
                  <span class="montant-value">{{ d.valeur_marchandise | number }} {{ d.devise }}</span>
                </div>
                <div class="montant-item">
                  <span class="montant-label">Droits</span>
                  <span class="montant-value">{{ d.montant_droits | number }} {{ d.devise }}</span>
                </div>
                <div class="montant-item">
                  <span class="montant-label">TVA</span>
                  <span class="montant-value">{{ d.montant_tva | number }} {{ d.devise }}</span>
                </div>
                <div class="montant-item total">
                  <span class="montant-label">Total</span>
                  <span class="montant-value">{{ d.montant_total | number }} {{ d.devise }}</span>
                </div>
              </div>

              <div class="transport-info" *ngIf="d.transporteur || d.agent_douanier">
                <span *ngIf="d.transporteur">🚚 Transporteur: {{ d.transporteur }}</span>
                <span *ngIf="d.agent_douanier">👤 Agent: {{ d.agent_douanier }}</span>
              </div>

              <div class="acquit-info" *ngIf="d.numero_acquit">
                <span class="acquit-badge">✅ Acquit N° {{ d.numero_acquit }}</span>
              </div>
            </div>

            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="editDeclaration(d)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="duplicateDeclaration(d)" title="Dupliquer">📋</button>
                <button class="action-icon" *ngIf="d.statut === 'brouillon'" (click)="soumettreDeclaration(d)" title="Soumettre">📤</button>
                <button class="action-icon delete" (click)="deleteDeclaration(d)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <h2>Aucune déclaration en douane</h2>
          <p>Créez votre première déclaration d'import/export</p>
          <button class="btn-primary" (click)="openForm()">+ Nouvelle déclaration</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .douanes-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
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
    .kpi-card.en-cours .kpi-value { color: #F59E0B; }
    
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
    .readonly { background: #F9FAFB; color: #6B7280; }
    .highlight-input { background: #FEF3F9; color: #EC4899; font-weight: 600; }
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
    
    .declarations-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .stat-badge.total { background: #FEF3F9; color: #EC4899; }
    .stat-badge.droits { background: #E0E7FF; color: #4F46E5; }
    
    .declarations-list { display: flex; flex-direction: column; gap: 16px; }
    .declaration-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .declaration-card.import { border-left-color: #3B82F6; }
    .declaration-card.export { border-left-color: #10B981; }
    .declaration-card.transit { border-left-color: #F59E0B; }
    .declaration-card.brouillon { opacity: 0.7; }
    .declaration-card.debloquee { background: #F0FDF4; }
    .declaration-card.refusee { background: #FEF2F2; }
    .declaration-card:hover { transform: translateX(4px); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 16px; }
    .header-left { display: flex; gap: 16px; align-items: center; flex: 1; }
    .declaration-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .declaration-ref { font-weight: 600; color: #1F2937; margin-bottom: 6px; }
    .declaration-badges { display: flex; gap: 8px; flex-wrap: wrap; }
    .type-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .type-badge.import { background: #DBEAFE; color: #1E40AF; }
    .type-badge.export { background: #DCFCE7; color: #166534; }
    .type-badge.transit { background: #FEF3C7; color: #92400E; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.brouillon { background: #F3F4F6; color: #6B7280; }
    .statut-badge.en_cours { background: #DBEAFE; color: #1E40AF; }
    .statut-badge.soumise { background: #FEF3C7; color: #D97706; }
    .statut-badge.debloquee { background: #DCFCE7; color: #16A34A; }
    .statut-badge.refusee { background: #FEE2E2; color: #EF4444; }
    .header-right { text-align: right; }
    .declaration-date { font-size: 12px; color: #9CA3AF; }
    .declaration-bureau { font-size: 13px; font-weight: 500; color: #1F2937; }
    .card-body { margin: 16px 0; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px; }
    .info-item { display: flex; flex-direction: column; }
    .info-label { font-size: 11px; color: #9CA3AF; margin-bottom: 4px; }
    .info-value { font-size: 13px; font-weight: 500; color: #1F2937; }
    .montants-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; padding: 12px; background: white; border-radius: 12px; }
    .montant-item { display: flex; flex-direction: column; }
    .montant-label { font-size: 11px; color: #9CA3AF; margin-bottom: 4px; }
    .montant-value { font-size: 14px; font-weight: 600; color: #1F2937; }
    .montant-item.total .montant-value { color: #EC4899; font-size: 16px; }
    .transport-info { display: flex; gap: 16px; margin-bottom: 12px; font-size: 12px; color: #6B7280; flex-wrap: wrap; }
    .acquit-info { margin-top: 8px; }
    .acquit-badge { font-size: 11px; padding: 4px 8px; background: #DCFCE7; color: #16A34A; border-radius: 20px; font-family: monospace; }
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
      .montants-grid { grid-template-columns: repeat(2, 1fr); }
      .card-header { flex-direction: column; }
      .header-right { text-align: left; }
    }
  `]
})
export class Douanes implements OnInit {
  declarations: DeclarationDouane[] = [];
  filteredDeclarations: DeclarationDouane[] = [];
  showForm = false;
  editMode = false;
  successMessage = '';
  
  searchTerm = '';
  typeFilter = '';
  statutFilter = '';

  newDeclaration: Partial<DeclarationDouane> = {
    type: 'import',
    date_declaration: new Date().toISOString().split('T')[0],
    bureau_douane: '',
    regime_douanier: 'mise_consommation',
    valeur_marchandise: 0,
    devise: 'FCFA',
    montant_droits: 0,
    montant_tva: 0,
    montant_total: 0,
    marchandises: '',
    pays_origine: '',
    pays_destination: '',
    statut: 'brouillon'
  };

  totalValeur = 0;
  totalDroits = 0;

  ngOnInit() {
    this.loadDeclarations();
  }

  openForm() {
    this.newDeclaration = {
      type: 'import',
      date_declaration: new Date().toISOString().split('T')[0],
      bureau_douane: '',
      regime_douanier: 'mise_consommation',
      valeur_marchandise: 0,
      devise: 'FCFA',
      montant_droits: 0,
      montant_tva: 0,
      montant_total: 0,
      marchandises: '',
      pays_origine: '',
      pays_destination: '',
      statut: 'brouillon'
    };
    this.editMode = false;
    this.showForm = true;
  }

  loadDeclarations() {
    const saved = localStorage.getItem('declarations_douane');
    this.declarations = saved ? JSON.parse(saved) : [];
    this.filteredDeclarations = [...this.declarations];
    this.calculerTotaux();
  }

  saveDeclarations() {
    localStorage.setItem('declarations_douane', JSON.stringify(this.declarations));
    this.calculerTotaux();
  }

  calculerMontants() {
    const valeur = this.newDeclaration.valeur_marchandise || 0;
    // Simulation de calcul des droits et TVA
    this.newDeclaration.montant_droits = valeur * 0.2; // 20%
    this.newDeclaration.montant_tva = valeur * 0.18; // 18%
    this.newDeclaration.montant_total = 
      (this.newDeclaration.montant_droits || 0) + 
      (this.newDeclaration.montant_tva || 0);
  }

  calculerTotaux() {
    this.totalValeur = this.declarations.reduce((sum, d) => sum + (d.valeur_marchandise || 0), 0);
    this.totalDroits = this.declarations.reduce((sum, d) => sum + (d.montant_droits || 0), 0);
  }

  generateNumeroDossier(): string {
    const prefix = 'DD';
    const year = new Date().getFullYear();
    const count = (this.declarations.length + 1).toString().padStart(4, '0');
    return `${prefix}-${year}-${count}`;
  }

  saveDeclaration() {
    if (this.editMode && this.newDeclaration.id) {
      const index = this.declarations.findIndex(d => d.id === this.newDeclaration.id);
      if (index !== -1) {
        this.declarations[index] = this.newDeclaration as DeclarationDouane;
        this.showMessage('Déclaration modifiée');
      }
    } else {
      const newDeclaration: DeclarationDouane = {
        id: Date.now(),
        numero_dossier: this.generateNumeroDossier(),
        numero_acquit: this.newDeclaration.numero_acquit,
        type: this.newDeclaration.type as 'import' | 'export' | 'transit' || 'import',
        date_declaration: this.newDeclaration.date_declaration || new Date().toISOString().split('T')[0],
        bureau_douane: this.newDeclaration.bureau_douane || '',
        regime_douanier: this.newDeclaration.regime_douanier || 'mise_consommation',
        valeur_marchandise: this.newDeclaration.valeur_marchandise || 0,
        devise: this.newDeclaration.devise || 'FCFA',
        montant_droits: this.newDeclaration.montant_droits || 0,
        montant_tva: this.newDeclaration.montant_tva || 0,
        montant_total: this.newDeclaration.montant_total || 0,
        marchandises: this.newDeclaration.marchandises || '',
        pays_origine: this.newDeclaration.pays_origine || '',
        pays_destination: this.newDeclaration.pays_destination || '',
        transporteur: this.newDeclaration.transporteur,
        conteneurs: this.newDeclaration.conteneurs,
        numero_vin: this.newDeclaration.numero_vin,
        agent_douanier: this.newDeclaration.agent_douanier,
        statut: this.newDeclaration.statut as 'brouillon' | 'en_cours' | 'soumise' | 'debloquee' | 'refusee' || 'brouillon',
        notes: this.newDeclaration.notes
      };
      this.declarations.push(newDeclaration);
      this.showMessage('Déclaration créée');
    }
    
    this.saveDeclarations();
    this.filterDeclarations();
    this.cancelForm();
  }

  editDeclaration(d: DeclarationDouane) {
    this.newDeclaration = { ...d };
    this.editMode = true;
    this.showForm = true;
  }

  duplicateDeclaration(d: DeclarationDouane) {
    const newDeclaration: DeclarationDouane = {
      ...d,
      id: Date.now(),
      numero_dossier: this.generateNumeroDossier(),
      statut: 'brouillon',
      numero_acquit: undefined
    };
    this.declarations.push(newDeclaration);
    this.saveDeclarations();
    this.filterDeclarations();
    this.showMessage('Déclaration dupliquée');
  }

  soumettreDeclaration(d: DeclarationDouane) {
    d.statut = 'soumise';
    this.saveDeclarations();
    this.filterDeclarations();
    this.showMessage('Déclaration soumise');
  }

  deleteDeclaration(d: DeclarationDouane) {
    if (confirm('Supprimer cette déclaration ?')) {
      this.declarations = this.declarations.filter(dec => dec.id !== d.id);
      this.saveDeclarations();
      this.filterDeclarations();
      this.showMessage('Déclaration supprimée');
    }
  }

  filterDeclarations() {
    this.filteredDeclarations = this.declarations.filter(d => {
      const matchesSearch = !this.searchTerm || 
        d.numero_dossier.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        d.marchandises.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (d.numero_acquit && d.numero_acquit.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesType = !this.typeFilter || d.type === this.typeFilter;
      const matchesStatut = !this.statutFilter || d.statut === this.statutFilter;
      
      return matchesSearch && matchesType && matchesStatut;
    });
  }

  getCountByType(type: string): number {
    return this.declarations.filter(d => d.type === type).length;
  }

  getCountByStatut(statut: string): number {
    return this.declarations.filter(d => d.statut === statut).length;
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }

  getTypeLabel(type: string): string {
    const labels: any = {
      import: 'Importation',
      export: 'Exportation',
      transit: 'Transit'
    };
    return labels[type] || type;
  }

  getStatutLabel(statut: string): string {
    const labels: any = {
      brouillon: 'Brouillon',
      en_cours: 'En cours',
      soumise: 'Soumise',
      debloquee: 'Débloquée',
      refusee: 'Refusée'
    };
    return labels[statut] || statut;
  }

    exportToExcel() {
    if (!this.filteredDeclarations || this.filteredDeclarations.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredDeclarations[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const lignes = this.filteredDeclarations.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ""));
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
    if (!this.filteredDeclarations || this.filteredDeclarations.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredDeclarations[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join("")}</tr>\n</thead>\n<tbody>${this.filteredDeclarations.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : "-"}</td>`).join("")}</tr>`).join("")}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
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