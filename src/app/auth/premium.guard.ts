import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class premiumGuard implements CanActivate {
  canActivate(): boolean {
    // ✅ TOUJOURS AUTORISÉ
    return true;
  }
}
