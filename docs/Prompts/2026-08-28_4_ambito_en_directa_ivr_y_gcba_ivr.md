# 2026-08-28_4 — `ambito` en `digital/Directa IVR`, y el alta de los tres `gcba_ivr_*`

**Subagente: ninguno.** Escribe en `MAPEO` por el `SEED_*` y en `MARCADORES` por un wrapper propio;
el `cableador` no se invoca — el token no sale de `«FALTA»` sino de una caja **nueva** de la
plantilla, y el corte que necesita **no existía** en el motor.

**Estado: ejecutado (28/08/2026).**

---

## De dónde sale

El usuario agregó a mano el bloque de IVR al **Resumen Ejecutivo de GCBA** (`L-032`, lámina 3) y
preguntó con qué proceso se incorpora. `docs/TOKENS.md` §178 registra esa lámina como *«los mismos
de la lámina 2 con prefijo `gcba_` … **(sin `gcba_ivr_*`)**»* — o sea que el bloque **no existía**
de ese lado.

## Lo medido antes de la primera edición

**Censo vivo** (`censarTokensSinMarcador()`, 28/08 18:13): `L-032` pasó de **19 a 23 tokens** y trae
sin fila `gcba_ivr_llamados`, `gcba_ivr_atendidos`, `gcba_ivr_at_pct`. Eso es lo que prueba que los
`{{token}}` quedaron bien escritos. ⚠ **`L-031` no cambió** —21 tokens, los mismos 5 sin fila del
censo del 22/08—, así que los `ivr_*` de JM **siguen sin caja**, como midió `diagDondeVivenLosIvr()`
el 23/08.

⚠ **Y queda un hueco declarado: 23 − 19 = 4, y sólo 3 están en la lista.** Hay un cuarto token nuevo
en `L-032` que **ya tiene fila** y no está identificado. No se supone cuál es.

### ⛔ La premisa que faltaba, y por eso esto no era un alta de tres filas

`DIMENSIONES_.ambito` (`Fuentes.gs`) declara **cinco** pares `base|solapa` y **`digital|Directa IVR`
no es ninguno**. Una fila con `dimensiones = ambito=gcba` sobre esa solapa devuelve `ok:false` —
*«`ambito=gcba` no está definida para digital|Directa IVR»*. **Falla ruidoso, que es lo correcto, y
no publica.** Escribir las tres filas sin esto deja tres marcadores rotos de una pasada.

### ⭐ La condición física, medida y no calcada

Fixture `Seguimiento Digital 2026-08-28.zip`, `sha256` `0ce0086d…ac79` **verificado** contra la
tabla de huellas de `docs/_fixtures/README.md`. Solapa `Directa IVR`, **63 filas con `ID cuentas`**:

| candidato | qué da |
|---|---|
| ⭐ **col G · `Vocero`** | **`JM` 55 · `GCBA` 8** — dos valores, ninguno vacío |
| col I · `Nombre campaña` con `~=JM` | **53** — pierde 2 filas |

Las dos que pierde son `2961-ABRSEGGJ · ORDEN Y SEGURIDAD 2026`, con `Vocero = JM` y ningún «JM» en
el nombre. ⚠ **Calcar la regla de `looker|DIGITAL` —`nombre_campaña~=JM`— habría clasificado esas
dos como GCBA sin fallar.** Es la disyuntiva del 27/08 en el desglose, al revés: allá la columna de
ámbito contradecía al nombre y ganó el nombre; **acá la columna explícita es la que acierta**, y por
eso se mide en vez de deducirse.

**El molde ya estaba en la hoja de al lado:** `mail_remitente` es la **columna G** de `Directa Mail`
y existe exactamente para esto, con el corte JM/GCBA escrito en sus `notas`.

## Lo que se hace

1. **`MAPEO`** — `digital / Directa IVR / ivr_vocero` → columna **G**, encabezado `Vocero`, tipo
   `texto`. Va al `SEED_MAPEO_` **y** a los dos mapas de post-proceso (`tipo_esperado`,
   `encabezado`), porque `upsertPorClave_` borra lo que el objeto no traiga.
2. **`DIMENSIONES_.ambito`** — `jm` → `ivr_vocero=JM`, `gcba` → `ivr_vocero!=JM`. La negación no es
   cosmética: `D-33` define `gcba` como *todo lo que no es `jm`*, así que una fila con el vocero
   vacío cae en GCBA **y se ve**, en vez de quedar afuera de los dos.
3. **`cablearGcbaIvr()`** — público y sin parámetros, `curarMarcadores_` adentro, tres filas.
   Formato copiado de los gemelos JM: `miles`, `miles`, `porcentaje_sin_signo`.
   ⭐ **Sin `_revisar`, y con motivo medido:** `R-31` lista `digital/Directa IVR` entre las
   **ESTABLES** —cero movimientos sobre 44 filas comparables, `ivr_llamados` e `ivr_atendidos`
   incluidos—, así que admite igualdad exacta.
4. **`tools/probar-ambito-ivr.js`** — el control, extrayendo `DIMENSIONES_` y
   `condicionesDeDimensiones_` **reales** de `Fuentes.gs`.

## Lo que NO se hace, y es una decisión del usuario

Los cuatro `ivr_*` de JM tienen **`dimensiones` vacío**, y ausente significa *todas*: agregan las
**63 filas**, GCBA incluido. Si GCBA nace con corte y JM se queda sin él, **el bloque de JM contiene
al de GCBA** y las partes no suman el total.

⛔ **Ponerles `ambito=jm` MUEVE un número publicado**, así que va en otro paso y en otro deck — salvo
que hoy no publiquen nada, que es lo que `diagDondeVivenLosIvr()` contesta. **Este paso llena
huecos**: los tres tokens nuevos no tenían número ayer, así que no hay nada que atribuir.

## Control

- `node tools/suites.js` en verde, con el banco nuevo adentro.
- `censarTokensSinMarcador()` **después**: los tres **no** tienen que aparecer más en `L-032`.
- `diagDondeVivenLosIvr()`: dice si los `ivr_*` de JM siguen sin caja, que es lo que decide si el
  paso siguiente existe.
- Una corrida de `jm`. ⚠ El bloque de IVR del resumen **es condicional** (`C-31`, `C-38`): aparece
  cuando hay datos. Del lado GCBA el fixture del 28/08 tiene **6 filas con datos y 2 vacías**.
- ⭐ Y la reserva que ya está escrita: para GCBA el 🌐 de `X-41` está **en reserva** desde el 25/08
  —*«GCBA significa TODO, no el temario»*—, así que el agregado de la ventana puede ser acá
  exactamente el universo correcto.
