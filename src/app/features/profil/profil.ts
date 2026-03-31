import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface ProfilData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  fonction: string;
  avatar: string;
  entreprise: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  site_web?: string;
}

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="profil-container">
      <div class="header">
        <h1>👤 Profil de l'entreprise</h1>
        <p class="subtitle">Gérez les informations de votre profil et de votre entreprise</p>
      </div>

      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <div class="profil-card">
        <!-- Section Avatar -->
        <div class="avatar-section">
          <div class="avatar-large">
            <span>{{ initiales }}</span>
          </div>
          <div class="avatar-info">
            <h3>Logo de l'entreprise</h3>
            <p>Les initiales sont générées automatiquement à partir du nom de l'entreprise ou du responsable</p>
            <div class="avatar-selector">
              <label>Icône</label>
              <select [(ngModel)]="profilData.avatar" class="avatar-select">
                <option value="🏢">🏢 Entreprise</option>
                <option value="🏭">🏭 Industrie</option>
                <option value="🏗️">🏗️ BTP</option>
                <option value="🚛">🚛 Transport</option>
                <option value="💼">💼 Services</option>
                <option value="🛒">🛒 Commerce</option>
                <option value="📦">📦 Logistique</option>
                <option value="💻">💻 Informatique</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Formulaire -->
        <form class="profil-form">
          <div class="form-section">
            <h2>🏢 Informations de l'entreprise</h2>
            
            <div class="form-group">
              <label>Nom de l'entreprise *</label>
              <input type="text" [(ngModel)]="profilData.entreprise" name="entreprise" 
                     placeholder="Ex: PulseBusiness" required>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Adresse</label>
                <input type="text" [(ngModel)]="profilData.adresse" name="adresse" 
                       placeholder="Ex: Bamako, Mali">
              </div>
              <div class="form-group">
                <label>Ville</label>
                <input type="text" [(ngModel)]="profilData.ville" name="ville" 
                       placeholder="Ex: Bamako">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Pays</label>
                <input type="text" [(ngModel)]="profilData.pays" name="pays" 
                       placeholder="Ex: Mali">
              </div>
              <div class="form-group">
                <label>Site web</label>
                <input type="url" [(ngModel)]="profilData.site_web" name="site_web" 
                       placeholder="https://www.entreprise.com">
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2>👤 Informations du responsable</h2>

            <div class="form-row">
              <div class="form-group">
                <label>Prénom</label>
                <input type="text" [(ngModel)]="profilData.prenom" name="prenom" 
                       placeholder="Fatoumata" (input)="updateInitiales()">
              </div>

              <div class="form-group">
                <label>Nom</label>
                <input type="text" [(ngModel)]="profilData.nom" name="nom" 
                       placeholder="NIARE" (input)="updateInitiales()">
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
                       placeholder="+223 XX XX XX XX">
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-save" (click)="saveProfil()">
              💾 Enregistrer les modifications
            </button>
          </div>
        </form>

        <!-- Aperçu en direct -->
        <div class="preview-section">
          <h3>📱 Aperçu dans l'application</h3>
          <div class="preview-cards">
            <div class="preview-card sidebar-preview">
              <h4>Sidebar</h4>
              <div class="preview-content">
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
            
            <div class="preview-card header-preview">
              <h4>En-tête</h4>
              <div class="preview-content">
                <span class="header-icon">{{ profilData.avatar }}</span>
                <div class="header-info">
                  <div class="header-title">{{ profilData.entreprise || 'PulseBusiness' }}</div>
                  <div class="header-subtitle">{{ profilData.fonction || 'Gestion d\'entreprise' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profil-container {
      padding: 24px;
      max-width: 900px;
      margin: 0 auto;
      background: #F9FAFB;
      min-height: 100vh;
    }

    .header {
      margin-bottom: 24px;
    }

    h1 {
      color: #1F2937;
      font-size: 28px;
      margin: 0;
    }

    .subtitle {
      color: #6B7280;
      margin: 8px 0 0 0;
    }

    .alert-success {
      background: #10B981;
      color: white;
      padding: 14px 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .profil-card {
      background: white;
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    /* Avatar */
    .avatar-section {
      display: flex;
      align-items: center;
      gap: 32px;
      margin-bottom: 32px;
      padding-bottom: 32px;
      border-bottom: 1px solid #F3F4F6;
      flex-wrap: wrap;
    }

    .avatar-large {
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, #EC4899, #831843);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      font-weight: 700;
      color: white;
      box-shadow: 0 8px 16px rgba(236,72,153,0.3);
    }

    .avatar-info {
      flex: 1;
    }

    .avatar-info h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: #1F2937;
    }

    .avatar-info p {
      margin: 0 0 16px 0;
      color: #6B7280;
      font-size: 13px;
    }

    .avatar-selector {
      max-width: 200px;
    }

    .avatar-selector label {
      display: block;
      color: #4B5563;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 6px;
    }

    .avatar-select {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #F3F4F6;
      border-radius: 10px;
      font-size: 14px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
    }

    .avatar-select:focus {
      outline: none;
      border-color: #EC4899;
    }

    /* Formulaire */
    .profil-form {
      margin-bottom: 32px;
    }

    .form-section {
      margin-bottom: 32px;
      padding-bottom: 32px;
      border-bottom: 1px solid #F3F4F6;
    }

    .form-section:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    h2 {
      color: #1F2937;
      font-size: 18px;
      margin: 0 0 24px 0;
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
      padding: 12px;
      border: 2px solid #F3F4F6;
      border-radius: 10px;
      font-size: 14px;
      transition: all 0.2s;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #EC4899;
    }

    /* Bouton */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .btn-save {
      background: #10B981;
      color: white;
      border: none;
      padding: 12px 28px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-save:hover {
      background: #059669;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16,185,129,0.3);
    }

    /* Aperçu */
    .preview-section {
      background: #F9FAFB;
      padding: 24px;
      border-radius: 16px;
      margin-top: 16px;
    }

    h3 {
      color: #1F2937;
      font-size: 16px;
      margin: 0 0 20px 0;
    }

    .preview-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .preview-card {
      background: white;
      border-radius: 12px;
      padding: 16px;
      border: 1px solid #F3F4F6;
    }

    .preview-card h4 {
      margin: 0 0 12px 0;
      font-size: 13px;
      color: #6B7280;
      font-weight: 500;
    }

    .preview-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .sidebar-preview .preview-content {
      background: #111827;
      padding: 12px;
      border-radius: 10px;
    }

    .sidebar-preview .preview-name {
      color: white;
    }

    .sidebar-preview .preview-role {
      color: #9CA3AF;
    }

    .preview-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #EC4899, #831843);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 600;
      color: white;
    }

    .preview-info {
      flex: 1;
    }

    .preview-name {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 2px;
      color: #1F2937;
    }

    .preview-role {
      font-size: 11px;
      color: #6B7280;
      margin-bottom: 4px;
    }

    .preview-badge {
      display: inline-block;
      background: #10B981;
      font-size: 9px;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 500;
      color: white;
    }

    .header-preview .preview-content {
      background: #FEF3F9;
      padding: 12px;
      border-radius: 10px;
    }

    .header-icon {
      font-size: 32px;
    }

    .header-title {
      font-weight: 600;
      font-size: 14px;
      color: #1F2937;
    }

    .header-subtitle {
      font-size: 11px;
      color: #6B7280;
    }

    @media (max-width: 768px) {
      .profil-card {
        padding: 20px;
      }
      .form-row {
        grid-template-columns: 1fr;
        gap: 0;
      }
      .avatar-section {
        flex-direction: column;
        text-align: center;
      }
      .preview-cards {
        grid-template-columns: 1fr;
      }
      .avatar-selector {
        max-width: 100%;
      }
    }
  `]
})
export class Profil implements OnInit {
  profilData: ProfilData = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    fonction: '',
    avatar: '🏢',
    entreprise: '',
    adresse: '',
    ville: '',
    pays: '',
    site_web: ''
  };

  initiales = '??';
  successMessage = '';

  ngOnInit() {
    this.loadProfil();
  }

  loadProfil() {
    const saved = localStorage.getItem('profil_data');
    if (saved) {
      this.profilData = JSON.parse(saved);
    }
    this.updateInitiales();
  }

  saveProfil() {
    localStorage.setItem('profil_data', JSON.stringify(this.profilData));
    this.updateInitiales();
    this.successMessage = 'Profil mis à jour avec succès !';
    setTimeout(() => this.successMessage = '', 3000);
  }

  updateInitiales() {
    if (this.profilData.prenom && this.profilData.nom) {
      this.initiales = (this.profilData.prenom.charAt(0) + this.profilData.nom.charAt(0)).toUpperCase();
    } else if (this.profilData.entreprise) {
      this.initiales = this.profilData.entreprise.substring(0, 2).toUpperCase();
    } else {
      this.initiales = '??';
    }
  }

  getPreviewInitiales(): string {
    if (this.profilData.prenom && this.profilData.nom) {
      return (this.profilData.prenom.charAt(0) + this.profilData.nom.charAt(0)).toUpperCase();
    }
    return this.profilData.entreprise ? this.profilData.entreprise.substring(0, 2).toUpperCase() : '??';
  }

  getPreviewName(): string {
    if (this.profilData.prenom && this.profilData.nom) {
      return `${this.profilData.prenom} ${this.profilData.nom}`;
    }
    return this.profilData.entreprise || 'PulseBusiness';
  }
}