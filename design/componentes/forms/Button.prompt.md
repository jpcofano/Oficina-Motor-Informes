Botón de acción para el panel. Usar `primary` para la acción principal de la pantalla (una por vista), `secondary` para acciones alternativas, `ghost` para acciones de bajo énfasis.

```jsx
<Button variant="primary" onClick={generar}>Generar informe</Button>
<Button variant="secondary">Cancelar</Button>
```

Variantes: `disabled` para bloquear mientras corre una generación (nunca ocultar el botón, sólo deshabilitarlo con texto que explique el estado).
