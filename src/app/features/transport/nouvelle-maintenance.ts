import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nouvelle-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="nouvelle-maintenance-container">
      <div class="header">
        <h1>Nouvelle maintenance</h1>
        <button class="btn-cancel" routerLink="/transport/maintenance">Annuler</button>
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
            <label>Date d'intervention</label>
            <input type="date" class="form-control">
          </div>
          <div class="form-group">
            <label>Kilométrage</label>
            <input type="number" class="form-control" placeholder="0">
          </div>
        </div>

        <div class="form-group">
          <label>Type d'intervention</label>
          <select class="form-control">
            <option value="">Sélectionner</option>
            <option value="vidange">Vidange</option>
            <option value="pneus">Changement pneus</option>
            <option value="freins">Révision freins</option>
            <option value="moteur">Réparation moteur</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Coût (FCFA)</label>
            <input type="number" class="form-control" placeholder="0">
          </div>
          <div class="form-group">
            <label>Statut</label>
            <select class="form-control">
              <option value="planifie">Planifié</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea class="form-control" rows="4" placeholder="Décrire l'intervention..."></textarea>
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea class="form-control" rows="3" placeholder="Notes..."></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-save">Planifier la maintenance</button>
          <button type="button" class="btn-cancel" routerLink="/transport/maintenance">Annuler</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .nouvelle-maintenance-container { padding: 24px; max-width: 800px; margin: 0 auto; }
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
export class NouvelleMaintenance {}
