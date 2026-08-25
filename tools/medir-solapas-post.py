#!/usr/bin/env python3
"""
Las TRES solapas de la base `reuniones` que podrían tener el POST — medidas sobre el fixture.

⛔ **Por qué existe, y va primero:** el dato del usuario es que *sólo JM tiene POST*. Eso dice
**quién genera** esos datos, **no en qué solapa están cargados** — son dos cosas distintas, y hasta
hoy el proyecto trató a la segunda como si se dedujera de la primera. Si la fuente está mal elegida,
el `id_cuenta` que se venía persiguiendo **no es el eslabón**.

⚠ **Esto NO reimplementa lógica del motor.** Lee el dato **crudo** del `.xlsx` y busca dos ids
literales; no parsea filtros, no resuelve `MAPEO`, no calcula ninguna operación. La regla de
`CLAUDE.md` §4 —*cuando la lógica existe en un `.gs`, se extrae la función real*— aplica a
reproducir un cálculo, y acá no hay cálculo: hay lectura.

⚠ **Un fixture es una foto fechada, y su fecha es parte del resultado.** Todo lo que salga de acá
responde por el export del **20/08/2026** y por ningún otro día.

Corre con: python tools/medir-solapas-post.py
"""
import hashlib
import io
import re
import sys
import zipfile

# La consola de Windows abre en `cp1252` y los glifos del reporte no entran. Se fuerza UTF-8 en la
# salida: un instrumento que muere imprimiendo su propio veredicto no informa nada.
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

FIXTURE = 'docs/_fixtures/Seguimiento Digital  2026-08-20.zip'
INTERNO = 'Seguimiento Digital  2026-08-20/DGPLES _ Seguimiento ECVs (1).xlsx'

# ⭐ La huella de la tabla de `docs/_fixtures/README.md`. **Se verifica ANTES de citar un número**
# (`CLAUDE.md` §4): un archivo sin huella es anónimo, y un caso medido contra un archivo anónimo no
# es reproducible — que es exactamente lo que `C-21` vino a arreglar.
SHA_ESPERADO = 'f8ef3227fc6cc73ef5879948451093f8e7a278c0baf1f4341d187958f0f8cc87'

# Los dos encuentros de `julio_24_30` con etapa POST, ya medidos el 24/08 cruzando por Barrio/Comuna.
IDS = {'3346-JULJDGAG': 'Retiro (24/07)', '3354-JULJDGAG': 'San Cristóbal (23/07)'}

# Las columnas que `L-036` necesita. Se buscan por título, **normalizando como `R-10`**: colapsar
# espacios y `trim`, preservando mayúsculas y acentos.
#
# ⛔ **`Impresiones totales`, no `Impresiones`** — medido, y la diferencia importa: en
# `Agenda JM | Post` el título `Impresiones` **no existe**, y el `MAPEO` de `L-036` apunta a
# `Impresiones totales` (col. J) justamente porque es el único de los tres que tiene título único.
#
# ⭐⭐ **Y se busca por CONCEPTO con alias, no por un único título**, porque medido el 25/08 las dos
# solapas candidatas **llaman distinto a lo mismo**: `Agenda JM | Post` dice `Alcance` y
# `Métricas EDVs` dice `Alcance manual`; una dice `Impresiones totales` y la otra `Impr. totales`.
# Buscar un solo título habría informado *«la columna no existe»* sobre la solapa que sí la tiene —
# un cero fabricado por el instrumento, que es el modo de falla de la primera corrida de acá.
CONCEPTOS = [
    ('Habitantes', ['Habitantes']),
    ('Alcance', ['Alcance', 'Alcance manual']),
    ('Impresiones', ['Impresiones totales', 'Impr. totales']),
    ('Visualizaciones', ['Visualizaciones', 'Views']),
    ('% VTR', ['% VTR']),
    ('Cobertura', ['% Cobertura', 'Cobertura']),
]
COLUMNAS = [t for _, alias in CONCEPTOS for t in alias]

# ⛔ **El encabezado NO está en la fila 1**, y suponerlo hizo que la primera corrida de este
# instrumento informara *«la columna no existe»* en las seis solapas — un cero fabricado por el
# lector, que contradecía al motor. `CLAUDE.md` §4: *cuando la medición propia contradice al motor,
# la primera hipótesis es que la medición está mal*. En `Agenda JM | Post` la fila 1 es un banner
# («Información del encuentro») y los títulos están en la **2**.
#
# ⭐ Se elige por **margen** y el reporte lo declara, igual que la firma por solapas: la fila que más
# títulos conocidos contiene gana, y si ninguna contiene ninguno **se dice**, en vez de tomar la 1.
FILAS_CANDIDATAS_ENCABEZADO = 6


def norm(s):
    """`R-10`: colapsa `\\s+` a un espacio y `trim`. **Preserva mayúsculas y acentos** — plegar el
    case colapsa quince pares de encabezados reales que son columnas distintas."""
    return re.sub(r'\s+', ' ', str(s or '')).strip()


