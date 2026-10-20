import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * Carga apps-script/Code.gs en un contexto de node:vm con dobles mínimos de
 * SpreadsheetApp, PropertiesService, LockService, CacheService, MailApp,
 * ContentService, Utilities y Session, y prueba doPost, setup y el panel.
 */

const CODE = readFileSync(join(__dirname, '..', '..', 'apps-script', 'Code.gs'), 'utf8');
const MANIFEST = JSON.parse(readFileSync(join(__dirname, '..', '..', 'apps-script', 'appsscript.json'), 'utf8'));

type Fn = (...args: unknown[]) => unknown;
type Obj = Record<string, unknown>;

/** Objeto que acepta cualquier método encadenado (formatos, bandas, gráficos...). */
function chain<T extends object>(target: T, onCall?: (name: string, args: unknown[]) => void): T {
  const proxy: T = new Proxy(target, {
    get(obj, prop, receiver) {
      if (prop in obj) return Reflect.get(obj, prop, receiver);
      if (typeof prop === 'symbol' || prop === 'then') return undefined;
      return (...args: unknown[]) => {
        onCall?.(prop, args);
        return proxy;
      };
    },
  });
  return proxy;
}

function a1ToRC(a1: string): { row: number; col: number; rows: number; cols: number } {
  const parse = (ref: string) => {
    const m = /^([A-Z]+)(\d+)$/.exec(ref);
    if (!m) throw new Error(`A1 no soportado: ${ref}`);
    const col = m[1].split('').reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
    return { row: Number(m[2]), col };
  };
  const [a, b] = a1.split(':');
  const start = parse(a);
  const end = b ? parse(b) : start;
  return { row: start.row, col: start.col, rows: end.row - start.row + 1, cols: end.col - start.col + 1 };
}

class FakeSheet {
  cells = new Map<string, unknown>();
  formulas: { cell: string; formula: string }[] = [];
  charts: unknown[] = [];
  insertedRows = 0;
  calls: string[] = [];
  constructor(
    public name: string,
    public maxRows = 1000,
    public maxColumns = 26,
    public id = Math.floor(Math.random() * 1e6),
  ) {}

  get(row: number, col: number): unknown {
    return this.cells.get(`${row}:${col}`) ?? '';
  }

  set(row: number, col: number, value: unknown): void {
    if (value === '' || value === null || value === undefined) this.cells.delete(`${row}:${col}`);
    else this.cells.set(`${row}:${col}`, value);
    if (typeof value === 'string' && value.startsWith('=')) this.formulas.push({ cell: `${row}:${col}`, formula: value });
  }

  rowValues(row: number, cols = 31): unknown[] {
    return Array.from({ length: cols }, (_, i) => this.get(row, i + 1));
  }

  api(): Obj {
    return chain(
      {
        getName: () => this.name,
        getSheetId: () => this.id,
        getMaxRows: () => this.maxRows,
        getMaxColumns: () => this.maxColumns,
        getLastRow: () => {
          let last = 0;
          for (const key of this.cells.keys()) last = Math.max(last, Number(key.split(':')[0]));
          return last;
        },
        getLastColumn: () => {
          let last = 0;
          for (const key of this.cells.keys()) last = Math.max(last, Number(key.split(':')[1]));
          return last;
        },
        insertRowsAfter: (_after: unknown, n: unknown) => {
          this.maxRows += Number(n);
          this.insertedRows += Number(n);
        },
        insertColumnsAfter: (_after: unknown, n: unknown) => {
          this.maxColumns += Number(n);
        },
        getRange: (...args: unknown[]) => {
          if (typeof args[0] === 'string') {
            const r = a1ToRC(args[0]);
            return this.range(r.row, r.col, r.rows, r.cols);
          }
          return this.range(Number(args[0]), Number(args[1]), Number(args[2] ?? 1), Number(args[3] ?? 1));
        },
        getBandings: () => [],
        getFilter: () => null,
        getProtections: () => [],
        getCharts: () => [...this.charts],
        removeChart: (chart: unknown) => {
          this.charts = this.charts.filter((c) => c !== chart);
        },
        insertChart: (chart: unknown) => {
          this.charts.push(chart);
        },
        newChart: () => chain({ build: () => ({ chart: true }) }),
        protect: () => chain({}),
      },
      (name) => this.calls.push(name),
    );
  }

