// ==========================================
// JUSTICE TASK FORCE HQ 3D FIELD EXPLORER
// (정의실현부 본부 실내 3D 현장 탐험 엔진 - Three.js WebGL)
// ==========================================

class JTFFieldExplorer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.playerMob = null;

    this.keys = {};
    this.isRunning = false;
    this.animFrameId = null;

    this.initScene();
    this.initPlayer();
    this.initEnvironment();
    this.initControls();
  }

  initScene() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060b14);

    // 블아 스타일 쿼터뷰 카메라 (대각선 위에서 실내를 조망)
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 9.0, 11.5);
    this.camera.lookAt(0, 0.8, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 조명 세팅 (트리니티 대성당풍 따뜻하고 은은한 실내 조명)
    const ambientLight = new THREE.AmbientLight(0xfff1f2, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffedd5, 0.9);
    dirLight.position.set(6, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    this.scene.add(dirLight);

    // 정실부 붉은색 엠비언트 포인트 라이트
    const redAccentLight = new THREE.PointLight(0xef4444, 0.7, 12);
    redAccentLight.position.set(0, 4, 0);
    this.scene.add(redAccentLight);
  }

  initPlayer() {
    // 3D 정실부 모브 생성 (오직 플레이어 1인만 배치!)
    this.playerMob = JTFMob3D.createMobObject();
    this.playerMob.position.set(0, 0, 1.5);
    this.scene.add(this.playerMob);

    this.playerState = {
      x: 0,
      y: 0,
      z: 1.5,
      walkSpeed: 4.5,
      runSpeed: 8.5,
      velocityY: 0,
      gravity: -22.0,
      jumpForce: 6.8,
      isGrounded: true,
      isMoving: false,
      isRunning: false,
      isJumping: false,
      targetRotationY: 0
    };
  }

  // 정의실현부 본부 실내 인테리어 (다른 네모는 일절 없음! 오직 배경 가구/벽면만)
  initEnvironment() {
    // 1. 고딕 대리석 바닥 타일
    const floorGeo = new THREE.PlaneGeometry(28, 22);
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const fctx = floorCanvas.getContext('2d');

    fctx.fillStyle = '#0f172a';
    fctx.fillRect(0, 0, 512, 512);

    // 격자 바닥 문양
    fctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    fctx.lineWidth = 4;
    for (let i = 0; i < 512; i += 64) {
      fctx.strokeRect(i, 0, 64, 512);
      fctx.strokeRect(0, i, 512, 64);
    }

    // 중앙 붉은 카펫 (정의실현부 상징 레드 카펫)
    fctx.fillStyle = '#881337';
    fctx.fillRect(156, 0, 200, 512);
    fctx.strokeStyle = '#e11d48';
    fctx.lineWidth = 6;
    fctx.strokeRect(160, 0, 192, 512);

    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(2, 2);

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.75,
      metalness: 0.1
    });

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 2. 실내 벽면 (정면 벽 & 측면 기둥)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9
    });

    // 뒷쪽 메인 벽
    const backWallGeo = new THREE.BoxGeometry(28, 6, 0.8);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 3, -11);
    this.scene.add(backWall);

    // 좌우 벽
    const sideWallGeo = new THREE.BoxGeometry(0.8, 6, 22);
    const leftWall = new THREE.Mesh(sideWallGeo, wallMat);
    leftWall.position.set(-14, 3, 0);
    const rightWall = new THREE.Mesh(sideWallGeo, wallMat);
    rightWall.position.set(14, 3, 0);
    this.scene.add(leftWall);
    this.scene.add(rightWall);

    // 3. 정면 벽의 대형 정의실현부 엠블럼 태피스트리 (현수막)
    const bannerGeo = new THREE.PlaneGeometry(5, 4);
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 256;
    bannerCanvas.height = 200;
    const bctx = bannerCanvas.getContext('2d');

    bctx.fillStyle = '#881337';
    bctx.fillRect(0, 0, 256, 200);
    bctx.strokeStyle = '#facc15';
    bctx.lineWidth = 6;
    bctx.strokeRect(6, 6, 244, 188);

    bctx.fillStyle = '#facc15';
    bctx.font = 'bold 54px sans-serif';
    bctx.textAlign = 'center';
    bctx.fillText('⚖️', 128, 90);

    bctx.font = 'bold 22px sans-serif';
    bctx.fillText('JUSTICE', 128, 140);
    bctx.font = '16px sans-serif';
    bctx.fillText('TASK FORCE', 128, 170);

    const bannerTex = new THREE.CanvasTexture(bannerCanvas);
    const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTex });
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.set(0, 3.2, -10.5);
    this.scene.add(banner);

    // 4. 회의용 탁자 (중앙 데스크 - 부원들이 출장 떠나 비어 있음)
    const deskGeo = new THREE.BoxGeometry(7, 0.9, 2.5);
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.6,
      metalness: 0.2
    });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(0, 0.45, -3.5);
    desk.castShadow = true;
    desk.receiveShadow = true;
    this.scene.add(desk);

    // 책상 위 서류철 및 전술 단말기
    const docGeo = new THREE.BoxGeometry(0.8, 0.1, 1.2);
    const docMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const doc = new THREE.Mesh(docGeo, docMat);
    doc.position.set(-1.8, 0.95, -3.5);
    this.scene.add(doc);
  }

  initControls() {
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      this.keys[k] = true;
      if (e.code) this.keys[e.code.toLowerCase()] = true;

      // 점프 트리거: [Space] 키로 지면에 있을 때 점프 발동
      if ((k === ' ' || e.code === 'Space') && this.playerState && this.playerState.isGrounded) {
        this.playerState.velocityY = this.playerState.jumpForce;
        this.playerState.isGrounded = false;
        this.playerState.isJumping = true;
      }

      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' ', 'shift'].includes(k) || e.code === 'Space') {
        const fieldScreen = document.getElementById('field-screen');
        if (fieldScreen && !fieldScreen.classList.contains('hidden')) {
          e.preventDefault();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      this.keys[k] = false;
      if (e.code) this.keys[e.code.toLowerCase()] = false;
    });

    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  start() {
    this.isRunning = true;
    this.resize();

    // 시작 위치 및 물리 상태 리셋
    if (this.playerMob) {
      this.playerMob.position.set(0, 0, 1.5);
      this.playerState.x = 0;
      this.playerState.y = 0;
      this.playerState.z = 1.5;
      this.playerState.velocityY = 0;
      this.playerState.isGrounded = true;
      this.playerState.isJumping = false;
      this.playerState.isRunning = false;
      this.playerState.isMoving = false;
    }

    let lastTime = performance.now();

    const loop = (time) => {
      if (!this.isRunning) return;

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      this.update(delta);
      this.renderer.render(this.scene, this.camera);

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  stop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  update(delta) {
    if (!this.playerMob) return;

    // 1. 달리기 판정 ([Shift] 키 입력)
    const isRunning = !!(this.keys['shift'] || this.keys['shiftleft'] || this.keys['shiftright']);
    this.playerState.isRunning = isRunning;

    // 2. 수평 이동 방향 판정 ([W, A, S, D] / [방향키])
    let dx = 0;
    let dz = 0;

    if (this.keys['w'] || this.keys['arrowup']) dz -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) dz += 1;
    if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) dx += 1;

    const isMoving = (dx !== 0 || dz !== 0);
    this.playerState.isMoving = isMoving;

    const currentSpeed = isRunning ? this.playerState.runSpeed : this.playerState.walkSpeed;

    if (isMoving) {
      const speed = currentSpeed * delta;
      const len = Math.sqrt(dx * dx + dz * dz);
      dx = (dx / len) * speed;
      dz = (dz / len) * speed;

      this.playerState.x += dx;
      this.playerState.z += dz;

      // 실내 외곽 벽 및 회의용 책상 충돌 제한
      const boundX = 12.5;
      const boundZMin = -9.5;
      const boundZMax = 9.5;

      // 책상 충돌 (desk: x: -3.8 ~ 3.8, z: -5.0 ~ -2.0)
      if (this.playerState.x > -4.0 && this.playerState.x < 4.0 &&
          this.playerState.z > -5.2 && this.playerState.z < -1.8) {
        this.playerState.x -= dx;
        this.playerState.z -= dz;
      }

      this.playerState.x = Math.max(-boundX, Math.min(boundX, this.playerState.x));
      this.playerState.z = Math.max(boundZMin, Math.min(boundZMax, this.playerState.z));

      // 이동 방향 회전
      this.playerMob.userData.targetRotationY = Math.atan2(dx, dz);
    }

    // 3. 점프 & 중력 물리 계산 ([Space] 점프)
    if (!this.playerState.isGrounded) {
      this.playerState.velocityY += this.playerState.gravity * delta;
      this.playerState.y += this.playerState.velocityY * delta;

      if (this.playerState.y <= 0) {
        this.playerState.y = 0;
        this.playerState.velocityY = 0;
        this.playerState.isGrounded = true;
        this.playerState.isJumping = false;
      }
    }

    // 4. 모브 캐릭터 3D 위치 반영 (X, Y, Z)
    this.playerMob.position.set(this.playerState.x, this.playerState.y, this.playerState.z);

    // 5. 점프 중 그림자 지면 유지 및 축소 보정
    if (this.playerMob.userData && this.playerMob.userData.shadowMesh) {
      this.playerMob.userData.shadowMesh.position.y = 0.01 - this.playerState.y;
      const jumpShadowScale = Math.max(0.35, 1.0 - this.playerState.y * 0.35);
      this.playerMob.userData.shadowMesh.scale.set(jumpShadowScale, jumpShadowScale, 1.0);
    }

    // 6. 카메라가 캐릭터를 부드럽게 추적 (쿼터뷰 시점)
    const camTargetX = this.playerState.x * 0.45;
    const camTargetZ = this.playerState.z * 0.45 + 11.5;
    this.camera.position.x += (camTargetX - this.camera.position.x) * 0.08;
    this.camera.position.z += (camTargetZ - this.camera.position.z) * 0.08;

    // 7. 3D 애니메이션 갱신 (이동, 달리기, 점프 전달)
    this.playerMob.update(delta, isMoving, isRunning, this.playerState.isJumping);

    // 8. 하단 HUD 상태 갱신
    const posHud = document.getElementById('field-pos-hud');
    if (posHud) {
      let stateLabel = '대기 (IDLE)';
      if (this.playerState.isJumping) {
        stateLabel = '🦘 점프 중 (JUMP)';
      } else if (isMoving) {
        stateLabel = isRunning ? '⚡ 전력 질주 (SPRINT)' : '🚶 걷기 (WALK)';
      }
      posHud.innerText = `상태: ${stateLabel} | 위치: X: ${this.playerState.x.toFixed(1)}, Y: ${this.playerState.y.toFixed(1)}, Z: ${this.playerState.z.toFixed(1)}`;
    }
  }
}

if (typeof window !== 'undefined') {
  window.JTFFieldExplorer = JTFFieldExplorer;
}
