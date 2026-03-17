import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

@Component({
  selector: 'app-ordres',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="ordres-container">
      <div class="header">
        <div>
          <h1>Ordres de production</h1>
          <p class="subtitle">{{ ordres.length }} ordre(s)</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouvel ordre</button>
      </div>
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouvel' }} ordre</h3>
        <form (ngSubmit)="saveOrdre()" #ordreForm="ngForm">
          <div class="tabs">
            <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">Informations</button>
            <button type="button" [class.active]="activeTab === 'matieres'" (click)="activeTab = 'matieres'">Matières</button>
            <button type="button" [class.active]="activeTab === 'operations'" (click)="activeTab = 'operations'">Opérations</button>
          </div>
          <div *ngIf="activeTab === 'info'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>N° ordre *</label>
                <input type="text" [(ngModel)]="currentOrdre.numero" name="numero" required>
              </div>
              <div class="form-group">
                <label>Désignation *</label>
                <input type="text" [(ngModel)]="currentOrdre.designation" name="designation" required>
              </div>
              <div class="form-group">
                <label>Produit</label>
                <select [(ngModel)]="currentOrdre.produit_id" name="produit_id">
                  <option value="">Sélectionner</option>
                  <option *ngFor="let a of articles" [value]="a.id">{{ a.nom }} ({{ a.reference }})</option>
                </select>
              </div>
              <div class="form-group">
                <label>Quantité prévue</label>
                <input type="number" [(ngModel)]="currentOrdre.quantite_prevue" name="quantite_prevue" min="0">
              </div>
              <div class="form-group">
                <label>Priorité</label>
                <select [(ngModel)]="currentOrdre.priorite" name="priorite">
                  <option value="basse">Basse</option>
                  <option value="normale">Normale</option>
                  <option value="haute">Haute</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              <div class="form-group">
                <label>Date début prévue</label>
                <input type="date" [(ngModel)]="currentOrdre.date_debut_prevue" name="date_debut_prevue">
              </div>
              <div class="form-group">
                <label>Date fin prévue</label>
                <input type="date" [(ngModel)]="currentOrdre.date_fin_prevue" name="date_fin_prevue">
              </div>
              <div class="form-group">
                <label>Atelier</label>
                <input type="text" [(ngModel)]="currentOrdre.atelier" name="atelier">
              </div>
              <div class="form-group">
                <label>Ligne production</label>
                <input type="text" [(ngModel)]="currentOrdre.ligne_production" name="ligne_production">
              </div>
              <div class="form-group">
                <label>Responsable</label>
                <input type="text" [(ngModel)]="currentOrdre.responsable" name="responsable">
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentOrdre.statut" name="statut">
                  <option value="planifie">Planifié</option>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Terminé</option>
                  <option value="annule">Annulé</option>
                  <option value="en_pause">En pause</option>
                </select>
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'matieres'" class="tab-content">
            <div class="matieres-section">
              <button class="btn-add-ligne" (click)="addMatiere()">+ Ajouter une matière première</button>
              <div *ngFor="let m of currentOrdre.matieres_premieres; let i = index" class="ligne-form">
                <select [(ngModel)]="m.article_id" [name]="'article_' + i" (change)="updateArticleNom(m)">
                  <option value="">Sélectionner</option>
                  <option *ngFor="let a of articles" [value]="a.id">{{ a.nom }} ({{ a.reference }})</option>
                </select>
                <input type="number" [(ngModel)]="m.quantite_prevue" [name]="'qte_prevue_' + i" placeholder="Qté prévue" min="0">
                <input type="text" [(ngModel)]="m.unite" [name]="'unite_' + i" placeholder="Unité" readonly>
                <button type="button" class="btn-remove" (click)="removeMatiere(i)">✕</button>
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'operations'" class="tab-content">
            <div class="operations-section">
              <button class="btn-add-ligne" (click)="addOperation()">+ Ajouter une opération</button>
              <div *ngFor="let o of currentOrdre.operations; let i = index" class="operation-form">
                <h4>Opération {{ i + 1 }}</h4>
                <div class="form-grid">
                  <div class="form-group">
                    <label>Nom</label>
                    <input type="text" [(ngModel)]="o.nom" [name]="'op_nom_' + i">
                  </div>
                  <div class="form-group">
                    <label>Ordre</label>
                    <input type="number" [(ngModel)]="o.ordre" [name]="'op_ordre_' + i" min="1">
                  </div>
                  <div class="form-group">
                    <label>Durée prévue (h)</label>
                    <input type="number" [(ngModel)]="o.duree_prevue" [name]="'op_duree_' + i" min="0" step="0.5">
                  </div>
                  <div class="form-group">
                    <label>Équipement</label>
                    <select [(ngModel)]="o.equipement_id" [name]="'op_equip_' + i" (change)="updateEquipementNom(o)">
                      <option value="">Sélectionner</option>
                      <option *ngFor="let e of equipements" [value]="e.id">{{ e.nom }} ({{ e.code }})</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Opérateur</label>
                    <select [(ngModel)]="o.operateur_id" [name]="'op_operateur_' + i" (change)="updateOperateurNom(o)">
                      <option value="">Sélectionner</option>
                      <option *ngFor="let op of operateurs" [value]="op.id">{{ op.nom }} {{ op.prenom }}</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Statut</label>
                    <select [(ngModel)]="o.statut" [name]="'op_statut_' + i">
                      <option value="planifie">Planifié</option>
                      <option value="en_cours">En cours</option>
                      <option value="termine">Terminé</option>
                    </select>
                  </div>
                  <div class="form-group full-width">
                    <label>Notes</label>
                    <textarea [(ngModel)]="o.notes" [name]="'op_notes_' + i" rows="2"></textarea>
                  </div>
                </div>
                <button type="button" class="btn-remove-section" (click)="removeOperation(i)">Supprimer cette opération</button>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="ordreForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>
      <div class="filters-bar" *ngIf="ordres.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterOrdres()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="statutFilter" (ngModelChange)="filterOrdres()" class="filter-select">
          <option value="">Tous statuts</option>
          <option value="planifie">Planifié</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
          <option value="annule">Annulé</option>
          <option value="en_pause">En pause</option>
        </select>
        <select [(ngModel)]="prioriteFilter" (ngModelChange)="filterOrdres()" class="filter-select">
          <option value="">Toutes priorités</option>
          <option value="basse">Basse</option>
          <option value="normale">Normale</option>
          <option value="haute">Haute</option>
          <option value="urgente">Urgente</option>
        </select>
      </div>
      <div class="ordres-list" *ngIf="ordres.length > 0; else emptyState">
        <div class="ordre-card" *ngFor="let o of filteredOrdres" [class]="'priorite-' + o.priorite">
          <div class="ordre-header">
            <span class="ordre-numero">{{ o.numero }}</span>
            <span class="ordre-badge" [class]="o.statut">{{ getStatutLabel(o.statut) }}</span>
          </div>
          <div class="ordre-body">
            <p class="ordre-designation">{{ o.designation }}</p>
            <p><span class="label">Quantité:</span> {{ o.quantite_produite }} / {{ o.quantite_prevue }}</p>
            <p><span class="label">Dates:</span> {{ o.date_debut_prevue | date }} - {{ o.date_fin_prevue | date }}</p>
            <p><span class="label">Priorité:</span> <span class="priorite" [class]="o.priorite">{{ getPrioriteLabel(o.priorite) }}</span></p>
            <p><span class="label">Avancement:</span> {{ getAvancement(o) }}%</p>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="getAvancement(o)"></div>
            </div>
          </div>
          <div class="ordre-footer">
            <div class="ordre-actions">
              <button class="btn-icon" (click)="viewDetails(o)" title="Voir">👁️</button>
              <button class="btn-icon" (click)="editOrdre(o)" title="Modifier">✏️</button>
              <button class="btn-icon" (click)="startOrdre(o)" *ngIf="o.statut === 'planifie'" title="Démarrer">▶️</button>
              <button class="btn-icon" (click)="pauseOrdre(o)" *ngIf="o.statut === 'en_cours'" title="Pause">⏸️</button>
              <button class="btn-icon" (click)="completeOrdre(o)" *ngIf="o.statut === 'en_cours'" title="Terminer">⏹️</button>
              <button class="btn-icon delete" (click)="confirmDelete(o)" title="Supprimer">🗑️</button>
            </div>
          </div>
        </div>
      </div>
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h2>Aucun ordre de production</h2>
          <p>Créez votre premier ordre</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouvel ordre</button>
        </div>
      </ng-template>
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>Ordre {{ selectedOrdre?.numero }}</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedOrdre">
            <div class="details-grid">
              <div class="detail-section">
                <h4>Informations générales</h4>
                <p><strong>N° ordre:</strong> {{ selectedOrdre.numero }}</p>
                <p><strong>Désignation:</strong> {{ selectedOrdre.designation }}</p>
                <p><strong>Produit:</strong> {{ selectedOrdre.produit_nom || '-' }}</p>
                <p><strong>Quantité:</strong> {{ selectedOrdre.quantite_produite }} / {{ selectedOrdre.quantite_prevue }}</p>
                <p><strong>Priorité:</strong> {{ getPrioriteLabel(selectedOrdre.priorite) }}</p>
              </div>
              <div class="detail-section">
                <h4>Planning</h4>
                <p><strong>Début prévu:</strong> {{ selectedOrdre.date_debut_prevue | date }}</p>
                <p><strong>Fin prévue:</strong> {{ selectedOrdre.date_fin_prevue | date }}</p>
                <p><strong>Début réel:</strong> {{ selectedOrdre.date_debut_reelle | date : '-' }}</p>
                <p><strong>Fin réelle:</strong> {{ selectedOrdre.date_fin_reelle | date : '-' }}</p>
                <p><strong>Atelier:</strong> {{ selectedOrdre.atelier || '-' }}</p>
                <p><strong>Ligne:</strong> {{ selectedOrdre.ligne_production || '-' }}</p>
              </div>
              <div class="detail-section full-width">
                <h4>Matières premières</h4>
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
                  </tbody>
                </table>
              </div>
              <div class="detail-section full-width">
                <h4>Opérations</h4>
                <table class="sub-table">
                  <thead>
                    <tr><th>Opération</th><th>Ordre</th><th>Durée</th><th>Équipement</th><th>Opérateur</th><th>Statut</th></tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let op of selectedOrdre.operations">
                      <td>{{ op.nom }}</td>
                      <td>{{ op.ordre }}</td>
                      <td>{{ op.duree_prevue }}h</td>
                      <td>{{ op.equipement_nom || '-' }}</td>
                      <td>{{ op.operateur_nom || '-' }}</td>
                      <td>{{ getTacheStatutLabel(op.statut) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer l'ordre <strong>{{ ordreToDelete?.numero }}</strong> ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteOrdre()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ordres-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 0; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .alert-success { background: #10B981; color: white; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
    .form-card { background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #FCE7F3; }
    .tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #FCE7F3; padding-bottom: 10px; }
    .tabs button { background: none; border: none; padding: 8px 16px; cursor: pointer; color: #6B7280; border-radius: 20px; }
    .tabs button.active { background: #EC4899; color: white; }
    .tab-content { margin-top: 20px; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .full-width { grid-column: span 2; }
    .form-group { display: flex; flex-direction: column; }
    label { margin-bottom: 5px; color: #4B5563; }
    input, textarea, select { padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    .btn-add-ligne { background: #FDF2F8; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; margin: 10px 0; cursor: pointer; color: #EC4899; width: 100%; }
    .ligne-form { display: flex; gap: 10px; margin-bottom: 10px; align-items: center; }
    .ligne-form select, .ligne-form input { flex: 1; }
    .btn-remove { background: #FEE2E2; border: none; border-radius: 4px; padding: 8px 12px; cursor: pointer; color: #EF4444; }
    .operation-form { border: 1px solid #FCE7F3; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    .btn-remove-section { background: #FEE2E2; border: none; border-radius: 4px; padding: 8px 16px; margin-top: 10px; cursor: pointer; color: #EF4444; }
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
    .filters-bar { display: flex; gap: 15px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 2; background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; }
    .filter-select { flex: 1; padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    .ordres-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .ordre-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .ordre-card.priorite-haute { border-left: 4px solid #F59E0B; }
    .ordre-card.priorite-urgente { border-left: 4px solid #EF4444; }
    .ordre-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .ordre-numero { font-weight: 600; color: #1F2937; font-size: 16px; }
    .ordre-badge { font-size: 12px; padding: 4px 8px; border-radius: 4px; }
    .ordre-badge.planifie { background: #F59E0B; color: white; }
    .ordre-badge.en_cours { background: #10B981; color: white; }
    .ordre-badge.termine { background: #6B7280; color: white; }
    .ordre-badge.annule { background: #EF4444; color: white; }
    .ordre-badge.en_pause { background: #9CA3AF; color: white; }
    .ordre-designation { font-size: 14px; color: #EC4899; margin-bottom: 10px; }
    .ordre-body p { margin: 5px 0; color: #6B7280; }
    .ordre-body .label { color: #4B5563; width: 80px; display: inline-block; }
    .priorite { padding: 2px 6px; border-radius: 4px; font-size: 11px; }
    .priorite.basse { background: #9CA3AF; color: white; }
    .priorite.normale { background: #10B981; color: white; }
    .priorite.haute { background: #F59E0B; color: white; }
    .priorite.urgente { background: #EF4444; color: white; }
    .progress-bar { height: 8px; background: #FCE7F3; border-radius: 4px; margin-top: 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: #EC4899; border-radius: 4px; }
    .ordre-footer { margin-top: 15px; padding-top: 15px; border-top: 1px solid #FCE7F3; }
    .ordre-actions { display: flex; justify-content: flex-end; gap: 8px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 400px; width: 90%; max-height: 80vh; overflow-y: auto; }
    .modal-content.large { max-width: 1000px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #6B7280; }
    .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .detail-section h4 { color: #EC4899; margin: 0 0 10px; }
    .detail-section.full-width { grid-column: span 2; }
    .sub-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .sub-table th { background: #FDF2F8; padding: 8px; text-align: left; }
    .sub-table td { padding: 8px; border-bottom: 1px solid #FCE7F3; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  `]
})
export class Ordres implements OnInit {
  articles: any[] = [];
  equipements: any[] = [];
  operateurs: any[] = [];
  ordres: OrdreProduction[] = [];
  filteredOrdres: OrdreProduction[] = [];
  selectedOrdre: OrdreProduction | null = null;
  currentOrdre: any = {
    numero: 'OF-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
    designation: '',
    produit_id: '',
    quantite_prevue: 0,
    quantite_produite: 0,
    quantite_rebut: 0,
    date_debut_prevue: new Date().toISOString().split('T')[0],
    date_fin_prevue: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
    priorite: 'normale',
    statut: 'planifie',
    atelier: '',
    ligne_production: '',
    responsable: '',
    equipements_utilises: [],
    matieres_premieres: [],
    operations: [],
    duree_totale_prevue: 0,
    notes: ''
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
  addMatiere() {
    this.currentOrdre.matieres_premieres.push({
      article_id: '',
      quantite_prevue: 0,
      quantite_consommee: 0,
      unite: ''
    });
  }
  removeMatiere(index: number) {
    this.currentOrdre.matieres_premieres.splice(index, 1);
  }
  updateArticleNom(m: any) {
    const article = this.articles.find(a => a.id === m.article_id);
    if (article) {
      m.article_nom = article.nom;
      m.unite = article.unite_mesure;
    }
  }
  addOperation() {
    this.currentOrdre.operations.push({
      nom: '',
      ordre: this.currentOrdre.operations.length + 1,
      duree_prevue: 1,
      equipement_id: '',
      operateur_id: '',
      statut: 'planifie',
      notes: ''
    });
  }
  removeOperation(index: number) {
    this.currentOrdre.operations.splice(index, 1);
  }
  updateEquipementNom(o: any) {
    const equip = this.equipements.find(e => e.id === o.equipement_id);
    if (equip) o.equipement_nom = equip.nom;
  }
  updateOperateurNom(o: any) {
    const op = this.operateurs.find(op => op.id === o.operateur_id);
    if (op) o.operateur_nom = op.nom + ' ' + op.prenom;
  }
  saveOrdre() {
    const produit = this.articles.find(a => a.id === this.currentOrdre.produit_id);
    this.currentOrdre.operations.forEach((o: any) => {
      const equip = this.equipements.find(e => e.id === o.equipement_id);
      const op = this.operateurs.find(op => op.id === o.operateur_id);
      o.equipement_nom = equip?.nom;
      o.operateur_nom = op ? op.nom + ' ' + op.prenom : '';
    });
    this.currentOrdre.duree_totale_prevue = this.currentOrdre.operations.reduce((sum: number, o: any) => sum + (o.duree_prevue || 0), 0);
    if (this.editMode) {
      const index = this.ordres.findIndex(o => o.id === this.currentOrdre.id);
      if (index !== -1) {
        this.ordres[index] = { ...this.currentOrdre, produit_nom: produit?.nom };
        this.showSuccess('Ordre modifié !');
      }
    } else {
      const newOrdre = { ...this.currentOrdre, id: Date.now(), produit_nom: produit?.nom };
      this.ordres.push(newOrdre);
      this.showSuccess('Ordre ajouté !');
    }
    localStorage.setItem('ordres_production', JSON.stringify(this.ordres));
    this.filterOrdres();
    this.cancelForm();
  }
  startOrdre(o: OrdreProduction) {
    o.statut = 'en_cours';
    o.date_debut_reelle = new Date().toISOString().split('T')[0];
    localStorage.setItem('ordres_production', JSON.stringify(this.ordres));
    this.filterOrdres();
    this.showSuccess('Ordre démarré !');
  }
  pauseOrdre(o: OrdreProduction) {
    o.statut = 'en_pause';
    localStorage.setItem('ordres_production', JSON.stringify(this.ordres));
    this.filterOrdres();
    this.showSuccess('Ordre mis en pause !');
  }
  completeOrdre(o: OrdreProduction) {
    o.statut = 'termine';
    o.date_fin_reelle = new Date().toISOString().split('T')[0];
    localStorage.setItem('ordres_production', JSON.stringify(this.ordres));
    this.filterOrdres();
    this.showSuccess('Ordre terminé !');
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
      localStorage.setItem('ordres_production', JSON.stringify(this.ordres));
      this.filterOrdres();
      this.showDeleteModal = false;
      this.ordreToDelete = null;
      this.showSuccess('Ordre supprimé !');
    }
  }
  cancelForm() {
    this.currentOrdre = {
      numero: 'OF-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      designation: '',
      produit_id: '',
      quantite_prevue: 0,
      quantite_produite: 0,
      quantite_rebut: 0,
      date_debut_prevue: new Date().toISOString().split('T')[0],
      date_fin_prevue: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
      priorite: 'normale',
      statut: 'planifie',
      atelier: '',
      ligne_production: '',
      responsable: '',
      equipements_utilises: [],
      matieres_premieres: [],
      operations: [],
      duree_totale_prevue: 0,
      notes: ''
    };
    this.activeTab = 'info';
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
  getAvancement(o: OrdreProduction): number {
    if (o.quantite_prevue === 0) return 0;
    return Math.round((o.quantite_produite / o.quantite_prevue) * 100);
  }
  getStatutLabel(statut: string): string {
    const labels: any = { 
      planifie: 'Planifié', 
      en_cours: 'En cours', 
      termine: 'Terminé', 
      annule: 'Annulé', 
      en_pause: 'En pause' 
    };
    return labels[statut] || statut;
  }
  getPrioriteLabel(priorite: string): string {
    const labels: any = { basse: 'Basse', normale: 'Normale', haute: 'Haute', urgente: 'Urgente' };
    return labels[priorite] || priorite;
  }
  getTacheStatutLabel(statut: string): string {
    const labels: any = { planifie: 'Planifié', en_cours: 'En cours', termine: 'Terminé' };
    return labels[statut] || statut;
  }
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
