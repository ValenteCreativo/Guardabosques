# Documento de Requisitos — Guardabosques

## Introducción

Guardabosques es un juego 2D de defensa tipo slicing donde el jugador protege un árbol sagrado de oleadas de enemigos contaminantes. El jugador usa un machete para cortar enemigos antes de que lleguen al árbol. Si los enemigos alcanzan el árbol, le hacen daño. El juego termina cuando la salud del árbol llega a cero. El proyecto reutiliza la arquitectura del juego base `mariachi-vs-inflation` (motor Kaplay, Vite, estructura de escenas) adaptando el tema, los enemigos, los powerups y la narrativa al contexto ecológico/ambiental.

---

## Glosario

- **Sistema**: El motor del juego Guardabosques construido sobre Kaplay.
- **Árbol**: El objeto central que el jugador debe proteger; tiene una variable `treeHealth` con valor inicial 100.
- **Guardabosques**: El personaje del jugador, representado visualmente con un machete.
- **Enemigo**: Entidad contaminante que se mueve desde los bordes de la pantalla hacia el centro donde está el Árbol.
- **Slicing**: Mecánica de corte por deslizamiento del puntero/dedo sobre un Enemigo o Powerup activo.
- **Powerup**: Objeto beneficioso que aparece en pantalla y otorga un efecto temporal al ser cortado.
- **treeHealth**: Variable numérica entera en el rango [0, 100] que representa la salud del Árbol.
- **score**: Variable numérica entera que acumula los puntos del jugador durante la partida.
- **highScore**: Valor numérico persistido en `localStorage` que representa la mejor puntuación histórica del jugador.
- **HUD**: Interfaz de usuario superpuesta durante el juego que muestra `treeHealth`, `score` y estado de powerups activos.
- **Escena**: Pantalla independiente del juego (menú, tutorial, juego, game over, leaderboard, sobre el cambio climático).
- **Spawn**: Proceso de creación y aparición de un Enemigo o Powerup en pantalla.
- **Partícula**: Efecto visual efímero generado al cortar un Enemigo o al recibir daño el Árbol.
- **Oleada**: Conjunto continuo de Enemigos generados con un intervalo de Spawn que disminuye con el tiempo.

---

## Requisitos

---

### Requisito 1: Árbol central y condición de derrota

**Historia de usuario:** Como jugador, quiero que el árbol tenga una salud visible y que el juego termine cuando llegue a cero, para que la protección del árbol sea el objetivo claro de cada partida.

#### Criterios de aceptación

1. THE Sistema SHALL inicializar `treeHealth` con el valor entero 100 al comenzar cada partida.
2. THE Sistema SHALL mantener `treeHealth` como un número entero en el rango [0, 100] en todo momento durante la partida.
3. IF `treeHealth` es evaluado y resulta ser `NaN`, `undefined` o `null`, THEN THE Sistema SHALL restablecer `treeHealth` a 0 y activar la condición de game over.
4. WHEN un Enemigo alcanza el centro de la pantalla sin haber sido cortado, THE Sistema SHALL reducir `treeHealth` en el valor de daño definido para ese tipo de Enemigo y destruir la entidad del Enemigo.
5. WHEN `treeHealth` llega a un valor menor o igual a 0, THE Sistema SHALL activar la transición a la escena de game over de forma inmediata.
6. THE HUD SHALL mostrar el valor actual de `treeHealth` de forma visible y actualizada en tiempo real durante la partida.
7. WHEN el Árbol recibe daño, THE Sistema SHALL reproducir un efecto visual de flash rojo sobre el Árbol con una duración de 300ms.

---

### Requisito 2: Sistema de slicing (corte de enemigos)

**Historia de usuario:** Como jugador, quiero poder cortar enemigos deslizando el puntero o el dedo sobre ellos, para eliminarlos antes de que lleguen al árbol.

#### Criterios de aceptación

1. WHEN el jugador inicia un gesto de deslizamiento (mousedown o touchstart) y lo arrastra sobre un Enemigo activo, THE Sistema SHALL registrar el corte y marcar al Enemigo como `sliced = true`.
2. WHEN un Enemigo es marcado como `sliced`, THE Sistema SHALL destruir la entidad del Enemigo, incrementar `score` en el valor de puntos definido para ese tipo, y reproducir el efecto de partículas verdes.
3. THE Sistema SHALL garantizar que cada Enemigo solo pueda ser cortado una vez por gesto (propiedad `sliced` previene cortes duplicados).
4. WHEN el jugador corta un Enemigo, THE Sistema SHALL reproducir el efecto de sonido de corte (SFX tipo `slice`).
5. THE Sistema SHALL soportar tanto eventos de ratón (desktop) como eventos táctiles (móvil) para el gesto de slicing.
6. IF el gesto de deslizamiento no intersecta con ningún Enemigo activo, THEN THE Sistema SHALL ignorar el gesto sin modificar el estado del juego.

