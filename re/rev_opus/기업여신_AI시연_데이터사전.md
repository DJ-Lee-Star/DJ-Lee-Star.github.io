# 기업여신 AI Agent 시연 — 데이터 사전

> 본 문서는 현재 구현(p1~p12)에서 사용되는 모든 데이터를 식별·정의하고,  
> RFP 미반영 요건을 수용하기 위한 **확장 데이터 모델**을 함께 제시한다.  
> `[현행]`은 현재 구현에 존재하는 데이터, `[확장]`은 RFP 요건 충족을 위해 추가가 필요한 데이터이다.

---

## 1. 데이터 카테고리 총괄

| # | 카테고리 | 현행 항목 수 | 확장 항목 수 | 소속 화면 (현행) | 확장 대상 RFP 요건 |
|---|---------|------------|------------|---------------|-----------------|
| A | 시나리오(차주/신청/담보/전결) | 20 | +5 | P1, P2, P8, P11, P12 | 여신 실행, 사후관리 |
| B | 마스터(영업점/담당자) | 8 | +6 | P1 | 결재 경로, 심사역 |
| C | 서류(문서 목록/메타) | 9건(기본5+담보3+조건부1) | +7건 이상 | P2~P11 | RFP 서류 종류 전체 |
| D | 처리 룰(대상 판정) | 4카테고리 | +3카테고리 | P3, P8, P11 | 전결권, 담보, 약정 |
| E | 전처리 결과 | 4작업 | +2작업 | P4, P8, P11 | 이미지 품질 메트릭 |
| F | 진위검증 결과 | 5문서×3단계 | +N문서 | P5, P8, P11 | 서류 종류 확대 |
| G | OCR 추출 결과 | 8문서×52필드 | +N문서×N필드 | P6, P8, P11 | 서류 종류 확대 |
| H | 대사/검증 결과 | 5문서×8단계(담보정보 교차검증 포함) | +N문서×N단계 | P9 | 전결권, 담보 검증 |
| I | HITL 수정 이력 | 1건(자본금) | N건 | P8, P11 | 감사 추적 |
| J | 알림 메시지 | 2건 | +N건 | P7, P10 | 알림 유형 확장 |
| K | 자동입력 결과 | 25필드(담보정보+전결정보 포함) | +N필드 | P12 | 심사 메모, 전결선 |
| L | 대화형 QA | **없음** | 신규 | 미구현 | RFP 핵심 요건 |
| M | 전결권 | **없음** | 신규 | 미구현 | RFP 요건 S6 |
| N | 반송/피드백 | **없음** | 신규 | 미구현 | RFP 요건 S15 |

---

## 2. 카테고리별 상세

### A. 시나리오 데이터 (차주/신청)

#### [현행] 차주 기본정보

| # | 필드명 | 필드 ID | 타입 | 현행 값 | 정의 위치 | 중복 위치 |
|---|--------|--------|------|---------|----------|----------|
| A-01 | 차주명(법인) | `borrowerName` | string | (주)000바이오 | P1 `demoFields` | P2 pill, P8/P11 extracts, P12 |
| A-02 | 신청번호 | `applicationNo` | string | CC411-2026-000123 | P1 `demoFields` | P2 pill, P10 알림, P12 |
| A-03 | 신청일자 | `applyDate` | date(string) | 2026-03-05 | P1 `demoFields` | P12 |
| A-04 | 대출상품 | `loanProduct` | string | 기업부동산담보대출 | P1 `demoFields` | P12 |
| A-05 | 신청금액 | `loanAmount` | currency(string) | 3,000,000,000 | P1 `demoFields` | P12 |
| A-06 | 만기일 | `maturityDate` | date(string) | 2027-12-31 | P1 `demoFields` | P12 |
| A-07 | 자금용도 | `fundPurpose` | string | 공장부지 매입 | P1 `demoFields` | P12 |
| A-08 | 상환방식 | `repaymentType` | enum | 원리금균등 | P1 select | P12 |
| A-09 | 취급구분 | `handlingType` | enum | 신규 | P1 select | P12 |
| A-10 | 담보유형 | `collateralType` | enum | 부동산담보 | P1 select | P12 |
| A-11 | 신청채널 | `applyChannel` | enum | 영업점 | P1 select | P12 |
| A-12 | 영업점 코드 | `branchCode` | string | 411 | P1 조회 | P12 |
| A-13 | 담당자명 | `managerName` | string | 김담당 | P1 조회 | P12 |
| **A-14** | **담보물건 소재지** | `collateralLocation` | string | **서울 중구 세종대로 00** | P1 입력/P12 수신 | P8/P11 |
| **A-15** | **토지면적** | `landArea` | string | **1,320㎡** | P1 입력/P12 수신 | P8/P11 |
| **A-16** | **건물면적** | `buildingArea` | string | **2,640㎡** | P1 입력/P12 수신 | P8/P11 |
| **A-17** | **추정가액** | `estimatedValue` | currency(string) | **4,800,000,000** | 사정의견서 OCR / P12 수신 | P8/P11 |
| **A-18** | **LTV** | `ltv` | string | **62.5%** | Agent 산출 (30억/48억) | P12 |
| **A-19** | **전결 레벨** | `approvalLevel` | enum | **본부 전결** | Agent 판정 | P12 |
| **A-20** | **전결 사유** | `approvalReason` | string | **금액 기준 초과 + 부동산 담보 LTV 검토** | Agent 판정 | P12 |

#### [확장] 추가 필요 필드

