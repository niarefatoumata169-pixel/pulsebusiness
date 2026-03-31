import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface LigneFacture {
  id?: number;
  designation: string;
  quantite: number;
  prix_unitaire: number;
  remise_ligne?: number;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
}

interface Facture {
  id?: number;
  reference: string;
  date_emission: string;
  date_echeance: string;
  date_paiement?: string;
  client_id: number;
  client_nom?: string;
  client_tva?: string;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  remise?: number;
  montant_apres_remise?: number;
  timbre?: number;
  net_a_payer: number;
  montant_paye?: number;
  statut: 'brouillon' | 'envoyee' | 'partielle' | 'payee' | 'impayee' | 'annulee';
  mode_paiement?: 'especes' | 'carte' | 'cheque' | 'virement' | 'mobile_money';
  reference_paiement?: string;
  notes?: string;
  lignes: LigneFacture[];
  created_at: string;
  updated_at?: string;
}

@Component({
  selector: 'app-factures',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="factures-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>📄 Facturation</h1>
          <p class="subtitle">{{ factures.length }} facture(s) • {{ getFacturesImpayees() }} impayée(s) • {{ getMontantTotal() | number }} FCFA total</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="factures.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="factures.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouvelle facture</button>
        </div>
      </div>

      <!-- Message de succès -->
      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="factures.length > 0">
        <div class="kpi-card total">
          <div class="kpi-icon">📄</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ factures.length }}</span>
            <span class="kpi-label">Total factures</span>
          </div>
        </div>
        <div class="kpi-card montant">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getMontantTotal() | number }} <small>FCFA</small></span>
            <span class="kpi-label">Chiffre d'affaires</span>
          </div>
        </div>
        <div class="kpi-card encaisse">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getMontantEncaisse() | number }} <small>FCFA</small></span>
            <span class="kpi-label">Montant encaissé</span>
          </div>
        </div>
        <div class="kpi-card recouvrement">
          <div class="kpi-icon">📊</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getTauxRecouvrement() }}%</span>
            <span class="kpi-label">Taux recouvrement</span>
          </div>
        </div>
        <div class="kpi-card impayees">
          <div class="kpi-icon">⚠️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getFacturesImpayees() }}</span>
            <span class="kpi-label">Factures impayées</span>
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
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouvelle' }} facture</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveFacture()">
              <div class="tabs">
                <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">📋 Informations</button>
                <button type="button" [class.active]="activeTab === 'lignes'" (click)="activeTab = 'lignes'">📦 Lignes</button>
                <button type="button" [class.active]="activeTab === 'paiement'" (click)="activeTab = 'paiement'">💳 Paiement</button>
              </div>

              <!-- Onglet Informations -->
              <div *ngIf="activeTab === 'info'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>Référence *</label>
                    <input type="text" [(ngModel)]="currentFacture.reference" readonly class="readonly">
                  </div>
                  <div class="form-group">
                    <label>Statut</label>
                    <select [(ngModel)]="currentFacture.statut" class="statut-select" [class]="currentFacture.statut">
                      <option value="brouillon">📝 Brouillon</option>
                      <option value="envoyee">📤 Envoyée</option>
                      <option value="partielle">🔄 Paiement partiel</option>
                      <option value="payee">✅ Payée</option>
                      <option value="impayee">⚠️ Impayée</option>
                      <option value="annulee">❌ Annulée</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label>Client *</label>
                  <select [(ngModel)]="currentFacture.client_id" (change)="onClientChange()" required>
                    <option [value]="null">Sélectionner un client</option>
                    <option *ngFor="let c of clients" [value]="c.id">
                      {{ c.nom }} {{ c.prenom }} - {{ c.email || c.telephone }}
                    </option>
                  </select>
                  <button type="button" class="btn-add-client" (click)="openClientForm()">+ Nouveau client</button>
                </div>
                <div class="client-info" *ngIf="currentFacture.client_nom">
                  <div class="info-card">
                    <div class="info-card-header">
                      <span class="info-icon">👤</span>
                      <strong>{{ currentFacture.client_nom }}</strong>
                    </div>
                    <div class="info-card-details">
                      <span *ngIf="currentFacture.client_tva">🏷️ TVA: {{ currentFacture.client_tva }}</span>
                    </div>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>📅 Date d'émission</label>
                    <input type="date" [(ngModel)]="currentFacture.date_emission">
                  </div>
                  <div class="form-group">
                    <label>⚠️ Date d'échéance</label>
                    <input type="date" [(ngModel)]="currentFacture.date_echeance" [class.overdue]="isOverdue(currentFacture.date_echeance)">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>💰 Montant HT</label>
                    <input type="number" [(ngModel)]="currentFacture.montant_ht" (input)="calculerTotal()" step="10000" class="montant-input">
                  </div>
                  <div class="form-group">
                    <label>TVA (%)</label>
                    <input type="number" [(ngModel)]="currentFacture.tva" (input)="calculerTotal()" step="1">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>🎁 Remise (%)</label>
                    <input type="number" [(ngModel)]="currentFacture.remise" (input)="calculerTotal()" step="1" min="0" max="100">
                  </div>
                  <div class="form-group">
                    <label>📮 Timbre fiscal</label>
                    <input type="number" [(ngModel)]="currentFacture.timbre" (input)="calculerTotal()" step="500">
                  </div>
                </div>
                <div class="form-group highlight">
                  <label>💰 Net à payer</label>
                  <input type="text" [value]="(currentFacture.net_a_payer || 0) | number:'1.0-0'" readonly class="readonly highlight-input">
                </div>
                <div class="form-group">
                  <label>📝 Notes</label>
                  <textarea [(ngModel)]="currentFacture.notes" rows="2" placeholder="Conditions particulières..."></textarea>
                </div>
              </div>

              <!-- Onglet Lignes -->
              <div *ngIf="activeTab === 'lignes'" class="tab-content">
                <div class="lignes-header">
                  <h4>📦 Lignes de facture</h4>
                  <button type="button" class="btn-add" (click)="addLigne()">+ Ajouter ligne</button>
                </div>
                <div class="lignes-list" *ngIf="currentFacture.lignes && currentFacture.lignes.length > 0; else noLignes">
                  <div class="lignes-header-row">
                    <div class="col-designation">Désignation</div>
                    <div class="col-quantite">Qté</div>
                    <div class="col-prix">Prix unit.</div>
                    <div class="col-remise">Remise</div>
                    <div class="col-montant">Montant HT</div>
                    <div class="col-actions"></div>
                  </div>
                  <div class="lignes-row" *ngFor="let ligne of currentFacture.lignes; let i = index">
                    <div class="col-designation">
                      <input type="text" [(ngModel)]="ligne.designation" (input)="updateLigneMontant(ligne)">
                    </div>
                    <div class="col-quantite">
                      <input type="number" [(ngModel)]="ligne.quantite" (input)="updateLigneMontant(ligne)" step="1" min="1">
                    </div>
                    <div class="col-prix">
                      <input type="number" [(ngModel)]="ligne.prix_unitaire" (input)="updateLigneMontant(ligne)" step="1000">
                    </div>
                    <div class="col-remise">
                      <input type="number" [(ngModel)]="ligne.remise_ligne" (input)="updateLigneMontant(ligne)" step="5" min="0" max="100">
                    </div>
                    <div class="col-montant">
                      <span class="montant-ligne">{{ ligne.montant_ht | number }} FCFA</span>
                    </div>
                    <div class="col-actions">
                      <button type="button" class="remove-ligne" (click)="removeLigne(i)">🗑️</button>
                    </div>
                  </div>
                  <div class="lignes-total">
                    <div class="total-row">
                      <span>Sous-total HT:</span>
                      <strong>{{ getSousTotalHT() | number }} FCFA</strong>
                    </div>
                    <div class="total-row">
                      <span>TVA ({{ currentFacture.tva || 0 }}%):</span>
                      <strong>{{ getTvaMontant() | number }} FCFA</strong>
                    </div>
                    <div class="total-row" *ngIf="currentFacture.remise">
                      <span>Remise ({{ currentFacture.remise }}%):</span>
                      <strong>-{{ getRemiseMontant() | number }} FCFA</strong>
                    </div>
                    <div class="total-row" *ngIf="currentFacture.timbre">
                      <span>Timbre fiscal:</span>
                      <strong>{{ currentFacture.timbre | number }} FCFA</strong>
                    </div>
                    <div class="total-row grand-total">
                      <span>Net à payer:</span>
                      <strong>{{ getNetAPayerFromLignes() | number }} FCFA</strong>
                    </div>
                  </div>
                </div>
                <ng-template #noLignes>
                  <div class="no-data">Aucune ligne ajoutée</div>
                </ng-template>
              </div>

              <!-- Onglet Paiement -->
              <div *ngIf="activeTab === 'paiement'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>💳 Mode de paiement</label>
                    <select [(ngModel)]="currentFacture.mode_paiement">
                      <option value="especes">💵 Espèces</option>
                      <option value="carte">💳 Carte bancaire</option>
                      <option value="cheque">📝 Chèque</option>
                      <option value="virement">🏦 Virement bancaire</option>
                      <option value="mobile_money">📱 Mobile Money</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>🔖 Référence paiement</label>
                    <input type="text" [(ngModel)]="currentFacture.reference_paiement" placeholder="Numéro chèque, transaction...">
                  </div>
                </div>
                <div class="form-group" *ngIf="currentFacture.statut === 'payee' || currentFacture.statut === 'partielle'">
                  <label>📅 Date de paiement</label>
                  <input type="date" [(ngModel)]="currentFacture.date_paiement">
                </div>
                <div class="payment-summary" *ngIf="currentFacture.net_a_payer">
                  <div class="summary-card">
                    <div class="summary-title">Récapitulatif</div>
                    <div class="summary-row">
                      <span>Montant dû:</span>
                      <strong>{{ currentFacture.net_a_payer | number }} FCFA</strong>
                    </div>
                    <div class="summary-row" *ngIf="currentFacture.montant_paye">
                      <span>Montant payé:</span>
                      <strong>{{ currentFacture.montant_paye | number }} FCFA</strong>
                    </div>
                    <div class="summary-row" *ngIf="currentFacture.statut === 'partielle'">
                      <span>⚠️ Reste à payer:</span>
                      <strong>{{ (currentFacture.net_a_payer - (currentFacture.montant_paye || 0)) | number }} FCFA</strong>
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
      <div class="filters-section" *ngIf="factures.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterFactures()" placeholder="Rechercher par référence, client..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterFactures()" class="filter-select">
            <option value="">📊 Tous statuts</option>
            <option value="brouillon">📝 Brouillon</option>
            <option value="envoyee">📤 Envoyée</option>
            <option value="partielle">🔄 Partielle</option>
            <option value="payee">✅ Payée</option>
            <option value="impayee">⚠️ Impayée</option>
            <option value="annulee">❌ Annulée</option>
          </select>
          <select [(ngModel)]="periodeFilter" (ngModelChange)="filterFactures()" class="filter-select">
            <option value="">📅 Toutes périodes</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="last_month">Mois dernier</option>
          </select>
        </div>
      </div>

      <!-- Liste des factures -->
      <div class="factures-section" *ngIf="factures.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Liste des factures</h2>
          <div class="header-stats">
            <span class="stat-badge">{{ filteredFactures.length }} / {{ factures.length }} affiché(s)</span>
          </div>
        </div>
        
        <div class="factures-grid">
          <div class="facture-card" *ngFor="let f of filteredFactures" [class]="f.statut">
            <div class="card-header">
              <div class="header-left">
                <div class="facture-icon">📄</div>
                <div class="facture-info">
                  <div class="facture-ref">{{ f.reference }}</div>
                  <div class="facture-client">{{ f.client_nom || 'Client non spécifié' }}</div>
                  <div class="facture-date">📅 {{ f.date_emission | date:'dd/MM/yyyy' }}</div>
                </div>
              </div>
              <div class="header-right">
                <div class="facture-montant">{{ f.net_a_payer | number }} FCFA</div>
                <span class="statut-badge" [class]="f.statut">{{ getStatutLabel(f.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">⚠️ Échéance:</span>
                <span class="info-value" [class.overdue]="isOverdue(f.date_echeance) && f.statut !== 'payee'">{{ f.date_echeance | date:'dd/MM/yyyy' }}</span>
                <span *ngIf="isOverdue(f.date_echeance) && f.statut !== 'payee'" class="overdue-badge">⏰ En retard</span>
              </div>
              <div class="info-row" *ngIf="f.mode_paiement">
                <span class="info-label">💳 Paiement:</span>
                <span class="info-value">{{ getModePaiementLabel(f.mode_paiement) }}</span>
              </div>
              <div class="info-row" *ngIf="f.date_paiement">
                <span class="info-label">✅ Payé le:</span>
                <span class="info-value">{{ f.date_paiement | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📦 Lignes:</span>
                <span class="info-value">{{ f.lignes.length || 0 }} article(s)</span>
              </div>
              <div class="progress-bar" *ngIf="f.statut === 'partielle'">
                <div class="progress-fill" [style.width.%]="getPourcentagePaye(f)"></div>
                <span class="progress-text">{{ getPourcentagePaye(f) }}% payé</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="viewDetails(f)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="editFacture(f)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="duplicateFacture(f)" title="Dupliquer">📋</button>
                <button class="action-icon" (click)="imprimerFacture(f)" title="Imprimer">🖨️</button>
                <button class="action-icon" (click)="envoyerParEmail(f)" title="Envoyer par email">📧</button>
                <button class="action-icon" (click)="enregistrerPaiement(f)" title="Enregistrer paiement" *ngIf="f.statut !== 'payee' && f.statut !== 'annulee'">💵</button>
                <button class="action-icon delete" (click)="confirmDelete(f)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📄</div>
          <h2>Aucune facture</h2>
          <p>Créez votre première facture</p>
          <button class="btn-primary" (click)="openForm()">+ Nouvelle facture</button>
        </div>
      </ng-template>

      <!-- Modal Détails -->
      <div class="modal-overlay" *ngIf="showDetailsModal && selectedFacture">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>Détails de la facture - {{ selectedFacture.reference }}</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="details-grid">
              <div class="detail-section">
                <h4>📋 Informations générales</h4>
                <p><strong>Référence:</strong> {{ selectedFacture.reference }}</p>
                <p><strong>Statut:</strong> {{ getStatutLabel(selectedFacture.statut) }}</p>
                <p><strong>Date émission:</strong> {{ selectedFacture.date_emission | date:'dd/MM/yyyy' }}</p>
                <p><strong>Date échéance:</strong> {{ selectedFacture.date_echeance | date:'dd/MM/yyyy' }}</p>
                <p><strong>Date paiement:</strong> {{ selectedFacture.date_paiement | date:'dd/MM/yyyy' || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>👤 Client</h4>
                <p><strong>Nom:</strong> {{ selectedFacture.client_nom || '-' }}</p>
                <p><strong>TVA:</strong> {{ selectedFacture.client_tva || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>💰 Montants</h4>
                <p><strong>Montant HT:</strong> {{ selectedFacture.montant_ht | number }} FCFA</p>
                <p><strong>TVA:</strong> {{ selectedFacture.tva }}%</p>
                <p><strong>Remise:</strong> {{ selectedFacture.remise || 0 }}%</p>
                <p><strong>Timbre:</strong> {{ selectedFacture.timbre | number }} FCFA</p>
                <p><strong>Net à payer:</strong> <strong class="highlight">{{ selectedFacture.net_a_payer | number }} FCFA</strong></p>
                <p *ngIf="selectedFacture.montant_paye"><strong>Montant payé:</strong> {{ selectedFacture.montant_paye | number }} FCFA</p>
                <p *ngIf="selectedFacture.montant_paye && selectedFacture.montant_paye < selectedFacture.net_a_payer"><strong>Reste à payer:</strong> {{ (selectedFacture.net_a_payer - selectedFacture.montant_paye) | number }} FCFA</p>
              </div>
              <div class="detail-section">
                <h4>💳 Paiement</h4>
                <p><strong>Mode:</strong> {{ getModePaiementLabel(selectedFacture.mode_paiement) }}</p>
                <p><strong>Référence:</strong> {{ selectedFacture.reference_paiement || '-' }}</p>
              </div>
              <div class="detail-section full-width" *ngIf="selectedFacture.lignes?.length">
                <h4>📦 Détail des lignes</h4>
                <table class="details-table">
                  <thead>
                    <tr>
                      <th>Désignation</th>
                      <th class="text-center">Qté</th>
                      <th class="text-right">Prix unit.</th>
                      <th class="text-center">Remise</th>
                      <th class="text-right">Montant HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let l of selectedFacture.lignes">
                      <td>{{ l.designation }}</td>
                      <td class="text-center">{{ l.quantite }}</td>
                      <td class="text-right">{{ l.prix_unitaire | number }} FCFA</td>
                      <td class="text-center">{{ l.remise_ligne || 0 }}%</td>
                      <td class="text-right">{{ l.montant_ht | number }} FCFA</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="total-row">
                      <td colspan="4" class="text-right"><strong>Sous-total HT:</strong></td>
                      <td class="text-right"><strong>{{ getSousTotalHTSum(selectedFacture) | number }} FCFA</strong></td>
                    </tr>
                    <tr class="total-row">
                      <td colspan="4" class="text-right"><strong>TVA ({{ selectedFacture.tva }}%):</strong></td>
                      <td class="text-right"><strong>{{ getTvaMontantSum(selectedFacture) | number }} FCFA</strong></td>
                    </tr>
                    <tr class="total-row" *ngIf="selectedFacture.remise">
                      <td colspan="4" class="text-right"><strong>Remise ({{ selectedFacture.remise }}%):</strong></td>
                      <td class="text-right"><strong>-{{ getRemiseMontantSum(selectedFacture) | number }} FCFA</strong></td>
                    </tr>
                    <tr class="total-row" *ngIf="selectedFacture.timbre">
                      <td colspan="4" class="text-right"><strong>Timbre fiscal:</strong></td>
                      <td class="text-right"><strong>{{ selectedFacture.timbre | number }} FCFA</strong></td>
                    </tr>
                    <tr class="grand-total-row">
                      <td colspan="4" class="text-right"><strong>Net à payer:</strong></td>
                      <td class="text-right"><strong class="highlight">{{ selectedFacture.net_a_payer | number }} FCFA</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div class="detail-section full-width" *ngIf="selectedFacture.notes">
                <h4>📝 Notes</h4>
                <p>{{ selectedFacture.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Paiement -->
      <div class="modal-overlay" *ngIf="showPaymentModal && paymentFacture">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>💵 Enregistrer un paiement</h3>
            <button class="modal-close" (click)="showPaymentModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="payment-info">
              <p><strong>Facture:</strong> {{ paymentFacture.reference }}</p>
              <p><strong>Client:</strong> {{ paymentFacture.client_nom }}</p>
              <p><strong>Montant total:</strong> {{ paymentFacture.net_a_payer | number }} FCFA</p>
              <p *ngIf="paymentFacture.montant_paye"><strong>Déjà payé:</strong> {{ paymentFacture.montant_paye | number }} FCFA</p>
              <p><strong>Reste à payer:</strong> <strong class="highlight">{{ (paymentFacture.net_a_payer - (paymentFacture.montant_paye || 0)) | number }} FCFA</strong></p>
            </div>
            <div class="form-group">
              <label>Montant à encaisser *</label>
              <input type="number" [(ngModel)]="paymentAmount" step="1000" [max]="paymentFacture.net_a_payer - (paymentFacture.montant_paye || 0)" class="montant-input">
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

      <!-- Modal Client rapide -->
      <div class="modal-overlay" *ngIf="showClientForm">
        <div class="modal-container">
          <div class="modal-header">
            <h3>➕ Nouveau client</h3>
            <button class="modal-close" (click)="showClientForm = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nom *</label>
              <input type="text" [(ngModel)]="newClient.nom">
            </div>
            <div class="form-group">
              <label>Prénom</label>
              <input type="text" [(ngModel)]="newClient.prenom">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" [(ngModel)]="newClient.telephone">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="newClient.email">
              </div>
            </div>
            <div class="form-group">
              <label>Adresse</label>
              <input type="text" [(ngModel)]="newClient.adresse">
            </div>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showClientForm = false">Annuler</button>
              <button class="btn-primary" (click)="saveNewClient()">💾 Ajouter</button>
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
            <p>Supprimer la facture <strong>{{ factureToDelete?.reference }}</strong> ?</p>
            <p class="warning-text">Cette action est irréversible.</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteFacture()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .factures-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
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
    .kpi-card.montant .kpi-value { color: #10B981; }
    .kpi-card.encaisse .kpi-value { color: #3B82F6; }
    .kpi-card.recouvrement .kpi-value { color: #8B5CF6; }
    .kpi-card.impayees .kpi-value { color: #F59E0B; }
    .kpi-card.echeance .kpi-value { color: #EF4444; }
    
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
    
    .btn-add-client { background: none; border: 1px solid #FCE7F3; padding: 8px 12px; border-radius: 8px; color: #EC4899; cursor: pointer; margin-top: 8px; width: 100%; }
    .client-info { margin-top: 16px; }
    .info-card { background: #FEF3F9; border-radius: 12px; padding: 16px; }
    .info-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .info-icon { font-size: 20px; }
    .info-card-details { display: flex; gap: 16px; font-size: 13px; color: #6B7280; flex-wrap: wrap; }
    
    .lignes-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
    .lignes-list { border: 1px solid #F3F4F6; border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
    .lignes-header-row { display: grid; grid-template-columns: 1fr 80px 120px 80px 120px 40px; background: #F9FAFB; padding: 12px; font-weight: 600; font-size: 13px; color: #6B7280; border-bottom: 1px solid #F3F4F6; }
    .lignes-row { display: grid; grid-template-columns: 1fr 80px 120px 80px 120px 40px; padding: 12px; border-bottom: 1px solid #F3F4F6; align-items: center; }
    .lignes-row:last-child { border-bottom: none; }
    .col-designation input { width: 100%; padding: 8px; border: 1px solid #F3F4F6; border-radius: 6px; }
    .col-quantite input, .col-prix input, .col-remise input { width: 100%; padding: 8px; text-align: right; border: 1px solid #F3F4F6; border-radius: 6px; }
    .montant-ligne { font-weight: 500; color: #1F2937; text-align: right; display: block; }
    .remove-ligne { background: none; border: none; cursor: pointer; font-size: 16px; opacity: 0.5; transition: opacity 0.2s; }
    .remove-ligne:hover { opacity: 1; }
    .lignes-total { padding: 16px; background: #F9FAFB; text-align: right; border-top: 2px solid #F3F4F6; }
    .total-row { margin-bottom: 8px; }
    .total-row span { margin-right: 20px; color: #6B7280; }
    .grand-total { font-size: 18px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #F3F4F6; }
    .grand-total strong { color: #EC4899; font-size: 20px; }
    .no-data { text-align: center; padding: 40px; background: #F9FAFB; border-radius: 12px; color: #6B7280; }
    
    .payment-summary { margin-top: 20px; }
    .summary-card { background: #F9FAFB; border-radius: 12px; padding: 16px; border: 1px solid #F3F4F6; }
    .summary-title { font-weight: 600; margin-bottom: 12px; color: #1F2937; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 2; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    
    .factures-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; background: #FEF3F9; color: #EC4899; }
    
    .factures-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 20px; }
    .facture-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .facture-card.brouillon { border-left-color: #9CA3AF; }
    .facture-card.envoyee { border-left-color: #3B82F6; }
    .facture-card.partielle { border-left-color: #8B5CF6; }
    .facture-card.payee { border-left-color: #10B981; opacity: 0.8; }
    .facture-card.impayee { border-left-color: #F59E0B; }
    .facture-card.annulee { border-left-color: #EF4444; opacity: 0.7; }
    .facture-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: flex-start; flex: 1; }
    .facture-icon { font-size: 28px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .facture-ref { font-weight: 600; color: #1F2937; margin-bottom: 4px; font-family: monospace; }
    .facture-client { font-size: 13px; color: #6B7280; margin-bottom: 2px; }
    .facture-date { font-size: 11px; color: #9CA3AF; }
    .header-right { text-align: right; }
    .facture-montant { font-weight: 700; color: #EC4899; margin-bottom: 8px; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.brouillon { background: #F3F4F6; color: #6B7280; }
    .statut-badge.envoyee { background: #DBEAFE; color: #1E40AF; }
    .statut-badge.partielle { background: #EDE9FE; color: #7C3AED; }
    .statut-badge.payee { background: #DCFCE7; color: #16A34A; }
    .statut-badge.impayee { background: #FEF3C7; color: #D97706; }
    .statut-badge.annulee { background: #FEE2E2; color: #EF4444; }
    .card-body { margin: 16px 0; }
    .info-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; font-size: 13px; flex-wrap: wrap; }
    .info-label { color: #6B7280; min-width: 80px; }
    .info-value { font-weight: 500; color: #1F2937; }
    .info-value.overdue { color: #EF4444; }
    .overdue-badge { background: #FEE2E2; color: #EF4444; padding: 2px 8px; border-radius: 12px; font-size: 10px; }
    .progress-bar { background: #F3F4F6; border-radius: 20px; height: 6px; margin-top: 12px; position: relative; }
    .progress-fill { background: #8B5CF6; border-radius: 20px; height: 6px; }
    .progress-text { font-size: 10px; color: #6B7280; position: absolute; right: 0; top: -16px; }
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
    .details-table { width: 100%; border-collapse: collapse; }
    .details-table th, .details-table td { padding: 8px; text-align: left; border-bottom: 1px solid #F3F4F6; }
    .details-table th { background: #F9FAFB; font-weight: 600; color: #6B7280; }
    .details-table td.text-center { text-align: center; }
    .details-table td.text-right { text-align: right; }
    .details-table tfoot tr.total-row td { padding-top: 8px; font-weight: 500; }
    .details-table tfoot tr.grand-total-row td { padding-top: 12px; border-top: 2px solid #F3F4F6; }
    .highlight { color: #EC4899; font-size: 18px; }
    .warning-text { color: #EF4444; font-size: 12px; margin-top: 8px; }
    
    .payment-info { background: #FEF3F9; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
    .payment-info p { margin: 8px 0; }
    
    @media (max-width: 1200px) { .kpi-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; gap: 12px; } .kpi-grid { grid-template-columns: repeat(2, 1fr); } .factures-grid { grid-template-columns: 1fr; } .filter-group { flex-direction: column; } .details-grid { grid-template-columns: 1fr; } .detail-section.full-width { grid-column: span 1; } .lignes-header-row, .lignes-row { grid-template-columns: 1fr 70px 100px 70px 100px 30px; font-size: 12px; } }
  `]
})
export class Factures implements OnInit {
  factures: Facture[] = [];
  filteredFactures: Facture[] = [];
  clients: any[] = [];
  
  searchTerm = '';
  statutFilter = '';
  periodeFilter = '';
  activeTab = 'info';
  showForm = false;
  showDetailsModal = false;
  showDeleteModal = false;
  showPaymentModal = false;
  showClientForm = false;
  editMode = false;
  selectedFacture: Facture | null = null;
  factureToDelete: Facture | null = null;
  paymentFacture: Facture | null = null;
  successMessage = '';
  
  paymentAmount = 0;
  paymentDate = new Date().toISOString().split('T')[0];
  paymentMode = 'especes';
  paymentReference = '';
  
  newClient: any = { nom: '', prenom: '', telephone: '', email: '', adresse: '' };
  
  currentFacture: Partial<Facture> = {
    reference: '',
    statut: 'brouillon',
    date_emission: new Date().toISOString().split('T')[0],
    date_echeance: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    montant_ht: 0,
    tva: 18,
    montant_ttc: 0,
    net_a_payer: 0,
    remise: 0,
    timbre: 0,
    montant_paye: 0,
    lignes: []
  };
  
  ngOnInit() {
    this.loadClients();
    this.loadFactures();
  }
  
  loadClients() {
    const saved = localStorage.getItem('clients');
    this.clients = saved ? JSON.parse(saved) : [];
  }
  
  loadFactures() {
    const saved = localStorage.getItem('factures');
    this.factures = saved ? JSON.parse(saved) : [];
    this.filteredFactures = [...this.factures];
  }
  
  saveFacturesToStorage() {
    localStorage.setItem('factures', JSON.stringify(this.factures));
  }
  
  openForm() {
    this.currentFacture = {
      reference: this.generateReference(),
      statut: 'brouillon',
      date_emission: new Date().toISOString().split('T')[0],
      date_echeance: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      montant_ht: 0,
      tva: 18,
      montant_ttc: 0,
      net_a_payer: 0,
      remise: 0,
      timbre: 0,
      montant_paye: 0,
      lignes: []
    };
    this.editMode = false;
    this.showForm = true;
    this.activeTab = 'info';
  }
  
  generateReference(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = this.factures.length + 1;
    return `FAC-${year}${month}-${String(count).padStart(4, '0')}`;
  }
  
  onClientChange() {
    const client = this.clients.find(c => c.id === this.currentFacture.client_id);
    if (client) {
      this.currentFacture.client_nom = `${client.nom} ${client.prenom || ''}`;
      this.currentFacture.client_tva = client.numero_tva;
    }
  }
  
  addLigne() {
    if (!this.currentFacture.lignes) {
      this.currentFacture.lignes = [];
    }
    this.currentFacture.lignes.push({
      id: Date.now(),
      designation: '',
      quantite: 1,
      prix_unitaire: 0,
      remise_ligne: 0,
      montant_ht: 0,
      tva: this.currentFacture.tva || 18,
      montant_ttc: 0
    });
  }
  
  removeLigne(index: number) {
    if (this.currentFacture.lignes) {
      this.currentFacture.lignes.splice(index, 1);
      this.recalculerTotalDepuisLignes();
    }
  }
  
  updateLigneMontant(ligne: LigneFacture) {
    const montantBrut = (ligne.quantite || 0) * (ligne.prix_unitaire || 0);
    const remise = (ligne.remise_ligne || 0) / 100;
    ligne.montant_ht = montantBrut * (1 - remise);
    ligne.montant_ttc = ligne.montant_ht * (1 + (ligne.tva || 18) / 100);
    this.recalculerTotalDepuisLignes();
  }
  
  recalculerTotalDepuisLignes() {
    const sousTotal = this.getSousTotalHT();
    this.currentFacture.montant_ht = sousTotal;
    this.calculerTotal();
  }
  
  getSousTotalHT(): number {
    if (!this.currentFacture.lignes) return 0;
    return this.currentFacture.lignes.reduce((sum, l) => sum + (l.montant_ht || 0), 0);
  }
  
  getTvaMontant(): number {
    return (this.currentFacture.montant_ht || 0) * (this.currentFacture.tva || 0) / 100;
  }
  
  getRemiseMontant(): number {
    const totalAvecTva = (this.currentFacture.montant_ht || 0) + this.getTvaMontant();
    return totalAvecTva * (this.currentFacture.remise || 0) / 100;
  }
  
  getNetAPayerFromLignes(): number {
    const totalAvecTva = (this.currentFacture.montant_ht || 0) + this.getTvaMontant();
    const apresRemise = totalAvecTva - this.getRemiseMontant();
    return apresRemise + (this.currentFacture.timbre || 0);
  }
  
  calculerTotal() {
    const totalAvecTva = (this.currentFacture.montant_ht || 0) * (1 + (this.currentFacture.tva || 0) / 100);
    const apresRemise = totalAvecTva * (1 - (this.currentFacture.remise || 0) / 100);
    this.currentFacture.montant_ttc = apresRemise;
    this.currentFacture.net_a_payer = apresRemise + (this.currentFacture.timbre || 0);
  }
  
  openClientForm() {
    this.newClient = { nom: '', prenom: '', telephone: '', email: '', adresse: '' };
    this.showClientForm = true;
  }
  
  saveNewClient() {
    if (!this.newClient.nom) {
      alert('Veuillez saisir le nom du client');
      return;
    }
    const newId = Date.now();
    const client = {
      ...this.newClient,
      id: newId,
      type: 'particulier',
      statut: 'actif',
      categorie: 'C',
      delai_paiement_jours: 30,
      code: `CLT-${String(this.clients.length + 1).padStart(4, '0')}`,
      created_at: new Date().toISOString()
    };
    this.clients.push(client);
    localStorage.setItem('clients', JSON.stringify(this.clients));
    this.currentFacture.client_id = newId;
    this.onClientChange();
    this.showClientForm = false;
    this.showSuccess('Client ajouté avec succès');
  }
  
  saveFacture() {
    if (!this.currentFacture.client_id) {
      alert('Veuillez sélectionner un client');
      return;
    }
    
    if (this.editMode && this.currentFacture.id) {
      const index = this.factures.findIndex(f => f.id === this.currentFacture.id);
      if (index !== -1) {
        this.factures[index] = { ...this.currentFacture, updated_at: new Date().toISOString() } as Facture;
        this.showSuccess('Facture modifiée');
      }
    } else {
      this.factures.push({
        ...this.currentFacture,
        id: Date.now(),
        created_at: new Date().toISOString()
      } as Facture);
      this.showSuccess('Facture ajoutée');
    }
    this.saveFacturesToStorage();
    this.filterFactures();
    this.cancelForm();
  }
  
  editFacture(f: Facture) {
    this.currentFacture = { ...f };
    if (!this.currentFacture.lignes) this.currentFacture.lignes = [];
    if (!this.currentFacture.montant_paye) this.currentFacture.montant_paye = 0;
    this.editMode = true;
    this.showForm = true;
    this.activeTab = 'info';
  }
  
  duplicateFacture(f: Facture) {
    const newFacture = {
      ...f,
      id: undefined,
      reference: this.generateReference(),
      statut: 'brouillon' as const,
      created_at: new Date().toISOString(),
      date_paiement: undefined,
      reference_paiement: undefined,
      montant_paye: 0
    };
    this.factures.push(newFacture);
    this.saveFacturesToStorage();
    this.filterFactures();
    this.showSuccess('Facture dupliquée');
  }
  
  viewDetails(f: Facture) {
    this.selectedFacture = f;
    this.showDetailsModal = true;
  }
  
  imprimerFacture(f: Facture) {
    alert(`Impression de la facture ${f.reference}`);
  }
  
  envoyerParEmail(f: Facture) {
    alert(`Envoi par email de la facture ${f.reference}`);
  }
  
  enregistrerPaiement(f: Facture) {
    this.paymentFacture = f;
    const resteAPayer = f.net_a_payer - (f.montant_paye || 0);
    this.paymentAmount = resteAPayer;
    this.paymentDate = new Date().toISOString().split('T')[0];
    this.paymentMode = 'especes';
    this.paymentReference = '';
    this.showPaymentModal = true;
  }
  
  savePayment() {
    if (this.paymentFacture && this.paymentAmount > 0) {
      const nouveauPaye = (this.paymentFacture.montant_paye || 0) + this.paymentAmount;
      this.paymentFacture.montant_paye = nouveauPaye;
      
      if (nouveauPaye >= this.paymentFacture.net_a_payer) {
        this.paymentFacture.statut = 'payee';
        this.paymentFacture.date_paiement = this.paymentDate;
      } else {
        this.paymentFacture.statut = 'partielle';
      }
      
      this.paymentFacture.mode_paiement = this.paymentMode as any;
      this.paymentFacture.reference_paiement = this.paymentReference;
      
      this.saveFacturesToStorage();
      this.filterFactures();
      this.showPaymentModal = false;
      this.showSuccess(`Paiement de ${this.paymentAmount.toLocaleString()} FCFA enregistré`);
    } else {
      alert('Veuillez saisir un montant valide');
    }
  }
  
  confirmDelete(f: Facture) {
    this.factureToDelete = f;
    this.showDeleteModal = true;
  }
  
  deleteFacture() {
    if (this.factureToDelete) {
      this.factures = this.factures.filter(f => f.id !== this.factureToDelete?.id);
      this.saveFacturesToStorage();
      this.filterFactures();
      this.showDeleteModal = false;
      this.factureToDelete = null;
      this.showSuccess('Facture supprimée');
    }
  }
  
  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }
  
  filterFactures() {
    let filtered = [...this.factures];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(f => 
        f.reference?.toLowerCase().includes(term) || 
        f.client_nom?.toLowerCase().includes(term)
      );
    }
    
    if (this.statutFilter) {
      filtered = filtered.filter(f => f.statut === this.statutFilter);
    }
    
    if (this.periodeFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (this.periodeFilter === 'today') {
        filtered = filtered.filter(f => new Date(f.date_emission).toDateString() === today.toDateString());
      } else if (this.periodeFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        filtered = filtered.filter(f => new Date(f.date_emission) >= weekAgo);
      } else if (this.periodeFilter === 'month') {
        filtered = filtered.filter(f => {
          const date = new Date(f.date_emission);
          return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
        });
      } else if (this.periodeFilter === 'last_month') {
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        filtered = filtered.filter(f => {
          const date = new Date(f.date_emission);
          return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
        });
      }
    }
    
    this.filteredFactures = filtered;
  }
  
  getMontantTotal(): number {
    return this.factures.reduce((sum, f) => sum + (f.net_a_payer || 0), 0);
  }
  
  getMontantEncaisse(): number {
    return this.factures.filter(f => f.statut === 'payee').reduce((sum, f) => sum + (f.net_a_payer || 0), 0);
  }
  
  getTauxRecouvrement(): number {
    const total = this.getMontantTotal();
    const encaisse = this.getMontantEncaisse();
    return total ? Math.round((encaisse / total) * 100) : 0;
  }
  
  getFacturesImpayees(): number {
    return this.factures.filter(f => f.statut === 'impayee' || (f.statut === 'envoyee' && this.isOverdue(f.date_echeance))).length;
  }
  
  getEcheancesDepassees(): number {
    return this.factures.filter(f => this.isOverdue(f.date_echeance) && f.statut !== 'payee' && f.statut !== 'annulee').length;
  }
  
  getPourcentagePaye(f: Facture): number {
    if (!f.net_a_payer) return 0;
    const paye = f.montant_paye || 0;
    return Math.min(100, Math.round((paye / f.net_a_payer) * 100));
  }
  
  getSousTotalHTSum(f: Facture): number {
    if (!f.lignes) return 0;
    return f.lignes.reduce((sum, l) => sum + (l.montant_ht || 0), 0);
  }
  
  getTvaMontantSum(f: Facture): number {
    return this.getSousTotalHTSum(f) * (f.tva || 0) / 100;
  }
  
  getRemiseMontantSum(f: Facture): number {
    const totalAvecTva = this.getSousTotalHTSum(f) + this.getTvaMontantSum(f);
    return totalAvecTva * (f.remise || 0) / 100;
  }
  
  isOverdue(date: string | undefined): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }
  
  getStatutLabel(statut: string): string {
    const labels: any = {
      brouillon: '📝 Brouillon',
      envoyee: '📤 Envoyée',
      partielle: '🔄 Paiement partiel',
      payee: '✅ Payée',
      impayee: '⚠️ Impayée',
      annulee: '❌ Annulée'
    };
    return labels[statut] || statut;
  }
  
  getModePaiementLabel(mode: string | undefined): string {
    if (!mode) return '-';
    const labels: any = {
      especes: '💵 Espèces',
      carte: '💳 Carte',
      cheque: '📝 Chèque',
      virement: '🏦 Virement',
      mobile_money: '📱 Mobile Money'
    };
    return labels[mode] || mode;
  }
  
    exportToExcel() {
    if (!this.filteredFactures || this.filteredFactures.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredFactures[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const lignes = this.filteredFactures.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ""));
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
    if (!this.filteredFactures || this.filteredFactures.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredFactures[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join("")}</tr>\n</thead>\n<tbody>${this.filteredFactures.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : "-"}</td>`).join("")}</tr>`).join("")}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert("Veuillez autoriser les pop-ups pour exporter en PDF"); }
  }
  
  showSuccess(msg: string) { 
    this.successMessage = msg; 
    setTimeout(() => this.successMessage = '', 3000); 
  }
}