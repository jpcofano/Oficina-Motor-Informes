#!/usr/bin/env python3
"""
Cuánto mueve ampliar `DIMENSIONES_.etapa.post` — **la medición que va ANTES de tocar nada.**

⛔ **Por qué:** el criterio nuevo hace POST a toda campaña cuyo nombre traiga «post» en cualquier
posición. Eso **mueve números publicados** de los 24 `u1_*` del «1 a 1», que hoy ven una sola
convención. La pregunta del usuario es concreta: *¿cuántas cuentas del «1 a 1» tienen filas de la
convención que hoy no se ve?* **Si es una semana el cambio es chico; si son muchas, hay decks
publicados con el POST incompleto y eso hay que decirlo.**

⚠ **`~=` es CASE-SENSITIVE.** `normalizarValorDeclarado_` sigue `R-10`: colapsa espacios y hace
`trim`, **preservando mayúsculas y acentos**. Así que `~=Post` no matchea `post` ni `POST`, y qué
grafías existen **se mide, no se supone**.

⚠ No reimplementa lógica del motor: lee el dato crudo y compara texto. Foto del **20/08/2026**.

Corre con: python tools/medir-impacto-etapa-post.py
"""
import hashlib
import io
import re
import sys
import zipfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, 'tools')
import importlib.util

_spec = importlib.util.spec_from_file_location('desglose', 'tools/medir-post-en-desglose.py')
_d = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_d)

norm = _d.norm

# El criterio de HOY y el criterio NUEVO, los dos como los evalúa `valorPasaFiltro_`: `~=` es
# `indexOf(...) !== -1` sobre los dos lados normalizados con `R-10`, o sea **sensible al case**.
HOY = 'Agenda Post'
NUEVO = 'Post'


