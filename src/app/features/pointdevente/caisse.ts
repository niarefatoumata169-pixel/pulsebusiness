import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pdv-caisse',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 40px; text-align: center;">
      <h1 style="color: #EC4899;">💰 Caisse</h1>
      <p style="color: #6B7280;">Gestion de la caisse</p>
    </div>
  `
})
export class PdvCaisse {}
