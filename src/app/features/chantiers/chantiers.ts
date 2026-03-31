import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// ===== INTERFACES =====
interface Chantier {
  id?: number;
  reference: string;
  nom: string;
  description: string;
  type: 'construction' | 'renovation' | 'maintenance' | 'demolition' | 'amenagement';
  statut: 'en_attente' | 'en_cours' | 'suspendu' | 'termine' | 'annule';
  priorite: 'haute' | 'moyenne' | 'basse';
  client_id: number;
  client_nom?: string;
  client_contact?: string;
  client_email?: string;
  adresse: string;
  ville: string;
  pays: string;
  coordonnees_gps?: string;
  date_debut_prevue: string;
  date_fin_prevue: string;
  date_debut_reelle?: string;
  date_fin_reelle?: string;
  budget_prevu: number;
  budget_reel?: number;
  superficie: number;
  responsable_id?: number;
  responsable_nom?: string;
  equipe: EquipeChantier[];
  taches: TacheChantier[];
  materiels: MaterielChantier[];
  documents: DocumentChantier[];
  photos: PhotoChantier[];
  avancement: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

interface EquipeChantier {
  id?: number;
  employe_id: number;
  employe_nom: string;
  employe_poste: string;
  role: 'chef' | 'ouvrier' | 'technicien' | 'superviseur';
  date_affectation: string;
  date_depart?: string;
}

interface TacheChantier {
  id?: number;
  designation: string;
  description: string;
  date_debut_prevue: string;
  date_fin_prevue: string;
  date_debut_reelle?: string;
  date_fin_reelle?: string;
  responsable_id: number;
  responsable_nom: string;
  statut: 'planifiee' | 'en_cours' | 'terminee' | 'retardee' | 'annulee';
  priorite: 'haute' | 'moyenne' | 'basse';
  avancement: number;
  notes?: string;
}

interface MaterielChantier {
  id?: number;
  designation: string;
  quantite: number;
  unite: string;
  date_debut: string;
  date_fin?: string;
  fournisseur: string;
  cout: number;
  statut: 'disponible' | 'utilise' | 'rendu' | 'perdu';
  notes?: string;
}

interface DocumentChantier {
  id?: number;
  type: 'devis' | 'contrat' | 'plan' | 'autorisation' | 'facture' | 'rapport' | 'autre';
  nom: string;
  url: string;
  date_upload: string;
  version: number;
  notes?: string;
}

interface PhotoChantier {
  id?: number;
  titre: string;
  description: string;
  url: string;
  date_prise: string;
  date_upload: string;
}

@Component({
  selector: 'app-chantiers',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="chantiers-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>🏗️ Gestion des Chantiers</h1>
          <p class="subtitle">{{ chantiers.length }} chantier(s) • {{ getChantiersActifs() }} en cours • {{ getBudgetTotal() | number }} FCFA budget total</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="chantiers.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="chantiers.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouveau chantier</button>
        </div>
      </div>

      <!-- Message de succès -->
      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="chantiers.length > 0">
        <div class="kpi-card total">
          <div class="kpi-icon">🏗️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ chantiers.length }}</span>
            <span class="kpi-label">Total chantiers</span>
          </div>
        </div>
        <div class="kpi-card en_cours">
          <div class="kpi-icon">🔄</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getChantiersActifs() }}</span>
            <span class="kpi-label">En cours</span>
          </div>
        </div>
        <div class="kpi-card budget">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getBudgetTotal() | number }} <small>FCFA</small></span>
            <span class="kpi-label">Budget total</span>
          </div>
        </div>
        <div class="kpi-card avancement">
          <div class="kpi-icon">📊</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getAvancementMoyen() }}%</span>
            <span class="kpi-label">Avancement moyen</span>
          </div>
        </div>
        <div class="kpi-card surface">
          <div class="kpi-icon">📏</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getSuperficieTotale() | number }} <small>m²</small></span>
            <span class="kpi-label">Superficie totale</span>
          </div>
        </div>
        <div class="kpi-card retard">
          <div class="kpi-icon">⚠️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getChantiersRetard() }}</span>
            <span class="kpi-label">En retard</span>
          </div>
        </div>
      </div>

      <!-- Formulaire moderne avec onglets -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouveau' }} chantier</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveChantier()">
              <div class="tabs">
                <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">🏗️ Informations</button>
                <button type="button" [class.active]="activeTab === 'taches'" (click)="activeTab = 'taches'">✅ Tâches</button>
                <button type="button" [class.active]="activeTab === 'equipe'" (click)="activeTab = 'equipe'">👥 Équipe</button>
                <button type="button" [class.active]="activeTab === 'materiels'" (click)="activeTab = 'materiels'">🔧 Matériels</button>
                <button type="button" [class.active]="activeTab === 'documents'" (click)="activeTab = 'documents'">📎 Documents</button>
              </div>

              <!-- Onglet Informations -->
              <div *ngIf="activeTab === 'info'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>Référence *</label>
                    <input type="text" [(ngModel)]="currentChantier.reference" readonly class="readonly">
                  </div>
                  <div class="form-group">
                    <label>Nom du chantier *</label>
                    <input type="text" [(ngModel)]="currentChantier.nom" required placeholder="Nom du projet">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Type de chantier</label>
                    <select [(ngModel)]="currentChantier.type">
                      <option value="construction">🏗️ Construction</option>
                      <option value="renovation">🔨 Rénovation</option>
                      <option value="maintenance">🔧 Maintenance</option>
                      <option value="demolition">🏚️ Démolition</option>
                      <option value="amenagement">🌳 Aménagement</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Statut</label>
                    <select [(ngModel)]="currentChantier.statut" class="statut-select" [class]="currentChantier.statut">
                      <option value="en_attente">⏳ En attente</option>
                      <option value="en_cours">🔄 En cours</option>
                      <option value="suspendu">⏸️ Suspendu</option>
                      <option value="termine">✅ Terminé</option>
                      <option value="annule">❌ Annulé</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Priorité</label>
                    <select [(ngModel)]="currentChantier.priorite" class="priorite-select" [class]="currentChantier.priorite">
                      <option value="haute">🔴 Haute</option>
                      <option value="moyenne">🟡 Moyenne</option>
                      <option value="basse">🟢 Basse</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Responsable</label>
                    <select [(ngModel)]="currentChantier.responsable_id" (change)="onResponsableChange()">
                      <option [ngValue]="null">Sélectionner un responsable</option>
                      <option *ngFor="let r of responsables" [ngValue]="r.id">
                        {{ r.nom }} {{ r.prenom }} - {{ r.poste }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label>Description</label>
                  <textarea [(ngModel)]="currentChantier.description" rows="2" placeholder="Description du chantier..."></textarea>
                </div>
                <div class="form-group">
                  <label>📍 Adresse</label>
                  <input type="text" [(ngModel)]="currentChantier.adresse" placeholder="Adresse complète">
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Ville</label>
                    <input type="text" [(ngModel)]="currentChantier.ville">
                  </div>
                  <div class="form-group">
                    <label>Pays</label>
                    <input type="text" [(ngModel)]="currentChantier.pays">
                  </div>
                </div>
                <div class="form-group">
                  <label>📍 Coordonnées GPS (optionnel)</label>
                  <input type="text" [(ngModel)]="currentChantier.coordonnees_gps" placeholder="Latitude, Longitude">
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>📅 Date début prévue</label>
                    <input type="date" [(ngModel)]="currentChantier.date_debut_prevue" (change)="calculerDuree()">
                  </div>
                  <div class="form-group">
                    <label>📅 Date fin prévue</label>
                    <input type="date" [(ngModel)]="currentChantier.date_fin_prevue" (change)="calculerDuree()">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>💰 Budget prévu (FCFA)</label>
                    <input type="number" [(ngModel)]="currentChantier.budget_prevu" step="100000" class="montant-input">
                  </div>
                  <div class="form-group">
                    <label>📐 Superficie (m²)</label>
                    <input type="number" [(ngModel)]="currentChantier.superficie" step="10">
                  </div>
                </div>
                <div class="form-group">
                  <label>📊 Avancement (%)</label>
                  <input type="range" [(ngModel)]="currentChantier.avancement" min="0" max="100" step="5" class="avancement-slider">
                  <div class="avancement-value">{{ currentChantier.avancement }}%</div>
                </div>
                <div class="form-group">
                  <label>📝 Notes</label>
                  <textarea [(ngModel)]="currentChantier.notes" rows="2"></textarea>
                </div>
              </div>

              <!-- Onglet Tâches -->
              <div *ngIf="activeTab === 'taches'" class="tab-content">
                <div class="taches-header">
                  <h4>✅ Liste des tâches</h4>
                  <button type="button" class="btn-add" (click)="addTache()">+ Ajouter tâche</button>
                </div>
                <div class="taches-list" *ngIf="currentChantier.taches && currentChantier.taches.length > 0; else noTaches">
                  <div class="tache-item" *ngFor="let t of currentChantier.taches; let i = index">
                    <div class="tache-info">
                      <div class="tache-designation"><strong>{{ t.designation }}</strong></div>
                      <div class="tache-dates">📅 {{ t.date_debut_prevue | date:'dd/MM/yyyy' }} → {{ t.date_fin_prevue | date:'dd/MM/yyyy' }}</div>
                      <div class="tache-responsable">👤 {{ t.responsable_nom }}</div>
                      <div class="tache-avancement">
                        <div class="progress-bar-small">
                          <div class="progress-fill-small" [style.width.%]="t.avancement"></div>
                        </div>
                        <span>{{ t.avancement }}%</span>
                      </div>
                    </div>
                    <div class="tache-actions">
                      <span class="statut-badge-tache" [class]="t.statut">{{ getTacheStatutLabel(t.statut) }}</span>
                      <button type="button" (click)="editTache(i)" class="action-btn">✏️</button>
                      <button type="button" (click)="removeTache(i)" class="action-btn delete">🗑️</button>
                    </div>
                  </div>
                </div>
                <ng-template #noTaches>
                  <div class="no-data">Aucune tâche définie</div>
                </ng-template>

                <!-- Formulaire d'ajout/modification de tâche -->
                <div class="tache-form" *ngIf="showTacheForm">
                  <div class="form-header">
                    <h4>{{ editTacheMode ? '✏️ Modifier' : '➕ Ajouter' }} une tâche</h4>
                    <button type="button" class="close-form" (click)="closeTacheForm()">✕</button>
                  </div>
                  <div class="form-group">
                    <label>Désignation *</label>
                    <input type="text" [(ngModel)]="tacheForm.designation">
                  </div>
                  <div class="form-group">
                    <label>Description</label>
                    <textarea [(ngModel)]="tacheForm.description" rows="2"></textarea>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Date début prévue</label>
                      <input type="date" [(ngModel)]="tacheForm.date_debut_prevue">
                    </div>
                    <div class="form-group">
                      <label>Date fin prévue</label>
                      <input type="date" [(ngModel)]="tacheForm.date_fin_prevue">
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Responsable</label>
                      <select [(ngModel)]="tacheForm.responsable_id">
                        <option [ngValue]="null">Sélectionner</option>
                        <option *ngFor="let r of responsables" [ngValue]="r.id">
                          {{ r.nom }} {{ r.prenom }}
                        </option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label>Priorité</label>
                      <select [(ngModel)]="tacheForm.priorite">
                        <option value="haute">🔴 Haute</option>
                        <option value="moyenne">🟡 Moyenne</option>
                        <option value="basse">🟢 Basse</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Avancement (%)</label>
                    <input type="range" [(ngModel)]="tacheForm.avancement" min="0" max="100" step="5">
                    <span>{{ tacheForm.avancement }}%</span>
                  </div>
                  <div class="form-group">
                    <label>Notes</label>
                    <textarea [(ngModel)]="tacheForm.notes" rows="2"></textarea>
                  </div>
                  <div class="form-actions">
                    <button type="button" class="btn-secondary" (click)="closeTacheForm()">Annuler</button>
                    <button type="button" class="btn-primary" (click)="saveTacheForm()">💾 Enregistrer</button>
                  </div>
                </div>
              </div>

              <!-- Onglet Équipe -->
              <div *ngIf="activeTab === 'equipe'" class="tab-content">
                <div class="equipe-header">
                  <h4>👥 Équipe du chantier</h4>
                  <button type="button" class="btn-add" (click)="addMembreEquipe()">+ Ajouter membre</button>
                </div>
                <div class="equipe-list" *ngIf="currentChantier.equipe && currentChantier.equipe.length > 0; else noEquipe">
                  <div class="membre-item" *ngFor="let m of currentChantier.equipe; let i = index">
                    <div class="membre-info">
                      <div class="membre-nom">{{ m.employe_nom }}</div>
                      <div class="membre-poste">{{ m.employe_poste }}</div>
                      <div class="membre-role">{{ getRoleLabel(m.role) }}</div>
                      <div class="membre-date">Depuis le {{ m.date_affectation | date:'dd/MM/yyyy' }}</div>
                    </div>
                    <div class="membre-actions">
                      <button type="button" (click)="removeMembreEquipe(i)" class="action-btn delete">🗑️</button>
                    </div>
                  </div>
                </div>
                <ng-template #noEquipe>
                  <div class="no-data">Aucun membre dans l'équipe</div>
                </ng-template>

                <!-- Formulaire d'ajout membre -->
                <div class="membre-form" *ngIf="showMembreForm">
                  <div class="form-header">
                    <h4>➕ Ajouter un membre</h4>
                    <button type="button" class="close-form" (click)="closeMembreForm()">✕</button>
                  </div>
                  <div class="form-group">
                    <label>Employé</label>
                    <select [(ngModel)]="membreForm.employe_id" (change)="onEmployeChange()">
                      <option [ngValue]="null">Sélectionner un employé</option>
                      <option *ngFor="let e of employes" [ngValue]="e.id">
                        {{ e.nom }} {{ e.prenom }} - {{ e.poste }}
                      </option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Rôle sur le chantier</label>
                    <select [(ngModel)]="membreForm.role">
                      <option value="chef">👨‍💼 Chef de chantier</option>
                      <option value="superviseur">👁️ Superviseur</option>
                      <option value="technicien">🔧 Technicien</option>
                      <option value="ouvrier">👷 Ouvrier</option>
                    </select>
                  </div>
                  <div class="form-actions">
                    <button type="button" class="btn-secondary" (click)="closeMembreForm()">Annuler</button>
                    <button type="button" class="btn-primary" (click)="saveMembreForm()">💾 Ajouter</button>
                  </div>
                </div>
              </div>

              <!-- Onglet Matériels -->
              <div *ngIf="activeTab === 'materiels'" class="tab-content">
                <div class="materiels-header">
                  <h4>🔧 Matériels et équipements</h4>
                  <button type="button" class="btn-add" (click)="addMateriel()">+ Ajouter matériel</button>
                </div>
                <div class="materiels-list" *ngIf="currentChantier.materiels && currentChantier.materiels.length > 0; else noMateriels">
                  <div class="materiel-item" *ngFor="let m of currentChantier.materiels; let i = index">
                    <div class="materiel-info">
                      <div class="materiel-designation"><strong>{{ m.designation }}</strong></div>
                      <div class="materiel-quantite">📦 {{ m.quantite }} {{ m.unite }}</div>
                      <div class="materiel-fournisseur">🏭 {{ m.fournisseur }}</div>
                      <div class="materiel-cout">💰 {{ m.cout | number }} FCFA</div>
                      <div class="materiel-dates">📅 {{ m.date_debut | date:'dd/MM/yyyy' }} → {{ m.date_fin | date:'dd/MM/yyyy' || 'En cours' }}</div>
                    </div>
                    <div class="materiel-actions">
                      <span class="statut-badge-materiel" [class]="m.statut">{{ getMaterielStatutLabel(m.statut) }}</span>
                      <button type="button" (click)="removeMateriel(i)" class="action-btn delete">🗑️</button>
                    </div>
                  </div>
                </div>
                <ng-template #noMateriels>
                  <div class="no-data">Aucun matériel enregistré</div>
                </ng-template>
              </div>

              <!-- Onglet Documents -->
              <div *ngIf="activeTab === 'documents'" class="tab-content">
                <div class="documents-header">
                  <h4>📎 Documents du chantier</h4>
                  <button type="button" class="btn-add" (click)="addDocument()">+ Ajouter document</button>
                </div>
                <div class="documents-list" *ngIf="currentChantier.documents && currentChantier.documents.length > 0; else noDocs">
                  <div class="doc-item" *ngFor="let d of currentChantier.documents; let i = index">
                    <div class="doc-icon">{{ getDocumentIcon(d.type) }}</div>
                    <div class="doc-info">
                      <div class="doc-name">{{ d.nom }}</div>
                      <div class="doc-type">{{ getDocumentTypeLabel(d.type) }}</div>
                      <div class="doc-version">v{{ d.version }}</div>
                      <div class="doc-date">{{ d.date_upload | date:'dd/MM/yyyy' }}</div>
                    </div>
                    <div class="doc-actions">
                      <button type="button" (click)="viewDocument(d)" class="action-btn">👁️</button>
                      <button type="button" (click)="removeDocument(i)" class="action-btn delete">🗑️</button>
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
      <div class="filters-section" *ngIf="chantiers.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterChantiers()" placeholder="Rechercher par nom, référence, client..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterChantiers()" class="filter-select">
            <option value="">📊 Tous statuts</option>
            <option value="en_attente">⏳ En attente</option>
            <option value="en_cours">🔄 En cours</option>
            <option value="suspendu">⏸️ Suspendu</option>
            <option value="termine">✅ Terminé</option>
            <option value="annule">❌ Annulé</option>
          </select>
          <select [(ngModel)]="typeFilter" (ngModelChange)="filterChantiers()" class="filter-select">
            <option value="">🏗️ Tous types</option>
            <option value="construction">Construction</option>
            <option value="renovation">Rénovation</option>
            <option value="maintenance">Maintenance</option>
            <option value="demolition">Démolition</option>
            <option value="amenagement">Aménagement</option>
          </select>
          <select [(ngModel)]="prioriteFilter" (ngModelChange)="filterChantiers()" class="filter-select">
            <option value="">🎯 Toutes priorités</option>
            <option value="haute">🔴 Haute</option>
            <option value="moyenne">🟡 Moyenne</option>
            <option value="basse">🟢 Basse</option>
          </select>
        </div>
      </div>

      <!-- Liste des chantiers -->
      <div class="chantiers-section" *ngIf="chantiers.length > 0; else emptyState">
        <div class="section-header">
          <h2>🏗️ Liste des chantiers</h2>
          <div class="header-stats">
            <span class="stat-badge">{{ filteredChantiers.length }} / {{ chantiers.length }} affiché(s)</span>
          </div>
        </div>
        
        <div class="chantiers-grid">
          <div class="chantier-card" *ngFor="let c of filteredChantiers" [class]="c.statut + ' ' + c.priorite">
            <div class="card-header">
              <div class="header-left">
                <div class="chantier-icon">{{ getTypeIcon(c.type) }}</div>
                <div class="chantier-info">
                  <div class="chantier-ref">{{ c.reference }}</div>
                  <div class="chantier-nom">{{ c.nom }}</div>
                  <div class="chantier-client">{{ c.client_nom || 'Client non spécifié' }}</div>
                </div>
              </div>
              <div class="header-right">
                <div class="chantier-budget">{{ c.budget_prevu | number }} FCFA</div>
                <span class="priorite-badge" [class]="c.priorite">{{ getPrioriteLabel(c.priorite) }}</span>
                <span class="statut-badge" [class]="c.statut">{{ getStatutLabel(c.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">📍 Lieu:</span>
                <span class="info-value">{{ c.ville }}, {{ c.pays }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📅 Période:</span>
                <span class="info-value">{{ c.date_debut_prevue | date:'dd/MM/yyyy' }} → {{ c.date_fin_prevue | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">👤 Responsable:</span>
                <span class="info-value">{{ c.responsable_nom || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📐 Superficie:</span>
                <span class="info-value">{{ c.superficie | number }} m²</span>
              </div>
              <div class="info-row" *ngIf="isEnRetard(c)">
                <span class="info-label">⚠️ Retard:</span>
                <span class="info-value delay">{{ getJoursRetard(c) }} jours</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="c.avancement"></div>
                <span class="progress-text">{{ c.avancement }}% réalisé</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="viewDetails(c)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="editChantier(c)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="voirSuivi(c)" title="Suivi avancement">📊</button>
                <button class="action-icon" (click)="genererRapport(c)" title="Générer rapport">📄</button>
                <button class="action-icon delete" (click)="confirmDelete(c)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🏗️</div>
          <h2>Aucun chantier</h2>
          <p>Créez votre premier chantier</p>
          <button class="btn-primary" (click)="openForm()">+ Nouveau chantier</button>
        </div>
      </ng-template>

      <!-- Modal Détails -->
      <div class="modal-overlay" *ngIf="showDetailsModal && selectedChantier">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>Détails du chantier - {{ selectedChantier.nom }}</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="details-grid">
              <div class="detail-section">
                <h4>🏗️ Informations générales</h4>
                <p><strong>Référence:</strong> {{ selectedChantier.reference }}</p>
                <p><strong>Nom:</strong> {{ selectedChantier.nom }}</p>
                <p><strong>Type:</strong> {{ getTypeLabel(selectedChantier.type) }}</p>
                <p><strong>Statut:</strong> {{ getStatutLabel(selectedChantier.statut) }}</p>
                <p><strong>Priorité:</strong> {{ getPrioriteLabel(selectedChantier.priorite) }}</p>
                <p><strong>Description:</strong> {{ selectedChantier.description || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>📍 Localisation</h4>
                <p><strong>Adresse:</strong> {{ selectedChantier.adresse || '-' }}</p>
                <p><strong>Ville:</strong> {{ selectedChantier.ville }}</p>
                <p><strong>Pays:</strong> {{ selectedChantier.pays }}</p>
                <p><strong>GPS:</strong> {{ selectedChantier.coordonnees_gps || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>📅 Calendrier</h4>
                <p><strong>Début prévu:</strong> {{ selectedChantier.date_debut_prevue | date:'dd/MM/yyyy' }}</p>
                <p><strong>Fin prévue:</strong> {{ selectedChantier.date_fin_prevue | date:'dd/MM/yyyy' }}</p>
                <p><strong>Début réel:</strong> {{ selectedChantier.date_debut_reelle | date:'dd/MM/yyyy' || '-' }}</p>
                <p><strong>Fin réelle:</strong> {{ selectedChantier.date_fin_reelle | date:'dd/MM/yyyy' || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>💰 Finances</h4>
                <p><strong>Budget prévu:</strong> {{ selectedChantier.budget_prevu | number }} FCFA</p>
                <p><strong>Budget réel:</strong> {{ selectedChantier.budget_reel | number }} FCFA</p>
                <p><strong>Écart:</strong> {{ getEcartBudget(selectedChantier) | number }} FCFA</p>
                <p><strong>Superficie:</strong> {{ selectedChantier.superficie }} m²</p>
              </div>
              <div class="detail-section">
                <h4>👥 Équipe</h4>
                <p><strong>Responsable:</strong> {{ selectedChantier.responsable_nom || '-' }}</p>
                <p><strong>Membres:</strong> {{ selectedChantier.equipe.length || 0 }} personne(s)</p>
              </div>
              <div class="detail-section">
                <h4>📊 Avancement</h4>
                <div class="progress-bar-large">
                  <div class="progress-fill-large" [style.width.%]="selectedChantier.avancement"></div>
                </div>
                <p class="avancement-text">{{ selectedChantier.avancement }}% du chantier réalisé</p>
              </div>
              <div class="detail-section full-width" *ngIf="selectedChantier.taches?.length">
                <h4>✅ Tâches ({{ selectedChantier.taches.length }})</h4>
                <table class="details-table">
                  <thead>
                    <tr><th>Tâche</th><th>Dates</th><th>Responsable</th><th>Avancement</th><th>Statut</th></tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let t of selectedChantier.taches">
                      <td><strong>{{ t.designation }}</strong><br><small>{{ t.description }}</small></td>
                      <td>{{ t.date_debut_prevue | date:'dd/MM/yyyy' }}<br>→ {{ t.date_fin_prevue | date:'dd/MM/yyyy' }}</td>
                      <td>{{ t.responsable_nom }}</td>
                      <td>
                        <div class="progress-bar-small">
                          <div class="progress-fill-small" [style.width.%]="t.avancement"></div>
                        </div>
                        {{ t.avancement }}%
                      </td>
                      <td><span class="statut-badge-small" [class]="t.statut">{{ getTacheStatutLabel(t.statut) }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="detail-section full-width" *ngIf="selectedChantier.notes">
                <h4>📝 Notes</h4>
                <p>{{ selectedChantier.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Suppression -->
      <div class="modal-overlay" *ngIf="showDeleteModal">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>🗑️ Supprimer le chantier</h3>
            <button class="modal-close" (click)="showDeleteModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p>Supprimer le chantier <strong>{{ chantierToDelete?.nom }}</strong> ?</p>
            <p class="warning-text">Cette action supprimera également toutes les tâches, l'équipe et les documents associés.</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteChantier()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chantiers-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
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
    .kpi-card.budget .kpi-value { color: #10B981; }
    .kpi-card.avancement .kpi-value { color: #8B5CF6; }
    .kpi-card.surface .kpi-value { color: #F59E0B; }
    .kpi-card.retard .kpi-value { color: #EF4444; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 1000px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
    .modal-container.large { max-width: 1100px; }
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
    .montant-input { text-align: right; }
    .avancement-slider { width: 100%; }
    .avancement-value { text-align: center; margin-top: 4px; font-weight: 600; color: #EC4899; }
    
    .taches-header, .equipe-header, .materiels-header, .documents-header { display: flex; justify-content: space-between; align-items: center; margin: 20px 0 12px; flex-wrap: wrap; }
    .taches-list, .equipe-list, .materiels-list, .documents-list { border: 1px solid #F3F4F6; border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
    .tache-item, .membre-item, .materiel-item, .doc-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #F3F4F6; }
    .tache-item:last-child, .membre-item:last-child, .materiel-item:last-child, .doc-item:last-child { border-bottom: none; }
    .tache-info, .membre-info, .materiel-info, .doc-info { flex: 1; }
    .tache-designation { font-weight: 600; margin-bottom: 4px; }
    .tache-dates, .tache-responsable { font-size: 12px; color: #6B7280; margin-bottom: 4px; }
    .tache-avancement { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
    .progress-bar-small { flex: 1; height: 6px; background: #F3F4F6; border-radius: 3px; overflow: hidden; }
    .progress-fill-small { height: 100%; background: #10B981; border-radius: 3px; }
    .statut-badge-tache { font-size: 10px; padding: 2px 6px; border-radius: 12px; margin-right: 8px; }
    .statut-badge-tache.planifiee { background: #F3F4F6; color: #6B7280; }
    .statut-badge-tache.en_cours { background: #DBEAFE; color: #1E40AF; }
    .statut-badge-tache.terminee { background: #DCFCE7; color: #16A34A; }
    .statut-badge-tache.retardee { background: #FEF3C7; color: #D97706; }
    .statut-badge-materiel { font-size: 10px; padding: 2px 6px; border-radius: 12px; margin-right: 8px; }
    .statut-badge-materiel.disponible { background: #DCFCE7; color: #16A34A; }
    .statut-badge-materiel.utilise { background: #DBEAFE; color: #1E40AF; }
    .statut-badge-materiel.rendu { background: #F3F4F6; color: #6B7280; }
    .membre-role { font-size: 11px; color: #EC4899; margin-top: 2px; }
    .membre-date { font-size: 10px; color: #9CA3AF; }
    .materiel-designation { font-weight: 600; margin-bottom: 4px; }
    .materiel-quantite, .materiel-fournisseur, .materiel-cout, .materiel-dates { font-size: 11px; color: #6B7280; }
    .doc-icon { font-size: 24px; margin-right: 12px; }
    .doc-name { font-weight: 500; }
    .doc-type, .doc-version, .doc-date { font-size: 11px; color: #6B7280; }
    .tache-actions, .membre-actions, .materiel-actions, .doc-actions { display: flex; align-items: center; gap: 8px; }
    .action-btn { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 8px; border-radius: 6px; }
    .action-btn:hover { background: #FEF3F9; }
    .action-btn.delete:hover { background: #FEE2E2; }
    
    .tache-form, .membre-form { background: #F9FAFB; border-radius: 12px; padding: 20px; margin-top: 20px; }
    .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .close-form { background: none; border: none; font-size: 20px; cursor: pointer; color: #9CA3AF; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
    .no-data { text-align: center; padding: 40px; background: #F9FAFB; border-radius: 12px; color: #6B7280; }
    
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 3; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    
    .chantiers-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; background: #FEF3F9; color: #EC4899; }
    
    .chantiers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 20px; }
    .chantier-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .chantier-card.en_attente { border-left-color: #9CA3AF; }
    .chantier-card.en_cours { border-left-color: #3B82F6; }
    .chantier-card.suspendu { border-left-color: #F59E0B; }
    .chantier-card.termine { border-left-color: #10B981; opacity: 0.8; }
    .chantier-card.annule { border-left-color: #EF4444; opacity: 0.7; }
    .chantier-card.haute { background: #FEF2F2; }
    .chantier-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; }
    .chantier-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .chantier-ref { font-size: 11px; color: #9CA3AF; font-family: monospace; }
    .chantier-nom { font-weight: 600; color: #1F2937; margin-top: 2px; }
    .chantier-client { font-size: 11px; color: #6B7280; margin-top: 2px; }
    .header-right { text-align: right; }
    .chantier-budget { font-weight: 700; color: #EC4899; margin-bottom: 6px; }
    .priorite-badge { font-size: 10px; padding: 2px 6px; border-radius: 12px; display: inline-block; margin-right: 6px; }
    .priorite-badge.haute { background: #FEE2E2; color: #EF4444; }
    .priorite-badge.moyenne { background: #FEF3C7; color: #F59E0B; }
    .priorite-badge.basse { background: #DCFCE7; color: #16A34A; }
    .statut-badge { font-size: 10px; padding: 2px 6px; border-radius: 12px; display: inline-block; }
    .statut-badge.en_attente { background: #F3F4F6; color: #6B7280; }
    .statut-badge.en_cours { background: #DBEAFE; color: #1E40AF; }
    .statut-badge.suspendu { background: #FEF3C7; color: #D97706; }
    .statut-badge.termine { background: #DCFCE7; color: #16A34A; }
    .statut-badge.annule { background: #FEE2E2; color: #EF4444; }
    .card-body { margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .info-label { color: #6B7280; }
    .info-value { font-weight: 500; color: #1F2937; }
    .info-value.delay { color: #EF4444; }
    .progress-bar { background: #F3F4F6; border-radius: 20px; height: 8px; margin-top: 12px; position: relative; }
    .progress-fill { background: #10B981; border-radius: 20px; height: 100%; transition: width 0.3s ease; }
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
    .details-table th, .details-table td { padding: 8px; text-align: left; border-bottom: 1px solid #F3F4F6; vertical-align: top; }
    .details-table th { background: #F9FAFB; font-weight: 600; color: #6B7280; }
    .progress-bar-large { background: #F3F4F6; border-radius: 20px; height: 12px; overflow: hidden; margin: 8px 0; }
    .progress-fill-large { background: #10B981; border-radius: 20px; height: 100%; }
    .avancement-text { text-align: center; font-size: 14px; font-weight: 600; color: #EC4899; }
    .statut-badge-small { font-size: 10px; padding: 2px 6px; border-radius: 12px; }
    .statut-badge-small.planifiee { background: #F3F4F6; color: #6B7280; }
    .statut-badge-small.en_cours { background: #DBEAFE; color: #1E40AF; }
    .statut-badge-small.terminee { background: #DCFCE7; color: #16A34A; }
    .warning-text { color: #EF4444; font-size: 12px; margin-top: 8px; }
    
    @media (max-width: 1200px) { .kpi-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; gap: 12px; } .kpi-grid { grid-template-columns: repeat(2, 1fr); } .chantiers-grid { grid-template-columns: 1fr; } .filter-group { flex-direction: column; } .details-grid { grid-template-columns: 1fr; } .detail-section.full-width { grid-column: span 1; } }
  `]
})
export class Chantiers implements OnInit {
  chantiers: Chantier[] = [];
  filteredChantiers: Chantier[] = [];
  clients: any[] = [];
  responsables: any[] = [];
  employes: any[] = [];
  
  searchTerm = '';
  statutFilter = '';
  typeFilter = '';
  prioriteFilter = '';
  activeTab = 'info';
  showForm = false;
  showDetailsModal = false;
  showDeleteModal = false;
  showTacheForm = false;
  showMembreForm = false;
  editMode = false;
  editTacheMode = false;
  selectedChantier: Chantier | null = null;
  chantierToDelete: Chantier | null = null;
  currentTacheIndex = -1;
  successMessage = '';
  
  tacheForm: any = {
    designation: '',
    description: '',
    date_debut_prevue: '',
    date_fin_prevue: '',
    responsable_id: null,
    priorite: 'moyenne',
    avancement: 0,
    notes: ''
  };
  
  membreForm: any = {
    employe_id: null,
    role: 'ouvrier'
  };
  
  currentChantier: Partial<Chantier> = {
    reference: '',
    nom: '',
    description: '',
    type: 'construction',
    statut: 'en_attente',
    priorite: 'moyenne',
    adresse: '',
    ville: '',
    pays: '',
    date_debut_prevue: new Date().toISOString().split('T')[0],
    date_fin_prevue: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    budget_prevu: 0,
    superficie: 0,
    avancement: 0,
    taches: [],
    equipe: [],
    materiels: [],
    documents: []
  };
  
  ngOnInit() {
    this.loadClients();
    this.loadResponsables();
    this.loadEmployes();
    this.loadChantiers();
  }
  
  loadClients() {
    const saved = localStorage.getItem('clients');
    this.clients = saved ? JSON.parse(saved) : [];
  }
  
  loadResponsables() {
    const saved = localStorage.getItem('employes');
    this.responsables = saved ? JSON.parse(saved) : [];
  }
  
  loadEmployes() {
    const saved = localStorage.getItem('employes');
    this.employes = saved ? JSON.parse(saved) : [];
  }
  
  loadChantiers() {
    const saved = localStorage.getItem('chantiers');
    this.chantiers = saved ? JSON.parse(saved) : [];
    this.filteredChantiers = [...this.chantiers];
  }
  
  saveChantiersToStorage() {
    localStorage.setItem('chantiers', JSON.stringify(this.chantiers));
  }
  
  openForm() {
    this.currentChantier = {
      reference: this.generateReference(),
      nom: '',
      description: '',
      type: 'construction',
      statut: 'en_attente',
      priorite: 'moyenne',
      adresse: '',
      ville: '',
      pays: '',
      date_debut_prevue: new Date().toISOString().split('T')[0],
      date_fin_prevue: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      budget_prevu: 0,
      superficie: 0,
      avancement: 0,
      taches: [],
      equipe: [],
      materiels: [],
      documents: []
    };
    this.editMode = false;
    this.showForm = true;
    this.activeTab = 'info';
  }
  
  generateReference(): string {
    const date = new Date();
    const year = date.getFullYear();
    const count = this.chantiers.length + 1;
    return `CH-${year}-${String(count).padStart(4, '0')}`;
  }
  
  onResponsableChange() {
    const responsable = this.responsables.find(r => r.id === this.currentChantier.responsable_id);
    if (responsable) {
      this.currentChantier.responsable_nom = `${responsable.nom} ${responsable.prenom}`;
    }
  }
  
  onEmployeChange() {
    const employe = this.employes.find(e => e.id === this.membreForm.employe_id);
    if (employe && this.membreForm) {
      this.membreForm.employe_nom = `${employe.nom} ${employe.prenom}`;
      this.membreForm.employe_poste = employe.poste;
    }
  }
  
  calculerDuree() {}
  
  addTache() {
    this.tacheForm = {
      designation: '',
      description: '',
      date_debut_prevue: new Date().toISOString().split('T')[0],
      date_fin_prevue: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      responsable_id: null,
      priorite: 'moyenne',
      avancement: 0,
      notes: ''
    };
    this.editTacheMode = false;
    this.currentTacheIndex = -1;
    this.showTacheForm = true;
  }
  
  editTache(index: number) {
    const tache = this.currentChantier.taches?.[index];
    if (tache) {
      this.tacheForm = { ...tache };
      this.editTacheMode = true;
      this.currentTacheIndex = index;
      this.showTacheForm = true;
    }
  }
  
  saveTacheForm() {
    if (!this.tacheForm.designation) {
      alert('La désignation de la tâche est requise');
      return;
    }
    const responsable = this.responsables.find(r => r.id === this.tacheForm.responsable_id);
    const tache: TacheChantier = {
      ...this.tacheForm,
      id: Date.now(),
      responsable_nom: responsable ? `${responsable.nom} ${responsable.prenom}` : 'Non assigné',
      statut: this.getTacheStatutByAvancement(this.tacheForm.avancement)
    };
    if (!this.currentChantier.taches) this.currentChantier.taches = [];
    if (this.editTacheMode && this.currentTacheIndex !== -1) {
      this.currentChantier.taches[this.currentTacheIndex] = tache;
    } else {
      this.currentChantier.taches.push(tache);
    }
    this.closeTacheForm();
    this.recalculerAvancementGlobal();
  }
  
  removeTache(index: number) {
    if (this.currentChantier.taches) {
      this.currentChantier.taches.splice(index, 1);
      this.recalculerAvancementGlobal();
    }
  }
  
  closeTacheForm() {
    this.showTacheForm = false;
    this.editTacheMode = false;
    this.currentTacheIndex = -1;
  }
  
  addMembreEquipe() {
    this.membreForm = { employe_id: null, role: 'ouvrier' };
    this.showMembreForm = true;
  }
  
  saveMembreForm() {
    if (!this.membreForm.employe_id) {
      alert('Veuillez sélectionner un employé');
      return;
    }
    const employe = this.employes.find(e => e.id === this.membreForm.employe_id);
    if (employe) {
      const membre: EquipeChantier = {
        id: Date.now(),
        employe_id: employe.id,
        employe_nom: `${employe.nom} ${employe.prenom}`,
        employe_poste: employe.poste,
        role: this.membreForm.role,
        date_affectation: new Date().toISOString().split('T')[0]
      };
      if (!this.currentChantier.equipe) this.currentChantier.equipe = [];
      this.currentChantier.equipe.push(membre);
    }
    this.closeMembreForm();
  }
  
  removeMembreEquipe(index: number) {
    if (this.currentChantier.equipe) this.currentChantier.equipe.splice(index, 1);
  }
  
  closeMembreForm() {
    this.showMembreForm = false;
  }
  
  addMateriel() {
    if (!this.currentChantier.materiels) this.currentChantier.materiels = [];
    this.currentChantier.materiels.push({
      id: Date.now(),
      designation: '',
      quantite: 1,
      unite: 'unité',
      date_debut: new Date().toISOString().split('T')[0],
      fournisseur: '',
      cout: 0,
      statut: 'disponible'
    });
  }
  
  removeMateriel(index: number) {
    if (this.currentChantier.materiels) this.currentChantier.materiels.splice(index, 1);
  }
  
  addDocument() {
    if (!this.currentChantier.documents) this.currentChantier.documents = [];
    this.currentChantier.documents.push({
      id: Date.now(),
      type: 'autre',
      nom: 'Nouveau document',
      url: '',
      date_upload: new Date().toISOString(),
      version: 1
    });
  }
  
  removeDocument(index: number) {
    if (this.currentChantier.documents) this.currentChantier.documents.splice(index, 1);
  }
  
  viewDocument(doc: DocumentChantier) {
    alert(`Ouverture du document: ${doc.nom}`);
  }
  
  recalculerAvancementGlobal() {
    if (!this.currentChantier.taches || this.currentChantier.taches.length === 0) {
      this.currentChantier.avancement = 0;
      return;
    }
    const total = this.currentChantier.taches.reduce((sum, t) => sum + (t.avancement || 0), 0);
    this.currentChantier.avancement = Math.round(total / this.currentChantier.taches.length);
  }
  
  getTacheStatutByAvancement(avancement: number): TacheChantier['statut'] {
    if (avancement === 0) return 'planifiee';
    if (avancement === 100) return 'terminee';
    return 'en_cours';
  }
  
  saveChantier() {
    if (!this.currentChantier.nom) {
      alert('Le nom du chantier est requis');
      return;
    }
    if (this.editMode && this.currentChantier.id) {
      const index = this.chantiers.findIndex(c => c.id === this.currentChantier.id);
      if (index !== -1) {
        this.chantiers[index] = { ...this.currentChantier, updated_at: new Date().toISOString() } as Chantier;
        this.showSuccess('Chantier modifié');
      }
    } else {
      this.chantiers.push({ ...this.currentChantier, id: Date.now(), created_at: new Date().toISOString() } as Chantier);
      this.showSuccess('Chantier ajouté');
    }
    this.saveChantiersToStorage();
    this.filterChantiers();
    this.cancelForm();
  }
  
  editChantier(c: Chantier) {
    this.currentChantier = { ...c };
    if (!this.currentChantier.taches) this.currentChantier.taches = [];
    if (!this.currentChantier.equipe) this.currentChantier.equipe = [];
    if (!this.currentChantier.materiels) this.currentChantier.materiels = [];
    if (!this.currentChantier.documents) this.currentChantier.documents = [];
    this.editMode = true;
    this.showForm = true;
    this.activeTab = 'info';
  }
  
  viewDetails(c: Chantier) {
    this.selectedChantier = c;
    this.showDetailsModal = true;
  }
  
  voirSuivi(c: Chantier) { this.viewDetails(c); }
  genererRapport(c: Chantier) { alert(`Génération du rapport pour ${c.nom}`); }
  
  confirmDelete(c: Chantier) {
    this.chantierToDelete = c;
    this.showDeleteModal = true;
  }
  
  deleteChantier() {
    if (this.chantierToDelete) {
      this.chantiers = this.chantiers.filter(c => c.id !== this.chantierToDelete?.id);
      this.saveChantiersToStorage();
      this.filterChantiers();
      this.showDeleteModal = false;
      this.chantierToDelete = null;
      this.showSuccess('Chantier supprimé');
    }
  }
  
  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }
  
  filterChantiers() {
    let filtered = [...this.chantiers];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.nom?.toLowerCase().includes(term) ||
        c.reference?.toLowerCase().includes(term) ||
        c.client_nom?.toLowerCase().includes(term) ||
        c.ville?.toLowerCase().includes(term)
      );
    }
    if (this.statutFilter) filtered = filtered.filter(c => c.statut === this.statutFilter);
    if (this.typeFilter) filtered = filtered.filter(c => c.type === this.typeFilter);
    if (this.prioriteFilter) filtered = filtered.filter(c => c.priorite === this.prioriteFilter);
    this.filteredChantiers = filtered;
  }
  
  getChantiersActifs(): number { return this.chantiers.filter(c => c.statut === 'en_cours').length; }
  getBudgetTotal(): number { return this.chantiers.reduce((sum, c) => sum + (c.budget_prevu || 0), 0); }
  getAvancementMoyen(): number {
    if (this.chantiers.length === 0) return 0;
    return Math.round(this.chantiers.reduce((sum, c) => sum + (c.avancement || 0), 0) / this.chantiers.length);
  }
  getSuperficieTotale(): number { return this.chantiers.reduce((sum, c) => sum + (c.superficie || 0), 0); }
  getChantiersRetard(): number {
    const today = new Date();
    return this.chantiers.filter(c => c.statut === 'en_cours' && new Date(c.date_fin_prevue) < today && c.avancement < 100).length;
  }
  isEnRetard(c: Chantier): boolean {
    return c.statut === 'en_cours' && new Date(c.date_fin_prevue) < new Date() && c.avancement < 100;
  }
  getJoursRetard(c: Chantier): number {
    if (!this.isEnRetard(c)) return 0;
    const diff = Math.ceil((new Date().getTime() - new Date(c.date_fin_prevue).getTime()) / (1000 * 3600 * 24));
    return diff;
  }
  getEcartBudget(c: Chantier): number { return (c.budget_reel || 0) - (c.budget_prevu || 0); }
  
  getTypeIcon(type: string): string {
    const icons: any = { construction: '🏗️', renovation: '🔨', maintenance: '🔧', demolition: '🏚️', amenagement: '🌳' };
    return icons[type] || '🏗️';
  }
  getTypeLabel(type: string): string {
    const labels: any = { construction: 'Construction', renovation: 'Rénovation', maintenance: 'Maintenance', demolition: 'Démolition', amenagement: 'Aménagement' };
    return labels[type] || type;
  }
  getPrioriteLabel(priorite: string): string {
    const labels: any = { haute: '🔴 Haute', moyenne: '🟡 Moyenne', basse: '🟢 Basse' };
    return labels[priorite] || priorite;
  }
  getStatutLabel(statut: string): string {
    const labels: any = { en_attente: '⏳ En attente', en_cours: '🔄 En cours', suspendu: '⏸️ Suspendu', termine: '✅ Terminé', annule: '❌ Annulé' };
    return labels[statut] || statut;
  }
  getTacheStatutLabel(statut: string): string {
    const labels: any = { planifiee: '📋 Planifiée', en_cours: '🔄 En cours', terminee: '✅ Terminée', retardee: '⚠️ Retardée', annulee: '❌ Annulée' };
    return labels[statut] || statut;
  }
  getMaterielStatutLabel(statut: string): string {
    const labels: any = { disponible: '✅ Disponible', utilise: '🔄 Utilisé', rendu: '📦 Rendu', perdu: '❌ Perdu' };
    return labels[statut] || statut;
  }
  getRoleLabel(role: string): string {
    const labels: any = { chef: '👨‍💼 Chef de chantier', superviseur: '👁️ Superviseur', technicien: '🔧 Technicien', ouvrier: '👷 Ouvrier' };
    return labels[role] || role;
  }
  getDocumentIcon(type: string): string {
    const icons: any = { devis: '📄', contrat: '📑', plan: '🗺️', autorisation: '📜', facture: '💰', rapport: '📊', autre: '📎' };
    return icons[type] || '📎';
  }
  getDocumentTypeLabel(type: string): string {
    const labels: any = { devis: 'Devis', contrat: 'Contrat', plan: 'Plan', autorisation: 'Autorisation', facture: 'Facture', rapport: 'Rapport', autre: 'Autre' };
    return labels[type] || type;
  }
  
  // ========== EXPORT EXCEL (CSV) ==========
  exportToExcel() {
    const colonnes = [
      'Référence', 'Nom', 'Type', 'Statut', 'Priorité', 'Client', 'Lieu',
      'Début prévu', 'Fin prévue', 'Budget prévu (FCFA)', 'Superficie (m²)',
      'Avancement (%)', 'Tâches', 'Membres équipe', 'Créé le'
    ];
    const lignes = this.filteredChantiers.map(c => [
      c.reference, c.nom,
      this.getTypeLabel(c.type),
      this.getStatutLabel(c.statut),
      this.getPrioriteLabel(c.priorite),
      c.client_nom || '',
      `${c.ville}, ${c.pays}`,
      new Date(c.date_debut_prevue).toLocaleDateString(),
      new Date(c.date_fin_prevue).toLocaleDateString(),
      c.budget_prevu,
      c.superficie,
      c.avancement,
      (c.taches?.length || 0),
      (c.equipe?.length || 0),
      new Date(c.created_at).toLocaleDateString()
    ]);
    const csvContent = [colonnes, ...lignes]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `chantiers_${new Date().toISOString().slice(0,19)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showSuccess('Export Excel effectué');
  }
  
  // ========== EXPORT PDF ==========
  exportToPDF() {
    const contenu = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Liste des chantiers</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #EC4899; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: gray; }
        </style>
      </head>
      <body>
        <h1>Liste des chantiers</h1>
        <p>Généré le ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Référence</th><th>Nom</th><th>Type</th><th>Statut</th><th>Priorité</th>
              <th>Client</th><th>Lieu</th><th>Début prévu</th><th>Fin prévue</th>
              <th>Budget (FCFA)</th><th>Superficie (m²)</th><th>Avancement</th>
            </tr>
          </thead>
          <tbody>
            ${this.filteredChantiers.map(c => `
              <tr>
                <td>${c.reference}</td>
                <td>${c.nom}</td>
                <td>${this.getTypeLabel(c.type)}</td>
                <td>${this.getStatutLabel(c.statut)}</td>
                <td>${this.getPrioriteLabel(c.priorite)}</td>
                <td>${c.client_nom || '-'}</td>
                <td>${c.ville}, ${c.pays}</td>
                <td>${new Date(c.date_debut_prevue).toLocaleDateString()}</td>
                <td>${new Date(c.date_fin_prevue).toLocaleDateString()}</td>
                <td>${c.budget_prevu.toLocaleString()} FCFA</td>
                <td>${c.superficie} m²</td>
                <td>${c.avancement}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">PulseBusiness - Export chantiers</div>
      </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(contenu);
      win.document.close();
      win.print();
    } else {
      alert('Veuillez autoriser les pop-ups pour exporter en PDF');
    }
  }
  
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}