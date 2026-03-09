# 기업여신 AI Agent 시연 — 재설계 확정 및 보완서

> 본 문서는 기존 8개 문서의 **미확정 사항을 확정**하고, **문서 간 불일치를 해소**하며,  
> **누락 스펙을 보완**하는 최종 결정 문서이다.  
> 재구현 시 본 문서의 내용이 기존 문서와 충돌할 경우 **본 문서가 우선**한다.

---

## 0. 단말-Agent-브릿지 역할 분리 원칙

> **이 원칙은 모든 구현 및 설계의 최우선 기준이다.**

```
단말이 AI 호출 → Agent 수행 (필요시 HITL) → 브릿지 알림 → 브릿지에서 결과 확인 → 단말에 적용
```

### 0.1 핵심 규칙

| # | 규칙 | 설명 |
|---|------|------|
| R-1 | **단말은 AI 결과를 직접 표시할 수 없다** | AI-OCR 추출값, AI 판단 결과 등은 반드시 브릿지(HITL 검토)를 거친 뒤 "WINI 수신" 형태로 단말에 도달 |
| R-2 | **단말은 AI를 호출(트리거)만 할 수 있다** | P2의 "AI 검수 요청" 버튼은 AI 호출 트리거이므로 원칙에 부합 |
| R-3 | **Agent 화면은 백그라운드 처리 시각화** | P3~P6, P9는 AI의 자율 처리 과정을 보여주는 것이므로 원칙에 부합 |
| R-4 | **브릿지는 사람-AI 상호작용 공간** | P8, P11, P13에서 사람이 AI 결과를 검토·확인·질문 |
| R-5 | **브릿지 미니는 Agent→단말 알림 경로** | P7, P10은 Agent가 브릿지를 통해 단말에 알림을 보내는 구조 |

### 0.2 역할 분리 적용 결과

| 화면 | 변경 전 | 변경 후 | 변경 사유 |
|------|--------|--------|----------|
| **P12** | "재무 정보 (AI-OCR 추출)" 직접 표시 | "재무 정보 (브릿지 수신)" + WINI 수신 뱃지 | R-1 위반 → 브릿지 경유 표현으로 변경 |
| **P12** | "전결 / 심사" 직접 표시 | "전결 / 심사 (브릿지 수신)" | R-1 위반 → 브릿지 경유 표현으로 변경 |
| **P13** | 커스텀 테마 (`p13-bg`), `QA Agent` 뱃지 | `theme-bridge`, `AI 브릿지` + `QA` 서브뱃지 | R-4 적용 → QA도 브릿지 내 기능으로 재정의 |

### 0.3 beforeunload 처리 (시연 안정성)

페이지 전환 시 "사이트에서 나가시겠습니까?" 브라우저 경고가 발생하지 않도록, `demo-engine.js`에 `_allowNav` 플래그를 도입:

```js
// demo-engine.js
let _allowNav = false;
window.addEventListener('beforeunload', (e) => {
  if (_allowNav) return;   // 의도된 전환 시 경고 생략
  e.preventDefault();
});

// demo-navigator.js — 페이지 전환 직전
DemoEngine._allowNav = true;
window.location.href = nextUrl;
```

---

## 1. 확정 사항 총괄

| # | 항목 | 확정값 | 기존 상태 | 영향 문서 |
|---|------|--------|----------|----------|
| 1 | 캔버스 크기 | **1920 × 1080 px (Full HD)** | 권장/대체 병기 | 화면설계 방향서, IA, 설계문서 |
| 2 | 데이터 파일 형식 | **JSON** (ES module import 래핑) | JSON vs JS 미확정 | 데이터 사전, IA |
| 3 | 시연 총 시간 | **약 60초** (P0~P12 기본 흐름) | 약 140초 | IA, 기획문서 |
| 4 | 키보드 매핑 | 아래 3절 참조 | 미정의 | 화면설계 방향서 12절, IA |
| 5 | 모든 구현 기준 | **재설계 문서 기준** | 현행 기준 문서 존재 | 기획/설계(구현기준)은 참고만 |
| 6 | 자동 재생 | **기본 ON**, 키보드로 정지/재개 | 기존과 동일 | IA, 기획문서 |
| 7 | **시연 시나리오** | **기업부동산담보대출** ((주)000바이오, 30억원, LTV 62.5%) | 기업운전일반자금대출 | 전체 문서 |
| 8 | **서류 구성** | **9건** (기본 5 + 담보 3 + 조건부 1) | 6건 (기본 5 + 추가 1) | 기능명세서, IA, 데이터사전 |
| 9 | **헤더** | **80px 통합 헤더** + 로고(h1_01.png) | 56px | 화면설계 방향서, IA |
| 10 | **타이포그래피** | **프로젝터용 업스케일** (최소 14px, 본문 18px, 제목 28-44px) | 미확정 | 화면설계 방향서 |
| 11 | **단말 디자인** | **g1.html 스타일** (AppBar/TabBar/StatusStrip/Workspace/Footer) | 미확정 | IA |
| 12 | **Agent 디자인** | 스캔 라인 **제거**, 도트 그리드+글래스 카드+프로세스 로그 유지 | 스캔 라인 포함 | IA |

