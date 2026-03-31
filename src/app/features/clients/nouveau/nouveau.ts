import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api/api.service';

@Component({
  selector: 'app-nouveau-client',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="form-container">
      <div class="form-header">
        <h1>Nouveau client</h1>
        <button class="btn-cancel" routerLink="/clients">Annuler</button>
      </div>

      <div class="form-card">
        <div class="form-group">
          <label>Nom *</label>
          <input type="text" [(ngModel)]="client.nom" placeholder="Nom du client">
        </div>

        <div class="form-group">
          <label>Prénom</label>
          <input type="text" [(ngModel)]="client.prenom" placeholder="Prénom">
        </div>

        <div class="form-group">
          <label>Email *</label>
          <input type="email" [(ngModel)]="client.email" placeholder="email@exemple.com">
        </div>

        <div class="form-group">
          <label>Téléphone</label>
          <input type="tel" [(ngModel)]="client.telephone" placeholder="+225 00 00 00 00">
        </div>

        <div class="form-group">
          <label>Entreprise</label>
          <input type="text" [(ngModel)]="client.entreprise" placeholder="Nom de l'entreprise">
        </div>

        <div class="form-actions">
          <button class="btn-cancel" routerLink="/clients">Annuler</button>
          <button class="btn-save" (click)="saveClient()" [disabled]="!canSave()">Enregistrer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-container { padding: 24px; max-width: 600px; margin: 0 auto; }
    .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { margin: 0; }
    .btn-cancel { background: none; border: 1px solid #ddd; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
    .form-card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 6px; font-weight: 500; }
    input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 8px 24px; border-radius: 6px; cursor: pointer; }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class NouveauClient {
  client = { nom: '', prenom: '', email: '', telephone: '', entreprise: '' };

  constructor(private api: ApiService, private router: Router) {}

  canSave(): boolean {
    return !!(this.client.nom && this.client.email);
  }

  async saveClient() {
    if (!this.canSave()) return;
    
    try {
      await this.api.createClient(this.client);
      this.router.navigate(['/clients']);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création');
    }
  }
}