| # | 필드명 | 필드 ID | 타입 | 용도 | 관련 RFP 요건 |
|---|--------|--------|------|------|--------------|
| A-14 | 여신과목 | `loanCategory` | enum | 여신 유형 세분류 (운전/시설/무역 등) | 설계 S2 원안 |
| A-15 | 여신기간(개월) | `loanTermMonths` | number | 만기 계산 기준 | 설계 S2 원안 |
| A-16 | 금리 유형 | `rateType` | enum | 고정/변동/혼합 | 여신 실행 |
| A-17 | 적용 금리 | `appliedRate` | number | % | 여신 실행 |
| A-18 | KYC 등급 | `kycGrade` | enum | 정상/주의/경고 | RFP KYC 교차검증 |
| A-19 | 기존 여신 잔액 | `existingLoanBalance` | currency | 기존 대출 현황 | RFP 사후관리 |
| A-20 | 차주 신용등급 | `creditRating` | string | CSS 평가 결과 | RFP 여신 심사 |
| A-21 | 실질소유자 | `beneficialOwner` | string | 최대주주/지배구조 | RFP 공유주주 검증 |
| A-22 | 전결 레벨 | `approvalLevel` | enum | 영업점/본부/상향 | RFP 전결권 S6 |
| A-23 | 심사 메모 | `reviewMemo` | text | 예외/특이사항 기록 | 설계 S12 원안 |
| A-24 | 반송 사유 | `returnReason` | text | 반송 시 사유 코드 | RFP 반송 S15 |
| A-25 | 반송 이력 횟수 | `returnCount` | number | 동일 건 반송 횟수 | RFP 반송 S15 |

---

### B. 마스터 데이터 (영업점/담당자)

#### [현행]

**영업점 마스터 (`branchData`)** — P1 인라인

| # | 코드 | 영업점명 |
|---|------|---------|
| B-01 | 411 | 강남기업금융센터 |
| B-02 | 238 | 서초금융센터 |
| B-03 | 105 | 종로금융센터 |
| B-04 | 522 | 여의도금융센터 |

**담당자 마스터 (`managerData`)** — P1 인라인

| # | 사번 | 담당자명 | 소속 영업점 |
|---|------|---------|-----------|
| B-05 | E1042 | 김담당 | 강남기업금융센터 |
| B-06 | E0915 | 이심사 | 서초금융센터 |
| B-07 | E1130 | 박영업 | 여의도금융센터 |
| B-08 | E0873 | 최담당 | 종로금융센터 |

#### [확장] 추가 필요 마스터

| # | 마스터명 | 스키마 | 용도 | 관련 RFP 요건 |
|---|---------|--------|------|--------------|
| B-09 | 심사역 마스터 | `{ id, name, grade, branchCode }` | 본부 심사 배정 | RFP S12~S14 |
| B-10 | 결재선 마스터 | `{ level, approverIds[], conditions }` | 전결 경로 지정 | RFP 전결권 S6/S14 |
| B-11 | 상품 마스터 | `{ code, name, category, requiredDocs[], rateRange }` | 상품별 필요 서류 | RFP "상품별 필요 서류 제언" |
| B-12 | 서류 유형 마스터 | `{ typeCode, typeName, issuer, verifyRequired, ocrTemplate }` | 서류 분류 기준 | RFP 서류 종류 확대 |
| B-13 | 발급기관 마스터 | `{ code, name, apiEndpoint, rpaAvailable }` | 진위검증 대상 확장 | RFP RPA 연계 |
| B-14 | 사고사례 DB | `{ caseId, type, keywords[], riskLevel }` | 보증서 특약 대조 | RFP "사고사례 대조" |

---

### C. 서류 데이터 (문서 목록/메타)

#### [현행] 서류 목록

| ID | 서류명 | 파일명 | 문서구분 | 정의 위치 |
|----|--------|--------|---------|----------|
| C-01 | 사업자등록증명원 | 사업자등록증명원.pdf | 필수 | P2 `pickerFiles`, P3~P11 |
| C-02 | 법인등기부등본 | 법인등기부등본.pdf | 필수 | P2 `pickerFiles`, P3~P11 |
| C-03 | 표준재무제표증명 | 표준재무제표증명.pdf | 필수 | P2 `pickerFiles`, P3~P11 |
| C-04 | 부가가치세 과세표준증명원 | 부가가치세 과세표준증명원.pdf | 필수 | P2 `pickerFiles`, P3~P11 |
| C-05 | 법인인감증명서 | 법인인감증명서.pdf | 기본 | P2 `pickerFiles`, P3~P11 |
| **C-06** | **부동산등기부등본** | **부동산등기부등본.pdf** | **담보** | P2 `pickerFiles`, P3~P11 |
| **C-07** | **건축물대장** | **건축물대장.pdf** | **담보** | P2 `pickerFiles`, P3~P11 |
| **C-08** | **사정의견서** | **사정의견서.pdf** | **담보** | P2 `pickerFiles`, P3~P11 |
| C-09 | 주주명부 | (미등록) | 조건부 | P2 테이블만 |

**서류별 처리 대상 룰 (`targetRules`)** — P8/P11 인라인

| 서류 | 전처리 | OCR | 진위검증 | 대사/검증 |
|------|--------|-----|---------|----------|
| 사업자등록증명원 | O | O | O | O |
| 법인등기부등본 | O | O | O | O |
| 표준재무제표증명 | O | O | X | X |
| 부가가치세 과세표준증명원 | X | O | X | X |
| 법인인감증명서 | X | O | O | X |
| **부동산등기부등본** | **O** | **O** | **O (대법원)** | **O (담보정보 교차검증)** |
| **건축물대장** | **O** | **O** | **O (국토부)** | **O (담보정보 교차검증)** |
| **사정의견서** | **X** | **O** | **X** | **O (담보정보 교차검증)** |