---

## 2. 캔버스 및 레이아웃 확정

### 2.1 캔버스 사양

| 속성 | 확정값 |
|------|--------|
| 캔버스 크기 | **1920 × 1080 px** |
| Safe Margin | 40px (상하좌우) |
| 실제 사용 영역 | 1840 × 1000 px |
| 헤더 높이 | **80px** (통합 헤더, 로고 h1_01.png 포함) |
| 콘텐츠 영역 | 1840 × 960 px |
| 기본 그리드 | 12컬럼, gutter 16px |
| 컬럼 폭 | ~139px |

> 1280×720 옵션은 제거. CSS `transform: scale()`로 저해상도 대응은 유지하되, 개발은 1920 단일 기준.

### 2.4 타이포그래피 업스케일 (프로젝터 대응)

프로젝터 시연 환경에서의 가독성을 위해, 모든 폰트 사이즈를 업스케일한다:

| 용도 | 기존 (미확정) | 확정값 | 비고 |
|------|-------------|--------|------|
| 최소 텍스트 | 11px | **14px** | 뱃지, 캡션 등 |
| 본문 | 14px | **18px** | 테이블 셀, 폼 입력 등 |
| 소제목 | 16-18px | **28px** | 섹션 헤더, 카드 타이틀 |
| 대제목 | 20-24px | **36px** | 화면 타이틀 |
| 메인 타이틀 | — | **44px** | P0 프로세스 맵 등 특수 화면 |

### 2.5 통합 헤더 (80px)

모든 화면 유형(단말/Agent/브릿지/미니)에 동일한 80px 통합 헤더를 적용한다:

| 속성 | 확정값 |
|------|--------|
| 높이 | **80px** |
| 로고 | `h1_01.png` (좌측 상단) |
| 좌측 구성 | 로고 + 타이틀 + (Agent pill, 화면별 상이) |
| 우측 구성 | 채널 뱃지 (영업점단말/백그라운드실행/AI브릿지) |

### 2.6 단말 화면 g1.html 스타일 적용

단말 화면(P1, P2, P12)은 g1.html 디자인을 기반으로 재설계한다:

| 영역 | 설명 |
|------|------|
| **AppBar** | 80px 통합 헤더 + 로고(h1_01.png) |
| **TabBar** | 업무 탭 구분 (여신신청/서류등록 등) |
| **StatusStrip** | 접수번호, 처리상태, 차주명 등 현재 건 요약 |
| **Workspace** | 메인 작업 영역 (폼 그리드, 서류 테이블 등) |
| **Footer** | 하단 정보 바 (버전, 접속정보 등) |

### 2.7 Agent 화면 디자인 변경

Agent 화면(P3~P6, P9)에서 스캔 라인 효과를 제거하고, 도트 그리드 + 글래스 카드 + 프로세스 로그를 유지한다:

| 항목 | 변경 전 | 변경 후 |
|------|--------|--------|
| 스캔 라인 | 수평 이동 반복 애니메이션 | **제거** |
| 도트 그리드 | 유지 | 유지 (배경 패턴) |
| 글래스 카드 | 유지 | 유지 (글래스모피즘 스타일) |
| 프로세스 로그 | 유지 | 유지 (실시간 처리 로그) |

### 2.2 AppShell CSS 확정

```css
.app-shell {
  width: 1920px;
  height: 1080px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  background: var(--bg);
  font-family: var(--font-primary);
}

.app-header {
  height: 80px;
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-content {
  height: calc(1080px - 80px); /* 1000px */
  padding: 0 40px 40px;
  overflow: hidden;
}
```

### 2.3 저해상도 대응 (자동 스케일)

```js
function autoScale() {
  const shell = document.querySelector('.app-shell');
  const scaleX = window.innerWidth / 1920;
  const scaleY = window.innerHeight / 1080;
  const scale = Math.min(scaleX, scaleY);
  shell.style.transform = `scale(${scale})`;
  shell.style.transformOrigin = 'top left';
}
window.addEventListener('resize', autoScale);
window.addEventListener('load', autoScale);
```

---

## 3. 키보드 매핑 확정

### 3.1 시연 컨트롤

