# 기업여신 AI Agent 시연 — 설계문서 (구현 기준)

> 본 문서는 `new/html/p1.html`~`p12.html` 및 `js/common.js`의 **실제 구현 코드**를 정밀 분석하여 작성한 기술 설계 문서이다.  
> 화면 구조, 컴포넌트, 데이터 모델, 상태 관리, 인터랙션 로직을 구현 코드 기준으로 기술하며, 재구현 시 설계 방향을 함께 제시한다.

---

## 1. 공통 아키텍처

### 1.1 애플리케이션 구조

- **MPA (Multi-Page Application)**: 12개 독립 HTML 파일, 페이지 전환은 `location.href` 기반 풀 네비게이션
- **공유 모듈**: `js/common.js` 1개만 존재 (페이지 전환 + 자동 재생)
- **스타일**: 각 HTML 내 `<style>` 태그에 인라인 정의, 공통 CSS 파일 없음
- **데이터**: 각 페이지 인라인 `<script>`에 하드코딩, 페이지 간 공유 없음
- **상태**: 페이지별 독립, 전역 상태 저장소 없음

### 1.2 common.js 상세 설계

```
window.IS_AUTO_PAGING = true

WBPageTransition
├── FADE_MS: 130 (밀리초)
├── fadeIn(): 페이지 로드 시 .app-shell opacity 0→1 애니메이션
├── fadeOutAndNavigate(url, delayMs): delay 후 opacity 1→0 → location.href 변경
└── injectFadeStyle(): wb-fade-init/ready/out CSS 클래스 주입

WBAutoPaging
├── sequence: ["p1.html" ... "p12.html"]
├── getCurrentPageName(): pathname에서 현재 파일명 추출
├── getNextPageName(): sequence 배열에서 다음 파일명 반환
├── moveToNext(delayMs): 다음 페이지로 fade-out 전환
└── moveToNextIfEnabled(delayMs): IS_AUTO_PAGING=true일 때만 전환
```

**CSS 클래스 생명주기**:
1. `wb-fade-init` → opacity:0, translateY(4px) 적용
2. `requestAnimationFrame` 2중 호출 후 `wb-fade-ready` → transition 130ms 동안 opacity:1 복원
3. 페이지 이탈 시 `wb-fade-out` → opacity:0 → `location.href` 변경

### 1.3 공통 캔버스 사양

| 속성 | 값 |
|------|-----|
| 캔버스 크기 | 1280 × 720 px (고정) |
| 캔버스 래퍼 | `.app-shell` |
| 헤더 높이 | 80px (통합 헤더, 로고 `h1_01.png` 포함) |
| 콘텐츠 영역 | 640px (720 - 80) |
| 폰트 | "Wooridaum", "Pretendard", "Malgun Gothic", sans-serif |
| 기본 색상 | `--primary: #0067b1`, `--bg`, `--card`, `--line`, `--text` 등 CSS 변수 |

### 1.4 화면 유형별 시각 규칙

#### 단말(Terminal) 화면 — P1, P2, P12

> g1.html 인스파이어드: appbar / tabbar / status-strip / workspace / footer 5단 구성

| 속성 | 값 |
|------|-----|
| 배경 | `--bg: #eef3f8` |
| 헤더 | 80px 통합 헤더 — 로고(`h1_01.png`) + 타이틀 + `영업점 단말` 뱃지 |
| appbar | 상단 네비게이션 바 (여신관리·고객정보·서류관리 등) |
| tabbar | 활성 탭 표시 (현재 업무 컨텍스트) |
| status-strip | 상태 표시줄 (영업점·담당자·접속 상태) |
| workspace | 메인 콘텐츠 영역 — `.panel` 카드 (흰색 배경, 둥근 모서리 10px) |
| footer | 하단 정보 바 (시스템 버전, 현재 시각) |

#### Agent 화면 — P3, P4, P5, P6, P9

> 도트 그리드 + 글래스 카드 + 프로세스 로그 유지. 스캔 라인 제거.

| 속성 | 값 |
|------|-----|
| 배경 | `--bg: #0C1A2E` (다크 네이비) + 도트 그리드 패턴 |
| 헤더 | 80px 통합 헤더 — 로고(`h1_01.png`) + 타이틀 + `Agent` pill 뱃지 |
| 헤더 우측 뱃지 | `백그라운드 실행`, 글로우 효과 |
| 콘텐츠 상단 | 프로세스 플로우 바 (62px 높이, 5단계) |
| 콘텐츠 하단 | 좌/우 글래스 카드 분할 패널 (`rgba(255,255,255,0.06)`, `backdrop-filter: blur(12px)`) |

#### 브릿지(Bridge) 화면 — P8, P11

| 속성 | 값 |
|------|-----|
| 배경 | `--bg: #F5F9FF` (연한 blue) |
| 헤더 | 80px 통합 헤더 — 로고(`h1_01.png`) + 타이틀 + `AI 브릿지` 뱃지 |
| 콘텐츠 상단 | 5단계 플로우 바 (62px, 클릭으로 전환 가능) |
| 콘텐츠 하단 | 좌측 문서 목록 360px + 우측 멀티뷰 패널 |

#### 브릿지 미니(Bridge Mini) — P7, P10

| 속성 | 값 |
|------|-----|
| 배경 | 일반 단말 화면(고객정보, 계좌개설 등) |
| 오버레이 | `.alert-layer` — 반투명 블러 배경, z-index:9 |
| 알림 카드 | `.mini` — 우하단 370px, 슬라이드업 0.8s, z-index:10, 둥근 모서리 12px |
| 헤더 깜빡임 | P7: `#fff → #fff1f1` (빨간 톤), P10: `#fff → #e8f2fb` (파란 톤) |

