import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Capacitor } from '@capacitor/core';

interface LigneVente {
  id?: number;
  designation: string;
  quantite: number;
  prix_unitaire: number;
  remise_ligne?: number;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
}

interface Vente {
  id?: number;
  reference: string;
  date_vente: string;
  client_id: number;
  client_nom?: string;
  client_tva?: string;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  remise?: number;
  montant_apres_remise?: number;
  net_a_payer: number;
  montant_paye?: number;
  statut: 'en_attente' | 'payee' | 'annulee' | 'partielle';
  mode_paiement?: 'especes' | 'carte' | 'cheque' | 'virement' | 'mobile_money';
  reference_paiement?: string;
  date_paiement?: string;
  notes?: string;
  lignes: LigneVente[];
  created_at: string;
  updated_at?: string;
}

@Component({
  selector: 'app-ventes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="ventes-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>🛒 Ventes</h1>
          <p class="subtitle">{{ ventes.length }} vente(s) • {{ getVentesImpayees() }} impayée(s) • {{ getMontantTotal() | number }} FCFA total</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="ventes.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="ventes.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouvelle vente</button>
        </div>
      </div>

      <!-- Message de succès -->
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="ventes.length > 0">
        <div class="kpi-card total"><div class="kpi-icon">🛒</div><div class="kpi-content"><span class="kpi-value">{{ ventes.length }}</span><span class="kpi-label">Total ventes</span></div></div>
        <div class="kpi-card montant"><div class="kpi-icon">💰</div><div class="kpi-content"><span class="kpi-value">{{ getMontantTotal() | number }} <small>FCFA</small></span><span class="kpi-label">Chiffre d'affaires</span></div></div>
        <div class="kpi-card encaisse"><div class="kpi-icon">✅</div><div class="kpi-content"><span class="kpi-value">{{ getMontantEncaisse() | number }} <small>FCFA</small></span><span class="kpi-label">Montant encaissé</span></div></div>
        <div class="kpi-card recouvrement"><div class="kpi-icon">📊</div><div class="kpi-content"><span class="kpi-value">{{ getTauxRecouvrement() }}%</span><span class="kpi-label">Taux recouvrement</span></div></div>
        <div class="kpi-card impayees"><div class="kpi-icon">⚠️</div><div class="kpi-content"><span class="kpi-value">{{ getVentesImpayees() }}</span><span class="kpi-label">Ventes impayées</span></div></div>
        <div class="kpi-card mois"><div class="kpi-icon">📅</div><div class="kpi-content"><span class="kpi-value">{{ getVentesMois() }}</span><span class="kpi-label">Ventes ce mois</span></div></div>
      </div>

      <!-- Formulaire moderne avec onglets -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouvelle' }} vente</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveVente()">
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
                    <input type="text" [(ngModel)]="currentVente.reference" name="reference" readonly class="readonly">
                  </div>
                  <div class="form-group">
                    <label>Statut</label>
                    <select [(ngModel)]="currentVente.statut" name="statut" class="statut-select" [class]="currentVente.statut">
                      <option value="en_attente">⏳ En attente</option>
                      <option value="partielle">🔄 Paiement partiel</option>
                      <option value="payee">✅ Payée</option>
                      <option value="annulee">❌ Annulée</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label>Client *</label>
                  <select [(ngModel)]="currentVente.client_id" name="clientId" (change)="onClientChange()" required>
                    <option [ngValue]="null">Sélectionner un client</option>
                    <option *ngFor="let c of clients" [ngValue]="c.id">{{ c.nom }} {{ c.prenom }} - {{ c.email || c.telephone }}</option>
                  </select>
                  <button type="button" class="btn-add-client" (click)="openClientForm()">+ Nouveau client</button>
                </div>
                <div class="client-info" *ngIf="currentVente.client_nom">
                  <div class="info-card">
                    <div class="info-card-header"><span class="info-icon">👤</span><strong>{{ currentVente.client_nom }}</strong></div>
                    <div class="info-card-details"><span *ngIf="currentVente.client_tva">🏷️ TVA: {{ currentVente.client_tva }}</span></div>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>📅 Date de vente</label>
                    <input type="date" [(ngModel)]="currentVente.date_vente" name="dateVente">
                  </div>
                  <div class="form-group">
                    <label>💳 Mode de paiement</label>
                    <select [(ngModel)]="currentVente.mode_paiement" name="modePaiement">
                      <option value="especes">💵 Espèces</option>
                      <option value="carte">💳 Carte</option>
                      <option value="cheque">📝 Chèque</option>
                      <option value="virement">🏦 Virement</option>
                      <option value="mobile_money">📱 Mobile Money</option>
                    </select>
                  </div>
                </div>
                <div class="form-group highlight">
                  <label>💰 Net à payer</label>
                  <input type="text" [value]="(currentVente.net_a_payer || 0) | number:'1.0-0'" name="netAPayer" readonly class="readonly highlight-input">
                </div>
                <div class="form-group">
                  <label>📝 Notes</label>
                  <textarea [(ngModel)]="currentVente.notes" name="notes" rows="2" placeholder="Observations..."></textarea>
                </div>
              </div>

              <!-- Onglet Lignes -->
              <div *ngIf="activeTab === 'lignes'" class="tab-content">
                <div class="lignes-header"><h4>📦 Lignes de vente</h4><button type="button" class="btn-add" (click)="addLigne()">+ Ajouter ligne</button></div>
                <div class="lignes-list" *ngIf="currentVente.lignes && currentVente.lignes.length > 0; else noLignes">
                  <div class="lignes-header-row">
                    <div class="col-designation">Désignation</div><div class="col-quantite">Qté</div><div class="col-prix">Prix unit.</div><div class="col-remise">Remise</div><div class="col-montant">Montant HT</div><div class="col-actions"></div>
                  </div>
                  <div class="lignes-row" *ngFor="let ligne of currentVente.lignes; let i = index">
                    <div class="col-designation">
                      <input type="text" [(ngModel)]="ligne.designation" name="designation{{i}}" (input)="updateLigneMontant(ligne)">
                    </div>
                    <div class="col-quantite">
                      <input type="number" [(ngModel)]="ligne.quantite" name="quantite{{i}}" (input)="updateLigneMontant(ligne)" step="1" min="1">
                    </div>
                    <div class="col-prix">
                      <input type="number" [(ngModel)]="ligne.prix_unitaire" name="prix{{i}}" (input)="updateLigneMontant(ligne)" step="1000">
                    </div>
                    <div class="col-remise">
                      <input type="number" [(ngModel)]="ligne.remise_ligne" name="remise{{i}}" (input)="updateLigneMontant(ligne)" step="5" min="0" max="100">
                    </div>
                    <div class="col-montant"><span class="montant-ligne">{{ ligne.montant_ht | number }} FCFA</span></div>
                    <div class="col-actions"><button type="button" class="remove-ligne" (click)="removeLigne(i)">🗑️</button></div>
                  </div>
                  <div class="lignes-total">
                    <div class="total-row"><span>Sous-total HT:</span><strong>{{ getSousTotalHT() | number }} FCFA</strong></div>
                    <div class="total-row"><span>TVA ({{ currentVente.tva || 0 }}%):</span><strong>{{ getTvaMontant() | number }} FCFA</strong></div>
                    <div class="total-row" *ngIf="currentVente.remise"><span>Remise ({{ currentVente.remise }}%):</span><strong>-{{ getRemiseMontant() | number }} FCFA</strong></div>
                    <div class="total-row grand-total"><span>Net à payer:</span><strong>{{ getNetAPayerFromLignes() | number }} FCFA</strong></div>
                  </div>
                </div>
                <ng-template #noLignes><div class="no-data">Aucune ligne ajoutée</div></ng-template>
              </div>

              <!-- Onglet Paiement -->
              <div *ngIf="activeTab === 'paiement'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>💳 Mode de paiement</label>
                    <select [(ngModel)]="currentVente.mode_paiement" name="modePaiement2">
                      <option value="especes">💵 Espèces</option>
                      <option value="carte">💳 Carte</option>
                      <option value="cheque">📝 Chèque</option>
                      <option value="virement">🏦 Virement</option>
                      <option value="mobile_money">📱 Mobile Money</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>🔖 Référence paiement</label>
                    <input type="text" [(ngModel)]="currentVente.reference_paiement" name="refPaiement" placeholder="Numéro chèque, transaction...">
                  </div>
                </div>
                <div class="form-group" *ngIf="currentVente.statut === 'payee' || currentVente.statut === 'partielle'">
                  <label>📅 Date de paiement</label>
                  <input type="date" [(ngModel)]="currentVente.date_paiement" name="datePaiement">
                </div>
                <div class="payment-summary" *ngIf="currentVente.net_a_payer">
                  <div class="summary-card">
                    <div class="summary-title">Récapitulatif</div>
                    <div class="summary-row"><span>Montant dû:</span><strong>{{ currentVente.net_a_payer | number }} FCFA</strong></div>
                    <div class="summary-row" *ngIf="currentVente.montant_paye"><span>Montant payé:</span><strong>{{ currentVente.montant_paye | number }} FCFA</strong></div>
                    <div class="summary-row" *ngIf="currentVente.statut === 'partielle'"><span>⚠️ Reste à payer:</span><strong>{{ (currentVente.net_a_payer - (currentVente.montant_paye || 0)) | number }} FCFA</strong></div>
                  </div>
                </div>
              </div>

              <div class="modal-actions"><button type="button" class="btn-secondary" (click)="cancelForm()">Annuler</button><button type="submit" class="btn-primary">💾 Enregistrer</button></div>
            </form>
          </div>
        </div>
      </div>

      <!-- Filtres modernes -->
      <div class="filters-section" *ngIf="ventes.length > 0">
        <div class="search-wrapper"><span class="search-icon">🔍</span><input [(ngModel)]="searchTerm" name="searchTerm" (ngModelChange)="filterVentes()" placeholder="Rechercher par référence, client..." class="search-input"></div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" name="statutFilter" (ngModelChange)="filterVentes()" class="filter-select">
            <option value="">📊 Tous statuts</option><option value="en_attente">⏳ En attente</option><option value="partielle">🔄 Partielle</option><option value="payee">✅ Payée</option><option value="annulee">❌ Annulée</option>
          </select>
          <select [(ngModel)]="periodeFilter" name="periodeFilter" (ngModelChange)="filterVentes()" class="filter-select">
            <option value="">📅 Toutes périodes</option><option value="today">Aujourd'hui</option><option value="week">Cette semaine</option><option value="month">Ce mois</option><option value="last_month">Mois dernier</option>
          </select>
        </div>
      </div>

      <!-- Liste des ventes -->
      <div class="ventes-section" *ngIf="ventes.length > 0; else emptyState">
        <div class="section-header"><h2>📋 Liste des ventes</h2><div class="header-stats"><span class="stat-badge">{{ filteredVentes.length }} / {{ ventes.length }} affiché(s)</span></div></div>
        <div class="ventes-grid">
          <div class="vente-card" *ngFor="let v of filteredVentes" [class]="v.statut">
            <div class="card-header">
              <div class="header-left"><div class="vente-icon">🛒</div><div class="vente-info"><div class="vente-ref">{{ v.reference }}</div><div class="vente-client">{{ v.client_nom || 'Client non spécifié' }}</div><div class="vente-date">📅 {{ v.date_vente | date:'dd/MM/yyyy' }}</div></div></div>
              <div class="header-right"><div class="vente-montant">{{ v.net_a_payer | number }} FCFA</div><span class="statut-badge" [class]="v.statut">{{ getStatutLabel(v.statut) }}</span></div>
            </div>
            <div class="card-body">
              <div class="info-row"><span class="info-label">💰 Montant TTC:</span><span class="info-value">{{ v.montant_ttc | number }} FCFA</span></div>
              <div class="info-row" *ngIf="v.mode_paiement"><span class="info-label">💳 Paiement:</span><span class="info-value">{{ getModePaiementLabel(v.mode_paiement) }}</span></div>
              <div class="info-row" *ngIf="v.date_paiement"><span class="info-label">✅ Payé le:</span><span class="info-value">{{ v.date_paiement | date:'dd/MM/yyyy' }}</span></div>
              <div class="info-row"><span class="info-label">📦 Lignes:</span><span class="info-value">{{ v.lignes.length || 0 }} article(s)</span></div>
              <div class="progress-bar" *ngIf="v.statut === 'partielle'"><div class="progress-fill" [style.width.%]="getPourcentagePaye(v)"></div><span class="progress-text">{{ getPourcentagePaye(v) }}% payé</span></div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="viewDetails(v)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="editVente(v)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="duplicateVente(v)" title="Dupliquer">📋</button>
                <button class="action-icon" (click)="imprimerVente(v)" title="Imprimer">🖨️</button>
                <button class="action-icon" (click)="envoyerParEmail(v)" title="Envoyer par email">📧</button>
                <button class="action-icon" (click)="enregistrerPaiement(v)" title="Enregistrer paiement" *ngIf="v.statut !== 'payee' && v.statut !== 'annulee'">💵</button>
                <button class="action-icon delete" (click)="confirmDelete(v)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState><div class="empty-state"><div class="empty-icon">🛒</div><h2>Aucune vente</h2><p>Enregistrez votre première vente</p><button class="btn-primary" (click)="openForm()">+ Nouvelle vente</button></div></ng-template>

      <!-- Modal Détails -->
      <div class="modal-overlay" *ngIf="showDetailsModal && selectedVente">
        <div class="modal-container large">
          <div class="modal-header"><h3>Détails de la vente - {{ selectedVente.reference }}</h3><button class="modal-close" (click)="showDetailsModal = false">✕</button></div>
          <div class="modal-body">
            <div class="details-grid">
              <div class="detail-section"><h4>📋 Informations générales</h4><p><strong>Référence:</strong> {{ selectedVente.reference }}</p><p><strong>Statut:</strong> {{ getStatutLabel(selectedVente.statut) }}</p><p><strong>Date vente:</strong> {{ selectedVente.date_vente | date:'dd/MM/yyyy' }}</p><p><strong>Date paiement:</strong> {{ selectedVente.date_paiement | date:'dd/MM/yyyy' || '-' }}</p></div>
              <div class="detail-section"><h4>👤 Client</h4><p><strong>Nom:</strong> {{ selectedVente.client_nom || '-' }}</p><p><strong>TVA:</strong> {{ selectedVente.client_tva || '-' }}</p></div>
              <div class="detail-section"><h4>💰 Montants</h4><p><strong>Montant HT:</strong> {{ selectedVente.montant_ht | number }} FCFA</p><p><strong>TVA:</strong> {{ selectedVente.tva }}%</p><p><strong>Remise:</strong> {{ selectedVente.remise || 0 }}%</p><p><strong>Net à payer:</strong> <strong class="highlight">{{ selectedVente.net_a_payer | number }} FCFA</strong></p><p *ngIf="selectedVente.montant_paye"><strong>Montant payé:</strong> {{ selectedVente.montant_paye | number }} FCFA</p><p *ngIf="selectedVente.montant_paye && selectedVente.montant_paye < selectedVente.net_a_payer"><strong>Reste à payer:</strong> {{ (selectedVente.net_a_payer - selectedVente.montant_paye) | number }} FCFA</p></div>
              <div class="detail-section"><h4>💳 Paiement</h4><p><strong>Mode:</strong> {{ getModePaiementLabel(selectedVente.mode_paiement) }}</p><p><strong>Référence:</strong> {{ selectedVente.reference_paiement || '-' }}</p></div>
              <div class="detail-section full-width" *ngIf="selectedVente.lignes?.length">
                <h4>📦 Détail des lignes</h4>
                <table class="details-table"><thead><tr><th>Désignation</th><th class="text-center">Qté</th><th class="text-right">Prix unit.</th><th class="text-center">Remise</th><th class="text-right">Montant HT</th></tr></thead>
                <tbody><tr *ngFor="let l of selectedVente.lignes"><td>{{ l.designation }}</td><td class="text-center">{{ l.quantite }}</td><td class="text-right">{{ l.prix_unitaire | number }} FCFA</td><td class="text-center">{{ l.remise_ligne || 0 }}%</td><td class="text-right">{{ l.montant_ht | number }} FCFA</td></tr></tbody>
                <tfoot><tr class="total-row"><td colspan="4" class="text-right"><strong>Sous-total HT:</strong></td><td class="text-right"><strong>{{ getSousTotalHTSum(selectedVente) | number }} FCFA</strong></td></tr>
                <tr class="total-row"><td colspan="4" class="text-right"><strong>TVA ({{ selectedVente.tva }}%):</strong></td><td class="text-right"><strong>{{ getTvaMontantSum(selectedVente) | number }} FCFA</strong></td></tr>
                <tr class="total-row" *ngIf="selectedVente.remise"><td colspan="4" class="text-right"><strong>Remise ({{ selectedVente.remise }}%):</strong></td><td class="text-right"><strong>-{{ getRemiseMontantSum(selectedVente) | number }} FCFA</strong></td></tr>
                <tr class="grand-total-row"><td colspan="4" class="text-right"><strong>Net à payer:</strong></td><td class="text-right"><strong class="highlight">{{ selectedVente.net_a_payer | number }} FCFA</strong></td></tr></tfoot>
               </table>
              </div>
              <div class="detail-section full-width" *ngIf="selectedVente.notes"><h4>📝 Notes</h4><p>{{ selectedVente.notes }}</p></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Paiement -->
      <div class="modal-overlay" *ngIf="showPaymentModal && paymentVente">
        <div class="modal-container small">
          <div class="modal-header"><h3>💵 Enregistrer un paiement</h3><button class="modal-close" (click)="showPaymentModal = false">✕</button></div>
          <div class="modal-body">
            <div class="payment-info"><p><strong>Vente:</strong> {{ paymentVente.reference }}</p><p><strong>Client:</strong> {{ paymentVente.client_nom }}</p><p><strong>Montant total:</strong> {{ paymentVente.net_a_payer | number }} FCFA</p><p *ngIf="paymentVente.montant_paye"><strong>Déjà payé:</strong> {{ paymentVente.montant_paye | number }} FCFA</p><p><strong>Reste à payer:</strong> <strong class="highlight">{{ (paymentVente.net_a_payer - (paymentVente.montant_paye || 0)) | number }} FCFA</strong></p></div>
            <div class="form-group"><label>Montant à encaisser *</label><input type="number" [(ngModel)]="paymentAmount" name="paymentAmount" step="1000" [max]="paymentVente.net_a_payer - (paymentVente.montant_paye || 0)" class="montant-input"></div>
            <div class="form-group"><label>Date de paiement</label><input type="date" [(ngModel)]="paymentDate" name="paymentDate"></div>
            <div class="form-group"><label>Mode de paiement</label><select [(ngModel)]="paymentMode" name="paymentMode"><option value="especes">💵 Espèces</option><option value="carte">💳 Carte</option><option value="cheque">📝 Chèque</option><option value="virement">🏦 Virement</option><option value="mobile_money">📱 Mobile Money</option></select></div>
            <div class="form-group"><label>Référence paiement</label><input type="text" [(ngModel)]="paymentReference" name="paymentReference" placeholder="Numéro chèque, transaction..."></div>
            <div class="modal-actions"><button class="btn-secondary" (click)="showPaymentModal = false">Annuler</button><button class="btn-primary" (click)="savePayment()">💾 Enregistrer paiement</button></div>
          </div>
        </div>
      </div>

      <!-- Modal Client rapide -->
      <div class="modal-overlay" *ngIf="showClientForm">
        <div class="modal-container"><div class="modal-header"><h3>➕ Nouveau client</h3><button class="modal-close" (click)="showClientForm = false">✕</button></div>
        <div class="modal-body">
          <div class="form-group"><label>Nom *</label><input type="text" [(ngModel)]="newClient.nom" name="newClientNom"></div>
          <div class="form-group"><label>Prénom</label><input type="text" [(ngModel)]="newClient.prenom" name="newClientPrenom"></div>
          <div class="form-row"><div class="form-group"><label>Téléphone</label><input type="tel" [(ngModel)]="newClient.telephone" name="newClientTel"></div><div class="form-group"><label>Email</label><input type="email" [(ngModel)]="newClient.email" name="newClientEmail"></div></div>
          <div class="form-group"><label>Adresse</label><input type="text" [(ngModel)]="newClient.adresse" name="newClientAdresse"></div>
          <div class="modal-actions"><button class="btn-secondary" (click)="showClientForm = false">Annuler</button><button class="btn-primary" (click)="saveNewClient()">💾 Ajouter</button></div>
        </div></div>
      </div>

      <!-- Modal Suppression -->
      <div class="modal-overlay" *ngIf="showDeleteModal"><div class="modal-container small"><div class="modal-header"><h3>🗑️ Confirmer la suppression</h3><button class="modal-close" (click)="showDeleteModal = false">✕</button></div><div class="modal-body"><p>Supprimer la vente <strong>{{ venteToDelete?.reference }}</strong> ?</p><p class="warning-text">Cette action est irréversible.</p><div class="modal-actions"><button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button><button class="btn-danger" (click)="deleteVente()">🗑️ Supprimer</button></div></div></div></div>
    </div>
  `,
  styles: [`
    .ventes-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
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
    .kpi-card.mois .kpi-value { color: #EF4444; }
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
    .ventes-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; background: #FEF3F9; color: #EC4899; }
    .ventes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 20px; }
    .vente-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .vente-card.en_attente { border-left-color: #9CA3AF; }
    .vente-card.partielle { border-left-color: #8B5CF6; }
    .vente-card.payee { border-left-color: #10B981; opacity: 0.8; }
    .vente-card.annulee { border-left-color: #EF4444; opacity: 0.7; }
    .vente-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: flex-start; flex: 1; }
    .vente-icon { font-size: 28px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .vente-ref { font-weight: 600; color: #1F2937; margin-bottom: 4px; font-family: monospace; }
    .vente-client { font-size: 13px; color: #6B7280; margin-bottom: 2px; }
    .vente-date { font-size: 11px; color: #9CA3AF; }
    .header-right { text-align: right; }
    .vente-montant { font-weight: 700; color: #EC4899; margin-bottom: 8px; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.en_attente { background: #F3F4F6; color: #6B7280; }
    .statut-badge.partielle { background: #EDE9FE; color: #7C3AED; }
    .statut-badge.payee { background: #DCFCE7; color: #16A34A; }
    .statut-badge.annulee { background: #FEE2E2; color: #EF4444; }
    .card-body { margin: 16px 0; }
    .info-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; font-size: 13px; flex-wrap: wrap; }
    .info-label { color: #6B7280; min-width: 80px; }
    .info-value { font-weight: 500; color: #1F2937; }
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
    @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; gap: 12px; } .kpi-grid { grid-template-columns: repeat(2, 1fr); } .ventes-grid { grid-template-columns: 1fr; } .filter-group { flex-direction: column; } .details-grid { grid-template-columns: 1fr; } .detail-section.full-width { grid-column: span 1; } .lignes-header-row, .lignes-row { grid-template-columns: 1fr 70px 100px 70px 100px 30px; font-size: 12px; } }
  `]
})
export class Ventes implements OnInit {
  ventes: Vente[] = [];
  filteredVentes: Vente[] = [];
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
  selectedVente: Vente | null = null;
  venteToDelete: Vente | null = null;
  paymentVente: Vente | null = null;
  successMessage = '';

  paymentAmount = 0;
  paymentDate = new Date().toISOString().split('T')[0];
  paymentMode = 'especes';
  paymentReference = '';

  newClient: any = { nom: '', prenom: '', telephone: '', email: '', adresse: '' };

  currentVente: Partial<Vente> = {
    reference: '',
    statut: 'en_attente',
    date_vente: new Date().toISOString().split('T')[0],
    montant_ht: 0,
    tva: 18,
    montant_ttc: 0,
    net_a_payer: 0,
    remise: 0,
    montant_paye: 0,
    lignes: []
  };

  ngOnInit() {
    this.loadClients();
    this.loadVentes();
  }

  loadClients() {
    const saved = localStorage.getItem('clients');
    this.clients = saved ? JSON.parse(saved) : [];
  }

  loadVentes() {
    const saved = localStorage.getItem('ventes');
    this.ventes = saved ? JSON.parse(saved) : [];
    this.filteredVentes = [...this.ventes];
  }

  saveVentesToStorage() {
    localStorage.setItem('ventes', JSON.stringify(this.ventes));
  }

  openForm() {
    this.currentVente = {
      reference: this.generateReference(),
      statut: 'en_attente',
      date_vente: new Date().toISOString().split('T')[0],
      montant_ht: 0,
      tva: 18,
      montant_ttc: 0,
      net_a_payer: 0,
      remise: 0,
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
    const count = this.ventes.length + 1;
    return `VEN-${year}${month}-${String(count).padStart(4, '0')}`;
  }

  onClientChange() {
    const client = this.clients.find(c => c.id === this.currentVente.client_id);
    if (client) {
      this.currentVente.client_nom = `${client.nom} ${client.prenom || ''}`;
      this.currentVente.client_tva = client.numero_tva;
    }
  }

  addLigne() {
    if (!this.currentVente.lignes) this.currentVente.lignes = [];
    this.currentVente.lignes.push({
      id: Date.now(),
      designation: '',
      quantite: 1,
      prix_unitaire: 0,
      remise_ligne: 0,
      montant_ht: 0,
      tva: this.currentVente.tva || 18,
      montant_ttc: 0
    });
  }

  removeLigne(index: number) {
    if (this.currentVente.lignes) {
      this.currentVente.lignes.splice(index, 1);
      this.recalculerTotalDepuisLignes();
    }
  }

  updateLigneMontant(ligne: LigneVente) {
    const montantBrut = (ligne.quantite || 0) * (ligne.prix_unitaire || 0);
    const remise = (ligne.remise_ligne || 0) / 100;
    ligne.montant_ht = montantBrut * (1 - remise);
    ligne.montant_ttc = ligne.montant_ht * (1 + (ligne.tva || 18) / 100);
    this.recalculerTotalDepuisLignes();
  }

  recalculerTotalDepuisLignes() {
    const sousTotal = this.getSousTotalHT();
    this.currentVente.montant_ht = sousTotal;
    this.calculerTotal();
  }

  getSousTotalHT(): number {
    if (!this.currentVente.lignes) return 0;
    return this.currentVente.lignes.reduce((sum, l) => sum + (l.montant_ht || 0), 0);
  }

  getTvaMontant(): number {
    return (this.currentVente.montant_ht || 0) * (this.currentVente.tva || 0) / 100;
  }

  getRemiseMontant(): number {
    const totalAvecTva = (this.currentVente.montant_ht || 0) + this.getTvaMontant();
    return totalAvecTva * (this.currentVente.remise || 0) / 100;
  }

  getNetAPayerFromLignes(): number {
    const totalAvecTva = (this.currentVente.montant_ht || 0) + this.getTvaMontant();
    const apresRemise = totalAvecTva - this.getRemiseMontant();
    return apresRemise;
  }

  calculerTotal() {
    const totalAvecTva = (this.currentVente.montant_ht || 0) * (1 + (this.currentVente.tva || 0) / 100);
    const apresRemise = totalAvecTva * (1 - (this.currentVente.remise || 0) / 100);
    this.currentVente.montant_ttc = apresRemise;
    this.currentVente.net_a_payer = apresRemise;
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
    this.currentVente.client_id = newId;
    this.onClientChange();
    this.showClientForm = false;
    this.showSuccess('Client ajouté avec succès');
  }

  saveVente() {
    if (!this.currentVente.client_id) {
      alert('Veuillez sélectionner un client');
      return;
    }
    if (this.editMode && this.currentVente.id) {
      const index = this.ventes.findIndex(v => v.id === this.currentVente.id);
      if (index !== -1) {
        this.ventes[index] = { ...this.currentVente, updated_at: new Date().toISOString() } as Vente;
        this.showSuccess('Vente modifiée');
      }
    } else {
      this.ventes.push({
        ...this.currentVente,
        id: Date.now(),
        created_at: new Date().toISOString()
      } as Vente);
      this.showSuccess('Vente ajoutée');
    }
    this.saveVentesToStorage();
    this.filterVentes();
    this.cancelForm();
  }

  editVente(v: Vente) {
    this.currentVente = { ...v };
    if (!this.currentVente.lignes) this.currentVente.lignes = [];
    if (!this.currentVente.montant_paye) this.currentVente.montant_paye = 0;
    this.editMode = true;
    this.showForm = true;
    this.activeTab = 'info';
  }

  duplicateVente(v: Vente) {
    const newVente = {
      ...v,
      id: undefined,
      reference: this.generateReference(),
      statut: 'en_attente' as const,
      created_at: new Date().toISOString(),
      date_paiement: undefined,
      reference_paiement: undefined,
      montant_paye: 0
    };
    this.ventes.push(newVente);
    this.saveVentesToStorage();
    this.filterVentes();
    this.showSuccess('Vente dupliquée');
  }

  viewDetails(v: Vente) {
    this.selectedVente = v;
    this.showDetailsModal = true;
  }

  private generateTicketHtml(v: Vente): string {
    return `
      <div style="width: 280px; font-family: monospace; font-size: 12px; margin: 0 auto;">
        <div style="text-align: center; font-size: 16px; font-weight: bold;">PULSE BUSINESS</div>
        <div style="text-align: center;">Bamako, Mali</div>
        <div style="text-align: center;">Tel: +223 84 44 94 71</div>
        <hr>
        <div style="text-align: center;">TICKET DE VENTE</div>
        <div>Réf: ${v.reference}</div>
        <div>Date: ${new Date(v.date_vente).toLocaleString()}</div>
        <hr>
        <div style="display: flex; justify-content: space-between;"><span>Article</span><span>Qté</span><span>Prix</span><span>Total</span></div>
        ${(v.lignes || []).map(l => `
          <div style="display: flex; justify-content: space-between;">
            <span>${l.designation}</span>
            <span>${l.quantite}</span>
            <span>${l.prix_unitaire.toLocaleString()}</span>
            <span>${l.montant_ht.toLocaleString()}</span>
          </div>
        `).join('')}
        <hr>
        <div style="display: flex; justify-content: space-between;"><strong>Total HT:</strong><strong>${v.montant_ht.toLocaleString()} FCFA</strong></div>
        <div style="display: flex; justify-content: space-between;"><strong>TVA (${v.tva}%):</strong><strong>${(v.montant_ht * v.tva / 100).toLocaleString()} FCFA</strong></div>
        <div style="display: flex; justify-content: space-between;"><strong>Total TTC:</strong><strong>${v.montant_ttc.toLocaleString()} FCFA</strong></div>
        ${v.montant_paye && v.montant_paye < v.net_a_payer ? `
          <div style="display: flex; justify-content: space-between;"><strong>Montant payé:</strong><strong>${v.montant_paye.toLocaleString()} FCFA</strong></div>
          <div style="display: flex; justify-content: space-between;"><strong>Reste à payer:</strong><strong>${(v.net_a_payer - v.montant_paye).toLocaleString()} FCFA</strong></div>
        ` : ''}
        <hr>
        <div>Mode: ${this.getModePaiementLabel(v.mode_paiement)}</div>
        <div>Client: ${v.client_nom || 'N/A'}</div>
        <hr>
        <div style="text-align: center;">Merci de votre visite !</div>
      </div>
    `;
  }

  async imprimerVente(v: Vente) {
    const html = this.generateTicketHtml(v);
    if (Capacitor.isNativePlatform()) {
      if ((window as any).cordova && (window as any).cordova.plugins && (window as any).cordova.plugins.printer) {
        try {
          (window as any).cordova.plugins.printer.print(html, 'PulseBusiness',
            (res: any) => console.log('Impression réussie', res),
            (err: any) => console.error('Erreur impression', err)
          );
        } catch (error) {
          console.error('Erreur impression', error);
          alert('Impossible d’imprimer. Vérifiez votre imprimante.');
        }
      } else {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.print();
        }
      }
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
      }
    }
  }

  envoyerParEmail(v: Vente) {
    alert(`Envoi par email de la vente ${v.reference}`);
  }

  enregistrerPaiement(v: Vente) {
    this.paymentVente = v;
    const resteAPayer = v.net_a_payer - (v.montant_paye || 0);
    this.paymentAmount = resteAPayer;
    this.paymentDate = new Date().toISOString().split('T')[0];
    this.paymentMode = v.mode_paiement || 'especes';
    this.paymentReference = v.reference_paiement || '';
    this.showPaymentModal = true;
  }

  savePayment() {
    if (this.paymentVente && this.paymentAmount > 0) {
      const nouveauPaye = (this.paymentVente.montant_paye || 0) + this.paymentAmount;
      this.paymentVente.montant_paye = nouveauPaye;
      if (nouveauPaye >= this.paymentVente.net_a_payer) {
        this.paymentVente.statut = 'payee';
        this.paymentVente.date_paiement = this.paymentDate;
      } else {
        this.paymentVente.statut = 'partielle';
      }
      this.paymentVente.mode_paiement = this.paymentMode as any;
      this.paymentVente.reference_paiement = this.paymentReference;
      this.saveVentesToStorage();
      this.filterVentes();
      this.showPaymentModal = false;
      this.showSuccess(`Paiement de ${this.paymentAmount.toLocaleString()} FCFA enregistré`);
    } else {
      alert('Veuillez saisir un montant valide');
    }
  }

  confirmDelete(v: Vente) {
    this.venteToDelete = v;
    this.showDeleteModal = true;
  }

  deleteVente() {
    if (this.venteToDelete) {
      this.ventes = this.ventes.filter(v => v.id !== this.venteToDelete?.id);
      this.saveVentesToStorage();
      this.filterVentes();
      this.showDeleteModal = false;
      this.venteToDelete = null;
      this.showSuccess('Vente supprimée');
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }

  filterVentes() {
    let filtered = [...this.ventes];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(v => v.reference?.toLowerCase().includes(term) || v.client_nom?.toLowerCase().includes(term));
    }
    if (this.statutFilter) filtered = filtered.filter(v => v.statut === this.statutFilter);
    if (this.periodeFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (this.periodeFilter === 'today') filtered = filtered.filter(v => new Date(v.date_vente).toDateString() === today.toDateString());
      else if (this.periodeFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        filtered = filtered.filter(v => new Date(v.date_vente) >= weekAgo);
      } else if (this.periodeFilter === 'month') {
        filtered = filtered.filter(v => new Date(v.date_vente).getMonth() === today.getMonth() && new Date(v.date_vente).getFullYear() === today.getFullYear());
      } else if (this.periodeFilter === 'last_month') {
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        filtered = filtered.filter(v => new Date(v.date_vente).getMonth() === lastMonth.getMonth() && new Date(v.date_vente).getFullYear() === lastMonth.getFullYear());
      }
    }
    this.filteredVentes = filtered;
  }

  getMontantTotal(): number { return this.ventes.reduce((sum, v) => sum + (v.net_a_payer || 0), 0); }
  getMontantEncaisse(): number { return this.ventes.filter(v => v.statut === 'payee').reduce((sum, v) => sum + (v.net_a_payer || 0), 0); }
  getTauxRecouvrement(): number { const total = this.getMontantTotal(); const encaisse = this.getMontantEncaisse(); return total ? Math.round((encaisse / total) * 100) : 0; }
  getVentesImpayees(): number { return this.ventes.filter(v => v.statut === 'en_attente' || v.statut === 'partielle').length; }
  getVentesMois(): number { const now = new Date(); return this.ventes.filter(v => new Date(v.date_vente).getMonth() === now.getMonth() && new Date(v.date_vente).getFullYear() === now.getFullYear()).length; }
  getPourcentagePaye(v: Vente): number { if (!v.net_a_payer) return 0; const paye = v.montant_paye || 0; return Math.min(100, Math.round((paye / v.net_a_payer) * 100)); }
  getSousTotalHTSum(v: Vente): number { if (!v.lignes) return 0; return v.lignes.reduce((sum, l) => sum + (l.montant_ht || 0), 0); }
  getTvaMontantSum(v: Vente): number { return this.getSousTotalHTSum(v) * (v.tva || 0) / 100; }
  getRemiseMontantSum(v: Vente): number { const totalAvecTva = this.getSousTotalHTSum(v) + this.getTvaMontantSum(v); return totalAvecTva * (v.remise || 0) / 100; }
  getStatutLabel(statut: string): string { const labels: any = { en_attente: '⏳ En attente', partielle: '🔄 Paiement partiel', payee: '✅ Payée', annulee: '❌ Annulée' }; return labels[statut] || statut; }
  getModePaiementLabel(mode: string | undefined): string { if (!mode) return '-'; const labels: any = { especes: '💵 Espèces', carte: '💳 Carte', cheque: '📝 Chèque', virement: '🏦 Virement', mobile_money: '📱 Mobile Money' }; return labels[mode] || mode; }

  // Méthodes d'exportation corrigées
  exportToExcel() {
    if (!this.filteredVentes || this.filteredVentes.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }
    const firstItem = this.filteredVentes[0] || {};
    const colonnes = Object.keys(firstItem).filter(k => !['id', 'created_at', 'updated_at'].includes(k));
    const lignes = this.filteredVentes.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ''));
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
    if (!this.filteredVentes || this.filteredVentes.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }
    const firstItem = this.filteredVentes[0] || {};
    const colonnes = Object.keys(firstItem).filter(k => !['id', 'created_at', 'updated_at'].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join('')}</tr>\n</thead>\n<tbody>${this.filteredVentes.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : '-'}</td>`).join('')}</tr>`).join('')}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
    const win = window.open('', '_blank');
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert('Veuillez autoriser les pop-ups pour exporter en PDF'); }
  }

  showSuccess(msg: string) { this.successMessage = msg; setTimeout(() => this.successMessage = '', 3000); }
}