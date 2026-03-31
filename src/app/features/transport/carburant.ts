import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Carburant {
  id?: number;
  code: string;
  type: 'essence' | 'diesel' | 'super' | 'gazole' | 'autre';
  nom: string;
  prix_achat_ht: number;
  prix_vente_ht: number;
  tva: number;
  marge: number;
  stock_actuel: number;
  stock_minimum: number;
  unite: string;
  fournisseur?: string;
  reservoir?: string;
  densite?: number;
  octane?: number;
  cetane?: number;
  couleur?: string;
  notes?: string;
  statut: 'actif' | 'inactif' | 'rupture';
  date_creation: string;
  date_derniere_modification?: string;
}

interface MouvementCarburant {
  id?: number;
  carburant_id: number;
  carburant_nom?: string;
  type: 'approvisionnement' | 'vente' | 'transfert' | 'perte' | 'ajustement';
  date: string;
  quantite: number;
  prix_unitaire: number;
  montant_total: number;
  vehicule_id?: number;
  vehicule_immatriculation?: string;
  chauffeur_id?: number;
  chauffeur_nom?: string;
  kilometrage?: number;
  bon_commande?: string;
  facture?: string;
  notes?: string;
  created_at: string;
}

@Component({
  selector: 'app-carburants',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="carburants-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>⛽ Gestion des carburants</h1>
          <p class="subtitle">{{ carburants.length }} type(s) de carburant • Stock total: {{ getStockTotal() | number }} L</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="carburants.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="carburants.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouveau carburant</button>
          <button class="btn-transaction" (click)="openMouvementForm()" *ngIf="carburants.length > 0">⛽ Mouvement</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="carburants.length > 0">
        <div class="kpi-card total">
          <div class="kpi-icon">⛽</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ carburants.length }}</span>
            <span class="kpi-label">Types de carburant</span>
          </div>
        </div>
        <div class="kpi-card stock">
          <div class="kpi-icon">📦</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getStockTotal() | number }} <small>L</small></span>
            <span class="kpi-label">Stock total</span>
          </div>
        </div>
        <div class="kpi-card valeur">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getValeurStock() | number }} <small>FCFA</small></span>
            <span class="kpi-label">Valeur du stock</span>
          </div>
        </div>
        <div class="kpi-card alerte">
          <div class="kpi-icon">⚠️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getStockBasCount() }}</span>
            <span class="kpi-label">Stock bas</span>
          </div>
        </div>
      </div>

      <!-- Formulaire Carburant moderne -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouveau' }} carburant</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveCarburant()">
              <div class="form-row">
                <div class="form-group">
                  <label>Code *</label>
                  <input type="text" [(ngModel)]="currentCarburant.code" name="code" required>
                </div>
                <div class="form-group">
                  <label>Type *</label>
                  <select [(ngModel)]="currentCarburant.type" name="type" required>
                    <option value="essence">⛽ Essence</option>
                    <option value="diesel">⛽ Diesel</option>
                    <option value="super">⛽ Super</option>
                    <option value="gazole">⛽ Gazole</option>
                    <option value="autre">🛢️ Autre</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input type="text" [(ngModel)]="currentCarburant.nom" name="nom" required>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Prix d'achat HT (FCFA/L)</label>
                  <input type="number" [(ngModel)]="currentCarburant.prix_achat_ht" name="prix_achat_ht" min="0" (input)="calculerMarge()">
                </div>
                <div class="form-group">
                  <label>Prix de vente HT (FCFA/L)</label>
                  <input type="number" [(ngModel)]="currentCarburant.prix_vente_ht" name="prix_vente_ht" min="0" (input)="calculerMarge()">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>TVA (%)</label>
                  <select [(ngModel)]="currentCarburant.tva" name="tva" (change)="calculerMarge()">
                    <option value="0">0%</option>
                    <option value="5.5">5.5%</option>
                    <option value="10">10%</option>
                    <option value="18">18%</option>
                    <option value="20">20%</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Marge (%)</label>
                  <input type="text" [value]="currentCarburant.marge + '%'" disabled class="readonly">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Stock actuel (L)</label>
                  <input type="number" [(ngModel)]="currentCarburant.stock_actuel" name="stock_actuel" min="0">
                </div>
                <div class="form-group">
                  <label>Stock minimum (L)</label>
                  <input type="number" [(ngModel)]="currentCarburant.stock_minimum" name="stock_minimum" min="0">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Réservoir</label>
                  <input type="text" [(ngModel)]="currentCarburant.reservoir" name="reservoir" placeholder="Ex: Réservoir principal">
                </div>
                <div class="form-group">
                  <label>Fournisseur</label>
                  <input type="text" [(ngModel)]="currentCarburant.fournisseur" name="fournisseur">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Densité</label>
                  <input type="number" [(ngModel)]="currentCarburant.densite" name="densite" step="0.001" placeholder="0.75">
                </div>
                <div class="form-group">
                  <label>Indice octane</label>
                  <input type="number" [(ngModel)]="currentCarburant.octane" name="octane" min="0" max="120">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Indice cétane</label>
                  <input type="number" [(ngModel)]="currentCarburant.cetane" name="cetane" min="0" max="100">
                </div>
                <div class="form-group">
                  <label>Couleur</label>
                  <input type="text" [(ngModel)]="currentCarburant.couleur" name="couleur" placeholder="Ex: Vert, Rouge">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Statut</label>
                  <select [(ngModel)]="currentCarburant.statut" name="statut">
                    <option value="actif">✅ Actif</option>
                    <option value="inactif">⏸️ Inactif</option>
                    <option value="rupture">❌ Rupture</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="currentCarburant.notes" name="notes" rows="3"></textarea>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="cancelForm()">Annuler</button>
                <button type="submit" class="btn-primary">💾 Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Formulaire Mouvement Carburant -->
      <div class="modal-overlay" *ngIf="showMouvementForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>⛽ Nouveau mouvement de carburant</h3>
            <button class="modal-close" (click)="closeMouvementForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveMouvement()">
              <div class="form-row">
                <div class="form-group">
                  <label>Carburant *</label>
                  <select [(ngModel)]="currentMouvement.carburant_id" name="carburant_id" required (change)="onCarburantChange()">
                    <option [value]="null">Sélectionner</option>
                    <option *ngFor="let c of carburants" [value]="c.id">{{ c.nom }} ({{ c.type }}) - Stock: {{ c.stock_actuel }} L</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Type de mouvement *</label>
                  <select [(ngModel)]="currentMouvement.type" name="type" required (change)="onTypeChange()">
                    <option value="approvisionnement">📥 Approvisionnement</option>
                    <option value="vente">💰 Vente</option>
                    <option value="transfert">🔄 Transfert</option>
                    <option value="perte">⚠️ Perte</option>
                    <option value="ajustement">⚖️ Ajustement</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Quantité (L) *</label>
                  <input type="number" [(ngModel)]="currentMouvement.quantite" name="quantite" min="0.1" step="0.1" required (input)="calculerTotal()">
                </div>
                <div class="form-group">
                  <label>Prix unitaire (FCFA/L)</label>
                  <input type="number" [(ngModel)]="currentMouvement.prix_unitaire" name="prix_unitaire" min="0" (input)="calculerTotal()">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group highlight">
                  <label>Montant total</label>
                  <input type="number" [(ngModel)]="currentMouvement.montant_total" name="montant_total" readonly class="readonly highlight-input">
                </div>
                <div class="form-group">
                  <label>Date *</label>
                  <input type="datetime-local" [(ngModel)]="currentMouvement.date" name="date" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Véhicule</label>
                  <select [(ngModel)]="currentMouvement.vehicule_id" name="vehicule_id" (change)="onVehiculeChange()">
                    <option [value]="null">Sélectionner</option>
                    <option *ngFor="let v of vehicules" [value]="v.id">{{ v.immatriculation }} - {{ v.marque }} {{ v.modele }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Chauffeur</label>
                  <select [(ngModel)]="currentMouvement.chauffeur_id" name="chauffeur_id" (change)="onChauffeurChange()">
                    <option [value]="null">Sélectionner</option>
                    <option *ngFor="let c of chauffeurs" [value]="c.id">{{ c.nom }} {{ c.prenom }}</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Kilométrage</label>
                  <input type="number" [(ngModel)]="currentMouvement.kilometrage" name="kilometrage" min="0">
                </div>
                <div class="form-group">
                  <label>Bon de commande</label>
                  <input type="text" [(ngModel)]="currentMouvement.bon_commande" name="bon_commande">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Facture</label>
                  <input type="text" [(ngModel)]="currentMouvement.facture" name="facture">
                </div>
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="currentMouvement.notes" name="notes" rows="2"></textarea>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeMouvementForm()">Annuler</button>
                <button type="submit" class="btn-primary">💾 Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Filtres modernes -->
      <div class="filters-section" *ngIf="carburants.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterCarburants()" placeholder="Rechercher par nom, code..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="typeFilter" (ngModelChange)="filterCarburants()" class="filter-select">
            <option value="">Tous types</option>
            <option value="essence">⛽ Essence</option>
            <option value="diesel">⛽ Diesel</option>
            <option value="super">⛽ Super</option>
            <option value="gazole">⛽ Gazole</option>
          </select>
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterCarburants()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="actif">✅ Actif</option>
            <option value="inactif">⏸️ Inactif</option>
            <option value="rupture">❌ Rupture</option>
          </select>
        </div>
      </div>

      <!-- Liste des carburants améliorée -->
      <div class="carburants-section" *ngIf="carburants.length > 0; else emptyState">
        <div class="section-header">
          <h2>⛽ Types de carburant</h2>
          <div class="header-stats">
            <span class="stat-badge total">{{ carburants.length }} types</span>
            <span class="stat-badge stock">{{ getStockTotal() | number }} L</span>
          </div>
        </div>
        
        <div class="carburants-grid">
          <div class="carburant-card" *ngFor="let c of filteredCarburants" [class]="c.statut" [class.low-stock]="c.stock_actuel <= c.stock_minimum && c.statut !== 'rupture'">
            <div class="card-header">
              <div class="header-left">
                <div class="carburant-icon">{{ getTypeIcon(c.type) }}</div>
                <div class="carburant-info">
                  <div class="carburant-nom">{{ c.nom }}</div>
                  <div class="carburant-code">{{ c.code }}</div>
                  <div class="carburant-type">{{ getTypeLabel(c.type) }}</div>
                </div>
              </div>
              <div class="header-right">
                <span class="statut-badge" [class]="c.statut">{{ getStatutLabel(c.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="stock-info">
                <span class="stock-label">📦 Stock:</span>
                <span class="stock-value" [class.low]="c.stock_actuel <= c.stock_minimum">
                  {{ c.stock_actuel }} L
                </span>
                <span class="stock-mini" *ngIf="c.stock_minimum > 0">(min: {{ c.stock_minimum }} L)</span>
              </div>
              <div class="price-info">
                <span class="price-achat">Achat: {{ c.prix_achat_ht | number }} FCFA/L</span>
                <span class="price-vente">Vente: {{ c.prix_vente_ht | number }} FCFA/L</span>
              </div>
              <div class="price-ttc" *ngIf="c.prix_vente_ht > 0">
                <strong>Prix TTC: {{ getPrixTTC(c.prix_vente_ht, c.tva) | number }} FCFA/L</strong>
              </div>
              <div class="alert-min-stock" *ngIf="c.stock_minimum > 0 && c.stock_actuel <= c.stock_minimum">
                ⚠️ Stock bas ! Seuil minimum: {{ c.stock_minimum }} L
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="viewMouvements(c)" title="Voir mouvements">📊</button>
                <button class="action-icon" (click)="editCarburant(c)" title="Modifier">✏️</button>
                <button class="action-icon delete" (click)="confirmDelete(c)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section mouvements -->
      <div class="mouvements-section" *ngIf="selectedCarburant">
        <div class="section-header">
          <h3>📋 Mouvements - {{ selectedCarburant.nom }}</h3>
          <button class="close-btn" (click)="selectedCarburant = null">✕</button>
        </div>
        <div class="mouvements-list" *ngIf="getMouvementsForCarburant(selectedCarburant.id!).length > 0; else noMouvements">
          <div class="mouvement-card" *ngFor="let m of getMouvementsForCarburant(selectedCarburant.id!)" [class]="m.type">
            <div class="card-header">
              <div class="header-left">
                <div class="mouvement-icon">{{ getMouvementIcon(m.type) }}</div>
                <div class="mouvement-info">
                  <div class="mouvement-type">{{ getMouvementTypeLabel(m.type) }}</div>
                  <div class="mouvement-date">{{ m.date | date:'dd/MM/yyyy HH:mm' }}</div>
                </div>
              </div>
              <div class="header-right">
                <div class="mouvement-quantite" [class]="m.type">
                  {{ m.type === 'approvisionnement' ? '+' : '-' }}{{ m.quantite }} L
                </div>
                <div class="mouvement-montant">{{ m.montant_total | number }} FCFA</div>
              </div>
            </div>
            <div class="card-body" *ngIf="m.vehicule_immatriculation || m.chauffeur_nom">
              <span *ngIf="m.vehicule_immatriculation">🚛 {{ m.vehicule_immatriculation }}</span>
              <span *ngIf="m.chauffeur_nom">👤 {{ m.chauffeur_nom }}</span>
              <span *ngIf="m.kilometrage">📊 {{ m.kilometrage }} km</span>
            </div>
            <div class="card-footer" *ngIf="m.notes">
              <span class="notes">{{ m.notes }}</span>
            </div>
          </div>
        </div>
        <ng-template #noMouvements>
          <div class="empty-mouvements">
            <p>Aucun mouvement pour ce carburant</p>
          </div>
        </ng-template>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">⛽</div>
          <h2>Aucun carburant</h2>
          <p>Ajoutez votre premier type de carburant</p>
          <button class="btn-primary" (click)="openForm()">+ Nouveau carburant</button>
        </div>
      </ng-template>

      <!-- Modal Suppression -->
      <div class="modal-overlay" *ngIf="showDeleteModal">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>🗑️ Confirmer la suppression</h3>
            <button class="modal-close" (click)="showDeleteModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p>Supprimer le carburant <strong>{{ carburantToDelete?.nom }}</strong> ?</p>
            <div class="alert-warning" *ngIf="getMouvementsCount(carburantToDelete?.id) > 0">
              ⚠️ Ce carburant a {{ getMouvementsCount(carburantToDelete?.id) }} mouvement(s) associé(s).
            </div>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteCarburant()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .carburants-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-add:hover, .btn-primary:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
    .btn-transaction { background: #F59E0B; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
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
    .kpi-card.stock .kpi-value { color: #3B82F6; }
    .kpi-card.valeur .kpi-value { color: #10B981; }
    .kpi-card.alerte .kpi-value { color: #F59E0B; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 600px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
    .modal-container.large { max-width: 800px; }
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
    .highlight-input { background: #FEF3F9; color: #EC4899; font-weight: 600; }
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
    
    .carburants-section { background: white; border-radius: 16px; padding: 20px; margin-bottom: 24px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2, .section-header h3 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .stat-badge.total { background: #FEF3F9; color: #EC4899; }
    .stat-badge.stock { background: #E0E7FF; color: #4F46E5; }
    
    .carburants-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .carburant-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .carburant-card.actif { border-left-color: #10B981; }
    .carburant-card.inactif { border-left-color: #9CA3AF; opacity: 0.7; }
    .carburant-card.rupture { border-left-color: #EF4444; background: #FEF2F2; }
    .carburant-card.low-stock { background: #FEF3C7; }
    .carburant-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; flex: 1; }
    .carburant-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .carburant-nom { font-weight: 600; color: #1F2937; margin-bottom: 4px; }
    .carburant-code { font-size: 11px; color: #9CA3AF; font-family: monospace; }
    .carburant-type { font-size: 11px; background: #FEF3F9; padding: 2px 8px; border-radius: 20px; color: #EC4899; display: inline-block; margin-top: 4px; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.actif { background: #DCFCE7; color: #16A34A; }
    .statut-badge.inactif { background: #F3F4F6; color: #6B7280; }
    .statut-badge.rupture { background: #FEE2E2; color: #EF4444; }
    .card-body { margin: 16px 0; }
    .stock-info { margin-bottom: 8px; font-size: 14px; }
    .stock-value.low { color: #EF4444; font-weight: 600; }
    .stock-mini { font-size: 11px; color: #9CA3AF; margin-left: 5px; }
    .price-info { display: flex; gap: 16px; margin-bottom: 8px; font-size: 13px; }
    .price-achat { color: #6B7280; }
    .price-vente { color: #EC4899; font-weight: 500; }
    .price-ttc { font-size: 14px; font-weight: 600; color: #10B981; margin-bottom: 8px; }
    .alert-min-stock { background: #FEF3C7; color: #D97706; padding: 6px 12px; border-radius: 8px; font-size: 12px; margin-top: 8px; text-align: center; }
    .card-footer { display: flex; justify-content: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid #F3F4F6; }
    .footer-actions { display: flex; gap: 8px; }
    .action-icon { background: none; border: 1px solid #FCE7F3; border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: all 0.2s; font-size: 14px; }
    .action-icon:hover { background: #FEF3F9; border-color: #EC4899; }
    .action-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    
    .mouvements-section { background: white; border-radius: 16px; padding: 20px; margin-top: 24px; }
    .close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #9CA3AF; }
    .mouvements-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
    .mouvement-card { background: #F9FAFB; border-radius: 12px; padding: 16px; transition: all 0.2s; border-left: 4px solid transparent; }
    .mouvement-card.approvisionnement { border-left-color: #10B981; }
    .mouvement-card.vente { border-left-color: #EC4899; }
    .mouvement-card.transfert { border-left-color: #3B82F6; }
    .mouvement-card.perte { border-left-color: #EF4444; }
    .mouvement-card.ajustement { border-left-color: #F59E0B; }
    .mouvement-card:hover { transform: translateX(4px); }
    .mouvement-card .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .header-left { display: flex; gap: 12px; align-items: center; }
    .mouvement-icon { font-size: 24px; }
    .mouvement-type { font-weight: 600; color: #1F2937; }
    .mouvement-date { font-size: 11px; color: #9CA3AF; }
    .header-right { text-align: right; }
    .mouvement-quantite { font-size: 18px; font-weight: 700; }
    .mouvement-quantite.approvisionnement { color: #10B981; }
    .mouvement-quantite.vente, .mouvement-quantite.perte { color: #EF4444; }
    .mouvement-montant { font-size: 13px; color: #6B7280; }
    .mouvement-card .card-body { display: flex; gap: 16px; font-size: 12px; color: #6B7280; margin-top: 8px; flex-wrap: wrap; }
    .mouvement-card .card-footer { margin-top: 8px; font-size: 11px; color: #9CA3AF; font-style: italic; }
    .empty-mouvements { text-align: center; padding: 40px; color: #9CA3AF; }
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; gap: 12px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .carburants-grid { grid-template-columns: 1fr; }
      .price-info { flex-direction: column; gap: 4px; }
    }
  `]
})
export class Carburants implements OnInit {
  carburants: Carburant[] = [];
  filteredCarburants: Carburant[] = [];
  mouvements: MouvementCarburant[] = [];
  selectedCarburant: Carburant | null = null;
  
  vehicules: any[] = [];
  chauffeurs: any[] = [];
  
  currentCarburant: Partial<Carburant> = {
    code: '',
    type: 'diesel',
    nom: '',
    prix_achat_ht: 0,
    prix_vente_ht: 0,
    tva: 18,
    marge: 0,
    stock_actuel: 0,
    stock_minimum: 0,
    unite: 'L',
    statut: 'actif',
    date_creation: new Date().toISOString().split('T')[0]
  };
  
  currentMouvement: Partial<MouvementCarburant> = {
    type: 'approvisionnement',
    date: new Date().toISOString().slice(0, 16),
    quantite: 0,
    prix_unitaire: 0,
    montant_total: 0,
    created_at: new Date().toISOString()
  };
  
  searchTerm = '';
  typeFilter = '';
  statutFilter = '';
  showForm = false;
  showMouvementForm = false;
  editMode = false;
  showDeleteModal = false;
  carburantToDelete: Carburant | null = null;
  successMessage = '';
  
  ngOnInit() {
    this.loadVehicules();
    this.loadChauffeurs();
    this.loadCarburants();
    this.loadMouvements();
  }
  
  openForm() {
    this.currentCarburant = {
      code: this.generateCode(),
      type: 'diesel',
      nom: '',
      prix_achat_ht: 0,
      prix_vente_ht: 0,
      tva: 18,
      marge: 0,
      stock_actuel: 0,
      stock_minimum: 0,
      unite: 'L',
      statut: 'actif',
      date_creation: new Date().toISOString().split('T')[0]
    };
    this.editMode = false;
    this.showForm = true;
  }
  
  openMouvementForm() {
    this.currentMouvement = {
      type: 'approvisionnement',
      date: new Date().toISOString().slice(0, 16),
      quantite: 0,
      prix_unitaire: 0,
      montant_total: 0,
      created_at: new Date().toISOString()
    };
    this.showMouvementForm = true;
  }
  
  closeMouvementForm() {
    this.showMouvementForm = false;
  }
  
  generateCode(): string {
    const count = this.carburants.length + 1;
    return `CARB-${String(count).padStart(3, '0')}`;
  }
  
  loadVehicules() {
    const saved = localStorage.getItem('vehicules');
    this.vehicules = saved ? JSON.parse(saved) : [];
  }
  
  loadChauffeurs() {
    const saved = localStorage.getItem('chauffeurs');
    this.chauffeurs = saved ? JSON.parse(saved) : [];
  }
  
  loadCarburants() {
    const saved = localStorage.getItem('carburants');
    this.carburants = saved ? JSON.parse(saved) : [];
    this.filteredCarburants = [...this.carburants];
  }
  
  loadMouvements() {
    const saved = localStorage.getItem('mouvements_carburant');
    this.mouvements = saved ? JSON.parse(saved) : [];
  }
  
  saveCarburants() {
    localStorage.setItem('carburants', JSON.stringify(this.carburants));
  }
  
  saveMouvements() {
    localStorage.setItem('mouvements_carburant', JSON.stringify(this.mouvements));
  }
  
  calculerMarge() {
    const prixAchat = this.currentCarburant.prix_achat_ht || 0;
    const prixVente = this.currentCarburant.prix_vente_ht || 0;
    if (prixAchat > 0 && prixVente > 0) {
      const margeBrute = prixVente - prixAchat;
      this.currentCarburant.marge = Math.round((margeBrute / prixVente) * 100);
    } else {
      this.currentCarburant.marge = 0;
    }
  }
  
  calculerTotal() {
    const quantite = this.currentMouvement.quantite || 0;
    const prixUnitaire = this.currentMouvement.prix_unitaire || 0;
    this.currentMouvement.montant_total = quantite * prixUnitaire;
  }
  
  getPrixTTC(prixHT: number, tva: number): number {
    return prixHT * (1 + tva / 100);
  }
  
  getStockTotal(): number {
    return this.carburants.reduce((total, c) => total + (c.stock_actuel || 0), 0);
  }
  
  getValeurStock(): number {
    return this.carburants.reduce((total, c) => total + ((c.stock_actuel || 0) * (c.prix_achat_ht || 0)), 0);
  }
  
  getStockBasCount(): number {
    return this.carburants.filter(c => (c.stock_actuel || 0) <= (c.stock_minimum || 0) && c.statut !== 'rupture').length;
  }
  
  getTypeIcon(type: string): string {
    const icons: any = {
      essence: '⛽',
      diesel: '🛢️',
      super: '⛽',
      gazole: '🛢️',
      autre: '🧪'
    };
    return icons[type] || '⛽';
  }
  
  getTypeLabel(type: string): string {
    const labels: any = {
      essence: 'Essence',
      diesel: 'Diesel',
      super: 'Super',
      gazole: 'Gazole',
      autre: 'Autre'
    };
    return labels[type] || type;
  }
  
  getStatutLabel(statut: string): string {
    const labels: any = {
      actif: '✅ Actif',
      inactif: '⏸️ Inactif',
      rupture: '❌ Rupture'
    };
    return labels[statut] || statut;
  }
  
  getMouvementIcon(type: string): string {
    const icons: any = {
      approvisionnement: '📥',
      vente: '💰',
      transfert: '🔄',
      perte: '⚠️',
      ajustement: '⚖️'
    };
    return icons[type] || '📊';
  }
  
  getMouvementTypeLabel(type: string): string {
    const labels: any = {
      approvisionnement: 'Approvisionnement',
      vente: 'Vente',
      transfert: 'Transfert',
      perte: 'Perte',
      ajustement: 'Ajustement'
    };
    return labels[type] || type;
  }
  
  onCarburantChange() {
    const carburant = this.carburants.find(c => c.id === this.currentMouvement.carburant_id);
    if (carburant) {
      this.currentMouvement.prix_unitaire = carburant.prix_achat_ht;
      this.calculerTotal();
    }
  }
  
  onTypeChange() {}
  
  onVehiculeChange() {
    const vehicule = this.vehicules.find(v => v.id === this.currentMouvement.vehicule_id);
    if (vehicule) {
      this.currentMouvement.vehicule_immatriculation = vehicule.immatriculation;
    }
  }
  
  onChauffeurChange() {
    const chauffeur = this.chauffeurs.find(c => c.id === this.currentMouvement.chauffeur_id);
    if (chauffeur) {
      this.currentMouvement.chauffeur_nom = `${chauffeur.nom} ${chauffeur.prenom}`;
    }
  }
  
  saveCarburant() {
    if (this.editMode && this.currentCarburant.id) {
      const index = this.carburants.findIndex(c => c.id === this.currentCarburant.id);
      if (index !== -1) {
        this.currentCarburant.date_derniere_modification = new Date().toISOString().split('T')[0];
        this.carburants[index] = { ...this.currentCarburant } as Carburant;
        this.showSuccess('Carburant modifié');
      }
    } else {
      const newCarburant = { ...this.currentCarburant, id: Date.now() } as Carburant;
      this.carburants.push(newCarburant);
      this.showSuccess('Carburant ajouté');
    }
    this.saveCarburants();
    this.filterCarburants();
    this.cancelForm();
  }
  
  saveMouvement() {
    const carburant = this.carburants.find(c => c.id === this.currentMouvement.carburant_id);
    if (!carburant) {
      this.showSuccess('Veuillez sélectionner un carburant');
      return;
    }
    
    const type = this.currentMouvement.type;
    if (type !== 'approvisionnement' && type !== 'ajustement') {
      if ((carburant.stock_actuel || 0) < (this.currentMouvement.quantite || 0)) {
        this.showSuccess('Stock insuffisant');
        return;
      }
    }
    
    const index = this.carburants.findIndex(c => c.id === carburant.id);
    if (index !== -1) {
      switch(type) {
        case 'approvisionnement':
          this.carburants[index].stock_actuel = (this.carburants[index].stock_actuel || 0) + (this.currentMouvement.quantite || 0);
          break;
        case 'ajustement':
          this.carburants[index].stock_actuel = this.currentMouvement.quantite || 0;
          break;
        default:
          this.carburants[index].stock_actuel = (this.carburants[index].stock_actuel || 0) - (this.currentMouvement.quantite || 0);
      }
      
      if (this.carburants[index].stock_actuel <= 0) {
        this.carburants[index].statut = 'rupture';
      } else if (this.carburants[index].stock_actuel <= this.carburants[index].stock_minimum) {
        this.carburants[index].statut = 'actif';
      }
    }
    
    const newMouvement = { 
      ...this.currentMouvement, 
      id: Date.now(),
      carburant_nom: carburant.nom,
      created_at: new Date().toISOString()
    } as MouvementCarburant;
    this.mouvements.push(newMouvement);
    
    this.saveCarburants();
    this.saveMouvements();
    this.filterCarburants();
    this.closeMouvementForm();
    this.showSuccess('Mouvement enregistré');
  }
  
  editCarburant(c: Carburant) {
    this.currentCarburant = { ...c };
    this.editMode = true;
    this.showForm = true;
  }
  
  viewMouvements(c: Carburant) {
    this.selectedCarburant = c;
  }
  
  getMouvementsForCarburant(carburantId: number): MouvementCarburant[] {
    return this.mouvements
      .filter(m => m.carburant_id === carburantId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }
  
  getMouvementsCount(carburantId?: number): number {
    if (!carburantId) return 0;
    return this.mouvements.filter(m => m.carburant_id === carburantId).length;
  }
  
  confirmDelete(c: Carburant) {
    this.carburantToDelete = c;
    this.showDeleteModal = true;
  }
  
  deleteCarburant() {
    if (this.carburantToDelete) {
      this.carburants = this.carburants.filter(c => c.id !== this.carburantToDelete?.id);
      this.mouvements = this.mouvements.filter(m => m.carburant_id !== this.carburantToDelete?.id);
      this.saveCarburants();
      this.saveMouvements();
      this.filterCarburants();
      this.showDeleteModal = false;
      this.carburantToDelete = null;
      this.showSuccess('Carburant supprimé');
    }
  }
  
  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }
  
  filterCarburants() {
    let filtered = this.carburants;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.nom?.toLowerCase().includes(term) ||
        c.code?.toLowerCase().includes(term) ||
        c.type?.toLowerCase().includes(term)
      );
    }
    
    if (this.typeFilter) {
      filtered = filtered.filter(c => c.type === this.typeFilter);
    }
    
    if (this.statutFilter) {
      filtered = filtered.filter(c => c.statut === this.statutFilter);
    }
    
    this.filteredCarburants = filtered;
  }
  
    exportToExcel() {
    if (!this.filteredCarburants || this.filteredCarburants.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredCarburants[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const lignes = this.filteredCarburants.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ""));
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
    if (!this.filteredCarburants || this.filteredCarburants.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredCarburants[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join("")}</tr>\n</thead>\n<tbody>${this.filteredCarburants.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : "-"}</td>`).join("")}</tr>`).join("")}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert("Veuillez autoriser les pop-ups pour exporter en PDF"); }
  }
  
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}