#### [확장] RFP 서류 종류 전체 수용

RFP에 명시된 서류 목록 중 현행 미포함 서류:

| ID | 서류명 | 발급기관 | 진위검증 | RFP 업무 |
|----|--------|---------|---------|---------|
| C-07 | 소득금액증명원 | 국세청 | O | 소득 관련 입력 지원 |
| C-08 | 자금목적서류(매매계약서 등) | - | X | 전결권 유의사항 안내 |
| C-09 | 부동산 신고필증 | 시/군/구 | O | 담보평가 작성 지원 |
| C-10 | 외화지급보증서 | 보증기관 | O | 보증서 특약 분석 |
| C-11 | 주민등록등초본 | 행정안전부 | O | KYC 교차검증 |
| C-12 | 매입매출처별 세금계산서 합계표 | 국세청 | O | 재무 분석 |
| C-13 | 종합소득세 과세표준확정신고서 | 국세청 | O | 소득 분석 |
| C-14 | 부동산임대공급가액 명세서 | 국세청 | X | 부동산 수익 분석 |
| C-15 | 착공신고서 | 시/군/구 | O | 시설자금 목적 검증 |
| C-16 | 재무제표확인원 | 세무사/회계법인 | X | 재무 교차검증 |
| C-17 | 약정서 | 은행 | X(자체) | 인감/서명 검증 |
| C-18 | 주주명부 | 기업 자체 | X | 공유주주 검증 |
| C-19 | 감정평가서 | 감정기관 | O | 담보 사정가액 |
| C-20 | 등기부등본(부동산) | 대법원 | O | 담보 권리관계 |

#### [확장] 서류 메타 스키마

```
Document {
  id: string                  // "C-01" ~ "C-20"
  name: string                // 서류 한글명
  fileName: string | null     // 업로드 파일명
  docCategory: enum           // 필수|선택|추가|약정
  issuer: string | null       // 발급기관
  uploadedAt: datetime | null
  uploadStatus: enum          // 미등록|등록완료
  targets: {
    preprocess: boolean
    ocr: boolean
    verify: boolean
    reconcile: boolean
    collateral: boolean       // [확장] 담보 검증 대상 여부
    approval: boolean         // [확장] 전결권 검증 대상 여부
    signature: boolean        // [확장] 인감/서명 검증 대상 여부
  }
  processingStatus: {         // 단계별 처리 상태
    plan: enum                // ok|na
    preprocess: enum          // ok|na|run|error
    verify: enum              // ok|na|run|error
    ocr: enum                 // ok|warn|na|run|error
    reconcile: enum           // ok|na|before|run|error
    collateral: enum          // [확장]
    approval: enum            // [확장]
    signature: enum           // [확장]
  }
}
```

---

### D. 처리 룰 데이터

#### [현행] Agent 처리 단계 룰

| 룰 카테고리 | 적용 대상 문서 | 정의 위치 |
|------------|-------------|----------|
| 전처리 대상 (`preprocess`) | C-01, C-02, C-03, **C-06, C-07** | P3 fillTargetDocs, P8/P11 `targetRules` |
| OCR 대상 (`ocr`) | C-01~C-05, **C-06, C-07, C-08** 전체 | P8/P11 `targetRules` |
| 진위검증 대상 (`verify`) | C-01, C-02, C-05, **C-06, C-07** | P5 테이블, P8/P11 `targetRules` |
| 대사/검증 대상 (`reconcile`) | C-01, C-02, **C-06, C-07, C-08** (담보정보 교차검증) | P9 테이블, P8/P11 `targetRules` |

#### [현행] 전처리 세부 작업 룰 (`preprocessTaskRules`)

| 작업 | 대상 문서 |
|------|----------|
| 기울기 보정 (`tilt`) | C-01, C-02 |
| 노이즈 제거 (`noise`) | C-01, C-03 |
| 명암/대비 보정 (`contrast`) | C-03, C-02 |
| 페이지 정렬 (`align`) | C-01, C-02, C-03 |

#### [확장] 추가 처리 룰 카테고리

| 룰 카테고리 | 설명 | 적용 조건 | 관련 RFP |
|------------|------|----------|---------|
| 담보 검증 대상 (`collateral`) | 담보 관련 서류 좌표 하이라이트 검증 | 담보유형이 부동산인 경우 | S10 |
| 전결권 검증 대상 (`approval`) | 특약/리스크 문구 기반 전결 레벨 판단 | 자금목적서류, 보증서 | S6 |
| 인감/서명 검증 대상 (`signature`) | 약정서 인감/서명 누락 감지 | 약정서, 인감증명서 | RFP 세부 요건 |
| 주주구조 검증 대상 (`shareholding`) | 주주명부 OCR → CI101 자동입력 | 주주명부 등록 시 | S11 |
| QA 참조 대상 (`qaReference`) | Agent QA 응답 시 근거 문서 | 모든 서류 | RFP 대화형 Agent |

---

### E. 전처리 결과 데이터

#### [현행]

| 필드 | 타입 | 값 범위 | 설명 |
|------|------|--------|------|
| tilt(기울기 보정) | enum | ok \| na | P8/P11 `preprocessTaskRules` 기반 |
| noise(노이즈 제거) | enum | ok \| na | 동일 |
| contrast(명암/대비) | enum | ok \| na | 동일 |
| align(페이지 정렬) | enum | ok \| na | 동일 |

