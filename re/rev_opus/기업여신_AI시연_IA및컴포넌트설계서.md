# 기업여신 AI Agent 시연 — IA(정보구조) 및 컴포넌트 설계서

> 본 문서는 재구현 시연의 **화면 구성 재설계(추가/삭제/통합/재배치)**, **정보구조(IA)**,  
> **컴포넌트 트리**, **상태 흐름**, **파일 구조**를 정의한다.  
> 요구사항 정의서(D)의 Must/Should/Could 스코프를 기반으로 한다.

---

## 1. 시연 흐름 재설계

### 1.1 원래 설계(S1~S15) vs 현행(P1~P12) vs 재설계 대응표

| 원 설계 | 원 설계 내용 | 현행 | 현행 상태 | 재설계 | 재설계 방향 | 근거 |
|---------|------------|------|----------|--------|-----------|------|
| **S1** | To-Be 전체 맵 | 미구현 | ✕ | **P0 (신규)** | 프로세스 개요 오프닝 | 시연 도입부 필요 |
| S2 | 신청정보 입력 | P1 | ○ | **P1** | 유지 (디자인 개선) | Must |
| S3 | 첨부문서 등록 | P2 | ○ | **P2** | 유지 + 누락 서류 알림 | Must+Should |
| — | 실행 계획 수립 | P3 | ○ | **P3** | 유지 (디자인 개선) | Must |
| — | 문서 전처리 | P4 | ○ | **P4** | 유지 (디자인 개선) | Must |
| S7 | 진위검증 | P5 | ○ | **P5** | 유지 (디자인 개선) | Must |
| S4 | OCR/필드 추출 | P6 | ○ | **P6** | 유지 (디자인 개선) | Must |
| — | 오류 알림 | P7 | ○ | **P7** | 유지 + 배경 교체 | Must |
| S9 | 검증결과 확인/수정 | P8 | ○ | **P8** | 유지 + AI 제언 추가 | Must+Could |
| S5 | 대사/검증 | P9 | ○ | **P9** | 유지 + **전결권 판단 통합** | Must+Could |
| — | 완료 알림 | P10 | ○ | **P10** | 유지 + 배경 교체 | Must |
| S9 | 결과 확인 | P11 | ○ | **P11** | 유지 + 대사뷰 구현 + **반송 분기** | Must+Should+Could |
| **S6** | 전결권 상향 검증 | 미구현 | ✕ | P9에 통합 | 대사 완료 후 전결 판단 표시 | Could |
| S8+S14 | 심사정보+전결권 등록 | P12 | △ | **P12** | 유지 + 전결 레벨 표시 + 심사 메모 | Must+Could |
| **—** | **대화형 QA (브릿지)** | **미구현** | **✕** | **P13 (신규)** | **브릿지 내 QA 대화 시뮬레이션** | **Could (RFP 핵심)** |
| S10 | 담보서류 검증 | **시나리오 통합** | △ | P6/P8/P9 통합 | 담보서류 3건(등기부등본·건축물대장·사정의견서)이 기본 파이프라인에 통합, 좌표 하이라이트는 2차 | Must(기본)+Could(고급) |
| S11 | 주주명부 자동입력 | 미구현 | ✕ | — | 2차 유보 | Won't |
| S12 | TO-DO LIST | 미구현 | ✕ | — | 시연 범위 외 (심사역 화면) | Won't |
| S13 | 자동입력값 조회 | 미구현 | ✕ | P11에 통합 | 결과 확인이 이 역할 수행 | 현행 충분 |
| **S15** | **반송 확인** | **미구현** | **✕** | **P11에서 분기** | 반송 버튼 → P2 복귀 | Could |

### 1.2 화면 변경 요약

#### 신규 화면 (+2)

| 화면 | 유형 | 목적 | 우선순위 |
|------|------|------|---------|
| **P0** | 단말/특수 | 프로세스 전체 맵 오프닝 — "지금부터 이런 과정을 보여드립니다" | **Should** |
| **P13** | 브릿지 | AI 브릿지 내 QA 어시스턴트 — RFP 최핵심 미반영 요건 | **Could** |

#### 삭제 화면 (0)

현행 12개 화면 중 삭제 대상 없음. 모든 화면이 E2E 스토리텔링에 기여.

#### 통합/흡수 (3건 → 기존 화면에 흡수)

| 원래 설계 | 통합 대상 | 통합 방식 |
|----------|----------|----------|
| S6 전결권 상향 검증 | P9 (대사/검증) | 7단계 검증 완료 후 전결 판단 결과를 하단에 추가 표시 |
| S13 자동입력값 조회 | P11 (결과 확인) | P11의 멀티뷰가 이미 이 역할 수행 |
| S15 반송 확인 | P11 (결과 확인) | "WINI 전송" 옆에 "반송" 버튼 추가, 반송 시 P2 복귀 경로 |

#### 기존 화면 보강 (주요 변경)

