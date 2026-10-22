/**
 * Casetas Maderik · Solicitudes de presupuesto
 *
 * Google Apps Script vinculado a la hoja "Casetas Maderik · Solicitudes".
 * Recibe las solicitudes del formulario de https://casetasmaderik.es (a través
 * de /api/presupuesto en Vercel), las guarda en la pestaña "Solicitudes",
 * avisa por email a info@casetasmaderik.es y mantiene un "Panel" con métricas
 * en fórmulas vivas.
 *
 * Funciones públicas (menú "Casetas Maderik" y editor):
 *   setup()           Crea o repara la hoja. Se puede ejecutar siempre que haga falta.
 *   onOpen()          Añade el menú.
 *   doPost(e)         Recibe una solicitud (aplicación web).
 *   doGet()           Comprobación de estado: { ok: true }.
 *   testSolicitud()   Crea una solicitud de prueba con el nombre "Prueba (borrar)".
 *   mostrarSecreto()  Muestra el secreto que hay que copiar en Vercel.
 *
 * Las funciones que terminan en guion bajo son privadas: no aparecen en el
 * menú de ejecución ni se pueden llamar desde fuera.
 */

/* ------------------------------------------------------------------ */
/* Configuración                                                       */
/* ------------------------------------------------------------------ */

const CONFIG = {
  spreadsheetName: 'Casetas Maderik · Solicitudes',
  sheetName: 'Solicitudes',
  panelName: 'Panel',
  timeZone: 'Europe/Madrid',
  locale: 'es_ES',
  notifyEmail: 'info@casetasmaderik.es',
  senderName: 'Casetas Maderik',
  // Email de confirmación al cliente (true para enviarlo, false para no enviarlo)
  sendClientConfirmation: false,
  // Solo para testSolicitud(): sus emails van únicamente aquí, nunca al buzón
  // de avisos ni al email del cliente. Vacío: la prueba no envía ningún email.
  testEmail: 'aaswebmarketing@gmail.com',
  responseTime: 'menos de 24 horas laborables',
  phoneDisplay: '+34 656 32 41 23',
  phoneE164: '+34656324123',
  whatsappNumber: '34656324123',
  siteUrl: 'https://casetasmaderik.es',
  // Idempotencia: CacheService guarda como máximo 6 horas (21.600 s)
  idempotencySeconds: 21600,
  initialRows: 1000,
  minFreeRows: 50,
  growRows: 500,
  lockTimeoutMs: 20000,
  colors: {
    wood: '#98603E',
    woodDark: '#6E4329',
    cream: '#FBF8F3',
    paper: '#F3EDE4',
    sand: '#E6DCCF',
    ink: '#0E1615',
    stone: '#5E6461',
    white: '#FFFFFF',
  },
};

const PROP = {
  secret: 'SECRETO',
  spreadsheetId: 'SPREADSHEET_ID',
  lastNumber: 'ULTIMO_NUMERO',
};

const ESTADOS = ['Nuevo', 'Contactado', 'Presupuesto enviado', 'Reservado', 'Perdido'];

const ESTADO_COLORES = {
  Nuevo: { bg: '#F6E3D3', fg: '#6E4329' },
  Contactado: { bg: '#E2ECF5', fg: '#1D4F7A' },
  'Presupuesto enviado': { bg: '#FCF0C8', fg: '#6F5100' },
  Reservado: { bg: '#DDEFE1', fg: '#1F6233' },
  Perdido: { bg: '#ECECEC', fg: '#5F5F5F' },
};

const TIPOS_EVENTO = [
  'Mercado navideño',
  'Feria o bazar',
  'Festival gastronómico',
  'Evento corporativo',
  'Evento privado',
  'Otro',
];

const PROVINCIAS = [
  'A Coruña', 'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz', 'Barcelona',
  'Bizkaia', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ceuta', 'Ciudad Real', 'Córdoba',
  'Cuenca', 'Gipuzkoa', 'Girona', 'Granada', 'Guadalajara', 'Huelva', 'Huesca', 'Illes Balears', 'Jaén',
  'La Rioja', 'Las Palmas', 'León', 'Lleida', 'Lugo', 'Madrid', 'Málaga', 'Melilla', 'Murcia', 'Navarra',
  'Ourense', 'Palencia', 'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife', 'Segovia', 'Sevilla', 'Soria',
  'Tarragona', 'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Zamora', 'Zaragoza', 'Fuera de España',
];

const DISPOSITIVOS = ['móvil', 'tablet', 'escritorio'];

const LIMITES = {
  casetasMin: 1,
  casetasMax: 200,
  maxRangeDays: 365,
  nombreMax: 100,
  localidadMax: 100,
  empresaMax: 120,
  comentariosMax: 1000,
  otroMax: 80,
};

/** Columnas de la pestaña Solicitudes, en este orden. */
const COLUMNS = [
  { key: 'numero', title: 'Nº', width: 64, format: '0', align: 'center' },
  { key: 'recibido', title: 'Recibido', width: 136, format: 'dd/mm/yyyy hh:mm' },
  { key: 'estado', title: 'Estado', width: 160 },
  { key: 'nombre', title: 'Nombre', width: 190 },
  { key: 'telefono', title: 'Teléfono', width: 140 },
  { key: 'email', title: 'Email', width: 220 },
  { key: 'empresa', title: 'Empresa', width: 180 },
  { key: 'tipoEvento', title: 'Tipo de evento', width: 170 },
  { key: 'detalleEvento', title: 'Detalle del evento', width: 180 },
  { key: 'fechaInicio', title: 'Fecha inicio', width: 104, format: 'dd/mm/yyyy', align: 'center' },
  { key: 'fechaFin', title: 'Fecha fin', width: 104, format: 'dd/mm/yyyy', align: 'center' },
  { key: 'dias', title: 'Días', width: 60, format: '0', align: 'center' },
  { key: 'localidad', title: 'Localidad', width: 150 },
  { key: 'provincia', title: 'Provincia', width: 140 },
  { key: 'casetas', title: 'Nº de casetas', width: 104, format: '0', align: 'center' },
  { key: 'comentarios', title: 'Comentarios', width: 300 },
  { key: 'pagina', title: 'Página de origen', width: 140 },
  { key: 'landing', title: 'Landing', width: 140 },
  { key: 'referrer', title: 'Referrer', width: 150 },
  { key: 'utmSource', title: 'utm_source', width: 120 },
  { key: 'utmMedium', title: 'utm_medium', width: 120 },
  { key: 'utmCampaign', title: 'utm_campaign', width: 140 },
  { key: 'utmTerm', title: 'utm_term', width: 120 },
  { key: 'utmContent', title: 'utm_content', width: 120 },
  { key: 'dispositivo', title: 'Dispositivo', width: 104 },
  { key: 'aceptaPrivacidad', title: 'Acepta privacidad', width: 120, align: 'center' },
  { key: 'consentimientoFecha', title: 'Fecha consentimiento', width: 150, format: 'dd/mm/yyyy hh:mm' },
  { key: 'politicaVersion', title: 'Versión política', width: 110, align: 'center' },
  { key: 'id', title: 'ID solicitud', width: 290 },
  { key: 'notas', title: 'Notas internas', width: 280 },
  { key: 'ultimoContacto', title: 'Último contacto', width: 120, format: 'dd/mm/yyyy', align: 'center' },
];

