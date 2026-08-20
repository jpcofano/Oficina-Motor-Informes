# `docs/_fixtures/` — dónde están los exports y cómo se reconocen

**Estado: vivo.** Creado el 19/08/2026 (`2026-08-19_3_ordenar_rama_validacion.md`). Reescrito el
20/08/2026 con la decisión del usuario sobre `C-21`.

---

## La decisión, primero, porque cambia qué es esta carpeta

**Los fixtures NO van al repo, y eso es deliberado.** `.gitignore` excluye `*.xlsx` y `*.zip` con
el motivo escrito desde el 31/07 (`DOC-5` Parte 2) —*el repo es público y las bases traen nombres de
funcionarios, barrios, volúmenes de envío y respuestas de vecinos*— y **ese motivo sigue valiendo**.
No se pidió excepción.

Los archivos viven en esta carpeta, **en disco y fuera de git**. Cuando una validación necesita uno,
**el usuario lo adjunta al chat**. El repo no guarda los fixtures: guarda **dónde están y cómo se
reconocen**.

**Esta carpeta no es un inventario de lo que falta. Es un índice de lo que hay.**

## Ruta local

```
C:\Users\20243359679\OneDrive\Documentos\AppsScript\Oficina\Motor Informes\docs\_fixtures\
```

Sólo este `README.md` está versionado. Todo lo demás que aparezca acá es local por diseño.

## Convención de nombre

```
AAAA-MM-DD_<base>.<ext>
```

La fecha es la del **export**, no la del día en que se copió. Los archivos que ya están conservan
por ahora el nombre con que los nombra el handoff; el que manda para identificarlos es el **sha**,
no el nombre.

---

## Cómo se usa — la línea que hace que esto sirva

**El usuario adjunta el fixture al chat; quien lo recibe verifica el `sha256` contra la tabla de
huellas ANTES de citar un número.**

⚠ **El sha no es prolijidad.** Un archivo pegado en un chat, sin huella, es **anónimo**: no hay nada
que distinga el export del 12/08 del que le siguió dos días después, y los dos se llaman casi igual.
Un caso `exacto` medido contra un archivo anónimo **no es reproducible**, que es exactamente lo que
`C-21` venía a arreglar. Con el sha en el repo, quien recibe el archivo puede afirmar **contra cuál
midió**, y quien lea el caso seis semanas después puede comprobarlo.

Verificarlo, del lado de quien recibe:

```
sha256sum "<archivo adjunto>"
```

---

## Los ocho fixtures de la rama

Tabla copiada textual de la §8 de `docs/Sesiones/HANDOFF_validacion_2026-08-19.md`. El estado dice
qué hay **en esta carpeta**, hoy.

| fixture | contiene | estado |
|---|---|---|
| `Informe_2026-07-31.zip` | `Base Looker`, `Seguimiento Digital`, `RDV`, `M2` + deck **JM 24-31/07** + deck SECCO 31/07 | `[local]` |
| `Seguimiento_Digital2026-08-06.zip` | `Seguimiento Digital`, `RDV`, `M2` — **sin `Base Looker`** + deck SECCO 07/08 | `[local]` |
| `Base_reuniones_-_Digital_-_Call_Center.xlsx` (12/08) | primera versión de la base de reuniones | `[no está]` |
| `2026-08-14_Base_Looker.xlsx` | primer export con la columna `Tipo de llamado` en `CC` | `[no está]` |
| sueltos del 14/08 | `Base_reuniones` (v2), `M2 Reporte para Fede`, `Seguimiento Digital`, `Base Looker`, `RDV` + deck **JM 08-14/08** | `[no está]` |

`[local]` = está en la carpeta, fuera de git · `[no está]` = todavía no se copió acá.

**`[no está]` no significa perdido.** Los del 12/08 y el 14/08 son exports que el usuario descargó y
que pueden seguir en su carpeta de descargas; copiarlos acá y anotarles el sha es lo que los vuelve
citables.

## Tabla de huellas

Una fila **por archivo realmente presente**. Es la que se consulta al recibir un adjunto. Crece
cuando entra un archivo nuevo; **una fila nunca se edita** — si un export cambia, es otro archivo y
otra fila.

| archivo | bytes | sha256 |
|---|---|---|
| `Informe 2026-07-31.zip` | 56.434.396 | `97310e16f49d2726e0b46d515f13d68d84f5ba13791c7bc57b05c8495e9a0ecb` |
| `Seguimiento Digital2026-08-06.zip` | 98.332.566 | `9a1ee89d0e0b0aa6619c5efa3cd9ee9409269ce44ff856523b9ed4bcbf76b2e9` |

⚠ **Y el sha ya sirvió para algo en su primer uso:** los dos archivos de arriba son **idénticos byte
a byte** a `Plan Inicial/_archivo/samples/Informes ejemplo/Informe 2026-07-31.zip` y
`…/Seguimiento Digital2026-08-06.zip`, que están en el repo local —ignorados por git— desde el
03/08 y el 06/08. **Los dos primeros fixtures ya estaban archivados hacía dos semanas y nadie lo
sabía**, porque sin huella nada relacionaba una copia con la otra. Es el argumento de esta tabla,
hecho con la tabla misma.

## Los decks que viven en Drive se listan por ID, no se bajan

No tienen bases propias asociadas, así que no son fixtures: son la contraparte publicada contra la
que se mide. Se citan por ID y se leen con el conector de Drive.

- **JM 19/06–26/06** — `1Y_2TWYmkxOdUZQZMVVU-DW3roShbbXf7DUq6k-yMcXI`
- **JM 31/07–07/08** — `10hoJur_ACZW2eqyJE6WGskIRiQrCFGbChR_PBYohHJU`

---

## El riesgo que se acepta, escrito antes de que pase

La salida elegida deja los fixtures **fuera de todo respaldo versionado**. Si esta carpeta se
pierde —disco, sincronización de OneDrive, borrado a mano—, **los 104 casos `exacto` dejan de ser
reproducibles** y este índice sólo sirve para saber **exactamente qué se perdió**.

Eso no es un efecto colateral: **es la mitad de lo que se eligió**, y está acá para que se lea antes
del accidente y no después. La contrapartida es que ningún dato personal de un vecino de GCBA entra
a un repo público, que fue el criterio que decidió.

Las otras dos salidas siguen escritas en `docs/PENDIENTES_consistencia.md` y **no se borraron**: si
el riesgo cambia de tamaño, se vuelven a mirar.
