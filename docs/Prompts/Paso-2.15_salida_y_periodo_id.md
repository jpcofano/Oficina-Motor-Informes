# Paso 2.15 — `carpeta_salida` a reportes y `periodo_id` en la curaduría

**Estado:** vivo · **Fecha:** 2026-08-02 · **Ubicación:** `docs/Prompts/Paso-2.15_salida_y_periodo_id.md`

> Dos ítems del Tramo 1 de `PLAN.md §2`. Los dos son cambios de configuración y tocan los
> mismos seeds, por eso van juntos. **Registrar M2 va aparte**: es la primera medición de
> `D-01` y compartir commit haría irrespondible "cuántas líneas de `.gs` necesitó".
>
> **Un commit por parte. Se para y se avisa al final de cada una.**

---

## Parte 0 — Verificación de premisas. Sólo lectura. Reportar y **PARAR**.

**0.1 · Esquemas vivos.** Confirmar contra la planilla las columnas actuales de `CAMPANAS`
y `REUNIONES`, y que `PERIODOS` tenga la columna que va a hacer de clave. Lo que tengo
registrado y hay que verificar, no asumir:

- `CAMPANAS`: `campana_id`, `nombre`, `informe_id`, `base_id`, `tipo`, `desde`, `hasta`,
  `mostrar`, `orden` — 3 filas.
- `REUNIONES`: `orden`, `eje`, `tipo`, `nombre`, `fecha`, `etapa`, `mostrar`,
  `texto_original`, `notas` — 7 filas.
- `PERIODOS`: 2 filas.

**0.2 · Asimetría de estructura — ✅ verificada y resuelta el 02/08/2026.**

> El texto original de este punto deducía la asimetría del resumen de `instalar()`
> —"lista `REUNIONES` y no lista `CAMPANAS`"— y **estaba mal**: las dos ramas hacen
> `actualizadas.push(nombre)`, así que aparecer en esa lista no discrimina nada. Se
> reemplaza por la premisa medida, que apunta al lugar contrario.

El discriminador es **`COLUMNAS_DELTA_`** (`Instalar.gs`), y `REUNIONES` **no está**:

```
con delta : MARCADORES · CAMPANAS · BASES · MAPEO · SOLAPAS
sin delta : CONFIG · INFORMES · PERIODOS · REUNIONES · SECCIONES · VALORES · VALORES_DIVERGENTES
```

| rama | qué hace `aplicarInstalacion_` |
|---|---|
| **con** delta | `asegurarColumna_` por columna faltante — `insertColumnBefore`, que corre los datos **junto con sus encabezados** |
| **sin** delta | `hoja.getRange(1,1,1,headers.length).setValues([headers])` — **reescribe la fila 1** y no mueve los datos |

**Por eso `periodo_id` "al principio" en `REUNIONES` desalinearía la hoja** con el código de
hoy: encabezados nuevos sobre datos viejos, sobre una hoja curada a mano y en silencio.

**Decisión (usuario, 02/08): se agrega `REUNIONES` a `COLUMNAS_DELTA_` y recién ahí va
`periodo_id` donde `B.1` pide.** Poner la columna al final esquiva el caso pero lo deja
armado para la próxima columna que alguien agregue; arreglarlo cuesta una línea más.

**Verificado antes de decidir** —`asegurarColumna_` no toca las 7 filas curadas:

1. **Es idempotente**: si el encabezado ya existe, `return false` y no escribe nada.
2. `insertColumnBefore` es una inserción real de Sheets — los datos se corren a la derecha
   **con** su encabezado. Es lo contrario de reescribir la fila 1.
3. Sólo escribe la celda del encabezado nuevo; las 7 filas quedan con la columna vacía.

**Dos efectos que sí cambian, y los dos son buscados:**

- `REUNIONES` **deja de recibir la reescritura de encabezados en cada `instalar()`**. Gana
  que ya no se la puede desalinear desde el seed; pierde que un encabezado renombrado a mano
  ya no se auto-repara. Ese "auto-reparado" **es** el mecanismo peligroso, así que es el
  intercambio que la decisión acepta.
- **El resumen cambia, el diff no.** Hoy `REUNIONES` aparece en cada corrida bajo *"Hojas
  verificadas/reparadas por `instalar()`"* porque la rama `else` siempre hace el `push`.
  Después va a aparecer **una sola vez** —cuando agregue la columna— y nunca más.
  `cambiadas`, `protegidas` y `sin cambios` **no se mueven**: eso es lo que hay que confirmar
  al ejecutar, y si se mueven, parar.

⚠ **Arregla el caso, no la clase.** `REUNIONES` es **una de siete** hojas sin delta. Las
otras seis tienen el mismo riesgo latente: si alguien reordena sus `headers` en
`HOJAS_CONFIG_`, se desalinean igual. Este paso no las toca — queda anotado para que nadie
lea "resuelto" donde dice "resuelto para `REUNIONES`".

**0.3 · Escritores.** `ESCRITORES.md` registra `CAMPANAS` con **cero escritores**. `REUNIONES`
**sí tiene uno desde ayer**: `cargarTemario(texto)`, que el Paso 2.14 separó de su envoltorio
de menú y **agrega filas**. Si `REUNIONES` gana `periodo_id`, `cargarTemario` tiene que
poder escribirlo — si no, cada temario cargado entra sin período y la curaduría vuelve a
pisarse, que es justo lo que este paso viene a evitar. Verificar y reportar.

**0.4 · La carpeta de destino. ✅ Dada por el usuario el 02/08/2026.**

