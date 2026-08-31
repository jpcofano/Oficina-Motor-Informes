# `2026-08-31_1` · Mudar los ocho `imp_*` de `looker/DIGITAL` al desglose

**Destino:** `docs/Prompts/`. **Estado:** no ejecutado.
**Depende de** `docs/MEDICION_cableado_JDGAG_2026-08-30.md`.

⛔⛔ **Mueve los dos números publicados de `L-031` y `L-032`.** Partes B y C en **Opus, effort
alto**.

---

## 0 · Qué se espera, y por qué vale la pena

Medido el 30/08 con el corte `JDGAG` ya cableado, ventana 21–28, `estado` activo:

| | desde `looker/DIGITAL` (hoy) | desde el desglose | tablero |
|---|---|---|---|
| **JM total** | 4.654.227 · **44,8 %** | 8.930.007 · **86,0 %** | 10.381.289 |
| JM Meta | 30,6 % | 85,2 % | |
| JM Google | 41,7 % | 90,0 % | |
| JM DV360 | 50,0 % | 85,6 % | |

⭐ **Lo uniforme es el dato, no el 86.** Un faltante repartido parejo en las tres plataformas es
rezago de fuente; uno concentrado en una celda sería error de selección. `looker/DIGITAL` es una
copia rezagada del desglose —medido: 24 % el 28/08— y los ocho `imp_*` leen de ahí.

⚠ **Lo que NO arregla:** GCBA queda en ~209 % sobre el desglose. Eso es el grano temporal y ya
está decidido — la lámina publica **acumulado rotulado**. No es criterio de éxito de este prompt.

**Criterio de éxito:** JM se acerca al tablero en las tres plataformas **y sigue uniforme**. Si
una celda se despega de las otras dos, eso es un hallazgo y hay que pararse a mirarlo.

---

## 1 · El cambio

**Ocho filas de `MARCADORES`** — es una hoja de registro, **no código, no `clasp push`**:

| marcador | `base_id` | `solapa` | `campo_logico` |
|---|---|---|---|
| `imp_total` · `gcba_imp_total` | `digital` | `CAMPAÑAS_DESGLOCE_DIGITAL` | `des_impresiones` |
| `imp_meta` · `gcba_imp_meta` | ídem | ídem | ídem |
| `imp_google` · `gcba_imp_google` | ídem | ídem | ídem |
| `imp_prog` · `gcba_imp_prog` | ídem | ídem | ídem |

`operacion`, `periodo_ref` y `dimensiones` **no cambian**. `DIMENSIONES_` ya declara `ambito` y
`plataforma` para esa solapa desde el 28/08: **cero código nuevo**.

---

## Parte 0 — Premisas · **sólo lectura** · Sonnet · effort normal

**P1 · Las ocho filas siguen en `looker|DIGITAL`** con `filtro = estado=Activa`. Reportarlas
enteras. Si alguien ya las movió, parar.

**P2 · `DIMENSIONES_` declara las dos dimensiones sobre el desglose.** `ambito.jm/gcba` con
`des_id_cuenta~=JDGAG` y su negación; `plataforma.meta/google/programmatic` con `des_plataforma`.
Confirmar las seis entradas.

**P3 · `MAPEO` tiene `des_impresiones`** sobre `CAMPAÑAS_DESGLOCE_DIGITAL`, y la solapa está
declarada `uso = fuente` en `SOLAPAS`.

**P4 · ⛔⛔ El filtro de estado — es la decisión de este prompt, y hay que traerla resuelta.**

En `looker/DIGITAL` el campo es `estado`, una sola columna. **En el desglose hay dos, y `MAPEO`
declara las dos:**

```
des_estado    → col K  «Estado»    ACTIVA 247 · FINALIZADA 69 · PAUSADA 23 · PENDIENTE 4
des_estado_2  → col Y  «estado»    Activa 169 · Finalizada 103 · Pendiente 62 · Cancelada 3 · vacío 6
```

*(conteos sobre la ventana 21–28 del artefacto del 30/08)*

**Al menos 78 filas que una llama activa y la otra no.** El filtro copiado tal cual —`estado=Activa`—
**no existe en el desglose**: hay que escribir `des_estado=ACTIVA` o `des_estado_2=Activa`, y son
números distintos.

⚠ Y ojo con las mayúsculas: la col K usa `ACTIVA` y la col Y usa `Activa`. Verificar si el
comparador distingue. Si distingue, el filtro mal escrito da **cero sin fallar**.

