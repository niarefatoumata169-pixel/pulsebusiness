import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nouvelle-vente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="nouvelle-vente-container">
      <div class="header">
        <h1>Nouvelle vente</h1>
        <button class="btn-cancel" routerLink="/commercial/ventes">Annuler</button>
      </div>

      <form class="form-card">
        <div class="form-section">
          <h3>Client</h3>
          <div class="form-group">
            <label>Sélectionner un client *</label>
            <select class="form-control">
              <option value="">-- Choisir un client --</option>
            </select>
          </div>
        </div>

        <div class="form-section">
          <h3>Informations</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Date de vente</label>
              <input type="date" class="form-control">
            </div>
            <div class="form-group">
              <label>Référence</label>
              <input type="text" class="form-control" placeholder="Vente-001">
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Articles</h3>
          <div class="articles-list">
            <div class="article-row">
              <input type="text" placeholder="Description" class="form-control">
              <input type="number" placeholder="Qté" class="form-control" value="1">
              <input type="number" placeholder="Prix unitaire" class="form-control" value="0">
              <input type="number" placeholder="TVA %" class="form-control" value="18">
              <span class="montant">0 FCFA</span>
              <button type="button" class="btn-remove">🗑️</button>
            </div>
          </div>
          <button type="button" class="btn-add">+ Ajouter un article</button>
        </div>

        <div class="totals">
          <div class="total-row">
            <span>Total HT</span>
            <strong>0 FCFA</strong>
          </div>
          <div class="total-row">
            <span>Total TVA</span>
            <strong>0 FCFA</strong>
          </div>
          <div class="total-row grand-total">
            <span>Total TTC</span>
            <strong>0 FCFA</strong>
          </div>
        </div>

        <div class="form-section">
          <h3>Notes</h3>
          <textarea class="form-control" rows="3" placeholder="Notes ou conditions particulières..."></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-save">Créer la vente</button>
          <button type="button" class="btn-cancel" routerLink="/commercial/ventes">Annuler</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .nouvelle-vente-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; margin: 0; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; padding: 10px 20px; border-radius: 8px; cursor: pointer; text-decoration: none; color: #6B7280; }
    
    .form-card { background: white; border-radius: 12px; padding: 30px; border: 1px solid #FCE7F3; }
    .form-section { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #FCE7F3; }
    .form-section h3 { color: #EC4899; margin-bottom: 20px; }
    
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px; }
    .form-group { display: flex; flex-direction: column; }
    label { margin-bottom: 5px; color: #4B5563; font-weight: 500; }
    .form-control { padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    
    .articles-list { margin-bottom: 20px; }
    .article-row { 
      display: grid; grid-template-columns: 3fr 1fr 1fr 1fr 1fr auto; 
      gap: 10px; margin-bottom: 10px; align-items: center;
    }
    .montant { text-align: right; color: #EC4899; }
    .btn-remove { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 4px 8px; cursor: pointer; }
    .btn-add { background: white; border: 2px solid #EC4899; color: #EC4899; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
    
    .totals { background: #FDF2F8; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .total-row { display: flex; justify-content: flex-end; gap: 20px; margin: 5px 0; }
    .grand-total { font-size: 18px; font-weight: 700; border-top: 1px solid #FCE7F3; margin-top: 10px; padding-top: 10px; }
    .grand-total strong { color: #EC4899; }
    
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; padding: 12px 30px; border-radius: 8px; cursor: pointer; }
  `]
})
export class NouvelleVente {}
