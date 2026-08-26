#!/usr/bin/env python3
"""
`Asunto` en `digital/Directa Mail` — ¿cierra el conteo de envíos del deck?

⛔⛔ **Por qué existe:** el `2026-08-25_6` apoya su Parte 2 entera en una identidad —*«26 asuntos
distintos contra los 26 envíos que el deck publica»*— y **contra la base VIVA no reproduce**: da
**31 asuntos sobre 37 filas**. Este instrumento mide lo mismo sobre el **fixture del 31/07**, que es
la foto de la que salió el deck 24-31/07, para separar dos causas que se ven igual:
*«la premisa era falsa»* de *«la base se movió desde el export»*.

⭐ **Es la única forma de contestar esa pregunta.** La base viva es de hoy (25/08) y el deck del
equipo es del 31/07: comparar uno contra el otro no distingue nada. **La base y el deck que salió de
ella viven en el mismo `.zip`, del mismo día** — ése es el cruce que sólo el fixture permite.

⚠ **No reimplementa lógica del motor.** Lee el dato crudo y compara texto; no resuelve `MAPEO` ni
calcula operaciones. `Directa Mail` se lee `snapshot` —el motor NO recorta esta solapa hoy—, así que
**la ventana la aplica este instrumento y eso es parte del resultado, no un detalle**.

Es una foto del **31/07/2026**. Corre con: python tools/medir-asunto-directa-mail.py
"""
import datetime
import hashlib
import importlib.util
import io
import os
import re
import sys
import zipfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

FIXTURE = 'docs/_fixtures/Informe 2026-07-31.zip'
SHA_ESPERADO = '97310e16f49d2726e0b46d515f13d68d84f5ba13791c7bc57b05c8495e9a0ecb'
INTERNO = 'Informe 2026-07-31/Informe 2026-07-31/Seguimiento Digital.xlsx'
SOLAPA = 'Directa Mail'

# Las tres columnas, por ENCABEZADO y no por letra: la letra es del `MAPEO` de hoy y el fixture es
# de hace un mes. Si el encabezado no está, el instrumento tiene que fallar, no adivinar.
COL_FECHA = 'Fecha envio'
COL_TIPO = 'Tipo de mail'
COL_CAMPANA = 'Nombre campaña | Directa'
COL_ASUNTO = 'Asunto'

# La ventana del deck: 24-31/07. Se declara acá porque es la mitad del resultado.
DESDE = datetime.date(2026, 7, 24)
HASTA = datetime.date(2026, 7, 31)
PATRON_TIPO = 'M2'

# Lo que el prompt da por medido. Se escribe para que el reporte diga si reprodujo o no —
# un instrumento que no declara qué esperaba no distingue «midió» de «midió otra cosa».
ESPERADO = {'filas': 32, 'campanas': 30, 'asuntos': 26}

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
    print('✅ sha256 verificado contra docs/_fixtures/README.md: %s' % sha[:16])

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
    for etiqueta in (COL_FECHA, COL_TIPO, COL_CAMPANA, COL_ASUNTO):
        if etiqueta not in cab:
            print('⛔ falta el encabezado %r. Los que hay: %s' % (etiqueta, cab))
            return 1
        idx[etiqueta] = cab.index(etiqueta)

    def celda(fila, etiqueta):
        i = idx[etiqueta]
        return norm(fila[i]) if i < len(fila) else ''

    total, sin_fecha, en_ventana = 0, 0, []
    for fila in filas[1:]:
        if not any(norm(c) for c in fila):
            continue
        total += 1
        f = serial_a_fecha(celda(fila, COL_FECHA))
        if f is None:
            sin_fecha += 1
            continue
        if not (DESDE <= f <= HASTA):
            continue
        if PATRON_TIPO.upper() not in celda(fila, COL_TIPO).upper():
            continue
        en_ventana.append({
            'fecha': f.isoformat(),
            'campana': celda(fila, COL_CAMPANA),
            'asunto': celda(fila, COL_ASUNTO),
        })

    campanas = sorted({r['campana'] for r in en_ventana})
    asuntos = sorted({r['asunto'] for r in en_ventana})

    print('\n== `%s` del fixture 31/07 ==' % SOLAPA)
    print('filas de datos en la solapa .......... %d' % total)
    print('sin fecha legible en «%s» ..... %d' % (COL_FECHA, sin_fecha))
    print('ventana %s a %s, «%s» ~ %s' % (DESDE, HASTA, COL_TIPO, PATRON_TIPO))
    print('  filas ............................. %d   (el prompt dice %d)' % (len(en_ventana), ESPERADO['filas']))
    print('  nombres de campaña distintos ...... %d   (el prompt dice %d)' % (len(campanas), ESPERADO['campanas']))
    print('  ⭐ asuntos distintos ............... %d   (el prompt dice %d)' % (len(asuntos), ESPERADO['asuntos']))

    ok = (len(en_ventana) == ESPERADO['filas'] and len(campanas) == ESPERADO['campanas']
          and len(asuntos) == ESPERADO['asuntos'])
    print('\n%s la premisa del prompt %s sobre el fixture del 31/07.'
          % ('✅' if ok else '⛔', 'REPRODUCE' if ok else 'NO reproduce'))

    # Los dos cortes que el prompt manda mirar, y se imprimen SIEMPRE — también cuando no hay
    # ninguno: «no hay» y «no miré» se ven igual en un log que sólo habla cuando encuentra algo.
    con_token = [a for a in asuntos if re.search(r'\[[A-Za-z0-9_]+\]', a)]
    print('\nasuntos con token sin resolver: %d' % len(con_token))
    for a in con_token:
        cuantas = sum(1 for r in en_ventana if r['asunto'] == a)
        print('   · %-62s %d fila(s)' % (a[:62], cuantas))

    con_test = [a for a in asuntos if 'test' in a.lower()]
    print('asuntos con «TEST»: %d' % len(con_test))
    for a in con_test:
        print('   · %s' % a)

    print('\n-- los %d asuntos distintos --' % len(asuntos))
    for a in asuntos:
        print('   %2d  %s' % (sum(1 for r in en_ventana if r['asunto'] == a), a))

    print('\n-- los %d nombres de campaña distintos --' % len(campanas))
    for c in campanas:
        print('   %2d  %s' % (sum(1 for r in en_ventana if r['campana'] == c), c))

    return 0


if __name__ == '__main__':
    sys.exit(main())