#### [확장] 전처리 품질 메트릭

| 필드 | 타입 | 용도 |
|------|------|------|
| originalQuality | number(0~100) | 원본 이미지 품질 점수 |
| processedQuality | number(0~100) | 전처리 후 품질 점수 |
| deskewAngle | number | 기울기 보정 각도 |
| noiseLevel | enum(low\|mid\|high) | 잔존 노이즈 수준 |
| pageCount | number | 총 페이지 수 |
| processingTimeMs | number | 전처리 소요 시간 |

---

### F. 진위검증 결과 데이터

#### [현행] 3문서 × 3단계

| 문서 ID | 문서명 | 발급기관 | API 호출 | 파싱 | 진위 확인 |
|---------|--------|---------|---------|------|----------|
| C-01 | 사업자등록증명원 | 국세청(홈택스) | done | done | done |
| C-02 | 법인등기부등본 | 대법원 인터넷등기소 | done | done | done |
| C-05 | 법인인감증명서 | 국세청(홈택스) | done | done | done |
| **C-06** | **부동산등기부등본** | **대법원 인터넷등기소** | **done** | **done** | **done** |
| **C-07** | **건축물대장** | **국토부(세움터)** | **done** | **done** | **done** |

#### [현행] 발급기관 매핑 (`issuerByDoc`)

| 문서 | 발급기관 | 정의 위치 |
|------|---------|----------|
| 사업자등록증명원 | 국세청 | P5 HTML, P8/P11 issuerByDoc |
| 법인등기부등본 | 대법원 등기소 | 동일 |
| 표준재무제표증명 | - (미대상) | 동일 |
| 부가가치세 과세표준증명원 | - (미대상) | 동일 |
| 법인인감증명서 | 국세청 | 동일 |
| **부동산등기부등본** | **대법원 등기소** | P5 HTML, P8/P11 issuerByDoc |
| **건축물대장** | **국토부(세움터)** | P5 HTML, P8/P11 issuerByDoc |
| **사정의견서** | **- (미대상)** | 자체 감정서류 |

#### [확장] 진위검증 결과 스키마

```
VerifyResult {
  docId: string
  issuer: { code, name, apiEndpoint }
  rpaSessionId: string            // RPA 세션 추적
  stages: {
    apiCall:   { status, startedAt, completedAt, responseCode }
    parsing:   { status, startedAt, completedAt, parsedFields: number }
    comparing: { status, result: "일치"|"불일치"|"미확인", mismatchFields?: string[] }
  }
  overallResult: "정상"|"비정상"|"미확인"|"보류"
  holdReason?: string             // 보류 사유
  retryCount: number              // [확장] 재시도 횟수
}
```

---

### G. OCR 추출 결과 데이터

#### [현행] ocrDocMock 전체 필드 목록

**G-1. 사업자등록증명원 (C-01)**

| # | 필드명 (essentials) | 추출값 (extracts) | 신뢰도 | 근거 ID |
|---|-------------------|-----------------|--------|---------|
| 1 | 사업자등록번호 | 123-45-67890 | 0.99 | E-BIZ-001 |
| 2 | 상호(법인명) | (주)000바이오 | 0.98 | E-BIZ-002 |
| 3 | 대표자 성명 | 홍길동 | 0.97 | E-BIZ-003 |
| 4 | 사업장 주소 | 서울특별시 영등포구 여의대로 24 | 0.95 | E-BIZ-004 |
| 5 | 사업자 상태 | 계속사업자 | 0.96 | E-BIZ-005 |
| 6 | 업태 | 도매 및 소매업 | 0.93 | E-BIZ-006 |
| 7 | 종목 | 의료기기 도소매 | 0.94 | E-BIZ-007 |

**G-2. 법인등기부등본 (C-02)** — HITL 핵심 문서

| # | 필드명 | 원본값 (essentials) | 추출값 (extracts) | 신뢰도 | 근거 ID | 비고 |
|---|--------|------------------|-----------------|--------|---------|------|
| 1 | 법인명 | (주)000바이오 | (주)000바이오 | 0.98 | E-REG-001 | |
| 2 | 법인등록번호 | 110111-1234567 | 110111-1234567 | 0.99 | E-REG-002 | |
| 3 | 본점주소 | 서울특별시 영등포구 여의대로 24 | 서울특별시 영등포구 여의대로 24 | 0.94 | E-REG-003 | |
| 4 | 회사 설립일 | 2016-04-01 | 2016-04-01 | 0.92 | E-REG-004 | |
| 5 | **자본금** | **1,600,000,000원** | **1,000,000,000원** | **0.91** | E-REG-005 | **OCR 오인식 → HITL 수정 대상** |
| 6 | 발행주식 총 수 | 200,000주 | 200,000주 | 0.93 | E-REG-006 | |
| 7 | 대표이사 | 홍길동 | 홍길동 | 0.96 | E-REG-007 | |

P11에서는 자본금 extracts가 `["자본금", "1,600,000,000원", "입력", "E-REG-005"]`로 보정된 상태.

**G-3. 표준재무제표증명 (C-03)**

