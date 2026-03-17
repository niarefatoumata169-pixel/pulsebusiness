import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nouveau-devis',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="nouveau-devis-container">
      <div class="header">
        <h1>Nouveau devis</h1>
        <button class="btn-cancel" routerLink="/commercial/devis">Annuler</button>
      </div>

      <form class="form-card">
        <div class="form-row">
          <div class="form-group">
            <label>Client *</label>
            <select class="form-control">
              <option value="">Sélectionner un client</option>
            </select>
          </div>
          <div class="form-group">
            <label>Date de création</label>
            <input type="date" class="form-control">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Date de validité</label>
            <input type="date" class="form-control">
          </div>
          <div class="form-group">
            <label>Statut</label>
            <select class="form-control">
              <option value="brouillon">Brouillon</option>
              <option value="envoye">Envoyé</option>
              <option value="accepte">Accepté</option>
              <option value="refuse">Refusé</option>
              <option value="expire">Expiré</option>
            </select>
          </div>
        </div>

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

        <div class="totals">
          <div class="total-row">
            <span>Total HT</span>
            <strong>0 FCFA</strong>
          </div>
          <div class="total-row">
            <span>Total TTC</span>
            <strong class="total-ttc">0 FCFA</strong>
          </div>
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea class="form-control" rows="3" placeholder="Notes..."></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-save">Créer le devis</button>
          <button type="button" class="btn-cancel" routerLink="/commercial/devis">Annuler</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .nouveau-devis-container { padding: 24px; max-width: 1000px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; margin: 0; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; padding: 10px 20px; border-radius: 8px; cursor: pointer; text-decoration: none; color: #6B7280; }
    
    .form-card { background: white; border-radius: 12px; padding: 30px; border: 1px solid #FCE7F3; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .form-group { display: flex; flex-direction: column; }
    label { margin-bottom: 5px; color: #4B5563; font-weight: 500; }
    .form-control { padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    
    h3 { color: #EC4899; margin: 20px 0 15px; }
    
    .articles-list { margin-bottom: 20px; }
    .article-row { 
      display: grid; grid-template-columns: 3fr 1fr 1fr 1fr 1fr auto; 
      gap: 10px; margin-bottom: 10px; align-items: center;
    }
    .montant { text-align: right; color: #EC4899; }
    .btn-remove { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 4px 8px; cursor: pointer; }
    .btn-add { background: white; border: 2px solid #EC4899; color: #EC4899; padding: 8px 16px; border-radius: 8px; cursor: pointer; margin-bottom: 20px; }
    
    .totals { background: #FDF2F8; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .total-row { display: flex; justify-content: flex-end; gap: 20px; margin: 5px 0; }
    .total-ttc { color: #EC4899; font-size: 18px; }
    
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; padding: 12px 30px; border-radius: 8px; cursor: pointer; }
  `]
})
export class NouveauDevis {}
