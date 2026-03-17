import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Incoterm {
  id?: number;
  code: string;
  libelle: string;
  description: string;
  categorie: 'E' | 'F' | 'C' | 'D';
  transport: 'tous' | 'maritime' | 'terrestre' | 'aerien';
  lieu_transfert_risques: string;
  repartition_frais: string;
  assurance: boolean;
  douane_export: 'vendeur' | 'acheteur';
  douane_import: 'vendeur' | 'acheteur';
  transport_principal: 'vendeur' | 'acheteur';
  version: string;
  date_version: string;
  notes?: string;
  user_id?: number;
  created_at?: string;
}

@Component({
  selector: 'app-incoterms',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="incoterms-container">
      <div class="header">
        <div>
          <h1>Mes Incoterms</h1>
          <p class="subtitle">{{ incoterms.length }} incoterm(s) personnalisé(s)</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">
          {{ showForm ? 'Annuler' : '+ Nouvel incoterm' }}
        </button>
      </div>

      <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>
      <div *ngIf="errorMessage" class="alert-error">{{ errorMessage }}</div>
      
      <!-- Formulaire d'ajout -->
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Ajouter' }} un incoterm</h3>
        <form (ngSubmit)="saveIncoterm()" #incotermForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Code *</label>
              <input type="text" [(ngModel)]="newIncoterm.code" name="code" required>
            </div>
            
            <div class="form-group">
              <label>Libellé *</label>
              <input type="text" [(ngModel)]="newIncoterm.libelle" name="libelle" required>
            </div>
            
            <div class="form-group">
              <label>Catégorie</label>
              <select [(ngModel)]="newIncoterm.categorie" name="categorie" required>
                <option value="E">E - Départ</option>
                <option value="F">F - Transport principal non acquitté</option>
                <option value="C">C - Transport principal acquitté</option>
                <option value="D">D - Arrivée</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Type de transport</label>
              <select [(ngModel)]="newIncoterm.transport" name="transport" required>
                <option value="tous">Tous modes</option>
                <option value="maritime">Maritime</option>
                <option value="terrestre">Terrestre</option>
                <option value="aerien">Aérien</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Lieu transfert risques *</label>
              <input type="text" [(ngModel)]="newIncoterm.lieu_transfert_risques" name="lieu" required>
            </div>
            
            <div class="form-group">
              <label>Répartition frais</label>
              <input type="text" [(ngModel)]="newIncoterm.repartition_frais" name="frais" required>
            </div>
            
            <div class="form-group">
              <label>Assurance</label>
              <input type="checkbox" [(ngModel)]="newIncoterm.assurance" name="assurance">
            </div>
            
            <div class="form-group">
              <label>Douane export</label>
              <select [(ngModel)]="newIncoterm.douane_export" name="douane_export" required>
                <option value="vendeur">Vendeur</option>
                <option value="acheteur">Acheteur</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Douane import</label>
              <select [(ngModel)]="newIncoterm.douane_import" name="douane_import" required>
                <option value="vendeur">Vendeur</option>
                <option value="acheteur">Acheteur</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Transport principal</label>
              <select [(ngModel)]="newIncoterm.transport_principal" name="transport_principal" required>
                <option value="vendeur">Vendeur</option>
                <option value="acheteur">Acheteur</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Version</label>
              <input type="text" [(ngModel)]="newIncoterm.version" name="version" value="2020">
            </div>
            
            <div class="form-group">
              <label>Date version</label>
              <input type="date" [(ngModel)]="newIncoterm.date_version" name="date_version">
            </div>
            
            <div class="form-group full-width">
              <label>Description *</label>
              <textarea [(ngModel)]="newIncoterm.description" name="description" rows="3" required></textarea>
            </div>
            
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea [(ngModel)]="newIncoterm.notes" name="notes" rows="2"></textarea>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-save">Enregistrer</button>
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
          </div>
        </form>
      </div>

      <!-- Liste des incoterms -->
      <div class="incoterms-grid" *ngIf="incoterms.length > 0; else emptyState">
        <div class="incoterm-card" *ngFor="let i of incoterms">
          <div class="incoterm-header">
            <span class="incoterm-code">{{ i.code }}</span>
            <span class="incoterm-cat">Cat. {{ i.categorie }}</span>
          </div>
          <div class="incoterm-body">
            <p class="incoterm-libelle">{{ i.libelle }}</p>
            <p class="incoterm-desc">{{ i.description }}</p>
            <div class="incoterm-info">
              <span class="info-badge" [class]="i.transport">{{ getTransportLabel(i.transport) }}</span>
              <span class="info-badge" [class]="i.douane_export">Export: {{ i.douane_export }}</span>
              <span class="info-badge" [class]="i.douane_import">Import: {{ i.douane_import }}</span>
            </div>
          </div>
          <div class="incoterm-footer">
            <span class="version-badge">v{{ i.version }}</span>
            <div class="incoterm-actions">
              <button class="btn-icon" (click)="editIncoterm(i)" title="Modifier">✏️</button>
              <button class="btn-icon" (click)="duplicateIncoterm(i)" title="Dupliquer">📋</button>
              <button class="btn-icon delete" (click)="deleteIncoterm(i)" title="Supprimer">🗑️</button>
            </div>
          </div>
        </div>
      </div>
      
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📜</div>
          <h2>Aucun incoterm</h2>
          <p>Ajoutez votre premier incoterm personnalisé</p>
          <button class="btn-primary" (click)="showForm = true">
            + Ajouter un incoterm
          </button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .incoterms-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 0; }
    .btn-add { 
      background: #EC4899; color: white; border: none; 
      padding: 10px 20px; border-radius: 8px; cursor: pointer;
    }
    
    .alert-success {
      background: #D1FAE5; color: #10B981; padding: 12px; border-radius: 8px; margin-bottom: 20px;
    }
    .alert-error {
      background: #FEE2E2; color: #EF4444; padding: 12px; border-radius: 8px; margin-bottom: 20px;
    }
    
    /* Formulaire */
    .form-card {
      background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #FCE7F3;
    }
    .form-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;
    }
    .full-width { grid-column: span 2; }
    .form-group { display: flex; flex-direction: column; }
    label { margin-bottom: 5px; color: #4B5563; font-weight: 500; }
    input, textarea, select {
      padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px;
    }
    input[type="checkbox"] { width: 20px; height: 20px; }
    .form-actions {
      display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px;
    }
    .btn-save {
      background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer;
    }
    .btn-cancel {
      background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer;
    }
    
    /* Liste */
    .incoterms-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); 
      gap: 20px; 
    }
    
    .incoterm-card { 
      background: white; border-radius: 12px; padding: 20px; 
      border: 1px solid #FCE7F3; transition: all 0.2s;
    }
    .incoterm-card:hover { 
      box-shadow: 0 4px 12px rgba(236,72,153,0.1); 
      transform: translateY(-2px); 
    }
    
    .incoterm-header { 
      display: flex; justify-content: space-between; 
      align-items: center; margin-bottom: 15px; 
    }
    .incoterm-code { 
      font-weight: 700; color: #1F2937; font-size: 20px; 
    }
    .incoterm-cat { 
      font-size: 12px; padding: 4px 8px; 
      background: #FDF2F8; border-radius: 4px; color: #EC4899; 
    }
    
    .incoterm-libelle { 
      font-weight: 600; color: #1F2937; margin-bottom: 10px; 
    }
    .incoterm-desc { 
      color: #6B7280; font-size: 13px; line-height: 1.5; 
      margin-bottom: 15px; 
    }
    
    .incoterm-info { 
      display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 15px; 
    }
    .info-badge { 
      font-size: 11px; padding: 4px 8px; border-radius: 4px; 
      background: #F3F4F6; color: #4B5563; 
    }
    .info-badge.tous { background: #E5E7EB; }
    .info-badge.maritime { background: #DBEAFE; color: #1E40AF; }
    .info-badge.terrestre { background: #FEF3C7; color: #92400E; }
    .info-badge.aerien { background: #E0E7FF; color: #3730A3; }
    .info-badge.vendeur { background: #D1FAE5; color: #065F46; }
    .info-badge.acheteur { background: #FEE2E2; color: #991B1B; }
    
    .incoterm-footer { 
      display: flex; justify-content: space-between; 
      align-items: center; margin-top: 15px; padding-top: 15px; 
      border-top: 1px solid #FCE7F3; 
    }
    .version-badge { 
      font-size: 11px; padding: 4px 8px; 
      background: #FDF2F8; border-radius: 4px; color: #EC4899; 
    }
    .incoterm-actions { display: flex; gap: 8px; }
    .btn-icon {
      background: none; border: 1px solid #FCE7F3; border-radius: 6px;
      padding: 4px 8px; cursor: pointer;
    }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    
    .empty-state { 
      text-align: center; padding: 60px; 
      background: white; border-radius: 12px; 
      border: 2px dashed #FCE7F3; 
    }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .btn-primary {
      background: #EC4899; color: white; border: none;
      padding: 10px 20px; border-radius: 8px; cursor: pointer;
    }
  `]
})
export class Incoterms implements OnInit {
  incoterms: Incoterm[] = [];
  showForm = false;
  editMode = false;
  successMessage = '';
  errorMessage = '';

  newIncoterm: Partial<Incoterm> = {
    code: '',
    libelle: '',
    description: '',
    categorie: 'C',
    transport: 'tous',
    lieu_transfert_risques: '',
    repartition_frais: '',
    assurance: false,
    douane_export: 'vendeur',
    douane_import: 'acheteur',
    transport_principal: 'vendeur',
    version: '2020',
    date_version: new Date().toISOString().split('T')[0],
    notes: ''
  };

  ngOnInit() {
    this.loadIncoterms();
  }

  loadIncoterms() {
    const saved = localStorage.getItem('user_incoterms');
    this.incoterms = saved ? JSON.parse(saved) : [];
  }

  saveIncoterm() {
    if (!this.newIncoterm.code || !this.newIncoterm.libelle || !this.newIncoterm.description) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    if (this.editMode && this.newIncoterm.id) {
      const index = this.incoterms.findIndex(i => i.id === this.newIncoterm.id);
      if (index !== -1) {
        this.incoterms[index] = this.newIncoterm as Incoterm;
        this.successMessage = 'Incoterm modifié avec succès !';
      }
    } else {
      const newIncoterm: Incoterm = {
        ...this.newIncoterm,
        id: Date.now(),
        created_at: new Date().toISOString()
      } as Incoterm;
      
      this.incoterms.push(newIncoterm);
      this.successMessage = 'Incoterm ajouté avec succès !';
    }

    localStorage.setItem('user_incoterms', JSON.stringify(this.incoterms));
    this.cancelForm();
    setTimeout(() => this.successMessage = '', 3000);
  }

  editIncoterm(i: Incoterm) {
    this.newIncoterm = { ...i };
    this.editMode = true;
    this.showForm = true;
  }

  duplicateIncoterm(i: Incoterm) {
    const duplicate = {
      ...i,
      id: Date.now(),
      code: i.code + '-COPY',
      created_at: new Date().toISOString()
    };
    this.incoterms.push(duplicate);
    localStorage.setItem('user_incoterms', JSON.stringify(this.incoterms));
    this.successMessage = 'Incoterm dupliqué !';
    setTimeout(() => this.successMessage = '', 3000);
  }

  deleteIncoterm(i: Incoterm) {
    if (confirm(`Supprimer l'incoterm ${i.code} ?`)) {
      this.incoterms = this.incoterms.filter(inc => inc.id !== i.id);
      localStorage.setItem('user_incoterms', JSON.stringify(this.incoterms));
      this.successMessage = 'Incoterm supprimé !';
      setTimeout(() => this.successMessage = '', 3000);
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
    this.newIncoterm = {
      code: '',
      libelle: '',
      description: '',
      categorie: 'C',
      transport: 'tous',
      lieu_transfert_risques: '',
      repartition_frais: '',
      assurance: false,
      douane_export: 'vendeur',
      douane_import: 'acheteur',
      transport_principal: 'vendeur',
      version: '2020',
      date_version: new Date().toISOString().split('T')[0],
      notes: ''
    };
  }

  getTransportLabel(transport: string): string {
    const labels: any = { 
      tous: 'Tous modes', 
      maritime: 'Maritime', 
      terrestre: 'Terrestre', 
      aerien: 'Aérien' 
    };
    return labels[transport] || transport;
  }
}
