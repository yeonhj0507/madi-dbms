# 🚀 MADI DBMS 배포 체크리스트

## ✅ 빌드 상태
- **빌드:** ✅ 성공 (Next.js 16.2.1)
- **TypeScript:** ✅ 통과
- **정적 페이지:** ✅ 32개 생성

## ⚠️ 발견된 문제

### 1. Metadata Viewport 경고 (낮은 우선순위)
**문제:** 모든 페이지에서 `viewport` 메타데이터가 deprecated 방식으로 설정됨

**영향:** 
- 기능적 문제 없음
- Next.js 16+ 권장사항 미준수

**해결:**
```typescript
// Before (app/layout.tsx)
export const metadata: Metadata = {
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};

// After
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  // ... other metadata
};
```

**우선순위:** 🟡 낮음 (배포 후 개선)

---

### 2. Middleware → Proxy 마이그레이션 (중간 우선순위)
**문제:** `middleware.ts` 파일 컨벤션이 deprecated

**영향:**
- 현재 동작함
- 향후 Next.js 버전에서 제거될 수 있음

**해결:**
```bash
# middleware.ts → proxy.ts 이름 변경
mv middleware.ts proxy.ts
```

**우선순위:** 🟠 중간 (배포 전 권장)

---

## 🔐 환경변수 체크

### 필수 환경변수
- [x] `NOTION_TOKEN` - Notion API 토큰
- [ ] `NEXTAUTH_SECRET` - 프로덕션 시 필요 (현재 자체 인증)

### Vercel 환경변수 설정
```bash
# Vercel 대시보드에서 설정
NOTION_TOKEN=secret_xxxxx
NODE_ENV=production
```

---

## 📦 배포 전 준비

### 1. 환경변수 검증
```typescript
// lib/env.ts - 이미 구현됨 ✅
- NOTION_TOKEN 필수
- 기본값 제공 (PORT, NODE_ENV)
```

### 2. Notion DB 연결 확인
```bash
# 로컬에서 테스트
npm run dev
# /api/notion/test 호출
```

### 3. Cron 작업 확인
```json
// vercel.json ✅
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

**주의:** Vercel Cron은 Pro 플랜 이상 필요!

---

## 🐛 잠재적 문제

### 1. 인증 시스템 (자체 구현)
**현재:** 하드코딩된 계정 (teacher/madi123, staff/madi123)
**문제:** 
- 비밀번호 변경 불가
- 다중 사용자 관리 어려움

**해결 (프로덕션):**
- Clerk / Auth0 도입
- 또는 JWT 기반 DB 인증

**우선순위:** 🔴 높음 (프로덕션 배포 시 필수)

---

### 2. 이미지 최적화
**현재:** Cloudinary 사용 (AVIF, WebP)
**문제:** 
- Cloudinary 무료 플랜 제한
- 대량 트래픽 시 과금 가능

**해결:**
- Vercel Image Optimization 검토
- 또는 Cloudinary 플랜 업그레이드

**우선순위:** 🟡 낮음 (사용량 모니터링)

---

### 3. Rate Limiting
**현재:** 없음
**문제:** API 남용 가능

**해결:**
```typescript
// middleware/rate-limit.ts 추가
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

**우선순위:** 🟠 중간 (공개 배포 시 권장)

---

## 📊 모니터링

### Vercel 기본 제공
- [x] Deployment logs
- [x] Function logs
- [x] Analytics (Pro)

### 추가 권장
- [ ] Sentry (에러 추적)
- [ ] LogRocket (사용자 세션 리플레이)
- [ ] Vercel Speed Insights

---

## 🚀 배포 단계

### 1. GitHub 연동 (이미 완료 ✅)
```bash
# Repository: https://github.com/yeonhj0507/madi-dbms
```

### 2. Vercel 프로젝트 생성
1. Vercel 대시보드 → "New Project"
2. GitHub repo 선택: `yeonhj0507/madi-dbms`
3. Framework: Next.js (자동 감지)
4. Root Directory: `./`
5. Build Command: `npm run build` (자동)
6. Output Directory: `.next` (자동)

### 3. 환경변수 설정
```
NOTION_TOKEN=secret_xxxxx
NODE_ENV=production
```

### 4. 배포!
- `main` 브랜치 push → 자동 배포
- PR → Preview 배포

---

## ✅ 배포 후 체크리스트

### 기능 테스트
- [ ] 로그인 (teacher/staff)
- [ ] 학생 목록 조회
- [ ] 시험 등록/조회
- [ ] 클리닉 등록/조회
- [ ] 아카이빙 (수동 실행)

### 성능 체크
- [ ] Lighthouse Score (>90)
- [ ] First Contentful Paint (<1.5s)
- [ ] Time to Interactive (<3.5s)

### 보안 체크
- [ ] HTTPS 활성화 (Vercel 자동)
- [ ] CSP 헤더 설정
- [ ] 환경변수 노출 여부

---

## 🔧 즉시 수정 필요

### 1. Middleware → Proxy 마이그레이션
```bash
cd ~/.openclaw/workspace/madi-dbms
git mv middleware.ts proxy.ts
git add proxy.ts
git commit -m "🔧 Migrate middleware to proxy (Next.js 16+)"
git push
```

### 2. Viewport 메타데이터 수정
```bash
# app/layout.tsx 수정 필요
```

---

## 🎯 권장 순서

1. ✅ **지금 바로:** Middleware → Proxy 마이그레이션
2. 🟡 **배포 전:** Viewport 메타데이터 수정
3. 🔴 **프로덕션:** 인증 시스템 개선
4. 🟠 **사용량 모니터링:** Rate Limiting 추가

---

## 📝 참고 링크

- [Next.js 16 Proxy 마이그레이션](https://nextjs.org/docs/messages/middleware-to-proxy)
- [Viewport 메타데이터](https://nextjs.org/docs/app/api-reference/functions/generate-viewport)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Vercel 환경변수](https://vercel.com/docs/projects/environment-variables)
