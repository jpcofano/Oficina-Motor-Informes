#!/usr/bin/env python3
"""
Las filas de UNA cuenta en UNA solapa del fixture del 28/08, con sus encabezados.

Es el instrumento de uso general para validar un marcador contra el deck del equipo: dice **qué
filas tiene esa cuenta** y **qué valor hay en cada columna**, que es lo que hace falta para
reproducir un `SUMA`, un `ULTIMO` o un `PCT` sin adivinar.

⚠ **Verifica la DEFINICIÓN sobre un fixture, no el motor.** No resuelve `MARCADORES` ni aplica
`dimensiones`; muestra el dato crudo de la cuenta. Que `datosDeMarcador_` lea así lo dice una
corrida.

⚠ **Foto del 28/08.** Varias de estas solapas son inestables por CAMBIO (`R-31`): un número medido
acá responde por el 28/08 y por ningún otro día.

⚠ **La columna se pide por ENCABEZADO o por LETRA**, y la letra se resuelve como la resuelve el
motor —posicional, `A`=1— porque el `MAPEO` habla en letras.

Uso:
  python tools/medir-fila-de-cuenta.py "<archivo interno>" "<solapa>" <cuenta> [col1 col2 ...]
  python tools/medir-fila-de-cuenta.py reuniones "Agenda JM | Post" 3527-AGOJDGAG G
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

# Los alias de base → archivo adentro del zip. ⚠ El nombre del archivo NO es la firma de una base
# (`CLAUDE.md` §4): esto es una comodidad de tipeo, y si el zip cambia hay que mirar sus solapas.
ALIAS = {
    'digital': 'Seguimiento Digital  (5).xlsx',
    'looker': 'Base Looker (4).xlsx',
    'rdv': 'RDV JM CM ES + funcionarios (6).xlsx',
    'm2': 'M2 Reporte para Fede 2026 (5).xlsx',
    'reuniones': 'Base reuniones - Digital - Call Center (2).xlsx',
}

norm = lambda s: re.sub(r'\s+', ' ', str(s if s is not None else '')).strip()


def _libro_clase():
    ruta = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'medir-post-en-desglose.py')
    spec = importlib.util.spec_from_file_location('medir_post_en_desglose', ruta)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.Libro


def letra_a_indice(letra):
    n = 0
    for c in letra.upper():
        n = n * 26 + (ord(c) - 64)
    return n - 1


def main():
    if len(sys.argv) < 4:
        print(__doc__)
        return 1
    base, solapa, cuenta = sys.argv[1], sys.argv[2], norm(sys.argv[3])
    pedidas = sys.argv[4:]

    sha = hashlib.sha256(open(FIXTURE, 'rb').read()).hexdigest()
    if sha != SHA_ESPERADO:
        print('⛔ el sha256 NO coincide con la tabla de huellas — el archivo es otro.')
        return 1
    print('✅ sha256 verificado: %s  ·  ⚠ foto del 28/08, definición y no motor' % sha[:16])

    interno = ALIAS.get(base, base)
    z = zipfile.ZipFile(FIXTURE)
    coincide = [n for n in z.namelist() if n.endswith(interno)]
    if not coincide:
        print('⛔ el zip no tiene %r. Tiene: %s' % (interno, [n.split('/')[-1] for n in z.namelist()]))
        return 1

    libro = _libro_clase()(z.read(coincide[0]))
    hojas = dict(libro.hojas)
    if solapa not in hojas:
        print('⛔ no está la solapa %r. Las que hay: %s' % (solapa, sorted(hojas)))
        return 1

    filas = libro.filas(hojas[solapa])
    if not filas:
        print('⛔ la solapa vino vacía')
        return 1
    cab = [norm(c) for c in filas[0]]

    # La cuenta se busca en TODA la fila, no en una columna fija: distintas solapas la ponen en
    # distinta letra, y exigir la letra acá sería reimplementar `SOLAPAS.campo_id_cuenta`.
    suyas = [f for f in filas[1:] if any(norm(v) == cuenta for v in f)]
    print('\n== %s / %s — %d fila(s) de %s (sobre %d) ==' % (base, solapa, len(suyas), cuenta, len(filas) - 1))
    if not suyas:
        print('⛔ ninguna fila. ⚠ «no hay» y «la busqué mal» se ven igual: verificá el id.')
        return 1

    if not pedidas:
        pedidas = [c for c in cab if c]
    for n, f in enumerate(suyas, 1):
        print('\n   --- fila %d ---' % n)
        for p in pedidas:
            if p in cab:
                i, etiqueta = cab.index(p), p
            elif re.fullmatch(r'[A-Za-z]{1,3}', p):
                i = letra_a_indice(p)
                etiqueta = '%s (%s)' % (p.upper(), cab[i] if i < len(cab) else '?')
            else:
                print('   ⛔ no sé qué columna es %r' % p)
                continue
            v = f[i] if i < len(f) else ''
            print('   %-34s %s' % (etiqueta, norm(v)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
