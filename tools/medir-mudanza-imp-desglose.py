#!/usr/bin/env python3
"""
Parte 0 del `2026-08-31_1` — P4 (las DOS columnas de estado) y P5 (el cambio de mecanismo de
ventana), sobre los artefactos del 30/08.

⛔ **P4 es la decisión del prompt.** `looker/DIGITAL` filtra por `estado` —una columna—; el
desglose tiene **dos** y `MAPEO` declara las dos:

    des_estado    → col K  «Estado»   valores en MAYÚSCULAS
    des_estado_2  → col Y  «estado»   valores en Capitalizado

⚠ **Y el comparador DISTINGUE mayúsculas.** `valorPasaFiltro_` hace `v === esperado` sobre
`normalizarValorDeclarado_`, que sólo colapsa espacios y hace `trim` — `R-10` preserva el case a
propósito. **Un filtro `des_estado=Activa` daría CERO sin fallar.**

⭐ P5: `looker/DIGITAL` no tiene fechas y se recorta por `ventana_ref = Cuentas` (pertenencia); el
desglose tiene `Fecha inicio`/`Fecha fin` y se recorta por **solape** (`R-16`). **No es el mismo
universo por construcción**, así que el diff de la Parte C mezcla dos causas si no se separan acá.

Sólo lectura.

Uso:
  python tools/medir-mudanza-imp-desglose.py
"""
import datetime
import hashlib
import os
import re
import sys
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from leer_xlsx_por_referencia import Hoja, norm  # noqa: E402

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

FIX = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', '_fixtures')
DESG = os.path.join(FIX, 'Seguimiento_Digital_2026-08-30.xlsx')
LOOK = os.path.join(FIX, 'Base_Looker_2026-08-30.xlsx')
SHA = {DESG: 'd7b917f5711dcdd70b20b82ce8d6ccaa336fc3c1bcf5a0114296ca33edf70d6a',
       LOOK: '7272b383ebca44916250383a65c3155cee04ea172dde78fd7554ee20040ae5b2'}

# Tablero, ventana 21–28, lectura del 30/08. ⚠ El desglose por plataforma sale de la lectura de
# las 15:47; la de las 18:00 sólo movió el total de GCBA en +6 (0,00001 %).
REF = {'jm':   {'Meta': 2254346, 'Google ads': 1219244, 'DV360': 6907699, 'TOTAL': 10381289},
       'gcba': {'Meta': 24164426, 'Google ads': 19841789, 'DV360': 61398036, 'TOTAL': 105404251}}

DESDE, HASTA = datetime.date(2026, 8, 21), datetime.date(2026, 8, 28)
EPOCA = datetime.date(1899, 12, 30)
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


def bloque(t):
    print('\n' + '=' * 86)
    print(t)
    print('=' * 86)


bloque('PROCEDENCIA')
for r, esp in SHA.items():
    s = hashlib.sha256(open(r, 'rb').read()).hexdigest()
    print('%-40s %s  %s' % (os.path.basename(r), s[:16] + '…', '✅' if s == esp else '⛔'))
    if s != esp:
        raise SystemExit(1)

dg = Hoja(DESG, lambda n: 'DESGLOCE' in n)
G = lambda f, L: norm(f.get(L, ''))
solape = [f for f in dg.datos
          if fecha(G(f, 'I')) and fecha(G(f, 'J'))
          and fecha(G(f, 'I')) <= HASTA and fecha(G(f, 'J')) >= DESDE]
print('\ndesglose: %s filas · en solape 21–28: %s' % (mil(len(dg.datos)), mil(len(solape))))

# ------------------------------------------------------------------ P4 · las dos columnas
bloque('P4 · LAS DOS COLUMNAS DE ESTADO — valores crudos sobre el solape 21–28')
for col, campo in (('K', 'des_estado'), ('Y', 'des_estado_2')):
    c = Counter(G(f, col) or '(vacío)' for f in solape)
    print('  %-14s col %s → %s' % (campo, col, dict(c.most_common())))

k_act = set(id(f) for f in solape if G(f, 'K') == 'ACTIVA')
y_act = set(id(f) for f in solape if G(f, 'Y') == 'Activa')
print('\n  filas que las DOS llaman activa : %d' % len(k_act & y_act))
print('  sólo `des_estado` (K) = ACTIVA   : %d' % len(k_act - y_act))
print('  sólo `des_estado_2` (Y) = Activa : %d' % len(y_act - k_act))
print('  ⇒ discrepan en %d filas' % len(k_act ^ y_act))

