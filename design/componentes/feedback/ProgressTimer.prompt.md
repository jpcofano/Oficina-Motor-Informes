Resuelve el problema central del panel: una corrida tarda 120–320 s y el usuario necesita ver que algo pasa, no sólo un reloj mudo. Muestra segundos transcurridos (número real, no un truco) + la etapa activa. La regla es sobre una regla, no una barra que se llena: una banda fija marca el rango habitual (120–320 s de un techo de 350 s) y un marcador se mueve con el tiempo real transcurrido. Nunca implica "% completado" — el motor no reporta avance real, así que no hay ninguna promesa de cuánto falta. El marcador pasa a ámbar al superar el rango habitual y a rojo cerca del techo.

```jsx
<ProgressTimer elapsedSeconds={184} stage="Resolviendo marcadores" />
```
