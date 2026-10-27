// ==========================================
// KIVOTOS DISTRICT NODE & QUEST SYSTEM
// (자치구 세부 노드 크롤링 및 업무 퀘스트 엔진)
// ==========================================

class KivotosQuestSystem {
  constructor(mapRenderer) {
    this.map = mapRenderer;
    this.currentDistrict = null; // 'trinity'
    this.isZoomed = false;

    // 카메라 줌 상태
    this.zoomProgress = 0; // 0: 전역 지도, 1: 자치구 확대
    this.zoomTarget = { x: 378, y: 287, scale: 2.3 };

    // 플레이어 진행 상태
    this.activeQuests = [];
    this.currentNodeId = 'node_jtf_hq';

    // 노드 목록 (기본 시작 노드: 정의실현부 본부)
    this.nodes = [
      {
        id: 'node_jtf_hq',
        districtId: 'trinity',
        name: '정의실현부 본부',
        enName: 'J.T.F HEADQUARTERS',
        x: 378,
        y: 287,
        status: 'active', // 'active' (🔴), 'pending' (🟡), 'cleared' (🟢)
        type: 'start',
        desc: '정의실현부의 거점이자 훈련장. 새로운 작전과 치안 유지 요청이 접수되는 곳입니다.'
      }
    ];

    // 연결선 (Edges)
    this.connections = [];

    this.initUI();
  }

  initUI() {
    // 퀘스트 팝업 모달 엘리먼트 바인딩
    this.modal = document.getElementById('quest-modal');
    this.btnAccept = document.getElementById('btn-quest-accept');
    this.btnDecline = document.getElementById('btn-quest-decline');

    if (this.btnAccept) {
      this.btnAccept.addEventListener('click', () => {
        this.acceptQuest1();
      });
    }

    if (this.btnDecline) {
      this.btnDecline.addEventListener('click', () => {
        this.declineQuest1();
      });
    }
  }

  // 1. 트리니티 자치구로 줌인 (카메라 확대)
  enterDistrict(districtId) {
    this.currentDistrict = districtId;
    this.isZoomed = true;

    // 전술 HUD 상태 업데이트
    const phaseBadge = document.querySelector('.map-badge-phase');
    if (phaseBadge) {
      phaseBadge.innerText = 'TRINITY DISTRICT // SQUAD: JTF MOB';
      phaseBadge.style.color = '#38bdf8';
      phaseBadge.style.borderColor = '#38bdf8';
      phaseBadge.style.background = 'rgba(56, 189, 248, 0.12)';
    }

    const titleSub = document.querySelector('.map-title-sub');
    const titleMain = document.querySelector('.map-title-main');
    if (titleSub) titleSub.innerText = 'TRINITY OPERATION // DISTRICT NODE MAP';
    if (titleMain) titleMain.innerText = '트리니티 자치구 내부 작전 전개도';

    console.log(`[QUEST SYSTEM] ${districtId} 자치구 내부로 카메라 줌인 완료`);
  }

  // 2. 퀘스트 모달 열기
  openQuestModal(questData) {
    if (!this.modal) return;
    this.modal.classList.remove('hidden');

    const numTag = document.getElementById('quest-modal-num');
    const titleEl = document.getElementById('quest-modal-title');
    const descEl = document.getElementById('quest-modal-desc');

    if (numTag) numTag.innerText = `업무 #${questData.number} [외부 소탕 의뢰]`;
    if (titleEl) titleEl.innerText = questData.title;
    if (descEl) descEl.innerText = questData.desc;
  }

  closeQuestModal() {
    if (this.modal) {
      this.modal.classList.add('hidden');
    }
  }

