#!/usr/bin/env python3
"""
¿Por qué el Resumen Ejecutivo de JM publica 85.557 impresiones y el de GCBA 132.758.007?

⛔ **El síntoma, del deck del 28/08:** `L-031` (JM) publica `-85.557-` y `L-032` (GCBA)
`-132.758.007-`. La identidad interna cierra en las dos —`meta + google + prog = total`—, así que
**el cableado no inventó nada**: lo que está en discusión es **de qué filas sale cada uno**.

⭐ **La pregunta concreta, y es una sola:** `DIMENSIONES_` traduce `ambito=jm` sobre `looker|DIGITAL`
a `nombre_campaña ~= JM`. **¿Cuántas de las campañas de JM llevan «JM» en el nombre?**

⚠ **Esto NO reproduce la ventana** —pertenencia a `looker/Cuentas` y el tope de 90 días de `R-30`
viven en `Fuentes.gs`— y por eso el reporte compara **la solapa entera**. Si el total de la solapa
se parece a lo publicado, la ventana no está recortando y el hallazgo es el corte; si no se parece,
son dos preguntas y hay que separarlas.

Uso:
  python tools/medir-ambito-looker.py
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
LIBRO, SOLAPA = 'Base Looker (4).xlsx', 'DIGITAL'

norm = lambda s: re.sub(r'\s+', ' ', str(s if s is not None else '')).strip()


def _libro_clase():
    ruta = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'medir-post-en-desglose.py')
    spec = importlib.util.spec_from_file_location('m', ruta)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.Libro


def num(v):
    if v is None or v == '':
        return 0.0
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).strip()
    try:
        return float(s)
    except ValueError:
        pass
    s = s.replace('.', '').replace(',', '.')
    try:
        return float(s)
    except ValueError:
        return 0.0


def plataforma(v):
    """La traducción REAL de `DIMENSIONES_`, copiada de `Fuentes.gs` — no inventada.

    ⛔ El primer intento comparó contra `meta`/`google`/`programmatic` en minúsculas y dio **cero
    en las tres con un total de 15,4 M**: la columna trae `Meta`, `Google ads`, `DV360`, `TikTok`,
    `Twitter`, `Twitch`, `Uber`, `Mercado Libre`. Un corte que no matchea **no da error: da cero**.

    ⭐ Y `programmatic` no es `DV360`: es **el complemento** —`Plataforma!=Meta && !=Google ads`—,
    así que se lleva TikTok, Twitter y las demás. Eso es del motor, no de este medidor.
    """
    if v == 'Meta':
        return 'meta'
    if v == 'Google ads':
        return 'google'
    return 'programmatic'


def main():
    h = hashlib.sha256(open(FIXTURE, 'rb').read()).hexdigest()
    print('sha256 del fixture: ' + h)
    if h != SHA_ESPERADO:
        print('⛔ NO coincide con la tabla de huellas. Un fixture anónimo no es citable.')
        return 1
    print('✅ coincide con la tabla de huellas de docs/_fixtures/README.md\n')

    z = zipfile.ZipFile(FIXTURE)
    coincide = [n for n in z.namelist() if n.endswith(LIBRO)]
    if not coincide:
        print('⛔ el zip no tiene %r' % LIBRO)
        return 1
    libro = _libro_clase()(z.read(coincide[0]))
    hojas = dict(libro.hojas)
    if SOLAPA not in hojas:
        print('⛔ no está la solapa %r. Hay: %s' % (SOLAPA, sorted(hojas)))
        return 1
    filas = libro.filas(hojas[SOLAPA])
    enc = [norm(c) for c in filas[0]]

    # ⚠ La ÚLTIMA aparición de los nombres que se repiten — mismo criterio que el medidor de
    # looker-vs-desglose y que `des_campana_2` en `MAPEO`.
    def idx(nombre, ultima=False):
        if nombre not in enc:
            print('⛔ falta la columna %r. Hay: %s' % (nombre, enc[:25]))
            raise SystemExit(1)
        return len(enc) - 1 - enc[::-1].index(nombre) if ultima else enc.index(nombre)

    iN, iP = idx('nombre_campaña', True), idx('Plataforma')
    iE, iI = idx('estado', True), idx('Impresiones')

    por_ambito = defaultdict(lambda: defaultdict(float))
    filas_ambito = defaultdict(int)
    nombres_jm, nombres_gcba = defaultdict(float), defaultdict(float)
    activas = 0
    for f in filas[1:]:
        if len(f) <= max(iN, iP, iE, iI):
            continue
        if norm(f[iE]).lower() != 'activa':
            continue
        activas += 1
        nom, plat, imp = norm(f[iN]), plataforma(norm(f[iP])), num(f[iI])
        # ⭐ La regla REAL del motor, copiada de DIMENSIONES_: `~=` es «contiene», sensible a
        # mayúsculas por R-10 (que preserva case). No se inventa un criterio nuevo.
        es_jm = 'JM' in nom
        por_ambito['jm' if es_jm else 'gcba'][plat] += imp
        filas_ambito['jm' if es_jm else 'gcba'] += 1
        (nombres_jm if es_jm else nombres_gcba)[nom] += imp

    print('Solapa `looker|DIGITAL`, filas con estado=Activa: %d\n' % activas)
    print('%-8s %-6s %14s %14s %14s %16s' % ('ámbito', 'filas', 'meta', 'google', 'programmatic', 'TOTAL'))
    print('-' * 80)
    for amb in ('jm', 'gcba'):
        d = por_ambito[amb]
        tot = sum(d.values())
        print('%-8s %-6d %14s %14s %14s %16s' % (
            amb, filas_ambito[amb], f'{d.get("meta",0):,.0f}', f'{d.get("google",0):,.0f}',
            f'{d.get("programmatic",0):,.0f}', f'{tot:,.0f}'))

    print('\n⭐ Las campañas que el corte manda a JM (nombre contiene «JM»):')
    for n, v in sorted(nombres_jm.items(), key=lambda x: -x[1])[:12]:
        print('   %16s  %s' % (f'{v:,.0f}', n[:80]))
    if not nombres_jm:
        print('   (ninguna)')

    print('\n⛔ Las 12 más grandes que el corte manda a GCBA — ¿alguna es de JM?')
    for n, v in sorted(nombres_gcba.items(), key=lambda x: -x[1])[:12]:
        print('   %16s  %s' % (f'{v:,.0f}', n[:80]))

    print('\n⚠ Lo que esto NO contesta:')
    print('   · La ventana. No se reproduce el recorte por pertenencia ni el tope de 90 días de')
    print('     R-30: son del motor y reimplementarlos sería reproducir su lógica peor.')
    print('   · Cuál es el universo CORRECTO de JM. Esto dice qué hace el corte de hoy.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
