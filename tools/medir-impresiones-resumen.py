#!/usr/bin/env python3
# -*- coding: utf-8 -*-
r"""
IMPRESIONES: por EVENTO, en el RESUMEN EJECUTIVO, y contra el DECK del equipo.

⛔⛔ **El hallazgo que ordena todo lo demás: NO son la misma fuente.**

| qué | fuente | operación | recorte |
|---|---|---|---|
| **por evento** (`enc_impresiones`, `post_impresiones1-4`) | **`reuniones`** — `Agenda JM` / `Agenda JM \| Post` | `ULTIMO` / `FILA` | el **ANCLAJE** por `id_cuenta` (`D-30`); la base es `snapshot` y la ventana **no** recorta |
| **Resumen Ejecutivo** (`imp_total`, `imp_meta`, `imp_google`, `imp_prog`) | **`looker/DIGITAL`** | `SUMA` | **la VENTANA**, por `ventana_ref: Cuentas` (`_23`) + el tope de `R-30` |

⇒ *«¿el agregado es la suma de lo presentado o la ventana?»* tiene **dos respuestas**, una por
grano. **No tienen por qué coincidir, y no coinciden.**

⭐⭐ **Cada período se mide contra el fixture de SU PROPIA SEMANA** — `julio_24_30` contra el export
del 31/07 y `agosto_14_20` contra el del 20/08 —, porque *un fixture es una foto fechada y su fecha
es parte del resultado* (`CLAUDE.md` §4).

⛔ **Con una excepción que NO se puede evitar y por eso se declara en cada tabla: el export del
31/07 NO trae la base `reuniones`.** Sus cinco archivos son `Base Looker`, `M2`, `RDV`,
`Seguimiento Digital` y los dos decks. Así que **el detalle POR EVENTO de julio sale igual del
export del 20/08**, con tres semanas más de acumulación encima. Es un límite del material, no una
elección.

⭐ **Y al lado va lo que publica el DECK DEL EQUIPO** de esa misma semana, que viaja en el mismo
`.zip`. Es lo único que convierte *«el motor calcularía X»* en *«el equipo publicó Y»*.

⚠ **Un deck del equipo no es una foto de la base**: el equipo poda y reescribe (`X-18`). Una
diferencia contra el deck es un dato a explicar, no automáticamente un bug.

⭐ **Controles positivos, todos IDENTIDADES y ninguno una constante fechada:**
  · `reuniones` — `J = O+T+Y` en `Agenda JM | Post`.
  · `looker` — `Meta + Google + Programmatic = TOTAL`, en los dos ámbitos, en cada fixture.

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
F = os.path.join(RAIZ, 'docs', '_fixtures')

_spec = importlib.util.spec_from_file_location(
    'medir_desempates_cc', os.path.join(RAIZ, 'tools', 'medir-desempates-cc.py'))
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)
Libro, leer_cuentas = _mod.Libro, _mod.leer_cuentas
entra_por_solape, duracion, serial_a_fecha = _mod.entra_por_solape, _mod.duracion, _mod.serial_a_fecha
TOPE_DIAS = _mod.TOPE_DIAS  # `CONFIG.tope_dias_ventana_cuenta` (`R-30`) = 90

# (período, desde, hasta, zip, sha256, marca del deck de esa semana)
CASOS = [
    ('julio_24_30', datetime.date(2026, 7, 24), datetime.date(2026, 7, 30),
     os.path.join(F, 'Informe 2026-07-31.zip'),
     '97310e16f49d2726e0b46d515f13d68d84f5ba13791c7bc57b05c8495e9a0ecb',
     'Informe semanal JM'),
    ('agosto_14_20', datetime.date(2026, 8, 14), datetime.date(2026, 8, 20),
     os.path.join(F, 'Seguimiento Digital  2026-08-20.zip'),
     'f8ef3227fc6cc73ef5879948451093f8e7a278c0baf1f4341d187958f0f8cc87',
     'Informe semanal JM'),
]
# `reuniones` sólo existe en el export del 20/08. Ver el encabezado.
ZIP_REUNIONES = os.path.join(F, 'Seguimiento Digital  2026-08-20.zip')

PRE = {'solapa': 'Agenda JM', 'fecha': 4, 'imp': 26, 'bloques': (26, 35, 38, 41)}
POST = {'solapa': 'Agenda JM | Post', 'fecha': 4, 'imp': 9, 'bloques': (9, 14, 19, 24)}

RE_NUM = re.compile(r'\b\d{1,3}(?:\.\d{3})+\b')


def norm(s):
    return re.sub(r'\s+', ' ', str(s or '')).strip()


def numero(v):
    try:
        return float(str(v).replace(',', '.'))
    except (TypeError, ValueError):
        return None


def miles(n):
    return format(int(n), ',d').replace(',', '.')


def sha_de(ruta):
    h = hashlib.sha256()
    with open(ruta, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def filas_de(lib, solapa):
    """Saltea banda + encabezado: en este export `fila_encabezado = 2`."""
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
    """Filas de PRE y POST con `Fecha` en la ventana.

    ⚠ **Esto NO es el anclaje.** El motor elige por `id_cuenta` contra el temario; acá se filtra
    por la fecha del encuentro. Alcanza para el orden de magnitud y **no** para afirmar qué ranura
    tomó el deck — de hecho el temario declara encuentros ANTERIORES a la ventana.
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
    """`imp_*` — `SUMA` sobre `looker/DIGITAL`, recortada por la ventana vía `Cuentas`."""
    cuentas = leer_cuentas(libLooker)
    en_ventana, fuera = set(), 0
    for k, c in cuentas.items():
        if not entra_por_solape(c, desde, hasta):
            continue
        if duracion(c) > TOPE_DIAS:
            fuera += 1
            continue
        en_ventana.add(k)

    acum, filas = {}, 0
    for r in libLooker.filas('DIGITAL')[1:]:
        if not r or len(r) < 9:
            continue
        if norm(r[0]) not in en_ventana:
            continue
        # ⛔⛔ `MARCADORES.filtro = estado=Activa` — la columna I de `DIGITAL`. **Faltaba en la
        # primera versión de este instrumento y era TODO el error**: sin ella el total de julio
        # daba 46.416.590 contra los 7.286.628 reales, y las tres plataformas 3 a 8 veces de más.
        # `estado=Activa` es una restricción TÉCNICA y por eso vive en `filtro` y no en
        # `dimensiones` (`CLAUDE.md` §2). De las 4.547 filas, sólo 932 están `Activa`.
        if norm(r[8]) != 'Activa':
            continue
        imp = numero(r[2])
        if imp is None:
            continue
        filas += 1
        plat = norm(r[1])
        # `DIMENSIONES_.ambito.jm` sobre `looker|DIGITAL` es `nombre_campaña~=JM`, sensible a case.
        ambito = 'jm' if 'JM' in norm(r[5]) else 'gcba'
        # `R-24`: programmatic por RESTA, nunca por lista.
        p = 'meta' if plat == 'Meta' else ('google' if plat == 'Google ads' else 'programmatic')
        acum[(ambito, p)] = acum.get((ambito, p), 0.0) + imp
    return {'cuentas': len(en_ventana), 'fuera_por_tope': fuera, 'filas': filas, 'acum': acum}


