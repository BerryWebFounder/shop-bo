// 사용자 관리 관련 유틸리티 함수들

/**
 * 사용자 역할 관련 유틸리티
 */
export const UserRoles = {
    ADMIN: 'ADMIN',
    SYSOP: 'SYSOP',
    USER: 'USER'
}

/**
 * 사용자 상태 관련 상수
 */
export const UserStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    PENDING: 'pending'
}

/**
 * 역할 표시명 반환
 * @param {string} role - 사용자 역할
 * @returns {string} 표시명
 */
export const getRoleDisplayName = (role) => {
    const roleNames = {
        [UserRoles.ADMIN]: '관리자',
        [UserRoles.SYSOP]: '운영자',
        [UserRoles.USER]: '일반 사용자'
    }
    return roleNames[role] || '알 수 없음'
}

/**
 * 역할 설명 반환
 * @param {string} role - 사용자 역할
 * @returns {string} 역할 설명
 */
export const getRoleDescription = (role) => {
    const descriptions = {
        [UserRoles.ADMIN]: '시스템의 모든 기능에 접근할 수 있습니다',
        [UserRoles.SYSOP]: '사용자 관리를 제외한 대부분의 기능에 접근할 수 있습니다',
        [UserRoles.USER]: '기본적인 기능만 사용할 수 있습니다'
    }
    return descriptions[role] || ''
}

/**
 * 역할 배지 색상 반환
 * @param {string} role - 사용자 역할
 * @returns {string} Tailwind 색상 클래스
 */
export const getRoleVariant = (role) => {
    const variants = {
        [UserRoles.ADMIN]: 'danger',
        [UserRoles.SYSOP]: 'warning',
        [UserRoles.USER]: 'info'
    }
    return variants[role] || 'gray'
}

/**
 * 역할 우선순위 반환 (높을수록 높은 권한)
 * @param {string} role - 사용자 역할
 * @returns {number} 우선순위
 */
export const getRolePriority = (role) => {
    const priorities = {
        [UserRoles.ADMIN]: 3,
        [UserRoles.SYSOP]: 2,
        [UserRoles.USER]: 1
    }
    return priorities[role] || 0
}

/**
 * 권한 확인
 * @param {string} userRole - 사용자 역할
 * @param {string} requiredRole - 필요한 역할
 * @returns {boolean} 권한 여부
 */
export const hasPermission = (userRole, requiredRole) => {
    return getRolePriority(userRole) >= getRolePriority(requiredRole)
}

/**
 * 사용자 이니셜 생성
 * @param {Object} user - 사용자 객체
 * @returns {string} 이니셜
 */
export const getUserInitials = (user) => {
    if (!user || !user.fullName) return '?'

    return user.fullName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2)
}

/**
 * 사용자 상태 표시명 반환
 * @param {boolean} isActive - 활성 상태
 * @returns {string} 상태 표시명
 */
export const getStatusDisplayName = (isActive) => {
    return isActive ? '활성' : '비활성'
}

/**
 * 사용자 상태 배지 색상 반환
 * @param {boolean} isActive - 활성 상태
 * @returns {string} 배지 색상
 */
export const getStatusVariant = (isActive) => {
    return isActive ? 'success' : 'danger'
}

/**
 * 이메일 검증
 * @param {string} email - 이메일 주소
 * @returns {boolean} 유효성 여부
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * 사용자명 검증
 * @param {string} username - 사용자명
 * @returns {boolean} 유효성 여부
 */
export const isValidUsername = (username) => {
    // 3-50자, 영문자, 숫자, 언더스코어, 하이픈만 허용
    const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/
    return usernameRegex.test(username)
}

/**
 * 비밀번호 강도 검사
 * @param {string} password - 비밀번호
 * @returns {Object} 강도 정보
 */
