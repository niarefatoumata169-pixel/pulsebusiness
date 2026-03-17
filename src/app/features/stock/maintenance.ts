import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="maintenance-container">
      <h1>Maintenance</h1>
      <p>Module en cours de développement</p>
    </div>
  `,
  styles: [`
    .maintenance-container { padding: 24px; }
  `]
})
export class Maintenance implements OnInit {
  ngOnInit() {}
}
