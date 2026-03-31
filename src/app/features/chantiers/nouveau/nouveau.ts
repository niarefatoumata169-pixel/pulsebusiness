import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api/api.service';

@Component({
  selector: 'app-nouveau-chantier',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Nouveau chantier</h1>
        <button class="btn-cancel" routerLink="/chantiers">Annuler</button>
      </div>

      <div class="form-card">
        <div *ngIf="errorMessage" class="alert-error">{{ errorMessage }}</div>
        <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>

        <div class="form-section">
          <h3>Informations générales</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label>Nom du chantier *</label>
              <input type="text" [(ngModel)]="chantier.nom" placeholder="Ex: Construction Immeuble ABC">
            </div>
            <div class="form-group">
              <label>Client *</label>
              <select [(ngModel)]="chantier.client_id">
                <option value="">Sélectionner un client</option>
                <option *ngFor="let client of clients" [value]="client.id">{{ client.nom }}</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Date de début</label>
              <input type="date" [(ngModel)]="chantier.date_debut">
            </div>
            <div class="form-group">
              <label>Date de fin prévue</label>
              <input type="date" [(ngModel)]="chantier.date_fin_prevue">
            </div>
          </div>

          <div class="form-group">
            <label>Montant du chantier *</label>
            <input type="number" [(ngModel)]="chantier.montant" placeholder="0">
          </div>

          <div class="form-group">
            <label>Adresse</label>
            <textarea [(ngModel)]="chantier.adresse" rows="3" placeholder="Adresse complète du chantier"></textarea>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="chantier.description" rows="4" placeholder="Description détaillée du chantier"></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" routerLink="/chantiers">Annuler</button>
          <button type="button" class="btn-save" (click)="saveChantier()" [disabled]="loading">
            {{ loading ? 'Création en cours...' : 'Créer le chantier' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 800px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; margin: 0; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .alert-error { background: #FEE2E2; color: #EF4444; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
    .alert-success { background: #D1FAE5; color: #10B981; padding: 12px; border-radius: 8px; margin-bottom: 20px; }

    .form-card { background: white; border-radius: 16px; padding: 30px; border: 1px solid #FCE7F3; }
    .form-section { margin-bottom: 30px; }
    .form-section h3 { color: #EC4899; font-size: 18px; margin-bottom: 20px; }
    .form-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 8px; color: #4B5563; font-weight: 500; }
    input, select, textarea { width: 100%; padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #EC4899; }
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #FCE7F3; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; }
    .btn-save:hover:not(:disabled) { background: #DB2777; }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class NouveauChantier implements OnInit {
  clients: any[] = [];
  chantier: any = {
    nom: '',
    client_id: '',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin_prevue: '',
    montant: 0,
    adresse: '',
    description: ''
  };
  
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadClients();
  }

  async loadClients() {
    try {
      this.clients = await this.api.getClients();
      console.log('✅ Clients chargés:', this.clients.length);
    } catch (error) {
      console.error('❌ Erreur chargement clients:', error);
      this.errorMessage = 'Impossible de charger la liste des clients';
    }
  }

  canSave(): boolean {
    const isValid = !!(this.chantier.nom && this.chantier.client_id && this.chantier.montant > 0);
    console.log('Formulaire valide:', isValid);
    return isValid;
  }

  async saveChantier() {
    console.log('🚀 saveChantier() appelée');
    console.log('Données du chantier:', this.chantier);
    
    if (!this.canSave()) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires (Nom, Client, Montant)';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      // Simulation d'enregistrement (décommente quand l'API sera prête)
      // const result = await this.api.createChantier(this.chantier);
      // console.log('Résultat API:', result);
      
      // Simulation pour le test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.successMessage = '✅ Chantier créé avec succès !';
      console.log('✅ Chantier sauvegardé (simulation):', this.chantier);
      
      // Redirection après 1.5 secondes
      setTimeout(() => {
        this.router.navigate(['/chantiers']);
      }, 1500);
      
    } catch (error) {
      console.error('❌ Erreur création chantier:', error);
      this.errorMessage = 'Erreur lors de la création du chantier';
    } finally {
      this.loading = false;
    }
  }
}