`CONFIG.carpeta_salida` apunta hoy a `1EyTlfg16vpyrftpUXgacShFk8iSbX_fJ`, de
`jpcofanogcba1`, y está sin usar. El destino nuevo es:

```
1LAEVlWZXoGjon2cnaMjGksV0THz3Ejlz
```

**Verificado contra Drive el 02/08**, antes de escribirlo acá: existe, es una carpeta
(`application/vnd.google-apps.folder`), se llama **"Salidas Reportes"** y su dueño es
**`reporteseinformesgcba@gmail.com`** — o sea que cumple `D-03` ("Reportes es dueño de todo
lo que un humano abre") sin que haya que asumirlo. Lo que la Parte 0 igual tiene que
confirmar es que la **cuenta que ejecuta** pueda escribir ahí, que es otra cosa que ser
dueño del ID.

**0.5 · Reportar y parar.**

---

## Parte A — `carpeta_salida` a reportes (`D-03`)

Cambio de una fila de `CONFIG`: `carpeta_salida` pasa a apuntar a la carpeta que dio el
usuario en 0.4, en el Drive de `reporteseinformesgcba`.

**Por qué ahora y no cuando se genere el primer deck:** hoy es una fila de config. Después
del Paso 4 es mudanza de archivos, con los IDs ya escritos en el registro de corridas.

El seed también cambia, no sólo la hoja — si sólo se edita la planilla, el próximo
`Aplicar configuración` lo revierte o lo marca como diferencia. **Verificar cuál de las dos
cosas pasa** y dejarlo consistente: hoja y `SEED_CONFIG_` diciendo lo mismo.

**Verificación:** `Aplicar configuración` ×2 después del cambio. La primera puede reportar
`cambiadas: 1`; la segunda tiene que dar `sin cambios: sí` y `protegidas (con diferencia): 0`.
Si el piso de ruido vuelve a subir, el cambio quedó mal.

→ **Commit A:** `Paso 2.15 ✅ — carpeta_salida a reportes (D-03)`

---

## Parte B — `periodo_id` en `CAMPANAS` y `REUNIONES` (`D-08`)

Columna nueva en las dos hojas, clave foránea a `PERIODOS`.

**El problema que resuelve**, escrito para que no se pierda: el propio código declara que
estas dos hojas son *"curada a mano, cambia cada semana"*. Sin clave de período, la
curaduría de esta semana **pisa la anterior**, y volver a correr un informe de un período
pasado devuelve otro resultado — sin fallar y sin avisar. Con `periodo_id`, la curaduría se
acumula, el motor filtra por período al correr, y agregar una reunión es una fila más en vez
de reconfigurar todo.

**B.1** — Agregar `periodo_id` a las dos hojas y a sus seeds de ejemplo
(`SEED_CAMPANAS_EJEMPLO_`, `SEED_REUNIONES_EJEMPLO_`). Posición: al principio o junto a las
otras columnas de identidad, no al final — se lee como clave, no como dato suelto.

**En este orden, que no es indistinto (ver 0.2):**

1. **Primero** agregar `REUNIONES` a `COLUMNAS_DELTA_`, con la entrada
   `{ nombre: 'periodo_id', indice: <la posición elegida> }`. `CAMPANAS` ya está: sólo se le
   suma la entrada.
2. **Recién después** tocar `HOJAS_CONFIG_.REUNIONES.headers`.

Al revés, la corrida intermedia toma la rama sin delta y **reescribe la fila 1 de
`REUNIONES` sobre datos que no se movieron** — que es el modo de falla que 0.2 midió.
`CAMPANAS` no tiene ese riesgo porque ya está en el delta.

**B.2** — Las filas existentes (3 y 7, todas de ejemplo). **Proponer qué valor llevan y
parar**: asignarles el período vigente, dejarlas vacías con una regla explícita de qué hace
el motor con una fila sin `periodo_id`, o marcarlas como ejemplo y excluirlas. **No decidirlo
solo** — es el precedente de cómo se interpreta una fila sin período, y eso gobierna todas
las que vengan.

**B.3** — `cargarTemario(texto)` tiene que escribir `periodo_id` en las filas que agrega.
Si el período no viene por parámetro, la función **falla explícito**, no asume el vigente:
asumirlo en silencio es exactamente el modo de falla que `periodo_id` viene a cerrar.
Consistente con `D-10` — cuando falta una definición, el motor no la inventa.

**B.4** — `ESCRITORES.md`: actualizar el contrato de `cargarTemario` sobre `REUNIONES`.

**B.5** — **No** implementar el filtrado por período en el motor. Este paso agrega la
columna y garantiza que se escriba; consumirla es del Paso 3 y del Paso 5.

**Verificación:** `Aplicar configuración` ×2. Las dos hojas siguen fuera de la auditoría de
contenido, así que el diff **no debería moverse**: `protegidas (con diferencia): 0` y
`sin cambios: sí` en la segunda. Si el diff se mueve, la columna se agregó en un lugar que
sí se audita y hay que entender por qué.

→ **Commit B:** `Paso 2.15 ✅ — periodo_id en CAMPANAS y REUNIONES (D-08)`

---

## Qué NO hacer

- No implementar el filtrado por período (Pasos 3 y 5).
- No sembrar `CAMPANAS` ni `REUNIONES` automáticamente: son curadas a mano a propósito.
- No tocar `MARCADORES` — su dueño quedó decidido en `D-17` y es del Tramo 2.
- No registrar M2: va en su propio paso, por `D-01`.
- No mover archivos de Drive. La Parte A cambia una fila de config, nada más.
- Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