print('\n⛔ El comparador DISTINGUE mayúsculas — `valorPasaFiltro_` hace `v === esperado` sobre')
print('   `normalizarValorDeclarado_`, que sólo colapsa espacios (`R-10` preserva el case).')
for col, malo in (('K', 'Activa'), ('Y', 'ACTIVA')):
    n = sum(1 for f in solape if G(f, col) == malo)
    print('   filtro mal escrito `col %s = %s` → %d filas  %s' % (col, malo, n, '⛔ CERO SIN FALLAR' if n == 0 else ''))


def plat(f):
    p = G(f, 'F')
    return p if p in ('Meta', 'Google ads', 'DV360') else 'otras'


def es_jm(f):
    m = FORMA.match(G(f, 'B'))
    return bool(m) and m.group(3) == 'JDGAG'


def medir(filas, etiqueta):
    print('\n── %s ──' % etiqueta)
    for amb in ('jm', 'gcba'):
        sel = [f for f in filas if es_jm(f) == (amb == 'jm')]
        print('   %-5s %-12s %10s %12s %14s %8s' % (amb, 'plataforma', 'filas', 'ids', 'impresiones', '% tabl.'))
        tot = 0.0
        for p in ('Meta', 'Google ads', 'DV360', 'otras'):
            sub = [f for f in sel if plat(f) == p]
            suma = sum(num(G(f, 'O')) for f in sub)
            tot += suma
            ref = REF[amb].get(p)
            pct = ('%.1f %%' % (100.0 * suma / ref)) if ref else '—'
            print('   %-5s %-12s %10d %12d %14s %8s'
                  % ('', p, len(sub), len(set(G(f, 'B') for f in sub)), mil(suma), pct))
        print('   %-5s %-12s %10d %12s %14s %8s'
              % ('', 'TOTAL', len(sel), '', mil(tot), '%.1f %%' % (100.0 * tot / REF[amb]['TOTAL'])))


bloque('P4 · OPCIÓN A — `des_estado = ACTIVA` (col K)')
medir([f for f in solape if G(f, 'K') == 'ACTIVA'], 'col K = ACTIVA')

bloque('P4 · OPCIÓN B — `des_estado_2 = Activa` (col Y)')
medir([f for f in solape if G(f, 'Y') == 'Activa'], 'col Y = Activa')

bloque('P4 · REFERENCIA — sin filtro de estado')
medir(solape, 'todas las filas del solape')

# ------------------------------------------------------------------ P5 · los dos mecanismos
bloque('P5 · LOS DOS MECANISMOS DE VENTANA, sobre la MISMA ventana 21–28')
lk = Hoja(LOOK, lambda n: n == 'DIGITAL')
cu = Hoja(LOOK, lambda n: n == 'Cuentas')
cu_v = [f for f in cu.datos
        if fecha(cu.g(f, 'fecha_inicio')) and fecha(cu.g(f, 'fecha_fin'))
        and fecha(cu.g(f, 'fecha_inicio')) <= HASTA and fecha(cu.g(f, 'fecha_fin')) >= DESDE]
ids = set(cu.g(f, 'id_cuentas') for f in cu_v)
lk_v = [f for f in lk.datos if lk.g(f, 'Id cuentas') in ids]

print('  looker/DIGITAL · ventana_ref = Cuentas (PERTENENCIA)')
print('     `Cuentas` con solape 21–28: %d filas · %d `Id cuentas` distintos' % (len(cu_v), len(ids)))
print('     filas de DIGITAL cuyo id está en ese conjunto: %s de %s' % (mil(len(lk_v)), mil(len(lk.datos))))
print('     de ésas, con `estado = Activa`: %d' % sum(1 for f in lk_v if lk.g(f, 'estado') == 'Activa'))
print('\n  desglose · ventana propia (SOLAPE, `R-16`)')
print('     filas con solape 21–28: %s de %s' % (mil(len(solape)), mil(len(dg.datos))))
print('     de ésas, col K = ACTIVA: %d · col Y = Activa: %d' % (len(k_act), len(y_act)))

ids_dg = set(G(f, 'B') for f in solape)
print('\n  ⭐ Los dos universos NO son el mismo conjunto de cuentas:')
print('     `Id cuentas` que selecciona looker vía Cuentas : %d' % len(ids))
print('     `Id cuentas` que selecciona el desglose por solape: %d' % len(ids_dg))
print('     en ambos: %d · sólo looker: %d · sólo desglose: %d'
      % (len(ids & ids_dg), len(ids - ids_dg), len(ids_dg - ids)))
print('\n  ⚠ Por eso el diff de la Parte C mezcla DOS causas: el cambio de solapa y el cambio de')
print('     mecanismo de ventana. Separarlas pide medir la misma solapa con los dos mecanismos,')
print('     y eso no se puede: cada solapa tiene el suyo declarado en `SOLAPAS`.')