  // 3-A. 업무 1 [수락] 시: 4코스 직렬 노드 자동 생성
  acceptQuest1() {
    this.closeQuestModal();

    // 시작 노드는 완료(🟢 초록) 상태로 전환
    const startNode = this.nodes.find(n => n.id === 'node_jtf_hq');
    if (startNode) startNode.status = 'cleared';

    // 퀘스트 추가
    this.activeQuests.push({
      id: 'quest_thug_01',
      title: '불량배 소탕 요청',
      coursesTotal: 4,
      currentCourse: 1
    });

    // 4개 코스 노드 생성 (앞 3개는 중간 단계, 4번째는 확정 보스전)
    // 트리니티 북서부 -> 외곽으로 이어지는 4코스 경로
    const courseNodes = [
      {
        id: 'node_thug_c1',
        districtId: 'trinity',
        name: '코스 1: 교정 외곽 정찰',
        enName: 'STAGE 1: PATROL PERIMETER',
        x: 320,
        y: 220,
        status: 'active', // 🔴 지금 바로 진행 가능한 다음 노드!
        type: 'scout',
        desc: '트리니티 교정 외곽 철조망 부근에서 불량배들의 이동 흔적을 정찰합니다.'
      },
      {
        id: 'node_thug_c2',
        districtId: 'trinity',
        name: '코스 2: 골목길 단서 수색',
        enName: 'STAGE 2: ALLEYWAY SEARCH',
        x: 270,
        y: 160,
        status: 'pending', // 🟡 대기/연속 노드
        type: 'investigate',
        desc: '외곽 상가 골목길에서 불량배들이 버리고 간 탄피와 흔적을 수색합니다.'
      },
      {
        id: 'node_thug_c3',
        districtId: 'trinity',
        name: '코스 3: 은신처 입구 봉쇄',
        enName: 'STAGE 3: BLOCKADE ENTRANCE',
        x: 230,
        y: 90,
        status: 'pending', // 🟡 대기/연속 노드
        type: 'skirmish',
        desc: '폐창고 은신처 입구에 배치된 경계조 불량배들을 기습 무력화합니다.'
      },
      {
        id: 'node_thug_c4_boss',
        districtId: 'trinity',
        name: '코스 4: 불량배 보스전 (확정)',
        enName: 'FINAL STAGE: THUG LEADER BOSS',
        x: 310,
        y: 40,
        status: 'pending', // 🟡 최종 목표
        type: 'boss',
        desc: '불량배 아지트 심장부에서 무장 불량배 두목을 소탕하고 업무를 완수합니다!'
      }
    ];

    // 노드 및 연결선 등록
    this.nodes.push(...courseNodes);
    this.connections.push(
      { from: 'node_jtf_hq', to: 'node_thug_c1' },
      { from: 'node_thug_c1', to: 'node_thug_c2' },
      { from: 'node_thug_c2', to: 'node_thug_c3' },
      { from: 'node_thug_c3', to: 'node_thug_c4_boss' }
    );

    // 퀘스트 트래커 HUD 갱신
    this.updateQuestHUD('진행 중: [업무 1] 불량배 소탕 요청 (코스 1/4 대기)');
    console.log('[QUEST SYSTEM] 업무 1 수락됨 -> 4코스 직렬 노드 자동 생성 완료!');
  }

