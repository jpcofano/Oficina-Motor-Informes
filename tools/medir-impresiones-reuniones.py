#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
¿De dónde salen las IMPRESIONES de una reunión? — medido sobre el fixture del 20/08.

⛔⛔ **Las tres preguntas del usuario (26/08), y se contestan por separado porque son tres:**

  1. ¿Las impresiones de una reunión salen de `Agenda JM` **y** de `Agenda JM | Post`?
  2. Si la reunión **no es de JM**, ¿salen de `Agenda funcionarios`?
  3. El agregado que se publica, ¿es la **suma de lo presentado** —las filas que el deck muestra—
     o **la ventana** entera?

⭐ **Reproduce la DEFINICIÓN, no el motor** (`CLAUDE.md` §4, camino del medio): lee las solapas del
`.xlsx` y cuenta. **No resuelve `MAPEO` ni corre ninguna operación.** Contesta *qué hay en la
fuente*; *qué lee el motor* es otra pregunta y la cierra una corrida.

⚠ **Lo que NO contesta:** qué dice la base HOY. Es el export del **20/08**, y para
`Agenda JM | Post` eso importa doble: el fixture es **anterior** al cambio a `IMPORTRANGE` del
26/08, así que ahí los títulos todavía se repiten y el encabezado está en la **fila 2**.

⭐⭐ **El control positivo es una IDENTIDAD, no una constante, y el primer intento se equivocó
justamente en eso.** Se probó con *«`3487-AGOJDGAG` tiene que dar `Impresiones totales = 450.243`»*
—un número medido sobre la hoja **viva** el 26/08— y dio **242.554**: no falló la lectura, **la
campaña POST siguió acumulando entre el 20 y el 26**. Es la regla del mismo día en `CLAUDE.md` §4:
*un control contra constantes de una lectura anterior caduca cada vez que la fuente respira*.

El control que queda es el que no caduca: **`J = O+T+Y`** (Impresiones totales = suma de las tres
plataformas) y **`M = R+W+AB`** (ídem Visualizaciones), exigidas sobre todas las filas evaluables.

