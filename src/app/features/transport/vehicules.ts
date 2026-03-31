import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Vehicule {
  id?: number;
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number;
  couleur: string;
  type: 'camion' | 'remorque' | 'utilitaire' | 'poids_lourd' | 'frigorifique';
  capacite_charge: number;
  volume: number;
  dimensions: string;
  consommation: number;
  carburant: 'diesel' | 'essence' | 'electrique' | 'hybride';
  statut: 'disponible' | 'en_trajet' | 'en_maintenance' | 'hors_service';
  derniere_maintenance: string;
  prochaine_maintenance: string;
  kilometrage: number;
  assurance: string;
  assurance_validite: string;
  visite_technique: string;
  vignette: string;
  documents: VehiculeDocument[];
  entretiens: Entretien[];
  affectations: Affectation[];
  conducteur_principal?: string;
  contact?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

interface VehiculeDocument {
  id?: number;
  type: string;
  nom: string;
  url: string;
  date_expiration?: string;
  date_upload: string;
}

interface Entretien {
  id?: number;
  date: string;
  type: 'vidange' | 'revision' | 'pneumatiques' | 'freinage' | 'moteur' | 'autres';
  kilometrage: number;
  cout: number;
  prestataire: string;
  facture?: string;
  notes?: string;
}

interface Affectation {
  id?: number;
  date_debut: string;
  date_fin?: string;
  chauffeur_id: number;
  chauffeur_nom?: string;
  trajet_id?: number;
  trajet_reference?: string;
}

@Component({
  selector: 'app-vehicules',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="vehicules-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>🚛 Parc Automobile</h1>
          <p class="subtitle">{{ vehicules.length }} véhicule(s) • {{ getVehiculesDisponibles() }} disponible(s) • {{ getKilometrageTotal() | number }} km total</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="vehicules.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="vehicules.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouveau véhicule</button>
        </div>
      </div>

      <!-- Message de succès -->
      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="vehicules.length > 0">
        <div class="kpi-card total">
          <div class="kpi-icon">🚛</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ vehicules.length }}</span>
            <span class="kpi-label">Total véhicules</span>
          </div>
        </div>
        <div class="kpi-card dispo">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getVehiculesDisponibles() }}</span>
            <span class="kpi-label">Disponibles</span>
          </div>
        </div>
        <div class="kpi-card en_trajet">
          <div class="kpi-icon">🔄</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getVehiculesEnTrajet() }}</span>
            <span class="kpi-label">En trajet</span>
          </div>
        </div>
        <div class="kpi-card maintenance">
          <div class="kpi-icon">🔧</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getVehiculesMaintenance() }}</span>
            <span class="kpi-label">En maintenance</span>
          </div>
        </div>
        <div class="kpi-card km">
          <div class="kpi-icon">📊</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getKilometrageMoyen() | number }} <small>km</small></span>
            <span class="kpi-label">Km moyen</span>
          </div>
        </div>
        <div class="kpi-card entretien">
          <div class="kpi-icon">⏰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getEntretiensProches() }}</span>
            <span class="kpi-label">Entretien proche</span>
          </div>
        </div>
      </div>

      <!-- Formulaire moderne avec onglets -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouveau' }} véhicule</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveVehicule()">
              <div class="tabs">
                <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">🚛 Informations</button>
                <button type="button" [class.active]="activeTab === 'caracteristiques'" (click)="activeTab = 'caracteristiques'">⚙️ Caractéristiques</button>
                <button type="button" [class.active]="activeTab === 'entretien'" (click)="activeTab = 'entretien'">🔧 Entretien</button>
                <button type="button" [class.active]="activeTab === 'documents'" (click)="activeTab = 'documents'">📎 Documents</button>
              </div>

              <!-- Onglet Informations -->
              <div *ngIf="activeTab === 'info'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>Immatriculation *</label>
                    <input type="text" [(ngModel)]="currentVehicule.immatriculation" required placeholder="AB-123-CD" class="uppercase">
                  </div>
                  <div class="form-group">
                    <label>Statut</label>
                    <select [(ngModel)]="currentVehicule.statut" class="statut-select" [class]="currentVehicule.statut">
                      <option value="disponible">✅ Disponible</option>
                      <option value="en_trajet">🔄 En trajet</option>
                      <option value="en_maintenance">🔧 En maintenance</option>
                      <option value="hors_service">❌ Hors service</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Marque</label>
                    <input type="text" [(ngModel)]="currentVehicule.marque" placeholder="Renault, Mercedes, Volvo...">
                  </div>
                  <div class="form-group">
                    <label>Modèle</label>
                    <input type="text" [(ngModel)]="currentVehicule.modele">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Année</label>
                    <input type="number" [(ngModel)]="currentVehicule.annee" min="1990" max="2025">
                  </div>
                  <div class="form-group">
                    <label>Couleur</label>
                    <input type="text" [(ngModel)]="currentVehicule.couleur">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Conducteur principal</label>
                    <input type="text" [(ngModel)]="currentVehicule.conducteur_principal">
                  </div>
                  <div class="form-group">
                    <label>Contact</label>
                    <input type="tel" [(ngModel)]="currentVehicule.contact">
                  </div>
                </div>
                <div class="form-group">
                  <label>📝 Notes</label>
                  <textarea [(ngModel)]="currentVehicule.notes" rows="2"></textarea>
                </div>
              </div>

              <!-- Onglet Caractéristiques -->
              <div *ngIf="activeTab === 'caracteristiques'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>Type de véhicule</label>
                    <select [(ngModel)]="currentVehicule.type">
                      <option value="camion">🚛 Camion</option>
                      <option value="remorque">🔗 Remorque</option>
                      <option value="utilitaire">📦 Utilitaire</option>
                      <option value="poids_lourd">⚖️ Poids lourd</option>
                      <option value="frigorifique">❄️ Frigorifique</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Carburant</label>
                    <select [(ngModel)]="currentVehicule.carburant">
                      <option value="diesel">⛽ Diesel</option>
                      <option value="essence">⛽ Essence</option>
                      <option value="electrique">🔋 Électrique</option>
                      <option value="hybride">⚡ Hybride</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Capacité de charge (kg)</label>
                    <input type="number" [(ngModel)]="currentVehicule.capacite_charge" step="500">
                  </div>
                  <div class="form-group">
                    <label>Volume (m³)</label>
                    <input type="number" [(ngModel)]="currentVehicule.volume" step="5">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Dimensions (L x l x h)</label>
                    <input type="text" [(ngModel)]="currentVehicule.dimensions" placeholder="6.0 x 2.5 x 2.5 m">
                  </div>
                  <div class="form-group">
                    <label>Consommation (L/100km)</label>
                    <input type="number" [(ngModel)]="currentVehicule.consommation" step="0.5">
                  </div>
                </div>
                <div class="form-group">
                  <label>Kilométrage actuel (km)</label>
                  <input type="number" [(ngModel)]="currentVehicule.kilometrage" step="1000">
                </div>
              </div>

              <!-- Onglet Entretien -->
              <div *ngIf="activeTab === 'entretien'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>Dernière maintenance</label>
                    <input type="date" [(ngModel)]="currentVehicule.derniere_maintenance">
                  </div>
                  <div class="form-group">
                    <label>Prochaine maintenance</label>
                    <input type="date" [(ngModel)]="currentVehicule.prochaine_maintenance" [class.overdue]="isMaintenanceOverdue()">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Assurance</label>
                    <input type="text" [(ngModel)]="currentVehicule.assurance" placeholder="Compagnie d'assurance">
                  </div>
                  <div class="form-group">
                    <label>Validité assurance</label>
                    <input type="date" [(ngModel)]="currentVehicule.assurance_validite" [class.overdue]="isAssuranceOverdue()">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Visite technique</label>
                    <input type="date" [(ngModel)]="currentVehicule.visite_technique" [class.overdue]="isVisiteOverdue()">
                  </div>
                  <div class="form-group">
                    <label>Vignette</label>
                    <input type="text" [(ngModel)]="currentVehicule.vignette">
                  </div>
                </div>

                <div class="entretiens-header">
                  <h4>📋 Historique des entretiens</h4>
                  <button type="button" class="btn-add" (click)="addEntretien()">+ Ajouter entretien</button>
                </div>
                <div class="entretiens-list" *ngIf="currentVehicule.entretiens && currentVehicule.entretiens.length > 0; else noEntretiens">
                  <div class="entretien-item" *ngFor="let e of currentVehicule.entretiens; let i = index">
                    <div class="entretien-date">{{ e.date | date:'dd/MM/yyyy' }}</div>
                    <div class="entretien-type">{{ getEntretienTypeLabel(e.type) }}</div>
                    <div class="entretien-km">{{ e.kilometrage | number }} km</div>
                    <div class="entretien-cout">{{ e.cout | number }} FCFA</div>
                    <div class="entretien-actions">
                      <button type="button" (click)="removeEntretien(i)" class="remove-btn">🗑️</button>
                    </div>
                  </div>
                </div>
                <ng-template #noEntretiens>
                  <div class="no-data">Aucun entretien enregistré</div>
                </ng-template>
              </div>

              <!-- Onglet Documents -->
              <div *ngIf="activeTab === 'documents'" class="tab-content">
                <div class="documents-header">
                  <h4>📎 Documents administratifs</h4>
                  <button type="button" class="btn-add" (click)="addDocument()">+ Ajouter document</button>
                </div>
                <div class="documents-list" *ngIf="currentVehicule.documents && currentVehicule.documents.length > 0; else noDocs">
                  <div class="doc-item" *ngFor="let d of currentVehicule.documents; let i = index">
                    <div class="doc-icon">📄</div>
                    <div class="doc-info">
                      <div class="doc-name">{{ d.nom }}</div>
                      <div class="doc-type">{{ d.type }}</div>
                      <div class="doc-expiration" *ngIf="d.date_expiration" [class.expired]="isExpired(d.date_expiration)">
                        Expire le {{ d.date_expiration | date:'dd/MM/yyyy' }}
                      </div>
                    </div>
                    <div class="doc-actions">
                      <button type="button" (click)="viewDocument(d)" class="doc-btn">👁️</button>
                      <button type="button" (click)="removeDocument(i)" class="doc-btn delete">🗑️</button>
                    </div>
                  </div>
                </div>
                <ng-template #noDocs>
                  <div class="no-data">Aucun document attaché</div>
                </ng-template>
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
      <div class="filters-section" *ngIf="vehicules.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterVehicules()" placeholder="Rechercher par immatriculation, marque..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterVehicules()" class="filter-select">
            <option value="">📊 Tous statuts</option>
            <option value="disponible">✅ Disponible</option>
            <option value="en_trajet">🔄 En trajet</option>
            <option value="en_maintenance">🔧 En maintenance</option>
            <option value="hors_service">❌ Hors service</option>
          </select>
          <select [(ngModel)]="typeFilter" (ngModelChange)="filterVehicules()" class="filter-select">
            <option value="">🚛 Tous types</option>
            <option value="camion">Camion</option>
            <option value="remorque">Remorque</option>
            <option value="utilitaire">Utilitaire</option>
            <option value="poids_lourd">Poids lourd</option>
            <option value="frigorifique">Frigorifique</option>
          </select>
        </div>
      </div>

      <!-- Liste des véhicules -->
      <div class="vehicules-section" *ngIf="vehicules.length > 0; else emptyState">
        <div class="section-header">
          <h2>🚛 Parc automobile</h2>
          <div class="header-stats">
            <span class="stat-badge">{{ filteredVehicules.length }} / {{ vehicules.length }} affiché(s)</span>
          </div>
        </div>
        
        <div class="vehicules-grid">
          <div class="vehicule-card" *ngFor="let v of filteredVehicules" [class]="v.statut">
            <div class="card-header">
              <div class="header-left">
                <div class="vehicule-icon">{{ getTypeIcon(v.type) }}</div>
                <div class="vehicule-info">
                  <div class="vehicule-immatriculation">{{ v.immatriculation }}</div>
                  <div class="vehicule-modele">{{ v.marque }} {{ v.modele }} ({{ v.annee }})</div>
                </div>
              </div>
              <div class="header-right">
                <span class="statut-badge" [class]="v.statut">{{ getStatutLabel(v.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">📊 Km:</span>
                <span class="info-value">{{ v.kilometrage | number }} km</span>
              </div>
              <div class="info-row">
                <span class="info-label">⚖️ Charge:</span>
                <span class="info-value">{{ v.capacite_charge | number }} kg</span>
              </div>
              <div class="info-row">
                <span class="info-label">⛽ Carburant:</span>
                <span class="info-value">{{ getCarburantLabel(v.carburant) }}</span>
              </div>
              <div class="info-row" *ngIf="v.conducteur_principal">
                <span class="info-label">👤 Chauffeur:</span>
                <span class="info-value">{{ v.conducteur_principal }}</span>
              </div>
              <div class="warning-alert" *ngIf="isMaintenanceProche(v)">
                ⚠️ Maintenance dans {{ getJoursRestants(v.prochaine_maintenance) }} jours
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="viewDetails(v)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="editVehicule(v)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="voirHistorique(v)" title="Historique">📋</button>
                <button class="action-icon" (click)="planifierEntretien(v)" title="Planifier entretien">🔧</button>
                <button class="action-icon delete" (click)="confirmDelete(v)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🚛</div>
          <h2>Aucun véhicule</h2>
          <p>Ajoutez votre premier véhicule au parc</p>
          <button class="btn-primary" (click)="openForm()">+ Nouveau véhicule</button>
        </div>
      </ng-template>

      <!-- Modal Détails -->
      <div class="modal-overlay" *ngIf="showDetailsModal && selectedVehicule">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ selectedVehicule.immatriculation }} - {{ selectedVehicule.marque }} {{ selectedVehicule.modele }}</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="details-grid">
              <div class="detail-section">
                <h4>📋 Informations générales</h4>
                <p><strong>Immatriculation:</strong> {{ selectedVehicule.immatriculation }}</p>
                <p><strong>Marque/Modèle:</strong> {{ selectedVehicule.marque }} {{ selectedVehicule.modele }}</p>
                <p><strong>Année:</strong> {{ selectedVehicule.annee }}</p>
                <p><strong>Couleur:</strong> {{ selectedVehicule.couleur }}</p>
                <p><strong>Statut:</strong> {{ getStatutLabel(selectedVehicule.statut) }}</p>
                <p><strong>Type:</strong> {{ getTypeLabel(selectedVehicule.type) }}</p>
              </div>
              <div class="detail-section">
                <h4>⚙️ Caractéristiques</h4>
                <p><strong>Capacité charge:</strong> {{ selectedVehicule.capacite_charge | number }} kg</p>
                <p><strong>Volume:</strong> {{ selectedVehicule.volume }} m³</p>
                <p><strong>Dimensions:</strong> {{ selectedVehicule.dimensions }}</p>
                <p><strong>Consommation:</strong> {{ selectedVehicule.consommation }} L/100km</p>
                <p><strong>Carburant:</strong> {{ getCarburantLabel(selectedVehicule.carburant) }}</p>
                <p><strong>Kilométrage:</strong> {{ selectedVehicule.kilometrage | number }} km</p>
              </div>
              <div class="detail-section">
                <h4>🔧 Entretien</h4>
                <p><strong>Dernière maintenance:</strong> {{ selectedVehicule.derniere_maintenance | date:'dd/MM/yyyy' }}</p>
                <p><strong>Prochaine maintenance:</strong> {{ selectedVehicule.prochaine_maintenance | date:'dd/MM/yyyy' }}</p>
                <p><strong>Assurance:</strong> {{ selectedVehicule.assurance }}</p>
                <p><strong>Validité assurance:</strong> {{ selectedVehicule.assurance_validite | date:'dd/MM/yyyy' }}</p>
                <p><strong>Visite technique:</strong> {{ selectedVehicule.visite_technique | date:'dd/MM/yyyy' }}</p>
              </div>
              <div class="detail-section">
                <h4>👤 Conducteur</h4>
                <p><strong>Conducteur principal:</strong> {{ selectedVehicule.conducteur_principal || '-' }}</p>
                <p><strong>Contact:</strong> {{ selectedVehicule.contact || '-' }}</p>
              </div>
              <div class="detail-section full-width" *ngIf="selectedVehicule.entretiens?.length">
                <h4>📋 Historique des entretiens</h4>
                <table class="details-table">
                  <thead>
                    <tr><th>Date</th><th>Type</th><th>Km</th><th>Coût</th><th>Prestataire</th></tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let e of selectedVehicule.entretiens">
                      <td>{{ e.date | date:'dd/MM/yyyy' }}</td>
                      <td>{{ getEntretienTypeLabel(e.type) }}</td>
                      <td>{{ e.kilometrage | number }} km</td>
                      <td>{{ e.cout | number }} FCFA</td>
                      <td>{{ e.prestataire }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Suppression -->
      <div class="modal-overlay" *ngIf="showDeleteModal">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>🗑️ Supprimer le véhicule</h3>
            <button class="modal-close" (click)="showDeleteModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p>Supprimer le véhicule <strong>{{ vehiculeToDelete?.immatriculation }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteVehicule()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vehicules-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-add:hover, .btn-primary:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
    .btn-excel { background: #10B981; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-pdf { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .alert-success { background: #10B981; color: white; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    
    .kpi-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 20px; margin-bottom: 24px; }
    .kpi-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.2s; }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .kpi-icon { font-size: 32px; width: 56px; height: 56px; background: #FDF2F8; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .kpi-content { flex: 1; }
    .kpi-value { display: block; font-size: 24px; font-weight: 700; }
    .kpi-value small { font-size: 12px; font-weight: 400; color: #6B7280; }
    .kpi-label { font-size: 13px; color: #6B7280; margin-top: 4px; }
    .kpi-card.total .kpi-value { color: #EC4899; }
    .kpi-card.dispo .kpi-value { color: #10B981; }
    .kpi-card.en_trajet .kpi-value { color: #3B82F6; }
    .kpi-card.maintenance .kpi-value { color: #F59E0B; }
    .kpi-card.km .kpi-value { color: #8B5CF6; }
    .kpi-card.entretien .kpi-value { color: #EF4444; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 900px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
    .modal-container.large { max-width: 1000px; }
    .modal-container.small { max-width: 450px; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #F3F4F6; }
    .modal-header h3 { margin: 0; color: #EC4899; }
    .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #9CA3AF; }
    .modal-body { padding: 24px; }
    
    .tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #F3F4F6; padding-bottom: 10px; flex-wrap: wrap; }
    .tabs button { background: none; border: none; padding: 8px 16px; cursor: pointer; color: #6B7280; border-radius: 20px; transition: all 0.2s; }
    .tabs button.active { background: #EC4899; color: white; }
    
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .form-group { display: flex; flex-direction: column; margin-bottom: 16px; }
    .form-group label { margin-bottom: 8px; color: #4B5563; font-weight: 500; font-size: 14px; }
    .form-group input, .form-group textarea, .form-group select { padding: 12px; border: 2px solid #F3F4F6; border-radius: 10px; font-size: 14px; transition: border-color 0.2s; }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #EC4899; }
    .uppercase { text-transform: uppercase; }
    .overdue { border-color: #EF4444; background: #FEF2F2; }
    
    .entretiens-header, .documents-header { display: flex; justify-content: space-between; align-items: center; margin: 20px 0 12px; flex-wrap: wrap; }
    .entretiens-list, .documents-list { border: 1px solid #F3F4F6; border-radius: 12px; overflow: hidden; }
    .entretien-item, .doc-item { display: flex; align-items: center; gap: 16px; padding: 12px; border-bottom: 1px solid #F3F4F6; }
    .entretien-item:last-child, .doc-item:last-child { border-bottom: none; }
    .entretien-date { min-width: 100px; font-weight: 500; }
    .entretien-type { min-width: 120px; }
    .entretien-km { min-width: 100px; text-align: right; }
    .entretien-cout { min-width: 120px; text-align: right; color: #EC4899; }
    .doc-icon { font-size: 24px; }
    .doc-info { flex: 1; }
    .doc-name { font-weight: 500; }
    .doc-type { font-size: 12px; color: #6B7280; }
    .doc-expiration { font-size: 11px; margin-top: 4px; }
    .doc-expiration.expired { color: #EF4444; }
    .remove-btn, .doc-btn { background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
    .remove-btn:hover, .doc-btn:hover { background: #FEE2E2; }
    .no-data { text-align: center; padding: 40px; background: #F9FAFB; border-radius: 12px; color: #6B7280; }
    
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 2; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    
    .vehicules-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; background: #FEF3F9; color: #EC4899; }
    
    .vehicules-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .vehicule-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .vehicule-card.disponible { border-left-color: #10B981; }
    .vehicule-card.en_trajet { border-left-color: #3B82F6; }
    .vehicule-card.en_maintenance { border-left-color: #F59E0B; }
    .vehicule-card.hors_service { border-left-color: #EF4444; opacity: 0.7; }
    .vehicule-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; }
    .vehicule-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .vehicule-immatriculation { font-weight: 700; color: #1F2937; font-family: monospace; font-size: 16px; }
    .vehicule-modele { font-size: 13px; color: #6B7280; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.disponible { background: #DCFCE7; color: #16A34A; }
    .statut-badge.en_trajet { background: #DBEAFE; color: #1E40AF; }
    .statut-badge.en_maintenance { background: #FEF3C7; color: #D97706; }
    .statut-badge.hors_service { background: #FEE2E2; color: #EF4444; }
    .card-body { margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .info-label { color: #6B7280; }
    .info-value { font-weight: 500; color: #1F2937; }
    .warning-alert { background: #FEF3C7; color: #D97706; padding: 8px 12px; border-radius: 8px; font-size: 12px; margin-top: 12px; }
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
    .details-table { width: 100%; border-collapse: collapse; }
    .details-table th, .details-table td { padding: 8px; text-align: left; border-bottom: 1px solid #F3F4F6; }
    .details-table th { background: #F9FAFB; font-weight: 600; color: #6B7280; }
    
    @media (max-width: 1200px) { .kpi-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; gap: 12px; } .kpi-grid { grid-template-columns: repeat(2, 1fr); } .vehicules-grid { grid-template-columns: 1fr; } .filter-group { flex-direction: column; } .details-grid { grid-template-columns: 1fr; } .detail-section.full-width { grid-column: span 1; } }
  `]
})
export class Vehicules implements OnInit {
  vehicules: Vehicule[] = [];
  filteredVehicules: Vehicule[] = [];
  
  searchTerm = '';
  statutFilter = '';
  typeFilter = '';
  activeTab = 'info';
  showForm = false;
  showDetailsModal = false;
  showDeleteModal = false;
  editMode = false;
  selectedVehicule: Vehicule | null = null;
  vehiculeToDelete: Vehicule | null = null;
  successMessage = '';
  
  currentVehicule: Partial<Vehicule> = {
    immatriculation: '',
    marque: '',
    modele: '',
    annee: new Date().getFullYear(),
    couleur: '',
    type: 'camion',
    capacite_charge: 0,
    volume: 0,
    dimensions: '',
    consommation: 0,
    carburant: 'diesel',
    statut: 'disponible',
    kilometrage: 0,
    entretiens: [],
    documents: []
  };
  
  ngOnInit() {
    this.loadVehicules();
  }
  
  loadVehicules() {
    const saved = localStorage.getItem('vehicules');
    this.vehicules = saved ? JSON.parse(saved) : [];
    this.filteredVehicules = [...this.vehicules];
  }
  
  saveVehiculesToStorage() {
    localStorage.setItem('vehicules', JSON.stringify(this.vehicules));
  }
  
  openForm() {
    this.currentVehicule = {
      immatriculation: '',
      marque: '',
      modele: '',
      annee: new Date().getFullYear(),
      couleur: '',
      type: 'camion',
      capacite_charge: 0,
      volume: 0,
      dimensions: '',
      consommation: 0,
      carburant: 'diesel',
      statut: 'disponible',
      kilometrage: 0,
      entretiens: [],
      documents: []
    };
    this.editMode = false;
    this.showForm = true;
    this.activeTab = 'info';
  }
  
  addEntretien() {
    if (!this.currentVehicule.entretiens) {
      this.currentVehicule.entretiens = [];
    }
    this.currentVehicule.entretiens.push({
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: 'autres',
      kilometrage: this.currentVehicule.kilometrage || 0,
      cout: 0,
      prestataire: '',
      notes: ''
    });
  }
  
  removeEntretien(index: number) {
    if (this.currentVehicule.entretiens) {
      this.currentVehicule.entretiens.splice(index, 1);
    }
  }
  
  addDocument() {
    if (!this.currentVehicule.documents) {
      this.currentVehicule.documents = [];
    }
    this.currentVehicule.documents.push({
      id: Date.now(),
      type: 'Autre',
      nom: 'Nouveau document',
      url: '',
      date_upload: new Date().toISOString()
    });
  }
  
  removeDocument(index: number) {
    if (this.currentVehicule.documents) {
      this.currentVehicule.documents.splice(index, 1);
    }
  }
  
  viewDocument(doc: VehiculeDocument) {
    alert(`Ouverture du document: ${doc.nom}`);
  }
  
  saveVehicule() {
    if (!this.currentVehicule.immatriculation) {
      alert('L\'immatriculation est requise');
      return;
    }
    
    if (this.editMode && this.currentVehicule.id) {
      const index = this.vehicules.findIndex(v => v.id === this.currentVehicule.id);
      if (index !== -1) {
        this.vehicules[index] = { ...this.currentVehicule, updated_at: new Date().toISOString() } as Vehicule;
        this.showSuccess('Véhicule modifié');
      }
    } else {
      this.vehicules.push({ 
        ...this.currentVehicule, 
        id: Date.now(), 
        created_at: new Date().toISOString() 
      } as Vehicule);
      this.showSuccess('Véhicule ajouté');
    }
    this.saveVehiculesToStorage();
    this.filterVehicules();
    this.cancelForm();
  }
  
  editVehicule(v: Vehicule) {
    this.currentVehicule = { ...v };
    if (!this.currentVehicule.entretiens) this.currentVehicule.entretiens = [];
    if (!this.currentVehicule.documents) this.currentVehicule.documents = [];
    this.editMode = true;
    this.showForm = true;
    this.activeTab = 'info';
  }
  
  viewDetails(v: Vehicule) {
    this.selectedVehicule = v;
    this.showDetailsModal = true;
  }
  
  voirHistorique(v: Vehicule) {
    this.viewDetails(v);
  }
  
  planifierEntretien(v: Vehicule) {
    alert(`Planifier un entretien pour ${v.immatriculation}`);
  }
  
  confirmDelete(v: Vehicule) {
    this.vehiculeToDelete = v;
    this.showDeleteModal = true;
  }
  
  deleteVehicule() {
    if (this.vehiculeToDelete) {
      this.vehicules = this.vehicules.filter(v => v.id !== this.vehiculeToDelete?.id);
      this.saveVehiculesToStorage();
      this.filterVehicules();
      this.showDeleteModal = false;
      this.vehiculeToDelete = null;
      this.showSuccess('Véhicule supprimé');
    }
  }
  
  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }
  
  filterVehicules() {
    let filtered = [...this.vehicules];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(v => 
        v.immatriculation?.toLowerCase().includes(term) || 
        v.marque?.toLowerCase().includes(term) ||
        v.modele?.toLowerCase().includes(term)
      );
    }
    
    if (this.statutFilter) {
      filtered = filtered.filter(v => v.statut === this.statutFilter);
    }
    
    if (this.typeFilter) {
      filtered = filtered.filter(v => v.type === this.typeFilter);
    }
    
    this.filteredVehicules = filtered;
  }
  
  getVehiculesDisponibles(): number {
    return this.vehicules.filter(v => v.statut === 'disponible').length;
  }
  
  getVehiculesEnTrajet(): number {
    return this.vehicules.filter(v => v.statut === 'en_trajet').length;
  }
  
  getVehiculesMaintenance(): number {
    return this.vehicules.filter(v => v.statut === 'en_maintenance').length;
  }
  
  getKilometrageTotal(): number {
    return this.vehicules.reduce((sum, v) => sum + (v.kilometrage || 0), 0);
  }
  
  getKilometrageMoyen(): number {
    if (this.vehicules.length === 0) return 0;
    return Math.round(this.getKilometrageTotal() / this.vehicules.length);
  }
  
  getEntretiensProches(): number {
    const today = new Date();
    const in30Days = new Date();
    in30Days.setDate(today.getDate() + 30);
    return this.vehicules.filter(v => {
      const prochaine = v.prochaine_maintenance ? new Date(v.prochaine_maintenance) : null;
      return prochaine && prochaine <= in30Days && prochaine >= today;
    }).length;
  }
  
  isMaintenanceProche(v: Vehicule): boolean {
    if (!v.prochaine_maintenance) return false;
    const today = new Date();
    const prochaine = new Date(v.prochaine_maintenance);
    const in30Days = new Date();
    in30Days.setDate(today.getDate() + 30);
    return prochaine <= in30Days && prochaine >= today;
  }
  
  getJoursRestants(date: string): number {
    if (!date) return 0;
    const today = new Date();
    const target = new Date(date);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return Math.max(0, diff);
  }
  
  isMaintenanceOverdue(): boolean {
    if (!this.currentVehicule.prochaine_maintenance) return false;
    return new Date(this.currentVehicule.prochaine_maintenance) < new Date();
  }
  
  isAssuranceOverdue(): boolean {
    if (!this.currentVehicule.assurance_validite) return false;
    return new Date(this.currentVehicule.assurance_validite) < new Date();
  }
  
  isVisiteOverdue(): boolean {
    if (!this.currentVehicule.visite_technique) return false;
    return new Date(this.currentVehicule.visite_technique) < new Date();
  }
  
  isExpired(date: string): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }
  
  getTypeIcon(type: string): string {
    const icons: any = {
      camion: '🚛',
      remorque: '🔗',
      utilitaire: '📦',
      poids_lourd: '⚖️',
      frigorifique: '❄️'
    };
    return icons[type] || '🚗';
  }
  
  getTypeLabel(type: string): string {
    const labels: any = {
      camion: 'Camion',
      remorque: 'Remorque',
      utilitaire: 'Utilitaire',
      poids_lourd: 'Poids lourd',
      frigorifique: 'Frigorifique'
    };
    return labels[type] || type;
  }
  
  getCarburantLabel(carburant: string): string {
    const labels: any = {
      diesel: '⛽ Diesel',
      essence: '⛽ Essence',
      electrique: '🔋 Électrique',
      hybride: '⚡ Hybride'
    };
    return labels[carburant] || carburant;
  }
  
  getStatutLabel(statut: string): string {
    const labels: any = {
      disponible: '✅ Disponible',
      en_trajet: '🔄 En trajet',
      en_maintenance: '🔧 En maintenance',
      hors_service: '❌ Hors service'
    };
    return labels[statut] || statut;
  }
  
  getEntretienTypeLabel(type: string): string {
    const labels: any = {
      vidange: 'Vidange',
      revision: 'Révision',
      pneumatiques: 'Pneumatiques',
      freinage: 'Freinage',
      moteur: 'Moteur',
      autres: 'Autres'
    };
    return labels[type] || type;
  }
  
    exportToExcel() {
    if (!this.filteredVehicules || this.filteredVehicules.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredVehicules[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const lignes = this.filteredVehicules.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ""));
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
    if (!this.filteredVehicules || this.filteredVehicules.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredVehicules[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join("")}</tr>\n</thead>\n<tbody>${this.filteredVehicules.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : "-"}</td>`).join("")}</tr>`).join("")}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert("Veuillez autoriser les pop-ups pour exporter en PDF"); }
  }
  showSuccess(msg: string) { this.successMessage = msg; setTimeout(() => this.successMessage = '', 3000); }
}