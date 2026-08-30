#!/usr/bin/env python3
"""
Lo que quedó bloqueado del `2026-08-30_1` hasta que llegaron los cuatro `.xlsx` (30/08).

Tres preguntas, y las tres estaban esperando un artefacto, no una idea:

  A · ¿`looker/DIGITAL` y el desglose son la misma tabla EL 30/08? — el `ADDENDUM` §2 afirma
      5.149/5.149, diferencia 768.128 (0,02 %) y **cero** filas sin `Plataforma`.
  B · ¿`looker/DIGITAL` venía ATRASADA el 28/08 y se puso al día? — se compara looker 28 contra
      looker 30 **y** contra el desglose de cada fecha. ⭐ El discriminador es la DIRECCIÓN del
      movimiento por `Id cuentas`, no el total.
  C · P5 y P6 contra la configuración viva del 30/08.

⚠ **Todo por referencia de celda LITERAL**, no por posición en una lista: la disputa sobre la
columna T del desglose se resolvió así, y el modo de falla —leer `Tipo Campaña` creyendo leer
`JM | GCBA | POLICIA`— no se ve de ninguna otra manera.

⛔⛔ **Rev. 4 — el lector se reemplazó por un DEFECTO DE PARSER.** El patrón de celda anterior no
reconocía el autocierre `<c r="S2" s="2"/>` y los valores sangraban una columna hacia atrás. Ahora
usa `leer_xlsx_por_referencia.Hoja`, verificado contra `openpyxl` en las 5.149 filas × 26 columnas.

Sólo lectura. No escribe en ninguna planilla.

Uso:
  python tools/medir-looker-atraso-y-config.py
"""
import hashlib
import os
import re
import sys
import zipfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from leer_xlsx_por_referencia import Hoja, norm  # lector con el AUTOCIERRE resuelto (rev. 4)
from collections import Counter, defaultdict

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

FIX = 'docs/_fixtures/'
HUELLAS = {
    'Base_Looker_2026-08-30.xlsx': '7272b383ebca44916250383a65c3155cee04ea172dde78fd7554ee20040ae5b2',
    'Motor_de_Informes_2026-08-30.xlsx': '404cb9431b78e5a1de9345ded0a7b61b4b12df6abcbd07480df54862bdaddbc4',
    'Seguimiento_Digital_2026-08-30.xlsx': 'd7b917f5711dcdd70b20b82ce8d6ccaa336fc3c1bcf5a0114296ca33edf70d6a',
}
ZIP28 = 'Seguimiento Digital 2026-08-28.zip'
SHA28 = '0ce0086d192bbb121c86dfe72434c40254c95c5153e8c43af9a39badfa81ac79'

mil = lambda n: format(int(n), ',').replace(',', '.')


def num(v):
    try:
        return float(str(v).strip())
    except (TypeError, ValueError):
        return 0.0


def bloque(t):
    print('\n' + '=' * 84)
    print(t)
    print('=' * 84)


# ------------------------------------------------------------------ huellas
bloque('PROCEDENCIA — las cuatro huellas, antes de citar un número')
for f, esperado in HUELLAS.items():
    s = hashlib.sha256(open(FIX + f, 'rb').read()).hexdigest()
    print('%-38s %s  %s' % (f, s[:16] + '…', '✅' if s == esperado else '⛔ NO COINCIDE'))
    if s != esperado:
        raise SystemExit(1)
s28 = hashlib.sha256(open(FIX + ZIP28, 'rb').read()).hexdigest()
print('%-38s %s  %s' % (ZIP28, s28[:16] + '…', '✅' if s28 == SHA28 else '⛔'))

z28 = zipfile.ZipFile(FIX + ZIP28)
import io
lk30 = Hoja(FIX + 'Base_Looker_2026-08-30.xlsx', lambda n: n == 'DIGITAL')
lk28 = Hoja(io.BytesIO(z28.read('Base Looker (4).xlsx')), lambda n: n == 'DIGITAL')
dg30 = Hoja(FIX + 'Seguimiento_Digital_2026-08-30.xlsx', lambda n: 'DESGLOCE' in n)
dg28 = Hoja(io.BytesIO(z28.read('Seguimiento Digital  (5).xlsx')), lambda n: 'DESGLOCE' in n)