const NCOL = COLUMNS.length;

/** Índice (desde 1) de cada columna por su clave. */
const COL = COLUMNS.reduce(function (acc, column, index) {
  acc[column.key] = index + 1;
  return acc;
}, {});

/* ------------------------------------------------------------------ */
/* Menú                                                                */
/* ------------------------------------------------------------------ */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Casetas Maderik')
    .addItem('Configurar o reparar la hoja', 'setup')
    .addItem('Enviar solicitud de prueba', 'testSolicitud')
    .addSeparator()
    .addItem('Ver secreto de conexión', 'mostrarSecreto')
    .addToUi();
}

/* ------------------------------------------------------------------ */
/* Configuración de la hoja (idempotente)                              */
/* ------------------------------------------------------------------ */

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Abre la hoja y ejecuta setup desde el menú Extensiones > Apps Script.');
  const props = PropertiesService.getScriptProperties();

  if (ss.getName() !== CONFIG.spreadsheetName) ss.rename(CONFIG.spreadsheetName);
  ss.setSpreadsheetTimeZone(CONFIG.timeZone);
  ss.setSpreadsheetLocale(CONFIG.locale);

  ensureSecret_(props);
  props.setProperty(PROP.spreadsheetId, ss.getId());

  const sheet = setupSolicitudes_(ss);
  setupPanel_(ss);
  removeDefaultSheets_(ss);
  syncCounter_(sheet, props);

  ss.setActiveSheet(sheet);
  ss.toast('Hoja configurada. Ya puedes implementar la aplicación web.', 'Casetas Maderik', 6);
  return 'ok';
}

function setupSolicitudes_(ss) {
  let sheet = ss.getSheetByName(CONFIG.sheetName);
  if (!sheet) sheet = ss.insertSheet(CONFIG.sheetName, 0);

  if (sheet.getMaxColumns() < NCOL) sheet.insertColumnsAfter(sheet.getMaxColumns(), NCOL - sheet.getMaxColumns());
  if (sheet.getMaxRows() < CONFIG.initialRows) {
    sheet.insertRowsAfter(sheet.getMaxRows(), CONFIG.initialRows - sheet.getMaxRows());
  }

  const header = sheet.getRange(1, 1, 1, NCOL);
  header
    .setValues([COLUMNS.map(function (c) { return c.title; })])
    .setBackground(CONFIG.colors.wood)
    .setFontColor(CONFIG.colors.white)
    .setFontWeight('bold')
    .setVerticalAlignment('middle')
    .setHorizontalAlignment('left')
    .setWrap(true);
  sheet.setRowHeight(1, 40);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(COL.nombre);
  COLUMNS.forEach(function (column, index) {
    sheet.setColumnWidth(index + 1, column.width);
  });
  sheet.setTabColor(CONFIG.colors.wood);

  applyBodyFormatting_(sheet);
  protectHeader_(sheet);
  return sheet;
}

/**
 * Formatos del cuerpo: números y fechas, desplegable de estado, formato
 * condicional, bandas y filtro. Se vuelve a aplicar cuando la hoja crece.
 */
function applyBodyFormatting_(sheet) {
  const maxRows = sheet.getMaxRows();
  const rows = maxRows - 1;
  const body = sheet.getRange(2, 1, rows, NCOL);
  body.setVerticalAlignment('middle').setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

  COLUMNS.forEach(function (column, index) {
    const range = sheet.getRange(2, index + 1, rows, 1);
    if (column.format) range.setNumberFormat(column.format);
    if (column.align) range.setHorizontalAlignment(column.align);
  });

  sheet
    .getRange(2, COL.estado, rows, 1)
    .setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInList(ESTADOS, true)
        .setAllowInvalid(false)
        .setHelpText('Elige un estado de la lista.')
        .build(),
    );
  sheet
    .getRange(2, COL.ultimoContacto, rows, 1)
    .setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireDate()
        .setAllowInvalid(false)
        .setHelpText('Escribe una fecha (dd/mm/aaaa) o haz doble clic para elegirla.')
        .build(),
    );

  setConditionalRules_(sheet, rows);

  sheet.getBandings().forEach(function (banding) {
    banding.remove();
  });
  sheet
    .getRange(1, 1, maxRows, NCOL)
    .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false)
    .setHeaderRowColor(CONFIG.colors.wood)
    .setFirstRowColor(CONFIG.colors.white)
    .setSecondRowColor(CONFIG.colors.cream);

  ensureFilter_(sheet, maxRows);
}

/** Colores por estado y filas en "Nuevo" en negrita. */
function setConditionalRules_(sheet, rows) {
  const estadoRange = sheet.getRange(2, COL.estado, rows, 1);
  const rowRange = sheet.getRange(2, 1, rows, NCOL);
  const estadoCol = colLetter_(COL.estado);
  // En Sheets solo se aplica la primera regla que se cumple en cada celda:
  // primero los colores del estado (el de "Nuevo" también en negrita) y después la fila
  const rules = ESTADOS.map(function (estado) {
    const colors = ESTADO_COLORES[estado];
    const builder = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(estado)
      .setBackground(colors.bg)
      .setFontColor(colors.fg)
      .setRanges([estadoRange]);
    if (estado === 'Nuevo') builder.setBold(true);
    return builder.build();
  });
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$' + estadoCol + '2="Nuevo"')
      .setBold(true)
      .setRanges([rowRange])
      .build(),
  );
  sheet.setConditionalFormatRules(rules);
}

/** Filtro sobre todas las filas. Si la hoja crece, se rehace conservando los criterios. */
function ensureFilter_(sheet, maxRows) {
  const range = sheet.getRange(1, 1, maxRows, NCOL);
  const filter = sheet.getFilter();
  if (!filter) {
    range.createFilter();
    return;
  }
  const current = filter.getRange();
  if (current.getRow() === 1 && current.getColumn() === 1 && current.getNumRows() === maxRows && current.getNumColumns() === NCOL) {
    return;
  }
  const criteria = {};
  for (let column = 1; column <= NCOL; column++) {
    const value = filter.getColumnFilterCriteria(column);
    if (value) criteria[column] = value.copy().build();
  }
  filter.remove();
  const created = range.createFilter();
  Object.keys(criteria).forEach(function (column) {
    created.setColumnFilterCriteria(Number(column), criteria[column]);
  });
}

