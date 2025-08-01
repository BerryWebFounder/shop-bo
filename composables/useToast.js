export const useToast = () => {
    // 토스트 목록 상태
    const toasts = ref([])

    // 토스트 ID 생성용 카운터
    let toastId = 0

    // 토스트 추가
    const addToast = (message, type = 'info', duration = 5000) => {
        const id = ++toastId
        const toast = {
            id,
            message,
            type, // 'success', 'error', 'warning', 'info'
            duration,
            createdAt: Date.now()
        }

        toasts.value.push(toast)

        // 자동 제거
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }

        return id
    }

    // 토스트 제거
    const removeToast = (id) => {
        const index = toasts.value.findIndex(toast => toast.id === id)
        if (index > -1) {
            toasts.value.splice(index, 1)
        }
    }

    // 모든 토스트 제거
    const clearToasts = () => {
        toasts.value = []
    }

    // 편의 메서드들
    const success = (message, duration = 5000) => {
        return addToast(message, 'success', duration)
    }

    const error = (message, duration = 7000) => {
        return addToast(message, 'error', duration)
    }

    const warning = (message, duration = 6000) => {
        return addToast(message, 'warning', duration)
    }

    const info = (message, duration = 5000) => {
        return addToast(message, 'info', duration)
    }

    // API 에러 처리 헬퍼
    const handleApiError = (error, customMessage = null) => {
        let message = customMessage || '오류가 발생했습니다.'

        if (error?.data?.message) {
            message = error.data.message
        } else if (error?.message) {
            message = error.message
        } else if (error?.status) {
            switch (error.status) {
                case 400:
                    message = '잘못된 요청입니다.'
                    break
                case 401:
                    message = '인증이 필요합니다.'
                    break
                case 403:
                    message = '접근 권한이 없습니다.'
                    break
                case 404:
                    message = '요청한 리소스를 찾을 수 없습니다.'
                    break
                case 500:
                    message = '서버 내부 오류가 발생했습니다.'
                    break
                default:
                    message = `오류가 발생했습니다. (${error.status})`
            }
        }

        return error(message)
    }

    // 성공 액션 처리 헬퍼
    const handleSuccess = (action, customMessage = null) => {
        const messages = {
            create: '생성되었습니다.',
            update: '수정되었습니다.',
            delete: '삭제되었습니다.',
            save: '저장되었습니다.',
            upload: '업로드되었습니다.',
            download: '다운로드가 시작됩니다.',
            send: '전송되었습니다.',
            copy: '복사되었습니다.',
            import: '가져오기가 완료되었습니다.',
            export: '내보내기가 완료되었습니다.'
        }

        const message = customMessage || messages[action] || '작업이 완료되었습니다.'
        return success(message)
    }

    return {
        // 상태
        toasts: readonly(toasts),

        // 메서드
        addToast,
        removeToast,
        clearToasts,
        success,
        error,
        warning,
        info,
        handleApiError,
        handleSuccess
    }
}

// 글로벌 토스트 상태 (모든 컴포넌트에서 공유)
const globalToasts = ref([])
let globalToastId = 0

export const useGlobalToast = () => {
    const addToast = (message, type = 'info', duration = 5000) => {
        const id = ++globalToastId
        const toast = {
            id,
            message,
            type,
            duration,
            createdAt: Date.now()
        }

        globalToasts.value.push(toast)

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }

        return id
    }

    const removeToast = (id) => {
        const index = globalToasts.value.findIndex(toast => toast.id === id)
        if (index > -1) {
            globalToasts.value.splice(index, 1)
        }
    }

    const clearToasts = () => {
        globalToasts.value = []
    }

    const success = (message, duration = 5000) => {
        return addToast(message, 'success', duration)
    }

    const error = (message, duration = 7000) => {
        return addToast(message, 'error', duration)
    }

    const warning = (message, duration = 6000) => {
        return addToast(message, 'warning', duration)
    }

    const info = (message, duration = 5000) => {
        return addToast(message, 'info', duration)
    }

    const handleApiError = (error, customMessage = null) => {
        let message = customMessage || '오류가 발생했습니다.'

        if (error?.data?.message) {
            message = error.data.message
        } else if (error?.message) {
            message = error.message
        } else if (error?.status) {
            switch (error.status) {
                case 400:
                    message = '잘못된 요청입니다.'
                    break
                case 401:
                    message = '인증이 필요합니다.'
                    break
                case 403:
                    message = '접근 권한이 없습니다.'
                    break
                case 404:
                    message = '요청한 리소스를 찾을 수 없습니다.'
                    break
                case 500:
                    message = '서버 내부 오류가 발생했습니다.'
                    break
                default:
                    message = `오류가 발생했습니다. (${error.status})`
            }
        }

        return error(message)
    }

    const handleSuccess = (action, customMessage = null) => {
        const messages = {
            create: '생성되었습니다.',
            update: '수정되었습니다.',
            delete: '삭제되었습니다.',
            save: '저장되었습니다.',
            upload: '업로드되었습니다.',
            download: '다운로드가 시작됩니다.',
            send: '전송되었습니다.',
            copy: '복사되었습니다.',
            import: '가져오기가 완료되었습니다.',
            export: '내보내기가 완료되었습니다.'
        }

        const message = customMessage || messages[action] || '작업이 완료되었습니다.'
        return success(message)
    }

    return {
        toasts: readonly(globalToasts),
        addToast,
        removeToast,
        clearToasts,
        success,
        error,
        warning,
        info,
        handleApiError,
        handleSuccess
    }
}