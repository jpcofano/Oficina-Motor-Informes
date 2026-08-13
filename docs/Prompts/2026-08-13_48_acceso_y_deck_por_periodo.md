# `_48` · Sólo entra el dueño, y el panel muestra siempre el mismo deck

> **Reemplaza al `_48` entregado antes, que no se ejecutó.** Le agrega adelante el problema de
> acceso, que es más urgente.
>
> **Modelo por parte, declarado en cada una.** Sin declaración, Sonnet.
>
> **Primero: commitear lo del `_46`.** El código está pusheado a Apps Script y el repo está atrás —
> es exactamente la situación que ya costó dos veces hoy. Commit de código y commit de
> documentación, separados, antes de tocar nada de acá.

---

## Lo que reportó el usuario, usando el panel

1. **Sólo entra la primera cuenta de la lista, que es la dueña.** Las otras tres reciben la pantalla
   de rechazo.
2. **Cambia el período y siempre aparece el mismo deck ya generado.**
3. Leyó *"Sale de la cadena de `D-20`, eslabón «vigente»"* como que algo **está trabado**. No lo
   está: es el texto que explica de dónde sale el período por defecto.
4. Pregunta por el selector de secciones —dice que en SECCO ve uno y acá no— y por un selector de
   período por sección, que sabe que es a futuro.

---

## Parte A · Sólo lectura — qué mail recibe la barrera

**Modelo: Opus. Effort: alto.** Decide si el panel se puede usar o no.

**Candidato, y va como candidato:** con `executeAs: USER_DEPLOYING`,
`Session.getActiveUser().getEmail()` puede devolver **vacío** para cualquiera que no sea el dueño
del script cuando son cuentas de consumidor —`@gmail.com`, sin dominio compartido—. Si es eso, la
lista de `CONFIG` está bien cargada y bien leída: **la barrera nunca ve el mail contra el cual
comparar.** No es lo único que puede ser, y por eso se mide antes de tocar nada.

1. **Instrumentar el rechazo para que diga qué recibió.** En la traza de `servirPanel_`, distinguir
   estos tres casos, que hoy pueden estar colapsados en uno: **mail vacío**, **mail que llegó pero no
   está en la lista**, y **lista mal parseada**. Que quede el mail recibido en el log de Stackdriver,
   no en la pantalla.
2. **Pedirle al usuario que entre con una de las otras tres cuentas** y leer el log. **Ése es el
   dato**, y sin él lo demás es conjetura.
3. **Confirmar cómo quedó la celda de `CONFIG`**: cuántos mails parsea `apiListaAutorizados_` a
   partir del valor real cargado a mano, y si el segundo, tercero y cuarto sobreviven a la
   normalización. Un separador raro o un salto de línea daría el mismo síntoma por otra causa.

**Reportar y parar.** Si A.2 confirma el mail vacío, decirlo así y **no elegir el arreglo solo**:
las dos salidas tienen costo y son del usuario.

- **`executeAs: USER_ACCESSING`** — cada uno entra con su identidad y la barrera funciona, pero el
  motor pasa a correr **con los permisos del que aprieta**: cada cuenta necesita acceso a la planilla
  de control, a las fuentes, a la carpeta de plantillas y a la de salida. Y cada una tiene que
  autorizar los scopes la primera vez.
- **Dejar `USER_DEPLOYING` y cambiar la puerta** — la lista de mails deja de servir como barrera y
  hay que poner otra cosa.

---

## Parte B · Que el deck corresponda al período

**Modelo: Sonnet. Effort: alto.**

La causa está a la vista: **`CORRIDAS` guarda `periodo_id`** —`abrirCorrida_` lo escribe al abrir la
fila— **y `panel_ultimasCorridas` no lo devuelve.** El panel no tiene con qué distinguir y muestra la
última corrida del informe.

1. **Devolver `periodo_id`**, tal como está en la fila. Sin derivarlo de la fecha de generación: una
   corrida de hoy puede ser de junio.
2. **El panel empareja por informe *y* período.** Si no hay corrida cerrada para ese par, muestra el
   estado de generar, no el deck de otro período.
3. **Una corrida con `periodo_id` vacío no empareja con nada** — no se le asigna al período elegido
   "porque es la más nueva". Y una con `cerrada: false` no ofrece deck: no lo tiene.
4. **Si hay varias cerradas para el mismo par**, la más nueva, con su fecha y hora a la vista: es lo
   único que distingue dos decks del mismo informe y período.

**Prueba** con lo que ya hay en `CORRIDAS`: las dos corridas de hoy son de períodos distintos —julio
y `junio_sem2`—, así que el par sirve de fixture sin fabricar nada.

---

## Parte C · El texto que se leyó como un error

**Modelo: Sonnet. Effort: normal.**

Reescribir la línea del período por defecto para que diga **de qué período se trata y que se puede
cambiar**, no de qué decisión sale. `D-20` es para nosotros: sacarlo de la pantalla. Revisar de paso
el resto de los textos visibles por lo mismo — **nada de nombres de decisiones, casos ni tokens en la
interfaz.**

---

## Parte D · Sólo medir, no arreglar

**Modelo: Sonnet. Effort: normal.**

Qué devuelve `panel_getEstado()` en `secciones` para `jm` y para el informe de SECCO. Si `jm` trae
menos, decir si es por `SECCIONES` —dato— o por `seccionesRepetiblesDe_` —código—. **Son dos
arreglos distintos y no se eligen a ojo.** Agregarle secciones a `jm` es decisión editorial del
usuario: se reporta, no se hace.

El selector de período **por sección** es `D-20` de verdad y es diseño. No entra acá.

---

## Reporte final

- Qué mail recibió la barrera con la segunda cuenta. Es lo primero.
- Qué emparejaba el panel antes y qué empareja ahora.
- Cuántas filas de `CORRIDAS` tienen `periodo_id` vacío.
- Lo de las secciones, con el arreglo que correspondería y sin aplicarlo.
