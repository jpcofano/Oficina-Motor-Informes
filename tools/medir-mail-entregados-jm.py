#!/usr/bin/env python3
"""
`mail_entregados` — ¿de qué filas sale, y reproduce el caso validado?

⛔ **Por qué existe:** la corrida del 27/08 publicó **872.669** mails entregados en `L-034`, la
lámina del agregado del temario, al lado de «Mail: 1 (1,2 %)» — o sea, un encuentro con **un**
inscripto por mail. La pregunta no es si el número está bien calculado: es **de qué filas sale**.

⭐ **Lo que este instrumento hace, y lo que NO.** Mide **la DEFINICIÓN del negocio** —qué filas de
`digital/Directa Mail` entran— reproduciendo un caso ya validado. **No mide el motor**: no resuelve
`MAPEO`, no ejecuta `aplicarFiltroDeMarcador_` y no prueba que `datosDeMarcador_` lea así. Esa
distinción es obligatoria (`CLAUDE.md` §4) y por eso está en la primera pantalla.

**El caso que reproduce es `X-31`** (`docs/casos_validacion_2026-08-19.csv`): sobre la ventana
14-20/08, seis filas de JM y **538.291** entregados. Un caso `exacto` es un **número esperado**: el
control es reproducirlo, no volver a medirlo y compararlo contra sí mismo.

**La definición, verificada en el código vivo y no supuesta:**
  · `digital/Directa Mail` tiene `SOLAPAS.ventana_ref` **vacío** → recorta por **fecha propia**,
    la columna `Fecha envio`.
  · `dimensiones = ambito=jm` → `DIMENSIONES_` (`Fuentes.gs`) lo traduce a
    `mail_remitente = jorge.macri@buenosaires.gob.ar`.
  · **No recorta por el temario ni por cuenta** (`C-78`, cerrado el 22/08).

⚠ **El caso `X-31` se midió contra el `sha` ANTERIOR del mismo `.zip` (`f8ef3227…`).** La quinta
fila de la tabla de huellas es el mismo archivo repaquetado con una edición **de encabezados de
`Agenda JM | Post`**, que vive en **otro libro** (`reuniones`) y no toca a `Seguimiento Digital`.
Por eso los valores siguen comparables — pero se dice, no se supone.

Es una foto del **20/08/2026**. Corre con: python tools/medir-mail-entregados-jm.py
"""
import datetime
import hashlib
import importlib.util
import os
import re
import sys
import zipfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

FIXTURE = 'docs/_fixtures/Seguimiento Digital  2026-08-20.zip'
SHA_ESPERADO = '15b564919ae4fa97dc7b17f6d6962749359ddbeef99d786d40457a090cc5650e'
INTERNO = ('Seguimiento Digital  2026-08-20/Seguimiento Digital  2026-08-20 Congeladas/'
           'Seguimiento Digital  (4).xlsx')
SOLAPA = 'Directa Mail'

# Por ENCABEZADO y no por letra: la letra es del `MAPEO` de hoy. Si el encabezado no está, el
# instrumento falla en vez de adivinar.
COL_FECHA = 'Fecha envio'
COL_REMITENTE = 'Mail remitente'
COL_ENTREGADOS = 'Entregados'
COL_APERTURAS = 'Aperturas'
COL_CUENTA = 'ID Cuentas'

REMITENTE_JM = 'jorge.macri@buenosaires.gob.ar'

# El caso validado que hay que reproducir, con sus seis filas escritas.
CASO = 'X-31'
VENTANA_CASO = (datetime.date(2026, 8, 14), datetime.date(2026, 8, 20))
ESPERADO_ENTREGADOS = 538291
ESPERADO_FILAS = 6

# La ventana del deck del 27/08. El fixture es del 20/08, así que esto **no puede** traer filas —
# y ese cero medido es la respuesta a «por qué 872.669 no se reproduce desde disco».
VENTANA_DECK = (datetime.date(2026, 8, 21), datetime.date(2026, 8, 27))

