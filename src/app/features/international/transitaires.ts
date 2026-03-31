import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Transitaire {
  id?: number;
  code: string;
  nom: string;
  forme_juridique: string;
  nif: string;
  registre_commerce: string;
  agrement_douane: string;
  date_agrement: string;
  date_validite_agrement: string;
  adresse: string;
  ville: string;
  pays: string;
  telephone: string;
  email: string;
  site_web: string;
  contact_nom: string;
  contact_telephone: string;
  contact_email: string;
  specialites: string[];
  pays_operation: string[];
  ports_principaux: string[];
  conditions_paiement: string;
  tarifs?: string;
  devise: string;
  note?: number;
  statut: 'actif' | 'inactif' | 'suspendu';
  notes?: string;
}

@Component({
  selector: 'app-transitaires',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="transitaires-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>🚛 Transitaires & Commissionnaires</h1>
          <p class="subtitle">{{ transitaires.length }} transitaire(s) • {{ getActifsCount() }} actif(s)</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="transitaires.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="transitaires.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouveau transitaire</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="transitaires.length > 0">
        <div class="kpi-card total">
          <div class="kpi-icon">🚛</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ transitaires.length }}</span>
            <span class="kpi-label">Total transitaires</span>
          </div>
        </div>
        <div class="kpi-card actif">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getActifsCount() }}</span>
            <span class="kpi-label">Partenaires actifs</span>
          </div>
        </div>
        <div class="kpi-card pays">
          <div class="kpi-icon">🌍</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getTotalPaysOperation() }}</span>
            <span class="kpi-label">Pays couverts</span>
          </div>
        </div>
        <div class="kpi-card note">
          <div class="kpi-icon">⭐</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getNoteMoyenne() | number:'1.1-1' }}</span>
            <span class="kpi-label">Note moyenne</span>
          </div>
        </div>
      </div>

      <!-- Formulaire moderne -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouveau' }} transitaire</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveTransitaire()">
              <div class="tabs">
                <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">📋 Informations</button>
                <button type="button" [class.active]="activeTab === 'agrement'" (click)="activeTab = 'agrement'">📜 Agrément</button>
                <button type="button" [class.active]="activeTab === 'operations'" (click)="activeTab = 'operations'">🌍 Opérations</button>
                <button type="button" [class.active]="activeTab === 'contact'" (click)="activeTab = 'contact'">👤 Contact</button>
              </div>

              <!-- Onglet Informations -->
              <div *ngIf="activeTab === 'info'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>Code *</label>
                    <input type="text" [(ngModel)]="currentTransitaire.code" name="code" required>
                  </div>
                  <div class="form-group">
                    <label>Nom *</label>
                    <input type="text" [(ngModel)]="currentTransitaire.nom" name="nom" required>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Forme juridique</label>
                    <input type="text" [(ngModel)]="currentTransitaire.forme_juridique" name="forme_juridique">
                  </div>
                  <div class="form-group">
                    <label>NIF</label>
                    <input type="text" [(ngModel)]="currentTransitaire.nif" name="nif">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Registre commerce</label>
                    <input type="text" [(ngModel)]="currentTransitaire.registre_commerce" name="registre_commerce">
                  </div>
                  <div class="form-group">
                    <label>Statut</label>
                    <select [(ngModel)]="currentTransitaire.statut" name="statut">
                      <option value="actif">✅ Actif</option>
                      <option value="inactif">⏸️ Inactif</option>
                      <option value="suspendu">⚠️ Suspendu</option>
                    </select>
                  </div>
                </div>
                <div class="form-row full-width">
                  <div class="form-group">
                    <label>Adresse</label>
                    <textarea [(ngModel)]="currentTransitaire.adresse" name="adresse" rows="2"></textarea>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Ville</label>
                    <input type="text" [(ngModel)]="currentTransitaire.ville" name="ville">
                  </div>
                  <div class="form-group">
                    <label>Pays</label>
                    <input type="text" [(ngModel)]="currentTransitaire.pays" name="pays">
                  </div>
                </div>
              </div>

              <!-- Onglet Agrément -->
              <div *ngIf="activeTab === 'agrement'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>N° agrément douane</label>
                    <input type="text" [(ngModel)]="currentTransitaire.agrement_douane" name="agrement_douane">
                  </div>
                  <div class="form-group">
                    <label>Date agrément</label>
                    <input type="date" [(ngModel)]="currentTransitaire.date_agrement" name="date_agrement">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Date validité</label>
                    <input type="date" [(ngModel)]="currentTransitaire.date_validite_agrement" name="date_validite_agrement">
                  </div>
                  <div class="form-group">
                    <label>Note (0-10)</label>
                    <input type="number" [(ngModel)]="currentTransitaire.note" name="note" min="0" max="10" step="0.1">
                  </div>
                </div>
              </div>

              <!-- Onglet Opérations -->
              <div *ngIf="activeTab === 'operations'" class="tab-content">
                <div class="form-group">
                  <label>Spécialités</label>
                  <div class="specialites-group">
                    <label *ngFor="let s of specialitesList" class="checkbox-label">
                      <input type="checkbox" [value]="s" (change)="toggleSpecialite(s)" [checked]="currentTransitaire.specialites?.includes(s)">
                      <span>{{ s }}</span>
                    </label>
                  </div>
                </div>
                <div class="form-group">
                  <label>Pays d'opération</label>
                  <textarea [(ngModel)]="paysOperationText" (blur)="updatePaysOperation()" rows="3" placeholder="Saisir les pays séparés par des virgules (ex: Mali, Côte d'Ivoire, Sénégal)"></textarea>
                </div>
                <div class="form-group">
                  <label>Ports principaux</label>
                  <textarea [(ngModel)]="portsText" (blur)="updatePorts()" rows="3" placeholder="Saisir les ports séparés par des virgules (ex: Port de Bamako, Port de Dakar)"></textarea>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Conditions de paiement</label>
                    <input type="text" [(ngModel)]="currentTransitaire.conditions_paiement" name="conditions_paiement">
                  </div>
                  <div class="form-group">
                    <label>Devise</label>
                    <select [(ngModel)]="currentTransitaire.devise" name="devise">
                      <option value="FCFA">FCFA</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="USD">Dollar ($)</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Onglet Contact -->
              <div *ngIf="activeTab === 'contact'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>Téléphone</label>
                    <input type="tel" [(ngModel)]="currentTransitaire.telephone" name="telephone">
                  </div>
                  <div class="form-group">
                    <label>Email</label>
                    <input type="email" [(ngModel)]="currentTransitaire.email" name="email">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Site web</label>
                    <input type="url" [(ngModel)]="currentTransitaire.site_web" name="site_web">
                  </div>
                  <div class="form-group">
                    <label>Tarifs (URL)</label>
                    <input type="text" [(ngModel)]="currentTransitaire.tarifs" name="tarifs">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Contact principal</label>
                    <input type="text" [(ngModel)]="currentTransitaire.contact_nom" name="contact_nom">
                  </div>
                  <div class="form-group">
                    <label>Téléphone contact</label>
                    <input type="tel" [(ngModel)]="currentTransitaire.contact_telephone" name="contact_telephone">
                  </div>
                </div>
                <div class="form-group">
                  <label>Email contact</label>
                  <input type="email" [(ngModel)]="currentTransitaire.contact_email" name="contact_email">
                </div>
                <div class="form-group full-width">
                  <label>Notes</label>
                  <textarea [(ngModel)]="currentTransitaire.notes" name="notes" rows="3"></textarea>
                </div>
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
      <div class="filters-section" *ngIf="transitaires.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterTransitaires()" placeholder="Rechercher par nom, code, ville..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterTransitaires()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="actif">✅ Actifs</option>
            <option value="inactif">⏸️ Inactifs</option>
            <option value="suspendu">⚠️ Suspendus</option>
          </select>
          <select [(ngModel)]="paysFilter" (ngModelChange)="filterTransitaires()" class="filter-select">
            <option value="">Tous pays</option>
            <option *ngFor="let p of getPaysList()" [value]="p">{{ p }}</option>
          </select>
        </div>
      </div>

      <!-- Liste des transitaires améliorée -->
      <div class="transitaires-section" *ngIf="transitaires.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Partenaires transitaires</h2>
          <div class="header-stats">
            <span class="stat-badge total">{{ transitaires.length }} au total</span>
            <span class="stat-badge actif">{{ getActifsCount() }} actifs</span>
          </div>
        </div>
        
        <div class="transitaires-grid">
          <div class="transitaire-card" *ngFor="let t of filteredTransitaires" [class]="t.statut">
            <div class="card-header">
              <div class="header-left">
                <div class="transitaire-icon">🚛</div>
                <div class="transitaire-info">
                  <div class="transitaire-nom">{{ t.nom }}</div>
                  <div class="transitaire-code">{{ t.code }}</div>
                  <div class="transitaire-location">📍 {{ t.ville }}, {{ t.pays }}</div>
                </div>
              </div>
              <div class="header-right">
                <div class="transitaire-note" *ngIf="t.note">
                  <span class="stars">{{ getStars(t.note) }}</span>
                  <span class="note-value">{{ t.note }}/10</span>
                </div>
                <span class="statut-badge" [class]="t.statut">{{ getStatutLabel(t.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="contact-info">
                <span class="contact-item">📞 {{ t.telephone || '-' }}</span>
                <span class="contact-item">✉️ {{ t.email || '-' }}</span>
                <span class="contact-item" *ngIf="t.contact_nom">👤 {{ t.contact_nom }}</span>
              </div>
              <div class="specialites-info" *ngIf="t.specialites && t.specialites.length">
                <span class="specialite-badge" *ngFor="let s of t.specialites.slice(0, 3)">{{ s }}</span>
                <span *ngIf="t.specialites.length > 3" class="specialite-more">+{{ t.specialites.length - 3 }}</span>
              </div>
              <div class="pays-info" *ngIf="t.pays_operation && t.pays_operation.length">
                <span class="label">🌍 Pays:</span>
                <span class="value">{{ t.pays_operation.slice(0, 3).join(', ') }}{{ t.pays_operation.length > 3 ? '...' : '' }}</span>
              </div>
              <div class="agrement-info" *ngIf="t.agrement_douane">
                <span class="label">📜 Agrément:</span>
                <span class="value">{{ t.agrement_douane }}</span>
                <span *ngIf="t.date_validite_agrement && isAgrementValide(t)" class="valid-badge">✅ Valide</span>
                <span *ngIf="t.date_validite_agrement && !isAgrementValide(t)" class="expired-badge">⚠️ Expiré</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="viewDetails(t)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="editTransitaire(t)" title="Modifier">✏️</button>
                <button class="action-icon delete" (click)="confirmDelete(t)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🚛</div>
          <h2>Aucun transitaire</h2>
          <p>Ajoutez votre premier partenaire transitaire</p>
          <button class="btn-primary" (click)="openForm()">+ Nouveau transitaire</button>
        </div>
      </ng-template>

      <!-- Modal Détails -->
      <div class="modal-overlay" *ngIf="showDetailsModal">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ selectedTransitaire?.nom }}</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedTransitaire">
            <div class="details-grid">
              <div class="detail-section">
                <h4>📋 Informations générales</h4>
                <p><strong>Code:</strong> {{ selectedTransitaire.code }}</p>
                <p><strong>Nom:</strong> {{ selectedTransitaire.nom }}</p>
                <p><strong>Forme juridique:</strong> {{ selectedTransitaire.forme_juridique || '-' }}</p>
                <p><strong>NIF:</strong> {{ selectedTransitaire.nif || '-' }}</p>
                <p><strong>RCCM:</strong> {{ selectedTransitaire.registre_commerce || '-' }}</p>
                <p><strong>Statut:</strong> {{ getStatutLabel(selectedTransitaire.statut) }}</p>
              </div>
              <div class="detail-section">
                <h4>📍 Coordonnées</h4>
                <p><strong>Adresse:</strong> {{ selectedTransitaire.adresse || '-' }}</p>
                <p><strong>Ville:</strong> {{ selectedTransitaire.ville }}</p>
                <p><strong>Pays:</strong> {{ selectedTransitaire.pays }}</p>
                <p><strong>Téléphone:</strong> {{ selectedTransitaire.telephone || '-' }}</p>
                <p><strong>Email:</strong> {{ selectedTransitaire.email || '-' }}</p>
                <p><strong>Site web:</strong> {{ selectedTransitaire.site_web || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>📜 Agrément</h4>
                <p><strong>N° agrément:</strong> {{ selectedTransitaire.agrement_douane || '-' }}</p>
                <p><strong>Date agrément:</strong> {{ selectedTransitaire.date_agrement | date:'dd/MM/yyyy' }}</p>
                <p><strong>Validité:</strong> {{ selectedTransitaire.date_validite_agrement | date:'dd/MM/yyyy' }}</p>
                <p><strong>Note:</strong> {{ selectedTransitaire.note || '-' }}/10</p>
              </div>
              <div class="detail-section">
                <h4>👤 Contact principal</h4>
                <p><strong>Nom:</strong> {{ selectedTransitaire.contact_nom || '-' }}</p>
                <p><strong>Téléphone:</strong> {{ selectedTransitaire.contact_telephone || '-' }}</p>
                <p><strong>Email:</strong> {{ selectedTransitaire.contact_email || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>⚙️ Spécialités</h4>
                <p>{{ selectedTransitaire.specialites ? selectedTransitaire.specialites.join(', ') : '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>🌍 Pays d'opération</h4>
                <p>{{ selectedTransitaire.pays_operation ? selectedTransitaire.pays_operation.join(', ') : '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>⚓ Ports principaux</h4>
                <p>{{ selectedTransitaire.ports_principaux ? selectedTransitaire.ports_principaux.join(', ') : '-' }}</p>
              </div>
              <div class="detail-section full-width" *ngIf="selectedTransitaire.notes">
                <h4>📝 Notes</h4>
                <p>{{ selectedTransitaire.notes }}</p>
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
            <p>Supprimer le transitaire <strong>{{ transitaireToDelete?.nom }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteTransitaire()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .transitaires-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
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
    .kpi-card.actif .kpi-value { color: #10B981; }
    .kpi-card.pays .kpi-value { color: #3B82F6; }
    .kpi-card.note .kpi-value { color: #F59E0B; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 800px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
    .modal-container.large { max-width: 900px; }
    .modal-container.small { max-width: 450px; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #F3F4F6; }
    .modal-header h3 { margin: 0; color: #EC4899; }
    .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #9CA3AF; }
    .modal-body { padding: 24px; }
    .tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #F3F4F6; padding-bottom: 10px; flex-wrap: wrap; }
    .tabs button { background: none; border: none; padding: 8px 16px; cursor: pointer; color: #6B7280; border-radius: 20px; }
    .tabs button.active { background: #EC4899; color: white; }
    .tab-content { margin-top: 20px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .full-width { grid-column: span 2; }
    .form-group { display: flex; flex-direction: column; margin-bottom: 16px; }
    .form-group label { margin-bottom: 8px; color: #4B5563; font-weight: 500; font-size: 14px; }
    .form-group input, .form-group textarea, .form-group select { padding: 12px; border: 2px solid #F3F4F6; border-radius: 10px; font-size: 14px; transition: border-color 0.2s; }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #EC4899; }
    .specialites-group { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; }
    .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-danger { background: #EF4444; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 2; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    
    .transitaires-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .stat-badge.total { background: #FEF3F9; color: #EC4899; }
    .stat-badge.actif { background: #DCFCE7; color: #16A34A; }
    
    .transitaires-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .transitaire-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .transitaire-card.actif { border-left-color: #10B981; }
    .transitaire-card.inactif { border-left-color: #9CA3AF; opacity: 0.7; }
    .transitaire-card.suspendu { border-left-color: #EF4444; }
    .transitaire-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 16px; }
    .header-left { display: flex; gap: 16px; align-items: center; flex: 1; }
    .transitaire-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .transitaire-nom { font-weight: 600; color: #1F2937; margin-bottom: 4px; }
    .transitaire-code { font-size: 11px; color: #9CA3AF; font-family: monospace; }
    .transitaire-location { font-size: 12px; color: #6B7280; margin-top: 4px; }
    .header-right { text-align: right; }
    .transitaire-note { margin-bottom: 8px; }
    .stars { font-size: 12px; letter-spacing: 1px; }
    .note-value { font-size: 11px; color: #6B7280; margin-left: 4px; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.actif { background: #DCFCE7; color: #16A34A; }
    .statut-badge.inactif { background: #F3F4F6; color: #6B7280; }
    .statut-badge.suspendu { background: #FEE2E2; color: #EF4444; }
    .card-body { margin: 16px 0; }
    .contact-info { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; font-size: 12px; color: #6B7280; }
    .contact-item { display: inline-flex; align-items: center; gap: 4px; }
    .specialites-info { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
    .specialite-badge { font-size: 10px; padding: 4px 8px; background: #FEF3F9; border-radius: 20px; color: #EC4899; }
    .specialite-more { font-size: 10px; padding: 4px 8px; background: #F3F4F6; border-radius: 20px; color: #6B7280; }
    .pays-info, .agrement-info { font-size: 11px; color: #6B7280; margin-top: 6px; }
    .pays-info .label, .agrement-info .label { font-weight: 500; color: #4B5563; }
    .valid-badge { background: #DCFCE7; color: #16A34A; padding: 2px 6px; border-radius: 12px; margin-left: 6px; font-size: 10px; }
    .expired-badge { background: #FEE2E2; color: #EF4444; padding: 2px 6px; border-radius: 12px; margin-left: 6px; font-size: 10px; }
    .card-footer { display: flex; justify-content: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid #F3F4F6; }
    .footer-actions { display: flex; gap: 8px; }
    .action-icon { background: none; border: 1px solid #FCE7F3; border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: all 0.2s; font-size: 14px; }
    .action-icon:hover { background: #FEF3F9; border-color: #EC4899; }
    .action-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    
    .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .detail-section { margin-bottom: 16px; }
    .detail-section h4 { color: #EC4899; margin: 0 0 12px 0; font-size: 16px; }
    .detail-section p { margin: 8px 0; font-size: 14px; color: #4B5563; }
    .detail-section.full-width { grid-column: span 2; }
    
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; gap: 12px; }
      .full-width { grid-column: span 1; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .details-grid { grid-template-columns: 1fr; }
      .detail-section.full-width { grid-column: span 1; }
      .transitaires-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class Transitaires implements OnInit {
  transitaires: Transitaire[] = [];
  filteredTransitaires: Transitaire[] = [];
  selectedTransitaire: Transitaire | null = null;
  
  specialitesList: string[] = ['Import', 'Export', 'Transit', 'Douane', 'Logistique', 'Transport maritime', 'Transport aérien', 'Transport terrestre'];
  
  currentTransitaire: Partial<Transitaire> = {
    code: '',
    nom: '',
    forme_juridique: '',
    nif: '',
    registre_commerce: '',
    agrement_douane: '',
    date_agrement: new Date().toISOString().split('T')[0],
    date_validite_agrement: '',
    adresse: '',
    ville: '',
    pays: '',
    telephone: '',
    email: '',
    site_web: '',
    contact_nom: '',
    contact_telephone: '',
    contact_email: '',
    specialites: [],
    pays_operation: [],
    ports_principaux: [],
    conditions_paiement: '',
    tarifs: '',
    devise: 'FCFA',
    note: 0,
    statut: 'actif',
    notes: ''
  };
  
  paysOperationText = '';
  portsText = '';
  activeTab = 'info';
  searchTerm = '';
  statutFilter = '';
  paysFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  transitaireToDelete: Transitaire | null = null;
  successMessage = '';
  
  ngOnInit() {
    this.loadTransitaires();
  }
  
  openForm() {
    this.currentTransitaire = {
      code: this.generateCode(),
      nom: '',
      forme_juridique: '',
      nif: '',
      registre_commerce: '',
      agrement_douane: '',
      date_agrement: new Date().toISOString().split('T')[0],
      date_validite_agrement: '',
      adresse: '',
      ville: '',
      pays: '',
      telephone: '',
      email: '',
      site_web: '',
      contact_nom: '',
      contact_telephone: '',
      contact_email: '',
      specialites: [],
      pays_operation: [],
      ports_principaux: [],
      conditions_paiement: '',
      tarifs: '',
      devise: 'FCFA',
      note: 0,
      statut: 'actif',
      notes: ''
    };
    this.paysOperationText = '';
    this.portsText = '';
    this.editMode = false;
    this.showForm = true;
    this.activeTab = 'info';
  }
  
  generateCode(): string {
    const count = this.transitaires.length + 1;
    return `TR-${String(count).padStart(4, '0')}`;
  }
  
  loadTransitaires() {
    const saved = localStorage.getItem('transitaires');
    this.transitaires = saved ? JSON.parse(saved) : [];
    this.filteredTransitaires = [...this.transitaires];
  }
  
  saveTransitaires() {
    localStorage.setItem('transitaires', JSON.stringify(this.transitaires));
  }
  
  toggleSpecialite(specialite: string) {
    if (!this.currentTransitaire.specialites) {
      this.currentTransitaire.specialites = [];
    }
    const index = this.currentTransitaire.specialites.indexOf(specialite);
    if (index === -1) {
      this.currentTransitaire.specialites.push(specialite);
    } else {
      this.currentTransitaire.specialites.splice(index, 1);
    }
  }
  
  updatePaysOperation() {
    this.currentTransitaire.pays_operation = this.paysOperationText.split(',').map(p => p.trim()).filter(p => p);
  }
  
  updatePorts() {
    this.currentTransitaire.ports_principaux = this.portsText.split(',').map(p => p.trim()).filter(p => p);
  }
  
  saveTransitaire() {
    if (this.editMode && this.currentTransitaire.id) {
      const index = this.transitaires.findIndex(t => t.id === this.currentTransitaire.id);
      if (index !== -1) {
        this.transitaires[index] = { ...this.currentTransitaire } as Transitaire;
        this.showSuccess('Transitaire modifié');
      }
    } else {
      const newTransitaire = { ...this.currentTransitaire, id: Date.now() } as Transitaire;
      this.transitaires.push(newTransitaire);
      this.showSuccess('Transitaire ajouté');
    }
    this.saveTransitaires();
    this.filterTransitaires();
    this.cancelForm();
  }
  
  editTransitaire(t: Transitaire) {
    this.currentTransitaire = { ...t };
    this.paysOperationText = t.pays_operation ? t.pays_operation.join(', ') : '';
    this.portsText = t.ports_principaux ? t.ports_principaux.join(', ') : '';
    this.editMode = true;
    this.showForm = true;
  }
  
  viewDetails(t: Transitaire) {
    this.selectedTransitaire = t;
    this.showDetailsModal = true;
  }
  
  confirmDelete(t: Transitaire) {
    this.transitaireToDelete = t;
    this.showDeleteModal = true;
  }
  
  deleteTransitaire() {
    if (this.transitaireToDelete) {
      this.transitaires = this.transitaires.filter(t => t.id !== this.transitaireToDelete?.id);
      this.saveTransitaires();
      this.filterTransitaires();
      this.showDeleteModal = false;
      this.transitaireToDelete = null;
      this.showSuccess('Transitaire supprimé');
    }
  }
  
  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }
  
  filterTransitaires() {
    let filtered = this.transitaires;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.nom?.toLowerCase().includes(term) ||
        t.code?.toLowerCase().includes(term) ||
        t.ville?.toLowerCase().includes(term) ||
        t.email?.toLowerCase().includes(term)
      );
    }
    
    if (this.statutFilter) {
      filtered = filtered.filter(t => t.statut === this.statutFilter);
    }
    
    if (this.paysFilter) {
      filtered = filtered.filter(t => t.pays_operation?.includes(this.paysFilter));
    }
    
    this.filteredTransitaires = filtered;
  }
  
  getActifsCount(): number {
    return this.transitaires.filter(t => t.statut === 'actif').length;
  }
  
  getTotalPaysOperation(): number {
    const paysSet = new Set<string>();
    this.transitaires.forEach(t => {
      if (t.pays_operation) {
        t.pays_operation.forEach(p => paysSet.add(p));
      }
    });
    return paysSet.size;
  }
  
  getNoteMoyenne(): number {
    const notes = this.transitaires.filter(t => t.note && t.note > 0).map(t => t.note || 0);
    if (notes.length === 0) return 0;
    return notes.reduce((a, b) => a + b, 0) / notes.length;
  }
  
  getPaysList(): string[] {
    const paysSet = new Set<string>();
    this.transitaires.forEach(t => {
      if (t.pays_operation) {
        t.pays_operation.forEach(p => paysSet.add(p));
      }
    });
    return Array.from(paysSet);
  }
  
  isAgrementValide(t: Transitaire): boolean {
    if (!t.date_validite_agrement) return false;
    return new Date(t.date_validite_agrement) > new Date();
  }
  
  getStars(note: number): string {
    const stars = Math.round(note / 2);
    return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
  }
  
  getStatutLabel(statut: string): string {
    const labels: any = { actif: '✅ Actif', inactif: '⏸️ Inactif', suspendu: '⚠️ Suspendu' };
    return labels[statut] || statut;
  }
  
  exportToExcel() {
    if (!this.filteredTransitaires || this.filteredTransitaires.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }
    const firstItem = this.filteredTransitaires[0] || {};
    const colonnes = Object.keys(firstItem).filter(k => !['id', 'created_at', 'updated_at'].includes(k));
    const lignes = this.filteredTransitaires.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ''));
    const csvContent = [colonnes, ...lignes]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `export_${new Date().toISOString().slice(0,19)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showSuccess('Export Excel effectué');
  }

  exportToPDF() {
    if (!this.filteredTransitaires || this.filteredTransitaires.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }
    const firstItem = this.filteredTransitaires[0] || {};
    const colonnes = Object.keys(firstItem).filter(k => !['id', 'created_at', 'updated_at'].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join('')}</tr>\n</thead>\n<tbody>${this.filteredTransitaires.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : '-'}</td>`).join('')}</tr>`).join('')}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
    const win = window.open('', '_blank');
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert('Veuillez autoriser les pop-ups pour exporter en PDF'); }
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}