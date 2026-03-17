import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nouvelle-declaration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="nouvelle-declaration-container">
      <div class="header">
        <h1>Nouvelle déclaration en douane</h1>
        <button class="btn-cancel" routerLink="/international/douanes">Annuler</button>
      </div>

      <form class="form-card">
        <div class="form-row">
          <div class="form-group">
            <label>Type de déclaration *</label>
            <select class="form-control">
              <option value="">Sélectionner</option>
              <option value="import">Importation</option>
              <option value="export">Exportation</option>
              <option value="transit">Transit</option>
            </select>
          </div>
          <div class="form-group">
            <label>Bureau de douane *</label>
            <input type="text" class="form-control" placeholder="Ex: Bamako">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Date de déclaration</label>
            <input type="date" class="form-control">
          </div>
          <div class="form-group">
            <label>Régime douanier</label>
            <select class="form-control">
              <option value="">Sélectionner</option>
              <option value="mise_consommation">Mise à la consommation</option>
              <option value="exportation">Exportation</option>
              <option value="transit">Transit</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Pays d'origine</label>
            <input type="text" class="form-control" placeholder="Ex: France">
          </div>
          <div class="form-group">
            <label>Pays de destination</label>
            <input type="text" class="form-control" placeholder="Ex: Mali">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Valeur marchandise</label>
            <input type="number" class="form-control" placeholder="0">
          </div>
          <div class="form-group">
            <label>Devise</label>
            <select class="form-control">
              <option value="FCFA">FCFA</option>
              <option value="EUR">Euro</option>
              <option value="USD">Dollar</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Marchandises *</label>
          <textarea class="form-control" rows="3" placeholder="Description des marchandises..."></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Conteneurs</label>
            <input type="text" class="form-control" placeholder="MSKU1234567">
          </div>
          <div class="form-group">
            <label>N° VIN / BL</label>
            <input type="text" class="form-control" placeholder="Numéro">
          </div>
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea class="form-control" rows="3" placeholder="Notes additionnelles..."></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-save">Créer la déclaration</button>
          <button type="button" class="btn-cancel" routerLink="/international/douanes">Annuler</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .nouvelle-declaration-container { padding: 24px; max-width: 1000px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; margin: 0; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; padding: 10px 20px; border-radius: 8px; cursor: pointer; text-decoration: none; color: #6B7280; }
    
    .form-card { background: white; border-radius: 12px; padding: 30px; border: 1px solid #FCE7F3; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .form-group { display: flex; flex-direction: column; }
    label { margin-bottom: 5px; color: #4B5563; font-weight: 500; }
    .form-control { padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; padding: 12px 30px; border-radius: 8px; cursor: pointer; }
  `]
})
export class NouvelleDeclaration {}
