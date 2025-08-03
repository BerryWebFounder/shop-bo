export const useBoardsStore = defineStore('boards', () => {
    // API 서비스 가져오기
    const api = useApi()
    const toast = useGlobalToast()

    // 로딩 상태
    const loading = ref(false)
    const uploading = ref(false)

    // 데이터 상태
    const posts = ref([])
    const notices = ref([])
    const currentPost = ref(null)
    const comments = ref([])
    const files = ref([])

    // 통계 데이터
    const stats = ref({
        totalPosts: 0,
        regularPosts: 0,
        totalNotices: 0,
        activeNotices: 0,
        pinnedNotices: 0,
        expiredNotices: 0
    })

    // 페이지네이션 상태
    const pagination = ref({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true
    })

    // 필터 상태
    const filters = ref({
        type: 'all', // 'all', 'posts', 'notices'
        status: 'all', // 'all', 'active', 'inactive'
        search: '',
        author: '',
        startDate: '',
        endDate: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    })

    // Actions
    const setLoading = (state) => {
        loading.value = state
    }

    const setUploading = (state) => {
        uploading.value = state
    }

    // ============ 게시글 관련 액션 ============

    // 게시글 목록 조회
    const fetchPosts = async (params = {}) => {
        setLoading(true)
        try {
            console.log('[Store] 게시글 목록 조회 시작:', params)

            const queryParams = {
                page: params.page || pagination.value.page,
                size: params.size || pagination.value.size,
                ...params
            }

            let response
            if (filters.value.type === 'notices') {
                response = await api.notices.getAll(queryParams)
            } else if (filters.value.type === 'posts') {
                response = await api.posts.getAll(queryParams)
            } else {
                response = await api.posts.getAllWithNotices(queryParams)
            }

            console.log('[Store] API 응답:', response)

            // Spring Data Page 객체 처리
            if (response.content) {
                posts.value = response.content
                updatePagination(response)
            } else {
                // 배열 직접 반환인 경우 (List<Post>)
                posts.value = Array.isArray(response) ? response : []
                pagination.value.totalElements = posts.value.length
            }

            console.log('[Store] 처리된 게시글:', posts.value.length + '개')
            return response

        } catch (error) {
            console.error('[Store] 게시글 목록 조회 실패:', error)
            posts.value = []
            toast.handleApiError(error, '게시글 목록을 불러올 수 없습니다.')
            throw error
        } finally {
            setLoading(false)
        }
    }

    // 게시글 상세 조회
    const fetchPost = async (id, isNotice = false) => {
        setLoading(true)
        try {
            console.log('[Store] 게시글 상세 조회:', id, isNotice ? '(공지사항)' : '(일반글)')

            let response
            if (isNotice) {
                response = await api.notices.getById(id)
            } else {
                response = await api.posts.getById(id)
            }

            console.log('[Store] 상세 조회 응답:', response)

            // 백엔드 응답 구조에 맞춰 데이터 설정
            if (response.post) {
                currentPost.value = response.post
            } else if (response.notice) {
                currentPost.value = response.notice
            } else {
                // 게시글만 반환된 경우
                currentPost.value = response
            }

            // 댓글과 파일 정보 설정
            comments.value = response.comments || []
            files.value = response.files || []

            console.log('[Store] 상세 조회 완료:', currentPost.value?.title)
            return response

        } catch (error) {
            console.error('[Store] 게시글 상세 조회 실패:', error)
            currentPost.value = null
            comments.value = []
            files.value = []
            toast.handleApiError(error, '게시글을 불러올 수 없습니다.')
            throw error
        } finally {
            setLoading(false)
        }
    }

    // 게시글 생성
    const createPost = async (postData) => {
        setLoading(true)
        try {
            console.log('[Store] 게시글 생성:', postData)

            let response
            if (postData.isNotice) {
                response = await api.notices.create(postData)
                toast.handleSuccess('create', '공지사항이 생성되었습니다.')
            } else {
                response = await api.posts.create(postData)
                toast.handleSuccess('create', '게시글이 생성되었습니다.')
            }

            // 목록 새로고침
            await Promise.all([
                fetchPosts(),
                fetchStats()
            ])

            return response
        } catch (error) {
            console.error('[Store] 게시글 생성 실패:', error)
            toast.handleApiError(error, '게시글 생성에 실패했습니다.')
            throw error
        } finally {
            setLoading(false)
        }
    }

    // 게시글 수정
    const updatePost = async (id, postData, isNotice = false) => {
        setLoading(true)
        try {
            console.log('[Store] 게시글 수정:', id, postData, isNotice ? '(공지사항)' : '(일반글)')

            let response
            if (isNotice) {
                response = await api.notices.update(id, postData)
                toast.handleSuccess('update', '공지사항이 수정되었습니다.')
            } else {
                response = await api.posts.update(id, postData)
                toast.handleSuccess('update', '게시글이 수정되었습니다.')
            }

            // 현재 게시글이 수정된 게시글이면 업데이트
            if (currentPost.value && currentPost.value.id === id) {
                currentPost.value = response
            }

            // 목록에서도 업데이트
            const index = posts.value.findIndex(p => p.id === id)
            if (index !== -1) {
                posts.value[index] = response
            }

            return response
        } catch (error) {
            console.error('[Store] 게시글 수정 실패:', error)
            toast.handleApiError(error, '게시글 수정에 실패했습니다.')
            throw error
        } finally {
            setLoading(false)
        }
    }

    // 게시글 삭제
    const deletePost = async (id, isNotice = false) => {
        setLoading(true)
        try {
            console.log('[Store] 게시글 삭제:', id, isNotice ? '(공지사항)' : '(일반글)')

            if (isNotice) {
                await api.notices.delete(id)
                toast.handleSuccess('delete', '공지사항이 삭제되었습니다.')
            } else {
                await api.posts.delete(id)
                toast.handleSuccess('delete', '게시글이 삭제되었습니다.')
            }

            // 목록에서 제거
            posts.value = posts.value.filter(p => p.id !== id)

            // 현재 게시글이 삭제된 게시글이면 초기화
            if (currentPost.value && currentPost.value.id === id) {
                currentPost.value = null
                comments.value = []
                files.value = []
            }

            await fetchStats()
        } catch (error) {
            console.error('[Store] 게시글 삭제 실패:', error)
            toast.handleApiError(error, '게시글 삭제에 실패했습니다.')
            throw error
        } finally {
            setLoading(false)
        }
    }

    // 게시글 검색
    const searchPosts = async (searchParams) => {
        setLoading(true)
        try {
            console.log('[Store] 게시글 검색:', searchParams)

            const queryParams = {
                page: 0,
                size: pagination.value.size,
                ...searchParams
            }

            let response
            if (filters.value.type === 'notices') {
                response = await api.notices.search(queryParams)
            } else {
                response = await api.posts.search(queryParams)
            }

            console.log('[Store] 검색 응답:', response)

            if (response.content) {
                posts.value = response.content
                updatePagination(response)
            } else {
                posts.value = Array.isArray(response) ? response : []
            }

            return response
        } catch (error) {
            console.error('[Store] 게시글 검색 실패:', error)
            posts.value = []
            toast.handleApiError(error, '검색에 실패했습니다.')
            throw error
        } finally {
            setLoading(false)
        }
    }

    // 공지사항 상태 토글
    const toggleNoticeStatus = async (id) => {
        setLoading(true)
        try {
            console.log('[Store] 공지사항 상태 토글:', id)

            const response = await api.notices.toggleStatus(id)

            // 목록에서 업데이트
            const index = posts.value.findIndex(p => p.id === id)
            if (index !== -1) {
                posts.value[index] = response
            }

            // 현재 게시글이면 업데이트
            if (currentPost.value && currentPost.value.id === id) {
                currentPost.value = response
            }

            const statusText = response.isActive ? '활성화' : '비활성화'
            toast.handleSuccess('update', `공지사항이 ${statusText}되었습니다.`)

            return response
        } catch (error) {
            console.error('[Store] 공지사항 상태 토글 실패:', error)
            toast.handleApiError(error, '공지사항 상태 변경에 실패했습니다.')
            throw error
        } finally {
            setLoading(false)
        }
    }

    // ============ 댓글 관련 액션 ============

    // 댓글 목록 조회
    const fetchComments = async (postId) => {
        try {
            console.log('[Store] 댓글 조회:', postId)
            const response = await api.comments.getByPostId(postId)
            comments.value = response || []
            return response
        } catch (error) {
            console.error('[Store] 댓글 조회 실패:', error)
            comments.value = []
            throw error
        }
    }

    // 댓글 생성
    const createComment = async (commentData) => {
        try {
            console.log('[Store] 댓글 생성:', commentData)
            const response = await api.comments.create(commentData)

            // 댓글 목록에 추가
            comments.value.unshift(response)
            toast.handleSuccess('create', '댓글이 작성되었습니다.')

            return response
        } catch (error) {
            console.error('[Store] 댓글 생성 실패:', error)
            toast.handleApiError(error, '댓글 작성에 실패했습니다.')
            throw error
        }
    }

    // 댓글 수정
    const updateComment = async (id, content) => {
        try {
            console.log('[Store] 댓글 수정:', id, content)
            const response = await api.comments.update(id, { content })

            // 댓글 목록에서 업데이트
            const index = comments.value.findIndex(c => c.id === id)
            if (index !== -1) {
                comments.value[index] = response
            }

            toast.handleSuccess('update', '댓글이 수정되었습니다.')

            return response
        } catch (error) {
            console.error('[Store] 댓글 수정 실패:', error)
            toast.handleApiError(error, '댓글 수정에 실패했습니다.')
            throw error
        }
    }

    // 댓글 삭제
    const deleteComment = async (id) => {
        try {
            console.log('[Store] 댓글 삭제:', id)
            await api.comments.delete(id)

            // 댓글 목록에서 제거
            comments.value = comments.value.filter(c => c.id !== id)
            toast.handleSuccess('delete', '댓글이 삭제되었습니다.')

        } catch (error) {
            console.error('[Store] 댓글 삭제 실패:', error)
            toast.handleApiError(error, '댓글 삭제에 실패했습니다.')
            throw error
        }
    }

    // ============ 파일 관련 액션 ============

    // 파일 목록 조회
    const fetchFiles = async (postId, isNotice = false) => {
        try {
            console.log('[Store] 파일 조회:', postId, isNotice ? '(공지사항)' : '(일반글)')

            let response
            if (isNotice) {
                response = await api.files.getByNoticeId(postId)
            } else {
                response = await api.files.getByPostId(postId)
            }

            files.value = response || []
            console.log('[Store] 파일 조회 완료:', files.value.length + '개')
            return response
        } catch (error) {
            console.error('[Store] 파일 조회 실패:', error)
            files.value = []
            throw error
        }
    }

    // 파일 업로드
    const uploadFiles = async (postId, fileList, isNotice = false) => {
        setUploading(true)
        try {
            console.log('[Store] 파일 업로드:', postId, fileList.length + '개', isNotice ? '(공지사항)' : '(일반글)')

            let response
            if (isNotice) {
                response = await api.files.uploadToNotice(postId, fileList)
            } else {
                response = await api.files.uploadToPost(postId, fileList)
            }

            console.log('[Store] 업로드 응답:', response)

            // 파일 목록에 추가
            if (response.files) {
                files.value.push(...response.files)
            }

            toast.handleSuccess('upload', `${fileList.length}개의 파일이 업로드되었습니다.`)

            return response
        } catch (error) {
            console.error('[Store] 파일 업로드 실패:', error)
            toast.handleApiError(error, '파일 업로드에 실패했습니다.')
            throw error
        } finally {
            setUploading(false)
        }
    }

    // 파일 삭제
    const deleteFile = async (id) => {
        try {
            console.log('[Store] 파일 삭제:', id)
            await api.files.delete(id)

            // 파일 목록에서 제거
            files.value = files.value.filter(f => f.id !== id)
            toast.handleSuccess('delete', '파일이 삭제되었습니다.')

        } catch (error) {
            console.error('[Store] 파일 삭제 실패:', error)
            toast.handleApiError(error, '파일 삭제에 실패했습니다.')
            throw error
        }
    }

    // 파일 다운로드 URL 생성
    const getFileDownloadUrl = (storedName) => {
        return api.files.download(storedName)
    }

    // ============ 통계 관련 액션 ============

    // 통계 조회
    const fetchStats = async () => {
        try {
            console.log('[Store] 통계 조회')

            const [postStats, noticeStats] = await Promise.all([
                api.posts.getStats(),
                api.notices.getStats()
            ])

            console.log('[Store] 통계 응답:', { postStats, noticeStats })

            stats.value = {
                ...postStats,
                ...noticeStats,
                totalPosts: postStats.totalPosts || 0,
                regularPosts: postStats.regularPosts || 0,
                totalNotices: noticeStats.total || 0,
                activeNotices: noticeStats.active || 0,
                pinnedNotices: noticeStats.pinned || 0,
                expiredNotices: noticeStats.expired || 0
            }

            return stats.value
        } catch (error) {
            console.error('[Store] 통계 조회 실패:', error)
            throw error
        }
    }

    // ============ 유틸리티 함수 ============

    // 페이지네이션 업데이트
    const updatePagination = (response) => {
        if (response) {
            pagination.value = {
                page: response.number || 0,
                size: response.size || 10,
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 0,
                first: response.first || true,
                last: response.last || true
            }
            console.log('[Store] 페이지네이션 업데이트:', pagination.value)
        }
    }

    // 필터 업데이트
    const updateFilters = (newFilters) => {
        filters.value = { ...filters.value, ...newFilters }
        console.log('[Store] 필터 업데이트:', filters.value)
    }

    // 필터 초기화
    const resetFilters = () => {
        filters.value = {
            type: 'all',
            status: 'all',
            search: '',
            author: '',
            startDate: '',
            endDate: '',
            sortBy: 'createdAt',
            sortOrder: 'desc'
        }
        console.log('[Store] 필터 초기화')
    }

    // 페이지 변경
    const changePage = (page) => {
        pagination.value.page = page
        return fetchPosts({ page })
    }

    // 페이지 크기 변경
    const changePageSize = (size) => {
        pagination.value.size = size
        pagination.value.page = 0
        return fetchPosts({ page: 0, size })
    }

    // ============ 계산된 속성 ============

    // 활성 게시글 수
    const activePostsCount = computed(() => {
        return posts.value.filter(post => !post.isNotice || post.isActive).length
    })

    // 공지사항 수
    const noticesCount = computed(() => {
        return posts.value.filter(post => post.isNotice).length
    })

    // 일반 게시글 수
    const regularPostsCount = computed(() => {
        return posts.value.filter(post => !post.isNotice).length
    })

    // 중요 공지사항 수
    const pinnedNoticesCount = computed(() => {
        return posts.value.filter(post => post.isNotice && post.isPinned && post.isActive).length
    })

    // 처리 대기 게시글 수 (비활성 공지사항)
    const pendingPostsCount = computed(() => {
        return posts.value.filter(post => post.isNotice && !post.isActive).length
    })

    // 파일이 있는 게시글 수
    const postsWithFilesCount = computed(() => {
        return posts.value.filter(post => post.fileCount > 0).length
    })

    // 댓글이 있는 게시글 수
    const postsWithCommentsCount = computed(() => {
        return posts.value.filter(post => post.commentCount > 0).length
    })

    // 현재 게시글의 댓글 수
    const currentPostCommentsCount = computed(() => {
        return comments.value.length
    })

    // 현재 게시글의 파일 수
    const currentPostFilesCount = computed(() => {
        return files.value.length
    })

    // ============ 초기화 ============

    // 스토어 초기화
    const initialize = async () => {
        try {
            console.log('[Store] 스토어 초기화 시작')
            await Promise.all([
                fetchPosts(),
                fetchStats()
            ])
            console.log('[Store] 스토어 초기화 완료')
        } catch (error) {
            console.error('[Store] 스토어 초기화 실패:', error)
        }
    }

    return {
        // State
        loading: readonly(loading),
        uploading: readonly(uploading),
        posts: readonly(posts),
        notices: readonly(notices),
        currentPost: readonly(currentPost),
        comments: readonly(comments),
        files: readonly(files),
        stats: readonly(stats),
        pagination: readonly(pagination),
        filters: readonly(filters),

        // Getters
        activePostsCount,
        noticesCount,
        regularPostsCount,
        pinnedNoticesCount,
        pendingPostsCount,
        postsWithFilesCount,
        postsWithCommentsCount,
        currentPostCommentsCount,
        currentPostFilesCount,

        // Actions
        setLoading,
        setUploading,

        // 게시글
        fetchPosts,
        fetchPost,
        createPost,
        updatePost,
        deletePost,
        searchPosts,
        toggleNoticeStatus,

        // 댓글
        fetchComments,
        createComment,
        updateComment,
        deleteComment,

        // 파일
        fetchFiles,
        uploadFiles,
        deleteFile,
        getFileDownloadUrl,

        // 통계
        fetchStats,

        // 유틸리티
        updateFilters,
        resetFilters,
        changePage,
        changePageSize,
        initialize
    }
})