/** Protección de la cabecera: solo avisa, no bloquea. */
function protectHeader_(sheet) {
  const description = 'Cabecera de Solicitudes: el script depende de estos títulos';
  const range = sheet.getRange(1, 1, 1, NCOL);
  const existing = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE).filter(function (p) {
    return p.getDescription() === description;
  });
  const protection = existing.length > 0 ? existing[0] : range.protect();
  protection.setRange(range).setDescription(description).setWarningOnly(true);
  existing.slice(1).forEach(function (p) {
    p.remove();
  });
}

/** Borra la pestaña vacía que trae una hoja nueva ("Hoja 1", "Sheet1"...). */
function removeDefaultSheets_(ss) {
  const keep = [CONFIG.sheetName, CONFIG.panelName];
  ss.getSheets().forEach(function (sheet) {
    const name = sheet.getName();
    if (keep.indexOf(name) !== -1) return;
    const isDefault = /^(hoja|sheet|feuille|foglio|blatt|planilha|full|orria)\s?\d+$/i.test(name);
    if (isDefault && sheet.getLastRow() === 0 && sheet.getLastColumn() === 0 && ss.getSheets().length > 1) {
      ss.deleteSheet(sheet);
    }
  });
}

/** Si la hoja se acerca a su última fila, la amplía y extiende formatos, bandas y filtro. */
function ensureCapacity_(sheet) {
  const free = sheet.getMaxRows() - sheet.getLastRow();
  if (free >= CONFIG.minFreeRows) return false;
  sheet.insertRowsAfter(sheet.getMaxRows(), CONFIG.growRows);
  applyBodyFormatting_(sheet);
  return true;
}

/* ------------------------------------------------------------------ */
/* Panel con fórmulas vivas                                            */
/* ------------------------------------------------------------------ */

/*
 * Recuerda: setFormula usa siempre la sintaxis en inglés con comas, aunque la
 * hoja esté configurada en español.
 */
