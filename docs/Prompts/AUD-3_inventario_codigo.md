# AUD-3 — Inventario del código (sólo lectura)

**Estado:** vivo · **Fecha:** 2026-08-01 · **Ubicación:** `docs/Prompts/AUD-3_inventario_codigo.md`

**Este paso no modifica una sola línea de código.** No borra funciones, no mueve archivos, no
parte `Instalar.gs`, no cablea nada. Produce un mapa. Las decisiones se toman después, con el
mapa a la vista, y cada una será su propio paso con su propia verificación.

## Por qué así

La consolidación documental (`DOC-1` a `DOC-5`) fue segura porque los documentos no se ejecutan:
un error se leía raro. Un refactor de código rompe números en silencio, que es el modo de falla
caro de este proyecto. La cobertura real hoy son cinco controles sintéticos sobre el camino del
diff — nada más cubre las otras 230 funciones. Mover código ahora, justo después de medirlo,
tiraría la medición que costó dos días.

`DOC-1` estuvo precedido por una revisión de consistencia. Esto es esa revisión, para el código.

## Punto de partida — medición externa del 01/08/2026

Hecha sobre el repo pusheado, fuera de la planilla. **Verificar, no asumir:** si algún número no
da, el hallazgo es la discrepancia.

- **235 funciones, 21 archivos `.gs`, ~8.100 líneas.**
- **Cero nombres duplicados.** En el scope global concatenado de Apps Script dos definiciones
  iguales se pisan en silencio; la regla de `CLAUDE.md` §1 viene funcionando.
- **18 funciones no alcanzables** desde ningún punto de entrada (`onOpen` vía la tabla `MENU_`,
  `doGet`/`doPost`, y los nombres invocados por string desde `API_LECTORES_`):

| archivo | funciones |
|---|---|
| `Valores.gs` (las 6, o sea el módulo entero) | `buscarDivergencia_`, `buscarUltimoValor_`, `escribirFilaValores_`, `hojaValores_`, `registrarOActualizarDivergencia_`, `registrarValorCalculado_` |
| `Marcadores.gs` (5) | `opCONTEO`, `opPCT`, `opRATIO`, `opSUMA`, `opTEXTO` |
| `Instalar.gs` (3) | `diagnosticoDrive`, `filaSeccion_`, `filasSolapa_` |
| `Parseo.gs` (2) | `parsearPersonas_`, `probarParseo_` |
| `Fuentes.gs` (1) | `diagnosticoLooker_` |
| `PanelBackend.gs` (1) | `abrirPanel` |

- **`Instalar.gs`: 2.204 líneas, 44 funciones — 27% del código en un archivo.**
- **~34 ítems de menú.**

## Entregable — dos archivos, no cinco

**No cinco documentos, uno por parte, y tampoco uno solo.** Son dos, y la línea que los
separa es el **ciclo de vida**, no el tamaño:

| archivo | qué lleva | estado |
|---|---|---|
| `docs/INVENTARIO_CODIGO.md` | Partes **A a D** completas | **congelado** — es una foto del 01/08/2026. Si dentro de un mes hace falta saber si sigue siendo cierto, se vuelve a correr el script y se escribe uno nuevo |
| `docs/ESCRITORES.md` | Parte **E** | **vivo** — es contrato, no foto. Otros pasos lo consultan y lo actualizan (`CLAUDE.md` §7 ya lo nombra como co-dueño de "¿qué *debería* decir esa configuración?", sin que exista todavía) |

Meterlos en un archivo único los haría divergir: la mitad congelada envejecería adentro de
la mitad viva, y no habría forma de saber cuál de las dos se está leyendo. Una sola fuente
de verdad para cada cosa, y son dos cosas distintas.

Los dos son `.md` nuevos, así que `CLAUDE.md` §3 aplica: **su fila en `CLAUDE.md` §7 y en
la taxonomía de `PROYECTO.md` §9, en el mismo commit.** La ruta ya está acordada acá — no
hace falta volver a preguntarla.

### Parte A — Grafo de llamadas

Las 235 funciones con: archivo, quién la llama, y desde qué ítem de menú (o acción de API) se
alcanza. Las que se alcanzan desde más de un ítem, marcadas — son las que un refactor puede
romper por un lado sin que se note por el otro.

