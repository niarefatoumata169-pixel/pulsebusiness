import { Component } from '@angular/core';

@Component({
  selector: 'app-banque',
  standalone: true,
  template: `
    <div class="banque">
      <h2>Gestion bancaire</h2>
      <p>Page en construction</p>
    </div>
  `,
  styles: [`
    .banque {
      padding: 20px;
    }
    h2 {
      color: #1F2937;
    }
  `]
})
export class Banque {}  // ← Sans "Component"