def main():
    with open(_d.FIXTURE, 'rb') as f:
        crudo = f.read()
    sha = hashlib.sha256(crudo).hexdigest()
    print('Fixture: %s\nsha256:  %s' % (_d.FIXTURE, sha))
    if sha != _d.SHA_ESPERADO:
        print('\n⛔ EL SHA NO COINCIDE. No se cita ningún número.')
        return 1
    print('✅ coincide con la tabla de huellas\n')

    z = zipfile.ZipFile(io.BytesIO(crudo))
    libro = _d.Libro(z.read(_d.INTERNO))
    filas = libro.filas(dict(libro.hojas)[_d.SOLAPA])
    enc = [norm(c) for c in filas[0]]
    idx = {h: i for i, h in enumerate(enc)}
    datos = filas[1:]
    cel = lambda f, h: (norm(f[idx[h]]) if h in idx and idx[h] < len(f) else '')

    print('=' * 78)
    print('1 · LAS GRAFÍAS DE «post» QUE EXISTEN — el case importa, `~=` no lo pliega')
    print('=' * 78)
    grafias = {}
    for f in datos:
        n = cel(f, 'Nombre Campaña')
        for m in re.finditer(r'[Pp][Oo][Ss][Tt]', n):
            g = m.group(0)
            grafias[g] = grafias.get(g, 0) + 1
    for g, c in sorted(grafias.items(), key=lambda x: -x[1]):
        marca = '  ⭐ la que el criterio nuevo va a matchear' if g == 'Post' else \
                ('  ⚠ NO la matchearía un `~=Post` sensible al case' if g != 'Post' else '')
        print('  «%s»  %4d apariciones%s' % (g, c, marca))

    print('\n' + '=' * 78)
    print('2 · ⛔ FALSOS POSITIVOS — «post» dentro de otra palabra')
    print('=' * 78)
    print('⚠ Es la pregunta que `camp_env` → `camp_enviados` obliga a hacer: un patrón por')
    print('  subcadena se lleva puesto todo lo que empiece igual. Se mide, no se supone.\n')
    sospechosos = {}
    for f in datos:
        n = cel(f, 'Nombre Campaña')
        for m in re.finditer(r'\w*Post\w*', n):
            p = m.group(0)
            if p != 'Post':
                sospechosos[p] = sospechosos.get(p, 0) + 1
    if not sospechosos:
        print('  ✅ NINGUNO. «Post» aparece siempre como palabra entera.')
        print('     ⭐ Ese cero es un resultado, no un silencio: se buscó y no hay.')
    else:
        for p, c in sorted(sospechosos.items(), key=lambda x: -x[1]):
            print('  ⛔ «%s» ×%d' % (p, c))

    print('\n' + '=' * 78)
    print('3 · CUÁNTAS FILAS MUEVE EL CAMBIO')
    print('=' * 78)
    hoy = [f for f in datos if HOY in cel(f, 'Nombre Campaña')]
    nuevo = [f for f in datos if NUEVO in cel(f, 'Nombre Campaña')]
    entran = [f for f in nuevo if HOY not in cel(f, 'Nombre Campaña')]
    print('  POST hoy   (contiene «%s»)   %5d filas' % (HOY, len(hoy)))
    print('  POST nuevo (contiene «%s»)         %5d filas' % (NUEVO, len(nuevo)))
    print('  ⭐ ENTRAN al post (salen del pre)      %5d filas' % len(entran))
    print('  PRE hoy  = %d − %d = %d   →   PRE nuevo = %d'
          % (len(datos), len(hoy), len(datos) - len(hoy), len(datos) - len(nuevo)))
    print('\n  ⭐ El pre es el COMPLEMENTO (`des_campana!~=…`), así que lo que entra al post sale')
    print('     del pre y de nadie más. Es lo que el testigo tiene que confirmar.')

    print('\n' + '=' * 78)
    print('4 · ⭐ EL IMPACTO EN EL «1 A 1» — la pregunta del usuario')
    print('=' * 78)
    # ⚠ El «1 a 1» se identifica por el NOMBRE de la campaña, que es lo único que hay en esta
    # solapa. `L-053` filtra `tipo=Uno a uno` sobre REUNIONES, que acá no está.
    es_1a1 = lambda n: ('1 A 1' in n.upper()) or ('1 - 1' in n) or ('CON 1' in n.upper())
    afectadas = [f for f in entran if es_1a1(cel(f, 'Nombre Campaña'))]
    print('  de las %d filas que entran, %d son de campañas del «1 a 1»\n' % (len(entran), len(afectadas)))

    porCuenta = {}
    for f in afectadas:
        porCuenta.setdefault(cel(f, 'Id cuentas'), []).append(f)
    print('  ⭐ CUENTAS del «1 a 1» afectadas: %d' % len(porCuenta))
    for c in sorted(porCuenta):
        fs = porCuenta[c]
        meses = sorted(set(cel(f, 'Mes') for f in fs))
        plats = sorted(set(cel(f, 'Plataforma') for f in fs))
        print('    %-18s %d fila(s) · %s · %s' % (c, len(fs), '/'.join(meses), ', '.join(plats)))
        print('       %s' % cel(fs[0], 'Nombre Campaña')[:66])

    print('\n  ⭐⭐ EL VEREDICTO QUE PIDIÓ EL USUARIO — ¿una semana o muchas?')
    meses = {}
    for f in afectadas:
        meses[cel(f, 'Mes')] = meses.get(cel(f, 'Mes'), 0) + 1
    print('     reparto por mes: %s' % (' · '.join('%s: %d' % (m or '(vacío)', n)
                                                   for m, n in sorted(meses.items())) or '(ninguno)'))

    print('\n' + '=' * 78)
    print('5 · Y LAS QUE NO SON DEL «1 A 1» — a qué más le toca')
    print('=' * 78)
    otras = [f for f in entran if not es_1a1(cel(f, 'Nombre Campaña'))]
    porNombre = {}
    for f in otras:
        porNombre.setdefault(cel(f, 'Nombre Campaña'), 0)
        porNombre[cel(f, 'Nombre Campaña')] += 1
    print('  %d filas, %d campañas distintas:' % (len(otras), len(porNombre)))
    for n, c in sorted(porNombre.items(), key=lambda x: -x[1])[:16]:
        print('    ×%-3d %s' % (c, n[:66]))
    print('\n  ⚠ Estas NO tienen consumidor hoy: ninguna se lee con `etapa`, porque los únicos')
    print('    marcadores con esa dimensión son los 24 `u1_*`. Entran igual —el criterio es')
    print('    global— y el día que alguien cablee un `etapa=post` sobre otra lámina, las va a ver.')

    print('\n' + '=' * 78)
    print('⚠ LO QUE ESTA MEDICIÓN NO CONTESTA')
    print('=' * 78)
    print('  · Qué números publica hoy el deck. Eso lo dice el testigo, corriendo el motor.')
    print('  · Qué dice la base HOY: es el export del 20/08/2026.')
    print('  · Si un deck YA PUBLICADO tenía el POST incompleto — se puede inferir de las')
    print('    cuentas afectadas, pero afirmarlo pide mirar ese deck.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
