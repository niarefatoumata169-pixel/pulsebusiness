import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nouveau-carburant',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="nouveau-carburant-container">
      <div class="header">
        <h1>Nouvel approvisionnement</h1>
        <button class="btn-cancel" routerLink="/transport/carburant">Annuler</button>
      </div>

      <form class="form-card">
        <div class="form-group">
          <label>Véhicule *</label>
          <select class="form-control">
            <option value="">Sélectionner un véhicule</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Date</label>
            <input type="date" class="form-control">
          </div>
          <div class="form-group">
            <label>Kilométrage</label>
            <input type="number" class="form-control" placeholder="0">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Litres</label>
            <input type="number" class="form-control" placeholder="0" step="0.01">
          </div>
          <div class="form-group">
            <label>Prix au litre (FCFA)</label>
            <input type="number" class="form-control" placeholder="0">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Montant total</label>
            <input type="number" class="form-control" placeholder="0" readonly class="readonly">
          </div>
          <div class="form-group">
            <label>Station</label>
            <input type="text" class="form-control" placeholder="Nom de la station">
          </div>
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea class="form-control" rows="3" placeholder="Notes..."></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-save">Enregistrer</button>
          <button type="button" class="btn-cancel" routerLink="/transport/carburant">Annuler</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .nouveau-carburant-container { padding: 24px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; margin: 0; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; padding: 10px 20px; border-radius: 8px; cursor: pointer; text-decoration: none; color: #6B7280; }
    
    .form-card { background: white; border-radius: 12px; padding: 30px; border: 1px solid #FCE7F3; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .form-group { display: flex; flex-direction: column; margin-bottom: 20px; }
    label { margin-bottom: 5px; color: #4B5563; font-weight: 500; }
    .form-control { padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    .readonly { background: #F9FAFB; color: #6B7280; }
    
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; padding: 12px 30px; border-radius: 8px; cursor: pointer; }
  `]
})
export class NouveauCarburant {}
