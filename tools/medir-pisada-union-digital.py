#!/usr/bin/env python3
"""
Cuánto pisa `unirDigitalPorCuenta` — **medir, sin arreglar** (pedido del usuario, 25/08).

⛔ **El hecho:** `porCuenta[idCuenta] = registro` **asigna, no acumula**, así que un id con varias
filas en la solapa maestra **conserva la última**. ⭐ **No es un hallazgo nuevo**: está instrumentado
desde el 09/08 (`N4`), que publica `filas_pisadas` y dice con todas las letras *«sigue pisando
exactamente igual, y con qué reemplazarla es una decisión de diseño que espera al usuario»*.

⭐⭐ **Y lo que la acota, que es lo primero que hay que decir:** **sólo pisa los campos de DIMENSIÓN
de la maestra** —los cinco de `CAMPOS_DIMENSION_MAESTRA_`—. Los **hechos de cada canal ACUMULAN** en
`<prefijo>_filas` (`Union.gs`: *«si una solapa trae varias filas por cuenta, NO se suma — se guarda
el arreglo crudo»*). Así que **no toca las métricas de mail, IVR, SMS, alcance ni digital**.

⚠ Foto del **20/08/2026**. No reimplementa lógica del motor: cuenta filas y compara textos.

Corre con: python tools/medir-pisada-union-digital.py
"""
import hashlib
import importlib.util
import io
import sys
import zipfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

_spec = importlib.util.spec_from_file_location('desglose', 'tools/medir-post-en-desglose.py')
_d = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_d)

SOLAPA_MAESTRA = 'Seguimiento digital'

# Los cinco campos que la maestra aporta, copiados de `CAMPOS_DIMENSION_MAESTRA_` (`Union.gs`), con
# su encabezado real en la solapa. ⚠ **Dos de los cinco son de NOMBRE y tres son de PAUTA**, y esa
# diferencia importa: un nombre distinto entre pre y post es esperable; una pauta distinta es dinero.
CAMPOS = [
    ('sd_campana_cuentas', 'Nombre campaña | Cuentas'),
    ('sd_campana_digital', 'Nombre campaña | Digital'),
    ('sd_pauta_google', None),
    ('sd_pauta_prog', None),
    ('sd_pauta_meta', None),
]


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
    ruta = dict(libro.hojas).get(SOLAPA_MAESTRA)
    if not ruta:
        print('⛔ No está la solapa %s' % SOLAPA_MAESTRA)
        return 1

    filas = libro.filas(ruta)
    enc = [_d.norm(c) for c in filas[0]]
    idx = {h: i for i, h in enumerate(enc)}
    cel = lambda f, h: (_d.norm(f[idx[h]]) if h in idx and idx[h] < len(f) else '')

    print('=' * 78)
    print('1 · CUÁNTOS IDS TIENEN MÁS DE UNA FILA — ¿es un borde o es lo normal?')
    print('=' * 78)
    por_id = {}
    sin_id = 0
    for f in filas[1:]:
        i = cel(f, 'ID Cuentas')
        if not i:
            sin_id += 1
            continue
        por_id.setdefault(i, []).append(f)

    con_id = sum(len(v) for v in por_id.values())
    multi = {k: v for k, v in por_id.items() if len(v) > 1}
    pisadas = con_id - len(por_id)

    print('  filas de la solapa            %5d' % (len(filas) - 1))
    print('  filas sin id (se descartan)   %5d' % sin_id)
    print('  filas con id                  %5d' % con_id)
    print('  ids distintos                 %5d   <- lo que sobrevive en `porCuenta`' % len(por_id))
    print('  ⭐ FILAS PISADAS               %5d   <- el `filas_pisadas` de N4' % pisadas)
    print()
    print('  ids con MÁS de una fila       %5d de %d  (%.1f %%)'
          % (len(multi), len(por_id), 100.0 * len(multi) / max(1, len(por_id))))
    reparto = {}
    for v in por_id.values():
        reparto[len(v)] = reparto.get(len(v), 0) + 1
    print('  reparto: %s' % ' · '.join('%d fila(s): %d ids' % (k, reparto[k]) for k in sorted(reparto)))

    print('\n  ⭐⭐ VEREDICTO de la pregunta 2 del usuario:')
    if len(multi) > len(por_id) / 2:
        print('     ⛔ ES LA MAYORÍA — no es un borde.')
    else:
        print('     ⚠ NO es la mayoría: %d de %d ids (%.1f %%). Es un caso frecuente, no el normal.'
              % (len(multi), len(por_id), 100.0 * len(multi) / max(1, len(por_id))))

    print('\n' + '=' * 78)
    print('2 · ⭐ CUÁNDO LA PISADA CAMBIA EL DATO — no alcanza con que haya varias filas')
    print('=' * 78)
    print('⚠ Si las filas repetidas traen el MISMO valor, pisar no cambia nada. Lo que importa es')
    print('  en cuántas DIFIEREN los cinco campos de dimensión.\n')

    presentes = [(c, h) for c, h in CAMPOS if h and h in idx]
    ausentes = [c for c, h in CAMPOS if not h or h not in idx]
    if ausentes:
        print('  ⚠ sin encabezado conocido en esta solapa (no se pueden comparar): %s'
              % ', '.join(ausentes))
        print('    Los tres `sd_pauta_*` salen del `MAPEO`, no de un título fijo.\n')

    difieren = {c: [] for c, _ in presentes}
    for i, fs in multi.items():
        for campo, hdr in presentes:
            vals = set(cel(f, hdr) for f in fs)
            if len(vals) > 1:
                difieren[campo].append(i)

    for campo, _ in presentes:
        n = len(difieren[campo])
        marca = '  ⛔ la pisada CAMBIA el valor' if n else '  ✅ pisar no cambia nada'
        print('  %-22s difiere en %3d de %d ids con varias filas%s'
              % (campo, n, len(multi), marca))

    print('\n' + '=' * 78)
    print('3 · QUIÉN QUEDA EXPUESTO — los ids del temario de julio')
    print('=' * 78)
    for i in ['3346-JULJDGAG', '3354-JULJDGAG', '3387-JULJDGGC', '3389-JULJDGAG', '3420-JULJDGGC']:
        fs = por_id.get(i, [])
        if not fs:
            print('  %-16s ⛔ no está en la maestra' % i)
            continue
        print('  %-16s %d fila(s)%s' % (i, len(fs), '  ⚠ PISA' if len(fs) > 1 else ''))
        for f in fs:
            print('      %-52s | %s' % (cel(f, 'Nombre campaña | Digital')[:52], cel(f, 'Mes')))

    print('\n' + '=' * 78)
    print('⚠ LO QUE ESTA MEDICIÓN NO CONTESTA')
    print('=' * 78)
    print('  · Qué publica hoy cada consumidor. Eso necesita una corrida: acá se mide la FUENTE,')
    print('    no la salida.')
    print('  · Los tres `sd_pauta_*`: sus columnas salen del `MAPEO` y no de un título fijo, así')
    print('    que este instrumento no las compara. **Ese cero es «no medí», no «no difieren».**')
    print('  · Qué dice la base HOY: es el export del 20/08/2026.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