---

## 2. 화면별 상세 설계

### 2.1 P1: 신청정보 입력

#### 레이아웃

```
┌─ header (80px): 로고(h1_01.png) "신청정보 입력" | "영업점 단말" ─┐
│ ┌─ panel ────────────────────────────────────┐ │
│ │ ┌─ form (2-column grid) ──────────────────┐│ │
│ │ │ 차주명    │ 신청번호                      ││ │
│ │ │ 영업점[조회]│ 담당자[조회]                  ││ │
│ │ │ 신청일자  │ 대출상품                      ││ │
│ │ │ 신청금액  │ 만기일                        ││ │
│ │ │ 상환방식▼ │ 취급구분▼                     ││ │
│ │ │ 자금용도 (full-width)                    ││ │
│ │ │ 담보유형▼ │ 신청채널▼                     ││ │
│ │ └──────────────────────────────────────────┘│ │
│ │                         [첨부문서 등록] btn  │ │
│ └────────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

#### 컴포넌트

| 컴포넌트 | 유형 | 설명 |
|---------|------|------|
| 텍스트 입력 필드 | `<input>` 7개 | 차주명, 신청번호, 영업점코드, 담당자, 신청일자, 대출상품, 신청금액, 만기일, 자금용도 |
| 셀렉트 필드 | `<select>` 4개 | 상환방식, 취급구분, 담보유형, 신청채널 |
| 조회 버튼 | `.icon-btn` 2개 | 영업점 코드 조회, 담당자 조회 |
| 조회 모달 | `.overlay > .modal` | 검색 입력 + 리스트 (branch: 2열, manager: 3열) |
| 셀렉트 데모 메뉴 | `.select-demo-menu` | 네이티브 select 대신 보여주는 커스텀 드롭다운 |

#### 데모 시퀀스 로직

```
runDemoSequence():
  initEmptyState() → 모든 필드 초기화
  typeValue("borrowerName", "(주)000바이오", 44ms)
  typeValue("applicationNo", "CC411-2026-000123", 30ms)
  chooseLookup("branch") → 모달 열기 → 첫 항목 클릭 → 411
  chooseLookup("manager") → 모달 열기 → 첫 항목 클릭 → 김담당
  typeValue("applyDate", "2026-03-05")
  typeValue("loanProduct", "기업부동산담보대출")
  typeValue("loanAmount", "3,000,000,000")
  typeValue("maturityDate", "2027-12-31")
  typeValue("fundPurpose", "공장부지 매입")
  chooseSelect("repaymentType", 1) → 원리금균등
  chooseSelect("handlingType", 1) → 신규
  chooseSelect("collateralType", 1) → 부동산담보
  chooseSelect("applyChannel", 1) → 영업점
  clickPulse(nextBtn)
  → moveToNextIfEnabled(700)
```

**시간 스케일**: `DEMO_TIME_SCALE = 1.6` (모든 sleep에 1.6배 적용)

#### 데모 효과

- `clickPulse(target)`: 클릭 시 파란 box-shadow 펄스(220ms) + 원형 ripple 애니메이션(450ms)
- `typeValue(input, value, speed)`: 한 글자씩 입력, focus → blur 포함
- `showSelectMenu(selectEl)`: 네이티브 select 위치에 커스텀 메뉴 표시 → 항목 active 표시 → 닫기

#### 정적 데이터

```javascript
branchData: [
  { code:"411", name:"강남기업금융센터" },
  { code:"238", name:"서초금융센터" },
  { code:"105", name:"종로금융센터" },
  { code:"522", name:"여의도금융센터" }
]

managerData: [
  { id:"E1042", name:"김담당", branch:"강남기업금융센터" },
  { id:"E0915", name:"이심사", branch:"서초금융센터" },
  { id:"E1130", name:"박영업", branch:"여의도금융센터" },
  { id:"E0873", name:"최담당", branch:"종로금융센터" }
]
```

---

### 2.2 P2: 첨부문서 등록

#### 레이아웃

```
┌─ header (80px): 로고 "첨부문서 등록" | "영업점 단말" ─────────┐
│ ┌─ panel ──────────────────────────────────────┐ │
│ │ pill: 신청번호 CC411-2026-000123             │ │
│ │ pill: 차주명 (주)000바이오                    │ │
│ │ [문서 파일 추가][선택 항목 삭제] 허용확장자  등록현황 │
│ │ ┌─ table ──────────────────────────────────┐ │ │
│ │ │ ☐ │문서구분│문서명│파일명│등록일시│검증상태│ │ │
│ │ │ ... 6행 ...                              │ │ │
│ │ └──────────────────────────────────────────┘ │ │
│ │                [BPR전송] [서류입력 및 검수(AI)]  │ │
│ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

#### 컴포넌트

| 컴포넌트 | 설명 |
|---------|------|
| 서류 목록 테이블 | 9행(기본 5건 + 담보 3건 + 조건부 1건), 체크박스·문서구분·문서명·파일명·일시·상태 |
| 파일 선택 모달 | 5건 목록, 전체 선택 체크박스, 확인/취소 |
| BPR 로딩 모달 | 스피너 + "BPR전송 처리중..." |
| BPR 완료 모달 | "BPR전송이 완료되었습니다." + 확인 |

#### 데모 시퀀스

```
resetDemoState() → 8건 미등록 상태로 초기화 (주주명부 제외)
openPicker → checkAll → confirmPicker → 8건 등록완료
BPR전송 클릭 → 로딩 900ms → 완료 팝업
reviewInputBtn 클릭 → moveToNextIfEnabled(700)
```

#### 상태 관리

