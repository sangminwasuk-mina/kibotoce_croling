// ==========================================
// TRINITY JUSTICE TASK FORCE MOB RENDERER
// (트리니티 정의실현부 모브 학생 2D & 2.5D 렌더러)
// ==========================================

class JTFMobRenderer {
  constructor() {
    this.animTime = 0;
  }

  // ==========================================
  // 1. 2D 평면 정밀 토큰 렌더링 (Flat 2D Token)
  // ==========================================
  draw2D(ctx, x, y, size = 100, options = {}) {
    const time = options.time || this.animTime;
    const isMoving = options.isMoving || false;
    const direction = options.direction || 'right'; // 'left' or 'right'

    ctx.save();
    ctx.translate(x, y);
    if (direction === 'left') {
      ctx.scale(-1, 1);
    }

    // 숨쉬기 / 걷기 바운스 애니메이션
    const walkBob = isMoving ? Math.abs(Math.sin(time * 12)) * 6 : 0;
    const breath = Math.sin(time * 3) * 2;
    const bodyY = -walkBob + breath;

    // 그림자
    ctx.beginPath();
    ctx.ellipse(0, size * 0.48, size * 0.42, size * 0.14, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // 1-1. 등 뒤의 날개 (Wings)
    const wingFlap = Math.sin(time * (isMoving ? 10 : 3.5)) * 0.12;
    this.drawWings2D(ctx, 0, bodyY - size * 0.05, size, wingFlap);

    // 1-2. 정사각형 베이스 몸체 (Square Body Block)
    const boxSize = size * 0.72;
    const bx = -boxSize / 2;
    const by = -boxSize / 2 + bodyY;
    const radius = 12;

    ctx.save();
    // 둥근 사각형 클리핑으로 제복 디테일 채우기
    this.roundedRect(ctx, bx, by, boxSize, boxSize, radius);
    ctx.clip();

    // 베이스 배경 (어두운 제복 블랙)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bx, by, boxSize, boxSize);

    // 얼굴 / 머리카락 영역 (상단)
    ctx.fillStyle = '#1e293b'; // 어두운 단발 헤어
    ctx.fillRect(bx, by, boxSize, boxSize * 0.42);

    // 살구색 피부 톤 (앞머리 살짝 아래)
    ctx.fillStyle = '#ffedd5';
    ctx.fillRect(bx + boxSize * 0.15, by + boxSize * 0.26, boxSize * 0.7, boxSize * 0.18);

    // 단발 앞머리 가닥
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(bx + boxSize * 0.15, by + boxSize * 0.26);
    ctx.lineTo(bx + boxSize * 0.35, by + boxSize * 0.38);
    ctx.lineTo(bx + boxSize * 0.5, by + boxSize * 0.3);
    ctx.lineTo(bx + boxSize * 0.65, by + boxSize * 0.4);
    ctx.lineTo(bx + boxSize * 0.85, by + boxSize * 0.26);
    ctx.fill();

    // 흰색 세일러/셔츠 칼라 (목 부분)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(bx + boxSize * 0.25, by + boxSize * 0.42);
    ctx.lineTo(bx + boxSize * 0.5, by + boxSize * 0.56);
    ctx.lineTo(bx + boxSize * 0.75, by + boxSize * 0.42);
    ctx.lineTo(bx + boxSize * 0.65, by + boxSize * 0.42);
    ctx.lineTo(bx + boxSize * 0.5, by + boxSize * 0.5);
    ctx.lineTo(bx + boxSize * 0.35, by + boxSize * 0.42);
    ctx.closePath();
    ctx.fill();

    // 붉은 넥타이 (Red Necktie - 정실부 상징)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(bx + boxSize * 0.45, by + boxSize * 0.48);
    ctx.lineTo(bx + boxSize * 0.55, by + boxSize * 0.48);
    ctx.lineTo(bx + boxSize * 0.58, by + boxSize * 0.74);
    ctx.lineTo(bx + boxSize * 0.5, by + boxSize * 0.84);
    ctx.lineTo(bx + boxSize * 0.42, by + boxSize * 0.74);
    ctx.closePath();
    ctx.fill();

    // 제복 금색 단추 디테일
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(bx + boxSize * 0.35, by + boxSize * 0.66, 2.5, 0, Math.PI * 2);
    ctx.arc(bx + boxSize * 0.65, by + boxSize * 0.66, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 왼쪽 팔 붉은 완장 (Red Armband)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(bx + boxSize * 0.78, by + boxSize * 0.58, boxSize * 0.22, boxSize * 0.16);

    ctx.restore();

    // 사각형 외곽 테두리 (네온 글로우)
    ctx.save();
    this.roundedRect(ctx, bx, by, boxSize, boxSize, radius);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();

    // 1-3. 머리 위 제복 정모 (Officer Cap with Visor)
    this.drawCap2D(ctx, 0, by + boxSize * 0.15, boxSize);

    // 1-4. 머리 위 부유하는 붉은 십자 헤일로 (Floating JTF Halo)
    const haloFloat = Math.sin(time * 3.5) * 4;
    this.drawHalo2D(ctx, 0, by - size * 0.28 + haloFloat, size * 0.38);

    ctx.restore();
  }

  // 2D 제복 정모 그리기
  drawCap2D(ctx, x, y, boxSize) {
    ctx.save();
    ctx.translate(x, y);

    // 모자 본체 (각진 군모/경비모 형태)
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.moveTo(-boxSize * 0.52, -boxSize * 0.08);
    ctx.lineTo(-boxSize * 0.44, -boxSize * 0.35);
    ctx.lineTo(boxSize * 0.44, -boxSize * 0.35);
    ctx.lineTo(boxSize * 0.52, -boxSize * 0.08);
    ctx.closePath();
    ctx.fill();

    // 모자 챙 (Visor)
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.ellipse(0, -boxSize * 0.04, boxSize * 0.54, boxSize * 0.1, 0, 0, Math.PI);
    ctx.fill();

    // 모자 금테 라인
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-boxSize * 0.46, -boxSize * 0.09);
    ctx.lineTo(boxSize * 0.46, -boxSize * 0.09);
    ctx.stroke();

    // 정중앙 금색 십자가 뱃지 (Trinity Emblem)
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 6;
    const bw = 4, bh = 14;
    ctx.fillRect(-bw / 2, -boxSize * 0.28, bw, bh);
    ctx.fillRect(-bh / 2, -boxSize * 0.28 + 3, bh, bw);

    ctx.restore();
  }

  // 2D 깃털 날개 그리기
  drawWings2D(ctx, x, y, size, flapAngle) {
    ctx.save();
    ctx.translate(x, y);

    const wingSpan = size * 0.48;

    // 좌측 날개
    ctx.save();
    ctx.translate(-size * 0.28, 0);
    ctx.rotate(-0.15 - flapAngle);
    this.drawSingleWing(ctx, -1, wingSpan);
    ctx.restore();

    // 우측 날개
    ctx.save();
    ctx.translate(size * 0.28, 0);
    ctx.rotate(0.15 + flapAngle);
    this.drawSingleWing(ctx, 1, wingSpan);
    ctx.restore();

    ctx.restore();
  }

  drawSingleWing(ctx, dir, span) {
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(dir * span * 0.7, -span * 0.5, dir * span, -span * 0.1);
    ctx.quadraticCurveTo(dir * span * 0.8, span * 0.3, dir * span * 0.4, span * 0.4);
    ctx.quadraticCurveTo(dir * span * 0.2, span * 0.3, 0, 0);
    ctx.fill();
    ctx.stroke();

    // 깃털 결 라인
    ctx.beginPath();
    ctx.moveTo(dir * span * 0.3, -span * 0.1);
    ctx.lineTo(dir * span * 0.65, span * 0.1);
    ctx.moveTo(dir * span * 0.2, 0);
    ctx.lineTo(dir * span * 0.45, span * 0.22);
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.7)';
    ctx.stroke();
  }

