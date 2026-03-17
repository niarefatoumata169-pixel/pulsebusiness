import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExcelService } from '../services/excel.service';
import { PdfService } from '../services/pdf.service';

// Interface pour typer les clients
interface Client {
  id?: number;
  nom: string;
  email: string;
  telephone: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
  secteur?: string;
  notes?: string;
  created_at?: Date;
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  providers: [ExcelService, PdfService],
  template: `
    <div class="clients-container">
      <!-- En-tête -->
      <div class="header">
        <div>
          <h1>Gestion des clients</h1>
          <p class="subtitle">{{ clients.length }} client(s) enregistré(s)</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="clients.length > 0">
            📊 Excel
          </button>
          <button class="btn-pdf" (click)="exportToPdf()" *ngIf="clients.length > 0">
            📄 PDF
          </button>
          <button class="btn-add" routerLink="/clients/nouveau">
            + Nouveau client
          </button>
        </div>
      </div>

      <!-- Barre de recherche -->
      <div class="search-bar" *ngIf="clients.length > 0">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          [(ngModel)]="searchTerm" 
          (ngModelChange)="filterClients()"
          placeholder="Rechercher un client..."
          class="search-input"
        >
        <span class="search-count" *ngIf="filteredClients.length !== clients.length">
          {{ filteredClients.length }} résultat(s)
        </span>
      </div>

      <!-- Tableau des clients -->
      <div class="table-container" *ngIf="clients.length > 0; else emptyState">
        <table class="clients-table">
          <thead>
            <tr>
              <th (click)="sortBy('nom')" class="sortable">
                Nom {{ getSortIcon('nom') }}
              </th>
              <th (click)="sortBy('email')" class="sortable">
                Email {{ getSortIcon('email') }}
              </th>
              <th (click)="sortBy('telephone')" class="sortable">
                Téléphone {{ getSortIcon('telephone') }}
              </th>
              <th (click)="sortBy('ville')" class="sortable">
                Ville {{ getSortIcon('ville') }}
              </th>
              <th (click)="sortBy('created_at')" class="sortable">
                Date création {{ getSortIcon('created_at') }}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let client of paginatedClients">
              <td class="client-name">
                <span class="name-avatar">{{ getInitials(client.nom) }}</span>
                {{ client.nom }}
              </td>
              <td>
                <a [href]="'mailto:' + client.email" class="email-link">{{ client.email }}</a>
              </td>
              <td>
                <a [href]="'tel:' + client.telephone" class="phone-link">{{ client.telephone || '-' }}</a>
              </td>
              <td>{{ client.ville || '-' }}</td>
              <td>{{ client.created_at ? (client.created_at | date:'dd/MM/yyyy') : '-' }}</td>
              <td class="actions">
                <button class="btn-icon" [routerLink]="['/clients', client.id]" title="Voir">
                  👁️
                </button>
                <button class="btn-icon" [routerLink]="['/clients', client.id, 'edit']" title="Modifier">
                  ✏️
                </button>
                <button class="btn-icon delete" (click)="deleteClient(client)" title="Supprimer">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination" *ngIf="totalPages > 1">
          <button 
            class="page-btn" 
            [class.disabled]="currentPage === 1"
            (click)="changePage(currentPage - 1)"
            [disabled]="currentPage === 1">
            ◀
          </button>
          
          <span *ngFor="let page of getPages()" class="page-numbers">
            <button 
              class="page-btn" 
              [class.active]="page === currentPage"
              (click)="changePage(page)"
              *ngIf="page > 0 && page <= totalPages">
              {{ page }}
            </button>
          </span>
          
          <button 
            class="page-btn" 
            [class.disabled]="currentPage === totalPages"
            (click)="changePage(currentPage + 1)"
            [disabled]="currentPage === totalPages">
            ▶
          </button>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">👥</div>
          <h2>Aucun client pour le moment</h2>
          <p>Commencez par ajouter votre premier client</p>
          <button class="btn-primary" routerLink="/clients/nouveau">
            + Ajouter un client
          </button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .clients-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    h1 {
      color: #1F2937;
      font-size: 28px;
      margin: 0 0 4px;
    }

    .subtitle {
      color: #6B7280;
      font-size: 14px;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn-add {
      background: #EC4899;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      text-decoration: none;
      display: inline-block;
    }

    .btn-excel {
      background: #10B981;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-pdf {
      background: #EF4444;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
    }

    .search-bar {
      background: white;
      border: 2px solid #FCE7F3;
      border-radius: 12px;
      padding: 8px 16px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .search-icon {
      color: #9CA3AF;
      font-size: 18px;
    }

    .search-input {
      flex: 1;
      border: none;
      padding: 8px 0;
      font-size: 15px;
      outline: none;
    }

    .search-count {
      color: #EC4899;
      font-size: 13px;
      font-weight: 500;
      background: #FDF2F8;
      padding: 4px 8px;
      border-radius: 20px;
    }

    .table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      overflow: auto;
    }

    .clients-table {
      width: 100%;
      border-collapse: collapse;
    }

    .clients-table th {
      text-align: left;
      padding: 16px;
      background: #FDF2F8;
      color: #1F2937;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
    }

    .clients-table td {
      padding: 16px;
      border-bottom: 1px solid #FCE7F3;
      color: #4B5563;
    }

    .sortable {
      position: relative;
    }

    .sortable:hover {
      color: #EC4899;
    }

    .client-name {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .name-avatar {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #EC4899, #F472B6);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: 600;
    }

    .email-link, .phone-link {
      color: #6B7280;
      text-decoration: none;
    }

    .email-link:hover {
      color: #EC4899;
      text-decoration: underline;
    }

    .phone-link:hover {
      color: #10B981;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      background: none;
      border: 1px solid #FCE7F3;
      border-radius: 6px;
      padding: 6px 10px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s;
    }

    .btn-icon:hover {
      background: #FDF2F8;
      border-color: #EC4899;
    }

    .btn-icon.delete:hover {
      background: #FEE2E2;
      border-color: #EF4444;
    }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      padding: 20px;
    }

    .page-btn {
      background: white;
      border: 1px solid #FCE7F3;
      border-radius: 6px;
      padding: 8px 12px;
      cursor: pointer;
      color: #4B5563;
      min-width: 40px;
    }

    .page-btn:hover:not(:disabled) {
      background: #FDF2F8;
      border-color: #EC4899;
      color: #EC4899;
    }

    .page-btn.active {
      background: #EC4899;
      color: white;
      border-color: #EC4899;
    }

    .page-btn.disabled, .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-numbers {
      display: flex;
      gap: 8px;
    }

    /* État vide */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      border: 2px dashed #FCE7F3;
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h2 {
      color: #1F2937;
      margin-bottom: 8px;
    }

    .empty-state p {
      color: #6B7280;
      margin-bottom: 24px;
    }

    .btn-primary {
      background: #EC4899;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      text-decoration: none;
      display: inline-block;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: stretch;
      }
      
      .header-actions {
        justify-content: stretch;
      }
      
      .btn-add, .btn-excel, .btn-pdf {
        flex: 1;
        text-align: center;
      }
    }
  `]
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  searchTerm: string = '';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  
  // Tri
  sortField: string = 'nom';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private excelService: ExcelService,
    private pdfService: PdfService
  ) {}

  ngOnInit() {
    this.loadClients();
  }

  // Charger les clients (simulé pour l'instant)
  loadClients() {
    // TODO: Remplacer par un vrai appel API
    this.clients = [];
    this.filteredClients = [];
    this.updatePagination();
  }

  // Filtrer les clients
  filterClients() {
    const term = this.searchTerm.toLowerCase().trim();
    
    if (!term) {
      this.filteredClients = [...this.clients];
    } else {
      this.filteredClients = this.clients.filter(client => 
        client.nom?.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.telephone?.includes(term) ||
        client.ville?.toLowerCase().includes(term)
      );
    }
    
    this.currentPage = 1;
    this.sortClients();
    this.updatePagination();
  }

  // Trier les clients
  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    this.sortClients();
  }

  private sortClients() {
    this.filteredClients.sort((a, b) => {
      let valA = a[this.sortField as keyof Client] || '';
      let valB = b[this.sortField as keyof Client] || '';
      
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredClients.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  get paginatedClients(): Client[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredClients.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Export
  exportToExcel() {
    this.excelService.exportClients(this.filteredClients);
  }

  exportToPdf() {
    this.pdfService.generateClientsList(this.filteredClients);
  }

  // Supprimer un client
  deleteClient(client: Client) {
    if (confirm(`Voulez-vous vraiment supprimer ${client.nom} ?`)) {
      // TODO: Appeler l'API pour supprimer
      this.clients = this.clients.filter(c => c.id !== client.id);
      this.filterClients();
    }
  }

  // Utilitaires
  getInitials(nom: string): string {
    if (!nom) return '??';
    return nom.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return '↕️';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }
}