| 키 | 기능 | 모드 | 설명 |
|----|------|------|------|
| `→` (Right) | 다음 페이지 | 공통 | 자동 재생 중이면 현재 시퀀스 스킵 → 즉시 다음 페이지 |
| `←` (Left) | 이전 페이지 | 공통 | 이전 페이지로 복귀 (히스토리 백) |
| `Space` | 일시정지 / 재개 | 자동 모드 | 현재 시퀀스 정지, 다시 누르면 이어서 진행 |
| `Esc` | 시연 초기화 | 공통 | sessionStorage 클리어 + P0(또는 P1)로 이동 |
| `1`~`9`, `0` | 페이지 점프 | 공통 | 1=P1, 2=P2, ..., 9=P9, 0=P10 |
| `-` (Minus) | P11 점프 | 공통 | 숫자키 부족 보완 |
| `=` (Equal) | P12 점프 | 공통 | 숫자키 부족 보완 |
| `[` | 속도 감소 (0.5×) | 자동 모드 | 최소 0.25× |
| `]` | 속도 증가 (2×) | 자동 모드 | 최대 4× |
| `F` | 풀스크린 토글 | 공통 | `document.fullscreenElement` 토글 |
| `I` | 인디케이터 토글 | 공통 | 하단 모드/페이지/속도 표시 ON/OFF |
| `P` | P0 (프로세스 맵) 점프 | 공통 | 오프닝으로 복귀 |
| `Q` | P13 (QA) 점프 | 공통 | QA 화면으로 이동 (구현 시) |

### 3.2 차단 키

| 키 | 차단 사유 |
|----|----------|
| `F5`, `Ctrl+R` | 새로고침 방지 (상태 손실) |
| `Ctrl+W`, `Ctrl+F4` | 탭 닫힘 방지 |
| `Alt+←`, `Alt+→` | 브라우저 히스토리 네비게이션 방지 |
| `Ctrl+L`, `F6` | 주소창 포커스 방지 |
| `Tab` | 포커스 이탈 방지 |
| `Ctrl+±`, `Ctrl+0` | 브라우저 줌 방지 |
| `Ctrl+S` | 저장 다이얼로그 방지 |
| `Ctrl+P` | 인쇄 다이얼로그 방지 |

### 3.3 구현 코드 기본형

```js
const KEY_MAP = {
  'ArrowRight': 'nextPage',
  'ArrowLeft':  'prevPage',
  ' ':          'togglePause',
  'Escape':     'reset',
  '1':'jumpP1','2':'jumpP2','3':'jumpP3','4':'jumpP4','5':'jumpP5',
  '6':'jumpP6','7':'jumpP7','8':'jumpP8','9':'jumpP9','0':'jumpP10',
  '-':'jumpP11','=':'jumpP12',
  '[':'speedDown', ']':'speedUp',
  'f':'fullscreen', 'F':'fullscreen',
  'i':'toggleIndicator', 'I':'toggleIndicator',
  'p':'jumpP0', 'P':'jumpP0',
  'q':'jumpP13', 'Q':'jumpP13',
};

const BLOCKED_KEYS = new Set([
  'F5','F6','Tab',
]);

const BLOCKED_COMBOS = [
  { ctrl: true, key: 'r' },
  { ctrl: true, key: 'w' },
  { ctrl: true, key: 'l' },
  { ctrl: true, key: 's' },
  { ctrl: true, key: 'p' },
  { ctrl: true, key: '+' },
  { ctrl: true, key: '-' },
  { ctrl: true, key: '0' },
  { alt: true,  key: 'ArrowLeft' },
  { alt: true,  key: 'ArrowRight' },
];

document.addEventListener('keydown', (e) => {
  if (BLOCKED_KEYS.has(e.key)) { e.preventDefault(); return; }
  for (const combo of BLOCKED_COMBOS) {
    if ((combo.ctrl && e.ctrlKey || combo.alt && e.altKey) && e.key === combo.key) {
      e.preventDefault(); return;
    }
  }
  const action = KEY_MAP[e.key];
  if (action) { e.preventDefault(); DemoEngine.dispatch(action); }
});
```

---

## 4. 시연 타이밍 확정 (목표: 60초)

### 4.1 DEMO_TIME_SCALE 통합

모든 화면의 개별 DEMO_TIME_SCALE을 폐지하고, **전역 단일 속도 계수**를 사용:

```js
const DEMO_CONFIG = {
  timeScale: 1.0,   // []/[] 키로 조절 (0.25 ~ 4.0)
  baseUnit: 200,     // 기본 단위 딜레이 (ms)
  typeSpeed: 30,     // 타이핑 속도 (ms/char)
};
```

### 4.2 화면별 타이밍 예산 (timeScale=1.0 기준)

