# `docs/_fixtures/` — los exports contra los que se midió

**Estado: vivo.** Creado el 19/08/2026 por el prompt `2026-08-19_3_ordenar_rama_validacion.md`,
que atiende `C-21`.

---

## Qué es esta carpeta

Los **exports congelados** de las bases, con la fecha en el nombre. Son la evidencia de los casos
`exacto` de la rama de validación (`docs/casos_validacion_AAAA-MM-DD.csv`): sin ellos, los **104
casos `exacto`** dejan de ser reproducibles por nadie más que el usuario.

**Nadie los edita.** Un fixture es una foto de una base en un momento dado; corregirlo destruye
justamente lo que lo hace útil. Si un export nuevo dice otra cosa, entra como archivo nuevo con su
propia fecha y el viejo se queda donde está.

Es la única tarea de la rama de validación que **no se resuelve midiendo** — la salida es subir
archivos, y los sube el usuario.

## Convención de nombre

```
AAAA-MM-DD_<base>.<ext>
```

La fecha es la del **export**, no la del día en que se sube. Los archivos de la tabla de abajo
conservan por ahora el nombre con que los nombra el handoff; al subirlos se renombran a esta forma.

## Los ocho fixtures que la rama usó

Tabla copiada textual de la §8 de `docs/Sesiones/HANDOFF_validacion_2026-08-19.md`. La marca de
estado dice qué hay **en esta carpeta**, hoy.

| fixture | contiene | estado |
|---|---|---|
| `Informe_2026-07-31.zip` | `Base Looker`, `Seguimiento Digital`, `RDV`, `M2` + deck **JM 24-31/07** + deck SECCO 31/07 | `[falta]` |
| `Seguimiento_Digital2026-08-06.zip` | `Seguimiento Digital`, `RDV`, `M2` — **sin `Base Looker`** + deck SECCO 07/08 | `[falta]` |
| `Base_reuniones_-_Digital_-_Call_Center.xlsx` (12/08) | primera versión de la base de reuniones | `[falta]` |
| `2026-08-14_Base_Looker.xlsx` | primer export con la columna `Tipo de llamado` en `CC` | `[falta]` |
| sueltos del 14/08 | `Base_reuniones` (v2), `M2 Reporte para Fede`, `Seguimiento Digital`, `Base Looker`, `RDV` + deck **JM 08-14/08** | `[falta]` |

**Ocho de ocho `[falta]`.** La carpeta existe y su índice también; los archivos no.

## Los decks que viven en Drive se listan por ID, no se bajan

No tienen bases propias asociadas, así que no son fixtures: son la contraparte publicada contra la
que se mide. Se citan por ID y se leen con el conector de Drive.

- **JM 19/06–26/06** — `1Y_2TWYmkxOdUZQZMVVU-DW3roShbbXf7DUq6k-yMcXI`
- **JM 31/07–07/08** — `10hoJur_ACZW2eqyJE6WGskIRiQrCFGbChR_PBYohHJU`

---

## ⚠ Lo que bloquea subirlos, y no es un descuido de configuración

`.gitignore` excluye `*.xlsx` y `*.zip` — que es **todo** lo de la tabla de arriba — y lo hace con
el motivo escrito al lado (DOC-5 Parte 2, 31/07/2026):

> *Muestras de datos: el repo es público y las bases tienen datos reales de GCBA (nombres de
> funcionarios, barrios, volúmenes de envío, respuestas de vecinos).*

Así que la excepción que `C-21` necesita **no es un ajuste de `.gitignore`: es revisar una decisión
de privacidad ya tomada**, sobre un repo que sigue siendo público. Subir los ocho archivos tal cual
publica datos personales de vecinos.

**No se decide acá y no se hizo.** Lo que este README resuelve es la mitad que no tiene ese
problema: hasta hoy la lista de qué falta vivía sólo en un handoff, y `C-21` figuraba como
`cerrado` en el CSV mientras la tarea seguía sin hacerse. Ahora el hueco está declarado donde se
lo va a buscar.

Las salidas posibles, para que quien decida las tenga a la vista:

1. **Repo privado aparte** para los fixtures, referenciado desde acá.
2. **Anonimizar** antes de subir — barato en volúmenes, caro en nombres, y rompe la reproducción
   exacta de cualquier caso que dependa de un nombre.
3. **Dejarlos fuera y aceptar el riesgo**, con el inventario acá como única red: si se pierden, se
   sabe exactamente qué se perdió.

Registrado en `docs/PENDIENTES_consistencia.md`.
