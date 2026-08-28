#!/usr/bin/env python3
"""
El desglose de UNA cuenta, partido por `etapa` × `plataforma` — los `u1_*` y los `imp_*`.

⭐ **Las condiciones NO se reescriben: se leen de `Fuentes.gs`.** `DIMENSIONES_` es la única fuente
de qué quiere decir `etapa=pre` o `plataforma=google`, y copiarlas acá sería el instrumento que
reproduce lógica del motor y la reproduce peor (`CLAUDE.md` §4). Si alguien cambia una condición,
este script mide la nueva o falla — no una copia envejecida.

⚠ **Lo que este instrumento hace: verifica la DEFINICIÓN del negocio sobre un fixture.** No corre el
motor, no resuelve `MARCADORES` y no prueba que `datosDeMarcador_` lea así. Que la definición
produzca el número publicado es la pregunta de acá; que el motor la aplique es una corrida.

⚠ **Y es una foto del 28/08.** `digital/CAMPAÑAS_DESGLOCE_DIGITAL` es **inestable por CAMBIO**
(`R-31`), así que un número medido acá responde por el 28/08 y por ningún otro día.

Uso:
  python tools/medir-desglose-por-cuenta.py 3527-AGOJDGAG
"""
import hashlib
import importlib.util
import os
import re
import sys
import zipfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

FIXTURE = 'docs/_fixtures/Seguimiento Digital 2026-08-28.zip'
SHA_ESPERADO = '0ce0086d192bbb121c86dfe72434c40254c95c5153e8c43af9a39badfa81ac79'
INTERNO = 'Seguimiento Digital  (5).xlsx'
SOLAPA = 'CAMPAÑAS_DESGLOCE_DIGITAL'
CLAVE = 'digital|CAMPAÑAS_DESGLOCE_DIGITAL'

# Por ENCABEZADO, nunca por letra: la letra es del `MAPEO` de hoy.
COL_CUENTA = 'Id cuentas'
COL_CAMPANA = 'Nombre Campaña'
COL_PLATAFORMA = 'Plataforma'
METRICAS = ['Impresiones', 'Visualizaciones', 'Clics']

norm = lambda s: re.sub(r'\s+', ' ', str(s if s is not None else '')).strip()


def _libro_clase():
    """Reusa el lector de `.xlsx` que ya existe en vez de escribir un sexto."""
    ruta = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'medir-post-en-desglose.py')
    spec = importlib.util.spec_from_file_location('medir_post_en_desglose', ruta)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.Libro


def condiciones_de(dimension):
    """Las condiciones de una dimensión para esta solapa, **leídas de `Fuentes.gs`**."""
    txt = open('Fuentes.gs', encoding='utf8').read()
    ini = txt.find('var DIMENSIONES_')
    bloque = txt[ini:ini + 20000]
    m = re.search(r'\n  ' + dimension + r':\s*\{(.*?)\n  \},', bloque, re.S)
    if not m:
        return None
    # ⚠ `[^{}]*` y no una regex multilínea: `plataforma` escribe cada valor en varias líneas y
    # `etapa` en una sola. Los cuerpos no anidan llaves, así que esto sirve para los dos — el
    # primer intento asumía multilínea y no leyó `etapa`.
    out = {}
    for valor, cuerpo in re.findall(r"([a-z_]+):\s*\{([^{}]*)\}", m.group(1), re.S):
        cond = re.search(r"'" + re.escape(CLAVE) + r"':\s*'([^']*)'", cuerpo)
        if cond:
            out[valor] = cond.group(1)
    return out


def cumple(fila, condicion, idx):
    """Evalúa una condición del vocabulario del motor: `campo=v`, `!=`, `~=`, `!~=`, con `&&`."""
    COLUMNA = {'des_campana': COL_CAMPANA, 'des_plataforma': COL_PLATAFORMA}
    for parte in condicion.split('&&'):
        p = parte.strip()
        m = re.match(r'^([a-z_]+)\s*(!~=|~=|!=|=)\s*(.*)$', p)
        if not m:
            raise SystemExit('⛔ condición que no sé leer: %r' % p)
        campo, op, valor = m.group(1), m.group(2), m.group(3).strip()
        col = COLUMNA.get(campo)
        if col is None or col not in idx:
            raise SystemExit('⛔ no sé qué columna es %r' % campo)
        v = norm(fila[idx[col]]) if idx[col] < len(fila) else ''
        if op == '=' and v != valor: return False
        if op == '!=' and v == valor: return False
        if op == '~=' and valor.lower() not in v.lower(): return False
        if op == '!~=' and valor.lower() in v.lower(): return False
    return True


