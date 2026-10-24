import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * Carga apps-script/Code.gs en node:vm con dobles mínimos de SpreadsheetApp,
 * PropertiesService, CacheService, LockService, ContentService, Utilities y
 * Logger, y prueba configurar(), doPost() y el contador de leads.
 */

const CODE = readFileSync(join(__dirname, '..', '..', 'apps-script', 'Code.gs'), 'utf8');

type Cell = string | number | Date;

class FakeRange {
  constructor(
    private sheet: FakeSheet,
    private row: number,
    private col: number,
    private rows: number,
    private cols: number,
  ) {}
  setValues(values: Cell[][]) {
    values.forEach((r, i) => r.forEach((v, j) => this.sheet.set(this.row + i, this.col + j, v)));
    return this;
  }
  setValue(v: Cell) {
    this.sheet.set(this.row, this.col, v);
    return this;
  }
  getValues(): Cell[][] {
    return Array.from({ length: this.rows }, (_, i) =>
      Array.from({ length: this.cols }, (_, j) => this.sheet.get(this.row + i, this.col + j)),
    );
  }
  setNumberFormat() {
    return this;
  }
  setNumberFormats() {
    return this;
  }
  setFontWeight() {
    return this;
  }
  setBackground() {
    return this;
  }
  setFontSize() {
    return this;
  }
}

function a1(ref: string): [number, number, number, number] {
  const cell = (r: string) => {
    const m = /^([A-Z]+)(\d*)$/.exec(r)!;
    const col = m[1].split('').reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
    return [m[2] ? Number(m[2]) : 1, col];
  };
  const [a, b = a] = ref.split(':');
  const [r1, c1] = cell(a);
  const [r2, c2] = cell(b);
  return [r1, c1, Math.max(1, r2 - r1 + 1), c2 - c1 + 1];
}

class FakeSheet {
  cells = new Map<string, Cell>();
  constructor(public name: string) {}
  set(r: number, c: number, v: Cell) {
    this.cells.set(`${r},${c}`, v);
  }
  get(r: number, c: number): Cell {
    return this.cells.get(`${r},${c}`) ?? '';
  }
  getLastRow() {
    let last = 0;
    for (const k of this.cells.keys()) last = Math.max(last, Number(k.split(',')[0]));
    return last;
  }
  row(r: number): Cell[] {
    return Array.from({ length: 14 }, (_, i) => this.get(r, i + 1));
  }
  getRange(...args: (string | number)[]) {
    if (typeof args[0] === 'string') return new FakeRange(this, ...a1(args[0]));
    const [r, c, rows = 1, cols = 1] = args as number[];
    return new FakeRange(this, r, c, rows, cols);
  }
  appendRow(values: Cell[]) {
    const r = this.getLastRow() + 1;
    values.forEach((v, i) => this.set(r, i + 1, v));
  }
  setFrozenRows() {}
  setColumnWidth() {}
}

