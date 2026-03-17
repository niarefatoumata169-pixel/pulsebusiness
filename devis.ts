import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Client, Devis as DevisModel, DevisArticle } from '../../../services/api/api.service';

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

@Component({
  selector: 'app-devis',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="devis-container">
      <div class="header">
        <h1>Gestion des devis</h1>
        <button class="btn-primary" (click)="showForm = !showForm">
          {{ showForm ? 'Annuler' : '+ Nouveau devis' }}
        </button>
      </div>

      <!-- Liste des devis -->
      <div class="devis-grid" *ngIf="!showForm">
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-value">{{ devis.length }}</span>
            <span class="stat-label">Total devis</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ devisEnCours }}</span>
            <span class="stat-label">En cours</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ devisAcceptes }}</span>
            <span class="stat-label">Acceptés</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ totalMontant | number }} FCFA</span>
            <span class="stat-label">Montant total</span>
          </div>
        </div>

        <div class="table-controls">
          <input type="text" [(ngModel)]="searchTerm" placeholder="🔍 Rechercher...">
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>N°</th>
                <th>Client</th>
                <th>Date</th>
                <th>Validité</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of filteredDevis">
                <td><strong>{{ d.numero }}</strong></td>
                <td>{{ d.client_nom || '-' }}</td>
                <td>{{ d.date_creation | date }}</td>
                <td>{{ d.date_validite | date }}</td>
                <td>{{ d.montant_ttc | number }} FCFA</td>
                <td>
                  <span class="badge" [ngClass]="d.statut">
                    {{ getStatutLabel(d.statut) }}
                  </span>
                </td>
                <td class="actions">
                  <button class="btn-icon" (click)="editDevis(d)">✏️</button>
                  <button class="btn-icon" (click)="deleteDevis(d)">🗑️</button>
                </td>
              </tr>
              <tr *ngIf="filteredDevis.length === 0">
                <td colspan="7" class="empty-msg">Aucun devis trouvé</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Formulaire nouveau devis -->
      <div class="form-card" *ngIf="showForm">
        <h2>{{ editMode ? 'Modifier' : 'Nouveau' }} devis</h2>
        
        <div class="form-section">
          <h3>Informations générales</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Client *</label>
              <select [(ngModel)]="newDevis.client_id" (change)="onClientChange()">
                <option value="">Sélectionner un client</option>
                <option *ngFor="let c of clients" [value]="c.id">{{ c.nom }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Date de création</label>
              <input type="date" [(ngModel)]="newDevis.date_creation">
            </div>
            <div class="form-group">
              <label>Date de validité</label>
              <input type="date" [(ngModel)]="newDevis.date_validite">
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Articles</h3>
          <div class="articles-list">
            <div *ngFor="let article of articles; let i = index" class="article-row">
              <input type="text" [(ngModel)]="article.article_nom" placeholder="Description">
              <input type="number" [(ngModel)]="article.quantite" placeholder="Qté" (input)="calculerArticle(i)">
              <input type="number" [(ngModel)]="article.prix_unitaire" placeholder="Prix unitaire" (input)="calculerArticle(i)">
              <input type="number" [(ngModel)]="article.taux_tva" placeholder="TVA %" (input)="calculerArticle(i)">
              <span class="montant">{{ article.montant_ht | number }} FCFA</span>
              <button class="btn-remove" (click)="removeArticle(i)">🗑️</button>
            </div>
          </div>
          <button class="btn-add" (click)="addArticle()">+ Ajouter un article</button>
        </div>

        <div class="totaux">
          <div class="total-row">
            <span>Total HT :</span>
            <strong>{{ totalHT | number }} FCFA</strong>
          </div>
          <div class="total-row">
            <span>Total TTC :</span>
            <strong class="total-ttc">{{ totalTTC | number }} FCFA</strong>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn-save" (click)="saveDevis()" [disabled]="!canSave()">
            {{ editMode ? 'Modifier' : 'Créer' }}
          </button>
          <button class="btn-cancel" (click)="cancelForm()">Annuler</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .devis-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; margin: 0; }
    
    .btn-primary { 
      background: #EC4899; color: white; border: none; 
      padding: 10px 20px; border-radius: 8px; cursor: pointer;
    }
    
    .stats-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;
    }
    .stat-card {
      background: white; padding: 20px; border-radius: 12px; border: 1px solid #FCE7F3;
      text-align: center;
    }
    .stat-value { display: block; font-size: 24px; font-weight: 700; color: #EC4899; }
    .stat-label { color: #6B7280; font-size: 14px; }
    
    .table-controls { margin-bottom: 20px; }
    .table-controls input {
      width: 300px; padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px;
    }
    
    .table-wrapper {
      background: white; border-radius: 12px; border: 1px solid #FCE7F3; overflow: hidden;
    }
    table { width: 100%; border-collapse: collapse; }
    th { background: #FDF2F8; padding: 12px; text-align: left; color: #4B5563; }
    td { padding: 12px; border-bottom: 1px solid #FCE7F3; }
    
    .badge {
      padding: 4px 8px; border-radius: 4px; font-size: 12px;
    }
    .badge.brouillon { background: #9CA3AF; color: white; }
    .badge.envoye { background: #F59E0B; color: white; }
    .badge.accepte { background: #10B981; color: white; }
    .badge.refuse { background: #EF4444; color: white; }
    .badge.expire { background: #6B7280; color: white; }
    
    .btn-icon { 
      background: none; border: 1px solid #FCE7F3; 
      border-radius: 6px; padding: 4px 8px; margin: 0 4px; cursor: pointer;
    }
    
    .form-card {
      background: white; padding: 30px; border-radius: 12px; border: 1px solid #FCE7F3;
    }
    .form-section { margin-bottom: 30px; }
    .form-section h3 { color: #EC4899; margin-bottom: 15px; }
    
    .form-row {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
    }
    .form-group {
      display: flex; flex-direction: column;
    }
    label { margin-bottom: 5px; color: #4B5563; }
    input, select {
      padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px;
    }
    
    .articles-list {
      margin-bottom: 20px;
    }
    .article-row {
      display: grid; grid-template-columns: 3fr 1fr 1fr 1fr 1fr auto;
      gap: 10px; margin-bottom: 10px; align-items: center;
    }
    .montant { text-align: right; color: #EC4899; }
    .btn-remove {
      background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 4px 8px; cursor: pointer;
    }
    .btn-add {
      background: white; border: 2px solid #EC4899; color: #EC4899; padding: 8px 16px;
      border-radius: 8px; cursor: pointer;
    }
    
    .totaux {
      background: #FDF2F8; padding: 20px; border-radius: 8px; margin: 20px 0;
    }
    .total-row {
      display: flex; justify-content: flex-end; gap: 20px; margin: 5px 0;
    }
    .total-ttc { color: #EC4899; font-size: 18px; }
    
    .form-actions {
      display: flex; justify-content: flex-end; gap: 15px;
    }
    .btn-save {
      background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer;
    }
    .btn-cancel {
      background: white; border: 2px solid #FCE7F3; padding: 10px 30px; border-radius: 8px; cursor: pointer;
    }
    .empty-msg { text-align: center; padding: 40px; color: #9CA3AF; }
  `]
})
export class Devis implements OnInit {
  clients: Client[] = [];
  devis: DevisData[] = [];
  articles: any[] = [];
  
  showForm = false;
  editMode = false;
  searchTerm = '';

  newDevis: Partial<DevisData> = {
    client_id: undefined,
    date_creation: new Date().toISOString().split('T')[0],
    date_validite: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    statut: 'brouillon'
  };

  totalHT = 0;
  totalTTC = 0;

  constructor(private api: ApiService) {}

  async ngOnInit() {
    await this.loadClients();
    await this.loadDevis();
    this.addArticle();
  }

  async loadClients() {
    this.clients = await this.api.getClients();
  }

  async loadDevis() {
    this.devis = await this.api.getDevis();
  }

  onClientChange() {
    const client = this.clients.find(c => c.id === Number(this.newDevis.client_id));
    if (client) {
      this.newDevis.client_nom = client.nom;
    }
  }

  addArticle() {
    this.articles.push({
      article_nom: '',
      quantite: 1,
      prix_unitaire: 0,
      taux_tva: 18,
      montant_ht: 0,
      montant_ttc: 0
    });
  }

  removeArticle(index: number) {
    if (this.articles.length > 1) {
      this.articles.splice(index, 1);
      this.calculerTotaux();
    }
  }

  calculerArticle(index: number) {
    const article = this.articles[index];
    const quantite = article.quantite || 0;
    const prix = article.prix_unitaire || 0;
    const tva = (article.taux_tva || 0) / 100;
    
    article.montant_ht = quantite * prix;
    article.montant_ttc = article.montant_ht * (1 + tva);
    
    this.calculerTotaux();
  }

  calculerTotaux() {
    this.totalHT = this.articles.reduce((sum, a) => sum + (a.montant_ht || 0), 0);
    this.totalTTC = this.articles.reduce((sum, a) => sum + (a.montant_ttc || 0), 0);
  }

  canSave(): boolean {
    return this.newDevis.client_id !== undefined && this.articles.length > 0 && this.articles[0].article_nom;
  }

  async saveDevis() {
    const devisData = {
      ...this.newDevis,
      montant_ht: this.totalHT,
      montant_ttc: this.totalTTC
    } as DevisModel;

    if (this.editMode && this.newDevis.id) {
      // TODO: update
    } else {
      await this.api.createDevis(devisData);
    }
    
    await this.loadDevis();
    this.cancelForm();
  }

  editDevis(d: DevisData) {
    this.newDevis = { ...d };
    this.editMode = true;
    this.showForm = true;
    // TODO: charger les articles
  }

  async deleteDevis(d: DevisData) {
    if (d.id && confirm('Supprimer ce devis ?')) {
      await this.api.deleteDevis(d.id);
      await this.loadDevis();
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
    this.newDevis = {
      client_id: undefined,
      date_creation: new Date().toISOString().split('T')[0],
      date_validite: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      statut: 'brouillon'
    };
    this.articles = [];
    this.addArticle();
    this.totalHT = 0;
    this.totalTTC = 0;
  }

  get filteredDevis() {
    return this.devis.filter(d => 
      d.numero?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      d.client_nom?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get devisEnCours() {
    return this.devis.filter(d => d.statut === 'brouillon' || d.statut === 'envoye').length;
  }

  get devisAcceptes() {
    return this.devis.filter(d => d.statut === 'accepte').length;
  }

  get totalMontant() {
    return this.devis.reduce((sum, d) => sum + (d.montant_ttc || 0), 0);
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
}
