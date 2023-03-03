const { expressjwt: jwt } = require("express-jwt");
require('dotenv/config');


function authJwt() {

    const code = process.env.secret;
    const api = process.env.API_URL

    const authenticate = jwt({
        secret: code,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            { url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/orders(.*)/, methods: ['GET', 'OPTIONS', 'POST'] },
            `${api}/users/login`,
            `${api}/users/register`,
        ]
    })

    return authenticate
}

async function isRevoked(req, token) {
    if (!token.payload.isAdmin) {
        return true;
    }
}

module.exports = authJwt()