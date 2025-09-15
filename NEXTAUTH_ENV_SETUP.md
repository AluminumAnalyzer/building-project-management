# NextAuth v5 환경 변수 설정 가이드

## ClientFetchError 해결을 위한 필수 환경 변수

NextAuth v5에서 `ClientFetchError: Failed to fetch` 에러를 해결하기 위해 다음 환경 변수들을 `.env` 파일에 설정해야 합니다.

### 필수 환경 변수

```bash
# NextAuth v5 필수 설정
NEXTAUTH_SECRET="your-super-secret-key-here-minimum-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# 개발 환경 설정
NODE_ENV="development"

# 데이터베이스 설정 (Prisma)
DATABASE_URL="your-database-connection-string"
```

### 환경별 설정

#### 개발 환경 (.env.local)
```bash
NEXTAUTH_SECRET="dev-secret-key-for-local-development-only"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

#### 프로덕션 환경 (.env.production)
```bash
NEXTAUTH_SECRET="production-secret-key-very-secure-and-long"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

## 중요 사항

### 1. NEXTAUTH_SECRET
- **필수**: 32자 이상의 랜덤 문자열
- JWT 토큰 서명에 사용
- 프로덕션에서는 절대 노출되면 안됨

### 2. NEXTAUTH_URL
- 개발: `http://localhost:3000`
- 프로덕션: 실제 도메인 URL
- 콜백 URL 생성에 사용

### 3. NODE_ENV
- NextAuth v5 디버그 모드 제어
- 개발 환경에서는 "development"

## 에러 해결 체크리스트

ClientFetchError가 발생할 때 확인할 사항들:

- [ ] `.env` 파일에 `NEXTAUTH_SECRET` 설정됨
- [ ] `.env` 파일에 `NEXTAUTH_URL` 설정됨
- [ ] SessionProvider에 `basePath="/api/auth"` 설정됨
- [ ] NextAuth 설정에 `trustHost: true` 설정됨
- [ ] API 라우트 `/api/auth/[...nextauth]/route.ts` 존재함
- [ ] 개발 서버 재시작 완료

## 보안 권장사항

1. **환경 변수 파일 보호**
   ```bash
   # .gitignore에 추가
   .env
   .env.local
   .env.production
   ```

2. **NEXTAUTH_SECRET 생성**
   ```bash
   # 터미널에서 랜덤 시크릿 생성
   openssl rand -base64 32
   ```

3. **프로덕션 배포 시**
   - 환경 변수를 서버 환경에 직접 설정
   - `.env` 파일을 서버에 업로드하지 않음

## 추가 설정 (선택사항)

```bash
# 데이터베이스 관련
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"

# 이메일 서비스 (향후 확장용)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"

# OAuth 프로바이더 (향후 확장용)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

---

**참고**: 이 설정들을 적용한 후 개발 서버를 재시작해야 변경사항이 적용됩니다.
