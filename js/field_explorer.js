// ===================================================================
// SCHALE FIELD EXPLORER (샬레 3D 실내 탐험 엔진)
// - 10층 업무관 (Office Tower 10F) & 생활관 (Living Quarters)
// - 실시간 존(구역) 전환, [Z]키 상호작용, 3D JTF 모브 조작
// ===================================================================

class SchaleFieldExplorer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('[SCHALE FIELD] Container not found:', containerId);
      return;
    }

    // 현재 구역 상태 ('office_10f' | 'living_quarters')
    this.currentZone = 'office_10f';

    // 씬 및 렌더러
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.animId = null;

    // 플레이어 (정실부 모브 3D)
    this.player = null;
    this.playerPos = new THREE.Vector3(0, 0, 10); // 로비 스폰 위치
    this.playerVel = new THREE.Vector3(0, 0, 0);
    this.playerYaw = 0;
    this.targetYaw = 0;
    this.isGrounded = true;
    this.moveSpeed = 10.5;
    this.sprintSpeed = 17.5;

    // 카메라 오프셋
    this.camOffset = new THREE.Vector3(0, 6.2, 10.5);
    this.camLookOffset = new THREE.Vector3(0, 1.8, 0);

    // 충돌 박스 목록
    this.colliders = [];

    // 상호작용 트리거 포인트 목록
    this.interactables = [];
    this.activeInteractable = null;

    // 조작 키 상태
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      jump: false,
      interact: false
    };

    // UI 엘리먼트 참조
    this.promptEl = document.getElementById('field-interact-prompt');
    this.promptTextEl = document.getElementById('field-interact-text');
    this.posHudEl = document.getElementById('field-pos-hud');
    this.zoneTitleEl = document.getElementById('schale-zone-title');
    this.zoneSubEl = document.getElementById('schale-zone-sub');
    this.statusTextEl = document.getElementById('schale-status-text');

    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    this.setupScene();
    this.setupLighting();
    this.loadZone(this.currentZone);
    this.setupPlayer();
    this.setupControls();
    this.onWindowResize();
    window.addEventListener('resize', () => this.onWindowResize());
  }

  // 1. 씬 및 렌더러 초기화
  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdbeafe); // 맑은 샬레 하늘빛 배경
    this.scene.fog = new THREE.FogExp2(0xdbeafe, 0.008);

    const w = this.container.clientWidth || window.innerWidth || 1280;
    const h = this.container.clientHeight || window.innerHeight || 720;
    const aspect = w / h;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 기존 캔버스 정리 후 추가
    const oldCanvas = this.container.querySelector('canvas');
    if (oldCanvas) oldCanvas.remove();
    this.container.appendChild(this.renderer.domElement);
  }

  // 2. 조명 설정 (밝고 화사한 애니메이션 풍 채광)
  setupLighting() {
    // 앰비언트 라이트 (부드러운 하늘빛 반사)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    // 태양광 / 주 광원
    this.sunLight = new THREE.DirectionalLight(0xffffff, 0.95);
    this.sunLight.position.set(30, 60, 40);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 180;
    const d = 50;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.scene.add(this.sunLight);

    // 실내 보조광 (블루 틴트 림라이트)
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
    fillLight.position.set(-30, 20, -30);
    this.scene.add(fillLight);
  }

  // 3. 존(구역) 데이터 빌드 & 로드
  loadZone(zoneName) {
    this.currentZone = zoneName;

    // 기존 환경 오브젝트 제거 (플레이어 및 기본 라이트 제외)
    const toRemove = [];
    this.scene.traverse((obj) => {
      if (obj.userData && obj.userData.isEnvironment) {
        toRemove.push(obj);
      }
    });
    toRemove.forEach(obj => this.scene.remove(obj));

    this.colliders = [];
    this.interactables = [];

    if (zoneName === 'office_10f') {
      this.buildOffice10F();
      if (this.zoneTitleEl) this.zoneTitleEl.textContent = '샬레 업무관 10층 (중앙 로비 & 집무실)';
      if (this.zoneSubEl) this.zoneSubEl.textContent = 'SCHALE OFFICE TOWER // 10F';
      if (this.statusTextEl) this.statusTextEl.textContent = '샬레 본부: 자유롭게 이동하며 업무 시설과 상호작용하십시오.';
    } else if (zoneName === 'living_quarters') {
      this.buildLivingQuarters();
      if (this.zoneTitleEl) this.zoneTitleEl.textContent = '샬레 생활관 (분수 라운지 & 편의 복지관)';
      if (this.zoneSubEl) this.zoneSubEl.textContent = 'SCHALE RESIDENCE & WELFARE // 1F';
      if (this.statusTextEl) this.statusTextEl.textContent = '샬레 생활관: 편의점, 식당, 분수대 라운지에서 휴식을 취하십시오.';
    }
  }

  // ===================================================================
  // 🏢 1. 샬레 업무관 10층 빌드
  // ===================================================================
  buildOffice10F() {
    const envGroup = new THREE.Group();
    envGroup.userData = { isEnvironment: true };

    // 바닥 기본 베이스 (대형 오피스 바닥: 100 x 80m)
    const floorGeo = new THREE.PlaneGeometry(100, 80);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.25,
      metalness: 0.05
    });
    const mainFloor = new THREE.Mesh(floorGeo, floorMat);
    mainFloor.rotation.x = -Math.PI / 2;
    mainFloor.receiveShadow = true;
    envGroup.add(mainFloor);

    // 방별 전용 바닥 타일
    // 1) 중앙 로비 (하늘색/화이트 기하학 패턴)
    this.addColoredZoneFloor(envGroup, 0, 8, 30, 24, 0xe0f2fe);
    // 2) 전술 작전실 (어두운 테크 그레이)
    this.addColoredZoneFloor(envGroup, 0, -18, 32, 24, 0x1e293b);
    // 3) 선생님 집무실 (따뜻한 우드 카펫 톤)
    this.addColoredZoneFloor(envGroup, -32, -20, 24, 18, 0xf1f5f9);
    // 4) 대형 브리핑 룸 (차분한 네이비 블루)
    this.addColoredZoneFloor(envGroup, -32, 6, 24, 24, 0x0f172a);
    // 5) 오픈 오피스 (청결한 화이트 그레이)
    this.addColoredZoneFloor(envGroup, -12, 6, 18, 20, 0xf8fafc);
    // 6) 실내 체육관 (체육관 원목 하드우드 톤)
    this.addColoredZoneFloor(envGroup, 34, -14, 24, 28, 0xfef3c7);

    // 외벽 및 경계선
    this.buildRoomWalls(envGroup);

    // 가구 및 룸별 랜드마크 프랍 배치
    this.populateOfficeProps(envGroup);

    this.scene.add(envGroup);
  }

  // 10층 벽면 및 문 개구부 생성
  buildRoomWalls(envGroup) {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.4
    });

    // 외곽 벽
    this.addWall(envGroup, 0, -32, 100, 5, 0.8, wallMat); // 북쪽 외벽
    this.addWall(envGroup, 0, 22, 100, 5, 0.8, wallMat);  // 남쪽 외벽
    this.addWall(envGroup, -48, -5, 0.8, 5, 54, wallMat); // 서쪽 외벽
    this.addWall(envGroup, 48, -5, 0.8, 5, 54, wallMat);  // 동쪽 외벽

    // 선생님 집무실 통유리창 (서북쪽 전망)
    this.addWall(envGroup, -32, -31.6, 22, 4.2, 0.4, glassMat);

    // 방 구획벽들 (통로 통과를 위해 중간을 비움)
    // 1) 작전실 남쪽 벽 (중앙 문 폭 8m 뚫림)
    this.addWall(envGroup, -11, -6, 10, 4, 0.6, wallMat);
    this.addWall(envGroup, 11, -6, 10, 4, 0.6, wallMat);

    // 2) 집무실 동쪽 벽
    this.addWall(envGroup, -20, -20, 0.6, 4, 18, wallMat);

    // 3) 브리핑룸 동쪽 벽
    this.addWall(envGroup, -20, 6, 0.6, 4, 22, wallMat);

    // 4) 체육관 서쪽 벽 (출입문 뚫림)
    this.addWall(envGroup, 22, -22, 0.6, 4, 12, wallMat);
    this.addWall(envGroup, 22, -6, 0.6, 4, 12, wallMat);
  }

  // 10층 프랍 및 인터랙션 포인트
  populateOfficeProps(envGroup) {
    // -------------------------------------------------------------
    // ① 전술 작전실: 거대 원형 링 플랫폼 & 전술 홀로그램 모니터
    // -------------------------------------------------------------
    const ringGeo = new THREE.RingGeometry(5.5, 6.2, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.set(0, 0.05, -18);
    envGroup.add(ringMesh);

    // 원형 중앙 홀로그램 코어
    const coreGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.4, 32);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.8 });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, 0.2, -18);
    envGroup.add(coreMesh);

    // 전술 작전실 대형 스크린 (북쪽 벽)
    const screenGeo = new THREE.PlaneGeometry(16, 6);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x0369a1 });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 3.5, -31.4);
    envGroup.add(screenMesh);

    // 작전실 상호작용 트리거: [Z] 전술 작전 출격!
    this.addInteractable({
      id: 'tactical_dispatch',
      pos: new THREE.Vector3(0, 0, -18),
      radius: 4.5,
      label: '[Z] 전술 작전 지휘 콘솔 (키보토스 자치구 탐사 출격)',
      action: () => {
        const modal = document.getElementById('bounty-modal');
        if (modal) modal.classList.remove('hidden');
      }
    }, envGroup, 0x38bdf8);

    // -------------------------------------------------------------
    // ② 선생님 집무실: 책상, 화이트 소파, 통유리창
    // -------------------------------------------------------------
    // 집무실 책상
    const deskGeo = new THREE.BoxGeometry(4.5, 1.2, 2.2);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(-32, 0.6, -26);
    desk.castShadow = true;
    envGroup.add(desk);
    this.addBoxCollider(-32, -26, 4.5, 2.2);

    // 접대용 화이트 소파
    const sofaGeo = new THREE.BoxGeometry(4, 1.0, 1.8);
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
    const sofa = new THREE.Mesh(sofaGeo, sofaMat);
    sofa.position.set(-32, 0.5, -18);
    sofa.castShadow = true;
    envGroup.add(sofa);

    // 집무실 상호작용: [Z] 선생님 집무 데스크
    this.addInteractable({
      id: 'sensei_desk',
      pos: new THREE.Vector3(-32, 0, -23.5),
      radius: 3.2,
      label: '[Z] 선생님 집무 데스크 (샬레 공문 & 모모톡 확인)',
      action: () => {
        alert('📋 [샬레 집무 단말기]\n\n"선생님, 트리니티와 밀레니엄에서 정기 보고서가 도착해 있습니다.\n전술 작전실의 원형 덱에서 긴급 출격 임무를 승인할 수 있습니다."');
      }
    }, envGroup, 0xf59e0b);

    // -------------------------------------------------------------
    // ③ 중앙 로비 & 보안 개찰구
    // -------------------------------------------------------------
    // 보안 게이트 프랍
    for (let i = -3; i <= 3; i += 2) {
      const gateGeo = new THREE.BoxGeometry(0.4, 1.4, 2.5);
      const gateMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
      const gate = new THREE.Mesh(gateGeo, gateMat);
      gate.position.set(12, 0.7, 8 + i * 1.5);
      envGroup.add(gate);
      this.addBoxCollider(12, 8 + i * 1.5, 0.4, 2.5);
    }

    // -------------------------------------------------------------
    // ④ 실내 체육관: 농구대 & 코트
    // -------------------------------------------------------------
    const hoopPoleGeo = new THREE.CylinderGeometry(0.12, 0.12, 4.5);
    const hoopPoleMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
    const hoopPole = new THREE.Mesh(hoopPoleGeo, hoopPoleMat);
    hoopPole.position.set(44, 2.25, -20);
    envGroup.add(hoopPole);

    const backboardGeo = new THREE.BoxGeometry(0.1, 1.5, 2.2);
    const backboardMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const backboard = new THREE.Mesh(backboardGeo, backboardMat);
    backboard.position.set(43.8, 3.8, -20);
    envGroup.add(backboard);

    this.addInteractable({
      id: 'gym_court',
      pos: new THREE.Vector3(34, 0, -14),
      radius: 3.5,
      label: '[Z] 샬레 실내 코트 (체력 단련)',
      action: () => {
        alert('🏀 [샬레 체육관]\n\n밀레니엄과 트리니티 학생들이 가끔 배드민턴이나 농구를 치러 오는 실내 코트입니다.');
      }
    }, envGroup, 0x10b981);

    // -------------------------------------------------------------
    // 🚪 ⑤ 생활관 연결 출입문 (우측 남쪽 통로)
    // -------------------------------------------------------------
    const doorFrameGeo = new THREE.BoxGeometry(4.2, 4.0, 0.5);
    const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6 });
    const doorFrame = new THREE.Mesh(doorFrameGeo, doorFrameMat);
    doorFrame.position.set(40, 2.0, 18);
    envGroup.add(doorFrame);

    this.addInteractable({
      id: 'door_to_living',
      pos: new THREE.Vector3(40, 0, 16.5),
      radius: 3.0,
      label: '🚪 [Z] 샬레 생활관으로 이동 (편의점/식당/휴게실)',
      action: () => {
        this.transitionToZone('living_quarters', new THREE.Vector3(0, 0, 12));
      }
    }, envGroup, 0x38bdf8);
  }

  // ===================================================================
  // ☕ 2. 샬레 생활관 (Living Quarters) 빌드
  // ===================================================================
  buildLivingQuarters() {
    const envGroup = new THREE.Group();
    envGroup.userData = { isEnvironment: true };

    // 바닥 베이스
    const floorGeo = new THREE.PlaneGeometry(100, 80);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });
    const mainFloor = new THREE.Mesh(floorGeo, floorMat);
    mainFloor.rotation.x = -Math.PI / 2;
    mainFloor.receiveShadow = true;
    envGroup.add(mainFloor);

    // 구역별 컬러 바닥
    // 1) 중앙 라운지 & 수로 (산뜻한 아쿠아 블루)
    this.addColoredZoneFloor(envGroup, -10, 0, 36, 32, 0xe0f2fe);
    // 2) 엔젤24 편의점 (밝은 스카이블루 타일)
    this.addColoredZoneFloor(envGroup, -34, 18, 22, 20, 0xbae6fd);
    // 3) 게이밍/오락실 (네온 퍼플)
    this.addColoredZoneFloor(envGroup, 4, 18, 24, 20, 0xfae8ff);
    // 4) 식당 & 카페테리아 (따뜻한 베이지 우드)
    this.addColoredZoneFloor(envGroup, 32, 8, 26, 36, 0xfef3c7);
    // 5) 피트니스 헬스장 (다크 그레이)
    this.addColoredZoneFloor(envGroup, 24, -22, 28, 22, 0x334155);

    // 생활관 외벽 및 내부 파티션
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    this.addWall(envGroup, 0, -33, 100, 4.5, 0.8, wallMat);
    this.addWall(envGroup, 0, 29, 100, 4.5, 0.8, wallMat);
    this.addWall(envGroup, -49, -2, 0.8, 4.5, 62, wallMat);
    this.addWall(envGroup, 49, -2, 0.8, 4.5, 62, wallMat);

    // -------------------------------------------------------------
    // ① 중앙 실내 분수대 & 소파 라운지
    // -------------------------------------------------------------
    const fountainBaseGeo = new THREE.CylinderGeometry(5.0, 5.5, 0.6, 8);
    const fountainMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const fountainBase = new THREE.Mesh(fountainBaseGeo, fountainMat);
    fountainBase.position.set(-10, 0.3, 0);
    envGroup.add(fountainBase);
    this.addBoxCollider(-10, 0, 6, 6);

    // 분수대 물
    const waterGeo = new THREE.CircleGeometry(4.6, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.75
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(-10, 0.62, 0);
    envGroup.add(water);

    // 분수 라운지 휴식 트리거
    this.addInteractable({
      id: 'fountain_rest',
      pos: new THREE.Vector3(-10, 0, 6.0),
      radius: 3.2,
      label: '⛲ [Z] 분수대 라운지에서 휴식 (체력 회복)',
      action: () => {
        alert('✨ [분수 라운지]\n\n시원한 물소리를 들으며 편안한 소파에서 휴식을 취했습니다. 모브의 피로가 회복됩니다!');
      }
    }, envGroup, 0x0284c7);

    // -------------------------------------------------------------
    // ② 샬레 매점 / 엔젤 24 편의점
    // -------------------------------------------------------------
    // 진열대 랙 2개
    for (let z = 14; z <= 22; z += 5) {
      const shelfGeo = new THREE.BoxGeometry(6.5, 1.8, 1.2);
      const shelfMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
      const shelf = new THREE.Mesh(shelfGeo, shelfMat);
      shelf.position.set(-34, 0.9, z);
      envGroup.add(shelf);
      this.addBoxCollider(-34, z, 6.5, 1.2);
    }

    this.addInteractable({
      id: 'angel24_store',
      pos: new THREE.Vector3(-34, 0, 10.5),
      radius: 3.2,
      label: '🏪 [Z] 엔젤 24 편의점 (간식 & 보급품)',
      action: () => {
        alert('🏪 [엔젤 24 샬레 지점]\n\n"선생님, 어서 오세요! 한정판 야키소바빵과 딸기 우유가 준비되어 있습니다."');
      }
    }, envGroup, 0x38bdf8);

    // -------------------------------------------------------------
    // ③ 게이밍 라운지 & 오락실
    // -------------------------------------------------------------
    const arcadeGeo = new THREE.BoxGeometry(1.6, 2.4, 1.4);
    const arcadeMat = new THREE.MeshStandardMaterial({ color: 0xd946ef, roughness: 0.3 });
    const arcade = new THREE.Mesh(arcadeGeo, arcadeMat);
    arcade.position.set(4, 1.2, 24);
    envGroup.add(arcade);
    this.addBoxCollider(4, 24, 1.6, 1.4);

    this.addInteractable({
      id: 'arcade_game',
      pos: new THREE.Vector3(4, 0, 20),
      radius: 3.0,
      label: '🎮 [Z] 오락실 아케이드 머신 (기분 전환)',
      action: () => {
        alert('👾 [게임 개발부의 최신작]\n\n유즈와 미도리가 설치해 둔 최신 레트로 격투 게임을 플레이했습니다!');
      }
    }, envGroup, 0xd946ef);

    // -------------------------------------------------------------
    // ④ 식당 & 카페테리아
    // -------------------------------------------------------------
    const diningTableGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.9, 16);
    const diningTableMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
    const table = new THREE.Mesh(diningTableGeo, diningTableMat);
    table.position.set(32, 0.45, 12);
    envGroup.add(table);
    this.addBoxCollider(32, 12, 3.2, 3.2);

    this.addInteractable({
      id: 'cafeteria',
      pos: new THREE.Vector3(32, 0, 7),
      radius: 3.2,
      label: '🍽️ [Z] 샬레 카페테리아 식당 (당직 식사)',
      action: () => {
        alert('🍱 [샬레 카페테리아]\n\n후우카의 특제 균형 식단 도시락이 보관되어 있습니다.');
      }
    }, envGroup, 0xf59e0b);

    // -------------------------------------------------------------
    // 🚪 ⑤ 10층 업무관으로 복귀하는 문
    // -------------------------------------------------------------
    const returnDoorGeo = new THREE.BoxGeometry(4.2, 4.0, 0.5);
    const returnDoorMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6 });
    const returnDoor = new THREE.Mesh(returnDoorGeo, returnDoorMat);
    returnDoor.position.set(0, 2.0, -32);
    envGroup.add(returnDoor);

    this.addInteractable({
      id: 'door_to_office',
      pos: new THREE.Vector3(0, 0, -30),
      radius: 3.2,
      label: '🚪 [Z] 샬레 업무관 10층으로 복귀',
      action: () => {
        this.transitionToZone('office_10f', new THREE.Vector3(40, 0, 13));
      }
    }, envGroup, 0x38bdf8);

    this.scene.add(envGroup);
  }

  // 헬퍼: 구역별 컬러 바닥 타일 추가
  addColoredZoneFloor(parent, x, z, w, h, colorHex) {
    const geo = new THREE.PlaneGeometry(w, h);
    const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.35 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.02, z);
    mesh.receiveShadow = true;
    parent.add(mesh);
  }

  // 헬퍼: 벽 생성 및 콜라이더 자동 등록
  addWall(parent, x, z, w, h, d, mat) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, h / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);

    this.addBoxCollider(x, z, w, d);
  }

  // 콜라이더 등록
  addBoxCollider(x, z, w, d) {
    this.colliders.push({
      minX: x - w / 2,
      maxX: x + w / 2,
      minZ: z - d / 2,
      maxZ: z + d / 2
    });
  }

  // 상호작용 트리거 등록 (빛나는 바닥 링 포함)
  addInteractable(config, parent, colorHex = 0x38bdf8) {
    // 바닥 빛나는 원형 마커
    const ringGeo = new THREE.RingGeometry(config.radius * 0.45, config.radius * 0.6, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(config.pos);
    ring.position.y = 0.06;
    parent.add(ring);

    this.interactables.push({
      ...config,
      ringMesh: ring
    });
  }

  // ===================================================================
  // 4. 플레이어 설정 (정실부 모브 3D)
  // ===================================================================
  setupPlayer() {
    this.player = new THREE.Group();

    if (typeof JTFMob3D !== 'undefined' && typeof JTFMob3D.createMobObject === 'function') {
      this.mobObject = JTFMob3D.createMobObject();
      this.player.add(this.mobObject);
    } else if (typeof createJTFMob3DModel === 'function') {
      this.mobObject = createJTFMob3DModel();
      this.player.add(this.mobObject);
    } else {
      // 대체 큐브
      const fallbackGeo = new THREE.BoxGeometry(1, 2, 1);
      const fallbackMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
      this.player.add(new THREE.Mesh(fallbackGeo, fallbackMat));
    }

    this.player.position.copy(this.playerPos);
    this.scene.add(this.player);
  }

  // 존 전환 트랜지션 (페이드 효과)
  transitionToZone(targetZone, spawnPos) {
    console.log('[SCHALE] 존 전환:', targetZone);
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = '#0f172a';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.28s ease';
    overlay.style.zIndex = '99999';
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });

    setTimeout(() => {
      this.loadZone(targetZone);
      this.playerPos.copy(spawnPos);
      this.player.position.copy(this.playerPos);

      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 300);
    }, 280);
  }

  // ===================================================================
  // 5. 키보드 조작 및 입력 리스너
  // ===================================================================
  setupControls() {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  handleKeyDown(e) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.sprint = true;
        break;
      case 'Space':
        if (this.isGrounded) {
          this.playerVel.y = 8.5;
          this.isGrounded = false;
        }
        break;
      case 'KeyZ':
        if (this.activeInteractable && this.activeInteractable.action) {
          this.activeInteractable.action();
        }
        break;
    }
  }

  handleKeyUp(e) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.sprint = false;
        break;
    }
  }

  // ===================================================================
  // 6. 메인 업데이트 루프 & 물리
  // ===================================================================
  update(delta) {
    if (!this.player) return;

    // 1) 이동 벡터 계산
    const moveDir = new THREE.Vector3(0, 0, 0);
    if (this.keys.forward) moveDir.z -= 1;
    if (this.keys.backward) moveDir.z += 1;
    if (this.keys.left) moveDir.x -= 1;
    if (this.keys.right) moveDir.x += 1;

    const speed = this.keys.sprint ? this.sprintSpeed : this.moveSpeed;

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      this.targetYaw = Math.atan2(moveDir.x, moveDir.z);

      const nextX = this.playerPos.x + moveDir.x * speed * delta;
      const nextZ = this.playerPos.z + moveDir.z * speed * delta;

      // 충돌 판정
      if (!this.checkCollision(nextX, this.playerPos.z)) {
        this.playerPos.x = nextX;
      }
      if (!this.checkCollision(this.playerPos.x, nextZ)) {
        this.playerPos.z = nextZ;
      }
    }

    // 애니메이션 업데이트 (정실부 모브 보행/달리기/점프)
    const isMoving = moveDir.lengthSq() > 0;
    const isRunning = this.keys.sprint && isMoving;
    if (this.mobObject && typeof this.mobObject.updateAnimation === 'function') {
      this.mobObject.updateAnimation(delta, isMoving, isRunning, !this.isGrounded, !this.isGrounded);
    }

    // 부드러운 회전 보간
    let diffYaw = this.targetYaw - this.playerYaw;
    while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;
    while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
    this.playerYaw += diffYaw * Math.min(1, delta * 14);
    this.player.rotation.y = this.playerYaw;

    // 중력 및 점프
    if (!this.isGrounded) {
      this.playerVel.y -= 22 * delta;
      this.playerPos.y += this.playerVel.y * delta;
      if (this.playerPos.y <= 0) {
        this.playerPos.y = 0;
        this.playerVel.y = 0;
        this.isGrounded = true;
      }
    }

    this.player.position.copy(this.playerPos);

    // 카메라 3인칭 추적
    const targetCamPos = this.playerPos.clone().add(this.camOffset);
    this.camera.position.lerp(targetCamPos, delta * 7.5);
    const lookTarget = this.playerPos.clone().add(this.camLookOffset);
    this.camera.lookAt(lookTarget);

    // 상호작용 검사
    this.checkInteractables();

    // 좌표 HUD 업데이트
    if (this.posHudEl) {
      this.posHudEl.textContent = `위치: ${this.currentZone === 'office_10f' ? '10층 업무관' : '생활관'} | X: ${this.playerPos.x.toFixed(1)}, Z: ${this.playerPos.z.toFixed(1)}`;
    }
  }

  // 충돌 판정
  checkCollision(x, z) {
    const playerRadius = 0.55;
    for (const c of this.colliders) {
      if (
        x + playerRadius > c.minX &&
        x - playerRadius < c.maxX &&
        z + playerRadius > c.minZ &&
        z - playerRadius < c.maxZ
      ) {
        return true;
      }
    }
    return false;
  }

  // 상호작용 거리 검사
  checkInteractables() {
    let closest = null;
    let closestDist = Infinity;

    for (const item of this.interactables) {
      const dist = this.playerPos.distanceTo(item.pos);
      if (dist < item.radius && dist < closestDist) {
        closest = item;
        closestDist = dist;
      }

      // 바닥 링 살짝 펄스 애니메이션
      if (item.ringMesh) {
        const s = 1.0 + Math.sin(Date.now() * 0.005) * 0.08;
        item.ringMesh.scale.set(s, s, s);
      }
    }

    this.activeInteractable = closest;

    if (closest) {
      if (this.promptEl) this.promptEl.classList.remove('hidden');
      if (this.promptTextEl) this.promptTextEl.textContent = closest.label;
    } else {
      if (this.promptEl) this.promptEl.classList.add('hidden');
    }
  }

  // 화면 리사이즈
  onWindowResize() {
    if (!this.container || !this.camera || !this.renderer) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  start() {
    this.clock.start();
    const animate = () => {
      this.animId = requestAnimationFrame(animate);
      const delta = Math.min(this.clock.getDelta(), 0.1);
      this.update(delta);
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }
}

// 이전 코드 호환성용 별칭
window.SchaleFieldExplorer = SchaleFieldExplorer;
window.JTFFieldExplorer = SchaleFieldExplorer;
