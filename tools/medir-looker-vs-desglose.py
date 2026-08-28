#!/usr/bin/env python3
"""
¿`looker/DIGITAL` y `digital/CAMPAÑAS_DESGLOCE_DIGITAL` traen la MISMA información?

⛔ **Por qué importa hoy:** el 28/08 los ocho `imp_*` se movieron de `looker/DIGITAL` al desglose
con el criterio idéntico, y esa mudanza se apoya en una premisa del usuario —*«son solapas con la
misma información, el desglose es más completa»*—. **Si es cierta, los números no se mueven; si no,
ocho valores validados cambian de golpe.** Esto la mide antes de que corra el motor.

⭐ **Se compara FILA POR FILA, no dos totales.** Dos totales pueden coincidir compensando errores en
direcciones opuestas; un cruce por clave no. Y es lo que `V-109`/`V-111` enseñan: la identidad en la
fuente y la identidad en el producto son dos preguntas.

⚠ **La clave se declara y se prueban DOS de distinta finura** (`CLAUDE.md` §4, `C-74`): un
porcentaje alto de diferencias con magnitudes enormes no es un dato, es identidad de fila mal
resuelta. Si las dos claves dan resultados muy distintos, **gana la fina y el hallazgo es la clave**.

⚠ **NO reproduce la ventana.** El recorte por pertenencia a `looker/Cuentas` y el tope de 90 días de
`R-30` viven en `Fuentes.gs` y reimplementarlos sería el instrumento que reproduce lógica del motor
y la reproduce peor. Acá se comparan **las dos solapas enteras**: si son la misma información, lo son
en cualquier subconjunto, y si no lo son, esto lo dice sin depender de la ventana.

Uso:
  python tools/medir-looker-vs-desglose.py
"""
import hashlib
import importlib.util
import os
import re
import sys
import zipfile
from collections import defaultdict

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

FIXTURE = 'docs/_fixtures/Seguimiento Digital 2026-08-28.zip'
SHA_ESPERADO = '0ce0086d192bbb121c86dfe72434c40254c95c5153e8c43af9a39badfa81ac79'

# (archivo, solapa, columna de cuenta, plataforma, campaña, estado, métricas)
LOOKER = ('Base Looker (4).xlsx', 'DIGITAL', 'Id cuentas', 'Plataforma', 'nombre_campaña', 'estado',
          ['Impresiones', 'Visualizaciones', 'Clics'])
DESGL = ('Seguimiento Digital  (5).xlsx', 'CAMPAÑAS_DESGLOCE_DIGITAL', 'Id cuentas', 'Plataforma',
         'nombre_campaña', 'estado', ['Impresiones', 'Visualizaciones', 'Clics'])

norm = lambda s: re.sub(r'\s+', ' ', str(s if s is not None else '')).strip()


def _libro_clase():
    ruta = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'medir-post-en-desglose.py')
    spec = importlib.util.spec_from_file_location('medir_post_en_desglose', ruta)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.Libro


def num(v):
    """Un número de celda, **mirando el tipo antes de convertir**.

    ⛔ El primer intento hacía `str(v).replace('.', '')` siempre, y eso convierte `55898176.0`
    —un float que llega como texto— en `558981760`: **diez veces más grande**. Es
    `CLAUDE.md` §4 literal: *convertir antes de mirar el tipo destruye el tipo*. Se probó
    `float()` derecho primero, y sólo si eso falla se asume el formato con puntos de miles.
    """
    if v is None:
        return 0.0
    if not isinstance(v, str):
        try:
            return float(v)
        except (TypeError, ValueError):
            return 0.0
    s = v.strip()
    if not s:
        return 0.0
    try:
        return float(s)
    except ValueError:
        pass
    try:
        return float(s.replace('.', '').replace(',', '.'))
    except ValueError:
        return 0.0


def leer(z, spec):
    archivo, solapa, ccta, cplat, ccamp, cest, metricas = spec
    coincide = [n for n in z.namelist() if n.endswith(archivo)]
    if not coincide:
        raise SystemExit('⛔ el zip no tiene %r' % archivo)
    libro = _libro_clase()(z.read(coincide[0]))
    hojas = dict(libro.hojas)
    if solapa not in hojas:
        raise SystemExit('⛔ no está la solapa %r. Las que hay: %s' % (solapa, sorted(hojas)))
    filas = libro.filas(hojas[solapa])
    cab = [norm(c) for c in filas[0]]
    # ⚠ Los nombres se repiten en el desglose (`Id cuentas` dos veces, `estado` y `Estado`): se
    # toma la ÚLTIMA aparición de los que sabemos duplicados, que es la del bloque final —el mismo
    # criterio que `des_campana_2` y `des_estado_2` en `MAPEO`.
    def idx(nombre, ultima=False):
        if nombre not in cab:
            raise SystemExit('⛔ %s/%s no tiene la columna %r. Tiene: %s' % (archivo, solapa, nombre, cab))
        return len(cab) - 1 - cab[::-1].index(nombre) if ultima else cab.index(nombre)
    i = {'cta': idx(ccta, True), 'plat': idx(cplat), 'camp': idx(ccamp, True), 'est': idx(cest, True)}
    for m in metricas:
        i[m] = idx(m)
    out = []
    for f in filas[1:]:
        val = lambda k: (f[i[k]] if i[k] < len(f) else '')
        if not any(norm(x) for x in f):
            continue
        out.append({
            'cta': norm(val('cta')), 'plat': norm(val('plat')),
            'camp': norm(val('camp')), 'est': norm(val('est')),
            'm': [num(val(x)) for x in metricas]
        })
    return out


