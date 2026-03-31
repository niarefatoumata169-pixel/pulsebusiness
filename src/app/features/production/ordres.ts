import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface MatierePremiere {
  article_id: number;
  article_nom?: string;
  quantite_prevue: number;
  quantite_consommee: number;
  unite: string;
}

interface Operation {
  id?: number;
  nom: string;
  ordre: number;
  duree_prevue: number;
  duree_reelle?: number;
  equipement_id?: number;
  equipement_nom?: string;
  operateur_id?: number;
  operateur_nom?: string;
  date_debut?: string;
  date_fin?: string;
  statut: 'planifie' | 'en_cours' | 'termine';
  notes?: string;
}

interface OrdreProduction {
  id?: number;
  numero: string;
  designation: string;
  produit_id?: number;
  produit_nom?: string;
  quantite_prevue: number;
  quantite_produite: number;
  quantite_rebut: number;
  date_debut_prevue: string;
  date_fin_prevue: string;
  date_debut_reelle?: string;
  date_fin_reelle?: string;
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule' | 'en_pause';
  atelier?: string;
  ligne_production?: string;
  responsable: string;
  equipements_utilises: number[];
  matieres_premieres: MatierePremiere[];
  operations: Operation[];
  duree_totale_prevue: number;
  duree_totale_reelle?: number;
  notes?: string;
}

