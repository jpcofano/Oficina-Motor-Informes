# Corridas de Apps Script pendientes — mañana del 16/08/2026

> **Reemplaza a `docs/CORRIDAS_pendientes_2026-08-15.md`**, que queda como evidencia congelada.
> La dejó la corrida nocturna del `2026-08-16_1`, bloque 5. Es la lista única: todo lo que
> necesita la planilla y quedó esperando, en un solo lugar.
>
> **Ordenada por lo que destraba**, no por cómo aparecieron.
>
> Se corren desde el editor de Apps Script: elegir la función en el desplegable de arriba y
> **Ejecutar**; el resultado sale en **Registro de ejecución**. `clasp logs` no anda — el
> proyecto no tiene GCP propio.
>
> **Los nombres de acá son los que aparecen en el desplegable.** Ninguno termina en `_`: Apps
> Script no lista las privadas, así que lo que hay que elegir es el **wrapper público**
> (`CLAUDE.md` §2).
>
> **Todo lo de acá está pusheado.** La corrida nocturna no dejó nada sin subir.

---

## 1 · `testigoDeImpresiones()` — la Parte C del piloto · **⚠ LEER EL CANARIO PRIMERO**

**Qué destraba:** el frente 13 entero, la migración por tandas. Los ocho marcadores de
`looker/DIGITAL/Impresiones` están **migrados y sin verificar** desde el 15/08, y hasta que esto
se lea no se sabe si `D-33` reproduce los números. **Es la corrida más importante de la lista.**

**Antes de leer nada, el canario.** La función ya lo imprime en su log:

```
¿`gcba_frecuencia` da 0?
   SÍ  →  PARAR. `looker` está recalculando: la base está en tránsito y el resultado
          no se puede leer, ni a favor ni en contra. Volver más tarde y correr de nuevo.
   NO  →  seguir al orden de lectura de abajo.
```

**Por qué un marcador y no un chequeo propio:** `gcba_frecuencia` **no está migrado**, así que su
valor no depende de nada que el piloto haya tocado, y ya viene en el log. Un chequeo escrito
costaría más y mediría lo mismo peor.

**El orden de lectura, y es al revés de lo que parece:**

| # | qué se mira | qué significa |
|---|---|---|
| 1 | **las ocho cuentas de filas** de la traza — el testigo del 15/08 dio `46, 313, 14, 12, 20, 82, 84, 147` | **si cambiaron, es la base.** El drift explica el número y la migración no está en discusión |
| 2 | **los valores**, contra `docs/_snapshots/TESTIGO_impresiones_2026-08-15_2126.md` | **filas idénticas y número distinto = la migración.** Ahí sí se detiene el piloto |
| 3 | **el descuadre** `total = suma de partes`, en los dos ámbitos | es el control que **sobrevive al drift**: aguantó un movimiento de 138.427 impresiones y siguió dando cero |

⚠ **Un valor distinto NO prueba que falló la migración.** El 15/08 `looker` movió 138.427
impresiones en 1h45 sobre una ventana ya cerrada. Sin el paso 1, el drift se lee como una
migración rota y se revierte un cambio que estaba bien — o peor, se "ajusta" la dimensión hasta
que el número cuadre contra un testigo viejo.

**¿Necesita decisión del usuario?** **Sí, si no reproduce.** Si los ocho reproducen, se escribe en
`PLAN.md` que el piloto pasó y el frente 13 queda autorizado. Si no reproducen **con las filas
idénticas**, la salida es `revertirPilotoDeImpresiones()` — pero eso **no se corre por criterio
propio**: se reporta y decide el usuario.

---

## 2 · La forma de `looker/CC` — lo que destraba `C-61`, el frente 7

**Qué destraba:** el frente 7, que a su vez bloquea el embudo de Call Center (frente 11).

**La mitad de escritorio ya está hecha** (bloque 2 de la nocturna, contra el código y los
snapshots del 15/08), y cambió el cuadro:

- **El motor lee por POSICIÓN.** La letra de `MAPEO` se vuelve índice, de ahí sale el título, y
  con el título se extrae. El encabezado es **derivado** de la posición, nunca un criterio propio.
- **`looker/CC` tiene CERO filas de `MAPEO` y CERO marcadores.** No hay mapeo de `CC` que un
  corrimiento pueda romper hoy.

**Lo que falta medir, y necesita la planilla:**

| # | qué medir | con qué |
|---|---|---|
| 2.1 | **qué columnas tiene hoy `looker/CC`, con qué títulos y en qué letras** | `censarSolapasParaAlta()` — sin esto no se puede escribir una sola fila de `MAPEO` |
| 2.2 | **la fila de encabezado real**, contra lo que declara `SOLAPAS` | mismo censo. El desalineamiento entre declarado y real ya produjo `sin_datos` con un síntoma que no se parecía a la causa (`_44`) |
| 2.3 | **cuántos tokens ya validados cambiarían de valor** | hoy la respuesta esperada es **ninguno**, pero hay que confirmarlo **contra la planilla viva y no contra el snapshot**: `MAPEO` se escribe desde dos herramientas |

