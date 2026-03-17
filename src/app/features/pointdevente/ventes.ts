import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pdv-ventes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 40px; text-align: center;">
      <h1 style="color: #EC4899;">📊 Ventes</h1>
      <p style="color: #6B7280;">Suivi des ventes</p>
    </div>
  `
})
export class PdvVentes {}