function setupPanel_(ss) {
  let panel = ss.getSheetByName(CONFIG.panelName);
  if (!panel) panel = ss.insertSheet(CONFIG.panelName, 1);

  // Se reconstruye entero: así setup se puede repetir sin duplicar nada
  panel.getCharts().forEach(function (chart) {
    panel.removeChart(chart);
  });
  const all = panel.getRange(1, 1, panel.getMaxRows(), panel.getMaxColumns());
  all.breakApart();
  all.clear();
  if (panel.getMaxRows() < 80) panel.insertRowsAfter(panel.getMaxRows(), 80 - panel.getMaxRows());
  if (panel.getMaxColumns() < 10) panel.insertColumnsAfter(panel.getMaxColumns(), 10 - panel.getMaxColumns());

  const c = CONFIG.colors;
  const S = CONFIG.sheetName;
  const ref = function (key) {
    const letter = colLetter_(COL[key]);
    return S + '!$' + letter + '$2:$' + letter;
  };
  const NUM = ref('numero');
  const REC = ref('recibido');
  const EST = ref('estado');
  const TIPO = ref('tipoEvento');
  const CAS = ref('casetas');
  const INI = ref('fechaInicio');
  const PROV = colLetter_(COL.provincia);
  const CASL = colLetter_(COL.casetas);
  const SRC = colLetter_(COL.utmSource);
  const REF = colLetter_(COL.referrer);

  panel.setHiddenGridlines(true);
  panel.getRange(1, 1, 80, 10).setBackground(c.cream).setFontFamily('Manrope').setFontColor(c.ink).setVerticalAlignment('middle');
  [24, 180, 120, 120, 190, 150, 190, 130, 110, 24].forEach(function (width, index) {
    panel.setColumnWidth(index + 1, width);
  });

  // Título
  panel.getRange('B2').setValue('Casetas Maderik · Panel de solicitudes').setFontFamily('Outfit').setFontSize(20);
  panel.getRange('B3').setValue('Se actualiza solo con fórmulas. No escribas en esta pestaña.').setFontColor(c.stone).setFontSize(10);

  // Contador grande
  label_(panel.getRange('B5'), 'Total de solicitudes');
  panel.getRange('B6:C7').merge();
  panel
    .getRange('B6')
    .setFormula('=COUNT(' + NUM + ')')
    .setFontFamily('Outfit')
    .setFontSize(48)
    .setFontColor(c.wood)
    .setHorizontalAlignment('left')
    .setNumberFormat('#,##0');
  panel.setRowHeight(6, 40);
  panel.setRowHeight(7, 30);

  // Actividad
  const activity = [
    ['D', 'Hoy', '=COUNTIFS(' + REC + ',">="&TODAY(),' + REC + ',"<"&(TODAY()+1))'],
    ['E', 'Últimos 7 días', '=COUNTIFS(' + REC + ',">="&(TODAY()-6),' + REC + ',"<"&(TODAY()+1))'],
    ['F', 'Este mes', '=COUNTIFS(' + REC + ',">="&(EOMONTH(TODAY(),-1)+1),' + REC + ',"<"&(EOMONTH(TODAY(),0)+1))'],
    ['G', 'Mes anterior', '=COUNTIFS(' + REC + ',">="&(EOMONTH(TODAY(),-2)+1),' + REC + ',"<"&(EOMONTH(TODAY(),-1)+1))'],
  ];
  activity.forEach(function (item) {
    label_(panel.getRange(item[0] + '5'), item[1]);
    kpi_(panel.getRange(item[0] + '6'), item[2], '#,##0');
  });

  // Casetas y cierre
  const totals = [
    ['B', 'Casetas solicitadas', '=SUM(' + CAS + ')', '#,##0'],
    ['C', 'Media por solicitud', '=IFERROR(AVERAGE(' + CAS + '),0)', '0.0'],
    ['D', 'Pendientes de contactar', '=COUNTIF(' + EST + ',"Nuevo")', '#,##0'],
    ['E', 'Reservas cerradas', '=COUNTIF(' + EST + ',"Reservado")', '#,##0'],
    ['F', 'Tasa de cierre', '=IFERROR(COUNTIF(' + EST + ',"Reservado")/COUNT(' + NUM + '),0)', '0.0%'],
  ];
  totals.forEach(function (item) {
    label_(panel.getRange(item[0] + '9'), item[1]);
    kpi_(panel.getRange(item[0] + '10'), item[2], item[3]);
  });

  // Por estado
  section_(panel.getRange('B13'), 'Por estado');
  tableHeader_(panel.getRange('B14:D14'), ['Estado', 'Solicitudes', 'Casetas']);
  ESTADOS.forEach(function (estado, i) {
    const row = 15 + i;
    panel.getRange('B' + row).setValue(estado);
    panel.getRange('C' + row).setFormula('=COUNTIF(' + EST + ',B' + row + ')');
    panel.getRange('D' + row).setFormula('=SUMIF(' + EST + ',B' + row + ',' + CAS + ')');
  });
  panel.getRange('C15:D19').setNumberFormat('#,##0').setHorizontalAlignment('right');

  // Por tipo de evento
  section_(panel.getRange('E13'), 'Por tipo de evento');
  tableHeader_(panel.getRange('E14:G14'), ['Tipo de evento', 'Solicitudes', 'Casetas']);
  TIPOS_EVENTO.forEach(function (tipo, i) {
    const row = 15 + i;
    panel.getRange('E' + row).setValue(tipo);
    panel.getRange('F' + row).setFormula('=COUNTIF(' + TIPO + ',E' + row + ')');
    panel.getRange('G' + row).setFormula('=SUMIF(' + TIPO + ',E' + row + ',' + CAS + ')');
  });
  panel.getRange('F15:G20').setNumberFormat('#,##0').setHorizontalAlignment('right');

  // Últimos 12 meses (columna I auxiliar y oculta con el primer día de cada mes)
  section_(panel.getRange('B23'), 'Últimos 12 meses');
  tableHeader_(panel.getRange('B24:D24'), ['Mes', 'Solicitudes', 'Casetas']);
  const months = '"ene","feb","mar","abr","may","jun","jul","ago","sept","oct","nov","dic"';
  for (let i = 0; i < 12; i++) {
    const row = 25 + i;
    panel.getRange('I' + row).setFormula(i === 0 ? '=EDATE(EOMONTH(TODAY(),-1)+1,-11)' : '=EDATE(I' + (row - 1) + ',1)');
    panel.getRange('B' + row).setFormula('=CHOOSE(MONTH(I' + row + '),' + months + ')&" "&YEAR(I' + row + ')');
    panel.getRange('C' + row).setFormula('=COUNTIFS(' + REC + ',">="&I' + row + ',' + REC + ',"<"&EDATE(I' + row + ',1))');
    panel.getRange('D' + row).setFormula('=SUMIFS(' + CAS + ',' + REC + ',">="&I' + row + ',' + REC + ',"<"&EDATE(I' + row + ',1))');
  }
  panel.getRange('I25:I36').setNumberFormat('dd/mm/yyyy');
  panel.getRange('C25:D36').setNumberFormat('#,##0').setHorizontalAlignment('right');
  panel.hideColumns(9);

  const chart = panel
    .newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(panel.getRange('B24:D36'))
    .setNumHeaders(1)
    .setPosition(23, 5, 0, 0)
    .setOption('title', 'Solicitudes y casetas por mes')
    .setOption('titleTextStyle', { color: c.ink, fontSize: 13, bold: false })
    .setOption('colors', [c.wood, '#C49A76'])
    .setOption('legend', { position: 'bottom', textStyle: { color: c.stone } })
    .setOption('backgroundColor', c.cream)
    .setOption('vAxis', { minValue: 0, format: '0', textStyle: { color: c.stone }, gridlines: { color: c.sand } })
    .setOption('hAxis', { textStyle: { color: c.stone } })
    .setOption('width', 600)
    .setOption('height', 300)
    .build();
  panel.insertChart(chart);

  // Top 10 provincias
  section_(panel.getRange('B39'), 'Top 10 provincias');
  tableHeader_(panel.getRange('B40:D40'), ['Provincia', 'Solicitudes', 'Casetas']);
  panel
    .getRange('B41')
    .setFormula(
      '=IFERROR(QUERY(' + S + '!$' + PROV + '$2:$' + CASL + ',"select ' + PROV + ', count(' + PROV + '), sum(' + CASL + ') where ' +
        PROV + " <> '' group by " + PROV + ' order by count(' + PROV + ') desc limit 10 label count(' + PROV + ") '', sum(" +
        CASL + ") ''\",0),\"Sin datos todavía\")",
    );

  // Origen
  section_(panel.getRange('E39'), 'Origen: utm_source');
  tableHeader_(panel.getRange('E40:F40'), ['Fuente', 'Solicitudes']);
  panel.getRange('E41').setFormula(originQuery_(S, SRC));
  section_(panel.getRange('G39'), 'Origen: referrer');
  tableHeader_(panel.getRange('G40:H40'), ['Web de origen', 'Solicitudes']);
  panel.getRange('G41').setFormula(originQuery_(S, REF));
  panel.getRange('E52').setValue('Sin origen (directo)').setFontColor(c.stone);
  panel
    .getRange('F52')
    .setFormula('=COUNTIFS(' + NUM + ',"<>",' + ref('utmSource') + ',"",' + ref('referrer') + ',"")')
    .setHorizontalAlignment('right');
  panel.getRange('C41:D50').setNumberFormat('#,##0').setHorizontalAlignment('right');
  panel.getRange('F41:F50').setNumberFormat('#,##0').setHorizontalAlignment('right');
  panel.getRange('H41:H50').setNumberFormat('#,##0').setHorizontalAlignment('right');

  // Próximos eventos: inicio igual o posterior a hoy y estado distinto de Perdido
  section_(panel.getRange('B55'), 'Próximos eventos');
  tableHeader_(panel.getRange('B56:H56'), ['Fecha inicio', 'Nº', 'Casetas', 'Nombre', 'Tipo de evento', 'Localidad', 'Estado']);
  const cols = [COL.fechaInicio, COL.numero, COL.casetas, COL.nombre, COL.tipoEvento, COL.localidad, COL.estado].join(',');
  const lastLetter = colLetter_(NCOL);
  panel
    .getRange('B57')
    .setFormula(
      '=IFERROR(ARRAY_CONSTRAIN(SORT(FILTER(CHOOSECOLS(' + S + '!$A$2:$' + lastLetter + ',' + cols + '),' + INI + '>=TODAY(),' +
        EST + '<>"Perdido",' + NUM + '<>""),1,TRUE),20,7),"Sin eventos próximos")',
    );
  panel.getRange('B57:B76').setNumberFormat('dd/mm/yyyy').setHorizontalAlignment('left');
  panel.getRange('C57:D76').setNumberFormat('0').setHorizontalAlignment('right');

  // Solo aviso si alguien intenta escribir en el panel
  const description = 'Panel: se rellena solo con fórmulas';
  const existing = panel.getProtections(SpreadsheetApp.ProtectionType.SHEET).filter(function (p) {
    return p.getDescription() === description;
  });
  const protection = existing.length > 0 ? existing[0] : panel.protect();
  protection.setDescription(description).setWarningOnly(true);

  panel.setTabColor(CONFIG.colors.ink);
  return panel;
}

function originQuery_(sheetName, letter) {
  return (
    '=IFERROR(QUERY(' + sheetName + '!$' + letter + '$2:$' + letter + ',"select ' + letter + ', count(' + letter + ') where ' +
    letter + " <> '' group by " + letter + ' order by count(' + letter + ') desc limit 10 label count(' + letter +
    ") ''\",0),\"Sin datos todavía\")"
  );
}

function label_(range, text) {
  range.setValue(text).setFontColor(CONFIG.colors.stone).setFontSize(10);
}

function kpi_(range, formula, format) {
  range.setFormula(formula).setNumberFormat(format).setFontFamily('Outfit').setFontSize(22).setHorizontalAlignment('left');
}

function section_(range, text) {
  range.setValue(text.toUpperCase()).setFontColor(CONFIG.colors.wood).setFontWeight('bold').setFontSize(10);
}

