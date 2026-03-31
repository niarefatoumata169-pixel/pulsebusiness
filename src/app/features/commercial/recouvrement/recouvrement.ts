import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ActionRecouvrement {
  id?: number;
  date: string;
  type: 'appel' | 'email' | 'visite' | 'mise_demeure' | 'contentieux';
  contact: string;
  resultat: string;
  prochaine_action?: string;
  notes?: string;
}

interface Relance {
  id?: number;
  date: string;
  type: 'sms' | 'email' | 'appel' | 'courrier';
  contenu: string;
  statut: 'envoye' | 'recu' | 'ignore';
}

interface Echeancier {
  id?: number;
  date_echeance: string;
  montant: number;
  paye: boolean;
  date_paiement?: string;
}

interface Recouvrement {
  id?: number;
  reference: string;
  type: 'facture' | 'devis' | 'avoir' | 'acompte';
  document_id: number;
  document_reference: string;
  client_id: number;
  client_nom?: string;
  client_contact?: string;
  client_email?: string;
  montant_du: number;
  montant_recouvre: number;
  montant_restant: number;
  date_emission: string;
  date_echeance: string;
  date_recouvrement?: string;
  statut: 'en_attente' | 'partiel' | 'recouvre' | 'impaye' | 'contentieux';
  priorite: 'haute' | 'moyenne' | 'basse';
  responsable?: string;
  actions_recouvrement: ActionRecouvrement[];
  relances: Relance[];
  echeancier?: Echeancier[];
  notes?: string;
  created_at: string;
  updated_at?: string;
}

