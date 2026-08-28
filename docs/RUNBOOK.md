# RUNBOOK — De "logueado a clasp" a "motor leyendo datos reales"

> Arquitectura 1: script **bound**, planilla de control propiedad de `jpcofanogcba1`
> (robot), compartida con el usuario. Bases/plantillas en el/los otros Drive,
> compartidas con el robot. El motor accede todo por ID.

---

## Parte A — Re-anclar el proyecto a la cuenta robot (Paso 1.5)

1. **Verificá con qué cuenta estás en clasp:**
   ```
   clasp login --status
   ```
   Tiene que decir `jpcofanogcba1@gmail.com`. Si no:
   ```
   clasp logout
   clasp login          → entrá con jpcofanogcba1 en el navegador
   ```

2. **Evitá choque con el `.clasp.json` viejo** (si quedó uno de la cuenta anterior):
   renombralo a `.clasp.json.old` (no lo borres todavía).

3. **Creá el proyecto nuevo bajo el robot** (desde la raíz del repo):
   ```
   clasp create --type sheets --title "Motor de Informes"
   ```
   Esto crea una planilla nueva + su script, **propiedad de jpcofanogcba1**.
   Anotá la URL de la planilla que imprime.

4. **Subí el código** (ya está en git, no se pierde):
   ```
   clasp push -f
   ```
   Verificá que `.claspignore` esté bien: solo deben subir `appsscript.json`,
   los `.gs` y `Panel.html` (nada de `docs/`, `samples/`, `Plan Inicial/`).

5. **Commit** del nuevo `.clasp.json`:
   ```
   git add .clasp.json && git commit -m "Paso 1.5 — re-anclado a jpcofanogcba1 (standalone bound)"
   ```
   Cuando todo corra, borrás el `.clasp.json.old`.

---

## Parte B — Aplicar el esquema de períodos (Paso 0.5)

6. En Claude Code, pasá el prompt **`docs/Prompts/Paso-0.5.md`** (agrega la hoja
   `PERIODOS` y las columnas `periodo_ref` / `desde` / `hasta`). Luego `clasp push`.

---

## Parte C — Crear las hojas y cargar la config

7. **Abrí la planilla nueva** (URL del paso 3) → recargá → menú **▶ Motor de Informes**
   → **"Instalar / reparar hojas"**. Autorizá el script (OAuth, primera vez).
   Deberían aparecer las 6 hojas + `PERIODOS`.

8. **Cargá `BASES`** — pegá estas filas (ya con los IDs reales):

   | base_id | nombre | sheet_id | hoja_default | tipo | activo | notas |
   |---|---|---|---|---|---|---|
   | rdv | RDV JM CM ES + funcionarios | `1ZpHO6Ru1uY2r9WfBF_yFtu5z7ip7F3Q6VOoRJN5vLAo` | RVD JM-CM - ES | google_sheets | sí | Encuentros |
   | digital | Seguimiento Digital | `1LadILzFpyCrZRapxgDOFOldSoRawjKkWMaFci_ilhPY` | Digital | google_sheets | sí | Campaña por canal |
   | looker | Base Looker | `1t6Ji4Cd5lTeBEBBVIoIJUOWjvsOzWBDZmKN163rHKaQ` | resumen_metricas | google_sheets | sí | Consolidado |
   | m2 | M2 Reporte para Fede 2026 | `1_GS01-TXrhez0GlpFf4bUjWLNQPfaW9BOFFXz0hZNvY` | *(verificar)* | google_sheets | sí | Familia m2_* |
   | miba | Integración MiBA | | | google_sheets | no | Parqueada |

   ⚠ Los `hoja_default` son los nombres que vi en los `.xlsx`; verificalos con
   "Probar conexión" (paso 11) porque muestra los nombres reales de las pestañas.
   El de M2 hay que completarlo (no lo tengo).

9. **Cargá `CONFIG`** (valores de la edición actual):
   - `periodo_desde` / `periodo_hasta` → la semana/mes que estés reportando.
   - `informe_activo` → `jm` (o vacío).
   - `carpeta_salida` → ID de una carpeta de Drive donde se guardan los Slides
     generados (creala y compartila con el robot como editor — ver Parte E).

---

## Parte D — Registrar las plantillas (Paso 1.6)

10. **Hecho el 03/08/2026, y no como decía este paso.** Los dos `INFORMES.plantilla_id`
    están cargados: `jm` → `117I0qn1…` (`JM_marcada`, 22 slides), `secco` → `1_ZKjWhL…`
    (`SECCO_marcada`, 29 slides). Los declara **`SEED_INFORMES_`** (`Instalar.gs`) y llegan
    a la hoja por "Aplicar configuración", como los `sheet_id` de `BASES`. Verificado por
    API: `inventarioPlantillas()` abre las dos.

    ⚠ **No corras el registro automático para cargarlas.** Era la opción "recomendada" de
    este paso y **no sirve para esta carpeta**, por dos motivos medidos el 03/08 (`P0` en
    `docs/PENDIENTES_consistencia.md`): la plantilla de JM **no aparece** al listar la
    carpeta —aunque se abre bien por ID— y el recorrido **entra en `_backups`**, donde vive
    `[OBSOLETA — no usar] JM_marcada`. Con las celdas vacías habría cargado la obsoleta.
    Hoy, con las celdas cargadas, `registrarPlantillasDesdeCarpeta()` es inofensivo y sirve
    de **diagnóstico**: devuelve 7 conflictos, todos contra backups.

    Para cambiar una plantilla: editar el ID en `SEED_INFORMES_` y "Aplicar configuración",
    o editar la celda a mano **y actualizar el seed en el mismo commit** — si el seed dice
    otra cosa, la próxima corrida pisa la celda.

