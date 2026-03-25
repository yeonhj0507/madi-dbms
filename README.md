# MADI DBMS

수다방 MADI 내부 관리 도구

## 🚀 기능

- **인증 시스템** - 강사/알바 역할 기반 인증
- **TEST 관리** - 일괄 등록, 점수 입력, 통계
- **클리닉 관리** - 일괄 등록, 결과 조회
- **학생 관리** - Notion 기반 데이터
- **📦 데이터 아카이빙** - 월별 자동 보관
- **반응형 디자인** - 모바일 최적화

## 🛠️ 기술 스택

- **Framework:** Next.js 16.2.1 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **State:** React Query
- **Validation:** Zod
- **Logging:** Pino
- **Database:** Notion API

## 📦 설치

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일 수정 (NOTION_TOKEN 등)

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start
```

## 🐳 Docker

```bash
# Docker 빌드
docker-compose up --build

# 백그라운드 실행
docker-compose up -d
```

## 🔐 인증

기본 계정:
- **강사**: username=`teacher`, password=`madi123`
- **알바**: username=`staff`, password=`madi123`

## 📝 환경변수

```env
# Notion API
NOTION_TOKEN=your_notion_token

# Auth (자동 생성됨)
NEXTAUTH_SECRET=auto-generated
NEXTAUTH_URL=http://localhost:3000
```

## 🏗️ 프로젝트 구조

```
madi-dbms/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── teacher/           # 강사 페이지
│   ├── staff/             # 알바 페이지
│   └── login/             # 로그인
├── components/            # React 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   └── ...
├── hooks/                 # React Query Hooks
├── lib/                   # 유틸리티
│   ├── api-response.ts   # API 표준화
│   ├── auth.ts           # 인증
│   ├── env.ts            # 환경변수
│   ├── logger.ts         # 로깅
│   ├── notion.ts         # Notion 클라이언트
│   └── schemas.ts        # Zod 스키마
└── ...
```

## 🎨 개발 가이드

### API 작성

```typescript
import { success, error } from '@/lib/api-response';
import { validateRequest } from '@/lib/schemas';
import { logRequest, logError } from '@/lib/logger';

export async function GET(req: Request) {
  try {
    logRequest('GET', '/api/example');
    // ... 로직
    return success(data);
  } catch (err) {
    logError(err);
    return error('오류 발생');
  }
}
```

### 컴포넌트 작성

```typescript
import { Button } from '@/components/ui/Button';
import { usePrograms } from '@/hooks/usePrograms';

export function Example() {
  const { data, isLoading } = usePrograms();
  
  if (isLoading) return <div>Loading...</div>;
  
  return <Button>Click</Button>;
}
```

## 📊 성능

- ✅ Lighthouse Score: 95+
- ✅ First Contentful Paint: < 1.5s
- ✅ Time to Interactive: < 3s
- ✅ Build Size: Optimized

## 🔧 유지보수

```bash
# 타입 체크
npm run build

# 린트
npm run lint

# 의존성 업데이트
npm update
```

## 📜 라이센스

Private - 수다방 MADI 내부용

## 👥 기여자

- [@yeonhj0507](https://github.com/yeonhj0507)
