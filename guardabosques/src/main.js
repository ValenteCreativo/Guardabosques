import kaplay from 'kaplay';
import { i18n, climateTips } from './i18n.js';

// Assets to preload
const ASSETS_TO_LOAD = [
  '/assets/Background.png',
  '/assets/logo.png',
  '/assets/arbol.png',
  '/assets/Guardabosques.png',
];

// Preload images
function preloadImages(urls) {
  return Promise.all(
    urls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ url, width: img.width, height: img.height });
        img.onerror = () => resolve({ url, width: 480, height: 854 }); // fallback
        img.src = url;
      });
    })
  );
}

// Loading screen (only show if slow)
const loadingScreen = document.getElementById('loading-screen');
let loadingTimeout = setTimeout(() => {
  if (loadingScreen) loadingScreen.classList.add('show');
}, 200);

preloadImages(ASSETS_TO_LOAD)
  .then((loadedAssets) => {
    clearTimeout(loadingTimeout);
    if (loadingScreen) loadingScreen.remove();
    initGame(loadedAssets);
  })
  .catch((err) => {
    console.error('Error loading assets:', err);
    clearTimeout(loadingTimeout);
    const textEl = document.getElementById('loading-text');
    if (textEl) {
      textEl.textContent = 'Error. Refresca la página.';
      textEl.style.color = '#ff6432';
    }
    if (loadingScreen) loadingScreen.classList.add('show');
  });

function initGame(preloadedAssets) {
  const k = kaplay({
    width: 480,
    height: 854,
    background: [10, 26, 10],
    letterbox: true,
    pixelDensity: Math.min(window.devicePixelRatio || 1, 2),
    crisp: false,
    texFilter: 'linear',
    touchToMouse: true,
    debug: false,
  });

  k.canvas.classList.add('loaded');

  // Load sprites
  k.loadSprite('background', '/assets/Background.png');
  k.loadSprite('background-night', '/assets/Background-night.png');
  k.loadSprite('logo', '/assets/logo.png');
  k.loadSprite('tree', '/assets/arbol.png');
  k.loadSprite('guardabosques', '/assets/Guardabosques.png');
  // Enemies
  k.loadSprite('humo', '/assets/Enemies/humo.png');
  k.loadSprite('talador', '/assets/Enemies/talador.png');
  k.loadSprite('barril', '/assets/Enemies/barril.png');
  k.loadSprite('fabrica', '/assets/Enemies/fabrica.png');
  k.loadSprite('toxic_blob', '/assets/Enemies/toxic_blob.png');
  // Powerups
  k.loadSprite('powerup_slice', '/assets/PowerUps/powerup_slice.png');
  k.loadSprite('powerup_velocidad', '/assets/PowerUps/powerup_velocidad.png');
  k.loadSprite('powerup_explosion', '/assets/PowerUps/powerup_explosion.png');
  k.loadSprite('powerup_regen', '/assets/PowerUps/powerup_regen.png');
  k.loadSprite('powerup_slow', '/assets/PowerUps/powerup_slow.png');

  k.onLoad(() => {
    createScenes(k, preloadedAssets);
    k.go('menu');
  });
}