| # | 필드명 | 값 | 신뢰도 | 근거 ID |
|---|--------|-----|--------|---------|
| 1 | 총자산 | 6,820,000,000원 | 0.97 | E-FIN-001 |
| 2 | 총부채 | 2,100,000,000원 | 0.97 | E-FIN-002 |
| 3 | 자본총계 | 4,720,000,000원 | 0.96 | E-FIN-003 |
| 4 | 매출액 | 4,820,000,000원 | 0.95 | E-FIN-004 |
| 5 | 매출원가 | 3,190,000,000원 | 0.93 | E-FIN-005 |
| 6 | 영업이익 | 540,000,000원 | 0.94 | E-FIN-006 |
| 7 | 당기순이익 | 410,000,000원 | 0.92 | E-FIN-007 |

> **이슈**: essentials에 "영억이익" 오타 존재 (수정 필요)

**G-4. 부가가치세 과세표준증명원 (C-04)**

| # | 필드명 | 값 | 신뢰도 | 근거 ID |
|---|--------|-----|--------|---------|
| 1 | 상호 | (주)000바이오 | 0.96 | E-VAT-001 |
| 2 | 과세기간 | 2025년 제2기 | 0.95 | E-VAT-002 |
| 3 | 과세표준금액 | 1,920,000,000원 | 0.94 | E-VAT-003 |
| 4 | 매출세액 | 192,000,000원 | 0.93 | E-VAT-004 |
| 5 | 납부세액 | 162,000,000원 | 0.92 | E-VAT-005 |
| 6 | 신고유형 | 정기신고 | 0.97 | E-VAT-006 |
| 7 | 신고상태 | 신고완료 | 0.98 | E-VAT-007 |

**G-5. 법인인감증명서 (C-05)**

| # | 필드명 | 값 | 신뢰도 | 근거 ID |
|---|--------|-----|--------|---------|
| 1 | 법인명 | (주)000바이오 | 0.98 | E-SEAL-001 |
| 2 | 법인등록번호 | 110111-1234567 | 0.99 | E-SEAL-002 |
| 3 | 대표자 | 홍길동 | 0.96 | E-SEAL-003 |
| 4 | 증명서번호 | IC-2026-0311-000245 | 0.95 | E-SEAL-004 |
| 5 | 발급횟수 | 2회 | 0.93 | E-SEAL-005 |
| 6 | 본점주소 | 서울특별시 영등포구 여의대로 24 | 0.94 | E-SEAL-006 |

**G-6. 부동산등기부등본 (C-06)** — 담보 서류

| # | 필드명 | 값 | 신뢰도 | 근거 ID |
|---|--------|-----|--------|---------|
| 1 | 소재지 | 서울 중구 세종대로 00 | 0.97 | E-ESTATE-001 |
| 2 | 토지면적 | 1,320㎡ | 0.96 | E-ESTATE-002 |
| 3 | 지목 | 대 | 0.98 | E-ESTATE-003 |
| 4 | 소유자 | (주)000바이오 | 0.97 | E-ESTATE-004 |
| 5 | 소유권이전일 | 2020-06-15 | 0.95 | E-ESTATE-005 |
| 6 | 근저당 설정액 | 0원 (미설정) | 0.93 | E-ESTATE-006 |
| 7 | 등기일자 | 2026-02-28 | 0.96 | E-ESTATE-007 |

**G-7. 건축물대장 (C-07)** — 담보 서류

| # | 필드명 | 값 | 신뢰도 | 근거 ID |
|---|--------|-----|--------|---------|
| 1 | 대지위치 | 서울 중구 세종대로 00 | 0.96 | E-BLDG-001 |
| 2 | 건물면적 | 2,640㎡ | 0.95 | E-BLDG-002 |
| 3 | 주용도 | 업무시설 | 0.97 | E-BLDG-003 |
| 4 | 구조 | 철근콘크리트 | 0.94 | E-BLDG-004 |
| 5 | 사용승인일 | 2018-03-20 | 0.93 | E-BLDG-005 |
| 6 | 건축물 소유자 | (주)000바이오 | 0.92 | E-BLDG-006 |

**G-8. 사정의견서 (C-08)** — 담보 서류

| # | 필드명 | 값 | 신뢰도 | 근거 ID |
|---|--------|-----|--------|---------|
| 1 | 추정가액 | 4,800,000,000원 | 0.98 | E-APPR-001 |
| 2 | 감정일 | 2026-02-25 | 0.96 | E-APPR-002 |
| 3 | 감정기관 | 한국감정원 | 0.97 | E-APPR-003 |
| 4 | 토지 단가 | 2,424,242원/㎡ | 0.94 | E-APPR-004 |
| 5 | 건물 단가 | 909,091원/㎡ | 0.95 | E-APPR-005 |

#### [확장] OCR 추출 스키마

```
OcrResult {
  docId: string
  title: string
  issueDate: string
  essentials: [key: string, value: string][]
  extracts: ExtractField[]
  editHistory: EditRecord[]          // [확장] 수정 이력
  reconcileMapping: ReconcileMap[]   // [확장] 대사 매핑 결과
}

ExtractField {
  fieldName: string
  value: string
  confidence: number | "입력"
  evidenceId: string
  boundingBox?: { x, y, w, h, page }  // [확장] 좌표 하이라이트
  sourceType: "ocr" | "manual" | "api" // [확장] 값 출처
}

EditRecord {
  fieldName: string
  beforeValue: string
  afterValue: string
  reason: string
  editedBy: string                     // [확장] 수정자
  editedAt: datetime                   // [확장] 수정 시각
  confidence: number | null            // 수정 전 신뢰도
}
```

---

### H. 대사/검증 결과 데이터

#### [현행] P9 검증 단계