  // 3-B. 업무 1 [거절] 시: 근처 3갈래 탐색 노드 생성
  declineQuest1() {
    this.closeQuestModal();

    // 시작 노드는 완료(🟢 초록) 상태로 전환
    const startNode = this.nodes.find(n => n.id === 'node_jtf_hq');
    if (startNode) startNode.status = 'cleared';

    // 근처에 기본 3갈래 노드 생성 (모두 🔴 진행 가능)
    const branchNodes = [
      {
        id: 'node_branch_1',
        districtId: 'trinity',
        name: '분기 A: 고딕 대성당 회랑',
        enName: 'BRANCH A: CATHEDRAL CORRIDOR',
        x: 460,
        y: 220,
        status: 'active', // 🔴
        type: 'event',
        desc: '정숙이 감도는 고딕 대성당 회랑을 수색하여 티파티 관계자와 접촉합니다.'
      },
      {
        id: 'node_branch_2',
        districtId: 'trinity',
        name: '분기 B: 중앙 분수 광장',
        enName: 'BRANCH B: FOUNTAIN PLAZA',
        x: 340,
        y: 380,
        status: 'active', // 🔴
        type: 'rest',
        desc: '학생들이 오가는 평화로운 중앙 분수대 광장에서 보급품을 점검합니다.'
      },
      {
        id: 'node_branch_3',
        districtId: 'trinity',
        name: '분기 C: 구교사 지하 카타콤',
        enName: 'BRANCH C: OLD SCHOOL CATACOMBS',
        x: 250,
        y: 350,
        status: 'active', // 🔴
        type: 'battle',
        desc: '접근이 통제된 어두운 구교사 지하 입구에서 정체불명의 소음을 조사합니다.'
      }
    ];

    this.nodes.push(...branchNodes);
    this.connections.push(
      { from: 'node_jtf_hq', to: 'node_branch_1' },
      { from: 'node_jtf_hq', to: 'node_branch_2' },
      { from: 'node_jtf_hq', to: 'node_branch_3' }
    );

    this.updateQuestHUD('자유 탐색 모드: 3갈래 분기 경로 중 하나를 선택하십시오.');
    console.log('[QUEST SYSTEM] 업무 거절됨 -> 주변 3갈래 분기 노드 생성 완료!');
  }

  // 4. 노드 클릭 이벤트 처리
  handleNodeClick(node) {
    if (!node) return;

    // 만약 시작 노드이고, 아직 퀘스트 결정을 안 했다면 팝업 띄우기
    if (node.id === 'node_jtf_hq' && node.status === 'active') {
      this.openQuestModal({
        number: 1,
        title: '정의실현부 불량배 소탕 요청',
        desc: '정의실현부에 외부에서 불량배 소탕 요청이 들어왔다. 최근 자치구 외곽에서 학생들을 위협하는 무장 불량배들의 은신처를 수색하여 진압하십시오.'
      });
      return;
    }

    // 활성화된(🔴) 노드 클릭 시: 캐릭터 이동 및 해당 노드 진입 피드백
    if (node.status === 'active') {
      this.currentNodeId = node.id;
      alert(`🚀 [거점 진입] ${node.name}\n\n정실부 모브가 해당 거점으로 이동하여 현장 작전을 준비합니다!\n(다음 단계: 현장 탐험 맵 진입)`);
    } else if (node.status === 'pending') {
      alert(`🔒 [선행 조건 필요] ${node.name}\n\n이 거점은 이전 코스를 완료해야 진행할 수 있습니다.`);
    } else if (node.status === 'cleared') {
      alert(`✅ [완료된 거점] ${node.name}\n\n이미 성공적으로 완수된 안전 구역입니다.`);
    }
  }

  updateQuestHUD(msg) {
    let hud = document.getElementById('active-quest-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'active-quest-hud';
      hud.className = 'active-quest-hud';
      const container = document.querySelector('.map-canvas-container');
      if (container) container.appendChild(hud);
    }
    hud.innerHTML = `📋 <strong>작전 현황:</strong> ${msg}`;
  }

  // 5. 캔버스 위에 3색 노드 렌더링 (Renderer의 render 루프에서 호출)
  renderNodes(ctx, mapRenderer) {
    if (!this.isZoomed) return;

    const time = mapRenderer.animTime;

    // 5-1. 연결선 (Edges) 렌더링
    ctx.save();
    for (const conn of this.connections) {
      const fromNode = this.nodes.find(n => n.id === conn.from);
      const toNode = this.nodes.find(n => n.id === conn.to);
      if (!fromNode || !toNode) continue;

      const p1 = mapRenderer.mapToCanvas(fromNode.x, fromNode.y);
      const p2 = mapRenderer.mapToCanvas(toNode.x, toNode.y);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);

      if (toNode.status === 'cleared') {
        ctx.strokeStyle = '#22c55e'; // 완료된 길
        ctx.lineWidth = 3 * mapRenderer.scale;
        ctx.setLineDash([]);
      } else if (toNode.status === 'active') {
        ctx.strokeStyle = '#ef4444'; // 지금 갈 수 있는 활성 길
        ctx.lineWidth = 3.5 * mapRenderer.scale;
        ctx.setLineDash([8 * mapRenderer.scale, 5 * mapRenderer.scale]);
      } else {
        ctx.strokeStyle = '#64748b'; // 대기 중인 길
        ctx.lineWidth = 2 * mapRenderer.scale;
        ctx.setLineDash([4 * mapRenderer.scale, 4 * mapRenderer.scale]);
      }
      ctx.stroke();
    }
    ctx.restore();

