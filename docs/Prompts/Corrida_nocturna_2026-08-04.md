# Corrida nocturna — Llegar a un informe generado

**Estado:** vivo · **Fecha:** 2026-08-04 · **v2** · **Ubicación:** `docs/Prompts/Corrida_nocturna_2026-08-04.md`

> **Reemplaza a la v1 del mismo nombre.** Lo que cambia: **la armonización de JM quedó
> autorizada** y entra como punto 2, con el cableado que destraba. Sobrescribir el archivo.
>
> **Este prompt funciona distinto a todos los anteriores. No hay Parte 0 que termine en
> "reportar y parar". No se pide permiso. Se avanza hasta donde se pueda y se reporta al
> final.**
>
> **El objetivo es un archivo:** un informe de JM generado por el motor, en `carpeta_salida`.
> Con huecos, con `«FALTA:token»` por todos lados, con números que después habrá que discutir.
> Un informe feo y real vale más que otra ronda de verificación. **Los números se corrigen
> mirando el informe, no antes de tenerlo.**
>
> Los prompts base son `docs/Prompts/Paso-4.md` —ya reescrito, con sus addenda fusionados— y
> `docs/Prompts/Paso-5-v2.md`. Este prompt **les cambia el modo de trabajo**, no su contenido
> técnico. Donde digan "reportar y PARAR", se reporta **por escrito en la bitácora** y se sigue.

---

## Cómo se trabaja esta noche

**Verificar sigue estando bien; frenar, no.** Si una premisa se cae, la corrección se decide y
se anota — no se espera confirmación. Si son dos caminos y ninguno es claramente mejor, se elige
el más simple y reversible, se anota por qué, y se sigue.

**Un commit por pieza que funciona, `git push` después de cada uno.** Si algo se rompe, se
arregla en el commit siguiente, no se revierte el día.

**Lo que salga mal se escribe y no se esconde.** Un paso que no se pudo hacer, con el motivo, es
un resultado válido de la noche. Un paso que se dio por hecho sin correr, no.

**Si una pieza se traba, se salta y se sigue con la que viene.** El orden de abajo está pensado
para que trabarse en una no bloquee a las otras — salvo el punto 2, que va antes del 3 sí o sí.

---

## Orden de trabajo

### 1 · Destrabar el anclaje

`verificarPrecondicionAnclaje_` cuenta duplicados sobre filas que el emparejador nunca mira:
lee `rdv/RVD JM-CM - ES` con `getDataRange()` directo, sin filtrar por status. **Que cuente sólo
las `Realizada`**, leyendo el valor de `MAPEO.valores_incluidos` y no hardcodeado.

Si con eso la precondición pasa: **correr `anclarEncuentros()`** y anotar cuántos encuentros
quedaron anclados y cuántos sin link.

Si siguen quedando grupos duplicados: anotarlos enteros en la bitácora —figura, fecha, evento,
barrio, status, fila— y **seguir igual**. El resto de la noche no depende de esto salvo lo que se
aclara en el punto 4.

### 2 · Armonizar la plantilla de JM — **autorizado**

**Autorización explícita del usuario, 04/08/2026:** las plantillas son del equipo del usuario,
nada de esto está en producción, y la armonización queda autorizada para esta corrida.

**Sólo `jm`.** No correr `armonizarPlantillas()` tal cual, que itera todos los informes:
armonizar **únicamente** la presentación de JM. SECCO es Tramo 3 y tocarla esta noche agrega
riesgo sin ganancia.

Orden dentro del punto:

1. **El reporte de filtro primero**, el que lista qué cambiaría sin tocar nada. **No es una
   parada:** se corre, se vuelca entero a la bitácora, y se sigue. Es el registro de qué había
   antes, y sin él no hay con qué comparar después.
2. **El backup obligatorio** ya está en el código y aborta si falla. Si aborta, se anota y se
   salta el punto entero — **no se fuerza**.
3. **Armonizar.** Renombra los tokens de las cajas al canon, agrega las líneas de IVR que faltan
   en las slides 5 y 6, y en la slide 10 limpia las cajas fuera del canvas y la caja huérfana de
   M2.
4. **Re-inventariar los tokens** de la plantilla con `mapaDeTokens_` y anotar el antes y el
   después: cuántos tokens hay, cuántos se renombraron, cuántos quedaron sin tocar por el filtro
   de láminas congeladas.
