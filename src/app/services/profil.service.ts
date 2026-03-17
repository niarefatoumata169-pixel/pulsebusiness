import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ProfilData {  // ← Renommé pour éviter le conflit
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  fonction: string;
  avatar: string;
  entreprise: string;
  logo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfilService {
  private profilKey = 'pulsebusiness_profil';

  constructor() {
    // Initialiser avec des valeurs par défaut si vide
    if (!this.getProfil()) {
      this.saveProfil({
        nom: 'Entreprise',
        prenom: '',
        email: 'contact@entreprise.com',
        telephone: '+225 00 00 00 00',
        fonction: 'Administrateur',
        avatar: '🏢',
        entreprise: 'Mon Entreprise'
      });
    }
  }

  getProfil(): ProfilData | null {
    const saved = localStorage.getItem(this.profilKey);
    return saved ? JSON.parse(saved) : null;
  }

  saveProfil(profil: ProfilData): void {
    localStorage.setItem(this.profilKey, JSON.stringify(profil));
  }

  getInitiales(profil: ProfilData): string {
    if (!profil) return '??';
    
    if (profil.prenom && profil.nom) {
      return (profil.prenom.charAt(0) + profil.nom.charAt(0)).toUpperCase();
    }
    return profil.entreprise.substring(0, 2).toUpperCase();
  }
}