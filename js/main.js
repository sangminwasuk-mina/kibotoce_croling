// ==========================================
// SCHALE TACTICAL TERMINAL - MAIN CONTROLLER
// ==========================================

let fieldExplorerInstance = null;
let districtCrawlerInstance = null;

window.addEventListener('DOMContentLoaded', () => {
  initSchaleApp();
});

function initSchaleApp() {
  console.log('[SCHALE] 샬레 관제 시스템 가동');

  // 1. 3D 실내 필드 (샬레 업무관 10층 & 생활관) 자동 시작
  const fieldContainer = document.getElementById('field-canvas-container');
  if (fieldContainer && typeof SchaleFieldExplorer !== 'undefined') {
    fieldExplorerInstance = new SchaleFieldExplorer('field-canvas-container');
    fieldExplorerInstance.start();
  } else if (fieldContainer && typeof JTFFieldExplorer !== 'undefined') {
    fieldExplorerInstance = new JTFFieldExplorer('field-canvas-container');
    fieldExplorerInstance.start();
  }

  // 2. 샬레 -> 전술 자치구 탐사 맵 전환 리스너
  const btnBackToSchale = document.getElementById('btn-back-to-schale');
  if (btnBackToSchale) {
    btnBackToSchale.addEventListener('click', () => {
      window.AppController.returnToSchale();
    });
  }

  // 3. 의뢰 모달 액션 리스너
  const btnBountyAccept = document.getElementById('btn-bounty-accept');
  const btnBountyDecline = document.getElementById('btn-bounty-decline');

  if (btnBountyAccept) {
    btnBountyAccept.addEventListener('click', () => {
      const modal = document.getElementById('bounty-modal');
      if (modal) modal.classList.add('hidden');
      window.AppController.launchDistrictExpedition('helmet_gang');
    });
  }

  if (btnBountyDecline) {
    btnBountyDecline.addEventListener('click', () => {
      const modal = document.getElementById('bounty-modal');
      if (modal) modal.classList.add('hidden');
      window.AppController.launchDistrictExpedition('free');
    });
  }
}

// 전역 화면 제어 컨트롤러
window.AppController = {
  // 샬레 3D 필드 -> 전술 탐사 맵 출격
  launchDistrictExpedition(courseType) {
    console.log('[FLOW] 샬레 -> 전술 자치구 출격:', courseType);
    const fieldScreen = document.getElementById('field-screen');
    const districtScreen = document.getElementById('district-screen');

    if (fieldExplorerInstance) {
      fieldExplorerInstance.stop();
    }
    if (fieldScreen) fieldScreen.classList.add('hidden');
    if (districtScreen) {
      districtScreen.classList.remove('hidden');

      if (!districtCrawlerInstance) {
        districtCrawlerInstance = new TrinityDistrictCrawler('district-map-canvas');
      }

      if (courseType === 'helmet_gang') {
        districtCrawlerInstance.setupHelmetGangCourse();
      } else {
        districtCrawlerInstance.setupFreeExplorationBranches();
      }

      districtCrawlerInstance.resize();
      districtCrawlerInstance.centerOnNode('node_jtf_hq');
    }
  },

  // 전술 탐사 맵 -> 샬레 3D 필드 복귀
  returnToSchale() {
    console.log('[FLOW] 전술 탐사 맵 -> 샬레 복귀');
    const districtScreen = document.getElementById('district-screen');
    const fieldScreen = document.getElementById('field-screen');

    if (districtScreen) districtScreen.classList.add('hidden');
    if (fieldScreen) {
      fieldScreen.classList.remove('hidden');
      if (fieldExplorerInstance) {
        fieldExplorerInstance.start();
      }
    }
  }
};