5. **Cablear los que se destrabaron.** La media docena que quedó sin cablear —`enc_clics` vs
   `enc_clics_ctor`, `enc_mails_enviados` en la caja de Audiencia de IVR, `enc_audiencia` como
   alcance de pauta— existía porque la plantilla estaba a medio camino. Con la plantilla
   armonizada, **cablear con el nombre canónico** y anotar cuántas filas nuevas entraron a
   `MARCADORES`.

**`C-01` no se toca.** La regla sigue diciendo lo que dice; lo que hay es una autorización
puntual y fechada, y así se anota en la bitácora. Cambiar la regla es otra conversación.

### 3 · Paso 4 — Escribir en la plantilla

Ejecutar `docs/Prompts/Paso-4.md` completo. Su Parte A ya no para: se verifica, se anota y se
sigue.

Va **después** del punto 2, porque la armonización cambia los tokens que hay en la plantilla y
generar antes produciría un informe contra nombres viejos.

Lo que no se negocia, porque no es criterio técnico:

- **La generación escribe sobre una copia, nunca sobre la plantilla.** La única escritura
  autorizada sobre la plantilla es la armonización del punto 2.
- **El mapa `token → objectId` se registra ANTES de reemplazar.** Después del reemplazo el token
  ya no está y el mapa no se puede reconstruir.
- **Un token sin valor se escribe como `«FALTA:token»`** y va a la hoja `FALTANTES`. No se deja
  el token crudo ni se borra la caja.
- **`retirarMarcadoresDePrueba_()` corre antes de la primera generación.**

**Salida esperada del punto 3: un archivo generado.** Aunque esté lleno de `FALTA`. Si sale,
anotar su ID, su nombre y quién quedó como dueño.

### 4 · Paso 5 — Iterar los ítems

Ejecutar `docs/Prompts/Paso-5-v2.md`. Es el que le pasa al despachador el `id_cuenta` del ítem
que se emite, y por lo tanto el que hace que `digital` y los `m2_*` —hoy cableados y mudos—
devuelvan número.

Depende del punto 1: sin anclaje no hay `id_cuenta`. **Si el punto 1 no pasó**, implementar igual
la expansión por campaña y la orquestación, dejar la obtención del `id_cuenta` detrás de la
precondición, y anotar que quedó sin probar contra datos. Código escrito y sin probar es avance;
hay que decir que no se probó.

### 5 · Regenerar y comparar

Volver a generar el informe y anotar **cuántos tokens pasaron de `FALTA` a tener valor** entre la
primera generación y la última. Ese número es el resultado de la noche.

### 6 · Si sobra tiempo

Por orden: las Partes A, D y E del pedido de `m2` que hayan quedado sin correr; y el reporte de
qué tokens del inventario siguen sin marcador cableado.

---

## Los cuatro límites que no se cruzan sin el usuario

Todo lo demás se decide solo.

1. **No se edita ninguna celda de las cuatro bases.** Los datos los cura una persona.
2. **La generación de informes escribe sobre copias.** La única escritura autorizada sobre una
   plantilla es la armonización de JM del punto 2 — y sólo JM, no SECCO.
3. **No se deroga ni se reescribe una `R-NN`, `D-NN`, `S-NN` ni `C-01`.** Si una estorba, se
   anota el conflicto en `PENDIENTES` y se sigue por otro lado.
4. **No se reescribe historia de git** ni se borra nada que haya curado una persona —filas de
   `SECCIONES`, `CAMPANAS`, `REUNIONES`, `INFORMES`.

---

## El reporte de la mañana

Al final, un resumen corto, en este orden:

1. **El informe: ¿salió o no?** Si salió, ID, nombre, dueño, y cuántos tokens quedaron en `FALTA`
   sobre el total.
2. **Qué cambió en la plantilla de JM** con la armonización: cuántos tokens se renombraron,
   cuántas cajas se agregaron o borraron, y qué quedó afuera por el filtro.
3. **Qué funciona ahora que no funcionaba anoche**, en una línea por pieza.
4. **Qué se trabó, con el motivo**, y qué haría falta para destrabarlo.
5. **Qué decisiones tomaste solo** y por qué. Esta lista es la más importante para el usuario: es
   donde puede desandar algo si no le cierra.
6. **Los números que salieron raros.** Sin analizarlos — con el informe en la mano se miran
   juntos.

**No hace falta que todo esté cerrado. Hace falta que esté dicho.**

---

**Modelo:** Opus.
