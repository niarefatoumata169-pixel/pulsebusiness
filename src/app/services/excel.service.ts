import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  
  constructor() { }

  /**
   * Exporte les données vers un fichier Excel
   * @param data - Tableau de données à exporter
   * @param fileName - Nom du fichier (sans extension)
   * @param sheetName - Nom de la feuille Excel
   */
  exportToExcel(data: any[], fileName: string, sheetName: string = 'Sheet1'): void {
    // Créer une feuille de calcul
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    
    // Créer un classeur
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Exporter le fichier
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  /**
   * Exporte les clients vers Excel
   */
  exportClients(clients: any[]): void {
    const data = clients.map(client => ({
      'ID': client.id,
      'Nom': client.nom,
      'Email': client.email,
      'Téléphone': client.telephone,
      'Ville': client.ville,
      'Pays': client.pays,
      'Date création': client.created_at ? new Date(client.created_at).toLocaleDateString() : ''
    }));
    
    this.exportToExcel(data, 'clients', 'Clients');
  }

  /**
   * Exporte les factures vers Excel
   */
  exportFactures(factures: any[]): void {
    const data = factures.map(facture => ({
      'Numéro': facture.numero,
      'Client': facture.client_nom || facture.client_id,
      'Date': facture.date_facture ? new Date(facture.date_facture).toLocaleDateString() : '',
      'Montant HT': facture.montant_ht,
      'Montant TTC': facture.montant_ttc,
      'Statut': facture.statut,
      'Date création': facture.created_at ? new Date(facture.created_at).toLocaleDateString() : ''
    }));
    
    this.exportToExcel(data, 'factures', 'Factures');
  }

  /**
   * Exporte les chantiers vers Excel
   */
  exportChantiers(chantiers: any[]): void {
    const data = chantiers.map(chantier => ({
      'ID': chantier.id,
      'Nom': chantier.nom,
      'Client': chantier.client_nom || chantier.client_id,
      'Statut': chantier.statut,
      'Budget': chantier.budget,
      'Date début': chantier.date_debut ? new Date(chantier.date_debut).toLocaleDateString() : '',
      'Date fin': chantier.date_fin ? new Date(chantier.date_fin).toLocaleDateString() : '',
      'Responsable': chantier.responsable
    }));
    
    this.exportToExcel(data, 'chantiers', 'Chantiers');
  }

  /**
   * Importe un fichier Excel
   * @param file - Fichier Excel à importer
   * @returns Promise avec les données
   */
  importFromExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader: FileReader = new FileReader();
      
      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook: XLSX.WorkBook = XLSX.read(data, { type: 'array' });
          const firstSheet: string = workbook.SheetNames[0];
          const worksheet: XLSX.WorkSheet = workbook.Sheets[firstSheet];
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }
}