@Component({
  selector: 'app-recouvrements',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="recouvrements-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>💰 Recouvrements & Créances</h1>
          <p class="subtitle">{{ recouvrements.length }} créance(s) • {{ getMontantTotalDu() | number }} FCFA à recouvrer • {{ getTauxRecouvrementGlobal() }}% recouvré</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="recouvrements.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="recouvrements.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouveau recouvrement</button>
        </div>
      </div>

      <!-- Message de succès -->
      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="recouvrements.length > 0">
        <div class="kpi-card total">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getMontantTotalDu() | number }} <small>FCFA</small></span>
            <span class="kpi-label">Total à recouvrer</span>
          </div>
        </div>
        <div class="kpi-card recouvre">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getMontantRecouvre() | number }} <small>FCFA</small></span>
            <span class="kpi-label">Montant recouvré</span>
          </div>
        </div>
        <div class="kpi-card restant">
          <div class="kpi-icon">⏳</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getMontantRestant() | number }} <small>FCFA</small></span>
            <span class="kpi-label">Reste à recouvrer</span>
          </div>
        </div>
        <div class="kpi-card taux">
          <div class="kpi-icon">📊</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getTauxRecouvrementGlobal() }}%</span>
            <span class="kpi-label">Taux de recouvrement</span>
          </div>
        </div>
        <div class="kpi-card impayes">
          <div class="kpi-icon">⚠️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getImpayesCount() }}</span>
            <span class="kpi-label">Créances impayées</span>
          </div>
        </div>
        <div class="kpi-card echeance">
          <div class="kpi-icon">⏰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getEcheancesDepassees() }}</span>
            <span class="kpi-label">Échéances dépassées</span>
          </div>
        </div>
      </div>

      <!-- Formulaire moderne avec onglets -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouveau' }} recouvrement</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveRecouvrement()">
              <div class="tabs">
                <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">📋 Informations</button>
                <button type="button" [class.active]="activeTab === 'relances'" (click)="activeTab = 'relances'">📧 Relances</button>
                <button type="button" [class.active]="activeTab === 'actions'" (click)="activeTab = 'actions'">⚡ Actions</button>
                <button type="button" [class.active]="activeTab === 'echeancier'" (click)="activeTab = 'echeancier'">📅 Échéancier</button>
              </div>

              <!-- Onglet Informations -->
              <div *ngIf="activeTab === 'info'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>Référence *</label>
                    <input type="text" [(ngModel)]="currentRecouvrement.reference" readonly class="readonly">
                  </div>
                  <div class="form-group">
                    <label>Type de document</label>
                    <select [(ngModel)]="currentRecouvrement.type" (change)="onTypeChange()">
                      <option value="facture">📄 Facture</option>
                      <option value="devis">📑 Devis</option>
                      <option value="avoir">📝 Avoir</option>
                      <option value="acompte">💰 Acompte</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Document associé</label>
                    <select [(ngModel)]="currentRecouvrement.document_id" (change)="onDocumentChange()">
                      <option [value]="null">Sélectionner un document</option>
                      <option *ngFor="let doc of getDocumentsByType()" [value]="doc.id">
                        {{ doc.reference }} - {{ doc.client_nom }} ({{ doc.montant_ttc | number }} FCFA)
                      </option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Statut</label>
                    <select [(ngModel)]="currentRecouvrement.statut" class="statut-select" [class]="currentRecouvrement.statut">
                      <option value="en_attente">⏳ En attente</option>
                      <option value="partiel">🔄 Partiel</option>
                      <option value="recouvre">✅ Recouvré</option>
                      <option value="impaye">⚠️ Impayé</option>
                      <option value="contentieux">⚖️ Contentieux</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Priorité</label>
                    <select [(ngModel)]="currentRecouvrement.priorite" class="priorite-select" [class]="currentRecouvrement.priorite">
                      <option value="haute">🔴 Haute</option>
                      <option value="moyenne">🟡 Moyenne</option>
                      <option value="basse">🟢 Basse</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Responsable</label>
                    <input type="text" [(ngModel)]="currentRecouvrement.responsable" placeholder="Nom du responsable">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>📅 Date d'émission</label>
                    <input type="date" [(ngModel)]="currentRecouvrement.date_emission">
                  </div>
                  <div class="form-group">
                    <label>⚠️ Date d'échéance</label>
                    <input type="date" [(ngModel)]="currentRecouvrement.date_echeance" [class.overdue]="isOverdue(currentRecouvrement.date_echeance)">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>💰 Montant dû</label>
                    <input type="number" [(ngModel)]="currentRecouvrement.montant_du" (input)="calculerRestant()" step="10000" class="montant-input">
                  </div>
                  <div class="form-group">
                    <label>✅ Montant recouvré</label>
                    <input type="number" [(ngModel)]="currentRecouvrement.montant_recouvre" (input)="calculerRestant()" step="10000">
                  </div>
                </div>
                <div class="form-group highlight">
                  <label>💰 Reste à recouvrer</label>
                  <input type="text" [value]="(currentRecouvrement.montant_restant || 0) | number" readonly class="readonly highlight-input">
                </div>
                <div class="form-group">
                  <label>📝 Notes</label>
                  <textarea [(ngModel)]="currentRecouvrement.notes" rows="2" placeholder="Informations complémentaires..."></textarea>
                </div>
              </div>

              <!-- Onglet Relances -->
              <div *ngIf="activeTab === 'relances'" class="tab-content">
                <div class="relances-header">
                  <h4>📧 Historique des relances</h4>
                  <button type="button" class="btn-add-relance" (click)="addRelance()">+ Ajouter relance</button>
                </div>
                <div class="relances-list" *ngIf="currentRecouvrement.relances && currentRecouvrement.relances.length > 0; else noRelances">
                  <div class="relance-item" *ngFor="let r of currentRecouvrement.relances; let i = index">
                    <div class="relance-icon">{{ getRelanceIcon(r.type) }}</div>
                    <div class="relance-info">
                      <div class="relance-date">{{ r.date | date:'dd/MM/yyyy HH:mm' }}</div>
                      <div class="relance-type">{{ getRelanceTypeLabel(r.type) }}</div>
                      <div class="relance-contenu">{{ r.contenu }}</div>
                      <div class="relance-statut" [class]="r.statut">📬 {{ getRelanceStatutLabel(r.statut) }}</div>
                    </div>
                    <div class="relance-actions">
                      <button type="button" class="relance-action" (click)="removeRelance(i)" title="Supprimer">🗑️</button>
                    </div>
                  </div>
                </div>
                <ng-template #noRelances>
                  <div class="no-relances">
                    <p>Aucune relance effectuée</p>
                    <button type="button" class="btn-add-relance" (click)="addRelance()">+ Ajouter une relance</button>
                  </div>
                </ng-template>

                <div class="relance-template" *ngIf="showRelanceTemplate">
                  <div class="template-header">
                    <h4>📝 Nouvelle relance</h4>
                    <button type="button" class="close-template" (click)="showRelanceTemplate = false">✕</button>
                  </div>
                  <div class="form-group">
                    <label>Type de relance</label>
                    <select [(ngModel)]="newRelance.type">
                      <option value="sms">📱 SMS</option>
                      <option value="email">✉️ Email</option>
                      <option value="appel">📞 Appel</option>
                      <option value="courrier">📮 Courrier</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Contenu</label>
                    <textarea [(ngModel)]="newRelance.contenu" rows="3" placeholder="Message de relance..."></textarea>
                  </div>
                  <div class="form-actions">
                    <button type="button" class="btn-secondary" (click)="showRelanceTemplate = false">Annuler</button>
                    <button type="button" class="btn-primary" (click)="saveRelance()">💾 Envoyer</button>
                  </div>
                </div>
              </div>

              <!-- Onglet Actions -->
              <div *ngIf="activeTab === 'actions'" class="tab-content">
                <div class="actions-header">
                  <h4>⚡ Actions de recouvrement</h4>
                  <button type="button" class="btn-add-action" (click)="addAction()">+ Ajouter action</button>
                </div>
                <div class="actions-list" *ngIf="currentRecouvrement.actions_recouvrement && currentRecouvrement.actions_recouvrement.length > 0; else noActions">
                  <div class="action-item" *ngFor="let a of currentRecouvrement.actions_recouvrement; let i = index">
                    <div class="action-icon">{{ getActionIcon(a.type) }}</div>
                    <div class="action-info">
                      <div class="action-date">{{ a.date | date:'dd/MM/yyyy HH:mm' }}</div>
                      <div class="action-type">{{ getActionTypeLabel(a.type) }}</div>
                      <div class="action-contact">Contact: {{ a.contact }}</div>
                      <div class="action-resultat">Résultat: {{ a.resultat }}</div>
                      <div class="action-prochaine" *ngIf="a.prochaine_action">📅 Prochaine: {{ a.prochaine_action | date:'dd/MM/yyyy' }}</div>
                      <div class="action-notes" *ngIf="a.notes">📝 {{ a.notes }}</div>
                    </div>
                    <div class="action-actions">
                      <button type="button" class="action-btn" (click)="removeAction(i)" title="Supprimer">🗑️</button>
                    </div>
                  </div>
                </div>
                <ng-template #noActions>
                  <div class="no-actions">
                    <p>Aucune action enregistrée</p>
                    <button type="button" class="btn-add-action" (click)="addAction()">+ Ajouter une action</button>
                  </div>
                </ng-template>

                <div class="action-template" *ngIf="showActionTemplate">
                  <div class="template-header">
                    <h4>📝 Nouvelle action</h4>
                    <button type="button" class="close-template" (click)="showActionTemplate = false">✕</button>
                  </div>
                  <div class="form-group">
                    <label>Type d'action</label>
                    <select [(ngModel)]="newAction.type">
                      <option value="appel">📞 Appel téléphonique</option>
                      <option value="email">✉️ Email</option>
                      <option value="visite">🚶 Visite terrain</option>
                      <option value="mise_demeure">⚖️ Mise en demeure</option>
                      <option value="contentieux">🏛️ Contentieux</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Contact</label>
                    <input type="text" [(ngModel)]="newAction.contact" placeholder="Nom du contact">
                  </div>
                  <div class="form-group">
                    <label>Résultat</label>
                    <input type="text" [(ngModel)]="newAction.resultat" placeholder="Résultat de l'action">
                  </div>
                  <div class="form-group">
                    <label>Prochaine action (optionnel)</label>
                    <input type="date" [(ngModel)]="newAction.prochaine_action">
                  </div>
                  <div class="form-group">
                    <label>Notes</label>
                    <textarea [(ngModel)]="newAction.notes" rows="2"></textarea>
                  </div>
                  <div class="form-actions">
                    <button type="button" class="btn-secondary" (click)="showActionTemplate = false">Annuler</button>
                    <button type="button" class="btn-primary" (click)="saveAction()">💾 Enregistrer</button>
                  </div>
                </div>
              </div>

              <!-- Onglet Échéancier -->
              <div *ngIf="activeTab === 'echeancier'" class="tab-content">
                <div class="echeancier-header">
                  <h4>📅 Échéancier de paiement</h4>
                  <button type="button" class="btn-add-echeance" (click)="addEcheance()">+ Ajouter échéance</button>
                </div>
                <div class="echeancier-list" *ngIf="currentRecouvrement.echeancier && currentRecouvrement.echeancier.length > 0; else noEcheances">
                  <div class="echeance-item" *ngFor="let e of currentRecouvrement.echeancier; let i = index">
                    <div class="echeance-info">
                      <div class="echeance-date">📅 {{ e.date_echeance | date:'dd/MM/yyyy' }}</div>
                      <div class="echeance-montant">💰 {{ e.montant | number }} FCFA</div>
                      <div class="echeance-statut" [class]="e.paye ? 'paye' : 'impaye'">
                        {{ e.paye ? '✅ Payé le ' + (e.date_paiement | date:'dd/MM/yyyy') : '⏳ En attente' }}
                      </div>
                    </div>
                    <div class="echeance-actions">
                      <button type="button" class="echeance-btn" (click)="marquerPayee(i)" *ngIf="!e.paye" title="Marquer payée">✅</button>
                      <button type="button" class="echeance-btn" (click)="removeEcheance(i)" title="Supprimer">🗑️</button>
                    </div>
                  </div>
                </div>
                <ng-template #noEcheances>
                  <div class="no-echeances">
                    <p>Aucun échéancier défini</p>
                    <button type="button" class="btn-add-echeance" (click)="addEcheance()">+ Définir un échéancier</button>
                  </div>
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
      <div class="filters-section" *ngIf="recouvrements.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterRecouvrements()" placeholder="Rechercher par référence, client..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterRecouvrements()" class="filter-select">
            <option value="">📊 Tous statuts</option>
            <option value="en_attente">⏳ En attente</option>
            <option value="partiel">🔄 Partiel</option>
            <option value="recouvre">✅ Recouvré</option>
            <option value="impaye">⚠️ Impayé</option>
            <option value="contentieux">⚖️ Contentieux</option>
          </select>
          <select [(ngModel)]="prioriteFilter" (ngModelChange)="filterRecouvrements()" class="filter-select">
            <option value="">🎯 Toutes priorités</option>
            <option value="haute">🔴 Haute</option>
            <option value="moyenne">🟡 Moyenne</option>
            <option value="basse">🟢 Basse</option>
          </select>
          <select [(ngModel)]="typeFilter" (ngModelChange)="filterRecouvrements()" class="filter-select">
            <option value="">📋 Tous types</option>
            <option value="facture">Facture</option>
            <option value="devis">Devis</option>
            <option value="avoir">Avoir</option>
            <option value="acompte">Acompte</option>
          </select>
        </div>
      </div>

      <!-- Liste des recouvrements améliorée -->
      <div class="recouvrements-section" *ngIf="recouvrements.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Liste des créances</h2>
          <div class="header-stats">
            <span class="stat-badge total">{{ filteredRecouvrements.length }} / {{ recouvrements.length }} affiché(s)</span>
            <span class="stat-badge montant">{{ getMontantFiltre() | number }} FCFA</span>
          </div>
        </div>
        
        <div class="recouvrements-grid">
          <div class="recouvrement-card" *ngFor="let r of filteredRecouvrements" [class]="r.statut + ' ' + r.priorite">
            <div class="card-header">
              <div class="header-left">
                <div class="recouvrement-icon">💰</div>
                <div class="recouvrement-info">
                  <div class="recouvrement-ref">{{ r.reference }}</div>
                  <div class="recouvrement-doc">{{ r.document_reference }}</div>
                  <div class="recouvrement-client">{{ r.client_nom || 'Client non spécifié' }}</div>
                </div>
              </div>
              <div class="header-right">
                <div class="recouvrement-montant">{{ r.montant_restant | number }} FCFA</div>
                <span class="priorite-badge" [class]="r.priorite">{{ getPrioriteLabel(r.priorite) }}</span>
                <span class="statut-badge" [class]="r.statut">{{ getStatutLabel(r.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">📅 Échéance:</span>
                <span class="info-value" [class.overdue]="isOverdue(r.date_echeance)">{{ r.date_echeance | date:'dd/MM/yyyy' }}</span>
                <span *ngIf="isOverdue(r.date_echeance) && r.statut !== 'recouvre'" class="overdue-badge">⏰ En retard</span>
              </div>
              <div class="info-row">
                <span class="info-label">💰 Montant dû:</span>
                <span class="info-value">{{ r.montant_du | number }} FCFA</span>
              </div>
              <div class="info-row">
                <span class="info-label">✅ Recouvré:</span>
                <span class="info-value">{{ r.montant_recouvre | number }} FCFA ({{ getPourcentageRecouvre(r) }}%)</span>
              </div>
              <div class="progress-bar" *ngIf="r.montant_du > 0">
                <div class="progress-fill" [style.width.%]="getPourcentageRecouvre(r)"></div>
                <span class="progress-text">{{ getPourcentageRecouvre(r) }}% recouvré</span>
              </div>
              <div class="relance-info" *ngIf="r.relances && r.relances.length > 0">
                <span class="info-label">📧 Dernière relance:</span>
                <span class="info-value">{{ getDerniereRelance(r) | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="viewDetails(r)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="editRecouvrement(r)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="enregistrerPaiement(r)" title="Enregistrer paiement">💵</button>
                <button class="action-icon" (click)="envoyerRelance(r)" title="Envoyer relance">📧</button>
                <button class="action-icon delete" (click)="confirmDelete(r)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">💰</div>
          <h2>Aucune créance</h2>
          <p>Ajoutez une nouvelle créance à recouvrer</p>
          <button class="btn-primary" (click)="openForm()">+ Nouveau recouvrement</button>
        </div>
      </ng-template>

      <!-- Modal Détails -->
      <div class="modal-overlay" *ngIf="showDetailsModal && selectedRecouvrement">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>Détails du recouvrement - {{ selectedRecouvrement.reference }}</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedRecouvrement">
            <div class="details-grid">
              <div class="detail-section">
                <h4>📋 Informations générales</h4>
                <p><strong>Référence:</strong> {{ selectedRecouvrement.reference }}</p>
                <p><strong>Document:</strong> {{ selectedRecouvrement.document_reference }}</p>
                <p><strong>Type:</strong> {{ getTypeLabel(selectedRecouvrement.type) }}</p>
                <p><strong>Statut:</strong> {{ getStatutLabel(selectedRecouvrement.statut) }}</p>
                <p><strong>Priorité:</strong> {{ getPrioriteLabel(selectedRecouvrement.priorite) }}</p>
                <p><strong>Responsable:</strong> {{ selectedRecouvrement.responsable || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>👤 Client</h4>
                <p><strong>Nom:</strong> {{ selectedRecouvrement.client_nom || '-' }}</p>
                <p><strong>Contact:</strong> {{ selectedRecouvrement.client_contact || '-' }}</p>
                <p><strong>Email:</strong> {{ selectedRecouvrement.client_email || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>💰 Montants</h4>
                <p><strong>Montant dû:</strong> {{ selectedRecouvrement.montant_du | number }} FCFA</p>
                <p><strong>Montant recouvré:</strong> {{ selectedRecouvrement.montant_recouvre | number }} FCFA</p>
                <p><strong>Reste à recouvrer:</strong> <strong class="highlight">{{ selectedRecouvrement.montant_restant | number }} FCFA</strong></p>
              </div>
              <div class="detail-section">
                <h4>📅 Dates</h4>
                <p><strong>Émission:</strong> {{ selectedRecouvrement.date_emission | date:'dd/MM/yyyy' }}</p>
                <p><strong>Échéance:</strong> {{ selectedRecouvrement.date_echeance | date:'dd/MM/yyyy' }}</p>
                <p><strong>Recouvrement:</strong> {{ selectedRecouvrement.date_recouvrement | date:'dd/MM/yyyy' || '-' }}</p>
              </div>
              <div class="detail-section full-width" *ngIf="selectedRecouvrement.actions_recouvrement && selectedRecouvrement.actions_recouvrement.length">
                <h4>⚡ Actions effectuées</h4>
                <div class="actions-timeline">
                  <div class="timeline-item" *ngFor="let a of selectedRecouvrement.actions_recouvrement">
                    <div class="timeline-date">{{ a.date | date:'dd/MM/yyyy' }}</div>
                    <div class="timeline-content">
                      <strong>{{ getActionTypeLabel(a.type) }}</strong> - {{ a.resultat }}
                      <div *ngIf="a.notes" class="timeline-notes">{{ a.notes }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="detail-section full-width" *ngIf="selectedRecouvrement.relances && selectedRecouvrement.relances.length">
                <h4>📧 Historique des relances</h4>
                <div class="relances-timeline">
                  <div class="timeline-item" *ngFor="let r of selectedRecouvrement.relances">
                    <div class="timeline-date">{{ r.date | date:'dd/MM/yyyy' }}</div>
                    <div class="timeline-content">
                      <strong>{{ getRelanceTypeLabel(r.type) }}</strong> - {{ r.contenu }}
                      <div class="timeline-statut">Statut: {{ getRelanceStatutLabel(r.statut) }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="detail-section full-width" *ngIf="selectedRecouvrement.echeancier && selectedRecouvrement.echeancier.length">
                <h4>📅 Échéancier</h4>
                <table class="details-table">
                  <thead>
                    <tr><th>Date échéance</th><th>Montant</th><th>Statut</th><th>Date paiement</th></tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let e of selectedRecouvrement.echeancier">
                      <td>{{ e.date_echeance | date:'dd/MM/yyyy' }}</td>
                      <td>{{ e.montant | number }} FCFA</td>
                      <td [class]="e.paye ? 'paye' : 'impaye'">{{ e.paye ? '✅ Payé' : '⏳ En attente' }}</td>
                      <td>{{ e.date_paiement | date:'dd/MM/yyyy' || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="detail-section full-width" *ngIf="selectedRecouvrement.notes">
                <h4>📝 Notes</h4>
                <p>{{ selectedRecouvrement.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Paiement -->
      <div class="modal-overlay" *ngIf="showPaymentModal && paymentRecouvrement">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>💵 Enregistrer un paiement</h3>
            <button class="modal-close" (click)="showPaymentModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="paymentRecouvrement">
            <div class="payment-info">
              <p><strong>Référence:</strong> {{ paymentRecouvrement.reference }}</p>
              <p><strong>Client:</strong> {{ paymentRecouvrement.client_nom }}</p>
              <p><strong>Reste à payer:</strong> <strong class="highlight">{{ paymentRecouvrement.montant_restant | number }} FCFA</strong></p>
            </div>
            <div class="form-group">
              <label>Montant à encaisser *</label>
              <input type="number" [(ngModel)]="paymentAmount" step="1000" [max]="paymentRecouvrement.montant_restant" class="montant-input">
            </div>
            <div class="form-group">
              <label>Date de paiement</label>
              <input type="date" [(ngModel)]="paymentDate">
            </div>
            <div class="form-group">
              <label>Mode de paiement</label>
              <select [(ngModel)]="paymentMode">
                <option value="especes">💵 Espèces</option>
                <option value="carte">💳 Carte</option>
                <option value="cheque">📝 Chèque</option>
                <option value="virement">🏦 Virement</option>
                <option value="mobile_money">📱 Mobile Money</option>
              </select>
            </div>
            <div class="form-group">
              <label>Référence paiement</label>
              <input type="text" [(ngModel)]="paymentReference" placeholder="Numéro chèque, transaction...">
            </div>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showPaymentModal = false">Annuler</button>
              <button class="btn-primary" (click)="savePayment()">💾 Enregistrer paiement</button>
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
            <p>Supprimer la créance <strong>{{ recouvrementToDelete?.reference }}</strong> ?</p>
            <p class="warning-text">Cette action est irréversible et supprimera tout l'historique.</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteRecouvrement()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .recouvrements-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
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
    .kpi-card.recouvre .kpi-value { color: #10B981; }
    .kpi-card.restant .kpi-value { color: #F59E0B; }
    .kpi-card.taux .kpi-value { color: #3B82F6; }
    .kpi-card.impayes .kpi-value { color: #EF4444; }
    .kpi-card.echeance .kpi-value { color: #8B5CF6; }
    
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
    .highlight-input { background: #FEF3F9; color: #EC4899; font-weight: 600; font-size: 18px; text-align: right; }
    .montant-input { text-align: right; font-weight: 500; }
    .overdue { border-color: #EF4444 !important; background: #FEF2F2; }
    
    .relances-header, .actions-header, .echeancier-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
    .btn-add-relance, .btn-add-action, .btn-add-echeance { background: #FEF3F9; border: 1px solid #FCE7F3; padding: 8px 16px; border-radius: 8px; color: #EC4899; cursor: pointer; font-weight: 500; }
    .relances-list, .actions-list { border: 1px solid #F3F4F6; border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
    .relance-item, .action-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px; border-bottom: 1px solid #F3F4F6; }
    .relance-item:last-child, .action-item:last-child { border-bottom: none; }
    .relance-icon, .action-icon { font-size: 24px; }
    .relance-info, .action-info { flex: 1; }
    .relance-date, .action-date { font-size: 11px; color: #9CA3AF; margin-bottom: 4px; }
    .relance-type, .action-type { font-weight: 600; margin-bottom: 4px; }
    .relance-contenu { font-size: 13px; color: #4B5563; margin-bottom: 4px; }
    .relance-statut { font-size: 11px; display: inline-block; padding: 2px 6px; border-radius: 12px; margin-top: 4px; }
    .relance-statut.envoye { background: #DBEAFE; color: #1E40AF; }
    .relance-statut.recu { background: #DCFCE7; color: #16A34A; }
    .relance-statut.ignore { background: #FEE2E2; color: #EF4444; }
    .action-contact, .action-resultat { font-size: 12px; color: #6B7280; margin-bottom: 2px; }
    .action-prochaine { font-size: 11px; color: #F59E0B; margin-top: 4px; }
    .action-notes { font-size: 11px; color: #6B7280; font-style: italic; margin-top: 4px; }
    .relance-actions, .action-actions { display: flex; gap: 8px; }
    .relance-action, .action-btn { background: none; border: none; cursor: pointer; font-size: 16px; opacity: 0.6; padding: 4px; }
    .relance-action:hover, .action-btn:hover { opacity: 1; }
    .no-relances, .no-actions, .no-echeances { text-align: center; padding: 40px; background: #F9FAFB; border-radius: 12px; margin-bottom: 20px; }
    
    .relance-template, .action-template { background: #F9FAFB; border-radius: 12px; padding: 20px; margin-top: 20px; }
    .template-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .close-template { background: none; border: none; font-size: 20px; cursor: pointer; color: #9CA3AF; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
    
    .echeancier-list { border: 1px solid #F3F4F6; border-radius: 12px; overflow: hidden; }
    .echeance-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #F3F4F6; }
    .echeance-item:last-child { border-bottom: none; }
    .echeance-info { flex: 1; }
    .echeance-date { font-weight: 500; margin-bottom: 4px; }
    .echeance-montant { color: #EC4899; font-weight: 600; margin-bottom: 4px; }
    .echeance-statut { font-size: 12px; }
    .echeance-statut.paye { color: #10B981; }
    .echeance-statut.impaye { color: #F59E0B; }
    .echeance-actions { display: flex; gap: 8px; }
    .echeance-btn { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; transition: all 0.2s; }
    .echeance-btn:hover { background: #FEF3F9; }
    
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 3; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    
    .recouvrements-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .stat-badge.total { background: #FEF3F9; color: #EC4899; }
    .stat-badge.montant { background: #DCFCE7; color: #16A34A; }
    
    .recouvrements-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 20px; }
    .recouvrement-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .recouvrement-card.en_attente { border-left-color: #F59E0B; }
    .recouvrement-card.partiel { border-left-color: #3B82F6; }
    .recouvrement-card.recouvre { border-left-color: #10B981; opacity: 0.8; }
    .recouvrement-card.impaye { border-left-color: #EF4444; }
    .recouvrement-card.contentieux { border-left-color: #8B5CF6; }
    .recouvrement-card.haute { background: #FEF2F2; }
    .recouvrement-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: flex-start; flex: 1; }
    .recouvrement-icon { font-size: 28px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .recouvrement-ref { font-weight: 600; color: #1F2937; font-family: monospace; margin-bottom: 4px; }
    .recouvrement-doc { font-size: 11px; color: #9CA3AF; margin-bottom: 4px; }
    .recouvrement-client { font-size: 12px; color: #6B7280; }
    .header-right { text-align: right; }
    .recouvrement-montant { font-weight: 700; color: #EC4899; margin-bottom: 8px; }
    .priorite-badge { font-size: 10px; padding: 2px 6px; border-radius: 12px; display: inline-block; margin-right: 6px; }
    .priorite-badge.haute { background: #FEE2E2; color: #EF4444; }
    .priorite-badge.moyenne { background: #FEF3C7; color: #F59E0B; }
    .priorite-badge.basse { background: #DCFCE7; color: #16A34A; }
    .statut-badge { font-size: 10px; padding: 2px 6px; border-radius: 12px; display: inline-block; }
    .statut-badge.en_attente { background: #FEF3C7; color: #D97706; }
    .statut-badge.partiel { background: #DBEAFE; color: #1E40AF; }
    .statut-badge.recouvre { background: #DCFCE7; color: #16A34A; }
    .statut-badge.impaye { background: #FEE2E2; color: #EF4444; }
    .statut-badge.contentieux { background: #EDE9FE; color: #7C3AED; }
    .card-body { margin: 16px 0; }
    .info-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; font-size: 13px; flex-wrap: wrap; }
    .info-label { color: #6B7280; min-width: 100px; }
    .info-value { font-weight: 500; color: #1F2937; }
    .info-value.overdue { color: #EF4444; }
    .overdue-badge { background: #FEE2E2; color: #EF4444; padding: 2px 8px; border-radius: 12px; font-size: 10px; }
    .progress-bar { background: #F3F4F6; border-radius: 20px; height: 6px; margin-top: 12px; position: relative; }
    .progress-fill { background: #10B981; border-radius: 20px; height: 6px; }
    .progress-text { font-size: 10px; color: #6B7280; position: absolute; right: 0; top: -16px; }
    .relance-info { margin-top: 8px; font-size: 11px; color: #6B7280; }
    .card-footer { display: flex; justify-content: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid #F3F4F6; }
    .footer-actions { display: flex; gap: 8px; flex-wrap: wrap; }
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
    .actions-timeline, .relances-timeline { margin-top: 8px; }
    .timeline-item { display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid #F3F4F6; }
    .timeline-item:last-child { border-bottom: none; }
    .timeline-date { min-width: 100px; font-weight: 500; color: #6B7280; }
    .timeline-content { flex: 1; }
    .timeline-notes { font-size: 12px; color: #6B7280; margin-top: 4px; }
    .timeline-statut { font-size: 11px; margin-top: 4px; }
    .details-table { width: 100%; border-collapse: collapse; }
    .details-table th, .details-table td { padding: 8px; text-align: left; border-bottom: 1px solid #F3F4F6; }
    .details-table th { background: #F9FAFB; font-weight: 600; color: #6B7280; }
    .details-table td.paye { color: #10B981; }
    .details-table td.impaye { color: #F59E0B; }
    .highlight { color: #EC4899; font-size: 18px; }
    .warning-text { color: #EF4444; font-size: 12px; margin-top: 8px; }
    
    .payment-info { background: #FEF3F9; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
    .payment-info p { margin: 8px 0; }
    
    @media (max-width: 1200px) { .kpi-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; gap: 12px; } .kpi-grid { grid-template-columns: repeat(2, 1fr); } .recouvrements-grid { grid-template-columns: 1fr; } .filter-group { flex-direction: column; } .details-grid { grid-template-columns: 1fr; } .detail-section.full-width { grid-column: span 1; } }
  `]
})
export class Recouvrements implements OnInit {
  recouvrements: Recouvrement[] = [];
  filteredRecouvrements: Recouvrement[] = [];
  clients: any[] = [];
  factures: any[] = [];
  devis: any[] = [];
  
  searchTerm = '';
  statutFilter = '';
  prioriteFilter = '';
  typeFilter = '';
  activeTab = 'info';
  showForm = false;
  showDetailsModal = false;
  showDeleteModal = false;
  showPaymentModal = false;
  showRelanceTemplate = false;
  showActionTemplate = false;
  editMode = false;
  recouvrementToDelete: Recouvrement | null = null;
  selectedRecouvrement: Recouvrement | null = null;
  paymentRecouvrement: Recouvrement | null = null;
  successMessage = '';
  
  paymentAmount = 0;
  paymentDate = new Date().toISOString().split('T')[0];
  paymentMode = 'especes';
  paymentReference = '';
  
  newRelance: any = { type: 'email', contenu: '', statut: 'envoye' };
  newAction: any = { type: 'appel', contact: '', resultat: '', prochaine_action: '', notes: '' };
  
  currentRecouvrement: Partial<Recouvrement> = {
    reference: '',
    type: 'facture',
    document_id: 0,
    document_reference: '',
    statut: 'en_attente',
    priorite: 'moyenne',
    date_emission: new Date().toISOString().split('T')[0],
    date_echeance: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    montant_du: 0,
    montant_recouvre: 0,
    montant_restant: 0,
    relances: [],
    actions_recouvrement: [],
    echeancier: []
  };
  
  ngOnInit() {
    this.loadClients();
    this.loadFactures();
    this.loadDevis();
    this.loadRecouvrements();
  }
  
  loadClients() {
    const saved = localStorage.getItem('clients');
    this.clients = saved ? JSON.parse(saved) : [];
  }
  
  loadFactures() {
    const saved = localStorage.getItem('factures');
    this.factures = saved ? JSON.parse(saved) : [];
  }
  
  loadDevis() {
    const saved = localStorage.getItem('devis');
    this.devis = saved ? JSON.parse(saved) : [];
  }
  
  loadRecouvrements() {
    const saved = localStorage.getItem('recouvrements');
    this.recouvrements = saved ? JSON.parse(saved) : [];
    this.filteredRecouvrements = [...this.recouvrements];
  }
  
  saveRecouvrementsToStorage() {
    localStorage.setItem('recouvrements', JSON.stringify(this.recouvrements));
  }
  
  openForm() {
    this.currentRecouvrement = {
      reference: this.generateReference(),
      type: 'facture',
      document_id: 0,
      document_reference: '',
      statut: 'en_attente',
      priorite: 'moyenne',
      date_emission: new Date().toISOString().split('T')[0],
      date_echeance: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      montant_du: 0,
      montant_recouvre: 0,
      montant_restant: 0,
      relances: [],
      actions_recouvrement: [],
      echeancier: []
    };
    this.editMode = false;
    this.showForm = true;
    this.activeTab = 'info';
  }
  
  generateReference(): string {
    const date = new Date();
    const year = date.getFullYear();
    const count = this.recouvrements.length + 1;
    return `REC-${year}-${String(count).padStart(4, '0')}`;
  }
  
  getDocumentsByType(): any[] {
    if (this.currentRecouvrement.type === 'facture') {
      return this.factures;
    } else if (this.currentRecouvrement.type === 'devis') {
      return this.devis;
    }
    return [];
  }
  
  onTypeChange() {
    this.currentRecouvrement.document_id = 0;
    this.currentRecouvrement.document_reference = '';
  }
  
  onDocumentChange() {
    const docs = this.getDocumentsByType();
    const doc = docs.find(d => d.id === this.currentRecouvrement.document_id);
    if (doc) {
      this.currentRecouvrement.document_reference = doc.reference;
      this.currentRecouvrement.client_id = doc.client_id;
      this.currentRecouvrement.client_nom = doc.client_nom;
      this.currentRecouvrement.montant_du = doc.montant_ttc;
      this.currentRecouvrement.montant_restant = doc.montant_ttc;
      this.calculerRestant();
    }
  }
  
  calculerRestant() {
    this.currentRecouvrement.montant_restant = 
      (this.currentRecouvrement.montant_du || 0) - (this.currentRecouvrement.montant_recouvre || 0);
    
    if (this.currentRecouvrement.montant_restant === 0) {
      this.currentRecouvrement.statut = 'recouvre';
      this.currentRecouvrement.date_recouvrement = new Date().toISOString().split('T')[0];
    } else if ((this.currentRecouvrement.montant_recouvre || 0) > 0) {
      this.currentRecouvrement.statut = 'partiel';
    } else {
      this.currentRecouvrement.statut = 'en_attente';
    }
  }
  
  addRelance() {
    this.newRelance = { type: 'email', contenu: '', date: new Date().toISOString(), statut: 'envoye' };
    this.showRelanceTemplate = true;
  }
  
  saveRelance() {
    if (!this.currentRecouvrement.relances) {
      this.currentRecouvrement.relances = [];
    }
    this.currentRecouvrement.relances.push({
      ...this.newRelance,
      id: Date.now(),
      date: new Date().toISOString()
    });
    this.showRelanceTemplate = false;
  }
  
  removeRelance(index: number) {
    if (this.currentRecouvrement.relances) {
      this.currentRecouvrement.relances.splice(index, 1);
    }
  }
  
  addAction() {
    this.newAction = { type: 'appel', contact: '', resultat: '', prochaine_action: '', notes: '', date: new Date().toISOString() };
    this.showActionTemplate = true;
  }
  
  saveAction() {
    if (!this.currentRecouvrement.actions_recouvrement) {
      this.currentRecouvrement.actions_recouvrement = [];
    }
    this.currentRecouvrement.actions_recouvrement.push({
      ...this.newAction,
      id: Date.now(),
      date: new Date().toISOString()
    });
    this.showActionTemplate = false;
  }
  
  removeAction(index: number) {
    if (this.currentRecouvrement.actions_recouvrement) {
      this.currentRecouvrement.actions_recouvrement.splice(index, 1);
    }
  }
  
  addEcheance() {
    if (!this.currentRecouvrement.echeancier) {
      this.currentRecouvrement.echeancier = [];
    }
    this.currentRecouvrement.echeancier.push({
      id: Date.now(),
      date_echeance: new Date().toISOString().split('T')[0],
      montant: 0,
      paye: false
    });
  }
  
  marquerPayee(index: number) {
    if (this.currentRecouvrement.echeancier) {
      const echeance = this.currentRecouvrement.echeancier[index];
      echeance.paye = true;
      echeance.date_paiement = new Date().toISOString().split('T')[0];
    }
  }
  
  removeEcheance(index: number) {
    if (this.currentRecouvrement.echeancier) {
      this.currentRecouvrement.echeancier.splice(index, 1);
    }
  }
  
  saveRecouvrement() {
    if (!this.currentRecouvrement.document_id) {
      alert('Veuillez sélectionner un document');
      return;
    }
    
    if (this.editMode && this.currentRecouvrement.id) {
      const index = this.recouvrements.findIndex(r => r.id === this.currentRecouvrement.id);
      if (index !== -1) {
        this.recouvrements[index] = { ...this.currentRecouvrement, updated_at: new Date().toISOString() } as Recouvrement;
        this.showSuccess('Recouvrement modifié');
      }
    } else {
      this.recouvrements.push({ 
        ...this.currentRecouvrement, 
        id: Date.now(), 
        created_at: new Date().toISOString() 
      } as Recouvrement);
      this.showSuccess('Recouvrement ajouté');
    }
    this.saveRecouvrementsToStorage();
    this.filterRecouvrements();
    this.cancelForm();
  }
  
  editRecouvrement(r: Recouvrement) {
    this.currentRecouvrement = { ...r };
    if (!this.currentRecouvrement.relances) this.currentRecouvrement.relances = [];
    if (!this.currentRecouvrement.actions_recouvrement) this.currentRecouvrement.actions_recouvrement = [];
    if (!this.currentRecouvrement.echeancier) this.currentRecouvrement.echeancier = [];
    this.editMode = true;
    this.showForm = true;
    this.activeTab = 'info';
  }
  
  enregistrerPaiement(r: Recouvrement) {
    this.paymentRecouvrement = r;
    this.paymentAmount = r.montant_restant;
    this.paymentDate = new Date().toISOString().split('T')[0];
    this.paymentMode = 'especes';
    this.paymentReference = '';
    this.showPaymentModal = true;
  }
  
  savePayment() {
    if (this.paymentRecouvrement && this.paymentAmount > 0 && this.paymentAmount <= this.paymentRecouvrement.montant_restant) {
      const nouveauRecouvre = (this.paymentRecouvrement.montant_recouvre || 0) + this.paymentAmount;
      this.paymentRecouvrement.montant_recouvre = nouveauRecouvre;
      this.paymentRecouvrement.montant_restant = this.paymentRecouvrement.montant_du - nouveauRecouvre;
      
      if (this.paymentRecouvrement.montant_restant === 0) {
        this.paymentRecouvrement.statut = 'recouvre';
        this.paymentRecouvrement.date_recouvrement = this.paymentDate;
      } else {
        this.paymentRecouvrement.statut = 'partiel';
      }
      
      this.saveRecouvrementsToStorage();
      this.filterRecouvrements();
      this.showPaymentModal = false;
      this.showSuccess(`Paiement de ${this.paymentAmount.toLocaleString()} FCFA enregistré`);
    } else {
      alert('Veuillez saisir un montant valide');
    }
  }
  
  envoyerRelance(r: Recouvrement) {
    alert(`Envoi d'une relance pour ${r.reference} - Fonctionnalité à venir`);
  }
  
  viewDetails(r: Recouvrement) {
    this.selectedRecouvrement = r;
    this.showDetailsModal = true;
  }
  
  confirmDelete(r: Recouvrement) {
    this.recouvrementToDelete = r;
    this.showDeleteModal = true;
  }
  
  deleteRecouvrement() {
    if (this.recouvrementToDelete) {
      this.recouvrements = this.recouvrements.filter(r => r.id !== this.recouvrementToDelete?.id);
      this.saveRecouvrementsToStorage();
      this.filterRecouvrements();
      this.showDeleteModal = false;
      this.recouvrementToDelete = null;
      this.showSuccess('Recouvrement supprimé');
    }
  }
  
  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }
  
  filterRecouvrements() {
    let filtered = [...this.recouvrements];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.reference?.toLowerCase().includes(term) || 
        r.document_reference?.toLowerCase().includes(term) ||
        r.client_nom?.toLowerCase().includes(term)
      );
    }
    
    if (this.statutFilter) {
      filtered = filtered.filter(r => r.statut === this.statutFilter);
    }
    
    if (this.prioriteFilter) {
      filtered = filtered.filter(r => r.priorite === this.prioriteFilter);
    }
    
    if (this.typeFilter) {
      filtered = filtered.filter(r => r.type === this.typeFilter);
    }
    
    this.filteredRecouvrements = filtered;
  }
  
  getMontantTotalDu(): number {
    return this.recouvrements.reduce((sum, r) => sum + (r.montant_du || 0), 0);
  }
  
  getMontantRecouvre(): number {
    return this.recouvrements.reduce((sum, r) => sum + (r.montant_recouvre || 0), 0);
  }
  
  getMontantRestant(): number {
    return this.recouvrements.reduce((sum, r) => sum + (r.montant_restant || 0), 0);
  }
  
  getMontantFiltre(): number {
    return this.filteredRecouvrements.reduce((sum, r) => sum + (r.montant_restant || 0), 0);
  }
  
  getTauxRecouvrementGlobal(): number {
    const total = this.getMontantTotalDu();
    const recouvre = this.getMontantRecouvre();
    return total ? Math.round((recouvre / total) * 100) : 0;
  }
  
  getImpayesCount(): number {
    return this.recouvrements.filter(r => r.statut === 'impaye').length;
  }
  
  getEcheancesDepassees(): number {
    const today = new Date();
    return this.recouvrements.filter(r => {
      const echeance = new Date(r.date_echeance);
      return echeance < today && r.statut !== 'recouvre';
    }).length;
  }
  
  getPourcentageRecouvre(r: Recouvrement): number {
    if (!r.montant_du) return 0;
    return Math.round(((r.montant_recouvre || 0) / r.montant_du) * 100);
  }
  
  getDerniereRelance(r: Recouvrement): Date | null {
    if (!r.relances || r.relances.length === 0) return null;
    const dates = r.relances.map(rel => new Date(rel.date));
    return new Date(Math.max(...dates.map(d => d.getTime())));
  }
  
  isOverdue(date: string | undefined): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }
  
  getRelanceIcon(type: string): string {
    const icons: any = { sms: '📱', email: '✉️', appel: '📞', courrier: '📮' };
    return icons[type] || '📧';
  }
  
  getRelanceTypeLabel(type: string): string {
    const labels: any = { sms: 'SMS', email: 'Email', appel: 'Appel téléphonique', courrier: 'Courrier' };
    return labels[type] || type;
  }
  
  getRelanceStatutLabel(statut: string): string {
    const labels: any = { envoye: 'Envoyé', recu: 'Reçu', ignore: 'Ignoré' };
    return labels[statut] || statut;
  }
  
  getActionIcon(type: string): string {
    const icons: any = { appel: '📞', email: '✉️', visite: '🚶', mise_demeure: '⚖️', contentieux: '🏛️' };
    return icons[type] || '⚡';
  }
  
  getActionTypeLabel(type: string): string {
    const labels: any = { 
      appel: 'Appel téléphonique', 
      email: 'Email', 
      visite: 'Visite terrain', 
      mise_demeure: 'Mise en demeure', 
      contentieux: 'Contentieux' 
    };
    return labels[type] || type;
  }
  
  getTypeLabel(type: string): string {
    const labels: any = { facture: 'Facture', devis: 'Devis', avoir: 'Avoir', acompte: 'Acompte' };
    return labels[type] || type;
  }
  
  getStatutLabel(statut: string): string {
    const labels: any = { 
      en_attente: '⏳ En attente', 
      partiel: '🔄 Partiel', 
      recouvre: '✅ Recouvré', 
      impaye: '⚠️ Impayé', 
      contentieux: '⚖️ Contentieux' 
    };
    return labels[statut] || statut;
  }
  
  getPrioriteLabel(priorite: string): string {
    const labels: any = { haute: '🔴 Haute', moyenne: '🟡 Moyenne', basse: '🟢 Basse' };
    return labels[priorite] || priorite;
  }
  
    exportToExcel() {
    if (!this.filteredRecouvrements || this.filteredRecouvrements.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredRecouvrements[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const lignes = this.filteredRecouvrements.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ""));
    const csvContent = [colonnes, ...lignes]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '')}"`).join(","))
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
    if (!this.filteredRecouvrements || this.filteredRecouvrements.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredRecouvrements[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join("")}</tr>\n</thead>\n<tbody>${this.filteredRecouvrements.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : "-"}</td>`).join("")}</tr>`).join("")}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert("Veuillez autoriser les pop-ups pour exporter en PDF"); }
  }
  
  showSuccess(msg: string) { 
    this.successMessage = msg; 
    setTimeout(() => this.successMessage = '', 3000); 
  }
}