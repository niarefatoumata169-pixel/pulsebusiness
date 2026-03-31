import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ControleItem {
  nom: string;
  valeur_attendue: string;
  valeur_obtenue?: string;
  conforme: boolean;
  commentaire?: string;
}

interface ControleQualite {
  id?: number;
  reference: string;
  titre: string;
  type: 'reception' | 'production' | 'livraison' | 'periodique';
  categorie: 'matiere_premiere' | 'produit_fini' | 'emballage' | 'process';
  article_id?: number;
  article_nom?: string;
  lot?: string;
  date_prevue: string;
  date_realisee?: string;
  resultat: 'conforme' | 'non_conforme' | 'en_attente';
  note?: number;
  commentaire?: string;
  controles: ControleItem[];
  responsable_id?: number;
  responsable_nom?: string;
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
  created_at: string;
  updated_at?: string;
}

interface NonConformite {
  id?: number;
  reference: string;
  titre: string;
  description: string;
  type: 'mineure' | 'majeure' | 'critique';
  origine: 'interne' | 'client' | 'fournisseur' | 'organisme';
  article_id?: number;
  article_nom?: string;
  lot?: string;
  quantite?: number;
  date_detection: string;
  date_resolution?: string;
  action_corrective?: string;
  action_preventive?: string;
  responsable?: string;
  statut: 'ouvert' | 'en_cours' | 'resolu' | 'ferme';
  created_at: string;
}

