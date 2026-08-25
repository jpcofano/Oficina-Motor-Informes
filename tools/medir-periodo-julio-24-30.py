#!/usr/bin/env python3
"""
El **Período** de `L-036` para `julio_24_30`, medido en el desglose (`2026-08-25_3`, Parte 4).

⛔⛔ **Qué contesta, y sólo eso:** cuántas filas POST tiene cada encuentro del temario en
`digital/CAMPAÑAS_DESGLOCE_DIGITAL`, y qué rango `min(Fecha inicio)` – `max(Fecha fin)` sale de
ellas. Es lo que `GRUPO_TEXTO` va a componer.

⚠ **Lo que NO contesta:** qué dice la base HOY —es el export del **20/08/2026**—, ni que el motor lea
así. **Reproduce la DEFINICIÓN, no el motor** (`CLAUDE.md` §4, camino del medio): el recorte
—`des_campana` contiene `Agenda Post`— se copia de `DIMENSIONES_.etapa`, y la identidad de la fila
—`Id cuentas`— de `SOLAPAS.campo_id_cuenta`. No se resuelve `MAPEO` ni se corre ninguna operación.

⭐ **Control positivo, y aborta si no da:** los ids se buscan en la solapa **sin** el recorte POST.
Si un id no aparece **ni con filas PRE**, el instrumento está mirando mal y no hay hallazgo.

Corre con: python tools/medir-periodo-julio-24-30.py
"""
import datetime
import hashlib
import io
import re
import sys
import zipfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

FIXTURE = 'docs/_fixtures/Seguimiento Digital  2026-08-20.zip'
SHA_ESPERADO = 'f8ef3227fc6cc73ef5879948451093f8e7a278c0baf1f4341d187958f0f8cc87'
INTERNO = 'Seguimiento Digital  2026-08-20/Seguimiento Digital  (4).xlsx'
SOLAPA = 'CAMPAÑAS_DESGLOCE_DIGITAL'

# El recorte del motor, copiado de `DIMENSIONES_.etapa` (`Fuentes.gs`). ⚠ NO es «empieza con Post»:
# son dos reglas distintas y difieren en 30 filas sobre la solapa entera.
PATRON_POST = 'Agenda Post'

# ⚠ **Los ids se buscan por PREFIJO de cuenta y se imprimen COMPLETOS.** Un prefijo es una convención
# de nombre, no una clave (`CLAUDE.md` §4, 25/08): la lista de abajo es de encuentros conocidos del
# temario y lo que vale es lo que el fixture devuelva con su nombre entero.
ENCUENTROS = ['3346', '3354', '3387', '3389', '3420']

norm = lambda s: re.sub(r'\s+', ' ', str(s or '')).strip()


def col_a_indice(ref):
    n = 0
    for c in re.match(r'([A-Z]+)', ref).group(1):
        n = n * 26 + (ord(c) - 64)
    return n - 1


def serial_a_fecha(v):
    """El serial de Sheets/Excel a fecha. ⚠ **Es el formato de almacenamiento del `.xlsx`, no lo que
    Apps Script entrega** — la confusión ya costó una corrida el 25/08."""
    try:
        n = float(v)
    except (TypeError, ValueError):
        return None
    if n <= 0:
        return None
    return datetime.date(1899, 12, 30) + datetime.timedelta(days=int(n))


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
        for fila in re.findall(r'<row\b[^>]*>(.*?)</row>', xml, re.S):
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

    with zipfile.ZipFile(io.BytesIO(crudo)) as z:
        libro = Libro(z.read(INTERNO))
    ruta = dict(libro.hojas).get(SOLAPA)
    if not ruta:
        print('⛔ no está la solapa %s' % SOLAPA)
        return 1

    filas = libro.filas(ruta)
    cab = [norm(c) for c in filas[0]]
    ix = dict((t, i) for i, t in enumerate(cab))
    datos = filas[1:]
    print('solapa %s · %d filas de datos · encabezado en la fila 1' % (SOLAPA, len(datos)))
    print('')

    def celda(f, titulo):
        i = ix.get(titulo)
        return f[i] if i is not None and i < len(f) else ''

    print('=' * 78)
    print('1 · CONTROL POSITIVO — los ids aparecen en la solapa (sin el recorte POST)')
    print('=' * 78)
    presentes = {}
    for f in datos:
        idc = norm(celda(f, 'Id cuentas'))
        for pref in ENCUENTROS:
            if idc.startswith(pref):
                presentes.setdefault(pref, set()).add(idc)
    faltan = [p for p in ENCUENTROS if p not in presentes]
    for pref in ENCUENTROS:
        nombres = sorted(presentes.get(pref, []))
        print('  %-6s %s' % (pref, ', '.join(nombres) if nombres else '⛔ NO APARECE'))
    if faltan:
        print('')
        print('  ⛔ %d de %d no aparecen NI CON FILAS PRE. El instrumento no ve lo que dice ver;' %
              (len(faltan), len(ENCUENTROS)))
        print('     «no está» y «no miré» se ven igual, así que acá no hay hallazgo. ABORTA.')
        return 1
    print('')
    print('  ✅ los %d aparecen — el instrumento ve la solapa' % len(ENCUENTROS))
    print('')

    print('=' * 78)
    print('2 · LAS FILAS POST DE CADA ENCUENTRO, y el rango que sale de ellas')
    print('=' * 78)
    print('  recorte: `Nombre Campaña` contiene «%s» (copiado de DIMENSIONES_.etapa)' % PATRON_POST)
    print('')
    for pref in ENCUENTROS:
        for idc in sorted(presentes[pref]):
            suyas = [f for f in datos if norm(celda(f, 'Id cuentas')) == idc]
            post = [f for f in suyas if PATRON_POST.lower() in norm(celda(f, 'Nombre Campaña')).lower()]
            print('  %-16s %d fila(s) en total · %d POST' % (idc, len(suyas), len(post)))
            inicios, fines = [], []
            for f in post:
                di = serial_a_fecha(celda(f, 'Fecha inicio'))
                df = serial_a_fecha(celda(f, 'Fecha fin'))
                if di:
                    inicios.append(di)
                if df:
                    fines.append(df)
                print('      %-12s %s → %s   imp=%-10s vis=%-10s %s' % (
                    norm(celda(f, 'Plataforma')),
                    di.strftime('%d/%m') if di else '(sin fecha)',
                    df.strftime('%d/%m') if df else '(sin fecha)',
                    norm(celda(f, 'Impresiones')), norm(celda(f, 'Visualizaciones')),
                    norm(celda(f, 'Nombre Campaña'))[:52]))
            if inicios and fines:
                print('      ⭐ PERÍODO = %s — %s   (min de %d inicios, max de %d fines)' % (
                    min(inicios).strftime('%d/%m'), max(fines).strftime('%d/%m'),
                    len(inicios), len(fines)))
            elif post:
                print('      ⚠ sin fechas utilizables: el casillero saldría con hueco visible')
            print('')

    print('=' * 78)
    print('⚠ LO QUE ESTA MEDICIÓN NO CONTESTA')
    print('=' * 78)
    print('  · Qué dice la base HOY. Es el export del 20/08/2026 y el rango cruza meses,')
    print('    así que una carga posterior lo puede mover.')
    print('  · Que el motor lea así. Reproduce la DEFINICIÓN —el recorte y la identidad—,')
    print('    no el camino de lectura: eso lo cierra una corrida.')
    print('  · Cuál es la RANURA de cada encuentro. Eso lo fija el temario, no esta solapa.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