function load() {
  const sheets = new Map<string, FakeSheet>();
  const book = {
    getId: () => 'libro-1',
    getUrl: () => 'https://docs.google.com/spreadsheets/d/libro-1',
    getSheetByName: (n: string) => sheets.get(n) ?? null,
    insertSheet: (n: string) => {
      const s = new FakeSheet(n);
      sheets.set(n, s);
      return s;
    },
    getSheets: () => [...sheets.values()],
    deleteSheet: (s: FakeSheet) => sheets.delete(s.name),
  };
  const props = new Map<string, string>();
  const cache = new Map<string, string>();
  const mails: Record<string, string>[] = [];
  let failMail = false;
  const ctx: Record<string, unknown> = {
    SpreadsheetApp: { getActiveSpreadsheet: () => book, openById: () => book },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (k: string) => props.get(k) ?? null,
        setProperty: (k: string, v: string) => props.set(k, v),
      }),
    },
    CacheService: {
      getScriptCache: () => ({
        get: (k: string) => cache.get(k) ?? null,
        put: (k: string, v: string) => cache.set(k, v),
      }),
    },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => undefined }) },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (text: string) => ({
        text,
        setMimeType: function () {
          return this;
        },
      }),
    },
    Utilities: {
      getUuid: () => 'uuid',
      formatDate: (d: Date, _tz: string, f: string) => {
        const p = (n: number) => String(n).padStart(2, '0');
        const map: Record<string, string> = {
          'yyyy-MM-dd': `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
          'yyyy-MM': `${d.getFullYear()}-${p(d.getMonth() + 1)}`,
          'HH:mm': `${p(d.getHours())}:${p(d.getMinutes())}`,
        };
        return map[f];
      },
    },
    Logger: { log: () => undefined },
    MailApp: {
      sendEmail: (m: Record<string, string>) => {
        if (failMail) throw new Error('cuota');
        mails.push(m);
      },
    },
  };
  vm.createContext(ctx);
  vm.runInContext(CODE, ctx);
  const call = (name: string, ...args: unknown[]) => (ctx[name] as (...a: unknown[]) => unknown)(...args);
  const post = (body: Record<string, unknown>) =>
    JSON.parse((call('doPost', { postData: { contents: JSON.stringify(body) } }) as { text: string }).text);
  return {
    sheets,
    props,
    mails,
    call,
    post,
    breakMail: () => {
      failMail = true;
    },
  };
}

const lead = (over: Record<string, unknown> = {}) => ({
  secret: 'uuiduuid',
  id: 'lead-1',
  tipoEvento: 'Mercado navideño',
  fechaInicio: '2026-12-05',
  fechaFin: '2026-12-08',
  localidad: 'Alcalá de Henares',
  provincia: 'Madrid',
  casetas: 4,
  comentarios: 'Con luz',
  nombre: 'Lucía',
  telefono: '+34 600 000 000',
  email: 'lucia@example.com',
  empresa: '',
  consentimiento: true,
  website: '',
  ...over,
});

describe('Apps Script', () => {
  let s: ReturnType<typeof load>;
  beforeEach(() => {
    s = load();
    s.call('configurar');
  });

  it('no lleva comentarios ni datos de campaña', () => {
    expect(CODE).not.toMatch(/^\s*\/\//m);
    expect(CODE).not.toMatch(/\/\*/);
    expect(CODE).not.toMatch(/utm|referrer|landing|dispositivo|GmailApp/i);
  });

  it('configurar crea las hojas, las cabeceras, el contador y el secreto', () => {
    const sol = s.sheets.get('Solicitudes')!;
    expect(sol.row(1)).toEqual([
      'Nº',
      'Fecha',
      'Hora',
      'Nombre',
      'Teléfono',
      'Email',
      'Empresa',
      'Tipo de evento',
      'Fecha de inicio',
      'Fecha de fin',
      'Localidad',
      'Provincia',
      'Casetas',
      'Comentarios',
    ]);
    const cont = s.sheets.get('Contador')!;
    expect(cont.get(1, 1)).toBe('Total de leads');
    expect(String(cont.get(1, 2))).toContain('COUNTA');
    expect(s.props.get('SECRETO')).toBe('uuiduuid');
  });

  it('guarda los datos del formulario con fecha y hora, y suma el lead al mes', () => {
    const res = s.post(lead());
    expect(res).toEqual({ ok: true, numero: 1 });
    const row = s.sheets.get('Solicitudes')!.row(2);
    expect(row[0]).toBe(1);
    expect(Object.prototype.toString.call(row[1])).toBe('[object Date]');
    expect(String(row[2])).toMatch(/^\d{2}:\d{2}$/);
    expect(row.slice(3)).toEqual([
      'Lucía',
      "'+34 600 000 000",
      'lucia@example.com',
      '',
      'Mercado navideño',
      '05/12/2026',
      '08/12/2026',
      'Alcalá de Henares',
      'Madrid',
      4,
      'Con luz',
    ]);
    expect(s.post(lead({ id: 'lead-2' }))).toEqual({ ok: true, numero: 2 });
    const cont = s.sheets.get('Contador')!;
    expect(cont.get(6, 2)).toBe(2);
    expect(String(cont.get(6, 1))).toMatch(/^\d{4}-\d{2}$/);
  });

  it('un reintento con el mismo id no duplica la fila', () => {
    s.post(lead());
    expect(s.post(lead())).toEqual({ ok: true, numero: 1 });
    expect(s.sheets.get('Solicitudes')!.getLastRow()).toBe(2);
  });

  it('rechaza un secreto incorrecto, ignora el honeypot y neutraliza fórmulas', () => {
    expect(s.post(lead({ secret: 'otro' }))).toEqual({ ok: false, error: 'unauthorized' });
    expect(s.post(lead({ website: 'spam' }))).toEqual({ ok: true, numero: 0 });
    expect(s.sheets.get('Solicitudes')!.getLastRow()).toBe(1);
    s.post(lead({ id: 'x', nombre: '=HYPERLINK("x")', tipoEvento: 'Otro', tipoEventoOtro: 'Boda' }));
    const row = s.sheets.get('Solicitudes')!.row(2);
    expect(row[3]).toBe('\'=HYPERLINK("x")');
    expect(row[7]).toBe('Otro: Boda');
  });

  it('avisa por email a aaswebmarketing@gmail.com de cada lead nuevo, y solo a esa dirección', () => {
    s.post(lead());
    expect(s.mails).toHaveLength(1);
    const m = s.mails[0];
    expect(m.to).toBe('aaswebmarketing@gmail.com');
    expect(m.subject).toBe('Nuevo lead nº 1: Lucía (Mercado navideño)');
    expect(m.body).toContain("Teléfono: '+34 600 000 000");
    expect(m.body).toContain('Lugar: Alcalá de Henares (Madrid)');
    expect(m.body).toContain('docs.google.com/spreadsheets');
    s.post(lead());
    s.post(lead({ website: 'spam' }));
    s.post(lead({ secret: 'otro', id: 'z' }));
    expect(s.mails).toHaveLength(1);
    expect(CODE).not.toMatch(/info@casetasmaderik|zentiocompany/i);
  });

  it('si el email falla, el lead se guarda igualmente', () => {
    s.breakMail();
    expect(s.post(lead())).toEqual({ ok: true, numero: 1 });
    expect(s.sheets.get('Solicitudes')!.getLastRow()).toBe(2);
  });
});