| 화면 | 보강 내용 |
|------|----------|
| P1 | 담보정보 필드 추가 (소재지, 면적, 추정가액, LTV) |
| P2 | 서류 9건으로 확장 (담보서류 3건 추가), 누락 서류 경고 표시, 진행 확인 모달 |
| P7/P10 | 배경을 여신 업무 맥락 화면으로 교체 |
| P8 | AI 수정 제언 배너, 대사/검증 뷰 실제 구현 |
| P9 | 전결권 판단 결과 인디케이터 추가 (본부 전결: 금액 기준 초과 + 부동산 담보 LTV 검토), 담보정보 교차검증 단계 추가 |
| P11 | 대사/검증 뷰 구현, 수정값 diff, 반송 버튼 |
| P12 | 담보정보 섹션 추가 (소재지·면적·추정가액·LTV), 전결 레벨 필드, 심사 메모 필드 추가 |

### 1.3 재설계 시연 흐름

#### 기본 흐름 (자동 재생, 14단계)

```
P0(개요) → P1(단말) → P2(단말) → P3(Agent) → P4(Agent) → P5(Agent)
  → P6(Agent) → P7(미니) → P8(브릿지) → P9(Agent) → P10(미니)
  → P11(브릿지) → P12(단말) → P13(QA) [선택]
```

#### 분기 흐름 (수동 모드, Q&A 대응)

```
                                              ┌→ P2 (반송 → 서류 보완)
P11(결과 확인) ──┤
                 └→ P12(심사 전송) → P13(QA) [선택]
```

#### 시연 시간 예산

| 구간 | 화면 | 예상 시간 | 누적 | 비고 |
|------|------|----------|------|------|
| 오프닝 | P0 | 8초 | 8초 | 전체 맵 설명 |
| 입력 | P1~P2 | 20초 | 28초 | 신청+서류 |
| Agent 처리 | P3~P6 | 40초 | 68초 | 4개 단계 자동 |
| 오류 알림 | P7 | 5초 | 73초 | |
| HITL 수정 | P8 | 8초 | 81초 | 자본금 수정 |
| 대사/검증 | P9 | 14초 | 95초 | 7단계+전결 판단 |
| 완료 알림 | P10 | 5초 | 100초 | |
| 결과 확인 | P11 | 10초 | 110초 | 단계 순회+WINI전송 |
| 심사 전송 | P12 | 8초 | 118초 | 자동입력+심사요청 |
| QA (선택) | P13 | 15초 | 133초 | 대화 시뮬레이션 |
| **합계** | | **~2분** (P13 제외) / **~2분 15초** (P13 포함) | | |

> 현행 약 100초에서 P0(+8초) 추가로 약 2분. P13은 자동 재생에서 선택적 포함.

---

## 2. 화면별 정보구조 (IA)

### 2.0 P0: 프로세스 전체 맵 (신규)

| 항목 | 내용 |
|------|------|
| **유형** | 특수 (단말 테마 베이스) |
| **목적** | 시연 시작 전 "지금부터 무엇을 보여줄 것인지" 전체 프로세스를 한 장으로 제시 |
| **기존 대응** | 원 설계 S1 (To-Be 전체 맵), old 폴더의 `[S1] To-Be 전체 맵.html` 참조 가능 |

#### 화면 구성

```
┌──────────────────────────────────────────────────────┐
│ [로고h1_01]  기업여신 AI Agent 시연         [프로세스 개요] │
│──────────────────────────────────────────────────────│
│                                                      │
│  ┌─ 프로세스 플로우 맵 ────────────────────────────┐  │
│  │                                                │  │
│  │  [서류접수] → [AI분석] → [검토/수정] → [심사전달]  │  │
│  │   (P1~P2)    (P3~P6)    (P7~P11)     (P12)     │  │
│  │                                                │  │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │  │
│  │  │ 단말  │  │Agent │  │브릿지│  │ 단말  │       │  │
│  │  │ 담당자│→│ AI   │→│ HITL │→│ 심사  │       │  │
│  │  └──────┘  └──────┘  └──────┘  └──────┘       │  │
│  │                                                │  │
│  │  핵심 메시지:                                    │  │
│  │  · AI Agent가 서류 분류·OCR·검증을 자율 수행      │  │
│  │  · 사람이 최종 확인하며 책임 소재 확보 (HITL)      │  │
│  │  · 오류 시 실시간 알림으로 즉시 대응               │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### 정보 항목

| 정보 | 표현 방식 |
|------|----------|
| 4단계 프로세스 (접수→분석→검토→심사) | 수평 플로우 다이어그램 |
| 각 단계의 주체 (단말/Agent/브릿지) | 아이콘 + 색상 구분 |
| 핵심 메시지 3줄 | 하단 텍스트 |
| 시연 대상 서류 9건 (기본 5 + 담보 3 + 조건부 1) | 우측 또는 하단 서류 아이콘 |

#### 전환

- 자동 모드: 8초 후 P1로 자동 전환
- 수동 모드: 발표자가 개요 설명 후 `→` 키로 전환

---

### 2.1 P1 ~ P12: 기존 화면

기존 화면의 IA는 기획문서/설계문서에 상세 기술되어 있으므로, **재설계에서 변경되는 부분만** 기술한다.

#### P2 변경 — 누락 서류 알림

| 추가 요소 | 위치 | 내용 |
|----------|------|------|
| P1 담보정보 필드 | 폼 그리드 하단 | 담보소재지, 토지면적(1,320㎡), 건물면적(2,640㎡), 추정가액(48억), LTV(62.5%) |
| 누락 경고 아이콘 | 주주명부 행 | 주황 ⚠ 아이콘 + 행 배경 `#FEF3C7` |
| 서류 목록 확장 | 테이블 전체 | 9건 표시: 기본 5건 + 담보서류 3건(부동산등기부등본, 건축물대장, 사정의견서) + 조건부 1건(주주명부) |
| 진행 확인 모달 | `서류입력 및 검수(AI)` 클릭 시 | "미등록 서류 1건(주주명부)이 있습니다. 계속 진행하시겠습니까?" |

