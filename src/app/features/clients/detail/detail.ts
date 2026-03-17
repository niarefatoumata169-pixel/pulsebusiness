import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="detail-container">
      <div class="header" *ngIf="client">
        <div class="header-left">
          <button class="btn-back" routerLink="/clients">← Retour</button>
          <h1>{{ client.type === 'particulier' ? client.civilite + ' ' + client.nom + ' ' + (client.prenom || '') : client.raison_sociale }}</h1>
        </div>
        <div class="header-actions">
          <button class="btn-edit" [routerLink]="['/clients', clientId, 'edit']">✏️ Modifier</button>
          <button class="btn-delete" (click)="deleteClient()">🗑️ Supprimer</button>
        </div>
      </div>
      <div *ngIf="client" class="detail-content">
        <div class="info-grid">
          <div class="info-card">
            <h3>Informations générales</h3>
            <p><strong>Code:</strong> {{ client.code }}</p>
            <p><strong>Type:</strong> {{ getTypeLabel(client.type) }}</p>
            <p><strong>NIF:</strong> {{ client.nif }}</p>
            <p><strong>RCCM:</strong> {{ client.registre_commerce || '-' }}</p>
            <p><strong>Date création:</strong> {{ client.date_creation | date }}</p>
            <p><strong>Secteur:</strong> {{ client.secteur_activite || '-' }}</p>
          </div>
          <div class="info-card">
            <h3>Coordonnées</h3>
            <p><strong>Adresse:</strong> {{ client.adresse }}</p>
            <p><strong>Ville:</strong> {{ client.ville }} {{ client.code_postal }}</p>
            <p><strong>Pays:</strong> {{ client.pays }}</p>
            <p><strong>Téléphone:</strong> {{ client.telephone }}</p>
            <p><strong>Email:</strong> {{ client.email }}</p>
            <p><strong>Site web:</strong> {{ client.site_web || '-' }}</p>
          </div>
          <div class="info-card">
            <h3>Contact principal</h3>
            <p><strong>Nom:</strong> {{ client.contact_nom || '-' }}</p>
            <p><strong>Fonction:</strong> {{ client.contact_fonction || '-' }}</p>
            <p><strong>Téléphone:</strong> {{ client.contact_telephone || '-' }}</p>
            <p><strong>Email:</strong> {{ client.contact_email || '-' }}</p>
          </div>
          <div class="info-card">
            <h3>Informations commerciales</h3>
            <p><strong>Conditions paiement:</strong> {{ client.conditions_paiement || '-' }}</p>
            <p><strong>Délai paiement:</strong> {{ client.delai_paiement || '-' }} jours</p>
            <p><strong>Devise:</strong> {{ client.devise }}</p>
            <p><strong>Plafond crédit:</strong> {{ client.plafond_credit | number }} FCFA</p>
            <p><strong>Encours actuel:</strong> {{ client.encours | number }} FCFA</p>
            <p><strong>Statut:</strong> <span class="badge-statut" [class]="client.statut">{{ getStatutLabel(client.statut) }}</span></p>
          </div>
        </div>
        <div class="notes-section" *ngIf="client.notes">
          <h3>Notes</h3>
          <p>{{ client.notes }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .header-left { display: flex; align-items: center; gap: 20px; }
    .btn-back { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; text-decoration: none; color: #6B7280; }
    h1 { color: #1F2937; font-size: 24px; margin: 0; }
    .header-actions { display: flex; gap: 12px; }
    .btn-edit { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; text-decoration: none; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
    .info-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .info-card h3 { color: #EC4899; margin: 0 0 15px; font-size: 16px; }
    .info-card p { margin: 8px 0; color: #4B5563; }
    .info-card strong { color: #1F2937; }
    .badge-statut { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge-statut.actif { background: #10B981; color: white; }
    .badge-statut.inactif { background: #9CA3AF; color: white; }
    .badge-statut.prospect { background: #F59E0B; color: white; }
    .notes-section { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .notes-section h3 { color: #EC4899; margin: 0 0 10px; }
    .notes-section p { color: #4B5563; line-height: 1.6; }
  `]
})
export class ClientDetail implements OnInit {
  clientId: string | null = null;
  client: any = null;
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
  getTypeLabel(type: string): string {
    const labels: any = { 
      entreprise: 'Entreprise', 
      particulier: 'Particulier', 
      association: 'Association', 
      administration: 'Administration' 
    };
    return labels[type] || type;
  }
  getStatutLabel(statut: string): string {
    const labels: any = { actif: 'Actif', inactif: 'Inactif', prospect: 'Prospect' };
    return labels[statut] || statut;
  }
  deleteClient() {
    if (confirm('Voulez-vous vraiment supprimer ce client ?')) {
      const clients = JSON.parse(localStorage.getItem('clients') || '[]');
      const updatedClients = clients.filter((c: any) => c.id !== Number(this.clientId));
      localStorage.setItem('clients', JSON.stringify(updatedClients));
      alert('✅ Client supprimé !');
      this.router.navigate(['/clients']);
    }
  }
}