---

### Requisito 3: Tipos de enemigos

**Historia de usuario:** Como jugador, quiero enfrentarme a distintos tipos de enemigos con comportamientos diferentes, para que el juego sea variado y progresivamente desafiante.

#### Criterios de aceptación

1. THE Sistema SHALL implementar cinco tipos de Enemigo: Humo, Talador, Barril_Tóxico, Fábrica y Toxic_Blob.
2. WHEN el Sistema genera un Enemigo de tipo Humo, THE Sistema SHALL asignarle una velocidad de movimiento en el rango [80, 120] píxeles por segundo hacia el centro.
3. WHEN el Sistema genera un Enemigo de tipo Talador, THE Sistema SHALL asignarle una trayectoria directa al centro y una velocidad en el rango [140, 180] píxeles por segundo.
4. WHEN el Sistema genera un Enemigo de tipo Barril_Tóxico, THE Sistema SHALL asignarle un valor de `health` de 2 (requiere dos cortes para ser destruido) y una velocidad en el rango [100, 140] píxeles por segundo.
5. WHEN el Sistema genera un Enemigo de tipo Fábrica, THE Sistema SHALL asignarle una escala visual 1.5 veces mayor que los enemigos estándar y un daño al Árbol de 20 puntos al llegar al centro.
6. WHEN el Sistema genera un Enemigo de tipo Toxic_Blob, THE Sistema SHALL asignarle un movimiento errático con variación lateral aleatoria de ±30 píxeles cada 0.5 segundos.
7. THE Sistema SHALL asignar a cada tipo de Enemigo un sprite visual diferente cargado desde la carpeta `/assets/Enemies/`.
8. WHEN un Enemigo sale de los límites de la pantalla sin haber sido cortado, THE Sistema SHALL destruir la entidad y aplicar el daño correspondiente al Árbol.

---

### Requisito 4: Sistema de puntuación

**Historia de usuario:** Como jugador, quiero acumular puntos al cortar enemigos y ver mi puntuación en pantalla, para tener un objetivo de mejora continua.

#### Criterios de aceptación

1. THE Sistema SHALL inicializar `score` con el valor entero 0 al comenzar cada partida.
2. THE Sistema SHALL mantener `score` como un número entero mayor o igual a 0 en todo momento.
3. WHEN el jugador corta un Enemigo de tipo Humo, THE Sistema SHALL incrementar `score` en 10 puntos.
4. WHEN el jugador corta un Enemigo de tipo Talador, THE Sistema SHALL incrementar `score` en 15 puntos.
5. WHEN el jugador corta un Enemigo de tipo Barril_Tóxico con el segundo corte (destrucción), THE Sistema SHALL incrementar `score` en 25 puntos.
6. WHEN el jugador corta un Enemigo de tipo Fábrica, THE Sistema SHALL incrementar `score` en 30 puntos.
7. WHEN el jugador corta un Enemigo de tipo Toxic_Blob, THE Sistema SHALL incrementar `score` en 20 puntos.
8. THE HUD SHALL mostrar el valor actual de `score` actualizado en tiempo real durante la partida.

---

### Requisito 5: Sistema de powerups

**Historia de usuario:** Como jugador, quiero recoger powerups cortándolos para obtener ventajas temporales, para poder sobrevivir más tiempo en partidas difíciles.

#### Criterios de aceptación

1. THE Sistema SHALL implementar cinco tipos de Powerup: Slice_Grande, Velocidad_Ataque, Explosión, Regeneración y Slow.
2. WHEN el jugador corta un Powerup de tipo Slice_Grande, THE Sistema SHALL aumentar el área de detección del gesto de slicing en un 50% durante 5 segundos.
3. WHEN el jugador corta un Powerup de tipo Velocidad_Ataque, THE Sistema SHALL reducir el tiempo de cooldown entre cortes a 0 durante 4 segundos.
4. WHEN el jugador corta un Powerup de tipo Explosión, THE Sistema SHALL destruir todos los Enemigos activos en pantalla en ese momento y reproducir un efecto visual de explosión.
5. WHEN el jugador corta un Powerup de tipo Regeneración, THE Sistema SHALL incrementar `treeHealth` en 15 puntos sin superar el valor máximo de 100.
6. WHEN el jugador corta un Powerup de tipo Slow, THE Sistema SHALL reducir la velocidad de todos los Enemigos activos al 50% durante 4 segundos.
7. WHEN un Powerup sale de los límites de la pantalla sin haber sido cortado, THE Sistema SHALL destruir la entidad sin aplicar ningún efecto ni daño al Árbol.
8. THE Sistema SHALL reproducir el SFX de tipo `powerup` al cortar cualquier Powerup.