---

## Parte E — Permisos (compartir con el robot)

Todo lo que el motor abre por ID tiene que estar accesible para `jpcofanogcba1`:

11. Compartí con `jpcofanogcba1@gmail.com`:
    - Las **4 bases** → como **Lector** (el motor solo lee datos). ✅ **Hecho y verificado
      por API el 03/08/2026** en las cuatro. Con una salvedad que no es de rol: `rdv` está
      compartida como `anyoneWithLink = writer`, y eso pisa el `reader` explícito — el motor
      (y cualquiera con el link) la puede editar. `P0` abierto en
      `docs/PENDIENTES_consistencia.md`.
    - La **carpeta de plantillas** → como **Editor** (el motor las copia).
    - La **carpeta de salida** → como **Editor**.

    Los IDs de las dos están en la tabla "Las carpetas de Drive", al final.
    - La **planilla de control** → compartila con la cuenta del **usuario**
      (`reporteseinformesgcba`) como **Editor** (para que configure).

---

## Parte F — Verificar conexión en vivo

12. Menú → **"Probar conexión a bases"**. Esperá:
    - ✅ RDV, Digital, Looker, M2 con sus hojas y nº de filas.
    - ⚠️ solo si falta algo (ej. `hoja_default` de M2 sin completar).
    - MiBA **no** aparece (está `activo=no`).
    Si un `hoja_default` no matchea, corregilo en `BASES` con el nombre real que
    te mostró la prueba.

---

## Parte G — API de pruebas sobre `/dev` (Paso 1.8)

Sirve para una sola cosa: que Claude Code pueda invocar una función del motor contra el
código que acaba de pushear y leer el resultado como JSON, sin abrir la planilla y sin
pedirle a nadie que apriete un botón del menú.

### Por qué `/dev` y no un deploy versionado

`/dev` sirve **HEAD**: lo que dejó el último `clasp push`, sin republicar nada. Por eso
en este paso no se usa `clasp deploy`, y por eso el pendiente P0 de
`docs/PENDIENTES_consistencia.md` (una API que sirve código viejo) no aplica acá: sobre
`/dev` no hay versión desplegada que pueda quedar atrás. Cuando el Paso 6 publique
`/exec`, ese pendiente vuelve a estar vivo.

Google exige sesión con **permiso de edición sobre el script** antes de correr una línea
de nuestro código en `/dev`. Esa exigencia es la que hace tolerable que exista una acción
`llamar` con nombre de función dinámico: el endpoint no es alcanzable anónimamente.

### Las dos barreras, y dónde vive cada credencial

Se evalúan siempre, en orden, antes de cualquier acción (`Api.gs`):

1. **Identidad** — `Session.getActiveUser().getEmail()` tiene que estar en la clave
   `mails_autorizados` de **`CONFIG`** (`_46`, 13/08/2026; antes era la constante
   `API_AUTORIZADOS_` en `Api.gs`). Es la cuenta con la que está logueado clasp, no la del
   usuario en otro producto; se verifica con `node tools/token.js --info`.
2. **Token de aplicación** — el `token` del pedido contra la propiedad de script
   `API_TOKEN`. Si la propiedad no está seteada, **rechaza**: nunca pasa por ausencia.

#### Agregar o sacar a alguien de la lista

Se edita **la celda de `CONFIG`**, separando por comas. No hace falta `clasp push`, y
**tampoco esperar ni limpiar nada**: `leerConfig()` pasa por `memoRegistro_`, cuyo caché es
una variable de módulo que muere con cada ejecución de Apps Script y que además está
**apagada salvo adentro de `generarInforme`**. El cambio vale en el pedido siguiente.

Espacios alrededor y mayúsculas dan igual — `apiListaAutorizados_` normaliza los dos lados.

**La barrera falla cerrada, y los tres motivos se distinguen en la traza:**

| qué pasó | motivo en la traza |
|---|---|
| la hoja no se pudo leer (incluida "no hay planilla atada") | `config ilegible` |
| la clave no existe en `CONFIG` | `clave ausente` |
| la celda está vacía, o son puras comas | `lista vacía` |

Ninguno cae a un default del código: **una lista vacía deja a todo el mundo afuera, incluido
el dueño.** Es lo contrario de `centinelas_lectura`, y a propósito — sobre la puerta de
entrada, un default convertiría un error de lectura en un acceso concedido.

