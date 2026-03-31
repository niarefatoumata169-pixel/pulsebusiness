import { Injectable, Inject, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Observable, fromEventPattern } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'user-theme';
  private themeSubject = new BehaviorSubject<Theme>('auto');
  public theme$: Observable<Theme> = this.themeSubject.asObservable().pipe(shareReplay(1));

  private renderer: Renderer2;
  private mediaQuery: MediaQueryList | null = null;
  private mediaQueryHandler: ((e: MediaQueryListEvent) => void) | null = null;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.initTheme();
  }

  private initTheme(): void {
    // Récupère la préférence stockée ou utilise 'auto' par défaut
    const stored = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
    const initialTheme = stored && ['light', 'dark', 'auto'].includes(stored) ? stored : 'auto';
    this.setTheme(initialTheme);
  }

  /**
   * Applique le thème (ou le thème effectif si 'auto')
   */
  private applyTheme(theme: Theme): void {
    let effectiveTheme: 'light' | 'dark';

    if (theme === 'auto') {
      // Détermine le thème système
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = isDark ? 'dark' : 'light';
      // Écoute les changements de thème système
      this.listenToSystemTheme();
    } else {
      effectiveTheme = theme;
      // Si on a quitté le mode auto, on arrête d'écouter le système
      this.stopListeningToSystemTheme();
    }

    // Applique l'attribut data-theme sur l'élément racine (html)
    this.renderer.setAttribute(this.document.documentElement, 'data-theme', effectiveTheme);
  }

  /**
   * Écoute les changements de thème système (pour le mode auto)
   */
  private listenToSystemTheme(): void {
    if (!window.matchMedia) return;
    if (this.mediaQuery) this.stopListeningToSystemTheme();

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQueryHandler = (e: MediaQueryListEvent) => {
      // On ne réagit que si le mode actuel est 'auto'
      if (this.themeSubject.value === 'auto') {
        this.applyTheme('auto');
      }
    };
    // Utiliser 'addEventListener' pour les navigateurs modernes
    if (this.mediaQuery.addEventListener) {
      this.mediaQuery.addEventListener('change', this.mediaQueryHandler);
    } else {
      // Fallback pour Safari < 14
      this.mediaQuery.addListener(this.mediaQueryHandler);
    }
  }

  private stopListeningToSystemTheme(): void {
    if (this.mediaQuery && this.mediaQueryHandler) {
      if (this.mediaQuery.removeEventListener) {
        this.mediaQuery.removeEventListener('change', this.mediaQueryHandler);
      } else if (this.mediaQuery.removeListener) {
        this.mediaQuery.removeListener(this.mediaQueryHandler);
      }
      this.mediaQuery = null;
      this.mediaQueryHandler = null;
    }
  }

  /**
   * Définit le thème (light, dark, auto)
   */
  setTheme(theme: Theme): void {
    if (theme === this.themeSubject.value) return;
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.themeSubject.next(theme);
    this.applyTheme(theme);
  }

  /**
   * Bascule entre light et dark (si auto, on bascule vers l'opposé du thème système)
   */
  toggleTheme(): void {
    const current = this.themeSubject.value;
    let next: Theme;

    if (current === 'light') {
      next = 'dark';
    } else if (current === 'dark') {
      next = 'light';
    } else { // auto
      // Pour le mode auto, on bascule vers le thème opposé du système
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      next = isDark ? 'light' : 'dark';
    }
    this.setTheme(next);
  }

  /**
   * Récupère le thème actuel (light, dark, auto) de manière synchrone
   */
  getTheme(): Theme {
    return this.themeSubject.value;
  }

  /**
   * Récupère le thème effectivement appliqué (light ou dark)
   */
  getEffectiveTheme(): 'light' | 'dark' {
    const theme = this.themeSubject.value;
    if (theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }
}