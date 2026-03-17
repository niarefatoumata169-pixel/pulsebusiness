import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProfilService, ProfilData } from '../../services/profil.service';

interface OpenMenus {
  [key: string]: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  openMenus: OpenMenus = {};
  profil: ProfilData | null = null;
  initiales = '??';
  displayName = 'Chargement...';
  isCollapsed = false;

  constructor(
    private profilService: ProfilService,
    private router: Router
  ) {
    const savedState = localStorage.getItem('sidebar_collapsed');
    this.isCollapsed = savedState === 'true';
  }

  ngOnInit() {
    this.loadProfil();
    
    window.addEventListener('storage', (event) => {
      if (event.key === 'pulsebusiness_profil') {
        this.loadProfil();
      }
    });
  }

  loadProfil() {
    this.profil = this.profilService.getProfil();
    this.initiales = this.getInitiales();
    
    if (this.profil) {
      if (this.profil.prenom && this.profil.nom) {
        this.displayName = `${this.profil.prenom} ${this.profil.nom}`;
      } else {
        this.displayName = this.profil.entreprise || 'Entreprise';
      }
    }
  }

  getInitiales(): string {
    if (!this.profil) return '??';
    
    if (this.profil.prenom && this.profil.nom) {
      return (this.profil.prenom.charAt(0) + this.profil.nom.charAt(0)).toUpperCase();
    }
    return (this.profil.entreprise || 'EN').substring(0, 2).toUpperCase();
  }

  toggleMenu(menu: string) {
    if (!this.isCollapsed) {
      this.openMenus[menu] = !this.openMenus[menu];
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('sidebar_collapsed', String(this.isCollapsed));
    
    if (this.isCollapsed) {
      this.openMenus = {};
    }
  }

  goToProfile() {
    this.router.navigate(['/profil']);
  }

  logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      localStorage.clear();
      window.location.href = '/login';
    }
  }
}