- `setRowUploaded(docId, fileName)`: 테이블 행의 파일명/일시/상태 갱신
- `clearRowUploaded(row)`: 행을 미등록 상태로 복원
- `updateStatus()`: 등록 완료 건수 카운트 → "등록현황 N / 9" 텍스트 갱신

---

### 2.3 P3: 실행 계획 수립

#### 레이아웃

```
┌─ header (80px): 로고 "실행 계획 수립" Agent | "백그라운드 실행" ──┐
│ ┌─ flow bar ────────────────────────────────────┐ │
│ │ [실행계획수립●] → [문서전처리] → [진위검증]    │ │
│ │ → [AI-OCR및필드추출] → [대사/검증]            │ │
│ └────────────────────────────────────────────────┘ │
│ ┌─ left (360px) ────┐ ┌─ right ────────────────┐ │
│ │ 문서 분석          │ │ 실행 계획 수립          │ │
│ │ · 사업자등록증 진행중│ │ ┌──────┬──────┐       │ │
│ │ · 법인등기부  진행중│ │ │전처리 │OCR   │       │ │
│ │ · 표준재무    진행중│ │ │대상   │대상  │       │ │
│ │ · 부가세      진행중│ │ ├──────┼──────┤       │ │
│ │ · 법인인감    진행중│ │ │진위   │대사  │       │ │
│ │                    │ │ │대상   │대상  │       │ │
│ │                    │ │ └──────┴──────┘       │ │
│ │                    │ │ 실행 순서 및 상태       │ │
│ │                    │ │ 1) 문서분류 대기        │ │
│ │                    │ │ 2) 큐생성   대기        │ │
│ │                    │ │ 3) TaskGraph 대기       │ │
│ │                    │ │ 4) Worker   대기        │ │
│ └────────────────────┘ └────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

#### 애니메이션 시퀀스

1. `sleep(1000)` → 문서 8건 순차 `구조 인식 완료` (뱃지 `run` → `ok`)
2. `sleep(700)` → 4개 대상 카드에 문서명 채움 (`분류 대기` → 문서 리스트)
3. 실행 순서 4단계 순차: `대기 → 진행중 → 완료` (각 900ms)
4. 플로우 바 펄스 애니메이션 해제

---

### 2.4 P4: 문서 전처리

P3와 동일한 레이아웃 구조. 차이점:

| 항목 | P3 | P4 |
|------|----|----|
| 플로우 바 활성 단계 | 실행 계획 수립 | 문서 전처리 |
| 좌측 목록 | 8건 전체 | 5건 (전처리 대상: 기본 3건 + 담보 2건) |
| 우측 4개 카드 | 전처리/OCR/진위/대사 대상 | 기울기 보정/노이즈 제거/명암대비/페이지 정렬 |
| 타임라인 | 문서분류→큐→TaskGraph→Worker | 기울기→노이즈→명암→정렬 |

---

### 2.5 P5: 진위검증

#### 레이아웃

```
┌─ header (80px): 로고 "진위검증" Agent | "백그라운드 실행" ────────┐
│ ┌─ flow bar (진위검증 활성) ──────────────────────┐ │
│ ┌─ card ─────────────────────────────────────────┐ │
│ │ 진위검증 실행                                    │ │
│ │ ┌ RPA row: [진위확인 RPA] [로딩중 0%] [████░░]┐ │ │
│ │ └──────────────────────────────────────────────┘ │ │
│ │ ┌ table ──────────────────────────────────────┐ │ │
│ │ │문서명     │발급기관    │API호출│파싱│진위확인│ │ │
│ │ │사업자등록 │국세청      │ 대기 │대기│ 대기  │ │ │
│ │ │법인등기부 │대법원      │ 대기 │대기│ 대기  │ │ │
│ │ │법인인감   │국세청      │ 대기 │대기│ 대기  │ │ │
│ │ │부동산등기 │대법원      │ 대기 │대기│ 대기  │ │ │
│ │ │건축물대장 │국토부      │ 대기 │대기│ 대기  │ │ │
│ │ └──────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

#### RPA 프로그레스 알고리즘

```javascript
getStagedProgress(t):
  비선형 보간 (0,0)→(0.18,14)→(0.33,33)→(0.50,47)
  →(0.65,68)→(0.78,76)→(0.90,89)→(0.97,95)→(1.0,100)
  각 구간 easeOutQuad 적용 + 미세 랜덤 노이즈
  총 소요: 2200ms × DEMO_SCALE
```

#### 검증 파이프라인

5건 병렬 실행, 각 문서별:
- API 호출: row0=2000ms, row1=1000ms, row2=1500ms → `완료`
- 응답전문 파싱: 550ms → `완료`
- 진위 확인: 550ms → `완료`

---

### 2.6 P6: AI-OCR 및 필드 추출

#### 레이아웃

P5와 유사한 단일 테이블 구조 + 하단 Tool 영역 추가

#### 추출 테이블

| 문서명 | 핵심 추출 필드 | 텍스트 인식 | 필드 매핑 | 신뢰도 평가 |
|--------|-------------|-----------|---------|-----------|
| 사업자등록증명원 | 사업자번호, 대표자명 | 대기→완료 | 대기→완료 | 대기→완료 |
| 법인등기부등본 | 법인명, 본점주소, 대표자 | 대기→완료 | 대기→완료 | 대기→**검토필요** |
| 표준재무제표증명 | 매출액, 영업이익, 당기순이익 | 대기→완료 | 대기→완료 | 대기→완료 |
| 부가가치세증명원 | 과세기간, 과세표준금액 | 대기→완료 | 대기→완료 | 대기→완료 |
| 법인인감증명서 | 법인명, 증명서번호 | 대기→완료 | 대기→완료 | 대기→완료 |
| 부동산등기부등본 | 소재지, 면적, 소유자 | 대기→완료 | 대기→완료 | 대기→완료 |
| 건축물대장 | 소재지, 건물면적, 용도 | 대기→완료 | 대기→완료 | 대기→완료 |
| 사정의견서 | 추정가액, 감정일, 감정기관 | 대기→완료 | 대기→완료 | 대기→완료 |