def col_a_indice(ref):
    """`B3` → 1. Sólo la parte alfabética."""
    letras = re.match(r'([A-Z]+)', ref).group(1)
    n = 0
    for c in letras:
        n = n * 26 + (ord(c) - 64)
    return n - 1


class Libro(object):
    """Un `.xlsx` leído con la biblioteca estándar. Un `.zip` y un `.xlsx` son lo mismo."""

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
            # Un `<si>` puede venir partido en varios `<t>` por formato: se concatenan todos.
            out.append(''.join(re.findall(r'<t[^>]*>(.*?)</t>', si, re.S)))
        return [t.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>') for t in out]

    def _hojas(self):
        xml = self.z.read('xl/workbook.xml').decode('utf8')
        rels = self.z.read('xl/_rels/workbook.xml.rels').decode('utf8')
        destino = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="([^"]+)"', rels))
        out = []
        for tag in re.findall(r'<sheet\b[^>]*/?>', xml):
            nombre = re.search(r'name="([^"]*)"', tag)
            rid = re.search(r'r:id="(rId\d+)"', tag)
            if not nombre or not rid:
                continue
            ruta = destino.get(rid.group(1), '')
            if ruta.startswith('/'):
                ruta = ruta[1:]
            elif not ruta.startswith('xl/'):
                ruta = 'xl/' + ruta
            out.append((nombre.group(1).replace('&amp;', '&'), ruta))
        return out

    def filas(self, ruta, tope=None):
        """Las filas de una hoja, como listas de strings. `tope` corta la lectura."""
        if ruta not in self.z.namelist():
            return []
        xml = self.z.read(ruta).decode('utf8')
        out = []
        for fila in re.findall(r'<row\b[^>]*>(.*?)</row>', xml, re.S):
            valores = {}
            for celda in re.findall(r'<c\b([^>]*)>(.*?)</c>', fila, re.S):
                attrs, cuerpo = celda
                ref = re.search(r'r="([A-Z]+\d+)"', attrs)
                if not ref:
                    continue
                i = col_a_indice(ref.group(1))
                tipo = re.search(r't="(\w+)"', attrs)
                tipo = tipo.group(1) if tipo else 'n'
                v = re.search(r'<v>(.*?)</v>', cuerpo, re.S)
                if tipo == 's' and v:
                    idx = int(v.group(1))
                    valores[i] = self.compartidas[idx] if idx < len(self.compartidas) else ''
                elif tipo == 'inlineStr':
                    valores[i] = ''.join(re.findall(r'<t[^>]*>(.*?)</t>', cuerpo, re.S))
                elif v:
                    valores[i] = v.group(1)
                else:
                    valores[i] = ''
            if valores:
                ancho = max(valores) + 1
                out.append([valores.get(i, '') for i in range(ancho)])
            else:
                out.append([])
            if tope and len(out) >= tope:
                break
        return out


def elegir_encabezado(filas):
    """La fila de títulos, elegida **por margen** entre las primeras candidatas.

    Devuelve `(n, titulos, cuantos, margen)`. `cuantos` es cuántas de `COLUMNAS` contiene la
    ganadora y `margen` la diferencia con la segunda — **el reporte los publica los dos**, porque
    una elección sin margen es un empate a desempatar y no una firma.
    """
    puntajes = []
    for n in range(min(FILAS_CANDIDATAS_ENCABEZADO, len(filas))):
        titulos = [norm(c) for c in filas[n]]
        puntajes.append((sum(1 for c in COLUMNAS if c in titulos), n, titulos))
    puntajes.sort(key=lambda x: (-x[0], x[1]))
    if not puntajes or puntajes[0][0] == 0:
        return (None, [], 0, 0)
    mejor = puntajes[0]
    segundo = puntajes[1][0] if len(puntajes) > 1 else 0
    return (mejor[1], mejor[2], mejor[0], mejor[0] - segundo)