def agrupar(filas, clave):
    g = defaultdict(lambda: [0.0, 0.0, 0.0])
    for f in filas:
        k = clave(f)
        for j in range(3):
            g[k][j] += f['m'][j]
    return g


def comparar(a, b, nombre):
    todas = set(a) | set(b)
    solo_a = [k for k in todas if k not in b]
    solo_b = [k for k in todas if k not in a]
    difieren = [k for k in todas if k in a and k in b and
                [round(x, 4) for x in a[k]] != [round(x, 4) for x in b[k]]]
    print('\n== clave %s ==' % nombre)
    print('   grupos: looker %d · desglose %d · union %d' % (len(a), len(b), len(todas)))
    print('   sólo en looker ... %d' % len(solo_a))
    print('   sólo en desglose . %d' % len(solo_b))
    print('   ⛔ DIFIEREN ...... %d' % len(difieren))
    for k in sorted(difieren)[:8]:
        print('      %s' % str(k)[:70])
        print('        looker   %s' % '  '.join('{:,.0f}'.format(x).replace(',', '.') for x in a[k]))
        print('        desglose %s' % '  '.join('{:,.0f}'.format(x).replace(',', '.') for x in b[k]))
    if len(difieren) > 8:
        print('      … y %d más' % (len(difieren) - 8))
    return len(solo_a), len(solo_b), len(difieren)


def main():
    sha = hashlib.sha256(open(FIXTURE, 'rb').read()).hexdigest()
    if sha != SHA_ESPERADO:
        print('⛔ el sha256 NO coincide con la tabla de huellas.')
        return 1
    print('✅ sha256 verificado: %s  ·  ⚠ foto del 28/08, y NO se reproduce la ventana' % sha[:16])

    z = zipfile.ZipFile(FIXTURE)
    L = leer(z, LOOKER)
    D = leer(z, DESGL)
    print('\nfilas: looker/DIGITAL %d · desglose %d' % (len(L), len(D)))

    tl = [sum(f['m'][j] for f in L) for j in range(3)]
    td = [sum(f['m'][j] for f in D) for j in range(3)]
    print('\n== totales de la solapa entera (sin ningún recorte) ==')
    print('   %-10s %16s %16s %16s' % ('', 'Impresiones', 'Visualizac.', 'Clics'))
    for et, t in (('looker', tl), ('desglose', td)):
        print('   %-10s %16s %16s %16s' % (et, *['{:,.0f}'.format(x).replace(',', '.') for x in t]))
    iguales = [round(a, 4) == round(b, 4) for a, b in zip(tl, td)]
    print('   %s los tres totales %s' % ('⭐' if all(iguales) else '⛔',
                                         'COINCIDEN' if all(iguales) else 'NO coinciden'))

    r1 = comparar(agrupar(L, lambda f: (f['cta'], f['plat'])),
                  agrupar(D, lambda f: (f['cta'], f['plat'])), 'GRUESA (cuenta, plataforma)')
    r2 = comparar(agrupar(L, lambda f: (f['cta'], f['plat'], f['camp'])),
                  agrupar(D, lambda f: (f['cta'], f['plat'], f['camp'])),
                  'FINA (cuenta, plataforma, nombre_campaña)')

    print('\n== veredicto ==')
    if all(iguales) and r1[2] == 0 and r2[2] == 0 and r1[0] == 0 and r1[1] == 0:
        print('   ⭐⭐ Las dos solapas traen la MISMA información, fila por fila y con las dos claves.')
        print('   Mover los ocho `imp_*` al desglose NO puede mover ningún número por la fuente.')
    else:
        print('   ⛔ NO son intercambiables. La mudanza de los ocho `imp_*` SÍ mueve números, y la')
        print('   diferencia de arriba es el hallazgo — no ruido, porque el criterio es el mismo.')
        print('   ⚠ Si las dos claves dan resultados muy distintos, gana la FINA y lo que falla es')
        print('     la identidad de fila, no el dato (`C-74`).')
    return 0


if __name__ == '__main__':
    sys.exit(main())
