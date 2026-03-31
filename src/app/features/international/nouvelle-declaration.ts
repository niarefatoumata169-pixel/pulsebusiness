import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

interface DeclarationDouane {
  id?: number;
  numero_dossier: string;
  type: 'import' | 'export' | 'transit';
  date_declaration: string;
  bureau_douane: string;
  regime_douanier: string;
  valeur_marchandise: number;
  devise: string;
  montant_droits: number;
  montant_tva: number;
  montant_total: number;
  marchandises: string;
  pays_origine: string;
  pays_destination: string;
  conteneurs?: string;
  numero_vin?: string;
  notes?: string;
  statut: 'brouillon' | 'en_cours' | 'soumise' | 'debloquee' | 'refusee';
}

@Component({
  selector: 'app-nouvelle-declaration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="nouvelle-declaration-container">
      <div class="header">
        <div>
          <h1>📋 Nouvelle déclaration en douane</h1>
          <p class="subtitle">Remplissez le formulaire ci-dessous pour créer une nouvelle déclaration</p>
        </div>
        <button class="btn-cancel" routerLink="/international/douanes">✕ Annuler</button>
      </div>

      <div *ngIf="errorMessage" class="alert-error">
        <span class="alert-icon">⚠️</span>
        {{ errorMessage }}
      </div>

      <form (ngSubmit)="saveDeclaration()" class="form-card">
        <div class="form-section">
          <h3>Informations générales</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Type de déclaration *</label>
              <div class="type-toggle">
                <button type="button" class="toggle-btn" [class.active]="declaration.type === 'import'" (click)="declaration.type = 'import'">
                  📥 Importation
                </button>
                <button type="button" class="toggle-btn" [class.active]="declaration.type === 'export'" (click)="declaration.type = 'export'">
                  📤 Exportation
                </button>
                <button type="button" class="toggle-btn" [class.active]="declaration.type === 'transit'" (click)="declaration.type = 'transit'">
                  🔄 Transit
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>Bureau de douane *</label>
              <input type="text" [(ngModel)]="declaration.bureau_douane" name="bureau_douane" required class="form-control" placeholder="Ex: Port de Bamako">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Date de déclaration *</label>
              <input type="date" [(ngModel)]="declaration.date_declaration" name="date_declaration" required class="form-control">
            </div>
            <div class="form-group">
              <label>Régime douanier *</label>
              <select [(ngModel)]="declaration.regime_douanier" name="regime_douanier" required class="form-control">
                <option value="">Sélectionner</option>
                <option value="mise_consommation">Mise à la consommation</option>
                <option value="exportation">Exportation</option>
                <option value="transit">Transit</option>
                <option value="entrepot">Entrepôt</option>
                <option value="admission">Admission temporaire</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>🌍 Origine & Destination</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Pays d'origine *</label>
              <input type="text" [(ngModel)]="declaration.pays_origine" name="pays_origine" required class="form-control" placeholder="Ex: France, Chine...">
            </div>
            <div class="form-group">
              <label>Pays de destination *</label>
              <input type="text" [(ngModel)]="declaration.pays_destination" name="pays_destination" required class="form-control" placeholder="Ex: Mali, Côte d'Ivoire...">
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>💰 Valeur & Taxes</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Valeur marchandise *</label>
              <input type="number" [(ngModel)]="declaration.valeur_marchandise" name="valeur_marchandise" required class="form-control" placeholder="0" (input)="calculerMontants()">
            </div>
            <div class="form-group">
              <label>Devise</label>
              <select [(ngModel)]="declaration.devise" name="devise" class="form-control">
                <option value="FCFA">FCFA</option>
                <option value="EUR">Euro (€)</option>
                <option value="USD">Dollar ($)</option>
                <option value="GBP">Livre (£)</option>
                <option value="CNY">Yuan (¥)</option>
              </select>
            </div>
          </div>

          <div class="taxes-calculator">
            <div class="tax-item">
              <span class="tax-label">Droits de douane (20%)</span>
              <span class="tax-value">{{ declaration.montant_droits | number }} {{ declaration.devise }}</span>
            </div>
            <div class="tax-item">
              <span class="tax-label">TVA (18%)</span>
              <span class="tax-value">{{ declaration.montant_tva | number }} {{ declaration.devise }}</span>
            </div>
            <div class="tax-item total">
              <span class="tax-label">Total à payer</span>
              <span class="tax-value">{{ declaration.montant_total | number }} {{ declaration.devise }}</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>📦 Marchandises & Logistique</h3>
          <div class="form-group">
            <label>Marchandises *</label>
            <textarea [(ngModel)]="declaration.marchandises" name="marchandises" required class="form-control" rows="3" placeholder="Description détaillée des marchandises..."></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Conteneurs</label>
              <input type="text" [(ngModel)]="declaration.conteneurs" name="conteneurs" class="form-control" placeholder="Ex: MSKU1234567, CMAU9876543">
            </div>
            <div class="form-group">
              <label>N° VIN / BL</label>
              <input type="text" [(ngModel)]="declaration.numero_vin" name="numero_vin" class="form-control" placeholder="Numéro de connaissement">
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>📝 Informations complémentaires</h3>
          <div class="form-group">
            <label>Notes</label>
            <textarea [(ngModel)]="declaration.notes" name="notes" class="form-control" rows="3" placeholder="Informations supplémentaires..."></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" routerLink="/international/douanes">Annuler</button>
          <button type="submit" class="btn-save">💾 Créer la déclaration</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .nouvelle-declaration-container { padding: 24px; max-width: 1000px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; margin: 0; font-size: 28px; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; font-size: 14px; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; padding: 10px 20px; border-radius: 10px; cursor: pointer; text-decoration: none; color: #6B7280; font-weight: 500; transition: all 0.2s; }
    .btn-cancel:hover { background: #FEF3F9; border-color: #EC4899; color: #EC4899; }
    
    .alert-error { background: #EF4444; color: white; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    
    .form-card { background: white; border-radius: 20px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .form-section { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #F3F4F6; }
    .form-section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .form-section h3 { color: #EC4899; margin: 0 0 20px 0; font-size: 18px; }
    
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .form-group { display: flex; flex-direction: column; }
    .form-group label { margin-bottom: 8px; color: #4B5563; font-weight: 500; font-size: 14px; }
    .form-control { padding: 12px; border: 2px solid #F3F4F6; border-radius: 10px; font-size: 14px; transition: border-color 0.2s; }
    .form-control:focus { outline: none; border-color: #EC4899; }
    
    .type-toggle { display: flex; gap: 10px; flex-wrap: wrap; }
    .toggle-btn { flex: 1; padding: 10px; border: 2px solid #F3F4F6; background: white; border-radius: 10px; cursor: pointer; transition: all 0.2s; font-size: 14px; }
    .toggle-btn.active { background: #EC4899; color: white; border-color: #EC4899; }
    .toggle-btn:hover:not(.active) { background: #FEF3F9; border-color: #EC4899; }
    
    .taxes-calculator { background: #F9FAFB; border-radius: 12px; padding: 16px; margin-top: 16px; }
    .tax-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F3F4F6; }
    .tax-item:last-child { border-bottom: none; }
    .tax-item.total { padding-top: 12px; margin-top: 4px; border-top: 2px solid #FCE7F3; font-weight: 600; }
    .tax-label { color: #6B7280; }
    .tax-value { font-weight: 500; color: #1F2937; }
    .tax-item.total .tax-value { color: #EC4899; font-size: 18px; font-weight: 700; }
    
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #F3F4F6; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 12px 30px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-save:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
    
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; gap: 15px; }
      .type-toggle { flex-direction: column; }
      .toggle-btn { width: 100%; }
      .header { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class NouvelleDeclaration implements OnInit {
  declaration: DeclarationDouane = {
    numero_dossier: '',
    type: 'import',
    date_declaration: new Date().toISOString().split('T')[0],
    bureau_douane: '',
    regime_douanier: '',
    valeur_marchandise: 0,
    devise: 'FCFA',
    montant_droits: 0,
    montant_tva: 0,
    montant_total: 0,
    marchandises: '',
    pays_origine: '',
    pays_destination: '',
    statut: 'brouillon'
  };
  
  errorMessage = '';
  
  constructor(private router: Router) {}
  
  ngOnInit() {}
  
  generateNumeroDossier(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `DD-${year}${month}-${random}`;
  }
  
  calculerMontants() {
    const valeur = this.declaration.valeur_marchandise || 0;
    this.declaration.montant_droits = valeur * 0.2; // 20% droits de douane
    this.declaration.montant_tva = valeur * 0.18; // 18% TVA
    this.declaration.montant_total = this.declaration.montant_droits + this.declaration.montant_tva;
  }
  
  saveDeclaration() {
    // Validation des champs obligatoires
    if (!this.declaration.bureau_douane) {
      this.errorMessage = 'Veuillez renseigner le bureau de douane';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    if (!this.declaration.regime_douanier) {
      this.errorMessage = 'Veuillez sélectionner un régime douanier';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    if (!this.declaration.pays_origine) {
      this.errorMessage = 'Veuillez renseigner le pays d\'origine';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    if (!this.declaration.pays_destination) {
      this.errorMessage = 'Veuillez renseigner le pays de destination';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    if (!this.declaration.marchandises) {
      this.errorMessage = 'Veuillez décrire les marchandises';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    if (this.declaration.valeur_marchandise <= 0) {
      this.errorMessage = 'La valeur des marchandises doit être supérieure à 0';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    
    // Génération du numéro de dossier
    this.declaration.numero_dossier = this.generateNumeroDossier();
    
    // Récupération des déclarations existantes
    const saved = localStorage.getItem('declarations_douane');
    const declarations: DeclarationDouane[] = saved ? JSON.parse(saved) : [];
    
    // Ajout de la nouvelle déclaration
    const newDeclaration = {
      ...this.declaration,
      id: Date.now(),
      created_at: new Date().toISOString()
    };
    declarations.push(newDeclaration);
    
    // Sauvegarde
    localStorage.setItem('declarations_douane', JSON.stringify(declarations));
    
    // Redirection vers la liste
    this.router.navigate(['/international/douanes']);
  }
}