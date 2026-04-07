# Plan de Implementación: Guardabosques

## Visión General

Crear el juego `guardabosques/` como proyecto independiente basado en la arquitectura de `mariachi-vs-inflation-master/`. El jugador protege un árbol sagrado cortando enemigos contaminantes con mecánica de slicing radial. Se reutiliza el motor Kaplay v3001.0.19 con Vite.

## Tareas

- [x] 1. Scaffolding del proyecto
  - Crear `guardabosques/package.json` con dependencias: `kaplay`, `vite` (sin `@neondatabase/serverless`)
  - Crear `guardabosques/index.html` adaptado del base: cambiar título a "Guardabosques", color de fondo `#0a1a0a`, mantener loading screen y `<script type="module" src="/src/main.js">`
  - Crear estructura de carpetas: `guardabosques/src/`, `guardabosques/public/assets/Enemies/`, `guardabosques/public/assets/PowerUps/`
  - _Requisitos: 14.3, 14.4, 14.5_

- [x] 2. Módulo de internacionalización
  - [x] 2.1 Crear `guardabosques/src/i18n.js` con objeto `i18n` para ES/EN
    - Reemplazar todas las claves BTC/inflación por claves ecológicas (menú, tutorial, HUD, game over, escena climática)
    - Incluir claves: `menu_play`, `menu_how_to_play`, `menu_climate`, `game_tree_health`, `game_score`, `gameover_title`, `gameover_play_again`, `gameover_menu`, `gameover_climate`, `climate_title`, `tutorial_*` (6 páginas), `toast_*` para powerups
    - Exportar también `climateTips` (array de frases educativas sobre cambio climático en ES/EN)
    - _Requisitos: 8.2, 9.2, 11.2_

- [x] 3. Estructura base de main.js y constantes del juego
  - [x] 3.1 Crear `guardabosques/src/main.js` con secciones: `ASSETS_TO_LOAD`, `preloadImages()`, `initGame()`, `createScenes()`
    - Copiar y adaptar `preloadImages()` e `initGame()` del base: cambiar sprites cargados a los de guardabosques (`background`, `background-night`, `logo`, `tree`, enemigos, powerups)
    - Configurar Kaplay: `width:480, height:854, letterbox:true, touchToMouse:true`
    - _Requisitos: 14.1, 14.3_
  - [x] 3.2 Definir `ENEMY_TYPES` y `POWERUP_TYPES` como constantes dentro de `createScenes()`
    - `ENEMY_TYPES`: humo (speed [80,120], health 1, damage 10, points 10), talador (speed [140,180], health 1, damage 10, points 15), barril (speed [100,140], health 2, damage 10, points 25), fabrica (speed [80,110], health 1, damage 20, points 30, scale 1.5), toxic_blob (speed [90,130], health 1, damage 10, points 20, erratic true)
    - `POWERUP_TYPES`: slice_grande (effect sliceRadius, duration 5), velocidad (effect attackSpeed, duration 4), explosion (effect clearAll), regeneracion (effect healTree, amount 15), slow (effect slowEnemies, duration 4)
    - _Requisitos: 3.1–3.6, 5.1–5.6_
  - [ ]* 3.3 Escribir tests unitarios para ENEMY_TYPES y POWERUP_TYPES
    - Verificar que cada tipo tiene los campos requeridos (speed, health, damage, points)
    - Verificar que `barril.health === 2` y `fabrica.scale === 1.5`
    - _Requisitos: 3.1, 3.4, 3.5_

- [x] 4. gameState y funciones de árbol
  - [x] 4.1 Implementar variables de `gameState` y funciones `damageTree()` y `healTree()`
    - Variables: `treeHealth=100`, `score=0`, `elapsed=0`, `paused=false`, timers de powerup, `spawnTimer=0`, `activeEntities=0`
    - `damageTree(amount)`: validar tipo numérico, `treeHealth = Math.max(0, treeHealth - amount)`, flash rojo 300ms, llamar `endGame()` si `treeHealth <= 0`
    - `healTree(amount)`: validar tipo numérico, `treeHealth = Math.min(100, treeHealth + amount)`
    - Guardia de corrupción en `onUpdate`: si `treeHealth` es NaN/undefined → `treeHealth=0; endGame()`
    - _Requisitos: 1.1, 1.2, 1.3, 1.5, 1.7, 5.5, 14.2, 14.6_
  - [ ]* 4.2 Escribir property test — Propiedad 1: Invariante de treeHealth
    - **Propiedad 1: Para cualquier secuencia de `damageTree(n)` y `healTree(n)`, `treeHealth` permanece en [0, 100]**
    - **Valida: Requisitos 1.2, 5.5**
    - Usar `fc.array(fc.record({ op: fc.constantFrom('damage','heal'), amount: fc.integer({min:0,max:50}) }))` con 100 iteraciones
  - [ ]* 4.3 Escribir property test — Propiedad 4: Trigger de game over
    - **Propiedad 4: Para cualquier `treeHealth` en (0,100] y daño `d >= treeHealth`, después de `damageTree(d)` el estado es game over**
    - **Valida: Requisito 1.5**
    - Usar `fc.integer({min:1,max:100})` para health y `fc.integer({min:0,max:100})` para damage con 100 iteraciones

