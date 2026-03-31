import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Contrat {
  id?: number;
  reference: string;
  titre: string;
  type: 'prestation' | 'transport' | 'fourniture' | 'maintenance' | 'consulting';
  client_id: number;
  client_nom?: string;
  client_contact?: string;
  client_email?: string;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  date_debut: string;
  date_fin: string;
  date_signature?: string;
  duree_mois: number;
  statut: 'brouillon' | 'en_cours' | 'suspendu' | 'termine' | 'annule';
  renouvellement_auto: boolean;
  preavis_jours: number;
  conditions_paiement: string;
  echeance_paiement: number;
  penalites_retard?: number;
  documents: ContratDocument[];
  historique?: ContratHistorique[];
  notes?: string;
  created_at: string;
  updated_at?: string;
}

interface ContratDocument {
  id?: number;
  nom: string;
  type: string;
  url: string;
  date_upload: string;
}

interface ContratHistorique {
  id?: number;
  date: string;
  action: string;
  utilisateur: string;
  details: string;
}

@Component({
  selector: 'app-contrats',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="contrats-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>📑 Contrats & Conventions</h1>
          <p class="subtitle">{{ contrats.length }} contrat(s) • {{ getContratsActifs() }} actif(s) • {{ getMontantTotal() | number }} FCFA</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="contrats.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="contrats.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouveau contrat</button>
        </div>
      </div>

      <!-- Message de succès -->
      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="contrats.length > 0">
        <div class="kpi-card total">
          <div class="kpi-icon">📑</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ contrats.length }}</span>
            <span class="kpi-label">Total contrats</span>
          </div>
        </div>
        <div class="kpi-card actifs">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getContratsActifs() }}</span>
            <span class="kpi-label">Contrats actifs</span>
          </div>
        </div>
        <div class="kpi-card montant">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getMontantTotal() | number }} <small>FCFA</small></span>
            <span class="kpi-label">Valeur totale</span>
          </div>
        </div>
        <div class="kpi-card expirant">
          <div class="kpi-icon">⏰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getContratsExpirant() }}</span>
            <span class="kpi-label">Expire bientôt</span>
          </div>
        </div>
        <div class="kpi-card duree">
          <div class="kpi-icon">📅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getDureeMoyenne() }} mois</span>
            <span class="kpi-label">Durée moyenne</span>
          </div>
        </div>
        <div class="kpi-card clients">
          <div class="kpi-icon">👥</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getClientsUniques() }}</span>
            <span class="kpi-label">Clients uniques</span>
          </div>
        </div>
      </div>

      <!-- Formulaire moderne avec onglets -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouveau' }} contrat</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveContrat()">
              <div class="tabs">
                <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">📋 Informations</button>
                <button type="button" [class.active]="activeTab === 'details'" (click)="activeTab = 'details'">⚙️ Détails</button>
                <button type="button" [class.active]="activeTab === 'financier'" (click)="activeTab = 'financier'">💰 Financier</button>
                <button type="button" [class.active]="activeTab === 'documents'" (click)="activeTab = 'documents'">📎 Documents</button>
              </div>

              <!-- Onglet Informations -->
              <div *ngIf="activeTab === 'info'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>Référence *</label>
                    <input type="text" [(ngModel)]="currentContrat.reference" readonly class="readonly">
                  </div>
                  <div class="form-group">
                    <label>Titre du contrat *</label>
                    <input type="text" [(ngModel)]="currentContrat.titre" required placeholder="Ex: Contrat de transport 2024">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Type de contrat</label>
                    <select [(ngModel)]="currentContrat.type">
                      <option value="prestation">📋 Prestation de services</option>
                      <option value="transport">🚛 Transport</option>
                      <option value="fourniture">📦 Fourniture de biens</option>
                      <option value="maintenance">🔧 Maintenance</option>
                      <option value="consulting">💡 Consulting</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Statut</label>
                    <select [(ngModel)]="currentContrat.statut" class="statut-select" [class]="currentContrat.statut">
                      <option value="brouillon">📝 Brouillon</option>
                      <option value="en_cours">✅ En cours</option>
                      <option value="suspendu">⏸️ Suspendu</option>
                      <option value="termine">🏁 Terminé</option>
                      <option value="annule">❌ Annulé</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>📅 Date de début</label>
                    <input type="date" [(ngModel)]="currentContrat.date_debut" (change)="calculerDuree()">
                  </div>
                  <div class="form-group">
                    <label>📅 Date de fin</label>
                    <input type="date" [(ngModel)]="currentContrat.date_fin" (change)="calculerDuree()">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>📝 Date de signature</label>
                    <input type="date" [(ngModel)]="currentContrat.date_signature">
                  </div>
                  <div class="form-group">
                    <label>⏱️ Durée (mois)</label>
                    <input type="number" [(ngModel)]="currentContrat.duree_mois" readonly class="readonly">
                  </div>
                </div>
                <div class="form-group">
                  <label>📝 Notes / Clauses particulières</label>
                  <textarea [(ngModel)]="currentContrat.notes" rows="3" placeholder="Clauses particulières, conditions spécifiques..."></textarea>
                </div>
              </div>

              <!-- Onglet Détails -->
              <div *ngIf="activeTab === 'details'" class="tab-content">
                <div class="form-group">
                  <label>Client *</label>
                  <select [(ngModel)]="currentContrat.client_id" (change)="onClientChange()" class="client-select">
                    <option [ngValue]="null">Sélectionner un client</option>
                    <option *ngFor="let c of clients" [ngValue]="c.id">
                      {{ c.nom }} {{ c.prenom }} - {{ c.email || c.telephone }}
                    </option>
                  </select>
                  <button type="button" class="btn-add-client" (click)="openClientForm()">+ Nouveau client</button>
                </div>
                <div class="client-info" *ngIf="currentContrat.client_nom">
                  <div class="info-card">
                    <div class="info-card-header">
                      <span class="info-icon">👤</span>
                      <strong>{{ currentContrat.client_nom }}</strong>
                    </div>
                    <div class="info-card-details">
                      <span *ngIf="currentContrat.client_contact">📞 {{ currentContrat.client_contact }}</span>
                      <span *ngIf="currentContrat.client_email">✉️ {{ currentContrat.client_email }}</span>
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>🔄 Renouvellement automatique</label>
                    <select [(ngModel)]="currentContrat.renouvellement_auto">
                      <option [ngValue]="true">✅ Oui</option>
                      <option [ngValue]="false">❌ Non</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>⏰ Préavis (jours)</label>
                    <input type="number" [(ngModel)]="currentContrat.preavis_jours" min="0" step="15">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>⚖️ Pénalités de retard (%)</label>
                    <input type="number" [(ngModel)]="currentContrat.penalites_retard" step="0.5" min="0" max="20">
                  </div>
                  <div class="form-group">
                    <label>📆 Échéance de paiement (jours)</label>
                    <input type="number" [(ngModel)]="currentContrat.echeance_paiement" min="0" step="5">
                  </div>
                </div>
                <div class="form-group">
                  <label>💰 Conditions de paiement</label>
                  <textarea [(ngModel)]="currentContrat.conditions_paiement" rows="2" placeholder="Ex: 30% à la signature, 70% à livraison..."></textarea>
                </div>
              </div>

              <!-- Onglet Financier -->
              <div *ngIf="activeTab === 'financier'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>💰 Montant HT</label>
                    <input type="number" [(ngModel)]="currentContrat.montant_ht" (input)="calculerTotal()" step="100000" class="montant-input">
                  </div>
                  <div class="form-group">
                    <label>TVA (%)</label>
                    <input type="number" [(ngModel)]="currentContrat.tva" (input)="calculerTotal()" step="1">
                  </div>
                </div>
                <div class="form-group highlight">
                  <label>💰 Montant TTC</label>
                  <input type="text" [value]="(currentContrat.montant_ttc || 0) | number:'1.0-0'" readonly class="readonly highlight-input">
                </div>
                
                <div class="financial-summary" *ngIf="currentContrat.montant_ttc">
                  <div class="summary-card">
                    <div class="summary-title">Récapitulatif financier</div>
                    <div class="summary-row">
                      <span>Montant mensuel estimé:</span>
                      <strong>{{ getMontantMensuel() | number }} FCFA</strong>
                    </div>
                    <div class="summary-row">
                      <span>Montant journalier estimé:</span>
                      <strong>{{ getMontantJournalier() | number }} FCFA</strong>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Onglet Documents -->
              <div *ngIf="activeTab === 'documents'" class="tab-content">
                <div class="documents-header">
                  <h4>📎 Documents contractuels</h4>
                  <button type="button" class="btn-add-doc" (click)="addDocument()">+ Ajouter document</button>
                </div>
                <div class="documents-list" *ngIf="currentContrat.documents && currentContrat.documents.length > 0; else noDocs">
                  <div class="doc-item" *ngFor="let doc of currentContrat.documents; let i = index">
                    <div class="doc-icon">📄</div>
                    <div class="doc-info">
                      <div class="doc-name">{{ doc.nom }}</div>
                      <div class="doc-type">{{ doc.type }}</div>
                      <div class="doc-date">{{ doc.date_upload | date:'dd/MM/yyyy' }}</div>
                    </div>
                    <div class="doc-actions">
                      <button type="button" class="doc-action" (click)="viewDocument(doc)" title="Voir">👁️</button>
                      <button type="button" class="doc-action" (click)="removeDocument(i)" title="Supprimer">🗑️</button>
                    </div>
                  </div>
                </div>
                <ng-template #noDocs>
                  <div class="no-documents">
                    <p>Aucun document joint</p>
                    <button type="button" class="btn-add-doc" (click)="addDocument()">+ Ajouter un document</button>
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
      <div class="filters-section" *ngIf="contrats.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterContrats()" placeholder="Rechercher par référence, titre, client..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterContrats()" class="filter-select">
            <option value="">📊 Tous statuts</option>
            <option value="brouillon">📝 Brouillon</option>
            <option value="en_cours">✅ En cours</option>
            <option value="suspendu">⏸️ Suspendu</option>
            <option value="termine">🏁 Terminé</option>
            <option value="annule">❌ Annulé</option>
          </select>
          <select [(ngModel)]="typeFilter" (ngModelChange)="filterContrats()" class="filter-select">
            <option value="">📋 Tous types</option>
            <option value="prestation">Prestation</option>
            <option value="transport">Transport</option>
            <option value="fourniture">Fourniture</option>
            <option value="maintenance">Maintenance</option>
            <option value="consulting">Consulting</option>
          </select>
        </div>
      </div>

      <!-- Liste des contrats améliorée -->
      <div class="contrats-section" *ngIf="contrats.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Liste des contrats</h2>
          <div class="header-stats">
            <span class="stat-badge total">{{ filteredContrats.length }} / {{ contrats.length }} affiché(s)</span>
            <span class="stat-badge montant">{{ getMontantFiltre() | number }} FCFA</span>
          </div>
        </div>
        
        <div class="contrats-grid">
          <div class="contrat-card" *ngFor="let c of filteredContrats" [class]="c.statut">
            <div class="card-header">
              <div class="header-left">
                <div class="contrat-icon">{{ getTypeIcon(c.type) }}</div>
                <div class="contrat-info">
                  <div class="contrat-ref">{{ c.reference }}</div>
                  <div class="contrat-titre">{{ c.titre }}</div>
                  <div class="contrat-client">{{ c.client_nom || 'Client non spécifié' }}</div>
                </div>
              </div>
              <div class="header-right">
                <div class="contrat-montant">{{ c.montant_ttc | number }} FCFA</div>
                <span class="statut-badge" [class]="c.statut">{{ getStatutLabel(c.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">📅 Période:</span>
                <span class="info-value">{{ c.date_debut | date:'dd/MM/yyyy' }} → {{ c.date_fin | date:'dd/MM/yyyy' }}</span>
                <span *ngIf="isExpiringSoon(c)" class="warning-badge">⚠️ Expire bientôt</span>
              </div>
              <div class="info-row">
                <span class="info-label">⏱️ Durée:</span>
                <span class="info-value">{{ c.duree_mois }} mois</span>
              </div>
              <div class="info-row" *ngIf="c.renouvellement_auto">
                <span class="info-label">🔄 Renouvellement:</span>
                <span class="info-value">Auto (préavis {{ c.preavis_jours }}j)</span>
              </div>
              <div class="progress-bar" *ngIf="getProgression(c) > 0">
                <div class="progress-fill" [style.width.%]="getProgression(c)"></div>
                <span class="progress-text">{{ getProgression(c) }}% complété</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="viewDetails(c)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="editContrat(c)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="duplicateContrat(c)" title="Dupliquer">📋</button>
                <button class="action-icon" (click)="renewContrat(c)" *ngIf="c.statut === 'en_cours'" title="Renouveler">🔄</button>
                <button class="action-icon delete" (click)="confirmDelete(c)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📑</div>
          <h2>Aucun contrat</h2>
          <p>Créez votre premier contrat</p>
          <button class="btn-primary" (click)="openForm()">+ Nouveau contrat</button>
        </div>
      </ng-template>

      <!-- Modal Détails -->
      <div class="modal-overlay" *ngIf="showDetailsModal">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>Détails du contrat - {{ selectedContrat?.reference }}</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedContrat">
            <div class="details-grid">
              <div class="detail-section">
                <h4>📋 Informations générales</h4>
                <p><strong>Référence:</strong> {{ selectedContrat.reference }}</p>
                <p><strong>Titre:</strong> {{ selectedContrat.titre }}</p>
                <p><strong>Type:</strong> {{ getTypeLabel(selectedContrat.type) }}</p>
                <p><strong>Statut:</strong> {{ getStatutLabel(selectedContrat.statut) }}</p>
                <p><strong>Date signature:</strong> {{ selectedContrat.date_signature | date:'dd/MM/yyyy' || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>👤 Client</h4>
                <p><strong>Nom:</strong> {{ selectedContrat.client_nom || '-' }}</p>
                <p><strong>Contact:</strong> {{ selectedContrat.client_contact || '-' }}</p>
                <p><strong>Email:</strong> {{ selectedContrat.client_email || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>📅 Période</h4>
                <p><strong>Début:</strong> {{ selectedContrat.date_debut | date:'dd/MM/yyyy' }}</p>
                <p><strong>Fin:</strong> {{ selectedContrat.date_fin | date:'dd/MM/yyyy' }}</p>
                <p><strong>Durée:</strong> {{ selectedContrat.duree_mois }} mois</p>
                <p><strong>Renouvellement auto:</strong> {{ selectedContrat.renouvellement_auto ? 'Oui' : 'Non' }}</p>
                <p><strong>Préavis:</strong> {{ selectedContrat.preavis_jours }} jours</p>
              </div>
              <div class="detail-section">
                <h4>💰 Financier</h4>
                <p><strong>Montant HT:</strong> {{ selectedContrat.montant_ht | number }} FCFA</p>
                <p><strong>TVA:</strong> {{ selectedContrat.tva }}%</p>
                <p><strong>Montant TTC:</strong> <strong class="highlight">{{ selectedContrat.montant_ttc | number }} FCFA</strong></p>
                <p><strong>Conditions paiement:</strong> {{ selectedContrat.conditions_paiement || '-' }}</p>
                <p><strong>Échéance:</strong> {{ selectedContrat.echeance_paiement }} jours</p>
              </div>
              <div class="detail-section full-width" *ngIf="selectedContrat.documents && selectedContrat.documents.length">
                <h4>📎 Documents</h4>
                <div class="documents-list-details">
                  <div class="doc-item" *ngFor="let doc of selectedContrat.documents">
                    <span>📄 {{ doc.nom }}</span>
                    <span class="doc-type">{{ doc.type }}</span>
                    <button class="doc-view" (click)="viewDocument(doc)">👁️ Voir</button>
                  </div>
                </div>
              </div>
              <div class="detail-section full-width" *ngIf="selectedContrat.notes">
                <h4>📝 Notes</h4>
                <p>{{ selectedContrat.notes }}</p>
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
            <p>Supprimer le contrat <strong>{{ contratToDelete?.reference }}</strong> ?</p>
            <p class="warning-text">Cette action est irréversible et supprimera tous les documents associés.</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteContrat()">🗑️ Supprimer</button>
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
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showClientForm = false">Annuler</button>
              <button class="btn-primary" (click)="saveNewClient()">💾 Ajouter</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contrats-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
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
    .kpi-card.actifs .kpi-value { color: #10B981; }
    .kpi-card.montant .kpi-value { color: #3B82F6; }
    .kpi-card.expirant .kpi-value { color: #F59E0B; }
    .kpi-card.duree .kpi-value { color: #8B5CF6; }
    .kpi-card.clients .kpi-value { color: #EF4444; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 900px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
    .modal-container.large { max-width: 1000px; }
    .modal-container.small { max-width: 450px; }
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
    .statut-select.brouillon { border-color: #9CA3AF; }
    .statut-select.en_cours { border-color: #10B981; }
    .statut-select.suspendu { border-color: #F59E0B; }
    
    .btn-add-client { background: none; border: 1px solid #FCE7F3; padding: 8px 12px; border-radius: 8px; color: #EC4899; cursor: pointer; margin-top: 8px; width: 100%; }
    .client-info { margin-top: 16px; }
    .info-card { background: #FEF3F9; border-radius: 12px; padding: 16px; }
    .info-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .info-icon { font-size: 20px; }
    .info-card-details { display: flex; gap: 16px; font-size: 13px; color: #6B7280; flex-wrap: wrap; }
    
    .financial-summary { margin-top: 20px; }
    .summary-card { background: #F9FAFB; border-radius: 12px; padding: 16px; border: 1px solid #F3F4F6; }
    .summary-title { font-weight: 600; margin-bottom: 12px; color: #1F2937; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    
    .documents-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
    .btn-add-doc { background: #FEF3F9; border: 1px solid #FCE7F3; padding: 8px 16px; border-radius: 8px; color: #EC4899; cursor: pointer; font-weight: 500; }
    .documents-list { border: 1px solid #F3F4F6; border-radius: 12px; overflow: hidden; }
    .doc-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px solid #F3F4F6; }
    .doc-item:last-child { border-bottom: none; }
    .doc-icon { font-size: 24px; }
    .doc-info { flex: 1; }
    .doc-name { font-weight: 500; margin-bottom: 4px; }
    .doc-type, .doc-date { font-size: 11px; color: #6B7280; }
    .doc-actions { display: flex; gap: 8px; }
    .doc-action { background: none; border: none; cursor: pointer; font-size: 18px; opacity: 0.6; }
    .doc-action:hover { opacity: 1; }
    .no-documents { text-align: center; padding: 40px; background: #F9FAFB; border-radius: 12px; }
    
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 2; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    
    .contrats-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .stat-badge.total { background: #FEF3F9; color: #EC4899; }
    .stat-badge.montant { background: #DCFCE7; color: #16A34A; }
    
    .contrats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 20px; }
    .contrat-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .contrat-card.brouillon { border-left-color: #9CA3AF; }
    .contrat-card.en_cours { border-left-color: #10B981; }
    .contrat-card.suspendu { border-left-color: #F59E0B; }
    .contrat-card.termine { border-left-color: #3B82F6; opacity: 0.8; }
    .contrat-card.annule { border-left-color: #EF4444; opacity: 0.7; }
    .contrat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: flex-start; flex: 1; }
    .contrat-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .contrat-ref { font-weight: 600; color: #1F2937; font-family: monospace; margin-bottom: 4px; }
    .contrat-titre { font-weight: 500; color: #1F2937; margin-bottom: 4px; }
    .contrat-client { font-size: 12px; color: #6B7280; }
    .header-right { text-align: right; }
    .contrat-montant { font-weight: 700; color: #EC4899; margin-bottom: 8px; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.brouillon { background: #F3F4F6; color: #6B7280; }
    .statut-badge.en_cours { background: #DCFCE7; color: #16A34A; }
    .statut-badge.suspendu { background: #FEF3C7; color: #D97706; }
    .statut-badge.termine { background: #DBEAFE; color: #1E40AF; }
    .statut-badge.annule { background: #FEE2E2; color: #EF4444; }
    .card-body { margin: 16px 0; }
    .info-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; font-size: 13px; flex-wrap: wrap; }
    .info-label { color: #6B7280; min-width: 80px; }
    .info-value { font-weight: 500; color: #1F2937; }
    .warning-badge { background: #FEF3C7; color: #F59E0B; padding: 2px 8px; border-radius: 12px; font-size: 10px; }
    .progress-bar { background: #F3F4F6; border-radius: 20px; height: 6px; margin-top: 12px; position: relative; }
    .progress-fill { background: #10B981; border-radius: 20px; height: 6px; }
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
    .documents-list-details { margin-top: 8px; }
    .documents-list-details .doc-item { display: flex; justify-content: space-between; align-items: center; padding: 8px; background: #F9FAFB; border-radius: 8px; margin-bottom: 8px; }
    .doc-view { background: none; border: 1px solid #FCE7F3; padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 12px; }
    .highlight { color: #EC4899; font-size: 18px; }
    .warning-text { color: #EF4444; font-size: 12px; margin-top: 8px; }
    
    @media (max-width: 1200px) { .kpi-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; gap: 12px; } .kpi-grid { grid-template-columns: repeat(2, 1fr); } .contrats-grid { grid-template-columns: 1fr; } .filter-group { flex-direction: column; } .details-grid { grid-template-columns: 1fr; } .detail-section.full-width { grid-column: span 1; } }
  `]
})
export class Contrats implements OnInit {
  contrats: Contrat[] = [];
  filteredContrats: Contrat[] = [];
  clients: any[] = [];
  
  searchTerm = '';
  statutFilter = '';
  typeFilter = '';
  activeTab = 'info';
  showForm = false;
  showDetailsModal = false;
  showDeleteModal = false;
  showClientForm = false;
  editMode = false;
  contratToDelete: Contrat | null = null;
  selectedContrat: Contrat | null = null;
  successMessage = '';
  
  newClient: any = { nom: '', prenom: '', telephone: '', email: '' };
  
  currentContrat: Partial<Contrat> = {
    reference: '',
    titre: '',
    type: 'prestation',
    statut: 'brouillon',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    montant_ht: 0,
    tva: 18,
    montant_ttc: 0,
    duree_mois: 12,
    renouvellement_auto: false,
    preavis_jours: 30,
    echeance_paiement: 30,
    conditions_paiement: '',
    documents: []
  };
  
  ngOnInit() {
    this.loadClients();
    this.loadContrats();
  }
  
  loadClients() {
    const saved = localStorage.getItem('clients');
    this.clients = saved ? JSON.parse(saved) : [];
  }
  
  loadContrats() {
    const saved = localStorage.getItem('contrats');
    this.contrats = saved ? JSON.parse(saved) : [];
    this.filteredContrats = [...this.contrats];
  }
  
  saveContratsToStorage() {
    localStorage.setItem('contrats', JSON.stringify(this.contrats));
  }
  
  openForm() {
    this.currentContrat = {
      reference: this.generateReference(),
      titre: '',
      type: 'prestation',
      statut: 'brouillon',
      date_debut: new Date().toISOString().split('T')[0],
      date_fin: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      montant_ht: 0,
      tva: 18,
      montant_ttc: 0,
      duree_mois: 12,
      renouvellement_auto: false,
      preavis_jours: 30,
      echeance_paiement: 30,
      conditions_paiement: '',
      documents: []
    };
    this.editMode = false;
    this.showForm = true;
    this.activeTab = 'info';
  }
  
  generateReference(): string {
    const date = new Date();
    const year = date.getFullYear();
    const count = this.contrats.length + 1;
    return `CT-${year}-${String(count).padStart(4, '0')}`;
  }
  
  calculerDuree() {
    if (this.currentContrat.date_debut && this.currentContrat.date_fin) {
      const debut = new Date(this.currentContrat.date_debut);
      const fin = new Date(this.currentContrat.date_fin);
      const diffMois = (fin.getFullYear() - debut.getFullYear()) * 12 + (fin.getMonth() - debut.getMonth());
      this.currentContrat.duree_mois = Math.max(1, diffMois);
    }
  }
  
  calculerTotal() {
    this.currentContrat.montant_ttc = (this.currentContrat.montant_ht || 0) * (1 + (this.currentContrat.tva || 0) / 100);
  }
  
  getMontantMensuel(): number {
    if (!this.currentContrat.montant_ttc || !this.currentContrat.duree_mois) return 0;
    return this.currentContrat.montant_ttc / this.currentContrat.duree_mois;
  }
  
  getMontantJournalier(): number {
    if (!this.currentContrat.montant_ttc || !this.currentContrat.duree_mois) return 0;
    return this.currentContrat.montant_ttc / (this.currentContrat.duree_mois * 30);
  }
  
  addDocument() {
    if (!this.currentContrat.documents) {
      this.currentContrat.documents = [];
    }
    this.currentContrat.documents.push({
      nom: 'Nouveau document',
      type: 'PDF',
      url: '',
      date_upload: new Date().toISOString()
    });
  }
  
  removeDocument(index: number) {
    if (this.currentContrat.documents) {
      this.currentContrat.documents.splice(index, 1);
    }
  }
  
  viewDocument(doc: ContratDocument) {
    alert(`Ouverture du document: ${doc.nom}`);
  }
  
  onClientChange() {
    const client = this.clients.find(c => c.id === this.currentContrat.client_id);
    if (client) {
      this.currentContrat.client_nom = `${client.nom} ${client.prenom || ''}`;
      this.currentContrat.client_contact = client.telephone;
      this.currentContrat.client_email = client.email;
    }
  }
  
  openClientForm() {
    this.newClient = { nom: '', prenom: '', telephone: '', email: '' };
    this.showClientForm = true;
  }
  
  saveNewClient() {
    if (!this.newClient.nom) return;
    const newId = Date.now();
    const client = { ...this.newClient, id: newId };
    this.clients.push(client);
    localStorage.setItem('clients', JSON.stringify(this.clients));
    this.currentContrat.client_id = newId;
    this.onClientChange();
    this.showClientForm = false;
    this.showSuccess('Client ajouté avec succès');
  }
  
  saveContrat() {
    if (!this.currentContrat.client_id) {
      alert('Veuillez sélectionner un client');
      return;
    }
    
    if (this.editMode && this.currentContrat.id) {
      const index = this.contrats.findIndex(c => c.id === this.currentContrat.id);
      if (index !== -1) {
        this.contrats[index] = { ...this.currentContrat, updated_at: new Date().toISOString() } as Contrat;
        this.showSuccess('Contrat modifié');
      }
    } else {
      this.contrats.push({ 
        ...this.currentContrat, 
        id: Date.now(), 
        created_at: new Date().toISOString() 
      } as Contrat);
      this.showSuccess('Contrat ajouté');
    }
    this.saveContratsToStorage();
    this.filterContrats();
    this.cancelForm();
  }
  
  editContrat(c: Contrat) {
    this.currentContrat = { ...c };
    if (!this.currentContrat.documents) this.currentContrat.documents = [];
    this.editMode = true;
    this.showForm = true;
    this.activeTab = 'info';
  }
  
  duplicateContrat(c: Contrat) {
    const newContrat = { 
      ...c, 
      id: undefined, 
      reference: this.generateReference(), 
      statut: 'brouillon' as const,
      created_at: new Date().toISOString()
    };
    this.contrats.push(newContrat);
    this.saveContratsToStorage();
    this.filterContrats();
    this.showSuccess('Contrat dupliqué');
  }
  
  renewContrat(c: Contrat) {
    const newFin = new Date(c.date_fin);
    newFin.setFullYear(newFin.getFullYear() + 1);
    c.date_fin = newFin.toISOString().split('T')[0];
    this.calculerDuree();
    this.saveContratsToStorage();
    this.filterContrats();
    this.showSuccess('Contrat renouvelé');
  }
  
  viewDetails(c: Contrat) {
    this.selectedContrat = c;
    this.showDetailsModal = true;
  }
  
  confirmDelete(c: Contrat) {
    this.contratToDelete = c;
    this.showDeleteModal = true;
  }
  
  deleteContrat() {
    if (this.contratToDelete) {
      this.contrats = this.contrats.filter(c => c.id !== this.contratToDelete?.id);
      this.saveContratsToStorage();
      this.filterContrats();
      this.showDeleteModal = false;
      this.contratToDelete = null;
      this.showSuccess('Contrat supprimé');
    }
  }
  
  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }
  
  filterContrats() {
    let filtered = [...this.contrats];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.reference?.toLowerCase().includes(term) || 
        c.titre?.toLowerCase().includes(term) ||
        c.client_nom?.toLowerCase().includes(term)
      );
    }
    
    if (this.statutFilter) {
      filtered = filtered.filter(c => c.statut === this.statutFilter);
    }
    
    if (this.typeFilter) {
      filtered = filtered.filter(c => c.type === this.typeFilter);
    }
    
    this.filteredContrats = filtered;
  }
  
  getContratsActifs(): number {
    return this.contrats.filter(c => c.statut === 'en_cours').length;
  }
  
  getMontantTotal(): number {
    return this.contrats.reduce((sum, c) => sum + (c.montant_ttc || 0), 0);
  }
  
  getMontantFiltre(): number {
    return this.filteredContrats.reduce((sum, c) => sum + (c.montant_ttc || 0), 0);
  }
  
  getContratsExpirant(): number {
    const today = new Date();
    const in30Days = new Date();
    in30Days.setDate(today.getDate() + 30);
    return this.contrats.filter(c => {
      const fin = new Date(c.date_fin);
      return c.statut === 'en_cours' && fin <= in30Days && fin >= today;
    }).length;
  }
  
  getDureeMoyenne(): number {
    if (this.contrats.length === 0) return 0;
    const totalDuree = this.contrats.reduce((sum, c) => sum + (c.duree_mois || 0), 0);
    return Math.round(totalDuree / this.contrats.length);
  }
  
  getClientsUniques(): number {
    const clientIds = new Set(this.contrats.map(c => c.client_id));
    return clientIds.size;
  }
  
  getProgression(c: Contrat): number {
    const debut = new Date(c.date_debut);
    const fin = new Date(c.date_fin);
    const today = new Date();
    
    if (today < debut) return 0;
    if (today > fin) return 100;
    
    const total = fin.getTime() - debut.getTime();
    const ecoule = today.getTime() - debut.getTime();
    return Math.round((ecoule / total) * 100);
  }
  
  isExpiringSoon(c: Contrat): boolean {
    const today = new Date();
    const fin = new Date(c.date_fin);
    const in30Days = new Date();
    in30Days.setDate(today.getDate() + 30);
    return c.statut === 'en_cours' && fin <= in30Days && fin >= today;
  }
  
  getTypeIcon(type: string): string {
    const icons: any = {
      prestation: '📋',
      transport: '🚛',
      fourniture: '📦',
      maintenance: '🔧',
      consulting: '💡'
    };
    return icons[type] || '📑';
  }
  
  getTypeLabel(type: string): string {
    const labels: any = {
      prestation: 'Prestation de services',
      transport: 'Transport',
      fourniture: 'Fourniture de biens',
      maintenance: 'Maintenance',
      consulting: 'Consulting'
    };
    return labels[type] || type;
  }
  
  getStatutLabel(statut: string): string {
    const labels: any = {
      brouillon: '📝 Brouillon',
      en_cours: '✅ En cours',
      suspendu: '⏸️ Suspendu',
      termine: '🏁 Terminé',
      annule: '❌ Annulé'
    };
    return labels[statut] || statut;
  }
  
  // ========== EXPORT EXCEL ==========
  exportToExcel() {
    const colonnes = [
      'Référence', 'Titre', 'Type', 'Statut', 'Client', 'Date début', 'Date fin',
      'Durée (mois)', 'Montant HT (FCFA)', 'TVA (%)', 'Montant TTC (FCFA)',
      'Renouvellement auto', 'Préavis (jours)', 'Créé le'
    ];
    const lignes = this.filteredContrats.map(c => [
      c.reference,
      c.titre,
      this.getTypeLabel(c.type),
      this.getStatutLabel(c.statut),
      c.client_nom || '',
      new Date(c.date_debut).toLocaleDateString(),
      new Date(c.date_fin).toLocaleDateString(),
      c.duree_mois,
      c.montant_ht,
      c.tva,
      c.montant_ttc,
      c.renouvellement_auto ? 'Oui' : 'Non',
      c.preavis_jours,
      new Date(c.created_at).toLocaleDateString()
    ]);
    const csvContent = [colonnes, ...lignes]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `contrats_${new Date().toISOString().slice(0,19)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showSuccess('Export Excel effectué');
  }
  
  // ========== EXPORT PDF ==========
  exportToPDF() {
    const contenu = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Liste des contrats</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #EC4899; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: gray; }
        </style>
      </head>
      <body>
        <h1>Liste des contrats</h1>
        <p>Généré le ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Référence</th><th>Titre</th><th>Type</th><th>Statut</th><th>Client</th>
              <th>Début</th><th>Fin</th><th>Durée (mois)</th><th>Montant TTC (FCFA)</th>
            </tr>
          </thead>
          <tbody>
            ${this.filteredContrats.map(c => `
              <tr>
                <td>${c.reference}</td>
                <td>${c.titre}</td>
                <td>${this.getTypeLabel(c.type)}</td>
                <td>${this.getStatutLabel(c.statut)}</td>
                <td>${c.client_nom || '-'}</td>
                <td>${new Date(c.date_debut).toLocaleDateString()}</td>
                <td>${new Date(c.date_fin).toLocaleDateString()}</td>
                <td>${c.duree_mois} mois</td>
                <td>${c.montant_ttc.toLocaleString()} FCFA</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">PulseBusiness - Export contrats</div>
      </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(contenu);
      win.document.close();
      win.print();
    } else {
      alert('Veuillez autoriser les pop-ups pour exporter en PDF');
    }
  }
  
  showSuccess(msg: string) { 
    this.successMessage = msg; 
    setTimeout(() => this.successMessage = '', 3000); 
  }
}