⚠ **Riesgo aceptado:** quien pueda editar la planilla de control puede agregarse a la lista.
Es tolerable —quien edita la planilla ya tiene los datos que el informe publica— pero está
escrito acá porque es una decisión, no una obviedad. Es la **pieza 1 de `D-16`**; el control
del acceso al *dato* (pieza 3) sigue sin resolver.

| credencial | dónde vive | quién la usa |
|---|---|---|
| Bearer de Google | `~/.clasprc.json`, derivado por `tools/token.js` | el cliente |
| `MOTOR_API_TOKEN` | `.env` en la raíz, fuera de git | el cliente |
| `API_TOKEN` | Propiedades del script (editor → ⚙ Configuración del proyecto) | el servidor |
| `HOJA_CONTROL_ID` | Propiedades del script, **opcional** | el servidor |

`HOJA_CONTROL_ID` es la red de seguridad de `apiHojaControl_()`: sobre HTTP no hay
planilla activa y todos los módulos leen con `SpreadsheetApp.getActiveSpreadsheet()`. Si
el binding del contenedor alcanza, no hace falta setearla.

**Las URLs y las cuentas no están en este archivo**: viven en `docs/ENTORNO.local.md`,
que está fuera de git. En un clon limpio ese archivo no existe y hay que reconstruirlo —
el `scriptId` sale de `.clasp.json`, y el id de la URL `/dev` sale de
`clasp list-deployments` (la línea `@HEAD`). Ojo: **la URL `/dev` no se arma con el
`scriptId`**, aunque el prompt del paso decía que sí; con el `scriptId` da 404 en HTML.

### Ciclo de trabajo

```
clasp push  →  node tools/api.js <accion> [clave=valor ...]  →  leer el JSON
```

`tools/api.js` existe para que ninguna de las dos credenciales quede escrita en la línea
de comandos: las lee del `.env` y del `.clasprc.json` adentro del proceso. Con `--get`
manda todo por query string (ejercita `doGet`); sin `--get`, por body JSON (`doPost`).

### Acciones

| acción | qué hace |
|---|---|
| `ping` | `{ pong, mail, fecha }` — verifica las dos barreras de una |
| `version` | versión del contrato de la API + hoja de control en uso |
| `registros` | dump de una hoja de registro; parámetro `hoja` |
| `bases` | resultado de `diagnosticoBases_()` |
| `llamar` | invoca una función del motor por nombre: `fn` y `args` (array) |

Mantener esta tabla a medida que crezcan los pasos. Acción desconocida devuelve la lista.

### Lo que hay que saber antes de que sorprenda

- **Todo sale HTTP 200.** Apps Script no deja setear el status: el estado va en `ok` del
  JSON. Si la respuesta es HTML en vez de JSON, el problema es de autenticación de
  Google, no del motor.
- **`/dev` devuelve 404 intermitente, y no es tu código.** Medido el 02/08: **cuatro
  pedidos idénticos seguidos dieron 200, 404, 404, 200**. La URL es la correcta y `@HEAD`
  no cambió — es inestabilidad del lado de Google. **Antes de diagnosticar, reintentar dos o
  tres veces con unos segundos en el medio.** Es fácil perder media hora buscando un error
  de sintaxis que no existe: si sospechás del código, `node -e` con `new vm.Script(...)`
  sobre los 21 `.gs` responde eso en un segundo y sin salir de la máquina.
- **El Bearer dura una hora, y cuando vence la respuesta es HTML — que se lee como motor
  roto.** Google devuelve la página de login de `accounts.google.com` con HTTP 200, así que
  una sesión larga empieza a "fallar" de golpe en llamadas que venían andando. **Antes de
  diagnosticar nada, renovar:** `node tools/token.js --forzar`. Pasó el 02/08: un control
  positivo figuró como error y era sólo el token — con el token nuevo dio OK a la primera.
  `tools/api.js` ya distingue el caso y avisa *"La respuesta NO es JSON"*, pero es fácil
  leerlo como que rompió el código.
- **Una respuesta grande no vuelve, y se disfraza de las otras dos fallas.** Medido el
  03/08/2026: con el token recién renovado y `ping` respondiendo en 33 ms,
  `probarLecturaPeriodo()` y `diagnosticoBases_()` fallaron **cuatro veces seguidas**,
  alternando 404 y página de login con HTTP 200 — los dos síntomas que las viñetas de arriba
  atribuyen a la inestabilidad de `/dev` y al Bearer vencido. **No era ninguna de las dos:
  las dos funciones leen las cuatro bases y devuelven `filas` completo**, miles de objetos.
  Las llamadas que sí vuelven en esa misma sesión tardan entre 0,5 y 6 segundos y devuelven
  poco. **Antes de sospechar del token o de Google, mirar el tamaño de lo que se pidió.**
  La salida es pedir menos: `contarLecturaBase_(baseId)` (`Fuentes.gs`) da los mismos
  conteos de **una** base y **sin las filas**, y responde en cinco o seis segundos. Es lo
  que destrabó medir `D-21` sobre `rdv`.