- [x] 5. Sistema de puntuación
  - [x] 5.1 Implementar lógica de `score` con puntos por tipo de enemigo
    - Inicializar `score=0` al inicio de partida
    - Incrementar según tipo: humo +10, talador +15, barril +25 (al segundo corte), fabrica +30, toxic_blob +20
    - Actualizar texto del HUD en tiempo real tras cada incremento
    - _Requisitos: 4.1–4.8_
  - [ ]* 5.2 Escribir property test — Propiedad 2: Score no negativo
    - **Propiedad 2: Para cualquier secuencia de cortes de enemigos, `score` es siempre >= 0**
    - **Valida: Requisito 4.2**
    - Usar `fc.array(fc.constantFrom('humo','talador','barril','fabrica','toxic_blob'))` con 100 iteraciones

- [x] 6. Sistema de slicing
  - [x] 6.1 Implementar `distPointToSegment()` y `trySliceBetween()` (reutilizados del base)
    - Copiar `distPointToSegment()` sin modificaciones desde `mariachi-vs-inflation-master/src/main.js`
    - Adaptar `trySliceBetween(prevPos, currPos)`: radio base 35px, multiplicado por `sliceRadiusBonus`
    - Registrar eventos `onMouseDown`/`onMouseMove`/`onTouchStart`/`onTouchMove` para actualizar `prevPos` y `currPos`
    - _Requisitos: 2.1, 2.3, 2.5, 2.6_
  - [x] 6.2 Implementar `sliceObject(obj)` con lógica de corte para enemigos y powerups
    - Marcar `obj.sliced = true` inmediatamente para prevenir doble corte
    - Para enemigos: decrementar `health`; si `health > 0` (barril primer corte) resetear `sliced=false` y retornar; si `health <= 0` sumar puntos, destruir entidad, decrementar `activeEntities`, llamar `spawnParticles()`
    - Para powerups: llamar `applyPowerup(obj.powerupType)`, destruir entidad, decrementar `activeEntities`
    - Llamar `playSFX('slice')` al cortar enemigo, `playSFX('powerup')` al cortar powerup
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 3.4, 5.8_
  - [ ]* 6.3 Escribir property test — Propiedad 3: Idempotencia del corte
    - **Propiedad 3: Para cualquier enemigo con `sliced=true`, intentar cortarlo de nuevo no modifica `score` ni `activeEntities`**
    - **Valida: Requisito 2.3**
    - Usar `fc.constantFrom('humo','talador','fabrica','toxic_blob')` y `fc.integer({min:0,max:1000})` para score inicial con 100 iteraciones

