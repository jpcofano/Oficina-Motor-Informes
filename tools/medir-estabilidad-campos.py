# -*- coding: utf-8 -*-
"""Igual que estab.py pero separando las TRES clases de movimiento, que es lo que
decide si un caso se puede cerrar por «carga posterior» o no:

   ALTA      '' -> valor    la celda estaba vacia y se cargo despues
   CAMBIO    v  -> v'       un valor ya cargado se corrigio
   BORRADO   valor -> ''    se vacio

Y re-clavea CAMPANIAS_DESGLOCE_DIGITAL con dos claves distintas, para ver si el
56 % es movimiento del dato o identidad de fila mal resuelta.
"""
import sys
sys.path.insert(0, '.')
from xlsx import Libro, letra_a_indice as LI

F = 'C:/Users/20243359679/OneDrive/Documentos/AppsScript/Oficina/Motor Informes/docs/_fixtures/'
A = ('Informe 2026-07-31.zip', 'Informe 2026-07-31/Informe 2026-07-31/')
B = ('Seguimiento Digital  2026-08-20.zip', 'Seguimiento Digital  2026-08-20/')
LIBROS = {
    'rdv':     ('RDV JM CM ES + funcionarios.xlsx', 'RDV JM CM ES + funcionarios (5).xlsx'),
    'digital': ('Seguimiento Digital.xlsx',         'Seguimiento Digital  (4).xlsx'),
    'looker':  ('Base Looker.xlsx',                 'Base Looker (3).xlsx'),
}
PLAN = [
    ('rdv', 'RVD JM-CM - ES', ['A', 'B', 'C', 'E'], {
        'inscriptos': 'K', 'insc_mail': 'L', 'insc_cc': 'M', 'insc_ivr': 'N',
        'insc_digital': 'O', 'insc_dif': 'P', 'asistentes': 'Q', 'poblacion': 'AB'}),
    ('digital', 'Directa Mail', ['A', 'H', 'F'], {
        'mail_enviados': 'M', 'mail_entregados': 'N', 'mail_aperturas': 'O', 'mail_clics': 'Q'}),
    ('digital', 'Directa SMS', ['A', 'E', 'D'], {
        'sms_enviados': 'F', 'sms_entregados': 'G', 'sms_clics': 'I'}),
    ('digital', 'Directa IVR', ['A', 'I', 'D'], {
        'ivr_audiencia': 'J', 'ivr_llamados': 'K', 'ivr_atendidos': 'L',
        'ivr_e75': 'N', 'ivr_marque1': 'P'}),
    ('digital', u'CAMPA\u00d1AS_DESGLOCE_DIGITAL', ['A'], {
        'des_impresiones': 'O', 'des_clics': 'Q'}),
    ('digital', u'CAMPA\u00d1AS_DESGLOCE_DIGITAL', ['A', 'B', 'E', 'F'], {
        'des_impresiones': 'O', 'des_clics': 'Q'}),
    ('looker', 'CC', ['A'], {
        'cc_base_barrida': 'C', 'cc_contactados': 'D'}),
    ('looker', 'DIGITAL', ['A', 'B'], {
        'dig_impresiones': 'C', 'dig_clics': 'E'}),
]
cacheL = {}
def libro(base, lado):
    k = (base, lado)
    if k not in cacheL:
        zp, pre = (A if lado == 0 else B)
        cacheL[k] = Libro(F + zp, pre + LIBROS[base][lado])
    return cacheL[k]
def cel(r, i):
    return str(r[i]).strip() if len(r) > i else ''
def indexar(filas, keycols, campos):
    idx, vistos = {}, {}
    for r in filas:
        k = tuple(cel(r, LI(c)) for c in keycols)
        if not any(k):
            continue
        vistos[k] = vistos.get(k, 0) + 1
        idx[k] = dict((n, cel(r, LI(c))) for n, c in campos.items())
    return dict((k, v) for k, v in idx.items() if vistos[k] == 1), len(vistos)
def num(v):
    try:
        return float(v)
    except Exception:
        return None

print('%-9s %-22s %-9s %-19s %7s %6s %7s %8s' % (
    'base', 'solapa', 'clave', 'campo', 'compar', 'ALTA', 'CAMBIO', 'BORRADO'))
print('-' * 96)
fila_res = []
for base, solapa, keycols, campos in PLAN:
    fa = libro(base, 0).filas(solapa)
    fb = libro(base, 1).filas(solapa)
    def limpiar(f):
        if f and cel(f[0], 0).lower() in ('id cuentas', 'id accion', 'figura', 'id_cuentas'):
            return f[1:]
        return f
    ia, ua = indexar(limpiar(fa), keycols, campos)
    ib, ub = indexar(limpiar(fb), keycols, campos)
    comunes = set(ia) & set(ib)
    for campo in sorted(campos):
        n = alta = cambio = borrado = 0
        bajas = []
        for k in comunes:
            va, vb = ia[k].get(campo, ''), ib[k].get(campo, '')
            vacA = (va == '' or num(va) is None)
            vacB = (vb == '' or num(vb) is None)
            if vacA and vacB:
                continue
            n += 1
            if vacA and not vacB:
                alta += 1
            elif not vacA and vacB:
                borrado += 1
            else:
                na, nb = num(va), num(vb)
                if abs(na - nb) > 1e-9:
                    cambio += 1
                    if nb < na:
                        bajas.append(nb - na)
        print('%-9s %-22s %-9s %-19s %7d %6d %7d %8d%s' % (
            base, solapa[:22], '+'.join(keycols), campo, n, alta, cambio, borrado,
            '   <- baja min %+.0f' % min(bajas) if bajas else ''))
        fila_res.append((base, solapa, '+'.join(keycols), campo, n, alta, cambio, borrado, bajas))

print()
print('== VEREDICTO por campo, con la clave mas fina de cada solapa ==')
mejor = {}
for r in fila_res:
    k = (r[0], r[1], r[3])
    if k not in mejor or len(r[2]) > len(mejor[k][2]):
        mejor[k] = r
est, ines = [], []
for k in sorted(mejor):
    r = mejor[k]
    (est if (r[5] + r[6] + r[7]) == 0 else ines).append(r)
print('   ESTABLES (cero movimientos):')
for r in est:
    print('      %-9s %-24s %-19s  %d comparadas' % (r[0], r[1][:24], r[3], r[4]))
print('   INESTABLES:')
for r in sorted(ines, key=lambda x: -(x[5] + x[6] + x[7])):
    tot = r[5] + r[6] + r[7]
    print('      %-9s %-24s %-19s  %4d/%-5d (%.1f%%)  alta %d - cambio %d - borrado %d%s'
          % (r[0], r[1][:24], r[3], tot, r[4], 100.0 * tot / r[4], r[5], r[6], r[7],
             '  BAJA min %+.0f' % min(r[8]) if r[8] else ''))
