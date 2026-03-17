import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { CalculatorComponent } from '../shared/calculator/calculator.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, CalculatorComponent],
  template: `
    <div class="layout-wrapper">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <app-calculator></app-calculator>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      min-height: 100vh;
      background-color: #F3F4F6;
    }
    .main-content {
      flex: 1;
      margin-left: 280px;
      padding: 30px;
    }
  `]
})
export class MainLayoutComponent {}
