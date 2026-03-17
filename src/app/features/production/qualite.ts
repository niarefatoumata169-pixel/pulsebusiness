import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ControleQualite {
  id?: number;
  reference: string;
  type: 'entree' | 'production' | 'sortie' | 'process';
  date_controle: string;
  produit_id?: number;
  produit_nom?: string;
  ordre_production_id?: number;
  ordre_production_numero?: string;
  lot?: string;
  echantillon: number;
  criteres: CritereControle[];
  resultat: 'conforme' | 'non_conforme' | 'en_attente';
  decision: 'accepte' | 'rejete' | 'retouche' | 'en_attente';
  non_conformite?: string;
  actions_correctives?: string;
  responsable: string;
  laboratoire?: string;
  document?: string;
  notes?: string;
}

interface CritereControle {
  nom: string;
  valeur_mesuree: string;
  valeur_spec: string;
  unite: string;
  conforme: boolean;
  tolérance?: string;
}

interface NonConformite {
  id?: number;
  reference: string;
  date_detection: string;
  type: 'produit' | 'process' | 'materiel' | 'document';
  produit_id?: number;
  produit_nom?: string;
  ordre_id?: number;
  ordre_numero?: string;
  description: string;
  gravite: 'mineure' | 'majeure' | 'critique';
  responsable: string;
  actions_correctives: ActionCorrective[];
  statut: 'ouverte' | 'en_cours' | 'fermee' | 'archivee';
  date_cloture?: string;
  cloture_par?: string;
  notes?: string;
}

interface ActionCorrective {
  description: string;
  responsable: string;
  date_prevue: string;
  date_realisation?: string;
  statut: 'planifie' | 'en_cours' | 'realise' | 'verifie';
  efficace: boolean;
}

