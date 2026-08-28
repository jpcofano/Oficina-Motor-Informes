#!/usr/bin/env python3
"""
Los seis `imp_*` del Resumen Ejecutivo contra el deck del equipo — desde el DESGLOSE y desde looker.

⭐ **Se comparan los SEIS a la vez, y eso es lo que lo vuelve una prueba y no un ajuste.** Probar
variantes hasta que una pegue es ajustar la curva; acertar **seis números con una sola hipótesis**
no. Si una variante acierta los seis, significa algo; si necesita un retoque por número, no.

⚠ **Las columnas se toman por LETRA, como el `MAPEO`**, y no por encabezado: en el desglose los
títulos se repiten —`Id cuentas` dos veces, `Estado` y `estado`— y buscar por nombre agarra la
equivocada. Un intento anterior leyó `nombre_campaña` de una columna vacía por eso.

⚠ **Verifica la DEFINICIÓN sobre el fixture del 28/08, no el motor.** Y `R-30` —el tope de 90 días
de duración de campaña— **no se reproduce**: vive en `Fuentes.gs` y reimplementarlo sería el
instrumento que reproduce lógica del motor y la reproduce peor. Se dice como límite, no se simula.

Uso:
  python tools/medir-resumen-ejecutivo.py
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

FIXTURE = 'docs/_fixtures/Seguimiento Digital 2026-08-28.zip'
SHA_ESPERADO = '0ce0086d192bbb121c86dfe72434c40254c95c5153e8c43af9a39badfa81ac79'

# base -> (archivo, solapa, letras). Las letras salen de `MAPEO`, no de mirar el archivo.
FUENTES = {
    'desglose': ('Seguimiento Digital  (5).xlsx', 'CAMPAÑAS_DESGLOCE_DIGITAL',
                 {'cta': 'B', 'plat': 'F', 'camp': 'V', 'est': 'Y', 'imp': 'O',
                  'ini': 'I', 'fin': 'J'}),
    'looker':   ('Base Looker (4).xlsx', 'DIGITAL',
                 {'cta': 'A', 'plat': 'B', 'camp': 'F', 'est': 'I', 'imp': 'C'}),
}

# Lo que el equipo publica en el deck 21-28/08, láminas 2 y 3. **Seis restricciones.**
EQUIPO = {
    'jm':   {'meta': 1766535, 'google': 919055, 'prog': 5330034, 'total': 8015624},
    'gcba': {'meta': 21254411, 'google': 16606342, 'prog': 54777029, 'total': 92637782},
}
VENTANA = (datetime.date(2026, 8, 21), datetime.date(2026, 8, 28))

norm = lambda s: re.sub(r'\s+', ' ', str(s if s is not None else '')).strip()


def _libro_clase():
    ruta = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'medir-post-en-desglose.py')
    spec = importlib.util.spec_from_file_location('medir_post_en_desglose', ruta)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.Libro


def col(letra):
    n = 0
    for c in letra.upper():
        n = n * 26 + (ord(c) - 64)
    return n - 1


def num(v):
    """Mira el tipo antes de convertir (`CLAUDE.md` §4)."""
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


def fecha(v):
    if isinstance(v, datetime.datetime):
        return v.date()
    if isinstance(v, datetime.date):
        return v
    try:
        return datetime.date(1899, 12, 30) + datetime.timedelta(days=int(float(v)))
    except (TypeError, ValueError):
        pass
    m = re.match(r'^(\d{1,2})/(\d{1,2})/(\d{4})', norm(v))
    if m:
        return datetime.date(int(m.group(3)), int(m.group(2)), int(m.group(1)))
    return None


def leer(z, nombre):
    archivo, solapa, letras = FUENTES[nombre]
    coincide = [n for n in z.namelist() if n.endswith(archivo)]
    if not coincide:
        raise SystemExit('⛔ el zip no tiene %r' % archivo)
    libro = _libro_clase()(z.read(coincide[0]))
    hojas = dict(libro.hojas)
    if solapa not in hojas:
        raise SystemExit('⛔ no está %r' % solapa)
    out = []
    for f in libro.filas(hojas[solapa])[1:]:
        if not any(norm(x) for x in f):
            continue
        g = lambda k: (f[col(letras[k])] if k in letras and col(letras[k]) < len(f) else '')
        out.append({
            'cta': norm(g('cta')), 'plat': norm(g('plat')), 'camp': norm(g('camp')),
            'est': norm(g('est')), 'imp': num(g('imp')),
            'ini': fecha(g('ini')) if 'ini' in letras else None,
            'fin': fecha(g('fin')) if 'fin' in letras else None,
        })
    return out


def ambito(f, cual):
    """`ambito=jm` es `nombre_campaña ~= JM`; `gcba` es su negación (`D-33`)."""
    tiene = 'jm' in f['camp'].lower()
    return tiene if cual == 'jm' else (not tiene)


def plataforma(f, cual):
    if cual == 'meta':
        return f['plat'] == 'Meta'
    if cual == 'google':
        return f['plat'] == 'Google ads'
    return f['plat'] not in ('Meta', 'Google ads')


def medir(filas, cual, variante):
    sel = [f for f in filas if ambito(f, cual)]
    if variante['activa']:
        sel = [f for f in sel if f['est'] == 'Activa']
    if variante['ventana'] and sel and sel[0]['ini'] is not None:
        d, h = VENTANA
        sel = [f for f in sel if f['ini'] and f['fin'] and f['ini'] <= h and f['fin'] >= d]
    out = {}
    for p in ('meta', 'google', 'prog'):
        out[p] = sum(f['imp'] for f in sel if plataforma(f, p))
    out['total'] = out['meta'] + out['google'] + out['prog']
    return out


def fmt(x):
    return '{:,.0f}'.format(x).replace(',', '.')


def main():
    sha = hashlib.sha256(open(FIXTURE, 'rb').read()).hexdigest()
    if sha != SHA_ESPERADO:
        print('⛔ el sha256 NO coincide con la tabla de huellas.')
        return 1
    print('✅ sha256 verificado: %s  ·  ⚠ definición sobre el fixture del 28/08, no el motor' % sha[:16])
    print('⚠ `R-30` (tope de 90 días) NO se reproduce: vive en Fuentes.gs y se declara, no se simula.')

    z = zipfile.ZipFile(FIXTURE)
    datos = {k: leer(z, k) for k in FUENTES}

    VARIANTES = [
        ('sin ventana, estado=Activa', {'activa': True, 'ventana': False}),
        ('ventana 21-28/08, estado=Activa', {'activa': True, 'ventana': True}),
        ('sin ventana, sin filtro de estado', {'activa': False, 'ventana': False}),
    ]

    for cual in ('jm', 'gcba'):
        eq = EQUIPO[cual]
        print('\n════════ %s — el equipo publica ════════' % cual.upper())
        print('   %-34s %14s %14s %14s %14s %6s' % ('', 'Meta', 'Google', 'Programmatic', 'TOTAL', 'aciert'))
        print('   %-34s %14s %14s %14s %14s' % ('DECK DEL EQUIPO',
              fmt(eq['meta']), fmt(eq['google']), fmt(eq['prog']), fmt(eq['total'])))
        for fuente in ('desglose', 'looker'):
            for etiqueta, v in VARIANTES:
                r = medir(datos[fuente], cual, v)
                ok = sum(1 for k in ('meta', 'google', 'prog', 'total')
                         if round(r[k]) == eq[k])
                marca = '⭐⭐' if ok == 4 else ('  ' if ok == 0 else '⚠ ')
                print('%s %-34s %14s %14s %14s %14s %4d/4' % (
                    marca, (fuente + ' · ' + etiqueta)[:34],
                    fmt(r['meta']), fmt(r['google']), fmt(r['prog']), fmt(r['total']), ok))

    print('\n⚠ Cómo leer esto: acertar los CUATRO con una sola hipótesis es una prueba;')
    print('   acertar uno o dos es coincidencia, y pedir un retoque por número es ajustar la curva.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
