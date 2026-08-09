/**
 * Sellador.gs — Fase 2 de `D-23`: el ancla de identidad de cada lámina.
 *
 * **Por qué es un módulo propio y no parte de `Armonizar.gs`.** `Armonizar.gs` migra
 * **tokens** del cuerpo de las láminas; esto escribe **identidad** en las notas del orador.
 * Son dos autorizaciones distintas de `C-01` —la armonización ya estaba cubierta por la
 * excepción de migración explícita, el sellado necesitó el `Addendum 1` del 07/08— y
 * mezclarlas haría parecer que una cubre a la otra. Mismo criterio que `Campanas.gs` en el
 * `_5`.
 *
 * **Estado: sólo `B.0`.** Acá vive únicamente el **lector**. No hay backup, no hay escritura,
 * no se crea `LAMINAS`. El `11.1` §5 partió la Parte B en dos con un gate en el medio: primero
 * se mide cuántas láminas tienen ancla hoy, y `B.1` en adelante entra recién con ese número
 * reportado.
 *
 * **Por qué el gate.** «Anclas ejercidas: ninguna» es evidencia documental de los dos addenda
 * de `C-01`, **no una medición**, y es justo el número contra el que `C.4` verifica el
 * resultado. Si alguien selló fuera del motor, anexar sin saberlo duplica el ancla.
 */

/**
 * El prefijo del ancla, en un solo lugar. `D-23` addendum 1 lo acotó a **un solo campo**:
 * `#lamina: L-NNN`. `#seccion:` **no existe** y escribirlo no está autorizado (`C-01`
 * addendum 2) — la clasificación vive en la hoja `LAMINAS`, no en el deck.
 */
var ANCLA_LAMINA_PREFIJO_ = '#lamina:';

/**
 * Texto de las notas del orador de una lámina, o `''` si no tiene.
 *
 * `getSpeakerNotesShape()` puede devolver `null` en una lámina cuyo layout no trae el
 * placeholder de notas, y `getText()` sobre `null` tira. Se devuelve `''` en vez de propagar:
 * "sin notas" y "sin placeholder" son lo mismo para quien pregunta si hay ancla.
 *
 * **Sólo lee.** El sellado usará este mismo lector antes de anexar — la lectura es la mitad
 * de "anexar sin pisar".
 */
function notasDeLamina_(slide) {
  try {
    var shape = slide.getNotesPage().getSpeakerNotesShape();
    if (!shape) return '';
    return String(shape.getText().asString() || '');
  } catch (e) {
    return '';
  }
}

/**
 * Devuelve el `L-NNN` que trae el ancla de esa lámina, o `''` si no tiene.
 *
 * Tolerante a propósito con el espacio y el case del prefijo: el ancla la puede haber escrito
 * una persona a mano, y un `#Lamina:L-007` sigue siendo un ancla. Lo que **no** se tolera es
 * inventar el id: si el prefijo está pero no hay `L-NNN` detrás, devuelve `'(sin id)'` para
 * que el conteo lo separe en vez de contarlo como no sellado.
 */
function anclaDeLamina_(slide) {
  var texto = notasDeLamina_(slide);
  if (!texto) return '';
  var re = new RegExp(ANCLA_LAMINA_PREFIJO_.replace('#', '#') + '\\s*(L-\\d+)?', 'i');
  var m = texto.match(re);
  if (!m) return '';
  return m[1] || '(sin id)';
}

/**
 * Texto de las notas de UNA lámina, por informe y número de orden (1-based). **Sólo lectura.**
 *
 * Existe para un caso puntual y conviene decirlo: **verificar que la copia de una nota que está
 * en el repo sea idéntica a la de la plantilla, antes de borrarla de la plantilla.** Comparar
 * largos no alcanza — dos textos distintos pueden medir lo mismo.
 */
function notasDeLaminaPorOrden(informeId, orden) {
  var informe = leerInformes()[informeId];
  if (!informe || !informe.plantilla_id) {
    return { ok: false, motivo: 'Informe "' + informeId + '" sin plantilla_id en INFORMES' };
  }
  var slides = SlidesApp.openById(informe.plantilla_id).getSlides();
  if (orden < 1 || orden > slides.length) {
    return { ok: false, motivo: 'La lámina ' + orden + ' no existe (la plantilla tiene ' + slides.length + ')' };
  }
  var texto = notasDeLamina_(slides[orden - 1]);
  return { ok: true, informe_id: informeId, orden: orden, chars: texto.length, texto: texto };
}

/**
 * Vacía las notas del orador de UNA lámina nombrada. **Es la única función del repo que
 * escribe sobre las notas de una plantilla viva, y la única que llama `setText`.**
 *
 * **Autorizada por `C-01` addendum 4 (09/08/2026) y por nada más.** Los addenda 1 y 2 autorizan
 * **anexar** y prohíben `setText` con todas las letras; borrar necesitó su propia autorización,
 * escrita antes de ejercerse.
 *
 * **Las tres guardas son precondiciones de esa autorización, no precauciones de esta función:**
 *
 * 1. `textoEsperado` es obligatorio y tiene que coincidir **carácter por carácter** con lo que
 *    hay en la plantilla. Comparar largos no alcanza: dos cadenas distintas miden lo mismo. Si
 *    no coincide, **no se toca nada** — significa que la copia del repo no es del texto que se
 *    está por borrar.
 * 2. **Backup primero, y aborto si falla.** Es de `C-01` y no se negocia.
 * 3. Una lámina, por número de orden. **No hay barrido y no lo va a haber**: el addendum 4 lo
 *    prohíbe explícitamente.
 *
 * Devuelve qué borró y dónde quedó el backup, para que el reporte de la corrida pueda decirlo.
 */
