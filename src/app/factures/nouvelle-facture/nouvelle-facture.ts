import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-nouvelle-facture',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="facture-container">
      <div class="header">
        <h1>Nouvelle facture</h1>
        <button class="btn-cancel" routerLink="/factures">Annuler</button>
      </div>

      <div class="form-card">
        <div class="form-section">
          <h3>Informations générales</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label>Client *</label>
              <select [(ngModel)]="facture.client_id" required>
                <option value="">Sélectionner un client</option>
                <option *ngFor="let c of clients" [value]="c.id">{{ c.nom }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Numéro de facture *</label>
              <input type="text" [(ngModel)]="facture.numero" placeholder="FAC-2026-001">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Date d'émission</label>
              <input type="date" [(ngModel)]="facture.date_emission">
            </div>

            <div class="form-group">
              <label>Date d'échéance</label>
              <input type="date" [(ngModel)]="facture.date_echeance">
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Articles</h3>
          
          <table class="articles-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qté</th>
                <th>Prix unitaire</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let article of articles; let i = index">
                <td><input type="text" [(ngModel)]="article.description" placeholder="Article"></td>
                <td><input type="number" [(ngModel)]="article.quantite" (input)="calculer(i)"></td>
                <td><input type="number" [(ngModel)]="article.prix_unitaire" (input)="calculer(i)"></td>
                <td class="montant">{{ article.total | number }} FCFA</td>
                <td><button class="btn-remove" (click)="supprimerArticle(i)">🗑️</button></td>
              </tr>
            </tbody>
          </table>
          
          <button class="btn-add" (click)="ajouterArticle()">+ Ajouter un article</button>
        </div>

        <div class="totaux">
          <div class="total-row">
            <span>Total HT:</span>
            <strong>{{ totalHT | number }} FCFA</strong>
          </div>
          <div class="total-row">
            <span>TVA (18%):</span>
            <strong>{{ totalTVA | number }} FCFA</strong>
          </div>
          <div class="total-row total-ttc">
            <span>Total TTC:</span>
            <strong>{{ totalTTC | number }} FCFA</strong>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn-save" (click)="saveFacture()" [disabled]="!canSave()">
            Créer la facture
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .facture-container { padding: 24px; max-width: 900px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; margin: 0; }
    
    .form-card {
      background: white; border-radius: 12px; border: 1px solid #FCE7F3; padding: 24px;
    }
    .form-section { margin-bottom: 30px; }
    .form-section h3 { color: #EC4899; margin-bottom: 16px; }
    
    .form-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px;
    }
    .form-group {
      display: flex; flex-direction: column;
    }
    label { margin-bottom: 5px; color: #4B5563; font-weight: 500; }
    input, select {
      padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; font-size: 14px;
    }
    
    .articles-table {
      width: 100%; border-collapse: collapse; margin-bottom: 16px;
    }
    .articles-table th {
      text-align: left; padding: 10px; background: #FDF2F8; color: #4B5563;
    }
    .articles-table td {
      padding: 8px; border-bottom: 1px solid #FCE7F3;
    }
    .articles-table input {
      width: 100%; padding: 6px; border: 1px solid #FCE7F3; border-radius: 4px;
    }
    .montant { text-align: right; font-weight: 600; }
    .btn-remove {
      background: none; border: none; cursor: pointer; font-size: 16px;
    }
    .btn-add {
      background: white; border: 2px solid #EC4899; color: #EC4899;
      padding: 8px 16px; border-radius: 8px; cursor: pointer;
    }
    
    .totaux {
      background: #FDF2F8; padding: 20px; border-radius: 8px; margin: 20px 0;
    }
    .total-row {
      display: flex; justify-content: flex-end; gap: 20px; margin: 5px 0;
    }
    .total-ttc { color: #EC4899; font-size: 18px; font-weight: 700; }
    
    .btn-cancel {
      background: white; border: 2px solid #FCE7F3; padding: 8px 16px; border-radius: 8px; cursor: pointer;
    }
    .btn-save {
      background: #EC4899; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;
    }
  `]
})
export class NouvelleFacture implements OnInit {
  clients: any[] = [];
  facture: any = {
    numero: 'FAC-' + new Date().getFullYear() + '-001',
    date_emission: new Date().toISOString().split('T')[0],
    date_echeance: ''
  };
  articles: any[] = [];
  totalHT = 0;
  totalTVA = 0;
  totalTTC = 0;

  constructor(private api: ApiService, private router: Router) {}

  async ngOnInit() {
    this.clients = await this.api.getClients();
    this.ajouterArticle();
  }

  ajouterArticle() {
    this.articles.push({
      description: '',
      quantite: 1,
      prix_unitaire: 0,
      total: 0
    });
  }

  supprimerArticle(index: number) {
    if (this.articles.length > 1) {
      this.articles.splice(index, 1);
      this.calculerTotaux();
    }
  }

  calculer(index: number) {
    const a = this.articles[index];
    a.total = (a.quantite || 0) * (a.prix_unitaire || 0);
    this.calculerTotaux();
  }

  calculerTotaux() {
    this.totalHT = this.articles.reduce((sum, a) => sum + (a.total || 0), 0);
    this.totalTVA = this.totalHT * 0.18;
    this.totalTTC = this.totalHT + this.totalTVA;
  }

  canSave(): boolean {
    return this.facture.client_id && this.articles.length > 0 && this.articles[0].description;
  }

  async saveFacture() {
    const factureData = {
      ...this.facture,
      montant_ht: this.totalHT,
      montant_ttc: this.totalTTC
    };
    
    await this.api.createFacture(factureData);
    this.router.navigate(['/factures']);
  }
}
