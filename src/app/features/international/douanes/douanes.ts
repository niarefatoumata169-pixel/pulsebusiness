// src/app/features/international/douanes/douanes.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface DeclarationDouane {
  id?: number;
  numero_dossier: string;
  numero_acquit?: string;
  type: 'import' | 'export' | 'transit';
  date_declaration: string;
  bureau_douane: string;
  regime_douanier: string;
  valeur_marchandise: number;
  devise: string;
  montant_droits: number;
  montant_tva: number;
  montant_total: number;
  statut: 'brouillon' | 'en_cours' | 'soumise' | 'debloquee' | 'refusee';
  conteneurs?: string;
  marchandises: string;
  pays_origine: string;
  pays_destination: string;
  transporteur?: string;
  numero_vin?: string;
  date_validation?: string;
  date_acquit?: string;
  agent_douanier?: string;
  notes?: string;
}

@Component({
  selector: 'app-douanes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="douanes-container">
      <div class="header">
        <div>
          <h1>Déclarations en douane</h1>
          <p class="subtitle">{{ declarations.length }} déclaration(s)</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">
          + Nouvelle déclaration
        </button>
      </div>

      <!-- Message de succès -->
      <div *ngIf="successMessage" class="alert-success">
        {{ successMessage }}
      </div>

      <!-- Formulaire -->
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouvelle' }} déclaration</h3>
        <form (ngSubmit)="saveDeclaration()" #declarationForm="ngForm">
          <div class="form-row">
            <div class="form-group">
              <label>Type de déclaration *</label>
              <select [(ngModel)]="newDeclaration.type" name="type" required>
                <option value="import">Importation</option>
                <option value="export">Exportation</option>
                <option value="transit">Transit</option>
              </select>
            </div>

            <div class="form-group">
              <label>Bureau de douane *</label>
              <input type="text" [(ngModel)]="newDeclaration.bureau_douane" 
                     name="bureau_douane" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Date de déclaration *</label>
              <input type="date" [(ngModel)]="newDeclaration.date_declaration" 
                     name="date_declaration" required>
            </div>

            <div class="form-group">
              <label>Régime douanier *</label>
              <select [(ngModel)]="newDeclaration.regime_douanier" name="regime_douanier" required>
                <option value="mise_consommation">Mise à la consommation</option>
                <option value="exportation">Exportation</option>
                <option value="transit">Transit</option>
                <option value="entrepot">Entrepôt</option>
                <option value="admission">Admission temporaire</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Pays d'origine *</label>
              <input type="text" [(ngModel)]="newDeclaration.pays_origine" 
                     name="pays_origine" required>
            </div>

            <div class="form-group">
              <label>Pays de destination *</label>
              <input type="text" [(ngModel)]="newDeclaration.pays_destination" 
                     name="pays_destination" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Valeur marchandise *</label>
              <input type="number" [(ngModel)]="newDeclaration.valeur_marchandise" 
                     name="valeur_marchandise" required (input)="calculerMontants()">
            </div>

            <div class="form-group">
              <label>Devise</label>
              <select [(ngModel)]="newDeclaration.devise" name="devise">
                <option value="EUR">Euro (EUR)</option>
                <option value="USD">Dollar (USD)</option>
                <option value="GBP">Livre (GBP)</option>
                <option value="CNY">Yuan (CNY)</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Droits de douane *</label>
              <input type="number" [(ngModel)]="newDeclaration.montant_droits" 
                     name="montant_droits" required>
            </div>

            <div class="form-group">
              <label>TVA *</label>
              <input type="number" [(ngModel)]="newDeclaration.montant_tva" 
                     name="montant_tva" required>
            </div>
          </div>

          <div class="form-group">
            <label>Total à payer</label>
            <input type="number" [(ngModel)]="newDeclaration.montant_total" 
                   name="montant_total" readonly class="readonly">
          </div>

          <div class="form-group">
            <label>Marchandises *</label>
            <textarea [(ngModel)]="newDeclaration.marchandises" 
                      name="marchandises" rows="2" required></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Conteneurs</label>
              <input type="text" [(ngModel)]="newDeclaration.conteneurs" 
                     name="conteneurs" placeholder="Ex: MSKU1234567">
            </div>

            <div class="form-group">
              <label>N° VIN / BL</label>
              <input type="text" [(ngModel)]="newDeclaration.numero_vin" 
                     name="numero_vin">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Transporteur</label>
              <input type="text" [(ngModel)]="newDeclaration.transporteur" 
                     name="transporteur">
            </div>

            <div class="form-group">
              <label>Agent douanier</label>
              <input type="text" [(ngModel)]="newDeclaration.agent_douanier" 
                     name="agent_douanier">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Statut</label>
              <select [(ngModel)]="newDeclaration.statut" name="statut">
                <option value="brouillon">Brouillon</option>
                <option value="en_cours">En cours</option>
                <option value="soumise">Soumise</option>
                <option value="debloquee">Débloquée</option>
                <option value="refusee">Refusée</option>
              </select>
            </div>

            <div class="form-group">
              <label>N° Acquit</label>
              <input type="text" [(ngModel)]="newDeclaration.numero_acquit" 
                     name="numero_acquit">
            </div>
          </div>

          <div class="form-group">
            <label>Notes</label>
            <textarea [(ngModel)]="newDeclaration.notes" 
                      name="notes" rows="2"></textarea>
          </div>

          <button type="submit" class="btn-save">Enregistrer</button>
          <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
        </form>
      </div>

      <!-- Filtres -->
      <div class="filters-bar" *ngIf="declarations.length > 0">
        <input type="text" 
               [(ngModel)]="searchTerm" 
               (ngModelChange)="filterDeclarations()"
               placeholder="🔍 Rechercher...">
        
        <select [(ngModel)]="typeFilter" (ngModelChange)="filterDeclarations()">
          <option value="">Tous types</option>
          <option value="import">Importation</option>
          <option value="export">Exportation</option>
          <option value="transit">Transit</option>
        </select>

        <select [(ngModel)]="statutFilter" (ngModelChange)="filterDeclarations()">
          <option value="">Tous statuts</option>
          <option value="brouillon">Brouillon</option>
          <option value="en_cours">En cours</option>
          <option value="soumise">Soumise</option>
          <option value="debloquee">Débloquée</option>
          <option value="refusee">Refusée</option>
        </select>
      </div>

      <!-- Liste -->
      <div class="declarations-list" *ngIf="filteredDeclarations.length > 0; else emptyState">
        <div class="declaration-card" *ngFor="let d of filteredDeclarations">
          <div class="card-header">
            <div class="header-left">
              <span class="numero">📋 {{ d.numero_dossier }}</span>
              <span class="type-badge" [class]="d.type">{{ getTypeLabel(d.type) }}</span>
              <span class="statut-badge" [class]="d.statut">{{ getStatutLabel(d.statut) }}</span>
            </div>
            <div class="header-right">
              <span class="date">{{ d.date_declaration | date }}</span>
            </div>
          </div>

          <div class="card-body">
            <div class="info-row">
              <div class="info-item">
                <span class="label">Bureau:</span>
                <span class="value">{{ d.bureau_douane }}</span>
              </div>
              <div class="info-item">
                <span class="label">Régime:</span>
                <span class="value">{{ d.regime_douanier | titlecase }}</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-item">
                <span class="label">Origine:</span>
                <span class="value">{{ d.pays_origine }}</span>
              </div>
              <div class="info-item">
                <span class="label">Destination:</span>
                <span class="value">{{ d.pays_destination }}</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-item">
                <span class="label">Marchandises:</span>
                <span class="value">{{ d.marchandises | slice:0:50 }}...</span>
              </div>
            </div>

            <div class="montants">
              <div class="montant-item">
                <span>Valeur:</span>
                <strong>{{ d.valeur_marchandise | number }} {{ d.devise }}</strong>
              </div>
              <div class="montant-item">
                <span>Droits:</span>
                <strong>{{ d.montant_droits | number }} {{ d.devise }}</strong>
              </div>
              <div class="montant-item total">
                <span>Total:</span>
                <strong>{{ d.montant_total | number }} {{ d.devise }}</strong>
              </div>
            </div>

            <div class="info-row" *ngIf="d.numero_acquit">
              <div class="info-item">
                <span class="label">N° Acquit:</span>
                <span class="value acquit">{{ d.numero_acquit }}</span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="actions">
              <button class="btn-icon" (click)="editDeclaration(d)" title="Modifier">✏️</button>
              <button class="btn-icon" (click)="duplicateDeclaration(d)" title="Dupliquer">📋</button>
              <button class="btn-icon" *ngIf="d.statut === 'brouillon'" 
                      (click)="soumettreDeclaration(d)" title="Soumettre">📤</button>
              <button class="btn-icon delete" (click)="deleteDeclaration(d)" title="Supprimer">🗑️</button>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <h2>Aucune déclaration en douane</h2>
          <p>Créez votre première déclaration</p>
          <button class="btn-primary" (click)="showForm = true">
            + Nouvelle déclaration
          </button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .douanes-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 4px 0 0; }
    .btn-add, .btn-primary { background: #3B82F6; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .alert-success { background: #10B981; color: white; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; }

    /* Formulaire */
    .form-card { background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #E5E7EB; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; color: #4B5563; font-weight: 500; font-size: 14px; }
    input, textarea, select { width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px; font-size: 14px; transition: border-color 0.2s; }
    input:focus, textarea:focus, select:focus { outline: none; border-color: #3B82F6; }
    .readonly { background: #F9FAFB; color: #6B7280; cursor: not-allowed; }
    .btn-save { background: #3B82F6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin-right: 10px; font-weight: 500; }
    .btn-cancel { background: white; border: 2px solid #E5E7EB; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500; }

    /* Filtres */
    .filters-bar { display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; }
    .filters-bar input, .filters-bar select { padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px; min-width: 200px; }

    /* Liste */
    .declarations-list { display: flex; flex-direction: column; gap: 15px; }
    .declaration-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #E5E7EB; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: transform 0.2s; }
    .declaration-card:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }

    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #E5E7EB; }
    .header-left { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .numero { font-weight: 600; color: #1F2937; font-size: 16px; }

    .type-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
    .type-badge.import { background: #DBEAFE; color: #1E40AF; }
    .type-badge.export { background: #E0E7FF; color: #3730A3; }
    .type-badge.transit { background: #FEF3C7; color: #92400E; }

    .statut-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
    .statut-badge.brouillon { background: #9CA3AF; color: white; }
    .statut-badge.en_cours { background: #3B82F6; color: white; }
    .statut-badge.soumise { background: #F59E0B; color: white; }
    .statut-badge.debloquee { background: #10B981; color: white; }
    .statut-badge.refusee { background: #EF4444; color: white; }

    .date { color: #6B7280; font-size: 14px; }

    .card-body { margin-bottom: 15px; }
    .info-row { display: flex; gap: 30px; margin-bottom: 10px; flex-wrap: wrap; }
    .info-item { display: flex; align-items: center; gap: 8px; }
    .label { color: #6B7280; font-size: 14px; min-width: 80px; }
    .value { color: #1F2937; font-weight: 500; }
    .acquit { font-family: monospace; background: #F3F4F6; padding: 2px 6px; border-radius: 4px; }

    .montants { display: flex; gap: 30px; margin: 15px 0; padding: 15px; background: #F9FAFB; border-radius: 8px; flex-wrap: wrap; }
    .montant-item { display: flex; flex-direction: column; gap: 4px; }
    .montant-item span { color: #6B7280; font-size: 13px; }
    .montant-item strong { color: #1F2937; font-size: 16px; }
    .montant-item.total strong { color: #3B82F6; font-size: 18px; }

    .card-footer { display: flex; justify-content: flex-end; margin-top: 15px; padding-top: 15px; border-top: 1px solid #E5E7EB; }
    .actions { display: flex; gap: 10px; }
    .btn-icon { background: none; border: 1px solid #E5E7EB; border-radius: 6px; padding: 8px 12px; cursor: pointer; transition: all 0.2s; }
    .btn-icon:hover { background: #F3F4F6; border-color: #3B82F6; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }

    /* Empty state */
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #E5E7EB; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .empty-state h2 { color: #1F2937; margin-bottom: 8px; }
    .empty-state p { color: #6B7280; margin-bottom: 20px; }
  `]
})
export class Douanes implements OnInit {
  declarations: DeclarationDouane[] = [];
  filteredDeclarations: DeclarationDouane[] = [];
  showForm = false;
  editMode = false;
  successMessage = '';
  
  searchTerm = '';
  typeFilter = '';
  statutFilter = '';

  newDeclaration: Partial<DeclarationDouane> = {
    type: 'import',
    date_declaration: new Date().toISOString().split('T')[0],
    bureau_douane: '',
    regime_douanier: 'mise_consommation',
    valeur_marchandise: 0,
    devise: 'EUR',
    montant_droits: 0,
    montant_tva: 0,
    montant_total: 0,
    marchandises: '',
    pays_origine: '',
    pays_destination: '',
    statut: 'brouillon'
  };

  ngOnInit() {
    this.loadDeclarations();
  }

  loadDeclarations() {
    const saved = localStorage.getItem('declarations_douane');
    this.declarations = saved ? JSON.parse(saved) : [];
    this.filteredDeclarations = [...this.declarations];
  }

  calculerMontants() {
    if (this.newDeclaration.valeur_marchandise) {
      // Simulation de calcul des droits et TVA
      this.newDeclaration.montant_droits = this.newDeclaration.valeur_marchandise * 0.2; // 20%
      this.newDeclaration.montant_tva = this.newDeclaration.valeur_marchandise * 0.18; // 18%
      this.newDeclaration.montant_total = 
        (this.newDeclaration.montant_droits || 0) + 
        (this.newDeclaration.montant_tva || 0);
    }
  }

  saveDeclaration() {
    if (this.editMode && this.newDeclaration.id) {
      const index = this.declarations.findIndex(d => d.id === this.newDeclaration.id);
      if (index !== -1) {
        this.declarations[index] = this.newDeclaration as DeclarationDouane;
        this.showMessage('Déclaration modifiée !');
      }
    } else {
      const newDeclaration: DeclarationDouane = {
        id: Date.now(),
        numero_dossier: this.generateNumeroDossier(),
        numero_acquit: this.newDeclaration.numero_acquit,
        type: this.newDeclaration.type as 'import' | 'export' | 'transit',
        date_declaration: this.newDeclaration.date_declaration || new Date().toISOString().split('T')[0],
        bureau_douane: this.newDeclaration.bureau_douane || '',
        regime_douanier: this.newDeclaration.regime_douanier || 'mise_consommation',
        valeur_marchandise: this.newDeclaration.valeur_marchandise || 0,
        devise: this.newDeclaration.devise || 'EUR',
        montant_droits: this.newDeclaration.montant_droits || 0,
        montant_tva: this.newDeclaration.montant_tva || 0,
        montant_total: this.newDeclaration.montant_total || 0,
        marchandises: this.newDeclaration.marchandises || '',
        pays_origine: this.newDeclaration.pays_origine || '',
        pays_destination: this.newDeclaration.pays_destination || '',
        transporteur: this.newDeclaration.transporteur,
        conteneurs: this.newDeclaration.conteneurs,
        numero_vin: this.newDeclaration.numero_vin,
        agent_douanier: this.newDeclaration.agent_douanier,
        statut: this.newDeclaration.statut as 'brouillon' | 'en_cours' | 'soumise' | 'debloquee' | 'refusee' || 'brouillon',
        notes: this.newDeclaration.notes
      };
      this.declarations.push(newDeclaration);
      this.showMessage('Déclaration créée !');
    }
    
    localStorage.setItem('declarations_douane', JSON.stringify(this.declarations));
    this.filterDeclarations();
    this.cancelForm();
  }

  generateNumeroDossier(): string {
    const prefix = 'DD';
    const year = new Date().getFullYear();
    const count = (this.declarations.length + 1).toString().padStart(4, '0');
    return `${prefix}-${year}-${count}`;
  }

  editDeclaration(d: DeclarationDouane) {
    this.newDeclaration = { ...d };
    this.editMode = true;
    this.showForm = true;
  }

  duplicateDeclaration(d: DeclarationDouane) {
    const newDeclaration: DeclarationDouane = {
      ...d,
      id: Date.now(),
      numero_dossier: this.generateNumeroDossier(),
      statut: 'brouillon',
      numero_acquit: undefined
    };
    this.declarations.push(newDeclaration);
    localStorage.setItem('declarations_douane', JSON.stringify(this.declarations));
    this.filterDeclarations();
    this.showMessage('Déclaration dupliquée !');
  }

  soumettreDeclaration(d: DeclarationDouane) {
    d.statut = 'soumise';
    localStorage.setItem('declarations_douane', JSON.stringify(this.declarations));
    this.filterDeclarations();
    this.showMessage('Déclaration soumise !');
  }

  deleteDeclaration(d: DeclarationDouane) {
    if (confirm('Supprimer cette déclaration ?')) {
      this.declarations = this.declarations.filter(dec => dec.id !== d.id);
      localStorage.setItem('declarations_douane', JSON.stringify(this.declarations));
      this.filterDeclarations();
      this.showMessage('Déclaration supprimée !');
    }
  }

  filterDeclarations() {
    this.filteredDeclarations = this.declarations.filter(d => {
      const matchesSearch = !this.searchTerm || 
        d.numero_dossier.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        d.marchandises.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (d.numero_acquit && d.numero_acquit.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesType = !this.typeFilter || d.type === this.typeFilter;
      const matchesStatut = !this.statutFilter || d.statut === this.statutFilter;
      
      return matchesSearch && matchesType && matchesStatut;
    });
  }

  cancelForm() {
    this.newDeclaration = {
      type: 'import',
      date_declaration: new Date().toISOString().split('T')[0],
      bureau_douane: '',
      regime_douanier: 'mise_consommation',
      valeur_marchandise: 0,
      devise: 'EUR',
      montant_droits: 0,
      montant_tva: 0,
      montant_total: 0,
      marchandises: '',
      pays_origine: '',
      pays_destination: '',
      statut: 'brouillon'
    };
    this.showForm = false;
    this.editMode = false;
  }

  getTypeLabel(type: string): string {
    const labels: any = {
      import: 'Importation',
      export: 'Exportation',
      transit: 'Transit'
    };
    return labels[type] || type;
  }

  getStatutLabel(statut: string): string {
    const labels: any = {
      brouillon: 'Brouillon',
      en_cours: 'En cours',
      soumise: 'Soumise',
      debloquee: 'Débloquée',
      refusee: 'Refusée'
    };
    return labels[statut] || statut;
  }

  showMessage(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}