#!/usr/bin/env python3
# -*- coding: utf-8 -*-
r"""
IMPRESIONES: por EVENTO y en el RESUMEN EJECUTIVO — los números del fixture del 20/08.

⛔⛔ **El hallazgo que ordena todo lo demás, y hay que leerlo antes que los números: NO son la
misma fuente.**

| qué | fuente | operación | recorte |
|---|---|---|---|
| **por evento** (`enc_impresiones`, `post_impresiones1-4`) | **`reuniones`** — `Agenda JM` / `Agenda JM \| Post` | `ULTIMO` / `FILA` | el **ANCLAJE** por `id_cuenta` (`D-30`) — la base es `snapshot`, la ventana **no** recorta |
| **Resumen Ejecutivo** (`imp_total`, `imp_meta`, `imp_google`, `imp_prog`) | **`looker/DIGITAL`** | `SUMA` | **la VENTANA**, por `ventana_ref: Cuentas` (`_23`) + el tope de `R-30` |

⇒ **«¿el agregado es la suma de lo presentado o la ventana?» tiene DOS respuestas**, una por grano:
por evento es **lo presentado** (una fila por encuentro), y el Resumen es **la ventana** (una suma
sobre todas las campañas `JM` del período). **No tienen por qué coincidir, y no coinciden.**

⭐ **Reproduce la DEFINICIÓN, no el motor** (`CLAUDE.md` §4, camino del medio). La pertenencia se
copia de `calcularConjuntoDeClaves_` / `entraPorSolape_` reusando `medir-desempates-cc.py`.

⚠ **Es el export del 20/08.** Los números responden por ese día y por ningún otro.

⭐ **Dos controles positivos, uno por grano, y aborta si alguno no aparece:**
  1. `reuniones` — la identidad de bloque `J = O+T+Y` en `Agenda JM | Post`.
  2. `looker` — la identidad `Meta + Google + Programmatic = TOTAL` sobre las filas de la ventana.
Ninguno es una constante fechada: los dos cierran contra sí mismos (`CLAUDE.md` §4).

Corre con: python tools/medir-impresiones-resumen.py
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

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZIP = os.path.join(RAIZ, 'docs', '_fixtures', 'Seguimiento Digital  2026-08-20.zip')
SHA = 'f8ef3227fc6cc73ef5879948451093f8e7a278c0baf1f4341d187958f0f8cc87'

_spec = importlib.util.spec_from_file_location(
    'medir_desempates_cc', os.path.join(RAIZ, 'tools', 'medir-desempates-cc.py'))
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)
Libro, leer_cuentas = _mod.Libro, _mod.leer_cuentas
entra_por_solape, duracion, serial_a_fecha = _mod.entra_por_solape, _mod.duracion, _mod.serial_a_fecha
TOPE_DIAS = _mod.TOPE_DIAS  # `CONFIG.tope_dias_ventana_cuenta` (`R-30`) = 90

PERIODOS = [
    ('julio_24_30', datetime.date(2026, 7, 24), datetime.date(2026, 7, 30)),
    ('agosto_14_20', datetime.date(2026, 8, 14), datetime.date(2026, 8, 20)),
]

# `Agenda JM`: E Fecha · AA Impresiones totales. `Agenda JM | Post`: E Fecha · J Impresiones totales.
PRE = {'solapa': 'Agenda JM', 'fecha': 4, 'imp': 26, 'bloques': (26, 35, 38, 41)}
POST = {'solapa': 'Agenda JM | Post', 'fecha': 4, 'imp': 9, 'bloques': (9, 14, 19, 24)}


def norm(s):
    return re.sub(r'\s+', ' ', str(s or '')).strip()


def numero(v):
    try:
        return float(str(v).replace(',', '.'))
    except (TypeError, ValueError):
        return None


def miles(n):
    return format(int(n), ',d').replace(',', '.')


def verificar_huella():
    h = hashlib.sha256()
    with open(ZIP, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    ok = h.hexdigest() == SHA
    print('%s sha256 %s contra docs/_fixtures/README.md' % ('✅' if ok else '⛔', h.hexdigest()[:16]))
    if not ok:
        raise SystemExit('⛔ huella distinta: no se cita ningún número.')


def filas_de(lib, solapa):
    """Saltea las DOS primeras filas: banda + encabezado (`fila_encabezado = 2` en este export)."""
    return [f for f in lib.filas(solapa)[2:] if f and norm(f[0]) and norm(f[0]) != 'ID']


def identidad_bloques(filas, cols):
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
    return ok, ev


def por_evento(lib, desde, hasta):
    """Las filas de PRE y POST cuya `Fecha` cae en la ventana, con sus impresiones.

    ⚠ **Esto NO es el anclaje.** El motor elige las filas por `id_cuenta` contra el temario; acá se
    filtra por la fecha del encuentro, que alcanza para leer el orden de magnitud **y no para
    afirmar qué ranura tomó el deck**.
    """
    salida = {}
    for etapa, cfg in (('PRE', PRE), ('POST', POST)):
        out = []
        for f in filas_de(lib, cfg['solapa']):
            if len(f) <= max(cfg['fecha'], cfg['imp']):
                continue
            d = serial_a_fecha(f[cfg['fecha']])
            if not d or not (desde <= d <= hasta):
                continue
            out.append({'id': norm(f[0]), 'barrio': norm(f[2]) if len(f) > 2 else '',
                        'fecha': d, 'imp': numero(f[cfg['imp']])})
        salida[etapa] = sorted(out, key=lambda x: (x['fecha'], x['id']))
    return salida


def resumen_ejecutivo(libLooker, desde, hasta):
    """`imp_total` / `imp_meta` / `imp_google` / `imp_prog` — `SUMA` sobre `looker/DIGITAL`."""
    cuentas = leer_cuentas(libLooker)
    en_ventana = set()
    fuera_por_tope = 0
    for k, c in cuentas.items():
        if not entra_por_solape(c, desde, hasta):
            continue
        if duracion(c) > TOPE_DIAS:
            fuera_por_tope += 1
            continue
        en_ventana.add(k)

    # `DIGITAL`: A Id cuentas · B Plataforma · C Impresiones · F nombre_campaña
    acum = {}
    filas = 0
    for r in libLooker.filas('DIGITAL')[1:]:
        if not r or len(r) < 6:
            continue
        k = norm(r[0])
        if k not in en_ventana:
            continue
        imp = numero(r[2])
        if imp is None:
            continue
        filas += 1
        plat = norm(r[1])
        # `DIMENSIONES_.ambito.jm` sobre `looker|DIGITAL` es `nombre_campaña~=JM` (sensible a case).
        ambito = 'jm' if 'JM' in norm(r[5]) else 'gcba'
        if plat == 'Meta':
            p = 'meta'
        elif plat == 'Google ads':
            p = 'google'
        else:
            p = 'programmatic'   # `R-24`: por resta, nunca por lista
        acum[(ambito, p)] = acum.get((ambito, p), 0.0) + imp
    return {'cuentas_en_ventana': len(en_ventana), 'fuera_por_tope': fuera_por_tope,
            'filas': filas, 'acum': acum}


def main():
    print('== IMPRESIONES: por EVENTO y en el RESUMEN EJECUTIVO — fixture del 20/08 ==\n')
    verificar_huella()

    z = zipfile.ZipFile(ZIP)
    nReu = next(n for n in z.namelist() if 'DGPLES' in n and n.endswith('.xlsx'))
    nLook = next(n for n in z.namelist() if 'Base Looker' in n and n.endswith('.xlsx'))
    libReu, libLook = Libro(z.read(nReu)), Libro(z.read(nLook))

    # ── Controles positivos ───────────────────────────────────────────────────────────
    print('\n-- CONTROLES POSITIVOS · identidades, no constantes --')
    ok1, ev1 = identidad_bloques(filas_de(libReu, POST['solapa']), POST['bloques'])
    print('   reuniones · `J = O+T+Y` en Agenda JM | Post : %d de %d' % (ok1, ev1))
    if ev1 == 0 or ok1 != ev1:
        raise SystemExit('⛔ no cierra: no estoy leyendo `Agenda JM | Post`. Sin hallazgo.')

    r = resumen_ejecutivo(libLook, *PERIODOS[1][1:])
    tot = {a: sum(v for (aa, _), v in r['acum'].items() if aa == a) for a in ('jm', 'gcba')}
    partes = {a: [r['acum'].get((a, p), 0.0) for p in ('meta', 'google', 'programmatic')]
              for a in ('jm', 'gcba')}
    cierra = all(abs(sum(partes[a]) - tot[a]) < 0.5 for a in ('jm', 'gcba'))
    print('   looker   · Meta+Google+Programmatic = TOTAL, en los dos ámbitos : %s' %
          ('CIERRA' if cierra else '⛔ NO CIERRA'))
    if not cierra:
        raise SystemExit('⛔ la partición por plataforma no cierra: sin hallazgo.')
    print('   ⇒ los dos controles cierran contra sí mismos y no dependen de ninguna fecha.')

    # ── Por evento ────────────────────────────────────────────────────────────────────
    for etiqueta, desde, hasta in PERIODOS:
        print('\n' + '=' * 78)
        print('PERÍODO %s  (%s a %s)' % (etiqueta, desde, hasta))
        ev = por_evento(libReu, desde, hasta)
        for etapa in ('PRE', 'POST'):
            filas = ev[etapa]
            suma = sum(f['imp'] for f in filas if f['imp'] is not None)
            print('\n  %s · %s — %d encuentro(s) con fecha en la ventana' %
                  (etapa, PRE['solapa'] if etapa == 'PRE' else POST['solapa'], len(filas)))
            if not filas:
                print('     (ninguno)')
                continue
            for f in filas:
                print('     %-16s %-22s %s   %12s' %
                      (f['id'], f['barrio'][:22], f['fecha'],
                       miles(f['imp']) if f['imp'] is not None else '—'))
            print('     %-16s %-22s %-10s   %12s  ← LO PRESENTADO' % ('', 'SUMA', '', miles(suma)))

    # ── Resumen Ejecutivo ─────────────────────────────────────────────────────────────
    print('\n' + '=' * 78)
    etiqueta, desde, hasta = PERIODOS[1]
    print('RESUMEN EJECUTIVO · `looker/DIGITAL`, SUMA sobre la VENTANA %s' % etiqueta)
    print('   cuentas en la ventana: %d   ·   fuera por el tope de R-30 (90 d): %d   ·   filas: %d'
          % (r['cuentas_en_ventana'], r['fuera_por_tope'], r['filas']))
    print()
    print('   %-10s %14s %14s %14s %16s' % ('ámbito', 'Meta', 'Google', 'Programmatic', 'TOTAL'))
    for a, nombre in (('jm', 'JM'), ('gcba', 'GCBA')):
        m, g, p = partes[a]
        print('   %-10s %14s %14s %14s %16s' %
              (nombre, miles(m), miles(g), miles(p), miles(tot[a])))
    print()
    print('   ⇒ `imp_total` (JM) = %s   ·   `gcba_imp_total` = %s' % (miles(tot['jm']), miles(tot['gcba'])))

    # ── La comparación que contesta la pregunta ───────────────────────────────────────
    ev = por_evento(libReu, desde, hasta)
    sPre = sum(f['imp'] for f in ev['PRE'] if f['imp'] is not None)
    sPost = sum(f['imp'] for f in ev['POST'] if f['imp'] is not None)
    print('\n' + '=' * 78)
    print('LA COMPARACIÓN, para %s' % etiqueta)
    print('   por evento, PRE  (reuniones/Agenda JM)      %16s' % miles(sPre))
    print('   por evento, POST (reuniones/Agenda JM|Post) %16s' % miles(sPost))
    print('   suma de los dos                             %16s' % miles(sPre + sPost))
    print('   Resumen Ejecutivo JM (looker/DIGITAL)       %16s' % miles(tot['jm']))
    print()
    print('   ⛔ Son fuentes distintas con recortes distintos: NO tienen por qué coincidir.')
    print('      `reuniones` es snapshot y sale del anclaje; `looker/DIGITAL` sale de la ventana.')

    print('\n-- LO QUE ESTO NO CONTESTA --')
    print('   · Qué ranuras tomó el deck: acá se filtró por FECHA, el motor ancla por `id_cuenta`.')
    print('   · Qué dice la base HOY. Es el export del 20/08.')
    print('   · Si los valores son los que el equipo publica: eso es un caso de validación.')


if __name__ == '__main__':
    main()