  range(row: number, col: number, rows: number, cols: number): Obj {
    const self: Obj = chain({
      getRow: () => row,
      getColumn: () => col,
      getNumRows: () => rows,
      getNumColumns: () => cols,
      setValues: (values: unknown) => {
        (values as unknown[][]).forEach((line, r) => line.forEach((v, c) => this.set(row + r, col + c, v)));
        return self;
      },
      setValue: (value: unknown) => {
        this.set(row, col, value);
        return self;
      },
      setFormula: (formula: unknown) => {
        this.set(row, col, formula);
        return self;
      },
      getValues: () =>
        Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => this.get(row + r, col + c))),
      getValue: () => this.get(row, col),
      clear: () => {
        for (const key of [...this.cells.keys()]) this.cells.delete(key);
        this.formulas = [];
        return self;
      },
      createTextFinder: (text: unknown) => {
        const finder: Obj = {
          matchEntireCell: () => finder,
          findNext: () => {
            for (let r = row; r < row + rows; r++) {
              for (let c = col; c < col + cols; c++) {
                if (String(this.get(r, c)) === String(text)) return this.range(r, c, 1, 1);
              }
            }
            return null;
          },
        };
        return finder;
      },
    });
    return self;
  }
}

class FakeSpreadsheet {
  sheets: FakeSheet[] = [new FakeSheet('Hoja 1')];
  name = 'Hoja de cálculo sin título';
  timeZone = 'America/New_York';
  locale = 'en_US';

  api(): Obj {
    return chain({
      getId: () => 'SHEET_ID_123',
      getUrl: () => 'https://docs.google.com/spreadsheets/d/SHEET_ID_123/edit',
      getName: () => this.name,
      rename: (name: unknown) => {
        this.name = String(name);
      },
      setSpreadsheetTimeZone: (tz: unknown) => {
        this.timeZone = String(tz);
      },
      setSpreadsheetLocale: (locale: unknown) => {
        this.locale = String(locale);
      },
      getSheetByName: (name: unknown) => this.sheets.find((s) => s.name === name)?.api() ?? null,
      insertSheet: (name: unknown, index: unknown) => {
        const sheet = new FakeSheet(String(name));
        this.sheets.splice(Number(index ?? this.sheets.length), 0, sheet);
        return sheet.api();
      },
      getSheets: () => this.sheets.map((s) => s.api()),
      deleteSheet: (api: unknown) => {
        const name = (api as { getName: () => string }).getName();
        this.sheets = this.sheets.filter((s) => s.name !== name);
      },
    });
  }

  sheet(name: string): FakeSheet {
    const found = this.sheets.find((s) => s.name === name);
    if (!found) throw new Error(`Falta la pestaña ${name}`);
    return found;
  }
}

type Mail = { to: string; subject: string; body: string; htmlBody: string; replyTo: string; name: string };

type Gas = {
  ctx: vm.Context;
  ss: FakeSpreadsheet;
  props: Map<string, string>;
  cache: Map<string, string>;
  mails: Mail[];
  quota: { value: number };
  locks: { taken: number; released: number };
  call: <T = unknown>(name: string, ...args: unknown[]) => T;
};

function formatDate(date: Date, tz: string, pattern: string): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return pattern
    .replace('yyyy', parts.year)
    .replace('MM', parts.month)
    .replace('dd', parts.day)
    .replace('HH', parts.hour)
    .replace('mm', parts.minute);
}

