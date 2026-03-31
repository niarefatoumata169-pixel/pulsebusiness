// filepath: /Users/mac/Documents/pulsebusiness-frontend/src/app/services/export.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { ExportService } from './export.service';

describe('ExportService', () => {
  let service: ExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('exportToExcel should create a CSV blob and trigger download', async () => {
    const data = [{ a: '1', b: '2' }, { a: '3', b: '4' }];
    const cols = ['a', 'b'];
    const filename = 'testfile';

    // Spy on URL.createObjectURL and capture the blob argument
    let capturedBlob: Blob | null = null;
    const createObjectURLSpy = spyOn(URL, 'createObjectURL').and.callFake((blob: Blob) => {
      capturedBlob = blob;
      return 'blob:mock';
    });

    const mockLink = { href: '', download: '', click: jasmine.createSpy('click') };
    spyOn(document, 'createElement').and.callFake((tag: string) => {
      if (tag === 'a') return mockLink as any;
      return document.createElement(tag);
    });

    service.exportToExcel(data, cols, filename);

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(mockLink.click).toHaveBeenCalled();

    const today = new Date().toISOString().slice(0, 10);
    expect(mockLink.download).toBe(`${filename}_${today}.csv`);

    // Retrieve the blob from the spy's arguments
    const blob = createObjectURLSpy.calls.mostRecent().args[0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    const text = await blob.text();
    expect(text.startsWith('\uFEFF')).toBe(true);
    expect(text).toContain('"a","b"');
    expect(text).toContain('"1","2"');
  });

  it('exportToPDF should open a window, write content, close document and print when pop-up allowed', () => {
    const tableHtml = '表<table><tr><td>cell</td></tr></table>';
    const mockDocWrite = jasmine.createSpy('write');
    const mockDocClose = jasmine.createSpy('close');
    const mockPrint = jasmine.createSpy('print');

    const mockWin = {
      document: {
        write: mockDocWrite,
        close: mockDocClose
      },
      print: mockPrint
    };

    spyOn(window, 'open').and.returnValue(mockWin as any);

    service.exportToPDF('Mon Rapport', tableHtml);

    expect(window.open).toHaveBeenCalledWith('', '_blank');
    expect(mockDocWrite).toHaveBeenCalled();
    const written = mockDocWrite.calls.mostRecent().args[0] as string;
    expect(written).toContain('Mon Rapport');
    // Uncomment if your service has an 'entreprise' property
    // expect(written).toContain(service.entreprise.nom);
    expect(written).toContain(tableHtml);
    expect(mockDocClose).toHaveBeenCalled();
    expect(mockPrint).toHaveBeenCalled();
  });

  it('exportToPDF should alert when pop-ups are blocked', () => {
    spyOn(window, 'open').and.returnValue(null);
    const alertSpy = spyOn(window, 'alert');

    service.exportToPDF('Titre', 'Table');

    expect(alertSpy).toHaveBeenCalledWith('Veuillez autoriser les pop-ups pour imprimer');
  });
});