| 화면 | 유형 | 예산 | 핵심 시퀀스 | 전환 딜레이 |
|------|------|------|-----------|-----------|
| **P0** | 개요 | **4초** | 프로세스 맵 페이드인 → 4단계 순차 하이라이트 | 300ms |
| **P1** | 단말 | **6초** | 13필드 자동 타이핑 (빠른 모드: 선택 필드만 타이핑, 나머지 즉시 표시) | 300ms |
| **P2** | 단말 | **4초** | 전체 선택→등록완료→BPR→AI검수 버튼 | 300ms |
| **P3** | Agent | **4초** | 5문서 인식 → 4카드 채움 → 실행순서 | 200ms |
| **P4** | Agent | **3초** | 3문서 전처리 → 4작업 완료 | 200ms |
| **P5** | Agent | **5초** | RPA 프로그레스 → 3문서 검증 파이프라인 | 200ms |
| **P6** | Agent | **5초** | 5문서 OCR → 법인등기부 검토필요 → 메시지 전송 | 200ms |
| **P7** | 미니 | **2초** | 미니카드 슬라이드업 → 메시지 표시 | 200ms |
| **P8** | 브릿지 | **5초** | 법인등기부 선택 → 자본금 클릭 → 수정 → 적용 → 작업재개 | 300ms |
| **P9** | Agent | **6초** | 2문서×7단계 검증 → 전결 판단 → 메시지 전송 | 200ms |
| **P10** | 미니 | **2초** | 완료 알림 슬라이드업 | 200ms |
| **P11** | 브릿지 | **4초** | 플로우바 순차 클릭(4단계) → WINI 전송 | 300ms |
| **P12** | 단말 | **4초** | WINI 수신 상태 → 21필드 페이드인 → 심사요청 → 완료 모달 | 300ms |
| | | **54초** | | |
| **P13** | 브릿지 | **(+12초)** | 3턴 대화 자동 재생 (선택) | — |

> **P0~P12 기본 흐름: 약 54초** + 전환 딜레이 약 3.5초 = **약 58초**  
> P13 포함 시: **약 70초**  
> 속도 키(`]`)로 1.5× 가속 시: **약 39초** / 0.7× 감속 시: **약 83초**

### 4.3 1분 달성 전략

| 전략 | 적용 |
|------|------|
| **P1 빠른 모드** | 차주명, 금액, 만기일 3개만 타이핑 애니메이션, 나머지 10개는 즉시 표시 |
| **P2 일괄 등록** | 파일 선택 팝업 생략, 전체 체크→등록→BPR을 연속 애니메이션 |
| **P3~P6 압축** | 문서 인식/단계 진행 간 딜레이를 200ms→150ms로 조정 |
| **P7/P10 최소화** | 미니카드 즉시 표시, 2초 노출 후 전환 |
| **P8 핵심 집중** | OCR 뷰 바로 진입, 자본금 자동 선택→수정→적용 원스톱 |
| **P11 순차 클릭** | 4단계 0.5초 간격, WINI 전송 즉시 |
| **전환 효과** | 페이드 시간 130ms→100ms |

---

## 5. 데이터 파일 형식 확정

### 5.1 JSON + ES module 래핑 패턴

빌드 도구 없이 브라우저에서 직접 `import` 가능하도록, JSON 데이터를 JS 래퍼로 감싼다:

```
data/
├── scenario.json              ← 순수 JSON (에디터/외부 도구 호환)
├── scenario.js                ← import 래퍼
├── documents.json
├── documents.js
├── ocr-results.json
├── ocr-results.js
├── verification.json
├── verification.js
├── notifications.json
├── notifications.js
└── qa-script.json             ← P13 대화 시나리오
    qa-script.js
```

### 5.2 래퍼 패턴

**scenario.json** (순수 데이터)
```json
{
  "borrowerName": "(주)000바이오",
  "applicationNo": "CC411-2026-000123",
  "applyDate": "2026-03-05",
  "loanProduct": "기업부동산담보대출",
  "loanAmount": "3,000,000,000",
  "maturityDate": "2027-12-31",
  "fundPurpose": "공장부지 매입",
  "ltv": "62.5",
  "repaymentType": "원리금균등",
  "handlingType": "신규",
  "collateralType": "부동산담보",
  "collateralAddress": "서울 중구 세종대로 00",
  "landArea": "1320",
  "buildingArea": "2640",
  "estimatedValue": "4,800,000,000",
  "applyChannel": "영업점",
  "branchCode": "411",
  "branchName": "강남기업금융센터",
  "managerName": "김담당",
  "managerId": "E1042"
}
```

**scenario.js** (import 래퍼)
```js
const res = await fetch('../data/scenario.json');
export const scenario = await res.json();
```

> `top-level await`는 `<script type="module">`에서 지원됨 (Chrome 89+, Edge 89+).  
> 시연 환경이 최신 Chrome이므로 문제 없음.

### 5.3 데이터 사전 → JSON 매핑

| 데이터 사전 카테고리 | JSON 파일 | 내용 |
|-------------------|----------|------|
| A (시나리오) + B (마스터) | `scenario.json` | 차주정보 16필드(담보정보 포함) + 영업점 4건 + 담당자 4건 |
| C (서류) + D (처리 룰) | `documents.json` | 서류 9건(기본5+담보3+조건부1) + targetRules + issuerMap |
| G (OCR 추출) | `ocr-results.json` | 9문서 × essentials/extracts 전체 (담보서류 포함) |
| H (대사/검증) + E (전처리) + F (진위) | `verification.json` | 상태 매트릭스 + 타이밍 설정 |
| J (알림) | `notifications.json` | 알림 2건 + 템플릿 |
| L (QA) | `qa-script.json` | 대화 3턴 스크립트 |