#### P7/P10 변경 — 배경 교체

| 현행 | 재설계 |
|------|--------|
| 일반 은행 단말(고객정보, 계좌개설) | **여신 신청 업무 화면** — P1 완료 상태 캡처를 정적 배경으로 사용 |

#### P8 변경 — AI 제언 + 대사 뷰

| 추가 요소 | 위치 | 내용 |
|----------|------|------|
| AI 수정 제언 배너 | OCR 뷰 에디터 상단 | "AI 추천: 1,600,000,000원 (원본 이미지 재분석 기준)" |
| 대사/검증 뷰 | 5번째 뷰 (placeholder 대체) | 선택 문서의 7단계 검증 결과 요약 테이블 (P8: "실행전" 상태) |

#### P9 변경 — 전결권 판단 통합

| 추가 요소 | 위치 | 내용 |
|----------|------|------|
| 전결권 판단 결과 | 메시지 전송 Tool 영역 하단 | 검증 완료 후 "전결 판단: **본부 전결**" 뱃지 표시 |
| 판단 근거 | 뱃지 하단 텍스트 | "신청금액 30억(금액 기준 초과) + 부동산 담보 LTV 62.5% 검토 → 본부 심사 필요" |

#### P11 변경 — 반송 + 대사 뷰

| 추가 요소 | 위치 | 내용 |
|----------|------|------|
| 대사/검증 뷰 | 5번째 뷰 (placeholder 대체) | 선택 문서의 7단계 검증 결과 (P11: "정상" 상태) |
| 반송 버튼 | 하단 액션 영역 | "WINI 전송" 좌측에 "반송" 버튼 (Secondary 스타일) |
| 수정값 diff | OCR 뷰 추출 테이블 | 자본금 행: ~~1,000,000,000원~~ → 1,600,000,000원 |

#### P12 변경 — 브릿지 수신 + 전결 + 심사 메모

> **역할 분리 원칙 적용**: P12는 단말 화면이므로 AI 결과를 직접 표시하지 않는다.  
> 모든 AI 처리 결과(재무 정보, 전결 판단)는 브릿지(P11)에서 WINI 전송된 데이터로 수신한다.

| 추가/변경 요소 | 위치 | 내용 |
|--------------|------|------|
| WINI 수신 뱃지 | 헤더 우측 | "WINI 수신완료" (녹색 뱃지) |
| 수신 상태 텍스트 | 폼 상단 전폭 | "브릿지로부터 WINI 데이터 수신 중..." → "브릿지 수신 완료 — 28개 필드 자동 적용됨 (담보정보 포함)" |
| 섹션명 변경 | 재무 정보 섹션 | "재무 정보 (AI-OCR 추출)" → **"재무 정보 (브릿지 수신)"** |
| 섹션명 변경 | 전결/심사 섹션 | "전결 / 심사" → **"전결 / 심사 (브릿지 수신)"** |
| 심사 메모 | 그리드 하단 전폭 | "브릿지 검토완료 — 자본금 수정 1건(HITL), 전결 상향: 금액 기준 초과 + 부동산 담보 LTV 검토" |
| 담보 정보 섹션 | 재무 정보 하단 | 소재지: 서울 중구 세종대로 00, 토지 1,320㎡, 건물 2,640㎡, 추정가액 48억원, LTV 62.5% |
| 필드 수 | 19 → 28개 | +담보정보(소재지·면적·추정가액·LTV 등 7개), +전결레벨, +심사메모 |

---

### 2.13 P13: AI 브릿지 — QA 어시스턴트 (신규)

| 항목 | 내용 |
|------|------|
| **유형** | **브릿지** (`theme-bridge` 사용) |
| **목적** | RFP 핵심 미반영 요건 "대화형 인터페이스 기반 Agent" 시뮬레이션. **역할 분리 원칙에 따라 QA도 브릿지 내 기능으로 정의** |
| **우선순위** | Could (일정 여유 시 구현, 단 RFP 경쟁력 최대 포인트) |

#### 화면 구성

