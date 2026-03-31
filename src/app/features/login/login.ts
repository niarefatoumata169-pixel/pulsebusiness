import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-wrapper">
      <!-- Colonne gauche : message de marque -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="logo-large">
            <span class="pulse">PULSE</span><span class="business">BUSINESS</span>
          </div>
          <h1>Bienvenue sur votre plateforme de gestion</h1>
          <p>Centralisez, simplifiez et accélérez la gestion de votre entreprise.</p>
          <div class="features">
            <div class="feature"><span>📊</span> Tableaux de bord temps réel</div>
            <div class="feature"><span>🔒</span> Sécurité maximale</div>
            <div class="feature"><span>🚀</span> Performance optimisée</div>
          </div>
        </div>
      </div>

      <!-- Colonne droite : formulaire de connexion -->
      <div class="form-section">
        <div class="form-card">
          <div class="form-header">
            <h2>Connexion</h2>
            <p>Accédez à votre espace professionnel</p>
          </div>

          <div *ngIf="errorMessage" class="alert-error">
            {{ errorMessage }}
          </div>

          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <div class="form-group">
              <label for="email">Adresse email</label>
              <div class="input-icon">
                <span class="icon">📧</span>
                <input 
                  id="email"
                  type="email" 
                  [(ngModel)]="email" 
                  name="email"
                  placeholder="exemple@entreprise.com"
                  required
                  email
                  #emailInput="ngModel"
                  [class.is-invalid]="emailInput.invalid && emailInput.touched"
                  autofocus
                >
              </div>
              <div *ngIf="emailInput.invalid && emailInput.touched" class="field-error">
                <span *ngIf="emailInput.errors?.['required']">Email requis</span>
                <span *ngIf="emailInput.errors?.['email']">Format email invalide</span>
              </div>
            </div>

            <div class="form-group">
              <label for="password">Mot de passe</label>
              <div class="input-icon">
                <span class="icon">🔒</span>
                <input 
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="password" 
                  name="password"
                  placeholder="••••••••"
                  required
                  minlength="6"
                  #passwordInput="ngModel"
                  [class.is-invalid]="passwordInput.invalid && passwordInput.touched"
                >
                <button type="button" class="eye-btn" (click)="showPassword = !showPassword">
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <div *ngIf="passwordInput.invalid && passwordInput.touched" class="field-error">
                <span *ngIf="passwordInput.errors?.['required']">Mot de passe requis</span>
                <span *ngIf="passwordInput.errors?.['minlength']">Minimum 6 caractères</span>
              </div>
            </div>

            <div class="form-options">
              <label class="checkbox">
                <input type="checkbox" [(ngModel)]="rememberMe" name="remember">
                <span>Se souvenir de moi</span>
              </label>
              <a routerLink="/forgot-password" class="forgot-link">Mot de passe oublié ?</a>
            </div>

            <button type="submit" class="btn-login" [disabled]="loading || loginForm.invalid">
              <span *ngIf="!loading">Se connecter</span>
              <span *ngIf="loading" class="spinner"></span>
            </button>
          </form>

          <div class="register-section">
            <p>Pas encore de compte ? <a routerLink="/register">Créer un compte</a></p>
          </div>

          <div class="demo-hint">
            <p>🔐 <strong>Démo</strong> : demo&#64;pulse.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #EC4899;
      --primary-dark: #DB2777;
      --secondary: #8B5CF6;
      --dark: #1F2937;
      --gray-50: #F9FAFB;
      --gray-100: #F3F4F6;
      --gray-500: #6B7280;
      --gray-700: #374151;
      --error: #EF4444;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .login-wrapper {
      display: flex;
      min-height: 100vh;
      background: white;
    }

    /* Colonne gauche - marque */
    .brand-section {
      flex: 1;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      position: relative;
      overflow: hidden;
    }

    .brand-section::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: rotate 20s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .brand-content {
      position: relative;
      z-index: 1;
      color: white;
      max-width: 450px;
      text-align: left;
    }

    .logo-large {
      font-size: 42px;
      font-weight: 800;
      margin-bottom: 24px;
      letter-spacing: -1px;
    }

    .logo-large .pulse { color: white; }
    .logo-large .business { color: rgba(255,255,255,0.9); }

    .brand-content h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 16px;
      line-height: 1.2;
    }

    .brand-content p {
      font-size: 16px;
      opacity: 0.9;
      margin-bottom: 32px;
      line-height: 1.5;
    }

    .features {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 15px;
    }

    .feature span {
      font-size: 20px;
    }

    /* Colonne droite - formulaire */
    .form-section {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      background: white;
    }

    .form-card {
      width: 100%;
      max-width: 440px;
      background: white;
      border-radius: 32px;
      padding: 40px 32px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.02);
      transition: transform 0.3s ease;
    }

    .form-card:hover {
      transform: translateY(-4px);
    }

    .form-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .form-header h2 {
      font-size: 28px;
      font-weight: 700;
      color: var(--dark);
      margin-bottom: 8px;
    }

    .form-header p {
      color: var(--gray-500);
      font-size: 14px;
    }

    .alert-error {
      background: #FEF2F2;
      color: var(--error);
      padding: 12px 16px;
      border-radius: 16px;
      margin-bottom: 24px;
      font-size: 14px;
      border-left: 4px solid var(--error);
    }

    .form-group {
      margin-bottom: 24px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      font-size: 14px;
      color: var(--gray-700);
    }

    .input-icon {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon .icon {
      position: absolute;
      left: 16px;
      font-size: 18px;
      color: var(--gray-500);
      pointer-events: none;
    }

    input {
      width: 100%;
      padding: 14px 16px 14px 48px;
      border: 2px solid var(--gray-100);
      border-radius: 24px;
      font-size: 15px;
      transition: all 0.2s;
      background: white;
      font-family: inherit;
    }

    input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(236,72,153,0.1);
    }

    input.is-invalid {
      border-color: var(--error);
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
      padding: 0;
      transition: color 0.2s;
    }

    .eye-btn:hover {
      color: var(--primary);
    }

    .field-error {
      color: var(--error);
      font-size: 12px;
      margin-top: 6px;
      padding-left: 16px;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
      font-size: 14px;
    }

    .checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: var(--gray-500);
    }

    .checkbox input {
      width: auto;
      padding: 0;
      margin: 0;
    }

    .forgot-link {
      color: var(--primary);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }

    .forgot-link:hover {
      text-decoration: underline;
      color: var(--primary-dark);
    }

    .btn-login {
      width: 100%;
      padding: 14px;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 32px;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-login:hover:not(:disabled) {
      background: var(--primary-dark);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(236,72,153,0.3);
    }

    .btn-login:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .register-section {
      text-align: center;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--gray-100);
      font-size: 14px;
    }

    .register-section a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }

    .demo-hint {
      margin-top: 20px;
      text-align: center;
      font-size: 12px;
      background: var(--gray-50);
      padding: 10px;
      border-radius: 20px;
      color: var(--gray-500);
    }

    /* Responsive */
    @media (max-width: 900px) {
      .login-wrapper {
        flex-direction: column;
      }
      .brand-section {
        padding: 40px 20px;
        text-align: center;
      }
      .brand-content {
        text-align: center;
        max-width: 100%;
      }
      .features {
        align-items: center;
      }
      .form-section {
        padding: 20px;
      }
      .form-card {
        padding: 32px 24px;
      }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  loading = false;
  errorMessage = '';

  constructor(private router: Router) {}

  async onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Simulation locale pour la démo
    // Identifiants valides : demo@pulse.com / password123
    const isDemoValid = this.email === 'demo@pulse.com' && this.password === 'password123';

    if (isDemoValid) {
      // Stocker un token factice
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('user', JSON.stringify({ email: this.email, role: 'demo' }));
      if (this.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      this.loading = false;
      this.router.navigate(['/dashboard']);
    } else {
      this.loading = false;
      this.errorMessage = 'Email ou mot de passe incorrect. Utilisez demo@pulse.com / password123';
    }
  }
} 