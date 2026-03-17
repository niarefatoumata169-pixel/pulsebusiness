import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nouveau-contrat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="nouveau-contrat-container">
      <div class="header">
        <h1>Nouveau contrat</h1>
        <button class="btn-cancel" routerLink="/commercial/contrats">Annuler</button>
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
            <label>Type de contrat</label>
            <select class="form-control">
              <option value="">Sélectionner</option>
              <option value="vente">Vente</option>
              <option value="service">Service</option>
              <option value="location">Location</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Date de début</label>
            <input type="date" class="form-control">
          </div>
          <div class="form-group">
            <label>Date de fin</label>
            <input type="date" class="form-control">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Montant (FCFA)</label>
            <input type="number" class="form-control" placeholder="0">
          </div>
          <div class="form-group">
            <label>Périodicité</label>
            <select class="form-control">
              <option value="mensuel">Mensuel</option>
              <option value="trimestriel">Trimestriel</option>
              <option value="annuel">Annuel</option>
              <option value="ponctuel">Ponctuel</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Conditions particulières</label>
          <textarea class="form-control" rows="4" placeholder="Décrivez les conditions du contrat..."></textarea>
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea class="form-control" rows="3" placeholder="Notes additionnelles..."></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-save">Créer le contrat</button>
          <button type="button" class="btn-cancel" routerLink="/commercial/contrats">Annuler</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .nouveau-contrat-container { padding: 24px; max-width: 800px; margin: 0 auto; }
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
export class NouveauContrat {}