---

### Requisito 6: Progresión de dificultad

**Historia de usuario:** Como jugador, quiero que el juego se vuelva progresivamente más difícil con el tiempo, para que cada partida sea un reto creciente.

#### Criterios de aceptación

1. THE Sistema SHALL incrementar la tasa de Spawn de Enemigos de forma progresiva a medida que aumenta el tiempo de partida (`elapsed`).
2. WHEN `elapsed` supera 20 segundos, THE Sistema SHALL reducir el intervalo base de Spawn en un 10% por cada 20 segundos adicionales transcurridos.
3. THE Sistema SHALL calcular el multiplicador de dificultad como `Math.pow(1.1, Math.floor(elapsed / 20))`.
4. WHEN `elapsed` supera 60 segundos, THE Sistema SHALL habilitar el Spawn del tipo de Enemigo Fábrica.
5. THE Sistema SHALL mantener el número máximo de entidades activas en pantalla en 15 para preservar el rendimiento de 60fps.
6. WHILE el número de entidades activas supera 15, THE Sistema SHALL pausar el Spawn de nuevos Enemigos hasta que el número descienda por debajo de 15.

---

### Requisito 7: Persistencia del high score

**Historia de usuario:** Como jugador, quiero que mi mejor puntuación se guarde entre sesiones, para poder intentar superarla en futuras partidas.

#### Criterios de aceptación

1. WHEN la partida termina (game over), THE Sistema SHALL comparar `score` con el valor almacenado en `localStorage` bajo la clave `guardabosques-high-score`.
2. IF `score` es mayor que el valor almacenado, THEN THE Sistema SHALL sobrescribir el valor en `localStorage` con el nuevo `score`.
3. WHEN el jugador inicia el juego, THE Sistema SHALL leer el valor de `localStorage` bajo la clave `guardabosques-high-score` y mostrarlo en la pantalla de menú y en la pantalla de game over.
4. IF el valor leído de `localStorage` no es un número válido, THEN THE Sistema SHALL tratar el high score como 0.
5. THE Sistema SHALL usar `localStorage` exclusivamente para persistir el high score, sin almacenar ningún otro estado de partida.

---

### Requisito 8: Pantalla de menú principal

**Historia de usuario:** Como jugador, quiero ver una pantalla de inicio clara con opciones de jugar y aprender, para poder comenzar una partida o acceder a información sobre el cambio climático.

#### Criterios de aceptación

1. THE Sistema SHALL mostrar la pantalla de menú principal al iniciar la aplicación.
2. THE Sistema SHALL mostrar en el menú: el nombre del juego, el high score actual, un botón "Jugar", un botón "Cómo jugar" y un botón "Sobre el cambio climático".
3. WHEN el jugador pulsa el botón "Jugar", THE Sistema SHALL iniciar una nueva partida y transicionar a la escena de juego.
4. WHEN el jugador pulsa el botón "Cómo jugar", THE Sistema SHALL transicionar a la escena de tutorial.
5. WHEN el jugador pulsa el botón "Sobre el cambio climático", THE Sistema SHALL transicionar a la escena educativa sobre cambio climático.
6. THE Sistema SHALL soportar el modo oscuro (dark mode) con un botón de alternancia visible en el menú.

---

### Requisito 9: Tutorial (Cómo jugar)

**Historia de usuario:** Como jugador nuevo, quiero ver un tutorial claro antes de jugar, para entender las mecánicas en menos de 10 segundos.

#### Criterios de aceptación

1. THE Sistema SHALL mostrar el tutorial en un máximo de 6 páginas navegables con botones "Anterior" y "Siguiente".
2. THE Sistema SHALL incluir en el tutorial: explicación del gesto de slicing, tipos de enemigos, tipos de powerups, el sistema de salud del Árbol y el objetivo del juego.
3. WHEN el jugador pulsa el botón de cerrar (✕) en el tutorial, THE Sistema SHALL regresar a la pantalla de menú principal.
4. THE Sistema SHALL mostrar el número de página actual en formato `N/6` durante la navegación del tutorial.

---

### Requisito 10: Pantalla de game over

**Historia de usuario:** Como jugador, quiero ver una pantalla de game over con mi puntuación final y opciones de acción, para poder reintentar o explorar contenido adicional.

#### Criterios de aceptación

