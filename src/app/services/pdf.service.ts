import { Injectable } from '@angular/core';
import * as jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  
  constructor() { }

  /**
   * Génère un PDF de facture
   */
  generateFacture(facture: any, client: any, articles: any[] = []): void {
    const doc = new jsPDF.default();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // En-tête
    doc.setFillColor(236, 72, 153); // Rose
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('PULSEBUSINESS', 20, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Facture', 20, 35);
    
    // Informations de facture
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    let yPos = 50;
    
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE N°:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(facture['numero'] || 'N/A', 60, yPos);
    
    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(facture['date_facture'] ? new Date(facture['date_facture']).toLocaleDateString() : 'N/A', 60, yPos);
    
    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Échéance:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(facture['date_echeance'] ? new Date(facture['date_echeance']).toLocaleDateString() : 'N/A', 60, yPos);
    
    // Informations client
    yPos += 15;
    doc.setFillColor(243, 244, 246);
    doc.rect(20, yPos - 5, pageWidth - 40, 30, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENT', 25, yPos);
    
    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Nom:', 25, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(client?.['nom'] || 'N/A', 45, yPos);
    
    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Email:', 25, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(client?.['email'] || 'N/A', 45, yPos);
    
    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Tél:', 25, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(client?.['telephone'] || 'N/A', 45, yPos);
    
    // Tableau des articles
    yPos += 15;
    
    if (articles && articles.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [['Description', 'Quantité', 'Prix unitaire', 'TVA', 'Total']],
        body: articles.map(a => [
          a['description'] || '-',
          (a['quantite'] ?? 0).toString(),
          (a['prix_unitaire'] ?? 0).toFixed(2) + ' FCFA',
          (a['tva'] ?? 0) + '%',
          (((a['quantite'] ?? 0) * (a['prix_unitaire'] ?? 0) * (1 + (a['tva'] ?? 0)/100)).toFixed(2)) + ' FCFA'
        ]),
        headStyles: { fillColor: [236, 72, 153] },
        columnStyles: { 0: { cellWidth: 60 } }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.text('Aucun article', 20, yPos);
      yPos += 10;
    }
    
    // Totaux
    const totalHT = facture['montant_ht'] || 0;
    const totalTTC = facture['montant_ttc'] || 0;
    
    doc.setFillColor(243, 244, 246);
    doc.rect(pageWidth - 80, yPos, 60, 30, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.text('Total HT:', pageWidth - 75, yPos + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(totalHT.toFixed(2) + ' FCFA', pageWidth - 75, yPos + 14);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Total TTC:', pageWidth - 75, yPos + 21);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(236, 72, 153);
    doc.text(totalTTC.toFixed(2) + ' FCFA', pageWidth - 75, yPos + 28);
    
    // Statut
    doc.setTextColor(0, 0, 0);
    yPos += 40;
    
    if (facture['statut'] === 'payée') {
      doc.setFillColor('#10B981'); // Vert
    } else {
      doc.setFillColor('#EF4444'); // Rouge
    }
    doc.rect(20, yPos, 40, 15, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text((facture['statut']?.toUpperCase() || 'EN ATTENTE'), 25, yPos + 10);
    
    // Pied de page
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text('Document généré par PulseBusiness', pageWidth / 2, 280, { align: 'center' });
    
    // Sauvegarder le PDF
    doc.save(`facture_${facture['numero'] || 'sans_numero'}.pdf`);
  }

  /**
   * Génère un PDF de liste de clients
   */
  generateClientsList(clients: any[]): void {
    const doc = new jsPDF.default();
    
    doc.setFillColor(236, 72, 153);
    doc.rect(0, 0, 210, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Liste des clients', 20, 14);
    
    doc.setTextColor(0, 0, 0);
    
    const data = clients.map(c => [
      c['nom'] || '-',
      c['email'] || '-',
      c['telephone'] || '-',
      c['ville'] || '-',
      c['pays'] || '-'
    ]);
    
    autoTable(doc, {
      startY: 30,
      head: [['Nom', 'Email', 'Téléphone', 'Ville', 'Pays']],
      body: data,
      headStyles: { fillColor: [236, 72, 153] }
    });
    
    doc.save('clients.pdf');
  }

  /**
   * Génère un PDF de liste de factures
   */
  generateFacturesList(factures: any[]): void {
    const doc = new jsPDF.default();
    
    doc.setFillColor(236, 72, 153);
    doc.rect(0, 0, 210, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Liste des factures', 20, 14);
    
    doc.setTextColor(0, 0, 0);
    
    const data = factures.map(f => [
      f['numero'] || '-',
      f['client_nom'] || '-',
      f['date_facture'] ? new Date(f['date_facture']).toLocaleDateString() : '-',
      (f['montant_ttc'] ?? 0).toFixed(2) + ' FCFA',
      f['statut'] || '-'
    ]);
    
    autoTable(doc, {
      startY: 30,
      head: [['Numéro', 'Client', 'Date', 'Montant', 'Statut']],
      body: data,
      headStyles: { fillColor: [236, 72, 153] }
    });
    
    doc.save('factures.pdf');
  }
}