- [x] 7. Spawn y movimiento de enemigos
  - [x] 7.1 Implementar `spawnEnemy(typeName)` con spawn en borde aleatorio
    - Verificar `activeEntities < 15` antes de crear; si no, retornar inmediatamente
    - Calcular borde aleatorio (0=top, 1=right, 2=bottom, 3=left) y posición `(x, y)` fuera de pantalla
    - Calcular vector normalizado hacia centro `(240, 427)`, aplicar `difficultyMult()` a la velocidad
    - Crear entidad Kaplay con componentes: `sprite`, `pos`, `anchor('center')`, `scale`, `area`, y propiedades custom (`kind`, `enemyType`, `health`, `damage`, `points`, `speed`, `vx`, `vy`, `sliced:false`, `erratic`, `erraticTimer`)
    - Incrementar `activeEntities`
    - _Requisitos: 3.1–3.7, 6.5, 6.6_
  - [x] 7.2 Implementar `onUpdate('enemy')` con movimiento radial y detección de llegada al centro
    - Si `paused` retornar
    - Aplicar `speedMult = slowActive ? 0.5 : 1.0`
    - Actualizar `pos.x += vx * speedMult * dt`, `pos.y += vy * speedMult * dt`
    - Para `erratic=true` (toxic_blob): cada 0.5s aplicar variación lateral ±30px perpendicular al vector de movimiento y re-normalizar velocidad
    - Si distancia al centro `< 40`: llamar `damageTree(enemy.damage)`, destruir entidad, decrementar `activeEntities`
    - _Requisitos: 3.2, 3.3, 3.4, 3.5, 3.6, 1.4_
  - [ ]* 7.3 Escribir property test — Propiedad 5: Movimiento hacia el centro
    - **Propiedad 5: Para cualquier enemigo en posición (x,y) ≠ (240,427), tras un frame de actualización la distancia al centro es estrictamente menor**
    - **Valida: Requisitos 3.2, 3.3, 3.4, 3.5, 3.6**
    - Usar `fc.record({ x: fc.float({min:-40,max:520}), y: fc.float({min:-40,max:894}) })` filtrando posiciones en el centro con 100 iteraciones
  - [ ]* 7.4 Escribir property test — Propiedad 6: Cap de entidades activas
    - **Propiedad 6: Para cualquier número de intentos de spawn, `activeEntities` nunca supera 15**
    - **Valida: Requisitos 6.5, 6.6**
    - Usar `fc.integer({min:0,max:100})` para número de intentos de spawn con 100 iteraciones

- [x] 8. Progresión de dificultad y spawn automático
  - [x] 8.1 Implementar `difficultyMult()` y loop de spawn automático en `onUpdate`
    - `difficultyMult()`: `Math.pow(1.1, Math.floor(elapsed / 20))`
    - En `onUpdate`: incrementar `elapsed += dt`, incrementar `spawnTimer += dt`
    - `spawnInterval = 2.0 / difficultyMult()`; cuando `spawnTimer >= spawnInterval` → resetear timer, seleccionar tipo aleatorio (excluir `fabrica` si `elapsed < 60`), llamar `spawnEnemy()`
    - _Requisitos: 6.1, 6.2, 6.3, 6.4_
  - [x] 8.2 Implementar `spawnPowerup()` con spawn periódico aleatorio
    - Spawn de powerup cada ~10 segundos con tipo aleatorio de `POWERUP_TYPES`
    - Misma lógica de borde aleatorio que `spawnEnemy()`; powerup se mueve hacia el centro a velocidad fija 80px/s
    - Si powerup sale de pantalla sin ser cortado: destruir entidad, decrementar `activeEntities`, sin daño al árbol
    - _Requisitos: 5.7_

- [x] 9. Sistema de powerups
  - [x] 9.1 Implementar `applyPowerup(typeName)` con los 5 efectos
    - `sliceRadius`: `sliceRadiusBonus=1.5`, `sliceRadiusTimer=5`; en `onUpdate` decrementar timer, resetear a 1.0 al expirar
    - `attackSpeed`: `attackSpeedBonus=true`, `attackSpeedTimer=4`; en `onUpdate` decrementar timer, resetear al expirar
    - `clearAll`: iterar `k.get('enemy')`, destruir cada uno, decrementar `activeEntities`, efecto visual de explosión
    - `healTree`: llamar `healTree(15)`
    - `slowEnemies`: `slowActive=true`, `slowTimer=4`; en `onUpdate` decrementar timer, resetear al expirar
    - Mostrar toast con nombre del efecto activado tras cada powerup
    - _Requisitos: 5.2, 5.3, 5.4, 5.5, 5.6, 5.8, 13.3_

- [ ] 10. Checkpoint — Verificar mecánicas core
  - Asegurar que todos los tests pasen. Verificar manualmente: spawn de enemigos desde bordes, movimiento hacia centro, corte con mouse/touch, daño al árbol, powerups activos. Consultar al usuario si hay dudas.

- [x] 11. Persistencia del high score
  - [x] 11.1 Implementar `loadHighScore()`, `saveHighScore(newScore)` y `endGame()`
    - `HS_KEY = 'guardabosques-high-score'`
    - `loadHighScore()`: `parseInt(localStorage.getItem(HS_KEY), 10)`, retornar 0 si NaN; envolver en try/catch para localStorage no disponible
    - `saveHighScore(newScore)`: solo sobrescribir si `newScore > loadHighScore()`
    - `endGame()`: llamar `saveHighScore(score)`, llamar `k.go('gameover', { score, highScore: loadHighScore() })`
    - _Requisitos: 7.1, 7.2, 7.3, 7.4, 7.5_
  - [ ]* 11.2 Escribir property test — Propiedad 7: Persistencia del high score
    - **Propiedad 7: Para cualquier `score > highScore` almacenado, después de `endGame()` el valor en localStorage es igual a `score`**
    - **Valida: Requisitos 7.1, 7.2**
    - Usar `fc.integer({min:0,max:10000})` para currentHigh y newScore con 100 iteraciones