function borrarNotasDeLamina(informeId, orden, textoEsperado) {
  if (typeof textoEsperado !== 'string' || !textoEsperado.length) {
    return { ok: false, motivo: 'Falta `textoEsperado`: sin el texto a confirmar no se borra nada (C-01 addendum 4, precondición 2)' };
  }

  var informe = leerInformes()[informeId];
  if (!informe || !informe.plantilla_id) {
    return { ok: false, motivo: 'Informe "' + informeId + '" sin plantilla_id en INFORMES' };
  }

  var presentacion = SlidesApp.openById(informe.plantilla_id);
  var slides = presentacion.getSlides();
  if (orden < 1 || orden > slides.length) {
    return { ok: false, motivo: 'La lámina ' + orden + ' no existe (la plantilla tiene ' + slides.length + ')' };
  }

  var slide = slides[orden - 1];
  var actual = notasDeLamina_(slide);
  if (actual !== textoEsperado) {
    return {
      ok: false,
      motivo: 'El texto de la lámina ' + orden + ' NO coincide con el esperado — no se tocó nada. ' +
        'Esperado ' + textoEsperado.length + ' char(s), encontrado ' + actual.length + '.',
      encontrado: actual
    };
  }

  var carpeta = asegurarCarpetaBackups_();
  if (!carpeta.ok) return { ok: false, motivo: 'Backup abortado (no se tocó la plantilla): ' + carpeta.motivo };

  var backup = backupPlantilla_(informe.plantilla_id, presentacion.getName(), carpeta.carpeta);
  if (!backup.ok) return { ok: false, motivo: 'Backup abortado (no se tocó la plantilla): ' + backup.motivo };

  var shape = slide.getNotesPage().getSpeakerNotesShape();
  if (!shape) return { ok: false, motivo: 'La lámina ' + orden + ' no tiene shape de notas', backup: backup };
  shape.getText().setText('');

  return {
    ok: true,
    informe_id: informeId,
    orden: orden,
    chars_borrados: actual.length,
    texto_borrado: actual,
    backup: backup,
    chars_ahora: notasDeLamina_(slide).length
  };
}

/**
 * `B.0` — la medición del gate. **Sólo lectura, no escribe nada.**
 *
 * Recorre las plantillas de todos los informes activos con `plantilla_id` y cuenta, por
 * plantilla: cuántas láminas hay, cuántas tienen ancla, cuáles, y cuántas están escondidas.
 *
 * `escondida` se **refleja**, nunca decide (`C-01` addendum 1: leer está permitido, esconder
 * o mostrar no). Se reusa `esLaminaEscondida_` de `Armonizar.gs`, que es la única llamada a
 * `isSkipped()` del repo.
 */
function contarAnclasDeLaminas() {
  var informes = leerInformes();
  var salida = { ok: true, total_laminas: 0, total_con_ancla: 0, plantillas: [] };

  Object.keys(informes).forEach(function (informeId) {
    var informe = informes[informeId];
    if (!informe.activo || !informe.plantilla_id) return;

    var presentacion;
    try {
      presentacion = SlidesApp.openById(informe.plantilla_id);
    } catch (e) {
      salida.plantillas.push({
        informe_id: informeId, ok: false,
        motivo: 'No se pudo abrir la presentación "' + informe.plantilla_id + '": ' + e.message
      });
      salida.ok = false;
      return;
    }

    var slides = presentacion.getSlides();
    var conAncla = [];
    var conNotas = [];
    var escondidas = 0;

    slides.forEach(function (slide, i) {
      if (esLaminaEscondida_(slide)) escondidas++;
      var ancla = anclaDeLamina_(slide);
      if (ancla) conAncla.push({ orden: i + 1, ancla: ancla });

      // Las láminas que YA tienen texto en las notas, con su largo. Son las que el sellado
      // tiene que anexar sin pisar, así que hay que saber cuáles son **antes** de escribir —
      // es la otra mitad del gate. `C-01` addendum 1 se fundó en dos de éstas (`secco` 8 y
      // 25); el addendum 3 registra que se borraron. Esto lo verifica contra la plantilla en
      // vez de arrastrar la cita.
      var texto = notasDeLamina_(slide);
      if (texto.trim()) conNotas.push({ orden: i + 1, chars: texto.trim().length });
    });

    salida.total_laminas += slides.length;
    salida.total_con_ancla += conAncla.length;
    salida.plantillas.push({
      informe_id: informeId,
      ok: true,
      nombre: presentacion.getName(),
      plantilla_id: informe.plantilla_id,
      laminas: slides.length,
      escondidas: escondidas,
      con_ancla: conAncla.length,
      anclas: conAncla,
      con_notas: conNotas.length,
      notas: conNotas
    });
  });

  // El veredicto del gate, escrito acá y no en quien lea: si hay una sola ancla, alguien selló
  // fuera del motor y la Parte B **no arranca** hasta saber quién y con qué formato.
  salida.veredicto = salida.total_con_ancla === 0
    ? 'GATE OK — cero anclas: la evidencia documental queda confirmada por medición y C.4 tiene su línea de base.'
    : 'GATE CERRADO — ' + salida.total_con_ancla + ' lámina(s) ya tienen ancla. Alguien selló fuera del motor: ' +
      'frenar la Parte B hasta saber quién y con qué formato.';

  return salida;
}