- **La `traza` viene siempre**, en éxito y en error. Es el único log que ve quien llama.
- **Una función `void` devuelve `null`.** Para probar una por la API hay que hacer que
  retorne algo. Es lo que se le hizo a `probarConexionBases()` en este paso: el cálculo
  se movió a `diagnosticoBases_()`, que devuelve las líneas, y la de menú alerta sólo si
  `hayUi_()`. Una función que sólo sabe hablar por `alert()` no se puede probar desde
  afuera, y `SpreadsheetApp.getUi()` sobre HTTP tira excepción.
- **Un objeto de Apps Script** (`Spreadsheet`, `Range`, `Presentation`) no se serializa:
  sale como `[objeto no serializable]` más su tipo. La profundidad tope es 5.
- **`llamar` es para leer y calcular, no para escribir.** Que hoy no esté prohibido por
  código es el pendiente P0 punto 2 (lista blanca de sólo lectura).
- **Re-autorizar a mano** hace falta sólo cuando se agrega un `oauthScope` nuevo en
  `appsscript.json`.

---

## Parte H — Snapshot de las hojas de registro (Paso 2.11 C.2-7)

```
node tools/snapshot.js
```

Deja `docs/_snapshots/<HOJA>_<AAAA-MM-DD>.tsv`, una por cada una de las **diez** hojas de
registro (`BASES`, `MAPEO`, `CONFIG`, `INFORMES`, `PERIODOS`, `SOLAPAS`, `SECCIONES`,
`CAMPANAS`, `REUNIONES`, `MARCADORES`). Texto plano y diffeable — `.gitignore` bloquea
`*.xlsx` justamente para que nadie versione la alternativa binaria.

**Cuándo se corre:** antes de "Aplicar configuración", que reescribe todo de una vez. El
punto es tener contra qué comparar si el diff está mal.

**Por qué no usa `tools/api.js`.** Ese contra-qué no puede salir del mismo código que se
está probando. `snapshot.js` no toca ni un `.gs`: le pide el volcado a Google directo, por
el endpoint de exportación de Sheets, con el mismo Bearer de `tools/token.js`. No pasa por
`calcularDiffUpsert_`, ni por los `SEED_*`, ni por los lectores de `Config.gs`. La lista de
las diez hojas está escrita en `snapshot.js` a propósito, duplicando la de
`ALCANCE_REGISTROS_` (`Instalar.gs`): leerla del código bajo prueba anularía la
independencia.

- El id de la planilla sale de `.clasp.json` (`parentId`); los `gid` de cada solapa, de la
  página `htmlview` del libro. No hay ningún id escrito en el script.
- `--destino=<ruta>` vuelca a otra carpeta (revisión previa), `--fecha=AAAA-MM-DD` fija la
  fecha del nombre.
- **Diez exportaciones seguidas dan HTTP 429**: esa cuota es más estricta que la de la API.
  El script espera entre pedidos y reintenta con backoff. Un volcado a medias es peor que
  ninguno, porque parece completo.
- **Antes de commitear un snapshot, mirarlo.** El repo es público y hay un P0 abierto por
  datos personales en el historial. Al 01/08/2026 ninguna de las diez hojas tiene nombres
  de personas: `REUNIONES` tiene barrios y temas, `CAMPANAS` tiene nombres de campaña, y
  los ids de Drive de `BASES`/`CONFIG` ya están en `Instalar.gs` desde antes. Eso vale
  para esa corrida, no para siempre.

---

## Parte I — Experimento de identidad (cinco minutos, lo corre el usuario)

⭐ **Es el paso que decide la capa de acceso.** Contesta una sola pregunta:
`Session.getActiveUser().getEmail()` bajo `executeAs: USER_DEPLOYING`, ¿devuelve el mail de una
cuenta Gmail externa, o vuelve vacío? De la respuesta dependen las tres opciones de
`docs/SEGURIDAD.md` §4, y **ninguna se puede elegir antes**.

⛔ **Code no puede correrlo.** Necesita un navegador logueado con una cuenta que no es la del
dueño — ver `docs/SEGURIDAD.md` §3 para por qué la respuesta no se puede razonar hasta la certeza.

**Antes de empezar — el control positivo.** ⚠ **Agregar el mail de la cuenta de prueba a
`CONFIG.mails_autorizados`**, separado por coma. Sin eso el experimento mide **la lista** y no **la
identidad**: la cuenta sería rechazada por `fuera de lista` aunque Google haya dado el mail
perfectamente, y las dos ramas se verían iguales. La cuenta de prueba externa y la URL de `/exec`
están en `docs/ENTORNO.local.md` (fuera de git) — este documento no las repite.

1. Abrir la URL de `/exec` **con la cuenta de prueba externa**, no con una del equipo. En una
   ventana de incógnito, o en un perfil de navegador separado: si la sesión de Chrome tiene al
   dueño logueado, el experimento mide al dueño.
2. **Anotar textual qué aparece.** Las dos salidas posibles son el panel, o la pantalla de rechazo
   con su código de motivo. El motivo importa y hay que copiarlo tal cual: `sin identidad` y
   `fuera de lista` mandan a trabajos opuestos.