```
┌──────────────────────────────────────────────────────┐
│ [AI 브릿지][QA]  AI 브릿지 — QA 어시스턴트              │
│──────────────────────────────────────────────────────│
│ ┌────────────────┐ ┌──────────────────────────────┐ │
│ │                │ │  대화 영역                     │ │
│ │  문맥 패널      │ │                              │ │
│ │                │ │  🤖 Agent                     │ │
│ │  현재 건 요약:   │ │  "(주)000바이오 건(기업부동산담보 │ │
│ │  · 차주명       │ │   대출, 30억원)의 담보서류 교차  │ │
│ │  · 신청번호     │ │   검증이 완료되었습니다. LTV     │ │
│ │  · 처리 현황    │ │   62.5%로 본부 전결 대상        │ │
│ │               │ │   입니다."                     │ │
│ │  참조 문서:     │ │                              │ │
│ │  · 부동산등기부 │ │  📋 [근거: E-COL-001]         │ │
│ │    (담보검증)   │ │                              │ │
│ │  · 사정의견서   │ │  👤 사용자                     │ │
│ │               │ │  "이 건의 심사 시 특별히         │ │
│ │  Action Plan:  │ │   유의할 점이 있나요?"          │ │
│ │  · 담보가액 확인│ │                              │ │
│ │   (추정가액48억)│ │  🤖 Agent                     │ │
│ │  · 전결 상향    │ │  "네, 3가지 유의사항이          │ │
│ │    근거 문서화  │ │   있습니다:                    │ │
│ │               │ │   1. LTV 62.5% (30억/48억) ...│ │
│ │               │ │   2. 본부 전결 기준 초과 ...    │ │
│ │               │ │   3. 담보정보 교차검증 ..."      │ │
│ │               │ │                              │ │
│ │               │ │  ┌──────────────────────────┐ │ │
│ │               │ │  │ 메시지 입력...    [전송]  │ │ │
│ │               │ │  └──────────────────────────┘ │ │
│ └────────────────┘ └──────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

#### 정보 항목

| 영역 | 정보 |
|------|------|
| 좌측: 문맥 패널 (280px) | 현재 건 요약 (차주: (주)000바이오, 기업부동산담보대출, 30억원), 참조 문서 목록, Agent Action Plan |
| 우측: 대화 영역 | 채팅 버블 (Agent/사용자 구분), 근거 문서 링크, 입력 필드 |

#### 데모 시나리오 (하드코딩 스크립트)

| 턴 | 역할 | 메시지 요약 |
|----|------|-----------|
| 1 | Agent | 처리 결과 요약 + 담보 교차검증 결과 + 본부 전결 안내 + 근거 문서 참조 |
| 2 | 사용자 | "이 건의 심사 시 유의할 점이 있나요?" |
| 3 | Agent | 3가지 유의사항 (LTV·담보가액 검토, 본부 전결 기준 초과, 담보정보 교차검증) + Action Plan |

#### 전환

- P12에서 심사요청 완료 후 자동 이동 (또는 수동)
- P13은 시퀀스 마지막 → auto-paging 없음
- 대화 자동 재생 후 시연 종료

---

## 3. 전체 IA 맵

### 3.1 화면 구조 트리

```
시연 시스템
├── P0   프로세스 전체 맵              [단말-특수]  Should
│
├── 서류 접수 ─────────────────────────────────
│   ├── P1   신청정보 입력              [단말]       Must
│   └── P2   첨부문서 등록              [단말]       Must
│
├── AI Agent 처리 ─────────────────────────────
│   ├── P3   실행 계획 수립             [Agent]      Must
│   ├── P4   문서 전처리               [Agent]      Must
│   ├── P5   진위검증                  [Agent]      Must
│   └── P6   AI-OCR 및 필드 추출        [Agent]      Must
│
├── HITL 검토 (1차) ───────────────────────────
│   ├── P7   검토 요청 알림             [미니]       Must
│   └── P8   값 수정 (HITL)            [브릿지]     Must
│
├── AI Agent 검증 ─────────────────────────────
│   └── P9   대사/검증 + 전결 판단      [Agent]      Must+Could
│
├── HITL 확인 (2차) ───────────────────────────
│   ├── P10  검토 완료 알림             [미니]       Must
│   └── P11  결과 확인 (HITL)           [브릿지]     Must
│         ├── [WINI 전송] → P12
│         └── [반송] → P2  ········ Could (분기)
│
├── 심사 전달 ─────────────────────────────────
│   └── P12  심사정보 자동입력 + 심사 요청 [단말]      Must
│
└── AI QA (선택) ──────────────────────────────
    └── P13  AI 브릿지 — QA 어시스턴트   [브릿지]     Could