@Component({
  selector: 'app-qualite',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="qualite-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>🔬 Gestion qualité</h1>
          <p class="subtitle">{{ controles.length }} contrôle(s) • {{ nonconformites.length }} non-conformité(s)</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="controles.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="controles.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openControleForm()">+ Nouveau contrôle</button>
          <button class="btn-secondary" (click)="openNonConformiteForm()">⚠️ Non-conformité</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="controles.length > 0 || nonconformites.length > 0">
        <div class="kpi-card conformite">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getTauxConformite() }}%</span>
            <span class="kpi-label">Taux de conformité</span>
            <span class="kpi-sub">{{ getControlesConformes() }}/{{ controles.length }} contrôles</span>
          </div>
        </div>
        <div class="kpi-card non-conformite">
          <div class="kpi-icon">⚠️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getNonConformesCount() }}</span>
            <span class="kpi-label">Non-conformités</span>
            <span class="kpi-sub">{{ getNCOuvertes() }} ouvertes</span>
          </div>
        </div>
        <div class="kpi-card controles">
          <div class="kpi-icon">🔬</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getControlesMois() }}</span>
            <span class="kpi-label">Contrôles ce mois</span>
            <span class="kpi-sub">+{{ getControlesMoisPrecedent() }} vs mois dernier</span>
          </div>
        </div>
        <div class="kpi-card delai">
          <div class="kpi-icon">⏱️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getDelaiMoyenResolution() }} j</span>
            <span class="kpi-label">Délai résolution</span>
            <span class="kpi-sub">moyen</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button [class.active]="activeTab === 'controles'" (click)="activeTab = 'controles'">🔬 Contrôles qualité</button>
        <button [class.active]="activeTab === 'nonconformites'" (click)="activeTab = 'nonconformites'">⚠️ Non-conformités</button>
        <button [class.active]="activeTab === 'indicateurs'" (click)="activeTab = 'indicateurs'">📊 Indicateurs</button>
      </div>

      <!-- Formulaire Contrôle -->
      <div class="modal-overlay" *ngIf="showControleForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editControleMode ? '✏️ Modifier' : '➕ Nouveau' }} contrôle qualité</h3>
            <button class="modal-close" (click)="closeControleForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveControle()">
              <div class="form-row">
                <div class="form-group">
                  <label>Référence</label>
                  <input type="text" [(ngModel)]="currentControle.reference" name="ref_controle" readonly class="readonly">
                </div>
                <div class="form-group">
                  <label>Titre *</label>
                  <input type="text" [(ngModel)]="currentControle.titre" name="titre" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Type *</label>
                  <select [(ngModel)]="currentControle.type" name="type" required>
                    <option value="reception">📥 Réception</option>
                    <option value="production">🏭 Production</option>
                    <option value="livraison">📤 Livraison</option>
                    <option value="periodique">🔄 Périodique</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Catégorie *</label>
                  <select [(ngModel)]="currentControle.categorie" name="categorie" required>
                    <option value="matiere_premiere">📦 Matière première</option>
                    <option value="produit_fini">✅ Produit fini</option>
                    <option value="emballage">📦 Emballage</option>
                    <option value="process">⚙️ Process</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Article</label>
                  <select [(ngModel)]="currentControle.article_id" name="article_id" (change)="onArticleChange()">
                    <option [value]="null">Sélectionner</option>
                    <option *ngFor="let a of articles" [value]="a.id">{{ a.nom }} ({{ a.reference }})</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Lot / N° série</label>
                  <input type="text" [(ngModel)]="currentControle.lot" name="lot">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Date prévue *</label>
                  <input type="datetime-local" [(ngModel)]="currentControle.date_prevue" name="date_prevue" required>
                </div>
                <div class="form-group">
                  <label>Statut</label>
                  <select [(ngModel)]="currentControle.statut" name="statut">
                    <option value="planifie">📅 Planifié</option>
                    <option value="en_cours">⚙️ En cours</option>
                    <option value="termine">✅ Terminé</option>
                    <option value="annule">❌ Annulé</option>
                  </select>
                </div>
              </div>
              
              <!-- Points de contrôle -->
              <div class="controles-section">
                <h4>📋 Points de contrôle</h4>
                <button type="button" class="btn-add-small" (click)="addControleItem()">+ Ajouter un point</button>
                <div *ngFor="let ctrl of currentControle.controles; let i = index" class="controle-item">
                  <div class="controle-header">
                    <strong>Point {{ i + 1 }}</strong>
                    <button type="button" class="btn-remove-small" (click)="removeControleItem(i)">✕</button>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Nom du contrôle *</label>
                      <input type="text" [(ngModel)]="ctrl.nom" [name]="'ctrl_nom_' + i" required>
                    </div>
                    <div class="form-group">
                      <label>Valeur attendue</label>
                      <input type="text" [(ngModel)]="ctrl.valeur_attendue" [name]="'ctrl_attendu_' + i">
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Valeur obtenue</label>
                      <input type="text" [(ngModel)]="ctrl.valeur_obtenue" [name]="'ctrl_obtenu_' + i">
                    </div>
                    <div class="form-group">
                      <label>
                        <input type="checkbox" [(ngModel)]="ctrl.conforme" [name]="'ctrl_conforme_' + i">
                        Conforme
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Responsable</label>
                  <select [(ngModel)]="currentControle.responsable_id" name="responsable_id">
                    <option [value]="null">Sélectionner</option>
                    <option *ngFor="let r of responsables" [value]="r.id">{{ r.nom }} {{ r.prenom }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Résultat</label>
                  <select [(ngModel)]="currentControle.resultat" name="resultat">
                    <option value="en_attente">⏳ En attente</option>
                    <option value="conforme">✅ Conforme</option>
                    <option value="non_conforme">❌ Non conforme</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Commentaire</label>
                <textarea [(ngModel)]="currentControle.commentaire" name="commentaire" rows="3"></textarea>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeControleForm()">Annuler</button>
                <button type="submit" class="btn-primary">💾 Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Formulaire Non-conformité -->
      <div class="modal-overlay" *ngIf="showNonConformiteForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editNonConformiteMode ? '✏️ Modifier' : '⚠️ Nouvelle' }} non-conformité</h3>
            <button class="modal-close" (click)="closeNonConformiteForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveNonConformite()">
              <div class="form-row">
                <div class="form-group">
                  <label>Référence</label>
                  <input type="text" [(ngModel)]="currentNonConformite.reference" name="ref_nc" readonly class="readonly">
                </div>
                <div class="form-group">
                  <label>Titre *</label>
                  <input type="text" [(ngModel)]="currentNonConformite.titre" name="titre_nc" required>
                </div>
              </div>
              <div class="form-group">
                <label>Description *</label>
                <textarea [(ngModel)]="currentNonConformite.description" name="description_nc" rows="3" required></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Type</label>
                  <select [(ngModel)]="currentNonConformite.type" name="type_nc">
                    <option value="mineure">🟡 Mineure</option>
                    <option value="majeure">🟠 Majeure</option>
                    <option value="critique">🔴 Critique</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Origine</label>
                  <select [(ngModel)]="currentNonConformite.origine" name="origine">
                    <option value="interne">🏭 Interne</option>
                    <option value="client">👤 Client</option>
                    <option value="fournisseur">🏢 Fournisseur</option>
                    <option value="organisme">📋 Organisme</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Article</label>
                  <select [(ngModel)]="currentNonConformite.article_id" name="article_id_nc" (change)="onNCArticleChange()">
                    <option [value]="null">Sélectionner</option>
                    <option *ngFor="let a of articles" [value]="a.id">{{ a.nom }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Lot</label>
                  <input type="text" [(ngModel)]="currentNonConformite.lot" name="lot_nc">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Quantité concernée</label>
                  <input type="number" [(ngModel)]="currentNonConformite.quantite" name="quantite_nc" min="0">
                </div>
                <div class="form-group">
                  <label>Date détection *</label>
                  <input type="datetime-local" [(ngModel)]="currentNonConformite.date_detection" name="date_detection" required>
                </div>
              </div>
              <div class="form-group">
                <label>Action corrective</label>
                <textarea [(ngModel)]="currentNonConformite.action_corrective" name="action_corrective" rows="2"></textarea>
              </div>
              <div class="form-group">
                <label>Action préventive</label>
                <textarea [(ngModel)]="currentNonConformite.action_preventive" name="action_preventive" rows="2"></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Responsable</label>
                  <input type="text" [(ngModel)]="currentNonConformite.responsable" name="responsable_nc">
                </div>
                <div class="form-group">
                  <label>Statut</label>
                  <select [(ngModel)]="currentNonConformite.statut" name="statut_nc">
                    <option value="ouvert">🔴 Ouvert</option>
                    <option value="en_cours">🟡 En cours</option>
                    <option value="resolu">🟢 Résolu</option>
                    <option value="ferme">⚪ Fermé</option>
                  </select>
                </div>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeNonConformiteForm()">Annuler</button>
                <button type="submit" class="btn-primary">💾 Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Liste des contrôles -->
      <div *ngIf="activeTab === 'controles'" class="controles-list">
        <div class="filters-bar" *ngIf="controles.length > 0">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input [(ngModel)]="searchTerm" (ngModelChange)="filterControles()" placeholder="Rechercher...">
          </div>
          <select [(ngModel)]="typeFilter" (ngModelChange)="filterControles()" class="filter-select">
            <option value="">Tous types</option>
            <option value="reception">Réception</option>
            <option value="production">Production</option>
            <option value="livraison">Livraison</option>
            <option value="periodique">Périodique</option>
          </select>
          <select [(ngModel)]="resultatFilter" (ngModelChange)="filterControles()" class="filter-select">
            <option value="">Tous résultats</option>
            <option value="conforme">Conforme</option>
            <option value="non_conforme">Non conforme</option>
            <option value="en_attente">En attente</option>
          </select>
        </div>
        <div class="controles-grid" *ngIf="filteredControles.length > 0; else emptyControles">
          <div class="controle-card" *ngFor="let c of filteredControles" [class.non-conforme]="c.resultat === 'non_conforme'">
            <div class="controle-header">
              <span class="controle-ref">{{ c.reference }}</span>
              <span class="controle-badge" [class]="c.resultat">{{ getResultatLabel(c.resultat) }}</span>
            </div>
            <h3 class="controle-titre">{{ c.titre }}</h3>
            <div class="controle-info">
              <p><span class="label">📅 Date:</span> {{ c.date_prevue | date:'dd/MM/yyyy' }}</p>
              <p><span class="label">📦 Type:</span> {{ getTypeLabel(c.type) }}</p>
              <p><span class="label">📊 Conformité:</span> {{ getConformiteRatio(c) }}%</p>
              <p><span class="label">✅ Résultat:</span> {{ getResultatLabel(c.resultat) }}</p>
            </div>
            <div class="controle-footer">
              <button class="btn-icon" (click)="viewControleDetails(c)">👁️</button>
              <button class="btn-icon" (click)="editControle(c)">✏️</button>
              <button class="btn-icon delete" (click)="confirmDeleteControle(c)">🗑️</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des non-conformités -->
      <div *ngIf="activeTab === 'nonconformites'" class="nonconformites-list">
        <div class="filters-bar" *ngIf="nonconformites.length > 0">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input [(ngModel)]="ncSearchTerm" (ngModelChange)="filterNonConformites()" placeholder="Rechercher...">
          </div>
          <select [(ngModel)]="ncTypeFilter" (ngModelChange)="filterNonConformites()" class="filter-select">
            <option value="">Tous types</option>
            <option value="mineure">Mineure</option>
            <option value="majeure">Majeure</option>
            <option value="critique">Critique</option>
          </select>
          <select [(ngModel)]="ncStatutFilter" (ngModelChange)="filterNonConformites()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="ouvert">Ouvert</option>
            <option value="en_cours">En cours</option>
            <option value="resolu">Résolu</option>
            <option value="ferme">Fermé</option>
          </select>
        </div>
        <div class="nonconformites-grid" *ngIf="filteredNonConformites.length > 0; else emptyNC">
          <div class="nc-card" *ngFor="let nc of filteredNonConformites" [class]="nc.type">
            <div class="nc-header">
              <span class="nc-ref">{{ nc.reference }}</span>
              <span class="nc-badge" [class]="nc.type">{{ getTypeNCLabel(nc.type) }}</span>
              <span class="nc-statut" [class]="nc.statut">{{ getStatutNCLabel(nc.statut) }}</span>
            </div>
            <h3 class="nc-titre">{{ nc.titre }}</h3>
            <p class="nc-description">{{ nc.description | slice:0:100 }}{{ nc.description.length > 100 ? '...' : '' }}</p>
            <div class="nc-info">
              <p><span class="label">📅 Détection:</span> {{ nc.date_detection | date:'dd/MM/yyyy' }}</p>
              <p><span class="label">📍 Origine:</span> {{ getOrigineLabel(nc.origine) }}</p>
              <p *ngIf="nc.article_nom"><span class="label">📦 Article:</span> {{ nc.article_nom }}</p>
            </div>
            <div class="nc-footer">
              <button class="btn-icon" (click)="viewNCDetails(nc)">👁️</button>
              <button class="btn-icon" (click)="editNonConformite(nc)">✏️</button>
              <button class="btn-icon delete" (click)="confirmDeleteNC(nc)">🗑️</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Indicateurs -->
      <div *ngIf="activeTab === 'indicateurs'" class="indicateurs-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <h3>Taux de conformité</h3>
              <p class="stat-value">{{ getTauxConformite() }}%</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⚠️</div>
            <div class="stat-info">
              <h3>Non-conformités ouvertes</h3>
              <p class="stat-value">{{ getNCOuvertes() }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <h3>Contrôles ce mois</h3>
              <p class="stat-value">{{ getControlesMois() }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-info">
              <h3>Délai moyen résolution</h3>
              <p class="stat-value">{{ getDelaiMoyenResolution() }} jours</p>
            </div>
          </div>
        </div>

        <div class="chart-section">
          <h3>📊 Répartition des non-conformités</h3>
          <div class="chart-bars">
            <div class="chart-bar">
              <span class="chart-label">Mineures</span>
              <div class="bar-container">
                <div class="bar" [style.width.%]="getNCPourcentage('mineure')" style="background: #F59E0B"></div>
              </div>
              <span class="chart-value">{{ getNCComptage('mineure') }}</span>
            </div>
            <div class="chart-bar">
              <span class="chart-label">Majeures</span>
              <div class="bar-container">
                <div class="bar" [style.width.%]="getNCPourcentage('majeure')" style="background: #EC4899"></div>
              </div>
              <span class="chart-value">{{ getNCComptage('majeure') }}</span>
            </div>
            <div class="chart-bar">
              <span class="chart-label">Critiques</span>
              <div class="bar-container">
                <div class="bar" [style.width.%]="getNCPourcentage('critique')" style="background: #EF4444"></div>
              </div>
              <span class="chart-value">{{ getNCComptage('critique') }}</span>
            </div>
          </div>
        </div>

        <div class="chart-section" *ngIf="controles.length > 0">
          <h3>📈 Évolution des contrôles</h3>
          <div class="chart-bars">
            <div class="chart-bar">
              <span class="chart-label">Conformes</span>
              <div class="bar-container">
                <div class="bar" [style.width.%]="getPourcentageControlesConformes()" style="background: #10B981"></div>
              </div>
              <span class="chart-value">{{ getControlesConformes() }}</span>
            </div>
            <div class="chart-bar">
              <span class="chart-label">Non conformes</span>
              <div class="bar-container">
                <div class="bar" [style.width.%]="getPourcentageControlesNonConformes()" style="background: #EF4444"></div>
              </div>
              <span class="chart-value">{{ getControlesNonConformes() }}</span>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyControles>
        <div class="empty-state">
          <div class="empty-icon">🔬</div>
          <h2>Aucun contrôle qualité</h2>
          <p>Créez votre premier contrôle qualité</p>
          <button class="btn-primary" (click)="openControleForm()">+ Nouveau contrôle</button>
        </div>
      </ng-template>

      <ng-template #emptyNC>
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h2>Aucune non-conformité</h2>
          <p>Enregistrez les non-conformités détectées</p>
          <button class="btn-primary" (click)="openNonConformiteForm()">+ Nouvelle non-conformité</button>
        </div>
      </ng-template>

      <!-- Modal Détails Contrôle -->
      <div class="modal-overlay" *ngIf="showControleDetailsModal">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ selectedControle?.reference }} - {{ selectedControle?.titre }}</h3>
            <button class="modal-close" (click)="showControleDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedControle">
            <div class="details-grid">
              <div class="detail-section">
                <h4>📋 Informations</h4>
                <p><strong>Type:</strong> {{ getTypeLabel(selectedControle.type) }}</p>
                <p><strong>Catégorie:</strong> {{ getCategorieLabel(selectedControle.categorie) }}</p>
                <p><strong>Résultat:</strong> {{ getResultatLabel(selectedControle.resultat) }}</p>
                <p><strong>Statut:</strong> {{ getControleStatutLabel(selectedControle.statut) }}</p>
              </div>
              <div class="detail-section">
                <h4>📅 Dates</h4>
                <p><strong>Prévue:</strong> {{ selectedControle.date_prevue | date:'dd/MM/yyyy HH:mm' }}</p>
                <p><strong>Réalisée:</strong> {{ selectedControle.date_realisee | date:'dd/MM/yyyy HH:mm' || '-' }}</p>
              </div>
              <div class="detail-section full-width">
                <h4>📋 Points de contrôle</h4>
                <table class="controle-table">
                  <thead>
                    <tr><th>Contrôle</th><th>Attendu</th><th>Obtenu</th><th>Conforme</th> '</thead>
                  <tbody>
                    <tr *ngFor="let ctrl of selectedControle.controles">
                      <td>{{ ctrl.nom }}</td>
                      <td>{{ ctrl.valeur_attendue }}</td>
                      <td>{{ ctrl.valeur_obtenue || '-' }}</td>
                      <td>{{ ctrl.conforme ? '✅' : '❌' }}</td>
                    </tr>
                    <tr *ngIf="selectedControle.controles.length === 0">
                      <td colspan="4" class="text-center">Aucun point de contrôle</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Détails Non-conformité -->
      <div class="modal-overlay" *ngIf="showNCDetailsModal">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ selectedNC?.reference }} - {{ selectedNC?.titre }}</h3>
            <button class="modal-close" (click)="showNCDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedNC">
            <div class="details-grid">
              <div class="detail-section">
                <h4>⚠️ Informations</h4>
                <p><strong>Type:</strong> {{ getTypeNCLabel(selectedNC.type) }}</p>
                <p><strong>Origine:</strong> {{ getOrigineLabel(selectedNC.origine) }}</p>
                <p><strong>Statut:</strong> {{ getStatutNCLabel(selectedNC.statut) }}</p>
              </div>
              <div class="detail-section">
                <h4>📅 Dates</h4>
                <p><strong>Détection:</strong> {{ selectedNC.date_detection | date:'dd/MM/yyyy HH:mm' }}</p>
                <p><strong>Résolution:</strong> {{ selectedNC.date_resolution | date:'dd/MM/yyyy HH:mm' || '-' }}</p>
              </div>
              <div class="detail-section full-width">
                <h4>📝 Description</h4>
                <p>{{ selectedNC.description }}</p>
              </div>
              <div class="detail-section full-width" *ngIf="selectedNC.action_corrective">
                <h4>🔧 Action corrective</h4>
                <p>{{ selectedNC.action_corrective }}</p>
              </div>
              <div class="detail-section full-width" *ngIf="selectedNC.action_preventive">
                <h4>🛡️ Action préventive</h4>
                <p>{{ selectedNC.action_preventive }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Suppression Contrôle -->
      <div class="modal-overlay" *ngIf="showDeleteControleModal">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>🗑️ Confirmer la suppression</h3>
            <button class="modal-close" (click)="showDeleteControleModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p>Supprimer le contrôle <strong>{{ controleToDelete?.titre }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteControleModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteControle()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Suppression Non-conformité -->
      <div class="modal-overlay" *ngIf="showDeleteNCModal">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>🗑️ Confirmer la suppression</h3>
            <button class="modal-close" (click)="showDeleteNCModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p>Supprimer la non-conformité <strong>{{ ncToDelete?.titre }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteNCModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteNonConformite()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .qualite-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-add:hover, .btn-primary:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
    .btn-excel { background: #10B981; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-pdf { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-secondary { background: white; border: 2px solid #FCE7F3; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .alert-success { background: #10B981; color: white; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
    .kpi-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.2s; }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .kpi-icon { font-size: 32px; width: 56px; height: 56px; background: #FDF2F8; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .kpi-content { flex: 1; }
    .kpi-value { display: block; font-size: 24px; font-weight: 700; }
    .kpi-value small { font-size: 12px; font-weight: 400; color: #6B7280; }
    .kpi-label { font-size: 13px; color: #6B7280; }
    .kpi-sub { font-size: 11px; color: #9CA3AF; margin-top: 4px; display: block; }
    .kpi-card.conformite .kpi-value { color: #10B981; }
    .kpi-card.non-conformite .kpi-value { color: #EF4444; }
    .kpi-card.controles .kpi-value { color: #3B82F6; }
    .kpi-card.delai .kpi-value { color: #F59E0B; }
    
    .tabs { display: flex; gap: 8px; border-bottom: 2px solid #FCE7F3; margin-bottom: 24px; flex-wrap: wrap; }
    .tabs button { background: none; border: none; padding: 10px 20px; cursor: pointer; color: #6B7280; font-size: 14px; font-weight: 500; border-radius: 8px; transition: all 0.2s; }
    .tabs button:hover { background: #FDF2F8; color: #EC4899; }
    .tabs button.active { color: #EC4899; border-bottom: 2px solid #EC4899; margin-bottom: -2px; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 700px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
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
    .controles-section { margin-top: 30px; padding-top: 20px; border-top: 1px solid #F3F4F6; }
    .controles-section h4 { margin-bottom: 15px; color: #EC4899; }
    .btn-add-small { background: #EC4899; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 12px; margin-top: 10px; }
    .btn-remove-small { background: none; border: none; color: #EF4444; cursor: pointer; font-size: 16px; }
    .controle-item { background: #FEF3F9; padding: 15px; border-radius: 12px; margin-bottom: 15px; }
    .controle-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-danger { background: #EF4444; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    
    .filters-bar { display: flex; gap: 15px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-box { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    
    .controles-grid, .nonconformites-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .controle-card, .nc-card { background: white; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .controle-card.non-conforme { border-left-color: #EF4444; }
    .nc-card.critique { border-left-color: #EF4444; }
    .nc-card.majeure { border-left-color: #EC4899; }
    .nc-card.mineure { border-left-color: #F59E0B; }
    .controle-card:hover, .nc-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .controle-ref, .nc-ref { font-size: 11px; color: #9CA3AF; font-family: monospace; }
    .controle-header, .nc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
    .controle-badge, .nc-badge, .nc-statut { font-size: 10px; padding: 3px 8px; border-radius: 4px; }
    .controle-badge.conforme { background: #DCFCE7; color: #16A34A; }
    .controle-badge.non_conforme { background: #FEE2E2; color: #EF4444; }
    .controle-badge.en_attente { background: #FEF3C7; color: #D97706; }
    .nc-badge.critique { background: #FEE2E2; color: #EF4444; }
    .nc-badge.majeure { background: #FFE4E6; color: #EC4899; }
    .nc-badge.mineure { background: #FEF3C7; color: #F59E0B; }
    .nc-statut.ouvert { background: #FEF3C7; color: #D97706; }
    .nc-statut.en_cours { background: #E0E7FF; color: #4F46E5; }
    .nc-statut.resolu, .nc-statut.ferme { background: #DCFCE7; color: #16A34A; }
    .controle-titre, .nc-titre { margin: 8px 0; font-size: 16px; font-weight: 600; }
    .nc-description { font-size: 13px; color: #6B7280; margin-bottom: 12px; }
    .controle-info p, .nc-info p { margin: 6px 0; font-size: 13px; color: #6B7280; }
    .label { font-weight: 500; margin-right: 5px; }
    .controle-footer, .nc-footer { margin-top: 15px; padding-top: 15px; border-top: 1px solid #FCE7F3; display: flex; justify-content: flex-end; gap: 8px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: all 0.2s; font-size: 14px; }
    .btn-icon:hover { background: #FEF3F9; border-color: #EC4899; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; border: 1px solid #FCE7F3; }
    .stat-icon { font-size: 32px; }
    .stat-info h3 { margin: 0 0 4px 0; font-size: 14px; color: #6B7280; }
    .stat-value { margin: 0; font-size: 24px; font-weight: 600; color: #EC4899; }
    
    .chart-section { background: white; border-radius: 16px; padding: 20px; margin-bottom: 20px; }
    .chart-section h3 { margin: 0 0 20px 0; font-size: 18px; }
    .chart-bars { display: flex; flex-direction: column; gap: 15px; }
    .chart-bar { display: flex; align-items: center; gap: 12px; }
    .chart-label { width: 100px; font-size: 14px; }
    .bar-container { flex: 1; height: 24px; background: #F3F4F6; border-radius: 12px; overflow: hidden; }
    .bar { height: 100%; border-radius: 12px; transition: width 0.3s; }
    .chart-value { width: 50px; text-align: right; font-weight: 600; }
    
    .controle-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .controle-table th, .controle-table td { padding: 8px; text-align: left; border-bottom: 1px solid #F3F4F6; }
    .controle-table th { background: #FDF2F8; font-weight: 600; }
    .text-center { text-align: center; color: #9CA3AF; padding: 20px; }
    
    .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .detail-section { margin-bottom: 16px; }
    .detail-section h4 { color: #EC4899; margin: 0 0 12px 0; font-size: 16px; }
    .detail-section p { margin: 8px 0; font-size: 14px; color: #4B5563; }
    .detail-section.full-width { grid-column: span 2; }
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; gap: 12px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .details-grid { grid-template-columns: 1fr; }
      .detail-section.full-width { grid-column: span 1; }
      .controles-grid, .nonconformites-grid { grid-template-columns: 1fr; }
      .filters-bar { flex-direction: column; }
    }
  `]
})
export class Qualite implements OnInit {
  controles: ControleQualite[] = [];
  filteredControles: ControleQualite[] = [];
  nonconformites: NonConformite[] = [];
  filteredNonConformites: NonConformite[] = [];
  
  articles: any[] = [];
  responsables: any[] = [];
  
  selectedControle: ControleQualite | null = null;
  selectedNC: NonConformite | null = null;
  
  currentControle: ControleQualite = {
    reference: '',
    titre: '',
    type: 'reception',
    categorie: 'matiere_premiere',
    resultat: 'en_attente',
    controles: [],
    statut: 'planifie',
    date_prevue: new Date().toISOString().slice(0, 16),
    created_at: new Date().toISOString()
  };
  
  currentNonConformite: NonConformite = {
    reference: '',
    titre: '',
    description: '',
    type: 'mineure',
    origine: 'interne',
    date_detection: new Date().toISOString().slice(0, 16),
    statut: 'ouvert',
    created_at: new Date().toISOString()
  };
  
  activeTab = 'controles';
  
  searchTerm = '';
  typeFilter = '';
  resultatFilter = '';
  
  ncSearchTerm = '';
  ncTypeFilter = '';
  ncStatutFilter = '';
  
  showControleForm = false;
  editControleMode = false;
  showNonConformiteForm = false;
  editNonConformiteMode = false;
  
  showControleDetailsModal = false;
  showNCDetailsModal = false;
  showDeleteControleModal = false;
  showDeleteNCModal = false;
  
  controleToDelete: ControleQualite | null = null;
  ncToDelete: NonConformite | null = null;
  
  successMessage = '';
  
  ngOnInit() {
    this.loadArticles();
    this.loadResponsables();
    this.loadControles();
    this.loadNonConformites();
  }
  
  loadArticles() {
    const saved = localStorage.getItem('articles');
    this.articles = saved ? JSON.parse(saved) : [];
  }
  
  loadResponsables() {
    const saved = localStorage.getItem('chauffeurs');
    this.responsables = saved ? JSON.parse(saved) : [];
  }
  
  loadControles() {
    const saved = localStorage.getItem('qualite_controles');
    this.controles = saved ? JSON.parse(saved) : [];
    this.filteredControles = [...this.controles];
  }
  
  loadNonConformites() {
    const saved = localStorage.getItem('qualite_nonconformites');
    this.nonconformites = saved ? JSON.parse(saved) : [];
    this.filteredNonConformites = [...this.nonconformites];
  }
  
  saveControles() {
    localStorage.setItem('qualite_controles', JSON.stringify(this.controles));
  }
  
  saveNonConformites() {
    localStorage.setItem('qualite_nonconformites', JSON.stringify(this.nonconformites));
  }
  
  generateControleRef(): string {
    const count = this.controles.length + 1;
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `CQ-${year}${month}-${String(count).padStart(4, '0')}`;
  }
  
  generateNCRef(): string {
    const count = this.nonconformites.length + 1;
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `NC-${year}${month}-${String(count).padStart(4, '0')}`;
  }
  
  openControleForm() {
    this.currentControle = {
      reference: this.generateControleRef(),
      titre: '',
      type: 'reception',
      categorie: 'matiere_premiere',
      resultat: 'en_attente',
      controles: [],
      statut: 'planifie',
      date_prevue: new Date().toISOString().slice(0, 16),
      created_at: new Date().toISOString()
    };
    this.editControleMode = false;
    this.showControleForm = true;
  }
  
  openNonConformiteForm() {
    this.currentNonConformite = {
      reference: this.generateNCRef(),
      titre: '',
      description: '',
      type: 'mineure',
      origine: 'interne',
      date_detection: new Date().toISOString().slice(0, 16),
      statut: 'ouvert',
      created_at: new Date().toISOString()
    };
    this.editNonConformiteMode = false;
    this.showNonConformiteForm = true;
  }
  
  closeControleForm() {
    this.showControleForm = false;
    this.editControleMode = false;
  }
  
  closeNonConformiteForm() {
    this.showNonConformiteForm = false;
    this.editNonConformiteMode = false;
  }
  
  onArticleChange() {
    const article = this.articles.find(a => a.id === this.currentControle.article_id);
    if (article) {
      this.currentControle.article_nom = article.nom;
    }
  }
  
  onNCArticleChange() {
    const article = this.articles.find(a => a.id === this.currentNonConformite.article_id);
    if (article) {
      this.currentNonConformite.article_nom = article.nom;
    }
  }
  
  addControleItem() {
    this.currentControle.controles.push({
      nom: '',
      valeur_attendue: '',
      conforme: true
    });
  }
  
  removeControleItem(index: number) {
    this.currentControle.controles.splice(index, 1);
  }
  
  saveControle() {
    if (this.editControleMode && this.currentControle.id) {
      const index = this.controles.findIndex(c => c.id === this.currentControle.id);
      if (index !== -1) {
        this.currentControle.updated_at = new Date().toISOString();
        this.controles[index] = { ...this.currentControle };
        this.showSuccess('Contrôle modifié');
      }
    } else {
      const newControle = { ...this.currentControle, id: Date.now() };
      this.controles.push(newControle);
      this.showSuccess('Contrôle ajouté');
    }
    this.saveControles();
    this.filterControles();
    this.closeControleForm();
  }
  
  saveNonConformite() {
    if (this.editNonConformiteMode && this.currentNonConformite.id) {
      const index = this.nonconformites.findIndex(n => n.id === this.currentNonConformite.id);
      if (index !== -1) {
        this.nonconformites[index] = { ...this.currentNonConformite };
        this.showSuccess('Non-conformité modifiée');
      }
    } else {
      const newNC = { ...this.currentNonConformite, id: Date.now() };
      this.nonconformites.push(newNC);
      this.showSuccess('Non-conformité ajoutée');
    }
    this.saveNonConformites();
    this.filterNonConformites();
    this.closeNonConformiteForm();
  }
  
  editControle(c: ControleQualite) {
    this.currentControle = { ...c };
    this.editControleMode = true;
    this.showControleForm = true;
  }
  
  editNonConformite(nc: NonConformite) {
    this.currentNonConformite = { ...nc };
    this.editNonConformiteMode = true;
    this.showNonConformiteForm = true;
  }
  
  viewControleDetails(c: ControleQualite) {
    this.selectedControle = c;
    this.showControleDetailsModal = true;
  }
  
  viewNCDetails(nc: NonConformite) {
    this.selectedNC = nc;
    this.showNCDetailsModal = true;
  }
  
  confirmDeleteControle(c: ControleQualite) {
    this.controleToDelete = c;
    this.showDeleteControleModal = true;
  }
  
  confirmDeleteNC(nc: NonConformite) {
    this.ncToDelete = nc;
    this.showDeleteNCModal = true;
  }
  
  deleteControle() {
    if (this.controleToDelete) {
      this.controles = this.controles.filter(c => c.id !== this.controleToDelete?.id);
      this.saveControles();
      this.filterControles();
      this.showDeleteControleModal = false;
      this.controleToDelete = null;
      this.showSuccess('Contrôle supprimé');
    }
  }
  
  deleteNonConformite() {
    if (this.ncToDelete) {
      this.nonconformites = this.nonconformites.filter(n => n.id !== this.ncToDelete?.id);
      this.saveNonConformites();
      this.filterNonConformites();
      this.showDeleteNCModal = false;
      this.ncToDelete = null;
      this.showSuccess('Non-conformité supprimée');
    }
  }
  
  filterControles() {
    let filtered = this.controles;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => c.titre?.toLowerCase().includes(term) || c.reference?.toLowerCase().includes(term));
    }
    if (this.typeFilter) filtered = filtered.filter(c => c.type === this.typeFilter);
    if (this.resultatFilter) filtered = filtered.filter(c => c.resultat === this.resultatFilter);
    this.filteredControles = filtered;
  }
  
  filterNonConformites() {
    let filtered = this.nonconformites;
    if (this.ncSearchTerm) {
      const term = this.ncSearchTerm.toLowerCase();
      filtered = filtered.filter(n => n.titre?.toLowerCase().includes(term) || n.reference?.toLowerCase().includes(term));
    }
    if (this.ncTypeFilter) filtered = filtered.filter(n => n.type === this.ncTypeFilter);
    if (this.ncStatutFilter) filtered = filtered.filter(n => n.statut === this.ncStatutFilter);
    this.filteredNonConformites = filtered;
  }
  
  getTypeLabel(type: string): string {
    const labels: any = { reception: 'Réception', production: 'Production', livraison: 'Livraison', periodique: 'Périodique' };
    return labels[type] || type;
  }
  
  getCategorieLabel(cat: string): string {
    const labels: any = { matiere_premiere: 'Matière première', produit_fini: 'Produit fini', emballage: 'Emballage', process: 'Process' };
    return labels[cat] || cat;
  }
  
  getResultatLabel(resultat: string): string {
    const labels: any = { conforme: '✅ Conforme', non_conforme: '❌ Non conforme', en_attente: '⏳ En attente' };
    return labels[resultat] || resultat;
  }
  
  getControleStatutLabel(statut: string): string {
    const labels: any = { planifie: '📅 Planifié', en_cours: '⚙️ En cours', termine: '✅ Terminé', annule: '❌ Annulé' };
    return labels[statut] || statut;
  }
  
  getTypeNCLabel(type: string): string {
    const labels: any = { mineure: '🟡 Mineure', majeure: '🟠 Majeure', critique: '🔴 Critique' };
    return labels[type] || type;
  }
  
  getOrigineLabel(origine: string): string {
    const labels: any = { interne: '🏭 Interne', client: '👤 Client', fournisseur: '🏢 Fournisseur', organisme: '📋 Organisme' };
    return labels[origine] || origine;
  }
  
  getStatutNCLabel(statut: string): string {
    const labels: any = { ouvert: '🔴 Ouvert', en_cours: '🟡 En cours', resolu: '🟢 Résolu', ferme: '⚪ Fermé' };
    return labels[statut] || statut;
  }
  
  getConformiteRatio(controle: ControleQualite): number {
    if (!controle.controles.length) return 0;
    const conformes = controle.controles.filter(c => c.conforme).length;
    return Math.round((conformes / controle.controles.length) * 100);
  }
  
  getControlesConformes(): number {
    return this.controles.filter(c => c.resultat === 'conforme').length;
  }
  
  getControlesNonConformes(): number {
    return this.controles.filter(c => c.resultat === 'non_conforme').length;
  }
  
  getPourcentageControlesConformes(): number {
    if (this.controles.length === 0) return 0;
    return (this.getControlesConformes() / this.controles.length) * 100;
  }
  
  getPourcentageControlesNonConformes(): number {
    if (this.controles.length === 0) return 0;
    return (this.getControlesNonConformes() / this.controles.length) * 100;
  }
  
  getNonConformesCount(): number {
    return this.nonconformites.filter(n => n.statut !== 'ferme' && n.statut !== 'resolu').length;
  }
  
  getTauxConformite(): number {
    if (!this.controles.length) return 0;
    const conformes = this.controles.filter(c => c.resultat === 'conforme').length;
    return Math.round((conformes / this.controles.length) * 100);
  }
  
  getNCOuvertes(): number {
    return this.nonconformites.filter(n => n.statut === 'ouvert' || n.statut === 'en_cours').length;
  }
  
  getControlesMois(): number {
    const now = new Date();
    const moisActuel = now.getMonth();
    const anneeActuelle = now.getFullYear();
    return this.controles.filter(c => {
      const date = new Date(c.date_prevue);
      return date.getMonth() === moisActuel && date.getFullYear() === anneeActuelle;
    }).length;
  }
  
  getControlesMoisPrecedent(): number {
    const now = new Date();
    const moisPrecedent = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const anneePrecedente = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return this.controles.filter(c => {
      const date = new Date(c.date_prevue);
      return date.getMonth() === moisPrecedent && date.getFullYear() === anneePrecedente;
    }).length;
  }
  
  getDelaiMoyenResolution(): number {
    const resolues = this.nonconformites.filter(n => n.date_resolution && n.statut === 'resolu');
    if (!resolues.length) return 0;
    const totalJours = resolues.reduce((sum, n) => {
      const detection = new Date(n.date_detection);
      const resolution = new Date(n.date_resolution!);
      const jours = Math.ceil((resolution.getTime() - detection.getTime()) / (1000 * 60 * 60 * 24));
      return sum + jours;
    }, 0);
    return Math.round(totalJours / resolues.length);
  }
  
  getNCComptage(type: string): number {
    return this.nonconformites.filter(n => n.type === type).length;
  }
  
  getNCPourcentage(type: string): number {
    if (!this.nonconformites.length) return 0;
    return (this.getNCComptage(type) / this.nonconformites.length) * 100;
  }
  
    exportToExcel() {
    if (!this.filteredControles || this.filteredControles.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredControles[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const lignes = this.filteredControles.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ""));
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
    if (!this.filteredControles || this.filteredControles.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredControles[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join("")}</tr>\n</thead>\n<tbody>${this.filteredControles.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : "-"}</td>`).join("")}</tr>`).join("")}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert("Veuillez autoriser les pop-ups pour exporter en PDF"); }
  }
  
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}