@Component({
  selector: 'app-qualite',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="qualite-container">
      <div class="header">
        <div>
          <h1>Contrôle qualité</h1>
          <p class="subtitle">{{ controles.length }} contrôle(s) • {{ nonConformites.length }} NC(s)</p>
        </div>
        <div class="header-actions">
          <button class="btn-add" (click)="activeView = 'controles'; showControleForm = !showControleForm">+ Nouveau contrôle</button>
          <button class="btn-add" (click)="activeView = 'nc'; showNCForm = !showNCForm">+ Nouvelle NC</button>
        </div>
      </div>
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>
      <div class="view-tabs">
        <button [class.active]="activeView === 'controles'" (click)="activeView = 'controles'">Contrôles</button>
        <button [class.active]="activeView === 'nc'" (click)="activeView = 'nc'">Non-conformités</button>
        <button [class.active]="activeView === 'indicateurs'" (click)="activeView = 'indicateurs'">Indicateurs</button>
      </div>
      <div *ngIf="activeView === 'controles'">
        <div class="form-card" *ngIf="showControleForm">
          <h3>{{ editControleMode ? 'Modifier' : 'Nouveau' }} contrôle qualité</h3>
          <form (ngSubmit)="saveControle()" #controleForm="ngForm">
            <div class="form-grid">
              <div class="form-group">
                <label>Référence *</label>
                <input type="text" [(ngModel)]="currentControle.reference" name="ref_controle" required>
              </div>
              <div class="form-group">
                <label>Type</label>
                <select [(ngModel)]="currentControle.type" name="type_controle">
                  <option value="entree">Contrôle entrée</option>
                  <option value="production">Contrôle production</option>
                  <option value="sortie">Contrôle sortie</option>
                  <option value="process">Contrôle process</option>
                </select>
              </div>
              <div class="form-group">
                <label>Date contrôle</label>
                <input type="date" [(ngModel)]="currentControle.date_controle" name="date_controle">
              </div>
              <div class="form-group">
                <label>Produit</label>
                <select [(ngModel)]="currentControle.produit_id" name="produit_id" (change)="onProduitChange()">
                  <option value="">Sélectionner</option>
                  <option *ngFor="let a of articles" [value]="a.id">{{ a.nom }} ({{ a.reference }})</option>
                </select>
              </div>
              <div class="form-group">
                <label>Ordre production</label>
                <select [(ngModel)]="currentControle.ordre_production_id" name="ordre_id">
                  <option value="">Sélectionner</option>
                  <option *ngFor="let o of ordres" [value]="o.id">{{ o.numero }} - {{ o.designation }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Lot</label>
                <input type="text" [(ngModel)]="currentControle.lot" name="lot">
              </div>
              <div class="form-group">
                <label>Échantillon (taille)</label>
                <input type="number" [(ngModel)]="currentControle.echantillon" name="echantillon" min="1">
              </div>
              <div class="form-group">
                <label>Résultat</label>
                <select [(ngModel)]="currentControle.resultat" name="resultat">
                  <option value="conforme">Conforme</option>
                  <option value="non_conforme">Non conforme</option>
                  <option value="en_attente">En attente</option>
                </select>
              </div>
              <div class="form-group">
                <label>Décision</label>
                <select [(ngModel)]="currentControle.decision" name="decision">
                  <option value="accepte">Accepté</option>
                  <option value="rejete">Rejeté</option>
                  <option value="retouche">Retouche</option>
                  <option value="en_attente">En attente</option>
                </select>
              </div>
              <div class="form-group">
                <label>Responsable</label>
                <input type="text" [(ngModel)]="currentControle.responsable" name="responsable_controle">
              </div>
              <div class="form-group">
                <label>Laboratoire</label>
                <input type="text" [(ngModel)]="currentControle.laboratoire" name="laboratoire">
              </div>
            </div>
            <div class="form-section">
              <h4>Critères de contrôle</h4>
              <button class="btn-add-ligne" (click)="addCritere()">+ Ajouter un critère</button>
              <div *ngFor="let c of currentControle.criteres; let i = index" class="ligne-form">
                <input type="text" [(ngModel)]="c.nom" [name]="'crit_nom_' + i" placeholder="Critère">
                <input type="text" [(ngModel)]="c.valeur_mesuree" [name]="'crit_valeur_' + i" placeholder="Mesuré">
                <input type="text" [(ngModel)]="c.valeur_spec" [name]="'crit_spec_' + i" placeholder="Spécification">
                <input type="text" [(ngModel)]="c.unite" [name]="'crit_unite_' + i" placeholder="Unité">
                <input type="checkbox" [(ngModel)]="c.conforme" [name]="'crit_conforme_' + i">
                <button type="button" class="btn-remove" (click)="removeCritere(i)">✕</button>
              </div>
            </div>
            <div class="form-group">
              <label>Non-conformité constatée</label>
              <textarea [(ngModel)]="currentControle.non_conformite" name="non_conformite" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>Actions correctives</label>
              <textarea [(ngModel)]="currentControle.actions_correctives" name="actions_correctives" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>Document (URL)</label>
              <input type="text" [(ngModel)]="currentControle.document" name="document">
            </div>
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea [(ngModel)]="currentControle.notes" name="notes_controle" rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-cancel" (click)="cancelControleForm()">Annuler</button>
              <button type="submit" class="btn-save" [disabled]="controleForm.invalid">💾 Enregistrer</button>
            </div>
          </form>
        </div>
        <div class="filters-bar" *ngIf="controles.length > 0">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input [(ngModel)]="searchTermControle" (ngModelChange)="filterControles()" placeholder="Rechercher...">
          </div>
          <select [(ngModel)]="resultatFilter" (ngModelChange)="filterControles()" class="filter-select">
            <option value="">Tous résultats</option>
            <option value="conforme">Conforme</option>
            <option value="non_conforme">Non conforme</option>
            <option value="en_attente">En attente</option>
          </select>
          <select [(ngModel)]="typeControleFilter" (ngModelChange)="filterControles()" class="filter-select">
            <option value="">Tous types</option>
            <option value="entree">Entrée</option>
            <option value="production">Production</option>
            <option value="sortie">Sortie</option>
            <option value="process">Process</option>
          </select>
        </div>
        <div class="controles-list" *ngIf="controles.length > 0; else noControles">
          <div class="controle-card" *ngFor="let c of filteredControles">
            <div class="controle-header">
              <span class="controle-reference">{{ c.reference }}</span>
              <span class="controle-badge" [class]="c.resultat">{{ getResultatLabel(c.resultat) }}</span>
            </div>
            <div class="controle-body">
              <p><span class="label">Date:</span> {{ c.date_controle | date }}</p>
              <p><span class="label">Produit:</span> {{ c.produit_nom || '-' }}</p>
              <p><span class="label">Lot:</span> {{ c.lot || '-' }}</p>
              <p><span class="label">Échantillon:</span> {{ c.echantillon }}</p>
              <p><span class="label">Décision:</span> {{ getDecisionLabel(c.decision) }}</p>
            </div>
            <div class="controle-footer">
              <div class="controle-actions">
                <button class="btn-icon" (click)="viewControle(c)" title="Voir">👁️</button>
                <button class="btn-icon" (click)="editControle(c)" title="Modifier">✏️</button>
                <button class="btn-icon delete" (click)="confirmDeleteControle(c)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
        <ng-template #noControles>
          <div class="empty-state">
            <div class="empty-icon">✅</div>
            <h2>Aucun contrôle qualité</h2>
            <p>Enregistrez votre premier contrôle</p>
            <button class="btn-primary" (click)="showControleForm = true">+ Nouveau contrôle</button>
          </div>
        </ng-template>
      </div>
      <div *ngIf="activeView === 'nc'">
        <div class="form-card" *ngIf="showNCForm">
          <h3>{{ editNCMode ? 'Modifier' : 'Nouvelle' }} non-conformité</h3>
          <form (ngSubmit)="saveNC()" #ncForm="ngForm">
            <div class="form-grid">
              <div class="form-group">
                <label>Référence *</label>
                <input type="text" [(ngModel)]="currentNC.reference" name="ref_nc" required>
              </div>
              <div class="form-group">
                <label>Date détection</label>
                <input type="date" [(ngModel)]="currentNC.date_detection" name="date_detection">
              </div>
              <div class="form-group">
                <label>Type</label>
                <select [(ngModel)]="currentNC.type" name="type_nc">
                  <option value="produit">Produit</option>
                  <option value="process">Processus</option>
                  <option value="materiel">Matériel</option>
                  <option value="document">Document</option>
                </select>
              </div>
              <div class="form-group">
                <label>Produit concerné</label>
                <select [(ngModel)]="currentNC.produit_id" name="produit_nc">
                  <option value="">Sélectionner</option>
                  <option *ngFor="let a of articles" [value]="a.id">{{ a.nom }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Ordre concerné</label>
                <select [(ngModel)]="currentNC.ordre_id" name="ordre_nc">
                  <option value="">Sélectionner</option>
                  <option *ngFor="let o of ordres" [value]="o.id">{{ o.numero }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Gravité</label>
                <select [(ngModel)]="currentNC.gravite" name="gravite">
                  <option value="mineure">Mineure</option>
                  <option value="majeure">Majeure</option>
                  <option value="critique">Critique</option>
                </select>
              </div>
              <div class="form-group">
                <label>Responsable</label>
                <input type="text" [(ngModel)]="currentNC.responsable" name="responsable_nc">
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentNC.statut" name="statut_nc">
                  <option value="ouverte">Ouverte</option>
                  <option value="en_cours">En cours</option>
                  <option value="fermee">Fermée</option>
                  <option value="archivee">Archivée</option>
                </select>
              </div>
              <div class="form-group full-width">
                <label>Description</label>
                <textarea [(ngModel)]="currentNC.description" name="description_nc" rows="4" required></textarea>
              </div>
            </div>
            <div class="form-section">
              <h4>Actions correctives</h4>
              <button class="btn-add-ligne" (click)="addAction()">+ Ajouter une action</button>
              <div *ngFor="let a of currentNC.actions_correctives; let i = index" class="action-form">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Description</label>
                    <input type="text" [(ngModel)]="a.description" [name]="'action_desc_' + i">
                  </div>
                  <div class="form-group">
                    <label>Responsable</label>
                    <input type="text" [(ngModel)]="a.responsable" [name]="'action_resp_' + i">
                  </div>
                  <div class="form-group">
                    <label>Date prévue</label>
                    <input type="date" [(ngModel)]="a.date_prevue" [name]="'action_date_' + i">
                  </div>
                  <div class="form-group">
                    <label>Statut</label>
                    <select [(ngModel)]="a.statut" [name]="'action_statut_' + i">
                      <option value="planifie">Planifié</option>
                      <option value="en_cours">En cours</option>
                      <option value="realise">Réalisé</option>
                      <option value="verifie">Vérifié</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Efficace</label>
                    <input type="checkbox" [(ngModel)]="a.efficace" [name]="'action_efficace_' + i">
                  </div>
                </div>
                <button type="button" class="btn-remove" (click)="removeAction(i)">Supprimer cette action</button>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-cancel" (click)="cancelNCForm()">Annuler</button>
              <button type="submit" class="btn-save" [disabled]="ncForm.invalid">💾 Enregistrer</button>
            </div>
          </form>
        </div>
        <div class="filters-bar" *ngIf="nonConformites.length > 0">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input [(ngModel)]="searchTermNC" (ngModelChange)="filterNC()" placeholder="Rechercher...">
          </div>
          <select [(ngModel)]="graviteFilter" (ngModelChange)="filterNC()" class="filter-select">
            <option value="">Toutes gravités</option>
            <option value="mineure">Mineure</option>
            <option value="majeure">Majeure</option>
            <option value="critique">Critique</option>
          </select>
          <select [(ngModel)]="statutNCFilter" (ngModelChange)="filterNC()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="ouverte">Ouverte</option>
            <option value="en_cours">En cours</option>
            <option value="fermee">Fermée</option>
            <option value="archivee">Archivée</option>
          </select>
        </div>
        <div class="nc-list" *ngIf="nonConformites.length > 0; else noNC">
          <div class="nc-card" *ngFor="let n of filteredNC">
            <div class="nc-header">
              <span class="nc-reference">{{ n.reference }}</span>
              <span class="nc-badge" [class]="n.gravite">{{ getGraviteLabel(n.gravite) }}</span>
            </div>
            <div class="nc-body">
              <p><span class="label">Date:</span> {{ n.date_detection | date }}</p>
              <p><span class="label">Type:</span> {{ getTypeNCLabel(n.type) }}</p>
              <p><span class="label">Produit:</span> {{ n.produit_nom || '-' }}</p>
              <p><span class="label">Statut:</span> <span class="statut-badge" [class]="n.statut">{{ getStatutNCLabel(n.statut) }}</span></p>
            </div>
            <div class="nc-footer">
              <div class="nc-actions">
                <button class="btn-icon" (click)="viewNC(n)" title="Voir">��️</button>
                <button class="btn-icon" (click)="editNC(n)" title="Modifier">✏️</button>
                <button class="btn-icon delete" (click)="confirmDeleteNC(n)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
        <ng-template #noNC>
          <div class="empty-state">
            <div class="empty-icon">⚠️</div>
            <h2>Aucune non-conformité</h2>
            <p>Enregistrez votre première non-conformité</p>
            <button class="btn-primary" (click)="showNCForm = true">+ Nouvelle NC</button>
          </div>
        </ng-template>
      </div>
      <div *ngIf="activeView === 'indicateurs'">
        <div class="indicateurs-grid">
          <div class="indicateur-card">
            <h3>Taux de conformité</h3>
            <div class="indicateur-valeur">{{ tauxConformite }}%</div>
            <div class="indicateur-detail">{{ controlesConformes }} / {{ controles.length }} contrôles</div>
          </div>
          <div class="indicateur-card">
            <h3>NC par gravité</h3>
            <div class="stats-nc">
              <p>Critique: {{ ncCritique }}</p>
              <p>Majeure: {{ ncMajeure }}</p>
              <p>Mineure: {{ ncMineure }}</p>
            </div>
          </div>
          <div class="indicateur-card">
            <h3>Délai moyen de résolution</h3>
            <div class="indicateur-valeur">{{ delaiMoyen }} jours</div>
          </div>
          <div class="indicateur-card">
            <h3>NC par type</h3>
            <p>Produit: {{ ncProduit }}</p>
            <p>Process: {{ ncProcess }}</p>
            <p>Matériel: {{ ncMateriel }}</p>
            <p>Document: {{ ncDocument }}</p>
          </div>
        </div>
      </div>
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>{{ detailsType === 'controle' ? 'Contrôle' : 'Non-conformité' }} {{ selectedItem?.reference }}</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedItem">
            <pre>{{ selectedItem | json }}</pre>
          </div>
        </div>
      </div>
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer cet élément ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="confirmDelete()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .qualite-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 0; }
    .header-actions { display: flex; gap: 12px; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .alert-success { background: #10B981; color: white; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
    .view-tabs { display: flex; gap: 10px; margin-bottom: 24px; border-bottom: 2px solid #FCE7F3; padding-bottom: 10px; }
    .view-tabs button { background: none; border: none; padding: 8px 16px; cursor: pointer; color: #6B7280; border-radius: 20px; }
    .view-tabs button.active { background: #EC4899; color: white; }
    .form-card { background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #FCE7F3; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .full-width { grid-column: span 2; }
    .form-section { margin-top: 30px; padding-top: 20px; border-top: 1px solid #FCE7F3; }
    .form-section h4 { color: #EC4899; margin-bottom: 15px; }
    .form-group { display: flex; flex-direction: column; }
    label { margin-bottom: 5px; color: #4B5563; }
    input, textarea, select { padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    .btn-add-ligne { background: #FDF2F8; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; margin: 10px 0; cursor: pointer; color: #EC4899; width: 100%; }
    .ligne-form { display: flex; gap: 10px; margin-bottom: 10px; align-items: center; flex-wrap: wrap; }
    .ligne-form input { flex: 1; min-width: 120px; }
    .btn-remove { background: #FEE2E2; border: none; border-radius: 4px; padding: 8px 12px; cursor: pointer; color: #EF4444; }
    .action-form { border: 1px solid #FCE7F3; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
    .filters-bar { display: flex; gap: 15px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 2; background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; }
    .filter-select { flex: 1; padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    .controles-list, .nc-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .controle-card, .nc-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .controle-header, .nc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .controle-reference, .nc-reference { font-weight: 600; color: #1F2937; font-size: 16px; }
    .controle-badge, .nc-badge, .statut-badge { font-size: 12px; padding: 4px 8px; border-radius: 4px; }
    .controle-badge.conforme, .nc-badge.mineure { background: #10B981; color: white; }
    .controle-badge.non_conforme, .nc-badge.critique { background: #EF4444; color: white; }
    .controle-badge.en_attente, .nc-badge.majeure { background: #F59E0B; color: white; }
    .statut-badge.ouverte { background: #F59E0B; color: white; }
    .statut-badge.en_cours { background: #EC4899; color: white; }
    .statut-badge.fermee { background: #10B981; color: white; }
    .statut-badge.archivee { background: #6B7280; color: white; }
    .controle-body p, .nc-body p { margin: 5px 0; color: #6B7280; }
    .controle-body .label, .nc-body .label { color: #4B5563; width: 80px; display: inline-block; }
    .controle-footer, .nc-footer { margin-top: 15px; padding-top: 15px; border-top: 1px solid #FCE7F3; }
    .controle-actions, .nc-actions { display: flex; justify-content: flex-end; gap: 8px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .indicateurs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .indicateur-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .indicateur-card h3 { color: #1F2937; margin-bottom: 15px; }
    .indicateur-valeur { font-size: 36px; font-weight: 700; color: #EC4899; margin-bottom: 5px; }
    .indicateur-detail { color: #6B7280; }
    .stats-nc p { margin: 5px 0; color: #6B7280; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 400px; width: 90%; max-height: 80vh; overflow-y: auto; }
    .modal-content.large { max-width: 900px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #6B7280; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  `]
})
export class Qualite implements OnInit {
  articles: any[] = [];
  ordres: any[] = [];
  controles: ControleQualite[] = [];
  nonConformites: NonConformite[] = [];
  filteredControles: ControleQualite[] = [];
  filteredNC: NonConformite[] = [];
  selectedItem: any = null;
  currentControle: any = {
    reference: 'CQ-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
    type: 'entree',
    date_controle: new Date().toISOString().split('T')[0],
    produit_id: '',
    ordre_production_id: '',
    lot: '',
    echantillon: 1,
    criteres: [],
    resultat: 'en_attente',
    decision: 'en_attente',
    non_conformite: '',
    actions_correctives: '',
    responsable: '',
    laboratoire: '',
    document: '',
    notes: ''
  };
  currentNC: any = {
    reference: 'NC-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
    date_detection: new Date().toISOString().split('T')[0],
    type: 'produit',
    produit_id: '',
    ordre_id: '',
    description: '',
    gravite: 'mineure',
    responsable: '',
    actions_correctives: [],
    statut: 'ouverte',
    notes: ''
  };
  activeView = 'controles';
  searchTermControle = '';
  searchTermNC = '';
  resultatFilter = '';
  typeControleFilter = '';
  graviteFilter = '';
  statutNCFilter = '';
  showControleForm = false;
  showNCForm = false;
  editControleMode = false;
  editNCMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  detailsType: 'controle' | 'nc' = 'controle';
  deleteType: 'controle' | 'nc' = 'controle';
  itemToDelete: any = null;
  successMessage = '';
  tauxConformite = 0;
  controlesConformes = 0;
  ncCritique = 0;
  ncMajeure = 0;
  ncMineure = 0;
  ncProduit = 0;
  ncProcess = 0;
  ncMateriel = 0;
  ncDocument = 0;
  delaiMoyen = 0;
  ngOnInit() {
    this.loadArticles();
    this.loadOrdres();
    this.loadControles();
    this.loadNC();
    this.calculerIndicateurs();
  }
  loadArticles() {
    const saved = localStorage.getItem('articles');
    this.articles = saved ? JSON.parse(saved) : [];
  }
  loadOrdres() {
    const saved = localStorage.getItem('ordres_production');
    this.ordres = saved ? JSON.parse(saved) : [];
  }
  loadControles() {
    const saved = localStorage.getItem('controles_qualite');
    this.controles = saved ? JSON.parse(saved) : [];
    this.filteredControles = [...this.controles];
  }
  loadNC() {
    const saved = localStorage.getItem('non_conformites');
    this.nonConformites = saved ? JSON.parse(saved) : [];
    this.filteredNC = [...this.nonConformites];
  }
  onProduitChange() {
    const produit = this.articles.find(a => a.id === this.currentControle.produit_id);
    if (produit) this.currentControle.produit_nom = produit.nom;
  }
  addCritere() {
    this.currentControle.criteres.push({
      nom: '',
      valeur_mesuree: '',
      valeur_spec: '',
      unite: '',
      conforme: true
    });
  }
  removeCritere(index: number) {
    this.currentControle.criteres.splice(index, 1);
  }
  saveControle() {
    const produit = this.articles.find(a => a.id === this.currentControle.produit_id);
    if (this.editControleMode) {
      const index = this.controles.findIndex(c => c.id === this.currentControle.id);
      if (index !== -1) {
        this.controles[index] = { ...this.currentControle, produit_nom: produit?.nom };
        this.showSuccess('Contrôle modifié !');
      }
    } else {
      const newControle = { ...this.currentControle, id: Date.now(), produit_nom: produit?.nom };
      this.controles.push(newControle);
      this.showSuccess('Contrôle ajouté !');
    }
    localStorage.setItem('controles_qualite', JSON.stringify(this.controles));
    this.filterControles();
    this.calculerIndicateurs();
    this.cancelControleForm();
  }
  addAction() {
    this.currentNC.actions_correctives.push({
      description: '',
      responsable: '',
      date_prevue: new Date().toISOString().split('T')[0],
      date_realisation: '',
      statut: 'planifie',
      efficace: false
    });
  }
  removeAction(index: number) {
    this.currentNC.actions_correctives.splice(index, 1);
  }
  saveNC() {
    const produit = this.articles.find(a => a.id === this.currentNC.produit_id);
    const ordre = this.ordres.find(o => o.id === this.currentNC.ordre_id);
    if (this.editNCMode) {
      const index = this.nonConformites.findIndex(n => n.id === this.currentNC.id);
      if (index !== -1) {
        this.nonConformites[index] = { 
          ...this.currentNC, 
          produit_nom: produit?.nom,
          ordre_numero: ordre?.numero
        };
        this.showSuccess('NC modifiée !');
      }
    } else {
      const newNC = { 
        ...this.currentNC, 
        id: Date.now(),
        produit_nom: produit?.nom,
        ordre_numero: ordre?.numero
      };
      this.nonConformites.push(newNC);
      this.showSuccess('NC ajoutée !');
    }
    localStorage.setItem('non_conformites', JSON.stringify(this.nonConformites));
    this.filterNC();
    this.calculerIndicateurs();
    this.cancelNCForm();
  }
  editControle(c: ControleQualite) {
    this.currentControle = { ...c };
    this.editControleMode = true;
    this.showControleForm = true;
  }
  editNC(n: NonConformite) {
    this.currentNC = { ...n };
    this.editNCMode = true;
    this.showNCForm = true;
  }
  viewControle(c: ControleQualite) {
    this.detailsType = 'controle';
    this.selectedItem = c;
    this.showDetailsModal = true;
  }
  viewNC(n: NonConformite) {
    this.detailsType = 'nc';
    this.selectedItem = n;
    this.showDetailsModal = true;
  }
  confirmDeleteControle(c: ControleQualite) {
    this.deleteType = 'controle';
    this.itemToDelete = c;
    this.showDeleteModal = true;
  }
  confirmDeleteNC(n: NonConformite) {
    this.deleteType = 'nc';
    this.itemToDelete = n;
    this.showDeleteModal = true;
  }
  confirmDelete() {
    if (this.deleteType === 'controle' && this.itemToDelete) {
      this.controles = this.controles.filter(c => c.id !== this.itemToDelete.id);
      localStorage.setItem('controles_qualite', JSON.stringify(this.controles));
      this.filterControles();
      this.showSuccess('Contrôle supprimé !');
    } else if (this.deleteType === 'nc' && this.itemToDelete) {
      this.nonConformites = this.nonConformites.filter(n => n.id !== this.itemToDelete.id);
      localStorage.setItem('non_conformites', JSON.stringify(this.nonConformites));
      this.filterNC();
      this.showSuccess('NC supprimée !');
    }
    this.calculerIndicateurs();
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }
  cancelControleForm() {
    this.currentControle = {
      reference: 'CQ-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      type: 'entree',
      date_controle: new Date().toISOString().split('T')[0],
      produit_id: '',
      ordre_production_id: '',
      lot: '',
      echantillon: 1,
      criteres: [],
      resultat: 'en_attente',
      decision: 'en_attente',
      non_conformite: '',
      actions_correctives: '',
      responsable: '',
      laboratoire: '',
      document: '',
      notes: ''
    };
    this.showControleForm = false;
    this.editControleMode = false;
  }
  cancelNCForm() {
    this.currentNC = {
      reference: 'NC-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      date_detection: new Date().toISOString().split('T')[0],
      type: 'produit',
      produit_id: '',
      ordre_id: '',
      description: '',
      gravite: 'mineure',
      responsable: '',
      actions_correctives: [],
      statut: 'ouverte',
      notes: ''
    };
    this.showNCForm = false;
    this.editNCMode = false;
  }
  filterControles() {
    let filtered = this.controles;
    if (this.searchTermControle) {
      const term = this.searchTermControle.toLowerCase();
      filtered = filtered.filter(c => 
        c.reference?.toLowerCase().includes(term) ||
        c.produit_nom?.toLowerCase().includes(term) ||
        c.lot?.toLowerCase().includes(term)
      );
    }
    if (this.resultatFilter) {
      filtered = filtered.filter(c => c.resultat === this.resultatFilter);
    }
    if (this.typeControleFilter) {
      filtered = filtered.filter(c => c.type === this.typeControleFilter);
    }
    this.filteredControles = filtered;
  }
  filterNC() {
    let filtered = this.nonConformites;
    if (this.searchTermNC) {
      const term = this.searchTermNC.toLowerCase();
      filtered = filtered.filter(n => 
        n.reference?.toLowerCase().includes(term) ||
        n.description?.toLowerCase().includes(term) ||
        n.produit_nom?.toLowerCase().includes(term)
      );
    }
    if (this.graviteFilter) {
      filtered = filtered.filter(n => n.gravite === this.graviteFilter);
    }
    if (this.statutNCFilter) {
      filtered = filtered.filter(n => n.statut === this.statutNCFilter);
    }
    this.filteredNC = filtered;
  }
  calculerIndicateurs() {
    this.controlesConformes = this.controles.filter(c => c.resultat === 'conforme').length;
    this.tauxConformite = this.controles.length ? Math.round((this.controlesConformes / this.controles.length) * 100) : 0;
    this.ncCritique = this.nonConformites.filter(n => n.gravite === 'critique').length;
    this.ncMajeure = this.nonConformites.filter(n => n.gravite === 'majeure').length;
    this.ncMineure = this.nonConformites.filter(n => n.gravite === 'mineure').length;
    this.ncProduit = this.nonConformites.filter(n => n.type === 'produit').length;
    this.ncProcess = this.nonConformites.filter(n => n.type === 'process').length;
    this.ncMateriel = this.nonConformites.filter(n => n.type === 'materiel').length;
    this.ncDocument = this.nonConformites.filter(n => n.type === 'document').length;
    const ncCloses = this.nonConformites.filter(n => n.statut === 'fermee');
    if (ncCloses.length > 0) {
      const totalDelais = ncCloses.reduce((sum, n) => {
        if (n.date_cloture) {
          const debut = new Date(n.date_detection);
          const fin = new Date(n.date_cloture);
          return sum + Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24));
        }
        return sum;
      }, 0);
      this.delaiMoyen = Math.round(totalDelais / ncCloses.length);
    }
  }
  getResultatLabel(resultat: string): string {
    const labels: any = { conforme: 'Conforme', non_conforme: 'Non conforme', en_attente: 'En attente' };
    return labels[resultat] || resultat;
  }
  getDecisionLabel(decision: string): string {
    const labels: any = { accepte: 'Accepté', rejete: 'Rejeté', retouche: 'Retouche', en_attente: 'En attente' };
    return labels[decision] || decision;
  }
  getGraviteLabel(gravite: string): string {
    const labels: any = { mineure: 'Mineure', majeure: 'Majeure', critique: 'Critique' };
    return labels[gravite] || gravite;
  }
  getTypeNCLabel(type: string): string {
    const labels: any = { produit: 'Produit', process: 'Process', materiel: 'Matériel', document: 'Document' };
    return labels[type] || type;
  }
  getStatutNCLabel(statut: string): string {
    const labels: any = { ouverte: 'Ouverte', en_cours: 'En cours', fermee: 'Fermée', archivee: 'Archivée' };
    return labels[statut] || statut;
  }
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
