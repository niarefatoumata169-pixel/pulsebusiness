import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-'$module,
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `<div class="page-container"><div class="empty-state"><div class="empty-icon">📦</div><h3>Gestion des $module</h3><p>Les données apparaîtront ici</p><button class="btn-primary">+ Ajouter</button></div></div>`,
  styles: [`.page-container{padding:24px}.empty-state{text-align:center;padding:60px;background:var(--bg-card);border-radius:12px;border:2px dashed var(--border-color)}.empty-icon{font-size:48px;margin-bottom:16px}.btn-primary{background:#EC4899;color:white;border:none;padding:10px 20px;border-radius:8px}`]
})
export class '$module'Component {}