def main():
    cuenta = norm(sys.argv[1]) if len(sys.argv) > 1 else ''
    if not cuenta:
        print('⛔ falta la cuenta. Uso: python tools/medir-desglose-por-cuenta.py 3527-AGOJDGAG')
        return 1
    if not os.path.exists(FIXTURE):
        print('⛔ no está el fixture: %s' % FIXTURE)
        return 1

    sha = hashlib.sha256(open(FIXTURE, 'rb').read()).hexdigest()
    if sha != SHA_ESPERADO:
        print('⛔ el sha256 NO coincide con la tabla de huellas — el archivo es otro.')
        print('   esperado: %s\n   medido:   %s' % (SHA_ESPERADO, sha))
        return 1
    print('✅ sha256 verificado contra docs/_fixtures/README.md: %s' % sha[:16])
    print('⚠ Mide la DEFINICIÓN del negocio sobre el fixture del 28/08, no el motor.')

    etapa = condiciones_de('etapa')
    plataforma = condiciones_de('plataforma')
    if not etapa or not plataforma:
        print('⛔ no pude leer `DIMENSIONES_` de Fuentes.gs para %s' % CLAVE)
        return 1
    print('\n== condiciones LEÍDAS de Fuentes.gs ==')
    for d, m in (('etapa', etapa), ('plataforma', plataforma)):
        for k in sorted(m):
            print('   %s=%-13s -> %s' % (d, k, m[k]))

    z = zipfile.ZipFile(FIXTURE)
    interno = [n for n in z.namelist() if n.endswith(INTERNO)]
    if not interno:
        print('⛔ el zip no tiene %r' % INTERNO)
        return 1
    libro = _libro_clase()(z.read(interno[0]))
    ruta = dict(libro.hojas).get(SOLAPA)
    if not ruta:
        print('⛔ el libro no tiene la solapa %r' % SOLAPA)
        return 1

    filas = libro.filas(ruta)
    cab = [norm(c) for c in filas[0]]
    idx = {}
    for etiqueta in [COL_CUENTA, COL_CAMPANA, COL_PLATAFORMA] + METRICAS:
        if etiqueta not in cab:
            print('⛔ falta el encabezado %r. Los que hay: %s' % (etiqueta, cab))
            return 1
        idx[etiqueta] = cab.index(etiqueta)

    suyas = [f for f in filas[1:] if norm(f[idx[COL_CUENTA]] if idx[COL_CUENTA] < len(f) else '') == cuenta]
    print('\n== %s — %d fila(s) en %s ==' % (cuenta, len(suyas), SOLAPA))
    if not suyas:
        print('⛔ ninguna fila para esa cuenta. ⚠ «no hay» y «la busqué mal» se ven igual: '
              'verificá el id contra el anclaje.')
        return 1

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

    for f in suyas:
        print('   %-46s %-12s  %s' % (
            norm(f[idx[COL_CAMPANA]])[:46], norm(f[idx[COL_PLATAFORMA]]),
            '  '.join('%s=%s' % (m[:3], '{:,}'.format(int(num(f[idx[m]]))).replace(',', '.')) for m in METRICAS)))

    print('\n== los splits, con las condiciones de arriba ==')
    print('   %-26s %12s %12s %12s %6s' % ('', 'Impresiones', 'Visualizac.', 'Clics', 'filas'))
    for e in sorted(etapa):
        for p in sorted(plataforma):
            sel = [f for f in suyas if cumple(f, etapa[e], idx) and cumple(f, plataforma[p], idx)]
            tot = [sum(num(f[idx[m]]) for f in sel) for m in METRICAS]
            marca = '  ' if sel else '⛔'
            print('%s %-26s %12s %12s %12s %6d' % (
                marca, e + ' · ' + p,
                '{:,}'.format(int(tot[0])).replace(',', '.'),
                '{:,}'.format(int(tot[1])).replace(',', '.'),
                '{:,}'.format(int(tot[2])).replace(',', '.'), len(sel)))

    tot = [sum(num(f[idx[m]]) for f in suyas) for m in METRICAS]
    print('   %-26s %12s %12s %12s %6d' % (
        'TOTAL (sin dimensiones)',
        '{:,}'.format(int(tot[0])).replace(',', '.'),
        '{:,}'.format(int(tot[1])).replace(',', '.'),
        '{:,}'.format(int(tot[2])).replace(',', '.'), len(suyas)))
    print('\n⭐ La identidad que se puede exigir en cada corrida: los seis splits suman el TOTAL.')
    print('⚠ Un split con 0 filas sale `sin dato` en el deck, NO cero — salvo `CONTEO`.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
