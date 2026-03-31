import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

// Définition d'interfaces minimales pour les données attendues
interface ClientData {
  id?: number;
  nom?: string;
  email?: string;
  telephone?: string;
  ville?: string;
  pays?: string;
  created_at?: string;
}

interface FactureData {
  reference?: string;
  client_nom?: string;
  date_emission?: string;
  montant_ht?: number;
  montant_ttc?: number;
  statut?: string;
  created_at?: string;
}

interface ChantierData {
  id?: number;
  nom?: string;
  client_nom?: string;
  statut?: string;
  budget_prevu?: number;
  date_debut_prevue?: string;
  date_fin_prevue?: string;
  responsable_nom?: string;
}

@Injectable({ providedIn: 'root' })
export class ExcelService {
  private formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  }

  private export(data: any[], fileName: string, sheetName: string = 'Sheet1'): void {
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    } catch (error) {
      console.error('Excel export failed', error);
      // Optionnel : notifier l'utilisateur
    }
  }

  exportClients(clients: ClientData[], fileName: string = 'clients'): void {
    const data = clients.map(c => ({
      ID: c.id,
      Nom: c.nom,
      Email: c.email,
      Téléphone: c.telephone,
      Ville: c.ville,
      Pays: c.pays,
      'Date création': this.formatDate(c.created_at)
    }));
    this.export(data, fileName, 'Clients');
  }

  exportFactures(factures: FactureData[], fileName: string = 'factures'): void {
    const data = factures.map(f => ({
      Référence: f.reference,
      Client: f.client_nom,
      Date: this.formatDate(f.date_emission),
      'Montant HT': f.montant_ht,
      'Montant TTC': f.montant_ttc,
      Statut: f.statut,
      'Date création': this.formatDate(f.created_at)
    }));
    this.export(data, fileName, 'Factures');
  }

  exportChantiers(chantiers: ChantierData[], fileName: string = 'chantiers'): void {
    const data = chantiers.map(c => ({
      ID: c.id,
      Nom: c.nom,
      Client: c.client_nom,
      Statut: c.statut,
      Budget: c.budget_prevu,
      'Début prévu': this.formatDate(c.date_debut_prevue),
      'Fin prévue': this.formatDate(c.date_fin_prevue),
      Responsable: c.responsable_nom
    }));
    this.export(data, fileName, 'Chantiers');
  }

  exportCustom(data: any[], columns: { header: string; key: string }[], fileName: string, sheetName: string = 'Data'): void {
    const mapped = data.map(item => {
      const row: any = {};
      columns.forEach(col => { row[col.header] = item[col.key]; });
      return row;
    });
    this.export(mapped, fileName, sheetName);
  }

  importFromExcel(file: File, sheetIndex: number = 0): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[sheetIndex];
          if (!sheetName) throw new Error(`Sheet index ${sheetIndex} not found`);
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          resolve(json);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }
}