import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface DevisData {
  id?: number;
  numero: string;
  client_id?: number;
  client_nom?: string;
  date_creation: string;
  date_validite: string;
  montant_ht: number;
  montant_ttc: number;
  statut: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire';
  notes?: string;
  articles?: DevisArticle[];
}

interface DevisArticle {
  id?: number;
  devis_id?: number;
  article_id?: number;
  article_nom?: string;
  quantite: number;
  prix_unitaire: number;
  taux_tva: number;
  montant_ht: number;
  montant_ttc: number;
}

@Component({
  selector: 'app-devis',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="devis-container">
      <div class="header">
        <div>
          <h1>Devis</h1>
          <p class="subtitle">{{ devis.length }} devis • Montant total: {{ totalDevis | number }} FCFA</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouveau devis</button>
      </div>
      
      <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>
      
      <!-- Formulaire d'ajout -->
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouveau' }} devis</h3>
        <form (ngSubmit)="saveDevis()" #devisForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Client *</label>
              <select [(ngModel)]="newDevis.client_id" name="client_id" required (change)="onClientChange()">
                <option value="">Sélectionner un client</option>
                <option *ngFor="let c of clients" [value]="c.id">{{ c.raison_sociale || c.nom + ' ' + (c.prenom || '') }}</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Date de création</label>
              <input type="date" [(ngModel)]="newDevis.date_creation" name="date_creation" required>
            </div>
            
            <div class="form-group">
              <label>Date de validité</label>
              <input type="date" [(ngModel)]="newDevis.date_validite" name="date_validite" required>
            </div>
            
            <div class="form-group">
              <label>Statut</label>
              <select [(ngModel)]="newDevis.statut" name="statut">
                <option value="brouillon">Brouillon</option>
                <option value="envoye">Envoyé</option>
                <option value="accepte">Accepté</option>
                <option value="refuse">Refusé</option>
                <option value="expire">Expiré</option>
              </select>
            </div>
          </div>
          
          <!-- Articles -->
          <div class="articles-section">
            <h4>Articles</h4>
            <table class="articles-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>TVA %</th>
                  <th>Montant HT</th>
                  <th>Montant TTC</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let article of newDevis.articles; let i = index">
                  <td>
                    <select [(ngModel)]="article.article_id" name="article_{i}" (change)="onArticleChange(article)">
                      <option value="">Sélectionner</option>
                      <option *ngFor="let a of articles" [value]="a.id">{{ a.nom }} ({{ a.reference }})</option>
                    </select>
                  </td>
                  <td><input type="number" [(ngModel)]="article.quantite" name="qte_{i}" (input)="calculerArticle(article)"></td>
                  <td><input type="number" [(ngModel)]="article.prix_unitaire" name="prix_{i}" (input)="calculerArticle(article)"></td>
                  <td><input type="number" [(ngModel)]="article.taux_tva" name="tva_{i}" (input)="calculerArticle(article)"></td>
                  <td class="text-right">{{ article.montant_ht | number }}</td>
                  <td class="text-right">{{ article.montant_ttc | number }}</td>
                  <td><button type="button" class="btn-remove" (click)="removeArticle(i)">🗑️</button></td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="text-right"><strong>Totaux:</strong></td>
                  <td class="text-right"><strong>{{ getTotalHT() | number }}</strong></td>
                  <td class="text-right"><strong>{{ getTotalTTC() | number }}</strong></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
            <button type="button" class="btn-add-article" (click)="addArticle()">+ Ajouter un article</button>
          </div>
          
          <div class="form-group">
            <label>Notes</label>
            <textarea [(ngModel)]="newDevis.notes" name="notes" rows="3"></textarea>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-save">Enregistrer</button>
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
          </div>
        </form>
      </div>
      
      <!-- Filtres -->
      <div class="filters-bar" *ngIf="devis.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterDevis()" placeholder="Rechercher...">
        </div>
        
        <select [(ngModel)]="statutFilter" (ngModelChange)="filterDevis()" class="filter-select">
          <option value="">Tous statuts</option>
          <option value="brouillon">Brouillon</option>
          <option value="envoye">Envoyé</option>
          <option value="accepte">Accepté</option>
          <option value="refuse">Refusé</option>
          <option value="expire">Expiré</option>
        </select>
        
        <select [(ngModel)]="dateFilter" (ngModelChange)="filterDevis()" class="filter-select">
          <option value="">Toutes dates</option>
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
        </select>
      </div>
      
      <!-- Liste des devis -->
      <div class="devis-list" *ngIf="filteredDevis.length > 0; else emptyState">
        <div class="devis-card" *ngFor="let d of filteredDevis" [class.expire]="isExpire(d)">
          <div class="devis-header">
            <span class="devis-numero">{{ d.numero }}</span>
            <span class="devis-badge" [class]="d.statut">{{ getStatutLabel(d.statut) }}</span>
          </div>
          <div class="devis-body">
            <p><span class="label">Client:</span> {{ d.client_nom || '-' }}</p>
            <p><span class="label">Date:</span> {{ d.date_creation | date }}</p>
            <p><span class="label">Valable jusqu'au:</span> {{ d.date_validite | date }}</p>
            <p><span class="label">Montant TTC:</span> {{ d.montant_ttc | number }} FCFA</p>
            <p *ngIf="isExpire(d)" class="expire-warning">⚠️ Devis expiré</p>
          </div>
          <div class="devis-footer">
            <button class="btn-icon" (click)="viewDevis(d)" title="Voir détails">👁️</button>
            <button class="btn-icon" (click)="editDevis(d)" title="Modifier">✏️</button>
            <button class="btn-icon" (click)="duplicateDevis(d)" title="Dupliquer">📋</button>
            <button class="btn-icon" (click)="exportPDF(d)" title="Exporter PDF">📄</button>
            <button class="btn-icon send" *ngIf="d.statut === 'brouillon'" (click)="sendDevis(d)" title="Envoyer">📤</button>
            <button class="btn-icon delete" (click)="deleteDevis(d)" title="Supprimer">🗑️</button>
          </div>
        </div>
      </div>
      
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h2>Aucun devis</h2>
          <p>Créez votre premier devis</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouveau devis</button>
        </div>
      </ng-template>
      
      <!-- Modal de détails -->
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>Devis {{ selectedDevis?.numero }}</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          
          <div class="modal-body" *ngIf="selectedDevis">
            <div class="details-header">
              <div class="client-info">
                <h4>Client</h4>
                <p><strong>{{ selectedDevis.client_nom }}</strong></p>
              </div>
              <div class="devis-info">
                <p><strong>Date création:</strong> {{ selectedDevis.date_creation | date }}</p>
                <p><strong>Date validité:</strong> {{ selectedDevis.date_validite | date }}</p>
                <p><strong>Statut:</strong> <span class="badge" [class]="selectedDevis.statut">{{ getStatutLabel(selectedDevis.statut) }}</span></p>
              </div>
            </div>
            
            <table class="details-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Qté</th>
                  <th>Prix unitaire</th>
                  <th>TVA</th>
                  <th>Montant HT</th>
                  <th>Montant TTC</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let article of getArticles(selectedDevis.id)">
                  <td>{{ article.article_nom }}</td>
                  <td class="text-right">{{ article.quantite }}</td>
                  <td class="text-right">{{ article.prix_unitaire | number }}</td>
                  <td class="text-right">{{ article.taux_tva }}%</td>
                  <td class="text-right">{{ article.montant_ht | number }}</td>
                  <td class="text-right">{{ article.montant_ttc | number }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="text-right"><strong>Totaux:</strong></td>
                  <td class="text-right"><strong>{{ selectedDevis.montant_ht | number }}</strong></td>
                  <td class="text-right"><strong>{{ selectedDevis.montant_ttc | number }}</strong></td>
                </tr>
              </tfoot>
            </table>
            
            <div class="notes-section" *ngIf="selectedDevis.notes">
              <h4>Notes</h4>
              <p>{{ selectedDevis.notes }}</p>
            </div>
            
            <div class="modal-actions">
              <button class="btn-save" (click)="convertToFacture(selectedDevis)">📄 Convertir en facture</button>
              <button class="btn-cancel" (click)="showDetailsModal = false">Fermer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .devis-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 0; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .alert-success { background: #10B981; color: white; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
    
    /* Formulaire */
    .form-card { background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #FCE7F3; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }
    .form-group { display: flex; flex-direction: column; }
    label { margin-bottom: 5px; color: #4B5563; }
    input, textarea, select { padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
    
    /* Articles */
    .articles-section { margin: 20px 0; }
    .articles-section h4 { color: #EC4899; margin-bottom: 15px; }
    .articles-table { width: 100%; border-collapse: collapse; }
    .articles-table th { background: #FDF2F8; padding: 12px; text-align: left; }
    .articles-table td { padding: 8px; border-bottom: 1px solid #FCE7F3; }
    .articles-table input, .articles-table select { width: 100%; padding: 6px; border: 1px solid #FCE7F3; border-radius: 4px; }
    .btn-remove { background: none; border: 1px solid #FCE7F3; border-radius: 4px; padding: 4px 8px; cursor: pointer; }
    .btn-add-article { margin-top: 10px; background: white; border: 2px solid #EC4899; color: #EC4899; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
    .text-right { text-align: right; }
    
    /* Filtres */
    .filters-bar { display: flex; gap: 15px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 2; background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; }
    .filter-select { flex: 1; padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    
    /* Liste */
    .devis-list { display: grid; gap: 15px; }
    .devis-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .devis-card.expire { border-left: 4px solid #EF4444; }
    .devis-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .devis-numero { font-weight: 600; color: #1F2937; }
    .devis-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .devis-badge.brouillon { background: #9CA3AF; color: white; }
    .devis-badge.envoye { background: #F59E0B; color: white; }
    .devis-badge.accepte { background: #10B981; color: white; }
    .devis-badge.refuse { background: #EF4444; color: white; }
    .devis-badge.expire { background: #6B7280; color: white; }
    .devis-body p { margin: 5px 0; color: #6B7280; }
    .label { color: #4B5563; width: 120px; display: inline-block; }
    .expire-warning { color: #EF4444; font-weight: 500; margin-top: 8px; }
    .devis-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #FCE7F3; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.send { color: #EC4899; border-color: #EC4899; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    
    /* Empty state */
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .empty-state h2 { color: #1F2937; margin-bottom: 8px; }
    .empty-state p { color: #6B7280; margin-bottom: 20px; }
    
    /* Modal */
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; }
    .modal-content.large { max-width: 900px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #6B7280; }
    .details-header { display: flex; justify-content: space-between; margin-bottom: 20px; padding: 15px; background: #FDF2F8; border-radius: 8px; }
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .details-table th { background: #FDF2F8; padding: 12px; text-align: left; }
    .details-table td { padding: 12px; border-bottom: 1px solid #FCE7F3; }
    .details-table tfoot td { font-weight: 600; border-top: 2px solid #FCE7F3; }
    .notes-section { margin-top: 20px; padding: 15px; background: #F9FAFB; border-radius: 8px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
  `]
})
export class Devis implements OnInit {
  clients: any[] = [];
  articles: any[] = [];
  devis: DevisData[] = [];
  devisArticles: DevisArticle[] = [];
  filteredDevis: DevisData[] = [];
  selectedDevis: DevisData | null = null;
  
  newDevis: Partial<DevisData> & { articles: Partial<DevisArticle>[] } = {
    numero: 'DEV-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(4, '0'),
    client_id: undefined,
    date_creation: new Date().toISOString().split('T')[0],
    date_validite: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    montant_ht: 0,
    montant_ttc: 0,
    statut: 'brouillon',
    notes: '',
    articles: [this.createEmptyArticle() as DevisArticle]
  };
  
  searchTerm = '';
  statutFilter = '';
  dateFilter = '';
  showForm = false;
  editMode = false;
  showDetailsModal = false;
  successMessage = '';
  totalDevis = 0;
  
  ngOnInit() {
    this.loadClients();
    this.loadArticles();
    this.loadDevis();
    this.loadDevisArticles();
    this.calculerTotalGlobal();
  }
  
  loadClients() {
    const saved = localStorage.getItem('clients');
    this.clients = saved ? JSON.parse(saved) : [];
  }
  
  loadArticles() {
    const saved = localStorage.getItem('articles');
    this.articles = saved ? JSON.parse(saved) : [];
  }
  
  loadDevis() {
    const saved = localStorage.getItem('devis');
    this.devis = saved ? JSON.parse(saved) : [];
    this.filteredDevis = [...this.devis];
  }
  
  loadDevisArticles() {
    const saved = localStorage.getItem('devis_articles');
    this.devisArticles = saved ? JSON.parse(saved) : [];
  }
  
  createEmptyArticle(): Partial<DevisArticle> {
    return {
      article_id: undefined,
      quantite: 1,
      prix_unitaire: 0,
      taux_tva: 18,
      montant_ht: 0,
      montant_ttc: 0
    };
  }
  
  addArticle() {
    this.newDevis.articles?.push(this.createEmptyArticle() as DevisArticle);
  }
  
  removeArticle(index: number) {
    if (this.newDevis.articles && this.newDevis.articles.length > 1) {
      this.newDevis.articles.splice(index, 1);
      this.calculerTotaux();
    }
  }
  
  onClientChange() {
    const client = this.clients.find(c => c.id === Number(this.newDevis.client_id));
    if (client) {
      this.newDevis.client_nom = client.raison_sociale || client.nom + ' ' + (client.prenom || '');
    }
  }
  
  onArticleChange(article: Partial<DevisArticle>) {
    const selectedArticle = this.articles.find(a => a.id === Number(article.article_id));
    if (selectedArticle) {
      article.article_nom = selectedArticle.nom;
      article.prix_unitaire = selectedArticle.prix_vente || 0;
      this.calculerArticle(article);
    }
  }
  
  calculerArticle(article: Partial<DevisArticle>) {
    const quantite = article.quantite || 0;
    const prix = article.prix_unitaire || 0;
    const tva = (article.taux_tva || 0) / 100;
    
    article.montant_ht = quantite * prix;
    article.montant_ttc = article.montant_ht * (1 + tva);
    
    this.calculerTotaux();
  }
  
  calculerTotaux() {
    let totalHT = 0;
    let totalTTC = 0;
    
    this.newDevis.articles?.forEach(article => {
      totalHT += article.montant_ht || 0;
      totalTTC += article.montant_ttc || 0;
    });
    
    this.newDevis.montant_ht = totalHT;
    this.newDevis.montant_ttc = totalTTC;
  }
  
  calculerTotalGlobal() {
    this.totalDevis = this.devis.reduce((sum, d) => sum + (d.montant_ttc || 0), 0);
  }
  
  getTotalHT(): number {
    return this.newDevis.montant_ht || 0;
  }
  
  getTotalTTC(): number {
    return this.newDevis.montant_ttc || 0;
  }
  
  saveDevis() {
    if (this.editMode && this.newDevis.id) {
      const index = this.devis.findIndex(d => d.id === this.newDevis.id);
      if (index !== -1) {
        const updatedDevis: DevisData = {
          id: this.newDevis.id,
          numero: this.newDevis.numero || '',
          client_id: this.newDevis.client_id,
          client_nom: this.newDevis.client_nom,
          date_creation: this.newDevis.date_creation || new Date().toISOString().split('T')[0],
          date_validite: this.newDevis.date_validite || new Date().toISOString().split('T')[0],
          montant_ht: this.newDevis.montant_ht || 0,
          montant_ttc: this.newDevis.montant_ttc || 0,
          statut: this.newDevis.statut as 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire' || 'brouillon',
          notes: this.newDevis.notes
        };
        this.devis[index] = updatedDevis;
        
        this.devisArticles = this.devisArticles.filter(a => a.devis_id !== this.newDevis.id);
        
        this.newDevis.articles?.forEach((article, i) => {
          if (article.article_id) {
            const newArticle: DevisArticle = {
              id: Date.now() + i,
              devis_id: this.newDevis.id,
              article_id: article.article_id,
              article_nom: article.article_nom,
              quantite: article.quantite || 0,
              prix_unitaire: article.prix_unitaire || 0,
              taux_tva: article.taux_tva || 18,
              montant_ht: article.montant_ht || 0,
              montant_ttc: article.montant_ttc || 0
            };
            this.devisArticles.push(newArticle);
          }
        });
        
        this.showMessage('Devis modifié !');
      }
    } else {
      const newDevisId = Date.now();
      const newDevis: DevisData = {
        id: newDevisId,
        numero: this.newDevis.numero || 'DEV-' + new Date().getFullYear() + '-' + String(this.devis.length + 1).padStart(4, '0'),
        client_id: this.newDevis.client_id,
        client_nom: this.newDevis.client_nom,
        date_creation: this.newDevis.date_creation || new Date().toISOString().split('T')[0],
        date_validite: this.newDevis.date_validite || new Date().toISOString().split('T')[0],
        montant_ht: this.newDevis.montant_ht || 0,
        montant_ttc: this.newDevis.montant_ttc || 0,
        statut: this.newDevis.statut as 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire' || 'brouillon',
        notes: this.newDevis.notes
      };
      this.devis.push(newDevis);
      
      this.newDevis.articles?.forEach((article, i) => {
        if (article.article_id) {
          const newArticle: DevisArticle = {
            id: Date.now() + i + 1,
            devis_id: newDevisId,
            article_id: article.article_id,
            article_nom: article.article_nom,
            quantite: article.quantite || 0,
            prix_unitaire: article.prix_unitaire || 0,
            taux_tva: article.taux_tva || 18,
            montant_ht: article.montant_ht || 0,
            montant_ttc: article.montant_ttc || 0
          };
          this.devisArticles.push(newArticle);
        }
      });
      
      this.showMessage('Devis créé !');
    }
    
    localStorage.setItem('devis', JSON.stringify(this.devis));
    localStorage.setItem('devis_articles', JSON.stringify(this.devisArticles));
    this.filterDevis();
    this.calculerTotalGlobal();
    this.cancelForm();
  }
  
  editDevis(d: DevisData) {
    this.newDevis = { 
      ...d, 
      articles: this.getArticles(d.id).map(a => ({ ...a }))
    };
    this.editMode = true;
    this.showForm = true;
  }
  
  duplicateDevis(d: DevisData) {
    const newDevisId = Date.now();
    const newDevis: DevisData = {
      ...d,
      id: newDevisId,
      numero: d.numero + '-COPY',
      statut: 'brouillon'
    };
    this.devis.push(newDevis);
    
    const articles = this.getArticles(d.id);
    articles.forEach((article, i) => {
      const newArticle: DevisArticle = {
        ...article,
        id: Date.now() + i + 1,
        devis_id: newDevisId
      };
      this.devisArticles.push(newArticle);
    });
    
    localStorage.setItem('devis', JSON.stringify(this.devis));
    localStorage.setItem('devis_articles', JSON.stringify(this.devisArticles));
    this.filterDevis();
    this.calculerTotalGlobal();
    this.showMessage('Devis dupliqué !');
  }
  
  deleteDevis(d: DevisData) {
    if (confirm('Supprimer ce devis ?')) {
      this.devis = this.devis.filter(dev => dev.id !== d.id);
      this.devisArticles = this.devisArticles.filter(a => a.devis_id !== d.id);
      localStorage.setItem('devis', JSON.stringify(this.devis));
      localStorage.setItem('devis_articles', JSON.stringify(this.devisArticles));
      this.filterDevis();
      this.calculerTotalGlobal();
      this.showMessage('Devis supprimé !');
    }
  }
  
  viewDevis(d: DevisData) {
    this.selectedDevis = d;
    this.showDetailsModal = true;
  }
  
  sendDevis(d: DevisData) {
    d.statut = 'envoye';
    localStorage.setItem('devis', JSON.stringify(this.devis));
    this.filterDevis();
    this.showMessage('Devis envoyé au client !');
  }
  
  exportPDF(d: DevisData) {
    alert('Export PDF - Fonctionnalité à venir');
  }
  
  convertToFacture(d: DevisData) {
    alert('Conversion en facture - Fonctionnalité à venir');
  }
  
  cancelForm() {
    this.newDevis = {
      numero: 'DEV-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(4, '0'),
      client_id: undefined,
      date_creation: new Date().toISOString().split('T')[0],
      date_validite: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      montant_ht: 0,
      montant_ttc: 0,
      statut: 'brouillon',
      notes: '',
      articles: [this.createEmptyArticle() as DevisArticle]
    };
    this.showForm = false;
    this.editMode = false;
  }
  
  filterDevis() {
    let filtered = this.devis;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.numero?.toLowerCase().includes(term) ||
        d.client_nom?.toLowerCase().includes(term)
      );
    }
    
    if (this.statutFilter) {
      filtered = filtered.filter(d => d.statut === this.statutFilter);
    }
    
    if (this.dateFilter) {
      const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      filtered = filtered.filter(d => {
        const date = new Date(d.date_creation);
        switch(this.dateFilter) {
          case 'today':
            return date.toDateString() === new Date().toDateString();
          case 'week':
            return date >= startOfWeek;
          case 'month':
            return date >= startOfMonth;
          default:
            return true;
        }
      });
    }
    
    this.filteredDevis = filtered;
  }
  
  getArticles(devisId?: number): DevisArticle[] {
    if (!devisId) return [];
    return this.devisArticles.filter(a => a.devis_id === devisId);
  }
  
  isExpire(d: DevisData): boolean {
    return d.statut !== 'accepte' && d.statut !== 'refuse' && new Date(d.date_validite) < new Date();
  }
  
  getStatutLabel(statut: string): string {
    const labels: any = { 
      brouillon: 'Brouillon', 
      envoye: 'Envoyé', 
      accepte: 'Accepté', 
      refuse: 'Refusé', 
      expire: 'Expiré' 
    };
    return labels[statut] || statut;
  }
  
  showMessage(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
