# MENÚ — declarado por tabla

> Destino: `docs/Prompts/MENU_declarado_por_tabla.md`
> **Paso no funcional, sin número.** No cambia comportamiento del motor: reordena
> el menú y cambia cómo se declara. No bloquea ni depende de `Paso-2.11` ni de
> `Paso-2.13`; se puede correr entre partes.
> Un solo commit. **Trabajamos en español.**

---

## El problema

El menú tiene 35 ítems en 5 submenús, uno de ellos (`Diagnóstico y pruebas`) con
18 seguidos: no entran en pantalla. Dos causas:

1. Cada paso agregó su ítem y ninguno se sacó nunca, aunque el caso se cerrara.
2. El número de paso viaja en la etiqueta (`(Paso 2.9E)`, `(Parte D)`, `(AUD-1)`),
   duplicando lo que ya dice `docs/BITACORA.md` y alargando cada línea.

## Qué hay que hacer

En `Codigo.gs`, reemplazar el bloque que va desde `function onOpen() {` hasta el
`}` que cierra el `.addToUi();` por el bloque de la sección **Código** de abajo.
Va completo, incluida la tabla `MENU_`.

`onOpen()` deja de encadenar `addItem`/`addSubMenu` y pasa a recorrer una tabla
declarada arriba en el mismo archivo. Agregar un ítem es agregar una fila;
`onOpen()` no se toca más.

```
{ t: 'etiqueta', f: 'nombreFuncion' }   → ítem
{ t: 'etiqueta', items: [ ... ] }       → submenú
'---'                                    → separador
```

**No agregar ítems nuevos. No renombrar funciones. No tocar ningún otro archivo.**

## Reagrupamiento

| Antes | Ahora |
|---|---|
| `Valores (Paso 2.9H)` + `Consolidaciones (decisión + escritura)` | `Datos y decisiones` |
| `Mantenimiento` + `Diagnosticar carpeta de plantillas` | `Plantillas` |
| `Diagnóstico y pruebas` (18 ítems) | `Diagnóstico`: las 4 pruebas de uso diario arriba + `Solapas`, `Fechas y mapeo`, `Looker y alcance`, `Archivo (casos cerrados)` |

## Reglas que quedan vigentes

1. **La etiqueta dice qué hace el ítem.** El paso que lo creó vive en el
   encabezado de la función y en `BITACORA.md`, no en la etiqueta. Única
   excepción: el submenú `Archivo (casos cerrados)`, donde el paso es la
   identidad del caso.
2. **Ningún nivel pasa de 8 ítems visibles; la profundidad máxima es 3.**
   Si un submenú llega a 9, se parte antes de agregar el noveno.
3. **Un diagnóstico de un caso cerrado se mueve a `Archivo`, no se borra.**
   Sirve para reabrir el caso, no para el uso diario.
4. `construirMenu_()` solo arma menú: no valida, no lee hojas, no calcula.
5. `onOpen()` no puede tirar excepción: si `MENU_` queda mal, cae a un menú
   mínimo (`Abrir panel` + `Instalar / reparar hojas`) y loguea el error. Un
   `onOpen()` que explota deja la planilla sin ningún menú.
6. **Una vez aplicado, la fuente de verdad del menú es `MENU_` en `Codigo.gs`.**
   Este archivo queda como registro del paso: no se edita para cambiar el menú.

## Verificación

**Invariante:** el conjunto de nombres de función invocados por el menú es
idéntico antes y después — 35 nombres, sin altas, sin bajas, sin duplicados.
Ya verificado contra el menú vigente antes de escribir este prompt; Code lo
vuelve a verificar después de aplicar y **reporta los tres números**:

```bash
grep -o "f: *'[A-Za-z0-9_]*'" Codigo.gs | sed "s/f: *'//;s/'//" | sort > /tmp/menu.txt
wc -l < /tmp/menu.txt            # tiene que dar 35
sort -u /tmp/menu.txt | wc -l    # tiene que dar 35 → sin duplicados
# toda función del menú tiene que existir en algún .gs:
while read f; do grep -qh "^function $f" *.gs || echo "FALTA: $f"; done < /tmp/menu.txt
```

`FALTA:` esperado únicamente para `menuAplicarConfiguracion_`,
`menuEstadoConfiguracion_` y `menuDiagnosticoTiposFechasConfig_` **si el trabajo
de `Paso-2.11` Parte C / C.2 todavía no está commiteado**. Cualquier otro
`FALTA:` es un error: parar y avisar.

Después: `clasp push`, recargar la planilla y confirmar que el menú abre y que
`Diagnóstico` entra entero en pantalla.

## Cierre

1. Entrada en `docs/BITACORA.md`.
2. `docs/HANDOFF_CODE.md` reescrito si corresponde.
3. Commit: `Menú declarado por tabla`.

---

## Código

```javascript
// ============================================================================
// MENÚ — declaración única
// ----------------------------------------------------------------------------
// El menú se declara acá y se construye por recorrido. Agregar un ítem es
// agregar una fila a esta tabla: onOpen() no se toca nunca más.
//
// Convención de etiquetas: la etiqueta dice QUÉ hace el ítem. El paso que lo
// creó vive en el encabezado de la función y en docs/BITACORA.md, no en la
// etiqueta (una sola fuente de verdad). Única excepción: el submenú "Archivo",
// donde el paso ES la identidad del caso cerrado.
//
// Estructura: { t: etiqueta, f: función }  |  { t: etiqueta, items: [...] }  |  '---'
// ============================================================================

var MENU_ = {
  t: '▶ Motor de Informes',
  items: [
    { t: 'Abrir panel',      f: 'menuAbrirPanel_' },
    { t: 'Generar informe',  f: 'menuGenerarInforme_' },
    '---',

    // --- Configuración -----------------------------------------------------
    // "Aplicar configuración" corre los cuatro sembradores en el único orden
    // que tiene sentido y reporta un diff combinado (Paso 2.11 Parte C). Los
    // cuatro individuales viven en "Avanzado": sirven para depurar una hoja
    // puntual, pero correrlos sueltos y en cualquier orden es lo que revertía
    // la Parte C sin avisar.
    { t: 'Configuración', items: [
      { t: 'Aplicar configuración',        f: 'menuAplicarConfiguracion_' },
      { t: 'Estado de configuración',      f: 'menuEstadoConfiguracion_' },
      '---',
      { t: 'Registrar plantillas',         f: 'menuRegistrarPlantillas_' },
      { t: 'Promover fechas elegidas',     f: 'menuPromoverFechasElegidas_' },
      { t: 'Cargar temario de reuniones',  f: 'menuCargarTemarioReuniones_' },
      { t: 'Cargar ejemplo',               f: 'menuCargarEjemplo_' },
      '---',
      { t: 'Avanzado', items: [
        { t: 'Instalar / reparar hojas',           f: 'instalar' },
        { t: 'Cargar config inicial',              f: 'seedConfiguracion' },
        { t: 'Sembrar clasificación de solapas',   f: 'sembrarClasificacionSolapas' },
        { t: 'Sembrar árbol de secciones',         f: 'menuSembrarSecciones_' }
      ]}
    ]},

    // --- Datos: lo que decide una persona y después se escribe --------------
    { t: 'Datos y decisiones', items: [
      { t: 'Revisar divergencias de valores', f: 'menuRevisarDivergenciasValores_' },
      { t: 'Consolidar mapeos de looker',     f: 'menuConsolidarMapeoLooker_' }
    ]},

    // --- Diagnóstico: las cuatro pruebas de uso diario arriba, el resto agrupado
    { t: 'Diagnóstico', items: [
      { t: 'Probar conexión a bases',    f: 'probarConexionBases' },
      { t: 'Probar lectura por ventana', f: 'menuProbarLectura_' },
      { t: 'Probar unión y anclaje',     f: 'menuProbarUnionYAnclaje_' },
      { t: 'Calcular corte vertical',    f: 'menuCorteVerticalRetiro2407_' },
      '---',
      { t: 'Solapas', items: [
        { t: 'Listar solapas y tipos',              f: 'menuDiagnosticarBases_' },
        { t: 'Inventariar solapas',                 f: 'menuInventariarSolapas_' },
        { t: 'Auditoría de solapas',                f: 'menuAuditarSolapas_' },
        { t: 'Verificar nombres de solapa fuente',  f: 'menuVerificarNombresSolapasFuente_' }
      ]},
      { t: 'Fechas y mapeo', items: [
        { t: 'Detectar columnas de fecha',                f: 'menuDetectarColumnasFecha_' },
        { t: 'Validar MAPEO (duplicados)',                f: 'menuValidarMapeo_' },
        { t: 'Tipos de fechas de ventana (solo lectura)', f: 'menuDiagnosticoTiposFechasConfig_' }
      ]},
      { t: 'Looker y alcance', items: [
        { t: 'Comparar resúmenes de looker',    f: 'menuCompararResumenesLooker_' },
        { t: 'Auditar fórmulas de resúmenes',   f: 'menuAuditarFormulasResumenesLooker_' },
        { t: 'Auditar digital / alcance',       f: 'menuAuditarAlcanceDigital_' }
      ]},
      // Instrumentos de casos ya cerrados. No se borran: sirven para reabrir un
      // caso, no para el uso diario. Acá el paso SÍ va en la etiqueta.
      { t: 'Archivo (casos cerrados)', items: [
        { t: 'Corte de filas en m2 (2.8 D)',        f: 'menuDiagnosticarCorteFilasM2_' },
        { t: 'Filas sin clave en digital (2.8 E)',  f: 'menuDiagnosticarFilasSinClaveDigital_' },
        { t: 'Colapso del lector (2.9 A)',          f: 'menuDiagnosticarColapso_' }
      ]}
    ]},

    // --- Plantillas: todo lo que toca Slides, junto ---------------------------
    { t: 'Plantillas', items: [
      { t: 'Inventario de plantillas',            f: 'menuInventarioPlantillas_' },
      { t: 'Diagnosticar carpeta de plantillas',  f: 'menuDiagnosticarCarpetaPlantillas_' },
      { t: 'Armonizar tokens de plantillas',      f: 'menuArmonizarPlantillas_' },
      { t: 'Fijar plantilla canónica de JM',      f: 'menuRepuntarPlantillaCanonicaJM_' }
    ]}
  ]
};

/**
 * onOpen — construye el menú desde MENU_.
 * Si la tabla queda mal, igual tiene que haber menú: cae a uno mínimo y deja
 * el error en el log. Un onOpen() que tira excepción deja la planilla sin menú.
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  try {
    construirMenu_(ui, MENU_).addToUi();
  } catch (e) {
    ui.createMenu(MENU_.t + ' (degradado)')
      .addItem('Abrir panel', 'menuAbrirPanel_')
      .addItem('Instalar / reparar hojas', 'instalar')
      .addToUi();
    console.error('onOpen: menú degradado — ' + (e && e.message ? e.message : e));
  }
}

/**
 * construirMenu_ — recorre un nodo de MENU_ y devuelve un Menu de Apps Script.
 * No usa el nodo para nada más: no valida, no lee hojas, no calcula.
 */
function construirMenu_(ui, nodo) {
  var menu = ui.createMenu(nodo.t);
  var items = nodo.items || [];
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    if (it === '---') { menu.addSeparator(); continue; }
    if (it.items) { menu.addSubMenu(construirMenu_(ui, it)); continue; }
    menu.addItem(it.t, it.f);
  }
  return menu;
}
```