function tableHeader_(range, titles) {
  range
    .setValues([titles])
    .setFontWeight('bold')
    .setFontColor(CONFIG.colors.stone)
    .setFontSize(10)
    .setBorder(null, null, true, null, null, null, CONFIG.colors.sand, SpreadsheetApp.BorderStyle.SOLID);
}

/* ------------------------------------------------------------------ */
/* Aplicación web                                                      */
/* ------------------------------------------------------------------ */

function doGet() {
  return json_({ ok: true });
}

function doPost(e) {
  try {
    const body = e && e.postData && typeof e.postData.contents === 'string' ? e.postData.contents : '';
    if (!body) return json_({ ok: false, error: 'empty_body' });
    let data;
    try {
      data = JSON.parse(body);
    } catch (parseError) {
      return json_({ ok: false, error: 'invalid_json' });
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) return json_({ ok: false, error: 'invalid_json' });
    return json_(handleLead_(data, false));
  } catch (error) {
    console.error('doPost: ' + (error && error.stack ? error.stack : error));
    return json_({ ok: false, error: 'internal' });
  }
}

/**
 * Procesa una solicitud ya leída. Devuelve { ok: true, numero } o
 * { ok: false, error }. La usan doPost y testSolicitud. Con isTest = true
 * (solo testSolicitud, nunca una petición web) los emails van únicamente a
 * CONFIG.testEmail.
 */
function handleLead_(data, isTest) {
  const props = PropertiesService.getScriptProperties();

  // 1. Secreto compartido con Vercel
  const expected = props.getProperty(PROP.secret);
  if (!expected) return { ok: false, error: 'not_configured' };
  if (!safeEquals_(String(data.secret || ''), expected)) return { ok: false, error: 'unauthorized' };

  // 2. Campo trampa relleno: se responde ok y no se guarda nada
  if (typeof data.website === 'string' && data.website.trim() !== '') return { ok: true, numero: 0 };

  // 3. Normalización y validación (mismas reglas que el formulario)
  const lead = normalizeLead_(data);
  const errors = validateLead_(lead, todayMadrid_());
  if (Object.keys(errors).length > 0) return { ok: false, error: 'validation', fields: errors };

  // 4. Idempotencia: el mismo id devuelve el mismo número
  const cache = CacheService.getScriptCache();
  const cacheKey = 'solicitud:' + lead.id;
  const cached = cache.get(cacheKey);
  if (cached) return { ok: true, numero: Number(cached), duplicada: true };

  // 5. Bloqueo, número correlativo y alta de la fila
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(CONFIG.lockTimeoutMs)) return { ok: false, error: 'busy' };
  let numero;
  let row;
  let sheet;
  let ss;
  try {
    ss = getSpreadsheet_();
    sheet = getSolicitudesSheet_(ss);
    const existing = findById_(sheet, lead.id);
    if (existing) {
      cache.put(cacheKey, String(existing.numero), CONFIG.idempotencySeconds);
      return { ok: true, numero: existing.numero, duplicada: true };
    }
    ensureCapacity_(sheet);
    numero = nextNumber_(sheet, props);
    row = sheet.getLastRow() + 1;
    sheet.getRange(row, 1, 1, NCOL).setValues([buildRow_(lead, numero, row, new Date())]);
    SpreadsheetApp.flush();
    cache.put(cacheKey, String(numero), CONFIG.idempotencySeconds);
  } finally {
    lock.releaseLock();
  }

  // 6 y 7. Emails: si fallan, la solicitud ya está guardada. En una prueba
  // solo se envían a la dirección de pruebas, y si no hay, a nadie.
  const test = isTest === true;
  if (test && !CONFIG.testEmail) return { ok: true, numero: numero };
  try {
    sendInternalEmail_(lead, numero, ss, sheet, row, test ? CONFIG.testEmail : CONFIG.notifyEmail);
  } catch (error) {
    console.error('Email interno de la solicitud ' + numero + ': ' + error);
  }
  if (CONFIG.sendClientConfirmation) {
    try {
      sendClientEmail_(lead, numero, test ? CONFIG.testEmail : lead.email);
    } catch (error) {
      console.error('Email al cliente de la solicitud ' + numero + ': ' + error);
    }
  }

  return { ok: true, numero: numero };
}

/* ------------------------------------------------------------------ */
/* Pruebas y secreto                                                   */
/* ------------------------------------------------------------------ */

function testSolicitud() {
  const props = PropertiesService.getScriptProperties();
  const secret = ensureSecret_(props);
  if (!props.getProperty(PROP.spreadsheetId)) {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) props.setProperty(PROP.spreadsheetId, active.getId());
  }
  const today = todayMadrid_();
  const result = handleLead_({
    secret: secret,
    id: Utilities.getUuid(),
    tipoEvento: 'Mercado navideño',
    fechaInicio: addDays_(today, 30),
    fechaFin: addDays_(today, 33),
    localidad: 'Madrid',
    provincia: 'Madrid',
    casetas: 4,
    comentarios: 'Solicitud de prueba enviada desde el menú de la hoja.',
    nombre: 'Prueba (borrar)',
    telefono: CONFIG.phoneDisplay,
    email: CONFIG.testEmail || 'prueba@example.com',
    empresa: 'Casetas Maderik',
    consentimiento: true,
    consentimientoFecha: new Date().toISOString(),
    politicaVersion: 'prueba',
    pagina: '/contacto',
    landing: '/',
    referrer: '',
    utmSource: 'prueba',
    dispositivo: 'escritorio',
    website: '',
  }, true);
  const message = result.ok
    ? 'Solicitud de prueba creada con el número ' + result.numero + '. ' +
      (CONFIG.testEmail ? 'El aviso se ha enviado solo a ' + CONFIG.testEmail + '. ' : 'No se ha enviado ningún email. ') +
      'Borra la fila cuando quieras.'
    : 'No se ha podido crear la solicitud de prueba (' + result.error + '). Ejecuta primero "Configurar o reparar la hoja".';
  showMessage_('Solicitud de prueba', message);
  return result;
}

function mostrarSecreto() {
  const secret = ensureSecret_(PropertiesService.getScriptProperties());
  showMessage_(
    'Secreto de conexión',
    'Copia este valor en Vercel como variable de entorno APPS_SCRIPT_SECRET:\n\n' + secret + '\n\nNo lo compartas con nadie.',
  );
  return secret;
}

/* ------------------------------------------------------------------ */
/* Datos                                                               */
/* ------------------------------------------------------------------ */

function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty(PROP.spreadsheetId);
  if (id) return SpreadsheetApp.openById(id);
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) throw new Error('Falta el ID de la hoja: ejecuta "Configurar o reparar la hoja".');
  return active;
}

function getSolicitudesSheet_(ss) {
  return ss.getSheetByName(CONFIG.sheetName) || setupSolicitudes_(ss);
}

