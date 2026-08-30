#!/usr/bin/env python3
"""
Parte 0 del `2026-08-30_1` — verificar las seis premisas del corte JM/GCBA por `Id cuentas`.

⛔ **Sobre qué artefacto corre esto, que es lo primero que hay que leer.** El prompt pide medir
«contra las hojas vivas». **Code no tiene ese camino**: mide sobre el fixture del 28/08, que es una
foto fechada (`CLAUDE.md` §4, camino del medio). Un número de acá responde por el 28/08 y por
ningún otro día — y `looker/DIGITAL` y el desglose son **inestables por CAMBIO** (`R-31`).

⚠ **Este instrumento mide sobre el fixture del 28/08 y ésa es su fecha.** Los artefactos del 30/08
llegaron después y se miden en `medir-corte-parte-b.py` y `medir-looker-atraso-y-config.py`.

⛔⛔ **Rev. 4 — migrado a `leer_xlsx_por_referencia`.** El lector anterior no reconocía el
autocierre de celda y corría los valores una columna. Ver `CLAUDE.md` §4.

Sólo lectura. No escribe en ninguna planilla.

Uso:
  python tools/medir-corte-id-cuentas.py
"""
import hashlib
import importlib.util
import os
import re
import sys
import zipfile
from collections import Counter, defaultdict

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

FIXTURE = 'docs/_fixtures/Seguimiento Digital 2026-08-28.zip'
SHA_ESPERADO = '0ce0086d192bbb121c86dfe72434c40254c95c5153e8c43af9a39badfa81ac79'

LOOKER = ('Base Looker (4).xlsx', 'DIGITAL')
DESGLOSE = ('Seguimiento Digital  (5).xlsx', 'CAMPAÑAS_DESGLOCE_DIGITAL')

norm = lambda s: re.sub(r'\s+', ' ', str(s if s is not None else '')).strip()


sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from leer_xlsx_por_referencia import Hoja  # noqa: E402


LETRAS = [chr(65 + i) for i in range(26)]


def abrir_hoja(origen, elegir):
    """⛔ Rev. 4 — se dejó de usar la clase `Libro` de `medir-post-en-desglose.py`: su patrón de
    celda no reconoce el autocierre `<c r="S2" s="2"/>` y los valores sangran una columna hacia
    atrás, en silencio. Este lector está verificado contra `openpyxl`."""
    h = Hoja(origen, elegir)
    ancho = 0
    for f in h.filas:
        for L in f:
            if len(L) == 1:
                ancho = max(ancho, ord(L) - 64)
    return [[norm(f.get(LETRAS[i], '')) for i in range(ancho)] for f in h.filas]


def num(v):
    """⚠ El `.xlsx` guarda los números CRUDOS, siempre con punto decimal y sin separador de
    miles — `looker/DIGITAL` trae `1170879.0` donde el desglose trae `1170879`. Un normalizador
    que borre el punto «para sacar el separador de miles» multiplica cada valor por 10 y produce
    una diferencia de 7× entre dos columnas idénticas. Pasó en la primera corrida de este
    instrumento; el síntoma fue un total implausible, no un error."""
    if v is None or v == '':
        return 0.0
    if isinstance(v, (int, float)):
        return float(v)
    try:
        return float(str(v).strip())
    except ValueError:
        return 0.0


def col(i):
    """Índice 0-based a letra de columna."""
    s, i = '', i + 1
    while i:
        i, r = divmod(i - 1, 26)
        s = chr(65 + r) + s
    return s


def abrir(z, _, libro, solapa):
    import io as _io
    return abrir_hoja(_io.BytesIO(z.read(libro)), lambda n: n == solapa)


def encabezado(filas, ancla='Id cuentas'):
    """Fila de encabezado = la primera que contiene el ancla. No se asume la 1."""
    for i, f in enumerate(filas[:30]):
        if any(norm(c).lower() == ancla.lower() for c in f):
            return i, [norm(c) for c in f]
    raise SystemExit('⛔ no se encontró la fila de encabezado con el ancla %r' % ancla)