norm = lambda s: re.sub(r'\s+', ' ', str(s or '')).strip()


def _libro_clase():
    """Reusa el lector de `.xlsx` que ya existe en vez de escribir un sexto."""
    ruta = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'medir-post-en-desglose.py')
    spec = importlib.util.spec_from_file_location('medir_post_en_desglose', ruta)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.Libro


def serial_a_fecha(v):
    """El `.xlsx` guarda las fechas como serial de días desde el 30/12/1899."""
    try:
        return datetime.date(1899, 12, 30) + datetime.timedelta(days=int(float(v)))
    except (TypeError, ValueError):
        return None


def numero(v):
    try:
        return float(str(v).replace('.', '').replace(',', '.')) if isinstance(v, str) else float(v)
    except (TypeError, ValueError):
        return None


def main():
    if not os.path.exists(FIXTURE):
        print('⛔ no está el fixture: %s' % FIXTURE)
        return 1

    sha = hashlib.sha256(open(FIXTURE, 'rb').read()).hexdigest()
    if sha != SHA_ESPERADO:
        print('⛔ el sha256 NO coincide con la tabla de huellas — el archivo es otro.')
        print('   esperado: %s' % SHA_ESPERADO)
        print('   medido:   %s' % sha)
        return 1
    print('✅ sha256 verificado contra docs/_fixtures/README.md (5ª fila): %s' % sha[:16])
    print('⚠ Esto mide la DEFINICIÓN del negocio, no el motor. No prueba que `datosDeMarcador_`')
    print('  lea así — eso pide una corrida.')

    z = zipfile.ZipFile(FIXTURE)
    Libro = _libro_clase()
    libro = Libro(z.read(INTERNO))

    ruta = dict(libro.hojas).get(SOLAPA)
    if not ruta:
        print('⛔ el libro no tiene la solapa %r. Tiene: %s' % (SOLAPA, [h for h, _ in libro.hojas]))
        return 1

    filas = libro.filas(ruta)
    if not filas:
        print('⛔ la solapa vino vacía')
        return 1

    cab = [norm(c) for c in filas[0]]
    idx = {}
    for etiqueta in (COL_FECHA, COL_REMITENTE, COL_ENTREGADOS, COL_APERTURAS, COL_CUENTA):
        if etiqueta not in cab:
            print('⛔ falta el encabezado %r. Los que hay: %s' % (etiqueta, cab))
            return 1
        idx[etiqueta] = cab.index(etiqueta)

    def celda(fila, etiqueta):
        i = idx[etiqueta]
        return fila[i] if i < len(fila) else ''

    def recortar(desde, hasta, remitente_exacto=True):
        """Las filas de una ventana con el remitente de JM. `remitente_exacto` distingue la
        comparación del motor —que preserva mayúsculas (`R-10`)— de una insensible al case."""
        out = []
        for fila in filas[1:]:
            if not any(norm(c) for c in fila):
                continue
            f = serial_a_fecha(celda(fila, COL_FECHA))
            if f is None or not (desde <= f <= hasta):
                continue
            rem = norm(celda(fila, COL_REMITENTE))
            ok = (rem == REMITENTE_JM) if remitente_exacto else (rem.lower() == REMITENTE_JM.lower())
            if not ok:
                continue
            out.append({
                'fecha': f,
                'cuenta': norm(celda(fila, COL_CUENTA)),
                'entregados': numero(celda(fila, COL_ENTREGADOS)) or 0,
                'aperturas': numero(celda(fila, COL_APERTURAS)) or 0,
            })
        return out

    fallas = 0

    # ── 1 · reproducir el caso validado ────────────────────────────────────────────────
    d, h = VENTANA_CASO
    caso = recortar(d, h)
    total = int(round(sum(r['entregados'] for r in caso)))
    print('\n== 1 · reproducir `%s` — ventana %s a %s, remitente de JM ==' % (CASO, d, h))
    # Los NOMBRES, no sólo cuántos: un conteo de un filtro sin la lista al lado no es citable.
    for r in sorted(caso, key=lambda x: (x['fecha'], x['cuenta'])):
        print('   %s  %-16s  entregados %10s   aperturas %10s'
              % (r['fecha'], r['cuenta'], '{:,}'.format(int(r['entregados'])).replace(',', '.'),
                 '{:,}'.format(int(r['aperturas'])).replace(',', '.')))
    print('   filas ....... %d   (el caso dice %d)' % (len(caso), ESPERADO_FILAS))
    print('   entregados .. %s   (el caso dice %s)'
          % ('{:,}'.format(total).replace(',', '.'),
             '{:,}'.format(ESPERADO_ENTREGADOS).replace(',', '.')))
    if total == ESPERADO_ENTREGADOS and len(caso) == ESPERADO_FILAS:
        print('   ✅ REPRODUCE — la definición «fecha propia + remitente de JM» es la correcta.')
    else:
        fallas += 1
        print('   ❌ NO REPRODUCE. O la definición no es ésta, o el fixture no es el de aquel caso.')

    # ── 2 · el control que separa «no hay» de «no miré» ────────────────────────────────
    laxo = recortar(d, h, remitente_exacto=False)
    print('\n== 2 · control — ¿el case del remitente cambia el universo? ==')
    print('   exacto %d fila(s) · insensible al case %d fila(s)' % (len(caso), len(laxo)))
    if len(caso) == len(laxo):
        print('   ✅ ninguna fila queda afuera por mayúsculas. No es que no miré: no hay.')
    else:
        print('   ⚠ %d fila(s) difieren por case — el motor compara preservando mayúsculas (`R-10`).'
              % abs(len(laxo) - len(caso)))

    # ── 3 · la ventana del deck del 27/08 ──────────────────────────────────────────────
    d2, h2 = VENTANA_DECK
    deck = recortar(d2, h2)
    total2 = int(round(sum(r['entregados'] for r in deck)))
    print('\n== 3 · la ventana del deck del 27/08 — %s a %s ==' % (d2, h2))
    print('   filas %d · entregados %s' % (len(deck), '{:,}'.format(total2).replace(',', '.')))
    print('   ⛔ El fixture es una foto del 20/08: esta ventana empieza DESPUÉS. **872.669 no se')
    print('      puede reproducir desde disco**, y eso no es una falla del instrumento — es el')
    print('      límite del fixture (`X-17` es el precedente). Hace falta la base viva.')

    # ── 4 · el orden de magnitud, que es lo único que el fixture SÍ contesta ────────────
    print('\n== 4 · lo que el fixture sí contesta: el orden de magnitud de UNA SEMANA de JM ==')
    print('   14-20/08 (medido acá) ......... %s' % '{:,}'.format(total).replace(',', '.'))
    print('   24-31/07 (`V-54`, validado) ... 831.604')
    print('   la corrida del 27/08 publicó .. 872.669')
    print('   ⭐ 872.669 es del ORDEN de una semana entera de JM, no de un encuentro. El bloque')
    print('      «Mail: 1 (1,2 %)» de la misma lámina sale del temario; éste, de la ventana.')
    print('   ⚠ Consistente no es correcto: 249.439 / 872.669 = 28,58 % y el deck publica 28,6 %,')
    print('      así que `mail_or` cierra con SUS operandos y no dice nada sobre el universo.')

    print('')
    if fallas == 0:
        print('✅ Las 2 afirmaciones pasaron.')
    else:
        print('❌ %d afirmación(es) fallaron.' % fallas)
    print('')
    print('⚠ Lo que este instrumento NO contesta:')
    print('   · Si el motor lee así. Mide la definición; la traza de la corrida mide el motor.')
    print('   · El valor de 872.669. El fixture es anterior a su ventana — pide la base viva.')
    print('   · Si `L-034` debe publicar este universo. No debe, y eso ya está decidido.')
    return 1 if fallas else 0


if __name__ == '__main__':
    sys.exit(main())
