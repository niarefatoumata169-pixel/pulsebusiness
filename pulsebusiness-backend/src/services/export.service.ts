// ...existing code...
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';

const inferFields = (data: any[]): string[] => {
  if (!data || data.length === 0) return [];
  // Prefer stable order: keys of first object
  return Object.keys(data[0]);
};

export const exportToCSV = (data: any[], fields?: string[]): string => {
  const f = (fields && fields.length > 0) ? fields : inferFields(data);
  try {
    const parser = new Parser({ fields: f, defaultValue: '' });
    return parser.parse(data || []);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to generate CSV:', err);
    throw err;
  }
};

export const exportToExcel = async (data: any[], sheetName = 'Sheet1', fields?: string[]): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  const f = (fields && fields.length > 0) ? fields : inferFields(data);

  // Define columns with headers & keys to preserve ordering
  worksheet.columns = f.map(field => ({ header: field, key: field, width: 20 }));

  // Add rows as objects to match keys
  data.forEach(row => {
    const mapped: Record<string, any> = {};
    f.forEach(k => {
      let v = row[k];
      // Basic formatting: Dates -> ISO string, Numbers keep as-is
      if (v instanceof Date) v = v.toISOString();
      mapped[k] = v ?? '';
    });
    worksheet.addRow(mapped);
  });

  // Style header
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFEC4899' },
  };

  // Auto-adjust column widths based on content (within limits)
  worksheet.columns.forEach(col => {
    // col.values can be undefined according to typings — guard it
    const headerStr = String(col.header ?? '');
    const valuesArray: any[] = Array.isArray(col.values) ? col.values.slice(2) : []; // skip internal indexes
    const maxValueLength = valuesArray.length > 0 ? Math.max(...valuesArray.map((v: any) => (v == null ? 0 : String(v).length))) : 0;
    const maxLength = Math.max(headerStr.length, maxValueLength);
    // set reasonable min/max
    col.width = Math.min(Math.max(maxLength + 2, 10), 50);
  });

  // writeBuffer may return Buffer or Uint8Array depending on environment — cast to Buffer for callers expecting Buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as unknown as Buffer;
};

export const exportFactures = async (factures: any[]) => {
  const fields = ['numero', 'client_nom', 'date_emission', 'montant_ttc', 'statut'];
  return exportToCSV(factures, fields);
};

export const exportClients = async (clients: any[]) => {
  const fields = ['nom', 'prenom', 'email', 'telephone', 'entreprise', 'chiffre_affaires'];
  return exportToCSV(clients, fields);
};
// ...existing code...