function findById_(sheet, id) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  const cell = sheet
    .getRange(2, COL.id, lastRow - 1, 1)
    .createTextFinder(id)
    .matchEntireCell(true)
    .findNext();
  if (!cell) return null;
  const row = cell.getRow();
  return { row: row, numero: Number(sheet.getRange(row, COL.numero).getValue()) || 0 };
}

/** Número correlativo: contador en Script Properties comprobado contra el máximo de la columna. */
function nextNumber_(sheet, props) {
  const stored = Number(props.getProperty(PROP.lastNumber)) || 0;
  const next = Math.max(stored, maxNumber_(sheet)) + 1;
  props.setProperty(PROP.lastNumber, String(next));
  return next;
}

function maxNumber_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  return sheet
    .getRange(2, COL.numero, lastRow - 1, 1)
    .getValues()
    .reduce(function (max, row) {
      const n = Number(row[0]);
      return isFinite(n) && n > max ? n : max;
    }, 0);
}

/** Al configurar, el contador nunca queda por debajo del máximo de la hoja. */
function syncCounter_(sheet, props) {
  const stored = Number(props.getProperty(PROP.lastNumber)) || 0;
  const max = maxNumber_(sheet);
  if (max > stored) props.setProperty(PROP.lastNumber, String(max));
}

function buildRow_(lead, numero, row, received) {
  const values = new Array(NCOL).fill('');
  const set = function (key, value) {
    values[COL[key] - 1] = value;
  };
  const ini = colLetter_(COL.fechaInicio) + row;
  const fin = colLetter_(COL.fechaFin) + row;

  set('numero', numero);
  set('recibido', received);
  set('estado', 'Nuevo');
  set('nombre', safeText_(lead.nombre));
  // El teléfono siempre como texto: se ve "+34 ..." y no se pierden ceros
  set('telefono', "'" + lead.telefono);
  set('email', safeText_(lead.email));
  set('empresa', safeText_(lead.empresa));
  set('tipoEvento', lead.tipoEvento);
  set('detalleEvento', safeText_(lead.tipoEvento === 'Otro' ? lead.tipoEventoOtro : ''));
  set('fechaInicio', Utilities.parseDate(lead.fechaInicio, CONFIG.timeZone, 'yyyy-MM-dd'));
  set('fechaFin', Utilities.parseDate(lead.fechaFin, CONFIG.timeZone, 'yyyy-MM-dd'));
  set('dias', '=IF(AND(ISNUMBER(' + ini + '),ISNUMBER(' + fin + ')),' + fin + '-' + ini + '+1,"")');
  set('localidad', safeText_(lead.localidad));
  set('provincia', lead.provincia);
  set('casetas', lead.casetas);
  set('comentarios', safeText_(lead.comentarios));
  set('pagina', safeText_(lead.pagina));
  set('landing', safeText_(lead.landing));
  set('referrer', safeText_(lead.referrer));
  set('utmSource', safeText_(lead.utmSource));
  set('utmMedium', safeText_(lead.utmMedium));
  set('utmCampaign', safeText_(lead.utmCampaign));
  set('utmTerm', safeText_(lead.utmTerm));
  set('utmContent', safeText_(lead.utmContent));
  set('dispositivo', lead.dispositivo);
  set('aceptaPrivacidad', 'Sí');
  set('consentimientoFecha', lead.consentimientoFecha);
  set('politicaVersion', safeText_(lead.politicaVersion));
  set('id', lead.id);
  return values;
}

/* ------------------------------------------------------------------ */
/* Normalización y validación (mismas reglas que zod en la web)        */
/* ------------------------------------------------------------------ */

function cleanText_(value, max) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim().slice(0, max);
}

function cleanMultiline_(value, max) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

function normalizeLead_(data) {
  const consentDate = new Date(String(data.consentimientoFecha || ''));
  return {
    id: cleanText_(data.id, 64).toLowerCase(),
    tipoEvento: cleanText_(data.tipoEvento, 40),
    tipoEventoOtro: cleanText_(data.tipoEventoOtro, LIMITES.otroMax + 20),
    fechaInicio: cleanText_(data.fechaInicio, 10),
    fechaFin: cleanText_(data.fechaFin || data.fechaInicio, 10),
    localidad: cleanText_(data.localidad, LIMITES.localidadMax + 20),
    provincia: cleanText_(data.provincia, 40),
    casetas: Number(data.casetas),
    comentarios: cleanMultiline_(data.comentarios, LIMITES.comentariosMax + 50),
    nombre: cleanText_(data.nombre, LIMITES.nombreMax + 20),
    telefono: cleanText_(data.telefono, 30),
    email: cleanText_(data.email, 260).toLowerCase(),
    empresa: cleanText_(data.empresa, LIMITES.empresaMax + 20),
    consentimiento: data.consentimiento === true,
    consentimientoFecha: isNaN(consentDate.getTime()) ? new Date() : consentDate,
    politicaVersion: cleanText_(data.politicaVersion, 20),
    pagina: cleanText_(data.pagina, 300),
    landing: cleanText_(data.landing, 300),
    referrer: cleanText_(data.referrer, 200),
    utmSource: cleanText_(data.utmSource, 150),
    utmMedium: cleanText_(data.utmMedium, 150),
    utmCampaign: cleanText_(data.utmCampaign, 150),
    utmTerm: cleanText_(data.utmTerm, 150),
    utmContent: cleanText_(data.utmContent, 150),
    dispositivo: cleanText_(data.dispositivo, 20),
  };
}

/** Devuelve { campo: mensaje } con los errores encontrados. */
function validateLead_(lead, today) {
  const errors = {};
  const add = function (field, message) {
    if (!errors[field]) errors[field] = message;
  };

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(lead.id)) add('id', 'Identificador no válido.');
  if (TIPOS_EVENTO.indexOf(lead.tipoEvento) === -1) add('tipoEvento', 'Elige el tipo de evento.');
  if (lead.tipoEvento === 'Otro' && !lead.tipoEventoOtro) add('tipoEventoOtro', 'Cuéntanos qué evento es.');
  if (lead.tipoEventoOtro.length > LIMITES.otroMax) add('tipoEventoOtro', 'Máximo 80 caracteres.');

  const startOk = isValidDate_(lead.fechaInicio);
  const endOk = isValidDate_(lead.fechaFin);
  if (!startOk) add('fechaInicio', 'Indica una fecha válida.');
  // Un día de margen por la zona horaria del navegador
  else if (daysBetween_(today, lead.fechaInicio) < -1) add('fechaInicio', 'La fecha de inicio debe ser hoy o posterior.');
  if (!endOk) add('fechaFin', 'Indica una fecha válida.');
  if (startOk && endOk) {
    const days = daysBetween_(lead.fechaInicio, lead.fechaFin) + 1;
    if (days < 1) add('fechaFin', 'La fecha de fin debe ser igual o posterior a la de inicio.');
    else if (days > LIMITES.maxRangeDays) add('fechaFin', 'El rango máximo es de 365 días.');
  }

  if (!lead.localidad) add('localidad', 'Indica la localidad.');
  else if (lead.localidad.length > LIMITES.localidadMax) add('localidad', 'Máximo 100 caracteres.');
  if (PROVINCIAS.indexOf(lead.provincia) === -1) add('provincia', 'Elige una provincia.');

  if (!isFinite(lead.casetas) || Math.floor(lead.casetas) !== lead.casetas) add('casetas', 'Indica un número entero.');
  else if (lead.casetas < LIMITES.casetasMin || lead.casetas > LIMITES.casetasMax) add('casetas', 'Entre 1 y 200 casetas.');
  if (lead.comentarios.length > LIMITES.comentariosMax) add('comentarios', 'Máximo 1000 caracteres.');

  if (lead.nombre.length < 2) add('nombre', 'Indica tu nombre y apellidos.');
  else if (lead.nombre.length > LIMITES.nombreMax) add('nombre', 'Máximo 100 caracteres.');
  if (!isValidPhone_(lead.telefono)) add('telefono', 'Indica un teléfono válido.');
  if (lead.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) add('email', 'Indica un email válido.');
  if (lead.empresa.length > LIMITES.empresaMax) add('empresa', 'Máximo 120 caracteres.');
  if (!lead.consentimiento) add('consentimiento', 'Debes aceptar la política de privacidad.');
  if (DISPOSITIVOS.indexOf(lead.dispositivo) === -1) add('dispositivo', 'Dispositivo no válido.');
  return errors;
}

