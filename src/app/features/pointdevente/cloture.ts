import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pdv-cloture',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 40px; text-align: center;">
      <h1 style="color: #EC4899;">✅ Clôture</h1>
      <p style="color: #6B7280;">Clôture de caisse</p>
    </div>
  `
})
export class PdvCloture {}
