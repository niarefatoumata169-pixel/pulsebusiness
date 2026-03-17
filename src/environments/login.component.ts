import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="logo">
          <span class="pulse">PULSE</span><span class="business">BUSINESS</span>
        </div>
        <h2>Connexion</h2>
        <p class="subtitle">Mode développement</p>
        
        <button class="login-btn" (click)="router.navigate(['/dashboard'])">
          Accès Dashboard
        </button>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #EC4899, #9D174D);
    }
    .login-card {
      background: white;
      padding: 40px;
      border-radius: 16px;
      width: 100%;
      max-width: 400px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 24px;
    }
    .pulse { color: #EC4899; }
    .business { color: #9D174D; }
    .login-btn {
      background: #EC4899;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      width: 100%;
    }
  `]
})
export class LoginComponent {
  constructor(public router: Router) {}
}