```

### 3.2 화면 유형별 집계

| 유형 | 화면 | 수 |
|------|------|---|
| 단말 | P0, P1, P2, P12 | 4 |
| Agent | P3, P4, P5, P6, P9 | 5 |
| 브릿지 | P8, P11, **P13** | 3 |
| 브릿지 미니 | P7, P10 | 2 |
| **합계** | | **14** |

### 3.3 자동 재생 시퀀스 설정

| 설정 | Must 기본 | Should 추가 | Could 추가 |
|------|----------|------------|------------|
| 시퀀스 | P1→P2→...→P12 | P0→P1→P2→...→P12 | P0→P1→...→P12→P13 |
| 화면 수 | 12 (현행 유지) | 13 (+P0) | 14 (+P0, +P13) |
| 예상 시간 | ~100초 | ~108초 | ~133초 |

> `common.js`의 `sequence` 배열을 설정으로 관리하여, 시연 범위에 따라 P0/P13 포함 여부 선택 가능

---

## 4. 컴포넌트 트리

### 4.1 공통 컴포넌트 (모든 화면)

```
common/
├── AppShell                      ← 캔버스 래퍼 (1920×1080)
│   ├── Header                    ← 통합 80px 헤더 (모든 화면 유형 공통)
│   │   ├── HeaderLeft            ← 로고(h1_01.png) + 타이틀 + (Agent pill)
│   │   └── HeaderRight           ← 채널 뱃지 (영업점단말/백그라운드실행/AI브릿지)
│   └── Content                   ← 콘텐츠 영역
│
├── DemoEngine                    ← 시연 제어 엔진
│   ├── DemoShield                ← 입력 차단 레이어
│   ├── DemoKeyGuard              ← 키보드 방어
│   ├── DemoBrowserGuard          ← 브라우저 방어
│   ├── DemoSequenceRunner        ← 시퀀스 실행 (mutex + 에러 복구)
│   ├── DemoNavigator             ← 페이지 전환 (fade + auto-paging)
│   └── DemoIndicator             ← 모드/페이지/속도 인디케이터
│
├── UI Components                 ← 범용 UI
│   ├── Badge                     ← 상태 뱃지 6종
│   ├── Button                    ← 4종 (Primary/Secondary/Ghost/Danger)
│   ├── Modal                     ← 모달/오버레이
│   ├── Table                     ← 데이터 테이블
│   ├── FormField                 ← 라벨 + 입력
│   └── Card                      ← 패널/카드
│
└── Demo Effects                  ← 시연 전용 효과
    ├── TypeWriter                ← 자동 타이핑
    ├── ClickPulse                ← 클릭 시각 효과
    └── ProgressBar               ← 프로그레스 바
```

### 4.2 화면 유형별 컴포넌트

#### 단말 전용 (g1.html 스타일 기반)

```
terminal/
├── TerminalAppBar                ← 80px 통합 헤더 + 로고(h1_01.png) + Woori Blue 좌측 바
├── TerminalTabBar                ← 탭 바 (업무 탭 구분)
├── TerminalStatusStrip           ← 상태 표시줄 (접수번호, 처리상태 등)
├── TerminalWorkspace             ← 메인 작업 영역
│   ├── FormGrid                  ← N열 폼 그리드 (담보정보 필드 포함)
│   ├── LookupModal               ← 조회 팝업 (영업점/담당자)
│   ├── SelectMenu                ← 커스텀 셀렉트 데모
│   └── DocTable                  ← 서류 목록 테이블 (P2, 9건)
└── TerminalFooter                ← 하단 정보 바
```

#### Agent 전용 (스캔 라인 제거, 도트 그리드 + 글래스 카드 + 프로세스 로그 유지)

```
agent/
├── AgentHeader                   ← 80px 통합 헤더 + 로고(h1_01.png) + Agent pill + 점멸 도트
├── AgentDotGrid                  ← 배경 도트 그리드 패턴 (스캔 라인 제거됨)
├── FlowBar                       ← 5단계 프로세스 플로우 바 (표시 전용)
│   └── FlowStep                  ← 개별 단계 (미진행/완료/활성/에러)
├── AgentLayout                   ← 좌(340px)/우(나머지) 분할 레이아웃
├── GlassCard                     ← 글래스모피즘 스타일 카드 컨테이너
├── ProcessLog                    ← 실시간 처리 로그 표시
├── DocAnalysisList               ← 좌측 문서 분석 목록 (P3/P4, 9건)
├── TargetCards                   ← 우측 4칸 대상 카드 (P3/P4, 담보서류 포함)
├── ExecutionTimeline             ← 실행 순서 타임라인 (P3/P4)
├── VerifyTable                   ← 검증 파이프라인 테이블 (P5/P6/P9 공용)
├── RpaProgress                   ← RPA 프로그레스 바 (P5)
├── MessageTool                   ← 메시지 전송 Tool 영역 (P6/P9)
├── CollateralVerifyRow           ← [신규] 담보정보 교차검증 행 (P9)
└── ApprovalIndicator             ← [신규] 전결 판단 결과 (P9, 본부 전결)
```

#### 브릿지 전용

```
bridge/
├── BridgeHeader                  ← 80px 통합 헤더 + 로고(h1_01.png) + 상단 4px Blue 바 + AI 브릿지 뱃지
├── FlowBar                       ← 5단계 플로우 바 (클릭 가능, Agent와 공유)
├── BridgeLayout                  ← 좌(320px 문서목록) / 우(멀티뷰) 분할
├── DocListPanel                  ← 좌측 문서 목록 + 상태 뱃지
│   └── DocItem                   ← 개별 문서 행 (선택/비선택/경고)
├── MultiView                     ← 우측 뷰 전환 컨테이너
│   ├── PlanView                  ← 실행 계획 뷰
│   ├── PreprocessView            ← 전처리 뷰
│   ├── VerifyView                ← 진위검증 뷰
│   ├── OcrView                   ← OCR 뷰 (핵심)
│   │   ├── DocPaper              ← 좌측: 원본 문서 시뮬레이션
│   │   ├── ExtractTable          ← 우측: 추출 항목 테이블
│   │   ├── FieldHighlight        ← 원본 필드 하이라이트
│   │   ├── EditPanel             ← 값 수정 에디터
│   │   └── AiSuggestionBanner    ← [신규] AI 수정 제언
│   ├── CollateralView            ← [신규] 담보정보 뷰 (소재지·면적·추정가액·LTV)
│   └── ReconcileView             ← [신규] 대사/검증 결과 뷰 (placeholder 대체, 담보정보 교차검증 포함)
└── ActionBar                     ← 하단 버튼 영역 (작업재개/WINI전송/반송)
```

#### 브릿지 미니 전용

```
bridge-mini/
├── TerminalBackground            ← 배경 단말 화면 (정적 or P1 캡처)
├── OverlayBlur                   ← 반투명 블러 레이어
└── MiniCard                      ← 우하단 알림 카드
    ├── MiniHeader                ← 타이틀 + 상태 뱃지
    ├── MiniBody                  ← 메시지 본문
    └── MiniAction                ← 액션 링크 ("AI 브릿지 열기")
