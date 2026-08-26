#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Los tres desempates de `X-28`, medidos sobre los DOS períodos (`2026-08-25_4`, Parte 0).

⛔⛔ **Qué contesta, y sólo eso:** qué cuenta de `looker/CC` elige cada regla candidata sobre
`julio_24_30` y `agosto_14_20`, y qué cuatro números publicaría — contra lo que el deck del equipo
publica **en su Resumen Ejecutivo JM**, leído del mismo `.zip`.

⚠ **Lo que NO contesta:** qué dice la base HOY. Son los exports del **31/07** y del **20/08**.

⭐ **Reproduce la DEFINICIÓN, no el motor** (`CLAUDE.md` §4, camino del medio). La pertenencia se
copia de `calcularConjuntoDeClaves_` (`Fuentes.gs`) —solape de `[fecha_inicio, fecha_fin]` con la
ventana, con el tope de `R-30`— y las columnas de `SEED_MAPEO_CC_` / `SEED_MAPEO_` (`Instalar.gs`).
**No se resuelve `MAPEO` ni se corre ninguna operación del motor.**

⭐ **Dos controles positivos, y aborta si alguno no aparece:**
  1. `V-105` — `3289-JUNJDGAG` solo tiene que dar `2 · 6.011 · 1.878 · 31` sobre el export del 31/07.
  2. El **iceberg de agosto** — `3488-AGOJDGAG` con `Tipo de llamado ∈ {Convocatoria, IVR
     convocatoria}` tiene que dar `6.294 · 1.362 · 1.146` sobre el export del 20/08 (deck, lámina 7).
Si alguno no reproduce, el instrumento no está leyendo `looker/CC` y **no hay hallazgo**.

