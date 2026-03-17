import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Chantier {
  id?: number;
  numero: string;
  nom: string;
  client_id?: number;
  client_nom?: string;
  adresse: string;
  ville: string;
  date_debut: string;
  date_fin: string;
  budget: number;
  statut: 'en_attente' | 'en_cours' | 'termine' | 'suspendu';
  responsable: string;
  notes?: string;
}

@Component({
  selector: 'app-chantiers',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="chantiers-container">
      <div class="header">
        <div>
          <h1>Chantiers</h1>
          <p class="subtitle">{{ chantiers.length }} chantier(s)</p>
        </div>
        <button class="btn-add" routerLink="/chantiers/nouveau">+ Nouveau chantier</button>
      </div>
      
      <div class="chantiers-grid" *ngIf="chantiers.length > 0; else emptyState">
        <div class="chantier-card" *ngFor="let c of chantiers">
          <div class="chantier-header">
            <span class="chantier-nom">{{ c.nom }}</span>
            <span class="chantier-badge" [class]="c.statut">{{ getStatutLabel(c.statut) }}</span>
          </div>
          <div class="chantier-body">
            <p><span class="label">Client:</span> {{ c.client_nom || '-' }}</p>
            <p><span class="label">Début:</span> {{ c.date_debut | date }}</p>
            <p><span class="label">Budget:</span> {{ c.budget | number }} FCFA</p>
            <p><span class="label">Ville:</span> {{ c.ville }}</p>
          </div>
          <div class="chantier-footer">
            <button class="btn-icon" [routerLink]="['/chantiers', c.id]">👁️</button>
            <button class="btn-icon" [routerLink]="['/chantiers', c.id, 'edit']">✏️</button>
            <button class="btn-icon delete" (click)="deleteChantier(c)">🗑️</button>
          </div>
        </div>
      </div>
      
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🏗️</div>
          <h2>Aucun chantier</h2>
          <p>Créez votre premier chantier</p>
          <button class="btn-primary" routerLink="/chantiers/nouveau">+ Nouveau chantier</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .chantiers-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 0; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; text-decoration: none; }
    .chantiers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .chantier-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .chantier-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .chantier-nom { font-weight: 600; color: #1F2937; }
    .chantier-badge { font-size: 12px; padding: 4px 8px; border-radius: 4px; }
    .chantier-badge.en_attente { background: #F59E0B; color: white; }
    .chantier-badge.en_cours { background: #10B981; color: white; }
    .chantier-badge.termine { background: #6B7280; color: white; }
    .chantier-badge.suspendu { background: #EC4899; color: white; }
    .chantier-body p { margin: 5px 0; color: #6B7280; }
    .chantier-body .label { color: #4B5563; width: 60px; display: inline-block; }
    .chantier-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #FCE7F3; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
  `]
})
export class Chantiers implements OnInit {
  chantiers: Chantier[] = [];
  ngOnInit() {
    this.loadChantiers();
  }
  loadChantiers() {
    const saved = localStorage.getItem('chantiers');
    this.chantiers = saved ? JSON.parse(saved) : [];
  }
  getStatutLabel(statut: string): string {
    const labels: any = { en_attente: 'En attente', en_cours: 'En cours', termine: 'Terminé', suspendu: 'Suspendu' };
    return labels[statut] || statut;
  }
  deleteChantier(c: Chantier) {
    if (confirm('Supprimer ce chantier ?')) {
      this.chantiers = this.chantiers.filter(ch => ch.id !== c.id);
      localStorage.setItem('chantiers', JSON.stringify(this.chantiers));
    }
  }
}