```

#### QA 전용 (P13 — 브릿지 테마)

> P13은 `theme-bridge`를 사용하며, 브릿지 공통 레이아웃(`bridge-left`/`bridge-right`)을 그대로 활용한다.

```
qa/ (P13, theme-bridge)
├── BridgeLeft (280px)            ← 브릿지 공통 좌측 패널
│   └── ContextPanel              ← 현재 건 요약, 참조 문서, Action Plan
├── BridgeRight                   ← 브릿지 공통 우측 패널
│   ├── ChatMessages              ← 대화 영역
│   │   ├── ChatBubble            ← 개별 메시지 버블 (Agent/사용자 구분)
│   │   └── ReferenceLink         ← 근거 문서 참조 링크
│   └── ChatInput                 ← 하단 입력 필드 (시연용)
└── ActionPlanCard                ← Action Plan 카드 (좌측 패널 내)
```

### 4.3 컴포넌트 재사용 매트릭스

| 컴포넌트 | P0 | P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9 | P10 | P11 | P12 | P13 |
|---------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:---:|:---:|:---:|:---:|
| AppShell | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| Badge | | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| FlowBar | | | | ● | ● | ● | ● | | ● | ● | | ● | | |
| VerifyTable | | | | | | ● | ● | | | ● | | | | |
| DocListPanel | | | | | | | | | ● | | | ● | | |
| MultiView | | | | | | | | | ● | | | ● | | |
| MiniCard | | | | | | | ● | | | | ● | | | |
| Modal | | ● | ● | | | | | | | | | | ● | |
| FormGrid | | ● | | | | | | | | | | | ● | |
| DemoEngine | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |

---

## 5. 상태 관리 설계

### 5.1 상태 계층

```
┌─────────────────────────────────────────────────┐
│                sessionStorage                    │
│  ┌────────────────────────────────────────────┐ │
│  │  scenario       차주/신청 기본정보          │ │ ← P1에서 초기화
│  │  documents      서류 목록 + 등록 상태       │ │ ← P2에서 갱신
│  │  ocrResults     OCR 추출 결과 (9건, 담보서류 포함) │ │ ← 초기 데이터 모듈에서 로드
│  │  editHistory    HITL 수정 이력              │ │ ← P8에서 기록
│  │  verifyResults  대사/검증 결과              │ │ ← P9에서 기록
│  │  approvalLevel  전결 판단 결과              │ │ ← P9에서 기록
│  │  demoState      { currentPage, mode, speed }│ │ ← DemoEngine에서 관리
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
          ↓ 페이지 전환 시 유지
┌─────────────────────────────────────────────────┐
│           페이지 로컬 상태 (JS 변수)               │
│  selectedStep, selectedDoc, selectedExtract      │
│  sequenceLock, animationState                    │
└─────────────────────────────────────────────────┘
```

### 5.2 상태 흐름 다이어그램

```
P1 ──write──→ sessionStorage.scenario (차주정보 16필드, 담보정보 포함)
P2 ──write──→ sessionStorage.documents (서류 9건 등록 상태, 담보서류 3건 포함)
P3~P6 ──(읽기만)──→ documents
P8 ──write──→ sessionStorage.editHistory [{field, before, after, reason}]
     ──write──→ sessionStorage.ocrResults (수정 반영)
P9 ──write──→ sessionStorage.verifyResults (7단계 결과)
     ──write──→ sessionStorage.approvalLevel ("본부")
