// ==========================================
// TRINITY LARGE DISTRICT CRAWLER MAP
// (트리니티 대형 자치구 풀스크린 탐험 지도 - 드래그/줌 & 노드 크롤링)
// ==========================================

class TrinityDistrictCrawler {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // 대형 가상 맵 크기 (5200 x 4000의 초대형 트리니티 자치구 전장)
    this.worldWidth = 5200;
    this.worldHeight = 4000;

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

    // 퀘스트 및 노드 데이터 (시작 노드: 정의실현부 - 초대형 맵 중심 배치)
    this.nodes = [
      {
        id: 'node_jtf_hq',
        name: '정의실현부',
        enName: 'JUSTICE TASK FORCE HQ',
        x: 2600,
        y: 2200,
        status: 'active', // 🔴 빨강 (시작 노드)
        type: 'start',
        desc: '정의실현부 본부. 다른 선배들과 부원들은 모두 외부 작전으로 출장을 나간 상태입니다.'
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

    // 마우스 휠 줌 (초대형 맵 자유 줌 인/아웃)
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      const newZoom = Math.max(0.35, Math.min(2.6, this.zoom * zoomFactor));

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
      const r = 48 * this.zoom; // 확장된 노드 크기에 맞춘 감지 반경
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

    // 밝고 산뜻한 고대비 전술 맵 배경 그라디언트
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, Math.max(w, h));
    bgGrad.addColorStop(0, '#15253d');
    bgGrad.addColorStop(1, '#0b1424');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 1. 초대형 전술 그리드 & 랜드마크 지형 & 레이더 동심원
    this.drawTacticalTerrain(ctx);

    // 2. 노드 간 연결선
    this.drawConnections(ctx);

    // 3. 거점 노드들 (🔴 🟡 🟢 대형 전술 핀)
    this.drawNodes(ctx);
  }