function createGas(): Gas {
  const ss = new FakeSpreadsheet();
  const props = new Map<string, string>();
  const cache = new Map<string, string>();
  const mails: Mail[] = [];
  const quota = { value: 100 };
  const locks = { taken: 0, released: 0 };
  const any = chain({});

  const sandbox: Obj = {
    console: { log: () => undefined, error: () => undefined, info: () => undefined, warn: () => undefined },
    Logger: { log: () => undefined },
    SpreadsheetApp: chain({
      getActiveSpreadsheet: () => ss.api(),
      openById: (id: unknown) => {
        if (id !== 'SHEET_ID_123') throw new Error('ID desconocido');
        return ss.api();
      },
      flush: () => undefined,
      getUi: () => {
        throw new Error('Sin interfaz en los tests');
      },
      newDataValidation: () => any,
      newConditionalFormatRule: () => any,
      WrapStrategy: { CLIP: 'CLIP' },
      BandingTheme: { LIGHT_GREY: 'LIGHT_GREY' },
      ProtectionType: { RANGE: 'RANGE', SHEET: 'SHEET' },
      BorderStyle: { SOLID: 'SOLID' },
    }),
    Charts: { ChartType: { COLUMN: 'COLUMN' } },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key: string) => props.get(key) ?? null,
        setProperty: (key: string, value: string) => {
          props.set(key, String(value));
        },
      }),
    },
    CacheService: {
      getScriptCache: () => ({
        get: (key: string) => cache.get(key) ?? null,
        put: (key: string, value: string, seconds: number) => {
          if (seconds > 21600) throw new Error('CacheService admite como máximo 21600 s');
          cache.set(key, value);
        },
      }),
    },
    LockService: {
      getScriptLock: () => ({
        tryLock: () => {
          locks.taken++;
          return true;
        },
        releaseLock: () => {
          locks.released++;
        },
      }),
    },
    MailApp: {
      getRemainingDailyQuota: () => quota.value,
      sendEmail: (message: Mail) => {
        quota.value--;
        mails.push(message);
      },
    },
    ContentService: {
      MimeType: { JSON: 'JSON' },
      createTextOutput: (content: string) => {
        const out = { content, mime: '', setMimeType: (m: string) => ((out.mime = m), out), getContent: () => content };
        return out;
      },
    },
    Utilities: {
      getUuid: () => crypto.randomUUID(),
      formatDate,
      parseDate: (value: string) => new Date(`${value}T00:00:00+01:00`),
    },
    Session: { getScriptTimeZone: () => 'Europe/Madrid' },
  };
  const ctx = vm.createContext(sandbox);
  vm.runInContext(`${CODE}\n;globalThis.__test = { CONFIG, COLUMNS, COL, NCOL, PROVINCIAS };`, ctx, { filename: 'Code.gs' });
  const call = <T,>(name: string, ...args: unknown[]): T => (ctx[name] as Fn)(...args) as T;
  return { ctx, ss, props, cache, mails, quota, locks, call };
}

const madridToday = () => formatDate(new Date(), 'Europe/Madrid', 'yyyy-MM-dd');
const addDays = (date: string, days: number) => new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);

function payload(secret: string, overrides: Obj = {}): Obj {
  const today = madridToday();
  return {
    secret,
    id: crypto.randomUUID(),
    tipoEvento: 'Mercado navideño',
    fechaInicio: addDays(today, 30),
    fechaFin: addDays(today, 42),
    localidad: 'Madrid',
    provincia: 'Madrid',
    casetas: 4,
    comentarios: 'Acceso por la calle Mayor.',
    nombre: 'Lucía Martín',
    telefono: '+34 600 123 456',
    email: 'Lucia@Example.com',
    empresa: '',
    consentimiento: true,
    consentimientoFecha: '2026-10-20T10:00:00.000Z',
    politicaVersion: '2026-10',
    pagina: '/contacto',
    landing: '/',
    referrer: 'google.com',
    utmSource: 'instagram',
    dispositivo: 'móvil',
    website: '',
    ...overrides,
  };
}

function post(gas: Gas, body: unknown): Obj {
  const out = gas.call<{ getContent: () => string; mime: string }>('doPost', {
    postData: { contents: typeof body === 'string' ? body : JSON.stringify(body) },
  });
  expect(out.mime).toBe('JSON');
  return JSON.parse(out.getContent()) as Obj;
}

