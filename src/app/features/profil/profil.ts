import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProfilService, ProfilData } from '../../services/profil.service';  // ← ProfilData

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="profil-container">
      <h1>Profil de l'entreprise</h1>

      <div class="profil-card">
        <!-- Avatar -->
        <div class="avatar-section">
          <div class="avatar-large">
            <span>{{ initiales }}</span>
          </div>
          <div class="avatar-hint">
            <p>Les initiales sont générées automatiquement</p>
          </div>
        </div>

        <!-- Formulaire -->
        <form class="profil-form">
          <div class="form-section">
            <h2>Informations de l'entreprise</h2>
            
            <div class="form-group">
              <label>Nom de l'entreprise</label>
              <input type="text" [(ngModel)]="profilData.entreprise" name="entreprise" 
                     placeholder="Ex: H2A Holding">
            </div>

            <div class="form-group">
              <label>Logo / Icône</label>
              <select [(ngModel)]="profilData.avatar" name="avatar" class="avatar-select">
                <option value="🏢">🏢 Entreprise</option>
                <option value="🏭">🏭 Industrie</option>
                <option value="🏗️">🏗️ BTP</option>
                <option value="🚛">🚛 Transport</option>
                <option value="💼">💼 Services</option>
                <option value="🛒">🛒 Commerce</option>
              </select>
            </div>
          </div>

          <div class="form-section">
            <h2>Informations du responsable</h2>

            <div class="form-row">
              <div class="form-group">
                <label>Prénom</label>
                <input type="text" [(ngModel)]="profilData.prenom" name="prenom" 
                       placeholder="Fatoumata">
              </div>

              <div class="form-group">
                <label>Nom</label>
                <input type="text" [(ngModel)]="profilData.nom" name="nom" 
                       placeholder="NIARE">
              </div>
            </div>

            <div class="form-group">
              <label>Fonction</label>
              <input type="text" [(ngModel)]="profilData.fonction" name="fonction" 
                     placeholder="Directrice Générale">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="profilData.email" name="email" 
                       placeholder="contact@entreprise.com">
              </div>

              <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" [(ngModel)]="profilData.telephone" name="telephone" 
                       placeholder="+225 00 00 00 00">
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-save" (click)="saveProfil()">
              Enregistrer les modifications
            </button>
          </div>
        </form>

        <!-- Aperçu en direct -->
        <div class="preview-section">
          <h3>Aperçu dans la sidebar</h3>
          <div class="sidebar-preview">
            <div class="preview-avatar">
              <span>{{ getPreviewInitiales() }}</span>
            </div>
            <div class="preview-info">
              <div class="preview-name">{{ getPreviewName() }}</div>
              <div class="preview-role">{{ profilData.fonction || 'Administrateur' }}</div>
              <span class="preview-badge">{{ profilData.entreprise || 'Entreprise' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profil-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    h1 {
      color: #1F2937;
      font-size: 28px;
      margin-bottom: 24px;
    }

    .profil-card {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    /* Avatar */
    .avatar-section {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid #F3F4F6;
    }

    .avatar-large {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #EC4899, #831843);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 700;
      color: white;
      box-shadow: 0 8px 16px rgba(37,99,235,0.3);
    }

    .avatar-hint p {
      color: #6B7280;
      font-size: 13px;
      margin: 0;
    }

    /* Formulaire */
    .profil-form {
      margin-bottom: 32px;
    }

    .form-section {
      margin-bottom: 32px;
    }

    h2 {
      color: #1F2937;
      font-size: 18px;
      margin: 0 0 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      color: #4B5563;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 6px;
    }

    input, select {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #E5E7EB;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #EC4899;
    }

    .avatar-select {
      cursor: pointer;
    }

    /* Bouton */
    .form-actions {
      display: flex;
      justify-content: flex-end;
    }

    .btn-save {
      background: #10B981;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-save:hover {
      background: #10B981;
    }

    /* Aperçu */
    .preview-section {
      background: #F9FAFB;
      padding: 20px;
      border-radius: 12px;
      border: 2px dashed #E5E7EB;
    }

    h3 {
      color: #1F2937;
      font-size: 16px;
      margin: 0 0 16px;
    }

    .sidebar-preview {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #111827;
      border-radius: 8px;
      color: white;
    }

    .preview-avatar {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #EC4899, #831843);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 600;
    }

    .preview-info {
      flex: 1;
    }

    .preview-name {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 2px;
    }

    .preview-role {
      font-size: 11px;
      color: #9CA3AF;
      margin-bottom: 2px;
    }

    .preview-badge {
      display: inline-block;
      background: #10B981;
      font-size: 9px;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 500;
    }
  `]
})
export class Profil implements OnInit {
  profilData: ProfilData = {  // ← Utilise ProfilData
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    fonction: '',
    avatar: '🏢',
    entreprise: ''
  };

  initiales = '??';

  constructor(private profilService: ProfilService) {}

  ngOnInit() {
    const saved = this.profilService.getProfil();
    if (saved) {
      this.profilData = saved;
    }
    this.updateInitiales();
  }

  updateInitiales() {
    if (this.profilData.prenom && this.profilData.nom) {
      this.initiales = (this.profilData.prenom.charAt(0) + this.profilData.nom.charAt(0)).toUpperCase();
    } else {
      this.initiales = this.profilData.entreprise.substring(0, 2).toUpperCase();
    }
  }

  getPreviewInitiales(): string {
    if (this.profilData.prenom && this.profilData.nom) {
      return (this.profilData.prenom.charAt(0) + this.profilData.nom.charAt(0)).toUpperCase();
    }
    return this.profilData.entreprise.substring(0, 2).toUpperCase();
  }

  getPreviewName(): string {
    if (this.profilData.prenom && this.profilData.nom) {
      return `${this.profilData.prenom} ${this.profilData.nom}`;
    }
    return this.profilData.entreprise;
  }

  saveProfil() {
    this.profilService.saveProfil(this.profilData);
    this.updateInitiales();
    alert('Profil mis à jour avec succès !');
  }
}