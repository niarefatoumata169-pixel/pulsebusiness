import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Equipement {
  id?: number;
  code: string;
  nom: string;
  type: 'machine' | 'outil' | 'vehicule' | 'instrument' | 'autre';
  marque: string;
  modele: string;
  numero_serie: string;
  date_acquisition: string;
  date_mise_en_service: string;
  fournisseur: string;
  prix_achat: number;
  duree_vie_ans: number;
  garantie_mois: number;
  date_fin_garantie?: string;
  localisation: string;
  service_responsable: string;
  responsable: string;
  caracteristiques: string;
  puissance?: string;
  capacite?: string;
  dimensions?: string;
  poids?: number;
  consommation?: string;
  etat: 'operationnel' | 'maintenance' | 'panne' | 'hors_service';
  disponibilite: 'disponible' | 'occupe' | 'reserve';
  date_derniere_maintenance?: string;
  date_prochaine_maintenance?: string;
  frequence_maintenance_jours: number;
  notes?: string;
  document_tech?: string;
  photo?: string;
}

@Component({
  selector: 'app-equipements',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="equipements-container">
      <div class="header">
        <div>
          <h1>⚙️ Équipements</h1>
          <p class="subtitle">{{ equipements.length }} équipement(s) • {{ getOperationnelCount() }} opérationnel(s)</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="equipements.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="equipements.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouvel équipement</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="equipements.length > 0">
        <div class="kpi-card total">
          <div class="kpi-icon">⚙️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ equipements.length }}</span>
            <span class="kpi-label">Total équipements</span>
          </div>
        </div>
        <div class="kpi-card operationnel">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getOperationnelCount() }}</span>
            <span class="kpi-label">Opérationnels</span>
          </div>
        </div>
        <div class="kpi-card maintenance">
          <div class="kpi-icon">🔧</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getMaintenanceCount() }}</span>
            <span class="kpi-label">En maintenance</span>
          </div>
        </div>
        <div class="kpi-card panne">
          <div class="kpi-icon">⚠️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getPanneCount() }}</span>
            <span class="kpi-label">En panne</span>
          </div>
        </div>
      </div>

      <!-- Formulaire moderne -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouvel' }} équipement</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveEquipement()">
              <div class="tabs">
                <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">📋 Informations</button>
                <button type="button" [class.active]="activeTab === 'caracteristiques'" (click)="activeTab = 'caracteristiques'">⚙️ Caractéristiques</button>
                <button type="button" [class.active]="activeTab === 'maintenance'" (click)="activeTab = 'maintenance'">🔧 Maintenance</button>
              </div>

              <!-- Onglet Informations -->
              <div *ngIf="activeTab === 'info'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>Code *</label>
                    <input type="text" [(ngModel)]="currentEquipement.code" name="code" required>
                  </div>
                  <div class="form-group">
                    <label>Nom *</label>
                    <input type="text" [(ngModel)]="currentEquipement.nom" name="nom" required>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Type</label>
                    <select [(ngModel)]="currentEquipement.type" name="type">
                      <option value="machine">🏭 Machine</option>
                      <option value="outil">🔧 Outil</option>
                      <option value="instrument">📏 Instrument</option>
                      <option value="vehicule">🚛 Véhicule</option>
                      <option value="autre">📌 Autre</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Marque</label>
                    <input type="text" [(ngModel)]="currentEquipement.marque" name="marque">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Modèle</label>
                    <input type="text" [(ngModel)]="currentEquipement.modele" name="modele">
                  </div>
                  <div class="form-group">
                    <label>N° de série</label>
                    <input type="text" [(ngModel)]="currentEquipement.numero_serie" name="numero_serie">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Date d'acquisition</label>
                    <input type="date" [(ngModel)]="currentEquipement.date_acquisition" name="date_acquisition" (change)="calculerFinGarantie()">
                  </div>
                  <div class="form-group">
                    <label>Date mise en service</label>
                    <input type="date" [(ngModel)]="currentEquipement.date_mise_en_service" name="date_mise_en_service">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Fournisseur</label>
                    <input type="text" [(ngModel)]="currentEquipement.fournisseur" name="fournisseur">
                  </div>
                  <div class="form-group">
                    <label>Prix d'achat (FCFA)</label>
                    <input type="number" [(ngModel)]="currentEquipement.prix_achat" name="prix_achat" min="0">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Durée de vie (ans)</label>
                    <input type="number" [(ngModel)]="currentEquipement.duree_vie_ans" name="duree_vie_ans" min="0" step="0.5">
                  </div>
                  <div class="form-group">
                    <label>Garantie (mois)</label>
                    <input type="number" [(ngModel)]="currentEquipement.garantie_mois" name="garantie_mois" min="0" (input)="calculerFinGarantie()">
                  </div>
                </div>
                <div class="form-group highlight">
                  <label>Fin de garantie</label>
                  <input type="date" [(ngModel)]="currentEquipement.date_fin_garantie" name="date_fin_garantie" readonly class="readonly">
                </div>
              </div>

              <!-- Onglet Caractéristiques -->
              <div *ngIf="activeTab === 'caracteristiques'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>Localisation</label>
                    <input type="text" [(ngModel)]="currentEquipement.localisation" name="localisation">
                  </div>
                  <div class="form-group">
                    <label>Service responsable</label>
                    <input type="text" [(ngModel)]="currentEquipement.service_responsable" name="service_responsable">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Responsable</label>
                    <input type="text" [(ngModel)]="currentEquipement.responsable" name="responsable">
                  </div>
                  <div class="form-group">
                    <label>État</label>
                    <select [(ngModel)]="currentEquipement.etat" name="etat">
                      <option value="operationnel">✅ Opérationnel</option>
                      <option value="maintenance">🔧 En maintenance</option>
                      <option value="panne">⚠️ En panne</option>
                      <option value="hors_service">❌ Hors service</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Disponibilité</label>
                    <select [(ngModel)]="currentEquipement.disponibilite" name="disponibilite">
                      <option value="disponible">🟢 Disponible</option>
                      <option value="occupe">🟡 Occupé</option>
                      <option value="reserve">🔵 Réservé</option>
                    </select>
                  </div>
                </div>
                <div class="form-group full-width">
                  <label>Caractéristiques techniques</label>
                  <textarea [(ngModel)]="currentEquipement.caracteristiques" name="caracteristiques" rows="3"></textarea>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Puissance</label>
                    <input type="text" [(ngModel)]="currentEquipement.puissance" name="puissance">
                  </div>
                  <div class="form-group">
                    <label>Capacité</label>
                    <input type="text" [(ngModel)]="currentEquipement.capacite" name="capacite">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Dimensions</label>
                    <input type="text" [(ngModel)]="currentEquipement.dimensions" name="dimensions">
                  </div>
                  <div class="form-group">
                    <label>Poids (kg)</label>
                    <input type="number" [(ngModel)]="currentEquipement.poids" name="poids" min="0" step="0.1">
                  </div>
                </div>
                <div class="form-group">
                  <label>Consommation</label>
                  <input type="text" [(ngModel)]="currentEquipement.consommation" name="consommation">
                </div>
              </div>

              <!-- Onglet Maintenance -->
              <div *ngIf="activeTab === 'maintenance'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>Fréquence maintenance (jours)</label>
                    <input type="number" [(ngModel)]="currentEquipement.frequence_maintenance_jours" name="frequence_maintenance_jours" min="0">
                  </div>
                  <div class="form-group">
                    <label>Dernière maintenance</label>
                    <input type="date" [(ngModel)]="currentEquipement.date_derniere_maintenance" name="date_derniere_maintenance" (change)="calculerProchaineMaintenance()">
                  </div>
                </div>
                <div class="form-group highlight">
                  <label>Prochaine maintenance</label>
                  <input type="date" [(ngModel)]="currentEquipement.date_prochaine_maintenance" name="date_prochaine_maintenance" readonly class="readonly">
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Document technique (URL)</label>
                    <input type="text" [(ngModel)]="currentEquipement.document_tech" name="document_tech">
                  </div>
                  <div class="form-group">
                    <label>Photo (URL)</label>
                    <input type="text" [(ngModel)]="currentEquipement.photo" name="photo">
                  </div>
                </div>
                <div class="form-group full-width">
                  <label>Notes</label>
                  <textarea [(ngModel)]="currentEquipement.notes" name="notes" rows="4"></textarea>
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
      <div class="filters-section" *ngIf="equipements.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterEquipements()" placeholder="Rechercher par nom, code..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="typeFilter" (ngModelChange)="filterEquipements()" class="filter-select">
            <option value="">Tous types</option>
            <option value="machine">🏭 Machines</option>
            <option value="outil">🔧 Outils</option>
            <option value="instrument">📏 Instruments</option>
            <option value="vehicule">🚛 Véhicules</option>
          </select>
          <select [(ngModel)]="etatFilter" (ngModelChange)="filterEquipements()" class="filter-select">
            <option value="">Tous états</option>
            <option value="operationnel">✅ Opérationnels</option>
            <option value="maintenance">🔧 En maintenance</option>
            <option value="panne">⚠️ En panne</option>
          </select>
        </div>
      </div>

      <!-- Liste des équipements améliorée -->
      <div class="equipements-section" *ngIf="equipements.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Parc d'équipements</h2>
          <div class="header-stats">
            <span class="stat-badge total">{{ equipements.length }} au total</span>
            <span class="stat-badge operationnel">{{ getOperationnelCount() }} opérationnels</span>
          </div>
        </div>
        
        <div class="equipements-grid">
          <div class="equipement-card" *ngFor="let e of filteredEquipements" [class]="e.etat" [class.maintenance-due]="isMaintenanceDue(e)">
            <div class="card-header">
              <div class="header-left">
                <div class="equipement-icon">{{ getTypeIcon(e.type) }}</div>
                <div class="equipement-info">
                  <div class="equipement-nom">{{ e.nom }}</div>
                  <div class="equipement-code">{{ e.code }}</div>
                  <div class="equipement-marque">{{ e.marque }} {{ e.modele }}</div>
                </div>
              </div>
              <div class="header-right">
                <div class="equipement-statut" [class]="e.etat">
                  {{ getEtatLabel(e.etat) }}
                </div>
                <div class="equipement-dispo" [class]="e.disponibilite">
                  {{ getDispoLabel(e.disponibilite) }}
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">📍 Localisation:</span>
                <span class="info-value">{{ e.localisation || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">👤 Responsable:</span>
                <span class="info-value">{{ e.responsable || '-' }}</span>
              </div>
              <div class="info-row" *ngIf="e.date_prochaine_maintenance">
                <span class="info-label">🔧 Prochaine maintenance:</span>
                <span class="info-value" [class.urgent]="isMaintenanceDue(e)">
                  {{ e.date_prochaine_maintenance | date:'dd/MM/yyyy' }}
                  <span *ngIf="isMaintenanceDue(e)" class="urgent-badge">(dans {{ getJoursAvantMaintenance(e) }} jours)</span>
                </span>
              </div>
              <div class="info-row" *ngIf="e.date_fin_garantie && isGarantieExpiree(e)">
                <span class="info-label">⚠️ Garantie:</span>
                <span class="info-value expired">Expirée le {{ e.date_fin_garantie | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="viewDetails(e)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="editEquipement(e)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="duplicateEquipement(e)" title="Dupliquer">📋</button>
                <button class="action-icon delete" (click)="confirmDelete(e)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">⚙️</div>
          <h2>Aucun équipement</h2>
          <p>Ajoutez votre premier équipement</p>
          <button class="btn-primary" (click)="openForm()">+ Nouvel équipement</button>
        </div>
      </ng-template>

      <!-- Modal Détails -->
      <div class="modal-overlay" *ngIf="showDetailsModal">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ selectedEquipement?.nom }}</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedEquipement">
            <div class="details-grid">
              <div class="detail-section">
                <h4>📋 Informations générales</h4>
                <p><strong>Code:</strong> {{ selectedEquipement.code }}</p>
                <p><strong>Nom:</strong> {{ selectedEquipement.nom }}</p>
                <p><strong>Type:</strong> {{ selectedEquipement.type }}</p>
                <p><strong>Marque:</strong> {{ selectedEquipement.marque }} {{ selectedEquipement.modele }}</p>
                <p><strong>N° série:</strong> {{ selectedEquipement.numero_serie || '-' }}</p>
                <p><strong>Fournisseur:</strong> {{ selectedEquipement.fournisseur || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>💰 Acquisition</h4>
                <p><strong>Date acquisition:</strong> {{ selectedEquipement.date_acquisition | date:'dd/MM/yyyy' }}</p>
                <p><strong>Mise en service:</strong> {{ selectedEquipement.date_mise_en_service | date:'dd/MM/yyyy' }}</p>
                <p><strong>Prix achat:</strong> {{ selectedEquipement.prix_achat | number }} FCFA</p>
                <p><strong>Durée de vie:</strong> {{ selectedEquipement.duree_vie_ans }} ans</p>
                <p><strong>Garantie:</strong> {{ selectedEquipement.garantie_mois }} mois</p>
                <p><strong>Fin garantie:</strong> {{ selectedEquipement.date_fin_garantie | date:'dd/MM/yyyy' }}</p>
              </div>
              <div class="detail-section">
                <h4>📍 Localisation</h4>
                <p><strong>Localisation:</strong> {{ selectedEquipement.localisation || '-' }}</p>
                <p><strong>Service:</strong> {{ selectedEquipement.service_responsable || '-' }}</p>
                <p><strong>Responsable:</strong> {{ selectedEquipement.responsable || '-' }}</p>
                <p><strong>État:</strong> {{ getEtatLabel(selectedEquipement.etat) }}</p>
                <p><strong>Disponibilité:</strong> {{ getDispoLabel(selectedEquipement.disponibilite) }}</p>
              </div>
              <div class="detail-section">
                <h4>⚙️ Caractéristiques techniques</h4>
                <p>{{ selectedEquipement.caracteristiques || '-' }}</p>
                <p><strong>Puissance:</strong> {{ selectedEquipement.puissance || '-' }}</p>
                <p><strong>Capacité:</strong> {{ selectedEquipement.capacite || '-' }}</p>
                <p><strong>Dimensions:</strong> {{ selectedEquipement.dimensions || '-' }}</p>
                <p><strong>Poids:</strong> {{ selectedEquipement.poids || '-' }} kg</p>
                <p><strong>Consommation:</strong> {{ selectedEquipement.consommation || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>🔧 Maintenance</h4>
                <p><strong>Fréquence:</strong> {{ selectedEquipement.frequence_maintenance_jours }} jours</p>
                <p><strong>Dernière:</strong> {{ selectedEquipement.date_derniere_maintenance | date:'dd/MM/yyyy' }}</p>
                <p><strong>Prochaine:</strong> {{ selectedEquipement.date_prochaine_maintenance | date:'dd/MM/yyyy' }}</p>
              </div>
              <div class="detail-section full-width" *ngIf="selectedEquipement.notes">
                <h4>📝 Notes</h4>
                <p>{{ selectedEquipement.notes }}</p>
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
            <p>Supprimer l'équipement <strong>{{ equipementToDelete?.nom }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteEquipement()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .equipements-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
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
    .kpi-card.operationnel .kpi-value { color: #10B981; }
    .kpi-card.maintenance .kpi-value { color: #F59E0B; }
    .kpi-card.panne .kpi-value { color: #EF4444; }
    
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
    .readonly { background: #F9FAFB; color: #6B7280; }
    .highlight input { background: #FEF3F9; color: #EC4899; font-weight: 600; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-danger { background: #EF4444; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 2; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    
    .equipements-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .stat-badge.total { background: #FEF3F9; color: #EC4899; }
    .stat-badge.operationnel { background: #DCFCE7; color: #16A34A; }
    
    .equipements-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .equipement-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .equipement-card.operationnel { border-left-color: #10B981; }
    .equipement-card.maintenance { border-left-color: #F59E0B; }
    .equipement-card.panne { border-left-color: #EF4444; }
    .equipement-card.hors_service { border-left-color: #6B7280; opacity: 0.7; }
    .equipement-card.maintenance-due { background: #FEF3C7; }
    .equipement-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 16px; }
    .header-left { display: flex; gap: 16px; align-items: center; flex: 1; }
    .equipement-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .equipement-nom { font-weight: 600; color: #1F2937; margin-bottom: 4px; }
    .equipement-code { font-size: 11px; color: #9CA3AF; font-family: monospace; }
    .equipement-marque { font-size: 12px; color: #6B7280; }
    .header-right { text-align: right; }
    .equipement-statut { font-size: 11px; padding: 4px 8px; border-radius: 20px; display: inline-block; margin-bottom: 4px; }
    .equipement-statut.operationnel { background: #DCFCE7; color: #16A34A; }
    .equipement-statut.maintenance { background: #FEF3C7; color: #D97706; }
    .equipement-statut.panne { background: #FEE2E2; color: #EF4444; }
    .equipement-statut.hors_service { background: #F3F4F6; color: #6B7280; }
    .equipement-dispo { font-size: 10px; padding: 2px 6px; border-radius: 12px; margin-top: 4px; }
    .equipement-dispo.disponible { color: #10B981; }
    .equipement-dispo.occupe { color: #F59E0B; }
    .equipement-dispo.reserve { color: #3B82F6; }
    .card-body { margin: 16px 0; }
    .info-row { display: flex; gap: 8px; margin-bottom: 8px; font-size: 13px; }
    .info-label { font-weight: 500; color: #6B7280; width: 130px; }
    .info-value { color: #1F2937; }
    .info-value.urgent { color: #EF4444; font-weight: 600; }
    .info-value.expired { color: #EF4444; }
    .urgent-badge { font-size: 10px; font-weight: normal; }
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
      .equipements-grid { grid-template-columns: 1fr; }
      .info-row { flex-direction: column; gap: 4px; }
      .info-label { width: auto; }
    }
  `]
})
export class Equipements implements OnInit {
  equipements: Equipement[] = [];
  filteredEquipements: Equipement[] = [];
  selectedEquipement: Equipement | null = null;
  
  currentEquipement: Partial<Equipement> = {
    code: '',
    nom: '',
    type: 'machine',
    marque: '',
    modele: '',
    numero_serie: '',
    date_acquisition: new Date().toISOString().split('T')[0],
    date_mise_en_service: new Date().toISOString().split('T')[0],
    fournisseur: '',
    prix_achat: 0,
    duree_vie_ans: 10,
    garantie_mois: 12,
    localisation: '',
    service_responsable: '',
    responsable: '',
    caracteristiques: '',
    etat: 'operationnel',
    disponibilite: 'disponible',
    frequence_maintenance_jours: 30,
    date_derniere_maintenance: new Date().toISOString().split('T')[0]
  };
  
  activeTab = 'info';
  searchTerm = '';
  typeFilter = '';
  etatFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  equipementToDelete: Equipement | null = null;
  successMessage = '';
  
  ngOnInit() {
    this.loadEquipements();
  }
  
  openForm() {
    this.currentEquipement = {
      code: this.generateCode(),
      nom: '',
      type: 'machine',
      marque: '',
      modele: '',
      numero_serie: '',
      date_acquisition: new Date().toISOString().split('T')[0],
      date_mise_en_service: new Date().toISOString().split('T')[0],
      fournisseur: '',
      prix_achat: 0,
      duree_vie_ans: 10,
      garantie_mois: 12,
      localisation: '',
      service_responsable: '',
      responsable: '',
      caracteristiques: '',
      etat: 'operationnel',
      disponibilite: 'disponible',
      frequence_maintenance_jours: 30,
      date_derniere_maintenance: new Date().toISOString().split('T')[0]
    };
    this.editMode = false;
    this.showForm = true;
    this.activeTab = 'info';
  }
  
  generateCode(): string {
    const count = this.equipements.length + 1;
    return `EQ-${String(count).padStart(4, '0')}`;
  }
  
  loadEquipements() {
    const saved = localStorage.getItem('equipements');
    this.equipements = saved ? JSON.parse(saved) : [];
    this.filteredEquipements = [...this.equipements];
  }
  
  saveEquipements() {
    localStorage.setItem('equipements', JSON.stringify(this.equipements));
  }
  
  calculerFinGarantie() {
    if (this.currentEquipement.date_acquisition && this.currentEquipement.garantie_mois) {
      const date = new Date(this.currentEquipement.date_acquisition);
      date.setMonth(date.getMonth() + Number(this.currentEquipement.garantie_mois));
      this.currentEquipement.date_fin_garantie = date.toISOString().split('T')[0];
    }
  }
  
  calculerProchaineMaintenance() {
    if (this.currentEquipement.date_derniere_maintenance && this.currentEquipement.frequence_maintenance_jours) {
      const date = new Date(this.currentEquipement.date_derniere_maintenance);
      date.setDate(date.getDate() + Number(this.currentEquipement.frequence_maintenance_jours));
      this.currentEquipement.date_prochaine_maintenance = date.toISOString().split('T')[0];
    }
  }
  
  saveEquipement() {
    if (this.editMode && this.currentEquipement.id) {
      const index = this.equipements.findIndex(e => e.id === this.currentEquipement.id);
      if (index !== -1) {
        this.equipements[index] = { ...this.currentEquipement } as Equipement;
        this.showSuccess('Équipement modifié');
      }
    } else {
      const newEquipement = { ...this.currentEquipement, id: Date.now() } as Equipement;
      this.equipements.push(newEquipement);
      this.showSuccess('Équipement ajouté');
    }
    this.saveEquipements();
    this.filterEquipements();
    this.cancelForm();
  }
  
  editEquipement(e: Equipement) {
    this.currentEquipement = { ...e };
    this.editMode = true;
    this.showForm = true;
  }
  
  duplicateEquipement(e: Equipement) {
    const newEquipement = { 
      ...e, 
      id: Date.now(), 
      code: this.generateCode(),
      nom: e.nom + ' (copie)'
    };
    this.equipements.push(newEquipement);
    this.saveEquipements();
    this.filterEquipements();
    this.showSuccess('Équipement dupliqué');
  }
  
  viewDetails(e: Equipement) {
    this.selectedEquipement = e;
    this.showDetailsModal = true;
  }
  
  confirmDelete(e: Equipement) {
    this.equipementToDelete = e;
    this.showDeleteModal = true;
  }
  
  deleteEquipement() {
    if (this.equipementToDelete) {
      this.equipements = this.equipements.filter(e => e.id !== this.equipementToDelete?.id);
      this.saveEquipements();
      this.filterEquipements();
      this.showDeleteModal = false;
      this.equipementToDelete = null;
      this.showSuccess('Équipement supprimé');
    }
  }
  
  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }
  
  filterEquipements() {
    let filtered = this.equipements;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.nom?.toLowerCase().includes(term) ||
        e.code?.toLowerCase().includes(term) ||
        e.marque?.toLowerCase().includes(term) ||
        e.numero_serie?.toLowerCase().includes(term)
      );
    }
    
    if (this.typeFilter) {
      filtered = filtered.filter(e => e.type === this.typeFilter);
    }
    
    if (this.etatFilter) {
      filtered = filtered.filter(e => e.etat === this.etatFilter);
    }
    
    this.filteredEquipements = filtered;
  }
  
  getOperationnelCount(): number {
    return this.equipements.filter(e => e.etat === 'operationnel').length;
  }
  
  getMaintenanceCount(): number {
    return this.equipements.filter(e => e.etat === 'maintenance').length;
  }
  
  getPanneCount(): number {
    return this.equipements.filter(e => e.etat === 'panne').length;
  }
  
  getTypeIcon(type: string): string {
    switch(type) {
      case 'machine': return '🏭';
      case 'outil': return '🔧';
      case 'instrument': return '📏';
      case 'vehicule': return '🚛';
      default: return '⚙️';
    }
  }
  
  isMaintenanceDue(e: Equipement): boolean {
    if (!e.date_prochaine_maintenance) return false;
    const today = new Date();
    const prochaine = new Date(e.date_prochaine_maintenance);
    const diffTime = prochaine.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  }
  
  isGarantieExpiree(e: Equipement): boolean {
    if (!e.date_fin_garantie) return false;
    return new Date(e.date_fin_garantie) < new Date();
  }
  
  getJoursAvantMaintenance(e: Equipement): number {
    if (!e.date_prochaine_maintenance) return 0;
    const today = new Date();
    const prochaine = new Date(e.date_prochaine_maintenance);
    const diffTime = prochaine.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  getEtatLabel(etat: string): string {
    const labels: any = { 
      operationnel: '✅ Opérationnel', 
      maintenance: '🔧 En maintenance', 
      panne: '⚠️ En panne', 
      hors_service: '❌ Hors service' 
    };
    return labels[etat] || etat;
  }
  
  getDispoLabel(dispo: string): string {
    const labels: any = { disponible: '🟢 Disponible', occupe: '🟡 Occupé', reserve: '🔵 Réservé' };
    return labels[dispo] || dispo;
  }
  
exportToExcel() {
  if (!this.filteredEquipements || this.filteredEquipements.length === 0) {
    alert('Aucune donnée à exporter');
    return;
  }
  const firstItem = this.filteredEquipements[0] || {};
  const colonnes = Object.keys(firstItem).filter(k => !['id', 'created_at', 'updated_at'].includes(k));
  const lignes = this.filteredEquipements.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ''));
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
  if (!this.filteredEquipements || this.filteredEquipements.length === 0) {
    alert('Aucune donnée à exporter');
    return;
  }
  const firstItem = this.filteredEquipements[0] || {};
  const colonnes = Object.keys(firstItem).filter(k => !['id', 'created_at', 'updated_at'].includes(k));
  const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join('')}</tr>\n</thead>\n<tbody>${this.filteredEquipements.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : '-'}</td>`).join('')}</tr>`).join('')}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
  const win = window.open('', '_blank');
  if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert('Veuillez autoriser les pop-ups pour exporter en PDF'); }
}

showSuccess(msg: string) {
  this.successMessage = msg;
  setTimeout(() => this.successMessage = '', 3000);
}
}