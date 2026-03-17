import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-facture-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="detail-container" *ngIf="facture">
      <div class="header">
        <div class="header-left">
          <button class="btn-back" routerLink="/factures">← Retour</button>
          <h1>Facture {{ facture.numero }}</h1>
        </div>
        <div class="header-actions">
          <button class="btn-edit" [routerLink]="['/factures', factureId, 'edit']">✏️ Modifier</button>
          <button class="btn-pdf" (click)="exportPDF()">📄 PDF</button>
          <button class="btn-delete" (click)="deleteFacture()">🗑️ Supprimer</button>
        </div>
      </div>
      <div class="facture-content">
        <div class="status-bar">
          <span class="badge-statut" [class]="facture.statut">{{ getStatutLabel(facture.statut) }}</span>
          <span class="date-info">Émise le {{ facture.date_emission | date:'dd/MM/yyyy' }}</span>
          <span class="date-info" [class.urgent]="isEcheanceProche()">Échéance le {{ facture.date_echeance | date:'dd/MM/yyyy' }}</span>
        </div>
        <div class="info-grid">
          <div class="info-card">
            <h3>Client</h3>
            <p class="client-nom">{{ facture.client_nom || 'Non renseigné' }}</p>
            <p *ngIf="client">NIF: {{ client.nif }}</p>
            <p *ngIf="client">Adresse: {{ client.adresse }}</p>
            <p *ngIf="client">{{ client.ville }} {{ client.code_postal }}</p>
          </div>
          <div class="info-card">
            <h3>Détails</h3>
            <p><strong>Type:</strong> {{ getTypeLabel(facture.type) }}</p>
            <p><strong>Mode de paiement:</strong> {{ facture.mode_paiement || 'Non défini' }}</p>
            <p><strong>Date d'émission:</strong> {{ facture.date_emission | date:'dd/MM/yyyy' }}</p>
            <p><strong>Date d'échéance:</strong> {{ facture.date_echeance | date:'dd/MM/yyyy' }}</p>
          </div>
        </div>
        <div class="articles-section">
          <h3>Articles</h3>
          <table class="articles-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>TVA %</th>
                <th>Montant HT</th>
                <th>Montant TTC</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of facture.lignes">
                <td>{{ a.designation }}</td>
                <td class="text-right">{{ a.quantite }}</td>
                <td class="text-right">{{ a.prix_unitaire | number }} FCFA</td>
                <td class="text-right">{{ a.tva }}%</td>
                <td class="text-right">{{ a.montant_ht | number }} FCFA</td>
                <td class="text-right">{{ a.montant_ttc | number }} FCFA</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" class="text-right">Total HT :</td>
                <td class="text-right">{{ facture.montant_ht | number }} FCFA</td>
                <td></td>
              </tr>
              <tr>
                <td colspan="4" class="text-right">Total TVA :</td>
                <td class="text-right">{{ facture.montant_tva | number }} FCFA</td>
                <td></td>
              </tr>
              <tr class="total-ttc">
                <td colspan="4" class="text-right">Total TTC :</td>
                <td class="text-right">{{ facture.montant_ttc | number }} FCFA</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div class="notes-section" *ngIf="facture.notes">
          <h3>Notes</h3>
          <p>{{ facture.notes }}</p>
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
    .btn-pdf { background: #10B981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .status-bar { background: #F9FAFB; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px; display: flex; gap: 30px; align-items: center; }
    .badge-statut { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-statut.brouillon { background: #9CA3AF; color: white; }
    .badge-statut.envoyee { background: #EC4899; color: white; }
    .badge-statut.payee { background: #10B981; color: white; }
    .badge-statut.impayee { background: #EF4444; color: white; }
    .badge-statut.annulee { background: #6B7280; color: white; }
    .date-info { color: #6B7280; }
    .urgent { color: #EF4444; font-weight: 600; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
    .info-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .info-card h3 { color: #EC4899; margin: 0 0 15px; font-size: 16px; }
    .client-nom { font-weight: 600; color: #1F2937; font-size: 16px; margin-bottom: 10px; }
    .info-card p { margin: 5px 0; color: #4B5563; }
    .articles-section { background: white; border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 1px solid #FCE7F3; }
    .articles-section h3 { color: #EC4899; margin: 0 0 20px; }
    .articles-table { width: 100%; border-collapse: collapse; }
    .articles-table th { background: #FDF2F8; padding: 12px; text-align: left; color: #1F2937; }
    .articles-table td { padding: 12px; border-bottom: 1px solid #FCE7F3; }
    .articles-table tfoot td { border-bottom: none; font-weight: 500; padding-top: 20px; }
    .text-right { text-align: right; }
    .total-ttc { font-weight: 700; color: #EC4899; }
    .notes-section { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .notes-section h3 { color: #EC4899; margin: 0 0 10px; }
    .notes-section p { color: #4B5563; line-height: 1.6; }
  `]
})
export class FactureDetail implements OnInit {
  factureId: string | null = null;
  facture: any = null;
  client: any = null;
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit() {
    this.factureId = this.route.snapshot.paramMap.get('id');
    this.loadFacture();
  }
  loadFacture() {
    const factures = JSON.parse(localStorage.getItem('factures') || '[]');
    this.facture = factures.find((f: any) => f.id === Number(this.factureId));
    if (this.facture && this.facture.client_id) {
      const clients = JSON.parse(localStorage.getItem('clients') || '[]');
      this.client = clients.find((c: any) => c.id === Number(this.facture.client_id));
    }
  }
  getTypeLabel(type: string): string {
    const labels: any = { vente: 'Vente', achat: 'Achat', avoir: 'Avoir', proforma: 'Proforma' };
    return labels[type] || type;
  }
  getStatutLabel(statut: string): string {
    const labels: any = { 
      brouillon: 'Brouillon', 
      envoyee: 'Envoyée', 
      payee: 'Payée', 
      impayee: 'Impayée', 
      annulee: 'Annulée' 
    };
    return labels[statut] || statut;
  }
  isEcheanceProche(): boolean {
    if (!this.facture?.date_echeance || this.facture.statut === 'payee') return false;
    const today = new Date();
    const echeance = new Date(this.facture.date_echeance);
    const diffTime = echeance.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }
  exportPDF() {
    alert('Fonction PDF à venir - Facture ' + this.facture?.numero);
  }
  deleteFacture() {
    if (confirm('Voulez-vous vraiment supprimer cette facture ?')) {
      const factures = JSON.parse(localStorage.getItem('factures') || '[]');
      const updatedFactures = factures.filter((f: any) => f.id !== Number(this.factureId));
      localStorage.setItem('factures', JSON.stringify(updatedFactures));
      alert('✅ Facture supprimée !');
      this.router.navigate(['/factures']);
    }
  }
}
