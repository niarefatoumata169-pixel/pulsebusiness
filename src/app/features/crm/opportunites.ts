import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-opportunites',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 40px; text-align: center;">
      <h1 style="color: #EC4899;">💼 Opportunités</h1>
      <p style="color: #6B7280;">Suivi des opportunités commerciales</p>
    </div>
  `
})
export class Opportunites {}
