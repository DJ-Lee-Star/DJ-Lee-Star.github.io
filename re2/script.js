/**
 * 아키텍처 설계 메모
 * 1) 파일 구조: index.html에 6개 씬과 공용 컨트롤, styles.css는 엔터프라이즈 테마와 상태 스타일, script.js는 씬 매니저/애니메이션 로직.
 * 2) 씬 관리: 배열 scenes와 currentScene 인덱스, auto 타이머로 자동 진행, 키보드 및 버튼으로 수동 이동. sceneToken으로 재진입 시 이전 타이머 무효화.
 * 3) 애니메이션 전략: CSS 상태 클래스(is-active/is-done/is-warning 등) + JS 지연(delay)로 단계적 활성화. 페이드/슬라이드 전환은 scene 클래스 트랜지션 사용.
 * 4) 워크플로 상태: scene2Stages/scene2Tasks 설정을 기반으로 단계 상태를 순차 업데이트, 문제 시 경고/알림/이슈 카드 변경.
 * 5) 씬 진행: scene별 runSceneX 함수가 진입 시 초기화→타임라인 실행. revisit 시 리셋 후 다시 재생.
 * 6) 유지보수: 상수/셀렉터를 상단에 모으고, 각 씬 로직을 함수 분리. 문제 항목/자동입력/챗봇 응답은 데이터 맵으로 관리.
 */

const SCENE_DURATIONS = [12000, 15000, 9000, 12000, 10000, 12000];

const state = {
  current: 0,
  auto: true,
  timer: null,
  token: 0,
};

const scenes = Array.from(document.querySelectorAll(".scene"));
const indicator = document.getElementById("sceneIndicator");
const demoStatus = document.getElementById("demoStatus");
const autoToggle = document.getElementById("autoToggle");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");

// Scene elements reused
const docItems = Array.from(document.querySelectorAll("#docList .document-item"));
const startAnalysisBtn = document.getElementById("startAnalysisBtn");

const stageItems = Array.from(document.querySelectorAll("#stageList .stage-item"));
const taskGroups = Array.from(document.querySelectorAll(".task-group"));
const ocrAlert = document.getElementById("ocrAlert");
const issueCard = document.getElementById("issueCard");
const issueBadge = document.getElementById("issueBadge");
const issueTitle = document.getElementById("issueTitle");
const issueDesc = document.getElementById("issueDesc");
const exceptionStatus = document.getElementById("exceptionStatus");

const hilPopup = document.getElementById("hilPopup");
const openReviewBtn = document.getElementById("openReviewBtn");

const highlightAddress = document.getElementById("highlightAddress");
const highlightArea = document.getElementById("highlightArea");
const addrVal = document.getElementById("addrVal");
const areaVal = document.getElementById("areaVal");
const reviewStatus = document.getElementById("reviewStatus");
const resumeBtn = document.getElementById("resumeBtn");
const extractionRows = Array.from(document.querySelectorAll(".extraction-table tbody tr"));

const fillInputs = {
  biz: document.querySelector('[data-fill="biz"]'),
  corp: document.querySelector('[data-fill="corp"]'),
  addr: document.querySelector('[data-fill="addr"]'),
  area: document.querySelector('[data-fill="area"]'),
  value: document.querySelector('[data-fill="value"]'),
  loan: document.querySelector('[data-fill="loan"]'),
};

const chatButtons = Array.from(document.querySelectorAll(".suggestion"));
const chatUser = document.getElementById("chatUser");
const chatReply = document.getElementById("chatReply");
const chatMsg1 = document.getElementById("chatMsg1");

const autoFillValues = {
  biz: "123-45-67890",
  corp: "주식회사 미래테크",
  addr: "서울특별시 강남구 테헤란로 100",
  area: "560㎡",
  value: "32억원",
  loan: "12억원",
};

function clearTimer() {
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
  }
}