  // 초대형 트리니티 자치구 지형 렌더링
  drawTacticalTerrain(ctx) {
    ctx.save();

    // 1. 밝고 선명한 전술 그리드망
    const step = 120 * this.zoom;
    const startX = (this.panX % step + step) % step;
    const startY = (this.panY % step + step) % step;

    for (let x = startX, i = 0; x < this.canvas.width; x += step, i++) {
      ctx.strokeStyle = (i % 3 === 0) ? 'rgba(56, 189, 248, 0.22)' : 'rgba(56, 189, 248, 0.10)';
      ctx.lineWidth = (i % 3 === 0) ? 1.5 : 1;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.canvas.height); ctx.stroke();
    }
    for (let y = startY, i = 0; y < this.canvas.height; y += step, i++) {
      ctx.strokeStyle = (i % 3 === 0) ? 'rgba(56, 189, 248, 0.22)' : 'rgba(56, 189, 248, 0.10)';
      ctx.lineWidth = (i % 3 === 0) ? 1.5 : 1;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.canvas.width, y); ctx.stroke();
    }

    // 2. 정실부 본부 중심 동심원 레이더 링
    const hqPt = this.worldToScreen(2600, 2200);
    ctx.lineWidth = 1.5 * this.zoom;
    ctx.setLineDash([8 * this.zoom, 8 * this.zoom]);
    const radarRanges = [600, 1200, 1800, 2400];
    for (const range of radarRanges) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.beginPath();
      ctx.arc(hqPt.x, hqPt.y, range * this.zoom, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = `700 ${Math.round(11 * this.zoom)}px Montserrat, sans-serif`;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
      ctx.fillText(`${range}m SECTOR`, hqPt.x + range * this.zoom + 8 * this.zoom, hqPt.y);
    }
    ctx.setLineDash([]);

    // 3. 트리니티 자치구 외곽 경계선 (초대형 홀로그램 영지 폴리곤)
    const bounds = [
      [1100, 450], [4100, 350], [4600, 2000], [4000, 3500],
      [2400, 3650], [900, 3100], [800, 1300]
    ];

    ctx.beginPath();
    const p0 = this.worldToScreen(bounds[0][0], bounds[0][1]);
    ctx.moveTo(p0.x, p0.y);
    for (let i = 1; i < bounds.length; i++) {
      const pt = this.worldToScreen(bounds[i][0], bounds[i][1]);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.06)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 3 * this.zoom;
    ctx.setLineDash([10 * this.zoom, 8 * this.zoom]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. 주요 랜드마크 구역 텍스트 (초대형 스케일 배치)
    const landmarks = [
      { name: '고딕 대성당 성역', x: 3300, y: 1200, icon: '⛪' },
      { name: '티파티 본관 타워', x: 4000, y: 1550, icon: '🏛️' },
      { name: '정의실현부 훈련 시설 & 본부', x: 2600, y: 2500, icon: '⚔️' },
      { name: '중앙 분수대 광장', x: 2300, y: 1850, icon: '⛲' },
      { name: '구교사 카타콤 봉쇄구역', x: 1450, y: 2750, icon: '🔒' },
      { name: '교정 북서부 외곽 철조망', x: 1550, y: 900, icon: '🚧' }
    ];

    for (const lm of landmarks) {
      const pt = this.worldToScreen(lm.x, lm.y);
      ctx.font = `${Math.round(24 * this.zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(lm.icon, pt.x, pt.y - 12 * this.zoom);

      ctx.font = `800 ${Math.round(13.5 * this.zoom)}px 'Noto Sans KR', sans-serif`;
      ctx.strokeStyle = 'rgba(10, 15, 26, 0.85)';
      ctx.lineWidth = 4 * this.zoom;
      ctx.strokeText(lm.name, pt.x, pt.y + 16 * this.zoom);
      ctx.fillStyle = '#f1f5f9';
      ctx.fillText(lm.name, pt.x, pt.y + 16 * this.zoom);
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
        ctx.lineWidth = 4.5 * this.zoom;
        ctx.setLineDash([]);
      } else if (n2.status === 'active') {
        ctx.strokeStyle = '#ef4444'; // 🔴 활성 진입로
        ctx.lineWidth = 5 * this.zoom;
        ctx.setLineDash([12 * this.zoom, 8 * this.zoom]);
      } else {
        ctx.strokeStyle = '#94a3b8'; // 🟡 대기 중
        ctx.lineWidth = 3 * this.zoom;
        ctx.setLineDash([8 * this.zoom, 8 * this.zoom]);
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
      // 크게 키운 대형 전술 거점 노드
      const r = (isHovered ? 48 : 40) * this.zoom;

      ctx.save();

      let fillColor = 'rgba(15, 23, 42, 0.9)';
      let borderColor = '#ef4444';
      let glowColor = '#ef4444';

      if (node.status === 'active') {
        // 🔴 활성 노드 (선명하고 밝은 레드 네온)
        borderColor = '#ef4444';
        glowColor = '#ef4444';
        fillColor = 'rgba(239, 68, 68, 0.28)';
      } else if (node.status === 'pending') {
        // 🟡 대기/연속 노드
        borderColor = '#facc15';
        glowColor = '#facc15';
        fillColor = 'rgba(250, 204, 21, 0.22)';
      } else if (node.status === 'cleared') {
        // 🟢 완료 노드
        borderColor = '#22c55e';
        glowColor = '#22c55e';
        fillColor = 'rgba(34, 197, 94, 0.32)';
      }

      // 🔴 활성 노드 펄스 파동
      if (node.status === 'active') {
        const pulse = Math.sin(time * 3) * 10 * this.zoom;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = 3.5 * this.zoom;
        ctx.stroke();
      }

      // 노드 바디
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 4.5 * this.zoom;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 20 * this.zoom;
      ctx.stroke();

      // 노드 아이콘
      ctx.shadowBlur = 0;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${Math.round(22 * this.zoom)}px sans-serif`;

      let icon = '🎯';
      if (node.type === 'start') icon = '⭐';
      else if (node.type === 'boss') icon = '💀';
      else if (node.type === 'investigate') icon = '🔍';
      else if (node.type === 'rest') icon = '☕';
      else if (node.status === 'cleared') icon = '✓';

      ctx.fillText(icon, pt.x, pt.y);

      // 플레이어 현재 위치 표시 (정실부 3D 모브 핀)
      if (isCurrent) {
        ctx.font = `900 ${Math.round(14 * this.zoom)}px 'Noto Sans KR', sans-serif`;
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = 'rgba(10, 15, 26, 0.9)';
        ctx.lineWidth = 4 * this.zoom;
        ctx.strokeText('▲ [정실부 모브 위치]', pt.x, pt.y - r - 18 * this.zoom);
        ctx.fillText('▲ [정실부 모브 위치]', pt.x, pt.y - r - 18 * this.zoom);
      }

      // 노드 라벨 텍스트
      ctx.font = `900 ${Math.round(15 * this.zoom)}px 'Noto Sans KR', sans-serif`;
      ctx.strokeStyle = 'rgba(10, 15, 26, 0.95)';
      ctx.lineWidth = 4.5 * this.zoom;
      ctx.strokeText(node.name, pt.x, pt.y + r + 22 * this.zoom);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(node.name, pt.x, pt.y + r + 22 * this.zoom);

      ctx.restore();
    }
  }

  handleNodeClick(node) {
    if (!node) return;

    // 시작 노드 (정의실현부) 클릭 시: 확정 이벤트 [정의실현부 : 탐험] 팝업 모달
    if (node.id === 'node_jtf_hq') {
      this.openJTFExplorationModal(node);
      return;
    }

    if (node.status === 'active') {
      this.currentNodeId = node.id;
      alert(`🚀 [거점 진입] ${node.name}\n\n정실부 모브가 해당 거점으로 이동했습니다!`);
    } else if (node.status === 'pending') {
      alert(`🔒 [선행 코스 필요] ${node.name}\n\n이전 거점을 먼저 클리어해야 진입할 수 있습니다.`);
    } else if (node.status === 'cleared') {
      // 이미 완료된 거점도 실내 재탐험 가능
      this.openJTFExplorationModal(node);
    }
  }

  // 정의실현부 : 탐험 모달 오픈 (최초 노드는 건너뛰기 불가, 오직 [입장] 버튼만 존재)
  openJTFExplorationModal(node) {
    const modal = document.getElementById('quest-modal');
    if (!modal) return;

    const modalNum = document.getElementById('quest-modal-num');
    const modalTitle = document.getElementById('quest-modal-title');
    const modalDesc = document.getElementById('quest-modal-desc');
    const modalPreview = document.getElementById('quest-modal-preview');
    const btnAccept = document.getElementById('btn-quest-accept');
    const btnDecline = document.getElementById('btn-quest-decline');

    if (modalNum) modalNum.innerText = '확정 이벤트';
    if (modalTitle) modalTitle.innerText = '정의실현부 : 탐험';
    if (modalDesc) {
      modalDesc.innerText = '정의실현부 본부. 다른 선배들과 부원들은 모두 외부 작전으로 출장을 나간 상태입니다. 혼자 남은 본부 내부를 직접 수색하고 작전을 준비하십시오.';
    }
    if (modalPreview) {
      modalPreview.innerHTML = '<div class="route-item accept-route">🚪 <strong>[입장 안내]</strong>: 정의실현부 본부 실내 3D 필드로 진입합니다. (최초 거점으로 건너뛰기 불가)</div>';
    }

    // 최초 노드는 건너뛰기 불가 -> 건너뛰기 버튼 완전 숨김
    if (btnDecline) {
      btnDecline.style.display = 'none';
    }

    // [입장] 버튼만 전체 너비로 노출
    if (btnAccept) {
      btnAccept.style.flex = '1';
      btnAccept.innerHTML = '<span>🚀 입장 (본부 실내 탐험) ▶</span>';
      btnAccept.onclick = () => {
        modal.classList.add('hidden');
        if (window.AppController && window.AppController.enterField) {
          window.AppController.enterField(node.id);
        }
      };
    }

    modal.classList.remove('hidden');
  }

  updateHUDText(text) {
    const hud = document.getElementById('district-quest-text');
    if (hud) hud.innerText = `작전 현황: ${text}`;
  }
}

if (typeof window !== 'undefined') {
  window.TrinityDistrictCrawler = TrinityDistrictCrawler;
}
