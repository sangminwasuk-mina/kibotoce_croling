// ==========================================
// MULTIVERSE ARCHIVE - MAIN CONTROLLER
// ==========================================

window.addEventListener('DOMContentLoaded', () => {
  initBackgroundCanvas();
  initMainUI();
});

// 1. 배경 애니메이션 (키보토스 디지털 파티클 & 그리드)
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // 파티클 생성
  const particles = [];
  const particleCount = 45;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.6 - 0.2, // 위로 천천히 부유
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI,
      color: Math.random() < 0.2 ? '#facc15' : '#38bdf8' // 샬레 골드 & 시안 블루
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    // 은은한 배경 원근 사각 그리드
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 60;

    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 파티클 업데이트 및 렌더링
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulse += 0.02;

      // 화면 상단을 벗어나면 하단에서 재생성
      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      const currentAlpha = Math.max(0.1, p.alpha + Math.sin(p.pulse) * 0.2);

      ctx.save();
      ctx.globalAlpha = currentAlpha;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;

      // 다이아몬드 마름모 형태의 키보토스 데이터 파티클
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - p.size);
      ctx.lineTo(p.x + p.size, p.y);
      ctx.lineTo(p.x, p.y + p.size);
      ctx.lineTo(p.x - p.size, p.y);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

// 2. 화면 전환 및 메인 UI 인터랙션
let mapRendererInstance = null;
let mobShowcaseInitialized = false;

function initMainUI() {
  const mainScreen = document.getElementById('main-screen');
  const mapScreen = document.getElementById('map-screen');
  const mobScreen = document.getElementById('mob-screen');
  const btnStart = document.getElementById('btn-start');
  const btnBack = document.getElementById('btn-back-to-title');
  const btnOpenMobViewer = document.getElementById('btn-open-mob-viewer');
  const btnBackFromMob = document.getElementById('btn-back-from-mob');

  // 시작하기 버튼 -> 키보토스 지도 화면
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      console.log('[MULTIVERSE ARCHIVE] 작전 시작 -> 키보토스 지도 화면 진입');
      btnStart.style.transform = 'skewX(-8deg) scale(0.95)';

      setTimeout(() => {
        btnStart.style.transform = '';
        if (mainScreen) mainScreen.classList.add('hidden');
        if (mapScreen) {
          mapScreen.classList.remove('hidden');

          if (!mapRendererInstance) {
            mapRendererInstance = new KivotosMapRenderer('kivotos-map-canvas', 'map-inspector');
          } else {
            mapRendererInstance.resize();
          }
        }
      }, 120);
    });
  }

  // 지도 -> 메인 복귀
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      console.log('[MULTIVERSE ARCHIVE] 메인 타이틀 화면으로 복귀');
      if (mapScreen) mapScreen.classList.add('hidden');
      if (mainScreen) mainScreen.classList.remove('hidden');
    });
  }

  // 모브 뷰어 열기
  if (btnOpenMobViewer) {
    btnOpenMobViewer.addEventListener('click', () => {
      console.log('[MULTIVERSE ARCHIVE] 정실부 모브 뷰어 열기');
      if (mainScreen) mainScreen.classList.add('hidden');
      if (mobScreen) {
        mobScreen.classList.remove('hidden');
        if (!mobShowcaseInitialized) {
          initMobShowcase();
          mobShowcaseInitialized = true;
        }
      }
    });
  }

  // 모브 뷰어 -> 메인 복귀
  if (btnBackFromMob) {
    btnBackFromMob.addEventListener('click', () => {
      console.log('[MULTIVERSE ARCHIVE] 모브 뷰어 -> 메인 복귀');
      if (mobScreen) mobScreen.classList.add('hidden');
      if (mainScreen) mainScreen.classList.remove('hidden');
    });
  }
}

