const CONFIG = {
  hojaSolicitudes: 'Solicitudes',
  hojaContador: 'Contador',
  zonaHoraria: 'Europe/Madrid',
  segundosDuplicado: 21600,
  avisoEmail: 'aaswebmarketing@gmail.com',
  remitente: 'Casetas Maderik',
};

const COLUMNAS = [
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
];

function configurar() {
  const libro = libro_();
  const solicitudes = libro.getSheetByName(CONFIG.hojaSolicitudes) || libro.insertSheet(CONFIG.hojaSolicitudes, 0);
  solicitudes.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS]).setFontWeight('bold').setBackground('#F3EDE4');
  solicitudes.setFrozenRows(1);
  solicitudes.getRange('B:B').setNumberFormat('dd/mm/yyyy');
  solicitudes.getRange('C:C').setNumberFormat('@');
  solicitudes.getRange('I:J').setNumberFormat('@');

  const contador = libro.getSheetByName(CONFIG.hojaContador) || libro.insertSheet(CONFIG.hojaContador, 1);
  const hoja = "'" + CONFIG.hojaSolicitudes + "'";
  contador.getRange('A1:B3').setValues([
    ['Total de leads', '=COUNTA(' + hoja + '!A2:A)'],
    ['Hoy', '=COUNTIF(' + hoja + '!B2:B,TODAY())'],
    [
      'Este mes',
      '=COUNTIFS(' + hoja + '!B2:B,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1),' + hoja + '!B2:B,"<="&EOMONTH(TODAY(),0))',
    ],
  ]);
  contador.getRange('A5:B5').setValues([['Mes', 'Leads']]);
  contador.getRange('A1:A5').setFontWeight('bold');
  contador.getRange('B5').setFontWeight('bold');
  contador.getRange('B1:B3').setFontSize(14);
  contador.setColumnWidth(1, 160);

  const hojaInicial = libro.getSheetByName('Hoja 1') || libro.getSheetByName('Sheet1');
  if (hojaInicial && libro.getSheets().length > 2) libro.deleteSheet(hojaInicial);

  const props = PropertiesService.getScriptProperties();
  props.setProperty('LIBRO', libro.getId());
  if (!props.getProperty('SECRETO')) props.setProperty('SECRETO', Utilities.getUuid() + Utilities.getUuid());
  Logger.log('Secreto para APPS_SCRIPT_SECRET en Vercel: ' + props.getProperty('SECRETO'));
}

function doPost(e) {
  try {
    const datos = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    return respuesta_(guardar_(datos));
  } catch (error) {
    return respuesta_({ ok: false, error: 'invalid_json' });
  }
}

function guardar_(d) {
  const secreto = PropertiesService.getScriptProperties().getProperty('SECRETO');
  if (!secreto) return { ok: false, error: 'not_configured' };
  if (String(d.secret || '') !== secreto) return { ok: false, error: 'unauthorized' };
  if (d.website) return { ok: true, numero: 0 };
  if (!d.nombre || !d.telefono || !d.email) return { ok: false, error: 'validation' };

  const cache = CacheService.getScriptCache();
  const clave = 'lead_' + String(d.id || '').slice(0, 80);
  if (d.id) {
    const previo = cache.get(clave);
    if (previo) return { ok: true, numero: Number(previo) };
  }

  const bloqueo = LockService.getScriptLock();
  if (!bloqueo.tryLock(20000)) return { ok: false, error: 'busy' };
  try {
    const libro = libro_();
    const hoja = libro.getSheetByName(CONFIG.hojaSolicitudes);
    if (!hoja) return { ok: false, error: 'not_configured' };
    const numero = Math.max(hoja.getLastRow(), 1);
    const ahora = new Date();
    const dia = Utilities.formatDate(ahora, CONFIG.zonaHoraria, 'yyyy-MM-dd').split('-').map(Number);
    const tipo = d.tipoEvento === 'Otro' && d.tipoEventoOtro ? 'Otro: ' + d.tipoEventoOtro : d.tipoEvento;
    const fila = [
      numero,
      new Date(dia[0], dia[1] - 1, dia[2]),
      Utilities.formatDate(ahora, CONFIG.zonaHoraria, 'HH:mm'),
      texto_(d.nombre),
      texto_(d.telefono),
      texto_(d.email),
      texto_(d.empresa),
      texto_(tipo),
      fecha_(d.fechaInicio),
      fecha_(d.fechaFin || d.fechaInicio),
      texto_(d.localidad),
      texto_(d.provincia),
      Number(d.casetas) || '',
      texto_(d.comentarios),
    ];
    hoja.appendRow(fila);
    sumarMes_(libro, ahora);
    avisar_(numero, fila, libro.getUrl());
    if (d.id) cache.put(clave, String(numero), CONFIG.segundosDuplicado);
    return { ok: true, numero: numero };
  } finally {
    bloqueo.releaseLock();
  }
}

function sumarMes_(libro, ahora) {
  const contador = libro.getSheetByName(CONFIG.hojaContador);
  if (!contador) return;
  const mes = Utilities.formatDate(ahora, CONFIG.zonaHoraria, 'yyyy-MM');
  const ultima = contador.getLastRow();
  if (ultima >= 6) {
    const meses = contador.getRange(6, 1, ultima - 5, 2).getValues();
    for (let i = 0; i < meses.length; i++) {
      if (String(meses[i][0]) === mes) {
        contador.getRange(6 + i, 2).setValue(Number(meses[i][1]) + 1);
        return;
      }
    }
  }
  contador.getRange(Math.max(ultima, 5) + 1, 1, 1, 2).setNumberFormats([['@', '0']]).setValues([[mes, 1]]);
}

function avisar_(numero, fila, url) {
  if (!CONFIG.avisoEmail) return;
  try {
    const campos = [
      ['Nombre', fila[3]],
      ['Teléfono', fila[4]],
      ['Email', fila[5]],
      ['Empresa', fila[6]],
      ['Tipo de evento', fila[7]],
      ['Fechas', fila[8] + (fila[9] && fila[9] !== fila[8] ? ' al ' + fila[9] : '')],
      ['Lugar', fila[10] + (fila[11] ? ' (' + fila[11] + ')' : '')],
      ['Casetas', fila[12]],
      ['Comentarios', fila[13]],
    ].filter(function (c) {
      return c[1] !== '' && c[1] !== undefined;
    });
    const cuerpo = campos
      .map(function (c) {
        return c[0] + ': ' + c[1];
      })
      .join('\n');
    MailApp.sendEmail({
      to: CONFIG.avisoEmail,
      subject: 'Nuevo lead nº ' + numero + ': ' + fila[3] + ' (' + fila[7] + ')',
      body: cuerpo + '\n\nHoja: ' + url,
      name: CONFIG.remitente,
    });
  } catch (error) {
    Logger.log('No se pudo enviar el aviso: ' + error);
  }
}

function libro_() {
  const activo = SpreadsheetApp.getActiveSpreadsheet();
  if (activo) return activo;
  return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('LIBRO'));
}

function texto_(valor) {
  const t = valor === undefined || valor === null ? '' : String(valor).trim();
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

function fecha_(valor) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(valor || ''));
  return m ? m[3] + '/' + m[2] + '/' + m[1] : texto_(valor);
}

function respuesta_(cuerpo) {
  return ContentService.createTextOutput(JSON.stringify(cuerpo)).setMimeType(ContentService.MimeType.JSON);
}
