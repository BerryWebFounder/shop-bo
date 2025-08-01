// API 호출 헬퍼 함수
export const useApi = () => {
    const { $api } = useNuxtApp()

    const apiCall = async (endpoint, options = {}) => {
        try {
            if (options.method && options.method !== 'GET') {
                return await $api[options.method.toLowerCase()](endpoint, options.body, {
                    query: options.query,
                    headers: options.headers
                })
            } else {
                return await $api.get(endpoint, {
                    query: options.query,
                    headers: options.headers
                })
            }
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error)
            throw error
        }
    }

    return {
        // 게시글 API
        posts: {
            // 게시글 목록 조회 (일반 게시글)
            getAll: (params = {}) => apiCall('/posts', {
                method: 'GET',
                query: params
            }),

            // 전체 게시글 조회 (공지사항 + 일반 게시글)
            getAllWithNotices: (params = {}) => apiCall('/posts/all', {
                method: 'GET',
                query: params
            }),

            // 게시글 상세 조회
            getById: (id) => apiCall(`/posts/${id}`, {
                method: 'GET'
            }),

            // 게시글 생성
            create: (data) => apiCall('/posts', {
                method: 'POST',
                body: data
            }),

            // 게시글 수정
            update: (id, data) => apiCall(`/posts/${id}`, {
                method: 'PUT',
                body: data
            }),

            // 게시글 삭제
            delete: (id) => apiCall(`/posts/${id}`, {
                method: 'DELETE'
            }),

            // 게시글 검색
            search: (params = {}) => apiCall('/posts/search', {
                method: 'GET',
                query: params
            }),

            // 파일이 첨부된 게시글 조회
            getWithFiles: (params = {}) => apiCall('/posts/with-files', {
                method: 'GET',
                query: params
            }),

            // 게시판 통계
            getStats: () => apiCall('/posts/stats', {
                method: 'GET'
            })
        },

        // 공지사항 API
        notices: {
            // 전체 공지사항 조회
            getAll: (params = {}) => apiCall('/notices', {
                method: 'GET',
                query: params
            }),

            // 활성 공지사항만 조회
            getActive: () => apiCall('/notices/active', {
                method: 'GET'
            }),

            // 공지사항 상세 조회
            getById: (id) => apiCall(`/notices/${id}`, {
                method: 'GET'
            }),

            // 공지사항 생성
            create: (data) => apiCall('/notices', {
                method: 'POST',
                body: data
            }),

            // 공지사항 수정
            update: (id, data) => apiCall(`/notices/${id}`, {
                method: 'PUT',
                body: data
            }),

            // 공지사항 삭제
            delete: (id) => apiCall(`/notices/${id}`, {
                method: 'DELETE'
            }),

            // 공지사항 상태 토글
            toggleStatus: (id) => apiCall(`/notices/${id}/toggle-status`, {
                method: 'PATCH'
            }),

            // 공지사항 검색
            search: (params = {}) => apiCall('/notices/search', {
                method: 'GET',
                query: params
            }),

            // 중요 공지사항 조회
            getPinned: () => apiCall('/notices/pinned', {
                method: 'GET'
            }),

            // 일반 공지사항 조회
            getRegular: () => apiCall('/notices/regular', {
                method: 'GET'
            }),

            // 만료 임박 공지사항
            getExpiringSoon: () => apiCall('/notices/expiring-soon', {
                method: 'GET'
            }),

            // 공지사항 통계
            getStats: () => apiCall('/notices/stats', {
                method: 'GET'
            })
        },

        // 댓글 API
        comments: {
            // 게시글의 댓글 조회
            getByPostId: (postId) => apiCall(`/comments/post/${postId}`, {
                method: 'GET'
            }),

            // 공지사항의 댓글 조회
            getByNoticeId: (noticeId) => apiCall(`/comments/notice/${noticeId}`, {
                method: 'GET'
            }),

            // 댓글 상세 조회
            getById: (id) => apiCall(`/comments/${id}`, {
                method: 'GET'
            }),

            // 댓글 생성
            create: (data) => apiCall('/comments', {
                method: 'POST',
                body: data
            }),

            // 댓글 수정
            update: (id, data) => apiCall(`/comments/${id}`, {
                method: 'PUT',
                body: data
            }),

            // 댓글 삭제
            delete: (id) => apiCall(`/comments/${id}`, {
                method: 'DELETE'
            }),

            // 작성자별 댓글 조회
            getByAuthor: (author, params = {}) => apiCall(`/comments/author/${author}`, {
                method: 'GET',
                query: params
            }),

            // 댓글 검색
            search: (params = {}) => apiCall('/comments/search', {
                method: 'GET',
                query: params
            })
        },

        // 파일 API
        files: {
            // 게시글의 파일 목록 조회
            getByPostId: (postId) => apiCall(`/files/post/${postId}`, {
                method: 'GET'
            }),

            // 공지사항의 파일 목록 조회
            getByNoticeId: (noticeId) => apiCall(`/files/notice/${noticeId}`, {
                method: 'GET'
            }),

            // 파일 업로드 (게시글)
            uploadToPost: async (postId, files) => {
                const { $api } = useNuxtApp()
                const formData = new FormData()
                for (const file of files) {
                    formData.append('files', file)
                }

                return await $api.upload(`/files/upload/${postId}`, formData)
            },

            // 파일 업로드 (공지사항)
            uploadToNotice: async (noticeId, files) => {
                const { $api } = useNuxtApp()
                const formData = new FormData()
                for (const file of files) {
                    formData.append('files', file)
                }

                return await $api.upload(`/files/upload/notice/${noticeId}`, formData)
            },

            // 파일 다운로드
            download: (storedName) => {
                const config = useRuntimeConfig()
                return `${config.public.apiBaseUrl}/files/download/${storedName}`
            },

            // 파일 삭제
            delete: (id) => apiCall(`/files/${id}`, {
                method: 'DELETE'
            }),

            // 파일 정보 조회
            getById: (id) => apiCall(`/files/${id}`, {
                method: 'GET'
            }),

            // 이미지 파일 목록
            getImages: () => apiCall('/files/images', {
                method: 'GET'
            })
        }
    }
}

// 타입 정의 (TypeScript 스타일의 JSDoc)
/**
 * @typedef {Object} Post
 * @property {number} id
 * @property {string} title
 * @property {string} content
 * @property {string} author
 * @property {boolean} isNotice
 * @property {boolean} isPinned
 * @property {boolean} isActive
 * @property {number} viewCount
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} expiryDate
 * @property {boolean} sendNotification
 */

/**
 * @typedef {Object} Comment
 * @property {number} id
 * @property {string} content
 * @property {string} author
 * @property {string} createdAt
 * @property {number} postId
 */

/**
 * @typedef {Object} PostFile
 * @property {number} id
 * @property {string} originalName
 * @property {string} storedName
 * @property {string} filePath
 * @property {number} fileSize
 * @property {string} contentType
 * @property {string} createdAt
 * @property {number} postId
 */

/**
 * @typedef {Object} PageResponse
 * @property {Array} content
 * @property {number} totalElements
 * @property {number} totalPages
 * @property {number} size
 * @property {number} number
 * @property {boolean} first
 * @property {boolean} last
 */