  // 2D 헤일로 그리기 (선명한 붉은 십자 링)
  drawHalo2D(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);

    // 붉은 발광 효과
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 14;

    // 원형 링
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    // 내부 십자가 (Cross)
    const arm = r * 0.8;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, -arm);
    ctx.lineTo(0, arm);
    ctx.moveTo(-arm, 0);
    ctx.lineTo(arm, 0);
    ctx.stroke();

    // 중앙 코어 빛 포인트
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }


  // ==========================================
  // 2. 2.5D 입체 쿼터뷰 큐브 렌더링 (Isometric 2.5D)
  // ==========================================
  draw25D(ctx, x, y, size = 110, options = {}) {
    const time = options.time || this.animTime;
    const isMoving = options.isMoving || false;
    const angle = options.angle || 0; // 마우스나 시선에 따른 회전각

    ctx.save();
    ctx.translate(x, y);

    // 걷기 바운스 & 점프
    const walkBob = isMoving ? Math.abs(Math.sin(time * 12)) * 8 : 0;
    const breath = Math.sin(time * 3) * 2.5;
    const cubeY = -walkBob + breath;

    // 2.5D 바닥 동적 그림자
    const shadowScale = 1 - (walkBob / 40);
    ctx.beginPath();
    ctx.ellipse(0, size * 0.42, size * 0.48 * shadowScale, size * 0.2 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // 2.5D 큐브 규격 (너비, 높이, 깊이)
    const bw = size * 0.65;
    const bh = size * 0.75;
    const bd = size * 0.32; // 등 뒤 입체 깊이

    // 2-1. 입체 등 뒤 날개 (깊이감 있게 뒤쪽에 배치)
    const wingFlap = Math.sin(time * (isMoving ? 10 : 3.5)) * 0.15;
    ctx.save();
    ctx.translate(0, cubeY - bh * 0.3 - bd * 0.4);
    this.drawWings25D(ctx, size, wingFlap);
    ctx.restore();

    // 2-2. 2.5D 몸체 큐브 (Top face, Right face, Front face)
    this.drawIsometricBodyBlock(ctx, 0, cubeY, bw, bh, bd);

    // 2-3. 2.5D 입체 제복 모자
    this.drawCap25D(ctx, 0, cubeY - bh * 0.48, bw, bd);

    // 2-4. 2.5D 쿼터뷰 기울어진 십자 헤일로 (공중에 3D 회전하며 부유)
    const haloFloat = Math.sin(time * 3.5) * 5;
    this.drawHalo25D(ctx, 0, cubeY - bh * 0.95 + haloFloat, size * 0.36);

    ctx.restore();
  }

  // 2.5D 몸체 블록 (전면, 윗면, 측면 입체)
  drawIsometricBodyBlock(ctx, cx, cy, w, h, d) {
    const hw = w / 2;
    const hh = h / 2;

    // --- 1. 정면 (Front Face) ---
    ctx.save();
    ctx.translate(cx, cy);

    // 전면 베이스
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-hw, -hh, w, h);

    // 전면 상단 (얼굴 & 단발머리)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-hw, -hh, w, h * 0.38);

    // 피부 톤
    ctx.fillStyle = '#ffedd5';
    ctx.fillRect(-hw * 0.7, -hh + h * 0.22, w * 0.7, h * 0.16);

    // 앞머리 실루엣
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-hw * 0.7, -hh + h * 0.22);
    ctx.lineTo(-hw * 0.2, -hh + h * 0.34);
    ctx.lineTo(0, -hh + h * 0.26);
    ctx.lineTo(hw * 0.3, -hh + h * 0.35);
    ctx.lineTo(hw * 0.7, -hh + h * 0.22);
    ctx.fill();

    // 흰색 제복 칼라
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-hw * 0.5, -hh + h * 0.38);
    ctx.lineTo(0, -hh + h * 0.54);
    ctx.lineTo(hw * 0.5, -hh + h * 0.38);
    ctx.lineTo(hw * 0.3, -hh + h * 0.38);
    ctx.lineTo(0, -hh + h * 0.46);
    ctx.lineTo(-hw * 0.3, -hh + h * 0.38);
    ctx.closePath();
    ctx.fill();

    // 선명한 붉은 넥타이
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-hw * 0.12, -hh + h * 0.45);
    ctx.lineTo(hw * 0.12, -hh + h * 0.45);
    ctx.lineTo(hw * 0.16, -hh + h * 0.72);
    ctx.lineTo(0, -hh + h * 0.82);
    ctx.lineTo(-hw * 0.16, -hh + h * 0.72);
    ctx.closePath();
    ctx.fill();

    // 단추
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(-hw * 0.35, -hh + h * 0.65, 2.5, 0, Math.PI * 2);
    ctx.arc(hw * 0.35, -hh + h * 0.65, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 우측 붉은 완장
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(hw - 7, -hh + h * 0.54, 7, h * 0.18);

    // 전면 테두리 엣지
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(-hw, -hh, w, h);

    ctx.restore();

    // --- 2. 우측면 (Right Depth Face - 원근 음영) ---
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#090d16'; // 그림자 진 어두운 면
    ctx.beginPath();
    ctx.moveTo(hw, -hh);
    ctx.lineTo(hw + d * 0.7, -hh - d * 0.45);
    ctx.lineTo(hw + d * 0.7, hh - d * 0.45);
    ctx.lineTo(hw, hh);
    ctx.closePath();
    ctx.fill();

    // 우측면 완장 연결 디테일
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(hw, -hh + h * 0.54);
    ctx.lineTo(hw + d * 0.7, -hh + h * 0.54 - d * 0.45);
    ctx.lineTo(hw + d * 0.7, -hh + h * 0.72 - d * 0.45);
    ctx.lineTo(hw, -hh + h * 0.72);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // --- 3. 윗면 (Top Face) ---
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#1e293b'; // 빛을 받는 윗면
    ctx.beginPath();
    ctx.moveTo(-hw, -hh);
    ctx.lineTo(-hw + d * 0.7, -hh - d * 0.45);
    ctx.lineTo(hw + d * 0.7, -hh - d * 0.45);
    ctx.lineTo(hw, -hh);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  // 2.5D 제복 모자
  drawCap25D(ctx, x, y, w, d) {
    ctx.save();
    ctx.translate(x, y);

    const hw = w * 0.55;

    // 모자 챙 (타원형 쿼터뷰)
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.ellipse(0, 0, hw, hw * 0.28, -0.05, 0, Math.PI * 2);
    ctx.fill();

    // 모자 크라운 본체
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.moveTo(-hw * 0.85, -5);
    ctx.lineTo(-hw * 0.7, -w * 0.35);
    ctx.lineTo(hw * 0.7 + d * 0.4, -w * 0.35 - d * 0.2);
    ctx.lineTo(hw * 0.85, -5);
    ctx.closePath();
    ctx.fill();

    // 금테
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, -4, hw * 0.85, hw * 0.22, 0, 0, Math.PI);
    ctx.stroke();

    // 금색 십자가 엠블럼
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 8;
    const bw = 4, bh = 13;
    ctx.fillRect(-bw / 2, -w * 0.28, bw, bh);
    ctx.fillRect(-bh / 2, -w * 0.28 + 3, bh, bw);

    ctx.restore();
  }

  // 2.5D 날개
  drawWings25D(ctx, size, flapAngle) {
    const span = size * 0.52;

    // 좌측 뒤 날개
    ctx.save();
    ctx.translate(-size * 0.3, 0);
    ctx.rotate(-0.25 - flapAngle);
    this.drawSingleWing(ctx, -1, span);
    ctx.restore();

    // 우측 뒤 날개
    ctx.save();
    ctx.translate(size * 0.3, 0);
    ctx.rotate(0.25 + flapAngle);
    this.drawSingleWing(ctx, 1, span);
    ctx.restore();
  }

  // 2.5D 쿼터뷰 헤일로 (비스듬한 타원 형태로 3D 공간에 떠 있음)
  drawHalo25D(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);

    // 쿼터뷰 각도로 납작하게 눕힌 타원
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 18;

    // 외곽 붉은 링
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 십자가 수직/수평 축 (원근 투영)
    const armX = r * 0.8;
    const armY = r * 0.35;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-armX, 0);
    ctx.lineTo(armX, 0);
    ctx.moveTo(0, -armY);
    ctx.lineTo(0, armY);
    ctx.stroke();

    // 중앙 화이트 코어 빛
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

if (typeof window !== 'undefined') {
  window.JTFMobRenderer = JTFMobRenderer;
}
