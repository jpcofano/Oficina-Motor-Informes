#!/usr/bin/env python3
"""
Parte B del `2026-08-30_1` en la forma del `ADDENDUM 1` §7 — dos criterios, no tres.

⛔⛔ **Rev. 4 — este archivo se reescribió entero por un DEFECTO DE PARSER.** La versión anterior
usaba la clase `Libro` de `tools/medir-post-en-desglose.py`, cuyo patrón de celda **no reconoce el
autocierre** `<c r="S2" s="2"/>` que emite Google Sheets: al no cerrar, consume la celda siguiente y
**los valores sangran una columna hacia atrás**. Había **4.645** celdas autocerradas en esta sola
solapa. Ahora lee con `leer_xlsx_por_referencia.Hoja`, **verificado contra `openpyxl` columna por
columna en las 5.149 filas**.

⚠ **La lección va con el instrumento y no en una nota:** el parser roto **no fallaba**, devolvía
valores plausibles en la columna equivocada — misma familia que la truncación del export markdown
del conector. Un dato plausible mal ubicado es indistinguible de uno correcto mirando el resultado.

⭐ **Los criterios se LEEN de `DIMENSIONES_`, no se reescriben.** BASE es lo que el motor aplica hoy
—`des_campana_2~=JM || des_campana_3~=JM`, columnas **V** y **U**— y `~=` preserva mayúsculas
(`R-10`).

Sólo lectura. No escribe en ninguna planilla.

Uso:
  python tools/medir-corte-parte-b.py
"""
import datetime
import hashlib
import io
import os
import sys
import zipfile
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from leer_xlsx_por_referencia import Hoja, norm  # noqa: E402

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

FIX = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', '_fixtures')
D30 = os.path.join(FIX, 'Seguimiento_Digital_2026-08-30.xlsx')
SHA30 = 'd7b917f5711dcdd70b20b82ce8d6ccaa336fc3c1bcf5a0114296ca33edf70d6a'
Z28 = os.path.join(FIX, 'Seguimiento Digital 2026-08-28.zip')
SHA28 = '0ce0086d192bbb121c86dfe72434c40254c95c5153e8c43af9a39badfa81ac79'

# Referencia externa — tablero, ventana 21–28/08, LECTURA DEL 30/08 (`ADDENDUM` §0 bis).
REF = {'jm': {'Meta': 10, 'Google ads': 10, 'DV360': 9},
       'gcba': {'Meta': 100, 'Google ads': 60, 'DV360': 120}}
REF_IMP = {'jm': {'Meta': 2254346, 'Google ads': 1219244, 'DV360': 6907699},
           'gcba': {'Meta': 24164426, 'Google ads': 19841789, 'DV360': 61398036}}

DESDE, HASTA = datetime.date(2026, 8, 21), datetime.date(2026, 8, 28)
EPOCA = datetime.date(1899, 12, 30)
import re
FORMA = re.compile(r'^(\d+)-([A-Za-z]{3})([A-Za-z]{5})$')
mil = lambda n: format(int(n), ',').replace(',', '.')


def num(v):
    try:
        return float(str(v).strip())
    except (TypeError, ValueError):
        return 0.0


def fecha(v):
    s = norm(v)
    if not s:
        return None
    try:
        return EPOCA + datetime.timedelta(days=int(float(s)))
    except ValueError:
        for f in ('%Y-%m-%d', '%d/%m/%Y'):
            try:
                return datetime.datetime.strptime(s[:10], f).date()
            except ValueError:
                pass
    return None


G = lambda f, L: norm(f.get(L, ''))


def es_jm_base(f):
    """BASE — criterio VIVO del motor: «JM» en col V o col U."""
    return 'JM' in G(f, 'V') or 'JM' in G(f, 'U')


def es_jm_c1(f):
    m = FORMA.match(G(f, 'B'))
    return bool(m) and m.group(3).endswith('AG')


