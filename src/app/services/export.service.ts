import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  // 🔹 Infos entreprise (tu peux rendre dynamique plus tard)
  entreprise = {
    nom: 'PulseBusiness',
    email: 'contact@pulsebusiness.com',
    telephone: '+223 XX XX XX XX'
  };

  constructor() {}

  // =========================
  // 📊 EXPORT EXCEL (CSV)
  // =========================
  exportToExcel(data: any[], colonnes: string[], filename: string) {
    const lignes = data.map(row => Object.values(row));

    const csvContent = [colonnes, ...lignes]
      .map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  }

  // =========================
  // 📄 EXPORT PDF
  // =========================
  exportToPDF(title: string, tableHtml: string) {
    const contenu = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          h1 { color: #EC4899; text-align: center; }
          .header { text-align:center; margin-bottom:20px; }
          .header strong { font-size:18px; }
          table { width:100%; border-collapse:collapse; margin-top:20px; }
          th, td { border:1px solid #ddd; padding:8px; }
          th { background:#f3f4f6; }
          .footer { margin-top:30px; text-align:center; font-size:12px; color:gray; }
        </style>
      </head>
      <body>

        <div class="header">
          <strong>${this.entreprise.nom}</strong><br>
          ${this.entreprise.email} • ${this.entreprise.telephone}
        </div>

        <h1>${title}</h1>
        <p>Généré le ${new Date().toLocaleString()}</p>

        ${tableHtml}

        <div class="footer">
          © ${new Date().getFullYear()} ${this.entreprise.nom}
        </div>

      </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(contenu);
      win.document.close();
      win.print();
    } else {
      alert('Veuillez autoriser les pop-ups pour imprimer');
    }
  }
}