3. Con la cuenta del dueño, abrir el proyecto en el editor de Apps Script → **Ejecuciones**, y
   copiar la línea del log:

   ```
   panel — acceso denegado · motivo=… · activo=«…» · efectivo=«…»
   ```

⭐ **`activo` es el dato entero**, y por eso `servirPanel_` lo loguea junto al `efectivo`:

| lo que devuelve | qué significa | qué se desbloquea |
|---|---|---|
| `activo` **vacío**, `efectivo` = el dueño | el mail **nunca llegó a la barrera** y la lista de `CONFIG` es inocente. La Barrera 1 **no puede funcionar** con cuentas de fuera del dominio | la opción 1 o la 2 de `SEGURIDAD.md` §4 dejan de ser alternativas: **son el trabajo** |
| `activo` **poblado** e igual al mail de prueba | `D-15` estaba bien fundada en su premisa: la lista blanca **sí** filtra bajo `USER_DEPLOYING` | queda **sólo** el tercer problema: que el tercero pueda **abrir la salida** (`SEGURIDAD.md` §2.5) |
| `activo` y `efectivo` **iguales y poblados** | el problema es otro y hay que volver a mirar | — |

**Al terminar: sacar el mail de prueba de `mails_autorizados`** si no se lo quiere dejar
autorizado. El resultado se anota en `docs/SEGURIDAD.md` §5 con la fecha de la corrida.

---

## Los dos subagentes

Viven en `.claude/agents/` y **se invocan por nombre**, nunca solos: sus `description` están
escritas para que Claude **no** los delegue por su cuenta. El control queda en el prompt, que es
donde vive la disciplina del proyecto.

| | qué hace | cuándo |
|---|---|---|
| **`verificador`** | Toma un prompt **sin ejecutar** y dice, premisa por premisa, si se sostiene, con qué se desmiente o si no se pudo verificar. **Sólo lectura.** | Antes de la Parte 0, cuando el prompt lo pida |
| **`cableador`** | Escribe filas de `MARCADORES` para tokens sin valor, **de a uno**, por un camino declarado en `ESCRITORES.md` | Cuando un prompt lo pida, nunca solo |

### Cómo entra el `verificador` al flujo

Es **el único paso nuevo**, y no cambia nada más: recibís un prompt sin ejecutar, se lo pasás a
Code, y **antes de la Parte 0 le pedís que corra el `verificador` sobre el archivo**. El reporte
vuelve a vos.

> **⚠ Ese reporte NO habilita la ejecución.** El subagente corre **dentro** de la sesión que va a
> implementar y **hereda sus premisas**: baja el costo de atajar una premisa falsa, pero no
> reemplaza la verificación desde afuera. **La luz verde la seguís dando vos.**

### Tres hechos operativos que conviene saber antes de tocarlos

- **Los agentes se cargan al arranque.** Un archivo nuevo **no existe** hasta reiniciar la
  sesión. Si lo acabás de crear y no aparece, no está roto: hay que reiniciar.
- **`/agents` ya no crea nada** desde la `v2.1.198` — acá está la `2.1.220`. **Los archivos se
  editan a mano.**
- **⚠ Un subagente NO ve el `CLAUDE.md` del proyecto.** Está medido: se lanzó uno sin
  herramientas y contestó que no tenía instrucciones de proyecto en contexto. Por eso cada
  archivo **le dice qué abrir, con la ruta**, y esa lectura es su primer paso. Un subagente que
  se la saltea **no está operando con las reglas del proyecto aunque lo parezca**.

### El costo, dicho con precisión

**Los subagentes no reparten consumo entre cuentas.** Corren dentro de la sesión de Code y
**gastan su cuota**. Cada uno mantiene su propio contexto, así que un flujo con varios consume
**bastante más** que una sesión sola. No son gratis y no son una forma de esquivar el límite.

---

## Cargar una fila de `CAMPANAS`

**Hay dos formas, y la segunda es la que vas a usar casi siempre.**

### Forma 1 — pegar el temario (menú → *Cargar temario de campañas*)

Pegás **el temario completo**; el cargador lee **sólo el bloque `Campañas destacadas`** y no toca
los demás. Pide el período y el informe antes del texto.

**Qué hace con cada línea:** resuelve el `ID Cuentas` mirando primero la solapa
`CAMPANAS_equivalencias` —lo que **vos** confirmaste— y, si no está, por similitud de nombre.

| resultado | qué te deja |
|---|---|
| **resuelto por equivalencia** | la fila completa, con `desde`/`hasta` de la base |
| **resuelto por similitud** | la fila completa, **marcada `SIN CONFIRMAR`** en `notas` con el % y el nombre de la base |
| **sin resolver** | la fila igual, **con el id vacío y los candidatos anotados** para que elijas |

**Medido contra el temario real del 24–30/07: dos de cuatro resuelven y dos preguntan.** Eso es
el resultado esperado, no una falla — *"Operativo de saturación en 1-11-14"* tiene **tres
campañas empatadas** en la base y el cargador **no elige por vos**.

