import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="register-page">
      <div class="register-card">
        
        <div class="logo">
          <span class="pulse">PULSE</span><span class="business">BUSINESS</span>
        </div>

        <h2>Créer votre espace</h2>
        <p class="subtitle">Informations de l'entreprise ou du particulier</p>

        <!-- Formulaire en tableau -->
        <div class="register-table">
          
          <!-- TYPE D'ENTITÉ -->
          <div class="table-section">
            <div class="section-title">Type d'entité</div>
            
            <div class="table-row">
              <div class="table-label">Vous êtes *</div>
              <div class="table-options-group">
                <label class="radio-option">
                  <input type="radio" [(ngModel)]="typeEntite" name="typeEntite" value="entreprise">
                  <span>🏢 Entreprise</span>
                </label>
                <label class="radio-option">
                  <input type="radio" [(ngModel)]="typeEntite" name="typeEntite" value="particulier">
                  <span>👤 Particulier / Professionnel</span>
                </label>
              </div>
            </div>
          </div>

          <!-- INFORMATIONS DE BASE -->
          <div class="table-section">
            <div class="section-title">Informations de base</div>
            
            <div class="table-row">
              <div class="table-label">{{ typeEntite === 'entreprise' ? 'Raison sociale *' : 'Nom complet *' }}</div>
              <div class="table-input">
                <input 
                  type="text" 
                  [(ngModel)]="nomEntite" 
                  [placeholder]="typeEntite === 'entreprise' ? 'H2A Holding' : 'Fatoumata NIARE'"
                />
              </div>
            </div>

            <div class="table-row">
              <div class="table-label">Email professionnel *</div>
              <div class="table-input">
                <input 
                  type="email" 
                  [(ngModel)]="email" 
                  placeholder="contact@entreprise.com"
                />
              </div>
            </div>

            <div class="table-row">
              <div class="table-label">Téléphone *</div>
              <div class="table-input">
                <input 
                  type="tel" 
                  [(ngModel)]="telephone" 
                  placeholder="+225 00 00 00 00"
                />
              </div>
            </div>
          </div>

          <!-- INFORMATIONS SPÉCIFIQUES ENTREPRISE -->
          <div class="table-section" *ngIf="typeEntite === 'entreprise'">
            <div class="section-title">Informations légales</div>
            
            <div class="table-row">
              <div class="table-label">Forme juridique</div>
              <div class="table-input">
                <select [(ngModel)]="formeJuridique">
                  <option value="">Sélectionner</option>
                  <option value="sa">SA</option>
                  <option value="sarl">SARL</option>
                  <option value="sas">SAS</option>
                  <option value="eurl">EURL</option>
                  <option value="ei">Entreprise Individuelle</option>
                </select>
              </div>
            </div>

            <div class="table-row">
              <div class="table-label">Date de création</div>
              <div class="table-input">
                <input type="date" [(ngModel)]="dateCreation" />
              </div>
            </div>

            <div class="table-row">
              <div class="table-label">N° RC / Registre</div>
              <div class="table-input">
                <input type="text" [(ngModel)]="numRC" placeholder="CI-ABJ-2025-B-12345" />
              </div>
            </div>

            <div class="table-row">
              <div class="table-label">N° IFU / Contribuable</div>
              <div class="table-input">
                <input type="text" [(ngModel)]="numIFU" placeholder="1234567890123" />
              </div>
            </div>

            <div class="table-row">
              <div class="table-label">Capital social</div>
              <div class="table-input">
                <input type="number" [(ngModel)]="capital" placeholder="10 000 000" />
                <span class="input-suffix">FCFA</span>
              </div>
            </div>
          </div>

          <!-- INFORMATIONS SPÉCIFIQUES PARTICULIER -->
          <div class="table-section" *ngIf="typeEntite === 'particulier'">
            <div class="section-title">Informations personnelles</div>
            
            <div class="table-row">
              <div class="table-label">Date de naissance</div>
              <div class="table-input">
                <input type="date" [(ngModel)]="dateNaissance" />
              </div>
            </div>

            <div class="table-row">
              <div class="table-label">Lieu de naissance</div>
              <div class="table-input">
                <input type="text" [(ngModel)]="lieuNaissance" placeholder="Abidjan" />
              </div>
            </div>

            <div class="table-row">
              <div class="table-label">Nationalité</div>
              <div class="table-input">
                <input type="text" [(ngModel)]="nationalite" placeholder="Ivoirienne" />
              </div>
            </div>

            <div class="table-row">
              <div class="table-label">N° CNI / Passeport</div>
              <div class="table-input">
                <input type="text" [(ngModel)]="numPiece" placeholder="C-12345678" />
              </div>
            </div>

            <div class="table-row">
              <div class="table-label">Profession</div>
              <div class="table-input">
                <input type="text" [(ngModel)]="profession" placeholder="Commerçant" />
              </div>
            </div>
          </div>

          <!-- SECTEUR D'ACTIVITÉ -->
          <div class="table-section">
            <div class="section-title">Secteur d'activité</div>
            
            <div class="table-row">
              <div class="table-label">Secteur *</div>
              <div class="table-input">
                <select [(ngModel)]="secteur">
                  <option value="">Sélectionner</option>
                  <option value="btp">🏗️ BTP / Construction</option>
                  <option value="commerce">🛒 Commerce / Distribution</option>
                  <option value="transport">🚛 Transport / Logistique</option>
                  <option value="service">💼 Services / Conseil</option>
                  <option value="industrie">⚙️ Industrie / Production</option>
                  <option value="agriculture">🌾 Agriculture / Élevage</option>
                  <option value="tech">💻 Technologies / IT</option>
                  <option value="sante">🏥 Santé / Médical</option>
                  <option value="education">🎓 Éducation / Formation</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>
          </div>

          <!-- TYPE DE SERVICE -->
          <div class="table-section">
            <div class="section-title">Type de service souhaité</div>
            
            <div class="table-row">
              <div class="table-label">Activité *</div>
              <div class="table-options-group">
                <label class="checkbox-option">
                  <input type="checkbox" [(ngModel)]="servicePublic">
                  <span>🏛️ Service public / Administration</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" [(ngModel)]="servicePrive">
                  <span>🏢 Service privé / Entreprise</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" [(ngModel)]="serviceDouane">
                  <span>📦 Douane / Import-Export</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" [(ngModel)]="serviceMixte">
                  <span>🔄 Mixte / Les deux</span>
                </label>
              </div>
            </div>
          </div>

          <!-- MOT DE PASSE -->
          <div class="table-section">
            <div class="section-title">Sécurité</div>
            
            <div class="table-row">
              <div class="table-label">Mot de passe *</div>
              <div class="table-input password-field">
                <input 
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="password"
                  placeholder="••••••••"
                />
                <button type="button" class="eye-btn" (click)="showPassword = !showPassword">
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
            </div>

            <div class="table-row">
              <div class="table-label">Confirmer *</div>
              <div class="table-input">
                <input 
                  [type]="showConfirm ? 'text' : 'password'"
                  [(ngModel)]="confirmPassword"
                  placeholder="••••••••"
                />
                <button type="button" class="eye-btn" (click)="showConfirm = !showConfirm">
                  {{ showConfirm ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
            </div>
          </div>

          <!-- BOUTON D'INSCRIPTION -->
          <div class="table-row no-border">
            <div class="table-button-cell">
              <button class="register-btn" (click)="register()" [disabled]="!isFormValid">
                <span>CRÉER MON ESPACE</span>
                <span class="arrow">→</span>
              </button>
            </div>
          </div>
        </div>

        <!-- LIEN CONNEXION -->
        <div class="login-link">
          <p>Déjà un compte ? <a routerLink="/login">Se connecter</a></p>
        </div>

        <a routerLink="/" class="back-link">← Retour à l'accueil</a>
      </div>
    </div>
  `,
  styles: [`
    .register-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #EC4899, #9D174D);
      padding: 40px 20px;
      font-family: 'Inter', sans-serif;
    }

    .register-card {
      background: white;
      padding: 48px;
      border-radius: 16px;
      width: 100%;
      max-width: 800px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .logo {
      text-align: center;
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 24px;
      letter-spacing: -1px;
    }

    .pulse { color: #EC4899; }
    .business { color: #9D174D; }

    h2 {
      color: #1F2937;
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      text-align: center;
    }

    .subtitle {
      color: #6B7280;
      font-size: 14px;
      text-align: center;
      margin-bottom: 32px;
    }

    /* TABLEAU */
    .register-table {
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 24px;
    }

    .table-section {
      border-bottom: 1px solid #E5E7EB;
    }

    .table-section:last-child {
      border-bottom: none;
    }

    .section-title {
      background: #F9FAFB;
      padding: 12px 16px;
      font-weight: 700;
      color: #1F2937;
      font-size: 14px;
      border-bottom: 1px solid #E5E7EB;
    }

    .table-row {
      display: grid;
      grid-template-columns: 200px 1fr;
      border-bottom: 1px solid #E5E7EB;
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .no-border {
      border-bottom: none;
    }

    .table-label {
      background: #F9FAFB;
      padding: 12px 16px;
      font-weight: 600;
      color: #4B5563;
      font-size: 13px;
      border-right: 1px solid #E5E7EB;
      display: flex;
      align-items: center;
    }

    .table-input, .table-options-group, .table-button-cell {
      padding: 8px 16px;
      background: white;
      display: flex;
      align-items: center;
    }

    .table-button-cell {
      grid-column: span 2;
      padding: 20px;
      background: #F9FAFB;
      justify-content: center;
    }

    .password-field {
      position: relative;
      width: 100%;
    }

    input, select {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid #D1D5DB;
      border-radius: 6px;
      font-size: 14px;
      outline: none;
    }

    input:focus, select:focus {
      border-color: #EC4899;
    }

    .eye-btn {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
    }

    .input-suffix {
      margin-left: 8px;
      color: #6B7280;
      font-size: 13px;
    }

    /* Options radio et checkbox */
    .table-options-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .radio-option, .checkbox-option {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 13px;
      color: #4B5563;
    }

    /* Bouton */
    .register-btn {
      background: #EC4899;
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.2s;
      min-width: 250px;
    }

    .register-btn:hover:not(:disabled) {
      background: #DB2777;
    }

    .register-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Liens */
    .login-link {
      text-align: center;
      margin: 16px 0;
    }

    .login-link a {
      color: #EC4899;
      text-decoration: none;
      font-weight: 600;
    }

    .back-link {
      display: block;
      text-align: center;
      color: #9CA3AF;
      text-decoration: none;
      font-size: 13px;
    }
  `]
})
export class RegisterComponent {
  // Type d'entité
  typeEntite = 'entreprise';

  // Informations de base
  nomEntite = '';
  email = '';
  telephone = '';

  // Informations entreprise
  formeJuridique = '';
  dateCreation = '';
  numRC = '';
  numIFU = '';
  capital = 0;

  // Informations particulier
  dateNaissance = '';
  lieuNaissance = '';
  nationalite = '';
  numPiece = '';
  profession = '';

  // Secteur
  secteur = '';

  // Type de service
  servicePublic = false;
  servicePrive = false;
  serviceDouane = false;
  serviceMixte = false;

  // Sécurité
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirm = false;

  constructor(private router: Router) {}

  get isFormValid(): boolean {
    // Validation de base
    if (!this.nomEntite || !this.email || !this.telephone || !this.secteur || !this.password) {
      return false;
    }
    if (this.password !== this.confirmPassword) {
      return false;
    }
    return true;
  }

  register() {
    if (this.isFormValid) {
      console.log('Données d\'inscription:', {
        type: this.typeEntite,
        nom: this.nomEntite,
        email: this.email,
        telephone: this.telephone,
        // ... toutes les données
      });
      
      // Simuler l'inscription
      localStorage.setItem('isAuthenticated', 'true');
      this.router.navigate(['/dashboard']);
    }
  }
}
