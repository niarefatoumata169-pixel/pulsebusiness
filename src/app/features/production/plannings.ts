import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface TachePlanning {
  id?: number;
  titre: string;
  date_debut: string;
  date_fin: string;
  heure_debut?: string;
  heure_fin?: string;
  equipement_id?: number;
  equipement_nom?: string;
  operateur_id?: number;
  operateur_nom?: string;
  duree_prevue: number;
  duree_reelle?: number;
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  notes?: string;
}

interface Planning {
  id?: number;
  reference: string;
  titre: string;
  type: 'production' | 'maintenance' | 'equipe' | 'projet';
  periode_debut: string;
  periode_fin: string;
  statut: 'brouillon' | 'publie' | 'archive';
  responsable: string;
  notes?: string;
  taches: TachePlanning[];
}

@Component({
  selector: 'app-plannings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="plannings-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>📅 Plannings de production</h1>
          <p class="subtitle">{{ plannings.length }} planning(s) • {{ getTotalTaches() }} tâche(s)</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="plannings.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="plannings.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouveau planning</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="plannings.length > 0">
        <div class="kpi-card total">
          <div class="kpi-icon">📅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ plannings.length }}</span>
            <span class="kpi-label">Plannings</span>
          </div>
        </div>
        <div class="kpi-card taches">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getTotalTaches() }}</span>
            <span class="kpi-label">Tâches planifiées</span>
          </div>
        </div>
        <div class="kpi-card en-cours">
          <div class="kpi-icon">⚙️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getTachesEnCours() }}</span>
            <span class="kpi-label">Tâches en cours</span>
          </div>
        </div>
        <div class="kpi-card publie">
          <div class="kpi-icon">📢</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getPlanningsPublies() }}</span>
            <span class="kpi-label">Plannings publiés</span>
          </div>
        </div>
      </div>

      <!-- Formulaire moderne -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouveau' }} planning</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="savePlanning()">
              <div class="form-row">
                <div class="form-group">
                  <label>Référence *</label>
                  <input type="text" [(ngModel)]="currentPlanning.reference" name="reference" required readonly class="readonly">
                </div>
                <div class="form-group">
                  <label>Titre *</label>
                  <input type="text" [(ngModel)]="currentPlanning.titre" name="titre" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Type</label>
                  <select [(ngModel)]="currentPlanning.type" name="type">
                    <option value="production">🏭 Production</option>
                    <option value="maintenance">🔧 Maintenance</option>
                    <option value="equipe">👥 Équipe</option>
                    <option value="projet">🚀 Projet</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Statut</label>
                  <select [(ngModel)]="currentPlanning.statut" name="statut">
                    <option value="brouillon">📝 Brouillon</option>
                    <option value="publie">📢 Publié</option>
                    <option value="archive">📦 Archivé</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Période début</label>
                  <input type="date" [(ngModel)]="currentPlanning.periode_debut" name="periode_debut">
                </div>
                <div class="form-group">
                  <label>Période fin</label>
                  <input type="date" [(ngModel)]="currentPlanning.periode_fin" name="periode_fin">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Responsable</label>
                  <input type="text" [(ngModel)]="currentPlanning.responsable" name="responsable">
                </div>
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="currentPlanning.notes" name="notes" rows="3"></textarea>
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
      <div class="filters-section" *ngIf="plannings.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterPlannings()" placeholder="Rechercher par titre, référence..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="typeFilter" (ngModelChange)="filterPlannings()" class="filter-select">
            <option value="">Tous types</option>
            <option value="production">🏭 Production</option>
            <option value="maintenance">🔧 Maintenance</option>
            <option value="equipe">👥 Équipe</option>
            <option value="projet">🚀 Projet</option>
          </select>
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterPlannings()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="brouillon">📝 Brouillon</option>
            <option value="publie">📢 Publié</option>
            <option value="archive">📦 Archivé</option>
          </select>
        </div>
      </div>

      <!-- Liste des plannings améliorée -->
      <div class="plannings-section" *ngIf="plannings.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Liste des plannings</h2>
          <div class="header-stats">
            <span class="stat-badge total">{{ plannings.length }} plannings</span>
            <span class="stat-badge taches">{{ getTotalTaches() }} tâches</span>
          </div>
        </div>
        
        <div class="plannings-grid">
          <div class="planning-card" *ngFor="let p of filteredPlannings" [class]="p.statut" (click)="viewPlanning(p)">
            <div class="card-header">
              <div class="header-left">
                <div class="planning-icon">{{ getTypeIcon(p.type) }}</div>
                <div class="planning-info">
                  <div class="planning-titre">{{ p.titre }}</div>
                  <div class="planning-ref">{{ p.reference }}</div>
                </div>
              </div>
              <div class="header-right">
                <span class="statut-badge" [class]="p.statut">{{ getStatutLabel(p.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">📅 Période:</span>
                <span class="info-value">{{ p.periode_debut | date:'dd/MM/yyyy' }} → {{ p.periode_fin | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📋 Type:</span>
                <span class="info-value">{{ getTypeLabel(p.type) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">✅ Tâches:</span>
                <span class="info-value">{{ p.taches.length }} tâche(s)</span>
              </div>
              <div class="info-row" *ngIf="p.responsable">
                <span class="info-label">👤 Responsable:</span>
                <span class="info-value">{{ p.responsable }}</span>
              </div>
              <div class="progress-container" *ngIf="p.taches.length > 0">
                <div class="progress-label">Avancement: {{ getAvancementPlanning(p) }}%</div>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="getAvancementPlanning(p)"></div>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="$event.stopPropagation(); viewPlanning(p)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="$event.stopPropagation(); editPlanning(p)" title="Modifier">✏️</button>
                <button class="action-icon delete" (click)="$event.stopPropagation(); confirmDeletePlanning(p)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📅</div>
          <h2>Aucun planning</h2>
          <p>Créez votre premier planning de production</p>
          <button class="btn-primary" (click)="openForm()">+ Nouveau planning</button>
        </div>
      </ng-template>

      <!-- Modal Détails Planning avec tâches -->
      <div class="modal-overlay" *ngIf="showDetailsModal">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ selectedPlanning?.titre }}</h3>
            <button class="modal-close" (click)="closeDetails()">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedPlanning">
            <div class="planning-details">
              <div class="info-card">
                <div class="info-row">
                  <span class="info-label">📋 Référence:</span>
                  <span class="info-value">{{ selectedPlanning.reference }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">📅 Période:</span>
                  <span class="info-value">{{ selectedPlanning.periode_debut | date:'dd/MM/yyyy' }} → {{ selectedPlanning.periode_fin | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">🏷️ Type:</span>
                  <span class="info-value">{{ getTypeLabel(selectedPlanning.type) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">📌 Statut:</span>
                  <span class="info-value status-badge" [class]="selectedPlanning.statut">{{ getStatutLabel(selectedPlanning.statut) }}</span>
                </div>
                <div class="info-row" *ngIf="selectedPlanning.responsable">
                  <span class="info-label">👤 Responsable:</span>
                  <span class="info-value">{{ selectedPlanning.responsable }}</span>
                </div>
                <div class="info-row" *ngIf="selectedPlanning.notes">
                  <span class="info-label">📝 Notes:</span>
                  <span class="info-value">{{ selectedPlanning.notes }}</span>
                </div>
              </div>
              
              <div class="taches-section">
                <div class="section-header">
                  <h4>⚙️ Tâches planifiées</h4>
                  <button class="btn-add-small" (click)="openTacheForm()">+ Ajouter une tâche</button>
                </div>
                <div class="taches-list">
                  <div class="tache-card" *ngFor="let t of selectedPlanning.taches" [class]="t.statut">
                    <div class="tache-header">
                      <div class="tache-info">
                        <span class="tache-titre">{{ t.titre }}</span>
                        <span class="tache-badge" [class]="t.statut">{{ getTacheStatutLabel(t.statut) }}</span>
                        <span class="priorite-badge" [class]="t.priorite">{{ getPrioriteLabel(t.priorite) }}</span>
                      </div>
                      <div class="tache-actions">
                        <button class="action-icon-small" (click)="editTache(t)" title="Modifier">✏️</button>
                        <button class="action-icon-small delete" (click)="deleteTache(t)" title="Supprimer">🗑️</button>
                      </div>
                    </div>
                    <div class="tache-body">
                      <div class="date-info">
                        <span>📅 {{ t.date_debut | date:'dd/MM/yyyy' }} {{ t.heure_debut ? 'à ' + t.heure_debut : '' }}</span>
                        <span>→</span>
                        <span>{{ t.date_fin | date:'dd/MM/yyyy' }} {{ t.heure_fin ? 'à ' + t.heure_fin : '' }}</span>
                      </div>
                      <div class="ressources-info">
                        <span *ngIf="t.equipement_nom" class="ressource">🔧 {{ t.equipement_nom }}</span>
                        <span *ngIf="t.operateur_nom" class="ressource">👤 {{ t.operateur_nom }}</span>
                        <span class="duree">⏱️ {{ t.duree_prevue }}h</span>
                      </div>
                      <div class="tache-notes" *ngIf="t.notes">
                        📝 {{ t.notes }}
                      </div>
                    </div>
                  </div>
                  <div *ngIf="selectedPlanning.taches.length === 0" class="empty-taches">
                    <p>Aucune tâche planifiée</p>
                    <button class="btn-add-small" (click)="openTacheForm()">+ Ajouter une tâche</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Formulaire Tâche -->
      <div class="modal-overlay" *ngIf="showTacheForm">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ editTacheMode ? '✏️ Modifier' : '➕ Nouvelle' }} tâche</h3>
            <button class="modal-close" (click)="closeTacheForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveTache()">
              <div class="form-group">
                <label>Titre *</label>
                <input type="text" [(ngModel)]="currentTache.titre" name="titre_tache" required>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Date début</label>
                  <input type="date" [(ngModel)]="currentTache.date_debut" name="date_debut">
                </div>
                <div class="form-group">
                  <label>Heure début</label>
                  <input type="time" [(ngModel)]="currentTache.heure_debut" name="heure_debut">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Date fin</label>
                  <input type="date" [(ngModel)]="currentTache.date_fin" name="date_fin">
                </div>
                <div class="form-group">
                  <label>Heure fin</label>
                  <input type="time" [(ngModel)]="currentTache.heure_fin" name="heure_fin">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Durée prévue (heures)</label>
                  <input type="number" [(ngModel)]="currentTache.duree_prevue" name="duree_prevue" min="0" step="0.5">
                </div>
                <div class="form-group">
                  <label>Priorité</label>
                  <select [(ngModel)]="currentTache.priorite" name="priorite">
                    <option value="basse">🟢 Basse</option>
                    <option value="normale">🔵 Normale</option>
                    <option value="haute">🟠 Haute</option>
                    <option value="urgente">🔴 Urgente</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Équipement</label>
                  <select [(ngModel)]="currentTache.equipement_id" name="equipement_id" (change)="updateEquipementNom()">
                    <option [value]="null">Sélectionner</option>
                    <option *ngFor="let e of equipements" [value]="e.id">{{ e.nom }} ({{ e.code }})</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Opérateur</label>
                  <select [(ngModel)]="currentTache.operateur_id" name="operateur_id" (change)="updateOperateurNom()">
                    <option [value]="null">Sélectionner</option>
                    <option *ngFor="let o of operateurs" [value]="o.id">{{ o.nom }} {{ o.prenom }}</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Statut</label>
                  <select [(ngModel)]="currentTache.statut" name="statut_tache">
                    <option value="planifie">📅 Planifié</option>
                    <option value="en_cours">⚙️ En cours</option>
                    <option value="termine">✅ Terminé</option>
                    <option value="annule">❌ Annulé</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="currentTache.notes" name="notes_tache" rows="3"></textarea>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeTacheForm()">Annuler</button>
                <button type="submit" class="btn-primary">💾 Enregistrer</button>
              </div>
            </form>
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
            <p>Supprimer {{ deleteType === 'planning' ? 'le planning' : 'la tâche' }} ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="confirmDelete()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .plannings-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
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
    .kpi-card.taches .kpi-value { color: #3B82F6; }
    .kpi-card.en-cours .kpi-value { color: #F59E0B; }
    .kpi-card.publie .kpi-value { color: #10B981; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 600px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
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
    .btn-add-small { background: #FEF3F9; border: 1px solid #EC4899; border-radius: 8px; padding: 6px 12px; cursor: pointer; color: #EC4899; font-size: 12px; transition: all 0.2s; }
    .btn-add-small:hover { background: #EC4899; color: white; }
    
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 2; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    
    .plannings-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2, .section-header h4 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .stat-badge.total { background: #FEF3F9; color: #EC4899; }
    .stat-badge.taches { background: #E0E7FF; color: #4F46E5; }
    
    .plannings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .planning-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; cursor: pointer; }
    .planning-card.brouillon { border-left-color: #9CA3AF; }
    .planning-card.publie { border-left-color: #10B981; }
    .planning-card.archive { border-left-color: #6B7280; opacity: 0.7; }
    .planning-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; }
    .planning-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .planning-titre { font-weight: 600; color: #1F2937; margin-bottom: 4px; }
    .planning-ref { font-size: 11px; color: #9CA3AF; font-family: monospace; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.brouillon { background: #F3F4F6; color: #6B7280; }
    .statut-badge.publie { background: #DCFCE7; color: #16A34A; }
    .statut-badge.archive { background: #F3F4F6; color: #6B7280; }
    .info-row { display: flex; gap: 8px; margin-bottom: 8px; font-size: 13px; }
    .info-label { font-weight: 500; color: #6B7280; width: 80px; }
    .info-value { color: #1F2937; }
    .progress-container { margin-top: 12px; }
    .progress-label { font-size: 11px; color: #6B7280; margin-bottom: 4px; }
    .progress-bar { height: 6px; background: #F3F4F6; border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; background: #EC4899; border-radius: 3px; transition: width 0.3s; }
    .card-footer { display: flex; justify-content: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid #F3F4F6; }
    .footer-actions { display: flex; gap: 8px; }
    .action-icon { background: none; border: 1px solid #FCE7F3; border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: all 0.2s; font-size: 14px; }
    .action-icon:hover { background: #FEF3F9; border-color: #EC4899; }
    .action-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    
    .planning-details { display: flex; flex-direction: column; gap: 24px; }
    .info-card { background: #F9FAFB; border-radius: 12px; padding: 20px; }
    .taches-section { margin-top: 8px; }
    .taches-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
    .tache-card { background: #F9FAFB; border-radius: 12px; padding: 16px; border-left: 4px solid transparent; }
    .tache-card.planifie { border-left-color: #F59E0B; }
    .tache-card.en_cours { border-left-color: #3B82F6; }
    .tache-card.termine { border-left-color: #10B981; opacity: 0.7; }
    .tache-card.annule { border-left-color: #EF4444; opacity: 0.7; }
    .tache-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
    .tache-info { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .tache-titre { font-weight: 600; color: #1F2937; }
    .tache-badge { font-size: 10px; padding: 2px 6px; border-radius: 12px; }
    .tache-badge.planifie { background: #FEF3C7; color: #D97706; }
    .tache-badge.en_cours { background: #DBEAFE; color: #1E40AF; }
    .tache-badge.termine { background: #DCFCE7; color: #16A34A; }
    .tache-badge.annule { background: #FEE2E2; color: #EF4444; }
    .priorite-badge { font-size: 10px; padding: 2px 6px; border-radius: 12px; }
    .priorite-badge.basse { background: #F3F4F6; color: #6B7280; }
    .priorite-badge.normale { background: #DBEAFE; color: #1E40AF; }
    .priorite-badge.haute { background: #FEF3C7; color: #D97706; }
    .priorite-badge.urgente { background: #FEE2E2; color: #EF4444; }
    .action-icon-small { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 4px 8px; cursor: pointer; font-size: 12px; transition: all 0.2s; }
    .action-icon-small:hover { background: #FEF3F9; border-color: #EC4899; }
    .action-icon-small.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .tache-body { margin-top: 8px; }
    .date-info { display: flex; gap: 8px; align-items: center; font-size: 12px; color: #6B7280; margin-bottom: 8px; }
    .ressources-info { display: flex; gap: 12px; flex-wrap: wrap; font-size: 12px; margin-bottom: 8px; }
    .ressource { background: white; padding: 2px 8px; border-radius: 20px; color: #4B5563; }
    .tache-notes { font-size: 11px; color: #9CA3AF; margin-top: 8px; padding-top: 8px; border-top: 1px solid #F3F4F6; }
    .empty-taches { text-align: center; padding: 40px; background: #F9FAFB; border-radius: 12px; }
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; gap: 12px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .plannings-grid { grid-template-columns: 1fr; }
      .tache-header { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class Plannings implements OnInit {
  equipements: any[] = [];
  operateurs: any[] = [];
  plannings: Planning[] = [];
  filteredPlannings: Planning[] = [];
  selectedPlanning: Planning | null = null;
  
  currentPlanning: Partial<Planning> = {
    reference: '',
    titre: '',
    type: 'production',
    periode_debut: new Date().toISOString().split('T')[0],
    periode_fin: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
    statut: 'brouillon',
    responsable: '',
    notes: '',
    taches: []
  };
  
  currentTache: Partial<TachePlanning> = {
    titre: '',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: new Date().toISOString().split('T')[0],
    heure_debut: '08:00',
    heure_fin: '17:00',
    duree_prevue: 8,
    priorite: 'normale',
    statut: 'planifie'
  };
  
  searchTerm = '';
  typeFilter = '';
  statutFilter = '';
  showForm = false;
  editMode = false;
  showDetailsModal = false;
  showTacheForm = false;
  editTacheMode = false;
  showDeleteModal = false;
  deleteType: 'planning' | 'tache' = 'planning';
  itemToDelete: any = null;
  successMessage = '';
  
  ngOnInit() {
    this.loadEquipements();
    this.loadOperateurs();
    this.loadPlannings();
  }
  
  openForm() {
    this.currentPlanning = {
      reference: this.generateReference(),
      titre: '',
      type: 'production',
      periode_debut: new Date().toISOString().split('T')[0],
      periode_fin: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
      statut: 'brouillon',
      responsable: '',
      notes: '',
      taches: []
    };
    this.editMode = false;
    this.showForm = true;
  }
  
  generateReference(): string {
    const count = this.plannings.length + 1;
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `PLN-${year}${month}-${String(count).padStart(4, '0')}`;
  }
  
  loadEquipements() {
    const saved = localStorage.getItem('equipements');
    this.equipements = saved ? JSON.parse(saved) : [];
  }
  
  loadOperateurs() {
    const saved = localStorage.getItem('chauffeurs');
    this.operateurs = saved ? JSON.parse(saved) : [];
  }
  
  loadPlannings() {
    const saved = localStorage.getItem('plannings');
    this.plannings = saved ? JSON.parse(saved) : [];
    this.filteredPlannings = [...this.plannings];
  }
  
  savePlannings() {
    localStorage.setItem('plannings', JSON.stringify(this.plannings));
  }
  
  savePlanning() {
    if (this.editMode && this.currentPlanning.id) {
      const index = this.plannings.findIndex(p => p.id === this.currentPlanning.id);
      if (index !== -1) {
        this.plannings[index] = { ...this.currentPlanning } as Planning;
        this.showSuccess('Planning modifié');
      }
    } else {
      const newPlanning = { ...this.currentPlanning, id: Date.now(), taches: [] } as Planning;
      this.plannings.push(newPlanning);
      this.showSuccess('Planning ajouté');
    }
    this.savePlannings();
    this.filterPlannings();
    this.cancelForm();
  }
  
  editPlanning(p: Planning) {
    this.currentPlanning = { ...p };
    this.editMode = true;
    this.showForm = true;
  }
  
  viewPlanning(p: Planning) {
    this.selectedPlanning = p;
    this.showDetailsModal = true;
  }
  
  closeDetails() {
    this.showDetailsModal = false;
    this.selectedPlanning = null;
  }
  
  openTacheForm() {
    this.currentTache = {
      titre: '',
      date_debut: new Date().toISOString().split('T')[0],
      date_fin: new Date().toISOString().split('T')[0],
      heure_debut: '08:00',
      heure_fin: '17:00',
      duree_prevue: 8,
      priorite: 'normale',
      statut: 'planifie'
    };
    this.editTacheMode = false;
    this.showTacheForm = true;
  }
  
  closeTacheForm() {
    this.showTacheForm = false;
    this.editTacheMode = false;
  }
  
  updateEquipementNom() {
    const equip = this.equipements.find(e => e.id === this.currentTache.equipement_id);
    if (equip) {
      this.currentTache.equipement_nom = equip.nom;
    }
  }
  
  updateOperateurNom() {
    const op = this.operateurs.find(o => o.id === this.currentTache.operateur_id);
    if (op) {
      this.currentTache.operateur_nom = `${op.nom} ${op.prenom}`;
    }
  }
  
  saveTache() {
    if (!this.selectedPlanning) return;
    
    const equip = this.equipements.find(e => e.id === this.currentTache.equipement_id);
    const op = this.operateurs.find(o => o.id === this.currentTache.operateur_id);
    
    if (this.editTacheMode && this.currentTache.id) {
      const index = this.selectedPlanning.taches.findIndex(t => t.id === this.currentTache.id);
      if (index !== -1) {
        this.selectedPlanning.taches[index] = { 
          ...this.currentTache, 
          equipement_nom: equip?.nom,
          operateur_nom: op ? `${op.nom} ${op.prenom}` : ''
        } as TachePlanning;
        this.showSuccess('Tâche modifiée');
      }
    } else {
      const newTache = { 
        ...this.currentTache, 
        id: Date.now(),
        equipement_nom: equip?.nom,
        operateur_nom: op ? `${op.nom} ${op.prenom}` : ''
      } as TachePlanning;
      this.selectedPlanning.taches.push(newTache);
      this.showSuccess('Tâche ajoutée');
    }
    this.updatePlanning();
    this.closeTacheForm();
  }
  
  editTache(t: TachePlanning) {
    this.currentTache = { ...t };
    this.editTacheMode = true;
    this.showTacheForm = true;
  }
  
  deleteTache(t: TachePlanning) {
    if (this.selectedPlanning && confirm('Supprimer cette tâche ?')) {
      this.selectedPlanning.taches = this.selectedPlanning.taches.filter(tache => tache.id !== t.id);
      this.updatePlanning();
      this.showSuccess('Tâche supprimée');
    }
  }
  
  updatePlanning() {
    if (this.selectedPlanning) {
      const index = this.plannings.findIndex(p => p.id === this.selectedPlanning?.id);
      if (index !== -1) {
        this.plannings[index] = this.selectedPlanning;
        this.savePlannings();
      }
    }
  }
  
  confirmDeletePlanning(p: Planning) {
    this.deleteType = 'planning';
    this.itemToDelete = p;
    this.showDeleteModal = true;
  }
  
  confirmDelete() {
    if (this.deleteType === 'planning' && this.itemToDelete) {
      this.plannings = this.plannings.filter(p => p.id !== this.itemToDelete.id);
      this.savePlannings();
      this.filterPlannings();
      this.showSuccess('Planning supprimé');
    }
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }
  
  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }
  
  filterPlannings() {
    let filtered = this.plannings;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.titre?.toLowerCase().includes(term) ||
        p.reference?.toLowerCase().includes(term) ||
        p.responsable?.toLowerCase().includes(term)
      );
    }
    
    if (this.typeFilter) {
      filtered = filtered.filter(p => p.type === this.typeFilter);
    }
    
    if (this.statutFilter) {
      filtered = filtered.filter(p => p.statut === this.statutFilter);
    }
    
    this.filteredPlannings = filtered;
  }
  
  getTotalTaches(): number {
    return this.plannings.reduce((sum, p) => sum + (p.taches?.length || 0), 0);
  }
  
  getTachesEnCours(): number {
    return this.plannings.reduce((sum, p) => sum + (p.taches?.filter(t => t.statut === 'en_cours').length || 0), 0);
  }
  
  getPlanningsPublies(): number {
    return this.plannings.filter(p => p.statut === 'publie').length;
  }
  
  getAvancementPlanning(p: Planning): number {
    if (!p.taches.length) return 0;
    const termines = p.taches.filter(t => t.statut === 'termine').length;
    return Math.round((termines / p.taches.length) * 100);
  }
  
  getTypeIcon(type: string): string {
    switch(type) {
      case 'production': return '🏭';
      case 'maintenance': return '🔧';
      case 'equipe': return '👥';
      default: return '🚀';
    }
  }
  
  getTypeLabel(type: string): string {
    const labels: any = { production: 'Production', maintenance: 'Maintenance', equipe: 'Équipe', projet: 'Projet' };
    return labels[type] || type;
  }
  
  getStatutLabel(statut: string): string {
    const labels: any = { brouillon: '📝 Brouillon', publie: '📢 Publié', archive: '📦 Archivé' };
    return labels[statut] || statut;
  }
  
  getTacheStatutLabel(statut: string): string {
    const labels: any = { planifie: '📅 Planifié', en_cours: '⚙️ En cours', termine: '✅ Terminé', annule: '❌ Annulé' };
    return labels[statut] || statut;
  }
  
  getPrioriteLabel(priorite: string): string {
    const labels: any = { basse: '🟢 Basse', normale: '🔵 Normale', haute: '🟠 Haute', urgente: '🔴 Urgente' };
    return labels[priorite] || priorite;
  }
  
    exportToExcel() {
    if (!this.filteredPlannings || this.filteredPlannings.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredPlannings[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const lignes = this.filteredPlannings.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ""));
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
    if (!this.filteredPlannings || this.filteredPlannings.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredPlannings[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join("")}</tr>\n</thead>\n<tbody>${this.filteredPlannings.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : "-"}</td>`).join("")}</tr>`).join("")}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert("Veuillez autoriser les pop-ups pour exporter en PDF"); }
  }
  
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}