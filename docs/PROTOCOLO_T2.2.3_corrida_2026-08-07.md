# PROTOCOLO `T2.2.3` — corrida del 07/08/2026 (el deck entero, antes y después del caché)

> **Documento congelado.** Es evidencia de una verificación puntual: qué se corrió, con qué
> instrumento y qué devolvió. No se edita — si el control se vuelve a correr, se escribe un
> archivo nuevo. Los addenda fechados sí valen (`CLAUDE.md` §7).
>
> **`reemplaza:` nada.**
>
> Control pedido por: `docs/Prompts/2026-08-06_15_corrida_nocturna.md`, tarea `N1`.
> Código bajo prueba: `T2.2.2`, commit `658b6d7` (el caché de hojas de registro con alcance
> de invocación).
> **Trabajamos en español.**

---

## El resultado, primero

**Cero diferencias.** Los dos decks —26 láminas, 1389 piezas de texto cada uno— son idénticos
pieza por pieza.

| | referencia | control |
|---|---|---|
| corrida | `jm-20260806-222554` | `jm-20260807-004300` |
| deck | `1MH2hFWjcTHjrlZu-NkUxlnbUiuIIR6aAxgjIJ5GxrNg` | `1ZIT5qAFlW_0y3TczVtE315SjBQ3dDY_gLTt_hb3Abhw` (a la papelera) |
| láminas | 26 | 26 |
| piezas de texto | 1389 | 1389 |
| piezas sólo en una | — | **0** |
| piezas con texto distinto | — | **0** |
| tokens reemplazados | 29 | 29 |
| faltantes | 270 | 270 |

## La noticia colateral, y es grande

**La corrida completó.** `corte: null`, **120 s gastados** contra un techo de 350 y una reserva
de 30. La barrida final de `T2.1.1` encontró **0 tokens crudos**.

El presupuesto proyectado de `T2.2.2` era **~190 s**; la corrida real gastó **120**. La
proyección era pesimista, no optimista.

Y corrige, hacia atrás, una lectura del handoff: `jm-20260806-222554` **tampoco estaba
cortada**. Sus 29 reemplazados y 270 faltantes son exactamente los del control, que corrió
entero. Los 270 faltantes no son corte por tiempo: son tokens sin cablear o sin fuente, que es
otro problema y ya está inventariado.

## Qué se hizo, exactamente

1. **Huella del deck de referencia.** `piezasDeTextoDeSlide_` sobre las 26 láminas del deck de
   `jm-20260806-222554`, guardando `(lámina, índice de pieza, escondida, contenedor, texto)`.
   Se usa esa función y no `getShapes()` porque es la única que baja a tablas y a grupos.
2. **Corrida de control**, `generarInforme('jm')` por la API de pruebas, sin override de
   período: los dos lados resuelven la ventana por la misma cadena de `D-20`.
3. **Huella del deck nuevo**, con el mismo instrumento.
4. **Diff por posición** —lámina + índice de pieza + contenedor—, no por `objectId`: los
   `objectId` se regeneran en cada copia de la plantilla y no son comparables entre decks.
5. **El deck de control a la papelera.**

## Las dos cosas que el control tocó y hay que saber

- **`FALTANTES` se pisó.** No es evitable: `escribirFaltantes_` limpia la hoja entera antes de
  escribir (`Generador.gs:769`), por diseño — es la hoja de *la última* corrida, no un
  histórico. El contenido que quedó es el de la corrida de control, **270 filas idénticas en
  cantidad a las que dejó la referencia**.
- **`CORRIDAS` tiene una fila más**, `jm-20260807-004300`, apuntando a un deck que está en la
  papelera. La carpeta de salidas sigue cerrando: el deck existió y la fila lo declara.

## La decisión que se tomó sola

El prompt pedía generar el deck **fuera de la carpeta de salidas**. `generarInforme` no toma
carpeta por parámetro: sale de `CONFIG.carpeta_salida`, y la única forma de desviarlo era
escribir esa clave y volverla a su valor al terminar. **No se hizo**: si la corrida moría en el
medio, la configuración quedaba apuntando a otro lado y la siguiente corrida real —de una
persona, sin saberlo— escribía ahí. Se generó en la carpeta normal y el deck se mandó a la
papelera, que es lo que el prompt pedía hacer al terminar de todos modos.

## Cómo se reproduce

Las tres llamadas van por `tools/api.js` contra la API de pruebas:

```
node tools/api.js llamar fn=generarInforme args='["jm"]' --crudo
```

y la huella de un deck, por `fn=eval`, con esta expresión:

```js
(function () {
  var pres = SlidesApp.openById('<deck_id>');
  var out = [];
  pres.getSlides().forEach(function (s, i) {
    var h = esLaminaEscondida_(s);
    piezasDeTextoDeSlide_(s).forEach(function (p, j) {
      out.push([i + 1, j, h ? 'H' : '', p.contenedor, p.texto]);
    });
  });
  return out;
})()
```

Dos huellas se comparan por la clave `lámina|índice|contenedor`. Los `deck_id` salen de la
columna `deck_id` de `CORRIDAS`, **nunca de la fecha de modificación del archivo**: todos los
decks de la carpeta se llaman igual.
