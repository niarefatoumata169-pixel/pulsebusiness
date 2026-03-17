import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface InventaireData {
  id?: number;
  reference: string;
  date: string;
  type: 'comptage' | 'ajustement' | 'inventaire_complet';
  statut: 'brouillon' | 'en_cours' | 'valide' | 'annule';
  responsable: string;
  emplacement?: string;
  date_debut?: string;
  date_fin?: string;
  notes?: string;
}

interface LigneInventaire {
  id?: number;
  inventaire_id: number;
  article_id: number;
  article_nom?: string;
  article_reference?: string;
  stock_theorique: number;
  stock_reel: number;
  ecart: number;
  ecart_valeur: number;
  prix_unitaire: number;
  motif_ecart?: string;
  valide: boolean;
}

@Component({
  selector: 'app-inventaire',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="inventaire-container">
      <div class="header">
        <div>
          <h1>Inventaire</h1>
          <p class="subtitle">{{ inventaires.length }} inventaire(s) • Écarts totaux: {{ totalEcarts | number }} FCFA</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouvel inventaire</button>
      </div>
      
      <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>
      
      <!-- Formulaire d'ajout -->
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouvel' }} inventaire</h3>
        <form (ngSubmit)="saveInventaire()" #inventaireForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Référence *</label>
              <input type="text" [(ngModel)]="newInventaire.reference" name="reference" required>
            </div>
            
            <div class="form-group">
              <label>Date *</label>
              <input type="date" [(ngModel)]="newInventaire.date" name="date" required>
            </div>
            
            <div class="form-group">
              <label>Type</label>
              <select [(ngModel)]="newInventaire.type" name="type" required>
                <option value="inventaire_complet">Inventaire complet</option>
                <option value="comptage">Comptage</option>
                <option value="ajustement">Ajustement</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Statut</label>
              <select [(ngModel)]="newInventaire.statut" name="statut" required>
                <option value="brouillon">Brouillon</option>
                <option value="en_cours">En cours</option>
                <option value="valide">Validé</option>
                <option value="annule">Annulé</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Responsable *</label>
              <input type="text" [(ngModel)]="newInventaire.responsable" name="responsable" required>
            </div>
            
            <div class="form-group">
              <label>Emplacement</label>
              <input type="text" [(ngModel)]="newInventaire.emplacement" name="emplacement">
            </div>
            
            <div class="form-group">
              <label>Date début</label>
              <input type="date" [(ngModel)]="newInventaire.date_debut" name="date_debut">
            </div>
            
            <div class="form-group">
              <label>Date fin</label>
              <input type="date" [(ngModel)]="newInventaire.date_fin" name="date_fin">
            </div>
            
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea [(ngModel)]="newInventaire.notes" name="notes" rows="3"></textarea>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-save">Créer l'inventaire</button>
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
          </div>
        </form>
      </div>
      
      <!-- Liste des inventaires -->
      <div class="inventaires-list" *ngIf="inventaires.length > 0; else emptyState">
        <div class="inventaire-card" *ngFor="let inv of inventaires">
          <div class="inventaire-header">
            <span class="inventaire-ref">{{ inv.reference }}</span>
            <span class="inventaire-badge" [class]="inv.statut">{{ getStatutLabel(inv.statut) }}</span>
          </div>
          <div class="inventaire-body">
            <p><span class="label">Date:</span> {{ inv.date | date }}</p>
            <p><span class="label">Type:</span> {{ getTypeLabel(inv.type) }}</p>
            <p><span class="label">Responsable:</span> {{ inv.responsable }}</p>
            <p><span class="label">Écarts:</span> <span class="ecart-count">{{ getEcartCount(inv.id) }}</span> article(s)</p>
            <p><span class="label">Valeur écarts:</span> <span class="ecart-valeur">{{ getEcartValeur(inv.id) | number }} FCFA</span></p>
          </div>
          <div class="inventaire-footer">
            <button class="btn-icon" (click)="startCounting(inv)" [disabled]="inv.statut === 'valide' || inv.statut === 'annule'">🔢 Compter</button>
            <button class="btn-icon" (click)="viewDetails(inv)">👁️</button>
            <button class="btn-icon" (click)="editInventaire(inv)">✏️</button>
            <button class="btn-icon" (click)="exportInventaire(inv)">📊</button>
            <button class="btn-icon delete" (click)="deleteInventaire(inv)">🗑️</button>
          </div>
        </div>
      </div>
      
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📊</div>
          <h2>Aucun inventaire</h2>
          <p>Créez votre premier inventaire</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouvel inventaire</button>
        </div>
      </ng-template>
      
      <!-- Modal de comptage -->
      <div class="modal" *ngIf="showCountingModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>Comptage - {{ currentInventaire?.reference }}</h3>
            <button class="btn-close" (click)="closeCountingModal()">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="counting-info">
              <p><strong>Type:</strong> {{ getTypeLabel(currentInventaire?.type || 'inventaire_complet') }}</p>
              <p><strong>Responsable:</strong> {{ currentInventaire?.responsable }}</p>
              <p><strong>Date début:</strong> {{ currentInventaire?.date_debut || currentInventaire?.date | date }}</p>
            </div>
            
            <div class="counting-filters">
              <input type="text" [(ngModel)]="articleSearch" placeholder="Rechercher un article..." class="search-input">
              <select [(ngModel)]="categorieFilter" (ngModelChange)="filterLignes()" class="filter-select">
                <option value="">Toutes catégories</option>
                <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
              </select>
            </div>
            
            <div class="counting-table-container">
              <table class="counting-table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Article</th>
                    <th>Catégorie</th>
                    <th>Stock théorique</th>
                    <th>Stock réel</th>
                    <th>Écart</th>
                    <th>Valeur écart</th>
                    <th>Validé</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let ligne of filteredLignes" [class.valide]="ligne.valide">
                    <td>{{ ligne.article_reference }}</td>
                    <td>{{ ligne.article_nom }}</td>
                    <td>{{ getCategorie(ligne.article_id) }}</td>
                    <td class="text-right">{{ ligne.stock_theorique }}</td>
                    <td>
                      <input type="number" [(ngModel)]="ligne.stock_reel" (input)="calculerEcart(ligne)" class="stock-input" [disabled]="ligne.valide">
                    </td>
                    <td [class.ecart-positif]="ligne.ecart > 0" [class.ecart-negatif]="ligne.ecart < 0" class="text-right">
                      {{ ligne.ecart > 0 ? '+' : '' }}{{ ligne.ecart }}
                    </td>
                    <td [class.ecart-positif]="ligne.ecart > 0" [class.ecart-negatif]="ligne.ecart < 0" class="text-right">
                      {{ ligne.ecart_valeur | number }} FCFA
                    </td>
                    <td class="text-center">
                      <input type="checkbox" [(ngModel)]="ligne.valide" (change)="onLigneValidee(ligne)" [disabled]="ligne.stock_reel === ligne.stock_theorique && ligne.valide">
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="counting-summary">
              <div class="summary-item">
                <span class="summary-label">Articles comptés:</span>
                <span class="summary-value">{{ getArticlesComptes() }} / {{ totalLignes }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Écart total:</span>
                <span class="summary-value" [class.ecart-positif]="totalEcartInventaire > 0" [class.ecart-negatif]="totalEcartInventaire < 0">
                  {{ totalEcartInventaire > 0 ? '+' : '' }}{{ totalEcartInventaire | number }} FCFA
                </span>
              </div>
            </div>
            
            <div class="counting-actions">
              <button class="btn-save" (click)="validerInventaire()" [disabled]="!canValiderInventaire()">✅ Valider l'inventaire</button>
              <button class="btn-cancel" (click)="closeCountingModal()">Fermer</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal de détails -->
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>Inventaire {{ selectedInventaire?.reference }}</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="details-info">
              <p><strong>Date:</strong> {{ selectedInventaire?.date | date }}</p>
              <p><strong>Type:</strong> {{ getTypeLabel(selectedInventaire?.type || 'inventaire_complet') }}</p>
              <p><strong>Statut:</strong> {{ getStatutLabel(selectedInventaire?.statut || 'brouillon') }}</p>
              <p><strong>Responsable:</strong> {{ selectedInventaire?.responsable }}</p>
              <!-- CORRECTION LIGNE 246 -->
              <p><strong>Période:</strong> {{ selectedInventaire?.date_debut | date }} - {{ selectedInventaire?.date_fin ? (selectedInventaire?.date_fin | date) : 'En cours' }}</p>
            </div>
            
            <table class="details-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Réf.</th>
                  <th>Théorique</th>
                  <th>Réel</th>
                  <th>Écart</th>
                  <th>Prix unitaire</th>
                  <th>Valeur écart</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let ligne of getLignes(selectedInventaire?.id)">
                  <td>{{ ligne.article_nom }}</td>
                  <td>{{ ligne.article_reference }}</td>
                  <td class="text-right">{{ ligne.stock_theorique }}</td>
                  <td class="text-right">{{ ligne.stock_reel }}</td>
                  <td [class.ecart-positif]="ligne.ecart > 0" [class.ecart-negatif]="ligne.ecart < 0" class="text-right">
                    {{ ligne.ecart > 0 ? '+' : '' }}{{ ligne.ecart }}
                  </td>
                  <td class="text-right">{{ ligne.prix_unitaire | number }} FCFA</td>
                  <td [class.ecart-positif]="ligne.ecart > 0" [class.ecart-negatif]="ligne.ecart < 0" class="text-right">
                    {{ ligne.ecart_valeur | number }} FCFA
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="6" class="text-right"><strong>Total écart:</strong></td>
                  <td [class.ecart-positif]="getTotalEcart(selectedInventaire?.id) > 0" [class.ecart-negatif]="getTotalEcart(selectedInventaire?.id) < 0" class="text-right">
                    {{ getTotalEcart(selectedInventaire?.id) | number }} FCFA
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .inventaire-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 0; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .alert-success { background: #10B981; color: white; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
    
    .form-card { background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #FCE7F3; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .full-width { grid-column: span 2; }
    .form-group { display: flex; flex-direction: column; }
    label { margin-bottom: 5px; color: #4B5563; }
    input, textarea, select { padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
    
    .inventaires-list { display: grid; gap: 15px; }
    .inventaire-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .inventaire-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .inventaire-ref { font-weight: 600; color: #1F2937; }
    .inventaire-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .inventaire-badge.brouillon { background: #9CA3AF; color: white; }
    .inventaire-badge.en_cours { background: #F59E0B; color: white; }
    .inventaire-badge.valide { background: #10B981; color: white; }
    .inventaire-badge.annule { background: #EF4444; color: white; }
    .inventaire-body p { margin: 5px 0; color: #6B7280; }
    .label { color: #4B5563; width: 80px; display: inline-block; }
    .ecart-count { font-weight: 600; color: #EC4899; }
    .ecart-valeur { font-weight: 600; color: #F59E0B; }
    .inventaire-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #FCE7F3; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 400px; width: 90%; max-height: 80vh; overflow-y: auto; }
    .modal-content.large { max-width: 1000px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #6B7280; }
    
    .counting-info { display: flex; gap: 30px; padding: 15px; background: #FDF2F8; border-radius: 8px; margin-bottom: 20px; }
    .counting-filters { display: flex; gap: 15px; margin-bottom: 20px; }
    .search-input { flex: 2; padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    .filter-select { flex: 1; padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    
    .counting-table-container { max-height: 400px; overflow-y: auto; margin-bottom: 20px; }
    .counting-table { width: 100%; border-collapse: collapse; }
    .counting-table th { background: #FDF2F8; padding: 12px; text-align: left; position: sticky; top: 0; background: #FDF2F8; }
    .counting-table td { padding: 12px; border-bottom: 1px solid #FCE7F3; }
    .counting-table tr.valide { background: #F0FDF4; }
    
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .stock-input { width: 100px; padding: 5px; border: 2px solid #FCE7F3; border-radius: 4px; }
    
    .ecart-positif { color: #10B981; font-weight: 600; }
    .ecart-negatif { color: #EF4444; font-weight: 600; }
    
    .counting-summary { display: flex; justify-content: space-between; padding: 15px; background: #FDF2F8; border-radius: 8px; margin-bottom: 20px; }
    .summary-label { color: #4B5563; }
    .summary-value { font-weight: 600; font-size: 16px; margin-left: 10px; }
    
    .counting-actions { display: flex; justify-content: flex-end; gap: 15px; }
    
    .details-info { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; padding: 15px; background: #FDF2F8; border-radius: 8px; margin-bottom: 20px; }
    .details-table { width: 100%; border-collapse: collapse; }
    .details-table th { background: #FDF2F8; padding: 12px; text-align: left; }
    .details-table td { padding: 12px; border-bottom: 1px solid #FCE7F3; }
    .details-table tfoot td { font-weight: 600; border-top: 2px solid #FCE7F3; }
  `]
})
export class Inventaire implements OnInit {
  articles: any[] = [];
  categories: string[] = [];
  inventaires: InventaireData[] = [];
  lignes: LigneInventaire[] = [];
  
  newInventaire: Partial<InventaireData> = {
    reference: 'INV-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
    date: new Date().toISOString().split('T')[0],
    type: 'inventaire_complet',
    statut: 'brouillon',
    responsable: '',
    emplacement: '',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: '',
    notes: ''
  };
  
  currentInventaire: InventaireData | null = null;
  selectedInventaire: InventaireData | null = null;
  lignesInventaire: LigneInventaire[] = [];
  filteredLignes: LigneInventaire[] = [];
  
  articleSearch = '';
  categorieFilter = '';
  showForm = false;
  editMode = false;
  showCountingModal = false;
  showDetailsModal = false;
  successMessage = '';
  
  totalEcartInventaire = 0;
  totalLignes = 0;
  totalEcarts = 0;
  
  ngOnInit() {
    this.loadArticles();
    this.loadInventaires();
    this.loadLignes();
    this.calculerTotalEcarts();
  }
  
  loadArticles() {
    const saved = localStorage.getItem('articles');
    this.articles = saved ? JSON.parse(saved) : [];
    
    const cats = new Set(this.articles.map((a: any) => a.categorie_nom).filter(c => c));
    this.categories = Array.from(cats) as string[];
  }
  
  loadInventaires() {
    const saved = localStorage.getItem('inventaires');
    this.inventaires = saved ? JSON.parse(saved) : [];
  }
  
  loadLignes() {
    const saved = localStorage.getItem('lignes_inventaire');
    this.lignes = saved ? JSON.parse(saved) : [];
  }
  
  saveInventaire() {
    if (this.editMode && this.newInventaire.id) {
      const index = this.inventaires.findIndex(i => i.id === this.newInventaire.id);
      if (index !== -1) {
        this.inventaires[index] = this.newInventaire as InventaireData;
        this.showMessage('Inventaire modifié !');
      }
    } else {
      const newInventaire: InventaireData = {
        id: Date.now(),
        reference: this.newInventaire.reference || 'INV-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
        date: this.newInventaire.date || new Date().toISOString().split('T')[0],
        type: this.newInventaire.type as 'comptage' | 'ajustement' | 'inventaire_complet' || 'inventaire_complet',
        statut: this.newInventaire.statut as 'brouillon' | 'en_cours' | 'valide' | 'annule' || 'brouillon',
        responsable: this.newInventaire.responsable || '',
        emplacement: this.newInventaire.emplacement,
        date_debut: this.newInventaire.date_debut,
        date_fin: this.newInventaire.date_fin,
        notes: this.newInventaire.notes
      };
      this.inventaires.push(newInventaire);
      this.genererLignesInventaire(newInventaire);
      this.showMessage('Inventaire créé !');
    }
    
    localStorage.setItem('inventaires', JSON.stringify(this.inventaires));
    this.cancelForm();
  }
  
  genererLignesInventaire(inventaire: InventaireData) {
    const nouvellesLignes = this.articles.map(article => ({
      id: Date.now() + article.id,
      inventaire_id: inventaire.id!,
      article_id: article.id,
      article_nom: article.nom,
      article_reference: article.reference,
      stock_theorique: article.stock_actuel || 0,
      stock_reel: article.stock_actuel || 0,
      ecart: 0,
      ecart_valeur: 0,
      prix_unitaire: article.prix_achat || 0,
      motif_ecart: '',
      valide: false
    }));
    
    this.lignes = [...this.lignes, ...nouvellesLignes];
    localStorage.setItem('lignes_inventaire', JSON.stringify(this.lignes));
  }
  
  startCounting(inv: InventaireData) {
    this.currentInventaire = inv;
    this.lignesInventaire = this.lignes.filter(l => l.inventaire_id === inv.id);
    this.filterLignes();
    this.calculerEcartTotal();
    this.totalLignes = this.lignesInventaire.length;
    this.showCountingModal = true;
  }
  
  filterLignes() {
    let filtered = this.lignesInventaire;
    
    if (this.articleSearch) {
      const term = this.articleSearch.toLowerCase();
      filtered = filtered.filter(l => 
        l.article_nom?.toLowerCase().includes(term) ||
        l.article_reference?.toLowerCase().includes(term)
      );
    }
    
    if (this.categorieFilter) {
      filtered = filtered.filter(l => {
        const article = this.articles.find(a => a.id === l.article_id);
        return article?.categorie_nom === this.categorieFilter;
      });
    }
    
    this.filteredLignes = filtered;
  }
  
  calculerEcart(ligne: LigneInventaire) {
    ligne.ecart = ligne.stock_reel - ligne.stock_theorique;
    ligne.ecart_valeur = ligne.ecart * ligne.prix_unitaire;
    this.calculerEcartTotal();
  }
  
  calculerEcartTotal() {
    this.totalEcartInventaire = this.lignesInventaire.reduce((sum, l) => sum + (l.ecart_valeur || 0), 0);
  }
  
  onLigneValidee(ligne: LigneInventaire) {
    localStorage.setItem('lignes_inventaire', JSON.stringify(this.lignes));
    this.calculerEcartTotal();
  }
  
  getArticlesComptes(): number {
    return this.lignesInventaire.filter(l => l.valide).length;
  }
  
  canValiderInventaire(): boolean {
    return this.lignesInventaire.every(l => l.valide);
  }
  
  validerInventaire() {
    if (!this.canValiderInventaire()) {
      alert('Toutes les lignes doivent être validées avant de clôturer l\'inventaire.');
      return;
    }
    
    this.lignesInventaire.forEach(ligne => {
      if (ligne.ecart !== 0) {
        const articleIndex = this.articles.findIndex(a => a.id === ligne.article_id);
        if (articleIndex !== -1) {
          this.articles[articleIndex].stock_actuel = ligne.stock_reel;
        }
      }
    });
    
    localStorage.setItem('articles', JSON.stringify(this.articles));
    
    const invIndex = this.inventaires.findIndex(i => i.id === this.currentInventaire?.id);
    if (invIndex !== -1 && this.currentInventaire) {
      this.inventaires[invIndex].statut = 'valide';
      this.inventaires[invIndex].date_fin = new Date().toISOString().split('T')[0];
      localStorage.setItem('inventaires', JSON.stringify(this.inventaires));
    }
    
    this.showCountingModal = false;
    this.showMessage('✅ Inventaire validé et stocks mis à jour !');
  }
  
  closeCountingModal() {
    this.showCountingModal = false;
    this.currentInventaire = null;
    this.articleSearch = '';
    this.categorieFilter = '';
  }
  
  viewDetails(inv: InventaireData) {
    this.selectedInventaire = inv;
    this.showDetailsModal = true;
  }
  
  editInventaire(inv: InventaireData) {
    this.newInventaire = { ...inv };
    this.editMode = true;
    this.showForm = true;
  }
  
  exportInventaire(inv: InventaireData) {
    alert('Export Excel - Fonction à venir');
  }
  
  deleteInventaire(inv: InventaireData) {
    if (confirm('Supprimer cet inventaire ?')) {
      this.inventaires = this.inventaires.filter(i => i.id !== inv.id);
      this.lignes = this.lignes.filter(l => l.inventaire_id !== inv.id);
      localStorage.setItem('inventaires', JSON.stringify(this.inventaires));
      localStorage.setItem('lignes_inventaire', JSON.stringify(this.lignes));
      this.calculerTotalEcarts();
      this.showMessage('Inventaire supprimé !');
    }
  }
  
  getLignes(inventaireId?: number): LigneInventaire[] {
    if (!inventaireId) return [];
    return this.lignes.filter(l => l.inventaire_id === inventaireId);
  }
  
  getEcartCount(inventaireId?: number): number {
    if (!inventaireId) return 0;
    return this.lignes.filter(l => l.inventaire_id === inventaireId && l.ecart !== 0).length;
  }
  
  getEcartValeur(inventaireId?: number): number {
    if (!inventaireId) return 0;
    return this.lignes
      .filter(l => l.inventaire_id === inventaireId)
      .reduce((sum, l) => sum + Math.abs(l.ecart_valeur || 0), 0);
  }
  
  getTotalEcart(inventaireId?: number): number {
    if (!inventaireId) return 0;
    return this.lignes
      .filter(l => l.inventaire_id === inventaireId)
      .reduce((sum, l) => sum + (l.ecart_valeur || 0), 0);
  }
  
  calculerTotalEcarts() {
    this.totalEcarts = this.lignes.reduce((sum, l) => sum + Math.abs(l.ecart_valeur || 0), 0);
  }
  
  getCategorie(articleId: number): string {
    const article = this.articles.find(a => a.id === articleId);
    return article?.categorie_nom || '-';
  }
  
  cancelForm() {
    this.newInventaire = {
      reference: 'INV-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      date: new Date().toISOString().split('T')[0],
      type: 'inventaire_complet',
      statut: 'brouillon',
      responsable: '',
      emplacement: '',
      date_debut: new Date().toISOString().split('T')[0],
      date_fin: '',
      notes: ''
    };
    this.showForm = false;
    this.editMode = false;
  }
  
  getTypeLabel(type: string): string {
    const labels: any = { 
      comptage: 'Comptage', 
      ajustement: 'Ajustement', 
      inventaire_complet: 'Inventaire complet' 
    };
    return labels[type] || type;
  }
  
  getStatutLabel(statut: string): string {
    const labels: any = { 
      brouillon: 'Brouillon', 
      en_cours: 'En cours', 
      valide: 'Validé', 
      annule: 'Annulé' 
    };
    return labels[statut] || statut;
  }
  
  showMessage(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
