# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## React Native 파일/코드 설계 아키텍처 가이드

이 프로젝트는 기능 중심(Feature-first) + 계층 분리를 기본 원칙으로 한다.

### 1) 핵심 원칙

- 화면 UI, 비즈니스 로직, 데이터 접근을 분리한다.
- 재사용은 공통 컴포넌트로, 도메인 로직은 feature 내부로 캡슐화한다.
- 상태는 가까운 곳에서 관리하는 것을 우선하고, 전역 상태는 최소화한다.
- API/네이티브 연동은 화면 컴포넌트에서 직접 호출하지 않는다.
- 테스트 가능한 단위(순수 함수, 훅, 서비스)로 분리한다.

### 2) 권장 폴더 구조 (Feature-first)

```text
src/
  app/                  # 라우팅, 앱 엔트리, providers
  shared/               # 전역 공통 요소
    ui/                 # Button, Input, Modal 등
    theme/              # color, spacing, typography
    utils/              # 포맷, 파서, 헬퍼
    types/              # 공통 타입
    constants/          # 상수
  features/
    home/
      components/       # 홈 전용 UI 조각
      hooks/            # 홈 전용 상태/로직
      services/         # 홈 관련 API 호출
      model/            # 타입, mapper, schema
      screens/          # HomeScreen
      index.ts
    quote/
      components/
      hooks/
      services/
      model/
      screens/
      index.ts
```

### 3) 레이어 역할

- screens: 화면 조합과 라우팅 이벤트만 담당
- components: 프레젠테이션(UI) 중심, 부작용 최소화
- hooks: 화면/기능 단위 상태 및 액션
- services: API/스토리지/권한 등 I/O
- model: 도메인 타입, DTO 변환, 유효성 규칙
- shared: 여러 feature에서 공통으로 쓰는 자원

### 4) 상태 관리 기준

- 1개 화면 내부 상태: useState, useReducer
- feature 범위 공유 상태: feature 전용 hook/context
- 앱 전역 상태(인증, 사용자, 설정): 전역 스토어
- 서버 데이터: 요청/로딩/에러/성공 상태를 일관되게 관리

### 5) 컴포넌트 설계 규칙

- Container/Presenter 패턴 권장
- Container는 데이터 조회, 액션 연결 담당
- Presenter는 props 기반 렌더링만 수행
- props는 명시적 타입 사용, any 금지
- 파일이 과도하게 커지면 하위 컴포넌트로 분리

### 6) 네이밍/파일 규칙

- Screen: HomeScreen.tsx
- Component: QuoteCard.tsx
- Hook: useQuoteForm.ts
- Service: quoteService.ts
- Type/Model: quote.types.ts, quote.mapper.ts
- Barrel export는 feature 경계에서 제한적으로 사용

### 7) 품질 기준

- 비즈니스 로직은 테스트 가능한 함수/훅으로 분리
- UI 변경과 로직 변경이 한 파일에 과도하게 섞이지 않게 유지
- PR 단위는 한 기능 흐름 기준으로 작게 유지
- 린트/포맷/타입체크 통과를 머지 기준으로 삼는다


## API 연동 규칙
1) Feature-first 구조 준수
- `src/features/{feature}/model`
- `src/features/{feature}/services`
- `src/features/{feature}/hooks`(필요 시)

2) 타입/모델 분리
- API DTO 타입과 UI 모델 타입을 분리
- 파일 예시:
- `{domain}.dto.ts` (req/res DTO)
- `{domain}.types.ts` (UI model)
- `{domain}.mapper.ts` (DTO -> UI model 변환)

3) Raw 응답 직접 사용 금지
- 화면/훅에서 API raw JSON 직접 접근하지 말 것
- 서비스에서 DTO 수신 -> mapper 변환 -> UI model만 반환

4) Service 계층 강제
- 화면 컴포넌트에서 fetch/axios 직접 호출 금지
- `features/*/services/*Service.ts` 통해서만 API 호출

5) 상태 관리 원칙
- 서버 상태는 React Query 사용 (query/mutation)
- 전역 클라이언트 상태와 서버 상태 혼합 금지

6) 4가지 UI 상태 필수
- `loading / error / empty / success` 모두 처리

7) 에러 처리 표준화
- 공통 에러 파서 사용
- 사용자 메시지와 디버깅용 정보 분리

8) 타입 안정성
- `any` 금지
- null/optional 필드 안전 처리

9) 결과 보고 형식
- 생성/수정 파일 목록
- 각 파일 역할 요약
- 호출 흐름(화면 -> hook -> service -> mapper) 설명
- 남은 TODO(있다면) 명시

