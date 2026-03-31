import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Chauffeur {
  id?: number;
  matricule: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  lieu_naissance: string;
  nationalite: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  numero_permis: string;
  categorie_permis: string;
  date_obtention_permis: string;
  date_expiration_permis: string;
  date_embauche: string;
  type_contrat: 'cdi' | 'cdd' | 'prestataire';
  salaire_base: number;
  experience_annees: number;
  certifications?: string;
  specialisations?: string;
  medecine_travail_date?: string;
  medecine_travail_validite?: string;
  casier_judiciaire?: string;
  photo?: string;
  statut: 'actif' | 'conge' | 'inactif' | 'suspendu';
  vehicule_attitre?: number;
  notes?: string;
}

@Component({
  selector: 'app-chauffeurs',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="chauffeurs-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>👨‍✈️ Chauffeurs</h1>
          <p class="subtitle">{{ chauffeurs.length }} chauffeur(s) • {{ getActifsCount() }} actif(s)</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="chauffeurs.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="chauffeurs.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouveau chauffeur</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="chauffeurs.length > 0">
        <div class="kpi-card total">
          <div class="kpi-icon">👥</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ chauffeurs.length }}</span>
            <span class="kpi-label">Total chauffeurs</span>
          </div>
        </div>
        <div class="kpi-card actif">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getActifsCount() }}</span>
            <span class="kpi-label">Actifs</span>
          </div>
        </div>
        <div class="kpi-card conge">
          <div class="kpi-icon">🏖️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getCongeCount() }}</span>
            <span class="kpi-label">En congé</span>
          </div>
        </div>
        <div class="kpi-card permis">
          <div class="kpi-icon">📜</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getPermisExpiresCount() }}</span>
            <span class="kpi-label">Permis expirés</span>
          </div>
        </div>
      </div>

      <!-- Formulaire moderne -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouveau' }} chauffeur</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveChauffeur()">
              <div class="tabs">
                <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">📋 Informations</button>
                <button type="button" [class.active]="activeTab === 'permis'" (click)="activeTab = 'permis'">📜 Permis</button>
                <button type="button" [class.active]="activeTab === 'emploi'" (click)="activeTab = 'emploi'">💼 Emploi</button>
              </div>

              <!-- Onglet Informations -->
              <div *ngIf="activeTab === 'info'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>Matricule *</label>
                    <input type="text" [(ngModel)]="currentChauffeur.matricule" name="matricule" required>
                  </div>
                  <div class="form-group">
                    <label>Nom *</label>
                    <input type="text" [(ngModel)]="currentChauffeur.nom" name="nom" required>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Prénom *</label>
                    <input type="text" [(ngModel)]="currentChauffeur.prenom" name="prenom" required>
                  </div>
                  <div class="form-group">
                    <label>Date naissance</label>
                    <input type="date" [(ngModel)]="currentChauffeur.date_naissance" name="date_naissance">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Lieu naissance</label>
                    <input type="text" [(ngModel)]="currentChauffeur.lieu_naissance" name="lieu_naissance">
                  </div>
                  <div class="form-group">
                    <label>Nationalité</label>
                    <input type="text" [(ngModel)]="currentChauffeur.nationalite" name="nationalite" value="Malienne">
                  </div>
                </div>
                <div class="form-group">
                  <label>Adresse</label>
                  <textarea [(ngModel)]="currentChauffeur.adresse" name="adresse" rows="2"></textarea>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Ville</label>
                    <input type="text" [(ngModel)]="currentChauffeur.ville" name="ville">
                  </div>
                  <div class="form-group">
                    <label>Téléphone *</label>
                    <input type="tel" [(ngModel)]="currentChauffeur.telephone" name="telephone" required>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Email</label>
                    <input type="email" [(ngModel)]="currentChauffeur.email" name="email">
                  </div>
                  <div class="form-group">
                    <label>Statut</label>
                    <select [(ngModel)]="currentChauffeur.statut" name="statut">
                      <option value="actif">✅ Actif</option>
                      <option value="conge">🏖️ En congé</option>
                      <option value="inactif">⏸️ Inactif</option>
                      <option value="suspendu">⚠️ Suspendu</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Onglet Permis -->
              <div *ngIf="activeTab === 'permis'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>N° permis *</label>
                    <input type="text" [(ngModel)]="currentChauffeur.numero_permis" name="numero_permis" required>
                  </div>
                  <div class="form-group">
                    <label>Catégorie permis</label>
                    <input type="text" [(ngModel)]="currentChauffeur.categorie_permis" name="categorie_permis" placeholder="Ex: B, C, D, E">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Date obtention</label>
                    <input type="date" [(ngModel)]="currentChauffeur.date_obtention_permis" name="date_obtention_permis">
                  </div>
                  <div class="form-group">
                    <label>Date expiration *</label>
                    <input type="date" [(ngModel)]="currentChauffeur.date_expiration_permis" name="date_expiration_permis" required>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Médecine du travail</label>
                    <input type="date" [(ngModel)]="currentChauffeur.medecine_travail_date" name="medecine_travail_date">
                  </div>
                  <div class="form-group">
                    <label>Validité médecine</label>
                    <input type="date" [(ngModel)]="currentChauffeur.medecine_travail_validite" name="medecine_travail_validite">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Casier judiciaire</label>
                    <input type="text" [(ngModel)]="currentChauffeur.casier_judiciaire" name="casier_judiciaire" placeholder="N° ou référence">
                  </div>
                  <div class="form-group">
                    <label>Certifications</label>
                    <input type="text" [(ngModel)]="currentChauffeur.certifications" name="certifications" placeholder="Ex: Transport matières dangereuses">
                  </div>
                </div>
                <div class="form-group">
                  <label>Spécialisations</label>
                  <textarea [(ngModel)]="currentChauffeur.specialisations" name="specialisations" rows="2" placeholder="Spécialisations du chauffeur..."></textarea>
                </div>
              </div>

              <!-- Onglet Emploi -->
              <div *ngIf="activeTab === 'emploi'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>Date d'embauche</label>
                    <input type="date" [(ngModel)]="currentChauffeur.date_embauche" name="date_embauche">
                  </div>
                  <div class="form-group">
                    <label>Type de contrat</label>
                    <select [(ngModel)]="currentChauffeur.type_contrat" name="type_contrat">
                      <option value="cdi">CDI</option>
                      <option value="cdd">CDD</option>
                      <option value="prestataire">Prestataire</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Salaire de base (FCFA)</label>
                    <input type="number" [(ngModel)]="currentChauffeur.salaire_base" name="salaire_base" min="0">
                  </div>
                  <div class="form-group">
                    <label>Expérience (années)</label>
                    <input type="number" [(ngModel)]="currentChauffeur.experience_annees" name="experience_annees" min="0" step="0.5">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Véhicule attitré</label>
                    <select [(ngModel)]="currentChauffeur.vehicule_attitre" name="vehicule_attitre">
                      <option [value]="null">Aucun</option>
                      <option *ngFor="let v of vehicules" [value]="v.id">{{ v.immatriculation }} - {{ v.marque }} {{ v.modele }}</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label>Notes</label>
                  <textarea [(ngModel)]="currentChauffeur.notes" name="notes" rows="3"></textarea>
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
      <div class="filters-section" *ngIf="chauffeurs.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterChauffeurs()" placeholder="Rechercher par nom, matricule..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterChauffeurs()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="actif">✅ Actif</option>
            <option value="conge">🏖️ Congé</option>
            <option value="inactif">⏸️ Inactif</option>
            <option value="suspendu">⚠️ Suspendu</option>
          </select>
          <select [(ngModel)]="permisFilter" (ngModelChange)="filterChauffeurs()" class="filter-select">
            <option value="">Tous permis</option>
            <option value="B">Permis B</option>
            <option value="C">Permis C</option>
            <option value="D">Permis D</option>
            <option value="E">Permis E</option>
          </select>
        </div>
      </div>

      <!-- Liste des chauffeurs améliorée -->
      <div class="chauffeurs-section" *ngIf="chauffeurs.length > 0; else emptyState">
        <div class="section-header">
          <h2>👨‍✈️ Liste des chauffeurs</h2>
          <div class="header-stats">
            <span class="stat-badge total">{{ chauffeurs.length }} chauffeurs</span>
            <span class="stat-badge actif">{{ getActifsCount() }} actifs</span>
          </div>
        </div>
        
        <div class="chauffeurs-grid">
          <div class="chauffeur-card" *ngFor="let c of filteredChauffeurs" [class]="c.statut" [class.alerte]="isPermisExpired(c)">
            <div class="card-header">
              <div class="header-left">
                <div class="chauffeur-avatar">
                  <span>{{ getInitials(c) }}</span>
                </div>
                <div class="chauffeur-info">
                  <div class="chauffeur-nom">{{ c.nom }} {{ c.prenom }}</div>
                  <div class="chauffeur-matricule">Matricule: {{ c.matricule }}</div>
                </div>
              </div>
              <div class="header-right">
                <span class="statut-badge" [class]="c.statut">{{ getStatutLabel(c.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">📞 Tél:</span>
                <span class="info-value">{{ c.telephone }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📜 Permis:</span>
                <span class="info-value">{{ c.categorie_permis }} ({{ c.numero_permis }})</span>
              </div>
              <div class="info-row">
                <span class="info-label">📅 Expiration:</span>
                <span class="info-value" [class.expired]="isPermisExpired(c)">
                  {{ c.date_expiration_permis | date:'dd/MM/yyyy' }}
                  <span *ngIf="isPermisExpired(c)" class="expired-badge">⚠️ Expiré</span>
                  <span *ngIf="isPermisExpiringSoon(c)" class="warning-badge">⚠️ Bientôt expiré</span>
                </span>
              </div>
              <!-- Correction ici : remplacer vehicule_attitre_nom par getVehiculeNom() -->
              <div class="info-row" *ngIf="c.vehicule_attitre">
                <span class="info-label">🚛 Véhicule:</span>
                <span class="info-value">{{ getVehiculeNom(c.vehicule_attitre) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">💼 Contrat:</span>
                <span class="info-value">{{ getContratLabel(c.type_contrat) }}</span>
              </div>
              <div class="info-row" *ngIf="c.experience_annees">
                <span class="info-label">⭐ Expérience:</span>
                <span class="info-value">{{ c.experience_annees }} ans</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="viewDetails(c)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="editChauffeur(c)" title="Modifier">✏️</button>
                <button class="action-icon delete" (click)="confirmDelete(c)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">👨‍✈️</div>
          <h2>Aucun chauffeur</h2>
          <p>Ajoutez votre premier chauffeur</p>
          <button class="btn-primary" (click)="openForm()">+ Nouveau chauffeur</button>
        </div>
      </ng-template>

      <!-- Modal Détails -->
      <div class="modal-overlay" *ngIf="showDetailsModal">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ selectedChauffeur?.nom }} {{ selectedChauffeur?.prenom }}</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedChauffeur">
            <div class="details-grid">
              <div class="detail-section">
                <h4>📋 Informations personnelles</h4>
                <p><strong>Matricule:</strong> {{ selectedChauffeur.matricule }}</p>
                <p><strong>Nom complet:</strong> {{ selectedChauffeur.nom }} {{ selectedChauffeur.prenom }}</p>
                <p><strong>Date naissance:</strong> {{ selectedChauffeur.date_naissance | date:'dd/MM/yyyy' }}</p>
                <p><strong>Lieu naissance:</strong> {{ selectedChauffeur.lieu_naissance }}</p>
                <p><strong>Nationalité:</strong> {{ selectedChauffeur.nationalite }}</p>
              </div>
              <div class="detail-section">
                <h4>📍 Coordonnées</h4>
                <p><strong>Adresse:</strong> {{ selectedChauffeur.adresse }}</p>
                <p><strong>Ville:</strong> {{ selectedChauffeur.ville }}</p>
                <p><strong>Téléphone:</strong> {{ selectedChauffeur.telephone }}</p>
                <p><strong>Email:</strong> {{ selectedChauffeur.email }}</p>
              </div>
              <div class="detail-section">
                <h4>📜 Permis de conduire</h4>
                <p><strong>N° permis:</strong> {{ selectedChauffeur.numero_permis }}</p>
                <p><strong>Catégorie:</strong> {{ selectedChauffeur.categorie_permis }}</p>
                <p><strong>Date obtention:</strong> {{ selectedChauffeur.date_obtention_permis | date:'dd/MM/yyyy' }}</p>
                <p><strong>Date expiration:</strong> {{ selectedChauffeur.date_expiration_permis | date:'dd/MM/yyyy' }}</p>
                <div *ngIf="isPermisExpired(selectedChauffeur)" class="alert-red">⚠️ Permis expiré !</div>
              </div>
              <div class="detail-section">
                <h4>💼 Emploi</h4>
                <p><strong>Date embauche:</strong> {{ selectedChauffeur.date_embauche | date:'dd/MM/yyyy' }}</p>
                <p><strong>Type contrat:</strong> {{ getContratLabel(selectedChauffeur.type_contrat) }}</p>
                <p><strong>Salaire base:</strong> {{ selectedChauffeur.salaire_base | number }} FCFA</p>
                <p><strong>Expérience:</strong> {{ selectedChauffeur.experience_annees }} ans</p>
                <p><strong>Statut:</strong> {{ getStatutLabel(selectedChauffeur.statut) }}</p>
                <p *ngIf="selectedChauffeur.vehicule_attitre"><strong>Véhicule:</strong> {{ getVehiculeNom(selectedChauffeur.vehicule_attitre) }}</p>
              </div>
              <div class="detail-section" *ngIf="selectedChauffeur.certifications || selectedChauffeur.specialisations">
                <h4>⚙️ Qualifications</h4>
                <p *ngIf="selectedChauffeur.certifications"><strong>Certifications:</strong> {{ selectedChauffeur.certifications }}</p>
                <p *ngIf="selectedChauffeur.specialisations"><strong>Spécialisations:</strong> {{ selectedChauffeur.specialisations }}</p>
              </div>
              <div class="detail-section full-width" *ngIf="selectedChauffeur.notes">
                <h4>📝 Notes</h4>
                <p>{{ selectedChauffeur.notes }}</p>
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
            <p>Supprimer le chauffeur <strong>{{ chauffeurToDelete?.nom }} {{ chauffeurToDelete?.prenom }}</strong> ?</p>
            <div class="alert-warning" *ngIf="chauffeurToDelete?.vehicule_attitre">
              ⚠️ Ce chauffeur est associé à un véhicule.
            </div>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteChauffeur()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chauffeurs-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
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
    .kpi-label { font-size: 13px; color: #6B7280; }
    .kpi-card.total .kpi-value { color: #EC4899; }
    .kpi-card.actif .kpi-value { color: #10B981; }
    .kpi-card.conge .kpi-value { color: #F59E0B; }
    .kpi-card.permis .kpi-value { color: #EF4444; }
    
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
    .form-group { display: flex; flex-direction: column; margin-bottom: 16px; }
    .form-group label { margin-bottom: 8px; color: #4B5563; font-weight: 500; font-size: 14px; }
    .form-group input, .form-group textarea, .form-group select { padding: 12px; border: 2px solid #F3F4F6; border-radius: 10px; font-size: 14px; transition: border-color 0.2s; }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #EC4899; }
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
    
    .chauffeurs-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .stat-badge.total { background: #FEF3F9; color: #EC4899; }
    .stat-badge.actif { background: #DCFCE7; color: #16A34A; }
    
    .chauffeurs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .chauffeur-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .chauffeur-card.actif { border-left-color: #10B981; }
    .chauffeur-card.conge { border-left-color: #F59E0B; }
    .chauffeur-card.inactif { border-left-color: #9CA3AF; opacity: 0.7; }
    .chauffeur-card.suspendu { border-left-color: #EF4444; }
    .chauffeur-card.alerte { background: #FEF2F2; }
    .chauffeur-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; flex: 1; }
    .chauffeur-avatar { width: 48px; height: 48px; background: linear-gradient(135deg, #EC4899, #831843); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 18px; }
    .chauffeur-nom { font-weight: 600; color: #1F2937; margin-bottom: 4px; }
    .chauffeur-matricule { font-size: 11px; color: #9CA3AF; font-family: monospace; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.actif { background: #DCFCE7; color: #16A34A; }
    .statut-badge.conge { background: #FEF3C7; color: #D97706; }
    .statut-badge.inactif { background: #F3F4F6; color: #6B7280; }
    .statut-badge.suspendu { background: #FEE2E2; color: #EF4444; }
    .card-body { margin: 16px 0; }
    .info-row { display: flex; gap: 8px; margin-bottom: 8px; font-size: 13px; }
    .info-label { font-weight: 500; color: #6B7280; width: 90px; }
    .info-value { color: #1F2937; }
    .info-value.expired { color: #EF4444; font-weight: 600; }
    .expired-badge, .warning-badge { font-size: 10px; margin-left: 6px; padding: 2px 6px; border-radius: 12px; }
    .expired-badge { background: #FEE2E2; color: #EF4444; }
    .warning-badge { background: #FEF3C7; color: #D97706; }
    .card-footer { display: flex; justify-content: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid #F3F4F6; }
    .footer-actions { display: flex; gap: 8px; }
    .action-icon { background: none; border: 1px solid #FCE7F3; border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: all 0.2s; font-size: 14px; }
    .action-icon:hover { background: #FEF3F9; border-color: #EC4899; }
    .action-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    
    .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .detail-section { margin-bottom: 16px; }
    .detail-section h4 { color: #EC4899; margin: 0 0 12px 0; font-size: 16px; }
    .detail-section p { margin: 8px 0; font-size: 14px; color: #4B5563; }
    .detail-section.full-width { grid-column: span 2; }
    .alert-red { background: #FEF2F2; color: #EF4444; padding: 8px; border-radius: 6px; margin-top: 8px; font-size: 13px; }
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; gap: 12px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .details-grid { grid-template-columns: 1fr; }
      .detail-section.full-width { grid-column: span 1; }
      .chauffeurs-grid { grid-template-columns: 1fr; }
      .info-row { flex-direction: column; gap: 4px; }
      .info-label { width: auto; }
    }
  `]
})
export class Chauffeurs implements OnInit {
  chauffeurs: Chauffeur[] = [];
  filteredChauffeurs: Chauffeur[] = [];
  selectedChauffeur: Chauffeur | null = null;
  
  vehicules: any[] = [];
  
  currentChauffeur: Partial<Chauffeur> = {
    matricule: '',
    nom: '',
    prenom: '',
    date_naissance: '',
    lieu_naissance: '',
    nationalite: 'Malienne',
    adresse: '',
    ville: '',
    telephone: '',
    email: '',
    numero_permis: '',
    categorie_permis: '',
    date_obtention_permis: '',
    date_expiration_permis: '',
    date_embauche: new Date().toISOString().split('T')[0],
    type_contrat: 'cdi',
    salaire_base: 0,
    experience_annees: 0,
    statut: 'actif',
    notes: ''
  };
  
  activeTab = 'info';
  searchTerm = '';
  statutFilter = '';
  permisFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  chauffeurToDelete: Chauffeur | null = null;
  successMessage = '';
  
  ngOnInit() {
    this.loadVehicules();
    this.loadChauffeurs();
  }
  
  openForm() {
    this.currentChauffeur = {
      matricule: this.generateMatricule(),
      nom: '',
      prenom: '',
      date_naissance: '',
      lieu_naissance: '',
      nationalite: 'Malienne',
      adresse: '',
      ville: '',
      telephone: '',
      email: '',
      numero_permis: '',
      categorie_permis: '',
      date_obtention_permis: '',
      date_expiration_permis: '',
      date_embauche: new Date().toISOString().split('T')[0],
      type_contrat: 'cdi',
      salaire_base: 0,
      experience_annees: 0,
      statut: 'actif',
      notes: ''
    };
    this.editMode = false;
    this.showForm = true;
    this.activeTab = 'info';
  }
  
  generateMatricule(): string {
    const count = this.chauffeurs.length + 1;
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    return `CH-${year}-${String(count).padStart(3, '0')}`;
  }
  
  loadVehicules() {
    const saved = localStorage.getItem('vehicules');
    this.vehicules = saved ? JSON.parse(saved) : [];
  }
  
  loadChauffeurs() {
    const saved = localStorage.getItem('chauffeurs');
    this.chauffeurs = saved ? JSON.parse(saved) : [];
    this.filteredChauffeurs = [...this.chauffeurs];
  }
  
  saveChauffeurs() {
    localStorage.setItem('chauffeurs', JSON.stringify(this.chauffeurs));
  }
  
  // Méthode pour obtenir le nom du véhicule à partir de son ID
  getVehiculeNom(vehiculeId: number): string {
    const vehicule = this.vehicules.find(v => v.id === vehiculeId);
    if (vehicule) {
      return `${vehicule.immatriculation} - ${vehicule.marque} ${vehicule.modele}`;
    }
    return '-';
  }
  
  getInitials(chauffeur: Chauffeur): string {
    return `${chauffeur.nom.charAt(0)}${chauffeur.prenom.charAt(0)}`.toUpperCase();
  }
  
  getActifsCount(): number {
    return this.chauffeurs.filter(c => c.statut === 'actif').length;
  }
  
  getCongeCount(): number {
    return this.chauffeurs.filter(c => c.statut === 'conge').length;
  }
  
  getPermisExpiresCount(): number {
    return this.chauffeurs.filter(c => this.isPermisExpired(c)).length;
  }
  
  isPermisExpired(chauffeur: Chauffeur): boolean {
    if (!chauffeur.date_expiration_permis) return false;
    return new Date(chauffeur.date_expiration_permis) < new Date();
  }
  
  isPermisExpiringSoon(chauffeur: Chauffeur): boolean {
    if (!chauffeur.date_expiration_permis) return false;
    const today = new Date();
    const expiration = new Date(chauffeur.date_expiration_permis);
    const diffDays = Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  }
  
  getStatutLabel(statut: string): string {
    const labels: any = { actif: '✅ Actif', conge: '🏖️ Congé', inactif: '⏸️ Inactif', suspendu: '⚠️ Suspendu' };
    return labels[statut] || statut;
  }
  
  getContratLabel(contrat: string): string {
    const labels: any = { cdi: 'CDI', cdd: 'CDD', prestataire: 'Prestataire' };
    return labels[contrat] || contrat;
  }
  
  saveChauffeur() {
    if (this.editMode && this.currentChauffeur.id) {
      const index = this.chauffeurs.findIndex(c => c.id === this.currentChauffeur.id);
      if (index !== -1) {
        this.chauffeurs[index] = { ...this.currentChauffeur } as Chauffeur;
        this.showSuccess('Chauffeur modifié');
      }
    } else {
      const newChauffeur = { ...this.currentChauffeur, id: Date.now() } as Chauffeur;
      this.chauffeurs.push(newChauffeur);
      this.showSuccess('Chauffeur ajouté');
    }
    this.saveChauffeurs();
    this.filterChauffeurs();
    this.cancelForm();
  }
  
  editChauffeur(c: Chauffeur) {
    this.currentChauffeur = { ...c };
    this.editMode = true;
    this.showForm = true;
  }
  
  viewDetails(c: Chauffeur) {
    this.selectedChauffeur = c;
    this.showDetailsModal = true;
  }
  
  confirmDelete(c: Chauffeur) {
    this.chauffeurToDelete = c;
    this.showDeleteModal = true;
  }
  
  deleteChauffeur() {
    if (this.chauffeurToDelete) {
      this.chauffeurs = this.chauffeurs.filter(c => c.id !== this.chauffeurToDelete?.id);
      this.saveChauffeurs();
      this.filterChauffeurs();
      this.showDeleteModal = false;
      this.chauffeurToDelete = null;
      this.showSuccess('Chauffeur supprimé');
    }
  }
  
  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }
  
  filterChauffeurs() {
    let filtered = this.chauffeurs;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.nom?.toLowerCase().includes(term) ||
        c.prenom?.toLowerCase().includes(term) ||
        c.matricule?.toLowerCase().includes(term) ||
        c.numero_permis?.toLowerCase().includes(term)
      );
    }
    
    if (this.statutFilter) {
      filtered = filtered.filter(c => c.statut === this.statutFilter);
    }
    
    if (this.permisFilter) {
      filtered = filtered.filter(c => c.categorie_permis?.includes(this.permisFilter));
    }
    
    this.filteredChauffeurs = filtered;
  }
  
    exportToExcel() {
    if (!this.filteredChauffeurs || this.filteredChauffeurs.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredChauffeurs[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const lignes = this.filteredChauffeurs.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ""));
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
    if (!this.filteredChauffeurs || this.filteredChauffeurs.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredChauffeurs[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join("")}</tr>\n</thead>\n<tbody>${this.filteredChauffeurs.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : "-"}</td>`).join("")}</tr>`).join("")}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert("Veuillez autoriser les pop-ups pour exporter en PDF"); }
  }
  
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}