**Medir las dos opciones antes de elegir**, sobre la ventana 21–28 y con el corte `JDGAG`: filas,
suma y porcentaje contra el tablero, por plataforma y ámbito. **Reportar y parar.** La elección la
hace el usuario con las dos columnas a la vista.

**P5 · El recorte temporal cambia de mecanismo, y hay que decirlo.** `looker/DIGITAL` no tiene
fechas y se recorta por `ventana_ref = Cuentas`. El desglose **tiene `Fecha inicio` y `Fecha fin`
propias** y se recorta por **solape (`R-16`)**. No es el mismo universo por construcción: los
conteos van a cambiar por esto además de por la fuente. **Reportar cuántas filas selecciona cada
mecanismo sobre la misma ventana**, para que el diff de la Parte C sea legible.

⛔ **Terminar acá: reportar y parar.**

---

## Parte A — Testigo ANTES · Sonnet · effort normal

Como el del `_2`, con **una corrección obligatoria**: ⭐ **el encabezado tiene que imprimir la
ventana que el testigo está usando.** El testigo no acepta período y toma el default de `R-11`; en
la vuelta anterior eso hizo que testigo y corrida midieran ventanas distintas sin que nada avisara,
y produjo una contradicción aparente entre dos números correctos.

Registrar los ocho `imp_*`, `frecuencia`, `gcba_frecuencia`, y los canarios —`camp_dig_impl`,
`camp_meta/google/prog_impresiones`, `u1_total_impresiones`.

⚠ **`u1_total_impresiones` ya lee el desglose.** Después de la mudanza deja de ser canario y pasa
a ser vecino: comparte solapa con los `imp_*`. Declararlo antes, para que su movimiento no se lea
como una alarma.

---

## Parte B — Las ocho filas · **Opus** · effort alto

Editar las ocho filas de `MARCADORES` según §1. **Nada más.** No tocar `DIMENSIONES_`, ni
`Fuentes.gs`, ni ninguna planilla de terceros.

⭐ **Y cerrar la mudanza a medias en la documentación**, que es la mitad del valor de este prompt:
el comentario del 28/08 en `Fuentes.gs` anunciaba esta mudanza y la entrada de `DIMENSIONES_` la
esperaba desde entonces. Dejar escrito que se completó y en qué fecha, para que no vuelva a leerse
como pendiente.

---

## Parte C — Testigo DESPUÉS y corrida · **Opus** · effort alto

1. Testigo DESPUÉS, misma sesión, con la ventana en el encabezado.
2. **Correr el informe `jm` con `periodo_id = 2026_agosto_21_28`** — la ventana del equipo y la del
   tablero. ⚠ **No usar el default de `R-11`**, que da 21–27 y mide otra cosa.
3. Comparar contra `Tablero_carga_21-28ago_lectura_2026-08-30_1800.png`.

**Responder, explícito:**

- ¿JM llegó a ~86 % **y sigue uniforme** en las tres plataformas? Si una celda se despega, pararse.
- ¿La identidad `meta + google + prog = total` cierra en los dos ámbitos y en las dos tomas?
- ¿Los canarios se movieron? ⚠ `u1_total_impresiones` ya no cuenta como canario (Parte A).
- ¿`frecuencia` sigue en `sin_datos`? **Debería** — la mudanza no toca
  `resumen_metricas_dinamico`. Si sale, algo se movió que no debía.
- ¿Cuánto de la diferencia con la corrida anterior es la solapa y cuánto el cambio de mecanismo de
  ventana (P5)? Son dos causas y el diff las mezcla.

---

## Parte D — Documentación · Sonnet · effort normal

`docs/` con el resultado. **Primera línea:** qué publica ahora `L-031` y `L-032` y contra qué
cierra.

⛔ **Y lo que sigue sin resolverse aunque esto salga perfecto:** GCBA en ~209 % por el grano
temporal, que no es un error corregible. La lámina publica acumulado rotulado por decisión del
usuario del 30/08. **Que eso esté en la misma pantalla que el 86 %**, para que nadie lea «JM cerró»
como «las láminas están validadas».

**Pendientes que este prompt no toca y no hay que dejar caer:** el default de `R-11` contra la
semana que el equipo publica · el testigo sin período · las dos columnas de estado del desglose, si
la Parte 0 no las cerró · la ventana 21–27 que ajusta mejor sin causa conocida —vuelve a estar
abierta, la explicación que la cerró se cayó— · el `P0` del `Libro` · el `P2` del `||` ·
`enc_alcance` · las tres familias de `sin_datos`.