function scheduleNext() {
  clearTimer();
  if (!state.auto) return;
  state.timer = setTimeout(() => {
    goToScene(state.current + 1);
  }, SCENE_DURATIONS[state.current]);
}

function updateHeader() {
  indicator.textContent = `Scene ${state.current + 1} / ${scenes.length}`;
  demoStatus.textContent = state.auto ? "자동 재생" : "수동 탐색";
}

function delay(ms, cb, token) {
  setTimeout(() => {
    if (token !== state.token) return;
    cb();
  }, ms);
}

function goToScene(index) {
  state.current = (index + scenes.length) % scenes.length;
  scenes.forEach((scene, i) => scene.classList.toggle("is-active", i === state.current));
  updateHeader();
  resetScene(state.current);
  scheduleNext();
}

function resetScene(sceneIndex) {
  const token = ++state.token;
  switch (sceneIndex) {
    case 0: runScene1(token); break;
    case 1: runScene2(token); break;
    case 2: runScene3(token); break;
    case 3: runScene4(token); break;
    case 4: runScene5(token); break;
    case 5: runScene6(token); break;
    default: break;
  }
}

// Scene 1: documents appear, button shows
function runScene1(token) {
  docItems.forEach((item) => item.classList.remove("visible"));
  startAnalysisBtn.classList.add("hidden");
  docItems.forEach((item, idx) => delay(600 + idx * 700, () => item.classList.add("visible"), token));
  delay(3600, () => startAnalysisBtn.classList.remove("hidden"), token);
}

// Scene 2: staged orchestration timeline
function runScene2(token) {
  // Reset classes
  stageItems.forEach((item, i) => {
    item.classList.remove("is-active", "is-warning", "is-pending");
    if (i <= 2) item.classList.add("is-done");
    if (i === 3) item.classList.add("is-warning");
    if (i === 4) item.classList.add("is-pending");
  });

  taskGroups.forEach((group, idx) => {
    group.classList.remove("is-active");
    group.querySelectorAll(".task-chip").forEach((chip) => {
      chip.classList.remove("is-alert");
      if (chip.dataset.problem) chip.classList.add("is-warning");
    });
    if (idx === 3) group.classList.add("is-active");
  });

  ocrAlert.classList.remove("show", "hidden");
  ocrAlert.classList.add("hidden");
  issueCard.classList.remove("warn");
  issueBadge.textContent = "모니터링";
  issueBadge.className = "status-badge neutral";
  issueTitle.textContent = "정상 처리 중";
  issueDesc.textContent = "OCR 품질 모니터링";
  exceptionStatus.setAttribute("data-status", "warn");
  exceptionStatus.querySelector("strong").textContent = "대기";

  // Timeline
  delay(500, () => {
    stageItems[0].classList.add("is-done");
  }, token);

  delay(2500, () => {
    stageItems[1].classList.add("is-done");
  }, token);

  delay(4200, () => {
    stageItems[2].classList.add("is-done");
  }, token);

  delay(6200, () => {
    stageItems[3].classList.add("is-active");
    exceptionStatus.querySelector("strong").textContent = "실행 중";
  }, token);

  delay(8200, () => {
    const address = document.querySelector('[data-problem="address"]');
    const area = document.querySelector('[data-problem="area"]');
    address.classList.add("is-alert");
    area.classList.add("is-alert");
  }, token);

  delay(9500, () => {
    issueCard.classList.add("warn");
    issueBadge.textContent = "주의";
    issueBadge.className = "status-badge warn";
    issueTitle.textContent = "OCR 신뢰도 저하 감지";
    issueDesc.textContent = "담보물 주소 / 면적 항목";
    ocrAlert.classList.remove("hidden");
    ocrAlert.classList.add("show");
    exceptionStatus.querySelector("strong").textContent = "감지됨";
  }, token);
}

// Scene 3: HITL popup
function runScene3(token) {
  hilPopup.classList.remove("show");
  delay(500, () => hilPopup.classList.add("show"), token);
}

