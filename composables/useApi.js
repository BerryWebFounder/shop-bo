// API 호출 헬퍼 함수
export const useApi = () => {
    const { $api, $uploadApi } = useNuxtApp()

    // 기본 API 호출 래퍼
    const apiCall = async (endpoint, options = {}) => {
        try {
            console.log(`[useApi] Calling: ${endpoint}`, options)

            const response = await $api(endpoint, {
                method: options.method || 'GET',
                body: options.body,
                query: options.query,
                headers: options.headers
            })

            console.log(`[useApi] Response:`, response)
            return response
        } catch (error) {
            console.error(`[useApi] Error for ${endpoint}:`, error)
            throw error
        }
    }

    // 파일 업로드 래퍼
    const uploadCall = async (endpoint, formData) => {
        try {
            console.log(`[useApi] Upload: ${endpoint}`)
            return await $uploadApi(endpoint, {
                method: 'POST',
                body: formData
            })
        } catch (error) {
            console.error(`[useApi] Upload error for ${endpoint}:`, error)
            throw error
        }
    }

    return {
        // ============ 게시글 API ============
        posts: {
            // 일반 게시글 목록 조회 (공지사항 제외)
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

            // 게시글 생성 (일반 게시글 또는 공지사항)
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

        // ============ 공지사항 API ============
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

        // ============ 댓글 API ============
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

        // ============ 파일 API ============
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
                const formData = new FormData()
                for (const file of files) {
                    formData.append('files', file)
                }
                return await uploadCall(`/files/upload/${postId}`, formData)
            },

            // 파일 업로드 (공지사항)
            uploadToNotice: async (noticeId, files) => {
                const formData = new FormData()
                for (const file of files) {
                    formData.append('files', file)
                }
                return await uploadCall(`/files/upload/notice/${noticeId}`, formData)
            },

            // 파일 다운로드 URL 생성
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
        },

        // ============ 사용자 관리 API ============
        users: {
            // 사용자 목록 조회
            getAll: (params = {}) => apiCall('/users', {
                method: 'GET',
                query: params
            }),

            // 사용자 상세 조회
            getById: (id) => apiCall(`/users/${id}`, {
                method: 'GET'
            }),

            // 사용자 생성
            create: (data) => apiCall('/users', {
                method: 'POST',
                body: data
            }),

            // 사용자 수정
            update: (id, data) => apiCall(`/users/${id}`, {
                method: 'PUT',
                body: data
            }),

            // 사용자 삭제
            delete: (id) => apiCall(`/users/${id}`, {
                method: 'DELETE'
            }),

            // 사용자 상태 토글 (활성화/비활성화)
            toggleStatus: (id) => apiCall(`/users/${id}/toggle-status`, {
                method: 'PATCH'
            }),

            // 사용자 역할 변경
            changeRole: (id, role) => apiCall(`/users/${id}/role`, {
                method: 'PATCH',
                body: { role }
            }),

            // 비밀번호 재설정
            resetPassword: (id) => apiCall(`/users/${id}/reset-password`, {
                method: 'POST'
            }),

            // 사용자 검색
            search: (params = {}) => apiCall('/users/search', {
                method: 'GET',
                query: params
            }),

            // 사용자 통계
            getStats: () => apiCall('/users/stats', {
                method: 'GET'
            }),

            // 사용자명/이메일 중복 확인
            checkAvailability: (params = {}) => apiCall('/users/check-availability', {
                method: 'GET',
                query: params
            }),

            // 역할별 사용자 조회
            getByRole: (role, params = {}) => apiCall(`/users/role/${role}`, {
                method: 'GET',
                query: params
            }),

            // 활성/비활성 사용자 조회
            getByStatus: (status, params = {}) => apiCall(`/users/status/${status}`, {
                method: 'GET',
                query: params
            }),

            // 사용자 활동 내역 조회
            getActivity: (id, params = {}) => apiCall(`/users/${id}/activity`, {
                method: 'GET',
                query: params
            }),

            // 사용자 로그인 이력 조회
            getLoginHistory: (id, params = {}) => apiCall(`/users/${id}/login-history`, {
                method: 'GET',
                query: params
            }),

            // 일괄 작업
            bulkUpdate: (ids, data) => apiCall('/users/bulk-update', {
                method: 'PATCH',
                body: { ids, ...data }
            }),

            // 일괄 삭제
            bulkDelete: (ids) => apiCall('/users/bulk-delete', {
                method: 'DELETE',
                body: { ids }
            }),

            // 일괄 상태 변경
            bulkToggleStatus: (ids, isActive) => apiCall('/users/bulk-toggle-status', {
                method: 'PATCH',
                body: { ids, isActive }
            })
        },

        // ============ 관리자 전용 API ============
        admin: {
            // 시스템 통계
            getSystemStats: () => apiCall('/admin/stats', {
                method: 'GET'
            }),

            // 시스템 설정 조회
            getSettings: () => apiCall('/admin/settings', {
                method: 'GET'
            }),

            // 시스템 설정 업데이트
            updateSettings: (data) => apiCall('/admin/settings', {
                method: 'PUT',
                body: data
            }),

            // 시스템 로그 조회
            getLogs: (params = {}) => apiCall('/admin/logs', {
                method: 'GET',
                query: params
            }),

            // 백업 생성
            createBackup: () => apiCall('/admin/backup', {
                method: 'POST'
            }),

            // 백업 목록 조회
            getBackups: () => apiCall('/admin/backups', {
                method: 'GET'
            }),

            // 백업 복원
            restoreBackup: (backupId) => apiCall(`/admin/backups/${backupId}/restore`, {
                method: 'POST'
            }),

            // 캐시 삭제
            clearCache: () => apiCall('/admin/cache/clear', {
                method: 'DELETE'
            }),

            // 시스템 상태 확인
            getSystemHealth: () => apiCall('/admin/health', {
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