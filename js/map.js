// ==========================================
// KIVOTOS STRATEGIC MAP - CANVAS RENDERER
// ==========================================

class KivotosMapRenderer {
  constructor(canvasId, infoPanelId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.infoPanel = document.getElementById(infoPanelId);

    this.data = window.KIVOTOS_MAP_DATA;
    this.hoveredRegion = null;
    this.selectedRegion = null;
    this.animTime = 0;

    // 카메라 줌 & 팬 상태 (전역 지도 <-> 자치구 확대 전환)
    this.baseScale = 1.0;
    this.scale = 1.0;
    this.zoomFactor = 1.0;
    this.targetZoomFactor = 1.0;

    this.camFocusX = 600;
    this.camFocusY = 492;
    this.targetCamFocusX = 600;
    this.targetCamFocusY = 492;

    // 퀘스트 & 노드 시스템 연동
    this.questSystem = (typeof KivotosQuestSystem !== 'undefined') ? new KivotosQuestSystem(this) : null;

    this.initEvents();
    this.resize();
    this.startLoop();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    // 1200 x 984 viewBox를 캔버스에 맞춤
    const pad = 24;
    const scaleX = (this.canvas.width - pad * 2) / this.data.viewBox.width;
    const scaleY = (this.canvas.height - pad * 2) / this.data.viewBox.height;
    this.baseScale = Math.min(scaleX, scaleY);
    this.scale = this.baseScale * this.zoomFactor;
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());

    // 마우스 이동 시
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let found = null;
      for (const region of this.data.regions) {
        if (this.isPointInRegion(mouseX, mouseY, region)) {
          found = region;
          break;
        }
      }