// ==========================================
// 3. 정실부 모브 (2D vs 2.5D) 쇼케이스 및 조작 필드
// ==========================================
function initMobShowcase() {
  const mobRenderer = new JTFMobRenderer();

  // --- 3-1. 2D 프리뷰 캔버스 루프 ---
  const canvas2D = document.getElementById('canvas-mob-2d');
  if (canvas2D) {
    const ctx2D = canvas2D.getContext('2d');
    let time2D = 0;

    function loop2D() {
      time2D += 0.035;
      ctx2D.clearRect(0, 0, canvas2D.width, canvas2D.height);

      // 은은한 원형 배경 그리드
      ctx2D.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx2D.beginPath();
      ctx2D.arc(130, 140, 90, 0, Math.PI * 2);
      ctx2D.stroke();

      mobRenderer.draw2D(ctx2D, 130, 140, 120, { time: time2D });
      requestAnimationFrame(loop2D);
    }
    requestAnimationFrame(loop2D);
  }

  // --- 3-2. 2.5D 프리뷰 캔버스 루프 ---
  const canvas25D = document.getElementById('canvas-mob-25d');
  if (canvas25D) {
    const ctx25D = canvas25D.getContext('2d');
    let time25D = 0;

    function loop25D() {
      time25D += 0.035;
      ctx25D.clearRect(0, 0, canvas25D.width, canvas25D.height);

      // 입체 바닥 아이소메트릭 그리드 가이드
      ctx25D.strokeStyle = 'rgba(239, 68, 68, 0.12)';
      ctx25D.lineWidth = 1;
      ctx25D.beginPath();
      ctx25D.ellipse(130, 190, 95, 42, 0, 0, Math.PI * 2);
      ctx25D.stroke();

      mobRenderer.draw25D(ctx25D, 130, 135, 125, { time: time25D });
      requestAnimationFrame(loop25D);
    }
    requestAnimationFrame(loop25D);
  }

  // --- 3-3. 하단 WASD 인터랙티브 플레이그라운드 조작 필드 ---
  const playCanvas = document.getElementById('canvas-mob-playground');
  const posHud = document.getElementById('mob-pos-hud');
  const stateHud = document.getElementById('mob-state-hud');

  if (playCanvas) {
    const pctx = playCanvas.getContext('2d');

    function resizePlayground() {
      const rect = playCanvas.parentElement.getBoundingClientRect();
      playCanvas.width = rect.width;
      playCanvas.height = rect.height;
    }
    resizePlayground();
    window.addEventListener('resize', resizePlayground);

    // 모브 상태 객체
    const mob = {
      x: playCanvas.width / 2,
      y: playCanvas.height / 2,
      speed: 3.5,
      direction: 'right',
      isMoving: false,
      animTime: 0
    };

    // 키 입력 감지
    const keys = {};
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      keys[k] = true;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) {
        // 모브 화면 열려있을 때 스크롤 방지
        const mobScreen = document.getElementById('mob-screen');
        if (mobScreen && !mobScreen.classList.contains('hidden')) {
          e.preventDefault();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      keys[e.key.toLowerCase()] = false;
    });

    function playgroundLoop() {
      mob.animTime += 0.035;

      // 이동 벡터 계산
      let dx = 0;
      let dy = 0;

      if (keys['w'] || keys['arrowup']) dy -= 1;
      if (keys['s'] || keys['arrowdown']) dy += 1;
      if (keys['a'] || keys['arrowleft']) { dx -= 1; mob.direction = 'left'; }
      if (keys['d'] || keys['arrowright']) { dx += 1; mob.direction = 'right'; }

      // 대각선 이동 시 속도 정규화
      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      mob.isMoving = (dx !== 0 || dy !== 0);

      // 위치 갱신
      mob.x += dx * mob.speed;
      mob.y += dy * mob.speed;

      // 화면 경계 제한
      const pad = 40;
      mob.x = Math.max(pad, Math.min(playCanvas.width - pad, mob.x));
      mob.y = Math.max(pad, Math.min(playCanvas.height - pad, mob.y));

      // HUD 갱신
      if (posHud) posHud.innerText = `좌표: X: ${Math.round(mob.x)}, Y: ${Math.round(mob.y)}`;
      if (stateHud) {
        if (mob.isMoving) {
          stateHud.innerText = '이동 중 (WALKING)';
          stateHud.style.color = '#ef4444';
        } else {
          stateHud.innerText = '대기 (IDLE)';
          stateHud.style.color = '#38bdf8';
        }
      }

      // 렌더링
      pctx.clearRect(0, 0, playCanvas.width, playCanvas.height);

      // 1. 2.5D 바닥 타일 그리드
      pctx.save();
      pctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
      pctx.lineWidth = 1;
      const step = 45;
      for (let x = 0; x < playCanvas.width; x += step) {
        pctx.beginPath(); pctx.moveTo(x, 0); pctx.lineTo(x, playCanvas.height); pctx.stroke();
      }
      for (let y = 0; y < playCanvas.height; y += step) {
        pctx.beginPath(); pctx.moveTo(0, y); pctx.lineTo(playCanvas.width, y); pctx.stroke();
      }

      // 발자국 흔적 가이드
      pctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
      pctx.setLineDash([4, 4]);
      pctx.beginPath();
      pctx.arc(playCanvas.width / 2, playCanvas.height / 2, 60, 0, Math.PI * 2);
      pctx.stroke();
      pctx.restore();

      // 2. 조작 중인 2.5D 모브 그리기
      mobRenderer.draw25D(pctx, mob.x, mob.y, 90, {
        time: mob.animTime,
        isMoving: mob.isMoving,
        direction: mob.direction
      });

      requestAnimationFrame(playgroundLoop);
    }
    requestAnimationFrame(playgroundLoop);
  }
}