// Scene 4: review flow
function runScene4(token) {
  extractionRows.forEach((row) => row.classList.remove("selected"));
  highlightAddress.classList.remove("visible", "focused");
  highlightArea.classList.remove("visible", "focused");
  addrVal.textContent = "서울특별시 강남구 테헤란로 100";
  areaVal.textContent = "560㎡";
  reviewStatus.textContent = "검토 대기";
  resumeBtn.classList.add("hidden");

  delay(900, () => {
    extractionRows.find((r) => r.dataset.target === "address")?.classList.add("selected");
    highlightAddress.classList.add("visible", "focused");
    reviewStatus.textContent = "담보물 주소 검토 중";
  }, token);

  delay(2400, () => {
    addrVal.textContent = "서울특별시 강남구 테헤란로 100 (확정)";
    highlightAddress.classList.remove("focused");
    highlightArea.classList.add("visible", "focused");
    extractionRows.forEach((r) => r.classList.remove("selected"));
    extractionRows.find((r) => r.dataset.target === "area")?.classList.add("selected");
    reviewStatus.textContent = "전용면적 보정";
  }, token);

  delay(3800, () => {
    areaVal.textContent = "560㎡ (보정)";
    highlightArea.classList.remove("focused");
    extractionRows.forEach((r) => r.classList.remove("selected"));
    reviewStatus.textContent = "검토 완료";
    resumeBtn.classList.remove("hidden");
  }, token);
}

// Scene 5: autofill typing
function runScene5(token) {
  Object.values(fillInputs).forEach((input) => {
    input.value = "";
    input.classList.remove("filled");
  });

  const keys = Object.keys(fillInputs);
  keys.forEach((key, idx) => {
    delay(idx * 600, () => {
      typeText(fillInputs[key], autoFillValues[key], 28, token);
    }, token);
  });
}

// Scene 6: chatbot interaction
function runScene6(token) {
  chatButtons.forEach((btn) => btn.classList.remove("is-selected"));
  chatUser.classList.add("hidden");
  chatReply.classList.add("hidden");
  chatMsg1.classList.remove("hidden");

  delay(1600, () => {
    selectSuggestion("collateral");
  }, token);
}

function typeText(el, text, speed, token) {
  el.value = "";
  [...text].forEach((_, idx) => {
    delay(speed * idx, () => {
      el.value = text.slice(0, idx + 1);
      el.classList.add("filled");
    }, token);
  });
}

function selectSuggestion(key) {
  const map = {
    collateral: "담보 분석 상세 보기",
    finance: "기업 재무 분석 보기",
    risk: "리스크 요인 확인",
    extra: "추가 확인 항목",
  };
  chatButtons.forEach((btn) => {
    btn.classList.toggle("is-selected", btn.dataset.key === key);
  });
  chatUser.textContent = map[key];
  chatUser.classList.remove("hidden");
  chatReply.classList.remove("hidden");
}

// Controls
autoToggle.addEventListener("change", (e) => {
  state.auto = e.target.checked;
  updateHeader();
  scheduleNext();
});

prevBtn.addEventListener("click", () => goToScene(state.current - 1));
nextBtn.addEventListener("click", () => goToScene(state.current + 1));
restartBtn.addEventListener("click", () => goToScene(0));
startAnalysisBtn.addEventListener("click", () => goToScene(1));
openReviewBtn.addEventListener("click", () => goToScene(3));
resumeBtn.addEventListener("click", () => goToScene(4));

chatButtons.forEach((btn) => {
  btn.addEventListener("click", () => selectSuggestion(btn.dataset.key));
});

window.addEventListener("keydown", (e) => {
  if (e.key >= "1" && e.key <= "6") {
    goToScene(Number(e.key) - 1);
  }
  if (e.key === "ArrowRight") goToScene(state.current + 1);
  if (e.key === "ArrowLeft") goToScene(state.current - 1);
});

goToScene(0);
