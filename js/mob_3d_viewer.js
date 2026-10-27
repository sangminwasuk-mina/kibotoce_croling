// ==========================================
// TRINITY JUSTICE TASK FORCE MOB 3D SHOWCASE VIEWER
// (Three.js WebGL 실시간 3D 뷰어 & WASD 조작 컨트롤러)
// ==========================================

class JTFMob3DViewer {
  constructor() {
    this.inspectScene = null;
    this.inspectCamera = null;
    this.inspectRenderer = null;
    this.inspectMob = null;

    this.playScene = null;
    this.playCamera = null;
    this.playRenderer = null;
    this.playMob = null;

    this.keys = {};
    this.isMouseDown = false;
    this.prevMouseX = 0;
    this.prevMouseY = 0;

    this.initInspectView();
    this.initPlaygroundView();
    this.initKeyEvents();
    this.animate();
  }

  // 1. 좌측/상단: 360도 마우스 회전 감상 뷰
  initInspectView() {
    const container = document.getElementById('canvas-box-3d-inspect');
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // 씬 & 카메라
    this.inspectScene = new THREE.Scene();
    this.inspectCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.inspectCamera.position.set(0, 1.4, 3.8);
    this.inspectCamera.lookAt(0, 1.0, 0);

    // 렌더러
    this.inspectRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.inspectRenderer.setSize(width, height);
    this.inspectRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.inspectRenderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(this.inspectRenderer.domElement);

    // 조명
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.inspectScene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff1f2, 0.9);
    dirLight.position.set(3, 5, 4);
    dirLight.castShadow = true;
    this.inspectScene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x38bdf8, 0.5);
    backLight.position.set(-3, 3, -3);
    this.inspectScene.add(backLight);

    // 3D 모브 인스턴스 생성
    this.inspectMob = JTFMob3D.createMobObject();
    this.inspectScene.add(this.inspectMob);

    // 바닥 원형 전술 발판
    const pedestalGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.08, 36);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.04;
    this.inspectScene.add(pedestal);

    // 마우스 드래그 360도 회전 이벤트
    const canvas = this.inspectRenderer.domElement;
    canvas.addEventListener('mousedown', (e) => {
      this.isMouseDown = true;
      this.prevMouseX = e.clientX;
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isMouseDown && this.inspectMob) {
        const deltaX = e.clientX - this.prevMouseX;
        this.inspectMob.rotation.y += deltaX * 0.015;
        this.prevMouseX = e.clientX;
      }
    });

    // 터치 모바일 드래그
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isMouseDown = true;
        this.prevMouseX = e.touches[0].clientX;
      }
    });
    canvas.addEventListener('touchmove', (e) => {
      if (this.isMouseDown && e.touches.length === 1 && this.inspectMob) {
        const deltaX = e.touches[0].clientX - this.prevMouseX;
        this.inspectMob.rotation.y += deltaX * 0.015;
        this.prevMouseX = e.touches[0].clientX;
      }
    });
    canvas.addEventListener('touchend', () => {
      this.isMouseDown = false;
    });
  }

  // 2. 우측/하단: WASD 조작 실시간 3D 필드 체험
  initPlaygroundView() {
    const container = document.getElementById('canvas-box-3d-playground');
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 320;

    this.playScene = new THREE.Scene();
    this.playCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // 블아 스타일 쿼터뷰 각도 (대각선 위에서 내려다보기)
    this.playCamera.position.set(0, 7.5, 9.0);
    this.playCamera.lookAt(0, 0.5, 0);

    this.playRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.playRenderer.setSize(width, height);
    this.playRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.playRenderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(this.playRenderer.domElement);

    // 조명
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.playScene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff1f2, 1.0);
    dirLight.position.set(5, 10, 6);
    dirLight.castShadow = true;
    this.playScene.add(dirLight);

    // 3D 전술 격자 바닥
    const gridHelper = new THREE.GridHelper(24, 24, 0xef4444, 0x1e293b);
    gridHelper.position.y = 0;
    this.playScene.add(gridHelper);

    // 바닥 평면 (그림자 수신용)
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.9,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    this.playScene.add(floor);

    // 조작용 3D 모브 인스턴스
    this.playMob = JTFMob3D.createMobObject();
    this.playMob.position.set(0, 0, 0);
    this.playScene.add(this.playMob);

    // 반응형 리사이즈
    window.addEventListener('resize', () => {
      this.resize();
    });
  }

  resize() {
    const c1 = document.getElementById('canvas-box-3d-inspect');
    if (c1 && this.inspectRenderer && this.inspectCamera) {
      const w = c1.clientWidth, h = c1.clientHeight;
      this.inspectCamera.aspect = w / h;
      this.inspectCamera.updateProjectionMatrix();
      this.inspectRenderer.setSize(w, h);
    }

    const c2 = document.getElementById('canvas-box-3d-playground');
    if (c2 && this.playRenderer && this.playCamera) {
      const w = c2.clientWidth, h = c2.clientHeight;
      this.playCamera.aspect = w / h;
      this.playCamera.updateProjectionMatrix();
      this.playRenderer.setSize(w, h);
    }
  }

  initKeyEvents() {
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      this.keys[k] = true;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) {
        const mobScreen = document.getElementById('mob-screen');
        if (mobScreen && !mobScreen.classList.contains('hidden')) {
          e.preventDefault();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  animate() {
    let lastTime = performance.now();

    const loop = (time) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // 1. 감상 뷰 업데이트
      if (this.inspectMob) {
        if (!this.isMouseDown) {
          // 마우스 안 잡을 땐 스스로 천천히 360도 회전
          this.inspectMob.rotation.y += delta * 0.45;
        }
        this.inspectMob.update(delta, false);
      }
      if (this.inspectRenderer && this.inspectScene && this.inspectCamera) {
        this.inspectRenderer.render(this.inspectScene, this.inspectCamera);
      }

      // 2. 조작 뷰 업데이트
      if (this.playMob) {
        let dx = 0;
        let dz = 0;

        if (this.keys['w'] || this.keys['arrowup']) dz -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) dz += 1;
        if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
        if (this.keys['d'] || this.keys['arrowright']) dx += 1;

        const isMoving = (dx !== 0 || dz !== 0);

        if (isMoving) {
          // 이동 속도
          const speed = 4.2 * delta;
          const len = Math.sqrt(dx * dx + dz * dz);
          dx = (dx / len) * speed;
          dz = (dz / len) * speed;

          this.playMob.position.x += dx;
          this.playMob.position.z += dz;

          // 이동 방향으로 3D 회전 각도 계산
          const targetAngle = Math.atan2(dx, dz);
          this.playMob.userData.targetRotationY = targetAngle;

          // 경기장 경계 제한
          const bound = 9.5;
          this.playMob.position.x = Math.max(-bound, Math.min(bound, this.playMob.position.x));
          this.playMob.position.z = Math.max(-bound, Math.min(bound, this.playMob.position.z));

          // 카메라가 캐릭터를 부드럽게 추적 (블아 쿼터뷰 시점)
          const camTargetX = this.playMob.position.x * 0.4;
          const camTargetZ = this.playMob.position.z * 0.4 + 9.0;
          this.playCamera.position.x += (camTargetX - this.playCamera.position.x) * 0.08;
          this.playCamera.position.z += (camTargetZ - this.playCamera.position.z) * 0.08;
        }

        this.playMob.update(delta, isMoving);

        // HUD 좌표 갱신
        const posHud = document.getElementById('mob-pos-hud');
        const stateHud = document.getElementById('mob-state-hud');
        if (posHud) {
          posHud.innerText = `3D 위치: X: ${this.playMob.position.x.toFixed(1)}, Z: ${this.playMob.position.z.toFixed(1)}`;
        }
        if (stateHud) {
          if (isMoving) {
            stateHud.innerText = '이동 중 (WALKING)';
            stateHud.style.color = '#ef4444';
          } else {
            stateHud.innerText = '대기 (IDLE)';
            stateHud.style.color = '#38bdf8';
          }
        }
      }

      if (this.playRenderer && this.playScene && this.playCamera) {
        this.playRenderer.render(this.playScene, this.playCamera);
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

if (typeof window !== 'undefined') {
  window.JTFMob3DViewer = JTFMob3DViewer;
}