| 단계 | stage key | 완료 라벨 | 설명 |
|------|-----------|----------|------|
| 입력값 대사 | `input` | "일치" | 신청정보 입력값 vs OCR 추출값 |
| 문서간 대사 | `crossdoc` | "일치" | 문서 A의 값 vs 문서 B의 동일 필드 |
| 필수값 누락 검증 | `required` | "정상" | 필수 추출 필드 존재 여부 |
| 타입 검증 | `type` | "정상" | 숫자/날짜/문자 형식 적합성 |
| 유효값 검증 | `valid` | "정상" | 값 범위/패턴 적합성 |
| KYC 교차검증 | `kyc` | "정상" | 내부 KYC 데이터와 교차 확인 |
| **담보정보 교차검증** | `collateral` | **"정상"** | **부동산등기부등본·건축물대장·사정의견서 간 소재지·면적·추정가액 교차 대사 + LTV(62.5%) 산출 검증** |
| 최종 판정 | `final` | "정상" | 종합 판정 |

대상 문서: 사업자등록증명원, 법인등기부등본 (기본 대사 2건) + 부동산등기부등본, 건축물대장, 사정의견서 (담보정보 교차검증 3건)

#### [확장] 추가 검증 단계

| 단계 | stage key | 설명 | 관련 RFP |
|------|-----------|------|---------|
| ~~담보가액 대사~~ | ~~`collateralValue`~~ | **[현행 반영]** 담보정보 교차검증(`collateral`) 단계로 구현 | ~~S10~~ |
| 전결권 상향 판단 | `approvalEscalation` | 특약/리스크 문구 기반 | S6 전결권 |
| 인감/서명 대조 | `signatureVerify` | 인감증명서 vs 약정서 날인 | RFP 약정서 검증 |
| 지분율 검증 | `shareholdingCheck` | 주주명부 지분합계 100% 확인 | S11 주주명부 |
| 공유차주 점검 | `sharedBorrower` | 주주명부 vs KYC 교차 | RFP 공유차주 누락방지 |
| 보증서 특약 분석 | `guaranteeClause` | 특약 vs 사고사례 DB | RFP 보증서 유의사항 |

#### [확장] 대사 결과 스키마

```
ReconcileResult {
  docId: string
  stage: string
  status: "pass" | "fail" | "warning" | "skip"
  details: {
    fieldName: string
    sourceValue: string
    targetValue: string
    match: boolean
    mismatchType?: "값불일치" | "누락" | "형식오류" | "범위초과"
  }[]
  actionRequired: boolean           // HITL 필요 여부
  actionType?: "수정" | "보완요청" | "심사역협의" | "반송"
}
```

---

### I. HITL 수정 이력 데이터

#### [현행] 단일 시나리오

| 필드 | 값 |
|------|-----|
| 대상 문서 | 법인등기부등본.pdf (C-02) |
| 대상 필드 | 자본금 |
| OCR 추출값 | 1,000,000,000원 |
| 수정 후 값 | 1,600,000,000원 |
| 변경 사유 | OCR 오인식(스캔 품질) |
| 근거 ID | E-REG-005 |
| 수정자 | (미기록) |
| 수정 시각 | (미기록) |

#### [확장] 감사 추적 완전 이력

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| editId | string | O | 고유 수정 이력 ID |
| docId | string | O | 대상 문서 ID |
| fieldName | string | O | 수정 필드명 |
| beforeValue | string | O | 수정 전 값 |
| afterValue | string | O | 수정 후 값 |
| beforeConfidence | number \| null | O | 수정 전 신뢰도 |
| reason | string | O | 변경 사유 |
| reasonCode | enum | O | 사유 코드 (OCR오인식/서류오류/입력오류/기타) |
| editedBy | string | O | 수정자 사번 |
| editedAt | datetime | O | 수정 시각 |
| approvedBy | string | - | [확장] 승인자 (2단계 확인 시) |
| approvedAt | datetime | - | [확장] 승인 시각 |

---

### J. 알림 메시지 데이터

#### [현행] 2건

| ID | 화면 | 유형 | 뱃지 | 메시지 |
|----|------|------|------|--------|
| J-01 | P7 | 오류 | 빨간 `오류` | 법인등기부등본 신뢰도평가 검토필요 1건 발생. 값 확인 및 수정이 필요합니다. |
| J-02 | P10 | 완료 | 파란 `완료` | [신청번호 : CC411-2026-000123] 제출서류 AI검토가 완료되었습니다. 결과를 확인 해주세요. |

#### [확장] 알림 유형 체계

| 유형 코드 | 라벨 | 뱃지 색상 | 예시 메시지 |
|----------|------|----------|-----------|
| `error` | 오류 | 빨간 | OCR 신뢰도 미달, 진위검증 실패 |
| `warning` | 주의 | 주황 | 전결권 상향 필요, 담보가액 불일치 |
| `info` | 안내 | 파란 | 처리 완료, 결과 확인 요청 |
| `action` | 조치필요 | 보라 | 누락 서류 보완 요청, 반송 건 재처리 |
| `qa` | QA응답 | 녹색 | [확장] Agent QA 응답 도착 |

#### [확장] 알림 스키마

```
Notification {
  id: string
  type: "error" | "warning" | "info" | "action" | "qa"
  title: string
  message: string
  applicationId: string         // 신청번호 참조
  docId?: string                // 관련 문서
  fieldName?: string            // 관련 필드
  actionUrl?: string            // 브릿지 열기 URL
  createdAt: datetime
  readAt?: datetime
  resolvedAt?: datetime         // [확장] 조치 완료 시각
}
```

---

### K. 자동입력 결과 데이터

#### [현행] P12 — 25필드