@Component({
  selector: 'app-ordres',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="ordres-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>🏭 Ordres de production</h1>
          <p class="subtitle">{{ ordres.length }} ordre(s) • {{ getOrdresEnCours() }} en cours</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="ordres.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="ordres.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouvel ordre</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="ordres.length > 0">
        <div class="kpi-card total">
          <div class="kpi-icon">📋</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ ordres.length }}</span>
            <span class="kpi-label">Total ordres</span>
          </div>
        </div>
        <div class="kpi-card en-cours">
          <div class="kpi-icon">⚙️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getOrdresEnCours() }}</span>
            <span class="kpi-label">En cours</span>
          </div>
        </div>
        <div class="kpi-card termine">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getOrdresTermines() }}</span>
            <span class="kpi-label">Terminés</span>
          </div>
        </div>
        <div class="kpi-card avancement">
          <div class="kpi-icon">📊</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getAvancementGlobal() }}%</span>
            <span class="kpi-label">Avancement global</span>
          </div>
        </div>
      </div>

      <!-- Formulaire moderne -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouvel' }} ordre de production</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveOrdre()">
              <div class="tabs">
                <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">📋 Informations</button>
                <button type="button" [class.active]="activeTab === 'matieres'" (click)="activeTab = 'matieres'">📦 Matières</button>
                <button type="button" [class.active]="activeTab === 'operations'" (click)="activeTab = 'operations'">⚙️ Opérations</button>
              </div>

              <!-- Onglet Informations -->
              <div *ngIf="activeTab === 'info'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>N° ordre *</label>
                    <input type="text" [(ngModel)]="currentOrdre.numero" name="numero" required readonly class="readonly">
                  </div>
                  <div class="form-group">
                    <label>Désignation *</label>
                    <input type="text" [(ngModel)]="currentOrdre.designation" name="designation" required>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Produit</label>
                    <select [(ngModel)]="currentOrdre.produit_id" name="produit_id" (change)="onProduitChange()">
                      <option [value]="null">Sélectionner</option>
                      <option *ngFor="let a of articles" [value]="a.id">{{ a.nom }} ({{ a.reference }})</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Quantité prévue</label>
                    <input type="number" [(ngModel)]="currentOrdre.quantite_prevue" name="quantite_prevue" min="0">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Priorité</label>
                    <div class="priority-toggle">
                      <button type="button" class="priority-btn" [class.active]="currentOrdre.priorite === 'basse'" (click)="currentOrdre.priorite = 'basse'">🟢 Basse</button>
                      <button type="button" class="priority-btn" [class.active]="currentOrdre.priorite === 'normale'" (click)="currentOrdre.priorite = 'normale'">🔵 Normale</button>
                      <button type="button" class="priority-btn" [class.active]="currentOrdre.priorite === 'haute'" (click)="currentOrdre.priorite = 'haute'">🟠 Haute</button>
                      <button type="button" class="priority-btn" [class.active]="currentOrdre.priorite === 'urgente'" (click)="currentOrdre.priorite = 'urgente'">🔴 Urgente</button>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Statut</label>
                    <select [(ngModel)]="currentOrdre.statut" name="statut">
                      <option value="planifie">📅 Planifié</option>
                      <option value="en_cours">⚙️ En cours</option>
                      <option value="termine">✅ Terminé</option>
                      <option value="annule">❌ Annulé</option>
                      <option value="en_pause">⏸️ En pause</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Date début prévue</label>
                    <input type="date" [(ngModel)]="currentOrdre.date_debut_prevue" name="date_debut_prevue">
                  </div>
                  <div class="form-group">
                    <label>Date fin prévue</label>
                    <input type="date" [(ngModel)]="currentOrdre.date_fin_prevue" name="date_fin_prevue">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Atelier</label>
                    <input type="text" [(ngModel)]="currentOrdre.atelier" name="atelier">
                  </div>
                  <div class="form-group">
                    <label>Ligne production</label>
                    <input type="text" [(ngModel)]="currentOrdre.ligne_production" name="ligne_production">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Responsable</label>
                    <input type="text" [(ngModel)]="currentOrdre.responsable" name="responsable">
                  </div>
                </div>
              </div>

              <!-- Onglet Matières -->
              <div *ngIf="activeTab === 'matieres'" class="tab-content">
                <div class="matieres-section">
                  <button type="button" class="btn-add-ligne" (click)="addMatiere()">+ Ajouter une matière première</button>
                  <div *ngFor="let m of currentOrdre.matieres_premieres; let i = index" class="ligne-card">
                    <div class="ligne-header">
                      <strong>Matière {{ i + 1 }}</strong>
                      <button type="button" class="btn-remove" (click)="removeMatiere(i)">✕</button>
                    </div>
                    <div class="form-row">
                      <div class="form-group">
                        <label>Article</label>
                        <select [(ngModel)]="m.article_id" [name]="'article_' + i" (change)="updateArticleNom(m)">
                          <option [value]="null">Sélectionner</option>
                          <option *ngFor="let a of articles" [value]="a.id">{{ a.nom }} ({{ a.reference }})</option>
                        </select>
                      </div>
                      <div class="form-group">
                        <label>Quantité prévue</label>
                        <input type="number" [(ngModel)]="m.quantite_prevue" [name]="'qte_prevue_' + i" min="0">
                      </div>
                      <div class="form-group">
                        <label>Unité</label>
                        <input type="text" [(ngModel)]="m.unite" [name]="'unite_' + i" readonly class="readonly">
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Onglet Opérations -->
              <div *ngIf="activeTab === 'operations'" class="tab-content">
                <div class="operations-section">
                  <button type="button" class="btn-add-ligne" (click)="addOperation()">+ Ajouter une opération</button>
                  <div *ngFor="let o of currentOrdre.operations; let i = index" class="operation-card">
                    <div class="operation-header">
                      <strong>Opération {{ i + 1 }}</strong>
                      <button type="button" class="btn-remove" (click)="removeOperation(i)">✕</button>
                    </div>
                    <div class="form-row">
                      <div class="form-group">
                        <label>Nom</label>
                        <input type="text" [(ngModel)]="o.nom" [name]="'op_nom_' + i">
                      </div>
                      <div class="form-group">
                        <label>Ordre</label>
                        <input type="number" [(ngModel)]="o.ordre" [name]="'op_ordre_' + i" min="1">
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-group">
                        <label>Durée prévue (h)</label>
                        <input type="number" [(ngModel)]="o.duree_prevue" [name]="'op_duree_' + i" min="0" step="0.5" (input)="calculerDureeTotale()">
                      </div>
                      <div class="form-group">
                        <label>Équipement</label>
                        <select [(ngModel)]="o.equipement_id" [name]="'op_equip_' + i" (change)="updateEquipementNom(o)">
                          <option [value]="null">Sélectionner</option>
                          <option *ngFor="let e of equipements" [value]="e.id">{{ e.nom }} ({{ e.code }})</option>
                        </select>
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-group">
                        <label>Opérateur</label>
                        <select [(ngModel)]="o.operateur_id" [name]="'op_operateur_' + i" (change)="updateOperateurNom(o)">
                          <option [value]="null">Sélectionner</option>
                          <option *ngFor="let op of operateurs" [value]="op.id">{{ op.nom }} {{ op.prenom }}</option>
                        </select>
                      </div>
                      <div class="form-group">
                        <label>Statut</label>
                        <select [(ngModel)]="o.statut" [name]="'op_statut_' + i">
                          <option value="planifie">📅 Planifié</option>
                          <option value="en_cours">⚙️ En cours</option>
                          <option value="termine">✅ Terminé</option>
                        </select>
                      </div>
                    </div>
                    <div class="form-group full-width">
                      <label>Notes</label>
                      <textarea [(ngModel)]="o.notes" [name]="'op_notes_' + i" rows="2"></textarea>
                    </div>
                  </div>
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
      <div class="filters-section" *ngIf="ordres.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterOrdres()" placeholder="Rechercher par n° ordre, désignation..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterOrdres()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="planifie">📅 Planifié</option>
            <option value="en_cours">⚙️ En cours</option>
            <option value="termine">✅ Terminé</option>
            <option value="annule">❌ Annulé</option>
          </select>
          <select [(ngModel)]="prioriteFilter" (ngModelChange)="filterOrdres()" class="filter-select">
            <option value="">Toutes priorités</option>
            <option value="basse">🟢 Basse</option>
            <option value="normale">🔵 Normale</option>
            <option value="haute">🟠 Haute</option>
            <option value="urgente">🔴 Urgente</option>
          </select>
        </div>
      </div>

      <!-- Liste des ordres améliorée -->
      <div class="ordres-section" *ngIf="ordres.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Liste des ordres de production</h2>
          <div class="header-stats">
            <span class="stat-badge total">{{ ordres.length }} au total</span>
            <span class="stat-badge encours">{{ getOrdresEnCours() }} en cours</span>
          </div>
        </div>
        
        <div class="ordres-grid">
          <div class="ordre-card" *ngFor="let o of filteredOrdres" [class]="'priorite-' + o.priorite">
            <div class="card-header">
              <div class="header-left">
                <div class="ordre-icon">🏭</div>
                <div class="ordre-info">
                  <div class="ordre-numero">{{ o.numero }}</div>
                  <div class="ordre-designation">{{ o.designation }}</div>
                </div>
              </div>
              <div class="header-right">
                <span class="statut-badge" [class]="o.statut">{{ getStatutLabel(o.statut) }}</span>
                <span class="priorite-badge" [class]="o.priorite">{{ getPrioriteLabel(o.priorite) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">📦 Quantité:</span>
                <span class="info-value">{{ o.quantite_produite }} / {{ o.quantite_prevue }} unités</span>
              </div>
              <div class="info-row">
                <span class="info-label">📅 Dates:</span>
                <span class="info-value">{{ o.date_debut_prevue | date:'dd/MM/yyyy' }} → {{ o.date_fin_prevue | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-row" *ngIf="o.responsable">
                <span class="info-label">👤 Responsable:</span>
                <span class="info-value">{{ o.responsable }}</span>
              </div>
              <div class="progress-container">
                <div class="progress-label">Avancement: {{ getAvancement(o) }}%</div>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="getAvancement(o)"></div>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="viewDetails(o)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="editOrdre(o)" title="Modifier">✏️</button>
                <button class="action-icon" *ngIf="o.statut === 'planifie'" (click)="startOrdre(o)" title="Démarrer">▶️</button>
                <button class="action-icon" *ngIf="o.statut === 'en_cours'" (click)="pauseOrdre(o)" title="Pause">⏸️</button>
                <button class="action-icon" *ngIf="o.statut === 'en_cours'" (click)="completeOrdre(o)" title="Terminer">⏹️</button>
                <button class="action-icon delete" (click)="confirmDelete(o)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🏭</div>
          <h2>Aucun ordre de production</h2>
          <p>Créez votre premier ordre de production</p>
          <button class="btn-primary" (click)="openForm()">+ Nouvel ordre</button>
        </div>
      </ng-template>

      <!-- Modal Détails -->
      <div class="modal-overlay" *ngIf="showDetailsModal">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>Ordre {{ selectedOrdre?.numero }}</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedOrdre">
            <div class="details-grid">
              <div class="detail-section">
                <h4>📋 Informations générales</h4>
                <p><strong>N° ordre:</strong> {{ selectedOrdre.numero }}</p>
                <p><strong>Désignation:</strong> {{ selectedOrdre.designation }}</p>
                <p><strong>Produit:</strong> {{ selectedOrdre.produit_nom || '-' }}</p>
                <p><strong>Quantité:</strong> {{ selectedOrdre.quantite_produite }} / {{ selectedOrdre.quantite_prevue }}</p>
                <p><strong>Priorité:</strong> {{ getPrioriteLabel(selectedOrdre.priorite) }}</p>
                <p><strong>Responsable:</strong> {{ selectedOrdre.responsable || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>📅 Planning</h4>
                <p><strong>Début prévu:</strong> {{ selectedOrdre.date_debut_prevue | date:'dd/MM/yyyy' }}</p>
                <p><strong>Fin prévue:</strong> {{ selectedOrdre.date_fin_prevue | date:'dd/MM/yyyy' }}</p>
                <p><strong>Début réel:</strong> {{ selectedOrdre.date_debut_reelle | date:'dd/MM/yyyy' || '-' }}</p>
                <p><strong>Fin réelle:</strong> {{ selectedOrdre.date_fin_reelle | date:'dd/MM/yyyy' || '-' }}</p>
                <p><strong>Atelier:</strong> {{ selectedOrdre.atelier || '-' }}</p>
                <p><strong>Ligne:</strong> {{ selectedOrdre.ligne_production || '-' }}</p>
              </div>
              <div class="detail-section full-width">
                <h4>📦 Matières premières</h4>
                <table class="sub-table">
                  <thead>
                     <tr><th>Article</th><th>Prévu</th><th>Consommé</th><th>Unité</th></tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let m of selectedOrdre.matieres_premieres">
                      <td>{{ m.article_nom || '-' }}</td>
                      <td>{{ m.quantite_prevue }}</td>
                      <td>{{ m.quantite_consommee }}</td>
                      <td>{{ m.unite }}</td>
                    </tr>
                    <tr *ngIf="selectedOrdre.matieres_premieres.length === 0">
                      <td colspan="4" class="text-center">Aucune matière première</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="detail-section full-width">
                <h4>⚙️ Opérations</h4>
                <table class="sub-table">
                  <thead>
                    <tr><th>Opération</th><th>Ordre</th><th>Durée (h)</th><th>Équipement</th><th>Opérateur</th><th>Statut</th></tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let op of selectedOrdre.operations">
                      <td>{{ op.nom }}</td>
                      <td>{{ op.ordre }}</td>
                      <td>{{ op.duree_prevue }}</td>
                      <td>{{ op.equipement_nom || '-' }}</td>
                      <td>{{ op.operateur_nom || '-' }}</td>
                      <td>{{ getTacheStatutLabel(op.statut) }}</td>
                    </tr>
                    <tr *ngIf="selectedOrdre.operations.length === 0">
                      <td colspan="6" class="text-center">Aucune opération</td>
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
            <h3>🗑️ Confirmer la suppression</h3>
            <button class="modal-close" (click)="showDeleteModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p>Supprimer l'ordre <strong>{{ ordreToDelete?.numero }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteOrdre()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ordres-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
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
    .kpi-card.en-cours .kpi-value { color: #F59E0B; }
    .kpi-card.termine .kpi-value { color: #10B981; }
    .kpi-card.avancement .kpi-value { color: #3B82F6; }
    
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
    .readonly { background: #F9FAFB; color: #6B7280; }
    .priority-toggle { display: flex; gap: 8px; flex-wrap: wrap; }
    .priority-btn { flex: 1; padding: 8px; border: 2px solid #F3F4F6; background: white; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-size: 12px; }
    .priority-btn.active { background: #EC4899; color: white; border-color: #EC4899; }
    .btn-add-ligne { background: #FEF3F9; border: 2px dashed #EC4899; border-radius: 10px; padding: 10px; width: 100%; cursor: pointer; color: #EC4899; font-weight: 500; margin-bottom: 16px; }
    .ligne-card, .operation-card { background: #F9FAFB; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
    .ligne-header, .operation-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .btn-remove { background: none; border: none; font-size: 18px; cursor: pointer; color: #EF4444; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-danger { background: #EF4444; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 2; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    
    .ordres-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .stat-badge.total { background: #FEF3F9; color: #EC4899; }
    .stat-badge.encours { background: #FEF3C7; color: #D97706; }
    
    .ordres-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .ordre-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .ordre-card.priorite-basse { border-left-color: #9CA3AF; }
    .ordre-card.priorite-normale { border-left-color: #3B82F6; }
    .ordre-card.priorite-haute { border-left-color: #F59E0B; }
    .ordre-card.priorite-urgente { border-left-color: #EF4444; }
    .ordre-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 16px; }
    .header-left { display: flex; gap: 16px; align-items: center; flex: 1; }
    .ordre-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .ordre-numero { font-weight: 600; color: #1F2937; margin-bottom: 4px; }
    .ordre-designation { font-size: 13px; color: #6B7280; }
    .header-right { text-align: right; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; display: inline-block; margin-bottom: 4px; }
    .statut-badge.planifie { background: #FEF3C7; color: #D97706; }
    .statut-badge.en_cours { background: #DBEAFE; color: #1E40AF; }
    .statut-badge.termine { background: #DCFCE7; color: #16A34A; }
    .statut-badge.annule { background: #FEE2E2; color: #EF4444; }
    .priorite-badge { font-size: 10px; padding: 2px 6px; border-radius: 12px; display: inline-block; }
    .priorite-badge.basse { background: #F3F4F6; color: #6B7280; }
    .priorite-badge.normale { background: #DBEAFE; color: #1E40AF; }
    .priorite-badge.haute { background: #FEF3C7; color: #D97706; }
    .priorite-badge.urgente { background: #FEE2E2; color: #EF4444; }
    .card-body { margin: 16px 0; }
    .info-row { display: flex; gap: 8px; margin-bottom: 8px; font-size: 13px; }
    .info-label { font-weight: 500; color: #6B7280; width: 100px; }
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
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    
    .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .detail-section { margin-bottom: 16px; }
    .detail-section h4 { color: #EC4899; margin: 0 0 12px 0; font-size: 16px; }
    .detail-section p { margin: 8px 0; font-size: 14px; color: #4B5563; }
    .detail-section.full-width { grid-column: span 2; }
    .sub-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .sub-table th { background: #FDF2F8; padding: 8px; text-align: left; font-weight: 600; }
    .sub-table td { padding: 8px; border-bottom: 1px solid #FCE7F3; }
    .text-center { text-align: center; color: #9CA3AF; padding: 16px; }
    
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; gap: 12px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .details-grid { grid-template-columns: 1fr; }
      .detail-section.full-width { grid-column: span 1; }
      .ordres-grid { grid-template-columns: 1fr; }
      .info-row { flex-direction: column; gap: 4px; }
      .info-label { width: auto; }
    }
  `]
})
export class Ordres implements OnInit {
  articles: any[] = [];
  equipements: any[] = [];
  operateurs: any[] = [];
  ordres: OrdreProduction[] = [];
  filteredOrdres: OrdreProduction[] = [];
  selectedOrdre: OrdreProduction | null = null;
  
  currentOrdre: Partial<OrdreProduction> = {
    numero: '',
    designation: '',
    quantite_prevue: 0,
    quantite_produite: 0,
    quantite_rebut: 0,
    date_debut_prevue: new Date().toISOString().split('T')[0],
    date_fin_prevue: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
    priorite: 'normale',
    statut: 'planifie',
    responsable: '',
    equipements_utilises: [],
    matieres_premieres: [],
    operations: [],
    duree_totale_prevue: 0
  };
  
  activeTab = 'info';
  searchTerm = '';
  statutFilter = '';
  prioriteFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  ordreToDelete: OrdreProduction | null = null;
  successMessage = '';
  
  ngOnInit() {
    this.loadArticles();
    this.loadEquipements();
    this.loadOperateurs();
    this.loadOrdres();
  }
  
  openForm() {
    this.currentOrdre = {
      numero: this.generateNumero(),
      designation: '',
      quantite_prevue: 0,
      quantite_produite: 0,
      quantite_rebut: 0,
      date_debut_prevue: new Date().toISOString().split('T')[0],
      date_fin_prevue: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
      priorite: 'normale',
      statut: 'planifie',
      responsable: '',
      equipements_utilises: [],
      matieres_premieres: [],
      operations: [],
      duree_totale_prevue: 0
    };
    this.editMode = false;
    this.showForm = true;
    this.activeTab = 'info';
  }
  
  generateNumero(): string {
    const count = this.ordres.length + 1;
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `OF-${year}${month}-${String(count).padStart(4, '0')}`;
  }
  
  loadArticles() {
    const saved = localStorage.getItem('articles');
    this.articles = saved ? JSON.parse(saved) : [];
  }
  
  loadEquipements() {
    const saved = localStorage.getItem('equipements');
    this.equipements = saved ? JSON.parse(saved) : [];
  }
  
  loadOperateurs() {
    const saved = localStorage.getItem('chauffeurs');
    this.operateurs = saved ? JSON.parse(saved) : [];
  }
  
  loadOrdres() {
    const saved = localStorage.getItem('ordres_production');
    this.ordres = saved ? JSON.parse(saved) : [];
    this.filteredOrdres = [...this.ordres];
  }
  
  saveOrdres() {
    localStorage.setItem('ordres_production', JSON.stringify(this.ordres));
  }
  
  onProduitChange() {
    const produit = this.articles.find(a => a.id === this.currentOrdre.produit_id);
    if (produit) {
      this.currentOrdre.produit_nom = produit.nom;
    }
  }
  
  addMatiere() {
    if (!this.currentOrdre.matieres_premieres) {
      this.currentOrdre.matieres_premieres = [];
    }
    this.currentOrdre.matieres_premieres.push({
      article_id: 0,
      quantite_prevue: 0,
      quantite_consommee: 0,
      unite: ''
    });
  }
  
  removeMatiere(index: number) {
    this.currentOrdre.matieres_premieres?.splice(index, 1);
  }
  
  updateArticleNom(m: any) {
    const article = this.articles.find(a => a.id === m.article_id);
    if (article) {
      m.article_nom = article.nom;
      m.unite = article.unite || 'pièce';
    }
  }
  
  addOperation() {
    if (!this.currentOrdre.operations) {
      this.currentOrdre.operations = [];
    }
    this.currentOrdre.operations.push({
      nom: '',
      ordre: (this.currentOrdre.operations.length + 1),
      duree_prevue: 1,
      statut: 'planifie'
    });
  }
  
  removeOperation(index: number) {
    this.currentOrdre.operations?.splice(index, 1);
  }
  
  updateEquipementNom(o: any) {
    const equip = this.equipements.find(e => e.id === o.equipement_id);
    if (equip) {
      o.equipement_nom = equip.nom;
    }
  }
  
  updateOperateurNom(o: any) {
    const op = this.operateurs.find(op => op.id === o.operateur_id);
    if (op) {
      o.operateur_nom = `${op.nom} ${op.prenom}`;
    }
  }
  
  calculerDureeTotale() {
    if (this.currentOrdre.operations) {
      this.currentOrdre.duree_totale_prevue = this.currentOrdre.operations.reduce((sum, o) => sum + (o.duree_prevue || 0), 0);
    }
  }
  
  saveOrdre() {
    const produit = this.articles.find(a => a.id === this.currentOrdre.produit_id);
    
    if (this.editMode && this.currentOrdre.id) {
      const index = this.ordres.findIndex(o => o.id === this.currentOrdre.id);
      if (index !== -1) {
        this.ordres[index] = { ...this.currentOrdre, produit_nom: produit?.nom } as OrdreProduction;
        this.showSuccess('Ordre modifié');
      }
    } else {
      const newOrdre = { ...this.currentOrdre, id: Date.now(), produit_nom: produit?.nom } as OrdreProduction;
      this.ordres.push(newOrdre);
      this.showSuccess('Ordre ajouté');
    }
    this.saveOrdres();
    this.filterOrdres();
    this.cancelForm();
  }
  
  startOrdre(o: OrdreProduction) {
    o.statut = 'en_cours';
    o.date_debut_reelle = new Date().toISOString().split('T')[0];
    this.saveOrdres();
    this.filterOrdres();
    this.showSuccess('Ordre démarré');
  }
  
  pauseOrdre(o: OrdreProduction) {
    o.statut = 'en_pause';
    this.saveOrdres();
    this.filterOrdres();
    this.showSuccess('Ordre mis en pause');
  }
  
  completeOrdre(o: OrdreProduction) {
    o.statut = 'termine';
    o.date_fin_reelle = new Date().toISOString().split('T')[0];
    this.saveOrdres();
    this.filterOrdres();
    this.showSuccess('Ordre terminé');
  }
  
  editOrdre(o: OrdreProduction) {
    this.currentOrdre = { ...o };
    this.editMode = true;
    this.showForm = true;
  }
  
  viewDetails(o: OrdreProduction) {
    this.selectedOrdre = o;
    this.showDetailsModal = true;
  }
  
  confirmDelete(o: OrdreProduction) {
    this.ordreToDelete = o;
    this.showDeleteModal = true;
  }
  
  deleteOrdre() {
    if (this.ordreToDelete) {
      this.ordres = this.ordres.filter(o => o.id !== this.ordreToDelete?.id);
      this.saveOrdres();
      this.filterOrdres();
      this.showDeleteModal = false;
      this.ordreToDelete = null;
      this.showSuccess('Ordre supprimé');
    }
  }
  
  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }
  
  filterOrdres() {
    let filtered = this.ordres;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        o.numero?.toLowerCase().includes(term) ||
        o.designation?.toLowerCase().includes(term) ||
        o.responsable?.toLowerCase().includes(term)
      );
    }
    
    if (this.statutFilter) {
      filtered = filtered.filter(o => o.statut === this.statutFilter);
    }
    
    if (this.prioriteFilter) {
      filtered = filtered.filter(o => o.priorite === this.prioriteFilter);
    }
    
    this.filteredOrdres = filtered;
  }
  
  getOrdresEnCours(): number {
    return this.ordres.filter(o => o.statut === 'en_cours').length;
  }
  
  getOrdresTermines(): number {
    return this.ordres.filter(o => o.statut === 'termine').length;
  }
  
  getAvancement(o: OrdreProduction): number {
    if (o.quantite_prevue === 0) return 0;
    return Math.round((o.quantite_produite / o.quantite_prevue) * 100);
  }
  
  getAvancementGlobal(): number {
    if (this.ordres.length === 0) return 0;
    const totalPrevues = this.ordres.reduce((sum, o) => sum + o.quantite_prevue, 0);
    const totalProduites = this.ordres.reduce((sum, o) => sum + o.quantite_produite, 0);
    if (totalPrevues === 0) return 0;
    return Math.round((totalProduites / totalPrevues) * 100);
  }
  
  getStatutLabel(statut: string): string {
    const labels: any = { 
      planifie: '📅 Planifié', 
      en_cours: '⚙️ En cours', 
      termine: '✅ Terminé', 
      annule: '❌ Annulé', 
      en_pause: '⏸️ En pause' 
    };
    return labels[statut] || statut;
  }
  
  getPrioriteLabel(priorite: string): string {
    const labels: any = { basse: '🟢 Basse', normale: '🔵 Normale', haute: '🟠 Haute', urgente: '🔴 Urgente' };
    return labels[priorite] || priorite;
  }
  
  getTacheStatutLabel(statut: string): string {
    const labels: any = { planifie: '📅 Planifié', en_cours: '⚙️ En cours', termine: '✅ Terminé' };
    return labels[statut] || statut;
  }
  
  exportToExcel() {
    if (!this.filteredOrdres || this.filteredOrdres.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }
    const firstItem = this.filteredOrdres[0] || {};
    const colonnes = Object.keys(firstItem).filter(k => !['id', 'created_at', 'updated_at'].includes(k));
    const lignes = this.filteredOrdres.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ''));
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
    if (!this.filteredOrdres || this.filteredOrdres.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }
    const firstItem = this.filteredOrdres[0] || {};
    const colonnes = Object.keys(firstItem).filter(k => !['id', 'created_at', 'updated_at'].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join('')}</tr>\n</thead>\n<tbody>${this.filteredOrdres.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : '-'}</td>`).join('')}</tr>`).join('')}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
    const win = window.open('', '_blank');
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert('Veuillez autoriser les pop-ups pour exporter en PDF'); }
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}