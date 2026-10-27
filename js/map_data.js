// ==========================================
// KIVOTOS STRATEGIC MAP - REGION DATABASE
// ==========================================

const KIVOTOS_MAP_DATA = {
  // 기준 해상도 (1000 x 850 좌표계)
  viewBox: { width: 1000, height: 850 },

  regions: [
    {
      id: 'abydos',
      name: '아비도스 자치구',
      enName: 'ABYDOS DESERT SECTOR',
      shortName: '아비도스',
      emblem: '🏜️',
      color: '#f59e0b',
      fillColor: 'rgba(245, 158, 11, 0.18)',
      borderColor: 'rgba(245, 158, 11, 0.85)',
      isLocked: false,
      tag: '출격 가능',
      desc: '모래사막으로 뒤덮인 광활한 옛 대도시. 빚더미에 맞서 싸우는 아비도스 대책위원회의 거점입니다.',
      center: { x: 250, y: 370 },
      // 폴리곤 외곽선 좌표 (다각형)
      poly: [
        [150, 270], [280, 260], [330, 290], [380, 310], [400, 370],
        [370, 440], [300, 490], [240, 500], [180, 470], [140, 380], [130, 310]
      ]
    },
    {
      id: 'trinity',
      name: '트리니티 종합학원',
      enName: 'TRINITY GENERAL SECTOR',
      shortName: '트리니티',
      emblem: '🕊️',
      color: '#38bdf8',
      fillColor: 'rgba(56, 189, 248, 0.20)',
      borderColor: 'rgba(56, 189, 248, 0.90)',
      isLocked: false,
      tag: '출격 가능',
      desc: '유서 깊은 귀족적인 고딕 대성당과 티파티, 정의실현부가 통솔하는 키보토스 최대 규모 학원 자치구입니다.',
      center: { x: 330, y: 150 },
      poly: [
        [200, 40], [390, 30], [480, 50], [490, 140], [480, 220],
        [410, 250], [330, 270], [280, 240], [170, 230], [150, 130], [160, 60]
      ]
    },
    {
      id: 'gehenna',
      name: '게헨나 학원',
      enName: 'GEHENNA ACADEMY DISTRICT',
      shortName: '게헨나',
      emblem: '😈',
      color: '#f43f5e',
      fillColor: 'rgba(244, 63, 94, 0.18)',
      borderColor: 'rgba(244, 63, 94, 0.85)',
      isLocked: false,
      tag: '출격 가능',
      desc: '자유와 혼돈, 화끈한 화력을 숭상하는 학원. 만마전과 선도부(풍기위원회)가 치열하게 대립하는 자치구입니다.',
      center: { x: 520, y: 280 },
      poly: [
        [490, 190], [580, 180], [620, 240], [600, 340], [540, 400],
        [460, 410], [420, 340], [430, 270], [480, 220]
      ]
    },
    {
      id: 'millennium',
      name: '밀레니엄 사이언스 스쿨',
      enName: 'MILLENNIUM SCIENCE ZONE',
      shortName: '밀레니엄',
      emblem: '💻',
      color: '#06b6d4',
      fillColor: 'rgba(6, 182, 212, 0.20)',
      borderColor: 'rgba(6, 182, 212, 0.90)',
      isLocked: false,
      tag: '출격 가능',
      desc: '키보토스 첨단 공학과 수학의 정점. 세미나, 엔지니어부, C&C 특수메이드가 활동하는 마천루 테크 자치구입니다.',
      center: { x: 540, y: 660 },
      poly: [
        [430, 570], [560, 560], [650, 580], [700, 640], [680, 750],
        [600, 790], [480, 800], [380, 770], [340, 710], [390, 620]
      ]
    },
    {
      id: 'schale_center',
      name: '연방수사동아리 샬레 & 총학생회',
      enName: 'SCHALE & G.S.C TACTICAL CORE',
      shortName: '샬레 / 총학',
      emblem: '⭐',
      color: '#00f0ff',
      fillColor: 'rgba(0, 240, 255, 0.15)',
      borderColor: 'rgba(0, 240, 255, 0.75)',
      isLocked: true,
      tag: '🔒 잠김 (최종 수렴지)',
      desc: '모든 학원의 분쟁과 작전이 교차하는 최종 결전 중심지. 연방 총학생회 생텀타워와 샬레 본청이 위치합니다.',
      center: { x: 570, y: 490 },
      poly: [
        [500, 430], [610, 420], [660, 470], [650, 540], [580, 570],
        [490, 550], [460, 490]
      ]
    },
    {
      id: 'du_district',
      name: 'D.U 자치지구',
      enName: 'D.U METROPOLIS',
      shortName: 'D.U 지구',
      emblem: '🏢',
      color: '#94a3b8',
      fillColor: 'rgba(148, 163, 184, 0.08)',
      borderColor: 'rgba(148, 163, 184, 0.40)',
      isLocked: true,
      tag: '🔒 잠김 (미개척)',
      desc: '총학생회 직할 중앙 상업/교통 허브 메트로폴리스 구역입니다.',
      center: { x: 640, y: 350 },
      poly: [
        [580, 270], [670, 260], [720, 310], [710, 410], [650, 440],
        [590, 400], [570, 330]
      ]
    },
    {
      id: 'arius',
      name: '아리우스 자치구',
      enName: 'ARIUS AUTONOMOUS RUINS',
      shortName: '아리우스',
      emblem: '🏛️',
      color: '#a855f7',
      fillColor: 'rgba(168, 85, 247, 0.08)',
      borderColor: 'rgba(168, 85, 247, 0.45)',
      isLocked: true,
      tag: '🔒 잠김 (미개척)',
      desc: '키보토스 역사에서 지워진 잊혀진 지하 카타콤과 폐허 성당 자치구입니다.',
      center: { x: 550, y: 110 },
      poly: [
        [490, 40], [590, 30], [640, 90], [620, 160], [550, 180],
        [480, 140], [470, 70]
      ]
    },
    {
      id: 'valkyrie',
      name: '발키리 경찰학교',
      enName: 'VALKYRIE POLICE DISTRICT',
      shortName: '발키리',
      emblem: '🛡️',
      color: '#3b82f6',
      fillColor: 'rgba(59, 130, 246, 0.08)',
      borderColor: 'rgba(59, 130, 246, 0.40)',
      isLocked: true,
      tag: '🔒 잠김 (미개척)',
      desc: '키보토스 주요 도로와 광장의 치안을 담당하는 공안국과 경비국의 관할 구역입니다.',
      center: { x: 670, y: 200 },
      poly: [
        [620, 140], [700, 130], [740, 180], [720, 260], [660, 260], [600, 210]
      ]
    },
    {
      id: 'red_winter',
      name: '붉은겨울 연방학원',
      enName: 'RED WINTER FEDERATION',
      shortName: '붉은겨울',
      emblem: '❄️',
      color: '#e0f2fe',
      fillColor: 'rgba(224, 242, 254, 0.08)',
      borderColor: 'rgba(224, 242, 254, 0.40)',
      isLocked: true,
      tag: '🔒 잠김 (미개척)',
      desc: '북방의 얼어붙은 만년설 지대에 자리한 거대 연방 학원 자치구입니다.',
      center: { x: 690, y: 60 },
      poly: [
        [630, 10], [760, 10], [800, 60], [770, 120], [680, 120], [620, 70]
      ]
    },
    {
      id: 'hyakkiyako',
      name: '백귀야행 연합학원',
      enName: 'HYAKKIYAKO ALLIANCE SECTOR',
      shortName: '백귀야행',
      emblem: '🌸',
      color: '#ec4899',
      fillColor: 'rgba(236, 72, 153, 0.08)',
      borderColor: 'rgba(236, 72, 153, 0.40)',
      isLocked: true,
      tag: '🔒 잠김 (미개척)',
      desc: '벚꽃이 흩날리는 전통 거리와 관광, 축제(마츠리)가 연중 열리는 화려한 학원가입니다.',
      center: { x: 840, y: 500 },
      poly: [
        [740, 420], [860, 400], [950, 450], [970, 560], [920, 640],
        [830, 630], [750, 580], [720, 500]
      ]
    },
    {
      id: 'shanhaijing',
      name: '산해경 고급중학교',
      enName: 'SHANHAIJING CENTRAL AREA',
      shortName: '산해경',
      emblem: '🐼',
      color: '#10b981',
      fillColor: 'rgba(16, 185, 129, 0.08)',
      borderColor: 'rgba(16, 185, 129, 0.40)',
      isLocked: true,
      tag: '🔒 잠김 (미개척)',
      desc: '유구한 중화풍 전통과 비전 연단방, 대규모 상인회 현룡문이 번영을 누리는 자치구입니다.',
      center: { x: 800, y: 260 },
      poly: [
        [720, 180], [820, 170], [890, 220], [870, 330], [790, 360],
        [720, 320], [700, 250]
      ]
    },
    {
      id: 'slumpia_kaiser',
      name: '슬럼피아 & 카이저 본사',
      enName: 'SLUMPIA & KAISER INDUSTRIAL',
      shortName: '슬럼피아',
      emblem: '⚙️',
      color: '#a1a1aa',
      fillColor: 'rgba(161, 161, 170, 0.08)',
      borderColor: 'rgba(161, 161, 170, 0.40)',
      isLocked: true,
      tag: '🔒 잠김 (미개척)',
      desc: '폐쇄된 테마파크 슬럼피아와 카이저 코퍼레이션 중공업 군수 공장 밀집 지구입니다.',
      center: { x: 250, y: 640 },
      poly: [
        [150, 520], [280, 530], [350, 570], [370, 670], [330, 740],
        [220, 750], [140, 710], [120, 610]
      ]
    },
    {
      id: 'black_market',
      name: '키보토스 암시장',
      enName: 'KIVOTOS BLACK MARKET',
      shortName: '암시장',
      emblem: '💰',
      color: '#eab308',
      fillColor: 'rgba(234, 179, 8, 0.08)',
      borderColor: 'rgba(234, 179, 8, 0.40)',
      isLocked: true,
      tag: '🔒 잠김 (미개척)',
      desc: '법의 손길이 닿지 않는 거대 지하 밀거래 시장. 무기와 불법 용병이 오가는 구역입니다.',
      center: { x: 440, y: 470 },
      poly: [
        [390, 420], [470, 410], [500, 460], [470, 520], [400, 520], [370, 470]
      ]
    },
    {
      id: 'eridu',
      name: '요새도시 에리두',
      enName: 'FORTRESS CITY ERIDU',
      shortName: '에리두',
      emblem: '📡',
      color: '#14b8a6',
      fillColor: 'rgba(20, 184, 166, 0.08)',
      borderColor: 'rgba(20, 184, 166, 0.40)',
      isLocked: true,
      tag: '🔒 잠김 (미개척)',
      desc: '밀레니엄 외곽 깊숙한 곳에 비밀리에 축조된 거대 무인 방어 요새 도시입니다.',
      center: { x: 840, y: 720 },
      poly: [
        [750, 660], [870, 640], [940, 700], [920, 800], [800, 810], [740, 750]
      ]
    }
  ],

  // 수로 및 주요 강줄기 (장예카 / 아라바 수로)
  waterways: [
    [
      [890, 190], [820, 280], [730, 360], [670, 430], [550, 490],
      [420, 530], [330, 540], [210, 510], [130, 520]
    ]
  ]
};

if (typeof window !== 'undefined') {
  window.KIVOTOS_MAP_DATA = KIVOTOS_MAP_DATA;
}