def numeros_del_deck(ruta_zip, marca):
    """Los números con separador de miles de las láminas que hablan del Resumen Ejecutivo."""
    z = zipfile.ZipFile(ruta_zip)
    pptx = [n for n in z.namelist() if n.endswith('.pptx') and marca in os.path.basename(n)]
    if not pptx:
        return None, []
    deck = zipfile.ZipFile(__import__('io').BytesIO(z.read(pptx[0])))
    laminas = sorted(n for n in deck.namelist()
                     if n.startswith('ppt/slides/slide') and n.endswith('.xml'))
    encontrados = []
    for n in laminas:
        xml = deck.read(n).decode('utf8', 'ignore')
        texto = ' '.join(re.findall(r'<a:t>(.*?)</a:t>', xml, re.S))
        if 'Resumen' not in texto:
            continue
        nums = sorted({m for m in RE_NUM.findall(texto)},
                      key=lambda s: -int(s.replace('.', '')))
        encontrados.append((os.path.basename(n), texto[:90], nums[:12]))
    return os.path.basename(pptx[0]), encontrados


def main():
    print('== IMPRESIONES: por EVENTO, RESUMEN EJECUTIVO y DECK del equipo ==\n')

    # `reuniones` — una sola vez, porque sólo existe en un export.
    sha = sha_de(ZIP_REUNIONES)
    print('✅ sha256 %s · %s' % (sha[:16], os.path.basename(ZIP_REUNIONES)))
    zr = zipfile.ZipFile(ZIP_REUNIONES)
    libReu = Libro(zr.read(next(n for n in zr.namelist()
                                if 'DGPLES' in n and n.endswith('.xlsx'))))
    ok, ev = identidad_bloques(filas_de(libReu, POST['solapa']), POST['bloques'])
    print('   CONTROL POSITIVO · `J = O+T+Y` en Agenda JM | Post : %d de %d' % (ok, ev))
    if ev == 0 or ok != ev:
        raise SystemExit('⛔ no cierra: no estoy leyendo `Agenda JM | Post`. Sin hallazgo.')

    for etiqueta, desde, hasta, ruta, sha_esp, marca in CASOS:
        s = sha_de(ruta)
        print('\n' + '=' * 78)
        print('PERÍODO %s  (%s a %s)' % (etiqueta, desde, hasta))
        print('   fixture: %s' % os.path.basename(ruta))
        print('   %s sha256 %s' % ('✅' if s == sha_esp else '⛔', s[:16]))
        if s != sha_esp:
            raise SystemExit('⛔ huella distinta: no se cita ningún número.')

        z = zipfile.ZipFile(ruta)
        libLook = Libro(z.read(next(n for n in z.namelist()
                                    if 'Base Looker' in n and n.endswith('.xlsx'))))

        # ── por evento ────────────────────────────────────────────────────────────────
        mismo = os.path.abspath(ruta) == os.path.abspath(ZIP_REUNIONES)
        print('\n  ── POR EVENTO · `reuniones` ' +
              ('' if mismo else '⛔ desde el export del 20/08: ESTE fixture no trae `reuniones`'))
        ev2 = por_evento(libReu, desde, hasta)
        for etapa in ('PRE', 'POST'):
            filas = ev2[etapa]
            suma = sum(f['imp'] for f in filas if f['imp'] is not None)
            print('\n     %s · %s — %d encuentro(s) con fecha en la ventana' %
                  (etapa, PRE['solapa'] if etapa == 'PRE' else POST['solapa'], len(filas)))
            for f in filas:
                print('        %-16s %-20s %s  %14s' %
                      (f['id'], f['barrio'][:20], f['fecha'],
                       miles(f['imp']) if f['imp'] is not None else '—'))
            if filas:
                print('        %-16s %-20s %-10s  %14s  ← LO PRESENTADO' % ('', 'SUMA', '', miles(suma)))
            else:
                print('        (ninguno)')

        # ── resumen ejecutivo ─────────────────────────────────────────────────────────
        r = resumen_ejecutivo(libLook, desde, hasta)
        tot = {a: sum(v for (aa, _), v in r['acum'].items() if aa == a) for a in ('jm', 'gcba')}
        partes = {a: [r['acum'].get((a, p), 0.0) for p in ('meta', 'google', 'programmatic')]
                  for a in ('jm', 'gcba')}
        cierra = all(abs(sum(partes[a]) - tot[a]) < 0.5 for a in ('jm', 'gcba'))
        print('\n  ── RESUMEN EJECUTIVO · `looker/DIGITAL`, SUMA sobre la VENTANA')
        print('     CONTROL POSITIVO · Meta+Google+Programmatic = TOTAL : %s'
              % ('CIERRA' if cierra else '⛔ NO CIERRA'))
        if not cierra:
            raise SystemExit('⛔ la partición por plataforma no cierra: sin hallazgo.')
        print('     %d cuenta(s) en ventana · %d fuera por el tope de R-30 · %d fila(s)'
              % (r['cuentas'], r['fuera_por_tope'], r['filas']))
        print()
        print('     %-8s %14s %14s %14s %16s' % ('ámbito', 'Meta', 'Google', 'Programmatic', 'TOTAL'))
        for a, nombre in (('jm', 'JM'), ('gcba', 'GCBA')):
            m, g, p = partes[a]
            print('     %-8s %14s %14s %14s %16s' %
                  (nombre, miles(m), miles(g), miles(p), miles(tot[a])))

        # ⭐⭐ El control positivo FUERTE de julio: reproducir CASOS VALIDADOS. `CLAUDE.md` §1 —
        # *un caso `exacto` es un número esperado y el control es reproducirlo, no volver a
        # medirlo*. No caduca porque va atado a un fixture con `sha256` verificado.
        if etiqueta == 'julio_24_30':
            esperado = (679647, 614140, 5992841)   # `A-01` · `A-06` · `A-07`
            medido = tuple(int(round(x)) for x in partes['jm'])
            iguales = medido == esperado
            print('\n     %s CASOS VALIDADOS `A-01`/`A-06`/`A-07` (meta·google·prog): %s'
                  % ('✅' if iguales else '⛔', ' · '.join(miles(x) for x in medido)))
            if not iguales:
                print('        esperado %s' % ' · '.join(miles(x) for x in esperado))
                raise SystemExit('⛔ no reproduce los casos validados: el instrumento está mal.')

        # ── el deck del equipo ────────────────────────────────────────────────────────
        nombre_deck, laminas = numeros_del_deck(ruta, marca)
        print('\n  ── LO QUE PUBLICA EL DECK DEL EQUIPO')
        if not nombre_deck:
            print('     (no hay deck de JM en este .zip)')
        else:
            print('     %s' % nombre_deck)
            if not laminas:
                print('     ⚠ ninguna lámina dice «Resumen»: no se puede cruzar acá.')
            for n, texto, nums in laminas:
                print('     · %s — %s' % (n, texto.replace('\n', ' ')[:70]))
                print('       números: %s' % (', '.join(nums) if nums else '(ninguno con miles)'))

        # ── la comparación ────────────────────────────────────────────────────────────
        sPre = sum(f['imp'] for f in ev2['PRE'] if f['imp'] is not None)
        sPost = sum(f['imp'] for f in ev2['POST'] if f['imp'] is not None)
        print('\n  ── LA COMPARACIÓN')
        print('     por evento PRE  %16s   %s' % (miles(sPre), '' if mismo else '(export 20/08)'))
        print('     por evento POST %16s   %s' % (miles(sPost), '' if mismo else '(export 20/08)'))
        print('     Resumen JM      %16s   (este fixture)' % miles(tot['jm']))

    print('\n' + '=' * 78)
    print('-- LO QUE ESTO NO CONTESTA --')
    print('   · Qué ranuras tomó el deck: acá se filtró por FECHA, el motor ancla por `id_cuenta`.')
    print('   · El detalle por evento de julio sale del export del 20/08, no del de su semana:')
    print('     ese `.zip` no trae `reuniones`. Tres semanas más de acumulación encima.')
    print('   · Un deck del equipo no es una foto de la base: el equipo poda y reescribe (`X-18`).')


if __name__ == '__main__':
    main()