def sin_marca(f):
    return (not FORMA.match(G(f, 'B'))
            and not es_jm_base(f) and 'JM' not in G(f, 'E')
            and G(f, 'T') in ('', 'Sin Tipo'))


def plat(f):
    p = G(f, 'F')
    return p if p in ('Meta', 'Google ads', 'DV360') else 'otras'


def en_ventana(f):
    a, b = fecha(G(f, 'I')), fecha(G(f, 'J'))
    return a is not None and b is not None and a <= HASTA and b >= DESDE


def bloque(t):
    print('\n' + '=' * 84)
    print(t)
    print('=' * 84)


bloque('PROCEDENCIA — huellas, y el lector con el autocierre resuelto')
for ruta, esp in ((D30, SHA30), (Z28, SHA28)):
    s = hashlib.sha256(open(ruta, 'rb').read()).hexdigest()
    print('%-42s %s  %s' % (os.path.basename(ruta), s[:16] + '…', '✅' if s == esp else '⛔'))
    if s != esp:
        raise SystemExit(1)

filas = {'30/08': Hoja(D30, lambda n: 'DESGLOCE' in n).datos}
z = zipfile.ZipFile(Z28)
filas['28/08'] = Hoja(io.BytesIO(z.read('Seguimiento Digital  (5).xlsx')),
                      lambda n: 'DESGLOCE' in n).datos
for k in ('28/08', '30/08'):
    print('   filas de datos del desglose, %s: %s' % (k, mil(len(filas[k]))))

# ------------------------------------------------------------------ B.1
bloque('B.1 · EL PRESUPUESTO DE LAS FILAS SIN MARCA')
for k in ('28/08', '30/08'):
    ds = filas[k]
    vent = [f for f in ds if en_ventana(f)]
    smv = [f for f in vent if sin_marca(f)]
    imp = sum(num(G(f, 'O')) for f in smv)
    ref_gcba = sum(REF_IMP['gcba'].values())
    print('\n%s — %s filas · en ventana: %s' % (k, mil(len(ds)), mil(len(vent))))
    print('   sin marca en la solapa entera : %d filas' % sum(1 for f in ds if sin_marca(f)))
    print('   sin marca DENTRO de la ventana: %d filas · %s impresiones · %.1f %% del GCBA del tablero'
          % (len(smv), mil(imp), 100.0 * imp / ref_gcba))
    for f in smv:
        print('      %-14s %-11s %s' % (G(f, 'B') or '(id vacío)', plat(f), G(f, 'E')[:50]))

# ------------------------------------------------------------------ B.2
bloque('B.2 · BASE CONTRA C1, POR PLATAFORMA — ventana 21–28/08')
res = {}
for k in ('28/08', '30/08'):
    vent = [f for f in filas[k] if en_ventana(f)]
    for nom, esjm in (('BASE', es_jm_base), ('C1', es_jm_c1)):
        for amb in ('jm', 'gcba'):
            sel = [f for f in vent if (esjm(f) if amb == 'jm' else not esjm(f))]
            for p in ('Meta', 'Google ads', 'DV360', 'otras'):
                sub = [f for f in sel if plat(f) == p]
                res[(k, nom, amb, p)] = (len(sub), len(set(G(f, 'B') for f in sub)),
                                         sum(num(G(f, 'O')) for f in sub))

