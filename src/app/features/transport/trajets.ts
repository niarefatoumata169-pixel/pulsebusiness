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
  documents: any[];
  entretiens: any[];
  affectations: any[];
  conducteur_principal?: string;
  contact?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

interface Cargaison {
  id?: number;
  designation: string;
  quantite: number;
  unite: string;
  poids: number;
  volume: number;
  valeur: number;
  expediteur: string;
  destinataire: string;
  instructions?: string;
}

interface EvenementTrajet {
  id?: number;
  date: string;
  lieu: string;
  type: 'depart' | 'arrivee' | 'escale' | 'incident' | 'controle';
  description: string;
  utilisateur: string;
}

interface Trajet {
  id?: number;
  reference: string;
  vehicule_id: number;
  vehicule_immatriculation?: string;
  chauffeur_id: number;
  chauffeur_nom?: string;
  date_depart: string;
  date_arrivee_prevue: string;
  date_arrivee_reelle?: string;
  lieu_depart: string;
  lieu_arrivee: string;
  distance_km: number;
  duree_estimee: number;
  duree_reelle?: number;
  type: 'national' | 'international' | 'urbain';
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule' | 'retarde';
  cargaison: Cargaison[];
  evenements: EvenementTrajet[];
  consommation_carburant?: number;
  frais_peage?: number;
  frais_divers?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

@Component({
  selector: 'app-trajets',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="trajets-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>🗺️ Gestion des Trajets</h1>
          <p class="subtitle">{{ trajets.length }} trajet(s) • {{ getTrajetsEnCours() }} en cours • {{ getDistanceTotale() | number }} km parcourus</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="trajets.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="trajets.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouveau trajet</button>
        </div>
      </div>

      <!-- Message de succès -->
      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="trajets.length > 0">
        <div class="kpi-card total">
          <div class="kpi-icon">🗺️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ trajets.length }}</span>
            <span class="kpi-label">Total trajets</span>
          </div>
        </div>
        <div class="kpi-card en_cours">
          <div class="kpi-icon">🔄</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getTrajetsEnCours() }}</span>
            <span class="kpi-label">En cours</span>
          </div>
        </div>
        <div class="kpi-card distance">
          <div class="kpi-icon">📏</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getDistanceTotale() | number }} <small>km</small></span>
            <span class="kpi-label">Distance totale</span>
          </div>
        </div>
        <div class="kpi-card ponctualite">
          <div class="kpi-icon">⏱️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getTauxPonctualite() }}%</span>
            <span class="kpi-label">Ponctualité</span>
          </div>
        </div>
        <div class="kpi-card retard">
          <div class="kpi-icon">⚠️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getTrajetsRetard() }}</span>
            <span class="kpi-label">En retard</span>
          </div>
        </div>
        <div class="kpi-card international">
          <div class="kpi-icon">🌍</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getTrajetsInternationaux() }}</span>
            <span class="kpi-label">Internationaux</span>
          </div>
        </div>
      </div>

      <!-- Formulaire moderne avec onglets -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouveau' }} trajet</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveTrajet()">
              <div class="tabs">
                <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">🗺️ Trajet</button>
                <button type="button" [class.active]="activeTab === 'vehicule'" (click)="activeTab = 'vehicule'">🚛 Véhicule/Chauffeur</button>
                <button type="button" [class.active]="activeTab === 'cargaison'" (click)="activeTab = 'cargaison'">📦 Cargaison</button>
                <button type="button" [class.active]="activeTab === 'suivi'" (click)="activeTab = 'suivi'">📍 Suivi</button>
              </div>

              <!-- Onglet Trajet -->
              <div *ngIf="activeTab === 'info'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>Référence *</label>
                    <input type="text" [(ngModel)]="currentTrajet.reference" readonly class="readonly">
                  </div>
                  <div class="form-group">
                    <label>Type de trajet</label>
                    <select [(ngModel)]="currentTrajet.type">
                      <option value="national">🇨🇮 National</option>
                      <option value="international">🌍 International</option>
                      <option value="urbain">🏙️ Urbain</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>📍 Lieu de départ</label>
                    <input type="text" [(ngModel)]="currentTrajet.lieu_depart" placeholder="Ville, pays">
                  </div>
                  <div class="form-group">
                    <label>📍 Lieu d'arrivée</label>
                    <input type="text" [(ngModel)]="currentTrajet.lieu_arrivee" placeholder="Ville, pays">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>📅 Date de départ</label>
                    <input type="datetime-local" [(ngModel)]="currentTrajet.date_depart">
                  </div>
                  <div class="form-group">
                    <label>📅 Date arrivée prévue</label>
                    <input type="datetime-local" [(ngModel)]="currentTrajet.date_arrivee_prevue">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>📏 Distance (km)</label>
                    <input type="number" [(ngModel)]="currentTrajet.distance_km" step="10">
                  </div>
                  <div class="form-group">
                    <label>⏱️ Durée estimée (heures)</label>
                    <input type="number" [(ngModel)]="currentTrajet.duree_estimee" step="0.5">
                  </div>
                </div>
                <div class="form-group">
                  <label>Statut</label>
                  <select [(ngModel)]="currentTrajet.statut" class="statut-select" [class]="currentTrajet.statut">
                    <option value="planifie">📋 Planifié</option>
                    <option value="en_cours">🔄 En cours</option>
                    <option value="termine">✅ Terminé</option>
                    <option value="annule">❌ Annulé</option>
                    <option value="retarde">⚠️ Retardé</option>
                  </select>
                </div>
              </div>

              <!-- Onglet Véhicule/Chauffeur -->
              <div *ngIf="activeTab === 'vehicule'" class="tab-content">
                <div class="form-group">
                  <label>🚛 Véhicule</label>
                  <select [(ngModel)]="currentTrajet.vehicule_id" (change)="onVehiculeChange()">
                    <option [value]="null">Sélectionner un véhicule</option>
                    <option *ngFor="let v of vehiculesDisponibles" [value]="v.id">
                      {{ v.immatriculation }} - {{ v.marque }} {{ v.modele }} ({{ getStatutVehiculeLabel(v.statut) }})
                    </option>
                  </select>
                </div>
                <div class="vehicule-info" *ngIf="selectedVehicule">
                  <div class="info-card">
                    <div class="info-row-detail">
                      <span class="info-label">🚛 Immatriculation:</span>
                      <span class="info-value">{{ selectedVehicule.immatriculation }}</span>
                    </div>
                    <div class="info-row-detail">
                      <span class="info-label">⚖️ Charge max:</span>
                      <span class="info-value">{{ selectedVehicule.capacite_charge | number }} kg</span>
                    </div>
                    <div class="info-row-detail">
                      <span class="info-label">📦 Volume:</span>
                      <span class="info-value">{{ selectedVehicule.volume }} m³</span>
                    </div>
                    <div class="info-row-detail">
                      <span class="info-label">📊 Km actuels:</span>
                      <span class="info-value">{{ selectedVehicule.kilometrage | number }} km</span>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label>👨‍✈️ Chauffeur</label>
                  <select [(ngModel)]="currentTrajet.chauffeur_id" (change)="onChauffeurChange()">
                    <option [value]="null">Sélectionner un chauffeur</option>
                    <option *ngFor="let c of chauffeurs" [value]="c.id">
                      {{ c.nom }} {{ c.prenom }} - {{ c.permis }} ({{ c.disponible ? 'Disponible' : 'Indisponible' }})
                    </option>
                  </select>
                </div>
                <div class="chauffeur-info" *ngIf="selectedChauffeur">
                  <div class="info-card">
                    <div class="info-row-detail">
                      <span class="info-label">👤 Nom:</span>
                      <span class="info-value">{{ selectedChauffeur.nom }} {{ selectedChauffeur.prenom }}</span>
                    </div>
                    <div class="info-row-detail">
                      <span class="info-label">📞 Téléphone:</span>
                      <span class="info-value">{{ selectedChauffeur.telephone }}</span>
                    </div>
                    <div class="info-row-detail">
                      <span class="info-label">📜 Permis:</span>
                      <span class="info-value">{{ selectedChauffeur.permis }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Onglet Cargaison -->
              <div *ngIf="activeTab === 'cargaison'" class="tab-content">
                <div class="cargaison-header">
                  <h4>📦 Marchandises transportées</h4>
                  <button type="button" class="btn-add" (click)="addCargaison()">+ Ajouter cargaison</button>
                </div>
                <div class="cargaison-list" *ngIf="currentTrajet.cargaison && currentTrajet.cargaison.length > 0; else noCargaison">
                  <div class="cargaison-item" *ngFor="let c of currentTrajet.cargaison; let i = index">
                    <div class="cargaison-info">
                      <div class="cargaison-designation"><strong>{{ c.designation }}</strong></div>
                      <div class="cargaison-details">
                        Qté: {{ c.quantite }} {{ c.unite }} • Poids: {{ c.poids }} kg • Volume: {{ c.volume }} m³
                      </div>
                      <div class="cargaison-expedition">
                        Expéditeur: {{ c.expediteur }} → Destinataire: {{ c.destinataire }}
                      </div>
                    </div>
                    <div class="cargaison-actions">
                      <button type="button" (click)="removeCargaison(i)" class="remove-btn">🗑️</button>
                    </div>
                  </div>
                </div>
                <ng-template #noCargaison>
                  <div class="no-data">Aucune cargaison enregistrée</div>
                </ng-template>

                <div class="form-group">
                  <label>📝 Instructions spéciales</label>
                  <textarea [(ngModel)]="currentTrajet.notes" rows="2" placeholder="Instructions de chargement, températures, etc."></textarea>
                </div>
              </div>

              <!-- Onglet Suivi -->
              <div *ngIf="activeTab === 'suivi'" class="tab-content">
                <div class="evenements-header">
                  <h4>📍 Événements du trajet</h4>
                  <button type="button" class="btn-add" (click)="addEvenement()">+ Ajouter événement</button>
                </div>
                <div class="evenements-list" *ngIf="currentTrajet.evenements && currentTrajet.evenements.length > 0; else noEvenements">
                  <div class="evenement-item" *ngFor="let e of currentTrajet.evenements; let i = index">
                    <div class="evenement-date">{{ e.date | date:'dd/MM/yyyy HH:mm' }}</div>
                    <div class="evenement-lieu">{{ e.lieu }}</div>
                    <div class="evenement-type">{{ getEvenementTypeLabel(e.type) }}</div>
                    <div class="evenement-description">{{ e.description }}</div>
                    <div class="evenement-actions">
                      <button type="button" (click)="removeEvenement(i)" class="remove-btn">🗑️</button>
                    </div>
                  </div>
                </div>
                <ng-template #noEvenements>
                  <div class="no-data">Aucun événement enregistré</div>
                </ng-template>

                <div class="form-row">
                  <div class="form-group">
                    <label>⛽ Consommation carburant (L)</label>
                    <input type="number" [(ngModel)]="currentTrajet.consommation_carburant" step="10">
                  </div>
                  <div class="form-group">
                    <label>💰 Frais de péage (FCFA)</label>
                    <input type="number" [(ngModel)]="currentTrajet.frais_peage" step="1000">
                  </div>
                </div>
                <div class="form-group">
                  <label>💰 Frais divers (FCFA)</label>
                  <input type="number" [(ngModel)]="currentTrajet.frais_divers" step="1000">
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
      <div class="filters-section" *ngIf="trajets.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterTrajets()" placeholder="Rechercher par référence, lieu..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterTrajets()" class="filter-select">
            <option value="">📊 Tous statuts</option>
            <option value="planifie">📋 Planifié</option>
            <option value="en_cours">🔄 En cours</option>
            <option value="termine">✅ Terminé</option>
            <option value="retarde">⚠️ Retardé</option>
            <option value="annule">❌ Annulé</option>
          </select>
          <select [(ngModel)]="typeFilter" (ngModelChange)="filterTrajets()" class="filter-select">
            <option value="">🗺️ Tous types</option>
            <option value="national">National</option>
            <option value="international">International</option>
            <option value="urbain">Urbain</option>
          </select>
        </div>
      </div>

      <!-- Liste des trajets -->
      <div class="trajets-section" *ngIf="trajets.length > 0; else emptyState">
        <div class="section-header">
          <h2>🗺️ Liste des trajets</h2>
          <div class="header-stats">
            <span class="stat-badge">{{ filteredTrajets.length }} / {{ trajets.length }} affiché(s)</span>
          </div>
        </div>
        
        <div class="trajets-grid">
          <div class="trajet-card" *ngFor="let t of filteredTrajets" [class]="t.statut">
            <div class="card-header">
              <div class="header-left">
                <div class="trajet-icon">🗺️</div>
                <div class="trajet-info">
                  <div class="trajet-ref">{{ t.reference }}</div>
                  <div class="trajet-itineraire">{{ t.lieu_depart }} → {{ t.lieu_arrivee }}</div>
                </div>
              </div>
              <div class="header-right">
                <span class="statut-badge" [class]="t.statut">{{ getStatutLabel(t.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">📅 Départ:</span>
                <span class="info-value">{{ t.date_depart | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">🚛 Véhicule:</span>
                <span class="info-value">{{ t.vehicule_immatriculation }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">👤 Chauffeur:</span>
                <span class="info-value">{{ t.chauffeur_nom }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📏 Distance:</span>
                <span class="info-value">{{ t.distance_km | number }} km</span>
              </div>
              <div class="info-row" *ngIf="t.statut === 'en_cours'">
                <span class="info-label">⏱️ Retard:</span>
                <span class="info-value delay">{{ getRetard(t) }} minutes</span>
              </div>
              <div class="progress-bar" *ngIf="t.statut === 'en_cours'">
                <div class="progress-fill" [style.width.%]="getProgression(t)"></div>
                <span class="progress-text">{{ getProgression(t) }}% du trajet</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="viewDetails(t)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="editTrajet(t)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="suivreTrajet(t)" title="Suivre en direct" *ngIf="t.statut === 'en_cours'">📍</button>
                <button class="action-icon" (click)="terminerTrajet(t)" title="Terminer" *ngIf="t.statut === 'en_cours'">✅</button>
                <button class="action-icon delete" (click)="confirmDelete(t)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🗺️</div>
          <h2>Aucun trajet</h2>
          <p>Planifiez votre premier trajet</p>
          <button class="btn-primary" (click)="openForm()">+ Nouveau trajet</button>
        </div>
      </ng-template>

      <!-- Modal Détails -->
      <div class="modal-overlay" *ngIf="showDetailsModal && selectedTrajet">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>Détails du trajet - {{ selectedTrajet.reference }}</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="details-grid">
              <div class="detail-section">
                <h4>🗺️ Informations trajet</h4>
                <p><strong>Référence:</strong> {{ selectedTrajet.reference }}</p>
                <p><strong>Type:</strong> {{ getTypeLabel(selectedTrajet.type) }}</p>
                <p><strong>Statut:</strong> {{ getStatutLabel(selectedTrajet.statut) }}</p>
                <p><strong>Départ:</strong> {{ selectedTrajet.lieu_depart }}</p>
                <p><strong>Arrivée:</strong> {{ selectedTrajet.lieu_arrivee }}</p>
                <p><strong>Distance:</strong> {{ selectedTrajet.distance_km | number }} km</p>
              </div>
              <div class="detail-section">
                <h4>📅 Dates</h4>
                <p><strong>Départ:</strong> {{ selectedTrajet.date_depart | date:'dd/MM/yyyy HH:mm' }}</p>
                <p><strong>Arrivée prévue:</strong> {{ selectedTrajet.date_arrivee_prevue | date:'dd/MM/yyyy HH:mm' }}</p>
                <p><strong>Arrivée réelle:</strong> {{ selectedTrajet.date_arrivee_reelle | date:'dd/MM/yyyy HH:mm' || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>🚛 Véhicule & Chauffeur</h4>
                <p><strong>Véhicule:</strong> {{ selectedTrajet.vehicule_immatriculation }}</p>
                <p><strong>Chauffeur:</strong> {{ selectedTrajet.chauffeur_nom }}</p>
              </div>
              <div class="detail-section">
                <h4>💰 Frais</h4>
                <p><strong>Carburant:</strong> {{ selectedTrajet.consommation_carburant || 0 }} L</p>
                <p><strong>Péage:</strong> {{ selectedTrajet.frais_peage | number }} FCFA</p>
                <p><strong>Frais divers:</strong> {{ selectedTrajet.frais_divers | number }} FCFA</p>
              </div>
              <div class="detail-section full-width" *ngIf="selectedTrajet.cargaison?.length">
                <h4>📦 Cargaison</h4>
                <table class="details-table">
                  <thead>
                    <tr><th>Désignation</th><th>Qté</th><th>Poids</th><th>Volume</th><th>Expéditeur</th><th>Destinataire</th></tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let c of selectedTrajet.cargaison">
                      <td>{{ c.designation }}</td>
                      <td>{{ c.quantite }} {{ c.unite }}</td>
                      <td>{{ c.poids }} kg</td>
                      <td>{{ c.volume }} m³</td>
                      <td>{{ c.expediteur }}</td>
                      <td>{{ c.destinataire }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="detail-section full-width" *ngIf="selectedTrajet.evenements?.length">
                <h4>📍 Événements</h4>
                <div class="timeline">
                  <div class="timeline-item" *ngFor="let e of selectedTrajet.evenements">
                    <div class="timeline-date">{{ e.date | date:'dd/MM/yyyy HH:mm' }}</div>
                    <div class="timeline-content">
                      <span class="timeline-badge" [class]="e.type">{{ getEvenementTypeLabel(e.type) }}</span>
                      <div class="timeline-lieu">{{ e.lieu }}</div>
                      <div class="timeline-description">{{ e.description }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="detail-section full-width" *ngIf="selectedTrajet.notes">
                <h4>📝 Notes</h4>
                <p>{{ selectedTrajet.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Suppression -->
      <div class="modal-overlay" *ngIf="showDeleteModal">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>🗑️ Supprimer le trajet</h3>
            <button class="modal-close" (click)="showDeleteModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p>Supprimer le trajet <strong>{{ trajetToDelete?.reference }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteTrajet()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Suivi en direct -->
      <div class="modal-overlay" *ngIf="showSuiviModal && suiviTrajet">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>📍 Suivi en direct - {{ suiviTrajet.reference }}</h3>
            <button class="modal-close" (click)="showSuiviModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="suivi-header">
              <div class="suivi-info">
                <div class="suivi-itineraire">{{ suiviTrajet.lieu_depart }} → {{ suiviTrajet.lieu_arrivee }}</div>
                <div class="suivi-vehicule">🚛 {{ suiviTrajet.vehicule_immatriculation }} • 👤 {{ suiviTrajet.chauffeur_nom }}</div>
              </div>
              <div class="suivi-statut" [class]="suiviTrajet.statut">
                {{ getStatutLabel(suiviTrajet.statut) }}
              </div>
            </div>

            <div class="suivi-progression">
              <div class="progression-bar">
                <div class="progression-fill" [style.width.%]="getProgression(suiviTrajet)"></div>
              </div>
              <div class="progression-text">{{ getProgression(suiviTrajet) }}% du trajet effectué</div>
            </div>

            <div class="suivi-timeline">
              <h4>📋 Événements enregistrés</h4>
              <div class="timeline" *ngIf="suiviTrajet.evenements && suiviTrajet.evenements.length > 0; else noEvents">
                <div class="timeline-item" *ngFor="let e of suiviTrajet.evenements">
                  <div class="timeline-dot"></div>
                  <div class="timeline-date">{{ e.date | date:'dd/MM/yyyy HH:mm' }}</div>
                  <div class="timeline-content">
                    <span class="timeline-badge">{{ getEvenementTypeLabel(e.type) }}</span>
                    <div class="timeline-lieu">{{ e.lieu }}</div>
                    <div class="timeline-description">{{ e.description }}</div>
                  </div>
                </div>
              </div>
              <ng-template #noEvents>
                <div class="no-data">Aucun événement enregistré pour ce trajet</div>
              </ng-template>
            </div>

            <div class="suivi-actions">
              <button class="btn-primary" (click)="ajouterEvenementRapide()">📍 Ajouter un point de passage</button>
              <button class="btn-primary" (click)="signalerIncident()">⚠️ Signaler un incident</button>
              <button class="btn-primary" (click)="terminerTrajet(suiviTrajet)" *ngIf="suiviTrajet.statut === 'en_cours'">✅ Terminer le trajet</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Ajout événement rapide -->
      <div class="modal-overlay" *ngIf="showEvenementRapide">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>📍 Ajouter un événement</h3>
            <button class="modal-close" (click)="showEvenementRapide = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Type d'événement</label>
              <select [(ngModel)]="rapideEvenement.type">
                <option value="escale">📍 Escale</option>
                <option value="controle">🛂 Contrôle</option>
                <option value="incident">⚠️ Incident</option>
                <option value="depart">🚀 Départ</option>
                <option value="arrivee">🏁 Arrivée</option>
              </select>
            </div>
            <div class="form-group">
              <label>Lieu</label>
              <input type="text" [(ngModel)]="rapideEvenement.lieu" placeholder="Ville, localisation">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="rapideEvenement.description" rows="3" placeholder="Détails de l'événement..."></textarea>
            </div>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showEvenementRapide = false">Annuler</button>
              <button class="btn-primary" (click)="saveEvenementRapide()">💾 Enregistrer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .trajets-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
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
    .kpi-card.en_cours .kpi-value { color: #3B82F6; }
    .kpi-card.distance .kpi-value { color: #10B981; }
    .kpi-card.ponctualite .kpi-value { color: #8B5CF6; }
    .kpi-card.retard .kpi-value { color: #F59E0B; }
    .kpi-card.international .kpi-value { color: #EF4444; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 900px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
    .modal-container.large { max-width: 1000px; }
    .modal-container.small { max-width: 500px; }
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
    .readonly { background: #F9FAFB; color: #6B7280; }
    
    .info-card { background: #FEF3F9; border-radius: 12px; padding: 16px; margin: 16px 0; }
    .info-row-detail { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    
    .cargaison-header, .evenements-header { display: flex; justify-content: space-between; align-items: center; margin: 20px 0 12px; flex-wrap: wrap; }
    .cargaison-list, .evenements-list { border: 1px solid #F3F4F6; border-radius: 12px; overflow: hidden; }
    .cargaison-item, .evenement-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #F3F4F6; }
    .cargaison-item:last-child, .evenement-item:last-child { border-bottom: none; }
    .cargaison-designation { font-weight: 600; margin-bottom: 4px; }
    .cargaison-details { font-size: 12px; color: #6B7280; margin-bottom: 4px; }
    .cargaison-expedition { font-size: 11px; color: #9CA3AF; }
    .evenement-date { min-width: 140px; font-weight: 500; font-size: 12px; }
    .evenement-lieu { min-width: 150px; }
    .evenement-type { min-width: 100px; }
    .evenement-description { flex: 1; font-size: 13px; }
    .remove-btn { background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: 6px; font-size: 16px; }
    .remove-btn:hover { background: #FEE2E2; }
    .no-data { text-align: center; padding: 40px; background: #F9FAFB; border-radius: 12px; color: #6B7280; }
    
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 2; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    
    .trajets-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; background: #FEF3F9; color: #EC4899; }
    
    .trajets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
    .trajet-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .trajet-card.planifie { border-left-color: #9CA3AF; }
    .trajet-card.en_cours { border-left-color: #3B82F6; }
    .trajet-card.termine { border-left-color: #10B981; }
    .trajet-card.retarde { border-left-color: #F59E0B; }
    .trajet-card.annule { border-left-color: #EF4444; opacity: 0.7; }
    .trajet-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; }
    .trajet-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .trajet-ref { font-weight: 700; color: #1F2937; font-family: monospace; }
    .trajet-itineraire { font-size: 12px; color: #6B7280; margin-top: 4px; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.planifie { background: #F3F4F6; color: #6B7280; }
    .statut-badge.en_cours { background: #DBEAFE; color: #1E40AF; }
    .statut-badge.termine { background: #DCFCE7; color: #16A34A; }
    .statut-badge.retarde { background: #FEF3C7; color: #D97706; }
    .statut-badge.annule { background: #FEE2E2; color: #EF4444; }
    .card-body { margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .info-label { color: #6B7280; }
    .info-value { font-weight: 500; color: #1F2937; }
    .info-value.delay { color: #F59E0B; }
    .progress-bar { background: #F3F4F6; border-radius: 20px; height: 6px; margin-top: 12px; position: relative; }
    .progress-fill { background: #3B82F6; border-radius: 20px; height: 6px; }
    .progress-text { font-size: 10px; color: #6B7280; position: absolute; right: 0; top: -16px; }
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
    
    .timeline { margin-top: 16px; }
    .timeline-item { display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid #F3F4F6; position: relative; }
    .timeline-dot { width: 12px; height: 12px; background: #EC4899; border-radius: 50%; margin-top: 4px; }
    .timeline-date { min-width: 140px; font-size: 12px; color: #6B7280; }
    .timeline-content { flex: 1; }
    .timeline-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; margin-bottom: 4px; }
    .timeline-badge.depart { background: #DBEAFE; color: #1E40AF; }
    .timeline-badge.arrivee { background: #DCFCE7; color: #16A34A; }
    .timeline-badge.escale { background: #FEF3C7; color: #D97706; }
    .timeline-badge.incident { background: #FEE2E2; color: #EF4444; }
    .timeline-badge.controle { background: #F3F4F6; color: #6B7280; }
    .timeline-lieu { font-weight: 500; margin-bottom: 4px; }
    .timeline-description { font-size: 13px; color: #6B7280; }
    
    .suivi-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .suivi-itineraire { font-size: 18px; font-weight: 600; }
    .suivi-vehicule { font-size: 13px; color: #6B7280; margin-top: 4px; }
    .suivi-statut { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .suivi-statut.en_cours { background: #DBEAFE; color: #1E40AF; }
    .suivi-progression { margin-bottom: 24px; }
    .progression-bar { background: #F3F4F6; border-radius: 20px; height: 8px; overflow: hidden; }
    .progression-fill { background: #10B981; border-radius: 20px; height: 100%; transition: width 0.3s ease; }
    .progression-text { text-align: center; margin-top: 8px; font-size: 12px; color: #6B7280; }
    .suivi-timeline { margin: 24px 0; }
    .suivi-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-top: 24px; }
    
    @media (max-width: 1200px) { .kpi-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; gap: 12px; } .kpi-grid { grid-template-columns: repeat(2, 1fr); } .trajets-grid { grid-template-columns: 1fr; } .filter-group { flex-direction: column; } .details-grid { grid-template-columns: 1fr; } .detail-section.full-width { grid-column: span 1; } .timeline-item { flex-direction: column; gap: 4px; } .timeline-date { min-width: auto; } }
  `]
})
export class Trajets implements OnInit {
  trajets: Trajet[] = [];
  filteredTrajets: Trajet[] = [];
  vehicules: Vehicule[] = [];
  chauffeurs: any[] = [];
  
  searchTerm = '';
  statutFilter = '';
  typeFilter = '';
  activeTab = 'info';
  showForm = false;
  showDetailsModal = false;
  showDeleteModal = false;
  showSuiviModal = false;
  showEvenementRapide = false;
  editMode = false;
  selectedTrajet: Trajet | null = null;
  suiviTrajet: Trajet | null = null;
  trajetToDelete: Trajet | null = null;
  selectedVehicule: Vehicule | null = null;
  selectedChauffeur: any = null;
  successMessage = '';
  
  rapideEvenement: any = { type: 'escale', lieu: '', description: '' };
  
  currentTrajet: Partial<Trajet> = {
    reference: '',
    type: 'national',
    statut: 'planifie',
    date_depart: new Date().toISOString().slice(0, 16),
    date_arrivee_prevue: new Date(Date.now() + 24 * 3600000).toISOString().slice(0, 16),
    lieu_depart: '',
    lieu_arrivee: '',
    distance_km: 0,
    duree_estimee: 0,
    cargaison: [],
    evenements: [],
    consommation_carburant: 0,
    frais_peage: 0,
    frais_divers: 0
  };
  
  ngOnInit() {
    this.loadVehicules();
    this.loadChauffeurs();
    this.loadTrajets();
  }
  
  loadVehicules() {
    const saved = localStorage.getItem('vehicules');
    this.vehicules = saved ? JSON.parse(saved) : [];
  }
  
  loadChauffeurs() {
    const saved = localStorage.getItem('chauffeurs');
    this.chauffeurs = saved ? JSON.parse(saved) : [];
  }
  
  loadTrajets() {
    const saved = localStorage.getItem('trajets');
    this.trajets = saved ? JSON.parse(saved) : [];
    this.filteredTrajets = [...this.trajets];
  }
  
  saveTrajetsToStorage() {
    localStorage.setItem('trajets', JSON.stringify(this.trajets));
    
    // Mettre à jour le statut du véhicule si nécessaire
    if (this.currentTrajet.vehicule_id && this.currentTrajet.statut === 'en_cours') {
      const vehicule = this.vehicules.find(v => v.id === this.currentTrajet.vehicule_id);
      if (vehicule && vehicule.statut !== 'en_trajet') {
        vehicule.statut = 'en_trajet';
        localStorage.setItem('vehicules', JSON.stringify(this.vehicules));
      }
    }
  }
  
  get vehiculesDisponibles(): Vehicule[] {
    return this.vehicules.filter(v => v.statut === 'disponible' || v.statut === 'en_trajet');
  }
  
  openForm() {
    this.currentTrajet = {
      reference: this.generateReference(),
      type: 'national',
      statut: 'planifie',
      date_depart: new Date().toISOString().slice(0, 16),
      date_arrivee_prevue: new Date(Date.now() + 24 * 3600000).toISOString().slice(0, 16),
      lieu_depart: '',
      lieu_arrivee: '',
      distance_km: 0,
      duree_estimee: 0,
      cargaison: [],
      evenements: [],
      consommation_carburant: 0,
      frais_peage: 0,
      frais_divers: 0
    };
    this.selectedVehicule = null;
    this.selectedChauffeur = null;
    this.editMode = false;
    this.showForm = true;
    this.activeTab = 'info';
  }
  
  generateReference(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = this.trajets.length + 1;
    return `TRJ-${year}${month}-${String(count).padStart(4, '0')}`;
  }
  
  onVehiculeChange() {
    const vehicule = this.vehicules.find(v => v.id === this.currentTrajet.vehicule_id);
    if (vehicule) {
      this.selectedVehicule = vehicule;
      this.currentTrajet.vehicule_immatriculation = vehicule.immatriculation;
    }
  }
  
  onChauffeurChange() {
    const chauffeur = this.chauffeurs.find(c => c.id === this.currentTrajet.chauffeur_id);
    if (chauffeur) {
      this.selectedChauffeur = chauffeur;
      this.currentTrajet.chauffeur_nom = `${chauffeur.nom} ${chauffeur.prenom}`;
    }
  }
  
  addCargaison() {
    if (!this.currentTrajet.cargaison) {
      this.currentTrajet.cargaison = [];
    }
    this.currentTrajet.cargaison.push({
      id: Date.now(),
      designation: '',
      quantite: 1,
      unite: 'kg',
      poids: 0,
      volume: 0,
      valeur: 0,
      expediteur: '',
      destinataire: ''
    });
  }
  
  removeCargaison(index: number) {
    if (this.currentTrajet.cargaison) {
      this.currentTrajet.cargaison.splice(index, 1);
    }
  }
  
  addEvenement() {
    if (!this.currentTrajet.evenements) {
      this.currentTrajet.evenements = [];
    }
    this.currentTrajet.evenements.push({
      id: Date.now(),
      date: new Date().toISOString(),
      lieu: '',
      type: 'escale',
      description: '',
      utilisateur: 'Système'
    });
  }
  
  removeEvenement(index: number) {
    if (this.currentTrajet.evenements) {
      this.currentTrajet.evenements.splice(index, 1);
    }
  }
  
  saveTrajet() {
    if (!this.currentTrajet.lieu_depart || !this.currentTrajet.lieu_arrivee) {
      alert('Veuillez renseigner le lieu de départ et d\'arrivée');
      return;
    }
    
    if (this.editMode && this.currentTrajet.id) {
      const index = this.trajets.findIndex(t => t.id === this.currentTrajet.id);
      if (index !== -1) {
        this.trajets[index] = { ...this.currentTrajet, updated_at: new Date().toISOString() } as Trajet;
        this.showSuccess('Trajet modifié');
      }
    } else {
      this.trajets.push({ 
        ...this.currentTrajet, 
        id: Date.now(), 
        created_at: new Date().toISOString() 
      } as Trajet);
      this.showSuccess('Trajet ajouté');
    }
    this.saveTrajetsToStorage();
    this.filterTrajets();
    this.cancelForm();
  }
  
  editTrajet(t: Trajet) {
    this.currentTrajet = { ...t };
    this.currentTrajet.date_depart = this.formatDateTime(t.date_depart);
    this.currentTrajet.date_arrivee_prevue = this.formatDateTime(t.date_arrivee_prevue);
    if (!this.currentTrajet.cargaison) this.currentTrajet.cargaison = [];
    if (!this.currentTrajet.evenements) this.currentTrajet.evenements = [];
    this.onVehiculeChange();
    this.onChauffeurChange();
    this.editMode = true;
    this.showForm = true;
    this.activeTab = 'info';
  }
  
  formatDateTime(dateStr: string): string {
    if (!dateStr) return '';
    return dateStr.replace(' ', 'T').slice(0, 16);
  }
  
  viewDetails(t: Trajet) {
    this.selectedTrajet = t;
    this.showDetailsModal = true;
  }
  
  suivreTrajet(t: Trajet) {
    this.suiviTrajet = t;
    this.showSuiviModal = true;
  }
  
  ajouterEvenementRapide() {
    this.rapideEvenement = { type: 'escale', lieu: '', description: '' };
    this.showEvenementRapide = true;
  }
  
  saveEvenementRapide() {
    if (this.suiviTrajet && this.rapideEvenement.lieu) {
      if (!this.suiviTrajet.evenements) {
        this.suiviTrajet.evenements = [];
      }
      this.suiviTrajet.evenements.push({
        id: Date.now(),
        date: new Date().toISOString(),
        lieu: this.rapideEvenement.lieu,
        type: this.rapideEvenement.type,
        description: this.rapideEvenement.description,
        utilisateur: 'Système'
      });
      this.saveTrajetsToStorage();
      this.showEvenementRapide = false;
      this.showSuccess('Événement ajouté');
    }
  }
  
  signalerIncident() {
    this.rapideEvenement = { type: 'incident', lieu: '', description: '' };
    this.showEvenementRapide = true;
  }
  
  terminerTrajet(t: Trajet) {
    t.statut = 'termine';
    t.date_arrivee_reelle = new Date().toISOString();
    
    // Libérer le véhicule
    const vehicule = this.vehicules.find(v => v.id === t.vehicule_id);
    if (vehicule) {
      vehicule.statut = 'disponible';
      localStorage.setItem('vehicules', JSON.stringify(this.vehicules));
    }
    
    this.saveTrajetsToStorage();
    this.filterTrajets();
    this.showSuiviModal = false;
    this.showSuccess('Trajet terminé');
  }
  
  confirmDelete(t: Trajet) {
    this.trajetToDelete = t;
    this.showDeleteModal = true;
  }
  
  deleteTrajet() {
    if (this.trajetToDelete) {
      this.trajets = this.trajets.filter(t => t.id !== this.trajetToDelete?.id);
      this.saveTrajetsToStorage();
      this.filterTrajets();
      this.showDeleteModal = false;
      this.trajetToDelete = null;
      this.showSuccess('Trajet supprimé');
    }
  }
  
  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }
  
  filterTrajets() {
    let filtered = [...this.trajets];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.reference?.toLowerCase().includes(term) || 
        t.lieu_depart?.toLowerCase().includes(term) ||
        t.lieu_arrivee?.toLowerCase().includes(term) ||
        t.vehicule_immatriculation?.toLowerCase().includes(term)
      );
    }
    
    if (this.statutFilter) {
      filtered = filtered.filter(t => t.statut === this.statutFilter);
    }
    
    if (this.typeFilter) {
      filtered = filtered.filter(t => t.type === this.typeFilter);
    }
    
    this.filteredTrajets = filtered;
  }
  
  getTrajetsEnCours(): number {
    return this.trajets.filter(t => t.statut === 'en_cours').length;
  }
  
  getDistanceTotale(): number {
    return this.trajets.reduce((sum, t) => sum + (t.distance_km || 0), 0);
  }
  
  getTauxPonctualite(): number {
    const termines = this.trajets.filter(t => t.statut === 'termine' && t.date_arrivee_reelle);
    if (termines.length === 0) return 100;
    const ponctuels = termines.filter(t => {
      const prevue = new Date(t.date_arrivee_prevue);
      const reelle = new Date(t.date_arrivee_reelle!);
      return reelle <= prevue;
    });
    return Math.round((ponctuels.length / termines.length) * 100);
  }
  
  getTrajetsRetard(): number {
    const enCours = this.trajets.filter(t => t.statut === 'en_cours');
    const maintenant = new Date();
    return enCours.filter(t => {
      const prevue = new Date(t.date_arrivee_prevue);
      return maintenant > prevue;
    }).length;
  }
  
  getTrajetsInternationaux(): number {
    return this.trajets.filter(t => t.type === 'international').length;
  }
  
  getRetard(t: Trajet): number {
    if (t.statut !== 'en_cours') return 0;
    const maintenant = new Date();
    const prevue = new Date(t.date_arrivee_prevue);
    if (maintenant <= prevue) return 0;
    const diffMinutes = Math.floor((maintenant.getTime() - prevue.getTime()) / (1000 * 60));
    return diffMinutes;
  }
  
  getProgression(t: Trajet): number {
    if (t.statut === 'termine') return 100;
    if (t.statut === 'planifie') return 0;
    
    const depart = new Date(t.date_depart);
    const prevue = new Date(t.date_arrivee_prevue);
    const maintenant = new Date();
    
    if (maintenant <= depart) return 0;
    if (maintenant >= prevue) return 100;
    
    const total = prevue.getTime() - depart.getTime();
    const ecoule = maintenant.getTime() - depart.getTime();
    return Math.round((ecoule / total) * 100);
  }
  
  getStatutVehiculeLabel(statut: string): string {
    const labels: any = {
      disponible: '✅ Disponible',
      en_trajet: '🔄 En trajet',
      en_maintenance: '🔧 En maintenance',
      hors_service: '❌ Hors service'
    };
    return labels[statut] || statut;
  }
  
  getEvenementTypeLabel(type: string): string {
    const labels: any = {
      depart: '🚀 Départ',
      arrivee: '🏁 Arrivée',
      escale: '📍 Escale',
      incident: '⚠️ Incident',
      controle: '🛂 Contrôle'
    };
    return labels[type] || type;
  }
  
  getTypeLabel(type: string): string {
    const labels: any = {
      national: '🇨🇮 National',
      international: '🌍 International',
      urbain: '🏙️ Urbain'
    };
    return labels[type] || type;
  }
  
  getStatutLabel(statut: string): string {
    const labels: any = {
      planifie: '📋 Planifié',
      en_cours: '🔄 En cours',
      termine: '✅ Terminé',
      annule: '❌ Annulé',
      retarde: '⚠️ Retardé'
    };
    return labels[statut] || statut;
  }
  
    exportToExcel() {
    if (!this.filteredTrajets || this.filteredTrajets.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredTrajets[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const lignes = this.filteredTrajets.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ""));
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
    if (!this.filteredTrajets || this.filteredTrajets.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredTrajets[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join("")}</tr>\n</thead>\n<tbody>${this.filteredTrajets.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : "-"}</td>`).join("")}</tr>`).join("")}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert("Veuillez autoriser les pop-ups pour exporter en PDF"); }
  }
  showSuccess(msg: string) { this.successMessage = msg; setTimeout(() => this.successMessage = '', 3000); }
}