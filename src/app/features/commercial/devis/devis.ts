import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface DevisData {
  id?: number;
  reference: string;
  titre: string;
  date_emission: string;
  date_validite: string;
  client_id: number;
  client_nom?: string;
  client_contact?: string;
  client_email?: string;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  remise?: number;
  montant_apres_remise?: number;
  statut: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire';
  notes?: string;
  articles?: DevisArticle[];
  created_at: string;
  updated_at?: string;
}

interface DevisArticle {
  id?: number;
  designation: string;
  quantite: number;
  prix_unitaire: number;
  montant: number;
}

@Component({
  selector: 'app-devis',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="devis-container">
      <div class="header">
        <div>
          <h1>📄 Devis</h1>
          <p class="subtitle">{{ devis.length }} devis • {{ getDevisEnAttente() }} en attente • {{ getMontantTotal() | number }} FCFA total</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="devis.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="devis.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouveau devis</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>

      <div class="kpi-grid" *ngIf="devis.length > 0">
        <div class="kpi-card total"><div class="kpi-icon">📄</div><div class="kpi-content"><span class="kpi-value">{{ devis.length }}</span><span class="kpi-label">Total devis</span></div></div>
        <div class="kpi-card montant"><div class="kpi-icon">💰</div><div class="kpi-content"><span class="kpi-value">{{ getMontantTotal() | number }} <small>FCFA</small></span><span class="kpi-label">Montant total</span></div></div>
        <div class="kpi-card acceptation"><div class="kpi-icon">📊</div><div class="kpi-content"><span class="kpi-value">{{ getTauxAcceptation() }}%</span><span class="kpi-label">Taux acceptation</span></div></div>
        <div class="kpi-card expirant"><div class="kpi-icon">⏰</div><div class="kpi-content"><span class="kpi-value">{{ getDevisExpirant() }}</span><span class="kpi-label">Expire bientôt</span></div></div>
        <div class="kpi-card moyen"><div class="kpi-icon">📈</div><div class="kpi-content"><span class="kpi-value">{{ getMontantMoyen() | number }} <small>FCFA</small></span><span class="kpi-label">Montant moyen</span></div></div>
        <div class="kpi-card delai"><div class="kpi-icon">⏱️</div><div class="kpi-content"><span class="kpi-value">{{ getDelaiMoyenAcceptation() }} j</span><span class="kpi-label">Délai acceptation</span></div></div>
      </div>

      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header"><h3>{{ editMode ? '✏️ Modifier' : '➕ Nouveau' }} devis</h3><button class="modal-close" (click)="cancelForm()">✕</button></div>
          <div class="modal-body">
            <form (ngSubmit)="saveDevis()">
              <div class="tabs">
                <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">📋 Informations</button>
                <button type="button" [class.active]="activeTab === 'articles'" (click)="activeTab = 'articles'">📦 Articles</button>
                <button type="button" [class.active]="activeTab === 'client'" (click)="activeTab = 'client'">👤 Client</button>
              </div>

              <div *ngIf="activeTab === 'info'" class="tab-content">
                <div class="form-row">
                  <div class="form-group"><label>Référence</label><input type="text" [(ngModel)]="currentDevis.reference" readonly class="readonly"></div>
                  <div class="form-group"><label>Titre</label><input type="text" [(ngModel)]="currentDevis.titre" required></div>
                </div>
                <div class="form-row">
                  <div class="form-group"><label>Statut</label><select [(ngModel)]="currentDevis.statut"><option value="brouillon">📝 Brouillon</option><option value="envoye">📤 Envoyé</option><option value="accepte">✅ Accepté</option><option value="refuse">❌ Refusé</option><option value="expire">⏰ Expiré</option></select></div>
                  <div class="form-group"><label>Date émission</label><input type="date" [(ngModel)]="currentDevis.date_emission"></div>
                </div>
                <div class="form-row">
                  <div class="form-group"><label>Date validité</label><input type="date" [(ngModel)]="currentDevis.date_validite"></div>
                  <div class="form-group highlight"><label>Total TTC</label><input type="text" [value]="(currentDevis.montant_ttc || 0) | number:'1.0-0'" readonly class="readonly highlight-input"></div>
                </div>
                <div class="form-group"><label>Notes</label><textarea [(ngModel)]="currentDevis.notes" rows="3"></textarea></div>
              </div>

              <div *ngIf="activeTab === 'articles'" class="tab-content">
                <div class="articles-header"><h4>Articles</h4><button type="button" class="btn-add-article" (click)="addArticle()">+ Ajouter</button></div>
                <div class="articles-table" *ngIf="currentDevis.articles && currentDevis.articles.length > 0; else noArticles">
                  <div class="articles-header-row"><div class="col-designation">Désignation</div><div class="col-quantite">Qté</div><div class="col-prix">Prix unit.</div><div class="col-montant">Montant</div><div class="col-actions"></div></div>
                  <div class="articles-row" *ngFor="let a of currentDevis.articles; let i = index">
                    <div class="col-designation"><input type="text" [(ngModel)]="a.designation" (input)="updateArticleMontant(a)"></div>
                    <div class="col-quantite"><input type="number" [(ngModel)]="a.quantite" (input)="updateArticleMontant(a)" min="1"></div>
                    <div class="col-prix"><input type="number" [(ngModel)]="a.prix_unitaire" (input)="updateArticleMontant(a)" step="1000"></div>
                    <div class="col-montant"><span class="montant-article">{{ a.montant | number }} FCFA</span></div>
                    <div class="col-actions"><button type="button" (click)="removeArticle(i)" class="remove-article">🗑️</button></div>
                  </div>
                  <div class="articles-total">
                    <div class="total-row"><span>Sous-total HT:</span><strong>{{ getSousTotalHT() | number }} FCFA</strong></div>
                    <div class="total-row"><span>TVA ({{ currentDevis.tva || 0 }}%):</span><strong>{{ getTvaMontant() | number }} FCFA</strong></div>
                    <div class="total-row" *ngIf="currentDevis.remise"><span>Remise ({{ currentDevis.remise }}%):</span><strong>-{{ getRemiseMontant() | number }} FCFA</strong></div>
                    <div class="total-row grand-total"><span>Total TTC:</span><strong>{{ getTotalTTCFromArticles() | number }} FCFA</strong></div>
                  </div>
                </div>
                <ng-template #noArticles><div class="no-articles"><p>Aucun article</p><button type="button" class="btn-add-article" (click)="addArticle()">+ Ajouter</button></div></ng-template>
              </div>

              <div *ngIf="activeTab === 'client'" class="tab-content">
                <div class="form-group"><label>Client</label><select [(ngModel)]="currentDevis.client_id" (change)="onClientChange()"><option [ngValue]="null">Sélectionner</option><option *ngFor="let c of clients" [ngValue]="c.id">{{ c.nom }} {{ c.prenom }} - {{ c.email || c.telephone }}</option></select><button type="button" class="btn-add-client" (click)="openClientForm()">+ Nouveau client</button></div>
                <div class="client-info" *ngIf="currentDevis.client_nom"><div class="info-card"><div class="info-card-header"><span class="info-icon">👤</span><strong>{{ currentDevis.client_nom }}</strong></div><div class="info-card-details"><span *ngIf="currentDevis.client_contact">📞 {{ currentDevis.client_contact }}</span><span *ngIf="currentDevis.client_email">✉️ {{ currentDevis.client_email }}</span></div></div></div>
              </div>

              <div class="modal-actions"><button type="button" class="btn-secondary" (click)="cancelForm()">Annuler</button><button type="submit" class="btn-primary">💾 Enregistrer</button></div>
            </form>
          </div>
        </div>
      </div>

      <div class="filters-section" *ngIf="devis.length > 0">
        <div class="search-wrapper"><span class="search-icon">🔍</span><input [(ngModel)]="searchTerm" (ngModelChange)="filterDevis()" placeholder="Rechercher..." class="search-input"></div>
        <div class="filter-group"><select [(ngModel)]="statutFilter" (ngModelChange)="filterDevis()"><option value="">Tous statuts</option><option value="brouillon">Brouillon</option><option value="envoye">Envoyé</option><option value="accepte">Accepté</option><option value="refuse">Refusé</option><option value="expire">Expiré</option></select><select [(ngModel)]="dateFilter" (ngModelChange)="filterDevis()"><option value="">Toutes périodes</option><option value="today">Aujourd'hui</option><option value="week">Cette semaine</option><option value="month">Ce mois</option><option value="expiring">Expirant bientôt</option></select></div>
      </div>

      <div class="devis-section" *ngIf="devis.length > 0; else emptyState">
        <div class="section-header"><h2>📋 Liste des devis</h2><div class="header-stats"><span class="stat-badge total">{{ filteredDevis.length }} / {{ devis.length }} affiché(s)</span><span class="stat-badge montant">{{ getMontantFiltre() | number }} FCFA</span></div></div>
        <div class="devis-grid">
          <div class="devis-card" *ngFor="let d of filteredDevis" [class]="d.statut">
            <div class="card-header"><div class="header-left"><div class="devis-icon">📄</div><div class="devis-info"><div class="devis-ref">{{ d.reference }}</div><div class="devis-client">{{ d.client_nom || '-' }}</div><div class="devis-date">{{ d.date_emission | date:'dd/MM/yyyy' }}</div></div></div><div class="header-right"><div class="devis-montant">{{ d.montant_ttc | number }} FCFA</div><span class="statut-badge" [class]="d.statut">{{ getStatutLabel(d.statut) }}</span></div></div>
            <div class="card-body"><div class="info-row"><span class="info-label">Validité:</span><span class="info-value" [class.expired]="isExpired(d)">{{ d.date_validite | date:'dd/MM/yyyy' }}</span><span *ngIf="isExpiringSoon(d)" class="warning-badge">⚠️ Expire</span><span *ngIf="isExpired(d)" class="expired-badge">⏰ Expiré</span></div><div class="progress-bar" *ngIf="d.statut === 'envoye'"><div class="progress-fill" style="width:33%"></div><span class="progress-text">En attente</span></div></div>
            <div class="card-footer"><div class="footer-actions"><button class="action-icon" (click)="viewDetails(d)">👁️</button><button class="action-icon" (click)="editDevis(d)">✏️</button><button class="action-icon" (click)="duplicateDevis(d)">📋</button><button class="action-icon delete" (click)="confirmDelete(d)">🗑️</button></div></div>
          </div>
        </div>
      </div>

      <ng-template #emptyState><div class="empty-state"><div class="empty-icon">📄</div><h2>Aucun devis</h2><button class="btn-primary" (click)="openForm()">+ Nouveau devis</button></div></ng-template>

      <div class="modal-overlay" *ngIf="showDetailsModal && selectedDevis"><div class="modal-container"><div class="modal-header"><h3>Détails - {{ selectedDevis.reference }}</h3><button class="modal-close" (click)="showDetailsModal = false">✕</button></div><div class="modal-body"><p><strong>Titre:</strong> {{ selectedDevis.titre }}</p><p><strong>Client:</strong> {{ selectedDevis.client_nom }}</p><p><strong>Date émission:</strong> {{ selectedDevis.date_emission | date:'dd/MM/yyyy' }}</p><p><strong>Validité:</strong> {{ selectedDevis.date_validite | date:'dd/MM/yyyy' }}</p><p><strong>Montant HT:</strong> {{ selectedDevis.montant_ht | number }} FCFA</p><p><strong>TVA:</strong> {{ selectedDevis.tva }}%</p><p><strong>Remise:</strong> {{ selectedDevis.remise || 0 }}%</p><p><strong>Montant TTC:</strong> <strong class="highlight">{{ selectedDevis.montant_ttc | number }} FCFA</strong></p><p *ngIf="selectedDevis.notes"><strong>Notes:</strong> {{ selectedDevis.notes }}</p></div></div></div>

      <div class="modal-overlay" *ngIf="showDeleteModal"><div class="modal-container small"><div class="modal-header"><h3>Confirmer</h3><button class="modal-close" (click)="showDeleteModal = false">✕</button></div><div class="modal-body"><p>Supprimer {{ devisToDelete?.reference }} ?</p><div class="modal-actions"><button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button><button class="btn-danger" (click)="deleteDevis()">🗑️ Supprimer</button></div></div></div></div>

      <div class="modal-overlay" *ngIf="showClientForm"><div class="modal-container"><div class="modal-header"><h3>➕ Nouveau client</h3><button class="modal-close" (click)="showClientForm = false">✕</button></div><div class="modal-body"><div class="form-group"><label>Nom</label><input type="text" [(ngModel)]="newClient.nom"></div><div class="form-group"><label>Prénom</label><input type="text" [(ngModel)]="newClient.prenom"></div><div class="form-row"><div class="form-group"><label>Téléphone</label><input type="tel" [(ngModel)]="newClient.telephone"></div><div class="form-group"><label>Email</label><input type="email" [(ngModel)]="newClient.email"></div></div><div class="modal-actions"><button class="btn-secondary" (click)="showClientForm = false">Annuler</button><button class="btn-primary" (click)="saveNewClient()">💾 Ajouter</button></div></div></div></div>
    </div>
  `,
  styles: [`
    .devis-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
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
    .kpi-card.acceptation .kpi-value { color: #3B82F6; }
    .kpi-card.expirant .kpi-value { color: #F59E0B; }
    .kpi-card.moyen .kpi-value { color: #8B5CF6; }
    .kpi-card.delai .kpi-value { color: #EF4444; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 800px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
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
    .articles-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .btn-add-article { background: #FEF3F9; border: 1px solid #FCE7F3; padding: 8px 16px; border-radius: 8px; color: #EC4899; cursor: pointer; }
    .articles-table { border: 1px solid #F3F4F6; border-radius: 12px; overflow: hidden; margin-bottom: 16px; }
    .articles-header-row { display: grid; grid-template-columns: 1fr 80px 120px 120px 40px; background: #F9FAFB; padding: 12px; font-weight: 600; font-size: 13px; color: #6B7280; border-bottom: 1px solid #F3F4F6; }
    .articles-row { display: grid; grid-template-columns: 1fr 80px 120px 120px 40px; padding: 12px; border-bottom: 1px solid #F3F4F6; align-items: center; }
    .col-designation input { width: 100%; padding: 8px; border: 1px solid #F3F4F6; border-radius: 6px; }
    .col-quantite input, .col-prix input { width: 100%; padding: 8px; text-align: right; border: 1px solid #F3F4F6; border-radius: 6px; }
    .montant-article { font-weight: 500; color: #1F2937; text-align: right; display: block; }
    .remove-article { background: none; border: none; cursor: pointer; font-size: 16px; opacity: 0.5; }
    .remove-article:hover { opacity: 1; }
    .articles-total { padding: 16px; background: #F9FAFB; text-align: right; border-top: 2px solid #F3F4F6; }
    .total-row { margin-bottom: 8px; }
    .total-row span { margin-right: 20px; color: #6B7280; }
    .grand-total { font-size: 18px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #F3F4F6; }
    .grand-total strong { color: #EC4899; font-size: 20px; }
    .no-articles { text-align: center; padding: 40px; background: #F9FAFB; border-radius: 12px; }
    .btn-add-client { background: none; border: 1px solid #FCE7F3; padding: 8px 12px; border-radius: 8px; color: #EC4899; cursor: pointer; margin-top: 8px; width: 100%; }
    .client-info { margin-top: 16px; }
    .info-card { background: #FEF3F9; border-radius: 12px; padding: 16px; }
    .info-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .info-icon { font-size: 20px; }
    .info-card-details { display: flex; gap: 16px; font-size: 13px; color: #6B7280; flex-wrap: wrap; }
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 2; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    .devis-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .stat-badge.total { background: #FEF3F9; color: #EC4899; }
    .stat-badge.montant { background: #DCFCE7; color: #16A34A; }
    .devis-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
    .devis-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .devis-card.brouillon { border-left-color: #9CA3AF; }
    .devis-card.envoye { border-left-color: #3B82F6; }
    .devis-card.accepte { border-left-color: #10B981; }
    .devis-card.refuse { border-left-color: #EF4444; opacity: 0.7; }
    .devis-card.expire { border-left-color: #F59E0B; opacity: 0.7; }
    .devis-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: flex-start; flex: 1; }
    .devis-icon { font-size: 28px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .devis-ref { font-weight: 600; color: #1F2937; margin-bottom: 4px; }
    .devis-client { font-size: 13px; color: #6B7280; margin-bottom: 4px; }
    .devis-date { font-size: 11px; color: #9CA3AF; }
    .header-right { text-align: right; }
    .devis-montant { font-weight: 700; color: #EC4899; margin-bottom: 8px; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.brouillon { background: #F3F4F6; color: #6B7280; }
    .statut-badge.envoye { background: #DBEAFE; color: #1E40AF; }
    .statut-badge.accepte { background: #DCFCE7; color: #16A34A; }
    .statut-badge.refuse { background: #FEE2E2; color: #EF4444; }
    .statut-badge.expire { background: #FEF3C7; color: #F59E0B; }
    .card-body { margin: 16px 0; }
    .info-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; font-size: 13px; flex-wrap: wrap; }
    .info-label { color: #6B7280; min-width: 70px; }
    .info-value { font-weight: 500; color: #1F2937; }
    .info-value.expired { color: #EF4444; text-decoration: line-through; }
    .warning-badge { background: #FEF3C7; color: #F59E0B; padding: 2px 8px; border-radius: 12px; font-size: 10px; }
    .expired-badge { background: #FEE2E2; color: #EF4444; padding: 2px 8px; border-radius: 12px; font-size: 10px; }
    .progress-bar { background: #F3F4F6; border-radius: 20px; height: 6px; margin-top: 12px; position: relative; }
    .progress-fill { background: #3B82F6; border-radius: 20px; height: 6px; }
    .progress-text { font-size: 10px; color: #6B7280; position: absolute; right: 0; top: -16px; }
    .card-footer { display: flex; justify-content: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid #F3F4F6; }
    .footer-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .action-icon { background: none; border: 1px solid #FCE7F3; border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: all 0.2s; font-size: 14px; }
    .action-icon:hover { background: #FEF3F9; border-color: #EC4899; }
    .action-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .highlight { color: #EC4899; font-size: 18px; }
    @media (max-width: 1200px) { .kpi-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; gap: 12px; } .kpi-grid { grid-template-columns: repeat(2, 1fr); } .devis-grid { grid-template-columns: 1fr; } .filter-group { flex-direction: column; } .articles-header-row, .articles-row { grid-template-columns: 1fr 70px 100px 100px 30px; font-size: 12px; } }
  `]
})
export class Devis implements OnInit {
  devis: DevisData[] = [];
  filteredDevis: DevisData[] = [];
  clients: any[] = [];
  
  searchTerm = '';
  statutFilter = '';
  dateFilter = '';
  activeTab = 'info';
  showForm = false;
  showDetailsModal = false;
  editMode = false;
  showDeleteModal = false;
  showClientForm = false;
  devisToDelete: DevisData | null = null;
  selectedDevis: DevisData | null = null;
  successMessage = '';
  
  newClient: any = { nom: '', prenom: '', telephone: '', email: '' };
  
  currentDevis: Partial<DevisData> = {
    reference: '',
    titre: '',
    statut: 'brouillon',
    date_emission: new Date().toISOString().split('T')[0],
    date_validite: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    montant_ht: 0,
    tva: 18,
    montant_ttc: 0,
    remise: 0,
    articles: []
  };
  
  ngOnInit() {
    this.loadClients();
    this.loadDevis();
  }
  
  loadClients() {
    const saved = localStorage.getItem('clients');
    this.clients = saved ? JSON.parse(saved) : [];
  }
  
  loadDevis() {
    const saved = localStorage.getItem('devis');
    this.devis = saved ? JSON.parse(saved) : [];
    this.devis.forEach(d => {
      if (!d.titre) d.titre = d.reference;
      if (!d.date_emission) d.date_emission = d.created_at?.split('T')[0] || new Date().toISOString().split('T')[0];
    });
    this.filteredDevis = [...this.devis];
  }
  
  saveDevisToStorage() {
    localStorage.setItem('devis', JSON.stringify(this.devis));
  }
  
  openForm() {
    this.currentDevis = {
      reference: this.generateReference(),
      titre: '',
      statut: 'brouillon',
      date_emission: new Date().toISOString().split('T')[0],
      date_validite: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      montant_ht: 0,
      tva: 18,
      montant_ttc: 0,
      remise: 0,
      articles: []
    };
    this.editMode = false;
    this.showForm = true;
    this.activeTab = 'info';
  }
  
  generateReference(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = this.devis.length + 1;
    return `DEV-${year}${month}-${String(count).padStart(4, '0')}`;
  }
  
  addArticle() {
    if (!this.currentDevis.articles) this.currentDevis.articles = [];
    this.currentDevis.articles.push({
      designation: '',
      quantite: 1,
      prix_unitaire: 0,
      montant: 0
    });
  }
  
  removeArticle(index: number) {
    if (this.currentDevis.articles) this.currentDevis.articles.splice(index, 1);
    this.recalculerTotalDepuisArticles();
  }
  
  updateArticleMontant(article: DevisArticle) {
    article.montant = (article.quantite || 0) * (article.prix_unitaire || 0);
    this.recalculerTotalDepuisArticles();
  }
  
  recalculerTotalDepuisArticles() {
    const sousTotal = this.getSousTotalHT();
    this.currentDevis.montant_ht = sousTotal;
    this.calculerTotal();
  }
  
  getSousTotalHT(): number {
    if (!this.currentDevis.articles) return 0;
    return this.currentDevis.articles.reduce((sum, a) => sum + (a.montant || 0), 0);
  }
  
  getTvaMontant(): number {
    return (this.currentDevis.montant_ht || 0) * (this.currentDevis.tva || 0) / 100;
  }
  
  getRemiseMontant(): number {
    const totalAvecTva = (this.currentDevis.montant_ht || 0) + this.getTvaMontant();
    return totalAvecTva * (this.currentDevis.remise || 0) / 100;
  }
  
  getTotalTTCFromArticles(): number {
    const totalAvecTva = (this.currentDevis.montant_ht || 0) + this.getTvaMontant();
    return totalAvecTva - this.getRemiseMontant();
  }
  
  calculerTotal() {
    const totalAvecTva = (this.currentDevis.montant_ht || 0) * (1 + (this.currentDevis.tva || 0) / 100);
    this.currentDevis.montant_ttc = totalAvecTva * (1 - (this.currentDevis.remise || 0) / 100);
  }
  
  onClientChange() {
    const client = this.clients.find(c => c.id === this.currentDevis.client_id);
    if (client) {
      this.currentDevis.client_nom = `${client.nom} ${client.prenom || ''}`;
      this.currentDevis.client_contact = client.telephone;
      this.currentDevis.client_email = client.email;
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
    this.currentDevis.client_id = newId;
    this.onClientChange();
    this.showClientForm = false;
    this.showSuccess('Client ajouté');
  }
  
  saveDevis() {
    if (!this.currentDevis.client_id) {
      alert('Veuillez sélectionner un client');
      return;
    }
    if (this.editMode && this.currentDevis.id) {
      const index = this.devis.findIndex(d => d.id === this.currentDevis.id);
      if (index !== -1) {
        this.devis[index] = { ...this.currentDevis, updated_at: new Date().toISOString() } as DevisData;
        this.showSuccess('Devis modifié');
      }
    } else {
      this.devis.push({ 
        ...this.currentDevis, 
        id: Date.now(), 
        created_at: new Date().toISOString() 
      } as DevisData);
      this.showSuccess('Devis ajouté');
    }
    this.saveDevisToStorage();
    this.filterDevis();
    this.cancelForm();
  }
  
  editDevis(d: DevisData) {
    this.currentDevis = { ...d };
    if (!this.currentDevis.articles) this.currentDevis.articles = [];
    this.editMode = true;
    this.showForm = true;
    this.activeTab = 'info';
  }
  
  duplicateDevis(d: DevisData) {
    const newDevis = { ...d, id: undefined, reference: this.generateReference(), titre: `${d.titre} (copie)`, statut: 'brouillon' as const, created_at: new Date().toISOString() };
    this.devis.push(newDevis);
    this.saveDevisToStorage();
    this.filterDevis();
    this.showSuccess('Devis dupliqué');
  }
  
  viewDetails(d: DevisData) {
    this.selectedDevis = d;
    this.showDetailsModal = true;
  }
  
  confirmDelete(d: DevisData) {
    this.devisToDelete = d;
    this.showDeleteModal = true;
  }
  
  deleteDevis() {
    if (this.devisToDelete) {
      this.devis = this.devis.filter(d => d.id !== this.devisToDelete?.id);
      this.saveDevisToStorage();
      this.filterDevis();
      this.showDeleteModal = false;
      this.devisToDelete = null;
      this.showSuccess('Devis supprimé');
    }
  }
  
  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }
  
  filterDevis() {
    let filtered = [...this.devis];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(d => d.reference?.toLowerCase().includes(term) || d.client_nom?.toLowerCase().includes(term) || d.titre?.toLowerCase().includes(term));
    }
    if (this.statutFilter) filtered = filtered.filter(d => d.statut === this.statutFilter);
    if (this.dateFilter) {
      const today = new Date(); today.setHours(0,0,0,0);
      if (this.dateFilter === 'today') filtered = filtered.filter(d => new Date(d.date_emission).toDateString() === today.toDateString());
      else if (this.dateFilter === 'week') { const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7); filtered = filtered.filter(d => new Date(d.date_emission) >= weekAgo); }
      else if (this.dateFilter === 'month') { const monthAgo = new Date(today); monthAgo.setMonth(today.getMonth() - 1); filtered = filtered.filter(d => new Date(d.date_emission) >= monthAgo); }
      else if (this.dateFilter === 'expiring') { const in7Days = new Date(); in7Days.setDate(today.getDate() + 7); filtered = filtered.filter(d => { const validite = new Date(d.date_validite); return d.statut !== 'accepte' && d.statut !== 'refuse' && validite <= in7Days && validite >= today; }); }
    }
    this.filteredDevis = filtered;
  }
  
  getDevisEnAttente(): number { return this.devis.filter(d => d.statut === 'envoye').length; }
  getMontantTotal(): number { return this.devis.reduce((sum, d) => sum + (d.montant_ttc || 0), 0); }
  getMontantFiltre(): number { return this.filteredDevis.reduce((sum, d) => sum + (d.montant_ttc || 0), 0); }
  getMontantMoyen(): number { return this.devis.length ? this.getMontantTotal() / this.devis.length : 0; }
  getTauxAcceptation(): number { const acceptes = this.devis.filter(d => d.statut === 'accepte').length; const traites = this.devis.filter(d => d.statut !== 'brouillon' && d.statut !== 'expire').length; return traites ? Math.round((acceptes / traites) * 100) : 0; }
  getDelaiMoyenAcceptation(): number { const acceptes = this.devis.filter(d => d.statut === 'accepte' && d.created_at && d.updated_at); if (acceptes.length === 0) return 0; const totalJours = acceptes.reduce((sum, d) => { const creation = new Date(d.created_at); const acceptation = new Date(d.updated_at || d.created_at); const jours = Math.ceil((acceptation.getTime() - creation.getTime()) / (1000 * 3600 * 24)); return sum + Math.max(0, jours); }, 0); return Math.round(totalJours / acceptes.length); }
  getDevisExpirant(): number { const today = new Date(); const in7Days = new Date(); in7Days.setDate(today.getDate() + 7); return this.devis.filter(d => { const validite = new Date(d.date_validite); return d.statut !== 'accepte' && d.statut !== 'refuse' && validite <= in7Days && validite >= today; }).length; }
  isExpiringSoon(d: DevisData): boolean { const today = new Date(); const validite = new Date(d.date_validite); const in7Days = new Date(); in7Days.setDate(today.getDate() + 7); return d.statut !== 'accepte' && d.statut !== 'refuse' && validite <= in7Days && validite >= today; }
  isExpired(d: DevisData): boolean { const today = new Date(); const validite = new Date(d.date_validite); return validite < today && d.statut !== 'accepte' && d.statut !== 'refuse'; }
  getStatutLabel(statut: string): string { const labels: any = { brouillon: '📝 Brouillon', envoye: '📤 Envoyé', accepte: '✅ Accepté', refuse: '❌ Refusé', expire: '⏰ Expiré' }; return labels[statut] || statut; }
  
  showSuccess(msg: string) { this.successMessage = msg; setTimeout(() => this.successMessage = '', 3000); }
  
  exportToExcel() {
    const colonnes = ['Référence', 'Titre', 'Client', 'Date émission', 'Date validité', 'Montant HT', 'TVA', 'Montant TTC', 'Statut', 'Créé le'];
    const lignes = this.filteredDevis.map(d => [d.reference, d.titre || '', d.client_nom || '', new Date(d.date_emission).toLocaleDateString(), new Date(d.date_validite).toLocaleDateString(), d.montant_ht, d.tva, d.montant_ttc, this.getStatutLabel(d.statut), new Date(d.created_at).toLocaleDateString()]);
    const csvContent = [colonnes, ...lignes].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `devis_${new Date().toISOString().slice(0,19)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showSuccess('Export Excel effectué');
  }
  
  exportToPDF() {
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Liste des devis</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;margin-top:20px;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}.footer{text-align:center;margin-top:30px;font-size:12px;color:gray;}</style></head><body><h1>Liste des devis</h1><p>Généré le ${new Date().toLocaleString()}</p><table><thead><tr><th>Référence</th><th>Titre</th><th>Client</th><th>Date émission</th><th>Validité</th><th>Montant TTC</th><th>Statut</th></tr></thead><tbody>${this.filteredDevis.map(d => `<tr><td>${d.reference}</td><td>${d.titre || '-'}</td><td>${d.client_nom || '-'}</td><td>${new Date(d.date_emission).toLocaleDateString()}</td><td>${new Date(d.date_validite).toLocaleDateString()}</td><td>${d.montant_ttc.toLocaleString()} FCFA</td><td>${this.getStatutLabel(d.statut)}</td></tr>`).join('')}</tbody></table><div class="footer">PulseBusiness - Export devis</div></body></html>`;
    const win = window.open('', '_blank');
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert('Veuillez autoriser les pop-ups pour exporter en PDF'); }
  }
}