import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nouvel-incoterm',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="nouvel-incoterm-container">
      <div class="header">
        <h1>Nouvel incoterm</h1>
        <button class="btn-cancel" routerLink="/international/incoterms">Annuler</button>
      </div>

      <form class="form-card">
        <div class="form-row">
          <div class="form-group">
            <label>Code *</label>
            <input type="text" class="form-control" placeholder="EXW, FOB, CIF...">
          </div>
          <div class="form-group">
            <label>Libellé *</label>
            <input type="text" class="form-control" placeholder="Ex Works, Free On Board...">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Catégorie</label>
            <select class="form-control">
              <option value="">Sélectionner</option>
              <option value="E">E - Départ</option>
              <option value="F">F - Transport principal non acquitté</option>
              <option value="C">C - Transport principal acquitté</option>
              <option value="D">D - Arrivée</option>
            </select>
          </div>
          <div class="form-group">
            <label>Transport</label>
            <select class="form-control">
              <option value="tous">Tous modes</option>
              <option value="maritime">Maritime</option>
              <option value="terrestre">Terrestre</option>
              <option value="aerien">Aérien</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Description *</label>
          <textarea class="form-control" rows="3" placeholder="Description de l'incoterm..."></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Lieu transfert risques</label>
            <input type="text" class="form-control" placeholder="Lieu">
          </div>
          <div class="form-group">
            <label>Répartition frais</label>
            <input type="text" class="form-control" placeholder="Description">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Douane export</label>
            <select class="form-control">
              <option value="vendeur">Vendeur</option>
              <option value="acheteur">Acheteur</option>
            </select>
          </div>
          <div class="form-group">
            <label>Douane import</label>
            <select class="form-control">
              <option value="vendeur">Vendeur</option>
              <option value="acheteur">Acheteur</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Transport principal</label>
            <select class="form-control">
              <option value="vendeur">Vendeur</option>
              <option value="acheteur">Acheteur</option>
            </select>
          </div>
          <div class="form-group">
            <label>Assurance</label>
            <input type="checkbox"> Obligatoire
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Version</label>
            <input type="text" class="form-control" placeholder="2020">
          </div>
          <div class="form-group">
            <label>Date version</label>
            <input type="date" class="form-control">
          </div>
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea class="form-control" rows="3" placeholder="Notes..."></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-save">Créer l'incoterm</button>
          <button type="button" class="btn-cancel" routerLink="/international/incoterms">Annuler</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .nouvel-incoterm-container { padding: 24px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; margin: 0; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; padding: 10px 20px; border-radius: 8px; cursor: pointer; text-decoration: none; color: #6B7280; }
    
    .form-card { background: white; border-radius: 12px; padding: 30px; border: 1px solid #FCE7F3; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .form-group { display: flex; flex-direction: column; margin-bottom: 20px; }
    label { margin-bottom: 5px; color: #4B5563; font-weight: 500; }
    .form-control { padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; padding: 12px 30px; border-radius: 8px; cursor: pointer; }
  `]
})
export class NouvelIncoterm {}