def idx(cab, titulo):
    for i, c in enumerate(cab):
        if c.lower() == titulo.lower():
            return i
    return -1


def bloque(t):
    print('\n' + '=' * 78)
    print(t)
    print('=' * 78)


# ---------------------------------------------------------------- huella
bloque('HUELLA DEL FIXTURE — se verifica ANTES de citar un número')
datos = open(FIXTURE, 'rb').read()
sha = hashlib.sha256(datos).hexdigest()
print('archivo : %s' % FIXTURE)
print('bytes   : %s' % format(len(datos), ',').replace(',', '.'))
print('sha256  : %s' % sha)
print('esperado: %s' % SHA_ESPERADO)
print('%s' % ('✅ coincide con la tabla de huellas del README' if sha == SHA_ESPERADO
              else '⛔ NO COINCIDE — el archivo es anónimo, no se cita ningún número'))
if sha != SHA_ESPERADO:
    raise SystemExit(1)

z = zipfile.ZipFile(FIXTURE)
Libro = None

fl = abrir(z, Libro, *LOOKER)
fd = abrir(z, Libro, *DESGLOSE)
il, cabl = encabezado(fl)
idg, cabd = encabezado(fd)
datos_l = [f for f in fl[il + 1:] if any(norm(c) for c in f)]
datos_d = [f for f in fd[idg + 1:] if any(norm(c) for c in f)]

# ---------------------------------------------------------------- P1
bloque('P1 · ENCABEZADOS REALES — el prompt dice 9 y 26 columnas')
for nombre, cab, i, filas in (('looker/DIGITAL', cabl, il, datos_l),
                              ('digital/CAMPAÑAS_DESGLOCE_DIGITAL', cabd, idg, datos_d)):
    llenas = [(j, c) for j, c in enumerate(cab) if c]
    print('\n%s — encabezado en la fila %d, %d columnas con título (ancho crudo %d)'
          % (nombre, i + 1, len(llenas), len(cab)))
    for j, c in llenas:
        print('   %-4s %s' % (col(j), c))

# ---------------------------------------------------------------- P2
bloque('P2 · ¿LAS DOS SOLAPAS SON LA MISMA TABLA? — el prompt dice 5.149 filas en cada una')
jl_id, jl_pl, jl_imp = idx(cabl, 'Id cuentas'), idx(cabl, 'Plataforma'), idx(cabl, 'Impresiones')
jd_id, jd_pl, jd_imp = idx(cabd, 'Id cuentas'), idx(cabd, 'Plataforma'), idx(cabd, 'Impresiones')
print('columnas usadas — looker: Id=%s Plataforma=%s Impresiones=%s'
      % (col(jl_id), col(jl_pl), col(jl_imp)))
print('columnas usadas — desglose: Id=%s Plataforma=%s Impresiones=%s'
      % (col(jd_id), col(jd_pl), col(jd_imp)))
print('\nfilas de datos — looker/DIGITAL: %d · desglose: %d%s'
      % (len(datos_l), len(datos_d),
         '  ✅ iguales' if len(datos_l) == len(datos_d) else '  ⚠ DISTINTAS'))

cl = Counter(norm(f[jl_pl]) if jl_pl < len(f) else '' for f in datos_l)
cd = Counter(norm(f[jd_pl]) if jd_pl < len(f) else '' for f in datos_d)
print('\ndistribución de Plataforma (valores crudos):')
print('   %-22s %10s %10s' % ('plataforma', 'looker', 'desglose'))
for k in sorted(set(cl) | set(cd), key=lambda x: -(cl.get(x, 0) + cd.get(x, 0))):
    m = '' if cl.get(k, 0) == cd.get(k, 0) else '   ⚠'
    print('   %-22s %10d %10d%s' % (repr(k)[1:-1] or '(vacío)', cl.get(k, 0), cd.get(k, 0), m))