    // 5-2. 노드 (Circles) 렌더링 (🔴 빨강 / 🟡 노랑 / 🟢 초록)
    for (const node of this.nodes) {
      const pt = mapRenderer.mapToCanvas(node.x, node.y);
      const isCurrent = (this.currentNodeId === node.id);
      const r = 24 * mapRenderer.scale;

      ctx.save();

      // 색상 결정
      let fillColor = '#0f172a';
      let borderColor = '#ef4444';
      let glowColor = '#ef4444';

      if (node.status === 'active') {
        // 🔴 활성 / 진행 가능
        borderColor = '#ef4444';
        glowColor = '#ef4444';
        fillColor = 'rgba(239, 68, 68, 0.2)';
      } else if (node.status === 'pending') {
        // 🟡 대기 / 진행 중 / 재방문
        borderColor = '#eab308';
        glowColor = '#eab308';
        fillColor = 'rgba(234, 179, 8, 0.15)';
      } else if (node.status === 'cleared') {
        // 🟢 완료
        borderColor = '#22c55e';
        glowColor = '#22c55e';
        fillColor = 'rgba(34, 197, 94, 0.25)';
      }

      // 활성 노드 펄스 효과
      if (node.status === 'active') {
        const pulse = Math.sin(time * 3) * 6 * mapRenderer.scale;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.lineWidth = 2 * mapRenderer.scale;
        ctx.stroke();
      }

      // 노드 바디
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 3.5 * mapRenderer.scale;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 12 * mapRenderer.scale;
      ctx.stroke();

      // 노드 중앙 아이콘
      ctx.shadowBlur = 0;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${Math.round(14 * mapRenderer.scale)}px sans-serif`;

      let icon = '🎯';
      if (node.type === 'start') icon = '⭐';
      else if (node.type === 'boss') icon = '💀';
      else if (node.type === 'rest') icon = '☕';
      else if (node.type === 'investigate') icon = '🔍';
      else if (node.status === 'cleared') icon = '✓';

      ctx.fillText(icon, pt.x, pt.y);

      // 플레이어 현재 위치 마커 (정실부 3D 모브 핀)
      if (isCurrent) {
        ctx.font = `900 ${Math.round(11 * mapRenderer.scale)}px 'Noto Sans KR', sans-serif`;
        ctx.fillStyle = '#facc15';
        ctx.fillText('▲ [내 위치]', pt.x, pt.y - r - 12 * mapRenderer.scale);
      }

      // 노드 명칭 라벨
      ctx.font = `800 ${Math.round(11.5 * mapRenderer.scale)}px 'Noto Sans KR', sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(node.name, pt.x, pt.y + r + 15 * mapRenderer.scale);

      ctx.restore();
    }
  }

  // 마우스 클릭 시 노드 충돌 검사
  findNodeAt(canvasX, canvasY, mapRenderer) {
    if (!this.isZoomed) return null;

    for (const node of this.nodes) {
      const pt = mapRenderer.mapToCanvas(node.x, node.y);
      const r = 30 * mapRenderer.scale;
      const dx = canvasX - pt.x;
      const dy = canvasY - pt.y;
      if (dx * dx + dy * dy <= r * r) {
        return node;
      }
    }
    return null;
  }
}

if (typeof window !== 'undefined') {
  window.KivotosQuestSystem = KivotosQuestSystem;
}
