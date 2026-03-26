# 🚀 Vercel 배포 가이드

**프로젝트:** MADI DBMS  
**Repository:** https://github.com/yeonhj0507/madi-dbms  
**상태:** ✅ 배포 준비 완료

---

## 📝 배포 방법 (현중아, 직접 해야 해!)

### ⭐ 추천: Vercel Dashboard (가장 쉬움!)

#### 1단계: Vercel 접속
https://vercel.com/new

#### 2단계: GitHub 연동
1. "Import Git Repository" 클릭
2. GitHub 로그인 (또는 이미 로그인됨)
3. **Repository 선택:** `yeonhj0507/madi-dbms`
4. "Import" 클릭

#### 3단계: 프로젝트 설정
```
Project Name: madi-dbms (자동)
Framework: Next.js (자동 감지)
Root Directory: ./ (기본값)
Build Command: npm run build (자동)
Output Directory: .next (자동)
Install Command: npm install (자동)
```

→ 모두 **기본값 그대로** 사용! ✅

#### 4단계: 환경변수 설정 ⚠️ 중요!
"Environment Variables" 섹션에서:

```
Key: NOTION_TOKEN
Value: (아래 명령어로 확인)
Environment: Production (선택)
```

**토큰 확인 명령어:**
```bash
cd ~/.openclaw/workspace/madi-dbms
cat .env.local | grep NOTION_TOKEN
```

복사 & 붙여넣기!

#### 5단계: 배포!
"Deploy" 버튼 클릭 → 자동 배포 시작!

**배포 시간:** 약 2-3분

---

## 📊 배포 후 확인

### 1. 배포 URL
```
https://madi-dbms.vercel.app
또는
https://madi-dbms-<random>.vercel.app
```

Vercel이 자동으로 URL 제공!

### 2. 기능 테스트 체크리스트
- [ ] 홈페이지 접속
- [ ] 로그인 (admin/madi123)
- [ ] 대시보드 로드
- [ ] 학생 목록 조회
- [ ] 시험 목록 조회
- [ ] 관리자 페이지 (/admin)

### 3. 환경 확인
Vercel Dashboard → 프로젝트 → Settings → Environment Variables
→ `NOTION_TOKEN` 있는지 확인

---

## ⚠️ 문제 해결

### 빌드 실패
**증상:** "Build Error" 표시

**해결:**
1. Vercel Dashboard → Deployments → 실패한 배포 클릭
2. "View Build Logs" 확인
3. 에러 메시지 복사 → Discord에 붙여넣기

### Notion 연결 실패
**증상:** 학생/시험 목록이 비어있음

**해결:**
1. 환경변수 확인: Settings → Environment Variables
2. `NOTION_TOKEN` 값 확인
3. 재배포: Deployments → 최신 → "Redeploy"

### 로그인 안 됨
**증상:** "로그인 실패" 메시지

**해결:**
1. 브라우저 쿠키 삭제
2. 시크릿 모드로 테스트
3. 계정: admin / madi123

---

## 🔐 배포 후 즉시 할 일

### 1. 비밀번호 변경 (필수!)
```
1. 관리자 페이지 접속: /admin
2. Users → admin 계정
3. 비밀번호 변경 (madi123 → 강력한 비밀번호)
4. teacher, staff도 변경
```

**⚠️ 중요:** 기본 비밀번호 그대로 두면 위험!

### 2. 추가 사용자 생성 (선택)
관리자 페이지에서:
- "사용자 추가" 버튼
- 필요한 강사/알바 계정 생성

---

## 🎯 Cron Jobs (선택)

### Hobby 플랜 (무료)
❌ Cron 작동 안 함!

**대안:**
- 수동 실행: `/teacher/archive`
- GitHub Actions (무료)
- 외부 Cron 서비스

### Pro 플랜 ($20/월)
✅ Cron 자동 작동!

**자동 실행:**
- 매월 1일 00:00 → 아카이빙
- 매일 00:00 → 클리닉 자동 등록

**업그레이드 방법:**
Vercel Dashboard → Settings → Billing → Upgrade to Pro

---

## 📱 도메인 설정 (선택)

### 커스텀 도메인 연결
```
예: madi.example.com

1. Vercel Dashboard → 프로젝트 → Settings → Domains
2. "Add" 클릭
3. 도메인 입력
4. DNS 설정 (Vercel 안내 따르기)
```

### 무료 도메인
Vercel 자동 제공:
- `https://madi-dbms.vercel.app`

충분히 사용 가능! 🎉

---

## 🔄 재배포 (업데이트 시)

### 자동 배포 (권장)
```bash
# 로컬에서 코드 수정 후
git add -A
git commit -m "Update feature"
git push

# Vercel이 자동으로 재배포!
```

### 수동 재배포
Vercel Dashboard → Deployments → Redeploy

---

## 📊 모니터링

### Vercel Analytics (Pro)
- 페이지 방문 통계
- 성능 모니터링
- 사용자 경로 분석

### 로그 확인
Vercel Dashboard → 프로젝트 → Logs
- 실시간 로그
- 에러 추적

---

## ✅ 배포 완료 체크리스트

배포 후 확인:
- [ ] 배포 URL 접속
- [ ] 로그인 성공
- [ ] 학생 목록 로드
- [ ] 시험 등록 테스트
- [ ] 관리자 페이지 접근
- [ ] **비밀번호 변경!**
- [ ] URL 저장/공유

---

## 🎉 배포 성공!

**배포 URL:**
```
https://madi-dbms.vercel.app
(Vercel이 제공한 URL)
```

**기본 계정:**
```
admin / madi123
teacher / madi123
staff / madi123
```

**⚠️ 배포 후 즉시 비밀번호 변경!**

---

## 💬 문제 발생 시

Discord에 다음 정보 공유:
1. 에러 메시지
2. 배포 URL
3. Vercel Build Logs (스크린샷)

내가 도와줄게! 🤖

---

**작성:** 2026-03-26 12:00 KST  
**작성자:** yeonBot 🤖  
**상태:** 배포 대기 중 ⏳