def main():
    with open(FIXTURE, 'rb') as f:
        crudo = f.read()
    sha = hashlib.sha256(crudo).hexdigest()
    print('Fixture: %s' % FIXTURE)
    print('sha256:  %s' % sha)
    if sha != SHA_ESPERADO:
        print('\n⛔ EL SHA NO COINCIDE con la tabla de `docs/_fixtures/README.md`.')
        print('   No se cita ningún número de un archivo que no se pudo identificar.')
        return 1
    print('✅ coincide con la tabla de huellas — los números de abajo son citables\n')

    z = zipfile.ZipFile(io.BytesIO(crudo))
    libro = Libro(z.read(INTERNO))

    print('=' * 78)
    print('1 · LAS 24 SOLAPAS DE LA BASE `reuniones`')
    print('=' * 78)
    print('⚠ La firma de un fixture es su lista de SOLAPAS, nunca el nombre del archivo:')
    print('  `BASES.reuniones.nombre` dice «Base reuniones - Digital - Call Center» y el archivo')
    print('  se llama «DGPLES _ Seguimiento ECVs». Mismo sheet_id, ningún nombre parecido.\n')
    for i, (nombre, _) in enumerate(libro.hojas, 1):
        print('  %2d. %s' % (i, nombre))

    print('\n' + '=' * 78)
    print('2 · DÓNDE APARECE CADA ID — las 24 solapas, no las tres del prompt')
    print('=' * 78)
    print('⚠ Se barren TODAS a propósito: el prompt nombra tres, y «un prompt nombra los casos')
    print('  que conoce, que es exactamente el sesgo que hay que compensar».\n')

    hallazgos = []
    for nombre, ruta in libro.hojas:
        filas = libro.filas(ruta)
        if not filas:
            continue
        nEnc, encabezado, cuantos, margen = elegir_encabezado(filas)
        encontrados = {}
        for n, fila in enumerate(filas):
            for i, celda in enumerate(fila):
                v = norm(celda)
                if v in IDS and v not in encontrados:
                    encontrados[v] = (n, i)
        if encontrados:
            hallazgos.append((nombre, ruta, filas, encabezado, encontrados, nEnc, cuantos, margen))
            print('  ✔ %-42s %d de 2 · %d fila(s) · encabezado en fila %s (%d de %d títulos)'
                  % (nombre, len(encontrados), len(filas),
                     '?' if nEnc is None else str(nEnc + 1), cuantos, len(COLUMNAS)))
        else:
            print('    %-42s —' % nombre)

    print('\n' + '=' * 78)
    print('3 · QUÉ TRAE CADA SOLAPA EN LAS CUATRO COLUMNAS DE `L-036`')
    print('=' * 78)
    if not hallazgos:
        print('  ⛔ Ninguna solapa contiene los ids. El eslabón no es el `id_cuenta`.')
        return 0

    for nombre, ruta, filas, encabezado, encontrados, nEnc, cuantos, margen in hallazgos:
        print('\n── %s ' % nombre + '─' * max(0, 74 - len(nombre)))
        if nEnc is None:
            print('   ⛔ NINGUNA de las %d primeras filas tiene un título conocido.' % FILAS_CANDIDATAS_ENCABEZADO)
            print('      No se toma la fila 1 «por defecto»: eso fabricaría un cero.')
            print('      Primeras celdas de la fila 1: %s' % ', '.join(
                repr(c)[:20] for c in (filas[0][:8] if filas else [])))
            continue
        print('   encabezado: fila %d · %d de %d títulos · margen %d sobre la siguiente candidata'
              % (nEnc + 1, cuantos, len(COLUMNAS), margen))
        # ⚠ El título se busca **repetido**: `leerFuente` indexa por título y **gana el último**,
        # que es exactamente lo que sacó `vis_totales` del MAPEO el 25/08.
        ubic = {}
        for concepto, alias in CONCEPTOS:
            for a in alias:
                donde = [i for i, h in enumerate(encabezado) if h == a]
                if donde:
                    ubic[concepto] = (a, donde)
                    break
            if concepto not in ubic:
                print('   %-16s ⛔ NO existe (ni como %s)' % (concepto, ' / '.join(alias)))
            else:
                a, donde = ubic[concepto]
                if len(donde) > 1:
                    print('   %-16s ⚠ «%s» REPETIDO en %d columnas (%s) — `leerFuente` indexa por '
                          'título y GANA EL ÚLTIMO' % (concepto, a, len(donde),
                                                      ', '.join(str(d) for d in donde)))
                else:
                    print('   %-16s «%s», columna %d' % (concepto, a, donde[0]))
        print()
        for idc, etiqueta in IDS.items():
            if idc not in encontrados:
                print('   %-28s ⛔ no está en esta solapa' % (etiqueta + ':'))
                continue
            nfila, _ = encontrados[idc]
            fila = filas[nfila]
            print('   %s  (fila %d)' % (etiqueta, nfila + 1))
            for concepto, _alias in CONCEPTOS:
                if concepto not in ubic:
                    continue
                a, donde = ubic[concepto]
                # El ÚLTIMO, que es el que `leerFuente` elegiría. Y si hay repetidos se muestran
                # **todos**, porque la diferencia entre el primero y el último ES el hallazgo.
                vals = []
                for i in donde:
                    v = fila[i] if i < len(fila) else ''
                    vals.append('col%d=%s' % (i, v if v != '' else '(vacío)'))
                marca = '  ⚠ leerFuente tomaría el último' if len(donde) > 1 else ''
                print('      %-16s %s%s' % (concepto, ' · '.join(vals), marca))

    print('\n' + '=' * 78)
    print('⚠ LO QUE ESTA MEDICIÓN NO CONTESTA')
    print('=' * 78)
    print('  · Cuál solapa es la CORRECTA. Eso lo decide el número que el deck del equipo publica')
    print('    en esa lámina para julio — la definición se elige contra el número publicado, no')
    print('    contra el nombre de la solapa. Ese deck no está en este fixture.')
    print('  · Qué dice la base HOY. Esto es el export del 20/08/2026 y responde por ese día.')
    print('  · Si el motor la lee así: prueba qué TRAE la solapa, no qué hace `leerFuente` con ella.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
