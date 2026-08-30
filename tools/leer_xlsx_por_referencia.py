#!/usr/bin/env python3
"""
Lector de `.xlsx` **por referencia de celda**, con el autocierre resuelto.

⛔⛔ **Por qué existe, y es una lección de método, no una utilidad.** El lector que este repo venía
usando —la clase `Libro` de `tools/medir-post-en-desglose.py`— parte las celdas con

    <c\\b([^>]*)>(.*?)</c>

y **ese regex no reconoce la celda vacía autocerrada** que Google Sheets emite:

    <c r="S2" s="2"/>                                      ← vacía, autocerrada
    <c r="T2" s="2" t="str"><f>…</f><v>GCBA</v></c>         ← la siguiente

Al no cerrar en `S2`, el patrón **consume `T2` entera** buscando el primer `</c>` y le adjudica a
`S` el valor de `T`. **Los valores sangran una columna hacia atrás, en silencio.** En
`CAMPAÑAS_DESGLOCE_DIGITAL` del 30/08 hay **4.645** celdas autocerradas.

⚠ **Es la misma familia que la truncación del export markdown del conector: no falla, devuelve otra
cosa.** Un dato plausible en la columna equivocada no se distingue de un dato correcto mirando el
resultado — y así nació la disputa entera sobre la columna T, donde `Tipo Campaña` parecía traer
`GCBA`/`JM`/`Sin Tipo`, que son valores de `JM | GCBA | POLICIA`.

⭐ **La regla que queda:** la columna de una celda sale **siempre** de su atributo `r=`, nunca de su
posición en la lista de celdas de la fila — y el patrón de celda tiene que aceptar las dos formas.

Uso como módulo:
    from leer_xlsx_por_referencia import Hoja
    h = Hoja('archivo.xlsx', lambda n: n == 'DIGITAL')
    h.g(fila, 'Impresiones')   # por encabezado
    fila['T']                  # por letra de columna
"""
import io
import re
import zipfile

# ⭐ Acepta las DOS formas: `<c …/>` autocerrada y `<c …>cuerpo</c>`.
CELDA = re.compile(r'<c\b([^>]*?)(?:/>|>(.*?)</c>)', re.S)
FILA = re.compile(r'<row\b[^>]*r="(\d+)"[^>]*>(.*?)</row>', re.S)
REF = re.compile(r'r="([A-Z]+)\d+"')

norm = lambda s: re.sub(r'\s+', ' ', str(s if s is not None else '')).strip()


def _texto(x):
    return (x.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
             .replace('&quot;', '"').replace('&#39;', "'"))


class Hoja(object):
    def __init__(self, origen, elegir):
        datos = origen.read() if hasattr(origen, 'read') else open(origen, 'rb').read()
        z = zipfile.ZipFile(io.BytesIO(datos))
        rels = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="([^"]+)"',
                               z.read('xl/_rels/workbook.xml.rels').decode('utf8')))
        ruta = None
        for tag in re.findall(r'<sheet\b[^>]*/?>', z.read('xl/workbook.xml').decode('utf8')):
            n = re.search(r'name="([^"]*)"', tag)
            r = re.search(r'r:id="(rId\d+)"', tag)
            if n and r and elegir(_texto(n.group(1))):
                self.nombre = _texto(n.group(1))
                ruta = rels[r.group(1)]
                ruta = ruta[1:] if ruta.startswith('/') else ('xl/' + ruta if not ruta.startswith('xl/') else ruta)
                break
        if not ruta:
            raise SystemExit('⛔ no se encontró la solapa pedida')

        ss = []
        if 'xl/sharedStrings.xml' in z.namelist():
            for si in re.findall(r'<si>(.*?)</si>', z.read('xl/sharedStrings.xml').decode('utf8'), re.S):
                ss.append(_texto(''.join(re.findall(r'<t[^>]*>(.*?)</t>', si, re.S))))

        self.filas = []
        for _, cuerpo in FILA.findall(z.read(ruta).decode('utf8')):
            cel = {}
            for attrs, dentro in CELDA.findall(cuerpo):
                m = REF.search(attrs)
                if not m:
                    continue
                if not dentro:                       # ⭐ autocerrada → vacía, y NO consume la siguiente
                    cel[m.group(1)] = ''
                    continue
                t = re.search(r't="(\w+)"', attrs)
                t = t.group(1) if t else 'n'
                v = re.search(r'<v>(.*?)</v>', dentro, re.S)
                if t == 's' and v:
                    k = int(v.group(1))
                    cel[m.group(1)] = ss[k] if k < len(ss) else ''
                elif t == 'inlineStr':
                    cel[m.group(1)] = _texto(''.join(re.findall(r'<t[^>]*>(.*?)</t>', dentro, re.S)))
                else:
                    cel[m.group(1)] = _texto(v.group(1)) if v else ''
            self.filas.append(cel)

        self.cab = {norm(v): k for k, v in self.filas[0].items() if norm(v)} if self.filas else {}
        self.datos = [f for f in self.filas[1:] if any(norm(v) for v in f.values())]

    def col(self, titulo):
        return self.cab.get(titulo)

    def g(self, fila, titulo):
        c = self.cab.get(titulo)
        return norm(fila.get(c, '')) if c else ''
