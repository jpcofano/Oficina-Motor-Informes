#!/usr/bin/env python3
"""
Vuelca `Id cuentas` + `Nombre Campaña` de `digital/CAMPAÑAS_DESGLOCE_DIGITAL` como JSON.

⭐ **Existe para no reimplementar un lector de `.xlsx` en JS.** `tools/probar-particion-etapa.js`
necesita las 5.161 filas reales para contar la partición, y el comparador que aplica **tiene que ser
el del motor** —que es JavaScript—. La salida separa las dos mitades: **acá se lee, allá se compara**.

⚠ Un primer intento escribió un lector de zip en JS y no matcheó la entrada; reescribir un lector
que ya existe y funciona es el error que `CLAUDE.md` §4 nombra —*el instrumento que reproduce lógica
y la reproduce peor*—, aplicado a la lectura del fixture en vez de al cálculo.

Corre con: python tools/volcar-nombres-desglose.py
"""
import importlib.util
import json
import sys
import zipfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

_spec = importlib.util.spec_from_file_location('desglose', 'tools/medir-post-en-desglose.py')
_d = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_d)


def main():
    z = zipfile.ZipFile(_d.FIXTURE)
    libro = _d.Libro(z.read(_d.INTERNO))
    filas = libro.filas(dict(libro.hojas)[_d.SOLAPA])
    enc = [_d.norm(c) for c in filas[0]]
    i_nom = enc.index('Nombre Campaña')
    i_cta = enc.index('Id cuentas')
    cel = lambda f, k: (_d.norm(f[k]) if k < len(f) else '')

    salida = [{'cuenta': cel(f, i_cta), 'nombre': cel(f, i_nom)} for f in filas[1:]]
    json.dump({'solapa': _d.SOLAPA, 'filas': salida}, sys.stdout, ensure_ascii=False)
    return 0


if __name__ == '__main__':
    sys.exit(main())