**Ante la duda, la campaña entra con `mostrar = sí`** y el paréntesis del temario va a `notas`.
El motivo: una campaña que no salió **no tiene filas en la base**, así que sus tokens salen como
huecos visibles. **Excluirla de más sería una lámina que nadie sabe que falta.**

**Recargar un temario corregido es seguro:** una fila que ya existe para ese período **se saltea
y se reporta**. No duplica ni pisa.

**Cuando completes un id a mano, cargá también la fila en `CAMPANAS_equivalencias`** —variante
del temario, id, nombre en la base— y la próxima semana esa campaña se resuelve sola. **Esa
solapa la escribís vos: el cargador la lee y nunca la inventa.** Un match por similitud es una
hipótesis; una fila ahí es una afirmación que se va a repetir sin que nadie la vuelva a mirar.

### Forma 2 — a mano

Es lo que se usa **para arreglar lo que el cargador no pudo**: completar un `campana_id` vacío,
elegir entre candidatos, o cargar una campaña que no está en ningún temario.

> **⚠ Leé esto antes de cargar nada.** Podés cargar las filas hoy y **van a entrar bien**: la
> selección por temario ya funciona (`R-17`, y `itemsDeSeccion_` filtra por `informe_id`,
> `mostrar` y `periodo_id`). **Lo que todavía no existe es el enganche con las métricas.** Los
> `camp_*` no van a resolver hasta que se cablee de dónde sale cada número, y eso es otro
> prompt. Cargar igual sirve: sin filas, la sección `campana` emite **cero ítems** y no se
> puede ni ver la lámina.

**Las diez columnas, en el orden de la hoja** (verificado el 08/08/2026 — el seed es el
correcto; un snapshot viejo tiene nueve y le falta `periodo_id`):

| columna | qué va | ⚠ |
|---|---|---|
| `periodo_id` | **el informe en el que la campaña aparece** — no el período de sus fechas | **Vacío = la fila no entra a ningún informe** (`D-19`). Es el error más caro y no avisa |
| `campana_id` | id corto y estable, tuyo (`orden_seguridad_2026`) | |
| `nombre` | el nombre como se lee en el deck | |
| `informe_id` | `jm` o `secco` | Si no coincide, la fila se ignora en silencio |
| `base_id` | de dónde salen sus métricas (`digital`, `looker`, `rdv`) | |
| `tipo` | `destacada`, `encuentro_ministros` o `proveedor` | **Usá el vocabulario de la hoja, no el del seed** — divergen, y hoy nadie lee la columna (ver `PENDIENTES`) |
| `desde` / `hasta` | las fechas **propias de la campaña** | Pueden caer **fuera** de la ventana del informe: es lo normal y está bien (`R-17`) |
| `mostrar` | **`sí`**, con tilde | Cualquier otra cosa excluye la fila |
| `orden` | el orden del temario, 1, 2, 3… | Es lo que decide en qué orden salen las láminas |

**Un ejemplo real, de una campaña que estuvo activa en la semana 24–30/07/2026** (medido: hay
**67** en esa ventana):

| | |
|---|---|
| `periodo_id` | `jm_20260724` |
| `campana_id` | `orden_seguridad_2026` |
| `nombre` | `Orden y Seguridad 2026` |
| `informe_id` | `jm` |
| `base_id` | `digital` |
| `tipo` | `destacada` |
| `desde` | `2026-05-18` |
| `hasta` | `2026-08-31` |
| `mostrar` | `sí` |
| `orden` | `1` |

**Fijate que `desde` es de mayo y el informe es de julio, y está bien.** El temario selecciona;
la ventana no filtra la selección (`R-17`).

**Los tres errores que dejan la fila muda**, en orden de frecuencia:

1. **`periodo_id` vacío** — la fila existe, se ve en la hoja, y **no entra a ningún informe**.
   No hay mensaje: la sección simplemente emite un ítem menos.
2. **`mostrar` distinto de `sí`** — mismo efecto, y `si` sin tilde **no cuenta**.
3. **`informe_id` que no coincide** con el informe que estás corriendo.

**Qué NO va acá, y dónde está:** el régimen de selección —por qué el temario manda y la semana
no filtra— es **`R-17`** (`docs/REGLAS_NEGOCIO.md`); qué campañas elige el equipo para `jm` es
**`docs/CONFIG_INFORMES.md` §1.1**. Este instructivo sólo dice **cómo se llena la celda**.

**Un apunte sobre `PERIODOS`:** hoy tiene dos filas —`m2_mensual` y `quincena_rrss`, las dos de
junio— y **ninguna cubre la semana del informe**. No hace falta que la cubra: la ventana sale de
`CONFIG.periodo_desde`/`periodo_hasta`, y `periodo_id` sólo tiene que **no estar vacío**.

---

## Marcar y clasificar una lámina