1. WHEN `treeHealth` llega a 0, THE Sistema SHALL transicionar a la escena de game over mostrando el `score` final y el `highScore`.
2. THE Sistema SHALL mostrar en la pantalla de game over: puntuación final, high score, un botón "Jugar de nuevo" y un botón "Menú".
3. WHEN el jugador pulsa "Jugar de nuevo", THE Sistema SHALL iniciar una nueva partida con `treeHealth = 100` y `score = 0`.
4. WHEN el jugador pulsa "Menú", THE Sistema SHALL transicionar a la pantalla de menú principal.
5. THE Sistema SHALL mostrar en la pantalla de game over un botón "Sobre el cambio climático" que transicione a la escena educativa.

---

### Requisito 11: Escena educativa sobre el cambio climático

**Historia de usuario:** Como jugador, quiero acceder a información sobre el cambio climático desde el juego, para aprender sobre el tema de forma entretenida.

#### Criterios de aceptación

1. THE Sistema SHALL mostrar la escena educativa con un mínimo de 5 páginas de contenido sobre cambio climático, navegables con botones "Anterior" y "Siguiente".
2. THE Sistema SHALL incluir en cada página un título y un cuerpo de texto informativo relacionado con el impacto ambiental y la contaminación.
3. WHEN el jugador pulsa el botón de cerrar (✕) en la escena educativa, THE Sistema SHALL regresar a la pantalla desde la que fue invocada (menú o game over).
4. THE Sistema SHALL mostrar el número de página actual en formato `N/5` durante la navegación de la escena educativa.

---

### Requisito 12: Pausa y configuración durante la partida

**Historia de usuario:** Como jugador, quiero poder pausar el juego y ajustar el volumen en cualquier momento, para tener control sobre mi experiencia de juego.

#### Criterios de aceptación

1. THE Sistema SHALL mostrar un botón de pausa (⏸) visible en el HUD durante la partida.
2. WHEN el jugador pulsa el botón de pausa, THE Sistema SHALL detener el movimiento de todos los Enemigos y Powerups activos y mostrar un overlay de pausa con opciones "Continuar" y "Salir".
3. WHEN el jugador pulsa "Continuar" en el overlay de pausa, THE Sistema SHALL reanudar el juego desde el estado exacto en que fue pausado.
4. WHEN el jugador pulsa "Salir" en el overlay de pausa, THE Sistema SHALL terminar la partida y transicionar a la pantalla de game over.
5. THE Sistema SHALL mostrar un botón de configuración (⚙) en el HUD que permita ajustar el volumen de SFX en el rango [0%, 100%] en incrementos de 10%.
6. WHEN la aplicación pierde el foco (tab oculto o cambio de app), THE Sistema SHALL pausar automáticamente la partida.

---

### Requisito 13: Retroalimentación visual y sonora

**Historia de usuario:** Como jugador, quiero recibir feedback visual y sonoro claro en cada acción importante, para que el juego se sienta responsivo y satisfactorio.

#### Criterios de aceptación

1. WHEN el jugador corta un Enemigo, THE Sistema SHALL generar un efecto de partículas verdes en la posición del corte con un mínimo de 6 partículas y una duración de 0.6 segundos.
2. WHEN el Árbol recibe daño, THE Sistema SHALL aplicar un flash rojo sobre el Árbol con una duración de 300ms.
3. WHEN el jugador corta un Powerup, THE Sistema SHALL reproducir el SFX de tipo `powerup` y mostrar un mensaje de toast con el nombre del efecto activado.
4. WHEN un Enemigo llega al centro sin ser cortado, THE Sistema SHALL reproducir un efecto visual de impacto en el Árbol.
5. THE Sistema SHALL mantener una tasa de renderizado objetivo de 60fps limitando el número de entidades activas y partículas simultáneas.

---

### Requisito 14: Arquitectura modular y reutilización del proyecto base

**Historia de usuario:** Como desarrollador, quiero que el código esté organizado en módulos claros y reutilice la arquitectura del proyecto base, para facilitar el mantenimiento y la extensión del juego.

#### Criterios de aceptación

1. THE Sistema SHALL organizar el código en módulos separados para: lógica de jugador, lógica de enemigos, estado del juego (`gameState`), y UI/HUD.
2. THE Sistema SHALL centralizar las variables de estado críticas (`treeHealth`, `score`, `gameOver`) en un único módulo de `gameState`.
3. THE Sistema SHALL reutilizar el motor Kaplay, la estructura de escenas, el sistema de pausa, el sistema de volumen, el dark mode y la arquitectura de Vite del proyecto base `mariachi-vs-inflation`.
4. THE Sistema SHALL ubicar el proyecto en la carpeta `guardabosques/` independiente del proyecto base.
5. THE Sistema SHALL cargar todos los sprites desde la carpeta `guardabosques/public/assets/` con rutas relativas al proyecto.
6. IF una función de actualización de estado recibe un valor no numérico para `treeHealth` o `score`, THEN THE Sistema SHALL registrar un error en consola y mantener el valor anterior sin modificarlo.
