#!/usr/bin/env python3
"""
El POST en `digital/CAMPAÑAS_DESGLOCE_DIGITAL` — la fuente que `L-036` debería estar usando.

⛔⛔ **Por qué existe:** la fuente de `L-036` se eligió por el **nombre de la solapa**
—`reuniones/Agenda JM | Post`— y **nunca se verificó contra el dato**. La solapa correcta **no tiene
«post» en el título: lo tiene en una COLUMNA**. Costó cuatro días.

⭐ **Y la pieza ya existía**: `DIMENSIONES_.etapa` traduce `post` a
`des_campana~=Agenda Post` sobre `digital|CAMPAÑAS_DESGLOCE_DIGITAL`, y es lo que usan los 24 `u1_*`
del «1 a 1» desde antes.

⚠ **No reimplementa lógica del motor.** Lee el dato crudo y busca coincidencias de texto; no resuelve
`MAPEO` ni calcula operaciones. Es una foto del **20/08/2026**.

Corre con: python tools/medir-post-en-desglose.py
"""
import hashlib
import io
import re
import sys
import zipfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

FIXTURE = 'docs/_fixtures/Seguimiento Digital  2026-08-20.zip'
SHA_ESPERADO = 'f8ef3227fc6cc73ef5879948451093f8e7a278c0baf1f4341d187958f0f8cc87'

# ⚠ **DOS libros del fixture tienen una solapa `CAMPAÑAS_DESGLOCE_DIGITAL`**: `M2 Reporte…` (base
# `m2`) y `Seguimiento Digital` (base `digital`). `DIMENSIONES_.etapa` declara **`digital|`**, así que
# se lee ésa. Es la misma trampa que `reuniones`/`REUNIONES`, entre dos bases.
INTERNO = 'Seguimiento Digital  2026-08-20/Seguimiento Digital  (4).xlsx'
SOLAPA = 'CAMPAÑAS_DESGLOCE_DIGITAL'

# El recorte real del motor, copiado de `Fuentes.gs`: `des_campana~=Agenda Post`, y `des_campana` es
# `MAPEO` col. E = **`Nombre Campaña`**.
COL_NOMBRE = 'Nombre Campaña'
PATRON_MOTOR = 'Agenda Post'

# ⚠ El usuario describió el recorte como *«nombre que empieza con Post»* y el motor filtra
# *«contiene Agenda Post»*. **Son dos reglas distintas y se miden las dos**, porque si difieren, esa
# diferencia es el hallazgo — no un detalle de redacción.
PATRON_USUARIO = 'Post'

norm = lambda s: re.sub(r'\s+', ' ', str(s or '')).strip()


def col_a_indice(ref):
    n = 0
    for c in re.match(r'([A-Z]+)', ref).group(1):
        n = n * 26 + (ord(c) - 64)
    return n - 1


class Libro(object):
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
            ruta = ruta[1:] if ruta.startswith('/') else ('xl/' + ruta if not ruta.startswith('xl/') else ruta)
            out.append((nom.group(1).replace('&amp;', '&'), ruta))
        return out

    def filas(self, ruta):
        if ruta not in self.z.namelist():
            return []
        xml = self.z.read(ruta).decode('utf8')
        out = []
        for fila in re.findall(r'<row\b[^>]*>(.*?)</row>', fila_xml(xml), re.S):
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


def fila_xml(x):
    return x


def elegir_encabezado(filas, titulos_guia):
    """La fila de títulos, por **margen**. ⛔ No se asume la fila 1: en este mismo fixture
    `Agenda JM | Post` tiene un banner arriba, y suponerlo fabricó un cero el 25/08."""
    mejor, seg, nmejor, tmejor = -1, -1, None, []
    for n in range(min(6, len(filas))):
        t = [norm(c) for c in filas[n]]
        p = sum(1 for g in titulos_guia if g in t)
        if p > mejor:
            mejor, seg, nmejor, tmejor = p, mejor, n, t
        elif p > seg:
            seg = p
    return (nmejor, tmejor, mejor, mejor - max(seg, 0)) if mejor > 0 else (None, [], 0, 0)


