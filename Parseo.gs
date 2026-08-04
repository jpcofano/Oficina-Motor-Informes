/**
 * Parseo.gs — Motor de Informes (GCBA)
 *
 * Extrae datos estructurados de textos libres: nombres de campaña del digital,
 * valores de Barrio/Figura de RDV, etc.
 *
 * REGLA DE ORO: acá no hay aritmética. Todo cálculo vive en Marcadores.gs.
 * Este módulo solo normaliza y parsea texto.
 *
 * Base: splitPersonaBarrioFecha() del armado original de RDV.
 * Cambios respecto de esa versión:
 *   - parsearFecha_: el año viene por parámetro (antes DEFAULT_YEAR = 2025 fijo).
 *   - El catálogo de barrios se lee de la solapa 'Comunas' (antes 48 nombres en código).
 *   - Se agregan parsearComuna_ y parsearEje_: el 60% de los nombres de campaña
 *     dice "Comuna N" o "Eje Sur", no un barrio.
 *   - detectPersona_ se reemplaza por la solapa de equivalencias (ver §Persona).
 *   - Las funciones son puras: no leen ni escriben hojas. El wrapper de QA está al final.
 */

/* ========================= Normalización ========================= */

function normalizar_(s) {
  return (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function escaparRegex_(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ========================= Fecha ========================= */

/**
 * Primera fecha d/m[/y] o dd/mm[/yyyy] del texto.
 * Devuelve Date al mediodía (evita corrimientos por zona horaria) o '' si no hay.
 *
 * anioDefecto es OBLIGATORIO y debe venir del período de CONFIG.
 * No se asume el año en curso: un informe de enero puede reprocesar diciembre.
 *
 * Verificado sobre 58 nombres de campaña reales: detecta 56.
 * Los 2 restantes no tienen fecha en el nombre ('Campaña AON - RDV Ministros').
 * No confunde el '1 - 1' de "1 A 1" porque exige el separador pegado al número.
 */
function parsearFecha_(texto, anioDefecto) {
  if (!texto) return '';
  if (!anioDefecto) throw new Error('parsearFecha_: falta anioDefecto (viene de CONFIG).');
  var m = /(^|[^\d])(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?([^\d]|$)/.exec(texto.toString());
  if (!m) return '';
  var d = parseInt(m[2], 10);
  var M = parseInt(m[3], 10);
  var y = m[4] ? parseInt(m[4], 10) : anioDefecto;
  if (y < 100) y += 2000;
  if (!(y >= 1900 && M >= 1 && M <= 12 && d >= 1 && d <= 31)) return '';
  return new Date(y, M - 1, d, 12, 0, 0);
}

/* ========================= Barrio ========================= */

/**
 * Variantes ortográficas. Se prueban ANTES del catálogo porque son más específicas.
 * Incluye las dos diferencias detectadas entre el script original y la solapa 'Comunas':
 * Monserrat/Montserrat y Villa Gral. Mitre/Villa General Mitre.
 */
var VARIANTES_BARRIO_ = [
  { canon: 'Núñez',               re: /\bnunez\b/ },
  { canon: 'Vélez Sarsfield',     re: /\bvelez(?:\s+sarsfield)?\b/ },
  { canon: 'San Cristóbal',       re: /\bsan\s+cristobal\b/ },
  { canon: 'San Nicolás',         re: /\bsan\s+nicolas\b/ },
  { canon: 'Villa General Mitre', re: /\bvilla\s+(?:general|gral\.?)\s+mitre\b/ },
  { canon: 'Monserrat',           re: /\bmon(?:t)?serrat\b/ },
  { canon: 'La Paternal',         re: /\b(?:la\s+)?paternal\b/ },
  { canon: 'Nueva Pompeya',       re: /\b(?:nueva\s+)?pompeya\b/ },
  { canon: 'Villa Pueyrredón',    re: /\bvilla\s+pueyrredon\b/ },
  { canon: 'Villa Lugano',        re: /(?:^|\s)(?:villa\s+)?lugano(?:\s|$)/ },
  { canon: 'La Boca',             re: /\b(?:la\s+)?boca\b/ }
];

/**
 * catalogoBarrios debe venir de la solapa 'Comunas' de la base de RDV,
 * que tiene las 48 filas barrio→comuna. Ver catalogoBarriosDesdeBase_().
 * No se hardcodea la lista: si mañana cambia, cambia la planilla.
 */
function parsearBarrio_(texto, catalogoBarrios) {
  var n = normalizar_(texto);
  if (!n) return '';
  for (var i = 0; i < VARIANTES_BARRIO_.length; i++) {
    if (VARIANTES_BARRIO_[i].re.test(n)) return VARIANTES_BARRIO_[i].canon;
  }
  var lista = catalogoBarrios || [];
  for (var j = 0; j < lista.length; j++) {
    var re = new RegExp('\\b' + escaparRegex_(normalizar_(lista[j])) + '\\b');
    if (re.test(n)) return lista[j];
  }
  return '';
}

/* ========================= Comuna ========================= */

/**
 * Reconoce 'Comuna 8', 'comuna  8', 'C8', 'C13 ' (con espacio final).
 * Los nombres de campaña del digital usan 'Comuna N';
 * RDV_otros_ministros usa 'C8'. Es el mismo dato con dos formatos.
 * Devuelve número o '' — nunca 0, para no confundir con "sin dato".
 */
function parsearComuna_(texto) {
  var n = normalizar_(texto);
  if (!n) return '';
  var m = /\bcomuna\s*(\d{1,2})\b/.exec(n) || /(?:^|[\s\-])c\s?(\d{1,2})(?:\b|\s|$)/.exec(n);
  if (!m) return '';
  var c = parseInt(m[1], 10);
  return (c >= 1 && c <= 15) ? c : '';
}

/* ========================= Eje / Temática ========================= */

/**
 * Los encuentros que no son de un barrio se identifican por eje:
 * 'Eje Norte', 'Eje Sur', 'Eje Centro', 'Eje Oeste', o 'Tematica'/'TODOS'.
 */
function parsearEje_(texto) {
  var n = normalizar_(texto);
  if (!n) return '';
  var m = /\beje\s+(norte|sur|centro|oeste)\b/.exec(n);
  if (m) return 'Eje ' + m[1].charAt(0).toUpperCase() + m[1].slice(1);
  if (/\btematica\b/.test(n)) return 'Temática';
  if (/\btodos\b/.test(n)) return 'Todos';
  return '';
}

/* ========================= Tipo de encuentro y pre/post ========================= */

function parsearTipoEncuentro_(texto) {
  var n = normalizar_(texto);
  if (/\b1\s*a\s*1\b/.test(n) || /\bmano\s+a\s+mano\b/.test(n)) return '1 a 1';
  if (/\bprimera\s+persona\b/.test(n)) return 'Primera Persona';
  if (/\bministros?\b/.test(n)) return 'Ministros';
  if (/\btematic[ao]\b/.test(n) || /\borden\s+publico\b/.test(n)) return 'Temático';
  if (/\bvecinos\b/.test(n)) return 'Encuentro con Vecinos';
  return '';
}

/**
 * En el digital, la convocatoria (PRE) y el cierre (POST) comparten Id cuentas.
 * La única diferencia es la palabra 'Post' en el nombre: la que no dice nada es la PRE.
 */
function esPost_(texto) {
  return /\bpost\b/.test(normalizar_(texto));
}

/* ========================= Persona ========================= */

/**
 * PENDIENTE — a construir contra la solapa de equivalencias.
 *
 * El detectPersona_ original usaba un regex por persona con el formato
 * 'Nombre Apellido'. Medido contra los datos reales: reconoce 16/19 en
 * 'RVD JM-CM - ES' y 0/18 en 'RDV_otros_ministros', que escribe 'Apellido Nombre'.
 *
 * Se reemplaza por búsqueda contra la solapa de equivalencias
 * (docs/PERSONAS_equivalencias.csv: 17 personas, 34 variantes), que cubre los dos
 * formatos y se corrige desde la planilla sin tocar código.
 *
 * mapaPersonas: objeto { variante_normalizada: nombre_canonico }.
 * Las celdas con varios funcionarios separados por coma se parten antes de buscar.
 */
function parsearPersonas_(texto, mapaPersonas) {
  var partes = (texto || '').toString().split(',');
  var salida = [];
  for (var i = 0; i < partes.length; i++) {
    var clave = normalizar_(partes[i]).replace(/\s+/g, ' ');
    if (!clave) continue;
    var canon = mapaPersonas ? mapaPersonas[clave] : null;
    salida.push(canon || { sin_reconocer: partes[i].trim() });
  }
  return salida;
}

/* ========================= Parseo integral ========================= */

/**
 * Punto de entrada: descompone un nombre de campaña del digital.
 * Devuelve siempre el mismo objeto, con '' en lo que no encuentra, y un flag
 * 'reconocido' para que el diagnóstico pueda listar lo que no se pudo parsear.
 * Nunca devuelve null: un campo vacío se resuelve después como «FALTA:token».
 */
function parsearNombreCampana_(texto, opciones) {
  var op = opciones || {};
  return {
    original:  texto,
    tipo:      parsearTipoEncuentro_(texto),
    barrio:    parsearBarrio_(texto, op.catalogoBarrios),
    comuna:    parsearComuna_(texto),
    eje:       parsearEje_(texto),
    fecha:     parsearFecha_(texto, op.anioDefecto),
    es_post:   esPost_(texto),
    reconocido: !!(parsearFecha_(texto, op.anioDefecto) &&
                   (parsearBarrio_(texto, op.catalogoBarrios) || parsearComuna_(texto) || parsearEje_(texto)))
  };
}

/* ========================= Catálogo desde la base ========================= */

/**
 * Lee la solapa 'Comunas' de la base de RDV y devuelve
 * { barrios: [...48], porBarrio: { barrio_normalizado: comuna } }.
 *
 * Usa abrirHoja() de Fuentes.gs para respetar la caché por corrida.
 * El nombre de la hoja NO se hardcodea acá: sale de la fila de BASES.
 */
function catalogoBarriosDesdeBase_(baseId, nombreHoja) {
  // Corrida nocturna 04/08 — `abrirHoja` devuelve `{ ok, base, libro, hoja }`, no la hoja:
  // esto llamaba `getDataRange()` sobre el sobre y tiraba `hoja.getDataRange is not a
  // function`. Nunca se había visto porque `anclarEncuentros()` moría antes, en la
  // precondición de `R-01`. Sin catálogo, el catálogo sale vacío y el score de barrio se
  // apaga en silencio, así que el fallo se devuelve como catálogo vacío **con motivo**.
  var abierto = abrirHoja(baseId, nombreHoja);
  if (!abierto.ok) return { barrios: [], porBarrio: {}, motivo: abierto.motivo };

  var datos = abierto.hoja.getDataRange().getValues();
  var barrios = [], porBarrio = {};
  for (var i = 1; i < datos.length; i++) {
    var b = datos[i][0], c = datos[i][1];
    if (!b) continue;
    barrios.push(b.toString().trim());
    porBarrio[normalizar_(b)] = c;
  }
  return { barrios: barrios, porBarrio: porBarrio };
}

/* ========================= QA ========================= */

/**
 * Corre el parseo sobre una lista de textos y loguea lo que NO pudo reconocer.
 * Es a propósito: lo importante no es cuántos acierta sino cuáles falla.
 * Silenciar los vacíos es como se pierden encuentros sin que nadie se entere.
 */
function probarParseo_(textos, opciones) {
  var sinReconocer = [];
  for (var i = 0; i < textos.length; i++) {
    var r = parsearNombreCampana_(textos[i], opciones);
    if (!r.reconocido) sinReconocer.push(textos[i]);
  }
  Logger.log('Parseo: %s/%s reconocidos', textos.length - sinReconocer.length, textos.length);
  for (var j = 0; j < sinReconocer.length; j++) Logger.log('   sin reconocer: %s', sinReconocer[j]);
  return sinReconocer;
}
