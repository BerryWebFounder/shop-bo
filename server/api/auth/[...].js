export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const method = getMethod(event)

    // URL에서 auth 이후의 경로 추출
    const segments = getRouterParams(event)
    const path = segments._ ? Array.isArray(segments._) ? segments._.join('/') : segments._ : ''

    // 최종 백엔드 URL 구성
    const targetUrl = path
        ? `${config.public.usersApiBaseUrl}/auth/${path}`
        : `${config.public.usersApiBaseUrl}/auth`

    console.log(`[Auth Server API] ${method} ${event.node.req.url} -> ${targetUrl}`)

    try {
        // 기본 헤더 설정
        const headers = {
            'User-Agent': 'Nuxt-Proxy/1.0'
        }

        // Authorization 헤더가 있으면 전달
        const authHeader = getHeader(event, 'authorization')
        if (authHeader) {
            headers.Authorization = authHeader
        }

        // Content-Type 헤더 전달
        const contentType = getHeader(event, 'content-type')
        if (contentType) {
            headers['Content-Type'] = contentType
        }

        // 요청 옵션 준비
        const fetchOptions = {
            method: method,
            headers: headers
        }

        // POST, PUT, PATCH 요청의 경우 body 추가
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            const body = await readBody(event)
            fetchOptions.body = body

            console.log(`[Auth Server API] Request body:`, body)

            // JSON 요청인 경우 Content-Type 명시적 설정
            if (!contentType && typeof body === 'object') {
                headers['Content-Type'] = 'application/json'
            }
        }

        // 쿼리 파라미터 전달
        const query = getQuery(event)
        if (Object.keys(query).length > 0) {
            fetchOptions.query = query
            console.log(`[Auth Server API] Query params:`, query)
        }

        console.log(`[Auth Server API] Fetch options:`, {
            url: targetUrl,
            method: fetchOptions.method,
            headers: fetchOptions.headers,
            hasBody: !!fetchOptions.body
        })

        // 실제 백엔드에 요청 전달
        const response = await $fetch(targetUrl, fetchOptions)

        console.log(`[Auth Server API] Response received:`, {
            success: response?.success,
            hasData: !!response?.data,
            message: response?.message
        })

        return response

    } catch (error) {
        console.error(`[Auth Server API] Error for ${method} ${targetUrl}:`, {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?._data
        })

        // 에러 응답 처리
        if (error.response) {
            setResponseStatus(event, error.response.status)
            return error.response._data || {
                success: false,
                message: error.response.statusText || 'Server Error'
            }
        }

        // 네트워크 에러 등
        setResponseStatus(event, 500)
        return {
            success: false,
            message: `Backend server connection failed: ${error.message}`,
            details: `Target URL: ${targetUrl}`
        }
    }
})