---

## 6. P0/P13 화면 테마 확정

### 6.1 P0: 프로세스 전체 맵

| 속성 | 확정값 | 근거 |
|------|--------|------|
| **테마 기반** | 단말(Terminal) 테마 확장 | 은행 업무 시스템 톤에서 시작 |
| **배경색** | `#F5F8FB` (단말 동일) | 일관성 |
| **헤더** | 80px 통합 헤더 + 로고(h1_01.png) + `#FFFFFF` + 좌측 Woori Blue 라인 3px | 단말 동일, 프로젝터용 업스케일 |
| **헤더 우측 뱃지** | `프로세스 개요` (Woori Deep Blue 배경, 흰 텍스트) | 특수 뱃지 |
| **콘텐츠** | 중앙 정렬 프로세스 맵 카드 | 단일 대형 카드 |
| **특수 요소** | 4단계 플로우 다이어그램 (수평), 각 단계 아이콘+텍스트 | 순차 하이라이트 |

**P0 전용 CSS**
```css
.process-map {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-8);
  padding: var(--space-8) var(--space-6);
}

.process-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background: var(--card);
  border: 2px solid var(--gray-300);
  width: 280px;
  transition: all 0.4s ease;
}

.process-stage.active {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.process-stage .stage-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.process-connector {
  width: 48px;
  height: 3px;
  background: var(--gray-300);
  position: relative;
}

.process-connector.active {
  background: var(--color-primary);
}
```

**P0 데이터** (scenario.json에 추가)
```json
{
  "processMap": {
    "stages": [
      {
        "id": "intake",
        "label": "서류 접수",
        "icon": "📋",
        "pages": ["P1", "P2"],
        "actor": "단말 (담당자)"
      },
      {
        "id": "analysis",
        "label": "AI 분석",
        "icon": "🤖",
        "pages": ["P3", "P4", "P5", "P6"],
        "actor": "Agent (AI)"
      },
      {
        "id": "review",
        "label": "검토/수정",
        "icon": "👤",
        "pages": ["P7", "P8", "P9", "P10", "P11"],
        "actor": "브릿지 (HITL)"
      },
      {
        "id": "submit",
        "label": "심사 전달",
        "icon": "✅",
        "pages": ["P12"],
        "actor": "단말 (심사요청)"
      }
    ],
    "keyMessage": [
      "AI Agent가 서류 분류·OCR·검증을 자율 수행",
      "사람이 최종 확인하며 책임 소재 확보 (HITL)",
      "오류 시 실시간 알림으로 즉시 대응"
    ]
  }
}
```

### 6.2 P13: AI 브릿지 — QA 어시스턴트

| 속성 | 확정값 | 근거 |
|------|--------|------|
| **테마** | `theme-bridge` (브릿지 테마 그대로 사용) | **역할 분리 원칙 R-4**: QA도 브릿지 내 기능 |
| **배경색** | `#F5F9FF` (브릿지 동일) | 일관성 |
| **헤더** | 80px 통합 헤더 + 로고(h1_01.png) + `#FFFFFF` + 상단 Woori Deep Blue 바 4px | 브릿지 동일, 프로젝터용 업스케일 |
| **헤더 좌측** | `AI 브릿지` 뱃지(Woori Deep Blue) + `QA` 서브뱃지(보라) + 타이틀 "AI 브릿지 — QA 어시스턴트" | 브릿지 소속 명시 |
| **레이아웃** | `bridge-left`(280px 문맥 패널) + `bridge-right`(대화 영역) | 브릿지 공통 레이아웃 사용 |

**P13 전용 CSS**
```css
.qa-layout {
  display: flex;
  height: 100%;
  gap: var(--space-4);
}

.qa-context-panel {
  width: 280px;
  flex-shrink: 0;
  background: var(--card);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  overflow-y: auto;
  border: 1px solid var(--gray-300);
}

.qa-chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--gray-300);
}

.qa-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-5);
}

.chat-bubble {
  max-width: 75%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-3);
  line-height: 1.6;
}

.chat-bubble.agent {
  background: var(--color-primary-bg);
  border: 1px solid rgba(0, 103, 172, 0.15);
  align-self: flex-start;
}

.chat-bubble.user {
  background: var(--gray-100);
  border: 1px solid var(--gray-300);
  align-self: flex-end;
  margin-left: auto;
}

.qa-input-bar {
  padding: var(--space-3) var(--space-5);
  border-top: 1px solid var(--gray-300);
  display: flex;
  gap: var(--space-3);
}
```