#### 핵심 분기: row 1 (법인등기부등본)

```javascript
if(rowIdx === 1){
  setExtractState(rowIdx, "confidence", "warn"); // "검토필요"
} else {
  setExtractState(rowIdx, "confidence", "done");
}
```

#### 메시지 전송 Tool

- 플로우 바 → `activeFlowStep.classList.add("alert")` (빨간 깜빡임 3회)
- Tool 프로그레스 바 로딩 (1333ms × DEMO_SCALE)
- "확인 메세지 전송중" → "전송완료" (녹색 깜빡임)

---

### 2.7 P7: 검토 요청 알림

#### 브릿지 미니 컴포넌트

```html
<div class="mini">
  <div class="mini-h">
    <div class="mini-title">새 메시지</div>
    <div class="mini-badge" style="background:#dc2626">오류</div>
  </div>
  <div class="mini-b">
    <div class="mini-v">법인등기부등본 신뢰도평가 검토필요 1건 발생...</div>
    <div class="mini-act">AI 브릿지 열기</div>
  </div>
</div>
```

**타이밍**: 250ms 후 `layer.show` + `mini.show` → 4200ms 후 자동 이동

#### 배경 단말 화면 구조

고객정보(홍길동, VIP, 자산 34.2억), 계좌개설 4단계, 최근 거래내역 4건, 시스템 알림, 영업지원/추천상품/상담이력 사이드바 — 모두 정적 HTML

---

### 2.8 P8: 값 수정(HITL)

#### 멀티뷰 시스템

플로우 바 단계 클릭 시 `selectedStep` 변경 → `renderRightPane()` → 5개 뷰 중 1개만 표시:

| 뷰 ID | 대응 단계 | 표시 내용 |
|--------|---------|----------|
| `planView` | 실행 계획 수립 | 문서 메타 + 4개 대상 판단 플래그 |
| `preprocessView` | 문서 전처리 | 7행 상태표 (4개 전처리 + 전체/파일/문서종류) |
| `verifyView` | 진위검증 | 발급기관 + API/파싱/진위 상태 |
| `ocrView` | AI-OCR | 좌우 분할 (원본 paper + 추출 테이블 + 에디터) |
| `placeholderView` | 대사/검증 | "해당 단계 화면은 다음으로 구성 예정입니다." |

#### 문서 목록 ↔ 뷰 연동

- 문서 목록 `doc-item` 클릭 → `selectedDoc` 변경 → `renderRightPane()` 재렌더링
- 각 뷰는 `selectedDoc`에 따라 데이터를 분기 표시

#### 문서별 상태 매트릭스 (`docStatusByStep`)

5단계 × 8문서 = 40개 조합, 상태값 `ok|warn|na|before`:

| 단계\문서 | 사업자등록 | 법인등기부 | 표준재무 | 부가세 | 법인인감 | 부동산등기 | 건축물대장 | 사정의견서 |
|----------|----------|----------|--------|--------|--------|----------|----------|----------|
| 실행계획 | ok | ok | ok | ok | ok | ok | ok | ok |
| 전처리 | ok | ok | ok | na | na | ok | ok | na |
| 진위검증 | ok | ok | na | na | ok | ok | ok | na |
| OCR | ok | **warn** | ok | ok | ok | ok | ok | ok |
| 대사/검증 | before | before | na | na | na | before | before | before |

#### OCR 뷰 상세 설계

**좌측 패널 (49%)**:
- `.doc-paper`: 문서 원본 시뮬레이션
- `.paper-table`: key-value 테이블 (essentials 배열 기반 동적 렌더링)
- `.hl-target`: 필드 하이라이트 대상 span
  - `.related`: 매핑된 필드 전체 (회색 배경)
  - `.hit`: 현재 선택된 필드 (노란 배경, 주황 outline)
  - `.has-evidence::before`: evidence ID를 pseudo-element로 표시

**우측 패널 (51%)**:
- `.extract-table`: 추출 항목 테이블 (항목명 / 입력/추출값 / 신뢰도 / 근거ID)
- `.extract-edit`: 값 수정 에디터 (항목명 표시, 값 입력, 변경사유 입력, 변경 버튼)
- 신뢰도 뱃지: `high`(96%↑ 녹색), `mid`(92~95% 파란색), `low`(91%↓ 빨간색)

#### OCR 데이터 모델 (`ocrDocMock`)

8개 문서별 구조 (기본 5건 + 담보 3건):

```javascript
{
  title: string,       // 문서 제목
  issueDate: string,   // 발급일자
  essentials: [        // 원본 핵심 데이터 [key, value][]
    ["사업자등록번호", "123-45-67890"],
    ...
  ],
  extracts: [          // 추출 결과 [field, value, confidence, evidenceId][]
    ["사업자등록번호", "123-45-67890", 0.99, "E-BIZ-001"],
    ...
  ]
}
```

법인등기부등본의 자본금 차이:
- `essentials`: `["자본금", "1,600,000,000원"]` (원본 실제값)
- `extracts`: `["자본금", "1,000,000,000원", 0.91, "E-REG-005"]` (OCR 오인식값)

#### P8 데모 시퀀스