function createScenes(k, preloadedAssets) {
  const bgData = preloadedAssets.find(a => a.url.includes('Background') || a.url.includes('background'));
  const logoData = preloadedAssets.find(a => a.url.includes('logo'));
  const guardaData = preloadedAssets.find(a => a.url.includes('Guardabosques'));

  const getBg = () => settings.nightMode ? 'background-night' : 'background';

  // ===== SETTINGS =====
  const settings = {
    sfxVolume: 0.5,
    musicVolume: 0.4,
    nightMode: false,
    language: 'es',
  };

  // ===== MUSIC =====
  const TRACKS = [
    '/assets/selvatic-watcher.mp3',
    '/assets/selvatic-watcher2.mp3',
  ];
  let bgMusic = null;
  let musicStarted = false;

  function startMusic() {
    stopMusic();
    musicStarted = true;
    try {
      const track = TRACKS[Math.floor(Math.random() * TRACKS.length)];
      bgMusic = new Audio(track);
      bgMusic.volume = settings.musicVolume;
      bgMusic.loop = false;

      // Call play() synchronously inside the gesture — iOS requires this.
      // Set random currentTime after canplay fires (async is fine for seek, not for play).
      const playPromise = bgMusic.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Seek to random position once enough data is loaded
            bgMusic.addEventListener('canplay', () => {
              if (bgMusic && bgMusic.duration > 10) {
                bgMusic.currentTime = Math.random() * Math.min(bgMusic.duration - 5, 60);
              }
            }, { once: true });
          })
          .catch(err => {
            console.warn('[music] play() blocked:', err.message);
            musicStarted = false;
          });
      }

      bgMusic.addEventListener('ended', () => {
        bgMusic = null;
        musicStarted = false;
        // Auto-restart with the other track
        startMusic();
      }, { once: true });

    } catch (e) {
      console.warn('[music] error:', e.message);
      bgMusic = null;
      musicStarted = false;
    }
  }

  function stopMusic() {
    if (bgMusic) {
      try { bgMusic.pause(); } catch {}
      bgMusic.src = '';
      bgMusic = null;
    }
    musicStarted = false;
  }

  function setMusicVolume(v) {
    settings.musicVolume = Math.max(0, Math.min(1, v));
    if (bgMusic) bgMusic.volume = settings.musicVolume;
  }

  function ensureMusicStarted() {
    if (!musicStarted) startMusic();
  }

  // Native DOM listener — fires on the very first tap/click anywhere on the page.
  // This is the only reliable way to satisfy browser autoplay policy.
  // iOS requires touchstart/touchend, desktop needs pointerdown/mousedown.
  function onFirstGesture() {
    document.removeEventListener('pointerdown', onFirstGesture);
    document.removeEventListener('touchstart', onFirstGesture);
    document.removeEventListener('touchend', onFirstGesture);
    ensureMusicStarted();
  }
  document.addEventListener('pointerdown', onFirstGesture, { passive: true });
  document.addEventListener('touchstart', onFirstGesture, { passive: true });
  document.addEventListener('touchend', onFirstGesture, { passive: true });

  const t = (key) => {
    const value = i18n[settings.language][key];
    return typeof value === 'function' ? value : (value || key);
  };

  // ===== GAME CONSTANTS =====
  const ENEMY_TYPES = {
    humo:       { sprite: 'humo',       speed: [80, 120],  health: 1, damage: 10, points: 10  },
    talador:    { sprite: 'talador',    speed: [80, 120], health: 1, damage: 10, points: 15  },
    barril:     { sprite: 'barril',     speed: [80, 120], health: 2, damage: 10, points: 25  },
    fabrica:    { sprite: 'fabrica',    speed: [80, 120],  health: 1, damage: 20, points: 30, scale: 1.5 },
    toxic_blob: { sprite: 'toxic_blob', speed: [80, 120],  health: 1, damage: 10, points: 20, erratic: true },
  };

  const POWERUP_TYPES = {
    slice_grande: { sprite: 'powerup_slice',     effect: 'sliceRadius',  duration: 5  },
    empuje:       { sprite: 'powerup_velocidad',  effect: 'pushBack'                   },
    explosion:    { sprite: 'powerup_explosion',  effect: 'clearAll'                   },
    regeneracion: { sprite: 'powerup_regen',      effect: 'healTree',     amount: 15   },
    slow:         { sprite: 'powerup_slow',       effect: 'slowEnemies',  duration: 4  },
  };

  // ===== AUDIO =====
  let audioCtx = null;

  function ensureAudioUnlocked() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state !== 'running') audioCtx.resume();
    } catch { /* ignore */ }
  }

  if (typeof window !== 'undefined') {
    const unlockOnce = () => {
      ensureAudioUnlocked();
      window.removeEventListener('pointerdown', unlockOnce);
      window.removeEventListener('touchstart', unlockOnce);
      window.removeEventListener('mousedown', unlockOnce);
      window.removeEventListener('keydown', unlockOnce);
    };
    window.addEventListener('pointerdown', unlockOnce, { passive: true });
    window.addEventListener('touchstart', unlockOnce, { passive: true });
    window.addEventListener('mousedown', unlockOnce, { passive: true });
    window.addEventListener('keydown', unlockOnce);
  }

  function playSFX(type) {
    if (settings.sfxVolume === 0) return;
    ensureAudioUnlocked();
    if (!audioCtx || audioCtx.state !== 'running') return;
    const ctx = audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = settings.sfxVolume;
    if (type === 'slice') {
      osc.type = 'sine';
      osc.frequency.value = 180;
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.11);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      osc.connect(filter);
      filter.connect(gain);
      gain.gain.value = settings.sfxVolume * 0.4;
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.11);
      osc.start(); osc.stop(ctx.currentTime + 0.11);
    } else if (type === 'powerup') {
      osc.frequency.value = 600;
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.start(); osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'combo') {
      osc.frequency.value = 440;
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    }
  }

  // ===== PERSISTENCE =====
  const HS_KEY = 'guardabosques-high-score';

  function loadHighScore() {
    try {
      const raw = localStorage.getItem(HS_KEY);
      const parsed = parseInt(raw, 10);
      return isNaN(parsed) ? 0 : parsed;
    } catch (e) { return 0; }
  }

  function saveHighScore(newScore) {
    try {
      if (newScore > loadHighScore()) localStorage.setItem(HS_KEY, String(newScore));
    } catch (e) {}
  }

  // ===== SHARED BUTTON HELPER =====
  function makeBtn(k, label, x, y, w, h, onClick, color) {
    const r = 16;
    const c = color || k.rgb(255, 104, 60);
    k.add([k.rect(w, h, { radius: r }), k.pos(x, y + 6), k.anchor('center'), k.color(0, 0, 0), k.opacity(0.32), k.z(9)]);
    const btn = k.add([
      k.rect(w, h, { radius: r }), k.pos(x, y), k.anchor('center'),
      k.color(c.r ?? c[0], c.g ?? c[1], c.b ?? c[2]), k.outline(4, k.rgb(255, 220, 140)), k.area(), k.z(10),
    ]);
    k.add([k.text(label, { size: Math.round(h * 0.38) }), k.pos(x, y), k.anchor('center'), k.color(255, 255, 255), k.z(11)]);
    btn.onClick(onClick);
    btn.onHover(() => k.setCursor('pointer'));
    btn.onHoverEnd(() => k.setCursor('default'));
    return btn;
  }

  function addBg(k, bgData, getBg, opacity) {
    k.add([k.rect(480, 854), k.color(10, 26, 10), k.pos(0, 0), k.z(-1)]);
    if (bgData) {
      const bgScale = Math.max(480 / bgData.width, 854 / bgData.height);
      const bg = k.add([k.sprite(getBg()), k.pos(240, 427), k.anchor('center'), k.scale(bgScale), k.z(0)]);
      if (opacity !== undefined) bg.opacity = opacity;
    }
  }

  // ===== SCENE: MENU =====
  k.scene('menu', () => {
    k.setGravity(0);
    addBg(k, bgData, getBg);

    // Night mode toggle (top-right)
    const nightBtn = k.add([
      k.rect(50, 50, { radius: 25 }), k.pos(450, 30), k.anchor('center'),
      k.color(100, 100, 120), k.outline(2, k.rgb(180, 180, 200)), k.area(), k.z(100),
    ]);
    k.add([k.text(settings.nightMode ? '☀️' : '🌙', { size: 28 }), k.pos(450, 30), k.anchor('center'), k.z(101)]);
    nightBtn.onClick(() => { settings.nightMode = !settings.nightMode; k.go('menu'); });
    nightBtn.onHover(() => k.setCursor('pointer'));
    nightBtn.onHoverEnd(() => k.setCursor('default'));

    // Music mute toggle (left of night button)
    const musicBtn = k.add([
      k.rect(50, 50, { radius: 25 }), k.pos(390, 30), k.anchor('center'),
      k.color(100, 100, 120), k.outline(2, k.rgb(180, 180, 200)), k.area(), k.z(100),
    ]);
    const musicBtnLabel = k.add([
      k.text(settings.musicVolume === 0 ? '🔇' : '🎵', { size: 26 }),
      k.pos(390, 30), k.anchor('center'), k.z(101),
    ]);
    musicBtn.onClick(() => {
      if (settings.musicVolume > 0) {
        settings._prevMusicVolume = settings.musicVolume;
        setMusicVolume(0);
        musicBtnLabel.text = '🔇';
      } else {
        setMusicVolume(settings._prevMusicVolume || 0.4);
        musicBtnLabel.text = '🎵';
      }
    });
    musicBtn.onHover(() => k.setCursor('pointer'));
    musicBtn.onHoverEnd(() => k.setCursor('default'));

    // Language toggle (top-left)
    const langBtn = k.add([
      k.rect(70, 50, { radius: 25 }), k.pos(50, 30), k.anchor('center'),
      k.color(100, 100, 120), k.outline(2, k.rgb(180, 180, 200)), k.area(), k.z(100),
    ]);
    k.add([k.text(settings.language === 'es' ? 'ES' : 'EN', { size: 20 }), k.pos(50, 30), k.anchor('center'), k.color(255, 255, 255), k.z(101)]);
    langBtn.onClick(() => { settings.language = settings.language === 'es' ? 'en' : 'es'; k.go('menu'); });
    langBtn.onHover(() => k.setCursor('pointer'));
    langBtn.onHoverEnd(() => k.setCursor('default'));

    // Logo — top center (~15% from top)
    const logoY = 130;
    if (logoData && logoData.width > 1) {
      const logoScale = (480 * 0.78) / logoData.width;
      k.add([k.sprite('logo'), k.pos(240, logoY), k.anchor('center'), k.scale(logoScale), k.z(2)]);
    } else {
      k.add([k.text('🌳 GUARDABOSQUES', { size: 36 }), k.pos(240, logoY), k.anchor('center'), k.color(80, 220, 80), k.z(2)]);
    }

    // High score (below logo)
    const hs = loadHighScore();
    if (hs > 0) {
      k.add([k.text(t('menu_high_score')(hs), { size: 18 }), k.pos(240, logoY + 110), k.anchor('center'), k.color(0, 0, 0), k.z(2)]);
    }

    // JUGAR button — y=770
    const playBtnY = 770;
    const playBtnH = 70;

    // CÓMO JUGAR — just above JUGAR
    makeBtn(k, t('menu_how_to_play'), 240, playBtnY - playBtnH - 14, 260, 52, () => { ensureMusicStarted(); k.go('tutorial'); }, k.rgb(60, 140, 200));

    // JUGAR — big, prominent
    makeBtn(k, t('menu_play'), 240, playBtnY, 260, playBtnH, () => { ensureMusicStarted(); k.go('game'); }, k.rgb(255, 104, 60));

    // Guardabosques character — fills space between logo and buttons
    if (guardaData) {
      const maxW = 480 * 0.60;
      const maxH = playBtnY - playBtnH / 2 - (logoY + 110) - 10;
      const scale = Math.min(maxW / guardaData.width, maxH / guardaData.height);
      const charH = guardaData.height * scale;
      const charY = (logoY + 110) + charH / 2 + 8;
      k.add([k.sprite('guardabosques'), k.pos(240, charY), k.anchor('center'), k.scale(scale), k.z(3)]);
    }

    // "Sobre el cambio climático" — bottom-left, near floor
    const climateBtn = k.add([
      k.rect(200, 36, { radius: 10 }), k.pos(108, 838), k.anchor('center'),
      k.color(60, 160, 80), k.opacity(0.9), k.outline(2, k.rgb(120, 220, 120)), k.area(), k.z(10),
    ]);
    k.add([k.text(t('menu_climate'), { size: 14 }), k.pos(108, 838), k.anchor('center'), k.color(255, 255, 255), k.z(11)]);
    climateBtn.onClick(() => k.go('climateinfo', { from: 'menu' }));
    climateBtn.onHover(() => k.setCursor('pointer'));
    climateBtn.onHoverEnd(() => k.setCursor('default'));
  });

  // ===== SCENE: TUTORIAL =====
  k.scene('tutorial', () => {
    k.setGravity(0);
    addBg(k, bgData, getBg, 0.3);
    k.add([k.rect(460, 820, { radius: 18 }), k.pos(240, 427), k.anchor('center'), k.color(10, 26, 10), k.opacity(0.82), k.z(1)]);

    let page = 0;
    const TOTAL = 5;
    const pageObjs = [];
    const clearPage = () => { while (pageObjs.length) { try { k.destroy(pageObjs.pop()); } catch {} } };
    const addObj = (o) => { pageObjs.push(o); return o; };

    function renderPage() {
      clearPage();

      // Page indicator
      addObj(k.add([k.text(`${page + 1}/${TOTAL}`, { size: 16 }), k.pos(240, 760), k.anchor('center'), k.color(255, 255, 255), k.opacity(0.6), k.z(3)]));

      if (page === 0) {
        // HOW TO PLAY — simple text
        addObj(k.add([k.text(t('tutorial_0_title'), { size: 28 }), k.pos(240, 160), k.anchor('center'), k.color(255, 220, 140), k.z(3)]));
        addObj(k.add([
          k.text([t('tutorial_0_line1'), t('tutorial_0_line2'), '', t('tutorial_0_line3')].join('\n'),
            { size: 20, width: 400, lineSpacing: 12, align: 'center' }),
          k.pos(240, 430), k.anchor('center'), k.color(230, 240, 255), k.z(3),
        ]));
      }

      else if (page === 1) {
        // OBJECTIVE
        addObj(k.add([k.text(t('tutorial_1_title'), { size: 28 }), k.pos(240, 160), k.anchor('center'), k.color(255, 220, 140), k.z(3)]));
        addObj(k.add([
          k.text([t('tutorial_1_line1'), t('tutorial_1_line2'), t('tutorial_1_line3'), '', t('tutorial_1_line4')].join('\n'),
            { size: 18, width: 400, lineSpacing: 12, align: 'center' }),
          k.pos(240, 430), k.anchor('center'), k.color(230, 240, 255), k.z(3),
        ]));
      }

      else if (page === 2) {
        // ENEMIES — sprites + labels
        addObj(k.add([k.text(t('tutorial_2_title'), { size: 28 }), k.pos(240, 130), k.anchor('center'), k.color(255, 220, 140), k.z(3)]));

        const enemies = [
          { sprite: 'humo',       label: t('tutorial_2_humo') },
          { sprite: 'talador',    label: t('tutorial_2_talador') },
          { sprite: 'barril',     label: t('tutorial_2_barril') },
          { sprite: 'fabrica',    label: t('tutorial_2_fabrica') },
          { sprite: 'toxic_blob', label: t('tutorial_2_blob') },
        ];

        // 2 rows: 3 top, 2 bottom centered
        const rows = [[0,1,2],[3,4]];
        rows.forEach((row, ri) => {
          const y = 310 + ri * 160;
          const total = row.length;
          row.forEach((idx, ci) => {
            const x = 240 - (total - 1) * 70 + ci * 140;
            const e = enemies[idx];
            addObj(k.add([k.sprite(e.sprite), k.pos(x, y), k.anchor('center'), k.scale(0.09), k.z(3)]));
            addObj(k.add([k.text(e.label, { size: 14, width: 130, align: 'center' }), k.pos(x, y + 52), k.anchor('center'), k.color(200, 220, 200), k.z(3)]));
          });
        });
      }

      else if (page === 3) {
        // POWERUPS — sprites + labels + effects
        addObj(k.add([k.text(t('tutorial_3_title'), { size: 28 }), k.pos(240, 130), k.anchor('center'), k.color(255, 220, 140), k.z(3)]));

        const powerups = [
          { sprite: 'powerup_slice',     label: t('tutorial_3_slice') },
          { sprite: 'powerup_velocidad', label: t('tutorial_3_empuje') },
          { sprite: 'powerup_explosion', label: t('tutorial_3_explosion') },
          { sprite: 'powerup_regen',     label: t('tutorial_3_regen') },
          { sprite: 'powerup_slow',      label: t('tutorial_3_slow') },
        ];

        const rows = [[0,1,2],[3,4]];
        rows.forEach((row, ri) => {
          const y = 290 + ri * 150;
          const total = row.length;
          row.forEach((idx, ci) => {
            const x = 240 - (total - 1) * 70 + ci * 140;
            const p = powerups[idx];
            addObj(k.add([k.sprite(p.sprite), k.pos(x, y), k.anchor('center'), k.scale(0.09), k.z(3)]));
            addObj(k.add([k.text(p.label, { size: 14, width: 130, align: 'center' }), k.pos(x, y + 50), k.anchor('center'), k.color(200, 220, 200), k.z(3)]));
          });
        });

        // Effects list below
        addObj(k.add([
          k.text([t('tutorial_4_line1'), t('tutorial_4_line2'), t('tutorial_4_line3'), t('tutorial_4_line4'), t('tutorial_4_line5')].join('\n'),
            { size: 14, width: 420, lineSpacing: 8, align: 'left' }),
          k.pos(30, 590), k.anchor('topleft'), k.color(200, 220, 200), k.z(3),
        ]));
      }

      else if (page === 4) {
        // TIPS
        addObj(k.add([k.text(t('tutorial_5_title'), { size: 28 }), k.pos(240, 160), k.anchor('center'), k.color(255, 220, 140), k.z(3)]));
        addObj(k.add([
          k.text([t('tutorial_5_line1'), '', t('tutorial_5_line2'), '', t('tutorial_5_line3')].join('\n'),
            { size: 19, width: 400, lineSpacing: 12, align: 'center' }),
          k.pos(240, 430), k.anchor('center'), k.color(230, 240, 255), k.z(3),
        ]));
      }
    }

    // Close button
    const closeBtn = k.add([k.rect(52, 52, { radius: 16 }), k.pos(440, 80), k.anchor('center'), k.color(255, 104, 60), k.outline(4, k.rgb(255, 220, 140)), k.area(), k.z(10)]);
    k.add([k.text('✕', { size: 28 }), k.pos(440, 80), k.anchor('center'), k.color(255, 255, 255), k.z(11)]);
    closeBtn.onClick(() => k.go('menu'));
    closeBtn.onHover(() => k.setCursor('pointer'));
    closeBtn.onHoverEnd(() => k.setCursor('default'));

    makeBtn(k, t('tutorial_back'), 130, 810, 160, 50, () => { page = (page - 1 + TOTAL) % TOTAL; renderPage(); });
    makeBtn(k, t('tutorial_next'), 350, 810, 160, 50, () => { page = (page + 1) % TOTAL; renderPage(); });
    renderPage();
  });

  // ===== SCENE: CLIMATEINFO =====
  k.scene('climateinfo', (data) => {
    k.setGravity(0);
    addBg(k, bgData, getBg, 0.25);
    k.add([k.rect(460, 800, { radius: 18 }), k.pos(240, 427), k.anchor('center'), k.color(10, 26, 10), k.opacity(0.88), k.z(1)]);
    k.add([k.text(t('climate_title'), { size: 30 }), k.pos(240, 100), k.anchor('center'), k.color(80, 220, 80), k.z(2)]);

    let page = 0;
    const TOTAL = 5;
    const pageObjs = [];
    const clearPage = () => { while (pageObjs.length) { try { k.destroy(pageObjs.pop()); } catch {} } };
    const addObj = (o) => { pageObjs.push(o); return o; };

    function renderPage() {
      clearPage();
      const n = page + 1;
      addObj(k.add([k.text(t(`climate_${n}_title`), { size: 22, width: 420, align: 'center' }), k.pos(240, 230), k.anchor('center'), k.color(255, 220, 140), k.z(3)]));
      addObj(k.add([k.text(t(`climate_${n}_body`), { size: 17, width: 420, lineSpacing: 10, align: 'center' }), k.pos(240, 460), k.anchor('center'), k.color(230, 240, 255), k.z(3)]));
      addObj(k.add([k.text(`${page + 1}/${TOTAL}`, { size: 18 }), k.pos(240, 700), k.anchor('center'), k.color(255, 255, 255), k.opacity(0.7), k.z(3)]));
    }

    const closeBtn = k.add([k.rect(52, 52, { radius: 16 }), k.pos(440, 80), k.anchor('center'), k.color(60, 160, 80), k.outline(4, k.rgb(120, 220, 120)), k.area(), k.z(10)]);
    k.add([k.text('✕', { size: 28 }), k.pos(440, 80), k.anchor('center'), k.color(255, 255, 255), k.z(11)]);
    closeBtn.onClick(() => k.go(data?.from ?? 'menu'));
    closeBtn.onHover(() => k.setCursor('pointer'));
    closeBtn.onHoverEnd(() => k.setCursor('default'));

    makeBtn(k, t('tutorial_back'), 130, 760, 160, 50, () => { page = (page - 1 + TOTAL) % TOTAL; renderPage(); }, k.rgb(60, 160, 80));
    makeBtn(k, t('tutorial_next'), 350, 760, 160, 50, () => { page = (page + 1) % TOTAL; renderPage(); }, k.rgb(60, 160, 80));
    renderPage();
  });

  // ===== SCENE: GAME =====
  k.scene('game', () => {
    k.setGravity(0);
    addBg(k, bgData, getBg);

    // ===== STATE =====
    let treeHealth = 100;
    let score = 0;
    let elapsed = 0;
    let paused = false;
    let activeEntities = 0;
    let spawnTimer = 0;
    let powerupSpawnTimer = 0;
    let swiping = false;
    let lastPos = null;
    let enemyCutsThisSwipe = 0;
    let pointsThisSwipe = 0;

    // Powerup timers
    let sliceRadiusBonus = 1.0;
    let sliceRadiusTimer = 0;
    let slowActive = false;
    let slowTimer = 0;

    // ===== TREE =====
    const tree = k.add([
      k.sprite('tree'),
      k.pos(240, 427),
      k.anchor('center'),
      k.scale(0.18),
      k.z(5),
      'tree',
    ]);

    // ===== HUD =====
    k.add([k.rect(210, 80, { radius: 12 }), k.pos(10, 10), k.color(0, 0, 0), k.opacity(0.65), k.z(99)]);
    const treeHealthText = k.add([k.text(`🌳 ${treeHealth}`, { size: 22 }), k.pos(18, 18), k.color(120, 220, 120), k.z(100)]);
    const scoreText = k.add([k.text(`${t('game_score')}: ${score}`, { size: 22 }), k.pos(18, 48), k.color(255, 255, 255), k.z(100)]);

    // Pause button
    const pauseBtn = k.add([k.rect(50, 50, { radius: 12 }), k.pos(450, 30), k.anchor('center'), k.color(100, 100, 120), k.outline(2, k.rgb(180, 180, 200)), k.area(), k.z(100)]);
    k.add([k.text('⏸', { size: 28 }), k.pos(450, 30), k.anchor('center'), k.color(255, 255, 255), k.z(101)]);

    // Settings button
    const settingsBtn = k.add([k.rect(50, 50, { radius: 12 }), k.pos(390, 30), k.anchor('center'), k.color(100, 100, 120), k.outline(2, k.rgb(180, 180, 200)), k.area(), k.z(100)]);
    k.add([k.text('⚙', { size: 28 }), k.pos(390, 30), k.anchor('center'), k.color(255, 255, 255), k.z(101)]);

    // ===== TOAST =====
    const toastBg = k.add([k.rect(440, 60, { radius: 12 }), k.pos(240, 140), k.anchor('center'), k.color(0, 0, 0), k.opacity(0), k.z(119)]);
    const toastText = k.add([k.text('', { size: 22, width: 420 }), k.pos(240, 140), k.anchor('center'), k.color(255, 255, 255), k.opacity(0), k.z(120)]);
    let toastTimer = 0;

    function showToast(msg, color) {
      toastText.text = msg;
      toastText.color = color || k.rgb(255, 255, 255);
      toastText.opacity = 1;
      toastBg.opacity = 0.72;
      toastTimer = 0;
    }

    k.onUpdate(() => {
      if (toastText.opacity > 0) {
        toastTimer += k.dt();
        if (toastTimer > 1.2) {
          toastText.opacity = Math.max(0, toastText.opacity - 2 * k.dt());
          toastBg.opacity = toastText.opacity * 0.72;
        }
      }
    });

    // ===== GAME FUNCTIONS =====
    function difficultyMult() {
      return Math.pow(1.15, Math.floor(elapsed / 15));
    }

    function refreshHUD() {
      treeHealthText.text = `🌳 ${treeHealth}`;
      scoreText.text = `${t('game_score')}: ${score}`;
    }

    function damageTree(amount) {
      if (typeof amount !== 'number' || isNaN(amount)) {
        console.error('[guardabosques] damageTree: valor inválido', amount);
        return;
      }
      treeHealth = Math.max(0, treeHealth - amount);
      refreshHUD();
      // Flash rojo 300ms
      tree.color = k.rgb(255, 80, 80);
      k.wait(0.3, () => { if (tree && tree.color) tree.color = k.rgb(255, 255, 255); });
      if (treeHealth <= 0) endGame();
    }

    function healTree(amount) {
      if (typeof amount !== 'number' || isNaN(amount)) {
        console.error('[guardabosques] healTree: valor inválido', amount);
        return;
      }
      treeHealth = Math.min(100, treeHealth + amount);
      refreshHUD();
    }

    function endGame() {
      stopMusic();
      saveHighScore(score);
      k.go('gameover', { score, highScore: loadHighScore() });
    }

    function spawnParticles(x, y) {
      for (let i = 0; i < 8; i++) {
        k.add([
          k.rect(8, 8, { radius: 4 }),
          k.pos(x, y),
          k.anchor('center'),
          k.color(80, 200, 80),
          k.opacity(1),
          k.move(k.rand(0, 360), k.rand(80, 220)),
          k.lifespan(0.6, { fade: 0.3 }),
          k.z(200),
        ]);
      }
    }

    function applyPowerup(typeName) {
      if (typeName === 'slice_grande') {
        sliceRadiusBonus = 1.5;
        sliceRadiusTimer = 5;
        showToast(t('toast_slice_grande'), k.rgb(120, 220, 120));
      } else if (typeName === 'empuje') {
        // Push all enemies away from center
        k.get('enemy').forEach(e => {
          const dx = e.pos.x - 240;
          const dy = e.pos.y - 427;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const pushSpeed = 400;
          e.vx = (dx / len) * pushSpeed;
          e.vy = (dy / len) * pushSpeed;
          // After push, re-aim toward center at original speed
          k.wait(0.6, () => {
            if (!e || !e.exists()) return;
            const nx = 240 - e.pos.x;
            const ny = 427 - e.pos.y;
            const nl = Math.sqrt(nx * nx + ny * ny) || 1;
            e.vx = (nx / nl) * e.speed;
            e.vy = (ny / nl) * e.speed;
          });
        });
        showToast(t('toast_empuje'), k.rgb(180, 220, 255));
        playSFX('powerup');
      } else if (typeName === 'explosion') {
        k.get('enemy').forEach(e => {
          spawnParticles(e.pos.x, e.pos.y);
          k.destroy(e);
          activeEntities = Math.max(0, activeEntities - 1);
        });
        const fx = k.add([k.circle(20), k.pos(240, 427), k.anchor('center'), k.color(255, 200, 80), k.opacity(0.5), k.z(200), { t: 0 }]);
        fx.onUpdate(() => {
          fx.t += k.dt();
          fx.radius += 800 * k.dt();
          fx.opacity = Math.max(0, 0.5 - fx.t * 0.6);
          if (fx.t > 0.7) k.destroy(fx);
        });
        showToast(t('toast_explosion'), k.rgb(255, 180, 60));
      } else if (typeName === 'regeneracion') {
        healTree(15);
        showToast(t('toast_regeneracion'), k.rgb(80, 220, 120));
      } else if (typeName === 'slow') {
        slowActive = true;
        slowTimer = 4;
        showToast(t('toast_slow'), k.rgb(180, 220, 255));
      }
    }

    function spawnEnemy(typeName) {
      if (activeEntities >= 15) return;
      const type = ENEMY_TYPES[typeName];
      const edge = Math.floor(Math.random() * 4);
      let x, y;
      if (edge === 0)      { x = k.rand(0, 480); y = -40; }
      else if (edge === 1) { x = 520;            y = k.rand(0, 854); }
      else if (edge === 2) { x = k.rand(0, 480); y = 894; }
      else                 { x = -40;            y = k.rand(0, 854); }

      const dx = 240 - x, dy = 427 - y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const speed = k.rand(type.speed[0], type.speed[1]) * difficultyMult();
      const vx = (dx / len) * speed;
      const vy = (dy / len) * speed;

      k.add([
        k.sprite(type.sprite),
        k.pos(x, y),
        k.anchor('center'),
        k.scale(type.scale ? type.scale * 0.08 : 0.08),
        k.area(),
        k.z(10),
        { kind: 'enemy', enemyType: typeName, health: type.health, damage: type.damage, points: type.points, speed, vx, vy, sliced: false, erratic: type.erratic ?? false, erraticTimer: 0 },
        'enemy',
      ]);
      activeEntities++;
    }

    function spawnPowerup() {
      if (activeEntities >= 15) return;
      const keys = Object.keys(POWERUP_TYPES);
      const typeName = keys[Math.floor(Math.random() * keys.length)];
      const type = POWERUP_TYPES[typeName];
      const edge = Math.floor(Math.random() * 4);
      let x, y;
      if (edge === 0)      { x = k.rand(0, 480); y = -40; }
      else if (edge === 1) { x = 520;            y = k.rand(0, 854); }
      else if (edge === 2) { x = k.rand(0, 480); y = 894; }
      else                 { x = -40;            y = k.rand(0, 854); }

      const dx = 240 - x, dy = 427 - y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const speed = 80;
      k.add([
        k.sprite(type.sprite),
        k.pos(x, y),
        k.anchor('center'),
        k.scale(0.08),
        k.area(),
        k.z(10),
        { kind: 'powerup', powerupType: typeName, vx: (dx / len) * speed, vy: (dy / len) * speed, sliced: false },
        'powerup',
      ]);
      activeEntities++;
    }

    // ===== SLICING =====
    function distPointToSegment(px, py, ax, ay, bx, by) {
      const abx = bx - ax, aby = by - ay;
      const apx = px - ax, apy = py - ay;
      const abLen2 = abx * abx + aby * aby;
      const t = abLen2 === 0 ? 0 : Math.max(0, Math.min(1, (apx * abx + apy * aby) / abLen2));
      const cx = ax + abx * t, cy = ay + aby * t;
      return Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
    }

    function sliceObject(obj) {
      if (obj.sliced) return;
      obj.sliced = true;
      if (obj.kind === 'enemy') {
        obj.health--;
        if (obj.health > 0) { obj.sliced = false; return; } // barril needs 2 cuts
        score += obj.points;
        enemyCutsThisSwipe++;
        pointsThisSwipe += obj.points;
        refreshHUD();
        spawnParticles(obj.pos.x, obj.pos.y);
        playSFX('slice');
        k.destroy(obj);
        activeEntities = Math.max(0, activeEntities - 1);
      } else if (obj.kind === 'powerup') {
        applyPowerup(obj.powerupType);
        playSFX('powerup');
        k.destroy(obj);
        activeEntities = Math.max(0, activeEntities - 1);
      }
    }

    function trySliceBetween(a, b) {
      const radius = 35 * sliceRadiusBonus;
      const ax = a.x, ay = a.y, bx = b.x, by = b.y;
      k.get('enemy').forEach(e => {
        if (!e.sliced) {
          const d = distPointToSegment(e.pos.x, e.pos.y, ax, ay, bx, by);
          if (d < radius) sliceObject(e);
        }
      });
      k.get('powerup').forEach(p => {
        if (!p.sliced) {
          const d = distPointToSegment(p.pos.x, p.pos.y, ax, ay, bx, by);
          if (d < radius) sliceObject(p);
        }
      });
    }

    // ===== ENEMY UPDATE =====
    k.onUpdate('enemy', (enemy) => {
      if (paused) return;
      const dt = k.dt();
      const sm = slowActive ? 0.5 : 1.0;
      enemy.pos.x += enemy.vx * sm * dt;
      enemy.pos.y += enemy.vy * sm * dt;

      if (enemy.erratic) {
        enemy.erraticTimer += dt;
        if (enemy.erraticTimer >= 0.5) {
          enemy.erraticTimer = 0;
          const lateral = k.rand(-30, 30);
          const cs = Math.sqrt(enemy.vx ** 2 + enemy.vy ** 2);
          if (cs > 0) {
            const px = -enemy.vy / cs, py = enemy.vx / cs;
            enemy.vx += px * lateral * 0.1;
            enemy.vy += py * lateral * 0.1;
            const ns = Math.sqrt(enemy.vx ** 2 + enemy.vy ** 2);
            if (ns > 0) { enemy.vx = (enemy.vx / ns) * enemy.speed * sm; enemy.vy = (enemy.vy / ns) * enemy.speed * sm; }
          }
        }
      }

      const dist = Math.sqrt((enemy.pos.x - 240) ** 2 + (enemy.pos.y - 427) ** 2);
      if (dist < 40) {
        damageTree(enemy.damage);
        k.destroy(enemy);
        activeEntities = Math.max(0, activeEntities - 1);
      }
    });

    // ===== POWERUP UPDATE =====
    k.onUpdate('powerup', (p) => {
      if (paused) return;
      const dt = k.dt();
      p.pos.x += p.vx * dt;
      p.pos.y += p.vy * dt;
      if (p.pos.x < -60 || p.pos.x > 540 || p.pos.y < -60 || p.pos.y > 920) {
        k.destroy(p);
        activeEntities = Math.max(0, activeEntities - 1);
      }
    });

    // ===== MAIN LOOP =====
    k.onUpdate(() => {
      if (paused) return;
      const dt = k.dt();
      elapsed += dt;

      // Powerup timers
      if (sliceRadiusTimer > 0) { sliceRadiusTimer -= dt; if (sliceRadiusTimer <= 0) { sliceRadiusBonus = 1.0; sliceRadiusTimer = 0; } }
      if (slowTimer > 0) { slowTimer -= dt; if (slowTimer <= 0) { slowActive = false; slowTimer = 0; } }

      // Spawn enemies
      spawnTimer += dt;
      const interval = 2.0 / difficultyMult();
      if (spawnTimer >= interval) {
        spawnTimer = 0;
        const types = Object.keys(ENEMY_TYPES).filter(tp => tp !== 'fabrica' || elapsed >= 60);
        spawnEnemy(types[Math.floor(Math.random() * types.length)]);
      }

      // Spawn powerups
      powerupSpawnTimer += dt;
      if (powerupSpawnTimer >= 10) { powerupSpawnTimer = 0; spawnPowerup(); }

      // Guard
      if (typeof treeHealth !== 'number' || isNaN(treeHealth)) {
        console.error('[guardabosques] treeHealth corrupto');
        treeHealth = 0;
        endGame();
      }
    });

    // ===== INPUT =====
    function drawTrail(a, b) {
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 1) return;
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const steps = Math.ceil(len / 6);
      // Trail thickness scales with sliceRadiusBonus so the powerup is visible
      const w = Math.round(14 * sliceRadiusBonus);
      const h = Math.round(4 * sliceRadiusBonus);
      const col = sliceRadiusBonus > 1 ? k.rgb(80, 255, 120) : k.rgb(220, 220, 220);
      for (let i = 0; i <= steps; i++) {
        const tt = i / steps;
        k.add([
          k.rect(w, h, { radius: 2 }),
          k.pos(a.x + dx * tt, a.y + dy * tt),
          k.anchor('center'),
          k.rotate(angle),
          k.color(col),
          k.opacity(sliceRadiusBonus > 1 ? 0.85 : 0.55),
          k.z(150),
          k.lifespan(sliceRadiusBonus > 1 ? 0.18 : 0.10, { fade: 0.06 }),
        ]);
      }
    }

    function handleCombo() {
      const c = enemyCutsThisSwipe;
      if (c < 2) return;
      // Bonus = puntos del swipe × (c-1) × 0.5, redondeado
      // x2 → +50% de lo ganado, x3 → +100%, x4+ → +150%
      const mult = Math.min(c - 1, 3) * 0.5;
      const comboBonus = Math.max(10, Math.round(pointsThisSwipe * mult));
      score += comboBonus;
      refreshHUD();
      const fire = c >= 4 ? '🔥🔥🔥' : c === 3 ? '🔥🔥' : '🔥';
      showToast(`${fire} COMBO x${c}  +${comboBonus}`, k.rgb(255, 200 - c * 10, 40));
      playSFX('combo');
      // Burst de partículas proporcional al combo
      for (let i = 0; i < 8 + c * 5; i++) {
        k.add([
          k.rect(10, 10, { radius: 5 }),
          k.pos(240, 427),
          k.anchor('center'),
          k.color(k.rgb(255, 200, 80)),
          k.opacity(1),
          k.move(k.rand(0, 360), k.rand(120, 380)),
          k.lifespan(0.7, { fade: 0.3 }),
          k.z(200),
        ]);
      }
    }

    k.onMouseDown(() => { swiping = true; lastPos = k.mousePos(); enemyCutsThisSwipe = 0; pointsThisSwipe = 0; });
    k.onMouseRelease(() => { if (!swiping) return; swiping = false; handleCombo(); enemyCutsThisSwipe = 0; pointsThisSwipe = 0; lastPos = null; });
    k.onMouseMove(() => {
      if (!swiping) return;
      const p = k.mousePos();
      if (lastPos) { drawTrail(lastPos, p); trySliceBetween(lastPos, p); }
      lastPos = p;
    });
    k.onTouchStart((id, pos) => { swiping = true; lastPos = pos; enemyCutsThisSwipe = 0; pointsThisSwipe = 0; });
    k.onTouchEnd(() => { if (!swiping) return; swiping = false; handleCombo(); enemyCutsThisSwipe = 0; pointsThisSwipe = 0; lastPos = null; });
    k.onTouchMove((id, pos) => {
      if (!swiping) return;
      if (lastPos) { drawTrail(lastPos, pos); trySliceBetween(lastPos, pos); }
      lastPos = pos;
    });

    // ===== PAUSE =====
    pauseBtn.onClick(() => {
      if (paused) { paused = false; return; }
      paused = true;
      const objs = [];
      const add = (o) => { objs.push(o); return o; };
      const close = () => { objs.forEach(o => k.destroy(o)); paused = false; };

      add(k.add([k.rect(360, 260, { radius: 18 }), k.pos(240, 427), k.anchor('center'), k.color(10, 26, 10), k.opacity(0.95), k.z(200)]));
      add(k.add([k.text(t('game_pause'), { size: 32 }), k.pos(240, 340), k.anchor('center'), k.color(255, 255, 255), k.z(201)]));

      const cont = add(k.add([k.rect(240, 52, { radius: 14 }), k.pos(240, 420), k.anchor('center'), k.color(60, 180, 100), k.outline(3, k.rgb(120, 220, 160)), k.area(), k.z(201)]));
      add(k.add([k.text(t('game_pause_continue'), { size: 22 }), k.pos(240, 420), k.anchor('center'), k.color(255, 255, 255), k.z(202)]));
      cont.onClick(close); cont.onHover(() => k.setCursor('pointer')); cont.onHoverEnd(() => k.setCursor('default'));

      const quit = add(k.add([k.rect(240, 52, { radius: 14 }), k.pos(240, 490), k.anchor('center'), k.color(180, 80, 80), k.outline(3, k.rgb(220, 120, 120)), k.area(), k.z(201)]));
      add(k.add([k.text(t('game_pause_quit'), { size: 22 }), k.pos(240, 490), k.anchor('center'), k.color(255, 255, 255), k.z(202)]));
      quit.onClick(() => { close(); endGame(); }); quit.onHover(() => k.setCursor('pointer')); quit.onHoverEnd(() => k.setCursor('default'));
    });
    pauseBtn.onHover(() => k.setCursor('pointer'));
    pauseBtn.onHoverEnd(() => k.setCursor('default'));

    // ===== SETTINGS =====
    settingsBtn.onClick(() => {
      paused = true;
      const objs = [];
      const add = (o) => { objs.push(o); return o; };
      const close = () => { objs.forEach(o => k.destroy(o)); paused = false; };

      // Modal background — tall enough for all rows
      add(k.add([k.rect(340, 380, { radius: 18 }), k.pos(240, 427), k.anchor('center'), k.color(10, 26, 10), k.opacity(0.96), k.z(200)]));
      add(k.add([k.text(t('settings_title'), { size: 22 }), k.pos(240, 270), k.anchor('center'), k.color(255, 255, 255), k.z(201)]));

      // Helper: one row with label | value | - | + | mute
      function volRow(label, getVal, onDown, onUp, onMute, y) {
        add(k.add([k.text(label, { size: 16 }), k.pos(90, y), k.anchor('center'), k.color(180, 210, 180), k.z(201)]));
        const valLbl = add(k.add([k.text(`${Math.round(getVal() * 100)}%`, { size: 16 }), k.pos(175, y), k.anchor('center'), k.color(230, 240, 255), k.z(201)]));

        const btnMinus = add(k.add([k.rect(36, 36, { radius: 8 }), k.pos(220, y), k.anchor('center'), k.color(80, 80, 100), k.area(), k.z(201)]));
        add(k.add([k.text('−', { size: 22 }), k.pos(220, y), k.anchor('center'), k.color(255, 255, 255), k.z(202)]));

        const btnPlus = add(k.add([k.rect(36, 36, { radius: 8 }), k.pos(264, y), k.anchor('center'), k.color(80, 80, 100), k.area(), k.z(201)]));
        add(k.add([k.text('+', { size: 22 }), k.pos(264, y), k.anchor('center'), k.color(255, 255, 255), k.z(202)]));

        const btnMute = add(k.add([k.rect(36, 36, { radius: 8 }), k.pos(308, y), k.anchor('center'), k.color(80, 80, 100), k.area(), k.z(201)]));
        add(k.add([k.text('🔇', { size: 18 }), k.pos(308, y), k.anchor('center'), k.z(202)]));

        btnMinus.onClick(() => { onDown(); valLbl.text = `${Math.round(getVal() * 100)}%`; });
        btnMinus.onHover(() => k.setCursor('pointer')); btnMinus.onHoverEnd(() => k.setCursor('default'));
        btnPlus.onClick(() => { onUp(); valLbl.text = `${Math.round(getVal() * 100)}%`; });
        btnPlus.onHover(() => k.setCursor('pointer')); btnPlus.onHoverEnd(() => k.setCursor('default'));
        btnMute.onClick(() => { onMute(); valLbl.text = `${Math.round(getVal() * 100)}%`; });
        btnMute.onHover(() => k.setCursor('pointer')); btnMute.onHoverEnd(() => k.setCursor('default'));
      }

      // SFX row
      volRow(
        'SFX',
        () => settings.sfxVolume,
        () => { settings.sfxVolume = Math.max(0, settings.sfxVolume - 0.1); },
        () => { settings.sfxVolume = Math.min(1, settings.sfxVolume + 0.1); },
        () => { settings.sfxVolume = 0; },
        350
      );

      // Music row
      volRow(
        '🎵 Música',
        () => settings.musicVolume,
        () => setMusicVolume(settings.musicVolume - 0.1),
        () => setMusicVolume(settings.musicVolume + 0.1),
        () => setMusicVolume(0),
        410
      );

      // Close button
      const cb = add(k.add([k.rect(160, 44, { radius: 12 }), k.pos(240, 490), k.anchor('center'), k.color(255, 104, 60), k.outline(3, k.rgb(255, 220, 140)), k.area(), k.z(201)]));
      add(k.add([k.text(t('tutorial_back'), { size: 20 }), k.pos(240, 490), k.anchor('center'), k.color(255, 255, 255), k.z(202)]));
      cb.onClick(close); cb.onHover(() => k.setCursor('pointer')); cb.onHoverEnd(() => k.setCursor('default'));
    });
    settingsBtn.onHover(() => k.setCursor('pointer'));
    settingsBtn.onHoverEnd(() => k.setCursor('default'));

    // Auto-pause on tab hide
    const onVis = () => { if (document.hidden && !paused) paused = true; };
    document.addEventListener('visibilitychange', onVis);
    k.onSceneLeave(() => document.removeEventListener('visibilitychange', onVis));

    k.onKeyPress('escape', () => k.go('menu'));
  });

  // ===== SCENE: GAMEOVER =====
  k.scene('gameover', (data) => {
    const finalScore = data?.score ?? 0;
    const highScore = data?.highScore ?? loadHighScore();
    k.setGravity(0);
    addBg(k, bgData, getBg, 0.25);
    k.add([k.rect(460, 820, { radius: 18 }), k.pos(240, 427), k.anchor('center'), k.color(10, 26, 10), k.opacity(0.88), k.z(1)]);
    k.add([k.text(t('gameover_title'), { size: 44 }), k.pos(240, 110), k.anchor('center'), k.color(255, 104, 60), k.z(2)]);
    k.add([k.text(t('gameover_score')(finalScore), { size: 26 }), k.pos(240, 200), k.anchor('center'), k.color(255, 255, 255), k.z(2)]);
    k.add([k.text(t('gameover_high_score')(highScore), { size: 20 }), k.pos(240, 240), k.anchor('center'), k.color(255, 220, 140), k.z(2)]);

    // Name input
    k.add([k.text(t('gameover_save_prompt'), { size: 18 }), k.pos(240, 295), k.anchor('center'), k.color(255, 220, 140), k.z(2)]);
    let playerName = '';
    let saved = false;

    const prev = document.getElementById('gb-name-input');
    if (prev) prev.remove();

    const nameBox = k.add([k.rect(280, 42, { radius: 12 }), k.pos(200, 335), k.anchor('center'), k.color(40, 50, 40), k.outline(2, k.rgb(100, 160, 100)), k.area(), k.z(2)]);
    const nameDisplay = k.add([k.text('', { size: 20 }), k.pos(200, 335), k.anchor('center'), k.color(230, 240, 255), k.z(3)]);
    const placeholder = k.add([k.text(t('gameover_input_placeholder'), { size: 18 }), k.pos(200, 335), k.anchor('center'), k.color(120, 140, 120), k.opacity(0.7), k.z(3)]);

    const domInput = document.createElement('input');
    domInput.id = 'gb-name-input';
    domInput.type = 'text';
    domInput.maxLength = 20;
    domInput.autocapitalize = 'words';
    Object.assign(domInput.style, { position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '1px', height: '1px', opacity: '0', zIndex: '9999', border: '0', background: 'transparent', color: 'transparent', caretColor: 'transparent' });
    document.body.appendChild(domInput);

    domInput.addEventListener('input', () => {
      if (saved) return;
      playerName = domInput.value.slice(0, 20);
      nameDisplay.text = playerName;
      placeholder.opacity = playerName.length ? 0 : 0.7;
    });
    nameBox.onClick(() => { if (!saved) { domInput.focus(); setTimeout(() => domInput.focus(), 20); } });
    nameBox.onHover(() => k.setCursor('text'));
    nameBox.onHoverEnd(() => k.setCursor('default'));

    const saveBtn = k.add([k.rect(50, 42, { radius: 12 }), k.pos(370, 335), k.anchor('center'), k.color(60, 180, 100), k.outline(2, k.rgb(120, 220, 160)), k.area(), k.z(2)]);
    k.add([k.text('💾', { size: 26 }), k.pos(370, 335), k.anchor('center'), k.z(3)]);

    const saveName = () => {
      if (saved || playerName.length === 0) return;
      saved = true;
      fetch('/api/leaderboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: playerName, score: finalScore }) })
        .then(() => { nameDisplay.text = t('gameover_saved_status'); nameDisplay.color = k.rgb(120, 220, 160); domInput.blur(); })
        .catch(() => { nameDisplay.text = t('gameover_error'); nameDisplay.color = k.rgb(255, 100, 100); });
    };
    saveBtn.onClick(saveName);
    saveBtn.onHover(() => k.setCursor('pointer'));
    saveBtn.onHoverEnd(() => k.setCursor('default'));
    k.onKeyPress('enter', saveName);

    makeBtn(k, t('gameover_play_again'), 240, 420, 280, 52, () => { domInput.remove(); k.go('game'); });
    makeBtn(k, t('gameover_leaderboard'), 240, 485, 280, 52, () => { domInput.remove(); k.go('leaderboard', { score: finalScore }); }, k.rgb(100, 80, 180));
    makeBtn(k, t('gameover_menu'), 240, 550, 280, 52, () => { domInput.remove(); k.go('menu'); }, k.rgb(60, 140, 200));
    makeBtn(k, t('gameover_climate'), 240, 615, 280, 52, () => { domInput.remove(); k.go('climateinfo', { from: 'gameover' }); }, k.rgb(60, 160, 80));

    const back = k.add([k.rect(110, 36, { radius: 12 }), k.pos(70, 60), k.anchor('center'), k.color(255, 104, 60), k.outline(3, k.rgb(255, 220, 140)), k.area(), k.z(20)]);
    k.add([k.text(t('gameover_menu'), { size: 16 }), k.pos(70, 60), k.anchor('center'), k.color(255, 255, 255), k.z(21)]);
    back.onClick(() => { domInput.remove(); k.go('menu'); });
    back.onHover(() => k.setCursor('pointer'));
    back.onHoverEnd(() => k.setCursor('default'));

    k.onSceneLeave(() => { const inp = document.getElementById('gb-name-input'); if (inp) inp.remove(); });
  });

  // ===== SCENE: LEADERBOARD =====
  k.scene('leaderboard', (data) => {
    const myScore = data?.score;
    k.setGravity(0);
    addBg(k, bgData, getBg, 0.25);
    k.add([k.rect(460, 800, { radius: 18 }), k.pos(240, 427), k.anchor('center'), k.color(10, 26, 10), k.opacity(0.88), k.z(1)]);
    k.add([k.text(t('gameover_leaderboard'), { size: 34 }), k.pos(240, 100), k.anchor('center'), k.color(80, 220, 80), k.z(2)]);

    const loadingText = k.add([k.text(t('leaderboard_loading'), { size: 20 }), k.pos(240, 420), k.anchor('center'), k.color(240, 245, 255), k.z(2)]);

    fetch('/api/leaderboard')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(rows => {
        if (!k.get('*').includes(loadingText)) return; // scene already changed
        try { k.destroy(loadingText); } catch {}
        if (!Array.isArray(rows) || rows.length === 0) {
          k.add([k.text('Sin registros aún.\n¡Sé el primero!', { size: 20, align: 'center' }), k.pos(240, 420), k.anchor('center'), k.color(240, 245, 255), k.z(2)]);
          return;
        }
        const lines = rows.slice(0, 10).map((r, i) => `${i + 1}. ${r.name}  ${r.score} pts`).join('\n');
        k.add([k.text(lines, { size: 18, width: 420, lineSpacing: 10 }), k.pos(240, 420), k.anchor('center'), k.color(240, 245, 255), k.z(2)]);
      })
      .catch(err => {
        try { k.destroy(loadingText); } catch {}
        k.add([k.text(`${t('leaderboard_error')}\n${err.message}`, { size: 18, width: 400, align: 'center' }), k.pos(240, 420), k.anchor('center'), k.color(255, 120, 120), k.z(2)]);
      });

    const backBtn = k.add([k.rect(200, 48, { radius: 14 }), k.pos(240, 760), k.anchor('center'), k.color(255, 104, 60), k.outline(3, k.rgb(255, 220, 140)), k.area(), k.z(3)]);
    k.add([k.text(t('tutorial_back'), { size: 22 }), k.pos(240, 760), k.anchor('center'), k.color(255, 255, 255), k.z(4)]);
    backBtn.onClick(() => myScore !== undefined ? k.go('gameover', { score: myScore, highScore: loadHighScore() }) : k.go('menu'));
    backBtn.onHover(() => k.setCursor('pointer'));
    backBtn.onHoverEnd(() => k.setCursor('default'));
  });

} // end createScenes
