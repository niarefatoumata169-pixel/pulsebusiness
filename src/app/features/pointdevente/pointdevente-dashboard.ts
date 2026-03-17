import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pdv-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 40px; text-align: center;">
      <h1 style="color: #EC4899;">🛒 Point de vente - Dashboard</h1>
      <p style="color: #6B7280;">Gestion des points de vente</p>
    </div>
  `
})
export class PdvDashboard {}