> **⚠ Este aviso decía que nada de esto existía, y venció.** Al 21/08/2026 **`sellarPlantilla`,
> `verificarLaminas()` y la hoja `LAMINAS` existen y están pobladas** — 53 filas, las 53 con
> `seccion_id` y `rol` declarados. Lo que sigue abajo describe el flujo decidido el 07/08; **el
> ciclo que hay que seguir HOY está en el bloque de acá arriba.**

### ⛔ El ciclo de una lámina nueva — 21/08/2026

**Desde que el generador lee `LAMINAS`, una lámina nueva en una plantilla NO se emite hasta que
esté declarada.** ⚠ **Y no falla: se reporta y sale en hueco**, que es peor de detectar. La
inferencia por familia de tokens —que la emitía sola— **se retiró** (`D-37`).

**Los cinco pasos, en orden:**

1. **Se toca la plantilla.** La toca el equipo o el usuario, **nunca el motor sin autorización**
   (`C-01`).
2. **`sellarPlantilla(informe_id)`** — la lámina nueva toma su `L-NNN` y su fila en `LAMINAS`.
3. **`verificarLaminas()`** — cierra el cruce ancla ↔ hoja. ⭐ **Correrlo cada vez que se toca una
   plantilla.** Ya estaba escrito y nadie lo corría: el 21/08 encontró una lámina de `jm` **sin
   ancla y sin fila** — la del "1 a 1" — que llevaba días ahí sin que nada la nombrara.
4. **Declarar `seccion_id`** — y `rol`, y `filtro` si la lámina es condicional. **Sin `seccion_id`
   no pertenece a ningún bloque.**
5. Recién ahí emite.

⚠ **Y el aviso del otro lado, que es el que faltó con `REUNIONES.mostrar`:** el reporte de la
corrida **nombra las láminas sin `seccion_id` con su `lamina_id`**. *"Nadie la clasificó"* y *"no
tiene tokens"* mandan a trabajos opuestos y sin ese aviso se leen igual — exactamente como
*"sin ítems"* se leía igual que *"faltó tildar `mostrar`"*.

---


1. **Agregás la lámina** a la plantilla en Slides, con números de ejemplo o vacía. **Es el
   único paso que no pasa por el motor**, y es provisorio: pedirla en lenguaje natural es la
   capa de panel de `docs/OBJETIVO_lamina_nueva.md`, que espera su turno. Diseñar la lámina
   es diseñar; clasificarla, marcarla y esconderla es administrar, y eso pasa por el motor.
2. **Corrés *Sellar plantilla*.** Por cada lámina sin ancla el motor hace las tres cosas
   juntas: **toma el siguiente id de la hoja `LAMINAS`, escribe la fila y anexa
   `#lamina: L-NNN` a las notas.** A las que ya tienen ancla **no las toca**. **Un solo
   sellado, y nunca se traba**: asignar un id no requiere saber a qué sección pertenece la
   lámina.
3. **Declarás la sección** de cada lámina **en la hoja `LAMINAS`**, en la columna
   `seccion_id`. La clasificación **no se declara en `SECCIONES`**: `D-23` la sacó de ahí, y
   `familia_tokens` queda congelado hasta la Fase 4. **Una lámina sin fila se reporta, no se
   adivina** — igual que una solapa no declarada en `SOLAPAS`.
4. **Se cablea:** cada número de ejemplo pasa a `{{token}}` y cada token nuevo lleva su fila
   en `MARCADORES`. **El detalle de este paso está pendiente** y no se inventa acá.
5. **La sección entra en `estado = revisar`** hasta que alguien la vio llena en una corrida.

**Qué escribe el motor, y dónde.** El ancla vive en **las notas del orador** de cada lámina y
tiene **un solo campo**: `#lamina: L-NNN` — id global y opaco, se asigna una vez y **no se
reasigna nunca**. El contador vive en la hoja `LAMINAS`, y es **uno solo para las dos
plantillas**. **El motor anexa una línea; nunca reemplaza lo que haya** — si alguien del equipo
escribió notas ahí, siguen estando. La autorización que lo permite es la suspensión acotada de
`C-01` con sus dos addenda (`docs/REGLAS_NEGOCIO.md`), y **no cubre esconder láminas,
insertarlas, borrarlas ni mover cajas**.

**Retirar una lámina del uso es esconderla, no borrarla.** Su ancla y su fila quedan como
histórico, y por eso ningún id se recicla.

**El deck generado conserva el ancla, y lo limpiás cuando querés.** El motor **no la retira**
al generar: con tres numeraciones conviviendo —la de la plantilla, la del deck emitido y la de
las copias de una sección repetible—, el ancla es la única forma estable de decir de qué
modelo salió una lámina del deck publicado, y eso sirve justo cuando un número sale mal.
**Cuando el deck deja de trabajarse, corrés la función que lo limpia.**

- **No hay automatismo y no hay "informe cerrado":** el motor no decide cuándo terminaste.
- **Actúa sólo sobre el informe generado.** Contra una plantilla **se niega**.
- **La plantilla no se limpia nunca.** El ancla es su historia.

