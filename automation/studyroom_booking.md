# 스터디룸 자동 예약 시스템

## 개요

매주 정해진 시간에 스터디룸을 자동으로 예약하는 시스템

## 필요한 정보

1. **예약 사이트 URL**
   - 예: `https://library.example.com/booking`

2. **로그인 정보**
   - ID/PW 또는 토큰

3. **예약 설정**
   - 요일: 매주 월요일
   - 시간: 14:00-16:00
   - 스터디룸: A룸

4. **예약 오픈 시간**
   - 예: 1주일 전 오전 9시

## 구현 방법

### Option 1: Browser 자동화

```python
# automation/studyroom.py
from browser import Browser
import datetime

def book_studyroom():
    browser = Browser()
    
    # 1주일 후 날짜 계산
    target_date = datetime.date.today() + datetime.timedelta(days=7)
    
    # 로그인
    browser.open("https://library.example.com")
    browser.act(kind="fill", ref="username", text="your_id")
    browser.act(kind="fill", ref="password", text="your_pw")
    browser.act(kind="click", ref="login")
    
    # 예약 페이지
    browser.act(kind="click", ref="booking")
    
    # 날짜 선택
    browser.act(kind="click", ref=f"date-{target_date}")
    
    # 시간 선택
    browser.act(kind="click", ref="time-14:00")
    
    # 스터디룸 선택
    browser.act(kind="click", ref="room-A")
    
    # 예약 완료
    browser.act(kind="click", ref="confirm")
    
    print(f"✅ {target_date} 14:00 스터디룸A 예약 완료!")

if __name__ == "__main__":
    book_studyroom()
```

### Option 2: Vercel Cron

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/studyroom-booking",
      "schedule": "0 9 * * 1"  // 매주 월요일 9시
    }
  ]
}
```

```typescript
// app/api/cron/studyroom-booking/route.ts
export async function GET(req: Request) {
  // Cron secret 확인
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // 예약 실행
  const result = await bookStudyroom();
  
  return Response.json({ success: true, result });
}
```

### Option 3: GitHub Actions (무료)

```yaml
# .github/workflows/studyroom-booking.yml
name: 스터디룸 자동 예약

on:
  schedule:
    - cron: '0 0 * * 1'  # 매주 월요일 9시 (UTC)

jobs:
  book:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - run: pip install playwright
      - run: python automation/studyroom.py
        env:
          BOOKING_ID: ${{ secrets.BOOKING_ID }}
          BOOKING_PW: ${{ secrets.BOOKING_PW }}
```

## Discord 알림

```python
import requests

def notify_discord(message):
    webhook_url = "YOUR_DISCORD_WEBHOOK"
    requests.post(webhook_url, json={"content": message})

# 예약 후 알림
notify_discord(f"✅ {date} 스터디룸 예약 완료!")
```

## 트러블슈팅

### 로그인 실패
- 쿠키/세션 만료
- Captcha 있음

### 예약 실패
- 이미 예약됨
- 시간이 지남
- 시스템 점검

### 대응 방안
- 재시도 로직
- 대체 시간 자동 선택
- 실패 시 Discord 알림

## 실행

```bash
# 수동 실행
python automation/studyroom.py

# Cron 등록 (Linux)
crontab -e
0 9 * * 1 cd ~/madi-dbms && python automation/studyroom.py
```

## 주의사항

1. **이용약관 확인**
   - 자동 예약 금지 여부 확인
   
2. **Rate Limiting**
   - 너무 빠른 요청 자제
   
3. **보안**
   - 비밀번호 환경변수 사용
   - GitHub에 올리지 말 것

4. **백업 계획**
   - 자동 예약 실패 시 수동 예약 준비