P11 ──read──→ editHistory, ocrResults (수정값 반영 표시)
      ──read──→ verifyResults (대사뷰 표시)
P12 ──read──→ scenario + ocrResults (WINI 수신 데이터로 28필드 자동입력, 담보정보 포함)
      ──read──→ approvalLevel (전결 레벨 — 브릿지에서 수신)
P13 ──read──→ scenario, editHistory, approvalLevel (대화 문맥)
```

### 5.3 상태 초기화 전략

| 시점 | 동작 |
|------|------|
| P1 로드 (또는 Reset) | sessionStorage 전체 clear → `data/` 모듈에서 기본값 로드 |
| P8 수정 적용 | editHistory에 append, ocrResults의 해당 필드 갱신 |
| P9 완료 | verifyResults, approvalLevel 기록 |
| P11 반송 선택 시 | editHistory/verifyResults 유지, documents의 특정 서류만 "미등록"으로 복원 → P2 이동 |

---

## 6. 파일 구조

### 6.1 전체 디렉토리

```
renewal/                          ← 재구현 루트
├── index.html                    ← 진입점 (P0 또는 P1로 리다이렉트)
│
├── assets/
│   ├── font/
│   │   ├── WooridaumL.woff2
│   │   ├── WooridaumR.woff2
│   │   └── WooridaumB.woff2
│   └── images/
│       ├── woori-logo.svg        ← 우리은행 로고
│       └── terminal-bg.png       ← P7/P10 배경용 단말 캡처
│
├── styles/
│   ├── tokens/
│   │   ├── colors.css
│   │   ├── typography.css        ← @font-face + 프로젝터용 업스케일 타입 (최소 14px, 본문 18px, 제목 28-44px)
│   │   ├── spacing.css
│   │   ├── borders.css
│   │   └── motion.css
│   ├── base/
│   │   ├── reset.css
│   │   └── global.css            ← body font-family, app-shell 기본
│   ├── themes/
│   │   ├── terminal.css
│   │   ├── agent.css
│   │   ├── bridge.css
│   │   └── bridge-mini.css
│   ├── components/
│   │   ├── header.css
│   │   ├── flow-bar.css
│   │   ├── badge.css
│   │   ├── table.css
│   │   ├── button.css
│   │   ├── modal.css
│   │   ├── form.css
│   │   ├── card.css
│   │   └── chat.css              ← [신규] P13 채팅 UI
│   └── animations/
│       ├── transitions.css
│       ├── pulse.css
│       └── demo.css
│
├── js/
│   ├── common/
│   │   ├── demo-engine.js        ← DemoShield/KeyGuard/BrowserGuard/SequenceRunner
│   │   ├── demo-navigator.js     ← PageTransition + AutoPaging (현행 common.js 확장)
│   │   ├── demo-indicator.js     ← 모드/페이지/속도 표시
│   │   └── state-manager.js      ← sessionStorage 읽기/쓰기 유틸
│   ├── components/
│   │   ├── flow-bar.js           ← FlowBar 렌더링 + 이벤트
│   │   ├── verify-table.js       ← 검증 테이블 범용 컴포넌트
│   │   ├── doc-list-panel.js     ← 문서 목록 패널
│   │   ├── multi-view.js         ← 멀티뷰 전환 컨테이너
│   │   ├── ocr-view.js           ← OCR 뷰 (원본+추출+에디터+하이라이트)
│   │   ├── mini-card.js          ← 브릿지 미니 알림
│   │   ├── lookup-modal.js       ← 조회 팝업
│   │   └── chat-area.js          ← [신규] QA 채팅 영역
│   └── effects/
│       ├── type-writer.js
│       ├── click-pulse.js
│       └── progress-bar.js
│
├── data/
│   ├── scenario.js               ← 차주/신청 기본정보(담보정보 포함), 마스터
│   ├── documents.js              ← 서류 목록 9건(기본5+담보3+조건부1), 처리룰, 발급기관
│   ├── ocr-results.js            ← 9건 문서 essentials/extracts (담보서류 포함)
│   ├── verification.js           ← 검증 상태 매트릭스, 타이밍
│   ├── notifications.js          ← 알림 메시지 템플릿
│   └── qa-script.js              ← [신규] QA 대화 시나리오 스크립트
│
├── pages/
│   ├── p0.html                   ← [신규] 프로세스 전체 맵
│   ├── p1.html                   ← 신청정보 입력
│   ├── p2.html                   ← 첨부문서 등록
│   ├── p3.html                   ← 실행 계획 수립
│   ├── p4.html                   ← 문서 전처리
│   ├── p5.html                   ← 진위검증
│   ├── p6.html                   ← AI-OCR
│   ├── p7.html                   ← 검토 요청 알림
│   ├── p8.html                   ← 값 수정 HITL
│   ├── p9.html                   ← 대사/검증 + 전결 판단
│   ├── p10.html                  ← 검토 완료 알림
│   ├── p11.html                  ← 결과 확인 HITL
│   ├── p12.html                  ← 심사정보 자동입력
│   └── p13.html                  ← [신규] 대화형 QA
│
└── README.md                     ← 시연 실행 가이드
```

### 6.2 파일 수 비교

| 구분 | 현행 | 재설계 |
|------|------|--------|
| HTML 페이지 | 12 | 14 (+P0, +P13) |
| CSS 파일 | 0 (모두 인라인) | 20+ (토큰 5 + 베이스 2 + 테마 4 + 컴포넌트 9+, 프로젝터용 타이포 업스케일 포함) |
| JS 공통 모듈 | 1 (common.js) | 11 (common 4 + components 8 + effects 3... 합산) |
| JS 데이터 모듈 | 0 (인라인) | 6 |
| 폰트 파일 | 0 | 3 (woff2) |
| **합계** | **13** | **~57** |

> 파일 수가 늘었지만, 각 파일의 역할이 명확하고 중복이 제거되어 총 코드량은 감소 예상  
> 현행 ~7,930줄 → 재설계 예상 ~5,500줄 (공통 모듈 추출 + 중복 제거 효과)

---

## 7. 스타일 적용 전략

### 7.1 CSS 로딩 순서

```html
<!-- 모든 페이지 공통 -->
<link rel="stylesheet" href="../styles/tokens/colors.css">
<link rel="stylesheet" href="../styles/tokens/typography.css">
<link rel="stylesheet" href="../styles/tokens/spacing.css">
<link rel="stylesheet" href="../styles/tokens/borders.css">
<link rel="stylesheet" href="../styles/tokens/motion.css">
<link rel="stylesheet" href="../styles/base/reset.css">
<link rel="stylesheet" href="../styles/base/global.css">

