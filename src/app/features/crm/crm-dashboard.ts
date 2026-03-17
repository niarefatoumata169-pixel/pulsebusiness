import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crm-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 40px; text-align: center;">
      <h1 style="color: #EC4899;">📊 CRM - Tableau de bord</h1>
      <p style="color: #6B7280;">Gestion de la relation client</p>
    </div>
  `
})
export class CrmDashboard {}