let gas: Gas;
let secret: string;
let col: Record<string, number>;

beforeEach(() => {
  gas = createGas();
  gas.call('setup');
  secret = gas.props.get('SECRETO') ?? '';
  col = (gas.ctx.__test as { COL: Record<string, number> }).COL;
});

describe('Apps Script: setup', () => {
  it('crea las pestañas, la cabecera en el orden pedido y la configuración regional', () => {
    const titles = gas.ss.sheet('Solicitudes').rowValues(1);
    expect(titles).toEqual([
      'Nº', 'Recibido', 'Estado', 'Nombre', 'Teléfono', 'Email', 'Empresa', 'Tipo de evento', 'Detalle del evento',
      'Fecha inicio', 'Fecha fin', 'Días', 'Localidad', 'Provincia', 'Nº de casetas', 'Comentarios', 'Página de origen',
      'Landing', 'Referrer', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'Dispositivo',
      'Acepta privacidad', 'Fecha consentimiento', 'Versión política', 'ID solicitud', 'Notas internas', 'Último contacto',
    ]);
    expect(gas.ss.sheets.map((s) => s.name)).toEqual(['Solicitudes', 'Panel']);
    expect(gas.ss.name).toBe('Casetas Maderik · Solicitudes');
    expect(gas.ss.timeZone).toBe('Europe/Madrid');
    expect(gas.ss.locale).toBe('es_ES');
    expect(secret).toMatch(/^[0-9a-f]{64}$/);
    expect(gas.props.get('SPREADSHEET_ID')).toBe('SHEET_ID_123');
    expect(gas.ss.sheet('Solicitudes').maxColumns).toBeGreaterThanOrEqual(31);
  });

  it('es idempotente: no duplica el gráfico ni cambia el secreto', () => {
    gas.call('setup');
    gas.call('setup');
    expect(gas.ss.sheet('Panel').charts).toHaveLength(1);
    expect(gas.props.get('SECRETO')).toBe(secret);
    expect(gas.ss.sheets).toHaveLength(2);
  });

  it('el panel usa fórmulas vivas en sintaxis inglesa con comas', () => {
    const formulas = gas.ss.sheet('Panel').formulas.map((f) => f.formula);
    expect(formulas.length).toBeGreaterThan(60);
    for (const formula of formulas) {
      expect(formula.startsWith('=')).toBe(true);
      expect(formula).not.toContain(';');
    }
    const all = formulas.join('\n');
    for (const fn of ['COUNT(', 'COUNTIFS(', 'COUNTIF(', 'SUMIF(', 'SUMIFS(', 'EOMONTH(', 'EDATE(', 'QUERY(', 'FILTER(', 'SORT(', 'TODAY()']) {
      expect(all).toContain(fn);
    }
    expect(all).toContain('"Perdido"');
    expect(all).toContain('"Reservado"');
  });

  it('el manifiesto fija Madrid, V8 y la aplicación web pública ejecutada por el propietario', () => {
    expect(MANIFEST).toMatchObject({
      timeZone: 'Europe/Madrid',
      runtimeVersion: 'V8',
      webapp: { executeAs: 'USER_DEPLOYING', access: 'ANYONE_ANONYMOUS' },
    });
  });

  it('doGet responde { ok: true }', () => {
    const out = gas.call<{ getContent: () => string }>('doGet');
    expect(JSON.parse(out.getContent())).toEqual({ ok: true });
  });
});

