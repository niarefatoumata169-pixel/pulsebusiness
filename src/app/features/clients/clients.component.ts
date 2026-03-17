import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api/api.service';
import { Client } from '../../models/index';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="clients-container">
      <h1>Gestion des clients</h1>
      <p>Composant en cours de développement</p>
    </div>
  `,
  styles: [`
    .clients-container { padding: 20px; }
  `]
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];

  constructor(private api: ApiService) {}

  async ngOnInit() {
    this.clients = await this.api.getClients();
  }
}
