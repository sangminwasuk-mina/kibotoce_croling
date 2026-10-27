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
// 3. 정실부 모브 3D WebGL 쇼케이스 & WASD 조작
// ==========================================
let mob3DViewerInstance = null;

function initMobShowcase() {
  if (!mob3DViewerInstance) {
    console.log('[MULTIVERSE ARCHIVE] 3D 정실부 모브 WebGL 뷰어 초기화');
    mob3DViewerInstance = new JTFMob3DViewer();
  } else {
    mob3DViewerInstance.resize();
  }
}