describe('Apps Script: doPost', () => {
  it('guarda la fila, asigna el número 1 y envía los dos emails', () => {
    const body = payload(secret, { tipoEvento: 'Otro', tipoEventoOtro: 'Feria medieval', empresa: 'Asociación Centro' });
    expect(post(gas, body)).toEqual({ ok: true, numero: 1 });

    const sheet = gas.ss.sheet('Solicitudes');
    const row = sheet.rowValues(2);
    expect(row[col.numero - 1]).toBe(1);
    expect(row[col.estado - 1]).toBe('Nuevo');
    expect(row[col.nombre - 1]).toBe('Lucía Martín');
    expect(row[col.telefono - 1]).toBe("'+34 600 123 456");
    expect(row[col.email - 1]).toBe('lucia@example.com');
    expect(row[col.detalleEvento - 1]).toBe('Feria medieval');
    expect(row[col.fechaInicio - 1]).toBeInstanceOf(Date);
    expect(row[col.dias - 1]).toBe('=IF(AND(ISNUMBER(J2),ISNUMBER(K2)),K2-J2+1,"")');
    expect(row[col.aceptaPrivacidad - 1]).toBe('Sí');
    expect(row[col.politicaVersion - 1]).toBe('2026-10');
    expect(row[col.id - 1]).toBe(body.id);
    expect(gas.locks).toEqual({ taken: 1, released: 1 });

    expect(gas.mails).toHaveLength(2);
    const [internal, client] = gas.mails;
    expect(internal.to).toBe('info@casetasmaderik.es');
    expect(internal.subject).toBe('Nueva solicitud 1 · Feria medieval · 4 casetas · Madrid');
    expect(internal.replyTo).toBe('lucia@example.com');
    for (const button of ['Llamar', 'WhatsApp', 'Responder', 'Abrir hoja']) expect(internal.htmlBody).toContain(`>${button}</a>`);
    expect(internal.htmlBody).toContain('tel:+34600123456');
    expect(internal.htmlBody).toContain('https://wa.me/34600123456');
    expect(internal.htmlBody).toContain('#gid=');
    expect(internal.htmlBody).toContain('#FBF8F3');
    expect(client.to).toBe('lucia@example.com');
    expect(client.name).toBe('Casetas Maderik');
    expect(client.replyTo).toBe('info@casetasmaderik.es');
    expect(client.subject).toContain('1');
  });

  it('rechaza un secreto incorrecto sin guardar nada', () => {
    expect(post(gas, payload('otro-secreto'))).toEqual({ ok: false, error: 'unauthorized' });
    expect(gas.ss.sheet('Solicitudes').rowValues(2).every((v) => v === '')).toBe(true);
    expect(gas.mails).toHaveLength(0);
  });

  it('campo trampa relleno: responde ok sin guardar', () => {
    expect(post(gas, payload(secret, { website: 'http://spam.example' }))).toEqual({ ok: true, numero: 0 });
    expect(gas.ss.sheet('Solicitudes').rowValues(2).every((v) => v === '')).toBe(true);
    expect(gas.mails).toHaveLength(0);
  });

  it('valida con las mismas reglas que la web', () => {
    const today = madridToday();
    const res = post(
      gas,
      payload(secret, {
        tipoEvento: 'Otro',
        tipoEventoOtro: '',
        fechaInicio: addDays(today, -10),
        fechaFin: addDays(today, -12),
        provincia: 'Narnia',
        casetas: 201,
        telefono: '1234',
        email: 'sin-arroba',
        consentimiento: false,
        dispositivo: 'nevera',
      }),
    );
    expect(res.ok).toBe(false);
    expect(res.error).toBe('validation');
    expect(Object.keys(res.fields as Obj).sort()).toEqual(
      ['casetas', 'consentimiento', 'dispositivo', 'email', 'fechaFin', 'fechaInicio', 'provincia', 'telefono', 'tipoEventoOtro'].sort(),
    );
    const longRange = post(gas, payload(secret, { fechaFin: addDays(today, 30 + 365) }));
    expect((longRange.fields as Obj).fechaFin).toBe('El rango máximo es de 365 días.');
    expect(post(gas, payload(secret, { telefono: '(+34) 600-123-456' })).ok).toBe(true);
  });

  it('JSON roto o vacío: error sin excepción', () => {
    expect(post(gas, '{"id":')).toEqual({ ok: false, error: 'invalid_json' });
    expect(post(gas, '')).toEqual({ ok: false, error: 'empty_body' });
    expect(post(gas, '[1,2]')).toEqual({ ok: false, error: 'invalid_json' });
  });

  it('idempotencia: el mismo id devuelve el mismo número (caché y columna ID)', () => {
    const body = payload(secret);
    expect(post(gas, body)).toEqual({ ok: true, numero: 1 });
    expect(post(gas, body)).toMatchObject({ ok: true, numero: 1, duplicada: true });
    // Caché caducada: se encuentra por la columna ID
    gas.cache.clear();
    expect(post(gas, body)).toMatchObject({ ok: true, numero: 1, duplicada: true });
    expect(gas.ss.sheet('Solicitudes').get(3, 1)).toBe('');
    expect(gas.mails).toHaveLength(2);
  });

  it('número correlativo que nunca se repite aunque se borren filas', () => {
    expect(post(gas, payload(secret)).numero).toBe(1);
    expect(post(gas, payload(secret)).numero).toBe(2);
    const sheet = gas.ss.sheet('Solicitudes');
    // Se borran las dos filas: el contador de Script Properties manda
    for (const key of [...sheet.cells.keys()]) if (!key.startsWith('1:')) sheet.cells.delete(key);
    expect(post(gas, payload(secret)).numero).toBe(3);
    // Una fila añadida a mano con un número mayor: se respeta el máximo de la columna
    sheet.set(5, 1, 50);
    expect(post(gas, payload(secret)).numero).toBe(51);
    expect(gas.props.get('ULTIMO_NUMERO')).toBe('51');
  });

  it('protege contra inyección de fórmulas con un apóstrofo', () => {
    post(
      gas,
      payload(secret, {
        nombre: '=HYPERLINK("http://malo","x")',
        empresa: '@SUM(1)',
        localidad: '-Madrid',
        comentarios: '+cmd|calc',
        referrer: '=1+1',
      }),
    );
    const row = gas.ss.sheet('Solicitudes').rowValues(2);
    expect(row[col.nombre - 1]).toBe('\'=HYPERLINK("http://malo","x")');
    expect(row[col.empresa - 1]).toBe("'@SUM(1)");
    expect(row[col.localidad - 1]).toBe("'-Madrid");
    expect(row[col.comentarios - 1]).toBe("'+cmd|calc");
    expect(row[col.referrer - 1]).toBe("'=1+1");
    // La única fórmula de la fila es la de Días
    const formulas = gas.ss.sheet('Solicitudes').formulas.filter((f) => f.cell.startsWith('2:'));
    expect(formulas.map((f) => f.cell)).toEqual([`2:${col.dias}`]);
  });

  it('escapa el HTML de los emails', () => {
    post(gas, payload(secret, { nombre: '<b>Ana</b> Ruiz', comentarios: '<script>alert(1)</script>' }));
    const html = gas.mails[0].htmlBody;
    expect(html).toContain('&lt;b&gt;Ana&lt;/b&gt; Ruiz');
    expect(html).not.toContain('<script>');
  });

  it('sin cuota de MailApp la solicitud se guarda igualmente', () => {
    gas.quota.value = 0;
    expect(post(gas, payload(secret))).toEqual({ ok: true, numero: 1 });
    expect(gas.mails).toHaveLength(0);
    expect(gas.ss.sheet('Solicitudes').get(2, 1)).toBe(1);
  });

  it('amplía la hoja al acercarse al límite de filas', () => {
    const sheet = gas.ss.sheet('Solicitudes');
    sheet.maxRows = 40;
    expect(post(gas, payload(secret)).ok).toBe(true);
    expect(sheet.maxRows).toBe(540);
    expect(sheet.insertedRows).toBeGreaterThanOrEqual(500);
  });

  it('testSolicitud crea una fila "Prueba (borrar)"', () => {
    const result = gas.call<Obj>('testSolicitud');
    expect(result).toMatchObject({ ok: true, numero: 1 });
    expect(gas.ss.sheet('Solicitudes').get(2, col.nombre)).toBe('Prueba (borrar)');
    expect(gas.call<string>('mostrarSecreto')).toBe(secret);
  });
});