/** De 9 a 15 dígitos; admite +34, espacios, puntos, guiones y paréntesis. */
function isValidPhone_(value) {
  const flat = String(value || '').trim().replace(/^\((\+?\d{1,4})\)/, '$1');
  if (!/^[+\d][\d\s().-]*$/.test(flat)) return false;
  const digits = flat.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

function isValidDate_(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Días naturales de a a b (YYYY-MM-DD). */
function daysBetween_(a, b) {
  return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);
}

function addDays_(date, days) {
  return new Date(Date.parse(date + 'T00:00:00Z') + days * 86400000).toISOString().slice(0, 10);
}

function todayMadrid_() {
  return Utilities.formatDate(new Date(), CONFIG.timeZone, 'yyyy-MM-dd');
}

/**
 * Protección contra inyección de fórmulas: un texto que empieza por =, +, - o @
 * se guarda con un apóstrofo delante (Sheets no lo muestra).
 */
function safeText_(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function safeEquals_(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function ensureSecret_(props) {
  let secret = props.getProperty(PROP.secret);
  if (!secret) {
    secret = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
    props.setProperty(PROP.secret, secret);
  }
  return secret;
}

function colLetter_(index) {
  let n = index;
  let letters = '';
  while (n > 0) {
    const rest = (n - 1) % 26;
    letters = String.fromCharCode(65 + rest) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}

function json_(object) {
  return ContentService.createTextOutput(JSON.stringify(object)).setMimeType(ContentService.MimeType.JSON);
}

function showMessage_(title, message) {
  try {
    SpreadsheetApp.getUi().alert(title, message, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    // Sin interfaz (ejecución desde el editor o un activador): queda en el registro
    console.log(title + ': ' + message);
  }
}

/* ------------------------------------------------------------------ */
/* Emails                                                              */
/* ------------------------------------------------------------------ */

function escapeHtml_(value) {
  return String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function casetasText_(n) {
  return n === 1 ? '1 caseta' : n + ' casetas';
}

function eventLabel_(lead) {
  return lead.tipoEvento === 'Otro' && lead.tipoEventoOtro ? lead.tipoEventoOtro : lead.tipoEvento;
}

function formatDay_(isoDate) {
  return Utilities.formatDate(Utilities.parseDate(isoDate, CONFIG.timeZone, 'yyyy-MM-dd'), CONFIG.timeZone, 'dd/MM/yyyy');
}

function datesText_(lead) {
  const days = daysBetween_(lead.fechaInicio, lead.fechaFin) + 1;
  if (days <= 1) return formatDay_(lead.fechaInicio) + ' (1 día)';
  return 'Del ' + formatDay_(lead.fechaInicio) + ' al ' + formatDay_(lead.fechaFin) + ' (' + days + ' días)';
}

/** Dígitos para wa.me: un móvil español de 9 cifras recibe el prefijo 34. */
function phoneDigits_(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.indexOf('00') === 0) digits = digits.slice(2);
  if (digits.length === 9 && /^[6789]/.test(digits)) digits = '34' + digits;
  return digits;
}

function subject_(lead, numero) {
  return 'Nueva solicitud ' + numero + ' · ' + eventLabel_(lead) + ' · ' + casetasText_(lead.casetas) + ' · ' + lead.localidad;
}

function button_(href, text, primary) {
  const c = CONFIG.colors;
  const bg = primary ? c.wood : c.white;
  const fg = primary ? c.white : c.ink;
  const border = primary ? c.wood : c.sand;
  return (
    '<a href="' + escapeHtml_(href) + '" style="display:inline-block;margin:0 8px 8px 0;padding:12px 18px;border-radius:4px;' +
    'background:' + bg + ';color:' + fg + ';border:1px solid ' + border + ';font-weight:bold;font-size:14px;text-decoration:none">' +
    escapeHtml_(text) + '</a>'
  );
}

function tableRows_(rows) {
  const c = CONFIG.colors;
  return rows
    .filter(function (row) {
      return row[1] !== '' && row[1] !== null && row[1] !== undefined;
    })
    .map(function (row) {
      return (
        '<tr><td style="padding:9px 12px 9px 0;border-bottom:1px solid ' + c.sand + ';color:' + c.stone +
        ';font-size:13px;vertical-align:top;white-space:nowrap">' + escapeHtml_(row[0]) + '</td>' +
        '<td style="padding:9px 0;border-bottom:1px solid ' + c.sand + ';color:' + c.ink + ';font-size:14px;vertical-align:top">' +
        escapeHtml_(row[1]).replace(/\n/g, '<br>') + '</td></tr>'
      );
    })
    .join('');
}

function emailShell_(heading, intro, content) {
  const c = CONFIG.colors;
  return (
    '<div style="margin:0;padding:24px 12px;background:' + c.cream + ';font-family:Helvetica,Arial,sans-serif;color:' + c.ink + '">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;background:' +
    c.white + ';border:1px solid ' + c.sand + ';border-radius:4px">' +
    '<tr><td style="padding:24px 28px 20px;border-bottom:3px solid ' + c.wood + '">' +
    '<div style="font-size:11px;letter-spacing:3px;color:' + c.wood + ';font-weight:bold">CASETAS MADERIK</div>' +
    '<div style="font-size:22px;line-height:1.3;margin-top:8px;color:' + c.ink + '">' + escapeHtml_(heading) + '</div>' +
    (intro ? '<div style="font-size:14px;line-height:1.5;margin-top:6px;color:' + c.stone + '">' + intro + '</div>' : '') +
    '</td></tr>' +
    content +
    '</table></div>'
  );
}

function sendInternalEmail_(lead, numero, ss, sheet, row, to) {
  if (MailApp.getRemainingDailyQuota() < 1) {
    console.error('Sin cuota diaria de MailApp: no se envía el aviso de la solicitud ' + numero + '.');
    return;
  }
  const digits = phoneDigits_(lead.telefono);
  const tel = 'tel:' + (lead.telefono.trim().indexOf('+') === 0 || digits.length > 9 ? '+' + digits : digits);
  const wa =
    'https://wa.me/' + digits + '?text=' +
    encodeURIComponent('Hola ' + lead.nombre.split(' ')[0] + ', te escribimos de Casetas Maderik por tu solicitud ' + numero + '.');
  const reply =
    'mailto:' + lead.email + '?subject=' + encodeURIComponent('Tu solicitud ' + numero + ' · Casetas Maderik');
  const sheetUrl = ss.getUrl() + '#gid=' + sheet.getSheetId() + '&range=A' + row;

  const buttons =
    '<tr><td style="padding:20px 28px 8px">' +
    button_(tel, 'Llamar', true) + button_(wa, 'WhatsApp', false) + button_(reply, 'Responder', false) + button_(sheetUrl, 'Abrir hoja', false) +
    '</td></tr>';
  const data =
    '<tr><td style="padding:8px 28px 24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
    tableRows_([
      ['Nombre', lead.nombre],
      ['Teléfono', lead.telefono],
      ['Email', lead.email],
      ['Empresa', lead.empresa],
      ['Tipo de evento', lead.tipoEvento],
      ['Detalle', lead.tipoEvento === 'Otro' ? lead.tipoEventoOtro : ''],
      ['Fechas', datesText_(lead)],
      ['Lugar', lead.localidad + ' (' + lead.provincia + ')'],
      ['Casetas', casetasText_(lead.casetas)],
      ['Comentarios', lead.comentarios],
      ['Página', lead.pagina],
      ['Origen', [lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(' / ') || lead.referrer || 'Directo'],
      ['Dispositivo', lead.dispositivo],
    ]) +
    '</table></td></tr>' +
    '<tr><td style="padding:14px 28px;background:' + CONFIG.colors.paper + ';font-size:12px;color:' + CONFIG.colors.stone + '">' +
    'Solicitud ' + numero + ' · ID ' + escapeHtml_(lead.id) + '. Responder a este email escribe directamente al cliente.' +
    '</td></tr>';

  const intro = escapeHtml_(eventLabel_(lead) + ' · ' + casetasText_(lead.casetas) + ' · ' + lead.localidad);
  const text = [
    'Nueva solicitud ' + numero,
    '',
    'Nombre: ' + lead.nombre,
    'Teléfono: ' + lead.telefono,
    'Email: ' + lead.email,
    lead.empresa ? 'Empresa: ' + lead.empresa : null,
    'Evento: ' + eventLabel_(lead),
    'Fechas: ' + datesText_(lead),
    'Lugar: ' + lead.localidad + ' (' + lead.provincia + ')',
    'Casetas: ' + lead.casetas,
    lead.comentarios ? 'Comentarios: ' + lead.comentarios : null,
    '',
    'Hoja: ' + sheetUrl,
  ]
    .filter(function (line) {
      return line !== null;
    })
    .join('\n');

  MailApp.sendEmail({
    to: to,
    subject: subject_(lead, numero),
    body: text,
    htmlBody: emailShell_('Nueva solicitud ' + numero, intro, buttons + data),
    replyTo: lead.email,
    name: CONFIG.senderName + ' · Web',
  });
}

function sendClientEmail_(lead, numero, to) {
  if (MailApp.getRemainingDailyQuota() < 1) {
    console.error('Sin cuota diaria de MailApp: no se envía la confirmación de la solicitud ' + numero + '.');
    return;
  }
  const c = CONFIG.colors;
  const first = lead.nombre.split(' ')[0];
  const wa = 'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent('Hola, acabo de enviar la solicitud ' + numero + ' desde la web.');
  const intro = 'Hola, ' + escapeHtml_(first) + '. Te respondemos en ' + escapeHtml_(CONFIG.responseTime) + '.';
  const content =
    '<tr><td style="padding:22px 28px 6px;font-size:15px;line-height:1.6;color:' + c.ink + '">' +
    'Gracias por escribirnos. Revisamos fechas, lugar y disponibilidad y te enviamos una propuesta clara.' +
    '</td></tr>' +
    '<tr><td style="padding:8px 28px 18px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
    tableRows_([
      ['Solicitud', String(numero)],
      ['Evento', eventLabel_(lead)],
      ['Fechas', datesText_(lead)],
      ['Lugar', lead.localidad + ' (' + lead.provincia + ')'],
      ['Casetas', casetasText_(lead.casetas)],
      ['Comentarios', lead.comentarios],
    ]) +
    '</table></td></tr>' +
    '<tr><td style="padding:4px 28px 10px;font-size:14px;color:' + c.stone + '">Si necesitas algo antes, llámanos al ' +
    escapeHtml_(CONFIG.phoneDisplay) + ' o escríbenos por WhatsApp.</td></tr>' +
    '<tr><td style="padding:6px 28px 24px">' + button_('tel:' + CONFIG.phoneE164, 'Llamar', true) + button_(wa, 'WhatsApp', false) + '</td></tr>' +
    '<tr><td style="padding:14px 28px;background:' + c.paper + ';font-size:12px;line-height:1.5;color:' + c.stone + '">' +
    'Recibes este email porque has pedido presupuesto en ' + escapeHtml_(CONFIG.siteUrl.replace('https://', '')) +
    '. Responsable: AJE ZENTIO. Puedes ejercer tus derechos en ' + escapeHtml_(CONFIG.notifyEmail) + '.</td></tr>';

  const text = [
    'Hola, ' + first + '.',
    '',
    'Hemos recibido tu solicitud ' + numero + '. Te respondemos en ' + CONFIG.responseTime + '.',
    '',
    'Evento: ' + eventLabel_(lead),
    'Fechas: ' + datesText_(lead),
    'Lugar: ' + lead.localidad + ' (' + lead.provincia + ')',
    'Casetas: ' + casetasText_(lead.casetas),
    '',
    'Si necesitas algo antes, llámanos al ' + CONFIG.phoneDisplay + ' o escríbenos por WhatsApp: https://wa.me/' + CONFIG.whatsappNumber,
    '',
    'Casetas Maderik',
    CONFIG.siteUrl,
  ].join('\n');

  MailApp.sendEmail({
    to: to,
    subject: 'Hemos recibido tu solicitud ' + numero + ' · Casetas Maderik',
    body: text,
    htmlBody: emailShell_('Hemos recibido tu solicitud', intro, content),
    replyTo: CONFIG.notifyEmail,
    name: CONFIG.senderName,
  });
}
