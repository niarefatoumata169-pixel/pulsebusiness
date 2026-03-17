import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-client-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="edit-container" *ngIf="client">
      <div class="header">
        <h1>Modifier client</h1>
        <button class="btn-back" routerLink="/clients/{{clientId}}">← Retour</button>
      </div>
      <div class="form-card">
        <form (ngSubmit)="saveClient()" #clientForm="ngForm">
          <div class="tabs">
            <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">Informations</button>
            <button type="button" [class.active]="activeTab === 'contact'" (click)="activeTab = 'contact'">Contact</button>
            <button type="button" [class.active]="activeTab === 'commercial'" (click)="activeTab = 'commercial'">Commercial</button>
          </div>
          <div *ngIf="activeTab === 'info'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Type *</label>
                <select [(ngModel)]="client.type" name="type" required>
                  <option value="entreprise">Entreprise</option>
                  <option value="particulier">Particulier</option>
                  <option value="association">Association</option>
                  <option value="administration">Administration</option>
                </select>
              </div>
              <div class="form-group" *ngIf="client.type === 'particulier'">
                <label>Civilité</label>
                <select [(ngModel)]="client.civilite" name="civilite">
                  <option value="M">M.</option>
                  <option value="Mme">Mme</option>
                  <option value="Mlle">Mlle</option>
                </select>
              </div>
              <div class="form-group" *ngIf="client.type !== 'particulier'">
                <label>Raison sociale *</label>
                <input type="text" [(ngModel)]="client.raison_sociale" name="raison_sociale" required>
              </div>
              <div class="form-group" *ngIf="client.type === 'particulier'">
                <label>Nom *</label>
                <input type="text" [(ngModel)]="client.nom" name="nom" required>
              </div>
              <div class="form-group" *ngIf="client.type === 'particulier'">
                <label>Prénom</label>
                <input type="text" [(ngModel)]="client.prenom" name="prenom">
              </div>
              <div class="form-group" *ngIf="client.type !== 'particulier'">
                <label>Forme juridique</label>
                <input type="text" [(ngModel)]="client.forme_juridique" name="forme_juridique">
              </div>
              <div class="form-group">
                <label>NIF *</label>
                <input type="text" [(ngModel)]="client.nif" name="nif" required>
              </div>
              <div class="form-group">
                <label>Registre de commerce</label>
                <input type="text" [(ngModel)]="client.registre_commerce" name="registre_commerce">
              </div>
              <div class="form-group">
                <label>Date création</label>
                <input type="date" [(ngModel)]="client.date_creation" name="date_creation">
              </div>
              <div class="form-group">
                <label>Secteur d'activité</label>
                <input type="text" [(ngModel)]="client.secteur_activite" name="secteur_activite">
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'contact'" class="tab-content">
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Adresse *</label>
                <textarea [(ngModel)]="client.adresse" name="adresse" rows="2" required></textarea>
              </div>
              <div class="form-group">
                <label>Ville *</label>
                <input type="text" [(ngModel)]="client.ville" name="ville" required>
              </div>
              <div class="form-group">
                <label>Code postal</label>
                <input type="text" [(ngModel)]="client.code_postal" name="code_postal">
              </div>
              <div class="form-group">
                <label>Pays *</label>
                <input type="text" [(ngModel)]="client.pays" name="pays" required>
              </div>
              <div class="form-group">
                <label>Téléphone *</label>
                <input type="tel" [(ngModel)]="client.telephone" name="telephone" required>
              </div>
              <div class="form-group">
                <label>Email *</label>
                <input type="email" [(ngModel)]="client.email" name="email" required>
              </div>
              <div class="form-group">
                <label>Site web</label>
                <input type="url" [(ngModel)]="client.site_web" name="site_web">
              </div>
              <div class="form-group">
                <label>Fax</label>
                <input type="text" [(ngModel)]="client.fax" name="fax">
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'commercial'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Personne de contact</label>
                <input type="text" [(ngModel)]="client.contact_nom" name="contact_nom">
              </div>
              <div class="form-group">
                <label>Fonction</label>
                <input type="text" [(ngModel)]="client.contact_fonction" name="contact_fonction">
              </div>
              <div class="form-group">
                <label>Téléphone contact</label>
                <input type="tel" [(ngModel)]="client.contact_telephone" name="contact_telephone">
              </div>
              <div class="form-group">
                <label>Email contact</label>
                <input type="email" [(ngModel)]="client.contact_email" name="contact_email">
              </div>
              <div class="form-group">
                <label>Conditions de paiement</label>
                <input type="text" [(ngModel)]="client.conditions_paiement" name="conditions_paiement">
              </div>
              <div class="form-group">
                <label>Délai de paiement (jours)</label>
                <input type="number" [(ngModel)]="client.delai_paiement" name="delai_paiement" min="0">
              </div>
              <div class="form-group">
                <label>Devise</label>
                <input type="text" [(ngModel)]="client.devise" name="devise">
              </div>
              <div class="form-group">
                <label>Plafond de crédit (FCFA)</label>
                <input type="number" [(ngModel)]="client.plafond_credit" name="plafond_credit" min="0">
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="client.statut" name="statut">
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="prospect">Prospect</option>
                </select>
              </div>
              <div class="form-group full-width">
                <label>Notes</label>
                <textarea [(ngModel)]="client.notes" name="notes" rows="4"></textarea>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" routerLink="/clients/{{clientId}}">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="clientForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .edit-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .btn-back { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; text-decoration: none; color: #6B7280; }
    .form-card { background: white; border-radius: 12px; padding: 30px; border: 1px solid #FCE7F3; }
    .tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #FCE7F3; padding-bottom: 10px; }
    .tabs button { background: none; border: none; padding: 8px 16px; cursor: pointer; color: #6B7280; border-radius: 20px; }
    .tabs button.active { background: #EC4899; color: white; }
    .tab-content { margin-top: 20px; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .full-width { grid-column: span 2; }
    .form-group { display: flex; flex-direction: column; }
    label { margin-bottom: 5px; color: #4B5563; }
    input, textarea, select { padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; text-decoration: none; color: #6B7280; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
  `]
})
export class ClientEdit implements OnInit {
  clientId: string | null = null;
  client: any = null;
  activeTab = 'info';
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit() {
    this.clientId = this.route.snapshot.paramMap.get('id');
    this.loadClient();
  }
  loadClient() {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    this.client = clients.find((c: any) => c.id === Number(this.clientId));
  }
  saveClient() {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const index = clients.findIndex((c: any) => c.id === Number(this.clientId));
    if (index !== -1) {
      clients[index] = this.client;
      localStorage.setItem('clients', JSON.stringify(clients));
      alert('✅ Client modifié avec succès !');
      this.router.navigate(['/clients', this.clientId]);
    }
  }
}
