# Shop BackOffice (shop-bo)

Vue 3 + Nuxt 3 + Spring Boot로 구축된 상점 관리 백오피스 시스템입니다.

## 🚀 주요 기능

### 📊 대시보드
- 실시간 통계 (사용자, 주문, 상품, 매출)
- 게시판 통계 (공지사항, 게시글 현황)
- 최근 활동 모니터링
- 빠른 액션 메뉴

### 📝 게시판 관리
- **일반 게시글 관리**
    - 게시글 CRUD (생성, 조회, 수정, 삭제)
    - 다중 파일 업로드/다운로드
    - 댓글 시스템
    - 검색 및 필터링
    - 페이지네이션

- **공지사항 관리**
    - 공지사항 CRUD
    - 중요 공지사항 고정 기능
    - 활성/비활성 상태 관리
    - 만료일 설정 및 자동 비활성화
    - 사용자 알림 발송 옵션

### 🛠 관리 기능
- 사용자 관리
- 주문 관리
- 상품 관리
- 분석 및 리포트
- 시스템 설정

## 🛠 기술 스택

### Frontend
- **Vue 3** - 프론트엔드 프레임워크
- **Nuxt 3** - Vue.js 메타 프레임워크
- **Pinia** - 상태 관리
- **Tailwind CSS** - CSS 프레임워크
- **TypeScript** - 타입 안전성

### Backend Integration
- **Spring Boot 3** - 백엔드 API 서버
- **MariaDB** - 데이터베이스
- **RESTful API** - API 통신

## 📁 프로젝트 구조

```
shop-bo/
├── assets/
│   └── css/
│       └── main.css                 # Tailwind CSS 및 커스텀 스타일
├── components/
│   ├── Icon.vue                     # 아이콘 컴포넌트
│   ├── Pagination.vue               # 페이지네이션 컴포넌트
│   ├── PostModal.vue                # 게시글 작성/수정 모달
│   ├── DeleteConfirmModal.vue       # 삭제 확인 모달
│   ├── Badge.vue                    # 배지 컴포넌트
│   └── ToastContainer.vue           # 토스트 알림 컨테이너
├── composables/
│   ├── useApi.js                    # API 호출 유틸리티
│   └── useToast.js                  # 토스트 알림 시스템
├── layouts/
│   └── default.vue                  # 기본 레이아웃 (사이드바, 헤더)
├── pages/
│   ├── index.vue                    # 대시보드
│   └── boards/
│       ├── index.vue                # 게시판 관리 메인
│       └── posts/
│           └── [id].vue             # 게시글 상세 페이지
├── plugins/
│   └── api.client.js                # API 클라이언트 플러그인
├── stores/
│   ├── main.js                      # 메인 스토어 (대시보드, 사용자)
│   └── boards.js                    # 게시판 스토어 (게시글, 댓글, 파일)
├── nuxt.config.ts                   # Nuxt 설정
├── tailwind.config.js               # Tailwind CSS 설정
└── package.json                     # 의존성 관리
```

## 🚀 시작하기

### 필수 요구사항
- **Node.js 18+**
- **npm 또는 yarn**
- **Spring Boot 백엔드 서버** (posts API 서버)

### 설치 및 실행

1. **프로젝트 클론**
   ```bash
   git clone <repository-url>
   cd shop-bo
   ```

2. **의존성 설치**
   ```bash
   npm install
   # 또는
   yarn install
   ```

3. **환경 설정**

   `.env` 파일 생성:
   ```env
   # API 서버 설정
   API_BASE_URL=http://localhost:8081/api
   API_TIMEOUT=10000
   
   # 기타 설정
   NUXT_PUBLIC_SITE_NAME=Shop BackOffice
   ```

4. **백엔드 서버 실행**

   먼저 Spring Boot posts API 서버를 실행해야 합니다:
   ```bash
   cd ../posts-backend
   ./gradlew bootRun
   ```

5. **프론트엔드 개발 서버 실행**
   ```bash
   npm run dev
   # 또는
   yarn dev
   ```

6. **브라우저에서 확인**
   ```
   http://localhost:3000
   ```

## ⚙️ 설정

### API 연동 설정

`nuxt.config.ts`에서 API 프록시 설정:
```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8081/api',
      apiTimeout: process.env.API_TIMEOUT || 10000,
    }
  },
  
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:8081/api',
        changeOrigin: true,
        prependPath: true,
      }
    }
  }
})
```

### Tailwind CSS 커스터마이징

