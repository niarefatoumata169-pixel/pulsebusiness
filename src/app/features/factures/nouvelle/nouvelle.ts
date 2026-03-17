import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nouvelle-facture',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="nouvelle-facture-container">
      <div class="header">
        <h1>Nouvelle facture</h1>
        <button class="btn-back" routerLink="/factures">← Retour</button>
      </div>
      
      <form (ngSubmit)="saveFacture()" #factureForm="ngForm">
        <div class="form-group">
          <label>Type</label>
          <select [(ngModel)]="facture.type" name="type">
            <option value="vente">Vente</option>
            <option value="avoir">Avoir</option>
            <option value="proforma">Proforma</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Client</label>
          <select [(ngModel)]="facture.client_id" name="client_id" (change)="onClientChange()">
            <option value="">Sélectionner un client</option>
            <option *ngFor="let c of clients" [value]="c.id">{{ c.raison_sociale || c.nom + ' ' + (c.prenom || '') }}</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Date d'émission</label>
          <input type="date" [(ngModel)]="facture.date_emission" name="date_emission">
        </div>
        
        <div class="form-group">
          <label>Montant TTC</label>
          <input type="number" [(ngModel)]="facture.montant_ttc" name="montant_ttc">
        </div>
        
        <button type="submit" class="btn-save">Créer la facture</button>
      </form>
    </div>
  `,
  styles: [`
    .nouvelle-facture-container { padding: 24px; max-width: 600px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; margin: 0; }
    .btn-back { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; text-decoration: none; color: #6B7280; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 5px; color: #4B5563; }
    input, select { width: 100%; padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; width: 100%; }
  `]
})
export class NouvelleFacture implements OnInit {
  clients: any[] = [];
  facture: any = {
    type: 'vente',
    client_id: '',
    date_emission: new Date().toISOString().split('T')[0],
    montant_ttc: 0,
    statut: 'brouillon'
  };
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    this.loadClients();
  }
  
  loadClients() {
    const saved = localStorage.getItem('clients');
    this.clients = saved ? JSON.parse(saved) : [];
  }
  
  onClientChange() {
    const client = this.clients.find(c => c.id === Number(this.facture.client_id));
    if (client) this.facture.client_nom = client.raison_sociale || client.nom + ' ' + (client.prenom || '');
  }
  
  saveFacture() {
    const factures = JSON.parse(localStorage.getItem('factures') || '[]');
    const newFacture = {
      ...this.facture,
      id: Date.now(),
      numero: 'FACT-' + (factures.length + 1).toString().padStart(4, '0'),
      date_echeance: new Date(new Date(this.facture.date_emission).setDate(new Date(this.facture.date_emission).getDate() + 30)).toISOString().split('T')[0],
      montant_ht: this.facture.montant_ttc / 1.18,
      montant_tva: this.facture.montant_ttc - (this.facture.montant_ttc / 1.18)
    };
    factures.push(newFacture);
    localStorage.setItem('factures', JSON.stringify(factures));
    this.router.navigate(['/factures']);
  }
}