<!-- 화면 유형별 테마 (1개만 선택) -->
<link rel="stylesheet" href="../styles/themes/terminal.css">

<!-- 사용하는 컴포넌트만 -->
<link rel="stylesheet" href="../styles/components/header.css">
<link rel="stylesheet" href="../styles/components/form.css">
<link rel="stylesheet" href="../styles/components/button.css">
<link rel="stylesheet" href="../styles/components/modal.css">

<!-- 페이지 고유 스타일 (최소한) -->
<style>
  /* P1 고유: 조회 모달 리스트 레이아웃 등 */
</style>
```

### 7.2 JS 로딩 전략

```html
<!-- 공통 (모든 페이지) -->
<script type="module" src="../js/common/state-manager.js"></script>
<script type="module" src="../js/common/demo-engine.js"></script>
<script type="module" src="../js/common/demo-navigator.js"></script>
<script type="module" src="../js/common/demo-indicator.js"></script>

<!-- 데이터 (필요한 것만) -->
<script type="module" src="../data/scenario.js"></script>

<!-- 컴포넌트 (필요한 것만) -->
<script type="module" src="../js/components/lookup-modal.js"></script>

<!-- 페이지 고유 시퀀스 -->
<script type="module">
  import { runDemo } from './p1-sequence.js';
  document.addEventListener('DOMContentLoaded', runDemo);
</script>
```

---

## 8. 구현 영향도 매트릭스

### 8.1 요구사항 → 컴포넌트 매핑

| 요구사항 | 영향 컴포넌트 | 신규/수정 |
|---------|-------------|----------|
| RQ-A01 (공통 CSS) | styles/ 전체 | 신규 |
| RQ-A02 (데이터 모듈) | data/ 전체 | 신규 |
| RQ-A03 (P8/P11 추출) | bridge/ 전체, multi-view, ocr-view | 신규 추출 |
| RQ-A04 (common.js 확장) | js/common/ 전체 | 신규+확장 |
| RQ-A05 (상태 공유) | state-manager.js | 신규 |
| RQ-B01~B06 (디자인) | styles/ 전체, 모든 HTML | 전면 수정 |
| RQ-C01~C06 (안정성) | demo-engine.js | 신규 |
| RQ-D01~D12 (E2E) | pages/ 전체 | 전면 재구현 |
| P0 신규 | pages/p0.html, 프로세스 맵 CSS/JS | 신규 |
| P13 신규 | pages/p13.html, chat-area.js, qa-script.js | 신규 |
| 전결권 통합 | verify-table.js (P9), ApprovalIndicator (본부 전결: 금액+LTV) | 수정+신규 |
| 담보정보 통합 | scenario.js, documents.js, ocr-results.js, collateral-view.js | 신규 |
| 반송 분기 | p11.html, demo-navigator.js | 수정 |

### 8.2 구현 순서 (Phase 매핑)

| Phase | 작업 | 관련 파일 |
|-------|------|----------|
| **1. 기반** | styles/ 전체, data/ 전체, js/common/ 전체 | ~30 파일 |
| **2. E2E** | pages/p1~p12.html, js/components/ | ~25 파일 |
| **3. 품질** | 추가 컴포넌트 (reconcile-view, diff 등), 시연 컨트롤 | ~5 파일 |
| **4. RFP** | pages/p0.html, pages/p13.html, qa-script.js, chat-area.js | ~5 파일 |