def main():
    with open(FIXTURE, 'rb') as f:
        crudo = f.read()
    sha = hashlib.sha256(crudo).hexdigest()
    print('Fixture: %s' % FIXTURE)
    print('sha256:  %s' % sha)
    if sha != SHA_ESPERADO:
        print('\n⛔ EL SHA NO COINCIDE. No se cita ningún número de un archivo sin identificar.')
        return 1
    print('✅ coincide con la tabla de huellas\n')

    z = zipfile.ZipFile(io.BytesIO(crudo))
    libro = Libro(z.read(INTERNO))
    ruta = dict(libro.hojas).get(SOLAPA)
    if not ruta:
        print('⛔ La solapa %s no está en %s' % (SOLAPA, INTERNO))
        return 1

    filas = libro.filas(ruta)
    guia = [COL_NOMBRE, 'Id accion', 'Plataforma', 'Impresiones', 'Alcance']
    nEnc, enc, cuantos, margen = elegir_encabezado(filas, guia)
    print('=' * 78)
    print('1 · LA SOLAPA — %s (base `digital`)' % SOLAPA)
    print('=' * 78)
    print('filas: %d · encabezado: fila %s (%d de %d títulos guía, margen %d)\n'
          % (len(filas), '?' if nEnc is None else nEnc + 1, cuantos, len(guia), margen))
    print('Sus %d columnas:' % len(enc))
    for i, h in enumerate(enc):
        if h:
            print('  %2d. %s' % (i, h))

    iNombre = enc.index(COL_NOMBRE) if COL_NOMBRE in enc else None
    if iNombre is None:
        print('\n⛔ No existe la columna «%s». El recorte del motor no se puede reproducir.' % COL_NOMBRE)
        return 1

    # ⛔ **`Id cuentas`, NUNCA `Id accion`.** `C-74` lo midió: `Id accion` parece un identificador y
    # **no es estable entre exports** — usarlo como clave hizo que un movimiento del 3,6 % se
    # publicara como 56 %. Agrupar por él acá daba «166 cuentas distintas» para 166 filas.
    iCuenta = enc.index('Id cuentas') if 'Id cuentas' in enc else None
    iAnio = enc.index('Año') if 'Año' in enc else None
    iMes = enc.index('Mes') if 'Mes' in enc else None
    if iCuenta is None:
        print('\n⛔ No existe la columna «Id cuentas».')
        return 1

    print('\n' + '=' * 78)
    print('2 · CUÁNTAS FILAS RECORTA CADA REGLA — se miden las dos, porque difieren')
    print('=' * 78)
    datos = filas[nEnc + 1:]
    contiene = [f for f in datos if iNombre < len(f) and PATRON_MOTOR in norm(f[iNombre])]
    empieza = [f for f in datos if iNombre < len(f) and norm(f[iNombre]).startswith(PATRON_USUARIO)]
    print('  filas de datos                                    %5d' % len(datos))
    print('  ⭐ contiene «%s» — LO QUE HACE EL MOTOR        %5d' % (PATRON_MOTOR, len(contiene)))
    print('     empieza con «%s» — como lo describió el pedido      %5d' % (PATRON_USUARIO, len(empieza)))
    solo_e = [f for f in empieza if f not in contiene]
    solo_c = [f for f in contiene if f not in empieza]
    print('     sólo en «empieza con Post»: %d · sólo en «contiene Agenda Post»: %d'
          % (len(solo_e), len(solo_c)))
    if solo_e:
        print('\n  ⚠ Filas que «empieza con Post» toma y el motor NO:')
        for f in solo_e[:8]:
            print('      %s' % norm(f[iNombre])[:70])
    if solo_c:
        print('\n  ⚠ Filas que el motor toma y «empieza con Post» NO:')
        for f in solo_c[:8]:
            print('      %s' % norm(f[iNombre])[:70])

    print('\n' + '=' * 78)
    print('3 · LOS ENCUENTROS — qué ids tienen fila POST, y cuántas por plataforma')
    print('=' * 78)
    print('⚠ No se parte de una lista de ids: se listan **todos** los que el recorte del motor')
    print('  devuelve, y después se mira cuáles son de julio. Partir de la lista que uno cree')
    print('  conocer es el sesgo que hay que compensar.\n')

    iPlat = enc.index('Plataforma') if 'Plataforma' in enc else None
    iImp = enc.index('Impresiones') if 'Impresiones' in enc else None
    iVis = enc.index('Visualizaciones') if 'Visualizaciones' in enc else None
    iNomen = enc.index('Nomenclatura') if 'Nomenclatura' in enc else None

    cel = lambda f, i: (norm(f[i]) if i is not None and i < len(f) else '')

    # ⭐ Las DOS convenciones juntas, para poder ver si son de épocas distintas o conviven.
    todas = contiene + empieza
    porCuenta = {}
    for f in todas:
        porCuenta.setdefault(cel(f, iCuenta), []).append(f)

    print('  %d cuenta(s) distintas entre las dos convenciones (%d filas)\n'
          % (len(porCuenta), len(todas)))

    print('  ⭐ Reparto por AÑO — es lo que dice si una convención reemplazó a la otra:')
    for etiqueta, lote in (('contiene «Agenda Post» (motor)', contiene), ('empieza con «Post»', empieza)):
        anios = {}
        for f in lote:
            anios[cel(f, iAnio)] = anios.get(cel(f, iAnio), 0) + 1
        print('    %-32s %s' % (etiqueta, ' · '.join(
            '%s: %d' % (a or '(vacío)', n) for a, n in sorted(anios.items()))))

    print('\n  Las cuentas con 2+ filas POST — si son plataformas, la lámina es POR PLATAFORMA:')
    multi = sorted([(k, v) for k, v in porCuenta.items() if len(v) >= 2], key=lambda x: -len(x[1]))
    print('    %d de %d cuentas tienen 2 o más filas POST' % (len(multi), len(porCuenta)))
    for k, v in multi[:14]:
        plats = [cel(f, iPlat) or '?' for f in v]
        print('    %-18s %d: %s' % (k or '(sin id)', len(v), ', '.join(plats)))

    print('\n  ⭐ El ejemplo del usuario — cuenta 3143-JUNJDGAG, sus filas COMPLETAS:')
    ejemplo = [f for f in datos if cel(f, iCuenta) == '3143-JUNJDGAG']
    if not ejemplo:
        print('    ⛔ no está en este fixture')
    else:
        print('    %d fila(s) en total (POST y no POST):' % len(ejemplo))
        for f in ejemplo:
            nom = cel(f, iNombre)
            es_post = PATRON_MOTOR in nom or nom.startswith(PATRON_USUARIO)
            print('      %s %-11s imp=%-12s vis=%-12s %s' % (
                '⭐POST' if es_post else '      ', cel(f, iPlat), cel(f, iImp), cel(f, iVis), nom[:44]))
            if iNomen is not None:
                print('             Nomenclatura: %s' % (cel(f, iNomen) or '(vacío)'))

    print('\n' + '=' * 78)
    print('⚠ LO QUE ESTA MEDICIÓN NO CONTESTA')
    print('=' * 78)
    print('  · Si la lámina es por encuentro o por plataforma. Eso lo dice el deck del equipo,')
    print('    y se mide aparte.')
    print('  · Qué dice la base HOY. Es el export del 20/08/2026.')
    print('  · Si el motor lee así: se midió qué TRAE la solapa con el recorte copiado, no qué')
    print('    hace `aplicarFiltroDeMarcador_` con él.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