⚠ **Ojo con lo que ya se sabe de `looker/CC` y no hay que volver a medir:** `X-21` la censó en
vivo el 12/08 y tiene **cinco columnas y ninguna más** —`ID Cuentas`, `Base enviada`,
`Base barrida`, `Contactados`, `Efectivos`—. Sin fecha, sin campaña, sin estado. Si el censo de
mañana da otra cosa, **eso es el hallazgo**, no un detalle.

**¿Necesita decisión del usuario?** **Sí, y es previa a escribir nada:** **dónde se inserta la
columna de `C-61`.** A la derecha del todo, ninguna letra se corre y el riesgo es cero; en el
medio, corre todas las letras a su derecha y el mapeo apunta una más allá **sin fallar**.

---

## 3 · La Parte A de `R-26` — el "1 a 1" se comunica sólo por digital

**Qué destraba:** el frente 9, que es **independiente de todo lo demás** y por eso puede
adelantarse si la 1 queda esperando a que `looker` se estabilice.

⚠ **Esto NO es un botón del desplegable.** No hay función escrita: es la Parte A del prompt
`docs/Prompts/2026-08-13_1_R-26_uno_a_uno_solo_digital.md`, sólo lectura, y necesita una sesión
con acceso a la planilla. **Está escrita desde el 13/08 y nunca corrió.**

Mide, contra `MAPEO` **vivo** y sin filtro de ventana: qué valores distintos tiene la columna
`evento` de `rdv` —**sin asumir la forma exacta de `"1 a 1"`**—, cuántas filas hay, y **cuántas
tienen valor distinto de cero en cada canal**. El conteo importa más que la suma: **una sola fila
con mail rompe un "siempre cero"**.

**¿Necesita decisión del usuario?** **Sí, y es un gate explícito:** la Parte B no arranca sin que
el usuario confirme que la Parte A sostiene la premisa. **Y la Parte A puede falsarla** — si eso
pasa no se escribe nada y `R-26` queda como hueco, que está bien.

---

## 4 · Nada que correr para el frente 8 — está bloqueado por una decisión, no por una medición

**No hay instrumento que correr, y es un resultado del bloque 3, no un olvido.**

La premisa del frente 8 —*"`enc_*` filtra por tipo de llamado, `cc_*` no filtra"*— **es falsa en
las dos mitades**, medido contra los snapshots del 15/08: **no existe ningún marcador `cc_*`** —son
tokens sin fila que publican `—` por decisión de `_32.2`— **y ningún `enc_*` filtra por
`Tipo de llamado`**.

**Y la columna del corte vive en `reuniones/Call`, que está `uso = ignorar`.** Una solapa
`ignorar` no se lee, no se audita y no se mapea (`CLAUDE.md` §2), y el motor la rechaza solo.
Escribir un instrumento que la lea sería reproducir peor lo que el motor ya hace.

**Lo que decide el usuario, y destraba el frente:**

1. **¿`reuniones/Call` o `Métricas EDVs` pasan a `fuente`, o el corte se declara sin leerlas?** Es
   una escritura en `SOLAPAS` y revierte una decisión de hace un día. `Métricas EDVs` tiene el
   agravante de que su dueño es otra planilla y su clave es `ID Reunión`, no `ID Cuentas`.
2. **¿Los `cc_*` de las láminas 2 y 5 siguen publicando `—`?** Si sí, el frente 8 no es sobre
   ellos. Si no, se está derogando `_32.2` y eso necesita decirse.

---

## 5 · Una corrida del motor para completar el catálogo de tokens — **no urgente**

**Qué destraba:** nada bloqueado; mejora el frente 14.

`docs/CATALOGO_tokens.md` ya existe, generado por `tools/catalogo.js` desde el snapshot del 15/08.
Su limitación está escrita en el propio archivo: la columna `config` es **estática** y da **78 de
78 resuelven**, mientras el motor publica **diez marcadores en error**. Esos diez fallan en
**ejecución** —`D-30` sin `id_cuenta`, `ULTIMO` sin fecha utilizable, cero filas tras el recorte—
y **ninguna de esas causas deja rastro en `MARCADORES`, `SOLAPAS` ni `MAPEO`**.

Para que entren al catálogo hace falta una corrida contra la planilla viva
(`diagMarcadoresDeCuenta_` vía su wrapper, o el `FALTANTES` de una corrida real) y volcar su
salida a un formato que el generador pueda leer.

**¿Necesita decisión del usuario?** **Sí, pero de formato, no de corrida:** **el formato
definitivo del catálogo no está decidido** y la nocturna no lo tomó a propósito. Qué agrupa, qué
nombre lleva cada cosa de cara al equipo, y si `-` y `---` significan algo.

---

## Lo que NO hay que correr

- **`migrarPilotoDeImpresiones()`** — ya corrió. Volver a correrla no hace nada bueno.
- **`revertirPilotoDeImpresiones()`** — existe y está probada, **pero no se corre sin decisión
  del usuario**. Revertir por un síntoma ya explicado por el drift de `looker` sería tirar
  trabajo bueno.
- **`instalar()` esperando que siembre contenido** — no siembra. Crea/repara hojas y aplica
  `COLUMNAS_DELTA_`. Lo que siembra es el ítem de menú **Aplicar configuración**, y el síntoma de
  equivocarse es **una corrida que termina bien y una hoja que no cambia**.
