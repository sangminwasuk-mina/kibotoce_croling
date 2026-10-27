// ==========================================
// TRINITY LARGE DISTRICT CRAWLER MAP
// (트리니티 대형 자치구 풀스크린 탐험 지도 - 드래그/줌 & 노드 크롤링)
// ==========================================

class TrinityDistrictCrawler {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // 대형 가상 맵 크기 (2400 x 1800의 광활한 트리니티 자치구 전장)
    this.worldWidth = 2400;
    this.worldHeight = 1800;

    // 카메라 팬(드래그) & 줌(휠)
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;

    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this.animTime = 0;
    this.hoveredNode = null;
    this.currentNodeId = 'node_jtf_hq';

    // 퀘스트 및 노드 데이터
    this.nodes = [
      {
        id: 'node_jtf_hq',
        name: '정의실현부 본부 (출격 거점)',
        enName: 'J.T.F HEADQUARTERS',
        x: 1200,
        y: 1050,
        status: 'active', // 🔴 빨강 (시작해야 하므로)
        type: 'start',
        desc: '정의실현부의 거점이자 훈련장. 새로운 작전과 치안 유지 요청이 접수되는 곳입니다.'
      }
    ];

    this.connections = [];
    this.activeQuest = null;

    this.initEvents();
    this.resize();
    this.centerOnNode('node_jtf_hq');
    this.startLoop();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  centerOnNode(nodeId) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return;
    this.panX = this.canvas.width / 2 - node.x * this.zoom;
    this.panY = this.canvas.height / 2 - node.y * this.zoom;
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());

    // 마우스 드래그 이동 (Pan)
    this.canvas.addEventListener('mousedown', (e) => {
      // 좌클릭 시 드래그 시작
      if (e.button === 0) {
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.canvas.style.cursor = 'grabbing';
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      if (this.canvas) {
        this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'default';
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (this.isDragging) {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        this.panX += dx;
        this.panY += dy;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      } else {
        // 노드 호버 판정
        const found = this.findNodeAt(mouseX, mouseY);
        if (this.hoveredNode !== found) {
          this.hoveredNode = found;
          this.canvas.style.cursor = found ? 'pointer' : 'default';
        }
      }
    });

    // 마우스 휠 줌 (Zoom In / Out)
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      const newZoom = Math.max(0.55, Math.min(2.4, this.zoom * zoomFactor));

      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // 마우스 커서 위치를 기준으로 줌
      this.panX = mouseX - (mouseX - this.panX) * (newZoom / this.zoom);
      this.panY = mouseY - (mouseY - this.panY) * (newZoom / this.zoom);
      this.zoom = newZoom;
    }, { passive: false });

    // 노드 클릭
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const clickedNode = this.findNodeAt(mouseX, mouseY);
      if (clickedNode) {
        this.handleNodeClick(clickedNode);
      }
    });
  }

  // 월드 좌표 -> 캔버스 화면 픽셀
  worldToScreen(wx, wy) {
    return {
      x: this.panX + wx * this.zoom,
      y: this.panY + wy * this.zoom
    };
  }

  // 캔버스 화면 픽셀 -> 월드 좌표
  screenToWorld(sx, sy) {
    return {
      x: (sx - this.panX) / this.zoom,
      y: (sy - this.panY) / this.zoom
    };
  }

  findNodeAt(sx, sy) {
    for (const node of this.nodes) {
      const pt = this.worldToScreen(node.x, node.y);
      const r = 32 * this.zoom;
      const dx = sx - pt.x;
      const dy = sy - pt.y;
      if (dx * dx + dy * dy <= r * r) {
        return node;
      }
    }
    return null;
  }

  startLoop() {
    const loop = () => {
      this.animTime += 0.03;
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. 대형 전술 그리드 & 랜드마크 지형
    this.drawTacticalTerrain(ctx);

    // 2. 노드 간 연결선
    this.drawConnections(ctx);

    // 3. 거점 노드들 (🔴 🟡 🟢)
    this.drawNodes(ctx);
  }

  // 대형 트리니티 자치구 지형 렌더링
  drawTacticalTerrain(ctx) {
    ctx.save();

    // 1. 거대 전술 그리드
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
    ctx.lineWidth = 1;
    const step = 80 * this.zoom;
    const startX = (this.panX % step + step) % step;
    const startY = (this.panY % step + step) % step;

    for (let x = startX; x < this.canvas.width; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.canvas.height); ctx.stroke();
    }
    for (let y = startY; y < this.canvas.height; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.canvas.width, y); ctx.stroke();
    }

    // 2. 트리니티 자치구 외곽 경계선 (거대 홀로그램 폴리곤)
    const bounds = [
      [500, 200], [1900, 150], [2100, 900], [1800, 1600],
      [1100, 1700], [400, 1400], [350, 600]
    ];

    ctx.beginPath();
    const p0 = this.worldToScreen(bounds[0][0], bounds[0][1]);
    ctx.moveTo(p0.x, p0.y);
    for (let i = 1; i < bounds.length; i++) {
      const pt = this.worldToScreen(bounds[i][0], bounds[i][1]);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.025)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 2 * this.zoom;
    ctx.setLineDash([8 * this.zoom, 6 * this.zoom]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. 주요 랜드마크 구역 텍스트
    const landmarks = [
      { name: '고딕 대성당 성역', x: 1450, y: 550, icon: '⛪' },
      { name: '티파티 본관 타워', x: 1750, y: 700, icon: '🏛️' },
      { name: '정의실현부 훈련 시설', x: 1200, y: 1150, icon: '⚔️' },
      { name: '중앙 분수대 광장', x: 1050, y: 850, icon: '⛲' },
      { name: '구교사 카타콤 봉쇄구역', x: 650, y: 1250, icon: '🔒' },
      { name: '교정 북서부 외곽 철조망', x: 700, y: 400, icon: '🚧' }
    ];

    for (const lm of landmarks) {
      const pt = this.worldToScreen(lm.x, lm.y);
      ctx.font = `${Math.round(18 * this.zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(lm.icon, pt.x, pt.y - 10 * this.zoom);

      ctx.font = `700 ${Math.round(11 * this.zoom)}px 'Noto Sans KR', sans-serif`;
      ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
      ctx.fillText(lm.name, pt.x, pt.y + 12 * this.zoom);
    }

    ctx.restore();
  }

  drawConnections(ctx) {
    ctx.save();
    for (const conn of this.connections) {
      const n1 = this.nodes.find(n => n.id === conn.from);
      const n2 = this.nodes.find(n => n.id === conn.to);
      if (!n1 || !n2) continue;

      const p1 = this.worldToScreen(n1.x, n1.y);
      const p2 = this.worldToScreen(n2.x, n2.y);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);

      if (n2.status === 'cleared') {
        ctx.strokeStyle = '#22c55e'; // 🟢 완료된 길
        ctx.lineWidth = 3.5 * this.zoom;
        ctx.setLineDash([]);
      } else if (n2.status === 'active') {
        ctx.strokeStyle = '#ef4444'; // 🔴 활성 진입로
        ctx.lineWidth = 4 * this.zoom;
        ctx.setLineDash([10 * this.zoom, 6 * this.zoom]);
      } else {
        ctx.strokeStyle = '#64748b'; // 🟡 대기 중
        ctx.lineWidth = 2.5 * this.zoom;
        ctx.setLineDash([6 * this.zoom, 6 * this.zoom]);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  drawNodes(ctx) {
    const time = this.animTime;

    for (const node of this.nodes) {
      const pt = this.worldToScreen(node.x, node.y);
      const isCurrent = (this.currentNodeId === node.id);
      const isHovered = (this.hoveredNode && this.hoveredNode.id === node.id);
      const r = (isHovered ? 32 : 28) * this.zoom;

      ctx.save();

      let fillColor = 'rgba(15, 23, 42, 0.9)';
      let borderColor = '#ef4444';
      let glowColor = '#ef4444';

      if (node.status === 'active') {
        // 🔴 활성 노드
        borderColor = '#ef4444';
        glowColor = '#ef4444';
        fillColor = 'rgba(239, 68, 68, 0.22)';
      } else if (node.status === 'pending') {
        // 🟡 대기/연속 노드
        borderColor = '#eab308';
        glowColor = '#eab308';
        fillColor = 'rgba(234, 179, 8, 0.18)';
      } else if (node.status === 'cleared') {
        // 🟢 완료 노드
        borderColor = '#22c55e';
        glowColor = '#22c55e';
        fillColor = 'rgba(34, 197, 94, 0.25)';
      }

      // 🔴 활성 노드 펄스 파동
      if (node.status === 'active') {
        const pulse = Math.sin(time * 3) * 8 * this.zoom;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 2.5 * this.zoom;
        ctx.stroke();
      }

      // 노드 바디
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 3.5 * this.zoom;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 14 * this.zoom;
      ctx.stroke();

      // 노드 아이콘
      ctx.shadowBlur = 0;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${Math.round(16 * this.zoom)}px sans-serif`;

      let icon = '🎯';
      if (node.type === 'start') icon = '⭐';
      else if (node.type === 'boss') icon = '💀';
      else if (node.type === 'investigate') icon = '🔍';
      else if (node.type === 'rest') icon = '☕';
      else if (node.status === 'cleared') icon = '✓';

      ctx.fillText(icon, pt.x, pt.y);

      // 플레이어 현재 위치 표시 (정실부 3D 모브 핀)
      if (isCurrent) {
        ctx.font = `900 ${Math.round(12 * this.zoom)}px 'Noto Sans KR', sans-serif`;
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 8;
        ctx.fillText('▲ [정실부 모브 위치]', pt.x, pt.y - r - 14 * this.zoom);
        ctx.shadowBlur = 0;
      }

      // 노드 라벨 텍스트
      ctx.font = `800 ${Math.round(12.5 * this.zoom)}px 'Noto Sans KR', sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(node.name, pt.x, pt.y + r + 18 * this.zoom);

      ctx.restore();
    }
  }

  handleNodeClick(node) {
    if (!node) return;

    // 시작 노드 클릭 시 업무 1 팝업 모달
    if (node.id === 'node_jtf_hq' && node.status === 'active') {
      this.openQuest1Modal();
      return;
    }

    if (node.status === 'active') {
      this.currentNodeId = node.id;
      alert(`🚀 [거점 진입] ${node.name}\n\n정실부 모브가 해당 거점으로 이동했습니다!\n(다음 단계: 현장 3D 탐험 필드로 진입)`);
    } else if (node.status === 'pending') {
      alert(`🔒 [선행 코스 필요] ${node.name}\n\n이전 거점을 먼저 클리어해야 진입할 수 있습니다.`);
    } else if (node.status === 'cleared') {
      alert(`✅ [완료된 안전 구역] ${node.name}\n\n이미 완수된 거점입니다.`);
    }
  }

  openQuest1Modal() {
    const modal = document.getElementById('quest-modal');
    if (modal) modal.classList.remove('hidden');

    const btnAccept = document.getElementById('btn-quest-accept');
    const btnDecline = document.getElementById('btn-quest-decline');

    if (btnAccept) {
      btnAccept.onclick = () => {
        this.acceptQuest1();
        modal.classList.add('hidden');
      };
    }

    if (btnDecline) {
      btnDecline.onclick = () => {
        this.declineQuest1();
        modal.classList.add('hidden');
      };
    }
  }

  // 업무 1 [수락] 시: 4코스 직렬 노드 자동 생성
  acceptQuest1() {
    const startNode = this.nodes.find(n => n.id === 'node_jtf_hq');
    if (startNode) startNode.status = 'cleared'; // 🟢 완료로 변경

    // 4코스 노드 배치 (대형 맵 좌표계에 널찍하게 배치)
    const courseNodes = [
      {
        id: 'node_thug_c1',
        name: '코스 1: 교정 외곽 정찰',
        enName: 'STAGE 1: PATROL PERIMETER',
        x: 1050,
        y: 800,
        status: 'active', // 🔴 활성
        type: 'scout',
        desc: '교정 외곽 철조망 부근에서 불량배들의 이동 흔적을 수색합니다.'
      },
      {
        id: 'node_thug_c2',
        name: '코스 2: 골목길 단서 수색',
        enName: 'STAGE 2: ALLEYWAY SEARCH',
        x: 880,
        y: 580,
        status: 'pending', // 🟡 대기
        type: 'investigate',
        desc: '외곽 상가 골목길에서 버려진 탄피와 단서를 수색합니다.'
      },
      {
        id: 'node_thug_c3',
        name: '코스 3: 은신처 입구 봉쇄',
        enName: 'STAGE 3: BLOCKADE ENTRANCE',
        x: 720,
        y: 380,
        status: 'pending', // 🟡 대기
        type: 'skirmish',
        desc: '폐창고 은신처 입구의 불량배 경계조를 기습 무력화합니다.'
      },
      {
        id: 'node_thug_c4_boss',
        name: '코스 4: 💀 불량배 보스전 (확정)',
        enName: 'FINAL STAGE: THUG LEADER BOSS',
        x: 550,
        y: 220,
        status: 'pending', // 🟡 대기 (최종 목표)
        type: 'boss',
        desc: '불량배 아지트 심장부에서 무장 두목을 진압하고 의뢰를 완수합니다!'
      }
    ];

    this.nodes.push(...courseNodes);
    this.connections.push(
      { from: 'node_jtf_hq', to: 'node_thug_c1' },
      { from: 'node_thug_c1', to: 'node_thug_c2' },
      { from: 'node_thug_c2', to: 'node_thug_c3' },
      { from: 'node_thug_c3', to: 'node_thug_c4_boss' }
    );

    this.updateHUDText('진행 중: [업무 1] 불량배 소탕 요청 (코스 1/4 대기)');
    console.log('[DISTRICT CRAWLER] 4코스 직렬 노드 자동 개척 완료!');
  }

  // 업무 1 [거절] 시: 주변 3갈래 자유 탐색 노드 생성
  declineQuest1() {
    const startNode = this.nodes.find(n => n.id === 'node_jtf_hq');
    if (startNode) startNode.status = 'cleared'; // 🟢 완료로 변경

    const branchNodes = [
      {
        id: 'node_branch_1',
        name: '분기 A: 고딕 대성당 회랑',
        enName: 'BRANCH A: CATHEDRAL',
        x: 1550,
        y: 800,
        status: 'active', // 🔴
        type: 'event',
        desc: '고딕 대성당 회랑에서 티파티 관계자와 조우합니다.'
      },
      {
        id: 'node_branch_2',
        name: '분기 B: 중앙 분수 광장',
        enName: 'BRANCH B: FOUNTAIN PLAZA',
        x: 1200,
        y: 1350,
        status: 'active', // 🔴
        type: 'rest',
        desc: '중앙 분수대 광장에서 보급품을 정비합니다.'
      },
      {
        id: 'node_branch_3',
        name: '분기 C: 구교사 카타콤 봉쇄구역',
        enName: 'BRANCH C: CATACOMBS',
        x: 850,
        y: 1250,
        status: 'active', // 🔴
        type: 'battle',
        desc: '접근 통제된 구교사 지하에서 정체불명의 소음을 조사합니다.'
      }
    ];

    this.nodes.push(...branchNodes);
    this.connections.push(
      { from: 'node_jtf_hq', to: 'node_branch_1' },
      { from: 'node_jtf_hq', to: 'node_branch_2' },
      { from: 'node_jtf_hq', to: 'node_branch_3' }
    );

    this.updateHUDText('자유 탐색 모드: 3갈래 분기 경로 중 하나를 선택하십시오.');
    console.log('[DISTRICT CRAWLER] 주변 3갈래 자유 탐색로 개척 완료!');
  }

  updateHUDText(text) {
    const hud = document.getElementById('district-quest-text');
    if (hud) hud.innerText = `작전 현황: ${text}`;
  }
}

if (typeof window !== 'undefined') {
  window.TrinityDistrictCrawler = TrinityDistrictCrawler;
}