export const checkPasswordStrength = (password) => {
    const result = {
        score: 0,
        level: 'weak',
        feedback: [],
        isValid: false
    }

    if (!password) return result

    // 길이 확인
    if (password.length >= 8) {
        result.score += 1
    } else {
        result.feedback.push('최소 8자 이상이어야 합니다')
    }

    // 대문자 확인
    if (/[A-Z]/.test(password)) {
        result.score += 1
    } else {
        result.feedback.push('대문자를 포함해야 합니다')
    }

    // 소문자 확인
    if (/[a-z]/.test(password)) {
        result.score += 1
    } else {
        result.feedback.push('소문자를 포함해야 합니다')
    }

    // 숫자 확인
    if (/\d/.test(password)) {
        result.score += 1
    } else {
        result.feedback.push('숫자를 포함해야 합니다')
    }

    // 특수문자 확인
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        result.score += 1
    } else {
        result.feedback.push('특수문자를 포함해야 합니다')
    }

    // 레벨 결정
    if (result.score >= 4) {
        result.level = 'strong'
        result.isValid = true
    } else if (result.score >= 3) {
        result.level = 'medium'
        result.isValid = password.length >= 8
    } else {
        result.level = 'weak'
        result.isValid = false
    }

    return result
}

/**
 * 전화번호 포맷팅
 * @param {string} phoneNumber - 전화번호
 * @returns {string} 포맷된 전화번호
 */
export const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return ''

    // 숫자만 추출
    const cleaned = phoneNumber.replace(/\D/g, '')

    // 한국 전화번호 포맷팅
    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
    } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
    }

    return phoneNumber
}

/**
 * 날짜 포맷팅
 * @param {string|Date} date - 날짜
 * @param {string} format - 포맷 타입
 * @returns {string} 포맷된 날짜
 */
export const formatDate = (date, format = 'datetime') => {
    if (!date) return '-'

    const dateObj = new Date(date)

    switch (format) {
        case 'date':
            return dateObj.toLocaleDateString('ko-KR')
        case 'time':
            return dateObj.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
            })
        case 'datetime':
            return dateObj.toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        case 'relative':
            return getRelativeTime(dateObj)
        default:
            return dateObj.toLocaleString('ko-KR')
    }
}

/**
 * 상대적 시간 반환
 * @param {Date} date - 날짜
 * @returns {string} 상대적 시간
 */
export const getRelativeTime = (date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) {
        return '방금 전'
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return `${minutes}분 전`
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `${hours}시간 전`
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400)
        return `${days}일 전`
    } else {
        return formatDate(date, 'date')
    }
}

/**
 * 숫자 포맷팅
 * @param {number} num - 숫자
 * @returns {string} 포맷된 숫자
 */
export const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num || 0)
}

/**
 * 사용자 검색 필터링
 * @param {Array} users - 사용자 목록
 * @param {string} query - 검색어
 * @returns {Array} 필터된 사용자 목록
 */
export const filterUsers = (users, query) => {
    if (!query) return users

    const searchTerm = query.toLowerCase()

    return users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.username.toLowerCase().includes(searchTerm) ||
        (user.department && user.department.toLowerCase().includes(searchTerm)) ||
        (user.position && user.position.toLowerCase().includes(searchTerm))
    )
}

/**
 * 사용자 정렬
 * @param {Array} users - 사용자 목록
 * @param {string} sortBy - 정렬 기준
 * @param {string} sortOrder - 정렬 순서 (asc, desc)
 * @returns {Array} 정렬된 사용자 목록
 */
export const sortUsers = (users, sortBy, sortOrder = 'asc') => {
    return [...users].sort((a, b) => {
        let aValue = a[sortBy]
        let bValue = b[sortBy]

        // 날짜 필드 처리
        if (['createdAt', 'updatedAt', 'lastLoginAt'].includes(sortBy)) {
            aValue = new Date(aValue)
            bValue = new Date(bValue)
        }

        // 문자열 필드 처리
        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase()
            bValue = bValue.toLowerCase()
        }

        let comparison = 0
        if (aValue > bValue) {
            comparison = 1
        } else if (aValue < bValue) {
            comparison = -1
        }

        return sortOrder === 'desc' ? comparison * -1 : comparison
    })
}