**P13 QA 스크립트 (qa-script.json)**
```json
{
  "turns": [
    {
      "role": "agent",
      "delay": 1000,
      "typeSpeed": 15,
      "content": "(주)000바이오 건(기업부동산담보대출, 30억원)의 처리가 완료되었습니다.\n\n📋 처리 요약:\n · 제출서류 9건(기본5+담보3+조건부1) 전체 처리 완료\n · 담보정보: 서울 중구 세종대로 00, 추정가액 48억원, LTV 62.5%\n · 담보정보 교차검증 정상 (부동산등기부등본 ↔ 건축물대장 ↔ 사정의견서)\n · 전결 판단: 본부 전결 (금액 기준 초과 + 부동산 담보 LTV 검토)\n\n⚠️ 유의사항:\n · 선순위 채권 유무 확인 필요 (부동산등기부등본 을구)\n · 전결 상향 근거 문서화 필수",
      "references": [
        { "docId": "C-06", "evidenceId": "E-COL-001", "label": "부동산등기부등본 갑구/을구" },
        { "docId": "C-08", "evidenceId": "E-COL-003", "label": "사정의견서 추정가액" }
      ]
    },
    {
      "role": "user",
      "delay": 2000,
      "typeSpeed": 25,
      "content": "이 건의 담보 관련 심사 시 특별히 유의할 점이 있나요?"
    },
    {
      "role": "agent",
      "delay": 1500,
      "typeSpeed": 15,
      "content": "네, 3가지 유의사항이 있습니다:\n\n1. 담보가액 및 LTV 검토\n   · 추정가액 48억원, 대출금 30억원 → LTV 62.5%\n   · 토지 1,320㎡ + 건물 2,640㎡ (서울 중구 세종대로 00)\n   · 선순위 채권 유무 확인 필요 (을구 검토)\n\n2. 본부 전결 대상\n   · 신청금액 30억 (금액 기준 초과) + 부동산 담보 LTV 검토\n   · 상향 근거: 내규 제42조 3항\n\n3. 담보정보 교차검증\n   · 부동산등기부등본 ↔ 건축물대장 ↔ 사정의견서 소재지·면적 일치 확인\n   · 현재: 정상 (3건 교차 일치)",
      "references": [
        { "docId": "C-06", "evidenceId": "E-COL-001", "label": "부동산등기부등본" },
        { "docId": "C-07", "evidenceId": "E-COL-002", "label": "건축물대장" },
        { "docId": "C-08", "evidenceId": "E-COL-003", "label": "사정의견서" }
      ],
      "actionPlan": [
        { "text": "선순위 채권 확인 → 부동산등기부등본 을구 검토", "checked": true },
        { "text": "본부 전결 근거 문서화 → 내규 제42조 3항 인용", "checked": true },
        { "text": "담보 소재지·면적 교차검증 → 3건 서류 일치 확인", "checked": true },
        { "text": "담당자 최종 확인 → WINI 전송 전 LTV·추정가액 체크", "checked": false }
      ]
    }
  ]
}
```

### 6.3 뱃지 컬러 체계 (전체 확정)

| 화면 유형 | 뱃지 텍스트 | 뱃지 스타일 |
|----------|-----------|-----------|
| 단말 | `영업점 단말` | Woori Deep Blue 테두리, 흰 배경, Blue 텍스트 |
| Agent | `백그라운드 실행` | Woori Deep Blue 테두리, 흰 배경, Blue 텍스트 |
| 브릿지 | `AI 브릿지` | Woori Deep Blue 배경, 흰 텍스트 |
| 브릿지 미니 | `오류` / `완료` | 빨강 배경 / Blue 배경, 흰 텍스트 |
| P0 (특수) | `프로세스 개요` | Woori Deep Blue 배경, 흰 텍스트 |
| P13 (브릿지) | `AI 브릿지` + `QA` 서브뱃지 | Woori Deep Blue 배경 + 보라 서브뱃지 |

---

## 7. P0 기능 정의 보완

기능명세서(B)에 P0 관련 기능을 추가:

| 기능 ID | 기능명 | 유형 | 설명 |
|---------|--------|------|------|
| **FN-001** | 프로세스 맵 표시 | `[신규]` | 4단계 프로세스 다이어그램 렌더링 |
| **FN-002** | 단계 순차 하이라이트 | `[신규]` | 4단계를 0.8초 간격으로 순차 활성화 |
| **FN-003** | 핵심 메시지 표시 | `[신규]` | 하단 3줄 핵심 메시지 페이드인 |
| **FN-004** | 자동 전환 | `[신규]` | 4초 후 P1으로 자동 이동 |

---

## 8. 시연 시퀀스 통합 정의 (재설계 기준)

기존 기획문서(현행 기준)의 시퀀스를 재설계 변경사항으로 업데이트한 **최종 시퀀스**.

### 8.1 P0 시퀀스 (4초)

```
0.0s  페이지 로드 → 프로세스 맵 4개 카드 페이드인
0.5s  "서류 접수" 카드 활성화 (하이라이트+상승)
1.3s  "AI 분석" 카드 활성화
2.1s  "검토/수정" 카드 활성화
2.9s  "심사 전달" 카드 활성화
3.2s  하단 핵심 메시지 3줄 페이드인
4.0s  → P1 자동 전환
```