```
sleep(700)
→ 법인등기부등본.pdf 문서 선택 (clickPulse + click)
→ sleep(550)
→ 자본금 행 선택 (clickPulse + click)
→ sleep(450)
→ 값 입력 필드: 기존값 삭제 (45ms/char) → "1,600,000,000원" 입력 (55ms/char)
→ sleep(160)
→ 변경사유 필드: "OCR 오인식(스캔 품질)" 입력 (50ms/char)
→ sleep(220)
→ 변경 버튼 클릭 → applyEdit()
→ sleep(1000)
→ 작업 재개 버튼 클릭
→ moveToNextIfEnabled(0)
```

#### 변경 적용 로직 (`applyEditBtn` click)

1. `selectedExtract.item[1] = nextValue` → extracts 배열 원본 수정
2. `selectedExtract.item[2] = "입력"` → 신뢰도를 문자열 "입력"으로 변경
3. DOM 직접 갱신: `valueCell.textContent = nextValue`, `.edited-value` 클래스 추가
4. `confidenceCell.textContent = "입력"`

---

### 2.9 P9: 대사/검증

#### 검증 테이블 (2문서 × 8단계 + 담보 3문서 교차검증)

| 컬럼 | stage key | 완료 시 라벨 |
|------|-----------|------------|
| 입력값 대사 | `input` | "일치" |
| 문서간 대사 | `crossdoc` | "일치" |
| 필수값 누락 검증 | `required` | "정상" |
| 타입 검증 | `type` | "정상" |
| 유효값 검증 | `valid` | "정상" |
| KYC 교차검증 | `kyc` | "정상" |
| **담보정보 교차검증** | `collateral` | **"정상"** (소재지·면적·추정가액 교차 대사, LTV 62.5% 검증) |
| 최종 판정 | `final` | "정상" + `.final-done` |

#### 검증 타이밍 (ms)

| | 사업자등록증 | 법인등기부등본 |
|-|------------|-------------|
| 입력값 대사 | 1200 | 400 |
| 문서간 대사 | 900 | 1450 |
| 필수값 누락 | 540 | 680 |
| 타입 검증 | 1250 | 960 |
| 유효값 검증 | 760 | 1320 |
| KYC 교차 | 1380 | 560 |
| 최종 판정 | 820 | 1080 |

기본 2문서 `Promise.all`로 병렬 실행 후, 담보 3문서 교차검증 순차 진행.

---

### 2.10 P10: 검토 완료 알림

P7과 동일한 구조. 차이점:

| 항목 | P7 | P10 |
|------|----|----|
| 타이틀 | 검토 완료 알림 | 검토 요청 알림 |
| 뱃지 색상 | 빨간 `#dc2626` "오류" | 파란 `#0067b1` "완료" |
| 메시지 | 검토필요 1건 발생 | AI검토 완료, 결과 확인 요청 |
| 헤더 깜빡임 | `#fff1f1` (빨간 톤) | `#e8f2fb` (파란 톤) |

---

### 2.11 P11: 결과 확인(HITL)

P8과 동일한 컴포넌트·레이아웃·데이터 모델 (약 1,340줄 중 대부분 공유).

**핵심 차이점**:

| 항목 | P8 | P11 |
|------|----|----|
| 타이틀 | 값 수정(HITL) | 결과 확인(HITL) |
| 초기 selectedStep | "AI-OCR 및 필드 추출" | "실행 계획 수립" |
| 플로우 바 OCR 단계 | `error` (빨간) | `done` (파란) |
| 법인등기부등본 OCR 상태 | `warn` (검토필요) | `ok` (정상) — P11의 docStatusByStep에서는 미변경이나, extracts에서 자본금이 이미 보정 |
| 법인등기부등본 자본금 extracts | `["자본금", "1,000,000,000원", 0.91, ...]` | `["자본금", "1,600,000,000원", "입력", ...]` |
| 하단 버튼 | "작업 재개" | "WINI 전송" |
| 변경사유 기본값 | 빈 문자열 | 자본금 선택 시 `OCR 오인식(스캔 품질)` |
| 데모 시퀀스 | 문서 선택 → 필드 수정 | 플로우 바 순차 클릭 → WINI 전송 |

**P11 데모 시퀀스**:
```
sleep(700)
→ clickStep("문서 전처리") sleep(700)
→ clickStep("진위검증") sleep(700)
→ clickStep("AI-OCR 및 필드 추출") sleep(700)
→ clickStep("대사/검증") sleep(3000)
→ 작업 재개(WINI 전송) 클릭
→ moveToNextIfEnabled(0)
```

---

### 2.12 P12: 심사정보 자동입력 및 심사 요청

#### 레이아웃