PL = ('Meta', 'Google ads', 'DV360', 'otras')
for k in ('28/08', '30/08'):
    for amb in ('jm', 'gcba'):
        print('\n── %s · ámbito %s ──' % (k, amb.upper()))
        print('   %-14s %10s %10s %10s %10s' % ('', 'Meta', 'Google', 'DV360', 'otras'))
        print('   %-14s %10s %10s %10s %10s' % ('tablero 30/08', REF[amb]['Meta'],
              REF[amb]['Google ads'], REF[amb]['DV360'], '—'))
        for nom in ('BASE', 'C1'):
            print('   %-14s %10d %10d %10d %10d  (filas)' % (nom, *[res[(k, nom, amb, p)][0] for p in PL]))
            print('   %-14s %10d %10d %10d %10d  (Id cuentas dist.)' % ('', *[res[(k, nom, amb, p)][1] for p in PL]))
        print('   %-14s %10s %10s %10s %10s' % ('tablero imp.', mil(REF_IMP[amb]['Meta']),
              mil(REF_IMP[amb]['Google ads']), mil(REF_IMP[amb]['DV360']), '—'))
        for nom in ('BASE', 'C1'):
            im = [res[(k, nom, amb, p)][2] for p in PL]
            print('   %-14s %10s %10s %10s %10s  (impresiones)' % (nom, *[mil(x) for x in im]))

# ------------------------------------------------------------------ B.3
bloque('B.3 · EL DIFERENCIAL FILA POR FILA — 30/08, en ventana')
vent = [f for f in filas['30/08'] if en_ventana(f)]
disc = [f for f in vent if es_jm_base(f) != es_jm_c1(f)]
print('filas donde BASE y C1 difieren: %d de %d\n' % (len(disc), len(vent)))
print('   %-14s %-11s %-6s %-6s %-12s %s' % ('Id cuentas', 'plataforma', 'BASE', 'C1', 'impresiones', 'nombre (E)'))
for f in sorted(disc, key=lambda x: -num(G(x, 'O'))):
    print('   %-14s %-11s %-6s %-6s %-12s %s'
          % (G(f, 'B') or '(vacío)', plat(f), 'JM' if es_jm_base(f) else 'gcba',
             'JM' if es_jm_c1(f) else 'gcba', mil(num(G(f, 'O'))), G(f, 'E')[:42]))

# ------------------------------------------------------------------ B.4
bloque('B.4 · CONTROL DE LA COLUMNA T — se reporta, no se compara (30/08)')
ds = filas['30/08']
print('columna S «Tipo Campaña»       : %s' % dict(Counter(G(f, 'S') or '(vacío)' for f in ds).most_common()))
print('columna T «JM | GCBA | POLICIA»: %s' % dict(Counter(G(f, 'T') or '(vacío)' for f in ds).most_common()))
cr = Counter((G(f, 'T') == 'JM', es_jm_base(f)) for f in ds)
print('\ntabla cruzada  T=JM × «JM» en el nombre (BASE):')
print('   %-14s %12s %12s' % ('', 'nombre: JM', 'nombre: no'))
print('   %-14s %12d %12d' % ('T = JM', cr[(True, True)], cr[(True, False)]))
print('   %-14s %12d %12d' % ('T ≠ JM', cr[(False, True)], cr[(False, False)]))
tot = cr[(True, True)] + cr[(False, True)]
print('\n   de las %d filas cuyo nombre dice JM, T dice JM en %d y otra cosa en %d (%.0f %%)'
      % (tot, cr[(True, True)], cr[(False, True)], 100.0 * cr[(False, True)] / tot if tot else 0))

# ------------------------------------------------------------------ SEGAG
bloque('SEGAG · las 9 filas que separan `AG` de `JDGAG`')
nueve = [f for f in ds if G(f, 'B') == '2475-ENESEGAG']
print('%d filas · %s impresiones · en la ventana 21–28/08: %d'
      % (len(nueve), mil(sum(num(G(f, 'O')) for f in nueve)),
         sum(1 for f in nueve if en_ventana(f))))
print('   T = %s' % dict(Counter(G(f, 'T') or '(vacío)' for f in nueve)))
print('   «JM» en E, U o V: %d de %d'
      % (sum(1 for f in nueve if 'JM' in G(f, 'E') or 'JM' in G(f, 'U') or 'JM' in G(f, 'V')), len(nueve)))
print('   nombre: %s' % set(G(f, 'E') for f in nueve))