### 8.2 P1 시퀀스 (6초) — 변경: 빠른 모드

```
0.0s  빈 폼 그리드 표시 (13필드 라벨만)
0.3s  모든 select/readonly 필드 즉시 표시 (11개: 영업점, 담당자, 대출상품(기업부동산담보대출), 상환방식, 취급구분, 담보유형, LTV구분, 신청채널, 신청번호, 신청일자, 만기일)
0.5s  차주명 "(주)000바이오" 타이핑 (1.2초)
1.7s  신청금액 "3,000,000,000" 타이핑 (1초)
2.7s  자금용도 "공장부지 매입" 타이핑 (0.5초)
3.2s  담보소재지 "서울 중구 세종대로 00" 즉시 표시 + 면적/추정가액/LTV 자동 입력
3.5s  모든 필드 표시 완료 → "첨부문서 등록" 버튼 활성화
4.5s  버튼 자동 클릭 (펄스 효과)
5.0s  → P2 전환 개시
```

### 8.3 P2 시퀀스 (4초) — 변경: 일괄 모드

```
0.0s  서류 9건 테이블 표시 (기본5+담보3+조건부1, 전체 미등록, 주주명부 경고 아이콘)
0.5s  전체 체크 자동 선택
1.0s  8건 일괄 "등록완료" 뱃지 전환 (0.1초 간격, 담보서류 3건 포함)
1.8s  "서류입력 및 검수(AI)" 버튼 자동 클릭
2.0s  누락 서류 확인 모달 표시 "미등록 서류 1건(주주명부). 계속 진행하시겠습니까?"
2.8s  "계속 진행" 자동 클릭
3.2s  BPR 전송 로딩 (0.5초)
3.7s  → P3 전환 개시
```

### 8.4 P3~P6 시퀀스 — 기존 유지, 속도 압축

기획문서의 시퀀스 구조 유지, 각 단계 간 딜레이를 200→150ms로 압축하여 시간 예산 내 달성.

### 8.5 P8 시퀀스 (5초) — 변경: AI 제언 추가

```
0.0s  법인등기부등본 자동 선택 → OCR 뷰 표시
0.5s  자본금 필드 자동 선택 (노란 하이라이트)
1.0s  AI 수정 제언 배너 슬라이드다운 "추천: 1,600,000,000원 (신뢰도 96%)"
1.8s  [적용] 버튼 자동 클릭 → 값 변경 반영
2.3s  변경사유 "OCR 오인식(스캔 품질)" 자동 입력
3.0s  "변경적용" 확인
3.5s  "작업 재개" 버튼 자동 클릭
4.2s  → P9 전환 개시
```

### 8.6 P9 시퀀스 (6초) — 변경: 전결 판단 추가

```
0.0s  3문서 × 8단계 검증 시작 (담보정보 교차검증 포함)
0.0~4.0s  기존 검증 파이프라인 (압축) + 담보정보교차검증 (추정가액 48억, LTV 62.5%)
4.2s  전결 판단 인디케이터 등장: "전결 레벨: 본부 전결"
4.5s  판단 근거: "신청금액 30억(금액 기준 초과) + 부동산 담보 LTV 62.5% 검토 → 본부 심사 필요"
5.0s  메시지 전송 Tool 완료
5.5s  → P10 전환 개시
```

### 8.7 P11 시퀀스 (4초) — 변경: 반송 버튼 표시

```
0.0s  플로우바 "실행 계획" 단계 표시 (자동)
0.7s  "문서 전처리" 단계로 자동 전환
1.4s  "진위검증" 단계
2.1s  "AI-OCR" 단계 (수정값 diff 표시: 자본금 취소선→수정값)
2.8s  "대사/검증" 단계 (검증 결과 테이블)
3.2s  하단: [반송] [WINI 전송] 버튼 표시
3.5s  "WINI 전송" 자동 클릭
3.8s  → P12 전환 개시
```

### 8.8 P12 시퀀스 (4초) — 변경: 브릿지 수신 + 전결 + 심사 메모

```
0.0s  28필드 그리드 (투명 상태, 담보정보 포함) + "WINI 수신완료" 뱃지 표시
0.3s  "브릿지로부터 WINI 데이터 수신 중..." 상태 텍스트 표시
0.5s  전체 필드 페이드인 (담보 정보, 재무 정보(브릿지 수신), 전결/심사(브릿지 수신) 포함)
1.5s  상태 텍스트 → "브릿지 수신 완료 — 28개 필드 자동 적용됨 (담보정보 포함)" (녹색)
2.0s  "심사요청" 버튼 자동 클릭
2.5s  완료 모달 표시
3.5s  모달 닫기
4.0s  → P13 전환 (P13 포함 시) 또는 시연 종료
```

### 8.9 P13 시퀀스 (+12초, 선택)