      if (this.hoveredRegion !== found) {
        this.hoveredRegion = found;
        this.canvas.style.cursor = found ? 'pointer' : 'default';
        // 선택된 구역이 이미 있다면 마우스를 다른 데 치워도 선택 정보가 풀리지 않고 유지됨!
        this.updateInspectorPanel(this.selectedRegion || found);
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredRegion = null;
      this.canvas.style.cursor = 'default';
      this.updateInspectorPanel(this.selectedRegion);
    });

    // 클릭 이벤트 (지역 영구 선택 고정)
    this.canvas.addEventListener('click', () => {
      if (!this.hoveredRegion) return;

      if (this.hoveredRegion.isLocked) {
        this.triggerLockedFeedback(this.hoveredRegion);
      } else {
        // 클릭한 구역을 선택 상태로 영구 고정!
        this.selectedRegion = this.hoveredRegion;
        this.updateInspectorPanel(this.selectedRegion);
      }
    });
  }

  // 좌표계 변환: 캔버스 픽셀 -> 가상 맵 좌표 (카메라 줌/팬 적용)
  canvasToMap(x, y) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const s = this.baseScale * this.zoomFactor;
    return {
      x: this.camFocusX + (x - cx) / s,
      y: this.camFocusY + (y - cy) / s
    };
  }

  // 가상 맵 좌표 -> 캔버스 픽셀 (카메라 줌/팬 적용)
  mapToCanvas(x, y) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const s = this.baseScale * this.zoomFactor;
    return {
      x: cx + (x - this.camFocusX) * s,
      y: cy + (y - this.camFocusY) * s
    };
  }

  // 다각형 내부 점 판정 (Ray-casting Algorithm)
  isPointInRegion(canvasX, canvasY, region) {
    const pt = this.canvasToMap(canvasX, canvasY);
    const poly = region.poly;
    let inside = false;

    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1];
      const xj = poly[j][0], yj = poly[j][1];

      const intersect = ((yi > pt.y) !== (yj > pt.y))
          && (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
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

    // 카메라 줌 & 팬 부드러운 보간 (Lerp)
    this.zoomFactor += (this.targetZoomFactor - this.zoomFactor) * 0.08;
    this.camFocusX += (this.targetCamFocusX - this.camFocusX) * 0.08;
    this.camFocusY += (this.targetCamFocusY - this.camFocusY) * 0.08;
    this.scale = this.baseScale * this.zoomFactor;

    ctx.clearRect(0, 0, w, h);

    // 1. 전술 홀로그램 배경 격자 & 서쪽 바다 해안선
    this.drawHoloGrid(ctx, w, h);
    this.drawWestOcean(ctx);

    // 2. 모든 지역 폴리곤 렌더링 (겹침 없는 무결점 지형)
    for (const region of this.data.regions) {
      this.drawRegion(ctx, region);
    }

    // 3. 주요 수로 (장예카 대수로 & 아라바 강가 지류)
    this.drawWaterways(ctx);

    // 4. 서쪽 외해 군도 거점 (마에스트로의 저택 등)
    this.drawWestIslands(ctx);

    // 5. 지역 라벨 & 엠블럼 / 자물쇠
    for (const region of this.data.regions) {
      this.drawRegionLabel(ctx, region);
    }

    // 6. 자치구 내부 세부 노드 렌더링 (퀘스트 시스템)
    if (this.questSystem) {
      this.questSystem.renderNodes(ctx, this);
    }
  }

  drawHoloGrid(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
    ctx.lineWidth = 1;
    const step = 45;

    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 모서리 전술 조준 브래킷
    const m = 16;
    const blen = 22;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.lineWidth = 2;

    ctx.beginPath(); ctx.moveTo(m, m + blen); ctx.lineTo(m, m); ctx.lineTo(m + blen, m); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w - m - blen, m); ctx.lineTo(w - m, m); ctx.lineTo(w - m, m + blen); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(m, h - m - blen); ctx.lineTo(m, h - m); ctx.lineTo(m + blen, h - m); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w - m - blen, h - m); ctx.lineTo(w - m, h - m); ctx.lineTo(w - m, h - m - blen); ctx.stroke();

    ctx.restore();
  }

  // 서쪽 바다 해안 수역 효과
  drawWestOcean(ctx) {
    ctx.save();
    const seaTop = this.mapToCanvas(0, 0);
    const seaBottom = this.mapToCanvas(220, 984);

    const grad = ctx.createLinearGradient(seaTop.x, 0, seaBottom.x, 0);
    grad.addColorStop(0, 'rgba(2, 132, 199, 0.14)');
    grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, seaBottom.x + 40, this.canvas.height);

    ctx.restore();
  }

  drawWaterways(ctx) {
    ctx.save();
    for (const river of this.data.waterways) {
      if (river.length < 2) continue;

      ctx.beginPath();
      const p0 = this.mapToCanvas(river[0][0], river[0][1]);
      ctx.moveTo(p0.x, p0.y);

      for (let i = 1; i < river.length; i++) {
        const pt = this.mapToCanvas(river[i][0], river[i][1]);
        ctx.lineTo(pt.x, pt.y);
      }

      // 발광 수로 레이어드 효과
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.45)';
      ctx.lineWidth = 14 * this.scale;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 5 * this.scale;
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6 * this.scale;
      ctx.stroke();
    }

    // 장예카 텍스트 마커
    const riverTextPos = this.mapToCanvas(780, 770);
    ctx.font = `700 ${Math.round(10 * this.scale)}px 'Noto Sans KR', sans-serif`;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.textAlign = 'center';
    ctx.fillText('≈ 장예카 대수로 ≈', riverTextPos.x, riverTextPos.y - 12 * this.scale);

    ctx.restore();
  }

  drawWestIslands(ctx) {
    if (!this.data.westIslands) return;
    ctx.save();
    for (const isl of this.data.westIslands) {
      const c = this.mapToCanvas(isl.x, isl.y);
      const r = isl.r * this.scale;

      ctx.beginPath();
      ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(30, 41, 59, 0.65)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.2 * this.scale;
      ctx.setLineDash([3 * this.scale, 2 * this.scale]);
      ctx.stroke();

      ctx.font = `600 ${Math.round(9 * this.scale)}px 'Noto Sans KR', sans-serif`;
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(isl.name, c.x, c.y + r + 11 * this.scale);
    }
    ctx.restore();
  }

  drawRegion(ctx, region) {
    const poly = region.poly;
    if (poly.length < 3) return;

    const isHovered = (this.hoveredRegion && this.hoveredRegion.id === region.id);
    const isSelected = (this.selectedRegion && this.selectedRegion.id === region.id);
    const isLocked = region.isLocked;

    ctx.save();
    ctx.beginPath();

    const start = this.mapToCanvas(poly[0][0], poly[0][1]);
    ctx.moveTo(start.x, start.y);

    for (let i = 1; i < poly.length; i++) {
      const pt = this.mapToCanvas(poly[i][0], poly[i][1]);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();

    // 1. 내부 채우기 (Fill)
    if (isLocked) {
      // 잠긴 구역 (미개척)
      if (isHovered) {
        ctx.fillStyle = 'rgba(51, 65, 85, 0.45)';
      } else {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      }
    } else {
      // 해금된 정규 학원
      if (isSelected) {
        ctx.fillStyle = region.fillColor.replace(/[\d\.]+\)$/, '0.45)');
      } else if (isHovered) {
        ctx.fillStyle = region.fillColor.replace(/[\d\.]+\)$/, '0.35)');
      } else {
        ctx.fillStyle = region.fillColor;
      }
    }
    ctx.fill();

    // 2. 외곽선 테두리 (Border)
    if (isLocked) {
      ctx.strokeStyle = isHovered ? 'rgba(148, 163, 184, 0.7)' : 'rgba(71, 85, 105, 0.45)';
      ctx.lineWidth = (isHovered ? 2.2 : 1.4) * this.scale;
      ctx.setLineDash([5 * this.scale, 3.5 * this.scale]);
    } else {
      ctx.strokeStyle = isSelected ? '#00f0ff' : (isHovered ? '#ffffff' : region.borderColor);
      ctx.lineWidth = (isHovered || isSelected ? 2.8 : 1.6) * this.scale;
      ctx.setLineDash([]);

      if (isHovered || isSelected) {
        ctx.shadowColor = region.color;
        ctx.shadowBlur = 14 * this.scale;
      }
    }
    ctx.stroke();

    ctx.restore();
  }

  drawRegionLabel(ctx, region) {
    const c = this.mapToCanvas(region.center.x, region.center.y);
    const isHovered = (this.hoveredRegion && this.hoveredRegion.id === region.id);
    const isLocked = region.isLocked;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (isLocked) {
      // 잠긴 구역: 🔒 + ??? + 마우스 올릴 시 구역명
      const pulseLock = 1 + Math.sin(this.animTime * 2) * 0.05;

      ctx.font = `${Math.round(16 * this.scale * pulseLock)}px sans-serif`;
      ctx.fillText('🔒', c.x, c.y - 9 * this.scale);

      ctx.font = `900 ${Math.round(14 * this.scale)}px Montserrat, 'Noto Sans KR', sans-serif`;
      ctx.fillStyle = isHovered ? '#cbd5e1' : '#64748b';
      ctx.fillText('???', c.x, c.y + 11 * this.scale);

      if (isHovered) {
        ctx.font = `600 ${Math.round(9.5 * this.scale)}px 'Noto Sans KR', sans-serif`;
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`[ ${region.shortName} - 미개척 ]`, c.x, c.y + 26 * this.scale);
      }
    } else {
      // 해금된 학원: 엠블럼 + 한글 학원명 + 영문 코드
      const floatY = Math.sin(this.animTime * 1.5 + region.center.x) * 1.8;

      ctx.font = `${Math.round(20 * this.scale)}px sans-serif`;
      ctx.fillText(region.emblem, c.x, c.y - 12 * this.scale + floatY);

      ctx.font = `900 ${Math.round(14.5 * this.scale)}px 'Noto Sans KR', sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = region.color;
      ctx.shadowBlur = isHovered ? 12 : 5;
      ctx.fillText(region.shortName, c.x, c.y + 10 * this.scale + floatY);

      ctx.font = `700 ${Math.round(8.5 * this.scale)}px Montserrat, sans-serif`;
      ctx.fillStyle = region.color;
      ctx.shadowBlur = 0;
      ctx.fillText(region.enName.split(' ')[0], c.x, c.y + 24 * this.scale + floatY);
    }

    ctx.restore();
  }

  updateInspectorPanel(region) {
    if (!this.infoPanel) return;

    if (!region) {
      this.infoPanel.innerHTML = `
        <div class="empty-inspector">
          <div class="inspector-radar-icon">📡</div>
          <div class="inspector-empty-title">전술 구역을 선택하십시오</div>
          <div class="inspector-empty-sub">지도 상의 키보토스 학원 자치구를 마우스로 탐색하여 작전 정보를 확인합니다.</div>
        </div>
      `;
      return;
    }

    const isLocked = region.isLocked;
    const statusBadge = isLocked 
      ? `<span class="badge-locked">🔒 LOCKED (미개척 자치구)</span>` 
      : `<span class="badge-unlocked" style="background:${region.color}22; border-color:${region.color}; color:${region.color};">✅ 작전 출격 가능</span>`;

    this.infoPanel.innerHTML = `
      <div class="inspector-card animate-fade">
        <div class="inspector-header">
          <div class="inspector-emblem" style="background:${region.color}18; border-color:${region.color};">
            ${isLocked ? '🔒' : region.emblem}
          </div>
          <div class="inspector-title-area">
            <div class="inspector-region-name" style="color:${isLocked ? '#94a3b8' : '#ffffff'};">
              ${isLocked ? '??? (미확인 자치구)' : region.name}
            </div>
            <div class="inspector-region-en">${region.enName}</div>
          </div>
        </div>

        <div class="inspector-status-row">
          ${statusBadge}
        </div>

        <div class="inspector-divider"></div>

        <div class="inspector-desc-box">
          <div class="inspector-label">구역 정찰 브리핑</div>
          <p class="inspector-desc">${isLocked ? '이 자치구는 현재 접근 권한이 잠겨 있습니다. 이전 챕터의 미션을 완수하여 경로를 개척하십시오.' : region.desc}</p>
          
          ${!isLocked ? `
            <div class="inspector-squad-box">
              <div class="inspector-label" style="margin-top: 14px; color: #f43f5e;">출격 배속 소속</div>
              <div class="squad-info-row">
                <span class="squad-emblem">⚖️</span>
                <div class="squad-text">
                  <div class="squad-title">정의실현부 (Justice Task Force)</div>
                  <div class="squad-unit">시작 유닛: <strong>정실부 모브 학생 1인</strong></div>
                </div>
              </div>
            </div>
          ` : ''}
        </div>

        <div class="inspector-action-area">
          ${isLocked 
            ? `<button class="btn-region-deploy locked" disabled>
                <span>🔒 진입 불가 (잠김)</span>
               </button>`
            : `<button class="btn-region-deploy active" id="btn-next-to-club" style="background:linear-gradient(135deg, #0284c7, #0369a1); border-color:#38bdf8;">
                <span>다음으로 (소속 선택) ▶</span>
               </button>`
          }
        </div>
      </div>
    `;

    if (!isLocked) {
      const nextBtn = document.getElementById('btn-next-to-club');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (window.AppController && window.AppController.goToClubSelect) {
            window.AppController.goToClubSelect(region);
          }
        });
      }
    }
  }

  triggerLockedFeedback(region) {
    if (this.canvas) {
      this.canvas.classList.add('shake-canvas');
      setTimeout(() => this.canvas.classList.remove('shake-canvas'), 250);
    }
  }
}

if (typeof window !== 'undefined') {
  window.KivotosMapRenderer = KivotosMapRenderer;
}
