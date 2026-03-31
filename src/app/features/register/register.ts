import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="logo">
          <span class="pulse">PULSE</span><span class="business">BUSINESS</span>
        </div>

        <h2>Créer mon espace</h2>
        <p class="subtitle">Informations de l'entreprise ou du particulier</p>

        <!-- Indicateur de progression simple -->
        <div class="progress-steps">
          <div class="step" [class.active]="currentStep === 1">1. Type</div>
          <div class="step" [class.active]="currentStep === 2">2. Identité</div>
          <div class="step" [class.active]="currentStep === 3">3. Détails</div>
          <div class="step" [class.active]="currentStep === 4">4. Sécurité</div>
        </div>

        <div *ngIf="errorMessage" class="alert-error">{{ errorMessage }}</div>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <!-- ÉTAPE 1 : Type d'entité -->
          <div class="step-content" *ngIf="currentStep === 1">
            <div class="form-section">
              <div class="section-title">Type d'entité</div>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" [(ngModel)]="typeEntite" name="typeEntite" value="entreprise" required>
                  <span>🏢 Entreprise</span>
                </label>
                <label class="radio-label">
                  <input type="radio" [(ngModel)]="typeEntite" name="typeEntite" value="particulier" required>
                  <span>👤 Particulier / Professionnel</span>
                </label>
              </div>
            </div>
            <div class="step-buttons">
              <button type="button" class="btn-next" (click)="nextStep()" [disabled]="!typeEntite">Suivant</button>
            </div>
          </div>

          <!-- ÉTAPE 2 : Informations de base -->
          <div class="step-content" *ngIf="currentStep === 2">
            <div class="form-section">
              <div class="section-title">Informations de base</div>
              <div class="form-group">
                <label>{{ typeEntite === 'entreprise' ? 'Raison sociale *' : 'Nom complet *' }}</label>
                <input type="text" [(ngModel)]="nom" name="nom" required #nomInput="ngModel">
                <div *ngIf="nomInput.invalid && nomInput.touched" class="field-error">Champ requis</div>
              </div>
              <div class="form-group">
                <label>Email professionnel *</label>
                <input type="email" [(ngModel)]="email" name="email" required email #emailInput="ngModel">
                <div *ngIf="emailInput.invalid && emailInput.touched" class="field-error">
                  <span *ngIf="emailInput.errors?.['required']">Email requis</span>
                  <span *ngIf="emailInput.errors?.['email']">Format email invalide</span>
                </div>
              </div>
              <div class="form-group">
                <label>Téléphone *</label>
                <input type="tel" [(ngModel)]="telephone" name="telephone" required #telInput="ngModel">
                <div *ngIf="telInput.invalid && telInput.touched" class="field-error">Téléphone requis</div>
              </div>
              <div class="form-group" *ngIf="typeEntite === 'entreprise'">
                <label>Nom de l'entreprise (optionnel)</label>
                <input type="text" [(ngModel)]="entreprise" name="entreprise" placeholder="Nom commercial">
              </div>
            </div>
            <div class="step-buttons">
              <button type="button" class="btn-prev" (click)="prevStep()">Précédent</button>
              <button type="button" class="btn-next" (click)="nextStep()" [disabled]="!nom || !email || !telephone">Suivant</button>
            </div>
          </div>

          <!-- ÉTAPE 3 : Détails spécifiques (entreprise ou particulier) -->
          <div class="step-content" *ngIf="currentStep === 3">
            <!-- Informations entreprise -->
            <div *ngIf="typeEntite === 'entreprise'" class="form-section">
              <div class="section-title">Informations légales</div>
              <div class="form-row">
                <div class="form-group">
                  <label>Forme juridique</label>
                  <select [(ngModel)]="formeJuridique" name="formeJuridique">
                    <option value="">Sélectionner</option>
                    <option value="SA">SA (Société Anonyme)</option>
                    <option value="SARL">SARL (Société à Responsabilité Limitée)</option>
                    <option value="SAS">SAS (Société par Actions Simplifiée)</option>
                    <option value="EURL">EURL (Entreprise Unipersonnelle)</option>
                    <option value="EI">EI (Entreprise Individuelle)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Date de création</label>
                  <input type="date" [(ngModel)]="dateCreation" name="dateCreation">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>N° RC / Registre de commerce</label>
                  <input type="text" [(ngModel)]="numRC" name="numRC" placeholder="CI-ABJ-2025-B-12345">
                </div>
                <div class="form-group">
                  <label>N° IFU / Contribuable</label>
                  <input type="text" [(ngModel)]="numIFU" name="numIFU" placeholder="1234567890123">
                </div>
              </div>
              <div class="form-group">
                <label>Capital social</label>
                <div class="input-suffix">
                  <input type="number" [(ngModel)]="capital" name="capital" placeholder="10 000 000">
                  <span class="suffix">FCFA</span>
                </div>
              </div>
            </div>

            <!-- Informations particulier -->
            <div *ngIf="typeEntite === 'particulier'" class="form-section">
              <div class="section-title">Informations personnelles</div>
              <div class="form-row">
                <div class="form-group">
                  <label>Date de naissance</label>
                  <input type="date" [(ngModel)]="dateNaissance" name="dateNaissance">
                </div>
                <div class="form-group">
                  <label>Lieu de naissance</label>
                  <input type="text" [(ngModel)]="lieuNaissance" name="lieuNaissance" placeholder="Abidjan">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Nationalité</label>
                  <input type="text" [(ngModel)]="nationalite" name="nationalite" placeholder="Ivoirienne">
                </div>
                <div class="form-group">
                  <label>N° CNI / Passeport</label>
                  <input type="text" [(ngModel)]="numPiece" name="numPiece" placeholder="C-12345678">
                </div>
              </div>
              <div class="form-group">
                <label>Profession</label>
                <input type="text" [(ngModel)]="profession" name="profession" placeholder="Commerçant">
              </div>
            </div>

            <!-- Secteur d'activité -->
            <div class="form-section">
              <div class="section-title">Secteur d'activité</div>
              <div class="form-group">
                <select [(ngModel)]="secteur" name="secteur" required>
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
                <div *ngIf="!secteur" class="field-error">Secteur requis</div>
              </div>
            </div>

            <div class="step-buttons">
              <button type="button" class="btn-prev" (click)="prevStep()">Précédent</button>
              <button type="button" class="btn-next" (click)="nextStep()" [disabled]="!secteur">Suivant</button>
            </div>
          </div>

          <!-- ÉTAPE 4 : Sécurité et validation -->
          <div class="step-content" *ngIf="currentStep === 4">
            <div class="form-section">
              <div class="section-title">Sécurité</div>
              <div class="form-group">
                <label>Mot de passe *</label>
                <div class="password-field">
                  <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" required minlength="6" #passwordInput="ngModel">
                  <button type="button" class="eye-btn" (click)="showPassword = !showPassword">{{ showPassword ? '👁️' : '🔒' }}</button>
                </div>
                <div *ngIf="passwordInput.invalid && passwordInput.touched" class="field-error">
                  <span *ngIf="passwordInput.errors?.['required']">Mot de passe requis</span>
                  <span *ngIf="passwordInput.errors?.['minlength']">Minimum 6 caractères</span>
                </div>
                <div *ngIf="password && passwordInput.valid" class="password-strength">
                  <div class="strength-bar" [style.width.%]="passwordStrength"></div>
                  <span class="strength-text">{{ strengthLabel }}</span>
                </div>
              </div>
              <div class="form-group">
                <label>Confirmer le mot de passe *</label>
                <div class="password-field">
                  <input [type]="showConfirm ? 'text' : 'password'" [(ngModel)]="confirmPassword" name="confirmPassword" required #confirmInput="ngModel">
                  <button type="button" class="eye-btn" (click)="showConfirm = !showConfirm">{{ showConfirm ? '👁️' : '🔒' }}</button>
                </div>
                <div *ngIf="confirmInput.invalid && confirmInput.touched" class="field-error">Confirmation requise</div>
                <div *ngIf="password !== confirmPassword && confirmInput.touched && password" class="field-error">Les mots de passe ne correspondent pas</div>
              </div>
            </div>

            <div class="form-section">
              <label class="checkbox">
                <input type="checkbox" [(ngModel)]="acceptTerms" name="acceptTerms" required>
                <span>J'accepte les <a href="#" target="_blank">conditions générales</a> et la <a href="#" target="_blank">politique de confidentialité</a> *</span>
              </label>
              <div *ngIf="!acceptTerms && (registerForm.submitted || acceptTermsTouched)" class="field-error">Vous devez accepter les conditions</div>
            </div>

            <div class="step-buttons">
              <button type="button" class="btn-prev" (click)="prevStep()">Précédent</button>
              <button type="submit" class="btn-submit" [disabled]="loading || registerForm.invalid || !acceptTerms || password !== confirmPassword">
                <span *ngIf="!loading">CRÉER MON COMPTE</span>
                <span *ngIf="loading" class="spinner"></span>
              </button>
            </div>
          </div>
        </form>

        <div class="login-link">
          <p>Déjà un compte ? <a routerLink="/login">Se connecter</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #EC4899;
      --primary-dark: #DB2777;
      --gray-50: #F9FAFB;
      --gray-100: #F3F4F6;
      --gray-500: #6B7280;
      --gray-900: #1F2937;
      --error: #EF4444;
    }

    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary), #9D174D);
      padding: 20px;
    }

    .register-card {
      background: white;
      border-radius: 24px;
      padding: 32px;
      width: 100%;
      max-width: 700px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .logo {
      text-align: center;
      font-size: 28px;
      font-weight: 800;
      margin-bottom: 16px;
      letter-spacing: -0.5px;
    }

    .pulse { color: var(--primary); }
    .business { color: var(--primary-dark); }

    h2 {
      text-align: center;
      font-size: 24px;
      margin-bottom: 8px;
      color: var(--gray-900);
    }

    .subtitle {
      text-align: center;
      color: var(--gray-500);
      margin-bottom: 24px;
      font-size: 14px;
    }

    .progress-steps {
      display: flex;
      justify-content: space-between;
      margin-bottom: 32px;
      background: var(--gray-100);
      border-radius: 40px;
      padding: 4px;
    }

    .step {
      flex: 1;
      text-align: center;
      padding: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--gray-500);
      border-radius: 32px;
      transition: all 0.2s;
    }

    .step.active {
      background: var(--primary);
      color: white;
      box-shadow: 0 2px 8px rgba(236,72,153,0.3);
    }

    .alert-error {
      background: #FEF2F2;
      color: var(--error);
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
      border-left: 3px solid var(--error);
    }

    .step-content {
      transition: opacity 0.2s;
    }

    .form-section {
      margin-bottom: 24px;
      padding-bottom: 8px;
    }

    .section-title {
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 16px;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 16px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      font-size: 14px;
      color: var(--gray-900);
    }

    input, select {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid var(--gray-100);
      border-radius: 12px;
      font-size: 14px;
      transition: all 0.2s;
      background: white;
    }

    input:focus, select:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(236,72,153,0.1);
    }

    .field-error {
      color: var(--error);
      font-size: 12px;
      margin-top: 6px;
    }

    .radio-group {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .radio-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-weight: normal;
    }

    .radio-label input {
      width: auto;
      margin: 0;
    }

    .input-suffix {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .input-suffix input {
      flex: 1;
    }

    .suffix {
      color: var(--gray-500);
      background: var(--gray-100);
      padding: 10px 12px;
      border-radius: 8px;
    }

    .password-field {
      position: relative;
    }

    .password-field input {
      padding-right: 48px;
    }

    .eye-btn {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      color: var(--gray-500);
    }

    .eye-btn:hover {
      color: var(--primary);
    }

    .password-strength {
      margin-top: 8px;
      height: 4px;
      background: var(--gray-100);
      border-radius: 2px;
      position: relative;
    }

    .strength-bar {
      height: 100%;
      border-radius: 2px;
      transition: width 0.3s;
    }

    .strength-text {
      font-size: 10px;
      color: var(--gray-500);
      position: absolute;
      right: 0;
      top: 8px;
    }

    .checkbox {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-size: 13px;
    }

    .checkbox input {
      width: auto;
      margin: 0;
    }

    .checkbox a {
      color: var(--primary);
      text-decoration: none;
    }

    .checkbox a:hover {
      text-decoration: underline;
    }

    .step-buttons {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
      gap: 16px;
    }

    .btn-next, .btn-prev, .btn-submit {
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-next {
      background: var(--primary);
      color: white;
      flex: 1;
    }

    .btn-next:hover:not(:disabled) {
      background: var(--primary-dark);
      transform: translateY(-1px);
    }

    .btn-prev {
      background: white;
      color: var(--gray-700);
      border: 1px solid var(--gray-300);
      flex: 1;
    }

    .btn-prev:hover {
      background: var(--gray-50);
    }

    .btn-submit {
      background: var(--primary);
      color: white;
      width: 100%;
    }

    .btn-submit:hover:not(:disabled) {
      background: var(--primary-dark);
      transform: translateY(-1px);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .spinner {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 3px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .login-link {
      text-align: center;
      margin-top: 24px;
      font-size: 14px;
    }

    .login-link a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .register-card {
        padding: 24px;
      }
      .form-row {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      .radio-group {
        flex-direction: column;
        gap: 12px;
      }
      .progress-steps {
        flex-wrap: wrap;
        gap: 8px;
      }
      .step {
        flex: auto;
        min-width: 70px;
      }
    }
  `]
})
export class RegisterComponent {
  // Étape courante (1 à 4)
  currentStep = 1;

  // Type d'entité
  typeEntite = 'entreprise';
  
  // Informations de base
  nom = '';
  email = '';
  telephone = '';
  entreprise = '';
  
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
  
  // Sécurité
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirm = false;
  
  // Conditions
  acceptTerms = false;
  acceptTermsTouched = false;
  
  // État
  loading = false;
  errorMessage = '';

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  get passwordStrength(): number {
    if (!this.password) return 0;
    let strength = 0;
    if (this.password.length >= 8) strength += 25;
    if (/[A-Z]/.test(this.password)) strength += 25;
    if (/[0-9]/.test(this.password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(this.password)) strength += 25;
    return strength;
  }

  get strengthLabel(): string {
    const s = this.passwordStrength;
    if (s < 25) return 'Très faible';
    if (s < 50) return 'Faible';
    if (s < 75) return 'Moyen';
    return 'Fort';
  }

  nextStep() {
    if (this.currentStep < 4) {
      this.currentStep++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async onSubmit() {
    this.acceptTermsTouched = true;

    // Validations de base
    if (!this.nom || !this.email || !this.telephone || !this.secteur || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    if (!this.acceptTerms) {
      this.errorMessage = 'Vous devez accepter les conditions générales pour continuer';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const userData: any = {
      nom: this.nom,
      email: this.email,
      telephone: this.telephone,
      typeEntite: this.typeEntite,
      secteur: this.secteur,
      password: this.password
    };

    if (this.typeEntite === 'entreprise') {
      userData.entreprise = this.entreprise;
      userData.formeJuridique = this.formeJuridique;
      userData.dateCreation = this.dateCreation;
      userData.numRC = this.numRC;
      userData.numIFU = this.numIFU;
      userData.capital = this.capital;
    } else {
      userData.dateNaissance = this.dateNaissance;
      userData.lieuNaissance = this.lieuNaissance;
      userData.nationalite = this.nationalite;
      userData.numPiece = this.numPiece;
      userData.profession = this.profession;
    }

    try {
      const user = await this.api.register(userData);
      if (user) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Erreur lors de la création du compte';
      }
    } catch (error) {
      console.error('Register error', error);
      this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
    } finally {
      this.loading = false;
    }
  }
}