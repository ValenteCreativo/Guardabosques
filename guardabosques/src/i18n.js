// i18n translations for Guardabosques
export const i18n = {
  es: {
    // Menú
    menu_play: 'JUGAR',
    menu_how_to_play: 'CÓMO JUGAR',
    menu_climate: 'SOBRE EL CAMBIO CLIMÁTICO',
    menu_high_score: (n) => `Mejor puntuación: ${n}`,

    // Tutorial
    tutorial_next: 'SIGUIENTE',
    tutorial_back: 'VOLVER',

    tutorial_0_title: 'CÓMO JUGAR',
    tutorial_0_line1: 'Desliza el dedo o el mouse',
    tutorial_0_line2: 'sobre los enemigos para cortarlos.',
    tutorial_0_line3: '¡Protege el árbol del centro!',

    tutorial_1_title: 'OBJETIVO',
    tutorial_1_line1: 'Los enemigos avanzan hacia el árbol.',
    tutorial_1_line2: 'Córtalos antes de que lleguen.',
    tutorial_1_line3: 'Si tocan el árbol, le quitan salud.',
    tutorial_1_line4: 'El árbol tiene 100 de salud. Si llega a 0, pierdes.',

    tutorial_2_title: 'ENEMIGOS',
    tutorial_2_humo:  'Humo — lento',
    tutorial_2_talador: 'Talador — rápido',
    tutorial_2_barril: 'Barril — 2 cortes',
    tutorial_2_fabrica: 'Fábrica — quita más salud',
    tutorial_2_blob: 'Toxic Blob — errático',

    tutorial_3_title: 'POWERUPS',
    tutorial_3_slice: 'Corte grande',
    tutorial_3_empuje: 'Empuje',
    tutorial_3_explosion: 'Explosión',
    tutorial_3_regen: 'Regeneración',
    tutorial_3_slow: 'Slow',

    tutorial_4_title: 'POWERUPS — EFECTOS',
    tutorial_4_line1: '🌿 Corte grande: área de corte más amplia',
    tutorial_4_line2: '💨 Empuje: aleja a todos los enemigos del árbol',
    tutorial_4_line3: '💥 Explosión: elimina todos los enemigos en pantalla',
    tutorial_4_line4: '🌱 Regeneración: recupera salud del árbol',
    tutorial_4_line5: '❄ Slow: los enemigos se mueven más despacio',

    tutorial_5_title: 'TIPS',
    tutorial_5_line1: 'Corta varios enemigos de un solo tajo para combos.',
    tutorial_5_line2: 'Los powerups también se cortan para activarlos.',
    tutorial_5_line3: 'La dificultad aumenta con el tiempo.',

    // HUD del juego
    game_score: 'Score',
    game_tree_health: 'Árbol',
    game_pause: 'PAUSA',
    game_pause_continue: 'CONTINUAR',
    game_pause_quit: 'ABANDONAR',

    // Configuración
    settings_title: 'CONFIGURACIÓN',
    settings_volume: 'Volumen SFX',
    settings_mute: 'Mute',
    settings_toggle: 'Toggle',

    // Toasts
    toast_combo_x2: '🔥 COMBO x2 +20',
    toast_combo_x3: '🔥🔥 COMBO x3 +40',
    toast_combo_x4: '🔥🔥🔥 COMBO x4 +80',
    toast_slice_grande: '🌿 SLICE GRANDE (5s)',
    toast_empuje: '💨 ¡EMPUJE! Enemigos alejados',
    toast_explosion: '💥 ¡EXPLOSIÓN! Pantalla limpia',
    toast_regeneracion: '🌱 REGENERACIÓN +15',
    toast_slow: '❄ SLOW (4s)',

    // Game Over
    gameover_title: 'GAME OVER',
    gameover_score: (n) => `Puntuación: ${n}`,
    gameover_high_score: (n) => `Mejor: ${n}`,
    gameover_play_again: 'JUGAR DE NUEVO',
    gameover_menu: 'MENÚ',
    gameover_climate: 'SOBRE EL CAMBIO CLIMÁTICO',

    // Escena climática
    climate_title: 'CAMBIO CLIMÁTICO',
    climate_subtitle: 'Aprende sobre el impacto ambiental',

    climate_1_title: '1) La crisis climática es real',
    climate_1_body: 'La temperatura global ha aumentado más de 1.1°C desde la era preindustrial. Los glaciares se derriten, el nivel del mar sube y los eventos climáticos extremos son cada vez más frecuentes. No es un fenómeno futuro: ya está ocurriendo.',

    climate_2_title: '2) La contaminación nos afecta a todos',
    climate_2_body: 'La quema de combustibles fósiles, la deforestación y la industria liberan gases de efecto invernadero que atrapan el calor en la atmósfera. La contaminación del aire causa millones de muertes prematuras cada año y afecta la salud de ecosistemas enteros.',

    climate_3_title: '3) Los bosques son pulmones del planeta',
    climate_3_body: 'Los bosques absorben CO₂, regulan el ciclo del agua y albergan más del 80% de la biodiversidad terrestre. Cada año se pierden millones de hectáreas por tala ilegal, incendios y expansión agrícola. Proteger los bosques es proteger la vida.',

    climate_4_title: '4) Podemos actuar hoy',
    climate_4_body: 'Reducir el consumo de energía, elegir transporte sostenible, apoyar energías renovables y reducir el desperdicio de alimentos son acciones concretas. Cada decisión individual suma. Los cambios de hábito a escala masiva transforman sistemas enteros.',

    climate_5_title: '5) Juntos hacemos la diferencia',
    climate_5_body: 'Los movimientos ciudadanos han logrado cambios de política ambiental en todo el mundo. La presión colectiva impulsa regulaciones más estrictas, inversión en tecnologías limpias y protección de áreas naturales. Tu voz y tus acciones importan.',

    // Leaderboard
    leaderboard_loading: 'Cargando...',
    leaderboard_error: 'Error al cargar',

    // Gameover extras
    gameover_save_prompt: 'Guarda tu puntuación:',
    gameover_input_placeholder: 'Toca para escribir...',
    gameover_saved_status: '✓ ¡Guardado!',
    gameover_error: 'Error al guardar',
    gameover_leaderboard: 'LEADERBOARD',
  },

  en: {
    // Menu
    menu_play: 'PLAY',
    menu_how_to_play: 'HOW TO PLAY',
    menu_climate: 'ABOUT CLIMATE CHANGE',
    menu_high_score: (n) => `Best score: ${n}`,

    // Tutorial
    tutorial_next: 'NEXT',
    tutorial_back: 'BACK',

    tutorial_0_title: 'HOW TO PLAY',
    tutorial_0_line1: 'Swipe your finger or mouse',
    tutorial_0_line2: 'over enemies to slice them.',
    tutorial_0_line3: 'Protect the tree in the center!',

    tutorial_1_title: 'OBJECTIVE',
    tutorial_1_line1: 'Enemies move toward the tree.',
    tutorial_1_line2: 'Slice them before they arrive.',
    tutorial_1_line3: 'If they touch the tree, it loses health.',
    tutorial_1_line4: 'The tree has 100 health. If it hits 0, you lose.',

    tutorial_2_title: 'ENEMIES',
    tutorial_2_humo:  'Smoke — slow',
    tutorial_2_talador: 'Logger — fast',
    tutorial_2_barril: 'Barrel — 2 cuts',
    tutorial_2_fabrica: 'Factory — more damage',
    tutorial_2_blob: 'Toxic Blob — erratic',

    tutorial_3_title: 'POWERUPS',
    tutorial_3_slice: 'Big Slice',
    tutorial_3_empuje: 'Push',
    tutorial_3_explosion: 'Explosion',
    tutorial_3_regen: 'Regeneration',
    tutorial_3_slow: 'Slow',

    tutorial_4_title: 'POWERUPS — EFFECTS',
    tutorial_4_line1: '🌿 Big Slice: wider cut area',
    tutorial_4_line2: '💨 Push: blasts all enemies away from the tree',
    tutorial_4_line3: '💥 Explosion: destroys all enemies on screen',
    tutorial_4_line4: '🌱 Regeneration: restores tree health',
    tutorial_4_line5: '❄ Slow: enemies move slower',

    tutorial_5_title: 'TIPS',
    tutorial_5_line1: 'Slice multiple enemies in one swipe for combos.',
    tutorial_5_line2: 'Powerups are also sliceable to activate them.',
    tutorial_5_line3: 'Difficulty increases over time.',

    // Game HUD
    game_score: 'Score',
    game_tree_health: 'Tree',
    game_pause: 'PAUSE',
    game_pause_continue: 'CONTINUE',
    game_pause_quit: 'QUIT',

    // Settings
    settings_title: 'SETTINGS',
    settings_volume: 'SFX Volume',
    settings_mute: 'Mute',
    settings_toggle: 'Toggle',

    // Toasts
    toast_combo_x2: '🔥 COMBO x2 +20',
    toast_combo_x3: '🔥🔥 COMBO x3 +40',
    toast_combo_x4: '🔥🔥🔥 COMBO x4 +80',
    toast_slice_grande: '🌿 BIG SLICE (5s)',
    toast_empuje: '💨 PUSH! Enemies blasted away',
    toast_explosion: '💥 EXPLOSION! Screen cleared',
    toast_regeneracion: '🌱 REGENERATION +15',
    toast_slow: '❄ SLOW (4s)',

    // Game Over
    gameover_title: 'GAME OVER',
    gameover_score: (n) => `Score: ${n}`,
    gameover_high_score: (n) => `Best: ${n}`,
    gameover_play_again: 'PLAY AGAIN',
    gameover_menu: 'MENU',
    gameover_climate: 'ABOUT CLIMATE CHANGE',

    // Climate scene
    climate_title: 'CLIMATE CHANGE',
    climate_subtitle: 'Learn about environmental impact',

    climate_1_title: '1) The climate crisis is real',
    climate_1_body: 'Global temperature has risen more than 1.1°C since the pre-industrial era. Glaciers are melting, sea levels are rising, and extreme weather events are becoming more frequent. This is not a future phenomenon — it is happening now.',

    climate_2_title: '2) Pollution affects us all',
    climate_2_body: 'Burning fossil fuels, deforestation, and industry release greenhouse gases that trap heat in the atmosphere. Air pollution causes millions of premature deaths each year and damages entire ecosystems.',

    climate_3_title: '3) Forests are the lungs of the planet',
    climate_3_body: 'Forests absorb CO₂, regulate the water cycle, and harbor more than 80% of terrestrial biodiversity. Millions of hectares are lost every year to illegal logging, fires, and agricultural expansion. Protecting forests means protecting life.',

    climate_4_title: '4) We can act today',
    climate_4_body: 'Reducing energy consumption, choosing sustainable transport, supporting renewable energy, and cutting food waste are concrete actions. Every individual decision adds up. Habit changes at scale transform entire systems.',

    climate_5_title: '5) Together we make a difference',
    climate_5_body: 'Citizen movements have achieved environmental policy changes worldwide. Collective pressure drives stricter regulations, investment in clean technologies, and protection of natural areas. Your voice and actions matter.',

    // Leaderboard
    leaderboard_loading: 'Loading...',
    leaderboard_error: 'Error loading',

    // Gameover extras
    gameover_save_prompt: 'Save your score:',
    gameover_input_placeholder: 'Tap to type...',
    gameover_saved_status: '✓ Saved!',
    gameover_error: 'Error saving',
    gameover_leaderboard: 'LEADERBOARD',
  }
};

