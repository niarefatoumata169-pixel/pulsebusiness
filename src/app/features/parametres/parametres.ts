import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="parametres-container">
      <h1>Paramètres</h1>

      <!-- Tabs de navigation -->
      <div class="tabs">
        <button class="tab-btn" [class.active]="activeTab === 'general'" (click)="activeTab = 'general'">
          ⚙️ Général
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'entreprise'" (click)="activeTab = 'entreprise'">
          🏢 Entreprise
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'facturation'" (click)="activeTab = 'facturation'">
          📄 Facturation
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'notifications'" (click)="activeTab = 'notifications'">
          🔔 Notifications
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'securite'" (click)="activeTab = 'securite'">
          🔒 Sécurité
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'abonnement'" (click)="activeTab = 'abonnement'">
          💳 Abonnement
        </button>
      </div>

      <!-- TAB : GÉNÉRAL -->
      <div class="tab-content" *ngIf="activeTab === 'general'">
        <div class="settings-card">
          <h2>Paramètres généraux</h2>
          
          <div class="settings-grid">
            <div class="setting-item">
              <label>Langue de l'interface</label>
              <select [(ngModel)]="settings.langue" class="form-control">
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>

            <div class="setting-item">
              <label>Fuseau horaire</label>
              <select [(ngModel)]="settings.fuseau" class="form-control">
                <option value="GMT">GMT (UTC+0)</option>
                <option value="GMT+1">GMT+1</option>
                <option value="GMT+2">GMT+2</option>
              </select>
            </div>

            <div class="setting-item">
              <label>Format de date</label>
              <select [(ngModel)]="settings.dateFormat" class="form-control">
                <option value="dd/MM/yyyy">31/12/2024</option>
                <option value="MM/dd/yyyy">12/31/2024</option>
                <option value="yyyy-MM-dd">2024-12-31</option>
              </select>
            </div>

            <div class="setting-item">
              <label>Premier jour de la semaine</label>
              <select [(ngModel)]="settings.premierJour" class="form-control">
                <option value="lundi">Lundi</option>
                <option value="dimanche">Dimanche</option>
              </select>
            </div>
          </div>

          <div class="setting-divider"></div>

          <h3>Apparence</h3>
          <div class="theme-options">
            <div class="theme-option" [class.active]="settings.theme === 'clair'" (click)="settings.theme = 'clair'">
              <div class="theme-preview clair"></div>
              <span>Clair</span>
            </div>
            <div class="theme-option" [class.active]="settings.theme === 'sombre'" (click)="settings.theme = 'sombre'">
              <div class="theme-preview sombre"></div>
              <span>Sombre</span>
            </div>
            <div class="theme-option" [class.active]="settings.theme === 'systeme'" (click)="settings.theme = 'systeme'">
              <div class="theme-preview systeme"></div>
              <span>Système</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB : ENTREPRISE -->
      <div class="tab-content" *ngIf="activeTab === 'entreprise'">
        <div class="settings-card">
          <h2>Informations de l'entreprise</h2>
          
          <div class="settings-grid">
            <div class="setting-item full-width">
              <label>Raison sociale</label>
              <input type="text" [(ngModel)]="entreprise.nom" class="form-control" placeholder="H2A Holding">
            </div>

            <div class="setting-item">
              <label>Email de contact</label>
              <input type="email" [(ngModel)]="entreprise.email" class="form-control" placeholder="contact@entreprise.com">
            </div>

            <div class="setting-item">
              <label>Téléphone</label>
              <input type="tel" [(ngModel)]="entreprise.telephone" class="form-control" placeholder="+225 00 00 00 00">
            </div>

            <div class="setting-item full-width">
              <label>Adresse</label>
              <input type="text" [(ngModel)]="entreprise.adresse" class="form-control" placeholder="Abidjan, Cocody">
            </div>

            <div class="setting-item">
              <label>N° RC</label>
              <input type="text" [(ngModel)]="entreprise.rc" class="form-control" placeholder="CI-ABJ-2025-B-12345">
            </div>

            <div class="setting-item">
              <label>N° IFU</label>
              <input type="text" [(ngModel)]="entreprise.ifu" class="form-control" placeholder="1234567890123">
            </div>
          </div>
        </div>
      </div>

      <!-- TAB : FACTURATION -->
      <div class="tab-content" *ngIf="activeTab === 'facturation'">
        <div class="settings-card">
          <h2>Paramètres de facturation</h2>
          
          <div class="settings-grid">
            <div class="setting-item">
              <label>Préfixe des factures</label>
              <input type="text" [(ngModel)]="facturation.prefixe" class="form-control" placeholder="FAC-">
            </div>

            <div class="setting-item">
              <label>Prochain numéro</label>
              <input type="number" [(ngModel)]="facturation.prochainNumero" class="form-control" placeholder="001">
            </div>

            <div class="setting-item">
              <label>Format</label>
              <span class="format-preview">{{ facturation.prefixe }}{{ facturation.prochainNumero | number:'3.0' }}</span>
            </div>

            <div class="setting-item full-width">
              <label>TVA par défaut (%)</label>
              <input type="number" [(ngModel)]="facturation.tva" class="form-control" placeholder="18">
            </div>

            <div class="setting-item full-width">
              <label>Délai de paiement (jours)</label>
              <input type="number" [(ngModel)]="facturation.delaiPaiement" class="form-control" placeholder="30">
            </div>

            <div class="setting-item full-width">
              <label>Mentions légales</label>
              <textarea [(ngModel)]="facturation.mentions" class="form-control" rows="3" 
                placeholder="TVA non applicable, art. 293B du CGI..."></textarea>
            </div>
          </div>

          <div class="setting-divider"></div>

          <h3>Relances automatiques</h3>
          <div class="checkbox-group">
            <label class="checkbox-item">
              <input type="checkbox" [(ngModel)]="facturation.relanceJ7">
              <span>Relance à J+7</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" [(ngModel)]="facturation.relanceJ14">
              <span>Relance à J+14</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" [(ngModel)]="facturation.relanceJ30">
              <span>Relance à J+30 (avant contentieux)</span>
            </label>
          </div>
        </div>
      </div>

      <!-- TAB : NOTIFICATIONS -->
      <div class="tab-content" *ngIf="activeTab === 'notifications'">
        <div class="settings-card">
          <h2>Notifications</h2>
          
          <h3>Notifications email</h3>
          <div class="checkbox-group">
            <label class="checkbox-item">
              <input type="checkbox" [(ngModel)]="notifications.emailNouveauClient">
              <span>Nouveau client créé</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" [(ngModel)]="notifications.emailNouvelleFacture">
              <span>Nouvelle facture créée</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" [(ngModel)]="notifications.emailPaiementRecu">
              <span>Paiement reçu</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" [(ngModel)]="notifications.emailFactureImpayee">
              <span>Facture impayée</span>
            </label>
          </div>

          <div class="setting-divider"></div>

          <h3>Notifications dans l'application</h3>
          <div class="checkbox-group">
            <label class="checkbox-item">
              <input type="checkbox" [(ngModel)]="notifications.appRappels">
              <span>Rappels de paiement</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" [(ngModel)]="notifications.appAlertes">
              <span>Alertes stock</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" [(ngModel)]="notifications.appEvenements">
              <span>Événements importants</span>
            </label>
          </div>
        </div>
      </div>

      <!-- TAB : SÉCURITÉ -->
      <div class="tab-content" *ngIf="activeTab === 'securite'">
        <div class="settings-card">
          <h2>Sécurité</h2>
          
          <div class="security-item">
            <div class="security-info">
              <h3>Authentification à deux facteurs</h3>
              <p>Renforcez la sécurité de votre compte</p>
            </div>
            <button class="btn-security" (click)="toggle2FA()">
              {{ securite.a2f ? '✅ Activé' : '⚪ Activer' }}
            </button>
          </div>

          <div class="security-item">
            <div class="security-info">
              <h3>Changer le mot de passe</h3>
              <p>Dernière modification : {{ securite.dernierChangement }}</p>
            </div>
            <button class="btn-security" (click)="changerMotDePasse()">
              Modifier
            </button>
          </div>

          <div class="security-item">
            <div class="security-info">
              <h3>Session timeout</h3>
              <p>Déconnexion automatique après inactivité</p>
            </div>
            <select [(ngModel)]="securite.timeout" class="timeout-select">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 heure</option>
              <option value="120">2 heures</option>
            </select>
          </div>

          <div class="setting-divider"></div>

          <h3>Journal des connexions</h3>
          <div class="logs-table">
            <div class="log-row header">
              <span>Date</span>
              <span>IP</span>
              <span>Appareil</span>
            </div>
            <div class="log-row" *ngFor="let log of logsConnexion">
              <span>{{ log.date | date:'dd/MM/yyyy HH:mm' }}</span>
              <span>{{ log.ip }}</span>
              <span>{{ log.appareil }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB : ABONNEMENT - VERSION CORRECTE AVEC LES VRAIS PRIX -->
      <div class="tab-content" *ngIf="activeTab === 'abonnement'">
        <div class="settings-card">
          <h2>Mon abonnement</h2>
          
          <div class="plan-actuel" [class]="planActuel.toLowerCase()">
            <div class="plan-badge">{{ planActuel }}</div>
            <div class="plan-prix">{{ prixPlan | number }} FCFA / mois</div>
          </div>

          <div class="plan-details">
            <div class="detail-item">
              <span class="detail-label">Début d'abonnement</span>
              <span class="detail-value">{{ dateDebut | date:'dd MMMM yyyy' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Prochain paiement</span>
              <span class="detail-value">{{ prochainPaiement | date:'dd MMMM yyyy' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Statut</span>
              <span class="badge-actif">Actif</span>
            </div>
          </div>

          <div class="stats-rapides">
            <div class="stat-rapide">
              <span class="stat-valeur">100</span>
              <span class="stat-label">Clients max</span>
            </div>
            <div class="stat-rapide">
              <span class="stat-valeur">Illimité</span>
              <span class="stat-label">Factures</span>
            </div>
            <div class="stat-rapide">
              <span class="stat-valeur">10</span>
              <span class="stat-label">Utilisateurs</span>
            </div>
          </div>

          <div class="setting-divider"></div>

          <h3>Changer de plan</h3>
          <div class="autres-plans">
            <!-- Plan Startup -->
            <div class="mini-plan startup">
              <h4>Startup</h4>
              <p class="mini-prix">150 000 FCFA/mois</p>
              <ul class="mini-features">
                <li>✓ 3 utilisateurs</li>
                <li>✓ Clients illimités</li>
                <li>✓ Factures illimitées</li>
                <li>✓ Modules de base</li>
                <li>✓ Support email</li>
              </ul>
              <button class="btn-changer" (click)="changerPlan('startup')">
                Choisir
              </button>
            </div>

            <!-- Plan Business (populaire) -->
            <div class="mini-plan business populaire">
              <div class="badge-populaire">🌟 POPULAIRE</div>
              <h4>Business</h4>
              <p class="mini-prix">350 000 FCFA/mois</p>
              <ul class="mini-features">
                <li>✓ 10 utilisateurs</li>
                <li>✓ Clients illimités</li>
                <li>✓ Factures illimitées</li>
                <li>✓ Tous les modules</li>
                <li>✓ Export PDF/Excel</li>
                <li>✓ Support prioritaire</li>
              </ul>
              <button class="btn-changer" (click)="changerPlan('business')">
                Choisir
              </button>
            </div>

            <!-- Plan Enterprise -->
            <div class="mini-plan enterprise">
              <h4>Enterprise</h4>
              <p class="mini-prix">750 000 FCFA/mois</p>
              <ul class="mini-features">
                <li>✓ 25 utilisateurs</li>
                <li>✓ Clients illimités</li>
                <li>✓ Factures illimitées</li>
                <li>✓ Modules avancés</li>
                <li>✓ Support téléphonique</li>
                <li>✓ Formation incluse</li>
              </ul>
              <button class="btn-changer" (click)="changerPlan('enterprise')">
                Choisir
              </button>
            </div>

            <!-- Plan Corporate -->
            <div class="mini-plan corporate">
              <h4>Corporate</h4>
              <p class="mini-prix">1 500 000 FCFA/mois</p>
              <ul class="mini-features">
                <li>✓ Utilisateurs illimités</li>
                <li>✓ Clients illimités</li>
                <li>✓ Factures illimitées</li>
                <li>✓ Multi-sociétés / Filiales</li>
                <li>✓ API personnalisée</li>
                <li>✓ Support dédié 24/7</li>
              </ul>
              <button class="btn-changer" (click)="changerPlan('corporate')">
                Choisir
              </button>
            </div>
          </div>

          <!-- Calculateur de CA potentiel -->
          <div class="ca-potentiel">
            <p class="ca-label">💰 Votre potentiel de chiffre d'affaires</p>
            <div class="ca-grid">
              <div class="ca-item">
                <span class="ca-valeur">15M FCFA</span>
                <span class="ca-desc">avec 100 clients Startup</span>
              </div>
              <div class="ca-item">
                <span class="ca-valeur">17,5M FCFA</span>
                <span class="ca-desc">avec 50 clients Business</span>
              </div>
              <div class="ca-item">
                <span class="ca-valeur">15M FCFA</span>
                <span class="ca-desc">avec 20 clients Enterprise</span>
              </div>
              <div class="ca-item">
                <span class="ca-valeur">15M FCFA</span>
                <span class="ca-desc">avec 10 clients Corporate</span>
              </div>
            </div>
            <p class="ca-total">
              Total potentiel : <strong>62,5M FCFA/mois</strong><br>
              <span class="ca-annual">soit 750M FCFA/an</span>
            </p>
            <p class="ca-note">* Basé sur les objectifs moyens par plan</p>
          </div>

          <div class="plan-cta">
            <button class="btn-contact" (click)="contacterCommercial()">
              📞 Contacter notre équipe commerciale
            </button>
          </div>
        </div>
      </div>

      <!-- Barre de sauvegarde -->
      <div class="save-bar">
        <button class="btn-save" (click)="saveAll()">
          💾 Enregistrer tous les paramètres
        </button>
      </div>
    </div>
  `,
  styles: [`
    .parametres-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      color: #1F2937;
      font-size: 28px;
      margin-bottom: 24px;
    }

    /* Tabs */
    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      border-bottom: 2px solid #FCE7F3;
      padding-bottom: 12px;
      overflow-x: auto;
      flex-wrap: wrap;
    }

    .tab-btn {
      padding: 10px 20px;
      border: none;
      background: none;
      color: #6B7280;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.3s;
      white-space: nowrap;
    }

    .tab-btn:hover {
      background: #FDF2F8;
      color: #EC4899;
    }

    .tab-btn.active {
      background: #FCE7F3;
      color: #EC4899;
      font-weight: 600;
    }

    /* Cartes de paramètres */
    .settings-card {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 2px 8px rgba(236,72,153,0.1);
      margin-bottom: 24px;
    }

    h2 {
      color: #1F2937;
      font-size: 20px;
      margin: 0 0 24px;
    }

    h3 {
      color: #1F2937;
      font-size: 16px;
      margin: 24px 0 16px;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .setting-item {
      display: flex;
      flex-direction: column;
    }

    .setting-item.full-width {
      grid-column: span 2;
    }

    label {
      color: #4B5563;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 6px;
    }

    .form-control {
      padding: 10px 12px;
      border: 2px solid #FCE7F3;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s;
    }

    .form-control:focus {
      outline: none;
      border-color: #EC4899;
      box-shadow: 0 0 0 3px rgba(236,72,153,0.1);
    }

    .format-preview {
      padding: 10px 12px;
      background: #FDF2F8;
      border-radius: 8px;
      font-size: 14px;
      color: #EC4899;
    }

    .setting-divider {
      height: 1px;
      background: #FCE7F3;
      margin: 24px 0;
    }

    /* Thèmes */
    .theme-options {
      display: flex;
      gap: 16px;
      margin-top: 12px;
    }

    .theme-option {
      cursor: pointer;
      text-align: center;
    }

    .theme-preview {
      width: 80px;
      height: 60px;
      border-radius: 8px;
      margin-bottom: 8px;
      border: 2px solid transparent;
      transition: border-color 0.3s;
    }

    .theme-option.active .theme-preview {
      border-color: #EC4899;
    }

    .theme-preview.clair {
      background: white;
      border: 2px solid #E5E7EB;
    }

    .theme-preview.sombre {
      background: #1F2937;
    }

    .theme-preview.systeme {
      background: linear-gradient(45deg, white 50%, #1F2937 50%);
    }

    /* Checkbox group */
    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: #4B5563;
    }

    .checkbox-item input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    /* Sécurité */
    .security-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
      border-bottom: 1px solid #FCE7F3;
    }

    .security-item:last-child {
      border-bottom: none;
    }

    .security-info h3 {
      margin: 0 0 4px;
    }

    .security-info p {
      color: #6B7280;
      font-size: 13px;
      margin: 0;
    }

    .btn-security {
      padding: 8px 16px;
      background: #FDF2F8;
      border: 2px solid #EC4899;
      color: #EC4899;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-security:hover {
      background: #EC4899;
      color: white;
    }

    .timeout-select {
      padding: 8px 12px;
      border: 2px solid #FCE7F3;
      border-radius: 8px;
    }

    /* Logs */
    .logs-table {
      background: #F9FAFB;
      border-radius: 8px;
      overflow: hidden;
    }

    .log-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      padding: 12px 16px;
      border-bottom: 1px solid #FCE7F3;
    }

    .log-row.header {
      background: #FDF2F8;
      font-weight: 600;
      color: #1F2937;
    }

    /* ===== SECTION ABONNEMENT ===== */
    .plan-actuel {
      background: linear-gradient(135deg, #EC4899, #F472B6);
      color: white;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .plan-actuel.startup { background: linear-gradient(135deg, #9CA3AF, #6B7280); }
    .plan-actuel.business { background: linear-gradient(135deg, #EC4899, #F472B6); }
    .plan-actuel.enterprise { background: linear-gradient(135deg, #9D174D, #F472B6); }
    .plan-actuel.corporate { background: linear-gradient(135deg, #F59E0B, #FBBF24); }

    .plan-badge {
      font-size: 24px;
      font-weight: 700;
    }

    .plan-prix {
      font-size: 20px;
      font-weight: 600;
    }

    .plan-details {
      background: #FDF2F8;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 24px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .detail-label {
      color: #6B7280;
    }

    .detail-value {
      font-weight: 500;
      color: #1F2937;
    }

    .badge-actif {
      background: #10B981;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
    }

    /* Stats rapides */
    .stats-rapides {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin: 24px 0;
    }

    .stat-rapide {
      text-align: center;
      padding: 16px;
      background: #FDF2F8;
      border-radius: 12px;
    }

    .stat-valeur {
      display: block;
      font-size: 24px;
      font-weight: 700;
      color: #EC4899;
      margin-bottom: 4px;
    }

    .stat-label {
      color: #6B7280;
      font-size: 12px;
    }

    /* Grille des plans */
    .autres-plans {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin: 24px 0;
    }

    .mini-plan {
      position: relative;
      background: white;
      border: 2px solid #FCE7F3;
      border-radius: 16px;
      padding: 20px;
      transition: all 0.3s;
    }

    .mini-plan:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(236,72,153,0.15);
      border-color: #EC4899;
    }

    .mini-plan.populaire {
      border-color: #EC4899;
      transform: scale(1.02);
      box-shadow: 0 8px 24px rgba(236,72,153,0.2);
    }

    .badge-populaire {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: #EC4899;
      color: white;
      padding: 4px 16px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }

    .mini-plan h4 {
      color: #1F2937;
      font-size: 18px;
      margin: 0 0 8px;
      text-align: center;
    }

    .mini-prix {
      color: #EC4899;
      font-weight: 700;
      font-size: 18px;
      text-align: center;
      margin-bottom: 16px;
    }

    .mini-features {
      list-style: none;
      padding: 0;
      margin: 0 0 20px;
    }

    .mini-features li {
      color: #4B5563;
      font-size: 12px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .btn-changer {
      width: 100%;
      padding: 10px;
      background: transparent;
      border: 2px solid #EC4899;
      color: #EC4899;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-changer:hover {
      background: #EC4899;
      color: white;
    }

    /* Couleurs des plans */
    .mini-plan.startup { border-top: 4px solid #9CA3AF; }
    .mini-plan.business { border-top: 4px solid #EC4899; }
    .mini-plan.enterprise { border-top: 4px solid #9D174D; }
    .mini-plan.corporate { border-top: 4px solid #F59E0B; }

    /* CA potentiel */
    .ca-potentiel {
      margin-top: 32px;
      padding: 24px;
      background: linear-gradient(135deg, #FDF2F8, #FCE7F3);
      border-radius: 16px;
    }

    .ca-label {
      color: #1F2937;
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 16px;
    }

    .ca-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }

    .ca-item {
      background: white;
      padding: 16px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }

    .ca-valeur {
      display: block;
      font-weight: 700;
      color: #EC4899;
      font-size: 20px;
      margin-bottom: 4px;
    }

    .ca-desc {
      font-size: 12px;
      color: #6B7280;
    }

    .ca-total {
      text-align: center;
      font-size: 18px;
      color: #1F2937;
      margin: 16px 0 8px;
    }

    .ca-total strong {
      color: #EC4899;
      font-size: 24px;
    }

    .ca-annual {
      font-size: 14px;
      color: #6B7280;
    }

    .ca-note {
      text-align: center;
      color: #9CA3AF;
      font-size: 11px;
      font-style: italic;
      margin: 8px 0 0;
    }

    .plan-cta {
      text-align: center;
      margin-top: 24px;
    }

    .btn-contact {
      background: #1F2937;
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-contact:hover {
      background: #111827;
      transform: translateY(-2px);
    }

    /* Barre de sauvegarde */
    .save-bar {
      position: sticky;
      bottom: 24px;
      display: flex;
      justify-content: center;
      margin-top: 32px;
    }

    .btn-save {
      background: #10B981;
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(16,185,129,0.3);
      transition: all 0.3s;
    }

    .btn-save:hover {
      background: #10B981;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(16,185,129,0.4);
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .autres-plans {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .settings-grid {
        grid-template-columns: 1fr;
      }
      .setting-item.full-width {
        grid-column: span 1;
      }
      .autres-plans {
        grid-template-columns: 1fr;
      }
      .stats-rapides {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class Parametres implements OnInit {
  activeTab = 'general';

  // Paramètres généraux
  settings = {
    langue: 'fr',
    fuseau: 'GMT',
    dateFormat: 'dd/MM/yyyy',
    premierJour: 'lundi',
    theme: 'clair'
  };

  // Informations entreprise
  entreprise = {
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    rc: '',
    ifu: ''
  };

  // Facturation
  facturation = {
    prefixe: 'FAC-',
    prochainNumero: 1,
    tva: 18,
    delaiPaiement: 30,
    mentions: '',
    relanceJ7: true,
    relanceJ14: true,
    relanceJ30: false
  };

  // Notifications
  notifications = {
    emailNouveauClient: true,
    emailNouvelleFacture: true,
    emailPaiementRecu: true,
    emailFactureImpayee: true,
    appRappels: true,
    appAlertes: true,
    appEvenements: false
  };

  // Sécurité
  securite = {
    a2f: false,
    dernierChangement: '15/02/2026',
    timeout: 30
  };

  logsConnexion = [
    { date: new Date('2026-03-12T08:30:00'), ip: '192.168.1.45', appareil: 'Chrome / Mac' },
    { date: new Date('2026-03-11T18:20:00'), ip: '192.168.1.45', appareil: 'Chrome / Mac' },
    { date: new Date('2026-03-11T09:15:00'), ip: '192.168.1.45', appareil: 'Chrome / Mac' }
  ];

  // ===== ABONNEMENT - VERSION MILLIONNAIRE =====
  planActuel = 'Business';  // 'Startup', 'Business', 'Enterprise', 'Corporate'
  prixPlan = 350000;  // 350k pour Business
  dateDebut = new Date('2026-01-15');
  prochainPaiement = new Date('2026-04-15');

  autresPlans = [
    { 
      id: 'startup', 
      nom: 'Startup', 
      prix: 150000,
      users: 3,
      features: [
        '3 utilisateurs',
        'Clients illimités',
        'Factures illimitées',
        'Modules de base',
        'Support email'
      ]
    },
    { 
      id: 'business', 
      nom: 'Business', 
      prix: 350000,
      users: 10,
      populaire: true,
      features: [
        '10 utilisateurs',
        'Clients illimités',
        'Factures illimitées',
        'Tous les modules',
        'Export PDF/Excel',
        'Support prioritaire'
      ]
    },
    { 
      id: 'enterprise', 
      nom: 'Enterprise', 
      prix: 750000,
      users: 25,
      features: [
        '25 utilisateurs',
        'Clients illimités',
        'Factures illimitées',
        'Modules avancés',
        'Support téléphonique',
        'Formation incluse'
      ]
    },
    { 
      id: 'corporate', 
      nom: 'Corporate', 
      prix: 1500000,
      users: -1, // illimité
      features: [
        'Utilisateurs illimités',
        'Clients illimités',
        'Factures illimitées',
        'Multi-sociétés / Filiales',
        'API personnalisée',
        'Support dédié 24/7'
      ]
    }
  ];

  ngOnInit() {
    this.chargerParametres();
  }

  chargerParametres() {
    const saved = localStorage.getItem('pulsebusiness_params');
    if (saved) {
      const data = JSON.parse(saved);
      this.entreprise = data.entreprise || this.entreprise;
      this.settings = data.settings || this.settings;
      this.facturation = data.facturation || this.facturation;
      this.notifications = data.notifications || this.notifications;
    }
  }

  toggle2FA() {
    this.securite.a2f = !this.securite.a2f;
  }

  changerMotDePasse() {
    alert('Fonctionnalité à venir : changement de mot de passe');
  }

  changerPlan(planId: string) {
    const plan = this.autresPlans.find(p => p.id === planId);
    if (plan) {
      this.planActuel = plan.nom;
      this.prixPlan = plan.prix;
      alert(`✅ Vous allez passer au plan ${plan.nom} à ${plan.prix.toLocaleString()} FCFA/mois. Un commercial vous contactera pour finaliser.`);
    }
  }

  contacterCommercial() {
    alert('📞 Notre équipe commerciale vous contactera dans les 24h pour discuter de vos besoins.');
  }

  saveAll() {
    const allParams = {
      entreprise: this.entreprise,
      settings: this.settings,
      facturation: this.facturation,
      notifications: this.notifications
    };
    
    localStorage.setItem('pulsebusiness_params', JSON.stringify(allParams));
    alert('✅ Paramètres enregistrés avec succès !');
  }
}