- [x] 12. HUD y retroalimentación visual/sonora
  - [x] 12.1 Implementar HUD dentro de `scene('game')`
    - Mostrar `treeHealth` (texto `🌳 ${treeHealth}`) y `score` (texto `Score: ${score}`) actualizados en tiempo real
    - Botón de pausa (⏸) y botón de configuración (⚙) visibles durante la partida
    - _Requisitos: 1.6, 4.8, 12.1_
  - [x] 12.2 Implementar `spawnParticles(x, y)` y efecto de flash rojo en el árbol
    - `spawnParticles`: crear mínimo 6 partículas verdes en posición del corte, duración 0.6s, dispersión aleatoria
    - Flash rojo: ya implementado en `damageTree()` (tarea 4.1); verificar integración con sprite del árbol
    - _Requisitos: 13.1, 13.2_
  - [x] 12.3 Implementar `playSFX()` con WebAudio (reutilizado del base) y sistema de toasts
    - Copiar `playSFX()` del base sin modificaciones
    - Copiar `showToast(msg)` del base sin modificaciones
    - _Requisitos: 2.4, 5.8, 13.3, 13.4_

- [x] 13. Sistema de pausa y configuración
  - [x] 13.1 Implementar overlay de pausa y botón de configuración
    - Al pulsar ⏸: `paused=true`, mostrar overlay con botones "Continuar" y "Salir"
    - "Continuar": `paused=false`, ocultar overlay
    - "Salir": llamar `endGame()`
    - Botón ⚙: mostrar slider de volumen SFX [0%, 100%] en incrementos de 10%
    - Auto-pausa cuando `document.visibilitychange` → hidden
    - _Requisitos: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [x] 14. Escenas de menú, tutorial y game over
  - [x] 14.1 Implementar `scene('menu')`
    - Mostrar: nombre del juego, high score actual (`loadHighScore()`), botón "Jugar", botón "Cómo jugar", botón "Sobre el cambio climático"
    - Botón dark mode toggle (☀️/🌙) y botón de idioma (ES/EN)
    - Sin lógica de save state de partida (eliminar `mariachi-game-state`)
    - _Requisitos: 8.1–8.6_
  - [x] 14.2 Implementar `scene('tutorial')` con 6 páginas navegables
    - Página 1: gesto de slicing; Página 2: objetivo y árbol; Página 3: tipos de enemigos; Página 4: tipos de powerups; Página 5: sistema de salud del árbol; Página 6: tips
    - Botones "Anterior" / "Siguiente", indicador `N/6`, botón ✕ regresa al menú
    - _Requisitos: 9.1, 9.2, 9.3, 9.4_
  - [x] 14.3 Implementar `scene('gameover')` simplificada
    - Mostrar: score final, high score, botón "Jugar de nuevo" (→ `k.go('game')`), botón "Menú" (→ `k.go('menu')`), botón "Sobre el cambio climático" (→ `k.go('climateinfo', {from:'gameover'})`)
    - Sin leaderboard API, sin input de nombre, sin BTC counter
    - _Requisitos: 10.1–10.5_

- [x] 15. Escena educativa sobre cambio climático
  - [x] 15.1 Implementar `scene('climateinfo')` con 5 páginas navegables
    - Cada página: título + cuerpo de texto sobre impacto ambiental y contaminación
    - Botones "Anterior" / "Siguiente", indicador `N/5`, botón ✕ regresa a la escena de origen (`from` param: `'menu'` o `'gameover'`)
    - _Requisitos: 11.1, 11.2, 11.3, 11.4_

- [x] 16. Checkpoint final — Asegurar que todos los tests pasen
  - Ejecutar `vitest --run` en `guardabosques/`. Verificar las 7 propiedades PBT y los tests unitarios. Consultar al usuario si hay dudas antes de cerrar.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los tests de propiedad usan `fast-check` con mínimo 100 iteraciones cada uno
- Los tests unitarios y de propiedad son complementarios, no redundantes
- El proyecto no incluye leaderboard API ni dependencias de base de datos