```
┌─ header (80px): 로고 "심사정보 자동입력 및 심사 요청" | "영업점 단말" ─┐
│ ┌─ panel ──────────────────────────────────────────────┐ │
│ │ ┌─ form (3-column grid) ───────────────────────────┐ │ │
│ │ │ 차주명     │ 신청번호      │ 영업점 코드          │ │ │
│ │ │ 담당자     │ 신청일자      │ 대출상품             │ │ │
│ │ │ 신청금액   │ 만기일        │ 상환방식             │ │ │
│ │ │ 취급구분   │ 자금용도      │ 담보유형             │ │ │
│ │ │ 신청채널   │ 사업자등록번호│ 법인등록번호          │ │ │
│ │ │ 대표자     │ 본점주소      │ 자본금               │ │ │
│ │ │ 담보소재지 │ 토지면적      │ 건물면적             │ │ │
│ │ │ 추정가액   │ LTV           │ 매출액               │ │ │
│ │ │ 전결레벨   │ 전결사유      │ 심사메모             │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ │                              [이전] [심사요청] btn    │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─ overlay (심사요청 모달) ────────────────────────────┐ │
│ │  [spinner] "심사요청 전송 중입니다..."               │ │
│ │  → "심사요청이 완료되었습니다."                       │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

#### 자동입력 표현

- 초기 상태: `.inputs-text-hidden` 클래스 → `color: transparent`
- `window.load` 후 500ms → 클래스 제거 → `color` transition 0.28s로 값이 fade-in 등장
- 25개 필드 모두 `readonly`, 값은 HTML에 하드코딩 (담보정보 5건 + 전결정보 2건 추가)

#### 심사요청 모달 타이밍

- 클릭 → 모달 열기 + 스피너 표시
- 1200ms → "심사요청이 완료되었습니다. 본부 전결 — 금액 기준 초과 + 부동산 담보 LTV 검토로 본부 심사 단계로 이관되었습니다."
- 2200ms → 모달 닫기

---

## 3. 데이터 모델 종합

### 3.1 현재 데이터 분포

| 데이터 카테고리 | 위치 | 건수 |
|---------------|------|------|
| 차주 기본정보 | P1 `demoFields` | 7필드 |
| 영업점 마스터 | P1 `branchData` | 4건 |
| 담당자 마스터 | P1 `managerData` | 4건 |
| 제출 서류 목록 | P2 `pickerFiles` | 8건 (+ 미등록 1건) |
| 문서별 처리 대상 룰 | P3/P8/P11 `targetRules` | 4카테고리 × 8문서 |
| 전처리 세부 룰 | P8/P11 `preprocessTaskRules` | 4작업 × 5문서 |
| 발급기관 매핑 | P5/P8/P11 `issuerByDoc` | 8문서 |
| 단계별 문서 상태 | P8/P11 `docStatusByStep` | 5단계 × 8문서 |
| OCR 원본+추출 데이터 | P8/P11 `ocrDocMock` | 8문서 × (essentials + extracts) |
| 자동입력 필드 | P12 HTML readonly input | 25필드 |

### 3.2 데이터 중복 현황

| 데이터 | 중복 위치 |
|--------|----------|
| 차주명 "(주)000바이오" | P1, P2, P8/P11 extracts, P12 |
| 신청번호 "CC411-2026-000123" | P1, P2, P10 알림, P12 |
| 문서 8건 목록 | P2, P3, P4, P5, P6, P8, P9, P11 |
| `docStatusByStep` | P8, P11 (완전 동일 복사) |
| `ocrDocMock` | P8, P11 (자본금만 다름) |
| `targetRules`, `preprocessTaskRules` | P8, P11 (동일) |

### 3.3 개선 방향: 중앙 데이터 모듈

```
data/
├── scenario.js         ← 차주정보, 신청번호, 금액 등 시나리오 데이터
├── documents.js        ← 9건 서류 목록(기본5+담보3+조건부1), 처리 대상 룰, 발급기관
├── ocr-results.js      ← 문서별 essentials/extracts
├── verification.js     ← 단계별 문서 상태 매트릭스
└── master.js           ← 영업점/담당자 마스터
```

---

## 4. 상태 관리 분석

### 4.1 현재 상태 모델

| 유형 | 구현 방식 |
|------|----------|
| 페이지 내 로컬 상태 | JS 변수 (`selectedStep`, `selectedDoc`, `selectedExtract`) |
| UI 상태 | CSS 클래스 토글 (`show`, `hidden`, `selected`, `ok`, `warn`, `run`, `done`) |
| 데모 진행 상태 | async 함수의 순차 실행 + sleep으로 시간 제어 |
| 페이지 간 상태 | **없음** — 각 페이지 독립 |

### 4.2 상태 불연속 문제

- P8에서 수정한 자본금 값(1,600,000,000원)은 P8 메모리에만 존재
- P11에서 같은 값이 보이는 이유: `ocrDocMock` 자체에 보정된 값(`"입력"`)을 미리 하드코딩
- P12에서 자본금이 반영되는 이유: `<input value="1,600,000,000원" readonly>` 하드코딩

### 4.3 개선 방향

**옵션 A: sessionStorage 기반 (MPA 유지)**
```javascript
sessionStorage.setItem('ocrResults', JSON.stringify(modifiedExtracts));
// 다음 페이지에서
const results = JSON.parse(sessionStorage.getItem('ocrResults'));
```

**옵션 B: SPA 전환**
- 12개 뷰를 단일 페이지 내 컴포넌트로 전환
- 글로벌 store (Zustand, Pinia 등)로 상태 중앙 관리
- 페이지 전환을 DOM show/hide 또는 라우터로 대체

---

## 5. 인터랙션 패턴 정리

### 5.1 데모 효과 (모든 페이지 공통)

| 효과 | 구현 | 사용 화면 |
|------|------|----------|
| `clickPulse(target)` | box-shadow 펄스(220ms) + 원형 ripple(450ms) | P1, P2, P8, P11 |
| `typeValue(input, value, speed)` | 한 글자씩 입력 + focus/blur | P1 |
| `typeWrite(input, text, speed)` | 한 글자씩 입력 (typeValue 변형) | P8 |
| `typeDelete(input, speed)` | 뒤에서 한 글자씩 삭제 | P8 |
| `showSelectMenu(selectEl)` | 커스텀 드롭다운 표시 | P1 |
| `sleep(ms)` / `wait(ms)` | Promise 기반 딜레이 | 전체 |

### 5.2 상태 뱃지 체계

| 클래스 | 색상 | 의미 | 텍스트 예시 |
|--------|------|------|-----------|
| `.run` | 파란 | 진행중 | "진행중" |
| `.ok` / `.done` | 녹색 | 완료/정상 | "완료", "정상", "일치" |
| `.warn` | 노란/빨간 | 경고/검토필요 | "검토필요" |
| `.na` | 회색 | 미대상 | "미대상" |
| `.before` | 흰색 | 실행전 | "실행전" |
| `.blink` | 펄스 | 상태 변경 강조 | (2회 깜빡임) |

### 5.3 플로우 바 상태

| 클래스 | 시각 효과 | 의미 |
|--------|----------|------|
| (기본) | 회색 테두리, 흰 배경 | 미진행 |
| `.done` | 파란 테두리, 연파란 배경 | 완료 |
| `.active.prep` | 녹색 테두리, 연녹 배경, 펄스 애니메이션 | 현재 진행중 |
| `.error` | 빨간 테두리, 연빨간 배경 | 오류 발생 |
| `.selected` | 두꺼운 테두리 (3px) | P8/P11에서 클릭 선택됨 |

---

## 6. 재사용 가능 자산 분석

### 6.1 즉시 재사용 가능

| 자산 | 설명 | 재사용처 |
|------|------|---------|
| `WBPageTransition` | fade-in/out 페이지 전환 | 모든 시연 프로젝트 |
| `WBAutoPaging` | 순서 기반 자동 재생 | 모든 시연 프로젝트 |
| 플로우 바 UI | 5단계 진행 표시 | Agent/브릿지 화면 |
| 상태 뱃지 시스템 | run/ok/warn/na/before 5종 | 모든 화면 |
| RPA 프로그레스 바 | 비선형 로딩 애니메이션 | 진위검증, 외부 연동 |
| clickPulse/typeValue | 데모 인터랙션 효과 | 모든 입력 시연 |

### 6.2 리팩터링 후 재사용 가능

| 자산 | 현재 상태 | 리팩터링 방향 |
|------|----------|-------------|
| OCR 원본-추출 대조 뷰 | P8/P11에 인라인 | `OcrCompareView` 컴포넌트로 추출 |
| 문서 목록 패널 | P8/P11에 인라인 | `DocListPanel` 컴포넌트로 추출 |
| 브릿지 미니 알림 | P7/P10에 인라인 | `BridgeMiniAlert` 컴포넌트로 추출 |
| 검증 테이블 | P5/P6/P9에 개별 구현 | `VerifyTable` 컴포넌트로 통합 |
| 조회 모달 | P1에 인라인 | `LookupModal` 컴포넌트로 추출 |

---

## 7. 구현 이슈 및 기술 부채

### 7.1 식별된 이슈

| # | 이슈 | 영향도 | 위치 |
|---|------|--------|------|
| 1 | P8/P11 코드 90%+ 중복 (각 ~1,390줄+담보 뷰 확장) | 유지보수 비용 | p8.html, p11.html |
| 2 | CSS 인라인 중복 (화면 유형별 거의 동일 스타일) | 일관성 리스크 | 전체 |
| 3 | 표준재무제표증명 essentials에 "영억이익" 오타 | 시연 시 눈에 띔 | P8/P11 ocrDocMock |
| 4 | P7/P10 배경이 여신 업무와 무관 | 맥락 불일치 | p7.html, p10.html |
| 5 | P6 법인인감증명서의 추출필드 "소득종류, 소득금액"은 법인인감증명서와 무관 | 데이터 정합성 | p6.html thead |
| 6 | DEMO_TIME_SCALE 값이 페이지마다 다름 (1.0~1.6) | 시연 속도 비일관 | p1~p9 |
| 7 | P12 auto-paging 미작동 (시퀀스 마지막) | 의도적이나 심사요청 자동화 여부 결정 필요 | p12.html |

### 7.2 개선 우선순위

| 우선도 | 작업 | 효과 |
|--------|------|------|
| P0 | 오타 수정 ("영억이익" → "영업이익") | 시연 품질 |
| P0 | P6 법인인감증명서 추출필드 정정 | 데이터 신뢰도 |
| P1 | P8/P11 공통 코드 추출 | 코드량 50% 감소 |
| P1 | CSS 공통 파일 분리 | 스타일 일관성 |
| P1 | 데이터 모듈 중앙화 | 시나리오 교체 용이 |
| P2 | P7/P10 배경 교체 | 맥락 일치 |
| P2 | DEMO_TIME_SCALE 통합 | 시연 속도 일관성 |

---

## 8. 재구현 설계 방향

### 8.1 아키텍처 옵션

| 옵션 | 장점 | 단점 | 추천도 |
|------|------|------|-------|
| MPA 유지 + 공통 모듈 분리 | 현재 구조 최소 변경 | 상태 공유 제한적 | ★★★ (단기) |
| SPA (Vanilla JS + Router) | 상태 공유, 번들 최적화 | 전환 필요 | ★★★★ (중기) |
| SPA (React/Vue) | 컴포넌트 재사용, 에코시스템 | 빌드 환경 필요, 오버엔지니어링 가능 | ★★ (대규모 확장 시) |

### 8.2 컴포넌트 설계 (SPA 기준)

```
components/
├── layout/
│   ├── AppShell.js          ← 1280×720 캔버스 + 헤더
│   ├── TerminalHeader.js    ← 단말 헤더 (타이틀 + 뱃지)
│   ├── AgentHeader.js       ← Agent 헤더 (타이틀 + meta pill + 뱃지)
│   └── BridgeHeader.js      ← 브릿지 헤더
├── flow/
│   ├── FlowBar.js           ← 5단계 프로세스 플로우 바
│   └── FlowStep.js          ← 개별 단계 (done/active/error/selected)
├── demo/
│   ├── ClickPulse.js        ← 클릭 시각 효과
│   ├── TypeWriter.js        ← 타이핑 애니메이션
│   └── ProgressBar.js       ← 비선형 프로그레스 바
├── document/
│   ├── DocListPanel.js      ← 좌측 문서 목록 (상태 뱃지 포함)
│   ├── DocPaper.js          ← 원본 문서 시뮬레이션 (paper-table)
│   └── ExtractTable.js      ← 추출 항목 테이블 + 에디터
├── verify/
│   ├── VerifyTable.js       ← 검증 파이프라인 테이블 (범용)
│   └── RpaProgress.js       ← RPA 로딩 프로그레스
├── alert/
│   ├── BridgeMiniAlert.js   ← 브릿지 미니 오버레이
│   └── ModalDialog.js       ← 범용 모달 (로딩/완료/조회)
└── form/
    ├── FormGrid.js          ← N열 폼 그리드
    ├── LookupField.js       ← 조회 버튼 + 모달 연동
    └── SelectField.js       ← 커스텀 select 데모 메뉴
