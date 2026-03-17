import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nouveau-chantier',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="nouveau-chantier-container">
      <div class="header">
        <h1>Nouveau chantier</h1>
        <button class="btn-back" routerLink="/chantiers">← Retour</button>
      </div>
      
      <form (ngSubmit)="saveChantier()" #chantierForm="ngForm">
        <div class="form-group">
          <label>Nom du chantier</label>
          <input type="text" [(ngModel)]="chantier.nom" name="nom" required>
        </div>
        
        <div class="form-group">
          <label>Client</label>
          <select [(ngModel)]="chantier.client_id" name="client_id" (change)="onClientChange()">
            <option value="">Sélectionner un client</option>
            <option *ngFor="let c of clients" [value]="c.id">{{ c.raison_sociale || c.nom + ' ' + (c.prenom || '') }}</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Ville</label>
          <input type="text" [(ngModel)]="chantier.ville" name="ville" required>
        </div>
        
        <div class="form-group">
          <label>Date début</label>
          <input type="date" [(ngModel)]="chantier.date_debut" name="date_debut" required>
        </div>
        
        <div class="form-group">
          <label>Budget</label>
          <input type="number" [(ngModel)]="chantier.budget" name="budget" required>
        </div>
        
        <button type="submit" class="btn-save">Créer le chantier</button>
      </form>
    </div>
  `,
  styles: [`
    .nouveau-chantier-container { padding: 24px; max-width: 600px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; margin: 0; }
    .btn-back { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; text-decoration: none; color: #6B7280; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 5px; color: #4B5563; }
    input, select { width: 100%; padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; width: 100%; }
  `]
})
export class NouveauChantier implements OnInit {
  clients: any[] = [];
  chantier: any = {
    nom: '',
    client_id: '',
    ville: '',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
    budget: 0,
    statut: 'en_attente',
    responsable: ''
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
    const client = this.clients.find(c => c.id === Number(this.chantier.client_id));
    if (client) this.chantier.client_nom = client.raison_sociale || client.nom + ' ' + (client.prenom || '');
  }
  
  saveChantier() {
    const chantiers = JSON.parse(localStorage.getItem('chantiers') || '[]');
    const newChantier = {
      ...this.chantier,
      id: Date.now(),
      numero: 'CH-' + (chantiers.length + 1).toString().padStart(3, '0'),
      adresse: '',
      responsable: 'À définir'
    };
    chantiers.push(newChantier);
    localStorage.setItem('chantiers', JSON.stringify(chantiers));
    this.router.navigate(['/chantiers']);
  }
}
