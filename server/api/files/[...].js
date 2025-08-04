export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const method = getMethod(event)
    const segments = getRouterParams(event)
    const path = segments._ ? Array.isArray(segments._) ? segments._.join('/') : segments._ : ''
    const targetUrl = path ? `${config.public.apiBaseUrl}/files/${path}` : `${config.public.apiBaseUrl}/files`

    console.log(`[Files Server API] ${method} ${event.node.req.url} -> ${targetUrl}`)

    try {
        const headers = { 'User-Agent': 'Nuxt-Proxy/1.0' }
        const authHeader = getHeader(event, 'authorization')
        if (authHeader) headers.Authorization = authHeader

        const fetchOptions = { method, headers }

        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            const body = await readBody(event)
            fetchOptions.body = body

            const contentType = getHeader(event, 'content-type')
            if (contentType && !contentType.includes('multipart/form-data')) {
                headers['Content-Type'] = contentType
            }
        }

        const query = getQuery(event)
        if (Object.keys(query).length > 0) {
            fetchOptions.query = query
        }

        return await $fetch(targetUrl, fetchOptions)

    } catch (error) {
        console.error(`[Files Server API] Error:`, error)
        if (error.response) {
            setResponseStatus(event, error.response.status)
            return error.response._data || { success: false, message: error.response.statusText }
        }
        setResponseStatus(event, 500)
        return { success: false, message: `Backend connection failed: ${error.message}` }
    }
})