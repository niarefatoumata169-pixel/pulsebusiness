import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom?: string;
  entreprise?: string;
  role: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // ✅ URL corrigée : port 3005 (backend réel)
  private apiUrl = 'http://localhost:3005/api';
  private tokenKey = 'auth_token';
  private userKey = 'user_data';

  constructor(private http: HttpClient) {}

  async login(email: string, password: string): Promise<User | null> {
    try {
      const response = await lastValueFrom(
        this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
      );
      if (response && response.token) {
        this.setToken(response.token);
        this.setUser(response.user);
        return response.user;
      }
      return null;
    } catch (error) {
      console.error('Erreur login:', error);
      return null;
    }
  }

  async register(userData: any): Promise<User | null> {
    try {
      const response = await lastValueFrom(
        this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, userData)
      );
      if (response && response.token) {
        this.setToken(response.token);
        this.setUser(response.user);
        return response.user;
      }
      return null;
    } catch (error) {
      console.error('Erreur register:', error);
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUser(): User | null {
    const userJson = localStorage.getItem(this.userKey);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  async getProfile(): Promise<User | null> {
    try {
      return await lastValueFrom(
        this.http.get<User>(`${this.apiUrl}/auth/profile`, {
          headers: this.getAuthHeaders()
        })
      );
    } catch (error) {
      console.error('Erreur getProfile:', error);
      return null;
    }
  }

  async getClients(): Promise<any[]> {
    try {
      return await lastValueFrom(
        this.http.get<any[]>(`${this.apiUrl}/clients`, {
          headers: this.getAuthHeaders()
        })
      ) || [];
    } catch (error) {
      console.error('Erreur getClients:', error);
      return [];
    }
  }

  async createClient(client: any): Promise<any | null> {
    try {
      return await lastValueFrom(
        this.http.post<any>(`${this.apiUrl}/clients`, client, {
          headers: this.getAuthHeaders()
        })
      );
    } catch (error) {
      console.error('Erreur createClient:', error);
      return null;
    }
  }

  async getFactures(): Promise<any[]> {
    try {
      return await lastValueFrom(
        this.http.get<any[]>(`${this.apiUrl}/factures`, {
          headers: this.getAuthHeaders()
        })
      ) || [];
    } catch (error) {
      console.error('Erreur getFactures:', error);
      return [];
    }
  }

  async createFacture(facture: any): Promise<any | null> {
    try {
      return await lastValueFrom(
        this.http.post<any>(`${this.apiUrl}/factures`, facture, {
          headers: this.getAuthHeaders()
        })
      );
    } catch (error) {
      console.error('Erreur createFacture:', error);
      return null;
    }
  }

  async getEmployes(): Promise<any[]> {
    try {
      return await lastValueFrom(
        this.http.get<any[]>(`${this.apiUrl}/rh/employes`, {
          headers: this.getAuthHeaders()
        })
      ) || [];
    } catch (error) {
      console.error('Erreur getEmployes:', error);
      return [];
    }
  }
}