# ------------------------------------------------------------------ A
bloque('A · ¿SON LA MISMA TABLA EL 30/08? — el ADDENDUM §2 afirma 5.149/5.149, Δ 768.128, 0 sin Plataforma')
for etiq, lk, dg in (('28/08', lk28, dg28), ('30/08', lk30, dg30)):
    sl = sum(num(lk.g(f, 'Impresiones')) for f in lk.datos)
    sd = sum(num(dg.g(f, 'Impresiones')) for f in dg.datos)
    vac_l = sum(1 for f in lk.datos if not lk.g(f, 'Plataforma'))
    vac_d = sum(1 for f in dg.datos if not dg.g(f, 'Plataforma'))
    print('\n%s — filas looker %s · desglose %s%s' % (
        etiq, mil(len(lk.datos)), mil(len(dg.datos)),
        '   ✅ iguales' if len(lk.datos) == len(dg.datos) else '   ⚠ distintas'))
    print('   Impresiones  looker %18s · desglose %18s · Δ %s (%.3f %%)'
          % (mil(sl), mil(sd), mil(sd - sl), 100.0 * (sd - sl) / sd if sd else 0))
    print('   filas sin `Plataforma`  looker %d · desglose %d' % (vac_l, vac_d))

# ------------------------------------------------------------------ B
bloque('B · ¿VENÍA ATRASADA? — dirección del movimiento por `Id cuentas`, que es el discriminador')


def por_id(h):
    g = defaultdict(float)
    for f in h.datos:
        g[h.g(f, 'Id cuentas')] += num(h.g(f, 'Impresiones'))
    return g


def comparar(t, a, b, na, nb):
    ks = set(a) | set(b)
    mas = sum(1 for k in ks if b.get(k, 0) > a.get(k, 0) + 0.5)
    men = sum(1 for k in ks if a.get(k, 0) > b.get(k, 0) + 0.5)
    ig = len(ks) - mas - men
    print('\n%s' % t)
    print('   %-28s %6d  (%s distintos: %d)' % (nb + ' MAYOR que ' + na, mas, 'Id cuentas', len(ks)))
    print('   %-28s %6d' % (na + ' MAYOR que ' + nb, men))
    print('   %-28s %6d' % ('iguales', ig))


l28, l30, d28, d30 = por_id(lk28), por_id(lk30), por_id(dg28), por_id(dg30)
comparar('looker 28/08  contra  desglose 28/08', l28, d28, 'looker28', 'desglose28')
comparar('looker 30/08  contra  desglose 30/08', l30, d30, 'looker30', 'desglose30')
comparar('looker 28/08  contra  looker 30/08', l28, l30, 'looker28', 'looker30')
comparar('desglose 28/08 contra desglose 30/08', d28, d30, 'desglose28', 'desglose30')

print('\n⭐ La pregunta que esto contesta: si el 28/08 looker estaba SISTEMÁTICAMENTE por debajo')
print('   del desglose y el 30/08 ya no, la caracterización «copia rezagada que se puso al día»')
print('   queda medida. Si el 30/08 sigue habiendo desbalance, no se puso al día.')

# ------------------------------------------------------------------ C
bloque('C · P5 y P6 CONTRA LA CONFIGURACIÓN VIVA DEL 30/08')
mk = Hoja(FIX + 'Motor_de_Informes_2026-08-30.xlsx', lambda n: n == 'MARCADORES')
print('MARCADORES — %s filas de datos' % mil(len(mk.datos)))
imps = [f for f in mk.datos if re.search(r'(^|_)imp_(total|meta|google|prog)$', mk.g(f, 'marcador'))]
print('\nlos ocho `imp_*`:')
print('   %-16s %-8s %-9s %-14s %-6s %-16s %s'
      % ('marcador', 'base', 'solapa', 'campo', 'oper', 'filtro', 'dimensiones'))
for f in imps:
    print('   %-16s %-8s %-9s %-14s %-6s %-16s %s'
          % (mk.g(f, 'marcador'), mk.g(f, 'base_id'), mk.g(f, 'solapa'), mk.g(f, 'campo_logico'),
             mk.g(f, 'operacion'), mk.g(f, 'filtro') or '(vacío)', mk.g(f, 'dimensiones')))
print('\n   periodo_ref de los ocho: %s'
      % Counter(mk.g(f, 'periodo_ref') or '(vacío)' for f in imps).most_common())

pe = Hoja(FIX + 'Motor_de_Informes_2026-08-30.xlsx', lambda n: n == 'PERIODOS')
print('\nPERIODOS — %d filas · ¿está 2026_agosto_21_28?' % len(pe.datos))
for f in pe.datos:
    if '21_28' in pe.g(f, 'periodo_id') or 'agosto' in pe.g(f, 'periodo_id'):
        print('   %-26s %s → %s' % (pe.g(f, 'periodo_id'), pe.g(f, 'desde'), pe.g(f, 'hasta')))

co = Hoja(FIX + 'Motor_de_Informes_2026-08-30.xlsx', lambda n: n == 'CORRIDAS')
print('\nCORRIDAS — última fila con `jm-20260828`:')
for f in co.datos:
    if 'jm-20260828' in ' '.join(norm(v) for v in f.values()):
        print('   ' + ' · '.join('%s=%s' % (k, co.g(f, k)) for k in
                                 ('corrida_id', 'informe_id', 'periodo_id', 'generado_en') if co.col(k)))
