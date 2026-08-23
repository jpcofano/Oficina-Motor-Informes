# -*- coding: utf-8 -*-
"""Censo de tokens POR CELDA de la plantilla, respetando la estructura de tabla.

El texto aplanado de un .pptx no dice en que celda esta cada token: por eso no se
podia decidir si la fila Meta de L-046 tiene el token agregado o coincide por ser
la unica con dato. Esto recorre las tablas fila por fila y columna por columna.
"""
import zipfile, re, sys, io
import xml.etree.ElementTree as ET

A = '{http://schemas.openxmlformats.org/drawingml/2006/main}'
RUTA = ('C:/Users/20243359679/OneDrive/Documentos/AppsScript/Oficina/Motor Informes/'
        'Plan Inicial/_archivo/Plantillas/JM_marcada.pptx')

def texto_de(nodo):
    return ''.join(t.text or '' for t in nodo.iter(A + 't'))

def slides(z):
    ns = [n for n in z.namelist() if re.match(r'ppt/slides/slide\d+\.xml$', n)]
    return sorted(ns, key=lambda s: int(re.findall(r'\d+', s)[0]))

def tablas_de(root):
    """Cada tabla como lista de filas, cada fila lista de textos de celda."""
    out = []
    for tbl in root.iter(A + 'tbl'):
        filas = []
        for tr in tbl.findall(A + 'tr'):
            filas.append([texto_de(tc) for tc in tr.findall(A + 'tc')])
        out.append(filas)
    return out

def tokens(s):
    return re.findall(r'\{\{([^}]+)\}\}', s or '')

z = zipfile.ZipFile(RUTA)
objetivo = sys.argv[1] if len(sys.argv) > 1 else ''

for i, n in enumerate(slides(z), 1):
    root = ET.fromstring(z.read(n))
    txt = ' '.join(texto_de(sp) for sp in root.iter(A + 'p'))
    if objetivo and objetivo.lower() not in txt.lower():
        continue
    tbls = tablas_de(root)
    todos = tokens(txt)
    print('=' * 96)
    print('SLIDE %d · %d tabla(s) · %d token(s) en la lamina' % (i, len(tbls), len(todos)))
    primera = txt.strip()[:70]
    print('   primer texto: %s' % primera.encode('ascii', 'replace').decode())
    for ti, filas in enumerate(tbls, 1):
        print('   -- tabla %d: %d fila(s) x %d columna(s) --'
              % (ti, len(filas), max(len(f) for f in filas) if filas else 0))
        for fi, fila in enumerate(filas):
            celdas = []
            for c in fila:
                tk = tokens(c)
                if tk:
                    celdas.append('{{%s}}' % '}}{{'.join(tk))
                else:
                    celdas.append((c.strip() or '·')[:22])
            print('      %2d | %s' % (fi, ' | '.join(x.encode('ascii', 'replace').decode() for x in celdas)))
    sueltos = [t for t in todos if not any(t in c for filas in tbls for f in filas for c in f)]
    if sueltos:
        print('   tokens FUERA de tabla: %s' % ', '.join(sueltos))
