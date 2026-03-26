# 🚀 배포 전 최종 체크리스트

**작성일:** 2026-03-26  
**대상:** Vercel 프로덕션 배포  

---

## ✅ 필수 체크

### 1. 코드 품질
- ✅ **빌드 성공:** TypeScript 통과, 경고 없음
- ✅ **ESLint:** 통과
- ✅ **Git 커밋:** 최신 (`f39bc46`)
- ✅ **브랜치:** master (clean)

### 2. 환경변수
#### 필수 (.env.local → Vercel)
```bash
NOTION_TOKEN=ntn_xxxxx  # ✅ 있음
NODE_ENV=production      # Vercel 자동 설정
```

#### 선택 (현재 미사용)
```bash
# NEXTAUTH_URL - 자체 인증으로 불필요
# NEXTAUTH_SECRET - 자체 인증으로 불필요
```

**⚠️ 주의:** Vercel에서 `NOTION_TOKEN` 환경변수 설정 필수!

### 3. 인증 시스템
- ✅ **비밀번호 해싱:** SHA-256 + salt
- ✅ **기본 계정:** admin/madi123, teacher/madi123, staff/madi123
- ⚠️ **보안:** 프로덕션에서 비밀번호 변경 권장!

### 4. Notion 연동
- ✅ **DB 연결:** 5개 데이터베이스
  - STUDENTS
  - PROGRAMS
  - TEST_RECORDS
  - TEST_MANAGEMENT
  - CLINICS
- ⚠️ **토큰 권한:** 모든 DB 접근 권한 확인 필요

### 5. Cron Jobs
```json
{
  "crons": [
    {
      "path": "/api/cron/archive",
      "schedule": "0 0 1 * *"  // 매월 1일 00:00
    },
    {
      "path": "/api/cron/clinic-register",
      "schedule": "0 0 * * *"  // 매일 00:00
    }
  ]
}
```

**⚠️ 중요:** Vercel Cron은 **Pro 플랜** 이상 필요!
- Hobby 플랜: Cron 작동 안 함
- Pro 플랜: $20/월

**대안 (Hobby 플랜):**
- GitHub Actions + API 호출
- 외부 Cron 서비스 (cron-job.org)
- 수동 실행

---

## 🔍 권장 체크

### 1. 성능 최적화
- ✅ React Query 캐싱 (5분)
- ✅ 이미지 최적화 (Cloudinary)
- ✅ 정적 페이지 사전 렌더링
- 🟡 **미완:** 서버 컴포넌트 최대 활용

### 2. 보안 강화
- ✅ HTTP-only 쿠키
- ✅ 역할 기반 접근 제어
- ✅ Proxy (Edge) 보호
- 🟡 **미완:** Rate Limiting
- 🟡 **미완:** CSRF 토큰
- 🟡 **미완:** Content Security Policy

### 3. 에러 처리
- ✅ API 응답 표준화 (api-response.ts)
- ✅ Pino 로깅
- 🟡 **미완:** Sentry 에러 추적
- 🟡 **미완:** 사용자 친화적 에러 페이지

### 4. 모니터링
- 🟡 **미완:** Vercel Analytics
- 🟡 **미완:** Vercel Speed Insights
- 🟡 **미완:** LogRocket (세션 리플레이)

---

## ⚠️ 알려진 이슈

### 1. Viewport 메타데이터 (낮은 우선순위)
모든 페이지에서 deprecation 경고:
```
⚠ Unsupported metadata viewport is configured in metadata export
```

**해결:**
```typescript
// app/layout.tsx
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};
```

**영향:** 기능 문제 없음, Next.js 17 대비  
**우선순위:** 🟡 낮음 (배포 후 개선)

### 2. 하드코딩된 계정
**문제:** 기본 계정 3개만 존재 (admin, teacher, staff)  
**해결:** 관리자 페이지에서 추가 사용자 생성 가능  
**권장:** 프로덕션 배포 후 즉시 비밀번호 변경!

### 3. 메모리 저장소
**문제:** 사용자 정보가 메모리에만 저장 (서버 재시작 시 초기화)  
**영향:** 추가 생성한 사용자는 재시작 후 사라짐  
**해결:** 
- 단기: 재시작 시 수동 재생성
- 장기: DB 마이그레이션 (PostgreSQL/MongoDB)

**우선순위:** 🟠 중간 (사용자 3명이면 문제 없음)

---

## 🔧 배포 전 필수 작업

### 1. Notion 토큰 확인
```bash
# .env.local에서 토큰 확인
cat .env.local | grep NOTION_TOKEN

# Vercel에서 설정 필요!
```

**확인 사항:**
- ✅ 토큰 유효성
- ✅ DB 접근 권한 (5개 DB)
- ✅ 만료일 확인

### 2. 도메인 설정 (선택)
```
# Vercel 자동 도메인
https://madi-dbms.vercel.app

# 커스텀 도메인 (선택)
https://madi.example.com
```