// Educational climate tips shown during gameplay (max ~40 chars each)
export const climateTips = {
  es: [
    // Cambio climático
    'La Tierra se calienta cada año',
    'El CO₂ atrapa calor en la atmósfera',
    'Los glaciares se derriten hoy',
    'El nivel del mar sube cada año',
    'Los eventos extremos aumentan',
    'El clima ya cambió para siempre',
    // Deforestación
    'Cada minuto se tala un bosque',
    'Los bosques absorben CO₂',
    'Sin árboles no hay lluvia',
    'La selva amazónica está en peligro',
    'Los bosques albergan el 80% de especies',
    'Plantar árboles salva el planeta',
    // Contaminación
    'El plástico tarda 500 años en degradarse',
    'El aire contaminado mata millones',
    'Los ríos necesitan nuestra protección',
    'Menos coches = menos contaminación',
    'Las fábricas contaminan el aire',
    'El smog daña los pulmones',
    // Acción ambiental
    'Recicla: reduce tu huella de carbono',
    'Usa energía renovable en casa',
    'Camina o usa bici cuando puedas',
    'Consume menos carne para el planeta',
    'Apaga las luces que no usas',
    'Compra local y de temporada',
    // Esperanza y acción colectiva
    'Juntos podemos revertir el daño',
    'Cada acción pequeña suma',
    'La naturaleza se recupera si la ayudamos',
    'Las energías limpias ya son posibles',
    'Tú puedes ser guardabosques hoy',
    'El futuro verde depende de ti',
  ],
  en: [
    // Climate change
    'Earth warms a little more each year',
    'CO₂ traps heat in the atmosphere',
    'Glaciers are melting right now',
    'Sea levels rise every year',
    'Extreme weather events increase',
    'The climate has already changed',
    // Deforestation
    'A forest is cut every minute',
    'Forests absorb CO₂ from the air',
    'No trees means no rain',
    'The Amazon rainforest is at risk',
    'Forests hold 80% of all species',
    'Planting trees saves the planet',
    // Pollution
    'Plastic takes 500 years to break down',
    'Polluted air kills millions yearly',
    'Our rivers need protection',
    'Fewer cars = less pollution',
    'Factories pollute the air we breathe',
    'Smog damages your lungs',
    // Environmental action
    'Recycle: reduce your carbon footprint',
    'Use renewable energy at home',
    'Walk or bike whenever you can',
    'Eat less meat for the planet',
    'Turn off lights you are not using',
    'Buy local and seasonal produce',
    // Hope and collective action
    'Together we can reverse the damage',
    'Every small action adds up',
    'Nature recovers if we help it',
    'Clean energy is already possible',
    'You can be a forest guardian today',
    'A green future depends on you',
  ]
};