/**
 * 권한 레벨별 사용자 필터링
 * @param {Array} users - 사용자 목록
 * @param {string} minRole - 최소 권한 레벨
 * @returns {Array} 필터된 사용자 목록
 */
export const filterUsersByRole = (users, minRole) => {
    const minPriority = getRolePriority(minRole)
    return users.filter(user => getRolePriority(user.role) >= minPriority)
}

/**
 * 사용자 데이터 검증
 * @param {Object} userData - 사용자 데이터
 * @param {boolean} isUpdate - 업데이트 모드 여부
 * @returns {Object} 검증 결과
 */
export const validateUserData = (userData, isUpdate = false) => {
    const errors = {}

    // 필수 필드 검증
    if (!userData.fullName?.trim()) {
        errors.fullName = '이름은 필수입니다'
    }

    if (!userData.email?.trim()) {
        errors.email = '이메일은 필수입니다'
    } else if (!isValidEmail(userData.email)) {
        errors.email = '올바른 이메일 형식이 아닙니다'
    }

    if (!isUpdate && !userData.username?.trim()) {
        errors.username = '사용자명은 필수입니다'
    } else if (userData.username && !isValidUsername(userData.username)) {
        errors.username = '사용자명은 3-50자 영문, 숫자, _, - 만 허용됩니다'
    }

    // 비밀번호 검증 (새 사용자만)
    if (!isUpdate) {
        if (!userData.password) {
            errors.password = '비밀번호는 필수입니다'
        } else {
            const passwordCheck = checkPasswordStrength(userData.password)
            if (!passwordCheck.isValid) {
                errors.password = passwordCheck.feedback.join(', ')
            }
        }

        if (userData.password !== userData.confirmPassword) {
            errors.confirmPassword = '비밀번호가 일치하지 않습니다'
        }
    }

    // 역할 검증
    if (!Object.values(UserRoles).includes(userData.role)) {
        errors.role = '올바른 역할을 선택해주세요'
    }

    // 전화번호 검증 (선택사항)
    if (userData.phoneNumber && !/^[\d\s\-\+\(\)]+$/.test(userData.phoneNumber)) {
        errors.phoneNumber = '올바른 전화번호 형식이 아닙니다'
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}

/**
 * 사용자 CSV 내보내기 데이터 생성
 * @param {Array} users - 사용자 목록
 * @returns {string} CSV 데이터
 */
export const exportUsersToCSV = (users) => {
    const headers = [
        'ID', '이름', '사용자명', '이메일', '역할', '상태',
        '부서', '직책', '가입일', '마지막 로그인'
    ]

    const csvContent = users.map(user => [
        user.id,
        user.fullName,
        user.username,
        user.email,
        getRoleDisplayName(user.role),
        getStatusDisplayName(user.isActive),
        user.department || '',
        user.position || '',
        formatDate(user.createdAt, 'date'),
        user.lastLoginAt ? formatDate(user.lastLoginAt, 'date') : ''
    ])

    const allRows = [headers, ...csvContent]

    return allRows
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')
}

/**
 * 사용자 활동 요약 생성
 * @param {Object} user - 사용자 객체
 * @returns {Object} 활동 요약
 */
export const getUserActivitySummary = (user) => {
    const joinedDays = Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))

    return {
        joinedDays,
        loginCount: user.loginCount || 0,
        postCount: user.postCount || 0,
        commentCount: user.commentCount || 0,
        lastActivity: user.lastLoginAt ? getRelativeTime(new Date(user.lastLoginAt)) : '없음',
        avgLoginPerDay: joinedDays > 0 ? ((user.loginCount || 0) / joinedDays).toFixed(2) : '0'
    }
}