```
0.0s   좌측 문맥 패널 표시 (차주 요약, 참조 문서, Action Plan 빈 상태)
1.0s   Agent 1턴 메시지 타이핑 시작 (처리 요약 + 유의사항)
5.0s   1턴 완료 → 참조 문서 링크 표시 (부동산등기부등본, 사정의견서)
6.0s   사용자 2턴 메시지 타이핑 ("담보 관련 심사 시 유의할 점?")
7.5s   Agent 3턴 메시지 타이핑 (3가지 유의사항: LTV·담보가액, 본부 전결, 담보정보 교차검증)
11.0s  3턴 완료 → Action Plan 카드 4건 표시 (선순위채권 확인, 본부 전결 근거, 소재지·면적 교차검증, 최종 LTV 체크)
12.0s  시연 종료
```

---

## 9. 기존 문서 정오표

본 보완서에 의해 기존 문서에서 변경되는 사항:

### 9.1 화면설계 방향서

| 섹션 | 변경 내용 |
|------|----------|
| 2.1 화면 크기 | "권장" 제거 → **1920×1080 확정**, 1280 대체 옵션 삭제 |
| 2.2 레이아웃 그리드 | 1280 기준 열 삭제, 1920 단일 기준 |
| (신규) | P0/P13 테마 규칙 → **본 문서 6절** 참조 |
| 12절 시연 안정성 | 키 매핑 → **본 문서 3절** 참조 |

### 9.2 IA 및 컴포넌트 설계서

| 섹션 | 변경 내용 |
|------|----------|
| 1.3 시연 시간 예산 | 전체 타이밍 → **본 문서 4절** 기준으로 교체 |
| 2.1~2.2 P2 변경 | 서류 6건→9건 반영, 담보서류 3건 추가 |
| 4.2 Agent 컴포넌트 | 스캔 라인 제거, 도트 그리드+글래스 카드+프로세스 로그 유지 |
| 4.2 단말 컴포넌트 | g1.html 스타일 기반으로 재구성 (AppBar/TabBar/StatusStrip/Workspace/Footer) |
| 4.1 AppShell | 캔버스 크기 `1920×1080 or 1280×720` → **`1920×1080`**, 헤더 높이 → **80px** |
| 6.1 파일 구조 data/ | `.js` 확장자 → **`.json` + `.js` 래퍼** 이중 구조 |

### 9.3 데이터 사전

| 섹션 | 변경 내용 |
|------|----------|
| 3.3 중앙화 구조 | `scenario.json` 등 → **JSON + JS 래퍼 이중 구조** (본 문서 5절) |
| (신규) A-26 | `processMap` 데이터 추가 (본 문서 6.1절) |
| A-14~A-16 | 담보정보 필드(소재지, 면적, 추정가액, LTV) 추가 |
| C-06~C-09 | 담보서류 3건(부동산등기부등본, 건축물대장, 사정의견서) + 조건부 1건(주주명부) |

### 9.4 요구사항 정의서

| 항목 | 변경 |
|------|------|
| RQ-B10 (1920 캔버스) | Could → **Must** |
| RQ-A11 (TIME_SCALE 통합) | Should → **Must** (전역 단일 속도 계수) |
| (신규) RQ-D00 | P0 프로세스 맵 구현, **Should** |

### 9.5 기획문서 / 설계문서 (구현 기준)

| 변경 | 설명 |
|------|------|
| **참조 용도 변경** | "현행 구현 분석" 문서로만 참조. 재구현 시 본 문서 + IA + 화면설계 방향서가 기준 |
| 시연 시간 | 기획문서 5.3절의 화면별 소요 시간 → **본 문서 4절**로 대체 |
| 캔버스 크기 | 설계문서 1.3절의 `1280×720` → **1920×1080** |
| 헤더 높이 | 56px → **80px** (통합 헤더 + 로고) |
| 시연 시나리오 | 기업운전일반자금대출 → **기업부동산담보대출** (30억원, LTV 62.5%) |
| 서류 수 | 6건 → **9건** (담보서류 3건 추가) |

---

## 10. 참조 문서 우선순위

재구현 시 문서 참조 순서:

| 우선순위 | 문서 | 역할 |
|---------|------|------|
| **1** | **본 문서 (재설계 확정 보완서)** | 최종 결정, 충돌 시 우선 |
| 2 | IA 및 컴포넌트 설계서 (E) | 화면 구성, 컴포넌트, 상태, 파일 구조 |
| 3 | 화면설계 방향서 | 디자인 토큰, 테마, 타이포, 안정성 |
| 4 | 재구현 요구사항 정의서 (D) | Must/Should/Could 기준, AC |
| 5 | RFP 미반영 요건 보강 기획서 (F) | RFP 보강 시나리오 (Phase 4) |
| 6 | 기능명세서 (B) | 기능 상세 정의 |
| 7 | 데이터 사전 (C) | 데이터 스키마, 필드 정의 |
| 8 | 기획문서 (구현 기준) | 현행 분석 참고용 |
| 9 | 설계문서 (구현 기준) | 현행 분석 참고용 |
