# OBJETIVO — Láminas nuevas por prompt

> Objetivo final del panel: que una persona del equipo pueda **pedir una lámina nueva en
> lenguaje natural** y que el motor la incorpore como una sección más, viva, que se
> repinta sola cada semana.
> Trabajamos en español.

## El flujo

```
1. La persona abre el panel y describe qué lámina quiere.
2. El panel arma un prompt con: catálogo de tokens + restricciones de diseño + el pedido.
3. La persona copia ese prompt y lo pega en claude.ai.
4. Claude devuelve un JSON con la especificación de la lámina.
5. La persona pega el JSON de vuelta en el panel.
6. El panel valida, registra la sección y crea la lámina.
```

Sin API key, sin integración: **copiar y pegar en las dos direcciones.** Es lo más simple
que funciona, y no depende de que alguien apruebe una conexión saliente.

## La regla que hace que esto sea un motor y no un truco

**El JSON referencia tokens, nunca valores.**

Si Claude devuelve `"Alcance: 45.320"`, la lámina sirve una semana y muere. Si devuelve
`"Alcance: {{enc_alcance}}"`, la lámina es una sección del informe: se repinta cada
semana, con la traza de siempre, y entra al mismo control de `VISTA_PREVIA`.

Es la misma diferencia que separa "hicimos un informe" de "hicimos un motor".

## Qué exporta el panel (ida)

### 1. Catálogo de tokens

Uno por token disponible, con lo mínimo para que se pueda elegir bien:

| campo | por qué |
|---|---|
| `token` | el nombre a usar |
| `descripcion` | qué mide |
| `familia` | `ecv_` / `enc_` / `camp_` / `m2_` / `emin_` |
| `tipo` | número · porcentaje · texto · fecha |
| `valor_actual` | para que se vea el orden de magnitud |
| `contexto` | `REUNIONES` / `CAMPANAS` / `AUDIENCIAS` / período |

**`contexto` es crítico.** Un token de reunión no se puede mezclar con uno de campaña en
la misma lámina sin decidir sobre qué itera. Si el catálogo no lo dice, el JSON va a
pedir cosas imposibles.

### 2. Restricciones de diseño

Sacadas de la plantilla vigente, no inventadas: dimensiones de lámina, tipografías,
paleta GCBA, márgenes, y los benchmarks que hoy están hardcodeados.

Sin esto la lámina va a salir prolija pero ajena al resto del informe.

### 3. El pedido

Lo que escribió la persona, tal cual.

## Qué devuelve Claude (vuelta)

```json
{
  "seccion_id": "comparativo_canales",
  "nombre": "Comparativo de canales por encuentro",
  "informes": ["JM"],
  "modo": "repetible",
  "itera_sobre": "REUNIONES",
  "filtro": "tipo=Uno a uno",
  "padre": "",
  "elementos": [
    { "tipo": "titulo", "texto": "Comparativo — {{ecv_comuna}} ({{ecv_fecha}})" },
    { "tipo": "tabla",
      "columnas": ["Canal", "Entregados", "Aperturas", "OR"],
      "filas": [["Mail", "{{enc_mails_entregados}}", "{{enc_aperturas}}", "{{enc_or}}%"]] },
    { "tipo": "kpi", "etiqueta": "Alcance", "valor": "{{enc_alcance}}" }
  ],
  "tokens_usados": ["ecv_comuna", "ecv_fecha", "enc_mails_entregados", "enc_aperturas", "enc_or", "enc_alcance"],
  "tokens_faltantes": [
    { "nombre": "enc_costo_contacto",
      "descripcion": "costo por contacto efectivo",
      "como_calcularlo": "inversión / contactados",
      "falta": "no hay columna de inversión en ninguna base registrada" }
  ]
}
```

### `tokens_faltantes` es la parte que más importa

Si la persona pide algo que ningún token cubre, **Claude lo declara en vez de
inventarlo**. Un token inventado produce `«FALTA:token»` en la corrida, que está bien;
pero un token *aproximado* —usar `enc_alcance` donde pedían audiencia— produce un número
plausible y equivocado.

Cada entrada de `tokens_faltantes` es candidata a fila nueva en `MARCADORES`.

## Qué hace el panel al recibirlo (validación)

En este orden, y **frena en el primero que falle**:

1. **JSON bien formado.**
2. **Todos los `tokens_usados` existen** en `MARCADORES`. Si alguno no existe, se rechaza
   entero — no se emite una lámina a medias.
3. **Coherencia de contexto**: todos los tokens pertenecen al `itera_sobre` declarado, o
   son de período. Un `camp_*` dentro de una sección que itera `REUNIONES` es un error.
4. **`seccion_id` no colisiona** con uno existente.
5. Registrar en `SECCIONES` con `estado = revisar` y `falta = lámina generada, sin
   validar contra datos reales`.
6. Crear la lámina en la plantilla y correr el motor para verla llena.

**Nunca entra directo como `activa`.** Una lámina generada tiene que pasar por una
corrida con traza antes de que alguien la presente.

## Por qué esto no automatiza el criterio

El sistema arma la lámina; **qué vale la pena mostrar lo sigue decidiendo el equipo**. El
prompt lo escribe una persona, el JSON lo revisa una persona, y la lámina entra en
`revisar` hasta que alguien la mira llena.

Lo que se automatiza es el trabajo de posicionar cajas y cablear tokens, que hoy se hace
a mano y es donde aparecen los `xx` que sobreviven a la publicación.

## Riesgos anotados

- **Deriva de diseño.** Cada lámina generada se parece un poco menos a las demás. Mitiga:
  exportar las restricciones de la plantilla, no dejar que Claude elija paleta.
- **Proliferación.** Es fácil pedir láminas y difícil sacarlas. El campo `mostrar` de
  `SECCIONES` tiene que poder apagarlas sin borrarlas.
- **Token aproximado.** Ya cubierto por `tokens_faltantes`, pero conviene que el panel
  muestre en la validación qué tokens se usaron, para que la persona confirme que son los
  que pidió.

## Dónde encaja

Es de la **capa de panel** (Pasos 6–9), después de que el motor headless ande y las
secciones se emitan solas. No antes: generar láminas sobre un motor que todavía colapsa
filas produce láminas nuevas con números viejos mal.