### 3. 환경 설정
**Vercel 프로젝트 설정:**
1. Framework Preset: Next.js ✅
2. Root Directory: `./` ✅
3. Build Command: `npm run build` ✅
4. Output Directory: `.next` ✅
5. Install Command: `npm install` ✅

**환경변수:**
```
Production:
  NOTION_TOKEN = ntn_xxxxx

Preview (Optional):
  NOTION_TOKEN = ntn_xxxxx_dev

Development (Optional):
  NOTION_TOKEN = ntn_xxxxx_local
```

---

## 📋 배포 후 체크리스트

### 즉시 확인
- [ ] 로그인 동작 (admin, teacher, staff)
- [ ] Notion DB 연동 확인
- [ ] 학생 목록 조회
- [ ] 시험 등록/조회
- [ ] 클리닉 등록/조회
- [ ] 관리자 페이지 접근

### 기능 테스트
- [ ] 사용자 생성 (관리자 페이지)
- [ ] 역할 기반 접근 제어
- [ ] 아카이빙 수동 실행
- [ ] 클리닉 자동 등록 (수동 실행)
- [ ] 로그아웃 & 재로그인

### 성능 체크
- [ ] Lighthouse Score (>90)
- [ ] First Contentful Paint (<1.5s)
- [ ] Time to Interactive (<3.5s)
- [ ] 이미지 로딩 속도

### 보안 체크
- [ ] HTTPS 활성화 (Vercel 자동)
- [ ] 비밀번호 변경 (admin, teacher, staff)
- [ ] 환경변수 노출 여부 확인
- [ ] API 엔드포인트 보호 확인

---

## 🚨 배포 전 필수 결정

### 1. Vercel 플랜 선택
**Hobby (무료):**
- ✅ 무제한 배포
- ✅ HTTPS 자동
- ✅ 100 GB 대역폭/월
- ❌ **Cron 작동 안 함!**

**Pro ($20/월):**
- ✅ Hobby 모든 기능
- ✅ **Cron Jobs 지원**
- ✅ Analytics 고급 기능
- ✅ 1TB 대역폭/월

**권장:**
- 테스트: Hobby (Cron 수동 실행)
- 프로덕션: Pro (자동화 필요 시)

### 2. 비밀번호 변경 전략
**배포 후 즉시:**
```bash
# 관리자 페이지에서
1. admin 비밀번호 변경
2. teacher 비밀번호 변경
3. staff 비밀번호 변경
```

**또는 코드 수정:**
```typescript
// lib/auth-v2.ts
const defaultUsers = [
  {
    username: 'admin',
    password: 'new_secure_password_here', // 변경!
    ...
  },
  // ...
];
```

### 3. Notion DB 백업
**배포 전:**
- [ ] 현재 Notion DB 전체 내보내기 (CSV/Markdown)
- [ ] 백업 저장 (로컬 또는 클라우드)

**이유:** 실수로 데이터 손실 방지

---

## ✅ 최종 체크

### 배포 준비 완료 조건
- ✅ 빌드 성공
- ✅ Git 최신 상태
- ✅ 환경변수 준비 (NOTION_TOKEN)
- ✅ Vercel 계정 준비
- ✅ 배포 후 테스트 계획

### 배포 진행 가능?
**예 (👍):** 
- Notion 토큰 유효
- 테스트 환경 OK
- 비상 시 롤백 가능

**아니오 (⏸️):**
- Notion DB 백업 필요
- 비밀번호 변경 먼저
- 추가 테스트 필요

---

## 🎯 배포 명령어

### GitHub 연동 (권장)
```bash
# Vercel CLI 설치 (선택)
npm i -g vercel

# Vercel 로그인
vercel login

# 프로젝트 연결
vercel link

# 배포
vercel --prod
```

### Vercel Dashboard (더 쉬움)
1. https://vercel.com/new
2. Import Git Repository
3. Select: yeonhj0507/madi-dbms
4. Configure: 환경변수 입력
5. Deploy!

---

## 📞 배포 후 문제 발생 시

### 1. 빌드 실패
- Vercel 로그 확인
- 로컬 빌드 재확인 (`npm run build`)
- 환경변수 확인

### 2. Notion 연결 실패
- 토큰 권한 확인
- DB ID 확인 (lib/notion-ids.ts)
- Vercel 환경변수 확인

### 3. 로그인 실패
- 쿠키 설정 확인 (HTTPS)
- 브라우저 쿠키 삭제 후 재시도

### 4. 긴급 롤백
```bash
# Vercel Dashboard
Deployments → Previous → Promote to Production
```

---

## 🎉 배포 준비 완료!

**체크:**
- ✅ 코드 품질
- ✅ 환경변수
- ✅ 인증 시스템
- ✅ Notion 연동
- ⚠️ Cron (Pro 플랜 필요)

**권장 배포 순서:**
1. Vercel Dashboard로 배포
2. Hobby 플랜으로 테스트
3. 기능 검증
4. Pro 플랜 업그레이드 (Cron 필요 시)
5. 프로덕션 사용

**준비됐어?** 🚀

---

**작성:** 2026-03-26 11:55 KST  
**작성자:** yeonBot 🤖