| # | 라벨 | 값 | 출처 |
|---|------|-----|------|
| 1 | 차주명(법인) | (주)000바이오 | P1 입력 (A-01) |
| 2 | 신청번호 | CC411-2026-000123 | P1 입력 (A-02) |
| 3 | 영업점 코드 | 411 | P1 조회 (A-12) |
| 4 | 담당자 | 김담당 | P1 조회 (A-13) |
| 5 | 신청일자 | 2026-03-05 | P1 입력 (A-03) |
| 6 | 대출상품 | 기업부동산담보대출 | P1 입력 (A-04) |
| 7 | 신청금액 | 3,000,000,000원 | P1 입력 (A-05) |
| 8 | 만기일 | 2027-12-31 | P1 입력 (A-06) |
| 9 | 상환방식 | 원리금균등 | P1 선택 (A-08) |
| 10 | 취급구분 | 신규 | P1 선택 (A-09) |
| 11 | 자금용도 | 공장부지 매입 | P1 입력 (A-07) |
| 12 | 담보유형 | 부동산담보 | P1 선택 (A-10) |
| 13 | 신청채널 | 영업점 | P1 선택 (A-11) |
| 14 | 사업자등록번호 | 123-45-67890 | OCR (G-1 #1) |
| 15 | 법인등록번호 | 110111-1234567 | OCR (G-2 #2) |
| 16 | 대표자 | 홍길동 | OCR (G-2 #7) |
| 17 | 본점주소 | 서울특별시 영등포구 여의대로 24 | OCR (G-2 #3) |
| 18 | 자본금 | 1,600,000,000원 | OCR→HITL 보정 (G-2 #5) |
| 19 | 매출액 | 4,820,000,000원 | OCR (G-3 #4) |
| **20** | **담보소재지** | **서울 중구 세종대로 00** | OCR (G-6 #1) / 브릿지 수신 |
| **21** | **토지면적** | **1,320㎡** | OCR (G-6 #2) / 브릿지 수신 |
| **22** | **건물면적** | **2,640㎡** | OCR (G-7 #2) / 브릿지 수신 |
| **23** | **추정가액** | **4,800,000,000원** | OCR (G-8 #1) / 브릿지 수신 |
| **24** | **LTV** | **62.5%** | Agent 산출 (A-18) / 브릿지 수신 |
| **25** | **전결 레벨** | **본부 전결** | Agent 판정 (A-19) / 브릿지 수신 |

#### [확장] 추가 자동입력 필드

| # | 라벨 | 출처 | 관련 RFP |
|---|------|------|---------|
| 20 | 영업이익 | OCR (G-3 #6) | 재무 입력 지원 |
| 21 | 당기순이익 | OCR (G-3 #7) | 재무 입력 지원 |
| 22 | 총자산 | OCR (G-3 #1) | 재무 입력 지원 |
| 23 | 총부채 | OCR (G-3 #2) | 재무 입력 지원 |
| 24 | 과세표준금액 | OCR (G-4 #3) | 매출 교차검증 |
| 25 | 전결 레벨 | 검증 결과 | RFP 전결권 |
| 26 | 심사 메모 | 수동 입력/자동 생성 | 설계 S12 원안 |
| 27 | 예외 항목 요약 | 검증 결과 집계 | 심사역 참고 |

---

### L. [확장] 대화형 QA 데이터

> RFP 「여신 특화 Agent」 핵심 요건. 현재 전혀 미구현.

```
QASession {
  sessionId: string
  applicationId: string
  messages: QAMessage[]
}

QAMessage {
  role: "user" | "agent"
  content: string
  timestamp: datetime
  references?: {                    // 근거 문서/필드 참조
    docId: string
    fieldName?: string
    evidenceId?: string
    pageNumber?: number
  }[]
  actionPlan?: {                    // Action Plan 제언
    type: "수정제언" | "보완요청" | "확인사항" | "위험안내"
    description: string
    priority: "높음" | "보통" | "낮음"
  }
}
```

**대화형 QA 데이터 소스 (RAG용)**:

| 데이터 | 형태 | 용도 |
|--------|------|------|
| 내외 규정 | 문서 | 여신 관련 규정 QA |
| 시행문/공문 | 문서 | 최신 정책 반영 |
| 업무매뉴얼 | 문서 | 업무 절차 안내 |
| 여신문의 이력 | 비정형 | 유사 문의 답변 |
| KPI 데이터 | 정형 | 성과 관련 조회 |

---

### M. [확장] 전결권 데이터

> RFP S6 요건. 현재 미구현.

```
ApprovalDecision {
  applicationId: string
  triggerDocId?: string             // 상향 근거 문서
  triggerClause?: string            // 상향 근거 문구
  currentLevel: "영업점" | "본부" | "상향"
  recommendedLevel: "영업점" | "본부" | "상향"
  escalationRequired: boolean
  escalationReason?: string
  approvalRoute: {
    step: number
    approverId: string
    approverName: string
    status: "대기" | "승인" | "반려"
  }[]
}
```

---

### N. [확장] 반송/피드백 데이터

> RFP S15 요건. 현재 미구현.

```
ReturnRecord {
  returnId: string
  applicationId: string
  returnedBy: string                // 반송자 (심사역)
  returnedAt: datetime
  reason: {
    code: "서류미비" | "불일치" | "진위미확인" | "전결근거부족" | "기타"
    description: string
    relatedDocIds: string[]
    relatedFields: string[]
  }
  requiredActions: string[]         // 보완 필요 항목
  deadline?: datetime               // 보완 기한
  resubmittedAt?: datetime          // 재제출 시각
  resubmitCount: number             // 재제출 횟수
  resolved: boolean
}
```

---

## 3. 데이터 중복 현황 및 정합성 이슈

### 3.1 중복 매트릭스

| 데이터 | P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9 | P10 | P11 | P12 |
|--------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:---:|:---:|:---:|
| 차주명 | ● | ● | | | | | | ○ | | | ○ | ● |
| 신청번호 | ● | ● | | | | | | | | ● | | ● |
| 문서 8건 목록 | | ● | ● | ● | ● | ● | | ● | ● | | ● | |
| docStatusByStep | | | | | | | | ● | | | ● | |
| ocrDocMock | | | | | | | | ● | | | ●* | |
| targetRules | | | | | | | | ● | | | ● | |
| issuerByDoc | | | | | ● | | | ● | | | ● | |

● = 직접 정의, ○ = 간접 참조(extracts 내 값), * = 자본금만 다름

### 3.2 식별된 정합성 이슈

| # | 이슈 | 위치 | 영향 |
|---|------|------|------|
| 1 | 표준재무제표 essentials에 "영억이익" 오타 | P8/P11 ocrDocMock | 시연 시 가시적 |
| 2 | P6 법인인감증명서 핵심 추출 필드가 "소득종류, 소득금액" (무관 필드) | P6 thead | 데이터 신뢰도 |
| 3 | P8 ocrDocMock 자본금 = 1,000,000,000 / P11 = 1,600,000,000 (의도적이나 단일 소스 아님) | P8/P11 | 유지보수 |
| 4 | P7/P10 배경 고객정보 "홍길동"은 차주 대표자와 동명이지만 맥락이 다름 (개인 고객 화면) | P7/P10 | 혼동 가능 |

### 3.3 중앙화 권장 구조

```
data/
├── scenario.json          ← A 카테고리 전체
├── masters/
│   ├── branches.json      ← B-01~04
│   ├── managers.json      ← B-05~08
│   ├── reviewers.json     ← [확장] B-09
│   ├── products.json      ← [확장] B-11
│   └── docTypes.json      ← [확장] B-12
├── documents/
│   ├── docList.json       ← C 카테고리 전체
│   ├── targetRules.json   ← D 카테고리
│   └── issuerMap.json     ← F 발급기관 매핑
├── ocr/
│   ├── biz-cert.json      ← G-1
│   ├── corp-reg.json      ← G-2
│   ├── financial.json     ← G-3
│   ├── vat-cert.json      ← G-4
│   ├── seal-cert.json     ← G-5
│   ├── estate-reg.json    ← G-6 부동산등기부등본
│   ├── building-reg.json  ← G-7 건축물대장
│   └── appraisal.json     ← G-8 사정의견서
├── verification/
│   ├── statusMatrix.json  ← docStatusByStep
│   └── reconcileConfig.json ← H 검증 단계 설정
├── notifications/
│   └── templates.json     ← J 알림 템플릿
└── qa/                    ← [확장] L 카테고리
    └── ragSources.json
```

---

## 4. Evidence ID 체계

### 4.1 현행 체계

| 접두사 | 문서 | 번호 범위 | 예시 |
|--------|------|----------|------|
| E-BIZ | 사업자등록증명원 | 001~007 | E-BIZ-001 |
| E-REG | 법인등기부등본 | 001~007 | E-REG-005 |
| E-FIN | 표준재무제표증명 | 001~007 | E-FIN-003 |
| E-VAT | 부가가치세 과세표준증명원 | 001~007 | E-VAT-001 |
| E-SEAL | 법인인감증명서 | 001~006 | E-SEAL-004 |
| **E-ESTATE** | **부동산등기부등본** | **001~007** | **E-ESTATE-001** |
| **E-BLDG** | **건축물대장** | **001~006** | **E-BLDG-001** |
| **E-APPR** | **사정의견서** | **001~005** | **E-APPR-001** |

### 4.2 [확장] 범용 Evidence ID 규칙

```
E-{DOC_TYPE}-{PAGE}-{FIELD_SEQ}

DOC_TYPE: 문서 유형 코드 (3~5자, 대문자)
PAGE:     페이지 번호 (2자리, 단일 페이지 문서는 "00")
FIELD_SEQ: 필드 순번 (3자리)

예시:
  E-BIZ-00-001    사업자등록증명원 1페이지 1번 필드
  E-INCOME-00-003 소득금액증명원 1페이지 3번 필드
  E-ESTATE-02-005 부동산등기부 2페이지 5번 필드
```

---

## 5. 신뢰도 등급 체계

### 5.1 현행

| 등급 | 범위 | CSS | 동작 |
|------|------|-----|------|
| high | ≥ 96% | `.conf.high` (녹색) | 자동 승인 가능 |
| mid | 92~95% | `.conf.mid` (파란) | 주의 표시 |
| low | ≤ 91% | `.conf.low` (빨간) | **검토필요** 트리거 |

### 5.2 [확장] 세분화 등급

| 등급 | 범위 | 동작 | 비고 |
|------|------|------|------|
| verified | 100% (수동 입력) | 확정 | HITL 수정 후 |
| high | ≥ 96% | 자동 승인 후보 | |
| mid | 92~95% | 담당자 확인 권고 | |
| low | 80~91% | **검토필요** 트리거 | 현행 91% 기준을 80%로 확대 |
| critical | < 80% | **자동 보류**, HITL 필수 | [확장] |
| failed | 추출 실패 | 수동 입력 필요 | [확장] |