Corre con: python tools/medir-impresiones-reuniones.py
"""
import hashlib
import importlib.util
import os
import re
import sys
import zipfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZIP = os.path.join(RAIZ, 'docs', '_fixtures', 'Seguimiento Digital  2026-08-20.zip')
SHA = 'f8ef3227fc6cc73ef5879948451093f8e7a278c0baf1f4341d187958f0f8cc87'
INTERNO = 'Seguimiento Digital  2026-08-20/DGPLES _ Seguimiento ECVs (1).xlsx'

# El lector de `.xlsx`, importado del banco que ya lo tiene: cuatro copias de lo mismo ya son una
# señal (`CLAUDE.md` §2, los cuatro normalizadores). El nombre lleva guiones y no entra por `import`.
_spec = importlib.util.spec_from_file_location(
    'medir_desempates_cc', os.path.join(RAIZ, 'tools', 'medir-desempates-cc.py'))
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)
Libro = _mod.Libro

SOLAPAS = ['Agenda JM', 'Agenda JM | Post', 'Agenda funcionarios']
RE_IMP = re.compile(r'impresion', re.I)
# Los cuatro bloques de `Agenda JM | Post`, por POSICIÓN: en este fixture los títulos se repiten.
BLOQUES_POST = {'imp': (9, 14, 19, 24), 'vis': (12, 17, 22, 27)}


def norm(s):
    return re.sub(r'\s+', ' ', str(s or '')).strip()


def numero(v):
    try:
        return float(str(v).replace(',', '.'))
    except (TypeError, ValueError):
        return None


def letra(i):
    s = ''
    i += 1
    while i:
        i, r = divmod(i - 1, 26)
        s = chr(65 + r) + s
    return s


def verificar_huella():
    h = hashlib.sha256()
    with open(ZIP, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    ok = h.hexdigest() == SHA
    print('%s sha256 %s contra docs/_fixtures/README.md' %
          ('✅' if ok else '⛔', h.hexdigest()[:16]))
    if not ok:
        raise SystemExit('⛔ huella distinta: no se cita ningún número.')


def encabezado_y_datos(lib, solapa):
    """`(fila_encabezado, encabezados, filas)`.

    ⚠ La fila del encabezado **se detecta**, no se supone: en este export `Agenda JM | Post` y
    `Agenda funcionarios` lo tienen en la 2 —la 1 son las bandas—. Se elige, entre las dos
    primeras, la que más celdas de TEXTO tenga.
    """
    filas = lib.filas(solapa)
    if not filas:
        return None, [], []
    mejor, cuantas = 0, -1
    for i in (0, 1):
        if i >= len(filas):
            break
        n = sum(1 for c in filas[i] if norm(c) and numero(c) is None)
        if n > cuantas:
            mejor, cuantas = i, n
    return mejor + 1, [norm(c) for c in filas[mejor]], filas[mejor + 1:]


def con_id(filas):
    return [f for f in filas if f and norm(f[0]) and norm(f[0]) != 'ID']


def control_positivo(enc, filas):
    """Las dos identidades de bloque. Devuelve `(ok, texto)`."""
    lineas, todo_ok = [], True
    for etiqueta, cols in (('J = O+T+Y  (Impresiones)', BLOQUES_POST['imp']),
                           ('M = R+W+AB (Visualizaciones)', BLOQUES_POST['vis'])):
        tot, partes = cols[0], cols[1:]
        ok = ev = 0
        for f in filas:
            if len(f) <= max(cols):
                continue
            vals = [numero(f[c]) for c in cols]
            if any(v is None for v in vals):
                continue
            ev += 1
            if abs(vals[0] - sum(vals[1:])) < 0.5:
                ok += 1
        lineas.append('   %s : %d de %d' % (etiqueta, ok, ev))
        if ev == 0 or ok != ev:
            todo_ok = False
    return todo_ok, '\n'.join(lineas)


def main():
    print('== ¿De dónde salen las IMPRESIONES de una reunión? — fixture del 20/08 ==\n')
    verificar_huella()

    z = zipfile.ZipFile(ZIP)
    interno = INTERNO if INTERNO in z.namelist() else next(
        (n for n in z.namelist() if 'DGPLES' in n and n.endswith('.xlsx')), None)
    if interno is None:
        raise SystemExit('⛔ no encontré el .xlsx de `reuniones` en el .zip')
    lib = Libro(z.read(interno))
    print('   archivo: %s' % os.path.basename(interno))
    print('   ⚠ el nombre NO se parece a `BASES.reuniones.nombre`: se identifica por sus 24 solapas')

    leidas = {s: encabezado_y_datos(lib, s) for s in SOLAPAS}

    # ── Control positivo ──────────────────────────────────────────────────────────────
    print('\n-- CONTROL POSITIVO · identidades de bloque, que NO caducan --')
    fe, enc, filas = leidas['Agenda JM | Post']
    ok, texto = control_positivo(enc, con_id(filas))
    print(texto)
    if not ok:
        raise SystemExit('⛔ las identidades no cierran: no estoy leyendo esta solapa. Sin hallazgo.')
    print('   ⇒ leo `Agenda JM | Post` y sus cuatro bloques están donde digo.')

    # ── 1 y 2 · dónde viven las impresiones ───────────────────────────────────────────
    print('\n-- 1 y 2 · QUÉ COLUMNAS DE IMPRESIONES TIENE CADA SOLAPA --')
    for solapa in SOLAPAS:
        fe, enc, filas = leidas[solapa]
        datos = con_id(filas)
        cols = [(i, e) for i, e in enumerate(enc) if RE_IMP.search(e)]
        print('\n   · %s   (encabezado fila %s · %d fila(s) con ID · %d columnas)' %
              (solapa, fe, len(datos), len(enc)))
        if not cols:
            print('       ⛔ NINGUNA columna de impresiones')
            continue
        for i, e in cols:
            vals = [numero(f[i]) for f in datos if len(f) > i]
            vals = [v for v in vals if v is not None]
            print('       col %-3s «%s» — %d con número, suma %s' %
                  (letra(i), e, len(vals),
                   format(int(sum(vals)), ',d').replace(',', '.') if vals else '—'))

    # ── 2 bis · cuánto del total es Meta, que es lo que decide la pregunta 2 ──────────
    fe, enc, filas = leidas['Agenda JM']
    datos = con_id(filas)
    def suma(titulo):
        i = enc.index(titulo)
        vals = [numero(f[i]) for f in datos if len(f) > i]
        return sum(v for v in vals if v is not None)
    tot, meta = suma('Impresiones totales'), suma('Impresiones Meta')
    print('\n   ⭐ En `Agenda JM`, que SÍ tiene las cuatro columnas:')
    print('      Meta %s de un total de %s  =  %.1f %%' %
          (format(int(meta), ',d').replace(',', '.'),
           format(int(tot), ',d').replace(',', '.'), 100.0 * meta / tot))
    print('      ⛔ `Agenda funcionarios` SÓLO trae Meta, así que publicar esa columna como')
    print('         «impresiones» subdeclararía alrededor del %.0f %%.' % (100.0 - 100.0 * meta / tot))

    # ── 3 · el agregado ───────────────────────────────────────────────────────────────
    print('\n-- 3 · EL AGREGADO: ¿suma de lo presentado, o la ventana? --')
    fe, enc, filas = leidas['Agenda JM | Post']
    datos = con_id(filas)
    iTot = BLOQUES_POST['imp'][0]
    vals = [numero(f[iTot]) for f in datos if len(f) > iTot]
    vals = [v for v in vals if v is not None]
    print('   `Agenda JM | Post` · %d fila(s) con ID · %d con impresiones · suma total %s' %
          (len(datos), len(vals), format(int(sum(vals)), ',d').replace(',', '.')))
    print('   ⚠ `BASES.reuniones.modo_periodo = snapshot`: la ventana NO recorta esta base.')
    print('      El recorte lo hace el ANCLAJE por `id_cuenta` (`D-30`), no la fecha.')
    print('   ⇒ «la ventana» no es una opción acá: la ventana no selecciona filas en esta base.')

    print('\n-- LO QUE ESTE INSTRUMENTO NO CONTESTA --')
    print('   · Qué lee el motor: esto lee la fuente, el motor resuelve `MAPEO` y aplica el anclaje.')
    print('   · Qué dice la base HOY. Es el export del 20/08.')
    print('   · Para `Agenda JM | Post`, el fixture es ANTERIOR al IMPORTRANGE del 26/08.')


if __name__ == '__main__':
    main()
