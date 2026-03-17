import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-campagnes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 40px; text-align: center;">
      <h1 style="color: #EC4899;">📧 Campagnes</h1>
      <p style="color: #6B7280;">Gestion des campagnes marketing</p>
    </div>
  `
})
export class Campagnes {}
