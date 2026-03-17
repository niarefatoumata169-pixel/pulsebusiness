import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  constructor(private api: ApiService) {}

  async getClients() {
    return this.api.getClients();
  }

  async getClient(id: number) {
    return this.api.getClient(id);
  }

  async createClient(client: any) {
    return this.api.createClient(client);
  }

  async updateClient(id: number, client: any) {
    return this.api.updateClient(id, client);
  }

  async deleteClient(id: number) {
    return this.api.deleteClient(id);
  }
}
