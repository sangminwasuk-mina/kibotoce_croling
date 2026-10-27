// ==========================================
// TRINITY JUSTICE TASK FORCE MOB 3D ENGINE
// (트리니티 정의실현부 모브 학생 3D WebGL 렌더러 - Three.js 기반)
// ==========================================

const JTFMob3D = (function() {
  // 1. 메모리 캐시 (한 번만 생성하여 재사용 - 렉 방지)
  let cachedMaterials = null;
  let cachedGeometries = null;

  // 정실부 모브 텍스처 생성기 (검은 세일러복, 붉은 2줄 라인, 붉은 스카프, 눈 덮는 뱅 앞머리)
  function createJTFTextures() {
    // 1-1. 전면 (Front Face) 텍스처
    const frontCanvas = document.createElement('canvas');
    frontCanvas.width = 512;
    frontCanvas.height = 680;
    const fctx = frontCanvas.getContext('2d');

    // 베이스 (어두운 제복 블랙)
    fctx.fillStyle = '#18181b';
    fctx.fillRect(0, 0, 512, 680);

    // 피부 톤 (목 및 얼굴 하단)
    fctx.fillStyle = '#fff1f2';
    fctx.fillRect(130, 160, 252, 140);

    // 검은색 초커 목걸이
    fctx.fillStyle = '#09090b';
    fctx.fillRect(170, 275, 172, 22);

    // 눈을 완전히 가리는 짙은 흑발 뱅 앞머리
    fctx.fillStyle = '#1e1b2e'; // 짙은 네이비 흑발
    fctx.beginPath();
    fctx.moveTo(70, 0);
    fctx.lineTo(442, 0);
    fctx.lineTo(442, 230);
    // 일자 뱅 앞머리 빗살 디테일
    for (let x = 442; x >= 70; x -= 18) {
      const spike = (x % 36 === 0) ? 236 : 225;
      fctx.lineTo(x, spike);
    }
    fctx.closePath();
    fctx.fill();

    // 살짝 보이는 앙증맞은 입
    fctx.fillStyle = '#f43f5e';
    fctx.beginPath();
    fctx.arc(256, 256, 4, 0, Math.PI);
    fctx.fill();

    // 검은색 세일러복 상의 칼라
    fctx.fillStyle = '#18181b';
    fctx.beginPath();
    fctx.moveTo(90, 290);
    fctx.lineTo(256, 460);
    fctx.lineTo(422, 290);
    fctx.lineTo(360, 290);
    fctx.lineTo(256, 400);
    fctx.lineTo(152, 290);
    fctx.closePath();
    fctx.fill();

    // 세일러 칼라 붉은색 2줄 라인 (정실부 핵심 상징!)
    fctx.strokeStyle = '#e11d48';
    fctx.lineWidth = 8;
    fctx.beginPath();
    // 바깥 라인
    fctx.moveTo(110, 295);
    fctx.lineTo(256, 445);
    fctx.lineTo(402, 295);
    fctx.stroke();

    // 안쪽 라인
    fctx.lineWidth = 6;
    fctx.beginPath();
    fctx.moveTo(130, 295);
    fctx.lineTo(256, 420);
    fctx.lineTo(382, 295);
    fctx.stroke();

    // 가슴 중앙에 묶인 붉은색 세일러 스카프 / 리본
    fctx.fillStyle = '#be123c';
    fctx.beginPath();
    // 매듭
    fctx.arc(256, 410, 18, 0, Math.PI * 2);
    fctx.fill();
    // 리본 좌측 날개
    fctx.beginPath();
    fctx.moveTo(256, 410);
    fctx.lineTo(190, 480);
    fctx.lineTo(220, 540);
    fctx.lineTo(256, 450);
    fctx.fill();
    // 리본 우측 날개
    fctx.beginPath();
    fctx.moveTo(256, 410);
    fctx.lineTo(322, 480);
    fctx.lineTo(292, 540);
    fctx.lineTo(256, 450);
    fctx.fill();

    // 하단 치마 붉은 2줄 라인 (치마 밑단)
    fctx.fillStyle = '#e11d48';
    fctx.fillRect(40, 630, 432, 7);
    fctx.fillRect(40, 650, 432, 7);

    // 1-2. 후면 (Back Face) 텍스처 - 길게 늘어뜨린 흑발 생머리
    const backCanvas = document.createElement('canvas');
    backCanvas.width = 512;
    backCanvas.height = 680;
    const bctx = backCanvas.getContext('2d');

    bctx.fillStyle = '#18181b';
    bctx.fillRect(0, 0, 512, 680);

    // 긴 생머리
    bctx.fillStyle = '#1e1b2e';
    bctx.beginPath();
    bctx.moveTo(70, 0);
    bctx.lineTo(442, 0);
    bctx.lineTo(420, 600);
    bctx.quadraticCurveTo(256, 640, 92, 600);
    bctx.closePath();
    bctx.fill();

    // 머릿결 하이라이트
    bctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    bctx.lineWidth = 4;
    for (let x = 140; x <= 370; x += 35) {
      bctx.beginPath();
      bctx.moveTo(x, 40);
      bctx.lineTo(x + (x > 256 ? 15 : -15), 560);
      bctx.stroke();
    }

    // 치마 밑단 붉은 라인 (뒷면)
    bctx.fillStyle = '#e11d48';
    bctx.fillRect(40, 630, 432, 7);
    bctx.fillRect(40, 650, 432, 7);

    // 1-3. 측면 (Side Face) 텍스처
    const sideCanvas = document.createElement('canvas');
    sideCanvas.width = 256;
    sideCanvas.height = 680;
    const sctx = sideCanvas.getContext('2d');

    sctx.fillStyle = '#18181b';
    sctx.fillRect(0, 0, 256, 680);

    // 측면 머리카락
    sctx.fillStyle = '#1e1b2e';
    sctx.fillRect(100, 0, 156, 580);

    // 소매 붉은 라인
    sctx.fillStyle = '#e11d48';
    sctx.fillRect(30, 480, 196, 6);
    sctx.fillRect(30, 498, 196, 6);

    // 치마 밑단 라인
    sctx.fillRect(20, 630, 216, 7);
    sctx.fillRect(20, 650, 216, 7);

    // Three.js 텍스처 생성
    const frontTex = new THREE.CanvasTexture(frontCanvas);
    const backTex = new THREE.CanvasTexture(backCanvas);
    const sideTex = new THREE.CanvasTexture(sideCanvas);

    [frontTex, backTex, sideTex].forEach(t => {
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
    });

    return { frontTex, backTex, sideTex };
  }

  // 2. 재사용 가능한 메쉬/머티리얼 캐시 초기화
  function initCache() {
    if (cachedMaterials && cachedGeometries) return;

    const textures = createJTFTextures();

    // 큐브 6면 머티리얼: [우, 좌, 상, 하, 전, 후]
    const bodyMaterials = [
      new THREE.MeshStandardMaterial({ map: textures.sideTex, roughness: 0.7, metalness: 0.1 }), // 우
      new THREE.MeshStandardMaterial({ map: textures.sideTex, roughness: 0.7, metalness: 0.1 }), // 좌
      new THREE.MeshStandardMaterial({ color: 0x1e1b2e, roughness: 0.6 }), // 상 (머리 꼭대기)
      new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 }), // 하
      new THREE.MeshStandardMaterial({ map: textures.frontTex, roughness: 0.6, metalness: 0.1 }), // 전면 (세일러복)
      new THREE.MeshStandardMaterial({ map: textures.backTex, roughness: 0.6, metalness: 0.1 })  // 후면 (긴 생머리)
    ];

    cachedMaterials = {
      body: bodyMaterials,
      // 베레모 머티리얼 (고급스러운 매트 블랙)
      beret: new THREE.MeshStandardMaterial({
        color: 0x18181b,
        roughness: 0.85,
        metalness: 0.1
      }),
      // 베레모 측면 뱃지 (실버/레드)
      badge: new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.8,
        roughness: 0.2
      }),
      badgeRed: new THREE.MeshBasicMaterial({
        color: 0xe11d48
      }),
      // 헤일로 (자체 발광 핑크빛 붉은색 네온 링)
      halo: new THREE.MeshBasicMaterial({
        color: 0xff385c,
        transparent: true,
        opacity: 0.95
      }),
      haloGlow: new THREE.MeshBasicMaterial({
        color: 0xff4d6d,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
      }),
      // 그림자
      shadow: new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.45
      })
    };

    cachedGeometries = {
      // 본체 직육면체 큐브 (너비 1.0, 높이 1.35, 깊이 0.65)
      body: new THREE.BoxGeometry(1.0, 1.35, 0.65),
      // 베레모 3D 크라운 (도톰한 원반형)
      beretCrown: new THREE.CylinderGeometry(0.55, 0.62, 0.18, 32),
      // 베레모 윗단 볼록 캡
      beretTop: new THREE.SphereGeometry(0.56, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.4),
      // 뱃지
      badge: new THREE.BoxGeometry(0.08, 0.12, 0.04),
      badgeRed: new THREE.BoxGeometry(0.05, 0.05, 0.05),
      // 3D 링 헤일로 (도넛 형태 토러스)
      halo: new THREE.TorusGeometry(0.42, 0.045, 16, 48),
      haloOuter: new THREE.TorusGeometry(0.43, 0.085, 12, 36),
      // 바닥 그림자
      shadow: new THREE.PlaneGeometry(1.5, 1.0)
    };
  }

  // 3. 정실부 모브 3D 복합 메쉬(Group) 생성 팩토리
  function createMobObject() {
    initCache();

    const root = new THREE.Group();

    // 3-1. 본체 큐브
    const bodyMesh = new THREE.Mesh(cachedGeometries.body, cachedMaterials.body);
    bodyMesh.position.y = 0.675; // 발바닥이 Y=0에 닿도록
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    root.add(bodyMesh);

    // 3-2. 검은색 베레모 (머리 큐브 상단에 완전히 밀착하여 결합)
    const beretGroup = new THREE.Group();
    // bodyMesh(높이 1.35)의 윗면(y=0.675)에 빈틈없이 푹 눌러 씌움
    beretGroup.position.set(0.04, 0.63, -0.02);
    beretGroup.rotation.z = -0.12; // 우측으로 자연스럽게 삐딱
    beretGroup.rotation.x = -0.04;

    const beretCrown = new THREE.Mesh(cachedGeometries.beretCrown, cachedMaterials.beret);
    const beretTop = new THREE.Mesh(cachedGeometries.beretTop, cachedMaterials.beret);
    beretTop.position.y = 0.07;

    // 베레모 측면 은색/레드 뱃지
    const badge = new THREE.Mesh(cachedGeometries.badge, cachedMaterials.badge);
    badge.position.set(0.56, 0, 0.1);
    badge.rotation.y = Math.PI * 0.45;

    const badgeRed = new THREE.Mesh(cachedGeometries.badgeRed, cachedMaterials.badgeRed);
    badgeRed.position.set(0.57, 0, 0.1);
    badgeRed.rotation.y = Math.PI * 0.45;

    beretGroup.add(beretCrown);
    beretGroup.add(beretTop);
    beretGroup.add(badge);
    beretGroup.add(badgeRed);
    // bodyMesh의 자식으로 등록하여 바운스/호흡 시 일체화
    bodyMesh.add(beretGroup);

    // 3-3. 핑크빛 붉은색 링 헤일로 (베레모 위 공중에 비스듬히 부유)
    const haloGroup = new THREE.Group();
    haloGroup.position.set(0.1, 1.82, -0.06);
    haloGroup.rotation.x = Math.PI * 0.22; // 앞뒤로 비스듬히 눕힘
    haloGroup.rotation.y = -Math.PI * 0.08;

    const haloMesh = new THREE.Mesh(cachedGeometries.halo, cachedMaterials.halo);
    const haloGlowMesh = new THREE.Mesh(cachedGeometries.haloOuter, cachedMaterials.haloGlow);
    haloGroup.add(haloMesh);
    haloGroup.add(haloGlowMesh);

    // 헤일로 자체 핑크빛 점광원
    const haloLight = new THREE.PointLight(0xff385c, 0.8, 2.5);
    haloLight.position.set(0, 0, 0);
    haloGroup.add(haloLight);

    root.add(haloGroup);

    // 3-4. 바닥 동적 타원 그림자
    const shadowMesh = new THREE.Mesh(cachedGeometries.shadow, cachedMaterials.shadow);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.01;
    root.add(shadowMesh);

    // 상태 바인딩
    root.userData = {
      bodyMesh,
      beretGroup,
      haloGroup,
      shadowMesh,
      animTime: 0,
      baseHaloY: 1.82,
      isMoving: false,
      speed: 4.5,
      targetRotationY: 0
    };

    // 업데이트 함수 (걷기, 달리기, 점프 완벽 지원)
    root.update = function(delta, isMoving = false, isRunning = false, isJumping = false) {
      this.userData.animTime += delta;
      const t = this.userData.animTime;

      // 1. 헤일로 공중 부유 (위아래 살랑살랑)
      const haloBob = isJumping ? Math.sin(t * 6.0) * 0.08 : Math.sin(t * 3.0) * 0.06;
      this.userData.haloGroup.position.y = this.userData.baseHaloY + haloBob;
      this.userData.haloGroup.rotation.z = Math.sin(t * 1.5) * 0.05;

      // 2. 모션 애니메이션 (점프 vs 달리기 vs 걷기 vs 대기)
      if (isJumping) {
        // 점프 중: 공중에 뜬 상태 유지 및 이동 중이면 약간 앞으로 기울임
        this.userData.bodyMesh.position.y = 0.675;
        this.userData.bodyMesh.rotation.x = isMoving ? 0.12 : 0;
      } else if (isMoving) {
        // 달리기 vs 걷기 속도 및 바운스 차이
        const freq = isRunning ? 18.0 : 12.0;
        const amp = isRunning ? 0.16 : 0.11;
        const lean = isRunning ? 0.18 : 0.09;

        const walkBob = Math.abs(Math.sin(t * freq)) * amp;
        this.userData.bodyMesh.position.y = 0.675 + walkBob;
        this.userData.bodyMesh.rotation.x = lean;

        // 지면 이동 시 그림자 미세 반응
        const scale = 1.0 - (walkBob * 0.5);
        this.userData.shadowMesh.scale.set(scale, scale, 1.0);
      } else {
        // 대기 (숨쉬기)
        const breath = Math.sin(t * 2.5) * 0.02;
        this.userData.bodyMesh.position.y = 0.675 + breath;
        this.userData.bodyMesh.rotation.x = 0;
        this.userData.shadowMesh.scale.set(1.0, 1.0, 1.0);
      }

      // 3. 방향 전환 최단 각도 보간 (360도 뺑글 회전 버그 원천 차단)
      let diff = this.userData.targetRotationY - root.rotation.y;
      diff = ((diff + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      root.rotation.y += diff * 0.25; // 기민하고 매끄러운 방향 전환

      // 4. 턴할 때 자연스러운 코너링 뱅킹(좌우 기울기)
      const rollFactor = isRunning ? 0.45 : 0.35;
      const rollTarget = isMoving ? Math.max(-0.2, Math.min(0.2, -diff * rollFactor)) : 0;
      root.rotation.z += (rollTarget - root.rotation.z) * 0.2;
    };

    return root;
  }

  return {
    createMobObject
  };
})();

if (typeof window !== 'undefined') {
  window.JTFMob3D = JTFMob3D;
}