Corre con: python tools/medir-desempates-cc.py
"""
import datetime
import hashlib
import io
import re
import sys
import zipfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

F = 'docs/_fixtures/'

# (etiqueta, desde, hasta, zip, sha256, xlsx interno, pptx interno, esperado del deck JM)
CASOS = [
    ('julio_24_30', datetime.date(2026, 7, 24), datetime.date(2026, 7, 30),
     F + 'Informe 2026-07-31.zip',
     '97310e16f49d2726e0b46d515f13d68d84f5ba13791c7bc57b05c8495e9a0ecb',
     'Informe 2026-07-31/Informe 2026-07-31/Base Looker.xlsx',
     (2, 6011, 1878, 31)),
    ('agosto_14_20', datetime.date(2026, 8, 14), datetime.date(2026, 8, 20),
     F + 'Seguimiento Digital  2026-08-20.zip',
     'f8ef3227fc6cc73ef5879948451093f8e7a278c0baf1f4341d187958f0f8cc87',
     'Seguimiento Digital  2026-08-20/Base Looker (3).xlsx',
     (3, 6851, 1616, 24)),
]

# `CONFIG.tope_dias_ventana_cuenta` (`R-30`), copiado de `SEED_CONFIG_DEFAULTS_`.
TOPE_DIAS = 90

norm = lambda s: re.sub(r'\s+', ' ', str(s or '')).strip()


def col_a_indice(ref):
    n = 0
    for c in re.match(r'([A-Z]+)', ref).group(1):
        n = n * 26 + (ord(c) - 64)
    return n - 1


def serial_a_fecha(v):
    """El serial de Excel a fecha. Es el formato de almacenamiento del `.xlsx`."""
    try:
        n = float(v)
    except (TypeError, ValueError):
        return None
    if n <= 0:
        return None
    return datetime.date(1899, 12, 30) + datetime.timedelta(days=int(n))


class Libro(object):
    """Lector mínimo de `.xlsx` con la biblioteca estándar."""

    def __init__(self, datos):
        self.z = zipfile.ZipFile(io.BytesIO(datos))
        self.compartidas = self._compartidas()
        self.hojas = self._hojas()

    def _compartidas(self):
        if 'xl/sharedStrings.xml' not in self.z.namelist():
            return []
        xml = self.z.read('xl/sharedStrings.xml').decode('utf8')
        out = []
        for si in re.findall(r'<si>(.*?)</si>', xml, re.S):
            out.append(''.join(re.findall(r'<t[^>]*>(.*?)</t>', si, re.S)))
        return [t.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>') for t in out]

    def _hojas(self):
        xml = self.z.read('xl/workbook.xml').decode('utf8')
        rels = self.z.read('xl/_rels/workbook.xml.rels').decode('utf8')
        destino = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="([^"]+)"', rels))
        out = []
        for tag in re.findall(r'<sheet\b[^>]*/?>', xml):
            nom = re.search(r'name="([^"]*)"', tag)
            rid = re.search(r'r:id="(rId\d+)"', tag)
            if not nom or not rid:
                continue
            ruta = destino.get(rid.group(1), '')
            ruta = ruta[1:] if ruta.startswith('/') else (
                'xl/' + ruta if not ruta.startswith('xl/') else ruta)
            out.append((nom.group(1).replace('&amp;', '&'), ruta))
        return out

    def filas(self, nombre):
        ruta = dict(self.hojas).get(nombre)
        if not ruta or ruta not in self.z.namelist():
            return []
        xml = self.z.read(ruta).decode('utf8')
        out = []
        for fila in re.findall(r'<row\b[^>]*>(.*?)</row>', xml, re.S):
            vals = {}
            for attrs, cuerpo in re.findall(r'<c\b([^>]*)>(.*?)</c>', fila, re.S):
                ref = re.search(r'r="([A-Z]+\d+)"', attrs)
                if not ref:
                    continue
                i = col_a_indice(ref.group(1))
                tipo = re.search(r't="(\w+)"', attrs)
                tipo = tipo.group(1) if tipo else 'n'
                v = re.search(r'<v>(.*?)</v>', cuerpo, re.S)
                if tipo == 's' and v:
                    k = int(v.group(1))
                    vals[i] = self.compartidas[k] if k < len(self.compartidas) else ''
                elif tipo == 'inlineStr':
                    vals[i] = ''.join(re.findall(r'<t[^>]*>(.*?)</t>', cuerpo, re.S))
                else:
                    vals[i] = v.group(1) if v else ''
            out.append([vals.get(i, '') for i in range(max(vals) + 1)] if vals else [])
        return out


def numero(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def leer_cuentas(lib):
    """`looker/Cuentas` — A id_cuentas · B nombre_campaña · C fecha_inicio · D fecha_fin ·
    G estado · H estado_cuentas (`SEED_MAPEO_`, `Instalar.gs`)."""
    out = {}
    for r in lib.filas('Cuentas')[1:]:
        if not r:
            continue
        g = lambda i: (r[i] if len(r) > i else '')
        k = norm(g(0))
        if not k or k in out:
            continue
        out[k] = {'nombre': norm(g(1)), 'ini': serial_a_fecha(g(2)), 'fin': serial_a_fecha(g(3)),
                  'estado': norm(g(6)), 'estado_cuentas': norm(g(7))}
    return out


def leer_cc(lib):
    """`looker/CC` — A ID Cuentas · C Base barrida · D Contactados · E Efectivos ·
    F Tipo de llamado (`SEED_MAPEO_CC_`). **`Base enviada` (B) no se mapea, a propósito.**"""
    out = []
    for r in lib.filas('CC')[1:]:
        if not r:
            continue
        g = lambda i: (r[i] if len(r) > i else '')
        k = norm(g(0))
        if not k:
            continue
        out.append({'id': k, 'barrida': numero(g(2)), 'contactados': numero(g(3)),
                    'efectivos': numero(g(4)), 'tipo': norm(g(5))})
    return out


def entra_por_solape(c, desde, hasta):
    """Copiado de `entraPorSolape_` (`Fuentes.gs`)."""
    if not c['ini']:
        return False
    derecho = c['fin'] or c['ini']
    if derecho < c['ini']:
        derecho = c['ini']
    return c['ini'] <= hasta and derecho >= desde


def duracion(c):
    return ((c['fin'] or c['ini']) - c['ini']).days



def publica(filas):
    """Los cuatro tokens: CONTEO de filas · SUMA(C) · SUMA(D) · el cociente redondeado."""
    barrida = sum(f['barrida'] for f in filas)
    contactados = sum(f['contactados'] for f in filas)
    pct = int(round(100.0 * contactados / barrida)) if barrida else None
    return (len(filas), int(barrida), int(contactados), pct)


def abrir(caso):
    ruta, sha_esperado, interno = caso[3], caso[4], caso[5]
    with open(ruta, 'rb') as f:
        crudo = f.read()
    sha = hashlib.sha256(crudo).hexdigest()
    if sha != sha_esperado:
        print('el sha de %s no coincide. No se cita ningun numero de un archivo sin identificar.'
              % ruta)
        return None
    with zipfile.ZipFile(io.BytesIO(crudo)) as z:
        return Libro(z.read(interno))


def controles_positivos(libros):
    """Los dos que tienen que aparecer. Sin ellos no hay hallazgo."""
    print('-- CONTROLES POSITIVOS --')
    cc_jul = leer_cc(libros['julio_24_30'])
    v105 = publica([f for f in cc_jul if f['id'] == '3289-JUNJDGAG'])
    print('   V-105 . 3289-JUNJDGAG sobre el export del 31/07: %s   esperado (2, 6011, 1878, 31)'
          % (v105,))
    if v105 != (2, 6011, 1878, 31):
        print('\nEL CONTROL POSITIVO NO REPRODUCE: el instrumento no lee `looker/CC`.')
        return False
    cc_ago = leer_cc(libros['agosto_14_20'])
    ice_filas = [f for f in cc_ago if f['id'] == '3488-AGOJDGAG'
                 and f['tipo'] in ('Convocatoria', 'IVR convocatoria')]
    ice = (int(sum(f['barrida'] for f in ice_filas)),
           int(sum(f['contactados'] for f in ice_filas)),
           int(sum(f['efectivos'] for f in ice_filas)))
    print('   iceberg agosto . 3488 con Convocatoria + IVR convocatoria: %s   deck lamina 7: '
          '(6294, 1362, 1146)' % (ice,))
    if ice != (6294, 1362, 1146):
        print('\nEL SEGUNDO CONTROL POSITIVO NO REPRODUCE.')
        return False
    print('   los dos reproducen: el instrumento lee `looker/CC`.\n')
    return True


def reglas_de(cuentas):
    """Las candidatas. `pertenencia` ya viene aplicada al conjunto base."""
    return [
        ('pertenencia sola', lambda f: True),
        ('+ JDGAG', lambda f: 'JDGAG' in f['id']),
        ('+ JDGAG + estado=Finalizada',
         lambda f: 'JDGAG' in f['id'] and cuentas[f['id']]['estado'] == 'Finalizada'),
        ('+ JDGAG + duracion <= 30 d',
         lambda f: 'JDGAG' in f['id'] and duracion(cuentas[f['id']]) <= 30),
        ('+ JDGAG + duracion <= 14 d',
         lambda f: 'JDGAG' in f['id'] and duracion(cuentas[f['id']]) <= 14),
    ]


def medir_periodo(caso, lib):
    etiqueta, desde, hasta, esperado = caso[0], caso[1], caso[2], caso[6]
    cuentas = leer_cuentas(lib)
    cc = leer_cc(lib)
    print('=' * 78)
    print('%s  %s .. %s' % (etiqueta, desde, hasta))
    print('  deck del equipo, Resumen Ejecutivo JM: %d campanias . %d . %d . %d %%' % esperado)
    print('  medido: `Cuentas` %d filas . `CC` %d filas, %d cuentas distintas'
          % (len(cuentas), len(cc), len(set(f['id'] for f in cc))))
    en_ventana = [k for k, v in cuentas.items() if entra_por_solape(v, desde, hasta)]
    con_tope = [k for k in en_ventana if duracion(cuentas[k]) <= TOPE_DIAS]
    print('  pertenencia: %d cuentas . con el tope de R-30 (%d d): %d'
          % (len(en_ventana), TOPE_DIAS, len(con_tope)))
    setp = set(con_tope)
    base = [f for f in cc if f['id'] in setp]
    print('  filas de `CC` en la ventana: %d, de %d cuentas'
          % (len(base), len(set(f['id'] for f in base))))
    for nombre, fn in reglas_de(cuentas):
        sel = [f for f in base if fn(f)]
        ids = sorted(set(f['id'] for f in sel))
        r = publica(sel)
        if r == esperado:
            marca = 'COINCIDE'
        elif r[0] == esperado[0]:
            marca = 'cuenta ok, VALORES NO'
        else:
            marca = 'no'
        print('   %-30s %-26s %d cuenta(s) %-32s %s'
              % (nombre, r, len(ids), ','.join(ids), marca))
    print()


def medir_deriva(libros):
    """De que columna dependen los tres desempates. Es el desempate entre los desempates."""
    print('=' * 78)
    print('-- LA DERIVA: `estado` es una FUNCION de `fecha_fin`, no un hecho aparte --')
    ca = leer_cuentas(libros['julio_24_30'])
    cb = leer_cuentas(libros['agosto_14_20'])
    comunes = sorted(set(ca) & set(cb))
    mfin = [k for k in comunes if ca[k]['fin'] != cb[k]['fin']]
    mest = [k for k in comunes if ca[k]['estado'] != cb[k]['estado']]
    print('   comunes a los dos exports: %d . `fecha_fin` movida: %d . `estado` movido: %d'
          % (len(comunes), len(mfin), len(mest)))
    for et, C, hoy in (('31/07', ca, datetime.date(2026, 7, 31)),
                       ('20/08', cb, datetime.date(2026, 8, 20))):
        n = ok = 0
        for v in C.values():
            if not v['fin']:
                continue
            n += 1
            if (v['estado'] == 'Finalizada') == (v['fin'] < hoy):
                ok += 1
        print('   export %s: «estado = Finalizada» <=> «fecha_fin < %s» en %d de %d (%.1f %%)'
              % (et, et, ok, n, 100.0 * ok / n))
    print('   las que RETROCEDIERON de Finalizada:')
    for k in sorted(mest):
        if ca[k]['estado'] == 'Finalizada' and cb[k]['estado'] != 'Finalizada':
            print('     %-16s %s -> %s . fin %s -> %s . %s'
                  % (k, ca[k]['estado'], cb[k]['estado'], ca[k]['fin'], cb[k]['fin'],
                     ca[k]['nombre'][:38]))



def buscar_publicado_agosto(lib):
    """Barrido exhaustivo: existe ALGUNA terna de filas de `CC` que sume 6.851 / 1.616?

    Es el control que convierte «no reproduce con esta regla» en «no reproduce con NINGUNA»:
    sin el barrido, un cero se lee como «probe mal las reglas».
    """
    print('=' * 78)
    print('-- BARRIDO EXHAUSTIVO: de donde salen los 6.851 / 1.616 del deck de agosto --')
    filas = leer_cc(lib)
    obj_b, obj_c = 6851, 1616
    por_cuenta = {}
    for f in filas:
        por_cuenta.setdefault(f['id'], []).append(f)
    exactas = [k for k, v in por_cuenta.items()
               if abs(sum(x['barrida'] for x in v) - obj_b) < 0.5
               and abs(sum(x['contactados'] for x in v) - obj_c) < 0.5]
    print('   cuentas enteras cuya suma da 6.851 / 1.616: %d %s' % (len(exactas), exactas))
    pares = {}
    n = len(filas)
    for i in range(n):
        for j in range(i + 1, n):
            k = (round(filas[i]['barrida'] + filas[j]['barrida']),
                 round(filas[i]['contactados'] + filas[j]['contactados']))
            pares.setdefault(k, []).append((i, j))
    ternas = []
    for k in range(n):
        falta = (round(obj_b - filas[k]['barrida']), round(obj_c - filas[k]['contactados']))
        for (i, j) in pares.get(falta, []):
            if k > j:
                ternas.append(tuple(sorted((i, j, k))))
    ternas = sorted(set(ternas))
    print('   ternas de filas (cualquier cuenta, toda la solapa) que suman 6.851 / 1.616: %d'
          % len(ternas))
    for t in ternas:
        print('     ' + ' + '.join('%s %s (%d/%d)' % (filas[i]['id'], filas[i]['tipo'],
                                                      filas[i]['barrida'], filas[i]['contactados'])
                                   for i in t))
    con3488 = [t for t in ternas if any(filas[i]['id'] == '3488-AGOJDGAG' for i in t)]
    print('   de esas, las que incluyen alguna fila de 3488-AGOJDGAG: %d' % len(con3488))
    de3488 = por_cuenta.get('3488-AGOJDGAG', [])
    fijas = [f for f in de3488 if f['tipo'] in ('Reconfirmacion', u'Reconfirmación',
                                                'IVR convocatoria')]
    if len(de3488) == 3 and len(fijas) == 2:
        rb = obj_b - sum(f['barrida'] for f in fijas)
        rc = obj_c - sum(f['contactados'] for f in fijas)
        conv = [f for f in de3488 if f not in fijas][0]
        print('   residuo si las otras dos filas de 3488 son las del export: la Convocatoria'
              ' tendria que valer %d / %d, y el export del 20/08 dice %d / %d'
              % (rb, rc, conv['barrida'], conv['contactados']))


def main():
    libros = {}
    print('== Los tres desempates de X-28, sobre los dos periodos ==\n')
    for caso in CASOS:
        lib = abrir(caso)
        if lib is None:
            return 1
        libros[caso[0]] = lib
        print('sha verificado . %s' % caso[3])
    print()
    if not controles_positivos(libros):
        return 1
    for caso in CASOS:
        medir_periodo(caso, libros[caso[0]])
    medir_deriva(libros)
    buscar_publicado_agosto(libros['agosto_14_20'])
    return 0


if __name__ == '__main__':
    sys.exit(main())