> **Consecuencia a tener presente:** mientras el ancla esté, las notas del orador del deck
> generado llevan texto de máquina, y **se ve en modo presentador y al imprimir con notas**.
> No desaparece sola: **queda en tus manos cuándo limpiarla.** Es una decisión tomada
> (usuario, 07/08/2026), no un descuido.

---

## Y después…

13. Con las bases verdes y `INFORMES` cargado, seguís con el motor headless:
    **Paso 2** (lectura por ventana) → **3** (cálculo) → **4** (reemplazo) →
    **5** (campañas + end-to-end). Los prompts ya están en `docs/Prompts/`.

---

## Las carpetas de Drive (referencia)

Tres carpetas, tres roles distintos. Los IDs viven en `CONFIG` (lo que el motor usa) y en
`SEED_CONFIG_DEFAULTS_` de `Instalar.gs` (lo que debería decir); esta tabla dice **qué es
cada una y quién la lee**. Verificada contra Drive el 02/08/2026 (Paso 2.15 Parte A).

| rol | ID | nombre real en Drive | cuenta dueña | quién la lee en el código |
|---|---|---|---|---|
| **Plantillas** — los Slides que el motor copia | `1Q5At-COhFbidKCfYrwXhN6kZAbuxgYpi` | Sistema Informes en Slides | `reporteseinformesgcba` | `CONFIG.carpeta_plantillas` → `registrarPlantillasDesdeCarpeta()`, `menuDiagnosticarCarpetaPlantillas_()`, `diagnosticoDrive()` y `asegurarCarpetaBackups_()` (`Armonizar.gs`) |
| **Salidas** — los informes generados | `1LAEVlWZXoGjon2cnaMjGksV0THz3Ejlz` | Salidas Reportes | `reporteseinformesgcba` | `CONFIG.carpeta_salida` — **ningún lector todavía**: la consume el Paso 4, que aún no existe |
| **Motor** — donde vive la planilla de control, más la subcarpeta `_Back up archivo` con respaldos manuales | `1EyTlfg16vpyrftpUXgacShFk8iSbX_fJ` | Sistema Informes en Slides | `jpcofanogcba1` | `CONFIG.carpeta_motor` — **ningún lector**. La clave existe para que el ID no se pierda y para que quede dicho que no es la de salidas |

⚠ **Las dos "Sistema Informes en Slides" son carpetas distintas**, en Drives distintos.
Nombrarlas por nombre es ambiguo: siempre por rol o por ID.

⚠ **La carpeta de salidas es hija de la de plantillas** (medido el 03/08/2026): dentro de
`1Q5At-…` hay dos subcarpetas, `Salidas Reportes` (`1LAEVlWZ…`, la de la fila 2 de esta
tabla) y `_backups` (`1MMU_C5_…`, siete presentaciones de respaldo, entre ellas la JM
obsoleta). La tabla las lista como tres roles y eso sigue siendo cierto, pero **no son tres
carpetas hermanas**. Importa porque `registrarPlantillasDesdeCarpeta()` recorre
subcarpetas hasta profundidad 2: cuando el Paso 4 empiece a dejar decks en salidas, el
registro de plantillas los va a ver como candidatos. Ver el `P0` correspondiente en
`docs/PENDIENTES_consistencia.md`.

⚠ **Nada del motor escribe dentro de la carpeta Motor, ni la recorre recursivamente.**
Ahí viven la planilla de control y los respaldos manuales de `_Back up archivo`. El Paso 4
copia plantillas y crea decks: **el destino de todo lo generado es la carpeta de salidas**,
sin excepción. Un recorrido recursivo sobre la carpeta Motor toca respaldos, y un respaldo
pisado no se recupera.

Hasta el 02/08/2026 `carpeta_salida` apuntaba a la carpeta **Motor**, así que el primer
deck generado habría caído al lado de la planilla de control, en el Drive de
`jpcofanogcba1`. Repuntarla es `D-03` (`docs/PLAN.md`).

**Ojo con `CONFIG`:** `seedConfigConfig_()` sólo completa celdas **vacías** y nunca pisa un
valor cargado, y la auditoría de configuración compara **las claves**, no los valores. Un
ID que difiera entre la hoja y el seed **no lo detecta ninguna verificación**: para
cambiarlo hay que vaciar la celda y volver a sembrar, o editarla a mano y actualizar el
seed en el mismo commit.

---

## Mapa de archivos del proyecto (referencia)

- `docs/Prompts/` → `Paso-0-v2.md`, `Paso-0.5.md`, `Paso-1.md`, `Paso-1.6.md`,
  `Paso-2.md`, `Paso-3.md`, `Paso-4.md`, `Paso-5.md` (prompts para Code).
- `Plan Inicial/` → `PLAN_v3_reanalizado.md`, `ARQUITECTURA_registros.md`,
  `Periodos_y_campanias.md`, `PROYECTO_MotorInformes.md` (documentación de diseño).
- `docs/` → `JM_tokens_marcados.md`, `SECCO_tokens_marcados.md` (inventarios de tokens).
- `docs/Plantillas/` → los `.pptx` marcados (referencia; las que usa el motor son
  las Google Slides de tu carpeta de Drive).