**Producirlo con un script, no a ojo**, y dejar el script en `tools/`. Tiene que ser
reproducible: si dentro de un mes alguien quiere saber si el mapa sigue siendo cierto, lo
vuelve a correr. Un inventario que hay que creerle no sirve.

### Parte B — Las 18 huérfanas, clasificadas

Una por una, en **exactamente una** de estas tres categorías, con la evidencia que lo sostiene
(número de paso en `BITACORA.md`, o prompt que la pidió):

1. **Adelantada** — construida para un paso que todavía no llegó. Se conserva. Hipótesis a
   verificar: los cinco `op*` de `Marcadores.gs` son operadores del `Paso-3-v2`.
2. **Colgada** — construida y nunca cableada. Decisión pendiente: cablear o retirar. Hipótesis:
   `Valores.gs` entero, del Paso 2.9H — **verificar contra `PROYECTO.md` §4 y `Paso-2.9H`, que
   sostienen que `VALORES` / `VALORES_DIVERGENTES` son parte de la decisión de periodicidad.**
   Si eso es así, "colgada" es un bug de cableado, no código de más.
3. **Muerta** — resto de un caso cerrado, sin destino. Candidatas: `probarParseo_`,
   `diagnosticoLooker_`, `diagnosticoDrive`, `abrirPanel`, `parsearPersonas_`, `filaSeccion_`,
   `filasSolapa_`.

Regla: **borrar por "nunca se ejecutó" es un error de categoría.** Los `op*` nunca corrieron y
son el Paso 3. Ninguna se borra en este paso; sólo se clasifica y se recomienda.

Ojo con `Instalar.gs`: `filaSeccion_` y `filasSolapa_` tienen nombre de constructor de fila.
Chequear si el sembrador correspondiente las reemplazó y quedaron colgando, o si son la mitad
de un par donde la otra mitad sí se usa.

### Parte C — Los trabajos de `Instalar.gs`

Cuáles son y qué funciones pertenecen a cada uno. Hipótesis de partida, a confirmar o corregir:
crear estructura de hojas (`instalar()`), sembrar contenido (los `SEED_*`), migrar, y el motor
de diff/auditoría (`calcularDiffUpsert_`, `escribirDiffConfiguracion_`, `construirBloqueAlcance_`,
las dos funciones de menú).

Para cada trabajo: qué funciones, cuántas líneas, y **qué comparte con los otros tres**. Lo que
importa no es el tamaño sino las costuras: si el diff y los sembradores comparten estado o
constantes, partirlos es caro; si no, es barato. Decirlo con nombres concretos.

**No proponer la partición todavía.** Este paso dice dónde están las costuras.

### Parte D — Menú

Los ~34 ítems, con: función destino, última vez que aparece en `BITACORA.md`, y si sigue
teniendo sentido. El submenú "Archivo (casos cerrados)" ya declara su propia intención — no
se toca, se registra.

Marcar además los ítems cuya función llama a `SpreadsheetApp.getUi()` y por lo tanto **no es
invocable desde la API** (hay 37 llamadas a `getUi()` en el repo y `hayUi_()` protege una sola).
Esa lista es el insumo directo del paso siguiente.

### Parte E — Escritores por celda

Qué función escribe en cada hoja de registro y en qué columna. Es el mapa que le falta a
`ESCRITORES.md` (Parte E del 2.11), y el que contesta de verdad *"que no siga pasando que una
parte borre la otra"* — que **no** es un problema de organización del código.

Anclarlo a lo ya medido: la corrida del 01/08 emitió **diez** líneas `protegida (habría
cambiado)`, y `SOLAPAS` tiene exactamente diez filas `origen = manual`. O sea que el seed
propone pisar las diez decisiones manuales, todas, en todas las corridas. Dos casos opuestos
que conviene mirar juntos:

- Ocho son `uso`: el seed quiere `revisar` sobre solapas que un humano ya cerró como `ignorar`
  o `referencia` (`PPTS`, `Agenda`, `RDV CONJUNTO`, `Comunas`, `Seguimiento`,
  `RDV_JM_CM_ES`, `Funcionarios / Ministros`, `Respuestas JM 📩`). Acá el humano tiene razón.
