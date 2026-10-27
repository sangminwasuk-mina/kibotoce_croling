// ==========================================
// KIVOTOS STRATEGIC MAP - REGION DATABASE
// (키보토스 전역 지도 데이터 - 원본 지도 기반 무결점 지형 토폴로지)
// ==========================================

const KIVOTOS_MAP_DATA = {
  // 기준 해상도 (1200 x 984 좌표계 - 300x246 원본 4배 정밀 스케일)
  viewBox: { width: 1200, height: 984 },

  regions: [
    {
      id: 'trinity',
      name: '트리니티 종합학원',
      enName: 'TRINITY GENERAL SECTOR',
      shortName: '트리니티',
      emblem: '🕊️',
      color: '#38bdf8',
      fillColor: 'rgba(56, 189, 248, 0.22)',
      borderColor: 'rgba(56, 189, 248, 0.95)',
      isLocked: false,
      tag: '✅ 작전 출격 가능',
      club: '정의실현부',
      initialStudent: '정의실현부 모브',
      desc: '북서부 광활한 영지를 아우르는 키보토스 최대 규모 학원. 유서 깊은 고딕 대성당과 티파티, 정의실현부가 통솔하는 우아하고 강력한 자치구입니다.',
      center: { x: 378, y: 287 },
      poly: [
        [260, 0], [580, 0], [580, 120], [580, 340], [500, 420], 
        [420, 472], [340, 488], [260, 472], [180, 440], [220, 280], [240, 120]
      ]
    },
    {
      id: 'abydos',
      name: '아비도스 자치구',
      enName: 'ABYDOS DESERT DISTRICT',
      shortName: '아비도스',
      emblem: '🏜️',
      color: '#f59e0b',
      fillColor: 'rgba(245, 158, 11, 0.10)',
      borderColor: 'rgba(245, 158, 11, 0.45)',
      isLocked: true,
      tag: '🔒 잠김 (추후 개방)',
      desc: '서부 해안과 마누 화산 사이에 위치한 옛 대도시. 모래폭풍에 파묻힌 사막 횡단열차 철도와 빚더미에 맞서는 아비도스 대책위원회의 본거지입니다.',
      center: { x: 337, y: 593 },
      poly: [
        [180, 440], [260, 472], [340, 488], [420, 472], [472, 540], 
        [500, 640], [480, 700], [420, 720], [340, 728], [272, 740], 
        [200, 640], [160, 540]
      ]
    },
    {
      id: 'gehenna',
      name: '게헨나 학원',
      enName: 'GEHENNA ACADEMY DISTRICT',
      shortName: '게헨나',
      emblem: '😈',
      color: '#f43f5e',
      fillColor: 'rgba(244, 63, 94, 0.10)',
      borderColor: 'rgba(244, 63, 94, 0.45)',
      isLocked: true,
      tag: '🔒 잠김 (추후 개방)',
      desc: '키보토스 중앙 북부에 자리잡은 자유와 혼돈의 거대 학원. 불꽃 튀는 화력과 개성을 자랑하며 만마전과 선도부(풍기위원회)가 자치구를 수호합니다.',
      center: { x: 590, y: 505 },
      poly: [
        [420, 472], [500, 420], [580, 340], [660, 360], [700, 368], 
        [712, 460], [688, 540], [660, 600], [640, 660], [552, 660], 
        [500, 640], [472, 540]
      ]
    },
    {
      id: 'millennium',
      name: '밀레니엄 사이언스 스쿨',
      enName: 'MILLENNIUM SCIENCE ZONE',
      shortName: '밀레니엄',
      emblem: '💻',
      color: '#06b6d4',
      fillColor: 'rgba(6, 182, 212, 0.10)',
      borderColor: 'rgba(6, 182, 212, 0.45)',
      isLocked: true,
      tag: '🔒 잠김 (추후 개방)',
      desc: '장예카 수로 이남, 남부 전역을 아우르는 키보토스 첨단 공학/수학의 정점. 세미나, 엔지니어부, C&C 특수메이드가 활동하는 테크 마천루 지구입니다.',
      center: { x: 673, y: 895 },
      poly: [
        [460, 820], [560, 848], [660, 848], [740, 820], [840, 800], 
        [860, 880], [840, 960], [800, 984], [640, 984], [520, 984], [480, 920]
      ]
    },
    {
      id: 'schale_gsc',
      name: '연방수사동아리 샬레 & 총학생회',
      enName: 'SCHALE & G.S.C TACTICAL CORE',
      shortName: '샬레 / 총학',
      emblem: '⭐',
      color: '#00f0ff',
      fillColor: 'rgba(0, 240, 255, 0.18)',
      borderColor: 'rgba(0, 240, 255, 0.85)',
      isLocked: true,
      tag: '🔒 잠김 (최종 수렴지)',
      desc: '키보토스 모든 자치구의 분쟁과 작전 경로가 교차하는 정중앙 결전의 심장부. 연방 총학생회 생텀타워와 샬레 본청이 위치합니다.',
      center: { x: 665, y: 739 },
      poly: [
        [640, 660], [700, 680], [760, 700], [740, 780], 
        [660, 808], [600, 792], [600, 768], [620, 720]
      ]
    },
    {
      id: 'arius',
      name: '아리우스 자치구',
      enName: 'ARIUS AUTONOMOUS RUINS',
      shortName: '아리우스',
      emblem: '🏛️',
      color: '#a855f7',
      fillColor: 'rgba(168, 85, 247, 0.10)',
      borderColor: 'rgba(168, 85, 247, 0.45)',
      isLocked: true,
      tag: '🔒 잠김 (미개척)',
      desc: '트리니티와 게헨나 북쪽 산악 틈새에 숨겨진 잊혀진 자치구. 지하 카타콤과 폐허 성당으로 이루어져 있습니다.',
      center: { x: 660, y: 194 },
      poly: [
        [580, 0], [740, 0], [740, 120], [700, 240], 
        [700, 368], [660, 360], [580, 340], [580, 120]
      ]
    },
    {
      id: 'valkyrie',
      name: '발키리 경찰학교',
      enName: 'VALKYRIE POLICE DISTRICT',
      shortName: '발키리',
      emblem: '🛡️',
      color: '#3b82f6',
      fillColor: 'rgba(59, 130, 246, 0.10)',
      borderColor: 'rgba(59, 130, 246, 0.45)',
      isLocked: true,
      tag: '🔒 잠김 (미개척)',
      desc: '게헨나 동쪽, 중앙 도로망의 치안을 담당하는 공안국과 경비국의 관할 구역입니다.',
      center: { x: 785, y: 336 },
      poly: [
        [740, 120], [840, 100], [920, 120], [872, 240], [848, 400], 
        [832, 560], [780, 552], [688, 540], [712, 460], [700, 368], [700, 240]
      ]
    },
    {
      id: 'du_district',
      name: 'D.U 자치지구',
      enName: 'D.U METROPOLIS',
      shortName: 'D.U 지구',
      emblem: '🏢',
      color: '#94a3b8',
      fillColor: 'rgba(148, 163, 184, 0.10)',
      borderColor: 'rgba(148, 163, 184, 0.45)',
      isLocked: true,
      tag: '🔒 잠김 (미개척)',
      desc: '총학생회 직할 중앙 상업/교통 허브 메트로폴리스 구역입니다.',
      center: { x: 738, y: 627 },
      poly: [
        [688, 540], [780, 552], [832, 560], [840, 720], 
        [760, 700], [700, 680], [640, 660], [660, 600]
      ]
    },
    {
      id: 'red_winter',
      name: '붉은겨울 연방학원',
      enName: 'RED WINTER FEDERATION',
      shortName: '붉은겨울',
      emblem: '❄️',
      color: '#e0f2fe',
      fillColor: 'rgba(224, 242, 254, 0.10)',
      borderColor: 'rgba(224, 242, 254, 0.45)',
      isLocked: true,
      tag: '🔒 잠김 (미개척)',
      desc: '키보토스 최북단 만년설과 동토의 거대한 연방 자치구입니다.',
      center: { x: 797, y: 57 },
      poly: [
        [740, 0], [960, 0], [920, 120], [840, 100], [740, 120]
      ]
    },
    {
      id: 'black_market',
      name: '키보토스 골목 암시장',
      enName: 'KIVOTOS BLACK MARKET',
      shortName: '골목 암시장',
      emblem: '💰',
      color: '#eab308',
      fillColor: 'rgba(234, 179, 8, 0.10)',
      borderColor: 'rgba(234, 179, 8, 0.45)',
      isLocked: true,
      tag: '🔒 잠김 (미개척)',
      desc: '아비도스와 게헨나, 샬레 사이에 끼어 있는 무법의 지하 밀거래 거리입니다.',
      center: { x: 552, y: 706 },
      poly: [
        [500, 640], [552, 660], [640, 660], [620, 720], 
        [600, 768], [540, 760], [480, 740], [480, 700]
      ]
    },
    {
      id: 'kaiser_slumpia',
      name: '슬럼피아 & 카이저 본사',
      enName: 'SLUMPIA & KAISER INDUSTRIAL',
      shortName: '슬럼피아 / 카이저',
      emblem: '⚙️',
      color: '#a1a1aa',
      fillColor: 'rgba(161, 161, 170, 0.10)',
      borderColor: 'rgba(161, 161, 170, 0.45)',
      isLocked: true,
      tag: '🔒 잠김 (미개척)',
      desc: '장예카 수로 남서쪽에 자리한 폐쇄 테마파크 슬럼피아와 카이저 코퍼레이션 군수 공장 밀집 구역입니다.',
      center: { x: 319, y: 901 },
      poly: [
        [272, 820], [360, 820], [460, 820], [480, 920], 
        [520, 984], [320, 984], [180, 984], [120, 920], [160, 860]
      ]
    },
    {
      id: 'eridu',
      name: '요새도시 에리두',
      enName: 'FORTRESS CITY ERIDU',
      shortName: '에리두',
      emblem: '📡',
      color: '#14b8a6',
      fillColor: 'rgba(20, 184, 166, 0.10)',
      borderColor: 'rgba(20, 184, 166, 0.45)',
      isLocked: true,
      tag: '🔒 잠김 (미개척)',
      desc: '밀레니엄 남동쪽 심도에 극비리에 축조된 무인 요새 방어 도시입니다.',
      center: { x: 918, y: 904 },
      poly: [
        [840, 800], [940, 820], [1020, 860], [1040, 940], 
        [1000, 984], [800, 984], [840, 960], [860, 880]
      ]
    },
    {
      id: 'hyakkiyako',
      name: '백귀야행 연합학원 & 동부 산악',
      enName: 'HYAKKIYAKO & INWANGSAN',
      shortName: '백귀야행',
      emblem: '🌸',
      color: '#ec4899',
      fillColor: 'rgba(236, 72, 153, 0.10)',
      borderColor: 'rgba(236, 72, 153, 0.45)',
      isLocked: true,
      tag: '🔒 잠김 (미개척)',
      desc: '장예카 수로 동편 인왕산, 백호폭포, 전통 축제 거리가 늘어선 화려한 연합 학원가입니다.',
      center: { x: 979, y: 531 },
      poly: [
        [832, 560], [848, 400], [872, 240], [920, 120], [960, 0], 
        [1160, 260], [1190, 400], [1190, 800], [1120, 920], [1020, 860], 
        [940, 820], [840, 800], [840, 720]
      ]
    }
  ],

  // 서쪽 외해 군도 (낙원점 해역, 대마왕 현자의 집, 마에스트로 저택 등)
  westIslands: [
    { name: '듀얼리스트 연구원', x: 100, y: 160, r: 24 },
    { name: '대마왕 현자의 집', x: 120, y: 420, r: 22 },
    { name: '작은 왕국의 집무실', x: 100, y: 740, r: 20 },
    { name: '마에스트로의 저택', x: 80, y: 900, r: 25 }
  ],

  // 키보토스 주요 수로 (장예카 대수로 & 아라바 수로)
  waterways: [
    // 주 대수로: 동북부 인왕산/백호폭포 협곡 -> 남서부 외해로 대각선 관통
    [
      [1160, 260], [1060, 380], [980, 500], [940, 620], [840, 720],
      [740, 780], [660, 808], [600, 792], [540, 760], [480, 740],
      [420, 720], [340, 728], [272, 780], [180, 840]
    ],
    // 아라바 강가 지류: 샬레 북서부에서 주 수로로 합류
    [
      [600, 768], [540, 760], [480, 740]
    ]
  ]
};

if (typeof window !== 'undefined') {
  window.KIVOTOS_MAP_DATA = KIVOTOS_MAP_DATA;
}