sl = sum(num(f[jl_imp]) if jl_imp < len(f) else 0 for f in datos_l)
sd = sum(num(f[jd_imp]) if jd_imp < len(f) else 0 for f in datos_d)
print('\nsuma de Impresiones — looker: %s · desglose: %s · diferencia: %s'
      % (format(int(sl), ',').replace(',', '.'), format(int(sd), ',').replace(',', '.'),
         format(int(sd - sl), ',').replace(',', '.')))

# de qué filas sale la diferencia: se agrupa por Id cuentas
gl, gd = defaultdict(float), defaultdict(float)
for f in datos_l:
    gl[norm(f[jl_id]) if jl_id < len(f) else ''] += num(f[jl_imp]) if jl_imp < len(f) else 0
for f in datos_d:
    gd[norm(f[jd_id]) if jd_id < len(f) else ''] += num(f[jd_imp]) if jd_imp < len(f) else 0
difs = [(k, gd.get(k, 0) - gl.get(k, 0)) for k in set(gl) | set(gd) if abs(gd.get(k, 0) - gl.get(k, 0)) > 0.5]
print('\n`Id cuentas` cuyo total de Impresiones difiere entre las dos solapas: %d de %d distintos'
      % (len(difs), len(set(gl) | set(gd))))
for k, d in sorted(difs, key=lambda x: -abs(x[1]))[:15]:
    print('   %-28s looker %14s   desglose %14s   Δ %+14s'
          % (k, format(int(gl.get(k, 0)), ',').replace(',', '.'),
             format(int(gd.get(k, 0)), ',').replace(',', '.'),
             format(int(d), ',').replace(',', '.')))
print('   sólo en looker: %d · sólo en desglose: %d'
      % (len(set(gl) - set(gd)), len(set(gd) - set(gl))))

# ---------------------------------------------------------------- P3
bloque('P3 · FORMA DEL `Id cuentas` — el prompt propone `NNNN-MMMSSSSS`')
FORMA = re.compile(r'^(\d+)-([A-Za-z]{3})([A-Za-z]{5})$')
for nombre, filas, j in (('looker/DIGITAL', datos_l, jl_id),
                         ('digital/CAMPAÑAS_DESGLOCE_DIGITAL', datos_d, jd_id)):
    vals = [norm(f[j]) if j < len(f) else '' for f in filas]
    ok = [v for v in vals if FORMA.match(v)]
    mal = [v for v in vals if not FORMA.match(v)]
    print('\n%s — %d filas · respetan la forma: %d · NO la respetan: %d'
          % (nombre, len(vals), len(ok), len(mal)))
    if mal:
        print('   los que no respetan, por valor crudo (top 12 de %d distintos):'
              % len(set(mal)))
        for v, n in Counter(mal).most_common(12):
            print('      %-40s %d fila(s)' % (repr(v)[1:-1] or '(vacío)', n))

# ---------------------------------------------------------------- P4
bloque('P4 · ¿`looker/DIGITAL` TIENE COLUMNA TEMPORAL? — el prompt dice que J–S están vacías')
ancho = max(len(f) for f in datos_l)
print('ancho máximo de fila en los datos: %d columnas (hasta %s)' % (ancho, col(ancho - 1)))
for j in range(ancho):
    llenas = sum(1 for f in datos_l if j < len(f) and norm(f[j]))
    tit = cabl[j] if j < len(cabl) else ''
    marca = '' if llenas else '   ← vacía en las %d filas' % len(datos_l)
    print('   %-4s %-28s %6d con valor%s' % (col(j), tit or '(sin título)', llenas, marca))

# ---------------------------------------------------------------- cierre
bloque('LO QUE ESTE INSTRUMENTO NO CONTESTA')
print("""- Nada sobre la hoja VIVA. Esto es el fixture del 28/08; `R-31` mide a estas dos solapas
  como inestables por CAMBIO, así que un valor de acá no es el de hoy.
- P5 (cableado de los ocho `imp_*`) y P6 (el período) no viven en las bases: son hojas de
  registro. Se miden aparte, contra el snapshot fechado y el código, y así se declaran.
- Ninguna afirmación sobre el grano semanal: ninguna de las dos solapas lo guarda.""")