- Dos son `notas` de `looker`: la manual dice `ver docs/SUPUESTOS.md S-01` (un puntero) y la del
  seed trae el dato concreto (*QUERY() viva sobre Cuentas*; *899 de 903 filas sin fecha*). Acá la
  protección está conservando la versión **peor**.

Un piso de diez líneas que aparece siempre convierte la alarma en ruido: la línea número once,
la que sí importe, va a entrar en una lista que todos aprendieron a saltear.

#### El censo es mecánico y exhaustivo, no a ojo

Mismo criterio que la Parte A, y por la misma razón: un censo que hay que creerle no sirve.
**El script queda en `tools/`.**

Para cada una de las **diez** hojas del alcance de `docs/_snapshots/` (`BASES`, `MAPEO`,
`CONFIG`, `INFORMES`, `PERIODOS`, `SOLAPAS`, `SECCIONES`, `CAMPANAS`, `REUNIONES`,
`MARCADORES`), una matriz **`hoja × función × archivo:línea`** con **toda** mutación, de
valor o de estructura:

```
setValue · setValues · setFormula · setFormulas · appendRow
insertRow* · deleteRow* · clearContent · clear
```

Estructura cuenta igual que valor: un `deleteRows` que corre desde otro camino borra lo que
el sembrador acaba de escribir, y eso no aparece en ningún diff de celdas.

#### Criterio de aceptación de la Parte E — dos, y el segundo pesa más

**(a) Reproducibilidad.** El inventario reproduce los números externos del 01/08: **235
funciones, 21 archivos `.gs`, ~8.100 líneas.** Si no dan, **la discrepancia es el
hallazgo** — parar y reportarla antes de seguir.

**(b) El censo encuentra solo, sin que se los soplen, los dos escritores de `MAPEO`:**

- `Instalar.gs` — el upsert / los `SEED_*`
- `Fechas.gs:378` — `promoverFechasElegidas()`

Si el script no levanta **los dos**, el patrón de búsqueda está mal y **el resto de la
matriz NO vale**: si se le escapa un escritor conocido, no hay ninguna razón para creerle
sobre los que nadie conoce. **Reportar cuál de los dos encontró**, no "el censo funciona".

**(b) pesa más que (a).** Contar líneas es difícil de errar: si el número está mal, se ve.
Encontrar escritores es fácil de errar **en silencio**, y un `ESCRITORES.md` incompleto es
peor que ninguno, porque después se lee como autoridad y nadie vuelve a chequear.

Estos dos escritores de `MAPEO` son el caso testigo justamente porque ya están verificados
por fuera de este paso: es el P1 que abrió `C.2-7` — dos escritores para la misma hoja, uno
solo declarado. Sirven de control positivo del censo, no de resultado.

## Qué NO hacer

- No modificar código. Ni borrar, ni mover, ni renombrar, ni cablear.
- No tocar `Instalar.gs`.
- No arreglar los tres hallazgos que abre C.2-7.
- No crear archivos `.md` sin ruta acordada.
- Sin trailer `Co-Authored-By`.

## Verificación

El criterio general es **reproducibilidad**. La Parte E **sí tiene control positivo** —los
dos escritores de `MAPEO`, ver su criterio (b)—, así que la frase "este paso no tiene
control positivo posible" vale para las Partes A a D, no para el censo.

1. El script de la Parte A corre y da los mismos números que el bloque "Punto de partida", o la
   diferencia está explicada.
2. Las 18 huérfanas suman 18 entre las tres categorías, sin ninguna en dos.
3. **El censo de la Parte E levanta los dos escritores de `MAPEO`**, y se reporta cuál
   encontró — no "el censo funciona". Si falta uno, el resto de la matriz no se publica.
4. Toda recomendación cita evidencia (paso, prompt o línea de código), no criterio propio.
5. Las diez hojas del alcance aparecen en la matriz, aunque sea con cero escritores. Una
   hoja ausente y una hoja sin escritores producen el mismo silencio — es el mismo error
   que `C.2-2` arregló para el diff.
6. `git status` limpio; el árbol de trabajo no tiene cambios en `.gs`.
7. Los dos entregables tienen su fila en `CLAUDE.md` §7 y en `PROYECTO.md` §9, en el mismo
   commit.

Si algo del bloque "Punto de partida" no da, **parar y reportar la discrepancia** antes de
seguir con el resto. Esa discrepancia sería el hallazgo más valioso del paso.
