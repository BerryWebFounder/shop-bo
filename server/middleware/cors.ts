export default defineEventHandler((event) => {
    // CORS 헤더 설정
    setResponseHeaders(event, {
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
        'Access-Control-Expose-Headers': '*',
        'Access-Control-Max-Age': '7200'
    })

    // OPTIONS 요청 처리 (Preflight)
    if (getMethod(event) === 'OPTIONS') {
        event.node.res.statusCode = 204
        event.node.res.statusMessage = 'No Content'
        return 'OK'
    }
})