`tailwind.config.js`에서 색상 및 스타일 커스터마이징:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
          // ...
        }
      }
    }
  }
}
```

## 📖 사용법

### 게시판 관리

1. **게시글 작성**
    - 사이드바 → 게시판 관리
    - "새 게시글 작성" 버튼 클릭
    - 제목, 내용, 작성자 입력
    - 파일 첨부 (선택사항)
    - 작성 완료

2. **공지사항 작성**
    - "공지사항 작성" 버튼 클릭
    - 공지사항 전용 옵션 설정:
        - 중요 공지사항 (상단 고정)
        - 활성 상태
        - 만료일 설정
        - 알림 발송 여부

3. **게시글 관리**
    - 목록에서 게시글 선택
    - 상세 보기, 수정, 삭제 가능
    - 공지사항의 경우 상태 토글 가능
    - 댓글 및 파일 관리

### API 사용 예시

**게시글 조회:**
```javascript
// stores/boards.js
const api = useApi()

// 게시글 목록 조회
const posts = await api.posts.getAll({ page: 0, size: 10 })

// 게시글 상세 조회
const post = await api.posts.getById(1)

// 공지사항 조회
const notices = await api.notices.getActive()
```

**파일 업로드:**
```javascript
// 파일 업로드
const files = [file1, file2] // File 객체들
const result = await api.files.uploadToPost(postId, files)
```

### 상태 관리

**게시판 스토어 사용:**
```vue
<script setup>
const boardsStore = useBoardsStore()

// 게시글 목록 조회
await boardsStore.fetchPosts()

// 게시글 생성
await boardsStore.createPost({
  title: '제목',
  content: '내용',
  author: '작성자'
})

// 반응형 데이터 사용
const posts = computed(() => boardsStore.posts)
const loading = computed(() => boardsStore.loading)
</script>
```

### 토스트 알림 사용

```vue
<script setup>
const toast = useGlobalToast()

// 성공 알림
toast.success('저장되었습니다.')

// 에러 알림
toast.error('오류가 발생했습니다.')

// API 에러 처리
try {
  await someApiCall()
} catch (error) {
  toast.handleApiError(error)
}
</script>
```

## 🔧 개발 가이드

### 새로운 페이지 추가

1. `pages/` 폴더에 Vue 컴포넌트 생성
2. 필요한 경우 스토어 생성 또는 업데이트
3. 레이아웃의 네비게이션 메뉴에 링크 추가

### 새로운 API 엔드포인트 추가

1. `composables/useApi.js`에 API 메서드 추가:
```javascript
export const useApi = () => {
  return {
    // 기존 메서드들...
    
    newFeature: {
      getAll: (params = {}) => apiCall('/new-feature', {
        method: 'GET',
        query: params
      }),
      create: (data) => apiCall('/new-feature', {
        method: 'POST',
        body: data
      })
    }
  }
}
```

2. 스토어에서 사용:
```javascript
const api = useApi()
const items = await api.newFeature.getAll()
```

### 컴포넌트 개발 가이드

- **Icon 컴포넌트**: 새 아이콘 추가 시 `components/Icon.vue`의 validator와 path 추가
- **Modal 컴포넌트**: 공통 모달 패턴 따라 개발
- **Form 컴포넌트**: Tailwind CSS 클래스 활용 (`.form-input`, `.form-select` 등)

## 🚨 문제 해결

### 일반적인 문제들

1. **API 연결 실패**
   ```bash
   # 백엔드 서버 상태 확인
   curl http://localhost:8081/api/posts
   
   # 프록시 설정 확인
   # nuxt.config.ts의 nitro.devProxy 설정 점검
   ```

2. **CORS 에러**
   ```bash
   # Spring Boot 서버의 CORS 설정 확인
   # WebConfig.java의 addCorsMappings 메서드 점검
   ```

3. **스타일 적용 안됨**
   ```bash
   # Tailwind CSS 빌드 확인
   npm run build-css
   
   # main.css import 확인
   # nuxt.config.ts의 css 배열 확인
   ```

4. **상태 관리 이슈**
   ```bash
   # 브라우저 개발자 도구에서 Pinia devtools 확인
   # 스토어 상태 및 액션 호출 로그 점검
   ```

### 디버깅 팁

- **API 호출 디버깅**: 브라우저 Network 탭에서 요청/응답 확인
- **상태 관리 디버깅**: Vue DevTools의 Pinia 탭 활용
- **스타일 디버깅**: 브라우저 개발자 도구의 Elements 탭에서 CSS 클래스 확인
- **콘솔 로그**: `console.log`를 활용한 데이터 흐름 추적

## 🏗 빌드 및 배포

### 개발 빌드
```bash
npm run build
npm run preview
```

### 운영 배포
```bash
# 정적 생성
npm run generate

# 서버 빌드
npm run build
```

### Docker 배포 (예시)
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 지원

프로젝트 관련 문의사항이나 버그 리포트는 GitHub Issues를 통해 등록해 주세요.

---

**Built with ❤️ using Vue 3, Nuxt 3, and Spring Boot**