```

### 8.3 상태 설계 (SPA 기준)

```javascript
store = {
  scenario: {
    borrower: { name, bizNo, corpNo, representative, address, capital, revenue },
    application: { id, date, product, amount, maturity, repayment, handling, purpose, collateral, channel },
    collateralDetail: { location, landArea, buildingArea, estimatedValue, ltv },
    approval: { level, reason },
    branch: { code, name },
    manager: { id, name }
  },
  documents: [
    {
      id, name, docType, fileName, uploadedAt, status,
      targets: { preprocess, ocr, verify, reconcile },
      issuer,
      preprocessResults: { tilt, noise, contrast, align },
      verifyResults: { api, parse, compare },
      ocrResults: { essentials: [], extracts: [], editHistory: [] },
      reconcileResults: { input, crossdoc, required, type, valid, kyc, collateral, final }
    }
  ],
  currentStep: "p1",
  ui: {
    selectedFlowStep, selectedDoc, selectedExtract,
    autoPaging: true, demoSpeed: 1.0
  }
}
```

### 8.4 시연 컨트롤러

```javascript
DemoController = {
  play(): 전체 자동 재생
  pause(): 현재 화면 일시정지
  resume(): 재개
  jumpTo(step): 특정 화면으로 이동
  setSpeed(multiplier): 시연 속도 조절 (0.5x ~ 3.0x)
  reset(): 초기 상태로 복원
}
```

### 8.5 CSS 체계화

```
styles/
├── tokens.css          ← 색상, 폰트, 간격, 모서리 반경 CSS 변수
├── layout.css          ← app-shell, header, content 공통
├── terminal.css        ← 단말 화면 테마
├── agent.css           ← Agent 화면 테마
├── bridge.css          ← 브릿지 화면 테마
├── components.css      ← 뱃지, 태그, 버튼, 테이블 등 공통 UI
└── animations.css      ← fade, blink, pulse, ripple 등
```

---

## 부록 A. 화면별 코드 규모

| 화면 | HTML+CSS 라인 | JS 라인 | 총 라인 | 비고 |
|------|-------------|---------|---------|------|
| common.js | - | 101 | 101 | 공유 모듈 |
| P1 | 308 | 363 | 671 | 입력 폼 + 조회 모달 |
| P2 | 341 | 362 | 703 | 테이블 + 파일 선택 |
| P3 | 274 | 167 | 441 | Agent 레이아웃 |
| P4 | 273 | 166 | 439 | P3 변형 |
| P5 | 274 | 189 | 463 | RPA + 검증 테이블 |
| P6 | 270 | 240 | 510 | 추출 테이블 + Tool |
| P7 | 339 | 14 | 527* | 배경 단말 화면 포함 |
| P8 | 577 | 813 | 1390 | 최대 규모 (멀티뷰) |
| P9 | 264 | 220 | 484 | 7단계 검증 |
| P10 | 339 | 14 | 527* | P7 변형 |
| P11 | 577 | 771 | 1348 | P8 변형 |
| P12 | 183 | 143 | 326 | 최소 규모 |
| **합계** | | | **~7,930** | |

\* P7/P10의 HTML 부분이 많은 이유: 배경 단말 화면 전체가 포함

## 부록 B. 신뢰도 등급 기준

| 등급 | 범위 | CSS 클래스 | 시각 |
|------|------|-----------|------|
| high | 96% ↑ | `.conf.high` | 녹색 테두리, 연녹 배경 |
| mid | 92~95% | `.conf.mid` | 파란 테두리, 연파란 배경 |
| low | 91% ↓ | `.conf.low` | 빨간 테두리, 연빨간 배경 |

P6에서 `검토필요` 트리거 조건: `rowIdx === 1` (법인등기부등본) 하드코딩.
P8/P11에서 `warn` 표시 조건: `docStatusByStep["AI-OCR 및 필드 추출"]["법인등기부등본.pdf"] === "warn"`.

## 부록 C. Evidence ID 체계

| 접두사 | 문서 | 예시 |
|--------|------|------|
| E-BIZ-NNN | 사업자등록증명원 | E-BIZ-001 ~ E-BIZ-007 |
| E-REG-NNN | 법인등기부등본 | E-REG-001 ~ E-REG-007 |
| E-FIN-NNN | 표준재무제표증명 | E-FIN-001 ~ E-FIN-007 |
| E-VAT-NNN | 부가가치세 과세표준증명원 | E-VAT-001 ~ E-VAT-007 |
| E-SEAL-NNN | 법인인감증명서 | E-SEAL-001 ~ E-SEAL-006 |
| E-ESTATE-NNN | 부동산등기부등본 | E-ESTATE-001 ~ E-ESTATE-007 |
| E-BLDG-NNN | 건축물대장 | E-BLDG-001 ~ E-BLDG-006 |
| E-APPR-NNN | 사정의견서 | E-APPR-001 ~ E-APPR-005 |